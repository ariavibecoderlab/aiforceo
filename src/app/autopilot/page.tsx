import { redirect } from "next/navigation";
import { Sidebar } from "@/app/_components/Sidebar";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getRemainingTokens, TIER_MONTHLY_TOKENS } from "@/lib/credits";
import { getAutopilotConfig, getRecentRuns } from "@/server/actions/autopilot";
import { AutopilotClient } from "./AutopilotClient";

export default async function AutopilotPage() {
  const ctx = await getCurrentWorkspace();
  if (!ctx) redirect("/onboarding");
  const { workspace, allWorkspaces } = ctx;

  const remaining = await getRemainingTokens(workspace.id);
  const quota = TIER_MONTHLY_TOKENS[workspace.tier] ?? 100_000;

  const [config, recentRuns] = await Promise.all([
    getAutopilotConfig(workspace.id),
    getRecentRuns(workspace.id, 5),
  ]);

  return (
    <div
      style={{
        display: "grid",
        minHeight: "100vh",
        gridTemplateColumns: "240px 1fr",
      }}
    >
      <Sidebar
        active="autopilot"
        remainingTokens={remaining}
        monthlyQuota={quota}
        workspaceName={workspace.name}
        workspaceId={workspace.id}
        allWorkspaces={allWorkspaces}
      />
      <main className="p-10 overflow-y-auto">
        <div className="mb-8">
          <h1 className="serif text-3xl">Autopilot</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Your AI Co-founder runs daily briefs, social posts, and business
            intelligence — autonomously.
          </p>
        </div>
        <AutopilotClient
          workspaceId={workspace.id}
          initialConfig={config}
          initialRuns={recentRuns}
        />
      </main>
    </div>
  );
}
