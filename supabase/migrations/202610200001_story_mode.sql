-- Story Mode: a scene played as four timed, scored rounds. The server scores every round; these tables hold each
-- player's run (for the leaderboards) and each scored round (for the class pulse and the teacher's Evidence view).
-- Server-only (service role), like the other classroom tables.

-- One run per player per scene (and per day for demo visitors). best_total is what the leaderboard ranks.
create table if not exists public.story_runs (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('class', 'demo')),
  class_id uuid references public.sessions(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  player_key text not null,                         -- the student id, or the demo visitor's sandbox id
  nickname text not null,                           -- the class nickname, or a generated detective nickname (demo)
  world_id text not null,
  scene_id text not null,
  day date not null default (now() at time zone 'utc')::date,
  state jsonb not null,                             -- the run: round, total, streak, coins, pouch, trust, power-ups
  total integer not null default 0,
  best_total integer not null default 0,
  best_streak integer not null default 0,
  finished boolean not null default false,
  time_setting text not null default '1' check (time_setting in ('1', '1.5', '2', 'untimed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((scope = 'class' and class_id is not null and student_id is not null) or (scope = 'demo' and class_id is null and student_id is null))
);
create unique index if not exists story_runs_class_player on public.story_runs (class_id, student_id, world_id, scene_id) where scope = 'class';
create unique index if not exists story_runs_demo_player on public.story_runs (player_key, world_id, scene_id, day) where scope = 'demo';
create index if not exists story_runs_board on public.story_runs (scope, class_id, world_id, scene_id, day, best_total desc);

-- Every scored round: what the student chose, the proof (lines from the story), and the points.
create table if not exists public.story_round_scores (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.story_runs(id) on delete cascade,
  round integer not null check (round between 1 and 4),
  kind text not null check (kind in ('read', 'confront', 'lie', 'call')),
  choice text not null default '',
  proof jsonb not null default '[]'::jsonb,
  explanation text not null default '',             -- round 3's sentence; shown to the teacher only
  valid boolean not null,
  base integer not null,
  speed integer not null,
  multiplier numeric(3, 1) not null,
  doubled boolean not null default false,
  grace boolean not null default false,
  points integer not null,
  elapsed_ms integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists story_round_scores_run on public.story_round_scores (run_id, round);

-- Teacher settings: the class leaderboard (individual, squads or off) and whether scenes with Story Mode use it
-- (otherwise students see the Case file clue board). Extra time per student: 1.5x, 2x or untimed.
alter table public.sessions add column if not exists leaderboard_mode text not null default 'individual' check (leaderboard_mode in ('individual', 'squad', 'off'));
alter table public.sessions add column if not exists story_mode_on boolean not null default true;
alter table public.students add column if not exists time_setting text not null default '1' check (time_setting in ('1', '1.5', '2', 'untimed'));

alter table public.story_runs enable row level security;
alter table public.story_round_scores enable row level security;
revoke all on public.story_runs, public.story_round_scores from anon, authenticated;
