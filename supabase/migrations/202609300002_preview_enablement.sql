alter table public.sessions
  add column if not exists preview_enabled boolean not null default false;
