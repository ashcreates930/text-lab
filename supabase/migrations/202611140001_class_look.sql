-- The class's look (escape-room phase 3): "mature", the default for grades 6 to 12, or "classic", the original game
-- look. Teachers choose it per class (My classes > the class > Look). Until this runs, every class gets the mature look
-- and the choice is hidden. Run once in the Supabase SQL editor.
alter table public.sessions add column if not exists look text not null default 'mature'
  check (look in ('mature', 'classic'));
notify pgrst, 'reload schema';
