/* Cấu hình kết nối Supabase của Art Island.
   Hai giá trị này là KHOÁ CÔNG KHAI (publishable/anon), được phép để trong mã trang web:
   mọi quyền đọc/ghi đều do Row Level Security trên Supabase quyết định.
   TUYỆT ĐỐI không dán khoá service_role vào đây. */
window.AI_CFG = {
  url: 'https://ngzhzezkhuvgouekeaav.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nemh6ZXpraHV2Z291ZWtlYWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4OTg3MTIsImV4cCI6MjEwODQ3NDcxMn0.XoJk7giWzEyypYCaXduNFSL6KJqSFjyAA_Ob__s9KGM',
  /* Giới hạn tải lên */
  maxImageSide: 1600,          // cạnh dài nhất của ảnh sau khi nén (px)
  maxImageBytes: 1.5 * 1024 * 1024,
  maxVideoSeconds: 20,
  maxVideoBytes: 45 * 1024 * 1024
};
