"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { renameWorkspace, deleteWorkspace } from "@/server/actions/workspaces";

interface Props {
  workspaceId: string;
  name: string;
  isActive: boolean;
  isOnly: boolean; // can't delete the last workspace
}

export function WorkspaceActions({
  workspaceId,
  name,
  isActive,
  isOnly,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function handleEditStart() {
    setDraft(name);
    setError(null);
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
    setError(null);
  }

  function handleSave() {
    if (draft.trim() === name) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const result = await renameWorkspace(workspaceId, draft.trim());
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (isOnly) return;
    const confirmed = window.confirm(
      `Delete "${name}"?\n\nThis will permanently remove the workspace, all conversations, and all data. This cannot be undone.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteWorkspace(workspaceId);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            className="input text-lg font-semibold flex-1 py-1"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            maxLength={80}
            disabled={isPending}
          />
          <button
            onClick={handleSave}
            disabled={isPending || draft.trim().length < 2}
            className="btn text-xs px-3 py-1"
            style={{ minWidth: 0 }}
          >
            {isPending ? "…" : "Save"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="btn btn-ghost text-xs px-3 py-1"
            style={{ minWidth: 0 }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <h3 className="serif text-xl">{name}</h3>
            {isActive && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: "var(--accent)",
                  color: "#fff",
                }}
              >
                ACTIVE
              </span>
            )}
          </div>
          {/* Action buttons — always visible */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleEditStart}
              title="Rename workspace"
              className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors p-1 rounded"
              style={{ lineHeight: 1 }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            {!isOnly && (
              <button
                onClick={handleDelete}
                title="Delete workspace"
                disabled={isPending}
                className="hover:text-[var(--red)] transition-colors p-1 rounded"
                style={{ lineHeight: 1, color: "var(--muted)" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
