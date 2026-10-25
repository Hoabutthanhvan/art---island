-- Art Island – lược đồ dữ liệu trên Supabase
-- Bảng: giáo viên, lớp, học sinh, bài nộp, phiếu đánh giá, thông báo, triển lãm, lượt thích,
-- và teacher_docs (sổ làm việc riêng của giáo viên: hồ sơ bài, tiêu chí, nhận xét học kì…).

create extension if not exists pgcrypto;

-- ---------- Bảng ----------
create table public.teachers (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text not null default 'Giáo viên',
  created_at timestamptz not null default now()
);

create table public.classes (
  id         text primary key check (id ~ '^[A-Z0-9]{1,12}$'),
  teacher_id uuid not null default auth.uid() references public.teachers(user_id) on delete cascade,
  year       text,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.students (
  sid        text primary key check (sid ~ '^[A-Z0-9]{1,12}-[0-9]{2}$'),
  class_id   text not null references public.classes(id) on delete cascade,
  stt        int,
  name       text not null check (char_length(name) <= 60),
  user_id    uuid unique references auth.users(id) on delete set null,
  pin        text,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on public.students (class_id);

-- Bài nộp: không ràng buộc khoá ngoại với students để giữ dữ liệu nghiên cứu khi xoá em khỏi lớp
create table public.submissions (
  id            uuid primary key default gen_random_uuid(),
  sid           text not null,
  user_id       uuid not null default auth.uid(),
  class_id      text not null,
  topic         int  not null check (topic between 0 and 8),
  title         text check (char_length(title) <= 120),
  story         text check (char_length(story) <= 800),
  image_path    text not null,
  video_path    text,
  meta          jsonb not null default '{}'::jsonb,
  show_in_gallery boolean not null default false,
  created_at    timestamptz not null default now(),
  processed_at  timestamptz
);
create index on public.submissions (class_id, processed_at);
create index on public.submissions (sid);

create table public.feedback (
  id         uuid primary key default gen_random_uuid(),
  sid        text not null,
  class_id   text not null,
  topic      int  not null check (topic between 1 and 8),
  title      text,
  levels     jsonb,
  overall    text check (overall in ('T','H','C')),
  comment    text check (char_length(comment) <= 1000),
  criteria   jsonb,
  thumb      text check (char_length(thumb) <= 200000),
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);
create index on public.feedback (sid);

create table public.announcements (
  id         uuid primary key default gen_random_uuid(),
  class_id   text not null,               -- mã lớp, hoặc 'ALL' = mọi lớp của giáo viên
  title      text not null check (char_length(title) <= 120),
  body       text check (char_length(body) <= 2000),
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);
create index on public.announcements (class_id);

create table public.gallery (
  id         text primary key,             -- LỚP_CHỦĐỀ_MÃSỐ
  class_id   text not null,
  sid        text,
  topic      int,
  title      text check (char_length(title) <= 120),
  by_name    text check (char_length(by_name) <= 80),
  story      text check (char_length(story) <= 600),
  kind       text not null default 'nha' check (kind in ('nha','lop')),
  image_path text,
  thumb_path text,
  is_on      boolean not null default true,
  created_by uuid default auth.uid(),
  updated_at timestamptz not null default now()
);
create index on public.gallery (class_id, is_on);

create table public.gallery_likes (
  gallery_id text not null references public.gallery(id) on delete cascade,
  user_id    uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (gallery_id, user_id)
);

create table public.teacher_docs (
  teacher_id uuid not null default auth.uid() references public.teachers(user_id) on delete cascade,
  col        text not null,
  id         text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (teacher_id, col, id)
);

-- ---------- Hàm trợ giúp cho RLS (security definer để tránh đệ quy chính sách) ----------
create or replace function public.is_teacher() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.teachers where user_id = auth.uid());
$$;

create or replace function public.my_sid() returns text
language sql stable security definer set search_path = '' as $$
  select sid from public.students where user_id = auth.uid();
$$;

create or replace function public.my_class() returns text
language sql stable security definer set search_path = '' as $$
  select class_id from public.students where user_id = auth.uid();
$$;

create or replace function public.teaches(cls text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.classes where id = cls and teacher_id = auth.uid());
$$;

create or replace function public.teaches_sid(s text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.classes c
                 where c.teacher_id = auth.uid() and c.id = split_part(s, '-', 1));
$$;

create or replace function public.my_teacher() returns uuid
language sql stable security definer set search_path = '' as $$
  select c.teacher_id from public.students s join public.classes c on c.id = s.class_id
  where s.user_id = auth.uid();
$$;

revoke all on function public.is_teacher(), public.my_sid(), public.my_class(), public.teaches(text), public.teaches_sid(text), public.my_teacher() from public, anon;
grant execute on function public.is_teacher(), public.my_sid(), public.my_class(), public.teaches(text), public.teaches_sid(text), public.my_teacher() to authenticated;

-- ---------- Bật RLS ----------
alter table public.teachers      enable row level security;
alter table public.classes       enable row level security;
alter table public.students      enable row level security;
alter table public.submissions   enable row level security;
alter table public.feedback      enable row level security;
alter table public.announcements enable row level security;
alter table public.gallery       enable row level security;
alter table public.gallery_likes enable row level security;
alter table public.teacher_docs  enable row level security;

-- Chỉ người đã đăng nhập mới chạm được dữ liệu; khách (anon) không có quyền gì
revoke all on all tables in schema public from anon;

-- teachers
create policy "gv xem hồ sơ của mình" on public.teachers for select to authenticated
  using (user_id = (select auth.uid()));
create policy "gv sửa tên của mình" on public.teachers for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- classes
create policy "gv quản lí lớp của mình" on public.classes for all to authenticated
  using (teacher_id = (select auth.uid()))
  with check (teacher_id = (select auth.uid()) and (select public.is_teacher()));

-- students
create policy "gv quản lí học sinh lớp mình" on public.students for all to authenticated
  using ((select public.teaches(class_id))) with check ((select public.teaches(class_id)));
create policy "hs xem hồ sơ của mình" on public.students for select to authenticated
  using (user_id = (select auth.uid()));

-- submissions
create policy "hs nộp bài của mình" on public.submissions for insert to authenticated
  with check (user_id = (select auth.uid()) and sid = (select public.my_sid()) and class_id = (select public.my_class()) and processed_at is null);
create policy "hs xem bài của mình" on public.submissions for select to authenticated
  using (user_id = (select auth.uid()));
create policy "gv xem bài lớp mình" on public.submissions for select to authenticated
  using ((select public.teaches(class_id)));
create policy "gv cập nhật bài lớp mình" on public.submissions for update to authenticated
  using ((select public.teaches(class_id))) with check ((select public.teaches(class_id)));
create policy "gv xoá bài lớp mình" on public.submissions for delete to authenticated
  using ((select public.teaches(class_id)));

-- feedback (phiếu đánh giá)
create policy "gv quản lí phiếu lớp mình" on public.feedback for all to authenticated
  using ((select public.teaches(class_id))) with check ((select public.teaches(class_id)) and created_by = (select auth.uid()));
create policy "hs xem phiếu của mình" on public.feedback for select to authenticated
  using (sid = (select public.my_sid()));

-- announcements
create policy "gv quản lí thông báo của mình" on public.announcements for all to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()) and (select public.is_teacher()) and (class_id = 'ALL' or (select public.teaches(class_id))));
create policy "hs xem thông báo lớp mình" on public.announcements for select to authenticated
  using (created_by = (select public.my_teacher()) and (class_id = (select public.my_class()) or class_id = 'ALL'));

