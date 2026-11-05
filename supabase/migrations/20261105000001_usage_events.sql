-- Art Island – dữ liệu sử dụng học liệu (Pha 4: đánh giá và điều chỉnh)
-- Mỗi dòng là một mốc: vào web (visit), mở đảo (island), mở giàn giáo (step),
-- hoàn thành giàn giáo (done), mở một khu khác (view: studio, creative, box).
-- Không ghi trò Ếch qua sông. Chỉ ghi khi mã số học sinh có trong danh sách lớp.

create table public.usage_events (
  id         bigint generated always as identity primary key,
  sid        text not null check (sid ~ '^[A-Z0-9]{1,12}-[0-9]{2}$'),
  class_id   text generated always as (split_part(sid, '-', 1)) stored,
  visit      text not null check (char_length(visit) <= 24),
  ev         text not null check (ev in ('visit','island','step','done','view')),
  island     int  check (island between 0 and 8),
  step       int  check (step between 0 and 3),
  view       text check (char_length(view) <= 16),
  at         timestamptz not null,
  verified   boolean not null default false,   -- true khi học sinh đã đăng nhập bằng mã số + PIN
  created_at timestamptz not null default now()
);
create index on public.usage_events (class_id, at);
create index on public.usage_events (sid, created_at);

alter table public.usage_events enable row level security;
create policy "gv xem dữ liệu sử dụng lớp mình" on public.usage_events for select to authenticated
  using (public.teaches(class_id));
create policy "gv xoá dữ liệu sử dụng lớp mình" on public.usage_events for delete to authenticated
  using (public.teaches(class_id));

-- Trang học sinh gửi một gói mốc qua hàm này (không ghi thẳng vào bảng).
create or replace function public.log_usage(p_sid text, p_visit text, p_events jsonb)
returns int language plpgsql security definer set search_path = '' as $$
declare
  s text := upper(coalesce(p_sid, ''));
  owner uuid;
  n int := 0;
begin
  if s !~ '^[A-Z0-9]{1,12}-[0-9]{2}$' or jsonb_typeof(p_events) <> 'array'
     or jsonb_array_length(p_events) > 60 or coalesce(p_visit, '') = '' then
    return 0;
  end if;
  select user_id into owner from public.students where sid = s;
  if not found then return 0; end if;
  -- chặn gửi dồn bất thường
  if (select count(*) from public.usage_events where sid = s and created_at > now() - interval '1 hour') > 600 then
    return 0;
  end if;
  insert into public.usage_events (sid, visit, ev, island, step, view, at, verified)
  select s, left(p_visit, 24), e->>'e',
         case when e->>'i' ~ '^[0-8]$' then (e->>'i')::int end,
         case when e->>'s' ~ '^[0-3]$' then (e->>'s')::int end,
         left(e->>'v', 16),
         case when e->>'t' ~ '^[0-9]{12,14}$'
              then least(now(), greatest(now() - interval '7 days', to_timestamp((e->>'t')::bigint / 1000.0)))
              else now() end,
         owner is not null and owner = auth.uid()
  from jsonb_array_elements(p_events) e
  where e->>'e' in ('visit','island','step','done','view');
  get diagnostics n = row_count;
  return n;
exception when others then
  return 0;
end $$;

revoke all on function public.log_usage(text, text, jsonb) from public;
grant execute on function public.log_usage(text, text, jsonb) to anon, authenticated;
