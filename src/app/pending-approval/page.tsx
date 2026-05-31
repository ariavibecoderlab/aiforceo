"use client";

import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

export default function PendingApprovalPage() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2.5 mb-8"
        >
          <span
            className="logo-mark"
            style={{ width: 32, height: 32, borderRadius: 9 }}
          />
          <span className="font-bold text-xl">
            AI<span style={{ color: "var(--accent)" }}>for</span>CEO
          </span>
        </Link>

        <div className="card" style={{ padding: "40px 32px" }}>
          {/* Waiting indicator */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(249,163,22,0.12)",
              border: "2px solid rgba(249,163,22,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 20px",
            }}
          >
            ⏳
          </div>

          <h1 className="serif text-2xl mb-3">Awaiting Admin Approval</h1>

          <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed">
            Your request to join the workspace has been received. The workspace
            admin needs to approve your access before you can continue.
          </p>

          <div
            style={{
              background: "var(--soft)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "16px 18px",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <p
              className="text-xs uppercase tracking-widest font-bold mb-2"
              style={{ color: "var(--accent)" }}
            >
              What happens next
            </p>
            <ul className="text-sm text-[var(--muted)] space-y-1.5">
              <li>
                1. The workspace owner will see your request in their{" "}
                <strong style={{ color: "var(--ink)" }}>Workspaces</strong> page
              </li>
              <li>
                2. They will click{" "}
                <strong style={{ color: "var(--ink)" }}>✓ Approve</strong> to
                grant you access
              </li>
              <li>
                3. Sign in again — you will be taken straight to the dashboard
              </li>
            </ul>
          </div>

          <button
            onClick={handleSignOut}
            className="btn btn-ghost w-full justify-center text-sm"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
