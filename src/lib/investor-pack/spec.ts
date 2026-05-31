/**
 * InvestorPackSpec — the single typed contract that drives the
 * 10-tab investor due-diligence pack.
 *
 * Numbers in the spec are HARD DATA (from user input, financials, or
 * connectors). Prose blocks (highlights, thesis, risks, disclosures) are
 * AI-written. Formulas are NEVER pre-computed in the spec; the workbook
 * generator emits them so investors can stress-test the model.
 */

// ─── Currency / locale ───────────────────────────────────────────────────────
export type Currency = "RM" | "USD" | "MYR" | "SGD" | "IDR";

// ─── Tab 01 / 10 — narrative blocks ──────────────────────────────────────────
export interface Highlight {
  icon: string; // emoji or short marker
  label: string;
  detail: string;
}

export interface ChecklistItem {
  no: number;
  request: string;
  status: string; // e.g. "✅ READY — ..."
  tab: string;
}

export interface DocumentRef {
  label: string; // e.g. "📋 Knight Frank Property Valuation Report"
}

export interface DisclosureItem {
  label: string;
  detail: string;
}

export interface RiskRow {
  risk: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  mitigation: string;
}

export interface ValuationScenario {
  name: string; // Conservative | Base | Sector Avg | Premium
  multiple: number; // e.g. 4.0 → 4.0x EV/EBITDA
  comment: string;
}

// ─── Tab 02 — 15-Yr Track Record ─────────────────────────────────────────────
export interface YearRow {
  year: number | string; // 2011..2025, then "Q1 2026", "2026F"
  badge?: string; // optional column-header annotation (e.g. "🦠 COVID")
  revenue: number;
  cogs: number;
  opex: number;
  ebitda: number;
  /** Optional narrative for the Investment Summary 10-year snapshot */
  note?: string;
}

export interface PerEntitySeries {
  /** Entity code (e.g. "BBPS") */
  code: string;
  /** Sparse map year→value. Missing years render as "-" */
  byYear: Record<string | number, number | null>;
}

// ─── Tab 03 / 04 — Management Accounts ───────────────────────────────────────
export interface PnlLineItem {
  label: string; // "Revenue", "Less: COGS", ...
  /** Values keyed by entity code; omitted entities render blank */
  values: Record<string, number>;
  /** If true the row is a derived total (formula); generator skips values */
  isFormula?: "grossProfit" | "ebitda" | "sumRow" | "marginPct";
  marginOf?: string; // for marginPct, the label of the numerator row
  marginDen?: string; // for marginPct, the denominator row label (default Revenue)
  emphasis?: "section" | "subtotal" | "total";
}

export interface MgmtAccount {
  period: string; // "FY2025" or "Q1 2026"
  subtitle: string;
  headline: string;
  entityCodes: string[]; // column order, last column is the SUM total
  totalLabel: string; // "GROUP TOTAL"
  rows: PnlLineItem[];
  notes: string[];
  insights: { label: string; detail: string }[];
}

// ─── Tab 05 — Corporate Structure ────────────────────────────────────────────
export interface EntityRow {
  rank: number | "0";
  code: string;
  legalName: string;
  ownershipPct: string; // "100%", "67%", "Pending"
  paidUpCapital: number | null;
  fy25Revenue: number | null;
  primaryFunction: string;
  integrationStatus: string;
}

export interface RestructuringPhase {
  phase: string; // "Phase 1 (2010-2023)"
  title: string;
  description: string;
}

// ─── Tab 06 — EPF / LHDN ─────────────────────────────────────────────────────
export interface EpfRow {
  no: number;
  entity: string;
  period: string;
  outstanding: number;
  penalty: number;
  dividend: number;
  status: string;
  footnote?: string;
}

// ─── Tab 07 — Asset Register ─────────────────────────────────────────────────
export interface DirectAssetRow {
  no: number;
  category: string;
  /** Group total + per-entity columns keyed by entity code */
  amounts: { group: number } & Record<string, number>;
}

export interface TransferableAsset {
  no: number;
  asset: string;
  description: string;
  estValue: number;
  transferable: string; // "✅ YES" | "❌ NO" | "✅ RE-REG" | ...
  mechanism: string;
  targetEntity: string;
  status: string;
}

