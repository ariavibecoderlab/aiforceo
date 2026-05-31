/**
 * Styling tokens for the Investor Pack workbook.
 * Colors and number formats reverse-engineered from the BBGB v6 source file.
 *
 * Color-coding convention (industry standard for finance models):
 *   - Blue text on pale-yellow fill = editable INPUTS
 *   - Black text                    = FORMULAS / calculated cells
 *   - Green text                    = cross-sheet links
 *   - Amber fill                    = key totals / focal cells
 *   - Dark red text                 = loss / negative emphasis
 */

import type { Fill, Font, Borders, Style } from "exceljs";

// ─── Palette ─────────────────────────────────────────────────────────────────
export const COLOR = {
  navy: "FF1F3864", // primary brand band
  green: "FF548235", // secondary section band
  amber: "FFFFC000", // key totals / EBITDA focal
  inputBlue: "FF0000FF", // input text (editable)
  inputFill: "FFFFF2CC", // pale yellow input background
  lossRed: "FF8B0000", // negative emphasis
  white: "FFFFFFFF",
  black: "FF000000",

  // Light section fills
  lightBlue: "FFDDEBF7",
  lightGreen: "FFE2EFDA",
  lightOrange: "FFFCE4D6",
  lightGray: "FFF2F2F2",

  // Border
  border: "FFBFBFBF",
} as const;

// ─── Number formats ──────────────────────────────────────────────────────────
export const NUMFMT = {
  // Use parentheses for negatives; show "-" for zero
  money: '#,##0;(#,##0);"-"',
  moneyDecimal: '#,##0.00;(#,##0.00);"-"',
  pct: '0.0%;(0.0%);"-"',
  pctNoDec: '0%;(0%);"-"',
  multiple: '0.0"x"',
  year: "0", // bare year, no thousands separator
  intCount: '#,##0;(#,##0);"-"',
} as const;

// ─── Fonts ───────────────────────────────────────────────────────────────────
export const FONT = {
  base: { name: "Arial", size: 10 } as Partial<Font>,
  baseBold: { name: "Arial", size: 10, bold: true } as Partial<Font>,
} as const;

// ─── Style presets (passed to cell.style = {...}) ────────────────────────────
// ExcelJS's strict types require fields we don't need (e.g. shrinkToFit,
// indent, textRotation). We return loosely-typed shapes — ExcelJS reads them
// via `cell.style = ...` which accepts Partial<Style>.

type Vertical = "top" | "middle" | "bottom" | "distributed" | "justify";

function fill(argb: string): Fill {
  return {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb },
    bgColor: { argb },
  };
}

function font(opts: Partial<Font>): Partial<Font> {
  return { name: "Arial", size: 10, ...opts };
}

function center(v: Vertical = "middle") {
  return { horizontal: "center" as const, vertical: v, wrapText: true };
}

function left(v: Vertical = "middle") {
  return { horizontal: "left" as const, vertical: v, wrapText: true };
}

function right(v: Vertical = "middle") {
  return { horizontal: "right" as const, vertical: v };
}

function thinBorders(color = COLOR.border): Borders {
  const side = { style: "thin" as const, color: { argb: color } };
  return {
    top: side,
    left: side,
    bottom: side,
    right: side,
    diagonal: { up: false, down: false },
  };
}

/** Massive title bar — navy with white 14pt bold, centered + merged */
export const STYLE_TITLE: Partial<Style> = {
  font: font({ size: 14, bold: true, color: { argb: COLOR.white } }),
  fill: fill(COLOR.navy),
  alignment: center(),
};

/** Subtitle — navy on light gray */
export const STYLE_SUBTITLE: Partial<Style> = {
  font: font({ bold: true, color: { argb: COLOR.navy } }),
  fill: fill(COLOR.lightGray),
  alignment: center(),
};

/** Section header navy — white on navy */
export const STYLE_H_NAVY: Partial<Style> = {
  font: font({ bold: true, color: { argb: COLOR.white } }),
  fill: fill(COLOR.navy),
  alignment: left(),
};

