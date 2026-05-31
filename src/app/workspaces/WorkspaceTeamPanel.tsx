"use client";

import { useState, useTransition } from "react";
import {
  inviteMember,
  listMembers,
  removeMember,
  updateMemberRole,
  approveMember,
} from "@/server/actions/team";
import type { WorkspaceMember, MemberRole } from "@/server/actions/team";

const ROLE_COLOR: Record<MemberRole, string> = {
  manager: "#7C3AED",
  editor: "#0096C7",
  viewer: "#22c55e",
};

const ROLE_LABEL: Record<MemberRole, string> = {
  manager: "Manager",
  editor: "Editor",
  viewer: "Viewer",
};

function RoleBadge({ role }: { role: MemberRole }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 20,
        background: ROLE_COLOR[role] + "18",
        color: ROLE_COLOR[role],
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "active"
      ? "#22c55e"
      : status === "awaiting_approval"
        ? "#f97316"
        : status === "pending"
          ? "#f59e0b"
          : "#94a3b8";
  const label =
    status === "active"
      ? "Active"
      : status === "awaiting_approval"
        ? "Awaiting Approval"
        : status === "pending"
          ? "Invite Sent"
          : "Revoked";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        color,
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}

export function WorkspaceTeamPanel({
  workspaceId,
  initialMembers,
}: {
  workspaceId: string;
  initialMembers: WorkspaceMember[];
}) {
  const [members, setMembers] = useState<WorkspaceMember[]>(initialMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("viewer");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "https://aiforceo.app");

  function inviteLink(token: string) {
    return `${appUrl}/invite/${token}`;
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(inviteLink(token));
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    startTransition(async () => {
      const res = await inviteMember(workspaceId, { email, role });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setMembers((prev) => {
        const idx = prev.findIndex((m) => m.id === res.member.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = res.member;
          return next;
        }
        return [...prev, res.member];
      });
      setEmail("");
      setOpen(false);
    });
  }

  async function handleApprove(memberId: string) {
    const res = await approveMember(workspaceId, memberId);
    if (res.ok)
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, status: "active" } : m)),
      );
  }

  async function handleRemove(memberId: string) {
    const res = await removeMember(workspaceId, memberId);
    if (res.ok) setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }

  async function handleRoleChange(memberId: string, newRole: MemberRole) {
    const res = await updateMemberRole(workspaceId, memberId, newRole);
    if (res.ok)
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
      );
  }

  async function handleRefresh() {
    const fresh = await listMembers(workspaceId);
    setMembers(fresh);
  }

  return (
    <div
      style={{
        marginTop: 16,
        borderTop: "1px solid var(--line)",
        paddingTop: 14,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>
          Team Members
          {members.length > 0 && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                fontWeight: 600,
                color: "var(--muted)",
              }}
            >
              {members.length}
            </span>
          )}
        </h4>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={handleRefresh}
            className="btn btn-ghost"
            style={{ fontSize: 11, padding: "4px 8px" }}
            title="Refresh member list"
          >
            ↻
          </button>
          <button
            onClick={() => {
              setOpen(!open);
              setErr("");
            }}
            className="btn"
            style={{ fontSize: 11, padding: "4px 12px", whiteSpace: "nowrap" }}
          >
            {open ? "Cancel" : "+ Invite"}
          </button>
        </div>
      </div>

      {/* Invite form */}
      {open && (
        <form
          onSubmit={handleInvite}
          style={{
            background: "var(--soft)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>
            Invite someone by email. Share the link so they can join.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="input text-sm"
              style={{ flex: "1 1 180px", minWidth: 0 }}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as MemberRole)}
              className="input text-sm"
              style={{ flex: "0 0 120px" }}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="manager">Manager</option>
            </select>
            <button
              type="submit"
              disabled={isPending || !email}
              className="btn text-sm"
              style={{ opacity: isPending ? 0.6 : 1, whiteSpace: "nowrap" }}
            >
              {isPending ? "Sending…" : "Send invite"}
            </button>
          </div>
          {err && (
            <p
              style={{
                fontSize: 12,
                color: "var(--red)",
                fontWeight: 600,
                margin: 0,
              }}
            >
              ⚠ {err}
            </p>
          )}
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            <strong>Viewer</strong> — read dashboards &amp; history ·{" "}
            <strong>Editor</strong> — edit KPIs + chat ·{" "}
            <strong>Manager</strong> — full access
          </div>
        </form>
      )}

      {/* Member list */}
      {members.length === 0 ? (
        <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
          No team members yet. Invite someone to collaborate.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {members.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                background: "var(--soft)",
                borderRadius: 8,
                border: "1px solid var(--line)",
                flexWrap: "wrap",
              }}
            >
              {/* Email + status */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.invitee_email}
                </p>
                <StatusDot status={m.status} />
              </div>

              {/* Role selector */}
              <select
                value={m.role}
                onChange={(e) =>
                  handleRoleChange(m.id, e.target.value as MemberRole)
                }
                className="input"
                style={{ fontSize: 11, padding: "3px 8px", width: "auto" }}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="manager">Manager</option>
              </select>
              <RoleBadge role={m.role} />

              {/* Awaiting approval — Approve / Reject */}
              {m.status === "awaiting_approval" && (
                <>
                  <button
                    onClick={() => handleApprove(m.id)}
                    className="btn"
                    style={{
                      fontSize: 11,
                      padding: "3px 10px",
                      whiteSpace: "nowrap",
                      background: "#22c55e",
                      borderColor: "#22c55e",
                      color: "#fff",
                    }}
                    title="Approve access"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleRemove(m.id)}
                    className="btn btn-ghost"
                    style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      color: "var(--red)",
                      whiteSpace: "nowrap",
                    }}
                    title="Reject request"
                  >
                    ✕ Reject
                  </button>
                </>
              )}

              {/* Copy invite link (only for pending — not yet accepted) */}
              {m.status === "pending" && (
                <button
                  onClick={() => copyLink(m.invite_token)}
                  className="btn btn-ghost"
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    whiteSpace: "nowrap",
                  }}
                  title="Copy invite link"
                >
                  {copied === m.invite_token ? "✓ Copied!" : "📋 Copy link"}
                </button>
              )}

              {/* Remove (active members) */}
              {m.status === "active" && (
                <button
                  onClick={() => handleRemove(m.id)}
                  className="btn btn-ghost"
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    color: "var(--red)",
                  }}
                  title="Remove member"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
