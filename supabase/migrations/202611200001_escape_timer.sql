-- The escape timer (teacher decision, 2026-11-20), replacing the generous room clock: on by default ('escape', 35
-- minutes per chamber) or 'off'. Every existing class moves to the timer, since the old default was off by default
-- rather than by choice; a teacher can still turn it off in the class panel. clock_paused_at: the teacher pauses the
-- timer for the whole class (null while it runs). Run in Supabase; until then classes keep their old setting and the
-- pause button stays hidden.
alter table public.sessions drop constraint if exists sessions_room_clock_check;
alter table public.sessions add constraint sessions_room_clock_check check (room_clock in ('escape', 'off', 'generous', 'extra'));
alter table public.sessions alter column room_clock set default 'escape';
update public.sessions set room_clock = 'escape' where room_clock in ('off', 'generous', 'extra');
alter table public.sessions add column if not exists clock_paused_at timestamptz;
notify pgrst, 'reload schema';
