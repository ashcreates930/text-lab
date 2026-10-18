-- Plant a Lie: class students write one false sentence in a character's voice and tap the line that disproves it.
-- Every lie is screened, then held for the teacher; approved lies form the class's Lie bank for live rounds.
-- Server-only (service role), like the other classroom tables.
create table if not exists public.planted_lies (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  world_id text not null,
  scene_id text not null,
  clue_id text not null,
  character_id text not null,
  sentence text not null check (char_length(sentence) <= 220),
  truth_paragraph text not null,
  truth_line text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'flagged')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists planted_lies_class_idx on public.planted_lies (class_id, status, created_at desc);
create index if not exists planted_lies_student_idx on public.planted_lies (student_id, created_at desc);

alter table public.planted_lies enable row level security;
revoke all on public.planted_lies from anon, authenticated;
