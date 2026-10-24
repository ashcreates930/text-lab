-- Story Mode squads: the teacher can mark a student absent for a day (from the live host screen or the class page).
-- Absent students are left out of squad averages; every other squad member counts, with 0 if they didn't answer.
-- One row per absence, keyed by the school day (America/New_York date). Live session totals are recalculated from the
-- answers each time they're shown, using the absences on the day the session ran, so past days must keep their rows.
create table if not exists public.student_absences (
  student_id uuid not null references public.students(id) on delete cascade,
  day date not null,
  created_at timestamptz not null default now(),
  primary key (student_id, day)
);
create index if not exists student_absences_day on public.student_absences (day);

alter table public.student_absences enable row level security;
revoke all on public.student_absences from anon, authenticated;
