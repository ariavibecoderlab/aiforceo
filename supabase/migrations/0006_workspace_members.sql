-- workspace_members: team invites and role-based access per workspace.
-- Workspace owners invite collaborators by email. The invited user's status
-- transitions from pending → active when they sign in with the matching email.

create type member_role   as enum ('viewer', 'editor', 'manager');
create type invite_status as enum ('pending', 'active', 'revoked');

create table workspace_members (
  id             uuid          primary key default gen_random_uuid(),
  workspace_id   uuid          not null references workspaces(id) on delete cascade,
  invitee_email  text          not null,
  role           member_role   not null default 'viewer',
  status         invite_status not null default 'pending',
  invite_token   uuid          not null default gen_random_uuid(),
  invited_by     uuid          not null references auth.users(id),
  accepted_at    timestamptz,
  created_at     timestamptz   not null default now()
);

-- One invite per email per workspace
create unique index workspace_members_ws_email_idx
  on workspace_members(workspace_id, lower(invitee_email));

-- Index for fast lookup by token (accept-invite flow)
create index workspace_members_token_idx on workspace_members(invite_token);

-- Index for looking up all workspaces a user belongs to (by email)
create index workspace_members_email_idx on workspace_members(lower(invitee_email));

alter table workspace_members enable row level security;

-- Service role (used by all server actions) bypasses RLS automatically.
-- These policies cover direct Supabase client calls if ever needed.
create policy "owner_manage" on workspace_members
  for all using (
    workspace_id in (select id from workspaces where owner_id = auth.uid())
  );

create policy "invitee_read" on workspace_members
  for select using (
    lower(invitee_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
