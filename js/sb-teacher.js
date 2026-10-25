/* Art Island – lớp kết nối Supabase cho Bảng giáo viên.
   Bảng giáo viên vốn được viết cho môi trường claude.ai (claude.use('db'|'assets'|'user'|'downloads')).
   Tệp này cung cấp đúng các giao diện đó nhưng chạy trên Supabase:
     db        → bảng classes, students và teacher_docs (sổ làm việc của giáo viên)
     assets    → kho Storage "teacher" (ảnh, video giáo viên chụp hoặc nhận về)
     user      → Supabase Auth (email + mật khẩu của giáo viên)
     downloads → tải tệp về máy bằng trình duyệt
   AI (sample) tạm tắt. Cần nạp trước: supabase-js, js/config.js, js/ai-common.js. */
(function () {
  const sb = AI.client('ai-gv');
  const $ = s => document.querySelector(s);
  let ME = null, readyFn;
  const ready = new Promise(r => (readyFn = r));
  const E = (code, message) => Object.assign(new Error(message || code), { code });
  const wrap = e => e && e.code && !e.status ? e : E(/JWT|session/i.test(String(e && e.message)) ? 'needs_reauth' : 'server_error', AI.errText(e));

  /* ===================== Đăng nhập giáo viên ===================== */
  function gateHTML(msg) {
    return `<div class="ic">👩‍🏫</div><h2>Đăng nhập Bảng giáo viên</h2>
      <form id="gvLogin" style="display:flex;flex-direction:column;gap:10px;max-width:340px;margin:12px auto 0;text-align:left">
        <label style="display:flex;flex-direction:column;gap:4px;font-weight:700">Email<input class="txt" id="gvEmail" type="email" autocomplete="username" required></label>
        <label style="display:flex;flex-direction:column;gap:4px;font-weight:700">Mật khẩu<input class="txt" id="gvPass" type="password" autocomplete="current-password" required></label>
        <button class="btn pri" type="submit">Đăng nhập</button>
        <div id="gvMsg" class="note">${msg || 'Tài khoản giáo viên do quản trị viên tạo trên Supabase.'}</div>
        <a href="#" id="gvForgot" class="note" style="text-align:center">Quên mật khẩu?</a>
      </form>`;
  }
  function showLogin(msg) {
    const g = $('#gate'); if (!g) return;
    g.hidden = false; g.innerHTML = gateHTML(msg);
    $('#gvLogin').onsubmit = async e => {
      e.preventDefault();
      const m = $('#gvMsg'); m.textContent = 'Đang đăng nhập…';
      const { error } = await sb.auth.signInWithPassword({ email: $('#gvEmail').value.trim(), password: $('#gvPass').value });
      if (error) { m.textContent = /Invalid login/i.test(error.message) ? 'Email hoặc mật khẩu chưa đúng.' : AI.errText(error); return; }
      check();
    };
    $('#gvForgot').onclick = async e => {
      e.preventDefault(); const em = $('#gvEmail').value.trim();
      if (!em) { $('#gvMsg').textContent = 'Nhập email trước, rồi bấm lại "Quên mật khẩu?".'; return; }
      const { error } = await sb.auth.resetPasswordForEmail(em, { redirectTo: location.origin + location.pathname });
      $('#gvMsg').textContent = error ? AI.errText(error) : 'Đã gửi thư đặt lại mật khẩu (nếu email này có tài khoản).';
    };
  }
  async function check() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return showLogin();
    const { data: t, error } = await sb.from('teachers').select('user_id,name').eq('user_id', session.user.id).maybeSingle();
    if (error || !t) {
      await sb.auth.signOut();
      return showLogin('Tài khoản ' + AI.esc(session.user.email || '') + ' chưa được cấp quyền giáo viên. Nhờ quản trị viên thêm vào bảng <b>teachers</b> trên Supabase.');
    }
    ME = { uid: session.user.id, email: session.user.email, name: t.name || session.user.email };
    addLogout();
    readyFn(ME);
  }
  function addLogout() {
    const w = $('#who'); if (!w || $('#gvOut')) return;
    w.insertAdjacentHTML('afterend', '<button class="btn" id="gvOut" style="margin-left:6px">Đăng xuất</button>');
    $('#gvOut').onclick = async () => { await sb.auth.signOut(); location.reload(); };
  }
  sb.auth.onAuthStateChange(ev => { if (ev === 'PASSWORD_RECOVERY') setTimeout(async () => {
    const p = prompt('Nhập mật khẩu mới (ít nhất 8 kí tự):');
    if (p && p.length >= 8) { const { error } = await sb.auth.updateUser({ password: p }); alert(error ? AI.errText(error) : 'Đã đổi mật khẩu.'); }
  }, 300); });

  /* ===================== Kho ảnh (Storage) ===================== */
  const SIGN = new Map();                 // đường dẫn → { url, exp }
  const TTL = 6 * 3600;
  const bucketOf = id => /^art:/.test(id) ? ['art', id.slice(4)] : ['teacher', id];
  async function signIds(ids) {
    const now = Date.now(), need = { teacher: [], art: [] };
    [...new Set(ids.filter(Boolean))].forEach(id => {
      const c = SIGN.get(id); if (c && c.exp - now > 30 * 60 * 1000) return;
      const [b, p] = bucketOf(id); need[b].push(p);
    });
    for (const b of Object.keys(need)) {
      for (let i = 0; i < need[b].length; i += 100) {
        const part = need[b].slice(i, i + 100);
        const { data } = await sb.storage.from(b).createSignedUrls(part, TTL);
        (data || []).forEach(x => { if (x.signedUrl) SIGN.set(b === 'art' ? 'art:' + x.path : x.path, { url: x.signedUrl, exp: now + TTL * 1000 }); });
      }
    }
  }
  const extOf = t => (String(t || '').split('/')[1] || 'bin').replace('jpeg', 'jpg').replace('quicktime', 'mov').replace(/[^a-z0-9]/g, '').slice(0, 5) || 'bin';
  const assets = {
    async upload(blob, o) {
      const type = (o && o.type) || blob.type || 'application/octet-stream';
      const path = `${ME.uid}/${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}.${extOf(type)}`;
      const { error } = await sb.storage.from('teacher').upload(path, blob, { contentType: type, upsert: false });
      if (error) throw wrap(error);
      await signIds([path]);
      return { id: path, url: (SIGN.get(path) || {}).url || '' };
    },
    async delete(id) {
      const [b, p] = bucketOf(id); if (b !== 'teacher') return;
      const { error } = await sb.storage.from(b).remove([p]); if (error) throw wrap(error);
      SIGN.delete(id);
    }
  };

  /* ===================== Cơ sở dữ liệu ===================== */
  // Bộ chuyển đổi giữa "tài liệu" của bảng giáo viên và hàng trong bảng Supabase
  const MAP = {
    classes: {
      table: 'classes', key: 'id', select: 'id,year,data',
      toDoc: r => Object.assign({}, r.data || {}, { cid: r.id, year: r.year != null ? r.year : (r.data || {}).year }),
      toRow: (id, d) => ({ id: d.cid || id, year: d.year || null, data: d }),
    },
    students: {
      table: 'students', key: 'sid', select: 'sid,class_id,stt,name,pin,user_id,data',
      toDoc: r => Object.assign({}, r.data || {}, { sid: r.sid, cid: r.class_id, stt: r.stt, name: r.name, pin: r.pin || '', acc: !!r.user_id }),
      toRow: (id, d) => {
        const data = Object.assign({}, d); delete data.pin; delete data.acc;
        return { sid: d.sid || id, class_id: d.cid, stt: d.stt != null ? d.stt : null, name: String(d.name || '').slice(0, 60), data };
      },
    }
  };
  const isMapped = col => !!MAP[col];

  async function fetchAll(col) {
    const out = [];
    for (let from = 0; ; from += 1000) {
      let q;
      if (isMapped(col)) q = sb.from(MAP[col].table).select(MAP[col].select).order(MAP[col].key).range(from, from + 999);
      else q = sb.from('teacher_docs').select('id,data').eq('col', col).order('id').range(from, from + 999);
      const { data, error } = await q; if (error) throw wrap(error);
      out.push(...data); if (data.length < 1000) break;
    }
    return out.map(r => isMapped(col) ? { id: r[MAP[col].key], d: MAP[col].toDoc(r) } : { id: r.id, d: r.data });
  }
  async function getOne(col, id) {
    if (isMapped(col)) {
      const M = MAP[col]; const { data, error } = await sb.from(M.table).select(M.select).eq(M.key, id).maybeSingle();
      if (error) throw wrap(error); return data ? M.toDoc(data) : null;
    }
    const { data, error } = await sb.from('teacher_docs').select('data').eq('col', col).eq('id', id).maybeSingle();
    if (error) throw wrap(error); return data ? data.data : null;
  }
  async function putOne(col, id, doc) {
    if (isMapped(col)) {
      const M = MAP[col]; const row = M.toRow(id, doc);
      const { error } = await sb.from(M.table).upsert(row, { onConflict: M.key }); if (error) throw wrap(error);
      if (col === 'students') scheduleEnsure(row.class_id);
      return;
    }
    const { error } = await sb.from('teacher_docs').upsert({ teacher_id: ME.uid, col, id, data: doc, updated_at: new Date().toISOString() }, { onConflict: 'teacher_id,col,id' });
    if (error) throw wrap(error);
  }
  async function delOne(col, id) {
    if (col === 'students') { try { await callAccounts({ action: 'remove', sid: id }); } catch (e) { console.warn(e); } }
    const q = isMapped(col) ? sb.from(MAP[col].table).delete().eq(MAP[col].key, id) : sb.from('teacher_docs').delete().eq('col', col).eq('id', id);
    const { error } = await q; if (error) throw wrap(error);
  }

  // Theo dõi thay đổi: realtime + kiểm tra định kì
  const WATCH = {};
  function bump(col) { const w = WATCH[col]; if (!w) return; clearTimeout(w.t); w.t = setTimeout(w.run, 300); }
  function startRealtime() {
    sb.channel('gv-' + ME.uid)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teacher_docs', filter: 'teacher_id=eq.' + ME.uid }, p => bump((p.new && p.new.col) || (p.old && p.old.col) || '*'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => bump('classes'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => bump('students'))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, () => window.dispatchEvent(new Event('ai-new-submission')))
      .subscribe();
    setInterval(() => Object.keys(WATCH).forEach(bump), 90 * 1000);
  }
  const snapOf = rows => ({ docs: rows.map(r => ({ id: r.id, data: () => r.d })) });
  const IMG_KEYS = ['imgId', 'thumbId', 'vidId', 'strokesId'];

  const db = {
    collection(col) {
      return {
        async get() { return snapOf(await fetchAll(col)); },
        onSnapshot(cb, onErr) {
          const run = async () => {
            try {
              const rows = await fetchAll(col);
              if (col === 'works' || col === 'inbox') await signIds(rows.flatMap(r => IMG_KEYS.map(k => r.d && r.d[k])));
              cb(snapOf(rows));
            } catch (e) { onErr && onErr(wrap(e)); }
          };
          WATCH[col] = { run, t: 0 }; run();
          return () => { delete WATCH[col]; };
        }
      };
    },
    doc(path) {
      const i = path.indexOf('/'), col = path.slice(0, i), id = path.slice(i + 1);
      return {
        async get() { const d = await getOne(col, id); return { exists: !!d, id, data: () => d }; },
        async set(doc) { await putOne(col, id, doc); bump(col); },
        async update(part) {
          const cur = await getOne(col, id); if (!cur) throw E('not_found', 'Không tìm thấy dữ liệu.');
          await putOne(col, id, Object.assign({}, cur, part)); bump(col);
        },
        async delete() { await delOne(col, id); bump(col); }
      };
    }
  };

  /* ===================== Tài khoản học sinh (mã số + PIN) ===================== */
  async function callAccounts(body) {
    const { data, error } = await sb.functions.invoke('student-accounts', { body });
    if (error) {
      let msg = error.message;
      try { const j = await error.context.json(); msg = j.error || msg; } catch (e) {}
      throw E('server_error', msg);
    }
    return data;
  }
  const pendingEnsure = new Set(); let ensureT = 0;
  function scheduleEnsure(cid) {
    if (!cid) return; pendingEnsure.add(cid); clearTimeout(ensureT);
    ensureT = setTimeout(async () => {
      const L = [...pendingEnsure]; pendingEnsure.clear();
      for (const c of L) { try { await callAccounts({ action: 'ensure', cid: c }); } catch (e) { console.warn('ensure', e); } }
      bump('students');
    }, 1500);
  }

  /* ===================== Trao đổi với trang học sinh ===================== */
  const AIGV = {
    sb,
    url: id => { const c = SIGN.get(id); return c ? c.url : ''; },
    signIds,
    /** Bài học sinh nộp online chưa được nhận vào sổ */
    async newSubmissions() {
      const { data, error } = await sb.from('submissions').select('*').is('processed_at', null).order('created_at').limit(200);
      if (error) throw wrap(error); return data;
    },
    async fetchArt(path) {
      const { data, error } = await sb.storage.from('art').download(path);
      if (error) throw wrap(error); return data;
    },
    async markProcessed(id, result) {
      const { error } = await sb.from('submissions').update({ processed_at: new Date().toISOString(), }).eq('id', id);
      if (error) throw wrap(error);
    },
    /** Trả phiếu đánh giá về Hộp thư của học sinh */
    async sendPhieu(w, ph) {
      const { error } = await sb.from('feedback').insert({
        sid: w.sid, class_id: w.cid, topic: w.t, title: ph.title || '', levels: ph.lv || [], overall: ph.overall,
        comment: ph.fb || '', criteria: ph.crit || null, thumb: ph.thumb || null
      });
      if (error) throw wrap(error);
    },
    async announce(cls, title, body) {
      const { error } = await sb.from('announcements').insert({ class_id: cls, title: title.slice(0, 120), body: (body || '').slice(0, 2000) });
      if (error) throw wrap(error);
    },
    /** Đưa bài lên / gỡ khỏi Triển lãm lớp */
    async gallery(w, on, extra) {
      const gid = `${w.cid}_${w.t}_${w.sid}`;
      if (!on) {
        const { error } = await sb.from('gallery').update({ is_on: false, updated_at: new Date().toISOString() }).eq('id', gid);
        if (error) throw wrap(error); return;
      }
      const ts = Date.now(), base = `${w.cid}/GV_${w.sid}_CD${w.t}_${ts}`;
      const up = async (suffix, blob) => { const p = base + suffix; const { error } = await sb.storage.from('gallery').upload(p, blob, { contentType: 'image/jpeg' }); if (error) throw wrap(error); return p; };
      const image_path = await up('_big.jpg', extra.big), thumb_path = await up('_sm.jpg', extra.sm);
      const { error } = await sb.from('gallery').upsert({
        id: gid, class_id: w.cid, sid: w.sid, topic: w.t, title: extra.title || '', by_name: extra.by || '', story: extra.thuyet || '',
        kind: extra.kind === 'nha' ? 'nha' : 'lop', image_path, thumb_path, is_on: true, updated_at: new Date().toISOString()
      });
      if (error) throw wrap(error);
    },
    ensureAccounts: cid => callAccounts({ action: 'ensure', cid }).then(r => { bump('students'); return r; }),
    resetPin: sid => callAccounts({ action: 'reset', sid }).then(r => { bump('students'); return r; }),
  };
  window.AIGV = AIGV;

  /* ===================== Giao diện claude.use giả lập ===================== */
  const downloads = {
    async save({ filename, data }) {
      const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    }
  };
  const user = { me: async () => ({ name: ME.name, email: ME.email }), canEdit: async () => true };
  let rtStarted = false;
  window.claude = {
    async use(name) {
      await ready;
      if (!rtStarted) { rtStarted = true; startRealtime(); }
      if (name === 'db') return db;
      if (name === 'assets') return assets;
      if (name === 'user') return user;
      if (name === 'downloads') return downloads;
      if (name === 'mcp') return { online: true };     // cờ cho biết có kênh nhận bài online (Supabase)
      throw E('not_granted', 'Tính năng này tạm tắt.');
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', check); else check();
})();
