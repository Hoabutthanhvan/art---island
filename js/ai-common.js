/* Art Island – tiện ích dùng chung cho trang nộp bài (học sinh) và bảng giáo viên.
   Cần nạp trước: supabase-js (window.supabase) và js/config.js (window.AI_CFG). */
(function () {
  const C = window.AI_CFG;

  /** Tạo client Supabase; mỗi trang dùng một khoá lưu phiên riêng để phiên GV và HS không lẫn nhau */
  function client(storageKey) {
    return window.supabase.createClient(C.url, C.key, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey }
    });
  }

  /** 5a7-8, 5A7 08, 5A7-08 → 5A7-08 */
  function normSid(s) {
    let c = String(s || '').trim().toUpperCase().replace(/\s+/g, '-');
    const m = c.match(/^(.+?)[-_.]?(\d{1,2})$/);
    if (m) c = m[1].replace(/[-_.]$/, '') + '-' + ('0' + m[2]).slice(-2);
    return c.slice(0, 20);
  }
  const emailOf = sid => normSid(sid).toLowerCase() + '@hs.artisland.local';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** Đọc ảnh (File/Blob) thành ImageBitmap hoặc <img> */
  function loadImage(file) {
    if (window.createImageBitmap) return createImageBitmap(file).catch(() => viaImg(file));
    return viaImg(file);
  }
  function viaImg(file) {
    return new Promise((ok, no) => {
      const im = new Image(); im.onload = () => ok(im); im.onerror = () => no(new Error('Không đọc được ảnh.'));
      im.src = URL.createObjectURL(file);
    });
  }
  const dim = im => [im.width || im.naturalWidth, im.height || im.naturalHeight];
  function toBlob(canvas, q) {
    return new Promise(ok => canvas.toBlob(b => ok(b), 'image/jpeg', q));
  }
  /** Thu nhỏ ảnh về cạnh dài nhất `max` px, xuất JPEG; giảm chất lượng dần đến khi ≤ maxBytes */
  async function scale(im, max, q, maxBytes) {
    const [w, h] = dim(im), k = Math.min(1, max / Math.max(w, h));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
    let b = await toBlob(c, q);
    while (maxBytes && b && b.size > maxBytes && q > 0.45) { q -= 0.08; b = await toBlob(c, q); }
    return { blob: b, w: c.width, h: c.height, canvas: c };
  }
  /** Nén ảnh nộp bài: bản chính (≤1600px, ≤1,5 MB), bản vừa (820px) để trưng bày, bản nhỏ (320px) */
  async function compressImage(file) {
    const im = await loadImage(file);
    const main = await scale(im, C.maxImageSide, 0.82, C.maxImageBytes);
    const mid = await scale(im, 820, 0.72, 400 * 1024);
    const thumb = await scale(im, 320, 0.62, 60 * 1024);
    if (im.close) im.close();
    return { main, mid, thumb, preview: main.canvas.toDataURL('image/jpeg', 0.7) };
  }

  /** Kiểm tra video: ≤ maxVideoSeconds giây và ≤ maxVideoBytes */
  function checkVideo(file) {
    return new Promise(ok => {
      if (!/^video\//.test(file.type || 'video/')) return ok({ ok: false, msg: 'Tệp này không phải video.' });
      if (file.size > C.maxVideoBytes) return ok({ ok: false, msg: `Video nặng ${(file.size / 1048576).toFixed(0)} MB, quá giới hạn ${Math.round(C.maxVideoBytes / 1048576)} MB. Em quay ngắn lại (dưới ${C.maxVideoSeconds} giây) nhé.` });
      const v = document.createElement('video'); v.preload = 'metadata'; v.muted = true;
      const url = URL.createObjectURL(file); let done = false;
      const fin = r => { if (done) return; done = true; URL.revokeObjectURL(url); ok(r); };
      v.onloadedmetadata = () => {
        const d = v.duration;
        if (isFinite(d) && d > C.maxVideoSeconds + 1) fin({ ok: false, msg: `Video dài ${Math.round(d)} giây. Em quay lại, không quá ${C.maxVideoSeconds} giây nhé.` });
        else fin({ ok: true, duration: isFinite(d) ? d : null });
      };
      v.onerror = () => fin({ ok: true, duration: null }); // trình duyệt không đọc được độ dài: vẫn cho gửi, đã giới hạn dung lượng
      setTimeout(() => fin({ ok: true, duration: null }), 8000);
      v.src = url;
    });
  }

  /** Lỗi Supabase → câu tiếng Việt dễ hiểu */
  function errText(e) {
    const m = String((e && (e.message || e.error_description || e.error)) || e || '');
    if (/Invalid login credentials/i.test(m)) return 'Mã số hoặc mã PIN chưa đúng.';
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Mất kết nối mạng. Em kiểm tra wifi rồi thử lại nhé.';
    if (/row-level security|violates/i.test(m)) return 'Tài khoản này không có quyền làm việc đó.';
    if (/Payload too large|exceeded the maximum/i.test(m)) return 'Tệp quá lớn.';
    if (/JWT|session/i.test(m)) return 'Phiên đăng nhập đã hết hạn. Em đăng nhập lại nhé.';
    return m || 'Có lỗi xảy ra.';
  }

  window.AI = { client, normSid, emailOf, esc, loadImage, scale, compressImage, checkVideo, errText, cfg: C };
})();
