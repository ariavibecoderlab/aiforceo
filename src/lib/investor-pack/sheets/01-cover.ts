/**
 * Tab 01 — COVER & REQUEST CHECKLIST
 * Layout-only sheet (no formulas). Mirrors the BBGB v6 source structure.
 */

import type { Workbook, Worksheet, Row } from "exceljs";
import type { InvestorPackSpec } from "../spec";
import {
  STYLE_TITLE,
  STYLE_SUBTITLE,
  STYLE_H_NAVY,
  STYLE_H_GREEN,
  STYLE_H_LIGHT_BLUE,
  STYLE_H_LIGHT_ORANGE,
  STYLE_BODY_TEXT,
  STYLE_SECTION_LABEL,
  STYLE_COL_HEADER,
  STYLE_TABLE_BODY,
} from "../styles";

export function buildCoverSheet(
  wb: Workbook,
  spec: InvestorPackSpec,
): Worksheet {
  const ws = wb.addWorksheet("01 COVER & REQUEST CHECKLIST", {
    properties: { defaultRowHeight: 18 },
    views: [{ state: "frozen", ySplit: 3 }],
  });

  // Column widths — A wide label, B-D for content
  ws.columns = [{ width: 42 }, { width: 70 }, { width: 16 }, { width: 12 }];

  // ── Row 1: Title bar ──────────────────────────────────────────────────────
  const r1 = ws.addRow([spec.cover.title]);
  ws.mergeCells(r1.number, 1, r1.number, 4);
  r1.height = 28;
  styleRow(r1, STYLE_TITLE);

  // ── Row 2: Subtitle ───────────────────────────────────────────────────────
  const r2 = ws.addRow([spec.cover.subtitle]);
  ws.mergeCells(r2.number, 1, r2.number, 4);
  r2.height = 22;
  styleRow(r2, STYLE_SUBTITLE);

  blank(ws);

  // ── Highlights section ────────────────────────────────────────────────────
  section(ws, "🏆 KEY INVESTMENT HIGHLIGHTS", STYLE_H_NAVY);
  for (const h of spec.highlights) {
    const r = ws.addRow([`${h.icon} ${h.label}`, h.detail]);
    r.getCell(1).style = {
      ...STYLE_BODY_TEXT,
      font: { ...STYLE_BODY_TEXT.font, bold: true },
    };
    r.getCell(2).style = STYLE_BODY_TEXT;
    r.height = 30;
  }
  blank(ws);

  // ── Executive Summary ─────────────────────────────────────────────────────
  section(ws, "EXECUTIVE SUMMARY", STYLE_H_NAVY);
  for (const { label, value } of spec.cover.executiveSummary) {
    const r = ws.addRow([label, value]);
    r.getCell(1).style = STYLE_SECTION_LABEL;
    r.getCell(2).style = STYLE_BODY_TEXT;
  }
  blank(ws);

  // ── Structural Disclosures ────────────────────────────────────────────────
  section(
    ws,
    "⚠️ STRUCTURAL DISCLOSURES (For Investor Awareness)",
    STYLE_H_LIGHT_ORANGE,
  );
  for (const d of spec.cover.structuralDisclosures) {
    const r = ws.addRow([d.label, d.detail]);
    r.getCell(1).style = {
      ...STYLE_BODY_TEXT,
      font: { ...STYLE_BODY_TEXT.font, bold: true },
    };
    r.getCell(2).style = STYLE_BODY_TEXT;
    r.height = 36;
  }
  blank(ws);

  // ── Investor Request Checklist (table) ────────────────────────────────────
  section(ws, "INVESTOR REQUEST CHECKLIST — STATUS", STYLE_H_GREEN);
  const head = ws.addRow(["No.", "Investor Request", "Status", "Tab"]);
  for (let c = 1; c <= 4; c++) head.getCell(c).style = STYLE_COL_HEADER;
  for (const item of spec.cover.checklist) {
    const r = ws.addRow([item.no, item.request, item.status, item.tab]);
    r.getCell(1).style = {
      ...STYLE_TABLE_BODY,
      alignment: { horizontal: "center" },
    };
    r.getCell(2).style = STYLE_TABLE_BODY;
    r.getCell(3).style = STYLE_TABLE_BODY;
    r.getCell(4).style = {
      ...STYLE_TABLE_BODY,
      alignment: { horizontal: "center" },
    };
    r.height = 24;
  }
  blank(ws);

  // ── Documents On File ─────────────────────────────────────────────────────
  section(ws, "DOCUMENTS ON FILE — AVAILABLE ON REQUEST", STYLE_H_LIGHT_BLUE);
  for (const d of spec.cover.documentsOnFile) {
    const r = ws.addRow([d.label]);
    ws.mergeCells(r.number, 1, r.number, 4);
    r.getCell(1).style = STYLE_BODY_TEXT;
  }
  blank(ws);

  // ── Outstanding Items ─────────────────────────────────────────────────────
  section(
    ws,
    "STILL OUTSTANDING (Management to Resolve)",
    STYLE_H_LIGHT_ORANGE,
  );
  for (const s of spec.cover.outstanding) {
    const r = ws.addRow([`• ${s}`]);
    ws.mergeCells(r.number, 1, r.number, 4);
    r.getCell(1).style = STYLE_BODY_TEXT;
  }
  blank(ws);

  // ── Confidentiality & Disclaimer ──────────────────────────────────────────
  section(ws, "CONFIDENTIALITY & DISCLAIMER", STYLE_H_NAVY);
  spec.cover.confidentiality.forEach((line, i) => {
    const r = ws.addRow([`${i + 1}. ${line}`]);
    ws.mergeCells(r.number, 1, r.number, 4);
    r.getCell(1).style = STYLE_BODY_TEXT;
    r.height = 30;
  });

  return ws;
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function blank(ws: Worksheet): void {
  ws.addRow([]);
}

function section(
  ws: Worksheet,
  label: string,
  style: typeof STYLE_H_NAVY,
): Row {
  const r = ws.addRow([label]);
  ws.mergeCells(r.number, 1, r.number, 4);
  r.height = 22;
  styleRow(r, style);
  return r;
}

function styleRow(r: Row, style: Partial<import("exceljs").Style>): void {
  r.eachCell({ includeEmpty: true }, (cell) => {
    cell.style = { ...style };
  });
}
