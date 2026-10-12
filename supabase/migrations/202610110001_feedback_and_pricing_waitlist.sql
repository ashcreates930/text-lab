-- Feedback and the pricing-focused waitlist (one in-app form). Run once in the Supabase SQL Editor.
-- The waitlist table was empty when this was written; existing rows, if any, are kept.

-- 1. Waitlist: one entry per email per plan, plus the pricing questions.
alter table public.waitlist drop constraint if exists waitlist_email_normalized_key;
alter table public.waitlist alter column organization drop not null;
alter table public.waitlist drop constraint if exists waitlist_role_check;
alter table public.waitlist add constraint waitlist_role_check check (role in (
  'teacher','instructional coach','school administrator','district leader','parent or homeschool educator','microschool leader','other',
  'administrator','homeschool parent','EdTech')); -- the last three are earlier role names, kept so older rows stay valid
alter table public.waitlist alter column role drop not null;
alter table public.waitlist
  add column if not exists plan text check (plan in ('explorer','individual','family','school','district','pilot','pd')),
  add column if not exists intent text check (intent in ('buy_now','likely','lower_price','exploring')),
  add column if not exists price_named numeric(12,2) check (price_named >= 0),
  add column if not exists price_period text check (price_period in ('month','year')),
  add column if not exists start_when text check (start_when in ('this_month','this_semester','next_school_year','not_sure')),
  add column if not exists payer text check (payer in ('myself','school','district','grant','not_sure')),
  add column if not exists approver text check (approver in ('yes','helps_decide','no')),
  add column if not exists loi text check (loi in ('yes','maybe','no')),
  add column if not exists pilot_commit text check (pilot_commit in ('yes','maybe','no')),
  add column if not exists students integer check (students between 1 and 1000000),
  add column if not exists lock_founding_price boolean not null default false,
  add column if not exists wants_updates boolean not null default false,
  add column if not exists state text check (char_length(state) <= 60),
  add column if not exists source text check (source ~ '^[a-z0-9-]{1,40}$');
create unique index if not exists waitlist_email_plan_key on public.waitlist (email_normalized, coalesce(plan, ''));

-- 2. Feedback. Linked to a waitlist entry when both were sent together; no email is needed for feedback alone.
create table if not exists public.feedback_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  side_tried text check (side_tried in ('student','teacher','both','not_yet')),
  ease smallint check (ease between 1 and 5),
  one_screen text check (one_screen in ('yes','mostly','no')),
  would_use text check (would_use in ('yes','maybe','no')),
  change_text text check (char_length(change_text) <= 1000),
  broken_text text check (char_length(broken_text) <= 1000),
  device text check (device in ('ipad','iphone','chromebook','windows','mac','android','other')),
  source text check (source ~ '^[a-z0-9-]{1,40}$'),
  waitlist_id uuid references public.waitlist(id) on delete set null
);
create index if not exists feedback_entries_created_idx on public.feedback_entries (created_at desc);

-- 3. Form rate limit: 8 submissions per 10 minutes per keyed IP hash (no raw IP is stored). Rows are purged after a day.
create table if not exists public.form_rate_limits (
  ip_hash text primary key,
  window_started_at timestamptz not null default now(),
  count integer not null default 0
);
create or replace function public.consume_form_submission(p_ip_hash text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare c integer;
begin
  insert into form_rate_limits as r (ip_hash, window_started_at, count) values (p_ip_hash, now(), 1)
  on conflict (ip_hash) do update set
    count = case when r.window_started_at < now() - make_interval(secs => p_window_seconds) then 1 else r.count + 1 end,
    window_started_at = case when r.window_started_at < now() - make_interval(secs => p_window_seconds) then now() else r.window_started_at end
  returning count into c;
  delete from form_rate_limits where window_started_at < now() - interval '1 day';
  return c <= p_limit;
end $$;

-- Browser roles never touch these tables; server routes use the service role.
alter table public.feedback_entries enable row level security;
alter table public.form_rate_limits enable row level security;
revoke all on public.waitlist, public.feedback_entries, public.form_rate_limits from anon, authenticated;
revoke all on function public.consume_form_submission(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_form_submission(text, integer, integer) to service_role;
