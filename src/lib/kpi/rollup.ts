/**
 * KPI roll-up engine — computes MTD / QTD / YTD views from monthly records,
 * plus MoM trends, anomaly detection, and projections.
 */

import type {
  PeriodRaw,
  FinanceData,
  OpsData,
  MonthlyKPIRecord,
  WorkspaceKPI,
  Channel,
} from "./types";
import { ZERO_PERIOD, ZERO_FINANCE, ZERO_OPS } from "./types";

/* ═══════════════════════════════════════════════════════════════════
   HELPERS — date math
   ═══════════════════════════════════════════════════════════════════ */

/** Returns quarter 1-4 for a 'YYYY-MM' string. */
export function getQuarter(month: string): number {
  const m = parseInt(month.slice(5, 7), 10);
  return Math.ceil(m / 3);
}

/** Returns all months in the same quarter up to and including `month`. */
export function getMonthsInQuarter(month: string): string[] {
  const year = month.slice(0, 4);
  const m = parseInt(month.slice(5, 7), 10);
  const qStart = (getQuarter(month) - 1) * 3 + 1;
  const result: string[] = [];
  for (let i = qStart; i <= m; i++) {
    result.push(`${year}-${String(i).padStart(2, "0")}`);
  }
  return result;
}

/** Returns all months in the same year up to and including `month`. */
export function getMonthsInYear(month: string): string[] {
  const year = month.slice(0, 4);
  const m = parseInt(month.slice(5, 7), 10);
  const result: string[] = [];
  for (let i = 1; i <= m; i++) {
    result.push(`${year}-${String(i).padStart(2, "0")}`);
  }
  return result;
}

