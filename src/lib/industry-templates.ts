// Industry-specific KPI templates.
// Auto-selected based on the business_profiles.industry field set during onboarding.
// Controls: dashboard labels, formula interpretation, Aria's data mapping guide,
// and which KPI sections are shown/hidden.

export type IndustryTemplate = {
  id: string;
  match: string[];                    // industry strings that match this template
  label: string;                      // display name

  // Revenue formula labels (top row of CEO Command Centre)
  revenueFormula: {
    reachLabel: string;               // e.g. "Foot Traffic" vs "Website Visitors"
    prospectLabel: string;            // e.g. "Walk-ins" vs "Leads"
    customerLabel: string;            // e.g. "Diners" vs "Paying Customers"
    salesLabel: string;               // e.g. "Total Sales" (always)
    avgSaleLabel: string;             // e.g. "Avg Check" vs "Avg Order Value"
    avgTxnLabel: string;              // e.g. "Visits/Customer" vs "Orders/Customer"
    leadCRLabel: string;              // e.g. "Walk-in Rate" vs "Lead Conv. Rate"
    saleCRLabel: string;              // e.g. "Order Rate" vs "Close Rate"
  };

  // Which sections to show/emphasize
  showFunnel: boolean;                // CMO funnel (reach → prospects → customers)
  showInventory: boolean;             // inventory tracking
  showDelivery: boolean;              // on-time delivery
  showMRR: boolean;                   // monthly recurring revenue (SaaS)
  showCapacity: boolean;              // capacity utilization

  // Aria's field mapping guide for KPI updates
  ariaFieldGuide: string;             // injected into Aria's prompt
};

