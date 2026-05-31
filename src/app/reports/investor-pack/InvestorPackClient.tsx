"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  seedInvestorPackSpec,
  regenerateAndSave,
  getInvestorPackSpec,
} from "@/server/actions/investorPack";

type Status =
  | {
      hasSpec: true;
      seededFrom: string | null;
      aiNarrativeAt: string | null;
      updatedAt: string;
      company: string;
      version: string;
    }
  | { hasSpec: false };

interface Props {
  workspaceId: string;
  workspaceName: string;
  status: Status;
}

export function InvestorPackClient({
  workspaceId,
  workspaceName,
  status,
}: Props) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [downloading, setDownloading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function seed(source: "bbgb" | "blank") {
    setErr(null);
    setMsg(null);
    startTransition(async () => {
      const res = await seedInvestorPackSpec(workspaceId, source);
      if (!res.ok) setErr(res.error);
      else {
        setMsg(
          `Seeded with ${source === "bbgb" ? "BBGB sample" : "blank template"}.`,
        );
        router.refresh();
      }
    });
  }

  function regenerate() {
    setErr(null);
    setMsg(null);
    startTransition(async () => {
      const res = await regenerateAndSave(workspaceId);
      if (!res.ok) setErr(res.error);
      else {
        setMsg("AI CFO regenerated the narrative layer.");
        router.refresh();
      }
    });
  }

  async function download() {
    setErr(null);
    setMsg(null);
    setDownloading(true);
    try {
      const row = await getInvestorPackSpec(workspaceId);
      if (!row) {
        setErr("No spec saved yet — seed it first.");
        return;
      }
      const { generateInvestorPack, downloadInvestorPack } =
        await import("@/lib/investor-pack/workbook");
      const blob = await generateInvestorPack(row.spec);
      downloadInvestorPack(row.spec, blob);
      setMsg("Excel pack downloaded.");
    } catch (e) {
      console.error(e);
      setErr(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setDownloading(false);
    }
  }

  async function exportPdf() {
    setErr(null);
    setMsg(null);
    setDownloading(true);
    try {
      const row = await getInvestorPackSpec(workspaceId);
      if (!row) {
        setErr("No spec saved yet — seed it first.");
        return;
      }
      const { exportInvestorBriefPDF } =
        await import("@/lib/investor-pack/pdf-brief");
      exportInvestorBriefPDF(row.spec);
      setMsg("PDF brief opened — use the print dialog to save.");
    } catch (e) {
      console.error(e);
      setErr(e instanceof Error ? e.message : "PDF generation failed");
    } finally {
      setDownloading(false);
    }
  }

  // ─── Render: empty state ───────────────────────────────────────────────────
  if (!status.hasSpec) {
    return (
      <div className="card" style={{ padding: "32px", maxWidth: 720 }}>
        <p
          className="text-xs uppercase tracking-widest font-bold mb-2"
          style={{ color: "var(--gold)" }}
        >
          Get started
        </p>
        <h2 className="text-xl font-bold mb-2">
          No investor pack saved for{" "}
          <em style={{ color: "var(--accent)" }}>{workspaceName}</em> yet
        </h2>
        <p className="text-sm text-[var(--muted)] mb-6">
          Choose a starting point. Both options save into this workspace and can
          be edited or regenerated at any time.
        </p>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => seed("bbgb")} disabled={busy} className="btn">
            {busy ? "Seeding…" : "🧪 Use BBGB sample"}
          </button>
          <button
            onClick={() => seed("blank")}
            disabled={busy}
            className="btn btn-ghost"
          >
            Start blank
          </button>
        </div>

        {err && (
          <p className="text-sm mt-4" style={{ color: "var(--red)" }}>
            ⚠ {err}
          </p>
        )}
        {msg && (
          <p className="text-sm mt-4" style={{ color: "var(--success)" }}>
            ✓ {msg}
          </p>
        )}
      </div>
    );
  }

  // ─── Render: spec exists ───────────────────────────────────────────────────
  const aiDate = status.aiNarrativeAt
    ? new Date(status.aiNarrativeAt).toLocaleString()
    : "Never";
  const updated = new Date(status.updatedAt).toLocaleString();

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 760 }}>
      {/* ── Status card ── */}
      <div className="card" style={{ padding: "24px 28px" }}>
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">{status.company}</h2>
            <p className="text-xs text-[var(--muted)]">
              Spec version {status.version} · Seeded from{" "}
              <strong style={{ color: "var(--ink)" }}>
                {status.seededFrom ?? "—"}
              </strong>
            </p>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 20,
              background: "var(--success)",
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            SPEC SAVED
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            background: "var(--soft)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: "14px 18px",
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 4,
              }}
            >
              Last edit
            </p>
            <p style={{ color: "var(--ink)" }}>{updated}</p>
          </div>
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 4,
              }}
            >
              AI narrative
            </p>
            <p style={{ color: "var(--ink)" }}>{aiDate}</p>
          </div>
        </div>
      </div>

      {/* ── Action card ── */}
      <div className="card" style={{ padding: "24px 28px" }}>
        <h3 className="font-bold mb-3">Actions</h3>
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={download}
            disabled={downloading || busy}
            className="btn"
          >
            {downloading ? "Generating…" : "📊 Download Excel (.xlsx)"}
          </button>
          <button
            onClick={exportPdf}
            disabled={downloading || busy}
            className="btn btn-ghost"
          >
            📄 One-Pager PDF
          </button>
          <button
            onClick={regenerate}
            disabled={busy || downloading}
            className="btn btn-ghost"
          >
            {busy ? "AI thinking…" : "✨ Regenerate AI Narrative"}
          </button>
          <button
            onClick={() => seed("bbgb")}
            disabled={busy || downloading}
            className="btn btn-ghost"
          >
            Re-seed BBGB
          </button>
          <button
            onClick={() => seed("blank")}
            disabled={busy || downloading}
            className="btn btn-ghost"
          >
            Reset blank
          </button>
        </div>

        {err && (
          <p className="text-sm" style={{ color: "var(--red)" }}>
            ⚠ {err}
          </p>
        )}
        {msg && (
          <p className="text-sm" style={{ color: "var(--success)" }}>
            ✓ {msg}
          </p>
        )}

        <div
          style={{
            marginTop: 18,
            padding: "12px 16px",
            background: "var(--soft)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            fontSize: 12,
            color: "var(--muted)",
            lineHeight: 1.55,
          }}
        >
          <strong style={{ color: "var(--ink)" }}>How this works:</strong>
          <ul style={{ marginTop: 6, paddingLeft: 20 }}>
            <li>
              <strong>Excel download</strong> — generates a 10-tab live model
              with editable blue input cells, formula-driven projections, and
              cross-sheet cashflow.
            </li>
            <li>
              <strong>Regenerate AI Narrative</strong> — your AI CFO reads the
              hard numbers in this spec and rewrites the highlights, thesis,
              risks, and per-section insights. Hard numbers are never altered.
            </li>
            <li>
              <strong>Re-seed BBGB</strong> — overwrites the spec with the
              Brainy Bunch Group reference dataset (for demo or template
              cloning).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
