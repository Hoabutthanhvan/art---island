// Art Island – tạo / đặt lại / xoá tài khoản đăng nhập của học sinh (mã số + PIN 6 số).
// Chỉ giáo viên chủ nhiệm lớp đó mới gọi được. Dùng khoá service role ở phía máy chủ,
// không bao giờ lộ ra trình duyệt.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// Mã số → email nội bộ (không gửi thư; chỉ để Supabase Auth định danh)
export const emailOf = (sid: string) => `${sid.toLowerCase()}@hs.artisland.local`;
const newPin = () => {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return String(a[0] % 1000000).padStart(6, "0");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

  // Ai đang gọi?
  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: who, error: whoErr } = await admin.auth.getUser(jwt);
  if (whoErr || !who?.user) return json({ error: "Chưa đăng nhập." }, 401);
  const uid = who.user.id;
  const { data: t } = await admin.from("teachers").select("user_id").eq("user_id", uid).maybeSingle();
  if (!t) return json({ error: "Chỉ giáo viên mới dùng được chức năng này." }, 403);

  let body: { action?: string; cid?: string; sid?: string };
  try { body = await req.json(); } catch { return json({ error: "Dữ liệu gửi lên không hợp lệ." }, 400); }
  const action = body.action;

  const ownsClass = async (cid: string) => {
    const { data } = await admin.from("classes").select("id").eq("id", cid).eq("teacher_id", uid).maybeSingle();
    return !!data;
  };
  const studentOf = async (sid: string) => {
    const { data } = await admin.from("students").select("sid,class_id,user_id,pin").eq("sid", sid).maybeSingle();
    return data && (await ownsClass(data.class_id)) ? data : null;
  };

  // Tạo tài khoản cho mọi học sinh chưa có trong lớp
  if (action === "ensure") {
    const cid = String(body.cid || "").toUpperCase();
    if (!(await ownsClass(cid))) return json({ error: "Không tìm thấy lớp này." }, 404);
    const { data: list } = await admin.from("students").select("sid,user_id,pin").eq("class_id", cid);
    const pins: Record<string, string> = {};
    for (const s of list || []) {
      if (s.user_id && s.pin) continue;
      const pin = newPin();
      if (s.user_id) {
        const { error } = await admin.auth.admin.updateUserById(s.user_id, { password: pin });
        if (error) return json({ error: "Chưa đặt được PIN cho " + s.sid + ": " + error.message }, 500);
      } else {
        let { data: u, error } = await admin.auth.admin.createUser({
          email: emailOf(s.sid), password: pin, email_confirm: true,
          user_metadata: { role: "student", sid: s.sid },
        });
        if (error && /already/i.test(error.message)) {
          // Tài khoản cũ còn sót (mã số từng bị xoá rồi tạo lại): tìm và dùng lại
          const { data: found } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
          const old = found?.users.find((x) => x.email === emailOf(s.sid));
          if (old) {
            await admin.auth.admin.updateUserById(old.id, { password: pin });
            u = { user: old } as typeof u; error = null;
          }
        }
        if (error || !u?.user) return json({ error: "Chưa tạo được tài khoản cho " + s.sid + ": " + (error?.message || "") }, 500);
        s.user_id = u.user.id;
      }
      await admin.from("students").update({ user_id: s.user_id, pin }).eq("sid", s.sid);
      pins[s.sid] = pin;
    }
    return json({ ok: true, pins });
  }

  // Đặt lại PIN cho một em (em quên PIN)
  if (action === "reset") {
    const s = await studentOf(String(body.sid || "").toUpperCase());
    if (!s) return json({ error: "Không tìm thấy học sinh." }, 404);
    const pin = newPin();
    if (s.user_id) {
      const { error } = await admin.auth.admin.updateUserById(s.user_id, { password: pin });
      if (error) return json({ error: error.message }, 500);
    } else {
      const { data: u, error } = await admin.auth.admin.createUser({
        email: emailOf(s.sid), password: pin, email_confirm: true, user_metadata: { role: "student", sid: s.sid },
      });
      if (error || !u?.user) return json({ error: error?.message || "lỗi" }, 500);
      s.user_id = u.user.id;
    }
    await admin.from("students").update({ user_id: s.user_id, pin }).eq("sid", s.sid);
    return json({ ok: true, pins: { [s.sid]: pin } });
  }

  // Xoá tài khoản đăng nhập (trước khi xoá em khỏi lớp)
  if (action === "remove") {
    const s = await studentOf(String(body.sid || "").toUpperCase());
    if (!s) return json({ ok: true });
    if (s.user_id) await admin.auth.admin.deleteUser(s.user_id);
    await admin.from("students").update({ user_id: null, pin: null }).eq("sid", s.sid);
    return json({ ok: true });
  }

  return json({ error: "Không rõ thao tác." }, 400);
});
