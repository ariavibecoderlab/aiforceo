/**
 * One-pager investor brief — rendered from an InvestorPackSpec as
 * markdown, then handed to the existing exportPDF helper (which opens a
 * print dialog with branded styling).
 *
 * Client-only. Uses the same pattern as src/lib/export.ts.
 */

import type { InvestorPackSpec } from "./spec";
import { exportPDF } from "@/lib/export";

const fmt = (n: number, cur: string) => {
  if (Math.abs(n) >= 1_000_000) return `${cur} ${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `${cur} ${(n / 1_000).toFixed(0)}K`;
  return `${cur} ${n.toLocaleString()}`;
};

/** Build the markdown that feeds exportPDF. */
export function buildInvestorBriefMarkdown(spec: InvestorPackSpec): string {
  const c = spec.company;
  const cur = c.currency;
  const cum =
    spec.investment.valuation.cumulativeEbitda > 0
      ? `${cur} ${(spec.investment.valuation.cumulativeEbitda / 1_000_000).toFixed(1)}M cumulative EBITDA`
      : "";

  const parts: string[] = [];

  // ── Header ────────────────────────────────────────────────────────────────
  parts.push(`# ${c.legalName}`);
  parts.push(
    `**${c.industry}** · Founded ${c.foundedYear} · IPO Target ${c.ipoTarget}`,
  );
  parts.push("");

  // ── Highlights ────────────────────────────────────────────────────────────
  if (spec.highlights.length) {
    parts.push("## Investment Highlights");
    for (const h of spec.highlights) {
      parts.push(`- **${h.icon} ${h.label}** — ${h.detail}`);
    }
    parts.push("");
  }

  // ── Snapshot table ────────────────────────────────────────────────────────
  if (spec.investment.snapshot.length) {
    parts.push("## Snapshot");
    parts.push("");
    parts.push("| Metric | Value |");
    parts.push("|---|---|");
    for (const s of spec.investment.snapshot.slice(0, 10)) {
      parts.push(`| ${esc(s.label)} | ${esc(s.value)} |`);
    }
    parts.push("");
  }

  // ── Track record ─────────────────────────────────────────────────────────
  if (spec.trackRecord.years.length) {
    parts.push("## Recent Track Record");
    parts.push("");
    parts.push(`| FY | Revenue | EBITDA | Margin |`);
    parts.push(`|---|---:|---:|---:|`);
    const recent = spec.trackRecord.years.slice(-6);
    for (const y of recent) {
      const margin = y.revenue
        ? `${((y.ebitda / y.revenue) * 100).toFixed(1)}%`
        : "—";
      parts.push(
        `| ${y.year} | ${fmt(y.revenue, cur)} | ${fmt(y.ebitda, cur)} | ${margin} |`,
      );
    }
    parts.push("");
  }

  // ── Valuation ────────────────────────────────────────────────────────────
  if (spec.investment.valuation.scenarios.length) {
    parts.push("## Valuation Scenarios");
    parts.push(
      `*EV/EBITDA multiple on ${fmt(spec.investment.valuation.ebitdaBase, cur)} forecast EBITDA${cum ? " · " + cum : ""}.*`,
    );
    parts.push("");
    parts.push("| Scenario | Multiple | Implied EV |");
    parts.push("|---|---:|---:|");
    for (const sc of spec.investment.valuation.scenarios) {
      const ev = spec.investment.valuation.ebitdaBase * sc.multiple;
      parts.push(
        `| ${esc(sc.name)} | ${sc.multiple.toFixed(1)}x | ${fmt(ev, cur)} |`,
      );
    }
    parts.push("");
  }

  // ── Thesis ───────────────────────────────────────────────────────────────
  if (spec.investment.thesis.length) {
    parts.push("## Why This Deal");
    spec.investment.thesis.forEach((t, i) => {
      parts.push(`${i + 1}. **${t.label}** — ${t.detail}`);
    });
    parts.push("");
  }

  // ── Risks ────────────────────────────────────────────────────────────────
  if (spec.investment.risks.length) {
    parts.push("## Key Risks & Mitigations");
    parts.push("");
    parts.push("| Risk | Severity | Mitigation |");
    parts.push("|---|---|---|");
    for (const r of spec.investment.risks) {
      parts.push(
        `| ${esc(r.risk)} | **${r.severity}** | ${esc(r.mitigation)} |`,
      );
    }
    parts.push("");
  }

  // ── Quote ────────────────────────────────────────────────────────────────
  if (spec.investment.quote) {
    parts.push(`> *"${spec.investment.quote}"*`);
  }

  return parts.join("\n");
}

/** Open a print dialog (save-as-PDF) populated with the brief. */
export function exportInvestorBriefPDF(spec: InvestorPackSpec): void {
  const md = buildInvestorBriefMarkdown(spec);
  exportPDF(md, {
    agentName: "Investor Brief",
    agentTitle: `${spec.company.shortName} · DD Pack ${spec.version}`,
    workspaceName: spec.company.legalName,
  });
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function esc(s: string): string {
  return s.replace(/\|/g, "\\|");
}
