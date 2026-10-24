-- Story Mode squads: the teacher can mark a student absent for the day (from the live host screen or the class page).
-- Absent students are left out of squad averages; every other squad member counts, with 0 if they didn't answer.
-- A mark lasts only for the date it was set (UTC).
alter table public.students add column if not exists absent_on date;
create index if not exists students_absent_on on public.students (session_id, absent_on);
