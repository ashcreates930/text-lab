-- "How did you hear about Text Lab?": a required answer saved with every feedback entry and waitlist entry.
-- Safe to run more than once.
alter table public.feedback_entries add column if not exists heard_from text check (heard_from in ('fellowship', 'womens-group', 'homeschool', 'mentor-network', 'social-media', 'other'));
alter table public.waitlist add column if not exists heard_from text check (heard_from in ('fellowship', 'womens-group', 'homeschool', 'mentor-network', 'social-media', 'other'));
NOTIFY pgrst, 'reload schema';