const TEMPLATES: IndustryTemplate[] = [
  {
    id: "fnb",
    match: ["F&B", "Café", "Restaurant", "Coffee", "Food", "Bakery", "Catering"],
    label: "F&B / Restaurant",
    revenueFormula: {
      reachLabel: "Total Orders",
      prospectLabel: "Walk-ins",
      customerLabel: "Paying Customers",
      salesLabel: "Total Revenue",
      avgSaleLabel: "Avg $ Sales",
      avgTxnLabel: "Visits per Customer",
      leadCRLabel: "Order Rate",
      saleCRLabel: "Purchase Rate",
    },
    showFunnel: false,         // F&B doesn't have a marketing funnel
    showInventory: true,
    showDelivery: true,        // food delivery tracking
    showMRR: false,
    showCapacity: true,        // kitchen/seating capacity
    ariaFieldGuide: `
F&B / Restaurant field mapping:
- Revenue (from POS) → periods.revenue (DIRECT — do not compute from formula)
- Total orders → periods.orders
- Avg order value → periods.avgSale (revenue ÷ orders)
- Avg transactions per customer → periods.avgTxn
- GP margin % → periods.gpPct (as decimal, e.g. 0.55 for 55%)
- Operating expenses → periods.opex
- Total paying customers → ops.customers
- New customers → NOT a dashboard field (mention in analysis only)
- Repeat customers → calculate ops.repeatRate = repeat ÷ total customers
- Staff count → ops.headcount
- Cash in bank → finance.cashBalance
- Payment breakdown (RaudhahPay etc.) → finance.cashIn (total of all payment methods)
CRITICAL: For F&B, ALWAYS use periods.revenue for the direct revenue number. NEVER try to reverse-engineer it through reach × leadCR × saleCR × avgSale × avgTxn.`,
  },
  {
    id: "saas",
    match: ["SaaS", "Tech", "Software", "App", "Platform"],
    label: "SaaS / Tech",
    revenueFormula: {
      reachLabel: "Website Visitors",
      prospectLabel: "Signups / Trials",
      customerLabel: "Paying Subscribers",
      salesLabel: "MRR",
      avgSaleLabel: "ARPU",
      avgTxnLabel: "Billing Cycles",
      leadCRLabel: "Signup Rate",
      saleCRLabel: "Trial → Paid",
    },
    showFunnel: true,
    showInventory: false,
    showDelivery: false,
    showMRR: true,
    showCapacity: false,
    ariaFieldGuide: `
SaaS / Tech field mapping:
- MRR / Monthly revenue → periods.MTD: reach=visitors, leadCR=signupRate, saleCR=conversionRate, avgSale=ARPU, avgTxn=1
- Website visitors → periods.MTD.reach
- Signup/trial rate → periods.MTD.leadCR (as decimal)
- Trial to paid rate → periods.MTD.saleCR (as decimal)
- ARPU (avg revenue per user) → periods.MTD.avgSale
- Total paying customers → ops.customers
- Churn rate → ops.attrition (as decimal)
- CAC → derive from marketing spend / new customers
- Burn rate → periods.MTD.opex
- Runway → finance.runwayMonths
- ARR → mention as MRR × 12 in analysis`,
  },
  {
    id: "ecommerce",
    match: ["E-commerce", "Retail", "Online Store", "Shopify", "Shop"],
    label: "E-commerce / Retail",
    revenueFormula: {
      reachLabel: "Store Visitors",
      prospectLabel: "Add to Cart",
      customerLabel: "Completed Orders",
      salesLabel: "GMV / Revenue",
      avgSaleLabel: "Avg Order Value",
      avgTxnLabel: "Orders per Customer",
      leadCRLabel: "Add-to-Cart Rate",
      saleCRLabel: "Checkout Rate",
    },
    showFunnel: true,
    showInventory: true,
    showDelivery: true,
    showMRR: false,
    showCapacity: false,
    ariaFieldGuide: `
E-commerce / Retail field mapping:
- Revenue / GMV (from platform/POS) → periods.revenue (DIRECT — use the actual revenue number)
- Total orders → periods.orders
- Website/store visitors → periods.reach
- Add-to-cart rate → periods.leadCR (as decimal)
- Checkout/conversion rate → periods.saleCR (as decimal)
- Average order value (AOV) → periods.avgSale
- Orders per customer → periods.avgTxn
- Total customers → ops.customers
- Repeat purchase rate → ops.repeatRate
- Return rate → ops.complaints (repurposed)
- Inventory value → finance.inventory
- Shipping/fulfillment → ops.onTimeDelivery
CRITICAL: For E-commerce, ALWAYS use periods.revenue for the direct revenue number when available. The funnel fields (reach, leadCR, saleCR) can still be set for conversion analysis, but revenue is the source of truth.`,
  },
  {
    id: "services",
    match: ["Professional Services", "Consulting", "Agency", "Legal", "Accounting"],
    label: "Professional Services",
    revenueFormula: {
      reachLabel: "Inquiries",
      prospectLabel: "Proposals Sent",
      customerLabel: "Active Clients",
      salesLabel: "Revenue",
      avgSaleLabel: "Avg Project Value",
      avgTxnLabel: "Projects per Client",
      leadCRLabel: "Proposal Rate",
      saleCRLabel: "Win Rate",
    },
    showFunnel: true,
    showInventory: false,
    showDelivery: false,
    showMRR: false,
    showCapacity: true,          // billable utilization
    ariaFieldGuide: `
Professional Services field mapping:
- Revenue → periods.MTD: reach=inquiries, leadCR=proposalRate, saleCR=winRate, avgSale=avgProjectValue, avgTxn=projectsPerClient
- Inquiries/leads → periods.MTD.reach
- Proposal/quote rate → periods.MTD.leadCR (as decimal)
- Win/close rate → periods.MTD.saleCR (as decimal)
- Avg project/engagement value → periods.MTD.avgSale
- Active clients → ops.customers
- Billable utilization → ops.capacityUsed (as decimal)
- Revenue per head → ops.productivityPerHead`,
  },
  {
    id: "education",
    match: ["Education", "Training", "School", "Academy", "Tuition", "Learning"],
    label: "Education / Training",
    revenueFormula: {
      reachLabel: "Inquiries",
      prospectLabel: "Trial/Demo",
      customerLabel: "Enrolled Students",
      salesLabel: "Revenue",
      avgSaleLabel: "Avg Fee per Student",
      avgTxnLabel: "Programs per Student",
      leadCRLabel: "Trial Rate",
      saleCRLabel: "Enrollment Rate",
    },
    showFunnel: true,
    showInventory: false,
    showDelivery: false,
    showMRR: false,
    showCapacity: true,          // class capacity
    ariaFieldGuide: `
Education / Training field mapping:
- Revenue → periods.MTD: reach=inquiries, leadCR=trialRate, saleCR=enrollmentRate, avgSale=avgFeePerStudent, avgTxn=programsPerStudent
- Inquiries → periods.MTD.reach
- Trial/demo rate → periods.MTD.leadCR
- Enrollment/conversion rate → periods.MTD.saleCR
- Avg fee per student → periods.MTD.avgSale
- Total enrolled students → ops.customers
- Retention/re-enrollment rate → ops.repeatRate
- Class capacity utilization → ops.capacityUsed
- Student satisfaction → ops.csat
- Teacher headcount → ops.headcount`,
  },
  {
    id: "manufacturing",
    match: ["Manufacturing", "Factory", "Production", "Industrial"],
    label: "Manufacturing",
    revenueFormula: {
      reachLabel: "Orders Received",
      prospectLabel: "Quotes Sent",
      customerLabel: "Active Buyers",
      salesLabel: "Revenue",
      avgSaleLabel: "Avg Order Value",
      avgTxnLabel: "Orders per Buyer",
      leadCRLabel: "Quote Rate",
      saleCRLabel: "Order Win Rate",
    },
    showFunnel: true,
    showInventory: true,
    showDelivery: true,
    showMRR: false,
    showCapacity: true,
    ariaFieldGuide: `
Manufacturing field mapping:
- Revenue → periods.MTD: reach=ordersReceived, leadCR=quoteRate, saleCR=winRate, avgSale=avgOrderValue, avgTxn=ordersPerBuyer
- Orders received → periods.MTD.reach
- Quote conversion → periods.MTD.leadCR
- Win rate → periods.MTD.saleCR
- Avg order value → periods.MTD.avgSale
- Production capacity used → ops.capacityUsed
- On-time delivery → ops.onTimeDelivery
- Inventory value → finance.inventory
- Defect/return rate → ops.complaints (repurposed)`,
  },
];

