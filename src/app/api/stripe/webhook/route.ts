// Stripe webhook receiver — the legitimate route-handler exception per D-003
// (route handlers only for external callbacks).
//
// Idempotent: every action is keyed on workspace_id, so a re-delivered event
// updates state to the same value. Per the architecture note, a daily
// reconciliation job in v0.2 will cross-check Stripe state vs workspace tier.
import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe, PRICE_IDS, type PlanId } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { grantMonthlyQuota, grantTopup } from "@/lib/credits";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Webhook error: ${msg}`, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const workspaceId = s.metadata?.workspace_id;

      // ── Top-up (one-time payment) ──────────────────────────────
      if (workspaceId && s.metadata?.type === "topup") {
        const tokens = parseInt(s.metadata.tokens ?? "0", 10);
        if (tokens > 0) {
          await grantTopup(workspaceId, tokens, s.id);
        }
        break;
      }

      // ── Subscription checkout ──────────────────────────────────
      const plan = s.metadata?.plan as PlanId | undefined;
      if (workspaceId && plan && PRICE_IDS[plan]) {
        // Idempotency: fetch current state first; skip quota grant if already paid.
        const { data: ws } = await admin
          .from("workspaces")
          .select("setup_fee_paid")
          .eq("id", workspaceId)
          .maybeSingle();
        const alreadyPaid = ws?.setup_fee_paid === true;

        await admin.from("workspaces").update({
          tier: plan,
          setup_fee_paid: true,
          stripe_customer_id: typeof s.customer === "string" ? s.customer : null,
          stripe_subscription_id: typeof s.subscription === "string" ? s.subscription : null,
          monthly_token_quota: PRICE_IDS[plan].tokens
        }).eq("id", workspaceId);

        if (!alreadyPaid) {
          await grantMonthlyQuota(workspaceId, plan, s.id);
        }
      }
      break;
    }
    case "invoice.paid": {
      const inv = event.data.object as Stripe.Invoice;
      const subId = typeof inv.subscription === "string" ? inv.subscription : null;
      if (subId) {
        const { data: ws } = await admin
          .from("workspaces")
          .select("id, tier")
          .eq("stripe_subscription_id", subId)
          .maybeSingle();
        // Pass invoice ID so grantMonthlyQuota skips duplicate deliveries.
        if (ws) await grantMonthlyQuota(ws.id, ws.tier, inv.id);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await admin.from("workspaces").update({ tier: "trial" }).eq("stripe_subscription_id", sub.id);
      break;
    }
    default:
      // Ignore other events.
      break;
  }

  return NextResponse.json({ received: true });
}
