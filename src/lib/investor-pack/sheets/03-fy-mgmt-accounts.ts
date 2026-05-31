/**
 * Tab 03 — FY MANAGEMENT ACCOUNTS (Per-Entity)
 * Renders the latest full-year management accounts using the shared
 * mgmt-accounts renderer.
 */

import type { Workbook, Worksheet } from "exceljs";
import type { InvestorPackSpec } from "../spec";
import { buildMgmtAccountSheet } from "./mgmt-accounts";

export function buildFyMgmtAccountsSheet(
  wb: Workbook,
  spec: InvestorPackSpec,
): Worksheet {
  return buildMgmtAccountSheet(
    wb,
    `03 ${spec.mgmtAccounts.fyLatest.period} MGMT ACCOUNTS`,
    spec.mgmtAccounts.fyLatest,
    spec,
  );
}
