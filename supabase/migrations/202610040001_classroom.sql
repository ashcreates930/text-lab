-- Classroom features: teacher-created classes, assigned mini lessons, and live whole-class analysis.
-- Like the rest of the schema, browsers get no direct table access; Next.js server routes use the service role
-- after checking a teacher's Supabase session or a student's signed class token.

alter table public.sessions add column if not exists name text;

create table if not exists public.lesson_assignments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  lesson_id text not null,
  due_date date,
  created_at timestamptz not null default now(),
  unique (session_id, lesson_id)
);

create table if not exists public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  lesson_id text not null,
  first_try_correct smallint not null default 0,
  total smallint not null default 0,
  finished_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

create table if not exists public.live_analyses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  plan jsonb not null,
  step smallint not null default 0,
  phase text not null default 'answer' check (phase in ('answer','reveal','chat','takeaway')),
  chat_started_at timestamptz,
  status text not null default 'active' check (status in ('active','ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists live_analyses_session_idx on public.live_analyses(session_id, status);

create table if not exists public.live_responses (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.live_analyses(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  step smallint not null,
  kind text not null check (kind in ('answer','takeaway')),
  response_text text not null check (char_length(response_text) between 1 and 1200),
  created_at timestamptz not null default now(),
  unique (analysis_id, student_id, step, kind)
);

alter table public.lesson_assignments enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.live_analyses enable row level security;
alter table public.live_responses enable row level security;
revoke all on public.lesson_assignments, public.lesson_completions, public.live_analyses, public.live_responses from anon, authenticated;
