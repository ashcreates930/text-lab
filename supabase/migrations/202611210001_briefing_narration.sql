-- Briefing narration in solo play (on, or captions only) for each class, and "Read passages aloud automatically" for
-- each student (app/mission-briefing.tsx, app/read-aloud.tsx). Until this runs, every class narrates and the teacher
-- settings stay hidden.
alter table public.sessions add column if not exists briefing_narration text not null default 'on'
  check (briefing_narration in ('on', 'captions'));
alter table public.students add column if not exists read_aloud boolean not null default false;
notify pgrst, 'reload schema';
