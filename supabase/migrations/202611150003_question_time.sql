-- Student testing (2026-11-15): a class's question time. Standard (the default) or more (every question half as long
-- again). A student's own time setting still multiplies it (lib/expedition.ts questionSetting). Run in Supabase; the app
-- hides the setting until this column exists.
alter table public.sessions add column if not exists question_time text not null default 'standard'
  check (question_time in ('standard', 'more'));
notify pgrst, 'reload schema';
