import { redirect } from "next/navigation";
import { type AgentRole } from "@/lib/prompts";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getRemainingTokens, TIER_MONTHLY_TOKENS } from "@/lib/credits";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { OfficePageClient } from "./OfficePageClient";

const ROLES: AgentRole[] = ["aria", "cmo", "coo", "cfo", "ceo", "cto"];

type AgentStat = {
  convCount: number;
  msgCountMtd: number;
  lastActive: string | null;
  lastContent: string | null;
};

export default async function OfficePage() {
  const ctx = await getCurrentWorkspace();
  if (!ctx || !ctx.workspace.onboarded) redirect("/onboarding");
  const { workspace, allWorkspaces } = ctx;

  const admin = createSupabaseAdminClient();
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const { data: convRows } = await admin
    .from("conversations")
    .select("id, agent_role, updated_at")
    .eq("workspace_id", workspace.id);

  const convIds = (convRows ?? []).map((c) => c.id);

  const { data: msgRows } = convIds.length > 0
    ? await admin.from("messages").select("conversation_id, created_at, role")
        .in("conversation_id", convIds).eq("role", "assistant")
    : { data: [] };

  const statsByRole: Record<AgentRole, AgentStat> = Object.fromEntries(
    ROLES.map((r) => [r, { convCount: 0, msgCountMtd: 0, lastActive: null, lastContent: null }]),
  ) as Record<AgentRole, AgentStat>;

  const convRoleMap: Record<string, AgentRole> = {};
  for (const c of convRows ?? []) {
    convRoleMap[c.id] = c.agent_role as AgentRole;
    const s = statsByRole[c.agent_role as AgentRole];
    if (s) { s.convCount++; if (!s.lastActive || c.updated_at > s.lastActive) s.lastActive = c.updated_at; }
  }
  for (const m of msgRows ?? []) {
    const role = convRoleMap[m.conversation_id];
    if (!role) continue;
    const s = statsByRole[role];
    if (s && m.created_at >= startOfMonth) s.msgCountMtd++;
  }

  // Setup status
  let hasBusinessProfile = false, hasBrandVoice = false, hasFinancials = false;
  const { data: connectors } = await admin.from("connectors").select("id").eq("workspace_id", workspace.id).eq("status", "active");
  const hasConnectors = (connectors ?? []).length > 0;
  try {
    const [{ data: bp }, { data: bv }, { data: fs }] = await Promise.all([
      admin.from("business_profiles").select("industry").eq("workspace_id", workspace.id).maybeSingle(),
      admin.from("brand_voice").select("voice_summary").eq("workspace_id", workspace.id).maybeSingle(),
      admin.from("financial_snapshots").select("id").eq("workspace_id", workspace.id).limit(1).maybeSingle(),
    ]);
    hasBusinessProfile = !!bp?.industry;
    hasBrandVoice = !!bv?.voice_summary;
    hasFinancials = !!fs;
  } catch { /* non-fatal */ }

  const remaining = await getRemainingTokens(workspace.id);
  const quota = TIER_MONTHLY_TOKENS[workspace.tier] ?? 100_000;

  return (
    <OfficePageClient
      workspaceName={workspace.name}
      workspaceId={workspace.id}
      agentStats={statsByRole}
      ownerInitial={(ctx.user?.email ?? "B")[0]!.toUpperCase()}
      ownerName={ctx.user?.email?.split("@")[0] ?? "Boss"}
      hasBusinessProfile={hasBusinessProfile}
      hasBrandVoice={hasBrandVoice}
      hasFinancials={hasFinancials}
      hasConnectors={hasConnectors}
      remaining={remaining}
      quota={quota}
      allWorkspaces={allWorkspaces}
    />
  );
}
