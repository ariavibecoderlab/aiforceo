/**
 * Industry benchmarks for key KPI fields.
 * Keyed by the template IDs from src/lib/industry-templates.ts:
 *   fnb, saas, ecommerce, services, education, manufacturing
 */

export type BenchmarkRange = {
  good: number;
  average: number;
};

export type IndustryBenchmark = {
  gpPct: BenchmarkRange;
  leadCR: BenchmarkRange;
  saleCR: BenchmarkRange;
  repeatRate: BenchmarkRange;
  csat: BenchmarkRange;
  nps: BenchmarkRange;
  attrition: BenchmarkRange;
  onTimeDelivery: BenchmarkRange;
  capacityUsed: BenchmarkRange;
  eNPS: BenchmarkRange;
};

export const BENCHMARKS: Record<string, IndustryBenchmark> = {
  fnb: {
    gpPct: { good: 0.7, average: 0.6 },
    leadCR: { good: 0.8, average: 0.6 }, // walk-in → order rate
    saleCR: { good: 0.95, average: 0.85 },
    repeatRate: { good: 0.4, average: 0.25 },
    csat: { good: 4.5, average: 3.8 },
    nps: { good: 50, average: 30 },
    attrition: { good: 0.05, average: 0.1 }, // lower is better
    onTimeDelivery: { good: 0.95, average: 0.85 },
    capacityUsed: { good: 0.75, average: 0.6 },
    eNPS: { good: 30, average: 10 },
  },
  saas: {
    gpPct: { good: 0.8, average: 0.7 },
    leadCR: { good: 0.05, average: 0.02 }, // visitor → signup
    saleCR: { good: 0.25, average: 0.15 }, // trial → paid
    repeatRate: { good: 0.95, average: 0.85 }, // retention
    csat: { good: 4.5, average: 4.0 },
    nps: { good: 50, average: 30 },
    attrition: { good: 0.03, average: 0.08 },
    onTimeDelivery: { good: 0.99, average: 0.95 }, // SLA uptime
    capacityUsed: { good: 0.7, average: 0.5 },
    eNPS: { good: 40, average: 20 },
  },
  ecommerce: {
    gpPct: { good: 0.5, average: 0.35 },
    leadCR: { good: 0.1, average: 0.05 }, // add-to-cart rate
    saleCR: { good: 0.7, average: 0.5 }, // checkout rate
    repeatRate: { good: 0.35, average: 0.2 },
    csat: { good: 4.5, average: 3.8 },
    nps: { good: 45, average: 25 },
    attrition: { good: 0.05, average: 0.1 },
    onTimeDelivery: { good: 0.95, average: 0.85 },
    capacityUsed: { good: 0.8, average: 0.6 },
    eNPS: { good: 30, average: 15 },
  },
  services: {
    gpPct: { good: 0.6, average: 0.45 },
    leadCR: { good: 0.4, average: 0.25 }, // inquiry → proposal
    saleCR: { good: 0.35, average: 0.2 }, // proposal → win
    repeatRate: { good: 0.6, average: 0.4 },
    csat: { good: 4.6, average: 4.0 },
    nps: { good: 55, average: 35 },
    attrition: { good: 0.05, average: 0.12 },
    onTimeDelivery: { good: 0.95, average: 0.85 },
    capacityUsed: { good: 0.8, average: 0.65 }, // billable utilization
    eNPS: { good: 35, average: 15 },
  },
  education: {
    gpPct: { good: 0.55, average: 0.4 },
    leadCR: { good: 0.3, average: 0.15 }, // inquiry → trial
    saleCR: { good: 0.5, average: 0.3 }, // trial → enrollment
    repeatRate: { good: 0.8, average: 0.6 }, // re-enrollment
    csat: { good: 4.5, average: 3.8 },
    nps: { good: 50, average: 30 },
    attrition: { good: 0.05, average: 0.1 },
    onTimeDelivery: { good: 0.95, average: 0.9 },
    capacityUsed: { good: 0.85, average: 0.7 }, // class capacity
    eNPS: { good: 35, average: 20 },
  },
  manufacturing: {
    gpPct: { good: 0.4, average: 0.25 },
    leadCR: { good: 0.5, average: 0.3 }, // inquiry → quote
    saleCR: { good: 0.35, average: 0.2 }, // quote → order
    repeatRate: { good: 0.7, average: 0.5 },
    csat: { good: 4.3, average: 3.7 },
    nps: { good: 40, average: 20 },
    attrition: { good: 0.04, average: 0.08 },
    onTimeDelivery: { good: 0.95, average: 0.85 },
    capacityUsed: { good: 0.85, average: 0.7 },
    eNPS: { good: 30, average: 15 },
  },
};

/** Fields where lower is better. */
const LOWER_IS_BETTER = new Set<string>(["attrition"]);

export type BenchmarkComparison = {
  status: "above" | "at" | "below";
  benchmark: number;
  label: string;
};

/**
 * Compare a KPI field value against industry benchmarks.
 * Returns null if the industry or field has no benchmark.
 */
export function compareToBenchmark(
  industry: string,
  field: string,
  value: number,
): BenchmarkComparison | null {
  const bench = BENCHMARKS[industry];
  if (!bench) return null;

  const range = bench[field as keyof IndustryBenchmark];
  if (!range) return null;

  const inverted = LOWER_IS_BETTER.has(field);

  if (inverted) {
    // Lower is better: below "good" threshold = above benchmark
    if (value <= range.good) {
      return {
        status: "above",
        benchmark: range.good,
        label: `${formatField(field)} is better than industry good (${formatValue(field, range.good)})`,
      };
    }
    if (value <= range.average) {
      return {
        status: "at",
        benchmark: range.average,
        label: `${formatField(field)} is at industry average (${formatValue(field, range.average)})`,
      };
    }
    return {
      status: "below",
      benchmark: range.average,
      label: `${formatField(field)} is worse than industry average (${formatValue(field, range.average)})`,
    };
  }

  // Higher is better
  if (value >= range.good) {
    return {
      status: "above",
      benchmark: range.good,
      label: `${formatField(field)} exceeds industry good (${formatValue(field, range.good)})`,
    };
  }
  if (value >= range.average) {
    return {
      status: "at",
      benchmark: range.average,
      label: `${formatField(field)} is at industry average (${formatValue(field, range.average)})`,
    };
  }
  return {
    status: "below",
    benchmark: range.average,
    label: `${formatField(field)} is below industry average (${formatValue(field, range.average)})`,
  };
}

/* ─── Formatting helpers ───────────────────────────────────────── */

const FIELD_LABELS: Record<string, string> = {
  gpPct: "Gross profit margin",
  leadCR: "Lead conversion rate",
  saleCR: "Sale conversion rate",
  repeatRate: "Repeat rate",
  csat: "Customer satisfaction",
  nps: "Net Promoter Score",
  attrition: "Staff attrition",
  onTimeDelivery: "On-time delivery",
  capacityUsed: "Capacity utilization",
  eNPS: "Employee NPS",
};

function formatField(field: string): string {
  return FIELD_LABELS[field] ?? field;
}

/** Percentage fields stored as decimals; NPS/CSAT stored as raw numbers. */
const PCT_FIELDS = new Set([
  "gpPct",
  "leadCR",
  "saleCR",
  "repeatRate",
  "attrition",
  "onTimeDelivery",
  "capacityUsed",
]);

function formatValue(field: string, value: number): string {
  if (PCT_FIELDS.has(field)) return `${(value * 100).toFixed(0)}%`;
  return String(value);
}
