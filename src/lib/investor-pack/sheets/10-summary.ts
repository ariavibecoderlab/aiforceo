/**
 * Tab 10 — INVESTMENT OPPORTUNITY SUMMARY
 * Snapshot + 10-year track table + EV/EBITDA valuation scenarios (with formulas)
 * + thesis + risk/mitigation.
 */

import type { Workbook, Worksheet, Row, Style } from "exceljs";
import type { InvestorPackSpec } from "../spec";
import {
  STYLE_TITLE,
  STYLE_SUBTITLE,
  STYLE_H_NAVY,
  STYLE_H_GREEN,
  STYLE_H_LIGHT_ORANGE,
  STYLE_BODY_TEXT,
  STYLE_LOSS,
  STYLE_SECTION_LABEL,
  STYLE_COL_HEADER,
  STYLE_TABLE_BODY,
  STYLE_TABLE_NUM,
  STYLE_TABLE_PCT,
  STYLE_INPUT,
  STYLE_FOCAL,
  STYLE_QUOTE,
  NUMFMT,
  COLOR,
} from "../styles";

export function buildInvestmentSummarySheet(
  wb: Workbook,
  spec: InvestorPackSpec,
): Worksheet {
  const ws = wb.addWorksheet("10 INVESTMENT SUMMARY", {
    properties: { defaultRowHeight: 18 },
    views: [{ state: "frozen", ySplit: 4 }],
  });

  // 5 columns: label | value | computed | comp | comments
  ws.columns = [
    { width: 40 },
    { width: 22 },
    { width: 18 },
    { width: 18 },
    { width: 40 },
  ];

  // ── Title ─────────────────────────────────────────────────────────────────
  const r1 = ws.addRow(["INVESTMENT OPPORTUNITY SUMMARY"]);
  ws.mergeCells(r1.number, 1, r1.number, 5);
  r1.height = 28;
  styleRow(r1, STYLE_TITLE);

  const r2 = ws.addRow([
    `${spec.company.legalName} · Founded ${spec.company.foundedYear} · IPO Target ${spec.company.ipoTarget}`,
  ]);
  ws.mergeCells(r2.number, 1, r2.number, 5);
  r2.height = 22;
  styleRow(r2, STYLE_SUBTITLE);

  blank(ws);

  // ── THE OPPORTUNITY snapshot ──────────────────────────────────────────────
  section(ws, "THE OPPORTUNITY", STYLE_H_NAVY, 5);
  for (const { label, value } of spec.investment.snapshot) {
    const r = ws.addRow([label, value]);
    ws.mergeCells(r.number, 2, r.number, 5);
    r.getCell(1).style = STYLE_SECTION_LABEL;
    r.getCell(2).style = STYLE_BODY_TEXT;
  }
  blank(ws);

  // ── 10-YEAR FINANCIAL SNAPSHOT ────────────────────────────────────────────
  section(
    ws,
    "10-YEAR FINANCIAL SNAPSHOT — Audited Track Record",
    STYLE_H_GREEN,
    5,
  );

  // Header row
  const tr = ws.addRow([
    "FY",
    `Revenue (${spec.company.currency})`,
    `EBITDA (${spec.company.currency})`,
    "Margin %",
    "Notes",
  ]);
  for (let c = 1; c <= 5; c++) tr.getCell(c).style = STYLE_COL_HEADER;
  tr.height = 22;

  // Take the last 10 years + Q1 + forecast — anything the spec provides
  const rows = spec.trackRecord.years;
  for (const yr of rows) {
    const r = ws.addRow([
      String(yr.year),
      yr.revenue || null,
      yr.ebitda || null,
      // Margin = EBITDA / Revenue — emit as formula, not precomputed
      yr.revenue
        ? { formula: `C${ws.rowCount + 1 - 1}/B${ws.rowCount + 1 - 1}` }
        : null,
      yr.note ?? "",
    ]);
    // Recompute correct row references — we need the row's actual number
    const rn = r.number;
    r.getCell(4).value = yr.revenue
      ? ({ formula: `IFERROR(C${rn}/B${rn},0)` } as unknown as string)
      : "";

    r.getCell(1).style = {
      ...STYLE_TABLE_BODY,
      alignment: { horizontal: "center" },
    };
    r.getCell(2).style = STYLE_TABLE_NUM;
    // Loss years rendered in dark red
    r.getCell(3).style = yr.ebitda < 0 ? STYLE_LOSS : STYLE_TABLE_NUM;
    r.getCell(4).style = STYLE_TABLE_PCT;
    r.getCell(5).style = STYLE_TABLE_BODY;
  }
  blank(ws);

  // ── VALUATION FRAMEWORK ───────────────────────────────────────────────────
  section(ws, "VALUATION FRAMEWORK", STYLE_H_NAVY, 5);

  const methodologyRow = ws.addRow([spec.investment.valuation.methodology]);
  ws.mergeCells(methodologyRow.number, 1, methodologyRow.number, 5);
  methodologyRow.getCell(1).style = {
    ...STYLE_BODY_TEXT,
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR.lightGray },
    },
    font: { ...STYLE_BODY_TEXT.font, italic: true },
  };
  methodologyRow.height = 30;
  blank(ws);

  // EBITDA base — focal cell (amber). This is the input that drives all scenarios.
  const ebitdaBaseRow = ws.addRow([
    `FY${spec.company.ipoTarget.replace(/\D/g, "").slice(0, 4) || "2026"}F EBITDA Base (${spec.company.currency})`,
    spec.investment.valuation.ebitdaBase,
    "",
    "",
    "Editable — drives valuation scenarios below",
  ]);
  ebitdaBaseRow.getCell(1).style = STYLE_SECTION_LABEL;
  ebitdaBaseRow.getCell(2).style = STYLE_FOCAL;
  ebitdaBaseRow.getCell(5).style = {
    ...STYLE_BODY_TEXT,
    font: { ...STYLE_BODY_TEXT.font, italic: true, size: 9 },
  };
  const ebitdaBaseCell = `B${ebitdaBaseRow.number}`;

  // Cumulative EBITDA comparison baseline
  const cumRow = ws.addRow([
    `Cumulative EBITDA Reference (${spec.company.currency})`,
    spec.investment.valuation.cumulativeEbitda,
    "",
    "",
    "Used as comparison vs implied EV",
  ]);
  cumRow.getCell(1).style = STYLE_SECTION_LABEL;
  cumRow.getCell(2).style = { ...STYLE_INPUT, numFmt: NUMFMT.money };
  cumRow.getCell(5).style = {
    ...STYLE_BODY_TEXT,
    font: { ...STYLE_BODY_TEXT.font, italic: true, size: 9 },
  };
  const cumCell = `B${cumRow.number}`;
  blank(ws);

  // Scenarios table
  const sh = ws.addRow([
    "Scenario",
    "Multiple",
    `Implied EV (${spec.company.currency})`,
    "vs Cumulative EBITDA",
    "Comments",
  ]);
  for (let c = 1; c <= 5; c++) sh.getCell(c).style = STYLE_COL_HEADER;
  sh.height = 22;

  for (const sc of spec.investment.valuation.scenarios) {
    const r = ws.addRow([
      sc.name,
      sc.multiple,
      null, // formula
      null, // formula
      sc.comment,
    ]);
    const rn = r.number;
    r.getCell(3).value = { formula: `${ebitdaBaseCell}*B${rn}` };
    r.getCell(4).value = { formula: `IFERROR(C${rn}/${cumCell},0)` };

    r.getCell(1).style = STYLE_TABLE_BODY;
    r.getCell(2).style = {
      ...STYLE_TABLE_NUM,
      numFmt: '0.0"x"',
      font: { ...STYLE_TABLE_NUM.font, color: { argb: COLOR.inputBlue } },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLOR.inputFill },
      },
    };
    r.getCell(3).style = {
      ...STYLE_TABLE_NUM,
      font: { ...STYLE_TABLE_NUM.font, bold: true },
    };
    r.getCell(4).style = STYLE_TABLE_PCT;
    r.getCell(5).style = STYLE_TABLE_BODY;
    r.height = 22;
  }
  blank(ws);

  // ── WHY THIS DEAL — Investment Thesis ─────────────────────────────────────
  section(ws, "WHY THIS DEAL — INVESTMENT THESIS", STYLE_H_GREEN, 5);
  spec.investment.thesis.forEach((t, i) => {
    const r = ws.addRow([`${i + 1}. ${t.label}`, t.detail]);
    ws.mergeCells(r.number, 2, r.number, 5);
    r.getCell(1).style = {
      ...STYLE_BODY_TEXT,
      font: { ...STYLE_BODY_TEXT.font, bold: true },
    };
    r.getCell(2).style = STYLE_BODY_TEXT;
    r.height = 36;
  });
  blank(ws);

  // ── KEY RISKS & MITIGATIONS ───────────────────────────────────────────────
  section(ws, "KEY RISKS & MITIGATIONS", STYLE_H_LIGHT_ORANGE, 5);
  const rh = ws.addRow(["Risk", "Severity", "Mitigation"]);
  ws.mergeCells(rh.number, 3, rh.number, 5);
  for (let c = 1; c <= 3; c++) rh.getCell(c).style = STYLE_COL_HEADER;
  rh.height = 22;

  for (const risk of spec.investment.risks) {
    const r = ws.addRow([risk.risk, risk.severity, risk.mitigation]);
    ws.mergeCells(r.number, 3, r.number, 5);
    r.getCell(1).style = STYLE_TABLE_BODY;
    r.getCell(2).style = {
      ...STYLE_TABLE_BODY,
      alignment: { horizontal: "center" },
      font: {
        ...STYLE_TABLE_BODY.font,
        bold: true,
        color: {
          argb:
            risk.severity === "HIGH"
              ? COLOR.lossRed
              : risk.severity === "MEDIUM"
                ? "FFE89F1F"
                : COLOR.green,
        },
      },
    };
    r.getCell(3).style = STYLE_TABLE_BODY;
    r.height = 34;
  }
  blank(ws);
  blank(ws);

  // ── Closing quote ────────────────────────────────────────────────────────
  const q = ws.addRow([`"${spec.investment.quote}"`]);
  ws.mergeCells(q.number, 1, q.number, 5);
  q.getCell(1).style = {
    ...STYLE_QUOTE,
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR.lightGreen },
    },
  };
  q.height = 40;

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