-- gallery (triển lãm)
create policy "gv quản lí triển lãm lớp mình" on public.gallery for all to authenticated
  using ((select public.teaches(class_id))) with check ((select public.teaches(class_id)));
create policy "hs xem triển lãm lớp mình" on public.gallery for select to authenticated
  using (class_id = (select public.my_class()) and (is_on or sid = (select public.my_sid())));
create policy "hs trưng bày bài của mình" on public.gallery for insert to authenticated
  with check (sid = (select public.my_sid()) and class_id = (select public.my_class()) and kind = 'nha');
create policy "hs cập nhật bài trưng bày của mình" on public.gallery for update to authenticated
  using (sid = (select public.my_sid())) with check (sid = (select public.my_sid()) and class_id = (select public.my_class()) and kind = 'nha');

-- gallery_likes
create policy "hs thả tim" on public.gallery_likes for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.gallery g where g.id = gallery_id and g.class_id = (select public.my_class())));
create policy "hs xem tim của mình" on public.gallery_likes for select to authenticated
  using (user_id = (select auth.uid()));
create policy "hs bỏ tim" on public.gallery_likes for delete to authenticated
  using (user_id = (select auth.uid()));
create policy "gv xem tim lớp mình" on public.gallery_likes for select to authenticated
  using (exists (select 1 from public.gallery g where g.id = gallery_id and (select public.teaches(g.class_id))));

