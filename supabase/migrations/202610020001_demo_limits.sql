-- Daily AI usage counters for the demo: per sandbox, per device (from the signed access cookie), and one global row.
create table if not exists public.demo_ai_usage (
  scope text not null check (scope in ('sandbox','device','global')),
  scope_id text not null,
  day date not null,
  kind text not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (scope, scope_id, day, kind)
);
alter table public.demo_ai_usage enable row level security;
revoke all on public.demo_ai_usage from anon,authenticated;

-- Checks every limit and increments all three counters in one transaction. Returns 'ok', 'sandbox', 'device', or 'global'.
-- Rows are locked in a fixed order (global, device, sandbox) so concurrent calls cannot deadlock.
create or replace function public.consume_demo_ai(p_kind text, p_sandbox text, p_device text, p_sandbox_limit integer, p_device_limit integer, p_global_limit integer)
returns text language plpgsql security definer set search_path = public as $$
declare
  d date := (now() at time zone 'utc')::date;
  g integer; v integer; s integer;
begin
  insert into demo_ai_usage(scope, scope_id, day, kind) values
    ('global', 'all', d, 'all'), ('device', p_device, d, p_kind), ('sandbox', p_sandbox, d, p_kind)
  on conflict do nothing;
  select count into g from demo_ai_usage where scope = 'global' and scope_id = 'all' and day = d and kind = 'all' for update;
  select count into v from demo_ai_usage where scope = 'device' and scope_id = p_device and day = d and kind = p_kind for update;
  select count into s from demo_ai_usage where scope = 'sandbox' and scope_id = p_sandbox and day = d and kind = p_kind for update;
  if g >= p_global_limit then return 'global'; end if;
  if v >= p_device_limit then return 'device'; end if;
  if s >= p_sandbox_limit then return 'sandbox'; end if;
  update demo_ai_usage set count = count + 1, updated_at = now()
  where day = d and ((scope = 'global' and scope_id = 'all' and kind = 'all')
    or (scope = 'device' and scope_id = p_device and kind = p_kind)
    or (scope = 'sandbox' and scope_id = p_sandbox and kind = p_kind));
  delete from demo_ai_usage where day < d - 7;
  return 'ok';
end $$;
revoke all on function public.consume_demo_ai(text, text, text, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_demo_ai(text, text, text, integer, integer, integer) to service_role;

-- Access-code lockout. ip_hash is a keyed hash; raw IP addresses are never stored.
create table if not exists public.demo_access_lockouts (
  ip_hash text primary key,
  failures integer not null default 0,
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz
);
alter table public.demo_access_lockouts enable row level security;
revoke all on public.demo_access_lockouts from anon,authenticated;

create or replace function public.demo_access_blocked(p_ip_hash text)
returns boolean language sql security definer set search_path = public as $$
  select coalesce((select blocked_until > now() from demo_access_lockouts where ip_hash = p_ip_hash), false);
$$;
revoke all on function public.demo_access_blocked(text) from public, anon, authenticated;
grant execute on function public.demo_access_blocked(text) to service_role;

-- Records a wrong code. The 10th failure within an hour blocks that IP hash for the next hour.
create or replace function public.record_demo_access_failure(p_ip_hash text)
returns boolean language plpgsql security definer set search_path = public as $$
declare f integer;
begin
  insert into demo_access_lockouts as l (ip_hash, failures, window_started_at) values (p_ip_hash, 1, now())
  on conflict (ip_hash) do update set
    failures = case when l.window_started_at < now() - interval '1 hour' then 1 else l.failures + 1 end,
    window_started_at = case when l.window_started_at < now() - interval '1 hour' then now() else l.window_started_at end
  returning failures into f;
  if f >= 10 then
    update demo_access_lockouts set blocked_until = now() + interval '1 hour', failures = 0, window_started_at = now() where ip_hash = p_ip_hash;
  end if;
  delete from demo_access_lockouts where window_started_at < now() - interval '1 day' and (blocked_until is null or blocked_until < now());
  return f >= 10;
end $$;
revoke all on function public.record_demo_access_failure(text) from public, anon, authenticated;
grant execute on function public.record_demo_access_failure(text) to service_role;
