-- ─── Investor Pack Specs ─────────────────────────────────────────────────────
-- One row per workspace. Stores the full InvestorPackSpec as JSONB so the
-- spec schema can evolve without migrations. The AI CFO + workspace owner
-- both write to this table.

create table if not exists investor_pack_specs (
  workspace_id  uuid primary key references workspaces(id) on delete cascade,
  spec          jsonb not null,
  -- Optional: track which seed was used to bootstrap (e.g. "bbgb", "blank")
  seeded_from   text,
  -- Last time the AI CFO regenerated the narrative layer
  ai_narrative_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table investor_pack_specs enable row level security;

-- Owner can read their own
create policy "owner select investor pack"
  on investor_pack_specs for select
  using (
    workspace_id in (
      select id from workspaces where owner_id = auth.uid()
    )
  );

-- All writes go via the service-role admin client in server actions.
