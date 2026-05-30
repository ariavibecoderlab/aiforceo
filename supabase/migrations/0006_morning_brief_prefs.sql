-- =========================================================
-- Migration 0006 · Morning brief preferences
-- =========================================================
-- WHAT: Adds three columns to workspaces so each workspace can
--   opt into a daily AI morning brief from Aria (Chief of Staff):
--     * morning_brief_enabled — toggle on/off
--     * brief_timezone        — user's local timezone (IANA format)
--     * brief_hour            — local hour to deliver (0-23, default 9 = 9am)
--
-- WHY:  The cron worker (wrangler-cron.jsonc) runs hourly and checks
--   which workspaces are "due" for their brief based on timezone + hour.
--   Stored on workspaces (not profiles) so multi-workspace users can
--   configure per-business briefs independently.
--
-- ROLLBACK: ALTER TABLE workspaces DROP COLUMN morning_brief_enabled,
--           DROP COLUMN brief_timezone, DROP COLUMN brief_hour.
-- =========================================================

alter table public.workspaces
  add column if not exists morning_brief_enabled boolean not null default false,
  add column if not exists brief_timezone        text    not null default 'Asia/Kuala_Lumpur',
  add column if not exists brief_hour            integer not null default 9
    constraint workspaces_brief_hour_range check (brief_hour >= 0 and brief_hour <= 23);

-- Self-test
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'workspaces'
      and column_name  = 'morning_brief_enabled'
  ) then
    raise exception 'Migration 0006 FAILED — morning_brief_enabled column missing';
  end if;
  raise notice 'Migration 0006 PASSED — morning brief prefs added to workspaces.';
end $$;
