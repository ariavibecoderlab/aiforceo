/**
 * Shared KPI types — single source of truth.
 *
 * These were originally defined inline in DashboardClient.tsx.
 * New code should import from here; the dashboard will be migrated
 * to re-export from this module in a later phase.
 */

/* ─── Period (revenue-formula row) ─────────────────────────────── */

export type PeriodRaw = {
  reach: number;
  leadCR: number;
  saleCR: number;
  avgSale: number;
  avgTxn: number;
  gpPct: number;
  opex: number;
  capexMtd: number;
  capexYtd: number;
  fixedCost: number;
};

export type PeriodData = PeriodRaw & {
  prospects: number;
  customers: number;
  sales: number;
  gp: number;
  ebitda: number;
  breakeven: number;
};

/* ─── Finance ──────────────────────────────────────────────────── */

export type FinanceData = {
  cashIn: number;
  cashOut: number;
  cashBalance: number;
  ar: number;
  ap: number;
  arOverdue: number;
  assets: number;
  liabilities: number;
  equity: number;
  debtPayment: number;
  noi: number;
  inventory: number;
  runwayMonths: number;
};

/* ─── Marketing channel ────────────────────────────────────────── */

export type Channel = {
  name: string;
  prospects: number;
  cost: number;
  customers: number;
  works: boolean;
};

/* ─── Operations ───────────────────────────────────────────────── */

export type OpsData = {
  headcount: number;
  openRoles: number;
  attrition: number;
  eNPS: number;
  productivityPerHead: number;
  trainingHrs: number;
  customers: number;
  repeatRate: number;
  csat: number;
  nps: number;
  complaints: number;
  resolved: number;
  onTimeDelivery: number;
  capacityUsed: number;
};

/* ─── Composite views ──────────────────────────────────────────── */

export type WorkspaceKPI = {
  periods: { MTD: PeriodRaw; QTD: PeriodRaw; YTD: PeriodRaw };
  finance: FinanceData;
  marketing: Channel[];
  ops: OpsData;
};

/** One row from workspace_kpi_months, typed for app use. */
export type MonthlyKPIRecord = {
  month: string; // 'YYYY-MM'
  periodData: PeriodRaw;
  financeData: FinanceData;
  opsData: OpsData;
  marketing: Channel[];
};

/* ─── Zero constants ───────────────────────────────────────────── */

export const ZERO_PERIOD: PeriodRaw = {
  reach: 0,
  leadCR: 0,
  saleCR: 0,
  avgSale: 0,
  avgTxn: 0,
  gpPct: 0,
  opex: 0,
  capexMtd: 0,
  capexYtd: 0,
  fixedCost: 0,
};

export const ZERO_FINANCE: FinanceData = {
  cashIn: 0,
  cashOut: 0,
  cashBalance: 0,
  ar: 0,
  ap: 0,
  arOverdue: 0,
  assets: 0,
  liabilities: 0,
  equity: 0,
  debtPayment: 0,
  noi: 0,
  inventory: 0,
  runwayMonths: 0,
};

export const ZERO_OPS: OpsData = {
  headcount: 0,
  openRoles: 0,
  attrition: 0,
  eNPS: 0,
  productivityPerHead: 0,
  trainingHrs: 0,
  customers: 0,
  repeatRate: 0,
  csat: 0,
  nps: 0,
  complaints: 0,
  resolved: 0,
  onTimeDelivery: 0,
  capacityUsed: 0,
};

/* ─── Compute derived period fields ────────────────────────────── */

export function computePeriod(r: PeriodRaw): PeriodData {
  const prospects = Math.round(r.reach * r.leadCR);
  const customers = Math.round(prospects * r.saleCR);
  const sales = Math.round(customers * r.avgSale * r.avgTxn);
  const gp = Math.round(sales * r.gpPct);
  const ebitda = gp - r.opex;
  const breakeven = r.gpPct > 0 ? Math.round(r.fixedCost / r.gpPct) : 0;
  return { ...r, prospects, customers, sales, gp, ebitda, breakeven };
}
