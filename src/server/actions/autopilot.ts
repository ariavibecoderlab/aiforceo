"use server";

import { requireWorkspaceOwner } from "@/lib/auth/require";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AutopilotTaskType =
  | "daily_brief"
  | "social_post"
  | "weekly_review"
  | "competitor_check"
  | "cash_alert"
  | "content_idea";

export type AutopilotConfig = {
  workspace_id: string;
  enabled: boolean;
  tasks: AutopilotTaskType[];
  schedule: string;
};

export type AutopilotRunStatus = "pending" | "running" | "done" | "error";

export type AutopilotRunOutput = {
  task: AutopilotTaskType;
  output: string;
};

export type AutopilotRun = {
  id: string;
  workspace_id: string;
  run_date: string;
  status: AutopilotRunStatus;
  tasks: AutopilotTaskType[] | null;
  outputs: AutopilotRunOutput[] | null;
  created_at: string;
};

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Fetch the autopilot config for the authenticated user's workspace.
 * Returns a default config object if none exists yet.
 */
export async function getAutopilotConfig(
  workspaceId: string,
): Promise<AutopilotConfig> {
  const { workspace } = await requireWorkspaceOwner(workspaceId);
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("autopilot_config")
    .select("workspace_id, enabled, tasks, schedule")
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  if (!data) {
    return {
      workspace_id: workspace.id,
      enabled: false,
      tasks: ["daily_brief", "social_post", "content_idea"],
      schedule: "daily",
    };
  }

  return {
    workspace_id: data.workspace_id as string,
    enabled: data.enabled as boolean,
    tasks: (data.tasks as AutopilotTaskType[]) ?? [],
    schedule: (data.schedule as string) ?? "daily",
  };
}

/**
 * Upsert the autopilot config. Re-derives workspace ownership server-side.
 */
export async function saveAutopilotConfig(
  config: Pick<AutopilotConfig, "enabled" | "tasks" | "schedule"> & {
    workspaceId: string;
  },
): Promise<{ ok: true } | { error: string }> {
  const { workspace } = await requireWorkspaceOwner(config.workspaceId);
  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("autopilot_config").upsert(
    {
      workspace_id: workspace.id,
      enabled: config.enabled,
      tasks: config.tasks,
      schedule: config.schedule,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id" },
  );

  if (error) return { error: "Could not save autopilot config." };
  return { ok: true };
}

/**
 * Create a new pending autopilot run record and return its id.
 * The actual AI execution happens in the API route (streaming).
 */
export async function createAutopilotRun(
  workspaceId: string,
  tasks: AutopilotTaskType[],
): Promise<{ runId: string } | { error: string }> {
  const { workspace } = await requireWorkspaceOwner(workspaceId);
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("autopilot_runs")
    .insert({
      workspace_id: workspace.id,
      status: "running",
      tasks,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "Could not create run." };
  return { runId: data.id as string };
}

/**
 * Fetch the most recent autopilot runs for a workspace.
 */
export async function getRecentRuns(
  workspaceId: string,
  limit = 10,
): Promise<AutopilotRun[]> {
  const { workspace } = await requireWorkspaceOwner(workspaceId);
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("autopilot_runs")
    .select("id, workspace_id, run_date, status, tasks, outputs, created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    workspace_id: row.workspace_id as string,
    run_date: row.run_date as string,
    status: row.status as AutopilotRunStatus,
    tasks: row.tasks as AutopilotTaskType[] | null,
    outputs: row.outputs as AutopilotRunOutput[] | null,
    created_at: row.created_at as string,
  }));
}
