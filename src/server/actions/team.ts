"use server";

import { z } from "zod";
import { requireUser, requireWorkspaceOwner } from "@/lib/auth/require";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type MemberRole = "viewer" | "editor" | "manager";
export type InviteStatus =
  | "pending"
  | "awaiting_approval"
  | "active"
  | "revoked";

export type WorkspaceMember = {
  id: string;
  invitee_email: string;
  role: MemberRole;
  status: InviteStatus;
  invite_token: string;
  created_at: string;
  accepted_at: string | null;
};

const InviteSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["viewer", "editor", "manager"]),
});

// ── Invite a team member ────────────────────────────────────────────────────

export async function inviteMember(
  workspaceId: string,
  input: unknown,
): Promise<
  { ok: true; member: WorkspaceMember } | { ok: false; error: string }
> {
  const { user, workspace } = await requireWorkspaceOwner();

  // Ownership check — ensure workspaceId belongs to this user
  if (workspace.id !== workspaceId) {
    const admin = createSupabaseAdminClient();
    const { data: ws } = await admin
      .from("workspaces")
      .select("id")
      .eq("id", workspaceId)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (!ws) return { ok: false, error: "Workspace not found" };
  }

  const parsed = InviteSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
    };

  const { email, role } = parsed.data;

  // Cannot invite yourself
  if (email.toLowerCase() === user.email?.toLowerCase()) {
    return {
      ok: false,
      error: "You cannot invite yourself — you already own this workspace.",
    };
  }

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("workspace_members")
    .upsert(
      {
        workspace_id: workspaceId,
        invitee_email: email.toLowerCase(),
        role,
        status: "pending",
        invited_by: user.id,
      },
      { onConflict: "workspace_id,invitee_email", ignoreDuplicates: false },
    )
    .select(
      "id, invitee_email, role, status, invite_token, created_at, accepted_at",
    )
    .single();

  if (error || !data)
    return { ok: false, error: "Could not send invite. Try again." };
  return { ok: true, member: data as WorkspaceMember };
}

// ── List members for a workspace ────────────────────────────────────────────

export async function listMembers(
  workspaceId: string,
): Promise<WorkspaceMember[]> {
  const { user } = await requireWorkspaceOwner();
  const admin = createSupabaseAdminClient();

  // Verify ownership
  const { data: ws } = await admin
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!ws) return [];

  const { data } = await admin
    .from("workspace_members")
    .select(
      "id, invitee_email, role, status, invite_token, created_at, accepted_at",
    )
    .eq("workspace_id", workspaceId)
    .neq("status", "revoked")
    .order("created_at", { ascending: true });

  return (data ?? []) as WorkspaceMember[];
}

// ── Revoke / remove a member ─────────────────────────────────────────────────

export async function removeMember(
  workspaceId: string,
  memberId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { user } = await requireWorkspaceOwner();
  const admin = createSupabaseAdminClient();

  // Verify ownership
  const { data: ws } = await admin
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!ws) return { ok: false, error: "Unauthorized" };

  const { error } = await admin
    .from("workspace_members")
    .update({ status: "revoked" })
    .eq("id", memberId)
    .eq("workspace_id", workspaceId);

  if (error) return { ok: false, error: "Could not remove member." };
  return { ok: true };
}

// ── Update role ───────────────────────────────────────────────────────────────

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  role: MemberRole,
): Promise<{ ok: boolean; error?: string }> {
  const { user } = await requireWorkspaceOwner();
  const admin = createSupabaseAdminClient();

  const { data: ws } = await admin
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!ws) return { ok: false, error: "Unauthorized" };

  const { error } = await admin
    .from("workspace_members")
    .update({ role })
    .eq("id", memberId)
    .eq("workspace_id", workspaceId);

  if (error) return { ok: false, error: "Could not update role." };
  return { ok: true };
}

// ── Check where to route after sign-in ───────────────────────────────────────

/** Returns the correct post-login destination for the signed-in user. */
export async function getPostLoginRoute(): Promise<
  "/dashboard" | "/pending-approval" | "/onboarding"
> {
  const admin = createSupabaseAdminClient();

  // Try to get the authenticated user from the current session
  const user = await requireUser().catch(() => null);
  if (!user?.email) return "/onboarding";

  // Workspace owners always go to dashboard
  const { data: ownedWs } = await admin
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();
  if (ownedWs) return "/dashboard";

  // Check membership status for invited users
  const { data } = await admin
    .from("workspace_members")
    .select("status")
    .eq("invitee_email", user.email.toLowerCase())
    .in("status", ["active", "awaiting_approval"]);

  const rows = data ?? [];
  if (rows.some((r) => r.status === "active")) return "/dashboard";
  if (rows.some((r) => r.status === "awaiting_approval"))
    return "/pending-approval";
  return "/onboarding";
}

// ── Accept invite (called on sign-in — moves pending → awaiting_approval) ────

export async function acceptPendingInvites(userEmail: string): Promise<void> {
  if (!userEmail) return;
  const admin = createSupabaseAdminClient();
  await admin
    .from("workspace_members")
    .update({
      status: "awaiting_approval",
      accepted_at: new Date().toISOString(),
    })
    .eq("invitee_email", userEmail.toLowerCase())
    .eq("status", "pending");
}

// ── Approve a member (owner action — awaiting_approval → active) ──────────────

export async function approveMember(
  workspaceId: string,
  memberId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { user } = await requireWorkspaceOwner();
  const admin = createSupabaseAdminClient();

  const { data: ws } = await admin
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!ws) return { ok: false, error: "Unauthorized" };

  const { error } = await admin
    .from("workspace_members")
    .update({ status: "active" })
    .eq("id", memberId)
    .eq("workspace_id", workspaceId)
    .eq("status", "awaiting_approval");

  if (error) return { ok: false, error: "Could not approve member." };
  return { ok: true };
}