/** Get the previous month as 'YYYY-MM'. */
function prevMonth(month: string): string {
  const y = parseInt(month.slice(0, 4), 10);
  const m = parseInt(month.slice(5, 7), 10);
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, "0")}`;
}

/* ═══════════════════════════════════════════════════════════════════
   PERIOD ROLL-UP
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Aggregate multiple monthly PeriodRaw records into a single rolled-up period.
 *
 * Field classification:
 *  VOLUME (SUM): reach, opex, fixedCost, capexMtd
 *  RATE (WEIGHTED AVERAGE):
 *    - leadCR  weighted by reach
 *    - saleCR  weighted by prospects (reach * leadCR)
 *    - avgSale weighted by customers
 *    - avgTxn  weighted by customers
 *    - gpPct   weighted by sales
 *  capexYtd: SUM of capexMtd across all months in scope
 */
function rollupPeriods(records: MonthlyKPIRecord[]): PeriodRaw {
  if (records.length === 0) return { ...ZERO_PERIOD };
  if (records.length === 1) return { ...records[0]!.periodData };

  let totalReach = 0;
  let totalOpex = 0;
  let totalFixedCost = 0;
  let totalCapexMtd = 0;

  // Direct fields — SUM across months (volume fields)
  let totalRevenue = 0;
  let totalOrders = 0;
  let hasAnyRevenue = false;
  let hasAnyOrders = false;

  // Weighted-average accumulators
  let sumLeadCR_w = 0,
    wReach = 0; // weight: reach
  let sumSaleCR_w = 0,
    wProspects = 0; // weight: prospects
  let sumAvgSale_w = 0,
    wCustomers = 0; // weight: customers
  let sumAvgTxn_w = 0; // weight: customers (same)
  let sumGpPct_w = 0,
    wSales = 0; // weight: sales

  for (const rec of records) {
    const p = rec.periodData;
    const prospects = p.reach * p.leadCR;
    const customers = prospects * p.saleCR;
    const sales = p.revenue ?? (customers * p.avgSale * p.avgTxn);

    // Direct fields — sum when present
    if (p.revenue != null) {
      totalRevenue += p.revenue;
      hasAnyRevenue = true;
    }
    if (p.orders != null) {
      totalOrders += p.orders;
      hasAnyOrders = true;
    }

    // VOLUME — sum
    totalReach += p.reach;
    totalOpex += p.opex;
    totalFixedCost += p.fixedCost;
    totalCapexMtd += p.capexMtd;

    // RATE — weighted sums
    sumLeadCR_w += p.leadCR * p.reach;
    wReach += p.reach;

    sumSaleCR_w += p.saleCR * prospects;
    wProspects += prospects;

    sumAvgSale_w += p.avgSale * customers;
    sumAvgTxn_w += p.avgTxn * customers;
    wCustomers += customers;

    sumGpPct_w += p.gpPct * sales;
    wSales += sales;
  }

  return {
    revenue: hasAnyRevenue ? totalRevenue : undefined,
    orders: hasAnyOrders ? totalOrders : undefined,
    reach: totalReach,
    leadCR: wReach > 0 ? sumLeadCR_w / wReach : 0,
    saleCR: wProspects > 0 ? sumSaleCR_w / wProspects : 0,
    avgSale: wCustomers > 0 ? sumAvgSale_w / wCustomers : 0,
    avgTxn: wCustomers > 0 ? sumAvgTxn_w / wCustomers : 0,
    gpPct: wSales > 0 ? sumGpPct_w / wSales : 0,
    opex: totalOpex,
    capexMtd: totalCapexMtd,
    capexYtd: totalCapexMtd, // for multi-month roll-ups, YTD capex = sum of monthly capex
    fixedCost: totalFixedCost,
  };
}

/* ═══════════════════════════════════════════════════════════════════
   FINANCE ROLL-UP
   ═══════════════════════════════════════════════════════════════════ */

/** Balance fields: take the latest month's value. */
const FINANCE_BALANCE_KEYS: (keyof FinanceData)[] = [
  "cashBalance",
  "ar",
  "ap",
  "arOverdue",
  "assets",
  "liabilities",
  "equity",
  "debtPayment",
  "inventory",
  "runwayMonths",
];

/** Flow fields: sum across months. */
const FINANCE_FLOW_KEYS: (keyof FinanceData)[] = ["cashIn", "cashOut", "noi"];

function rollupFinance(records: MonthlyKPIRecord[]): FinanceData {
  if (records.length === 0) return { ...ZERO_FINANCE };
  if (records.length === 1) return { ...records[0]!.financeData };

  const result = { ...ZERO_FINANCE };
  const latest = records[records.length - 1]!.financeData;

  // Balance: take latest
  for (const key of FINANCE_BALANCE_KEYS) {
    result[key] = latest[key];
  }

  // Flow: sum
  for (const key of FINANCE_FLOW_KEYS) {
    let sum = 0;
    for (const rec of records) {
      sum += rec.financeData[key];
    }
    result[key] = sum;
  }

  return result;
}

/* ═══════════════════════════════════════════════════════════════════
   OPS ROLL-UP
   ═══════════════════════════════════════════════════════════════════ */

const OPS_LATEST_KEYS: (keyof OpsData)[] = ["headcount", "openRoles"];
const OPS_SUM_KEYS: (keyof OpsData)[] = ["customers", "complaints", "resolved"];
const OPS_AVG_KEYS: (keyof OpsData)[] = [
  "repeatRate",
  "csat",
  "nps",
  "attrition",
  "onTimeDelivery",
  "capacityUsed",
  "eNPS",
  "productivityPerHead",
  "trainingHrs",
];

function rollupOps(records: MonthlyKPIRecord[]): OpsData {
  if (records.length === 0) return { ...ZERO_OPS };
  if (records.length === 1) return { ...records[0]!.opsData };

  const result = { ...ZERO_OPS };
  const latest = records[records.length - 1]!.opsData;

  for (const key of OPS_LATEST_KEYS) {
    result[key] = latest[key];
  }

  for (const key of OPS_SUM_KEYS) {
    let sum = 0;
    for (const rec of records) sum += rec.opsData[key];
    result[key] = sum;
  }

  for (const key of OPS_AVG_KEYS) {
    let sum = 0;
    let count = 0;
    for (const rec of records) {
      if (rec.opsData[key] !== 0) {
        sum += rec.opsData[key];
        count++;
      }
    }
    result[key] = count > 0 ? sum / count : 0;
  }

  return result;
}

/* ═══════════════════════════════════════════════════════════════════
   MARKETING ROLL-UP
   ═══════════════════════════════════════════════════════════════════ */

/** Take the latest month's marketing channels. */
function rollupMarketing(records: MonthlyKPIRecord[]): Channel[] {
  if (records.length === 0) return [];
  return records[records.length - 1]!.marketing;
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN: buildKPIView
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Build a WorkspaceKPI view (MTD / QTD / YTD) from monthly records.
 * `selectedMonth` is the month the user is viewing (e.g. '2026-06').
 * `allMonths` should be sorted ascending by month.
 */
export function buildKPIView(
  allMonths: MonthlyKPIRecord[],
  selectedMonth: string,
): WorkspaceKPI {
  const byMonth = new Map<string, MonthlyKPIRecord>();
  for (const rec of allMonths) byMonth.set(rec.month, rec);

  // MTD = just the selected month
  const mtdRecord = byMonth.get(selectedMonth);
  const mtdRecords = mtdRecord ? [mtdRecord] : [];

  // QTD = all months in the quarter up to selectedMonth that have data
  const qtdMonthKeys = getMonthsInQuarter(selectedMonth);
  const qtdRecords = qtdMonthKeys
    .map((m) => byMonth.get(m))
    .filter((r): r is MonthlyKPIRecord => r !== undefined);

  // YTD = all months in the year up to selectedMonth that have data
  const ytdMonthKeys = getMonthsInYear(selectedMonth);
  const ytdRecords = ytdMonthKeys
    .map((m) => byMonth.get(m))
    .filter((r): r is MonthlyKPIRecord => r !== undefined);

  return {
    periods: {
      MTD: rollupPeriods(mtdRecords),
      QTD: rollupPeriods(qtdRecords),
      YTD: rollupPeriods(ytdRecords),
    },
    finance: rollupFinance(mtdRecords.length > 0 ? mtdRecords : qtdRecords),
    marketing: rollupMarketing(mtdRecords),
    ops: rollupOps(mtdRecords.length > 0 ? mtdRecords : qtdRecords),
  };
}

/* ═══════════════════════════════════════════════════════════════════
   MoM TREND
   ═══════════════════════════════════════════════════════════════════ */

export type MoMTrend = {
  periodDelta: Partial<Record<keyof PeriodRaw, number>>; // percentage change
  financeDelta: Partial<Record<keyof FinanceData, number>>;
  opsDelta: Partial<Record<keyof OpsData, number>>;
};

function pctChange(current: number, previous: number): number | undefined {
  if (previous === 0) return current === 0 ? undefined : undefined;
  return (current - previous) / Math.abs(previous);
}

/**
 * Compute month-over-month percentage change for every field.
 * Returns null if the previous month has no data.
 */
export function computeMoMTrend(
  allMonths: MonthlyKPIRecord[],
  selectedMonth: string,
): MoMTrend | null {
  const byMonth = new Map<string, MonthlyKPIRecord>();
  for (const rec of allMonths) byMonth.set(rec.month, rec);

  const current = byMonth.get(selectedMonth);
  const prev = byMonth.get(prevMonth(selectedMonth));
  if (!current || !prev) return null;

  const periodDelta: MoMTrend["periodDelta"] = {};
  for (const key of Object.keys(current.periodData) as (keyof PeriodRaw)[]) {
    const curVal = current.periodData[key];
    const prevVal = prev.periodData[key];
    if (curVal == null || prevVal == null) continue;
    const delta = pctChange(curVal, prevVal);
    if (delta !== undefined) periodDelta[key] = delta;
  }

  const financeDelta: MoMTrend["financeDelta"] = {};
  for (const key of Object.keys(current.financeData) as (keyof FinanceData)[]) {
    const delta = pctChange(current.financeData[key], prev.financeData[key]);
    if (delta !== undefined) financeDelta[key] = delta;
  }

  const opsDelta: MoMTrend["opsDelta"] = {};
  for (const key of Object.keys(current.opsData) as (keyof OpsData)[]) {
    const delta = pctChange(current.opsData[key], prev.opsData[key]);
    if (delta !== undefined) opsDelta[key] = delta;
  }

  return { periodDelta, financeDelta, opsDelta };
}

/* ═══════════════════════════════════════════════════════════════════
   ANOMALY DETECTION
   ═══════════════════════════════════════════════════════════════════ */

export type Anomaly = {
  field: string;
  section: "period" | "finance" | "ops";
  value: number;
  average: number;
  deviation: number; // how many standard deviations from mean
  direction: "high" | "low";
  label: string; // human readable
};

function stdDev(values: number[]): { mean: number; sd: number } {
  if (values.length === 0) return { mean: 0, sd: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return { mean, sd: Math.sqrt(variance) };
}

const FIELD_LABELS: Record<string, string> = {
  revenue: "Revenue (direct)",
  orders: "Orders",
  reach: "Reach / Traffic",
  leadCR: "Lead conversion rate",
  saleCR: "Sale conversion rate",
  avgSale: "Average sale value",
  avgTxn: "Average transactions",
  gpPct: "Gross profit margin",
  opex: "Operating expenses",
  capexMtd: "Capital expenditure",
  fixedCost: "Fixed costs",
  cashIn: "Cash inflow",
  cashOut: "Cash outflow",
  cashBalance: "Cash balance",
  ar: "Accounts receivable",
  ap: "Accounts payable",
  arOverdue: "Overdue receivables",
  noi: "Net operating income",
  inventory: "Inventory",
  headcount: "Headcount",
  customers: "Customers",
  complaints: "Complaints",
  resolved: "Resolved complaints",
  repeatRate: "Repeat rate",
  csat: "Customer satisfaction",
  nps: "Net Promoter Score",
  attrition: "Staff attrition",
  onTimeDelivery: "On-time delivery",
  capacityUsed: "Capacity utilization",
  eNPS: "Employee NPS",
  productivityPerHead: "Productivity per head",
  trainingHrs: "Training hours",
};

/**
 * Detect statistical anomalies in the selected month compared to history.
 * Looks at the last 6 months of data (or whatever is available, minimum 3).
 */
export function detectAnomalies(
  allMonths: MonthlyKPIRecord[],
  selectedMonth: string,
  threshold = 1.5,
): Anomaly[] {
  const sorted = [...allMonths].sort((a, b) => a.month.localeCompare(b.month));
  const idx = sorted.findIndex((r) => r.month === selectedMonth);
  if (idx < 0) return [];

  // Need at least 3 prior months for meaningful statistics
  const historyStart = Math.max(0, idx - 6);
  const history = sorted.slice(historyStart, idx);
  if (history.length < 3) return [];

  const current = sorted[idx]!;
  const anomalies: Anomaly[] = [];

  function check(
    section: Anomaly["section"],
    field: string,
    currentVal: number,
    historyVals: number[],
  ) {
    const { mean, sd } = stdDev(historyVals);
    if (sd === 0) return; // no variance = no anomaly possible
    const dev = (currentVal - mean) / sd;
    if (Math.abs(dev) >= threshold) {
      const direction: "high" | "low" = dev > 0 ? "high" : "low";
      const ratio = mean !== 0 ? (currentVal / mean).toFixed(1) : "N/A";
      const fieldLabel = FIELD_LABELS[field] ?? field;
      const label =
        direction === "high"
          ? `${fieldLabel} is ${ratio}× your ${history.length}-month average`
          : `${fieldLabel} is ${ratio}× your ${history.length}-month average (below normal)`;

      anomalies.push({
        field,
        section,
        value: currentVal,
        average: mean,
        deviation: Math.abs(dev),
        direction,
        label,
      });
    }
  }

  // Period fields
  for (const key of Object.keys(current.periodData) as (keyof PeriodRaw)[]) {
    const curVal = current.periodData[key];
    if (curVal == null) continue;
    const histVals = history.map((r) => r.periodData[key]).filter((v): v is number => v != null);
    if (histVals.length < 3) continue;
    check("period", key, curVal, histVals);
  }

  // Finance fields
  for (const key of Object.keys(current.financeData) as (keyof FinanceData)[]) {
    check(
      "finance",
      key,
      current.financeData[key],
      history.map((r) => r.financeData[key]),
    );
  }

  // Ops fields
  for (const key of Object.keys(current.opsData) as (keyof OpsData)[]) {
    check(
      "ops",
      key,
      current.opsData[key],
      history.map((r) => r.opsData[key]),
    );
  }

  // Sort by deviation descending (most anomalous first)
  return anomalies.sort((a, b) => b.deviation - a.deviation);
}

/* ═══════════════════════════════════════════════════════════════════
   PROJECTION
   ═══════════════════════════════════════════════════════════════════ */

export type Projection = {
  quarterEnd: PeriodRaw;
  yearEnd: PeriodRaw;
  quarterEndFinance: Partial<FinanceData>;
  yearEndFinance: Partial<FinanceData>;
};

/**
 * Project trends to quarter-end and year-end using linear extrapolation
 * from available monthly data. Returns null if less than 2 months of data.
 */
export function projectTrend(
  allMonths: MonthlyKPIRecord[],
  selectedMonth: string,
): Projection | null {
  const year = selectedMonth.slice(0, 4);
  const monthNum = parseInt(selectedMonth.slice(5, 7), 10);

  // Get all months in the current year up to selectedMonth, sorted
  const yearMonths = allMonths
    .filter((r) => r.month.startsWith(year) && r.month <= selectedMonth)
    .sort((a, b) => a.month.localeCompare(b.month));

  if (yearMonths.length < 2) return null;

  const quarterEnd = (getQuarter(selectedMonth) * 3);
  const remainingInQuarter = quarterEnd - monthNum;
  const remainingInYear = 12 - monthNum;

  // Compute average monthly values for VOLUME period fields
  const volumeKeys: (keyof PeriodRaw)[] = [
    "revenue",
    "orders",
    "reach",
    "opex",
    "fixedCost",
    "capexMtd",
  ];
  // For rates, take the latest month's value as the projection
  const rateKeys: (keyof PeriodRaw)[] = [
    "leadCR",
    "saleCR",
    "avgSale",
    "avgTxn",
    "gpPct",
  ];

  const latestPeriod = yearMonths[yearMonths.length - 1]!.periodData;

  // Average monthly volume
  const avgMonthlyVolume: Partial<Record<keyof PeriodRaw, number>> = {};
  for (const key of volumeKeys) {
    let sum = 0;
    let count = 0;
    for (const r of yearMonths) {
      const v = r.periodData[key];
      if (v != null) { sum += v; count++; }
    }
    if (count > 0) avgMonthlyVolume[key] = sum / count;
  }

  function projectPeriod(remainingMonths: number): PeriodRaw {
    const totalMonths = yearMonths.length + remainingMonths;
    const projected = { ...ZERO_PERIOD };

    for (const key of volumeKeys) {
      // Skip optional fields that have no data
      if (avgMonthlyVolume[key] == null) continue;
      // Current total + projected remaining months at average rate
      let currentTotal = 0;
      for (const r of yearMonths) currentTotal += (r.periodData[key] ?? 0);
      (projected as Record<string, unknown>)[key] = currentTotal + (avgMonthlyVolume[key] ?? 0) * remainingMonths;
    }

    // Rates: carry latest forward (rateKeys are all required number fields)
    for (const key of rateKeys) {
      (projected as Record<string, unknown>)[key] = latestPeriod[key];
    }

    // capexYtd = projected capexMtd total
    projected.capexYtd = projected.capexMtd;

    // If projecting to full period, normalize fixedCost to monthly average * total months
    // (fixedCost in the period view represents the period total)
    void totalMonths; // used conceptually above

    return projected;
  }

  // Finance projection: extrapolate flow fields, carry balance fields
  function projectFinance(remainingMonths: number): Partial<FinanceData> {
    const result: Partial<FinanceData> = {};
    const latestFinance = yearMonths[yearMonths.length - 1]!.financeData;

    // Flow: sum existing + average * remaining
    for (const key of FINANCE_FLOW_KEYS) {
      let sum = 0;
      for (const r of yearMonths) sum += r.financeData[key];
      const avg = sum / yearMonths.length;
      result[key] = sum + avg * remainingMonths;
    }

    // Balance: carry latest (point-in-time snapshot)
    for (const key of FINANCE_BALANCE_KEYS) {
      result[key] = latestFinance[key];
    }

    return result;
  }

  return {
    quarterEnd: projectPeriod(remainingInQuarter),
    yearEnd: projectPeriod(remainingInYear),
    quarterEndFinance: projectFinance(remainingInQuarter),
    yearEndFinance: projectFinance(remainingInYear),
  };
}
