-- Proof Race expeditions for class students (expedition phase 4).
-- expedition_results: one row per attempt at an expedition, saved when the race ends and again when the student closes
-- Case Notes. "record" holds the Case Notes entries (per chunk: question type, standards, first-try result, Gist,
-- unknown words, Refresher fix, the student's own note), the Interview and Name the Liar, the score and the badge.
-- expedition_assignments: an expedition a teacher assigned to a class, with an optional due date.
create table if not exists public.expedition_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  world_id text not null check (char_length(world_id) <= 80),
  expedition_id text not null check (char_length(expedition_id) <= 80),
  attempt_id text not null check (char_length(attempt_id) <= 80),
  complete boolean not null default false,
  score integer not null default 0,
  first_try smallint not null default 0,
  total smallint not null default 0,
  solved_case boolean,
  record jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (student_id, expedition_id, attempt_id)
);
create index if not exists expedition_results_student on public.expedition_results (student_id);

create table if not exists public.expedition_assignments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  expedition_id text not null check (char_length(expedition_id) <= 80),
  due_date date,
  created_at timestamptz not null default now(),
  unique (session_id, expedition_id)
);

-- Server routes only (service role), like the other classroom tables.
alter table public.expedition_results enable row level security;
alter table public.expedition_assignments enable row level security;
revoke all on public.expedition_results, public.expedition_assignments from anon, authenticated;
notify pgrst, 'reload schema';
