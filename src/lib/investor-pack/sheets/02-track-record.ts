/**
 * Tab 02 — 15-YEAR FINANCIAL TRACK RECORD
 * Wide matrix: rows are P&L lines, columns are years 2011..FY+1.
 * EBITDA margin is emitted as a formula per year so the model stays live.
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
  STYLE_BODY_NUM,
  STYLE_LOSS,
  STYLE_SECTION_LABEL,
  STYLE_COL_HEADER,
  STYLE_TABLE_BODY,
  STYLE_TABLE_NUM,
  STYLE_TABLE_PCT,
  STYLE_SUBTOTAL,
  STYLE_SUBTOTAL_LABEL,
  STYLE_FOCAL,
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

export function buildTrackRecordSheet(
  wb: Workbook,
  spec: InvestorPackSpec,
): Worksheet {
  const ws = wb.addWorksheet("02 15-YR TRACK RECORD", {
    properties: { defaultRowHeight: 18 },
    views: [{ state: "frozen", xSplit: 1, ySplit: 3 }],
  });

  const years = spec.trackRecord.years;
  const totalCols = 1 + years.length; // label + N years
  ws.columns = [{ width: 36 }, ...years.map(() => ({ width: 13 }))];

  // Title + subtitle
  const r1 = ws.addRow([
    `${spec.company.shortName} — 15-YEAR FINANCIAL TRACK RECORD`,
  ]);
  ws.mergeCells(r1.number, 1, r1.number, totalCols);
  r1.height = 28;
  styleRow(r1, STYLE_TITLE);

  const r2 = ws.addRow([spec.trackRecord.subtitle]);
  ws.mergeCells(r2.number, 1, r2.number, totalCols);
  r2.height = 22;
  styleRow(r2, STYLE_SUBTITLE);

  blank(ws);

  // ── Section A: Group Consolidated Performance ─────────────────────────────
  section(
    ws,
    `A. GROUP CONSOLIDATED PERFORMANCE (${spec.company.currency})`,
    STYLE_H_NAVY,
    totalCols,
  );

  // Year header
  const yh = ws.addRow(["P&L Line Item", ...years.map((y) => String(y.year))]);
  yh.eachCell(
    { includeEmpty: false },
    (c) => (c.style = { ...STYLE_COL_HEADER }),
  );
  yh.height = 22;

  // Optional badge row (e.g. "🦠 COVID")
  if (years.some((y) => y.badge)) {
    const br = ws.addRow(["", ...years.map((y) => y.badge ?? "")]);
    br.eachCell({ includeEmpty: false }, (c) => {
      c.style = {
        ...STYLE_BODY_TEXT,
        font: { ...STYLE_BODY_TEXT.font, italic: true, size: 9 },
        alignment: { horizontal: "center" },
      };
    });
  }

  // Revenue / COGS / Gross Profit / OPEX / EBITDA
  pushLine(
    ws,
    "Revenue",
    years.map((y) => y.revenue),
  );
  pushLine(
    ws,
    "Cost of Sales",
    years.map((y) => y.cogs),
  );
  pushLine(
    ws,
    "Operating Expenses",
    years.map((y) => y.opex),
  );
  pushLine(
    ws,
    "EBITDA",
    years.map((y) => y.ebitda),
    { focal: true },
  );

  // EBITDA Margin %  (formula = EBITDA / Revenue per year)
  const ebitdaRow = ws.rowCount; // last added row
  const revenueRow = ebitdaRow - 3; // Revenue is 3 rows above EBITDA
  const mr = ws.addRow(["EBITDA Margin %"]);
  mr.getCell(1).style = STYLE_SECTION_LABEL;
  for (let i = 0; i < years.length; i++) {
    const col = colLetter(2 + i);
    const cell = mr.getCell(2 + i);
    cell.value = {
      formula: `IFERROR(${col}${ebitdaRow}/${col}${revenueRow},0)`,
    };
    cell.style = STYLE_TABLE_PCT;
  }
  blank(ws);

  // ── Section B: Cumulative Totals (summary block) ──────────────────────────
  section(ws, "B. 15-YEAR CUMULATIVE TOTALS", STYLE_H_GREEN, totalCols);
  // Each summary line uses SUM across the corresponding range row
  const totalRevenueRow = revenueRow;
  const cogsRow = revenueRow + 1;
  const opexRow = revenueRow + 2;
  const ebitdaTotalRow = ebitdaRow;
  const sumRange = (rn: number) =>
    `SUM(${colLetter(2)}${rn}:${colLetter(1 + years.length)}${rn})`;

  pushSummary(ws, "Cumulative Revenue", sumRange(totalRevenueRow));
  pushSummary(ws, "Cumulative Cost of Sales", sumRange(cogsRow));
  pushSummary(ws, "Cumulative Operating Expenses", sumRange(opexRow));
  pushSummary(ws, "Cumulative EBITDA", sumRange(ebitdaTotalRow), true);
  blank(ws);

  // ── Section C: Per-Entity Revenue ─────────────────────────────────────────
  if (spec.trackRecord.perEntityRevenue.length) {
    section(
      ws,
      `C. PER-ENTITY HISTORICAL REVENUE (${spec.company.currency})`,
      STYLE_H_LIGHT_BLUE,
      totalCols,
    );
    const eh = ws.addRow(["Entity", ...years.map((y) => String(y.year))]);
    eh.eachCell(
      { includeEmpty: false },
      (c) => (c.style = { ...STYLE_COL_HEADER }),
    );
    for (const ent of spec.trackRecord.perEntityRevenue) {
      const vals = years.map((y) => ent.byYear[y.year] ?? null);
      pushLine(ws, ent.code, vals, { sparse: true });
    }
    blank(ws);
  }

  // ── Section D: Per-Entity EBITDA ──────────────────────────────────────────
  if (spec.trackRecord.perEntityEbitda.length) {
    section(
      ws,
      `D. PER-ENTITY HISTORICAL EBITDA (${spec.company.currency})`,
      STYLE_H_LIGHT_BLUE,
      totalCols,
    );
    const eh = ws.addRow(["Entity", ...years.map((y) => String(y.year))]);
    eh.eachCell(
      { includeEmpty: false },
      (c) => (c.style = { ...STYLE_COL_HEADER }),
    );
    for (const ent of spec.trackRecord.perEntityEbitda) {
      const vals = years.map((y) => ent.byYear[y.year] ?? null);
      pushLine(ws, ent.code, vals, { sparse: true, lossColor: true });
    }
    blank(ws);
  }

  // ── Section E: Audit Availability ─────────────────────────────────────────
  if (spec.trackRecord.auditAvailability.length) {
    section(
      ws,
      "E. AUDITED FINANCIAL STATEMENTS AVAILABILITY",
      STYLE_H_NAVY,
      totalCols,
    );
    const yrs = ["2021", "2022", "2023", "2024"];
    const ah = ws.addRow(["Entity", ...yrs, "Notes"]);
    for (let c = 1; c <= 2 + yrs.length; c++)
      ah.getCell(c).style = STYLE_COL_HEADER;
    ah.height = 22;
    for (const a of spec.trackRecord.auditAvailability) {
      const r = ws.addRow([
        a.entity,
        ...yrs.map((y) => a.years[y] ?? "—"),
        a.notes,
      ]);
      r.getCell(1).style = STYLE_TABLE_BODY;
      yrs.forEach((_, i) => {
        r.getCell(2 + i).style = {
          ...STYLE_TABLE_BODY,
          alignment: { horizontal: "center" },
          font: {
            ...STYLE_TABLE_BODY.font,
            color: { argb: COLOR.green },
            bold: true,
          },
        };
      });
      r.getCell(2 + yrs.length).style = STYLE_TABLE_BODY;
    }
    blank(ws);
  }

  // ── Section F: Key Insights ───────────────────────────────────────────────
  if (spec.trackRecord.insights.length) {
    section(ws, "F. KEY INSIGHTS FOR INVESTOR", STYLE_H_GREEN, totalCols);
    for (const i of spec.trackRecord.insights) {
      const r = ws.addRow([i.label, i.detail]);
      ws.mergeCells(r.number, 2, r.number, totalCols);
      r.getCell(1).style = {
        ...STYLE_BODY_TEXT,
        font: { ...STYLE_BODY_TEXT.font, bold: true },
      };
      r.getCell(2).style = STYLE_BODY_TEXT;
      r.height = 32;
    }
    blank(ws);
  }

  // Sources footer
  const sf = ws.addRow([`Sources: ${spec.trackRecord.sources}`]);
  ws.mergeCells(sf.number, 1, sf.number, totalCols);
  sf.getCell(1).style = {
    ...STYLE_BODY_TEXT,
    font: {
      ...STYLE_BODY_TEXT.font,
      italic: true,
      size: 9,
      color: { argb: COLOR.navy },
    },
  };
  sf.height = 30;

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

interface LineOpts {
  focal?: boolean;
  sparse?: boolean;
  lossColor?: boolean;
}
function pushLine(
  ws: Worksheet,
  label: string,
  values: (number | null)[],
  opts: LineOpts = {},
): void {
  const r = ws.addRow([label, ...values.map((v) => (v == null ? "-" : v))]);
  r.getCell(1).style = opts.focal ? STYLE_SUBTOTAL_LABEL : STYLE_SECTION_LABEL;
  values.forEach((v, i) => {
    const cell = r.getCell(2 + i);
    if (v == null) {
      cell.value = "-";
      cell.style = {
        ...STYLE_BODY_NUM,
        alignment: { horizontal: "center" },
      };
    } else if (opts.focal) {
      cell.style = { ...STYLE_FOCAL };
    } else if (opts.lossColor && typeof v === "number" && v < 0) {
      cell.style = STYLE_LOSS;
    } else {
      cell.style = STYLE_TABLE_NUM;
    }
  });
}

function pushSummary(
  ws: Worksheet,
  label: string,
  formula: string,
  focal = false,
): void {
  const r = ws.addRow([label]);
  r.getCell(1).style = focal ? STYLE_SUBTOTAL_LABEL : STYLE_SECTION_LABEL;
  // Merge cols 2..3 for the value; emit formula
  const c = r.getCell(2);
  c.value = { formula };
  c.style = focal ? STYLE_FOCAL : { ...STYLE_SUBTOTAL, numFmt: NUMFMT.money };
}
