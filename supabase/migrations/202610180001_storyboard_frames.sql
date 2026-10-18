-- Storyboard frames: the image ceiling for student pictures, and the storage bucket for them.
-- Run this once in the Supabase SQL editor. Until it runs, "Create my picture" quietly falls back to
-- "Save without a picture"; nothing else depends on it.

-- Same as consume_demo_ai, plus a daily ceiling for one kind across the whole demo (used for frame pictures, inside
-- the global ceiling for all AI calls). For frame pictures the app passes the frame as the "sandbox" scope, so the
-- sandbox limit is the number of attempts per frame.
create or replace function public.consume_demo_ai_capped(p_kind text, p_sandbox text, p_device text, p_sandbox_limit integer, p_device_limit integer, p_global_limit integer, p_kind_global_limit integer)
returns text language plpgsql security definer set search_path = public as $$
declare
  d date := (now() at time zone 'America/New_York')::date;
  g integer; k integer; v integer; s integer;
begin
  insert into demo_ai_usage(scope, scope_id, day, kind) values
    ('global', 'all', d, 'all'), ('global', 'all', d, p_kind), ('device', p_device, d, p_kind), ('sandbox', p_sandbox, d, p_kind)
  on conflict do nothing;
  select count into g from demo_ai_usage where scope = 'global' and scope_id = 'all' and day = d and kind = 'all' for update;
  select count into k from demo_ai_usage where scope = 'global' and scope_id = 'all' and day = d and kind = p_kind for update;
  select count into v from demo_ai_usage where scope = 'device' and scope_id = p_device and day = d and kind = p_kind for update;
  select count into s from demo_ai_usage where scope = 'sandbox' and scope_id = p_sandbox and day = d and kind = p_kind for update;
  if g >= p_global_limit or k >= p_kind_global_limit then return 'global'; end if;
  if v >= p_device_limit then return 'device'; end if;
  if s >= p_sandbox_limit then return 'sandbox'; end if;
  update demo_ai_usage set count = count + 1, updated_at = now()
  where day = d and ((scope = 'global' and scope_id = 'all' and kind in ('all', p_kind))
    or (scope = 'device' and scope_id = p_device and kind = p_kind)
    or (scope = 'sandbox' and scope_id = p_sandbox and kind = p_kind));
  delete from demo_ai_usage where day < d - 7;
  return 'ok';
end $$;
revoke all on function public.consume_demo_ai_capped(text, text, text, integer, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_demo_ai_capped(text, text, text, integer, integer, integer, integer) to service_role;

-- Student frame pictures: one folder per student or demo sandbox (random ids), written only by the server with the
-- service role. Public read so the saved image URL works in the student's case board and the teacher's Evidence view.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('frames', 'frames', true, 2097152, array['image/webp', 'image/png', 'image/jpeg'])
on conflict (id) do nothing;
