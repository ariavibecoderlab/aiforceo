/**
 * Tab 05 — CORPORATE STRUCTURE
 * Restructuring journey (phases) + entity register + structure notes.
 */

import type { Workbook, Worksheet, Row, Style } from "exceljs";
import type { InvestorPackSpec } from "../spec";
import {
  STYLE_TITLE,
  STYLE_SUBTITLE,
  STYLE_H_NAVY,
  STYLE_H_GREEN,
  STYLE_H_LIGHT_BLUE,
  STYLE_BODY_TEXT,
  STYLE_SECTION_LABEL,
  STYLE_COL_HEADER,
  STYLE_TABLE_BODY,
  STYLE_TABLE_NUM,
  STYLE_SUBTOTAL,
  STYLE_SUBTOTAL_LABEL,
  COLOR,
} from "../styles";

export function buildStructureSheet(
  wb: Workbook,
  spec: InvestorPackSpec,
): Worksheet {
  const ws = wb.addWorksheet("05 CORPORATE STRUCTURE", {
    properties: { defaultRowHeight: 18 },
    views: [{ state: "frozen", ySplit: 3 }],
  });

  const totalCols = 8;
  ws.columns = [
    { width: 5 }, // #
    { width: 12 }, // Code
    { width: 30 }, // Legal name
    { width: 12 }, // BBGB %
    { width: 16 }, // Paid-up
    { width: 16 }, // FY25 Rev
    { width: 36 }, // Function
    { width: 30 }, // Integration status
  ];

  // Title
  const r1 = ws.addRow([
    `${spec.company.shortName} — CORPORATE STRUCTURE (Restructuring in Progress)`,
  ]);
  ws.mergeCells(r1.number, 1, r1.number, totalCols);
  r1.height = 28;
  styleRow(r1, STYLE_TITLE);

  const r2 = ws.addRow([
    "Phase 1 Complete (Subsidiaries Separated) | Phase 2 Pending (Founding-Entity Integration via Investor Capital)",
  ]);
  ws.mergeCells(r2.number, 1, r2.number, totalCols);
  r2.height = 22;
  styleRow(r2, STYLE_SUBTITLE);
  blank(ws);

  // ── Restructuring Journey ─────────────────────────────────────────────────
  section(
    ws,
    `THE RESTRUCTURING JOURNEY (${spec.company.foundedYear} → IPO ${spec.company.ipoTarget})`,
    STYLE_H_NAVY,
    totalCols,
  );
  for (const p of spec.structure.phases) {
    const r = ws.addRow([p.phase, "", p.title, "", "", p.description]);
    ws.mergeCells(r.number, 1, r.number, 2);
    ws.mergeCells(r.number, 3, r.number, 4);
    ws.mergeCells(r.number, 6, r.number, totalCols);
    r.getCell(1).style = {
      ...STYLE_SECTION_LABEL,
      font: { ...STYLE_SECTION_LABEL.font, color: { argb: COLOR.green } },
    };
    r.getCell(3).style = {
      ...STYLE_SECTION_LABEL,
      font: { ...STYLE_SECTION_LABEL.font, bold: true },
    };
    r.getCell(6).style = STYLE_BODY_TEXT;
    r.height = 38;
  }
  blank(ws);

  // ── Entity Register ───────────────────────────────────────────────────────
  section(ws, "CURRENT GROUP ENTITY REGISTER", STYLE_H_GREEN, totalCols);
  const head = ws.addRow([
    "#",
    "Code",
    "Full Legal Name",
    "BBGB %",
    `Paid-Up (${spec.company.currency})`,
    `FY Revenue (${spec.company.currency})`,
    "Primary Function",
    "Integration Status",
  ]);
  head.eachCell({ includeEmpty: false }, (c) => (c.style = STYLE_COL_HEADER));
  head.height = 24;

  let totalPaidUp = 0;
  let totalRevenue = 0;
  for (const e of spec.structure.entities) {
    const r = ws.addRow([
      String(e.rank),
      e.code,
      e.legalName,
      e.ownershipPct,
      e.paidUpCapital ?? "-",
      e.fy25Revenue ?? "-",
      e.primaryFunction,
      e.integrationStatus,
    ]);
    r.getCell(1).style = {
      ...STYLE_TABLE_BODY,
      alignment: { horizontal: "center" },
    };
    r.getCell(2).style = {
      ...STYLE_TABLE_BODY,
      font: { ...STYLE_TABLE_BODY.font, bold: true },
    };
    r.getCell(3).style = STYLE_TABLE_BODY;
    r.getCell(4).style = {
      ...STYLE_TABLE_BODY,
      alignment: { horizontal: "center" },
    };
    r.getCell(5).style =
      e.paidUpCapital == null
        ? { ...STYLE_TABLE_BODY, alignment: { horizontal: "center" } }
        : STYLE_TABLE_NUM;
    r.getCell(6).style =
      e.fy25Revenue == null
        ? { ...STYLE_TABLE_BODY, alignment: { horizontal: "center" } }
        : STYLE_TABLE_NUM;
    r.getCell(7).style = STYLE_TABLE_BODY;
    r.getCell(8).style = STYLE_TABLE_BODY;

    if (e.paidUpCapital) totalPaidUp += e.paidUpCapital;
    if (e.fy25Revenue) totalRevenue += e.fy25Revenue;
  }

  // Total row
  const tr = ws.addRow([
    "",
    "TOTAL",
    "GROUP TOTAL (FY)",
    "",
    totalPaidUp,
    totalRevenue,
    "Aggregated across all subsidiaries",
    "",
  ]);
  tr.getCell(1).style = STYLE_SUBTOTAL_LABEL;
  tr.getCell(2).style = STYLE_SUBTOTAL_LABEL;
  tr.getCell(3).style = STYLE_SUBTOTAL_LABEL;
  tr.getCell(4).style = STYLE_SUBTOTAL_LABEL;
  tr.getCell(5).style = STYLE_SUBTOTAL;
  tr.getCell(6).style = STYLE_SUBTOTAL;
  tr.getCell(7).style = STYLE_SUBTOTAL_LABEL;
  tr.getCell(8).style = STYLE_SUBTOTAL_LABEL;
  blank(ws);

  // ── Structure Notes ───────────────────────────────────────────────────────
  if (spec.structure.notes.length) {
    section(ws, "STRUCTURE NOTES", STYLE_H_LIGHT_BLUE, totalCols);
    spec.structure.notes.forEach((n, i) => {
      const r = ws.addRow([`${i + 1}. ${n}`]);
      ws.mergeCells(r.number, 1, r.number, totalCols);
      r.getCell(1).style = STYLE_BODY_TEXT;
      r.height = 32;
    });
  }

  return ws;
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function blank(ws: Worksheet): void {
  ws.addRow([]);
}

function section(
  ws: Worksheet,
  label: string,
  style: Partial<Style>,
  span: number,
): Row {
  const r = ws.addRow([label]);
  ws.mergeCells(r.number, 1, r.number, span);
  r.height = 22;
  styleRow(r, style);
  return r;
}

function styleRow(r: Row, style: Partial<Style>): void {
  r.eachCell({ includeEmpty: true }, (cell) => {
    cell.style = { ...style };
  });
}
