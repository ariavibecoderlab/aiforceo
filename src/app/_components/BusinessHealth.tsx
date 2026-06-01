"use client";

import { HealthScoreCard } from "./HealthScoreCard";

type KPIData = {
  sales: number;
  gpPct: number;
  customers: number;
  repeatRate: number;
  cashBalance: number;
  cashIn: number;
  cashOut: number;
  headcount: number;
  csat: number;
  nps: number;
};

type Props = {
  kpi: KPIData;
};

/**
 * Compute health scores (0-100) from KPI data.
 * Each score is a weighted mix of relevant metrics.
 * Trends are hardcoded to 0 for now — will be computed from historical data later.
 */
function computeScores(kpi: KPIData) {
  // Sales Health: revenue existence + GP margin + customer count
  const salesScore = Math.min(100, Math.round(
    (kpi.sales > 0 ? 30 : 0) +
    (kpi.gpPct > 0.4 ? 25 : kpi.gpPct > 0.2 ? 15 : 0) +
    (kpi.customers > 100 ? 25 : kpi.customers > 10 ? 15 : kpi.customers > 0 ? 5 : 0) +
    (kpi.repeatRate > 0.2 ? 20 : kpi.repeatRate > 0.1 ? 10 : 0)
  ));

  // Marketing Health: customer volume + repeat rate
  const marketingScore = Math.min(100, Math.round(
    (kpi.customers > 500 ? 40 : kpi.customers > 100 ? 25 : kpi.customers > 0 ? 10 : 0) +
    (kpi.repeatRate > 0.3 ? 30 : kpi.repeatRate > 0.15 ? 20 : kpi.repeatRate > 0 ? 10 : 0) +
    (kpi.sales > 0 ? 30 : 0)
  ));

  // Finance Health: cash flow + cash balance + GP margin
  const financeScore = Math.min(100, Math.round(
    (kpi.cashBalance > 0 ? 30 : 0) +
    (kpi.cashIn > kpi.cashOut ? 30 : kpi.cashIn > 0 ? 15 : 0) +
    (kpi.gpPct > 0.5 ? 25 : kpi.gpPct > 0.3 ? 15 : 0) +
    (kpi.sales > 0 ? 15 : 0)
  ));

  // Operations Health: headcount + CSAT + NPS
  const opsScore = Math.min(100, Math.round(
    (kpi.headcount > 0 ? 25 : 0) +
    (kpi.csat > 4 ? 25 : kpi.csat > 3 ? 15 : kpi.csat > 0 ? 5 : 0) +
    (kpi.nps > 50 ? 25 : kpi.nps > 20 ? 15 : kpi.nps > 0 ? 5 : 0) +
    (kpi.repeatRate > 0.2 ? 25 : kpi.repeatRate > 0 ? 10 : 0)
  ));

  return { salesScore, marketingScore, financeScore, opsScore };
}

function getNote(score: number, area: string): string {
  if (score >= 80) return `Strong ${area.toLowerCase()} performance.`;
  if (score >= 60) return `${area} is stable with room to grow.`;
  if (score >= 30) return `${area} needs attention — review with your AI executive.`;
  if (score > 0) return `Limited ${area.toLowerCase()} data. Share more with Aria.`;
  return `No ${area.toLowerCase()} data yet. Talk to Aria to get started.`;
}

export function BusinessHealth({ kpi }: Props) {
  const { salesScore, marketingScore, financeScore, opsScore } = computeScores(kpi);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Business Health
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        <HealthScoreCard title="Sales Health" score={salesScore} trend={0} note={getNote(salesScore, "Sales")} icon="💰" />
        <HealthScoreCard title="Marketing Health" score={marketingScore} trend={0} note={getNote(marketingScore, "Marketing")} icon="📣" />
        <HealthScoreCard title="Finance Health" score={financeScore} trend={0} note={getNote(financeScore, "Finance")} icon="📊" />
        <HealthScoreCard title="Operations Health" score={opsScore} trend={0} note={getNote(opsScore, "Operations")} icon="⚙" />
      </div>
    </div>
  );
}
