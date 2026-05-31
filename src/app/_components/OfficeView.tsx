"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AGENTS, type AgentRole } from "@/lib/prompts";
import { useState } from "react";

const ROLES: AgentRole[] = ["aria", "cmo", "coo", "cfo", "ceo", "cto"];

type AgentStat = {
  convCount: number;
  msgCountMtd: number;
  lastActive: string | null;
  lastContent: string | null;
};

type Props = {
  agentStats: Record<AgentRole, AgentStat>;
  workspaceName: string;
  activeAgentTasks?: Record<string, string>;
};

// Each agent's desk position on the office background image (percentage-based)
// Mapped to the pixel-art office layout
const DESK_POSITIONS: Record<AgentRole, { top: string; left: string; label: string }> = {
  aria:  { top: "72%",  left: "38%",  label: "Chief of Staff" },     // Bottom center reception desk
  cmo:   { top: "18%",  left: "12%",  label: "Marketing" },           // Top-left open desks
  coo:   { top: "32%",  left: "12%",  label: "Operations" },          // Left open desks row 2
  cfo:   { top: "52%",  left: "72%",  label: "Finance" },             // Right side desks
  ceo:   { top: "40%",  left: "42%",  label: "Strategy" },            // Center conference room area
  cto:   { top: "18%",  left: "78%",  label: "Technology" },           // Top-right focus room
};

export function OfficeView({ agentStats, workspaceName, activeAgentTasks = {} }: Props) {
  const [hoveredAgent, setHoveredAgent] = useState<AgentRole | null>(null);
  const activeCount = Object.keys(activeAgentTasks).length;

  return (
    <div style={{ width: "100%", padding: "16px 0" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", marginBottom: 16 }}
      >
        <p style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 2px" }}>
          🏢 {workspaceName} HQ
        </p>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
          {activeCount > 0
            ? `${activeCount} executive${activeCount > 1 ? "s" : ""} working • Click any desk to chat`
            : "All executives standing by • Click any desk to chat"
          }
        </p>
      </motion.div>

      {/* Office map container */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        borderRadius: 16,
        overflow: "hidden",
        border: "2px solid var(--line)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}>
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/office-bg.png"
          alt="AI Executive Office"
          style={{ width: "100%", height: "auto", display: "block" }}
        />

        {/* Agent hotspots overlaid on the image */}
        {ROLES.map((role) => {
          const pos = DESK_POSITIONS[role];
          const agent = AGENTS[role];
          const stat = agentStats[role];
          const isActive = !!activeAgentTasks[role];
          const isHovered = hoveredAgent === role;
          const grad = `linear-gradient(135deg, ${agent.gradient[0]}, ${agent.gradient[1]})`;

          return (
            <Link
              key={role}
              href={`/agent/${role}`}
              style={{ textDecoration: "none" }}
            >
              <motion.div
                onHoverStart={() => setHoveredAgent(role)}
                onHoverEnd={() => setHoveredAgent(null)}
                style={{
                  position: "absolute",
                  top: pos.top,
                  left: pos.left,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  zIndex: isHovered ? 20 : 10,
                }}
              >
                {/* Activity bubble */}
                <AnimatePresence>
                  {(isActive || isHovered) && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.8 }}
                      style={{
                        background: isActive ? "var(--accent)" : "var(--panel)",
                        border: isActive ? "none" : "1px solid var(--line)",
                        color: isActive ? "#fff" : "var(--ink)",
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: 12,
                        marginBottom: 4,
                        whiteSpace: "nowrap",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                        textAlign: "center",
                        maxWidth: 160,
                      }}
                    >
                      {isActive
                        ? activeAgentTasks[role]
                        : (
                          <>
                            <strong>{agent.name}</strong> · {agent.title.replace("AI ", "")}
                            <br />
                            <span style={{ fontSize: 9, opacity: 0.8 }}>
                              {stat?.msgCountMtd ?? 0} msgs this month
                            </span>
                          </>
                        )
                      }
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Agent avatar */}
                <motion.div
                  animate={isActive
                    ? { scale: [1, 1.15, 1], boxShadow: [`0 0 0 0 ${agent.gradient[0]}60`, `0 0 0 12px ${agent.gradient[0]}00`] }
                    : { y: [0, -3, 0] }
                  }
                  transition={isActive
                    ? { duration: 1, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: ROLES.indexOf(role) * 0.3 }
                  }
                  whileHover={{ scale: 1.25 }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: grad,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 16,
                    color: role === "ceo" ? "#1E2761" : "#fff",
                    boxShadow: isActive
                      ? `0 0 20px ${agent.gradient[0]}60`
                      : "0 2px 8px rgba(0,0,0,0.3)",
                    border: isHovered ? "2px solid #fff" : "2px solid transparent",
                  }}
                >
                  {agent.name[0]}
                </motion.div>

                {/* Name label */}
                <div style={{
                  marginTop: 3,
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#fff",
                  textShadow: "0 1px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)",
                  textAlign: "center",
                  lineHeight: 1.2,
                }}>
                  {agent.name}
                </div>

                {/* Typing indicator when active */}
                {isActive && (
                  <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        style={{
                          width: 4, height: 4, borderRadius: "50%",
                          background: "#fff",
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 16,
        marginTop: 16,
        flexWrap: "wrap",
      }}>
        {ROLES.map((role) => {
          const agent = AGENTS[role];
          const stat = agentStats[role];
          return (
            <Link
              key={role}
              href={`/agent/${role}`}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 11, color: "var(--muted)", textDecoration: "none",
              }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: 4,
                background: `linear-gradient(135deg, ${agent.gradient[0]}, ${agent.gradient[1]})`,
                display: "inline-block",
              }} />
              {agent.name}
              <span style={{ fontSize: 10, opacity: 0.6 }}>
                ({stat?.msgCountMtd ?? 0})
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
