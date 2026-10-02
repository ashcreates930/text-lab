create extension if not exists pgcrypto;
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(), auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  display_name text, created_at timestamptz not null default now()
);
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(), teacher_id uuid not null references public.teachers(id) on delete cascade,
  class_code text unique not null, world_id text not null, grade smallint not null check (grade between 6 and 12),
  status text not null default 'active' check (status in ('active','paused','complete')), created_at timestamptz not null default now()
);
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(), session_id uuid not null references public.sessions(id) on delete cascade,
  nickname text not null, resume_phrase_hash text not null, think_profile text check (think_profile in ('guided','balanced','independent')),
  settings jsonb not null default '{}'::jsonb, role_id text, scene_id text, progress jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), unique(session_id,nickname)
);
create table if not exists public.student_events (
  id bigint generated always as identity primary key, student_id uuid not null references public.students(id) on delete cascade,
  event_type text not null, scene_id text, payload jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.students(id) on delete cascade,
  character_id text not null, scene_id text, student_text text not null, character_text text not null,
  safety_flag text, created_at timestamptz not null default now()
);
create table if not exists public.safety_flags (
  id uuid primary key default gen_random_uuid(), session_id uuid not null references public.sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade, message_id uuid references public.messages(id) on delete set null,
  category text not null, review_status text not null default 'unreviewed' check (review_status in ('unreviewed','reviewed','follow_up')),
  created_at timestamptz not null default now()
);
create table if not exists public.narratives (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.students(id) on delete cascade,
  role_id text not null, draft text not null default '', submitted_at timestamptz, rubric_scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.demo_sandboxes (
  id uuid primary key default gen_random_uuid(), preset text not null check (preset in ('student_first_visit','teacher_mid_unit','teacher_end_unit')),
  data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '24 hours'
);
create index if not exists demo_sandboxes_expires_idx on public.demo_sandboxes(expires_at);
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null, email_normalized text generated always as (lower(trim(email))) stored unique,
  role text not null check (role in ('teacher','instructional coach','administrator','district leader','EdTech','other')),
  organization text not null, created_at timestamptz not null default now()
);
alter table public.teachers enable row level security;
alter table public.sessions enable row level security;
alter table public.students enable row level security;
alter table public.student_events enable row level security;
alter table public.messages enable row level security;
alter table public.safety_flags enable row level security;
alter table public.narratives enable row level security;
alter table public.demo_sandboxes enable row level security;
alter table public.waitlist enable row level security;
-- No browser role has direct table access. Next.js server routes use service role only after validating the teacher or owner session.
revoke all on public.teachers,public.sessions,public.students,public.student_events,public.messages,public.safety_flags,public.narratives,public.demo_sandboxes,public.waitlist from anon,authenticated;