/** Section header green — white on green */
export const STYLE_H_GREEN: Partial<Style> = {
  font: font({ bold: true, color: { argb: COLOR.white } }),
  fill: fill(COLOR.green),
  alignment: left(),
};

/** Sub-band blue — navy bold on light blue */
export const STYLE_H_LIGHT_BLUE: Partial<Style> = {
  font: font({ bold: true, color: { argb: COLOR.navy } }),
  fill: fill(COLOR.lightBlue),
  alignment: left(),
};

/** Sub-band green — black bold on light green */
export const STYLE_H_LIGHT_GREEN: Partial<Style> = {
  font: font({ bold: true, color: { argb: COLOR.black } }),
  fill: fill(COLOR.lightGreen),
  alignment: left(),
};

/** Sub-band orange — black bold on light orange */
export const STYLE_H_LIGHT_ORANGE: Partial<Style> = {
  font: font({ bold: true, color: { argb: COLOR.black } }),
  fill: fill(COLOR.lightOrange),
  alignment: left(),
};

/** Editable input cell (blue text on pale yellow) */
export const STYLE_INPUT: Partial<Style> = {
  font: font({ color: { argb: COLOR.inputBlue } }),
  fill: fill(COLOR.inputFill),
  numFmt: NUMFMT.money,
  border: thinBorders(),
};

export const STYLE_INPUT_PCT: Partial<Style> = {
  ...STYLE_INPUT,
  numFmt: NUMFMT.pct,
};

/** Focal cell — amber fill, bold, used for EBITDA, totals, multiples */
export const STYLE_FOCAL: Partial<Style> = {
  font: font({ bold: true, size: 12 }),
  fill: fill(COLOR.amber),
  alignment: right(),
  numFmt: NUMFMT.money,
};

/** Subtotal row (bold) */
export const STYLE_SUBTOTAL: Partial<Style> = {
  font: font({ bold: true, size: 11 }),
  fill: fill(COLOR.lightBlue),
  alignment: right(),
  numFmt: NUMFMT.money,
};

export const STYLE_SUBTOTAL_LABEL: Partial<Style> = {
  font: font({ bold: true, size: 11 }),
  fill: fill(COLOR.lightBlue),
  alignment: left(),
};

/** Body cell — plain, money numfmt */
export const STYLE_BODY_NUM: Partial<Style> = {
  font: font({}),
  alignment: right(),
  numFmt: NUMFMT.money,
};

export const STYLE_BODY_TEXT: Partial<Style> = {
  font: font({}),
  alignment: left(),
};

/** Loss highlight — dark red bold */
export const STYLE_LOSS: Partial<Style> = {
  font: font({ bold: true, color: { argb: COLOR.lossRed } }),
  alignment: right(),
  numFmt: NUMFMT.money,
};

/** Column header (table) — bold, navy on light blue, centered */
export const STYLE_COL_HEADER: Partial<Style> = {
  font: font({ bold: true, color: { argb: COLOR.navy } }),
  fill: fill(COLOR.lightBlue),
  alignment: center(),
  border: thinBorders(),
};

/** Body row, with thin border */
export const STYLE_TABLE_BODY: Partial<Style> = {
  font: font({}),
  alignment: left(),
  border: thinBorders(),
};

export const STYLE_TABLE_NUM: Partial<Style> = {
  font: font({}),
  alignment: right(),
  numFmt: NUMFMT.money,
  border: thinBorders(),
};

export const STYLE_TABLE_PCT: Partial<Style> = {
  font: font({}),
  alignment: right(),
  numFmt: NUMFMT.pct,
  border: thinBorders(),
};

/** Section divider — dark navy bold no fill (for the "B. PERFORMANCE" headers) */
export const STYLE_SECTION_LABEL: Partial<Style> = {
  font: font({ bold: true, size: 11, color: { argb: COLOR.navy } }),
  alignment: left(),
};

/** Quote / callout — italic centered */
export const STYLE_QUOTE: Partial<Style> = {
  font: font({ italic: true, size: 11, color: { argb: COLOR.navy } }),
  alignment: { horizontal: "center", vertical: "middle", wrapText: true },
};
