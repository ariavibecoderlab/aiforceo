-- ─── Autopilot: AI Co-founder autonomous runs ────────────────────────────────
-- autopilot_config: one row per workspace with the owner's preferences
-- autopilot_runs:   one row per execution of the agent

create table if not exists autopilot_config (
  workspace_id  uuid primary key references workspaces(id) on delete cascade,
  enabled       boolean not null default false,
  tasks         jsonb   not null default '["daily_brief","social_post","content_idea"]'::jsonb,
  schedule      text    not null default 'daily',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists autopilot_runs (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  run_date      date not null default current_date,
  status        text not null default 'pending'
                  check (status in ('pending','running','done','error')),
  tasks         jsonb,
  outputs       jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists autopilot_runs_workspace_date_idx
  on autopilot_runs (workspace_id, created_at desc);

-- RLS: workspace owner can read their own rows; admin client bypasses RLS for writes.
alter table autopilot_config enable row level security;
alter table autopilot_runs   enable row level security;

create policy "owner select config"
  on autopilot_config for select
  using (
    workspace_id in (
      select id from workspaces where owner_id = auth.uid()
    )
  );

create policy "owner select runs"
  on autopilot_runs for select
  using (
    workspace_id in (
      select id from workspaces where owner_id = auth.uid()
    )
  );
