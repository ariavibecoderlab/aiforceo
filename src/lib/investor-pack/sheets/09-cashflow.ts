/**
 * Tab 09 — 5-YEAR CASHFLOW PROJECTION
 *
 * Opening cash → operating (NPAT cross-sheet from Tab 08 + addback D&A)
 *   → investing (CAPEX) → financing → net cash movement → closing cash.
 * Closing cash chains: each year's opening = previous year's closing.
 */

import type { Workbook, Worksheet, Row, Style } from "exceljs";
import type { InvestorPackSpec } from "../spec";
import type { ProjectionSheetResult } from "./08-projection";
import {
  STYLE_TITLE,
  STYLE_SUBTITLE,
  STYLE_H_NAVY,
  STYLE_H_GREEN,
  STYLE_H_LIGHT_BLUE,
  STYLE_BODY_TEXT,
  STYLE_SECTION_LABEL,
  STYLE_COL_HEADER,
  STYLE_TABLE_NUM,
  STYLE_SUBTOTAL,
  STYLE_SUBTOTAL_LABEL,
  STYLE_FOCAL,
  STYLE_INPUT,
  STYLE_LOSS,
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

// Quote sheet name for cross-sheet refs only if it contains spaces or special chars
const quoteSheet = (name: string) =>
  /[^A-Za-z0-9_]/.test(name) ? `'${name}'` : name;

export function buildCashflowSheet(
  wb: Workbook,
  spec: InvestorPackSpec,
  projection: ProjectionSheetResult,
): Worksheet {
  const ws = wb.addWorksheet("09 5-YR CASHFLOW PROJECTION", {
    properties: { defaultRowHeight: 18 },
    views: [{ state: "frozen", xSplit: 1, ySplit: 4 }],
  });

  const years = spec.projection.years;
  const yearCount = years.length;
  const totalCols = 1 + yearCount;
  const firstYearCol = 2;
  const projSheet = quoteSheet(projection.sheetName);

  ws.columns = [{ width: 42 }, ...Array(yearCount).fill({ width: 17 })];

  // Title + subtitle
  const r1 = ws.addRow(["5-YEAR CASHFLOW PROJECTION — CASH BUILD TO IPO"]);
  ws.mergeCells(r1.number, 1, r1.number, totalCols);
  r1.height = 28;
  styleRow(r1, STYLE_TITLE);

  const r2 = ws.addRow([
    "Operating Activities + Investing + Financing → Closing Cash | Cross-Sheet Linked to Tab 08",
  ]);
  ws.mergeCells(r2.number, 1, r2.number, totalCols);
  r2.height = 22;
  styleRow(r2, STYLE_SUBTITLE);
  blank(ws);

  // Header
  const yh = ws.addRow(["CASHFLOW LINE ITEM", ...years]);
  yh.eachCell({ includeEmpty: false }, (c) => (c.style = STYLE_COL_HEADER));
  yh.height = 24;

  // ── OPENING CASH BALANCE ──────────────────────────────────────────────────
  // Year 1 = openingCash hardcoded input; subsequent years = previous closing.
  // We'll set the closing-cash references after we know the closing-cash row.
  const openRow = ws.addRow([
    "OPENING CASH BALANCE",
    spec.cashflow.openingCash,
    ...Array(yearCount - 1).fill(null),
  ]);
  openRow.getCell(1).style = STYLE_SECTION_LABEL;
  openRow.getCell(2).style = STYLE_INPUT;
  for (let i = 1; i < yearCount; i++)
    openRow.getCell(2 + i).style = STYLE_TABLE_NUM;
  const openRn = openRow.number;
  blank(ws);

  // ── OPERATING ACTIVITIES ──────────────────────────────────────────────────
  section(ws, "OPERATING ACTIVITIES", STYLE_H_NAVY, totalCols);

  // NPAT from Tab 08 (cross-sheet)
  const npatRow = ws.addRow(["Net Profit After Tax (from Tab 08)"]);
  npatRow.getCell(1).style = STYLE_SECTION_LABEL;
  for (let i = 0; i < yearCount; i++) {
    const c = colLetter(firstYearCol + i);
    npatRow.getCell(firstYearCol + i).value = {
      formula: `${projSheet}!${c}${projection.npatRow}`,
    };
    npatRow.getCell(firstYearCol + i).style = STYLE_TABLE_NUM;
  }
  const npatRn = npatRow.number;

  // Addback D&A from Tab 08
  const daBack = ws.addRow(["Add Back: Depreciation & Amortization"]);
  daBack.getCell(1).style = STYLE_SECTION_LABEL;
  for (let i = 0; i < yearCount; i++) {
    const c = colLetter(firstYearCol + i);
    daBack.getCell(firstYearCol + i).value = {
      formula: `-${projSheet}!${c}${projection.daRow}`,
    };
    daBack.getCell(firstYearCol + i).style = STYLE_TABLE_NUM;
  }
  const daRn = daBack.number;

  // Net operating cashflow
  const opCf = ws.addRow(["NET OPERATING CASHFLOW"]);
  opCf.getCell(1).style = STYLE_SUBTOTAL_LABEL;
  for (let i = 0; i < yearCount; i++) {
    const c = colLetter(firstYearCol + i);
    opCf.getCell(firstYearCol + i).value = {
      formula: `${c}${npatRn}+${c}${daRn}`,
    };
    opCf.getCell(firstYearCol + i).style = STYLE_SUBTOTAL;
  }
  opCf.height = 24;
  const opCfRn = opCf.number;
  blank(ws);

  // ── INVESTING ACTIVITIES ──────────────────────────────────────────────────
  const investingLines = spec.cashflow.lines.filter(
    (l) => l.group === "invest",
  );
  let investingSumRn = -1;
  if (investingLines.length > 0) {
    section(ws, "INVESTING ACTIVITIES", STYLE_H_LIGHT_BLUE, totalCols);
    const firstInvRn = ws.rowCount + 1;
    for (const line of investingLines) {
      const r = ws.addRow([line.label, ...line.values]);
      r.getCell(1).style = STYLE_SECTION_LABEL;
      for (let i = 0; i < yearCount; i++) {
        r.getCell(2 + i).style =
          (line.values[i] ?? 0) < 0 ? STYLE_LOSS : STYLE_INPUT;
      }
    }
    const lastInvRn = ws.rowCount;
    // Sub-sum
    const invSum = ws.addRow(["NET INVESTING CASHFLOW"]);
    invSum.getCell(1).style = STYLE_SUBTOTAL_LABEL;
    for (let i = 0; i < yearCount; i++) {
      const c = colLetter(firstYearCol + i);
      invSum.getCell(firstYearCol + i).value = {
        formula: `SUM(${c}${firstInvRn}:${c}${lastInvRn})`,
      };
      invSum.getCell(firstYearCol + i).style = STYLE_SUBTOTAL;
    }
    investingSumRn = invSum.number;
    blank(ws);
  }

  // ── FINANCING ACTIVITIES ──────────────────────────────────────────────────
  const financingLines = spec.cashflow.lines.filter(
    (l) => l.group === "finance",
  );
  let financingSumRn = -1;
  if (financingLines.length > 0) {
    section(ws, "FINANCING ACTIVITIES", STYLE_H_GREEN, totalCols);
    const firstFinRn = ws.rowCount + 1;
    for (const line of financingLines) {
      const r = ws.addRow([line.label, ...line.values]);
      r.getCell(1).style = STYLE_SECTION_LABEL;
      for (let i = 0; i < yearCount; i++) {
        const v = line.values[i] ?? 0;
        r.getCell(2 + i).style = v < 0 ? STYLE_LOSS : STYLE_INPUT;
      }
    }
    const lastFinRn = ws.rowCount;
    const finSum = ws.addRow(["NET FINANCING CASHFLOW"]);
    finSum.getCell(1).style = STYLE_SUBTOTAL_LABEL;
    for (let i = 0; i < yearCount; i++) {
      const c = colLetter(firstYearCol + i);
      finSum.getCell(firstYearCol + i).value = {
        formula: `SUM(${c}${firstFinRn}:${c}${lastFinRn})`,
      };
      finSum.getCell(firstYearCol + i).style = STYLE_SUBTOTAL;
    }
    financingSumRn = finSum.number;
    blank(ws);
  }

  // ── NET CASH MOVEMENT ────────────────────────────────────────────────────
  const netMove = ws.addRow(["NET CASH MOVEMENT"]);
  netMove.getCell(1).style = STYLE_SUBTOTAL_LABEL;
  for (let i = 0; i < yearCount; i++) {
    const c = colLetter(firstYearCol + i);
    const parts = [`${c}${opCfRn}`];
    if (investingSumRn > 0) parts.push(`${c}${investingSumRn}`);
    if (financingSumRn > 0) parts.push(`${c}${financingSumRn}`);
    netMove.getCell(firstYearCol + i).value = { formula: parts.join("+") };
    netMove.getCell(firstYearCol + i).style = STYLE_SUBTOTAL;
  }
  netMove.height = 24;
  const netMoveRn = netMove.number;

  // ── CLOSING CASH BALANCE ──────────────────────────────────────────────────
  const closing = ws.addRow(["CLOSING CASH BALANCE"]);
  closing.getCell(1).style = {
    ...STYLE_SUBTOTAL_LABEL,
    fill: STYLE_FOCAL.fill,
  };
  for (let i = 0; i < yearCount; i++) {
    const c = colLetter(firstYearCol + i);
    closing.getCell(firstYearCol + i).value = {
      formula: `${c}${openRn}+${c}${netMoveRn}`,
    };
    closing.getCell(firstYearCol + i).style = STYLE_FOCAL;
  }
  closing.height = 28;
  const closingRn = closing.number;

  // Now chain the opening-cash row for years 2..N to previous-year closing
  for (let i = 1; i < yearCount; i++) {
    const prevCol = colLetter(firstYearCol + i - 1);
    ws.getCell(`${colLetter(firstYearCol + i)}${openRn}`).value = {
      formula: `${prevCol}${closingRn}`,
    };
  }

  blank(ws);
  blank(ws);

  // ── Insights ──────────────────────────────────────────────────────────────
  if (spec.cashflow.insights.length) {
    section(
      ws,
      "PROJECTED CASH BUILD-UP — IPO POSITIONING",
      STYLE_H_GREEN,
      totalCols,
    );
    for (const i of spec.cashflow.insights) {
      const r = ws.addRow([i.label, i.detail]);
      ws.mergeCells(r.number, 2, r.number, totalCols);
      r.getCell(1).style = {
        ...STYLE_BODY_TEXT,
        font: { ...STYLE_BODY_TEXT.font, bold: true },
      };
      r.getCell(2).style = STYLE_BODY_TEXT;
      r.height = 30;
    }
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
