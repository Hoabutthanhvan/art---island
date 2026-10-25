-- Kiểm tra Row Level Security bằng dữ liệu tạm (không lưu lại: cả khối chạy trong một giao dịch
-- và không có COMMIT). Chạy trong Supabase › SQL Editor; kết quả mong đợi ghi ở cột v.
begin;
insert into auth.users (id, email, aud, role) values
 ('00000000-0000-0000-0000-0000000000a1','t1@test.local','authenticated','authenticated'),
 ('00000000-0000-0000-0000-0000000000a2','t2@test.local','authenticated','authenticated'),
 ('00000000-0000-0000-0000-0000000000b1','5zz1-01@hs.artisland.local','authenticated','authenticated'),
 ('00000000-0000-0000-0000-0000000000b2','5zz1-02@hs.artisland.local','authenticated','authenticated'),
 ('00000000-0000-0000-0000-0000000000b3','5zz2-01@hs.artisland.local','authenticated','authenticated');
insert into public.teachers values ('00000000-0000-0000-0000-0000000000a1','GV A',now()),('00000000-0000-0000-0000-0000000000a2','GV B',now());
insert into public.classes (id,teacher_id) values ('5ZZ1','00000000-0000-0000-0000-0000000000a1'),('5ZZ2','00000000-0000-0000-0000-0000000000a2');
insert into public.students (sid,class_id,stt,name,user_id,pin) values
 ('5ZZ1-01','5ZZ1',1,'An','00000000-0000-0000-0000-0000000000b1','111111'),
 ('5ZZ1-02','5ZZ1',2,'Bình','00000000-0000-0000-0000-0000000000b2','222222'),
 ('5ZZ2-01','5ZZ2',1,'Chi','00000000-0000-0000-0000-0000000000b3','333333');
insert into public.feedback (sid,class_id,topic,overall,created_by) values ('5ZZ1-01','5ZZ1',1,'T','00000000-0000-0000-0000-0000000000a1'),('5ZZ1-02','5ZZ1',1,'H','00000000-0000-0000-0000-0000000000a1');
insert into public.announcements (class_id,title,created_by) values ('5ZZ1','TB lớp 1','00000000-0000-0000-0000-0000000000a1'),('ALL','TB chung GV A','00000000-0000-0000-0000-0000000000a1'),('ALL','TB chung GV B','00000000-0000-0000-0000-0000000000a2');
insert into public.gallery (id,class_id,sid,is_on,created_by) values ('5ZZ1_1_5ZZ1-02','5ZZ1','5ZZ1-02',true,'00000000-0000-0000-0000-0000000000a1'),('5ZZ1_2_5ZZ1-02','5ZZ1','5ZZ1-02',false,'00000000-0000-0000-0000-0000000000a1'),('5ZZ2_1_5ZZ2-01','5ZZ2','5ZZ2-01',true,'00000000-0000-0000-0000-0000000000a2');
create temp table r(n serial, k text, v text) on commit drop; grant all on r to authenticated, anon; grant usage on sequence r_n_seq to authenticated, anon;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}';
insert into r(k,v) select 'An thấy số HS (mong đợi 1)', count(*)::text from public.students;
insert into r(k,v) select 'An thấy số phiếu (1)', count(*)::text from public.feedback;
insert into r(k,v) select 'An thấy thông báo (TB lớp 1, TB chung GV A)', string_agg(title,', ') from public.announcements;
insert into r(k,v) select 'An thấy triển lãm (5ZZ1_1_5ZZ1-02)', string_agg(id,', ') from public.gallery;
insert into public.submissions (sid,class_id,topic,image_path) values ('5ZZ1-01','5ZZ1',1,'5ZZ1-01/a.jpg');
insert into r(k,v) values ('An nộp bài của mình','OK');
do $$ begin insert into public.submissions (sid,class_id,topic,image_path) values ('5ZZ1-02','5ZZ1',1,'5ZZ1-02/a.jpg'); insert into r(k,v) values ('An nộp hộ Bình','LỌT!'); exception when others then insert into r(k,v) values ('An nộp hộ Bình','bị chặn'); end $$;
do $$ begin insert into public.feedback (sid,class_id,topic) values ('5ZZ1-01','5ZZ1',1); insert into r(k,v) values ('An tự viết phiếu','LỌT!'); exception when others then insert into r(k,v) values ('An tự viết phiếu','bị chặn'); end $$;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a2","role":"authenticated"}';
insert into r(k,v) select 'GV B thấy bài nộp lớp A (0)', count(*)::text from public.submissions;
insert into r(k,v) select 'GV B thấy HS (5ZZ2-01)', string_agg(sid,', ') from public.students;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';
insert into r(k,v) select 'GV A thấy bài nộp (1)', count(*)::text from public.submissions;
set local role anon;
do $$ begin perform count(*) from public.students; insert into r(k,v) values ('Khách đọc HS','LỌT!'); exception when others then insert into r(k,v) values ('Khách đọc HS','bị chặn'); end $$;
reset role;
select k, v from r order by n;
