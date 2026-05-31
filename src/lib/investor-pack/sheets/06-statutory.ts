/**
 * Tab 06 — EPF / LHDN STATUTORY LIABILITY
 * Headline summary + EPF detail table + LHDN section + related-party
 * disclosure + strategic implications. EPF totals use live SUM formulas.
 */

import type { Workbook, Worksheet, Row, Style } from "exceljs";
import type { InvestorPackSpec, EpfRow } from "../spec";
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
  STYLE_TABLE_NUM,
  STYLE_SUBTOTAL,
  STYLE_SUBTOTAL_LABEL,
  COLOR,
} from "../styles";

const colLetter = (n: number) => {
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

export function buildStatutorySheet(
  wb: Workbook,
  spec: InvestorPackSpec,
): Worksheet {
  const ws = wb.addWorksheet("06 EPF LIABILITY", {
    properties: { defaultRowHeight: 18 },
    views: [{ state: "frozen", ySplit: 3 }],
  });

  const totalCols = 8;
  ws.columns = [
    { width: 5 }, // #
    { width: 36 }, // Entity
    { width: 22 }, // Period
    { width: 16 }, // Outstanding
    { width: 14 }, // Penalty
    { width: 14 }, // Dividend
    { width: 16 }, // Total
    { width: 28 }, // Status
  ];

  // Title
  const r1 = ws.addRow([
    `EPF & LHDN STATUTORY LIABILITY — ${spec.company.shortName} EDUCATION GROUP`,
  ]);
  ws.mergeCells(r1.number, 1, r1.number, totalCols);
  r1.height = 28;
  styleRow(r1, STYLE_TITLE);

  const r2 = ws.addRow([
    "Direct Liability + Related-Party Disclosure for Investor Awareness",
  ]);
  ws.mergeCells(r2.number, 1, r2.number, totalCols);
  r2.height = 22;
  styleRow(r2, STYLE_SUBTITLE);
  blank(ws);

  // ── Critical Note ─────────────────────────────────────────────────────────
  if (spec.statutory.criticalNote) {
    const cr = ws.addRow([
      `🔴 CRITICAL — EPF LEGAL STATUS BLOCKS PROPERTY RESTRUCTURING\n${spec.statutory.criticalNote}`,
    ]);
    ws.mergeCells(cr.number, 1, cr.number, totalCols);
    cr.getCell(1).style = {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLOR.lightOrange },
      },
      font: {
        name: "Arial",
        size: 10,
        bold: true,
        color: { argb: COLOR.lossRed },
      },
      alignment: { horizontal: "left", vertical: "middle", wrapText: true },
      border: {
        top: { style: "medium", color: { argb: COLOR.lossRed } },
        left: { style: "medium", color: { argb: COLOR.lossRed } },
        right: { style: "medium", color: { argb: COLOR.lossRed } },
        bottom: { style: "medium", color: { argb: COLOR.lossRed } },
      },
    };
    cr.height = 72;
    blank(ws);
  }

  // ── Summary block ─────────────────────────────────────────────────────────
  section(ws, "HEADLINE SUMMARY — STATUTORY EXPOSURE", STYLE_H_NAVY, totalCols);
  for (const s of spec.statutory.summary) {
    const r = ws.addRow([s.label, "", "", s.value, "", "", s.note]);
    ws.mergeCells(r.number, 1, r.number, 3);
    ws.mergeCells(r.number, 4, r.number, 6);
    ws.mergeCells(r.number, 7, r.number, totalCols);
    r.getCell(1).style = STYLE_SECTION_LABEL;
    r.getCell(4).style = {
      ...STYLE_SUBTOTAL,
      alignment: { horizontal: "center" },
      numFmt: "General",
    };
    r.getCell(7).style = {
      ...STYLE_BODY_TEXT,
      font: { ...STYLE_BODY_TEXT.font, italic: true, size: 9 },
    };
    r.height = 22;
  }
  blank(ws);

  // ── EPF Detail Table ──────────────────────────────────────────────────────
  section(
    ws,
    `A. DIRECT EPF DETAIL (BBGB Education Group, ${spec.company.currency})`,
    STYLE_H_GREEN,
    totalCols,
  );
  const head = ws.addRow([
    "#",
    "Entity (BBGB Subsidiary)",
    "Contribution Period",
    "Outstanding",
    "Penalty",
    "Dividend",
    "Total",
    "Status",
  ]);
  head.eachCell({ includeEmpty: false }, (c) => (c.style = STYLE_COL_HEADER));
  head.height = 24;

  const firstRow = ws.rowCount + 1;
  for (const e of spec.statutory.epfRows) {
    renderEpfRow(ws, e);
    if (e.footnote) {
      const fr = ws.addRow([
        "",
        `  Note: ${e.footnote}`,
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      ws.mergeCells(fr.number, 2, fr.number, totalCols);
      fr.getCell(2).style = {
        ...STYLE_BODY_TEXT,
        font: {
          ...STYLE_BODY_TEXT.font,
          italic: true,
          size: 9,
          color: { argb: COLOR.navy },
        },
      };
    }
  }
  const lastRow = ws.rowCount;

  // SUM totals row
  const totRow = ws.addRow([
    "",
    "EDUCATION GROUP — EPF TOTAL",
    "",
    { formula: `SUM(D${firstRow}:D${lastRow})` },
    { formula: `SUM(E${firstRow}:E${lastRow})` },
    { formula: `SUM(F${firstRow}:F${lastRow})` },
    { formula: `SUM(G${firstRow}:G${lastRow})` },
    "",
  ]);
  ws.mergeCells(totRow.number, 1, totRow.number, 3);
  totRow.getCell(1).style = STYLE_SUBTOTAL_LABEL;
  for (let c = 4; c <= 7; c++) totRow.getCell(c).style = STYLE_SUBTOTAL;
  totRow.getCell(8).style = STYLE_SUBTOTAL_LABEL;
  totRow.height = 24;
  blank(ws);

  // ── LHDN Section ──────────────────────────────────────────────────────────
  if (spec.statutory.lhdn.length) {
    section(ws, "B. LHDN (TAX) LIABILITY", STYLE_H_NAVY, totalCols);
    for (const l of spec.statutory.lhdn) {
      const r = ws.addRow([l.label, "", "", l.value, "", "", l.note]);
      ws.mergeCells(r.number, 1, r.number, 3);
      ws.mergeCells(r.number, 4, r.number, 6);
      ws.mergeCells(r.number, 7, r.number, totalCols);
      r.getCell(1).style = STYLE_SECTION_LABEL;
      r.getCell(4).style = {
        ...STYLE_BODY_TEXT,
        alignment: { horizontal: "center" },
        font: { ...STYLE_BODY_TEXT.font, bold: true },
      };
      r.getCell(7).style = {
        ...STYLE_BODY_TEXT,
        font: { ...STYLE_BODY_TEXT.font, italic: true, size: 9 },
      };
    }
    blank(ws);
  }

  // ── Related-Party EPF ─────────────────────────────────────────────────────
  if (spec.statutory.relatedPartyEpf.length) {
    section(
      ws,
      "C. RELATED-PARTY EPF DISCLOSURE (NOT BBGB's Liability)",
      STYLE_H_LIGHT_ORANGE,
      totalCols,
    );
    const dis = ws.addRow([
      "DISCLOSURE: The named entity is NOT a subsidiary of BBGB. Shown for transparency only.",
    ]);
    ws.mergeCells(dis.number, 1, dis.number, totalCols);
    dis.getCell(1).style = {
      ...STYLE_BODY_TEXT,
      font: {
        ...STYLE_BODY_TEXT.font,
        italic: true,
        color: { argb: COLOR.navy },
      },
    };
    dis.height = 26;

    const rh = ws.addRow([
      "#",
      "Entity",
      "Contribution Period",
      "Outstanding",
      "Penalty",
      "Dividend",
      "Total",
      "Status",
    ]);
    rh.eachCell({ includeEmpty: false }, (c) => (c.style = STYLE_COL_HEADER));
    rh.height = 22;
    for (const e of spec.statutory.relatedPartyEpf) renderEpfRow(ws, e);
    blank(ws);
  }

  // ── Strategic Implications ───────────────────────────────────────────────
  if (spec.statutory.strategicImplications.length) {
    section(
      ws,
      "D. STRATEGIC IMPLICATIONS FOR INVESTOR",
      STYLE_H_GREEN,
      totalCols,
    );
    for (const s of spec.statutory.strategicImplications) {
      const r = ws.addRow([s.label, "", "", s.detail]);
      ws.mergeCells(r.number, 1, r.number, 3);
      ws.mergeCells(r.number, 4, r.number, totalCols);
      r.getCell(1).style = {
        ...STYLE_BODY_TEXT,
        font: { ...STYLE_BODY_TEXT.font, bold: true },
      };
      r.getCell(4).style = STYLE_BODY_TEXT;
      r.height = 38;
    }
  }

  return ws;
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function renderEpfRow(ws: Worksheet, e: EpfRow): Row {
  // Total cell uses live formula
  const r = ws.addRow([
    e.no,
    e.entity,
    e.period,
    e.outstanding,
    e.penalty,
    e.dividend,
    null,
    e.status,
  ]);
  const totalCol = 7;
  const tc = r.getCell(totalCol);
  const rn = r.number;
  tc.value = {
    formula: `${colLetter(4)}${rn}+${colLetter(5)}${rn}+${colLetter(6)}${rn}`,
  };
  r.getCell(1).style = {
    ...STYLE_TABLE_BODY,
    alignment: { horizontal: "center" },
  };
  r.getCell(2).style = STYLE_TABLE_BODY;
  r.getCell(3).style = STYLE_TABLE_BODY;
  r.getCell(4).style = STYLE_TABLE_NUM;
  r.getCell(5).style = STYLE_TABLE_NUM;
  r.getCell(6).style = STYLE_TABLE_NUM;
  r.getCell(7).style = {
    ...STYLE_TABLE_NUM,
    font: { ...STYLE_TABLE_NUM.font, bold: true },
  };
  r.getCell(8).style = STYLE_TABLE_BODY;
  return r;
}

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
