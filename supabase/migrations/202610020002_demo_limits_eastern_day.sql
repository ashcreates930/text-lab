-- Daily demo AI caps reset at US Eastern midnight (America/New_York follows daylight saving). Replaces the UTC version.
create or replace function public.consume_demo_ai(p_kind text, p_sandbox text, p_device text, p_sandbox_limit integer, p_device_limit integer, p_global_limit integer)
returns text language plpgsql security definer set search_path = public as $$
declare
  d date := (now() at time zone 'America/New_York')::date;
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