export interface RoadmapPhase {
  phase: string;
  timing: string;
  action: string;
  owner: string;
  deliverable: string;
  status: string;
}

// ─── Tab 08 — 5-Yr P&L Projection ────────────────────────────────────────────
export interface ProjectionAssumptions {
  /** Years are columns, e.g. ["FY2026","FY2027","FY2028","FY2029","FY2030 (IPO)"] */
  years: string[];
  /** Driver rows — each becomes editable blue cells */
  drivers: {
    label: string;
    values: (number | null)[];
    /** When provided, revenue = students × fee for the paired driver */
    pairWith?: string;
    isFee?: boolean;
  }[];
  /** "Other" revenue line (lump sum, not driver-based) */
  otherRevenueLabel: string;
  otherRevenueByYear: number[];
  /** Operating-expense line — hardcoded base numbers per year (formula NOT used) */
  opexByYear: number[];
  /** Other deductions to flow into the PBT/PAT build */
  daByYear: number[];
  financeCostsByYear: number[];
  /** Tax rate per year (0..1). Generator emits IF(PBT>0,-PBT*rate,0) */
  taxRateByYear: number[];
  /** COGS as percentage of revenue */
  cogsPctOfRevenue: number;
}

// ─── Tab 09 — 5-Yr Cashflow ──────────────────────────────────────────────────
export interface CashflowLine {
  label: string;
  values: number[]; // by year, same length as projection.years
  /** "addback" → adds to operating cashflow; "invest" → investing; "finance" → financing */
  group: "open" | "operating" | "addback" | "invest" | "finance";
}

export interface CashflowSpec {
  openingCash: number;
  /** Extra lines added beyond the P&L-derived NPAT + addback */
  lines: CashflowLine[];
  insights: { label: string; detail: string }[];
}

// ─── Root spec ───────────────────────────────────────────────────────────────
export interface InvestorPackSpec {
  version: string; // "v6"
  generatedAt: string; // ISO

  company: {
    legalName: string;
    shortName: string;
    industry: string;
    foundedYear: number;
    geography: string;
    scale: string;
    ipoTarget: string;
    currency: Currency;
    locale: string; // e.g. "en-MY"
  };

  // Tab 01
  cover: {
    title: string;
    subtitle: string;
    executiveSummary: { label: string; value: string }[];
    structuralDisclosures: DisclosureItem[];
    checklist: ChecklistItem[];
    documentsOnFile: DocumentRef[];
    outstanding: string[];
    confidentiality: string[];
  };
  highlights: Highlight[];

  // Tab 02
  trackRecord: {
    subtitle: string;
    years: YearRow[];
    perEntityRevenue: PerEntitySeries[];
    perEntityEbitda: PerEntitySeries[];
    auditAvailability: {
      entity: string;
      years: Record<string, string>; // "2021"→"✅"
      notes: string;
    }[];
    insights: { label: string; detail: string }[];
    sources: string;
  };

  // Tabs 03, 04
  mgmtAccounts: {
    fyLatest: MgmtAccount;
    quarterLatest?: MgmtAccount;
  };

  // Tab 05
  structure: {
    phases: RestructuringPhase[];
    entities: EntityRow[];
    notes: string[];
  };

  // Tab 06
  statutory: {
    criticalNote: string;
    summary: { label: string; value: string; note: string }[];
    epfRows: EpfRow[];
    relatedPartyEpf: EpfRow[];
    lhdn: { label: string; value: string; note: string }[];
    strategicImplications: { label: string; detail: string }[];
  };

  // Tab 07
  assets: {
    directAssets: DirectAssetRow[];
    transferable: TransferableAsset[];
    roadmap: RoadmapPhase[];
    propertyArrangement: { label: string; detail: string }[];
    notes: string[];
  };

  // Tab 08
  projection: ProjectionAssumptions;
  projectionNotes: { label: string; detail: string }[];

  // Tab 09
  cashflow: CashflowSpec;

  // Tab 10
  investment: {
    snapshot: { label: string; value: string }[];
    valuation: {
      methodology: string;
      ebitdaBase: number;
      cumulativeEbitda: number; // used as comparison baseline
      scenarios: ValuationScenario[];
    };
    thesis: { label: string; detail: string }[];
    risks: RiskRow[];
    quote: string;
  };
}
