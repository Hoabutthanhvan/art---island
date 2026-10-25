# Art Island – Mĩ thuật 5

Học liệu số cho môn Mĩ thuật 5 (Kết nối tri thức với cuộc sống). Trang tĩnh chạy trên **Vercel**, dữ liệu và ảnh/video lưu trên **Supabase**.

| Đường dẫn | Dành cho | Nội dung |
|---|---|---|
| `/` | Học sinh | Trang Art Island: 8 đảo, Xưởng vẽ, Sách khách mời, Ếch qua sông… (dữ liệu học lưu trên máy em) |
| `/nop` | Học sinh | Nộp bài, Hộp thư, Tiến bộ, Triển lãm lớp. Đăng nhập bằng **mã số + mã PIN 6 số** |
| `/gv` | Giáo viên | Bảng giáo viên: lớp & thẻ mã, thu bài, chấm, trả phiếu, triển lãm, xuất dữ liệu nghiên cứu. Đăng nhập bằng **email + mật khẩu** |

## Cấu trúc thư mục

```
index.html              trang học sinh
nop.html                trang nộp bài – hộp thư – triển lãm
gv/index.html           bảng giáo viên
js/config.js            địa chỉ Supabase + khoá công khai (anon) + giới hạn tải lên
js/ai-common.js         tiện ích chung: nén ảnh, kiểm tra video, chuẩn hoá mã số
js/sb-teacher.js        lớp kết nối Supabase cho bảng giáo viên
img/, aud/              ảnh tác phẩm, giọng đọc
supabase/migrations/    lược đồ bảng, RLS, Storage (đã chạy trên dự án)
supabase/functions/     Edge Function tạo/đặt lại tài khoản học sinh
supabase/tests/         câu lệnh kiểm tra RLS
vercel.json             cấu hình Vercel (đường dẫn gọn /nop, /gv; tiêu đề bảo mật)
```

## Dữ liệu trên Supabase

| Bảng | Nội dung | Ai xem được |
|---|---|---|
| `teachers` | tài khoản giáo viên | chính giáo viên đó |
| `classes` | lớp | giáo viên chủ nhiệm lớp |
| `students` | học sinh, mã số, mã PIN | giáo viên của lớp; em chỉ thấy dòng của mình |
| `submissions` | bài nộp online + dữ liệu nghiên cứu | em thấy bài của mình; giáo viên thấy bài lớp mình |
| `feedback` | phiếu đánh giá | em thấy phiếu của mình; giáo viên của lớp |
| `announcements` | thông báo | học sinh lớp được gửi; giáo viên gửi |
| `gallery`, `gallery_likes` | Triển lãm lớp, lượt thích | học sinh cùng lớp; giáo viên của lớp |
| `teacher_docs` | sổ làm việc của giáo viên (hồ sơ bài, tiêu chí, nhận xét học kì) | chính giáo viên đó |

Kho Storage (đều **riêng tư**, chỉ mở bằng đường link có hạn):
- `art/<mã số>/…` – ảnh và video em nộp (tối đa 50 MB/tệp).
- `gallery/<lớp>/…` – ảnh thu nhỏ để trưng bày.
- `teacher/<id giáo viên>/…` – ảnh giáo viên chụp hoặc nhận về.

Giới hạn tải lên (sửa trong `js/config.js`): ảnh nén còn cạnh dài 1600 px, ≤ 1,5 MB; video ≤ 20 giây, ≤ 45 MB.

## Cài đặt lần đầu

Dự án Supabase **Art island** (`ngzhzezkhuvgouekeaav`) đã có đủ bảng, RLS, Storage và Edge Function `student-accounts`. Còn ba việc làm trên trang Supabase:

1. **Tắt tự đăng kí**: Authentication › Sign In / Providers › tắt *Allow new users to sign up*. Tài khoản giáo viên do quản trị viên tạo, tài khoản học sinh do bảng giáo viên tạo.
2. **Tạo tài khoản giáo viên**: Authentication › Users › Add user › Create new user (nhập email, mật khẩu, đánh dấu *Auto Confirm User*). Sau đó vào SQL Editor chạy:
   ```sql
   insert into public.teachers (user_id, name)
   select id, 'Cô Nguyễn Thu Hà' from auth.users where email = 'email-cua-co@gmail.com';
   ```
3. **Địa chỉ trang**: Authentication › URL Configuration › *Site URL* = địa chỉ Vercel (VD `https://art-island.vercel.app`), để thư "Quên mật khẩu" trỏ đúng về trang.

## Đưa lên Vercel

1. Vào https://vercel.com/new, chọn **Import Git Repository**, chọn repo `art-island`.
2. *Framework Preset*: **Other**. Để trống *Build Command* và *Output Directory*.
3. Bấm **Deploy**. Mỗi lần đẩy code mới lên nhánh `main`, Vercel tự triển khai lại.

## Dùng thử

1. Giáo viên vào `/gv`, đăng nhập, tab **Lớp & thẻ mã**: tạo lớp, dán danh sách họ tên, bấm **🔑 Tải phiếu PIN đăng nhập** và phát riêng cho từng em. Quên PIN thì bấm 🔑 cạnh tên em để cấp PIN mới.
2. Học sinh làm bài trên Art Island, bấm nộp bài → trang `/nop` mở ra, em đăng nhập bằng mã số + PIN rồi gửi.
3. Giáo viên bấm **☁️ Nhận bài nộp online** (bảng cũng tự kiểm tra mỗi 2 phút), chấm và duyệt; phiếu tự về **Hộp thư** của em.

## Lưu ý

- Gói miễn phí của Supabase **tạm dừng dự án sau 7 ngày không có ai dùng**; vào trang Supabase bấm *Restore* là chạy lại, dữ liệu không mất. Gói miễn phí có 500 MB cơ sở dữ liệu và 1 GB Storage.
- Chế độ AI (Phù Tiên trả lời bằng Claude, AI gợi ý nhận xét) chỉ chạy khi mở trong claude.ai; trên Vercel tạm tắt, Phù Tiên dùng kho hỏi – đáp có sẵn.
- `js/config.js` chỉ chứa **khoá công khai** (anon). Không bao giờ dán khoá `service_role` vào mã nguồn.
