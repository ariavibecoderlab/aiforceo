/**
 * Shared renderer for Tabs 03 (FY mgmt accts) and 04 (Q1 mgmt accts).
 * Both have identical structure: per-entity P&L with derived rows emitted
 * as formulas (GROSS PROFIT, EBITDA, margin %, and a SUM total column).
 */

import type { Workbook, Worksheet, Row, Style } from "exceljs";
import type { InvestorPackSpec, MgmtAccount, PnlLineItem } from "../spec";
import {
  STYLE_TITLE,
  STYLE_SUBTITLE,
  STYLE_H_NAVY,
  STYLE_H_GREEN,
  STYLE_H_LIGHT_BLUE,
  STYLE_BODY_TEXT,
  STYLE_BODY_NUM,
  STYLE_SECTION_LABEL,
  STYLE_COL_HEADER,
  STYLE_TABLE_BODY,
  STYLE_TABLE_NUM,
  STYLE_TABLE_PCT,
  STYLE_SUBTOTAL,
  STYLE_SUBTOTAL_LABEL,
  STYLE_FOCAL,
  STYLE_LOSS,
  NUMFMT,
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

export function buildMgmtAccountSheet(
  wb: Workbook,
  tabId: string,
  acc: MgmtAccount,
  spec: InvestorPackSpec,
  extras?: {
    extrapolationLines?: { label: string; value: string; note: string }[];
  },
): Worksheet {
  const ws = wb.addWorksheet(tabId, {
    properties: { defaultRowHeight: 18 },
    views: [{ state: "frozen", xSplit: 1, ySplit: 4 }],
  });

  const entities = acc.entityCodes;
  const totalCols = 1 + entities.length + 1; // label + N entities + Total

  ws.columns = [
    { width: 36 },
    ...entities.map(() => ({ width: 15 })),
    { width: 17 },
  ];

  // Title
  const r1 = ws.addRow([
    `${spec.company.shortName} — ${acc.period} MANAGEMENT ACCOUNTS`,
  ]);
  ws.mergeCells(r1.number, 1, r1.number, totalCols);
  r1.height = 28;
  styleRow(r1, STYLE_TITLE);

  const r2 = ws.addRow([acc.subtitle]);
  ws.mergeCells(r2.number, 1, r2.number, totalCols);
  r2.height = 22;
  styleRow(r2, STYLE_SUBTITLE);

  // Headline callout
  if (acc.headline) {
    const rh = ws.addRow([`🚀 HEADLINE: ${acc.headline}`]);
    ws.mergeCells(rh.number, 1, rh.number, totalCols);
    rh.getCell(1).style = {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLOR.amber },
      },
      font: {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: COLOR.navy },
      },
      alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    };
    rh.height = 28;
  }
  blank(ws);

  // Column headers
  section(ws, `PROFIT & LOSS (${acc.period})`, STYLE_H_NAVY, totalCols);

  const colHead = ws.addRow(["P&L LINE ITEM", ...entities, acc.totalLabel]);
  colHead.eachCell(
    { includeEmpty: false },
    (c) => (c.style = STYLE_COL_HEADER),
  );
  colHead.height = 22;

  // Track rows so subsequent formulas can reference them
  const rowMap = new Map<string, number>();

  for (const item of acc.rows) {
    const r = renderPnlRow(ws, item, entities, rowMap);
    rowMap.set(item.label.trim(), r.number);
  }

  blank(ws);

  // Optional extrapolation block (used by Tab 04 Q1 → FY26F)
  if (extras?.extrapolationLines?.length) {
    section(
      ws,
      "EXTRAPOLATION TO FY2026F (Q1 Actual + Q2-Q4 Run-Rate)",
      STYLE_H_LIGHT_BLUE,
      totalCols,
    );
    for (const ex of extras.extrapolationLines) {
      const r = ws.addRow([ex.label, ex.value, "", "", ex.note]);
      ws.mergeCells(r.number, 2, r.number, 4);
      ws.mergeCells(r.number, 5, r.number, totalCols);
      r.getCell(1).style = STYLE_SECTION_LABEL;
      r.getCell(2).style = {
        ...STYLE_BODY_TEXT,
        alignment: { horizontal: "center" },
        font: {
          ...STYLE_BODY_TEXT.font,
          bold: true,
          color: { argb: COLOR.navy },
        },
      };
      r.getCell(5).style = {
        ...STYLE_BODY_TEXT,
        font: { ...STYLE_BODY_TEXT.font, italic: true, size: 9 },
      };
    }
    blank(ws);
  }

  // Notes
  if (acc.notes.length) {
    section(ws, "NOTES & ASSUMPTIONS", STYLE_H_LIGHT_BLUE, totalCols);
    acc.notes.forEach((n, i) => {
      const r = ws.addRow([`${i + 1}. ${n}`]);
      ws.mergeCells(r.number, 1, r.number, totalCols);
      r.getCell(1).style = STYLE_BODY_TEXT;
      r.height = 26;
    });
    blank(ws);
  }

  // Insights
  if (acc.insights.length) {
    section(
      ws,
      `KEY INSIGHTS — ${acc.period} PERFORMANCE`,
      STYLE_H_GREEN,
      totalCols,
    );
    for (const i of acc.insights) {
      const r = ws.addRow([i.label, i.detail]);
      ws.mergeCells(r.number, 2, r.number, totalCols);
      r.getCell(1).style = {
        ...STYLE_BODY_TEXT,
        font: { ...STYLE_BODY_TEXT.font, bold: true },
      };
      r.getCell(2).style = STYLE_BODY_TEXT;
      r.height = 28;
    }
  }

  return ws;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

