import { redirect } from "next/navigation";
import { Sidebar } from "@/app/_components/Sidebar";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getRemainingTokens, TIER_MONTHLY_TOKENS } from "@/lib/credits";
import { getInvestorPackSpec } from "@/server/actions/investorPack";
import { InvestorPackClient } from "./InvestorPackClient";

export default async function InvestorPackPage() {
  const ctx = await getCurrentWorkspace();
  if (!ctx) redirect("/onboarding");
  const { workspace, allWorkspaces } = ctx;
  const remaining = await getRemainingTokens(workspace.id);
  const quota = TIER_MONTHLY_TOKENS[workspace.tier] ?? 100_000;

  const row = await getInvestorPackSpec(workspace.id);

  const status = row
    ? {
        hasSpec: true as const,
        seededFrom: row.seeded_from,
        aiNarrativeAt: row.ai_narrative_at,
        updatedAt: row.updated_at,
        company: row.spec.company.legalName,
        version: row.spec.version,
      }
    : { hasSpec: false as const };

  return (
    <div className="flex">
      <Sidebar
        active="investor-pack"
        remainingTokens={remaining}
        monthlyQuota={quota}
        workspaceName={workspace.name}
        workspaceId={workspace.id}
        allWorkspaces={allWorkspaces}
      />
      <main
        className="flex-1 min-h-screen"
        style={{ padding: "40px 56px", maxWidth: 1100 }}
      >
        <span
          className="inline-block text-xs uppercase tracking-widest font-bold mb-3"
          style={{ color: "var(--accent)" }}
        >
          Reports · CFO
        </span>
        <h1 className="serif text-4xl leading-tight mb-2">
          Investor Due Diligence Pack
        </h1>
        <p className="text-[var(--muted)] mb-10 max-w-2xl">
          A 10-tab investor-grade Excel workbook — executive summary, 15-year
          track record, management accounts, corporate structure, statutory
          liabilities, asset register, 5-year projections, and valuation
          scenarios. Hard numbers from your data; narrative from your AI CFO.
        </p>

        <InvestorPackClient
          workspaceId={workspace.id}
          workspaceName={workspace.name}
          status={status}
        />
      </main>
    </div>
  );
}
