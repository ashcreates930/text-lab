-- Students in the story: a teacher can turn student roles and "What's your angle?" on or off for a class.
-- Both are on by default. The angle itself is saved only in students.progress (three choices, no free text).
alter table public.sessions add column if not exists roles_enabled boolean not null default true;
alter table public.sessions add column if not exists angles_enabled boolean not null default true;
