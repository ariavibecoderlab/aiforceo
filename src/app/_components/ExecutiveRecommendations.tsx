"use client";

import type { AgentRole } from "@/lib/prompts";
import { AgentRecommendationCard } from "./AgentRecommendationCard";

type AgentStat = {
  convCount: number;
  msgCountMtd: number;
  lastActive: string | null;
  lastContent: string | null;
};

type Props = {
  agentStats: Record<AgentRole, AgentStat>;
  memories?: Array<{ category: string; content: string; source_agent: string | null }>;
};

const ROLES: AgentRole[] = ["aria", "cmo", "coo", "cfo", "ceo", "cto"];

const DEFAULT_INSIGHTS: Record<AgentRole, { insight: string; action: string }> = {
  aria: { insight: "Ready to coordinate your C-Suite. Ask me for a morning brief or delegate a task to any executive.", action: "Ask Aria" },
  cmo: { insight: "Review your marketing channels and customer acquisition. I can draft campaigns and content.", action: "Review Marketing" },
  coo: { insight: "Check operations metrics — headcount, delivery, and process efficiency.", action: "View Operations" },
  cfo: { insight: "Analyse your P&L, cash flow, and financial health. Share a screenshot to get started.", action: "Review Finances" },
  ceo: { insight: "Strategic planning and decision support. Let me help with your 90-day goals.", action: "Review Strategy" },
  cto: { insight: "Tech stack audit, automation opportunities, and security review available.", action: "View Roadmap" },
};

export function ExecutiveRecommendations({ agentStats, memories }: Props) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          AI Executive Recommendations
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {ROLES.map((role) => {
          const stat = agentStats[role];
          // Try to find a recent memory from this agent
          const agentMemory = memories?.find(m => m.source_agent === role);
          const insight = agentMemory?.content ?? (stat?.lastContent?.slice(0, 100) ?? DEFAULT_INSIGHTS[role].insight);
          const action = DEFAULT_INSIGHTS[role].action;

          return (
            <AgentRecommendationCard
              key={role}
              role={role}
              insight={insight}
              actionLabel={action}
            />
          );
        })}
      </div>
    </div>
  );
}
