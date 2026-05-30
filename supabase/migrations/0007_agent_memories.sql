-- =========================================================
-- Migration 0007 · Agent memory system
-- =========================================================
-- WHAT: Adds an agent_memories table so AI executives can
--   accumulate knowledge across conversations.
--   Every workspace has its own isolated memory store (PDPA
--   compliant — no cross-workspace data sharing).
--
-- Memory is extracted from each conversation turn by Claude
--   (background, non-blocking) and retrieved at request time
--   as a compact section injected into the system prompt.
--
-- WHY: Agents currently rebuild context from a static onboarding
--   snapshot on every request. This table closes the loop so facts
--   the owner mentions ("We hired 3 staff", "Decided on Q4 expansion")
--   persist and inform all future conversations.
--
-- ROLLBACK: DROP TABLE public.agent_memories;
-- =========================================================

create table if not exists public.agent_memories (
  id                 uuid        primary key default gen_random_uuid(),
  workspace_id       uuid        not null
                                   references public.workspaces(id) on delete cascade,
  category           text        not null
                                   check (category in (
                                     'business_fact',
                                     'decision',
                                     'preference',
                                     'concern',
                                     'milestone'
                                   )),
  content            text        not null,    -- single plain-English sentence, max ~200 chars
  source_agent       text,                    -- agent role that extracted this memory (nullable)
  importance         smallint    not null default 2
                                   check (importance between 1 and 3),
                                   -- 1=nice-to-know, 2=useful context, 3=critical
  created_at         timestamptz not null default now(),
  last_reinforced_at timestamptz not null default now()
                                   -- bumped when same fact is re-confirmed in a later turn
);

create index if not exists agent_memories_ws_idx
  on public.agent_memories (workspace_id, importance desc, last_reinforced_at desc);

alter table public.agent_memories enable row level security;

drop policy if exists agent_memories_owner_all on public.agent_memories;
create policy agent_memories_owner_all on public.agent_memories
  for all using (public.is_owner(workspace_id))
  with check (public.is_owner(workspace_id));

-- Self-test
do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'agent_memories'
  ) then
    raise exception 'Migration 0007 FAILED — agent_memories table missing';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'agent_memories'
      and column_name  = 'last_reinforced_at'
  ) then
    raise exception 'Migration 0007 FAILED — last_reinforced_at column missing';
  end if;
  raise notice 'Migration 0007 PASSED — agent memory system ready.';
end $$;
