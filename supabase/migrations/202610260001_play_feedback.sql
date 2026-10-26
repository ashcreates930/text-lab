-- The demo ending's feedback card: "Was it fun?" and where the answer came from. Players' other answers use the
-- existing columns (would_use: "Would you play again?", broken_text: "Was anything confusing?").
alter table public.feedback_entries add column if not exists fun text check (fun in ('yes', 'kind_of', 'no'));
alter table public.feedback_entries add column if not exists context text check (char_length(context) <= 80);
notify pgrst, 'reload schema';
