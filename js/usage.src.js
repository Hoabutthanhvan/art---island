/* ===== Ghi dữ liệu sử dụng (Pha 4: đánh giá và điều chỉnh) =====
   Ghi các mốc: vào web, mở đảo, mở giàn giáo, hoàn thành giàn giáo, mở Xưởng vẽ / Đảo Sáng Tạo / Kho.
   Chỉ ghi khi HS đã nhập mã số (máy chủ bỏ qua mã không có trong lớp). Không ghi Ếch qua sông.
   Gom nhiều mốc rồi gửi một lần; mất mạng thì giữ lại gửi sau; lỗi thì bỏ qua, không ảnh hưởng trang. */
(function(){
 const U='https://ngzhzezkhuvgouekeaav.supabase.co',
  K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nemh6ZXpraHV2Z291ZWtlYWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4OTg3MTIsImV4cCI6MjEwODQ3NDcxMn0.XoJk7giWzEyypYCaXduNFSL6KJqSFjyAA_Ob__s9KGM',
  QK='ai_uq',MAX=300;
 if(!/^https?:$/.test(location.protocol))return;
 const rd=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
 const wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
 let q=rd(QK,[]);if(!Array.isArray(q))q=[];
 let vid='';try{vid=sessionStorage.getItem('ai_vid')||''}catch(e){}
 if(!vid){vid=Date.now().toString(36)+Math.random().toString(36).slice(2,8);try{sessionStorage.setItem('ai_vid',vid)}catch(e){}}
 let visited=false;try{visited=sessionStorage.getItem('ai_vlog')===vid}catch(e){}
 const sidNow=()=>String(rd('ai_sid','')||'').toUpperCase().trim();
 function push(o){const s=sidNow();if(!/^[A-Z0-9]{1,12}-[0-9]{2}$/.test(s))return;
  if(!visited){visited=true;try{sessionStorage.setItem('ai_vlog',vid)}catch(e){}q.push({sid:s,vid,e:'visit',t:Date.now()})}
  q.push(Object.assign({sid:s,vid,t:Date.now()},o));if(q.length>MAX)q=q.slice(-MAX);wr(QK,q);sched()}
 function token(){const a=rd('ai-hs',null);return a&&a.access_token&&a.expires_at*1000>Date.now()+60000?a.access_token:K}
 let busy=false,tm=0;
 function sched(){clearTimeout(tm);tm=setTimeout(flush,q.length>=20?1500:15000)}
 async function flush(keep){if(busy||!q.length||!navigator.onLine)return;busy=true;
  const g=q[0],batch=q.filter(x=>x.sid===g.sid&&x.vid===g.vid).slice(0,60);
  try{const r=await fetch(U+'/rest/v1/rpc/log_usage',{method:'POST',keepalive:!!keep,
     headers:{'Content-Type':'application/json',apikey:K,Authorization:'Bearer '+token()},
     body:JSON.stringify({p_sid:g.sid,p_visit:g.vid,p_events:batch.map(x=>({e:x.e,i:x.i,s:x.s,v:x.v,t:x.t}))})});
   if(r.ok||(r.status>=400&&r.status<500)){const sent=new Set(batch);q=q.filter(x=>!sent.has(x));wr(QK,q)}
  }catch(e){}
  busy=false;if(q.length&&!keep)sched()}
 addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush(true)});
 addEventListener('online',()=>sched());

 /* mốc mở đảo / mở giàn giáo: chỉ ghi khi đổi chỗ */
 let lastIsl=null,lastStep=null;
 const isl=k=>{if(k===lastIsl)return;lastIsl=k;lastStep=null;push({e:'island',i:k})};
 const step=(k,s)=>{const key=k+'|'+s;if(key===lastStep)return;lastStep=key;push({e:'step',i:k,s})};
 try{const _go=go;go=function(v){const r=_go.apply(this,arguments);
   try{if(v==='island'||v==='dao1'){if(typeof cur==='number')isl(cur)}else{lastIsl=null;lastStep=null;
     if(v==='studio'||v==='creative'||v==='box')push({e:'view',v})}}catch(e){}return r}}catch(e){}
 try{const _rT=rTabs;rTabs=function(){const r=_rT.apply(this,arguments);try{if(typeof cur==='number'&&stn>=0&&stn<4){isl(cur);step(cur,stn)}}catch(e){}return r}}catch(e){}
 try{const _rD=rD1;rD1=function(){const r=_rD.apply(this,arguments);try{isl(0);step(0,(d1&&d1.g)|0)}catch(e){}return r}}catch(e){}
 /* mốc hoàn thành giàn giáo: so ai_st trước và sau khi lưu */
 try{const _ls=LS.set;LS.set=function(k,v){if(k==='ai_st'){try{const old=rd('ai_st',{})||{};for(const i in v){const a=v[i]||[],o=old[i]||[];
   a.forEach((x,j)=>{if(x&&!o[j]&&j<4&&+i>=0&&+i<=8)push({e:'done',i:+i,s:j})})}}catch(e){}}return _ls.apply(this,arguments)}}catch(e){}
 if(q.length)sched();
 window.AIUSE={push,flush,q:()=>q.slice()};
})();