-- teacher_docs
create policy "gv dùng sổ của mình" on public.teacher_docs for all to authenticated
  using (teacher_id = (select auth.uid())) with check (teacher_id = (select auth.uid()) and (select public.is_teacher()));

-- ---------- Storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('art',     'art',     false, 52428800, array['image/jpeg','image/png','image/webp','video/mp4','video/quicktime','video/webm','video/3gpp']),
  ('gallery', 'gallery', false, 5242880,  array['image/jpeg','image/png','image/webp']),
  ('teacher', 'teacher', false, 52428800, null)
on conflict (id) do nothing;

-- art: <mã số>/<tệp> — học sinh tải lên và xem thư mục của mình; giáo viên xem/xoá bài lớp mình
create policy "art: hs tải lên thư mục của mình" on storage.objects for insert to authenticated
  with check (bucket_id = 'art' and (storage.foldername(name))[1] = (select public.my_sid()));
create policy "art: hs xem thư mục của mình" on storage.objects for select to authenticated
  using (bucket_id = 'art' and (storage.foldername(name))[1] = (select public.my_sid()));
create policy "art: gv xem bài lớp mình" on storage.objects for select to authenticated
  using (bucket_id = 'art' and (select public.teaches_sid((storage.foldername(name))[1])));
create policy "art: gv xoá bài lớp mình" on storage.objects for delete to authenticated
  using (bucket_id = 'art' and (select public.teaches_sid((storage.foldername(name))[1])));

-- gallery: <lớp>/<mã số>_<…>.jpg — học sinh tải ảnh trưng bày của mình, cả lớp xem; giáo viên quản lí
create policy "gallery: hs tải ảnh của mình" on storage.objects for insert to authenticated
  with check (bucket_id = 'gallery' and (storage.foldername(name))[1] = (select public.my_class())
              and storage.filename(name) like (select public.my_sid()) || '\_%');
create policy "gallery: lớp xem ảnh trưng bày" on storage.objects for select to authenticated
  using (bucket_id = 'gallery' and (storage.foldername(name))[1] = (select public.my_class()));
create policy "gallery: gv quản lí lớp mình" on storage.objects for all to authenticated
  using (bucket_id = 'gallery' and (select public.teaches((storage.foldername(name))[1])))
  with check (bucket_id = 'gallery' and (select public.teaches((storage.foldername(name))[1])));

-- teacher: <user id>/<tệp> — kho ảnh riêng của từng giáo viên
create policy "teacher: gv dùng kho của mình" on storage.objects for all to authenticated
  using (bucket_id = 'teacher' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.is_teacher()))
  with check (bucket_id = 'teacher' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.is_teacher()));

-- ---------- Realtime cho bảng giáo viên ----------
alter publication supabase_realtime add table public.teacher_docs, public.classes, public.students, public.submissions;
