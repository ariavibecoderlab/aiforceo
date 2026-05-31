"use server";

/**
 * Investor Pack server actions:
 *   - generateInvestorPackNarrative — call AI CFO to fill the narrative layer
 *   - mergeNarrativeIntoSpec — merge AI output into a base (hard-numbers) spec
 *   - getInvestorPackSpec — fetch the workspace's saved spec
 *   - saveInvestorPackSpec — persist a spec to Supabase
 *   - seedInvestorPackSpec — seed a workspace with the BBGB sample
 *   - regenerateAndSave — one-shot: enrich + persist + mark generated_at
 *
 * Numbers are NEVER hallucinated. AI fills only the narrative layer; hard
 * data flows in untouched.
 */

import { getAnthropic, ANTHROPIC_MODEL } from "@/lib/anthropic";
import { requireUser, requireWorkspaceOwner } from "@/lib/auth/require";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { BBGB_SPEC } from "@/lib/investor-pack/samples/bbgb";
import type { InvestorPackSpec } from "@/lib/investor-pack/spec";

// ── The narrative subset the AI fills in ────────────────────────────────────
export interface NarrativeFields {
  highlights: InvestorPackSpec["highlights"];
  coverDisclosures: InvestorPackSpec["cover"]["structuralDisclosures"];
  trackRecordInsights: InvestorPackSpec["trackRecord"]["insights"];
  fyMgmtInsights: { label: string; detail: string }[];
  qMgmtInsights: { label: string; detail: string }[];
  statutoryImplications: InvestorPackSpec["statutory"]["strategicImplications"];
  assetNotes: string[];
  projectionNotes: InvestorPackSpec["projectionNotes"];
  cashflowInsights: InvestorPackSpec["cashflow"]["insights"];
  thesis: InvestorPackSpec["investment"]["thesis"];
  risks: InvestorPackSpec["investment"]["risks"];
  quote: string;
}

// Hard data the AI gets as INPUT (so it doesn't invent numbers)
export interface HardData {
  legalName: string;
  industry: string;
  foundedYear: number;
  currency: string;
  ipoTarget: string;
  trackRecord: {
    year: number | string;
    revenue: number;
    ebitda: number;
  }[];
  fyLatestPeriod: string;
  fyLatestRevenue: number;
  fyLatestEbitda: number;
  qLatestPeriod?: string;
  qLatestRevenue?: number;
  qLatestEbitda?: number;
  projectionEbitdaBase: number;
  projectionYears: string[];
  /** Anything else the workspace owner wants in scope: ownership, statutory exposure, etc. */
  freeFormContext: string;
}

const SYSTEM_PROMPT = `You are Felix, the AI CFO of AIforCEO — generating the narrative layer of a pre-IPO investor due-diligence pack.

YOUR JOB
You will receive structured hard data (years of revenue/EBITDA, latest mgmt accounts, projection inputs, free-form context). You will ONLY produce the narrative blocks — written analysis that frames those numbers for an institutional investor.

ABSOLUTE RULES
1. NEVER invent or alter numbers. Quote only figures present in the hard data. If you need a number that isn't there, use a vague description ("substantial cash position", "strong EBITDA recovery") rather than making one up.
2. Currency is whatever the hard data uses. Don't switch units.
3. Write like a Malaysian/Asian capital markets analyst. Direct, evidence-led, no fluff. Specific numbers > adjectives.
4. Highlights and disclosures are SHORT (one-line label + ~20-30 word detail). Thesis/risk items can be 1-2 sentences.
5. Risk severity must be one of HIGH | MEDIUM | LOW.
6. Each thesis point earns its place — no marketing speak ("world-class", "best-in-class", "industry-leading" are banned).
7. The closing quote is one memorable sentence that captures the core story.

OUTPUT
You must respond with a single JSON object that matches the NarrativeFields schema below — nothing else, no preamble, no markdown fence.

SCHEMA
{
  "highlights": [{ "icon": "📊", "label": string, "detail": string }],
  "coverDisclosures": [{ "label": string, "detail": string }],
  "trackRecordInsights": [{ "label": string, "detail": string }],
  "fyMgmtInsights": [{ "label": string, "detail": string }],
  "qMgmtInsights": [{ "label": string, "detail": string }],
  "statutoryImplications": [{ "label": string, "detail": string }],
  "assetNotes": [string],
  "projectionNotes": [{ "label": string, "detail": string }],
  "cashflowInsights": [{ "label": string, "detail": string }],
  "thesis": [{ "label": string, "detail": string }],
  "risks": [{ "risk": string, "severity": "HIGH"|"MEDIUM"|"LOW", "mitigation": string }],
  "quote": string
}

QUANTITY GUIDANCE
- highlights: 5-7
- coverDisclosures: 2-4 (only material risks worth proactive disclosure)
- trackRecordInsights, fyMgmtInsights, qMgmtInsights, cashflowInsights: 3-5 each
- statutoryImplications, projectionNotes: 4-6 each
- assetNotes: 3-5 short notes
- thesis: 5-7 ranked points
- risks: 5-8 — must cover concentration, regulatory, dependency, financial, market
`;