/**
 * Render a single P&L row. Handles hardcoded values, formulas, and the total
 * column.
 */
function renderPnlRow(
  ws: Worksheet,
  item: PnlLineItem,
  entities: string[],
  rowMap: Map<string, number>,
): Row {
  const r = ws.addRow([item.label]);
  const rn = r.number;
  const labelCell = r.getCell(1);

  // Label style by emphasis
  if (item.emphasis === "total") labelCell.style = STYLE_SUBTOTAL_LABEL;
  else if (item.emphasis === "subtotal") labelCell.style = STYLE_SUBTOTAL_LABEL;
  else if (item.emphasis === "section")
    labelCell.style = {
      ...STYLE_SECTION_LABEL,
      font: {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: COLOR.navy },
      },
    };
  else labelCell.style = STYLE_SECTION_LABEL;

  // Entity columns
  for (let i = 0; i < entities.length; i++) {
    const col = 2 + i;
    const colL = colLetter(col);
    const cell = r.getCell(col);

    switch (item.isFormula) {
      case "grossProfit": {
        // GP = Revenue - COGS  (look up "Revenue" and "Less: Cost of Sales"
        // in rowMap; fall back to first/second rows above)
        const rev = rowMap.get("Revenue") ?? rn - 2;
        const cogs =
          rowMap.get("Less: Cost of Sales") ??
          rowMap.get("Less: COGS") ??
          rn - 1;
        cell.value = { formula: `${colL}${rev}-${colL}${cogs}` };
        break;
      }
      case "ebitda": {
        // EBITDA = GP - OPEX
        const gp = rowMap.get("GROSS PROFIT") ?? rn - 2;
        const opex =
          rowMap.get("Less: Operating Expenses") ??
          rowMap.get("Less: OPEX") ??
          rowMap.get("Less: Admin & Operating Expenses") ??
          rn - 1;
        cell.value = { formula: `${colL}${gp}-${colL}${opex}` };
        break;
      }
      case "marginPct": {
        const numRow = rowMap.get(item.marginOf!.trim()) ?? rn - 1;
        const denRow = rowMap.get(item.marginDen ?? "Revenue") ?? 1;
        cell.value = {
          formula: `IFERROR(${colL}${numRow}/${colL}${denRow},0)`,
        };
        break;
      }
      case "sumRow":
      default: {
        const entityCode = entities[i];
        const v = entityCode ? item.values[entityCode] : undefined;
        cell.value = v ?? 0;
        break;
      }
    }

    // Cell style by emphasis + content
    if (item.isFormula === "marginPct") {
      cell.style = STYLE_TABLE_PCT;
    } else if (item.emphasis === "total") {
      cell.style = STYLE_FOCAL;
    } else if (item.emphasis === "subtotal") {
      cell.style = STYLE_SUBTOTAL;
    } else if (typeof cell.value === "number" && (cell.value as number) < 0) {
      cell.style = STYLE_LOSS;
    } else {
      cell.style = STYLE_TABLE_NUM;
    }
  }

  // Total column (last column) = SUM across entities, except for margin rows
  // which compute total margin from total numerator / total denominator.
  const totalCol = 2 + entities.length;
  const totalColL = colLetter(totalCol);
  const totalCell = r.getCell(totalCol);
  const firstColL = colLetter(2);
  const lastColL = colLetter(2 + entities.length - 1);

  if (item.isFormula === "marginPct") {
    const numRow = rowMap.get(item.marginOf!.trim()) ?? rn - 1;
    const denRow = rowMap.get(item.marginDen ?? "Revenue") ?? 1;
    totalCell.value = {
      formula: `IFERROR(${totalColL}${numRow}/${totalColL}${denRow},0)`,
    };
    totalCell.style = item.emphasis === "total" ? STYLE_FOCAL : STYLE_TABLE_PCT;
  } else {
    totalCell.value = { formula: `SUM(${firstColL}${rn}:${lastColL}${rn})` };
    if (item.emphasis === "total") totalCell.style = STYLE_FOCAL;
    else if (item.emphasis === "subtotal") totalCell.style = STYLE_SUBTOTAL;
    else
      totalCell.style = {
        ...STYLE_TABLE_NUM,
        font: { ...STYLE_TABLE_NUM.font, bold: true },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLOR.lightGray },
        },
      };
  }

  r.height = item.emphasis === "total" ? 24 : 20;
  return r;
}
