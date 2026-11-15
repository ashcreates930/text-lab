-- Escape rooms, phase 5: the class's room clock. Off by default; a teacher can turn it on as generous or extra time.
-- It pauses while students read and never ends a room (lib/room-clock.ts). Run in Supabase; the app hides the setting
-- until this column exists.
alter table public.sessions add column if not exists room_clock text not null default 'off'
  check (room_clock in ('off', 'generous', 'extra'));
notify pgrst, 'reload schema';