const EMPTY_NARRATIVE: NarrativeFields = {
  highlights: [],
  coverDisclosures: [],
  trackRecordInsights: [],
  fyMgmtInsights: [],
  qMgmtInsights: [],
  statutoryImplications: [],
  assetNotes: [],
  projectionNotes: [],
  cashflowInsights: [],
  thesis: [],
  risks: [],
  quote: "",
};

/**
 * Call Claude to generate the narrative layer. Hard numbers in `data` are
 * passed verbatim — the model is instructed not to invent or change them.
 */
export async function generateInvestorPackNarrative(
  data: HardData,
): Promise<
  { ok: true; narrative: NarrativeFields } | { ok: false; error: string }
> {
  // Verify the caller owns a workspace before burning AI tokens
  try {
    await requireWorkspaceOwner();
  } catch {
    return { ok: false, error: "Sign in required" };
  }

  const client = getAnthropic();

  try {
    const resp = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 6000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Hard data for ${data.legalName}:\n\n${JSON.stringify(data, null, 2)}\n\nProduce the NarrativeFields JSON now.`,
        },
      ],
    });

    const text = resp.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { text: string }).text)
      .join("");

    const parsed = extractJson(text);
    if (!parsed) {
      return {
        ok: false,
        error: "AI response did not contain valid JSON. Try regenerating.",
      };
    }
    const validated = validateNarrative(parsed);
    return { ok: true, narrative: validated };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "AI generation failed",
    };
  }
}

/** Merge AI narrative into a base spec (hard numbers) to produce the full spec. */
export async function mergeNarrativeIntoSpec(
  base: InvestorPackSpec,
  narrative: NarrativeFields,
): Promise<InvestorPackSpec> {
  return {
    ...base,
    highlights: narrative.highlights.length
      ? narrative.highlights
      : base.highlights,
    cover: {
      ...base.cover,
      structuralDisclosures: narrative.coverDisclosures.length
        ? narrative.coverDisclosures
        : base.cover.structuralDisclosures,
    },
    trackRecord: {
      ...base.trackRecord,
      insights: narrative.trackRecordInsights.length
        ? narrative.trackRecordInsights
        : base.trackRecord.insights,
    },
    mgmtAccounts: {
      fyLatest: {
        ...base.mgmtAccounts.fyLatest,
        insights: narrative.fyMgmtInsights.length
          ? narrative.fyMgmtInsights
          : base.mgmtAccounts.fyLatest.insights,
      },
      quarterLatest: base.mgmtAccounts.quarterLatest
        ? {
            ...base.mgmtAccounts.quarterLatest,
            insights: narrative.qMgmtInsights.length
              ? narrative.qMgmtInsights
              : base.mgmtAccounts.quarterLatest.insights,
          }
        : undefined,
    },
    statutory: {
      ...base.statutory,
      strategicImplications: narrative.statutoryImplications.length
        ? narrative.statutoryImplications
        : base.statutory.strategicImplications,
    },
    assets: {
      ...base.assets,
      notes: narrative.assetNotes.length
        ? narrative.assetNotes
        : base.assets.notes,
    },
    projectionNotes: narrative.projectionNotes.length
      ? narrative.projectionNotes
      : base.projectionNotes,
    cashflow: {
      ...base.cashflow,
      insights: narrative.cashflowInsights.length
        ? narrative.cashflowInsights
        : base.cashflow.insights,
    },
    investment: {
      ...base.investment,
      thesis: narrative.thesis.length
        ? narrative.thesis
        : base.investment.thesis,
      risks: narrative.risks.length ? narrative.risks : base.investment.risks,
      quote: narrative.quote || base.investment.quote,
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
//  Persistence: Supabase-backed spec per workspace
// ────────────────────────────────────────────────────────────────────────────

interface InvestorPackRow {
  workspace_id: string;
  spec: InvestorPackSpec;
  seeded_from: string | null;
  ai_narrative_at: string | null;
  updated_at: string;
}

/** Read the saved spec for a workspace (caller must own the workspace). */
export async function getInvestorPackSpec(
  workspaceId: string,
): Promise<InvestorPackRow | null> {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();

  // Verify ownership
  const { data: ws } = await admin
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!ws) return null;

  const { data } = await admin
    .from("investor_pack_specs")
    .select("workspace_id, spec, seeded_from, ai_narrative_at, updated_at")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  return (data ?? null) as InvestorPackRow | null;
}

/** Upsert a spec for a workspace. */
export async function saveInvestorPackSpec(
  workspaceId: string,
  spec: InvestorPackSpec,
  meta?: { seededFrom?: string; aiGenerated?: boolean },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { user } = await requireWorkspaceOwner(workspaceId);
  const admin = createSupabaseAdminClient();

  const updates: Record<string, unknown> = {
    workspace_id: workspaceId,
    spec,
    updated_at: new Date().toISOString(),
  };
  if (meta?.seededFrom) updates.seeded_from = meta.seededFrom;
  if (meta?.aiGenerated) updates.ai_narrative_at = new Date().toISOString();

  const { error } = await admin
    .from("investor_pack_specs")
    .upsert(updates, { onConflict: "workspace_id" });

  if (error) return { ok: false, error: error.message };
  // Stripe lint workaround: reference user so the var is used in older configs
  void user;
  return { ok: true };
}

/** Seed a workspace with the BBGB sample so the owner can preview before
 *  customizing. Use "blank" to clear. */
export async function seedInvestorPackSpec(
  workspaceId: string,
  source: "bbgb" | "blank",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { user } = await requireWorkspaceOwner(workspaceId);

  const spec: InvestorPackSpec =
    source === "bbgb"
      ? { ...BBGB_SPEC, generatedAt: new Date().toISOString() }
      : makeBlankSpec();

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("investor_pack_specs").upsert(
    {
      workspace_id: workspaceId,
      spec,
      seeded_from: source,
      ai_narrative_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id" },
  );

  if (error) return { ok: false, error: error.message };
  void user;
  return { ok: true };
}

/**
 * One-shot orchestration used by the UI:
 *   1. Pull current spec
 *   2. Extract hard data
 *   3. Call AI CFO for narrative
 *   4. Merge + save
 *   5. Return the enriched spec
 */
export async function regenerateAndSave(
  workspaceId: string,
): Promise<
  { ok: true; spec: InvestorPackSpec } | { ok: false; error: string }
> {
  const row = await getInvestorPackSpec(workspaceId);
  if (!row) {
    return {
      ok: false,
      error: "No spec found — seed the pack first (BBGB sample or blank).",
    };
  }
  const base = row.spec;
  const hardData = extractHardData(base);
  const result = await generateInvestorPackNarrative(hardData);
  if (!result.ok) return result;
  const enriched = await mergeNarrativeIntoSpec(base, result.narrative);
  const saved = await saveInvestorPackSpec(workspaceId, enriched, {
    aiGenerated: true,
  });
  if (!saved.ok) return saved;
  return { ok: true, spec: enriched };
}

/** Pull the hard-number facets out of an existing spec to feed the AI. */
function extractHardData(spec: InvestorPackSpec): HardData {
  return {
    legalName: spec.company.legalName,
    industry: spec.company.industry,
    foundedYear: spec.company.foundedYear,
    currency: spec.company.currency,
    ipoTarget: spec.company.ipoTarget,
    trackRecord: spec.trackRecord.years.map((y) => ({
      year: y.year,
      revenue: y.revenue,
      ebitda: y.ebitda,
    })),
    fyLatestPeriod: spec.mgmtAccounts.fyLatest.period,
    fyLatestRevenue: spec.mgmtAccounts.fyLatest.rows.find(
      (r) => r.label === "Revenue",
    )?.values
      ? Object.values(
          spec.mgmtAccounts.fyLatest.rows.find((r) => r.label === "Revenue")!
            .values,
        ).reduce((a, b) => a + b, 0)
      : 0,
    fyLatestEbitda: 0, // can be derived; leave 0 to keep AI honest
    qLatestPeriod: spec.mgmtAccounts.quarterLatest?.period,
    qLatestRevenue: undefined,
    qLatestEbitda: undefined,
    projectionEbitdaBase: spec.investment.valuation.ebitdaBase,
    projectionYears: spec.projection.years,
    freeFormContext: spec.cover.subtitle,
  };
}

function makeBlankSpec(): InvestorPackSpec {
  // Returns a minimal, valid spec. The owner is expected to edit it.
  return {
    version: "v1",
    generatedAt: new Date().toISOString(),
    company: {
      legalName: "Your Company Sdn Bhd",
      shortName: "Company",
      industry: "—",
      foundedYear: new Date().getFullYear() - 5,
      geography: "—",
      scale: "—",
      ipoTarget: "—",
      currency: "RM",
      locale: "en-MY",
    },
    cover: {
      title: "INVESTOR DUE DILIGENCE PACK",
      subtitle: "Generated by AIforCEO — AI CFO",
      executiveSummary: [],
      structuralDisclosures: [],
      checklist: [],
      documentsOnFile: [],
      outstanding: [],
      confidentiality: [
        "Confidential — intended for named recipient only.",
        "Figures based on internal management accounts.",
      ],
    },
    highlights: [],
    trackRecord: {
      subtitle: "",
      years: [],
      perEntityRevenue: [],
      perEntityEbitda: [],
      auditAvailability: [],
      insights: [],
      sources: "",
    },
    mgmtAccounts: {
      fyLatest: {
        period: "FY",
        subtitle: "",
        headline: "",
        entityCodes: [],
        totalLabel: "GROUP TOTAL",
        rows: [],
        notes: [],
        insights: [],
      },
    },
    structure: { phases: [], entities: [], notes: [] },
    statutory: {
      criticalNote: "",
      summary: [],
      epfRows: [],
      relatedPartyEpf: [],
      lhdn: [],
      strategicImplications: [],
    },
    assets: {
      directAssets: [],
      transferable: [],
      roadmap: [],
      propertyArrangement: [],
      notes: [],
    },
    projection: {
      years: ["FY1", "FY2", "FY3", "FY4", "FY5"],
      drivers: [],
      otherRevenueLabel: "Other Revenue",
      otherRevenueByYear: [0, 0, 0, 0, 0],
      opexByYear: [0, 0, 0, 0, 0],
      daByYear: [0, 0, 0, 0, 0],
      financeCostsByYear: [0, 0, 0, 0, 0],
      taxRateByYear: [0, 0.15, 0.2, 0.24, 0.24],
      cogsPctOfRevenue: 0.115,
    },
    projectionNotes: [],
    cashflow: { openingCash: 0, lines: [], insights: [] },
    investment: {
      snapshot: [],
      valuation: {
        methodology: "EV/EBITDA multiple on FY+1 forecast EBITDA.",
        ebitdaBase: 0,
        cumulativeEbitda: 0,
        scenarios: [
          { name: "Conservative", multiple: 4.0, comment: "Bottom of range." },
          { name: "Base", multiple: 5.5, comment: "Mid-range." },
          { name: "Premium", multiple: 8.0, comment: "Growth premium." },
        ],
      },
      thesis: [],
      risks: [],
      quote: "",
    },
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function extractJson(text: string): unknown {
  // Allow the model to wrap JSON in ```json``` fences just in case
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence?.[1] ?? text;
  // Find the outermost {...}
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  const json = raw.slice(start, end + 1);
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function validateNarrative(parsed: unknown): NarrativeFields {
  const out: NarrativeFields = { ...EMPTY_NARRATIVE };
  if (!parsed || typeof parsed !== "object") return out;
  const p = parsed as Record<string, unknown>;

  const asArrayOf = <T>(v: unknown, isItem: (x: unknown) => x is T): T[] =>
    Array.isArray(v) ? v.filter(isItem) : [];

  const isLabelDetail = (x: unknown): x is { label: string; detail: string } =>
    !!x &&
    typeof x === "object" &&
    typeof (x as Record<string, unknown>).label === "string" &&
    typeof (x as Record<string, unknown>).detail === "string";

  const isHighlight = (
    x: unknown,
  ): x is { icon: string; label: string; detail: string } =>
    isLabelDetail(x) && typeof (x as { icon?: unknown }).icon === "string";

  const isRisk = (
    x: unknown,
  ): x is {
    risk: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    mitigation: string;
  } => {
    if (!x || typeof x !== "object") return false;
    const r = x as Record<string, unknown>;
    return (
      typeof r.risk === "string" &&
      (r.severity === "HIGH" ||
        r.severity === "MEDIUM" ||
        r.severity === "LOW") &&
      typeof r.mitigation === "string"
    );
  };

  out.highlights = asArrayOf(p.highlights, isHighlight);
  out.coverDisclosures = asArrayOf(p.coverDisclosures, isLabelDetail);
  out.trackRecordInsights = asArrayOf(p.trackRecordInsights, isLabelDetail);
  out.fyMgmtInsights = asArrayOf(p.fyMgmtInsights, isLabelDetail);
  out.qMgmtInsights = asArrayOf(p.qMgmtInsights, isLabelDetail);
  out.statutoryImplications = asArrayOf(p.statutoryImplications, isLabelDetail);
  out.assetNotes = asArrayOf(
    p.assetNotes,
    (x): x is string => typeof x === "string",
  );
  out.projectionNotes = asArrayOf(p.projectionNotes, isLabelDetail);
  out.cashflowInsights = asArrayOf(p.cashflowInsights, isLabelDetail);
  out.thesis = asArrayOf(p.thesis, isLabelDetail);
  out.risks = asArrayOf(p.risks, isRisk);
  out.quote = typeof p.quote === "string" ? p.quote : "";

  return out;
}
