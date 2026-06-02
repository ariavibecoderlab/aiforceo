import { redirect } from "next/navigation";
import { Sidebar } from "@/app/_components/Sidebar";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getRemainingTokens, TIER_MONTHLY_TOKENS } from "@/lib/credits";
import { listTasks } from "@/server/actions/tasks";
import { TasksClient } from "./TasksClient";

export default async function TasksPage() {
  const ctx = await getCurrentWorkspace();
  if (!ctx || !ctx.workspace.onboarded) redirect("/onboarding");
  const { workspace, allWorkspaces } = ctx;

  const remaining = await getRemainingTokens(workspace.id);
  const quota = TIER_MONTHLY_TOKENS[workspace.tier] ?? 100_000;

  const tasks = await listTasks();

  return (
    <div className="grid min-h-screen app-grid" style={{ gridTemplateColumns: "240px 1fr" }}>
      <Sidebar
        active="tasks"
        remainingTokens={remaining}
        monthlyQuota={quota}
        workspaceName={workspace.name}
        workspaceId={workspace.id}
        allWorkspaces={allWorkspaces}
      />
      <TasksClient initialTasks={tasks} />
    </div>
  );
}
