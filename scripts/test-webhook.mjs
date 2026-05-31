/**
 * Local Stripe webhook test helper.
 *
 * Usage (after adding real Stripe keys to .env.local):
 *
 *   # Terminal 1 — run dev server
 *   pnpm dev
 *
 *   # Terminal 2 — forward Stripe events to local server
 *   stripe listen --forward-to localhost:3001/api/stripe/webhook
 *
 *   # Terminal 3 — trigger a specific test event
 *   node scripts/test-webhook.mjs checkout_completed <workspace_id> starter
 *   node scripts/test-webhook.mjs invoice_paid       <workspace_id>
 *   node scripts/test-webhook.mjs topup              <workspace_id>
 *   node scripts/test-webhook.mjs sub_deleted        <stripe_sub_id>
 *
 * Prerequisites:
 *   - Stripe CLI installed: https://stripe.com/docs/stripe-cli
 *   - Real STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env.local
 */

import { readFileSync } from "fs";
import { execSync } from "child_process";

const args = process.argv.slice(2);
const [command, ...params] = args;

if (!command) {
  console.log(`
Available commands:
  checkout_completed <workspace_id> <plan>   Simulate a subscription checkout (e.g. plan=starter)
  invoice_paid       <workspace_id>           Simulate a monthly renewal
  topup              <workspace_id>           Simulate a top-up purchase
  sub_deleted        <stripe_sub_id>          Simulate a subscription cancellation
`);
  process.exit(0);
}

// Load workspace ID from DB for convenience
const workspaceId = params[0];
if (!workspaceId) {
  console.error("Error: workspace_id is required as the first argument.");
  process.exit(1);
}

function stripe(cmd) {
  try {
    const result = execSync(`stripe ${cmd}`, { encoding: "utf8" });
    console.log(result);
  } catch (err) {
    console.error("Stripe CLI error:", err.message);
    process.exit(1);
  }
}

switch (command) {
  case "checkout_completed": {
    const plan = params[1] ?? "starter";
    console.log(`Triggering checkout.session.completed for workspace=${workspaceId}, plan=${plan}`);
    stripe(
      `trigger checkout.session.completed ` +
      `--override checkout_sessions:metadata.workspace_id=${workspaceId} ` +
      `--override checkout_sessions:metadata.plan=${plan} ` +
      `--override checkout_sessions:mode=subscription`
    );
    break;
  }
  case "invoice_paid": {
    console.log(`Triggering invoice.paid for workspace=${workspaceId}`);
    stripe(`trigger invoice.paid`);
    console.log(
      "\nNote: invoice.paid uses stripe_subscription_id to find the workspace.\n" +
      "Make sure the workspace has a stripe_subscription_id set in the DB first."
    );
    break;
  }
  case "topup": {
    console.log(`Triggering top-up checkout for workspace=${workspaceId}`);
    stripe(
      `trigger checkout.session.completed ` +
      `--override checkout_sessions:metadata.workspace_id=${workspaceId} ` +
      `--override checkout_sessions:metadata.type=topup ` +
      `--override checkout_sessions:metadata.tokens=200000 ` +
      `--override checkout_sessions:mode=payment`
    );
    break;
  }
  case "sub_deleted": {
    const subId = workspaceId; // first param is sub ID in this case
    console.log(`Triggering customer.subscription.deleted for sub=${subId}`);
    stripe(
      `trigger customer.subscription.deleted ` +
      `--override subscriptions:id=${subId}`
    );
    break;
  }
  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
