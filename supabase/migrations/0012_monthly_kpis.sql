-- Monthly KPI storage — one row per workspace per month
create table if not exists public.workspace_kpi_months (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  month         text not null,  -- 'YYYY-MM' format
  period_data   jsonb not null default '{}'::jsonb,
  finance_data  jsonb not null default '{}'::jsonb,
  ops_data      jsonb not null default '{}'::jsonb,
  marketing     jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint workspace_kpi_months_ws_month unique (workspace_id, month)
);

create index if not exists workspace_kpi_months_ws_idx
  on public.workspace_kpi_months(workspace_id, month desc);

alter table public.workspace_kpi_months enable row level security;

create policy workspace_kpi_months_owner_all on public.workspace_kpi_months
  for all using (public.is_owner(workspace_id))
  with check (public.is_owner(workspace_id));

-- Migrate existing data: MTD → current month record
insert into public.workspace_kpi_months (workspace_id, month, period_data, finance_data, ops_data, marketing, updated_at)
select
  wk.workspace_id,
  to_char(now(), 'YYYY-MM'),
  coalesce(wk.kpi_data->'periods'->'MTD', '{}'::jsonb),
  coalesce(wk.kpi_data->'finance', '{}'::jsonb),
  coalesce(wk.kpi_data->'ops', '{}'::jsonb),
  coalesce(wk.kpi_data->'marketing', '[]'::jsonb),
  wk.updated_at
from public.workspace_kpis wk
where wk.kpi_data is not null
  and wk.kpi_data != '{}'::jsonb
on conflict (workspace_id, month) do nothing;
