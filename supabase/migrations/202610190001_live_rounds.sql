-- Live class mode: live rounds played in squads (Spot the Lie, Verdict Vote, Objection!).
-- Run this once in the Supabase SQL editor.
--
-- Every read and write goes through the app's server routes with the service role, which checks the host and player
-- tokens, the squad roles and moderation. Row-level security is on with no policies for anon or authenticated users, so
-- nobody can read or change these tables directly from a browser. Screens learn about changes through a Realtime
-- broadcast ping ("live:<session id>") that carries no data; they then fetch the state from the server.

create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                       -- the short code in the QR join link
  teacher_id uuid references public.teachers(id) on delete cascade,
  class_id uuid references public.sessions(id) on delete cascade,   -- null for a demo room
  demo boolean not null default false,
  world_id text not null,
  status text not null default 'lobby' check (status in ('lobby', 'round', 'reveal', 'ended')),
  paused boolean not null default false,
  round_index integer not null default -1,
  rounds jsonb not null default '[]'::jsonb,       -- one entry per round: its type and setup
  round_started_at timestamptz,
  host_hash text not null,                         -- hash of the host token; the token itself is never stored
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists live_sessions_class_idx on public.live_sessions (class_id, created_at desc);

create table if not exists public.live_squads (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  name text not null,
  position integer not null default 0
);
create index if not exists live_squads_session_idx on public.live_squads (session_id);

create table if not exists public.live_players (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  squad_id uuid references public.live_squads(id) on delete set null,
  nickname text not null,                          -- a generated detective nickname or the class nickname; never a typed real name
  student_id uuid references public.students(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (session_id, nickname)
);
create index if not exists live_players_session_idx on public.live_players (session_id);

-- One row per action: who did what, in which role. Scores, the reveal and the teacher's record are worked out from these.
create table if not exists public.live_round_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  round_index integer not null,
  squad_id uuid references public.live_squads(id) on delete set null,
  player_id uuid references public.live_players(id) on delete set null,
  role text,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  flagged boolean not null default false,          -- hidden from the host screen; shown to the teacher only
  created_at timestamptz not null default now()
);
create index if not exists live_round_responses_session_idx on public.live_round_responses (session_id, round_index, created_at);

alter table public.live_sessions enable row level security;
alter table public.live_squads enable row level security;
alter table public.live_players enable row level security;
alter table public.live_round_responses enable row level security;
revoke all on public.live_sessions, public.live_squads, public.live_players, public.live_round_responses from anon, authenticated;
