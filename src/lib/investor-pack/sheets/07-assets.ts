/**
 * Tab 07 — ASSET REGISTER + TRANSFER STRATEGY
 * Direct group/per-entity assets (with SUM totals + formula totals),
 * BBSB transferability assessment, property arrangement, execution roadmap.
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
  STYLE_H_LIGHT_ORANGE,
  STYLE_BODY_TEXT,
  STYLE_SECTION_LABEL,
  STYLE_COL_HEADER,
  STYLE_TABLE_BODY,
  STYLE_TABLE_NUM,
  STYLE_SUBTOTAL,
  STYLE_SUBTOTAL_LABEL,
  STYLE_LOSS,
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

export function buildAssetsSheet(
  wb: Workbook,
  spec: InvestorPackSpec,
): Worksheet {
  const ws = wb.addWorksheet("07 ASSET REGISTER", {
    properties: { defaultRowHeight: 18 },
    views: [{ state: "frozen", ySplit: 3 }],
  });

  // Determine per-entity columns from the direct-assets data
  const entityCols = (() => {
    const set = new Set<string>();
    for (const row of spec.assets.directAssets) {
      for (const k of Object.keys(row.amounts)) {
        if (k !== "group") set.add(k);
      }
    }
    return Array.from(set);
  })();

  const totalCols = 1 + 1 + 1 + entityCols.length; // # + Category + Group + entity cols

  ws.columns = [
    { width: 5 },
    { width: 40 },
    { width: 15 },
    ...entityCols.map(() => ({ width: 14 })),
  ];

  // Title
  const r1 = ws.addRow(["ASSET REGISTER + ASSET TRANSFER STRATEGY"]);
  ws.mergeCells(r1.number, 1, r1.number, totalCols);
  r1.height = 28;
  styleRow(r1, STYLE_TITLE);

  const r2 = ws.addRow([
    "BBSB stays separate · Transfer extractable assets to BBGB · Property via long-term lease",
  ]);
  ws.mergeCells(r2.number, 1, r2.number, totalCols);
  r2.height = 22;
  styleRow(r2, STYLE_SUBTITLE);
  blank(ws);

  // ── Section A: Group Direct Assets ────────────────────────────────────────
  section(
    ws,
    `A. GROUP DIRECT ASSETS (${spec.company.currency})`,
    STYLE_H_NAVY,
    totalCols,
  );
  const head = ws.addRow([
    "#",
    "Asset Category",
    `Group (${spec.company.currency})`,
    ...entityCols.map((e) => `${e} (${spec.company.currency})`),
  ]);
  head.eachCell({ includeEmpty: false }, (c) => (c.style = STYLE_COL_HEADER));
  head.height = 24;

  const firstAssetRow = ws.rowCount + 1;
  for (const row of spec.assets.directAssets) {
    const r = ws.addRow([
      row.no,
      row.category,
      row.amounts.group,
      ...entityCols.map((e) => row.amounts[e] ?? 0),
    ]);
    r.getCell(1).style = {
      ...STYLE_TABLE_BODY,
      alignment: { horizontal: "center" },
    };
    r.getCell(2).style = STYLE_TABLE_BODY;
    r.getCell(3).style = {
      ...STYLE_TABLE_NUM,
      font: { ...STYLE_TABLE_NUM.font, bold: true },
    };
    for (let i = 0; i < entityCols.length; i++) {
      r.getCell(4 + i).style = STYLE_TABLE_NUM;
    }
  }
  const lastAssetRow = ws.rowCount;

  // SUM totals row
  const tr = ws.addRow([
    "",
    "GROUP DIRECT ASSETS — TOTAL",
    { formula: `SUM(C${firstAssetRow}:C${lastAssetRow})` },
    ...entityCols.map((_, i) => ({
      formula: `SUM(${colLetter(4 + i)}${firstAssetRow}:${colLetter(4 + i)}${lastAssetRow})`,
    })),
  ]);
  tr.getCell(1).style = STYLE_SUBTOTAL_LABEL;
  tr.getCell(2).style = STYLE_SUBTOTAL_LABEL;
  tr.getCell(3).style = STYLE_SUBTOTAL;
  for (let i = 0; i < entityCols.length; i++)
    tr.getCell(4 + i).style = STYLE_SUBTOTAL;
  tr.height = 24;
  blank(ws);

  // ── Section B: BBSB Transferability ───────────────────────────────────────
  // This section uses 8 columns (different from the entity-grid above).
  const transferCols = 8;
  section(
    ws,
    "B. BBSB ASSETS — TRANSFERABILITY ASSESSMENT",
    STYLE_H_GREEN,
    transferCols,
  );

  const th2 = ws.addRow([
    "#",
    "Asset",
    "Description",
    `Est. Value (${spec.company.currency})`,
    "Transferable?",
    "Mechanism",
    "Target Entity",
    "Status",
  ]);
  for (let c = 1; c <= transferCols; c++)
    th2.getCell(c).style = STYLE_COL_HEADER;
  th2.height = 24;

  let totalExtractable = 0;
  const firstTRow = ws.rowCount + 1;
  for (const t of spec.assets.transferable) {
    const r = ws.addRow([
      t.no,
      t.asset,
      t.description,
      t.estValue,
      t.transferable,
      t.mechanism,
      t.targetEntity,
      t.status,
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
    r.getCell(4).style = t.estValue < 0 ? STYLE_LOSS : STYLE_TABLE_NUM;
    r.getCell(5).style = {
      ...STYLE_TABLE_BODY,
      alignment: { horizontal: "center" },
      font: {
        ...STYLE_TABLE_BODY.font,
        bold: true,
        color: {
          argb: t.transferable.includes("✅")
            ? COLOR.green
            : t.transferable.includes("❌")
              ? COLOR.lossRed
              : COLOR.navy,
        },
      },
    };
    r.getCell(6).style = STYLE_TABLE_BODY;
    r.getCell(7).style = STYLE_TABLE_BODY;
    r.getCell(8).style = STYLE_TABLE_BODY;
    r.height = 26;

    if (t.transferable.startsWith("✅") && t.estValue > 0) {
      totalExtractable += t.estValue;
    }
  }

  // Totals
  const extractableRow = ws.addRow([
    "",
    "TOTAL EXTRACTABLE VALUE FROM BBSB → BBGB",
    "",
    totalExtractable,
    `~${spec.company.currency} ${(totalExtractable / 1_000_000).toFixed(1)}M`,
    "Brand IP + Curriculum + F&F + Database",
    "",
    "",
  ]);
  ws.mergeCells(extractableRow.number, 1, extractableRow.number, 3);
  ws.mergeCells(extractableRow.number, 6, extractableRow.number, 8);
  extractableRow.getCell(1).style = STYLE_SUBTOTAL_LABEL;
  extractableRow.getCell(4).style = STYLE_SUBTOTAL;
  extractableRow.getCell(5).style = {
    ...STYLE_SUBTOTAL_LABEL,
    alignment: { horizontal: "center" },
  };
  extractableRow.getCell(6).style = STYLE_SUBTOTAL_LABEL;
  extractableRow.height = 24;
  blank(ws);

  // ── Section C: Property Arrangement ───────────────────────────────────────
  if (spec.assets.propertyArrangement.length) {
    section(
      ws,
      "C. PROPERTY USAGE — LONG-TERM LEASE",
      STYLE_H_LIGHT_BLUE,
      transferCols,
    );
    for (const p of spec.assets.propertyArrangement) {
      const r = ws.addRow([p.label, "", "", p.detail]);
      ws.mergeCells(r.number, 1, r.number, 3);
      ws.mergeCells(r.number, 4, r.number, transferCols);
      r.getCell(1).style = {
        ...STYLE_BODY_TEXT,
        font: { ...STYLE_BODY_TEXT.font, bold: true },
      };
      r.getCell(4).style = STYLE_BODY_TEXT;
      r.height = 28;
    }
    blank(ws);
  }

  // ── Section D: Execution Roadmap ──────────────────────────────────────────
  if (spec.assets.roadmap.length) {
    section(
      ws,
      "D. ASSET TRANSFER ROADMAP — PRE-IPO EXECUTION SEQUENCE",
      STYLE_H_GREEN,
      transferCols,
    );
    const rh = ws.addRow([
      "Phase",
      "Timing",
      "Action",
      "",
      "",
      "Owner",
      "Deliverable",
      "Status",
    ]);
    ws.mergeCells(rh.number, 3, rh.number, 5);
    for (let c = 1; c <= transferCols; c++) {
      const cell = rh.getCell(c);
      if (!cell.value && c > 1) cell.value = "";
      cell.style = STYLE_COL_HEADER;
    }
    rh.height = 22;
    for (const ph of spec.assets.roadmap) {
      const r = ws.addRow([
        ph.phase,
        ph.timing,
        ph.action,
        "",
        "",
        ph.owner,
        ph.deliverable,
        ph.status,
      ]);
      ws.mergeCells(r.number, 3, r.number, 5);
      r.getCell(1).style = {
        ...STYLE_TABLE_BODY,
        font: {
          ...STYLE_TABLE_BODY.font,
          bold: true,
          color: { argb: COLOR.navy },
        },
      };
      r.getCell(2).style = {
        ...STYLE_TABLE_BODY,
        alignment: { horizontal: "center" },
      };
      r.getCell(3).style = STYLE_TABLE_BODY;
      r.getCell(6).style = STYLE_TABLE_BODY;
      r.getCell(7).style = STYLE_TABLE_BODY;
      r.getCell(8).style = {
        ...STYLE_TABLE_BODY,
        alignment: { horizontal: "center" },
        font: {
          ...STYLE_TABLE_BODY.font,
          bold: true,
          color: { argb: COLOR.green },
        },
      };
      r.height = 24;
    }
    blank(ws);
  }

  // ── Section E: Key Notes ──────────────────────────────────────────────────
  if (spec.assets.notes.length) {
    section(
      ws,
      "E. KEY NOTES & EXECUTION RISKS",
      STYLE_H_LIGHT_ORANGE,
      transferCols,
    );
    spec.assets.notes.forEach((n, i) => {
      const r = ws.addRow([`${i + 1}. ${n}`]);
      ws.mergeCells(r.number, 1, r.number, transferCols);
      r.getCell(1).style = STYLE_BODY_TEXT;
      r.height = 28;
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
