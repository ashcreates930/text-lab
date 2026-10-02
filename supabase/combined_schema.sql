-- Combined Supabase setup for manual execution in the Supabase SQL Editor.
-- Source migrations are included in filename order. RLS is enabled for every created public table.
-- Run this file once against the intended project database.

-- BEGIN 202609300001_initial.sql
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
-- END 202609300001_initial.sql

-- BEGIN 202609300002_preview_enablement.sql
alter table public.sessions
  add column if not exists preview_enabled boolean not null default false;
-- END 202609300002_preview_enablement.sql

-- BEGIN 202610010001_answer_revisions.sql
create table if not exists public.answer_revisions (
  id uuid primary key default gen_random_uuid(),
  sandbox_id uuid references public.demo_sandboxes(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  world_id text not null,
  artifact_id text not null,
  stage text not null check (stage in ('notice','interpret','craft')),
  answer_text text not null,
  technique text,
  created_at timestamptz not null default now(),
  check ((sandbox_id is not null)::int + (student_id is not null)::int = 1)
);
create index if not exists answer_revisions_sandbox_created_idx on public.answer_revisions(sandbox_id,created_at);
create index if not exists answer_revisions_student_created_idx on public.answer_revisions(student_id,created_at);
alter table public.answer_revisions enable row level security;
revoke all on public.answer_revisions from anon,authenticated;
-- END 202610010001_answer_revisions.sql

-- BEGIN 202610020001_demo_limits.sql
-- Daily AI usage counters for the demo: per sandbox, per device (from the signed access cookie), and one global row.
create table if not exists public.demo_ai_usage (
  scope text not null check (scope in ('sandbox','device','global')),
  scope_id text not null,
  day date not null,
  kind text not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (scope, scope_id, day, kind)
);
alter table public.demo_ai_usage enable row level security;
revoke all on public.demo_ai_usage from anon,authenticated;

-- Checks every limit and increments all three counters in one transaction. Returns 'ok', 'sandbox', 'device', or 'global'.
-- Rows are locked in a fixed order (global, device, sandbox) so concurrent calls cannot deadlock.
create or replace function public.consume_demo_ai(p_kind text, p_sandbox text, p_device text, p_sandbox_limit integer, p_device_limit integer, p_global_limit integer)
returns text language plpgsql security definer set search_path = public as $
declare
  d date := (now() at time zone 'utc')::date;
  g integer; v integer; s integer;
begin
  insert into demo_ai_usage(scope, scope_id, day, kind) values
    ('global', 'all', d, 'all'), ('device', p_device, d, p_kind), ('sandbox', p_sandbox, d, p_kind)
  on conflict do nothing;
  select count into g from demo_ai_usage where scope = 'global' and scope_id = 'all' and day = d and kind = 'all' for update;
  select count into v from demo_ai_usage where scope = 'device' and scope_id = p_device and day = d and kind = p_kind for update;
  select count into s from demo_ai_usage where scope = 'sandbox' and scope_id = p_sandbox and day = d and kind = p_kind for update;
  if g >= p_global_limit then return 'global'; end if;
  if v >= p_device_limit then return 'device'; end if;
  if s >= p_sandbox_limit then return 'sandbox'; end if;
  update demo_ai_usage set count = count + 1, updated_at = now()
  where day = d and ((scope = 'global' and scope_id = 'all' and kind = 'all')
    or (scope = 'device' and scope_id = p_device and kind = p_kind)
    or (scope = 'sandbox' and scope_id = p_sandbox and kind = p_kind));
  delete from demo_ai_usage where day < d - 7;
  return 'ok';
end $;
revoke all on function public.consume_demo_ai(text, text, text, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_demo_ai(text, text, text, integer, integer, integer) to service_role;

-- Access-code lockout. ip_hash is a keyed hash; raw IP addresses are never stored.
create table if not exists public.demo_access_lockouts (
  ip_hash text primary key,
  failures integer not null default 0,
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz
);
alter table public.demo_access_lockouts enable row level security;
revoke all on public.demo_access_lockouts from anon,authenticated;

create or replace function public.demo_access_blocked(p_ip_hash text)
returns boolean language sql security definer set search_path = public as $
  select coalesce((select blocked_until > now() from demo_access_lockouts where ip_hash = p_ip_hash), false);
$;
revoke all on function public.demo_access_blocked(text) from public, anon, authenticated;
grant execute on function public.demo_access_blocked(text) to service_role;

-- Records a wrong code. The 10th failure within an hour blocks that IP hash for the next hour.
create or replace function public.record_demo_access_failure(p_ip_hash text)
returns boolean language plpgsql security definer set search_path = public as $
declare f integer;
begin
  insert into demo_access_lockouts as l (ip_hash, failures, window_started_at) values (p_ip_hash, 1, now())
  on conflict (ip_hash) do update set
    failures = case when l.window_started_at < now() - interval '1 hour' then 1 else l.failures + 1 end,
    window_started_at = case when l.window_started_at < now() - interval '1 hour' then now() else l.window_started_at end
  returning failures into f;
  if f >= 10 then
    update demo_access_lockouts set blocked_until = now() + interval '1 hour', failures = 0, window_started_at = now() where ip_hash = p_ip_hash;
  end if;
  delete from demo_access_lockouts where window_started_at < now() - interval '1 day' and (blocked_until is null or blocked_until < now());
  return f >= 10;
end $;
revoke all on function public.record_demo_access_failure(text) from public, anon, authenticated;
grant execute on function public.record_demo_access_failure(text) to service_role;
-- END 202610020001_demo_limits.sql

-- BEGIN 202610020002_demo_limits_eastern_day.sql
-- Daily demo AI caps reset at US Eastern midnight (America/New_York follows daylight saving). Replaces the UTC version.
create or replace function public.consume_demo_ai(p_kind text, p_sandbox text, p_device text, p_sandbox_limit integer, p_device_limit integer, p_global_limit integer)
returns text language plpgsql security definer set search_path = public as $
declare
  d date := (now() at time zone 'America/New_York')::date;
  g integer; v integer; s integer;
begin
  insert into demo_ai_usage(scope, scope_id, day, kind) values
    ('global', 'all', d, 'all'), ('device', p_device, d, p_kind), ('sandbox', p_sandbox, d, p_kind)
  on conflict do nothing;
  select count into g from demo_ai_usage where scope = 'global' and scope_id = 'all' and day = d and kind = 'all' for update;
  select count into v from demo_ai_usage where scope = 'device' and scope_id = p_device and day = d and kind = p_kind for update;
  select count into s from demo_ai_usage where scope = 'sandbox' and scope_id = p_sandbox and day = d and kind = p_kind for update;
  if g >= p_global_limit then return 'global'; end if;
  if v >= p_device_limit then return 'device'; end if;
  if s >= p_sandbox_limit then return 'sandbox'; end if;
  update demo_ai_usage set count = count + 1, updated_at = now()
  where day = d and ((scope = 'global' and scope_id = 'all' and kind = 'all')
    or (scope = 'device' and scope_id = p_device and kind = p_kind)
    or (scope = 'sandbox' and scope_id = p_sandbox and kind = p_kind));
  delete from demo_ai_usage where day < d - 7;
  return 'ok';
end $;
revoke all on function public.consume_demo_ai(text, text, text, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_demo_ai(text, text, text, integer, integer, integer) to service_role;
-- END 202610020002_demo_limits_eastern_day.sql

-- Ensure row level security is enabled on every table created above.
alter table public.teachers enable row level security;
alter table public.sessions enable row level security;
alter table public.students enable row level security;
alter table public.student_events enable row level security;
alter table public.messages enable row level security;
alter table public.safety_flags enable row level security;
alter table public.narratives enable row level security;
alter table public.demo_sandboxes enable row level security;
alter table public.waitlist enable row level security;
alter table public.answer_revisions enable row level security;

-- Browser roles have no direct access; server routes use service role after validating ownership.
revoke all on public.teachers,public.sessions,public.students,public.student_events,public.messages,public.safety_flags,public.narratives,public.demo_sandboxes,public.waitlist,public.answer_revisions from anon,authenticated;
