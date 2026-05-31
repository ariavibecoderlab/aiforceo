/**
 * Tab 08 — 5-YEAR P&L PROJECTION (DRIVER MODEL)
 * Every output is a live formula. Blue input cells = editable assumptions.
 *
 * Revenue: students × fee per business line + other revenue
 * COGS:    -Revenue × cogsPctOfRevenue
 * EBITDA:  Gross Profit - OPEX
 * PBT:     EBITDA + D&A + FinanceCosts
 * Tax:     IF(PBT>0, -PBT*rate, 0)
 * NPAT:    PBT + Tax
 * CAGR:    (final / first) ^ (1/(n-1)) - 1
 */

import type { Workbook, Worksheet, Row, Style } from "exceljs";
import type { InvestorPackSpec } from "../spec";
import {
  STYLE_TITLE,
  STYLE_SUBTITLE,
  STYLE_H_NAVY,
  STYLE_H_GREEN,
  STYLE_H_LIGHT_BLUE,
  STYLE_H_LIGHT_GREEN,
  STYLE_BODY_TEXT,
  STYLE_SECTION_LABEL,
  STYLE_COL_HEADER,
  STYLE_TABLE_NUM,
  STYLE_TABLE_PCT,
  STYLE_SUBTOTAL,
  STYLE_SUBTOTAL_LABEL,
  STYLE_FOCAL,
  STYLE_INPUT,
  STYLE_INPUT_PCT,
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

/** Return both the worksheet and key row numbers so Tab 09 can reference them. */
export interface ProjectionSheetResult {
  sheet: Worksheet;
  sheetName: string;
  npatRow: number;
  ebitdaRow: number;
  totalRevenueRow: number;
  daRow: number;
}

export function buildProjectionSheet(
  wb: Workbook,
  spec: InvestorPackSpec,
): ProjectionSheetResult {
  const ws = wb.addWorksheet("08 5-YR P&L PROJECTION", {
    properties: { defaultRowHeight: 18 },
    views: [{ state: "frozen", xSplit: 1, ySplit: 4 }],
  });

  const years = spec.projection.years;
  const yearCount = years.length;
  const cagrCol = 2 + yearCount; // last column = CAGR
  const totalCols = cagrCol;
  const firstYearCol = 2;
  const lastYearCol = 1 + yearCount;
  const firstYearL = colLetter(firstYearCol);
  const lastYearL = colLetter(lastYearCol);
  const cagrColL = colLetter(cagrCol);

  ws.columns = [
    { width: 40 },
    ...Array(yearCount).fill({ width: 16 }),
    { width: 12 },
  ];

  // Title + subtitle
  const r1 = ws.addRow([
    `5-YEAR PROFIT & LOSS PROJECTION — PATH TO IPO ${spec.company.ipoTarget}`,
  ]);
  ws.mergeCells(r1.number, 1, r1.number, totalCols);
  r1.height = 28;
  styleRow(r1, STYLE_TITLE);

  const r2 = ws.addRow([
    "Base Case · Driver-Based Model · Editable Blue Input Cells",
  ]);
  ws.mergeCells(r2.number, 1, r2.number, totalCols);
  r2.height = 22;
  styleRow(r2, STYLE_SUBTITLE);
  blank(ws);

  // Header row
  const yh = ws.addRow(["P&L LINE ITEM", ...years, "CAGR"]);
  yh.eachCell({ includeEmpty: false }, (c, colNumber) => {
    c.style = {
      ...STYLE_COL_HEADER,
      fill:
        colNumber === cagrCol
          ? {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: COLOR.amber },
            }
          : STYLE_COL_HEADER.fill,
    };
  });
  yh.height = 24;

  // ═══════════════════════════════════════════════════════════════════════
  //  KEY GROWTH ASSUMPTIONS (Editable Blue Inputs)
  // ═══════════════════════════════════════════════════════════════════════
  section(
    ws,
    "KEY GROWTH ASSUMPTIONS (Editable — Blue Cells)",
    STYLE_H_LIGHT_GREEN,
    totalCols,
  );

  // Track driver row numbers so revenue formulas can reference them
  const driverRows = new Map<string, number>();

  for (const d of spec.projection.drivers) {
    const r = ws.addRow([d.label, ...d.values.map((v) => v ?? 0)]);
    r.getCell(1).style = STYLE_SECTION_LABEL;
    for (let i = 0; i < yearCount; i++) {
      r.getCell(2 + i).style = STYLE_INPUT;
    }
    driverRows.set(d.label, r.number);
  }
  blank(ws);

  // ═══════════════════════════════════════════════════════════════════════
  //  REVENUE BUILD (students × fee per business line + other)
  // ═══════════════════════════════════════════════════════════════════════
  section(ws, "REVENUE BUILD", STYLE_H_NAVY, totalCols);

  const revenueRowNumbers: number[] = [];

  // Match drivers (students) with their paired fee row
  for (const d of spec.projection.drivers) {
    if (d.isFee) continue; // fees handled via pairing
    // Find the matching fee row
    const fee = spec.projection.drivers.find(
      (f) => f.isFee && f.pairWith === d.label,
    );
    if (!fee) continue;
    const studentsRow = driverRows.get(d.label)!;
    const feeRow = driverRows.get(fee.label)!;
    // Build a "<Line> Revenue (Students × Fee)" row with formulas
    const lineName =
      d.label.replace(/Students.*/, "").trim() + " Revenue (Students × Fee)";
    const rev = ws.addRow([lineName]);
    rev.getCell(1).style = STYLE_SECTION_LABEL;
    for (let i = 0; i < yearCount; i++) {
      const c = colLetter(firstYearCol + i);
      rev.getCell(firstYearCol + i).value = {
        formula: `${c}${studentsRow}*${c}${feeRow}`,
      };
      rev.getCell(firstYearCol + i).style = STYLE_TABLE_NUM;
    }
    // CAGR — guard against the first column being 0 (e.g. SRIIBB starts in FY27)
    rev.getCell(cagrCol).value = {
      formula: `IFERROR((${lastYearL}${rev.number}/${firstYearL}${rev.number})^(1/${yearCount - 1})-1,0)`,
    };
    rev.getCell(cagrCol).style = {
      ...STYLE_TABLE_PCT,
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLOR.amber },
      },
    };
    revenueRowNumbers.push(rev.number);
  }

  // Other entities revenue (lump sum)
  const other = ws.addRow([
    spec.projection.otherRevenueLabel,
    ...spec.projection.otherRevenueByYear,
  ]);
  other.getCell(1).style = STYLE_SECTION_LABEL;
  for (let i = 0; i < yearCount; i++) other.getCell(2 + i).style = STYLE_INPUT;
  other.getCell(cagrCol).value = {
    formula: `IFERROR((${lastYearL}${other.number}/${firstYearL}${other.number})^(1/${yearCount - 1})-1,0)`,
  };
  other.getCell(cagrCol).style = {
    ...STYLE_TABLE_PCT,
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLOR.amber } },
  };
  revenueRowNumbers.push(other.number);

  // TOTAL REVENUE = sum of all revenue rows per year
  const totalRev = ws.addRow(["TOTAL REVENUE"]);
  for (let i = 0; i < yearCount; i++) {
    const c = colLetter(firstYearCol + i);
    const refs = revenueRowNumbers.map((rn) => `${c}${rn}`).join("+");
    totalRev.getCell(firstYearCol + i).value = { formula: refs };
    totalRev.getCell(firstYearCol + i).style = STYLE_SUBTOTAL;
  }
  totalRev.getCell(1).style = STYLE_SUBTOTAL_LABEL;
  totalRev.getCell(cagrCol).value = {
    formula: `IFERROR((${lastYearL}${totalRev.number}/${firstYearL}${totalRev.number})^(1/${yearCount - 1})-1,0)`,
  };
  totalRev.getCell(cagrCol).style = {
    ...STYLE_TABLE_PCT,
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLOR.amber } },
    font: { ...STYLE_TABLE_PCT.font, bold: true },
  };
  totalRev.height = 24;
  const totalRevRow = totalRev.number;
  blank(ws);

  // ═══════════════════════════════════════════════════════════════════════
  //  COGS, GP, OPEX, EBITDA
  // ═══════════════════════════════════════════════════════════════════════
  const cogsPct = spec.projection.cogsPctOfRevenue;
  const cogsRow = ws.addRow([
    `Less: COGS (${(cogsPct * 100).toFixed(1)}% of Revenue)`,
  ]);
  cogsRow.getCell(1).style = STYLE_SECTION_LABEL;
  for (let i = 0; i < yearCount; i++) {
    const c = colLetter(firstYearCol + i);
    cogsRow.getCell(firstYearCol + i).value = {
      formula: `-${c}${totalRevRow}*${cogsPct}`,
    };
    cogsRow.getCell(firstYearCol + i).style = STYLE_TABLE_NUM;
  }
  const cogsRn = cogsRow.number;

  const gp = ws.addRow(["GROSS PROFIT"]);
  gp.getCell(1).style = STYLE_SUBTOTAL_LABEL;
  for (let i = 0; i < yearCount; i++) {
    const c = colLetter(firstYearCol + i);
    gp.getCell(firstYearCol + i).value = {
      formula: `${c}${totalRevRow}+${c}${cogsRn}`,
    };
    gp.getCell(firstYearCol + i).style = STYLE_SUBTOTAL;
  }
  gp.height = 24;
  const gpRn = gp.number;
  blank(ws);

  // OPEX (editable inputs)
  section(ws, "OPERATING EXPENSES", STYLE_H_LIGHT_BLUE, totalCols);
  const opex = ws.addRow([
    "Less: Total Operating Expenses",
    ...spec.projection.opexByYear,
  ]);
  opex.getCell(1).style = STYLE_SECTION_LABEL;
  for (let i = 0; i < yearCount; i++) opex.getCell(2 + i).style = STYLE_INPUT;
  const opexRn = opex.number;
  blank(ws);

  // EBITDA = GP + OPEX (opex already negative)
  const ebitda = ws.addRow(["EBITDA"]);
  ebitda.getCell(1).style = { ...STYLE_SUBTOTAL_LABEL, fill: STYLE_FOCAL.fill };
  for (let i = 0; i < yearCount; i++) {
    const c = colLetter(firstYearCol + i);
    ebitda.getCell(firstYearCol + i).value = {
      formula: `${c}${gpRn}+${c}${opexRn}`,
    };
    ebitda.getCell(firstYearCol + i).style = STYLE_FOCAL;
  }
  ebitda.getCell(cagrCol).value = {
    formula: `IFERROR((${lastYearL}${ebitda.number}/${firstYearL}${ebitda.number})^(1/${yearCount - 1})-1,0)`,
  };
  ebitda.getCell(cagrCol).style = {
    ...STYLE_TABLE_PCT,
    font: { ...STYLE_TABLE_PCT.font, bold: true },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLOR.amber } },
  };
  ebitda.height = 26;
  const ebitdaRn = ebitda.number;

  // EBITDA Margin %
  const ebMargin = ws.addRow(["  EBITDA Margin %"]);
  ebMargin.getCell(1).style = STYLE_SECTION_LABEL;
  for (let i = 0; i < yearCount; i++) {
    const c = colLetter(firstYearCol + i);
    ebMargin.getCell(firstYearCol + i).value = {
      formula: `IFERROR(${c}${ebitdaRn}/${c}${totalRevRow},0)`,
    };
    ebMargin.getCell(firstYearCol + i).style = STYLE_TABLE_PCT;
  }
  blank(ws);

  // D&A (editable)
  const da = ws.addRow([
    "Less: Depreciation & Amortization",
    ...spec.projection.daByYear,
  ]);
  da.getCell(1).style = STYLE_SECTION_LABEL;
  for (let i = 0; i < yearCount; i++) da.getCell(2 + i).style = STYLE_INPUT;
  const daRn = da.number;

  // Finance Costs (editable)
  const fc = ws.addRow([
    "Less: Finance Costs (Interest)",
    ...spec.projection.financeCostsByYear,
  ]);
  fc.getCell(1).style = STYLE_SECTION_LABEL;
  for (let i = 0; i < yearCount; i++) fc.getCell(2 + i).style = STYLE_INPUT;
  const fcRn = fc.number;

  // PBT = EBITDA + D&A + FC
  const pbt = ws.addRow(["PROFIT BEFORE TAX (PBT)"]);
  pbt.getCell(1).style = STYLE_SUBTOTAL_LABEL;
  for (let i = 0; i < yearCount; i++) {
    const c = colLetter(firstYearCol + i);
    pbt.getCell(firstYearCol + i).value = {
      formula: `${c}${ebitdaRn}+${c}${daRn}+${c}${fcRn}`,
    };
    pbt.getCell(firstYearCol + i).style = STYLE_SUBTOTAL;
  }
  pbt.getCell(cagrCol).value = {
    formula: `IFERROR((${lastYearL}${pbt.number}/${firstYearL}${pbt.number})^(1/${yearCount - 1})-1,0)`,
  };
  pbt.getCell(cagrCol).style = STYLE_TABLE_PCT;
  pbt.height = 24;
  const pbtRn = pbt.number;

  // Tax = IF(PBT>0, -PBT*rate, 0)  — rate stored as editable input row
  const taxRate = ws.addRow([
    "Tax Rate (Editable)",
    ...spec.projection.taxRateByYear,
  ]);
  taxRate.getCell(1).style = STYLE_SECTION_LABEL;
  for (let i = 0; i < yearCount; i++)
    taxRate.getCell(2 + i).style = STYLE_INPUT_PCT;
  const taxRateRn = taxRate.number;

  const tax = ws.addRow(["Less: Taxation"]);
  tax.getCell(1).style = STYLE_SECTION_LABEL;
  for (let i = 0; i < yearCount; i++) {
    const c = colLetter(firstYearCol + i);
    tax.getCell(firstYearCol + i).value = {
      formula: `IF(${c}${pbtRn}>0,-${c}${pbtRn}*${c}${taxRateRn},0)`,
    };
    tax.getCell(firstYearCol + i).style = STYLE_TABLE_NUM;
  }
  const taxRn = tax.number;

  // NPAT = PBT + Tax
  const npat = ws.addRow(["NET PROFIT AFTER TAX (PAT)"]);
  npat.getCell(1).style = {
    ...STYLE_SUBTOTAL_LABEL,
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLOR.amber } },
    font: { ...STYLE_SUBTOTAL_LABEL.font, size: 12 },
  };
  for (let i = 0; i < yearCount; i++) {
    const c = colLetter(firstYearCol + i);
    npat.getCell(firstYearCol + i).value = {
      formula: `${c}${pbtRn}+${c}${taxRn}`,
    };
    npat.getCell(firstYearCol + i).style = STYLE_FOCAL;
  }
  npat.getCell(cagrCol).value = {
    formula: `IFERROR((${lastYearL}${npat.number}/${firstYearL}${npat.number})^(1/${yearCount - 1})-1,0)`,
  };
  npat.getCell(cagrCol).style = {
    ...STYLE_TABLE_PCT,
    font: { ...STYLE_TABLE_PCT.font, bold: true },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLOR.amber } },
  };
  npat.height = 26;
  const npatRn = npat.number;

  // Net Profit Margin %
  const nm = ws.addRow(["  Net Profit Margin %"]);
  nm.getCell(1).style = STYLE_SECTION_LABEL;
  for (let i = 0; i < yearCount; i++) {
    const c = colLetter(firstYearCol + i);
    nm.getCell(firstYearCol + i).value = {
      formula: `IFERROR(${c}${npatRn}/${c}${totalRevRow},0)`,
    };
    nm.getCell(firstYearCol + i).style = STYLE_TABLE_PCT;
  }
  blank(ws);

  // ═══════════════════════════════════════════════════════════════════════
  //  Notes
  // ═══════════════════════════════════════════════════════════════════════
  if (spec.projectionNotes.length) {
    section(ws, "PROJECTION ASSUMPTIONS & RATIONALE", STYLE_H_GREEN, totalCols);
    for (const n of spec.projectionNotes) {
      const r = ws.addRow([n.label, n.detail]);
      ws.mergeCells(r.number, 2, r.number, totalCols);
      r.getCell(1).style = {
        ...STYLE_BODY_TEXT,
        font: { ...STYLE_BODY_TEXT.font, bold: true },
      };
      r.getCell(2).style = STYLE_BODY_TEXT;
      r.height = 30;
    }
  }

  return {
    sheet: ws,
    sheetName: ws.name,
    npatRow: npatRn,
    ebitdaRow: ebitdaRn,
    totalRevenueRow: totalRevRow,
    daRow: daRn,
  };
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
