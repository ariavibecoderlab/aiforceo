/**
 * Sample InvestorPackSpec — Brainy Bunch Group (BBGB) v6.
 * Pulled from the reference workbook. Used as the Phase-1 proof input.
 *
 * In Phase 3+ this will be replaced by AI-CFO-generated specs sourced from
 * each workspace's actual financial data.
 */

import type { InvestorPackSpec } from "../spec";

export const BBGB_SPEC: InvestorPackSpec = {
  version: "v6",
  generatedAt: new Date().toISOString(),

  company: {
    legalName: "Brainy Bunch Group Berhad (BBGB)",
    shortName: "BBGB",
    industry:
      "Islamic Montessori Education (Preschool to International School)",
    foundedYear: 2010,
    geography: "Cyberjaya, Kuala Lumpur, Johor + multi-state preschool network",
    scale: "~10,000 students | 6 active operating subsidiaries",
    ipoTarget: "FY2029/2030 — Bursa Malaysia ACE Market",
    currency: "RM",
    locale: "en-MY",
  },

  cover: {
    title: "BRAINY BUNCH GROUP BERHAD — INVESTOR DUE DILIGENCE PACK (v6)",
    subtitle:
      "15-Year Audited Track Record · RM 898M Cumulative Revenue · Pre-IPO Equity Opportunity · Bursa ACE Target 2029/2030",
    executiveSummary: [
      { label: "Group", value: "Brainy Bunch Group Berhad (BBGB)" },
      {
        label: "Industry",
        value:
          "Islamic Montessori Education (Preschool to International School)",
      },
      { label: "Founded", value: "2010 — 15-year operating history" },
      {
        label: "Geography",
        value: "Cyberjaya, Kuala Lumpur, Johor + multi-state preschool network",
      },
      {
        label: "Scale",
        value: "~10,000 students | 6 active operating subsidiaries",
      },
      {
        label: "FY2011–FY2026F Revenue (Cumulative)",
        value: "RM 897,875,291 (~RM 898M)",
      },
      {
        label: "FY2011–FY2026F EBITDA (Cumulative)",
        value: "RM 93,210,967 (~RM 93M)",
      },
      { label: "Peak FY Revenue", value: "FY2024 — RM 106.65M" },
      {
        label: "FY2025 Revenue (Mgmt Accounts)",
        value: "RM 97.99M | EBITDA RM 11.50M",
      },
      {
        label: "Q1 2026 Revenue (Actual)",
        value: "RM 43.45M | EBITDA RM 21.43M (49.3% margin)",
      },
      {
        label: "FY2026F Revenue (Company Forecast)",
        value: "RM 106.03M | EBITDA RM 19.97M",
      },
      {
        label: "Total Investment in Subsidiaries",
        value: "RM 14,459,724 (BBGB paid-up across 6 subs)",
      },
      {
        label: "BBGB Direct EPF Liability",
        value: "RM ~6.5M (Education Group only)",
      },
      {
        label: "BBGB Direct LHDN Liability",
        value: "RM ~3M (actual; appealing penalty)",
      },
      {
        label: "Related Party — Cyberjaya Property",
        value: "RM 85M (Knight Frank) — held by BBSB",
      },
      {
        label: "Strategic Direction",
        value:
          "Transfer extractable assets BBSB → BBGB (~RM 22.5M); long-term tenancy for property",
      },
      { label: "IPO Target", value: "FY2029/2030 — Bursa Malaysia ACE Market" },
      {
        label: "Audit Status",
        value: "FY2021–FY2024 audited ✅ | FY2025 in progress",
      },
    ],
    structuralDisclosures: [
      {
        label: "1. RM 85M Cyberjaya Property NOT in BBGB",
        detail:
          "Held by BBSB (founder Coach Fadzil entity). EPF legal restrictions prevent transfer to BBGB. Strategy: Long-term tenancy + asset extraction (~RM 22.5M transferable). See Tab 07.",
      },
      {
        label: "2. BBIS Cyberjaya is 67% Owned by BBGB",
        detail:
          "33% held by Mr Fadzil Hashim + Madam Efizah Hashim (founders) personally. Not external party. Future consolidation via share swap. See Tab 05.",
      },
      {
        label: "3. FY2023 Loss Year (-RM 5.18M EBITDA)",
        detail:
          "One-time costs from operations migration (legacy BBSB → 6 new subsidiaries). FY2024 recovered to +RM 5.76M; FY2025 to +RM 11.50M. See Tab 02.",
      },
    ],
    checklist: [
      {
        no: 1,
        request: "Audited Accounts + Q1 2026 Accounts",
        status:
          "✅ READY — FY2021-FY2024 audited (5 entities); FY2025 mgmt accts; Q1 2026 actual",
        tab: "Tab 02, 03, 04",
      },
      {
        no: 2,
        request: "Corporate Structure & Shareholding",
        status: "✅ READY — 6 subs, BBIS C 33% identified",
        tab: "Tab 05",
      },
      {
        no: 3,
        request: "EPF Liability Details",
        status: "✅ READY — RM 6.5M direct (Education Group)",
        tab: "Tab 06",
      },
      {
        no: 4,
        request: "Total Asset Value & Ownership",
        status: "✅ READY — Property disclosed + asset transfer plan",
        tab: "Tab 07",
      },
      {
        no: 5,
        request: "Financial Projections (3+ Years to IPO)",
        status: "✅ READY — Through FY2030 IPO year",
        tab: "Tab 08, 09",
      },
    ],
    documentsOnFile: [
      { label: "📋 4 × Audited Financial Statements — BBPS (FY2021-FY2024)" },
      {
        label:
          "📋 4 × Audited Financial Statements — BBIS Cyberjaya (FY2021-FY2024)",
      },
      {
        label: "📋 4 × Audited Financial Statements — BBIS KL (FY2021-FY2024)",
      },
      { label: "📋 1 × Audited Financial Statement — BBIS Johor (FY2024)" },
      {
        label:
          "📋 4 × Audited Financial Statements — Early Years Development (FY2021-FY2024)",
      },
      { label: "📋 1 × Audited Financial Statement — BBGB Holdco (FY2024)" },
      {
        label:
          "📋 FY2025 Management Accounts (per-entity P&L + Group Balance Sheet)",
      },
      { label: "📋 Q1 2026 Management Accounts (per-entity EBITDA)" },
      {
        label:
          "📋 Knight Frank Property Valuation Report (10 October 2024) — RM 85M Cyberjaya",
      },
      { label: "📋 Group EPF Pending Payment Register (04/03/2026)" },
    ],
    outstanding: [
      "FY2025 audited financial statements (completion by appointed auditor)",
      "BBSB FY2024 audited statement (held outside BBGB — request from Coach Fadzil)",
      "LHDN penalty appeal outcome",
      "Fixed asset register details per entity (vehicles, equipment, F&F)",
      "Pre-existing BBGB shareholders cap table (Coach Fadzil + any others)",
      "Independent valuation reports for asset transfers (Brand IP, Curriculum, F&F)",
      "Investor's preferred ticket size & strategic intent",
    ],
    confidentiality: [
      "Confidential — intended for named recipient only. Recipient agrees to return or destroy this document upon request.",
      "FY2021-FY2024 figures sourced from audited financial statements; FY2025 from management accounts (audit in progress); Q1 2026 from internal management accounts.",
      "15-year track record consolidated from BBGroup Financial Performance file (including legacy BBSB operations and current 6 BBGB subsidiaries).",
      "BBSB Sdn Bhd is NOT a subsidiary of BBGB — disclosed as related party (founder-controlled entity).",
      "Knight Frank property valuation dated 10 October 2024 — original report available for review.",
      "Forward projections (FY2026F-2029F) are forward-looking estimates — actual results may vary materially.",
      "This pack does not constitute an offer to sell securities — terms to be negotiated separately under definitive agreements.",
    ],
  },

  highlights: [
    {
      icon: "📊",
      label: "15-Year Operating History (2011-2026F)",
      detail:
        "Cumulative Revenue RM 897.88M | Cumulative EBITDA RM 93.21M | 14 of 16 years profitable",
    },
    {
      icon: "📋",
      label: "4 Years of Audited Statements (FY2021-FY2024)",
      detail:
        "Available for BBPS, BBIS C, BBIS KL, BBIS J, EYD, BBGB Holdco — substantial DD trail",
    },
    {
      icon: "🦠",
      label: "COVID Resilience",
      detail:
        "Maintained RM 8.36M EBITDA in FY2020 despite 49% revenue drop — education sector defensive",
    },
    {
      icon: "🚀",
      label: "Strong FY2026 Start",
      detail:
        "Q1 2026 ACTUAL EBITDA RM 21.43M (49.3% margin) — exceeds full-year company forecast",
    },
    {
      icon: "💰",
      label: "Manageable Statutory Exposure",
      detail:
        "EPF: RM 6.5M | LHDN: RM 3M actual (penalty under appeal) — single-quarter EBITDA covers 2.4×",
    },
    {
      icon: "🎯",
      label: "Clean Corporate Structure",
      detail:
        "BBGB Holdco + 6 operating subsidiaries; BBSB legacy entity stays separate (extracts ~RM 22.5M assets to BBGB)",
    },
  ],

  trackRecord: {
    subtitle:
      "Verified from BBGROUP Financial Performance file | Cumulative Revenue ~RM 898M | Cumulative EBITDA ~RM 93M",
    years: [
      {
        year: 2016,
        revenue: 38688328,
        cogs: 13552307,
        opex: 19471487,
        ebitda: 5664534,
        note: "Steady operations",
      },
      {
        year: 2017,
        revenue: 44467694,
        cogs: 16127161,
        opex: 22452656,
        ebitda: 5887877,
        note: "Growth continues",
      },
      {
        year: 2018,
        revenue: 54259106,
        cogs: 20033745,
        opex: 29187093,
        ebitda: 5038268,
        note: "Network expansion",
      },
      {
        year: 2019,
        revenue: 85383447,
        cogs: 29434324,
        opex: 43619217,
        ebitda: 12329906,
        note: "🏆 Pre-COVID peak",
      },
      {
        year: 2020,
        revenue: 43155267,
        cogs: 13538463,
        opex: 21258069,
        ebitda: 8355486,
        note: "🦠 COVID — defensive performance",
      },
      {
        year: 2021,
        revenue: 57399286,
        cogs: 20384244,
        opex: 32114557,
        ebitda: 4897465,
        note: "Recovery year",
      },
      {
        year: 2022,
        revenue: 84773038,
        cogs: 32748704,
        opex: 43576875,
        ebitda: 8443042,
        note: "Strong rebound",
      },
      {
        year: 2023,
        revenue: 102367962,
        cogs: 43155648,
        opex: 64364962,
        ebitda: -5176018,
        note: "🔴 One-time restructuring loss",
      },
      {
        year: 2024,
        revenue: 106648109,
        cogs: 23098269,
        opex: 77789872,
        ebitda: 5759968,
        note: "Recovery",
      },
      {
        year: 2025,
        revenue: 97987257,
        cogs: 13162842,
        opex: 73327894,
        ebitda: 11496521,
        note: "✅ Mgmt accounts (audit in progress)",
      },
      {
        year: "Q1 2026",
        revenue: 43446070,
        cogs: 0,
        opex: 0,
        ebitda: 21428971,
        note: "🚀 Q1 alone exceeds full-year FY2025 EBITDA",
      },
      {
        year: "2026F",
        revenue: 106034400,
        cogs: 11983000,
        opex: 74084000,
        ebitda: 19967400,
        note: "Company forecast (conservative)",
      },
    ],
    perEntityRevenue: [
      {
        code: "BBSB (Legacy)",
        byYear: {
          2016: 35723463,
          2017: 40213500,
          2018: 51793425,
          2019: 85383447,
          2020: 43155267,
          2021: 57399286,
          2022: 83370605,
          2023: 90572651,
          2024: 12434714,
          2025: 10154257,
          "2026F": 10154257,
        },
      },
      {
        code: "BBPS",
        byYear: {
          2023: 5410104,
          2024: 77437554,
          2025: 71077209,
          "2026F": 76000000,
        },
      },
      {
        code: "BBIS Cyberjaya",
        byYear: { 2024: 14581468, 2025: 15120586, "2026F": 18180000 },
      },
      {
        code: "BBIS KL",
        byYear: {
          2016: 2964865,
          2017: 4254194,
          2018: 2465681,
          2022: 890320,
          2023: 5981397,
          2024: 11247675,
          2025: 10844736,
          "2026F": 10900000,
        },
      },
      {
        code: "BBIS J",
        byYear: { 2024: 494290, 2025: 920866, "2026F": 900000 },
      },
      {
        code: "EYD",
        byYear: {
          2022: 512113,
          2023: 403810,
          2024: 2887122,
          2025: 23860,
          "2026F": 54400,
        },
      },
    ],
    perEntityEbitda: [
      {
        code: "BBSB (Legacy)",
        byYear: {
          2016: 5287934,
          2017: 4752296,
          2018: 5063234,
          2019: 12329906,
          2020: 8358735,
          2021: 4900485,
          2022: 10401444,
          2023: -1476054,
          2024: -20214663,
          2025: 7743608,
          "2026F": 7743608,
        },
      },
      {
        code: "BBPS",
        byYear: {
          2020: -3249,
          2021: -3020,
          2022: -4417,
          2023: -23370,
          2024: 1665520,
          2025: 7426637,
          "2026F": 13120000,
        },
      },
      {
        code: "BBIS Cyberjaya",
        byYear: {
          2022: -4032,
          2023: -7323,
          2024: 877198,
          2025: 1710288,
          "2026F": 4570000,
        },
      },
      {
        code: "BBIS KL",
        byYear: {
          2016: 376600,
          2017: 1135581,
          2018: -24966,
          2022: -675188,
          2023: -3073991,
          2024: 3309932,
          2025: 2733307,
          "2026F": 2790000,
        },
      },
      {
        code: "BBIS J",
        byYear: { 2024: -290756, 2025: -114310, "2026F": 13000 },
      },
      {
        code: "EYD",
        byYear: {
          2022: -1270348,
          2023: -571910,
          2024: 198074,
          2025: -259400,
          "2026F": -525600,
        },
      },
    ],
    auditAvailability: [
      {
        entity: "BBPS (Brainy Bunch Preschool)",
        years: { "2021": "✅", "2022": "✅", "2023": "✅", "2024": "✅" },
        notes: "Auditor on file — 4 years coverage",
      },
      {
        entity: "BBIS Cyberjaya",
        years: { "2021": "✅", "2022": "✅", "2023": "✅", "2024": "✅" },
        notes: "Auditor on file — 4 years coverage",
      },
      {
        entity: "BBIS KL (Brainy Bunch Elementary)",
        years: { "2021": "✅", "2022": "✅", "2023": "✅", "2024": "✅" },
        notes: "Auditor on file — 4 years (formerly 'BB Elementary')",
      },
      {
        entity: "BBIS J (Brainy Bunch Johor)",
        years: { "2021": "—", "2022": "—", "2023": "—", "2024": "✅" },
        notes: "Recently incorporated — first audit FY2024",
      },
      {
        entity: "EYD (Early Years Development)",
        years: { "2021": "✅", "2022": "✅", "2023": "✅", "2024": "✅" },
        notes: "Auditor on file — 4 years coverage",
      },
      {
        entity: "BBGB (Brainy Bunch Group Berhad — Holdco)",
        years: { "2021": "—", "2022": "—", "2023": "—", "2024": "✅" },
        notes: "Holdco first audit FY2024",
      },
      {
        entity: "BBSB (Brainy Bunch Sdn Bhd — Legacy/Related Party)",
        years: { "2021": "TBC", "2022": "TBC", "2023": "TBC", "2024": "TBC" },
        notes: "Held outside BBGB; audits with founder",
      },
    ],
    insights: [
      {
        label: "📈 15-Year Operating Track Record",
        detail:
          "Since 2011, Brainy Bunch has grown from RM 0.9M to RM 106M annual revenue — 119× growth. Audited statements available for FY2021-FY2024 across all major operating entities.",
      },
      {
        label: "🏆 Approaching RM 1 Billion Cumulative Revenue",
        detail:
          "Total cumulative revenue 2011-2026F: RM 897.88M. Cumulative EBITDA RM 93.21M. Demonstrated long-term value creation.",
      },
      {
        label: "🦠 Pandemic Resilience (FY2020)",
        detail:
          "Revenue dropped 49% (RM 85M → RM 43M) yet stayed profitable: RM 8.36M EBITDA. Defensive characteristics of education sector demonstrated.",
      },
      {
        label: "🔄 Operational Migration (2023-2024)",
        detail:
          "Operations successfully migrated from legacy BBSB entity to 6 BBGB subsidiaries. Source of one-time costs causing FY2023 loss.",
      },
      {
        label: "🚀 Recovery & Step-Up (FY2025-2026)",
        detail:
          "FY2025 EBITDA recovered to RM 11.50M. Q1 2026 ACTUAL EBITDA of RM 21.43M already exceeds FY2026F company forecast.",
      },
    ],
    sources:
      "(1) BBGROUP Financial Performance — 15-year consolidated; (2) 18 audited statements (FY2021-FY2024) for BBPS, BBIS C, BBIS KL, BBIS J, EYD, BBGB Holdco; (3) FY2025 management accounts; (4) Q1 2026 mgmt accounts.",
  },

  mgmtAccounts: {
    fyLatest: {
      period: "FY2025",
      subtitle:
        "Per-Entity Breakdown | Source: Internal Management Accounts | Audit In Progress",
      headline:
        "Group Totals — Revenue RM 108.14M | EBITDA RM 19.24M (17.8% margin)",
      entityCodes: [
        "BBSB",
        "BBPS",
        "BBIS C",
        "BBIS KL",
        "BBIS J",
        "BMC*",
        "EYD",
      ],
      totalLabel: "GROUP TOTAL",
      rows: [
        {
          label: "Revenue",
          values: {
            BBSB: 10154257,
            BBPS: 71077209,
            "BBIS C": 15120586,
            "BBIS KL": 10844736,
            "BBIS J": 920866,
            "BMC*": 0,
            EYD: 23860,
          },
          isFormula: "sumRow",
          emphasis: "section",
        },
        {
          label: "Less: Cost of Sales",
          values: {
            BBSB: 0,
            BBPS: 9709710,
            "BBIS C": 2471167,
            "BBIS KL": 863682,
            "BBIS J": 118283,
            "BMC*": 0,
            EYD: 0,
          },
          isFormula: "sumRow",
        },
        {
          label: "GROSS PROFIT",
          values: {},
          isFormula: "grossProfit",
          emphasis: "subtotal",
        },
        {
          label: "  Gross Margin %",
          values: {},
          isFormula: "marginPct",
          marginOf: "GROSS PROFIT",
        },
        {
          label: "Less: Operating Expenses",
          values: {
            BBSB: 2410649,
            BBPS: 53940863,
            "BBIS C": 10939130,
            "BBIS KL": 7247747,
            "BBIS J": 916894,
            "BMC*": 0,
            EYD: 283260,
          },
          isFormula: "sumRow",
        },
        { label: "EBITDA", values: {}, isFormula: "ebitda", emphasis: "total" },
        {
          label: "  EBITDA Margin %",
          values: {},
          isFormula: "marginPct",
          marginOf: "EBITDA",
        },
      ],
      notes: [
        "Source: Management Accounts (Internal) — Audited Financial Statements being prepared by appointed auditor.",
        "BBSB Revenue (RM 10.15M) represents internal rental income from BBIS C (corresponds to monthly RHB Islamic Bank loan service payment).",
        "On consolidation, BBSB's rental income would offset BBIS C's rental expense — true consolidated group revenue ~RM 98M after elimination.",
        "BMC (Brainy Mastery Centre) reported zero activity in FY2025 — operations effectively dormant.",
        "EYD posted a small loss (RM 259K) on minimal revenue (RM 23.8K) — sub-scale operations under review.",
        "BBIS J (Johor) posted a small EBITDA loss (RM 114K) — newest campus, still ramping up.",
        "Audited 2025 accounts (Q3 2026 expected) will provide proper consolidation eliminations.",
      ],
      insights: [
        {
          label: "🏆 BBPS Crown Jewel",
          detail:
            "BBPS (Preschool) generates RM 71.08M revenue = 66% of group. RM 7.43M EBITDA. Core cash engine.",
        },
        {
          label: "📈 BBIS KL Standout Margin",
          detail:
            "BBIS KL delivers 25.2% EBITDA margin — best among operating schools.",
        },
        {
          label: "🏛️ BBSB Bridge Entity",
          detail:
            "BBSB still books RM 10.15M revenue (rental from BBIS C = bank loan service). Will be eliminated on proper consolidation.",
        },
        {
          label: "⚠️ BBIS J & EYD Drag",
          detail:
            "Both posted small losses. BBIS J (newest campus) ramping; EYD sub-scale — strategic review needed.",
        },
        {
          label: "📊 Group EBITDA RM 19.24M",
          detail:
            "17.8% margin at management accounts level. Q1 2026 actual of RM 21.43M signals significant uplift trajectory.",
        },
      ],
    },
    quarterLatest: {
      period: "Q1 2026",
      subtitle:
        "3 months to 31 March 2026 — EBITDA RM 21.43M | Source: Internal Management Accounts",
      headline:
        "Q1 2026 EBITDA of RM 21.43M ALREADY EXCEEDS FULL-YEAR 2025 EBITDA OF RM 11.50M BY 86%",
      entityCodes: [
        "BBPS",
        "BBIS C (67%)",
        "BBIS KL",
        "BBIS J",
        "BMC",
        "SRIIBB",
        "EYD",
        "BBGB Holdco",
      ],
      totalLabel: "GROUP TOTAL",
      rows: [
        {
          label: "Revenue",
          values: {
            BBPS: 29550258,
            "BBIS C (67%)": 8261586,
            "BBIS KL": 4744401,
            "BBIS J": 739500,
            BMC: 132030,
            SRIIBB: 0,
            EYD: 18295,
            "BBGB Holdco": 0,
          },
          isFormula: "sumRow",
          emphasis: "section",
        },
        {
          label: "Less: Cost of Sales",
          values: {
            BBPS: 2842086,
            "BBIS C (67%)": 479459,
            "BBIS KL": 164256,
            "BBIS J": 56144,
            BMC: 7008,
            SRIIBB: 0,
            EYD: 18662,
            "BBGB Holdco": 0,
          },
          isFormula: "sumRow",
        },
        {
          label: "GROSS PROFIT",
          values: {},
          isFormula: "grossProfit",
          emphasis: "subtotal",
        },
        {
          label: "  Gross Margin %",
          values: {},
          isFormula: "marginPct",
          marginOf: "GROSS PROFIT",
        },
        {
          label: "Less: Admin & Operating Expenses",
          values: {
            BBPS: 13140078,
            "BBIS C (67%)": 2840267,
            "BBIS KL": 1950526,
            "BBIS J": 227405,
            BMC: 80432,
            SRIIBB: 0,
            EYD: 210274,
            "BBGB Holdco": 502,
          },
          isFormula: "sumRow",
        },
        { label: "EBITDA", values: {}, isFormula: "ebitda", emphasis: "total" },
        {
          label: "  EBITDA Margin %",
          values: {},
          isFormula: "marginPct",
          marginOf: "EBITDA",
        },
      ],
      notes: [
        "Source: 'MANAGEMENT ACCOUNT - 1ST QUARTER 2026.xlsx' — EBITDA Consolidate Tab | Unaudited Management Accounts",
        "Q1 captures annual registration fees — concentrates EBITDA in Q1 versus quarterly run-rate for Q2-Q4.",
      ],
      insights: [
        {
          label: "📈 Q1 EBITDA Surprise",
          detail:
            "RM 21.43M Q1 actual is 63% higher than prior FY2026F estimate of RM 13.14M. Revised FY2026F ~RM 29M EBITDA.",
        },
        {
          label: "🎯 BBPS Cash Generator",
          detail:
            "BBPS alone = RM 13.57M Q1 EBITDA (63% of group). Confirms preschool is the cash engine.",
        },
        {
          label: "⚠️ BBIS C Minority Interest",
          detail:
            "BBIS C contributes RM 4.94M EBITDA but BBGB only captures 67% = RM 3.31M attributable. RM 1.63M minority interest.",
        },
        {
          label: "🚀 BBIS KL Recovery",
          detail:
            "BBIS KL EBITDA of RM 2.63M in Q1 — strong recovery from previous losses.",
        },
        {
          label: "📊 Group Margin Quality",
          detail:
            "Q1 EBITDA margin of 49.3% is exceptional for education sector. Industry typical 15-25%.",
        },
      ],
    },
  },

  structure: {
    phases: [
      {
        phase: "Phase 1 (2010-2023)",
        title: "Single Company Era",
        description:
          "BBSB operated all businesses under one entity. Revenue, OPEX, assets, and liabilities all consolidated in BBSB.",
      },
      {
        phase: "Phase 2 (2024-2025)",
        title: "Subsidiary Separation — COMPLETED ✓",
        description:
          "Each business line moved to its own dedicated entity under BBGB holding co. BBPS, BBIS C, BBIS KL, BBIS J, BMC, EYD now operate as standalone subsidiaries.",
      },
      {
        phase: "Phase 3 (2026-2027)",
        title: "Statutory Cleanup — INVESTOR'S ROLE",
        description:
          "Investor capital clears EPF (RM 23M group) and LHDN (RM 3M actual). This releases personal guarantees and clears the legal restriction on BBSB property.",
      },
      {
        phase: "Phase 4 (2027-2028)",
        title: "BBSB Integration",
        description:
          "Refinance RM 43M RHB facility (feasible post-EPF cleanup). Integrate BBSB (and Cyberjaya property) into BBGB as wholly-owned subsidiary.",
      },
      {
        phase: "Phase 5 (2029-2030)",
        title: "Bursa ACE Market IPO",
        description:
          "BBGB lists with: 7 operating subsidiaries + RM 85M tangible asset + clean statutory record + 5-year audited track record.",
      },
    ],
    entities: [
      {
        rank: "0",
        code: "BBSB",
        legalName: "Brainy Bunch Sdn Bhd",
        ownershipPct: "Pending",
        paidUpCapital: null,
        fy25Revenue: 10154257,
        primaryFunction: "Founding entity, holds property & loan",
        integrationStatus: "🔄 Phase 4 Integration",
      },
      {
        rank: 1,
        code: "BBPS",
        legalName: "Brainy Bunch Preschool Sdn Bhd",
        ownershipPct: "100%",
        paidUpCapital: 17000,
        fy25Revenue: 71077209,
        primaryFunction: "Preschool operations (multi-branch)",
        integrationStatus: "✅ Integrated",
      },
      {
        rank: 2,
        code: "BBIS C",
        legalName: "BBIS (C) Sdn Bhd",
        ownershipPct: "67%",
        paidUpCapital: 100000,
        fy25Revenue: 15120586,
        primaryFunction: "International School Cyberjaya",
        integrationStatus: "✅ Integrated (33% Founders)",
      },
      {
        rank: 3,
        code: "BBIS KL",
        legalName: "BBIS (KL) Sdn Bhd",
        ownershipPct: "100%",
        paidUpCapital: 1374148,
        fy25Revenue: 10844736,
        primaryFunction: "International School KL",
        integrationStatus: "✅ Integrated",
      },
      {
        rank: 4,
        code: "BBIS J",
        legalName: "BBIS (J) Sdn Bhd",
        ownershipPct: "100%",
        paidUpCapital: 2500,
        fy25Revenue: 920866,
        primaryFunction: "International School Johor",
        integrationStatus: "✅ Integrated",
      },
      {
        rank: 5,
        code: "BMC",
        legalName: "Brainy Mastery Centre Sdn Bhd",
        ownershipPct: "100%",
        paidUpCapital: 10002,
        fy25Revenue: null,
        primaryFunction: "Tuition & coaching (dormant)",
        integrationStatus: "✅ Integrated",
      },
      {
        rank: 6,
        code: "EYD",
        legalName: "Early Years Development Sdn Bhd",
        ownershipPct: "100%",
        paidUpCapital: 12956074,
        fy25Revenue: 23860,
        primaryFunction: "Specialty preschool program",
        integrationStatus: "✅ Integrated",
      },
      {
        rank: 7,
        code: "SRIIBB",
        legalName: "SRIIBB Sdn Bhd",
        ownershipPct: "100%",
        paidUpCapital: null,
        fy25Revenue: null,
        primaryFunction: "Future Islamic international school campuses",
        integrationStatus: "✅ Incorporated, pre-launch",
      },
    ],
    notes: [
      "BBSB Sdn Bhd is the original founding entity (incorporated 2010). All Brainy Bunch operations historically ran under BBSB until restructuring began in 2024.",
      "The Cyberjaya property (RM 85M Knight Frank) and RHB Islamic Bank facility (RM 43M) remain under BBSB. Post-restructuring (Phase 4), these will be integrated into BBGB.",
      "BBIS Cyberjaya minority interest of 33% is held by Mr Fadzil Hashim (Founder) and Madam Efizah Hashim (his spouse) — both founding shareholders, not external parties.",
      "BBGB owns 6 operating subsidiaries + 1 future entity (SRIIBB). Total paid-up capital invested in subsidiaries: RM 14,459,724.",
      "FY2025 Group Revenue of RM 108.14M includes BBSB's 'rental' income from BBIS C. On consolidation, this would eliminate.",
      "BBSB integration into BBGB requires: (a) settle BBSB EPF first, (b) release directors' personal guarantees, (c) refinance RHB loan in BBGB name.",
      "Pre-existing BBGB shareholders: Coach Fadzil (Founder) + any nominal shareholders [cap table to be confirmed].",
    ],
  },

  statutory: {
    criticalNote:
      "BBSB's RM 16.78M EPF arrears have created legal restrictions on the Cyberjaya property: (a) Property CANNOT be refinanced; (b) Property CANNOT be purchased by any BBGB education group entity; (c) Property charges cannot be lifted until BBSB EPF is settled. This is the single biggest unlock for any pre-IPO property restructuring.",
    summary: [
      {
        label: "BBGB Education Group — Direct EPF Liability",
        value: "RM 6,498,061",
        note: "Manageable; ~22% of one quarter's EBITDA",
      },
      {
        label: "BBGB Education Group — Direct LHDN Liability",
        value: "RM 3,000,000 (actual)",
        note: "Plus appealed penalty (likely reducible)",
      },
      {
        label: "Total BBGB Direct Statutory Exposure",
        value: "RM ~9.5 Million",
        note: "Single-quarter EBITDA covers 2× over",
      },
      {
        label: "BBSB Separate EPF (NOT BBGB's)",
        value: "RM 16,775,865",
        note: "Coach Fadzil's responsibility, related-party disclosure",
      },
      {
        label: "BBSB Separate RHB Loan (NOT BBGB's)",
        value: "RM 43,000,000",
        note: "Serviced by BBIS C 'rental' (loan payment pass-through)",
      },
      {
        label: "Active Monthly Payment — BBGB (BBPS)",
        value: "RM 140,000 / month",
        note: "Demonstrates good faith engagement with EPF",
      },
      {
        label: "Active Monthly Payment — BBSB (related)",
        value: "RM 220,000 / month",
        note: "Coach Fadzil-funded, not BBGB",
      },
    ],
    epfRows: [
      {
        no: 1,
        entity: "BBPS (Brainy Bunch Preschool)",
        period: "Multiple periods",
        outstanding: 5138716,
        penalty: 0,
        dividend: 0,
        status: "Active payment RM 140K/month",
      },
      {
        no: 2,
        entity: "BBIS C (BBIS Cyberjaya)",
        period: "Multiple periods",
        outstanding: 752093,
        penalty: 37218,
        dividend: 26421,
        status: "PD Cheque issued",
        footnote: "67% BBGB-owned · 33% by Mr Fadzil + Madam Efizah",
      },
      {
        no: 3,
        entity: "BBIS KL (incl. former BB Elementary)",
        period: "Multiple periods",
        outstanding: 456232,
        penalty: 19141,
        dividend: 14280,
        status: "Combined entity",
      },
      {
        no: 4,
        entity: "BBIS J (BBIS Johor)",
        period: "03/2026 - 05/2026",
        outstanding: 14040,
        penalty: 0,
        dividend: 0,
        status: "Current month only",
      },
      {
        no: 5,
        entity: "EYD (Early Years Development)",
        period: "10/2025 - 05/2026",
        outstanding: 18264,
        penalty: 0,
        dividend: 0,
        status: "Current month only",
      },
      {
        no: 6,
        entity: "BMC (Brainy Mastery Centre)",
        period: "—",
        outstanding: 0,
        penalty: 0,
        dividend: 0,
        status: "No EPF outstanding",
      },
    ],
    relatedPartyEpf: [
      {
        no: 1,
        entity: "BBSB SDN BHD (Related Party — Founder)",
        period: "Multiple periods (2021-2024)",
        outstanding: 15681737,
        penalty: 777183,
        dividend: 316945,
        status: "Active RM 220K/month",
      },
    ],
    lhdn: [
      {
        label: "Actual Tax Liability (Principal)",
        value: "RM 3,000,000",
        note: "Confirmed principal amount",
      },
      {
        label: "Penalty + Late Payment Charges",
        value: "[To be quantified]",
        note: "Under appeal — likely reducible",
      },
      {
        label: "Net BBGB LHDN Exposure (After Appeal)",
        value: "RM ~3M base + reduced penalty",
        note: "Best case: penalty waived/substantially reduced",
      },
      {
        label: "Appeal Status",
        value: "In progress",
        note: "Management actively engaging with LHDN",
      },
      {
        label: "Where Captured",
        value: "Accrued Tax Liabilities (current)",
        note: "Standard accounting treatment",
      },
      {
        label: "Mitigation Track Record",
        value: "Penalty appeals historically successful",
        note: "Sector precedent supports outcome",
      },
    ],
    strategicImplications: [
      {
        label: "BBGB Direct Exposure is Manageable (RM ~9.5M)",
        detail:
          "Combined EPF (RM 6.5M) + LHDN actual (RM 3M) = RM 9.5M. Less than half of Q1 2026 EBITDA (RM 21.43M). Settable from operations.",
      },
      {
        label: "BBSB EPF is the Critical Unlock (RM 16.78M)",
        detail:
          "Until BBSB EPF is settled, the Cyberjaya property is legally locked — cannot be transferred, refinanced, or sold to BBGB entities.",
      },
      {
        label: "LHDN Penalty Appeal Likely Successful",
        detail:
          "RM 3M actual + appealed penalty. Active engagement reduces enforcement risk. Best case: penalty substantially reduced.",
      },
      {
        label: "Investor Cash Could Accelerate Resolution",
        detail:
          "Investor capital can: (a) Clear BBGB direct liabilities, (b) Optionally fund BBSB EPF settlement via related-party loan, (c) Unlock property restructuring path.",
      },
      {
        label: "Bursa IPO Compliance Risk Mitigated",
        detail:
          "Pre-IPO statutory clearance is standard CP. Manageable size = manageable cleanup. Operating performance (Q1 2026 EBITDA) provides confidence in repayment ability.",
      },
    ],
  },

  assets: {
    directAssets: [
      {
        no: 1,
        category: "Property, Plant & Equipment",
        amounts: {
          group: 6111494,
          BBPS: 4170604,
          "BBIS C": 1327278,
          "BBIS KL": 412332,
          "BBIS J": 108928,
          EYD: 92352,
        },
      },
      {
        no: 2,
        category: "Trade Receivables",
        amounts: {
          group: 1149386,
          BBPS: 291039,
          "BBIS C": 507199,
          "BBIS KL": 227010,
          "BBIS J": 7950,
          EYD: 116188,
        },
      },
      {
        no: 3,
        category: "Other Receivables, Deposits",
        amounts: {
          group: 38837591,
          BBPS: 27489210,
          "BBIS C": 4697819,
          "BBIS KL": 6444117,
          "BBIS J": 103960,
          EYD: 102485,
        },
      },
      {
        no: 4,
        category: "Cash & Bank Balances",
        amounts: {
          group: 1694030,
          BBPS: 505141,
          "BBIS C": 363374,
          "BBIS KL": 733187,
          "BBIS J": 83350,
          EYD: 4585,
        },
      },
      {
        no: 5,
        category: "Investment in Subsidiaries (BBGB Holdco only)",
        amounts: {
          group: 14459722,
          BBPS: 0,
          "BBIS C": 0,
          "BBIS KL": 0,
          "BBIS J": 0,
          EYD: 0,
        },
      },
    ],
    transferable: [
      {
        no: 1,
        asset: "Cyberjaya Property",
        description:
          "Lot 119771 - International School Complex (RM 85M Knight Frank)",
        estValue: 85000000,
        transferable: "❌ NO",
        mechanism: "Locked by EPF + RHB charge",
        targetEntity: "BBSB retains",
        status: "🔒 Cannot move",
      },
      {
        no: 2,
        asset: "RHB Loan (Liability)",
        description: "RM 43M outstanding",
        estValue: -43000000,
        transferable: "—",
        mechanism: "Stays with BBSB",
        targetEntity: "BBSB retains",
        status: "🔒 Stays",
      },
      {
        no: 3,
        asset: "EPF Liability",
        description: "RM 16.78M arrears",
        estValue: -16775865,
        transferable: "—",
        mechanism: "Coach Fadzil's responsibility",
        targetEntity: "BBSB retains",
        status: "🔒 Stays",
      },
      {
        no: 4,
        asset: "Brainy Bunch Brand & Trademarks",
        description: "Core brand IP, registered marks",
        estValue: 15000000,
        transferable: "✅ YES",
        mechanism: "IP assignment for nominal consideration",
        targetEntity: "BBGB Holdco",
        status: "🎯 Priority 1",
      },
      {
        no: 5,
        asset: "Curriculum & Methodology",
        description: "Proprietary teaching materials, lesson plans",
        estValue: 3000000,
        transferable: "✅ YES",
        mechanism: "IP transfer / perpetual license",
        targetEntity: "BBGB / BBPS",
        status: "🎯 Priority 2",
      },
      {
        no: 6,
        asset: "Cambridge IGCSE Accreditation",
        description: "Cambridge International School registration",
        estValue: 0,
        transferable: "✅ RE-REG",
        mechanism: "Re-register accreditation under BBIS C",
        targetEntity: "BBIS C",
        status: "🎯 Priority 3",
      },
      {
        no: 7,
        asset: "NAMC Accreditation",
        description: "North American Montessori Center",
        estValue: 0,
        transferable: "✅ RE-REG",
        mechanism: "Re-register under BBPS",
        targetEntity: "BBPS",
        status: "🎯 Priority 3",
      },
      {
        no: 8,
        asset: "F&F + Equipment at Cyberjaya",
        description: "Classroom equipment, IT, furniture",
        estValue: 3000000,
        transferable: "✅ YES",
        mechanism: "Asset sale at Net Book Value",
        targetEntity: "BBIS C",
        status: "🎯 Priority 4",
      },
      {
        no: 9,
        asset: "Student Database & Alumni Network",
        description: "Historical student records, marketing data",
        estValue: 1500000,
        transferable: "✅ YES",
        mechanism: "Data assignment (PDPA compliant)",
        targetEntity: "BBGB",
        status: "🎯 Priority 5",
      },
      {
        no: 10,
        asset: "Vendor Contracts",
        description: "Supplier relationships, service contracts",
        estValue: 0,
        transferable: "✅ YES",
        mechanism: "Novation to BBIS C / BBGB entities",
        targetEntity: "Each entity",
        status: "🎯 Priority 5",
      },
      {
        no: 11,
        asset: "Operating Licenses (Schools)",
        description: "MoE / state authority licenses",
        estValue: 0,
        transferable: "✅ RE-REG",
        mechanism: "Re-application by BBIS C / BBGB",
        targetEntity: "BBIS C / BBGB",
        status: "🎯 Priority 3",
      },
    ],
    roadmap: [
      {
        phase: "Phase 1",
        timing: "Mth 1-2",
        action:
          "Independent valuation of brand IP, curriculum, F&F, accreditations",
        owner: "External valuers + legal",
        deliverable: "Valuation reports",
        status: "Pending",
      },
      {
        phase: "Phase 2",
        timing: "Mth 2-3",
        action: "Draft & execute IP assignment agreement (BBSB → BBGB)",
        owner: "Legal counsel",
        deliverable: "Signed IP deed; trademark transfer",
        status: "Pending",
      },
      {
        phase: "Phase 3",
        timing: "Mth 3-4",
        action: "Asset sale agreement for F&F (BBSB → BBIS C) at NBV",
        owner: "Finance + Legal",
        deliverable: "Signed sale agreement",
        status: "Pending",
      },
      {
        phase: "Phase 4",
        timing: "Mth 3-6",
        action: "Re-register accreditations (Cambridge, NAMC, MoE)",
        owner: "Operations",
        deliverable: "Accreditations transferred",
        status: "Pending",
      },
      {
        phase: "Phase 5",
        timing: "Mth 4-6",
        action: "Execute long-term tenancy agreement (BBSB ↔ BBIS C)",
        owner: "Legal + property advisor",
        deliverable: "30-year tenancy at FMR",
        status: "Pending",
      },
      {
        phase: "Phase 6",
        timing: "Mth 6-9",
        action: "Novate vendor contracts; transition banking",
        owner: "Operations + Finance",
        deliverable: "Updated vendors; new BBGB accounts",
        status: "Pending",
      },
      {
        phase: "Phase 7",
        timing: "Mth 9-12",
        action: "Tax structuring review (EPF/LHDN safe harbour)",
        owner: "Tax advisor",
        deliverable: "Tax opinion letter",
        status: "Pending",
      },
      {
        phase: "Phase 8",
        timing: "Mth 12-15",
        action: "Restated BBGB Balance Sheet with transferred assets",
        owner: "Auditor",
        deliverable: "Restated audited BS; IPO-ready",
        status: "Pending",
      },
    ],
    propertyArrangement: [
      {
        label: "Current Arrangement (Problematic)",
        detail:
          "BBIS C pays 'rental' to BBSB = monthly RHB loan service. Not arm's length. RPT concern.",
      },
      {
        label: "Proposed Arrangement",
        detail:
          "Convert to formal long-term tenancy at fair market rent — independent valuer to confirm.",
      },
      {
        label: "Suggested Rent Range",
        detail:
          "Based on Knight Frank rental rate: ~RM 9-12 PSF/month × 180,508 sq ft ≈ RM 1.6-2.1M/month.",
      },
      {
        label: "Term Length",
        detail:
          "30 years with renewal options (matches IPO + operational horizon).",
      },
      {
        label: "Rent Escalation",
        detail: "5-10% every 3 years (or RPI-linked).",
      },
      {
        label: "BBSB Use of Rental Income",
        detail: "Service RHB loan + EPF settlement + property maintenance.",
      },
      {
        label: "Right of First Refusal (ROFR)",
        detail:
          "BBGB has ROFR if BBSB sells property — captures future upside.",
      },
      {
        label: "Independent Valuation Required",
        detail:
          "Rent must be confirmed by independent property valuer for arm's length compliance.",
      },
      {
        label: "Investor Protection",
        detail:
          "Long-term lease secures operational continuity; ROFR captures future property upside.",
      },
    ],
    notes: [
      "Asset transfers must be at FAIR MARKET VALUE to avoid RPT issues with auditors and Bursa Malaysia.",
      "Total extractable value from BBSB to BBGB: ~RM 22.5M (Brand IP + Curriculum + F&F + Database).",
      "Property remains in BBSB — managed via long-term tenancy at fair market rent (Knight Frank benchmark).",
      "EPF settlement (BBSB) is the master gate to unlock any property-side restructuring.",
    ],
  },

  projection: {
    years: ["FY2026", "FY2027", "FY2028", "FY2029", "FY2030 (IPO)"],
    drivers: [
      {
        label: "BBPS Students (Preschool)",
        values: [8500, 9500, 10500, 11500, 12500],
      },
      {
        label: "BBIS Students (Int'l School)",
        values: [1500, 1700, 1900, 2100, 2300],
      },
      {
        label: "SRIIBB Students (New campuses)",
        values: [0, 216, 288, 360, 360],
      },
      {
        label: "BBPS Annual Fee (RM)",
        values: [10000, 10500, 11025, 11576, 12155],
        isFee: true,
        pairWith: "BBPS Students (Preschool)",
      },
      {
        label: "BBIS Annual Fee (RM)",
        values: [22000, 23100, 24255, 25468, 26741],
        isFee: true,
        pairWith: "BBIS Students (Int'l School)",
      },
      {
        label: "SRIIBB Annual Fee (RM)",
        values: [0, 10000, 10500, 11025, 11576],
        isFee: true,
        pairWith: "SRIIBB Students (New campuses)",
      },
    ],
    otherRevenueLabel: "Other Entities Revenue (BMC, EYD, BBGB)",
    otherRevenueByYear: [1342000, 1409100, 1476200, 1543300, 1610400],
    opexByYear: [-73376305, -77045120, -83208730, -89865428, -97054663],
    daByYear: [-1200000, -1200000, -1200000, -1200000, -1200000],
    financeCostsByYear: [-92138, -85000, -75000, -60000, -45000],
    taxRateByYear: [0, 0.15, 0.2, 0.24, 0.24],
    cogsPctOfRevenue: 0.115,
  },
  projectionNotes: [
    {
      label: "Student Growth",
      detail:
        "BBPS: +1000/yr conservative; BBIS: +200/yr; SRIIBB launches Jan 2027 at 60% capacity, ramps to 100% by 2029.",
    },
    {
      label: "Fee Inflation",
      detail:
        "5% annual fee increase (industry norm for Malaysia private education sector).",
    },
    {
      label: "OPEX Growth",
      detail:
        "5% in FY2027 (lean post-injection), 8% from FY2028 onwards as new campuses absorb costs.",
    },
    {
      label: "EPF/LHDN Status",
      detail: "Both settled in FY2026 — no statutory drag from FY2027 onwards.",
    },
    {
      label: "D&A",
      detail:
        "Constant RM 1.2M/year — includes Cyberjaya campus and equipment depreciation.",
    },
    {
      label: "Finance Costs",
      detail:
        "Declining as HP and PUNB loans pay down — assumes no new debt for SRIIBB (CAPEX from injection).",
    },
    {
      label: "Taxation",
      detail:
        "0% (FY2026, losses offset), 15% (FY2027, partial offset), 20% (FY2028), 24% (FY2029-30 clean for IPO).",
    },
    {
      label: "IPO Target",
      detail:
        "FY2030 listing on Bursa Malaysia ACE Market — needs 3-5 year profit track record (achieved by FY2029).",
    },
  ],
  cashflow: {
    openingCash: 396911,
    lines: [
      {
        label: "Less: CAPEX (SRIIBB + Renewals)",
        values: [-2000000, -500000, -1500000, -1000000, -1000000],
        group: "invest",
      },
      {
        label: "Add: Investor Equity Injection (RM 35M)",
        values: [35000000, 0, 0, 0, 0],
        group: "finance",
      },
      {
        label: "Less: EPF One-Off Settlement",
        values: [-25000000, 0, 0, 0, 0],
        group: "finance",
      },
      {
        label: "Less: LHDN Settlement (One-Off + Monthly)",
        values: [-3600000, 0, 0, 0, 0],
        group: "finance",
      },
      {
        label: "Less: Coach Fadzil Founder Buyout",
        values: [-3000000, 0, 0, 0, 0],
        group: "finance",
      },
      {
        label: "Less: Loan Principal Repayments",
        values: [-215000, -200000, -180000, -150000, -120000],
        group: "finance",
      },
    ],
    insights: [
      {
        label: "FY2026 — Restructuring Year",
        detail:
          "Cash dips post-RM 25M EPF + RM 3M LHDN + RM 3M founder buyout, but ends ~RM 9.6M after injection.",
      },
      {
        label: "FY2027 — First Clean Year",
        detail:
          "First year without statutory drag — generates RM 13M+ operating cashflow.",
      },
      {
        label: "FY2028 — Growth Acceleration",
        detail:
          "SRIIBB ramps up, BBIS expansion, cash builds to RM 35M+ position.",
      },
      {
        label: "FY2029 — Pre-IPO Build",
        detail:
          "3 consecutive profitable years complete — meets Bursa ACE Market requirement.",
      },
      {
        label: "FY2030 — IPO Year",
        detail:
          "Strong balance sheet (cash + RM 85M property), 5-year EBITDA track record demonstrated.",
      },
    ],
  },

  investment: {
    snapshot: [
      { label: "Company", value: "Brainy Bunch Group Berhad (BBGB)" },
      {
        label: "Business",
        value:
          "Islamic Montessori Education Group — Preschool to International School",
      },
      { label: "Operating Vintage", value: "15 years (Founded 2010)" },
      {
        label: "Audit Coverage",
        value:
          "FY2021–FY2024 audited financials available for all 5 major operating entities",
      },
      {
        label: "Cumulative Revenue (2011-2026F)",
        value: "RM 897.88M — approaching the RM 1 Billion milestone",
      },
      { label: "Cumulative EBITDA (2011-2026F)", value: "RM 93.21M" },
      { label: "Peak Revenue Year", value: "FY2024 — RM 106.65M" },
      {
        label: "FY2025 (Mgmt Accts)",
        value: "Revenue RM 97.99M | EBITDA RM 11.50M",
      },
      {
        label: "Q1 2026 ACTUAL",
        value: "Revenue RM 43.45M | EBITDA RM 21.43M (49.3% margin)",
      },
      {
        label: "FY2026F (Company Forecast)",
        value: "Revenue RM 106.03M | EBITDA RM 19.97M",
      },
      {
        label: "Net Profit FY2025",
        value: "RM 13.62M (includes RM 2.21M other income)",
      },
      {
        label: "COVID Resilience Test",
        value: "Passed — Stayed profitable through FY2020 (RM 8.36M EBITDA)",
      },
      {
        label: "Exit Mechanism",
        value: "Bursa Malaysia ACE Market IPO (Target FY2029/2030)",
      },
      {
        label: "Investor Profile Suitable",
        value:
          "PE Fund / Strategic / Family Office / Education Sector Specialist",
      },
    ],
    valuation: {
      methodology:
        "Methodology: EV/EBITDA multiple on FY2026F Company Forecast EBITDA. Education sector pre-IPO comparable range: 4x-8x. Reference: PE-backed Asian education deals.",
      ebitdaBase: 19967400,
      cumulativeEbitda: 93210967,
      scenarios: [
        {
          name: "Conservative",
          multiple: 4.0,
          comment: "Bottom of range. Reflects audit + restructuring discount.",
        },
        {
          name: "Base",
          multiple: 5.5,
          comment: "Mid-range. Reflects 15-yr track record + Q1 2026 strength.",
        },
        {
          name: "Sector Average",
          multiple: 6.5,
          comment: "Median Malaysian education sector pre-IPO.",
        },
        {
          name: "Premium",
          multiple: 8.0,
          comment: "Growth premium for Q1 2026 EBITDA acceleration.",
        },
      ],
    },
    thesis: [
      {
        label: "15-Year Audited Track Record",
        detail:
          "Audited statements available FY2021-FY2024 (4 years) across 5 major operating entities. Unmatched DD credibility for a pre-IPO target of this size.",
      },
      {
        label: "RM 898M Cumulative Revenue",
        detail:
          "Approaching RM 1 Billion lifetime revenue milestone. Demonstrated long-term value creation and operational longevity.",
      },
      {
        label: "Survived COVID-19 (FY2020)",
        detail:
          "Revenue dropped 49% but maintained RM 8.36M EBITDA. Defensive characteristics of education sector + management discipline proven.",
      },
      {
        label: "Strong Q1 2026 Momentum",
        detail:
          "Q1 EBITDA RM 21.43M (49.3% margin) — already exceeds full-year FY2026F company forecast. Operating leverage stronger than projected.",
      },
      {
        label: "Clean Pre-IPO Structure",
        detail:
          "BBGB Holdco + 6 operating subsidiaries. Manageable EPF (RM 6.5M) + LHDN (RM 3M actual). Legacy BBSB issues isolated outside BBGB.",
      },
      {
        label: "Asset Transfer Strategy",
        detail:
          "Extract ~RM 22.5M from BBSB to BBGB: Brand IP, curriculum, F&F, accreditations. Long-term tenancy replaces 'rental = loan' arrangement.",
      },
      {
        label: "Clear IPO Path",
        detail:
          "FY2025 (recovery) → FY2026 (growth) → FY2027-2028 (scaling) → FY2029/2030 (IPO). 3-year clean profit track record sufficient for Bursa ACE listing.",
      },
    ],
    risks: [
      {
        risk: "Property RM 85M outside BBGB (BBSB-held)",
        severity: "HIGH",
        mitigation:
          "Asset transfer strategy extracts ~RM 22.5M; long-term tenancy at FMR for property use. EPF settlement (future) unlocks property restructuring.",
      },
      {
        risk: "FY2023 Loss Year (-RM 5.18M)",
        severity: "MEDIUM",
        mitigation:
          "One-time restructuring costs (operations migration). FY2024 + FY2025 recovery + Q1 2026 strength validate normalized profitability.",
      },
      {
        risk: "BBSB EPF RM 16.78M (Coach Fadzil's)",
        severity: "MEDIUM",
        mitigation:
          "Not BBGB's liability. Disclosed as related-party. Investor protected from this exposure.",
      },
      {
        risk: "BBIS C 33% Founder Family Interest",
        severity: "LOW",
        mitigation:
          "Mr Fadzil + Madam Efizah. Can be brought into BBGB via share swap post-IPO. Not external.",
      },
      {
        risk: "BBGB EPF (RM 6.5M) + LHDN (RM 3M)",
        severity: "LOW",
        mitigation:
          "Manageable size. Less than half quarterly EBITDA. Standard pre-IPO CP.",
      },
      {
        risk: "FY2025 Audit Pending",
        severity: "LOW",
        mitigation:
          "Management accounts available. Audit completion as CP for funding.",
      },
      {
        risk: "EYD Loss-Making",
        severity: "LOW",
        mitigation:
          "Sub-scale. Consider closure or absorption. Minimal financial impact (RM 259K loss in FY2025).",
      },
      {
        risk: "Education Sector Regulation",
        severity: "LOW",
        mitigation:
          "Stable regulatory environment in Malaysia. 15-year compliance track record. MOE-registered.",
      },
    ],
    quote:
      "15 years of building. 4 years of audited proof. RM 898M cumulative revenue. RM 93M cumulative EBITDA. Now ready for the IPO chapter.",
  },
};
