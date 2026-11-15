-- Escape rooms, phase 8: each class student's investigator. avatar: the portrait they picked ({"id": "investigator-3"});
-- gear: the gear they have earned, kept in step with their proofs by the server (gear comes from proof only). Only the
-- server (service role) reads or writes it; RLS is on with no policies and the browser roles get no grants.
-- Run in Supabase; until it runs, the investigator card still shows gear (worked out from saved results) but can't
-- save an avatar choice.
create table if not exists public.investigator_profiles (
  student_id uuid primary key references public.students(id) on delete cascade,
  avatar jsonb,
  gear jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.investigator_profiles enable row level security;
revoke all on public.investigator_profiles from anon, authenticated;
notify pgrst, 'reload schema';
