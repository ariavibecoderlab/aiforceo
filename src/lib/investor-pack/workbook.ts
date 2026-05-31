/**
 * Workbook orchestrator — assembles all 10 tabs from an InvestorPackSpec
 * and returns a Blob the browser can download.
 *
 * IMPORTANT: This module is CLIENT-ONLY. ExcelJS is heavy (~900KB) and
 * depends on Node-style streams; never import it server-side on Workers.
 * Call generateInvestorPack() inside a "use client" component.
 */

import type { InvestorPackSpec } from "./spec";
import { buildCoverSheet } from "./sheets/01-cover";
import { buildTrackRecordSheet } from "./sheets/02-track-record";
import { buildFyMgmtAccountsSheet } from "./sheets/03-fy-mgmt-accounts";
import { buildQuarterMgmtAccountsSheet } from "./sheets/04-q-mgmt-accounts";
import { buildStructureSheet } from "./sheets/05-structure";
import { buildStatutorySheet } from "./sheets/06-statutory";
import { buildAssetsSheet } from "./sheets/07-assets";
import { buildProjectionSheet } from "./sheets/08-projection";
import { buildCashflowSheet } from "./sheets/09-cashflow";
import { buildInvestmentSummarySheet } from "./sheets/10-summary";

export async function generateInvestorPack(
  spec: InvestorPackSpec,
): Promise<Blob> {
  // Dynamic import so ExcelJS is split out of the main bundle and only
  // loads when a user actually generates a pack.
  const ExcelJS = (await import("exceljs")).default;

  const wb = new ExcelJS.Workbook();
  wb.creator = "AIforCEO — AI CFO";
  wb.created = new Date(spec.generatedAt);
  wb.modified = new Date(spec.generatedAt);
  wb.title = `${spec.company.shortName} — Investor Due Diligence Pack`;
  wb.company = spec.company.legalName;

  // Build sheets in tab order. Tab 09 depends on Tab 08's NPAT row number.
  buildCoverSheet(wb, spec);
  buildTrackRecordSheet(wb, spec);
  buildFyMgmtAccountsSheet(wb, spec);
  buildQuarterMgmtAccountsSheet(wb, spec); // null-safe if no Q data
  buildStructureSheet(wb, spec);
  buildStatutorySheet(wb, spec);
  buildAssetsSheet(wb, spec);
  const projection = buildProjectionSheet(wb, spec);
  buildCashflowSheet(wb, spec, projection);
  buildInvestmentSummarySheet(wb, spec);

  // Render to ArrayBuffer → Blob
  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/** Trigger a browser download for the generated workbook. */
export function downloadInvestorPack(spec: InvestorPackSpec, blob: Blob): void {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `${spec.company.shortName}_Investor_Pack_${spec.version}_${date}.xlsx`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
