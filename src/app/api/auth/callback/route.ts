// Auth callback — handles email confirmation and password reset links.
// Exchanges the auth code for a session, then routes the user appropriately.
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { acceptPendingInvites } from "@/server/actions/team";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type"); // "recovery" for password reset
  const rawNext = url.searchParams.get("next") ?? "/command";
  const next = rawNext.startsWith("/") ? rawNext : "/command";

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${url.origin}/login?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  // Password reset flow — send directly to the reset page.
  if (type === "recovery") {
    return NextResponse.redirect(`${url.origin}/reset-password`);
  }

  // Email confirmation / sign-in flow — route to onboarding or dashboard.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    // Activate any pending invites for this email address
    if (user.email) await acceptPendingInvites(user.email);

    const admin = createSupabaseAdminClient();

    // Check if the user owns a workspace
    const { data: ws } = await supabase
      .from("workspaces")
      .select("id, onboarded")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle();

    if (ws) {
      // Owner path: onboard if not done yet, else go to destination
      if (!ws.onboarded) {
        return NextResponse.redirect(`${url.origin}/onboarding`);
      }
    } else {
      // No owned workspace — check if they joined via invite
      if (user.email) {
        const { data: memberships } = await admin
          .from("workspace_members")
          .select("id, status")
          .eq("invitee_email", user.email.toLowerCase())
          .in("status", ["active", "awaiting_approval"]);

        const activeCount = (memberships ?? []).filter(
          (m) => m.status === "active",
        ).length;
        const pendingApproval = (memberships ?? []).some(
          (m) => m.status === "awaiting_approval",
        );

        if (activeCount === 0 && pendingApproval) {
          // Invite accepted but admin hasn't approved yet
          return NextResponse.redirect(`${url.origin}/pending-approval`);
        }

        if (activeCount === 0) {
          // Brand-new user with no workspace and no membership
          return NextResponse.redirect(`${url.origin}/onboarding`);
        }
        // Has at least one active membership — go to dashboard (not /command which
        // requires an owned workspace and could loop for members without one)
        return NextResponse.redirect(`${url.origin}/dashboard`);
      } else {
        return NextResponse.redirect(`${url.origin}/onboarding`);
      }
    }
  }

  return NextResponse.redirect(`${url.origin}${next}`);
}