// Default template for unrecognized industries
const DEFAULT_TEMPLATE: IndustryTemplate = {
  id: "default",
  match: [],
  label: "General Business",
  revenueFormula: {
    reachLabel: "Reach / Traffic",
    prospectLabel: "Prospects",
    customerLabel: "Customers",
    salesLabel: "Total Sales",
    avgSaleLabel: "Avg Sale",
    avgTxnLabel: "Avg Transactions",
    leadCRLabel: "Lead Conv. Rate",
    saleCRLabel: "Sale Conv. Rate",
  },
  showFunnel: true,
  showInventory: false,
  showDelivery: false,
  showMRR: false,
  showCapacity: true,
  ariaFieldGuide: `
General business field mapping:
- Revenue → periods.MTD: reach=traffic, leadCR=conversionRate, saleCR=closeRate, avgSale=avgSaleValue, avgTxn=txnPerCustomer
- Use the standard funnel: Reach → Lead CR → Prospects → Sale CR → Customers → Revenue`,
};

/**
 * Auto-detect the industry template from the business profile's industry string.
 * Called once when loading the dashboard — matches against known patterns.
 */
export function getIndustryTemplate(industry: string | null | undefined): IndustryTemplate {
  if (!industry) return DEFAULT_TEMPLATE;
  const lower = industry.toLowerCase();
  for (const t of TEMPLATES) {
    if (t.match.some((m) => lower.includes(m.toLowerCase()))) return t;
  }
  return DEFAULT_TEMPLATE;
}

/** Get the Aria field guide for the detected industry. */
export function getAriaFieldGuide(industry: string | null | undefined): string {
  return getIndustryTemplate(industry).ariaFieldGuide;
}
