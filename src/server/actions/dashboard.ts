"use server";

import { requireUser } from "@/lib/auth/require";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace } from "@/lib/workspace";
import type {
  MonthlyKPIRecord,
  PeriodRaw,
  FinanceData,
  OpsData,
  Channel,
  WorkspaceKPI,
} from "@/lib/kpi/types";
import { ZERO_PERIOD, ZERO_FINANCE, ZERO_OPS } from "@/lib/kpi/types";
import { buildKPIView } from "@/lib/kpi/rollup";

/* ─── Helpers ──────────────────────────────────────────────────── */

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Deep merge two objects — b overrides a for leaf values. */
function deepMerge(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...a };
  for (const key of Object.keys(b)) {
    if (
      b[key] &&
      typeof b[key] === "object" &&
      !Array.isArray(b[key]) &&
      a[key] &&
      typeof a[key] === "object" &&
      !Array.isArray(a[key])
    ) {
      result[key] = deepMerge(
        a[key] as Record<string, unknown>,
        b[key] as Record<string, unknown>,
      );
    } else if (b[key] !== undefined && b[key] !== null) {
      result[key] = b[key];
    }
  }
  return result;
}

/* ─── loadMonthlyKPIs ──────────────────────────────────────────── */

export async function loadMonthlyKPIs(
  workspaceId: string,
  year?: number,
): Promise<MonthlyKPIRecord[]> {
  const admin = createSupabaseAdminClient();
  const y = year ?? new Date().getFullYear();
  const monthPrefix = `${y}-`;

  const { data, error } = await admin
    .from("workspace_kpi_months")
    .select("month, period_data, finance_data, ops_data, marketing")
    .eq("workspace_id", workspaceId)
    .like("month", `${monthPrefix}%`)
    .order("month", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    month: row.month as string,
    periodData: { ...ZERO_PERIOD, ...(row.period_data as object) } as PeriodRaw,
    financeData: {
      ...ZERO_FINANCE,
      ...(row.finance_data as object),
    } as FinanceData,
    opsData: { ...ZERO_OPS, ...(row.ops_data as object) } as OpsData,
    marketing: (row.marketing as Channel[]) ?? [],
  }));
}

/* ─── saveMonthlyKPI ───────────────────────────────────────────── */

export async function saveMonthlyKPI(
  month: string,
  data: {
    periodData?: Partial<PeriodRaw>;
    financeData?: Partial<FinanceData>;
    opsData?: Partial<OpsData>;
    marketing?: Channel[];
  },
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  const ctx = await getCurrentWorkspace();
  if (!ctx) return { ok: false, error: "No workspace" };

  const admin = createSupabaseAdminClient();

  // Verify ownership
  const { data: ws } = await admin
    .from("workspaces")
    .select("id")
    .eq("id", ctx.workspace.id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!ws) return { ok: false, error: "Unauthorized" };

  // Load existing month record for deep merge
  const { data: existing } = await admin
    .from("workspace_kpi_months")
    .select("period_data, finance_data, ops_data, marketing")
    .eq("workspace_id", ctx.workspace.id)
    .eq("month", month)
    .maybeSingle();

  const mergedPeriod = deepMerge(
    (existing?.period_data as Record<string, unknown>) ?? { ...ZERO_PERIOD },
    (data.periodData ?? {}) as Record<string, unknown>,
  );
  const mergedFinance = deepMerge(
    (existing?.finance_data as Record<string, unknown>) ?? { ...ZERO_FINANCE },
    (data.financeData ?? {}) as Record<string, unknown>,
  );
  const mergedOps = deepMerge(
    (existing?.ops_data as Record<string, unknown>) ?? { ...ZERO_OPS },
    (data.opsData ?? {}) as Record<string, unknown>,
  );
  const mergedMarketing =
    data.marketing ?? (existing?.marketing as Channel[]) ?? [];

  const { error } = await admin.from("workspace_kpi_months").upsert(
    {
      workspace_id: ctx.workspace.id,
      month,
      period_data: mergedPeriod,
      finance_data: mergedFinance,
      ops_data: mergedOps,
      marketing: mergedMarketing,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id,month" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/* ─── Legacy wrappers (backward compat) ────────────────────────── */

export async function saveKPIs(
  kpiData: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  const ctx = await getCurrentWorkspace();
  if (!ctx) return { ok: false, error: "No workspace" };

  // Verify ownership before write
  const admin = createSupabaseAdminClient();
  const { data: ws } = await admin
    .from("workspaces")
    .select("id")
    .eq("id", ctx.workspace.id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!ws) return { ok: false, error: "Unauthorized" };

  // Write to legacy table for backward compat
  const { error: legacyErr } = await admin.from("workspace_kpis").upsert(
    {
      workspace_id: ctx.workspace.id,
      kpi_data: kpiData,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id" },
  );
  if (legacyErr) return { ok: false, error: legacyErr.message };

  // Also write MTD data to the monthly table for the current month
  const kpi = kpiData as WorkspaceKPI | null;
  if (kpi?.periods?.MTD) {
    const month = currentMonth();
    const { error: monthErr } = await admin
      .from("workspace_kpi_months")
      .upsert(
        {
          workspace_id: ctx.workspace.id,
          month,
          period_data: kpi.periods.MTD,
          finance_data: kpi.finance ?? {},
          ops_data: kpi.ops ?? {},
          marketing: kpi.marketing ?? [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id,month" },
      );
    if (monthErr) return { ok: false, error: monthErr.message };
  }

  return { ok: true };
}

export async function loadKPIs(
  workspaceId: string,
): Promise<WorkspaceKPI | null> {
  // Try monthly records first; fall back to legacy table
  const monthly = await loadMonthlyKPIs(workspaceId);
  if (monthly.length > 0) {
    const month = currentMonth();
    return buildKPIView(monthly, month);
  }

  // Legacy fallback
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("workspace_kpis")
    .select("kpi_data")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  return (data?.kpi_data as WorkspaceKPI) ?? null;
}
