-- The world map (world-map phase 1). map_progress: one row per class student and story, with the secrets the student
-- has found on return visits to the map ("expedition:chunk" keys). Stop states, stars and the token's place come from
-- expedition_results, so nothing else is stored here.
create table if not exists public.map_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  world_id text not null check (char_length(world_id) <= 80),
  secrets jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (student_id, world_id)
);

-- Server routes only (service role), like the other classroom tables.
alter table public.map_progress enable row level security;
revoke all on public.map_progress from anon, authenticated;
notify pgrst, 'reload schema';
