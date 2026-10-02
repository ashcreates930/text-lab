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
