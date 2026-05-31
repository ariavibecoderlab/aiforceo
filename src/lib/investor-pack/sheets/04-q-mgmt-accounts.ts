/**
 * Tab 04 — QUARTERLY MANAGEMENT ACCOUNTS + Forecast Extrapolation
 * Same per-entity P&L renderer as Tab 03 but with an extra "FY extrapolation"
 * block at the bottom.
 */

import type { Workbook, Worksheet } from "exceljs";
import type { InvestorPackSpec } from "../spec";
import { buildMgmtAccountSheet } from "./mgmt-accounts";

export function buildQuarterMgmtAccountsSheet(
  wb: Workbook,
  spec: InvestorPackSpec,
): Worksheet | null {
  const q = spec.mgmtAccounts.quarterLatest;
  if (!q) return null;

  // Extrapolation block — could be derived; for v1 we pass through plain text
  // values so the AI CFO can write them. For the BBGB sample we hardcode.
  const extrapolation = [
    {
      label: `${q.period} Revenue (Actual)`,
      value: `${spec.company.currency} 43,446,070`,
      note: "44% of typical full year — captures annual registration",
    },
    {
      label: `${q.period} EBITDA (Actual)`,
      value: `${spec.company.currency} 21,428,971`,
      note: "Already exceeds full-year prior period",
    },
    {
      label: "Q2-Q4 Revenue (Estimated)",
      value: `${spec.company.currency} ~54,200,000`,
      note: "Run-rate based on monthly recurring (no Jan spike)",
    },
    {
      label: "Q2-Q4 EBITDA (Estimated)",
      value: `${spec.company.currency} ~8,000,000`,
      note: "OPEX continues across all quarters",
    },
    {
      label: "FY2026F Revenue Total",
      value: `${spec.company.currency} ~97,646,070`,
      note: "Roughly in-line with prior FY",
    },
    {
      label: "FY2026F EBITDA Total",
      value: `${spec.company.currency} ~29,400,000`,
      note: "2.5× prior FY — major step-up year",
    },
    {
      label: "Implied EBITDA Margin",
      value: "~30%",
      note: "Operating leverage kicking in",
    },
    {
      label: "Q1 Contribution to FY EBITDA",
      value: "~73%",
      note: "Annual registration model concentrates profit in Q1",
    },
  ];

  return buildMgmtAccountSheet(wb, `04 ${q.period} MGMT ACCOUNTS`, q, spec, {
    extrapolationLines: extrapolation,
  });
}
