import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ROLE_LABEL: Record<string, string> = {
  viewer: "Viewer",
  editor: "Editor",
  manager: "Manager",
};

const ROLE_DESC: Record<string, string> = {
  viewer: "Read dashboards and conversation history",
  editor: "Edit KPIs and chat with the AI executives",
  manager: "Full workspace access",
};

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const admin = createSupabaseAdminClient();

  // Look up the invite
  const { data: invite } = await admin
    .from("workspace_members")
    .select("id, invitee_email, role, status, workspace_id, workspaces(name)")
    .eq("invite_token", token)
    .maybeSingle();

  // Invalid token
  if (!invite) {
    return (
      <InviteShell>
        <p className="text-4xl mb-4" style={{ color: "var(--red)" }}>
          🚫
        </p>
        <h1 className="text-2xl font-bold mb-2">Invalid invite link</h1>
        <p className="text-[var(--muted)] mb-6">
          This link is invalid or has expired.
        </p>
        <Link href="/login" className="btn">
          Go to sign in
        </Link>
      </InviteShell>
    );
  }

  // Already revoked
  if (invite.status === "revoked") {
    return (
      <InviteShell>
        <p className="text-4xl mb-4">🔒</p>
        <h1 className="text-2xl font-bold mb-2">Invite revoked</h1>
        <p className="text-[var(--muted)] mb-6">
          This invite has been revoked by the workspace owner.
        </p>
        <Link href="/login" className="btn">
          Go to sign in
        </Link>
      </InviteShell>
    );
  }

  // Already accepted — just send them to login
  if (invite.status === "active") {
    return (
      <InviteShell>
        <p className="text-4xl mb-4">✅</p>
        <h1 className="text-2xl font-bold mb-2">Already accepted</h1>
        <p className="text-[var(--muted)] mb-6">
          You already have access to this workspace. Sign in to continue.
        </p>
        <Link
          href={`/login?email=${encodeURIComponent(invite.invitee_email)}`}
          className="btn"
        >
          Sign in →
        </Link>
      </InviteShell>
    );
  }

  // Pending — show the proper invite card
  const workspaceName =
    (invite.workspaces as unknown as { name: string } | null)?.name ??
    "a workspace";
  const role = invite.role as string;
  const loginUrl = `/login?email=${encodeURIComponent(invite.invitee_email)}`;

  return (
    <InviteShell>
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
        <span
          className="logo-mark"
          style={{ width: 32, height: 32, borderRadius: 9 }}
        />
        <span className="font-bold text-xl">
          AI<span style={{ color: "var(--accent)" }}>for</span>CEO
        </span>
      </Link>

      <div
        className="card text-center"
        style={{ padding: "32px 28px", maxWidth: 440, width: "100%" }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 28,
          }}
        >
          👥
        </div>

        <p
          className="text-xs uppercase tracking-widest font-bold mb-2"
          style={{ color: "var(--accent)" }}
        >
          You&apos;re invited
        </p>

        <h1 className="serif text-2xl font-bold mb-1">
          Join{" "}
          <em className="italic" style={{ color: "var(--accent)" }}>
            {workspaceName}
          </em>
        </h1>

        <p className="text-sm text-[var(--muted)] mb-6">
          You&apos;ve been invited to collaborate on the AI C-Suite.
        </p>

        {/* Role badge */}
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            background: "var(--panel2)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: "12px 24px",
            marginBottom: 24,
            width: "100%",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--muted)",
            }}
          >
            Your role
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "var(--ink)",
            }}
          >
            {ROLE_LABEL[role] ?? role}
          </span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            {ROLE_DESC[role]}
          </span>
        </div>

        {/* Invited email */}
        <p className="text-xs text-[var(--muted)] mb-6">
          Invited to:{" "}
          <strong style={{ color: "var(--ink)" }}>
            {invite.invitee_email}
          </strong>
          <br />
          Sign in or create an account with this exact email to activate access.
        </p>

        <Link
          href={loginUrl}
          className="btn w-full justify-center"
          style={{ display: "block", textAlign: "center" }}
        >
          Accept invite →
        </Link>

        <p className="text-xs text-[var(--muted)] mt-4">
          By accepting, you agree to AIforCEO&apos;s{" "}
          <Link href="/" className="underline">
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </InviteShell>
  );
}

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div style={{ width: "100%", maxWidth: 440 }}>{children}</div>
    </main>
  );
}
