-- Chuyển các hàm trợ giúp RLS sang schema riêng (không lộ qua API /rest/v1/rpc)
create schema if not exists private;
grant usage on schema private to authenticated;
alter function public.is_teacher() set schema private;
alter function public.my_sid() set schema private;
alter function public.my_class() set schema private;
alter function public.teaches(text) set schema private;
alter function public.teaches_sid(text) set schema private;
alter function public.my_teacher() set schema private;

create index if not exists classes_teacher_id_idx on public.classes (teacher_id);
