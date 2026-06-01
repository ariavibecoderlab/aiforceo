"use client";

import dynamic from "next/dynamic";
import type { AgentRole } from "@/lib/prompts";
import type { WorkspaceStub } from "@/lib/workspace";
import { Sidebar } from "@/app/_components/Sidebar";

const OfficeView = dynamic(() => import("@/app/_components/OfficeView").then(m => m.OfficeView), { ssr: false });
const WelcomeGuide = dynamic(() => import("@/app/_components/WelcomeGuide").then(m => m.WelcomeGuide), { ssr: false });

type AgentStat = {
  convCount: number;
  msgCountMtd: number;
  lastActive: string | null;
  lastContent: string | null;
};

export function OfficePageClient({
  workspaceName, workspaceId, agentStats,
  ownerInitial, ownerName,
  hasBusinessProfile, hasBrandVoice, hasFinancials, hasConnectors,
  remaining, quota, allWorkspaces,
}: {
  workspaceName: string;
  workspaceId: string;
  agentStats: Record<AgentRole, AgentStat>;
  ownerInitial: string;
  ownerName: string;
  hasBusinessProfile: boolean;
  hasBrandVoice: boolean;
  hasFinancials: boolean;
  hasConnectors: boolean;
  remaining: number;
  quota: number;
  allWorkspaces: WorkspaceStub[];
}) {
  return (
    <div className="grid min-h-screen app-grid" style={{ gridTemplateColumns: "240px 1fr" }}>
      <Sidebar
        active="office"
        remainingTokens={remaining}
        monthlyQuota={quota}
        workspaceName={workspaceName}
        workspaceId={workspaceId}
        allWorkspaces={allWorkspaces}
      />
      <main style={{ background: "var(--bg)", overflow: "auto" }}>
        <WelcomeGuide
          workspaceName={workspaceName}
          hasKpiData={false}
          hasBusinessProfile={hasBusinessProfile}
          hasBrandVoice={hasBrandVoice}
          hasFinancials={hasFinancials}
          hasConnectors={hasConnectors}
        />
        <OfficeView
          agentStats={agentStats}
          workspaceName={workspaceName}
          ownerInitial={ownerInitial}
          ownerName={ownerName}
        />
      </main>
    </div>
  );
}
