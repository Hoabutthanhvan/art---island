/* ===== ALBUM STICKER HOẠ SĨ (đi kèm Sách khách mời) =====
   Em nhận gói khi: trả lời đúng hết Thử thách quan sát (tt) và khi nhận thẻ ở Thẻ & bí kíp (bk).
   Mỗi trang 6 ô: 4 mảnh ghép tranh chính (Thường), 1 tác phẩm/chi tiết (Hiếm), 1 thẻ hoạ sĩ (Kiệt tác).
   Không có thẻ trùng. Hoàn thành trang → mở khoá charm hoạ sĩ trong Xưởng thiết kế.
   Chỉ lưu trên máy em (localStorage), không ghi dữ liệu nghiên cứu. */
(function(){
const AP=[
 {k:'Chấm màu',pk:['#38b6ff','#1d6fa5'],m:{t:'Chiều Chủ nhật trên đảo La Grande Jatte',img:'img/82691e49a3.jpg',r:1.49},s:{t:'Rạp xiếc',img:'img/b6347587cc.jpg'}},
 {k:'Hình tượng anh hùng',pk:['#ef5b4c','#9c2a1f'],m:{t:'Nữ thần Tự do dẫn dắt nhân dân',img:'img/6ae33e0dbb.jpg',r:1.25},s:{t:'Chi tiết: lá cờ',img:'img/6ae33e0dbb.jpg',zoom:[280,48,18]}},
 {k:'Khoảnh khắc mẹ con',pk:['#ff8fb8','#b93f6d'],m:{t:'Bữa sáng trên giường',img:'img/bae66f7462.jpg',r:1.24},s:{t:'Tắm cho bé',img:'img/6ec091d30f.jpg'}},
 {k:'Trò chơi của trẻ em',pk:['#7cc35a','#3c7a24'],m:{t:'Trò chơi của trẻ em',img:'img/e81872464c.jpg',r:1.38},s:{t:'Chi tiết: vòng tròn trò chơi',img:'img/e81872464c.jpg',zoom:[320,30,72]}},
 {k:'Người lao động',pk:['#e2a64a','#8a5a12'],m:{t:'Những người mót lúa',img:'img/317644d40a.jpg',r:1.34},s:{t:'Cầu nguyện buổi chiều',img:'img/77aebc7764.jpg'}},
 {k:'Ánh sáng theo thời điểm',pk:['#4fa3c7','#e46a2e'],m:{t:'Ấn tượng, mặt trời mọc',img:'img/00c0166fac.jpg',r:1.29},s:{t:'Đống rơm',img:'img/2f995afaab.jpg'}},
 {k:'Hình ảnh biểu tượng',pk:['#2f6db5','#14335c'],m:{t:'Sóng lừng ngoài khơi Kanagawa',img:'img/9f0f63f360.jpg',r:1.49},s:{t:'Gió nam trời quang (Phú Sĩ đỏ)',img:'img/353662883a.jpg'}},
 {k:'Áp phích',pk:['#c79bd8','#6b3d86'],m:{t:'Bốn mùa',img:'img/9fd7031ce0.jpg',r:2.0},s:{t:'Áp phích “Gismonda”',img:'img/210d195897.jpg'}}
];
const KEYS=['seurat','delacroix','cassatt','bruegel','millet','monet','hokusai','mucha'];
const PER=6,PACK=3,TOTAL=AP.length*PER,LSK='ai_album';
const RAR=i=>i===5?'gold':i===4?'rare':'';
const RAR_T={gold:'★ Kiệt tác',rare:'◆ Hiếm','':'Thường'};
const G=k=>(typeof GUEST!=='undefined'&&GUEST[k])||{n:'Hoạ sĩ',y:'',c:''};
const short=k=>G(k).n.split(' ').pop();
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let S=load();
function load(){let x=null;try{x=JSON.parse(localStorage.getItem(LSK)||'null')}catch(e){}x=Object.assign({have:{},pend:{},got:{}},x||{});
 if(x.packs){/* chuyển từ bản cũ (gói ngẫu nhiên) sang gói có sẵn sticker */for(const id in x.got){const [k,w]=id.split(':'),i=w==='tt'?4:w==='bk'?5:-1;if(i>=0&&!(x.have[k]&&x.have[k][i])){(x.pend[k]=x.pend[k]||[]).includes(i)||x.pend[k].push(i)}}delete x.packs}
 return x}
const save=()=>{try{localStorage.setItem(LSK,JSON.stringify(S))}catch(e){}};
const has=(p,i)=>!!(S.have[p]&&S.have[p][i]);
const cnt=p=>S.have[p]?Object.keys(S.have[p]).length:0;
const no=(p,i)=>p*PER+i+1;
const pend=p=>(S.pend[p]||[]).filter(i=>!has(p,i));
const packsAll=()=>AP.reduce((a,_,p)=>a+(pend(p).length?1:0),0);
const tilesDone=p=>[0,1,2,3].every(i=>has(p,i));
const myNote=p=>{try{const st=JSON.parse(localStorage.getItem('kmb_'+KEYS[p])||'null');return st&&st.card&&st.card.see||''}catch(e){return ''}};

/* ---------- CSS ---------- */
const css=`
.ab-ov{position:fixed;inset:0;z-index:400;background:radial-gradient(circle at 20% 0%,#e7f3f9,#cfe6f2 60%);overflow:auto;color:#3a2a1c;font-family:Nunito,system-ui,sans-serif;
 padding:max(12px,env(safe-area-inset-top,0px)) max(12px,env(safe-area-inset-right,0px)) max(16px,env(safe-area-inset-bottom,0px)) max(12px,env(safe-area-inset-left,0px))}
.ab-ov *{box-sizing:border-box}
.ab-ov [hidden],.ab-pov [hidden]{display:none!important}
.ab-wrap{max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
.ab-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ab-top h2{margin:0;flex:1;min-width:0;font-family:"Baloo 2",Nunito,sans-serif;font-weight:800;font-size:clamp(22px,4vw,28px);color:#b92e5d;line-height:1.1}
.ab-album{background:#fffaf0;border-radius:22px;box-shadow:0 2px 0 #f0e2cc,0 6px 0 #e3cfae,0 18px 40px #2b5d7a33;overflow:hidden;position:relative}
.ab-bar{display:flex;align-items:center;gap:8px;padding:10px 12px;background:linear-gradient(#ffe3ee,#ffd0e1);border-bottom:2px solid #f6b8cf}
.ab-bar .ab-ttl{flex:1;min-width:0;text-align:center;font-family:"Baloo 2",Nunito,sans-serif;font-weight:800;font-size:20px;color:#b92e5d;font-variant-numeric:tabular-nums}
.ab-ib{font:inherit;font-weight:800;border:0;border-radius:12px;background:#fff;color:#e8467c;width:40px;height:40px;font-size:20px;cursor:pointer;box-shadow:0 3px 0 #f2a9c4;display:grid;place-items:center;padding:0}
.ab-ib:active{transform:translateY(2px);box-shadow:0 1px 0 #f2a9c4}
.ab-ib[disabled]{opacity:.35;cursor:default}
.ab-ov :focus-visible,.ab-pov :focus-visible{outline:3px solid #3d8bfd;outline-offset:2px}
.ab-page{padding:16px;display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:16px;align-items:start;min-height:340px;position:relative;
 background:repeating-linear-gradient(0deg,transparent 0 27px,#f3e7d3 27px 28px),#fffaf0}
.ab-page.turn{animation:abTurn .45s ease}
@keyframes abTurn{0%{transform:perspective(1200px) rotateY(-14deg);opacity:.2;transform-origin:left}100%{transform:none;opacity:1}}
.ab-ph{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px}
.ab-ph h3{margin:0;font-family:"Baloo 2",Nunito,sans-serif;font-weight:800;font-size:22px;line-height:1.15}
.ab-ph small{color:#7a6450}
.ab-prog{margin-left:auto;font-weight:800;color:#b92e5d;font-variant-numeric:tabular-nums}
.ab-main{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0}
.ab-mf{position:relative;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:6px;padding:8px;background:#fff;border-radius:6px;box-shadow:0 2px 8px #0002;max-width:100%;transition:gap .5s,padding .5s}
.ab-mf.done{gap:0;padding:10px;box-shadow:0 0 0 4px #f4b400,0 0 22px #f4b40099}
.ab-mf.done .ab-slot{border-radius:0;box-shadow:none}
.ab-cap{font-size:13px;color:#7a6450;text-align:center}
.ab-side{display:flex;flex-direction:column;gap:14px}
.ab-slot{position:relative;border-radius:6px;background:#fff;border:2px dashed #d9c4a3;overflow:hidden}
.ab-slot .ab-ghost{position:absolute;inset:0;filter:grayscale(1);opacity:.12}
.ab-slot .ab-num{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-family:"Baloo 2",Nunito,sans-serif;font-weight:800;font-size:15px;background:#efe6ff;color:#6a4fc7;border-radius:8px;padding:0 9px;font-variant-numeric:tabular-nums;z-index:2}
.ab-slot.on{border:0;box-shadow:0 2px 6px #0003}
.ab-slot.on .ab-num{left:6px;top:auto;bottom:6px;transform:none;background:#fff;color:#3a2a1c;font-size:12px;padding:0 6px}
.ab-slot.on .ab-ghost{display:none}
.ab-slot .ab-art{position:absolute;inset:0;background-repeat:no-repeat;opacity:0}
.ab-slot.on .ab-art{opacity:1}
.ab-slot.pop{animation:abPop .5s cubic-bezier(.3,1.6,.5,1)}
@keyframes abPop{0%{transform:scale(.85)}60%{transform:scale(1.08)}100%{transform:none}}
.ab-slot.shine::after{content:"";position:absolute;inset:-20%;background:linear-gradient(115deg,transparent 40%,#ffffffcc 50%,transparent 60%);transform:translateX(-100%);animation:abSweep .9s ease forwards;z-index:3}
@keyframes abSweep{to{transform:translateX(100%)}}
.ab-slot.r-gold.on{box-shadow:0 0 0 3px #f4b400,0 2px 10px #f4b40088}
.ab-slot.r-rare.on{box-shadow:0 0 0 3px #3d8bfd,0 2px 10px #3d8bfd66}
.ab-s4{aspect-ratio:4/3}.ab-s5{aspect-ratio:3/4}
.ab-pc{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:2px;padding:10px;text-align:center;background:radial-gradient(circle at 50% 30%,#fff6d6,#ffe08a);color:#3a2a1c;overflow:hidden}
.ab-pc b{font-family:"Baloo 2",Nunito,sans-serif;font-size:17px;line-height:1.1}
.ab-pc i{font-style:normal;font-size:11.5px;color:#7a6450}
.ab-pc em{font-style:normal;margin-top:4px;font-weight:800;font-size:12.5px;background:#fff;border-radius:99px;padding:2px 10px;color:#b92e5d}
.ab-pc q{display:block;margin-top:6px;font-size:11.5px;line-height:1.3;color:#3a2a1c;quotes:"“" "”";max-height:4.2em;overflow:hidden}
.ab-stamp{position:absolute;right:18px;top:52px;z-index:5;font-family:"Baloo 2",Nunito,sans-serif;font-weight:800;color:#2e9b5b;border:3px solid #2e9b5b;border-radius:10px;padding:2px 10px;transform:rotate(-8deg);background:#ffffffd9;animation:abStamp .5s cubic-bezier(.3,1.6,.5,1)}
@keyframes abStamp{from{transform:rotate(-8deg) scale(2.4);opacity:0}}
.ab-foot{display:flex;align-items:center;gap:10px;padding:12px;border-top:2px solid #f0e2cc;background:#fff4e2;flex-wrap:wrap}
.ab-btn{font:inherit;font-weight:800;border:0;border-radius:14px;padding:10px 16px;cursor:pointer;background:#fff;color:#3a2a1c;box-shadow:0 3px 0 #e1cba6;display:inline-flex;align-items:center;gap:8px;position:relative}
.ab-btn:active{transform:translateY(2px);box-shadow:0 1px 0 #e1cba6}
.ab-btn.pri{background:#e8467c;color:#fff;box-shadow:0 3px 0 #b92e5d}
.ab-btn[disabled]{opacity:.45;cursor:default}
.ab-badge{position:absolute;top:-8px;right:-8px;background:#f4b400;color:#3a2a1c;border-radius:99px;min-width:24px;height:24px;padding:0 6px;font-size:13px;display:grid;place-items:center;font-variant-numeric:tabular-nums;box-shadow:0 2px 0 #c58f00}
.ab-btn.has{animation:abNudge 1.6s ease-in-out infinite}
@keyframes abNudge{0%,80%,100%{transform:none}86%{transform:rotate(-4deg)}92%{transform:rotate(4deg)}}
.ab-mini{font-size:13px;color:#7a6450}
.ab-help{background:#ffffffcc;border-radius:16px;padding:12px 16px;font-size:14px;color:#5a4636}
.ab-help ul{margin:4px 0 0;padding-left:20px}
.ab-list{position:absolute;inset:62px 0 0;background:#fffaf0;z-index:6;padding:16px;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;align-content:start}
.ab-li{font:inherit;text-align:left;border:0;border-radius:14px;background:#fff;padding:10px;cursor:pointer;box-shadow:0 2px 6px #0001;display:flex;flex-direction:column;gap:6px;color:#3a2a1c}
.ab-li .th{aspect-ratio:3/2;border-radius:8px;background-size:cover;background-position:center}
.ab-li .th.g{filter:grayscale(1) opacity(.45)}
.ab-li b{font-family:"Baloo 2",Nunito,sans-serif;font-size:15px;line-height:1.1}
.ab-li .bar2{height:8px;border-radius:99px;background:#f1e5d2;overflow:hidden}
.ab-li .bar2 i{display:block;height:100%;background:#e8467c}
.ab-li.done{box-shadow:0 0 0 3px #f4b400}
/* lớp mở gói */
.ab-pov{position:fixed;inset:0;z-index:410;background:radial-gradient(circle at 50% 40%,#fff6fb,#ffd6e7 55%,#f7b3cf);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;overflow:hidden;font-family:Nunito,system-ui,sans-serif;color:#3a2a1c;
 padding:max(16px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) max(16px,env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}
.ab-pov *{box-sizing:border-box}
.ab-pov.fade{animation:abFade .35s ease forwards}
@keyframes abFade{to{opacity:0}}
.ab-rays{position:absolute;inset:-50%;background:repeating-conic-gradient(from 0deg,#ffffff55 0 10deg,transparent 10deg 20deg);animation:abSpin 30s linear infinite;pointer-events:none}
@keyframes abSpin{to{transform:rotate(360deg)}}
.ab-hint{position:relative;font-family:"Baloo 2",Nunito,sans-serif;font-weight:800;font-size:22px;color:#b92e5d;text-align:center}
.ab-pack{position:relative;width:min(240px,62vw);aspect-ratio:5/7;cursor:pointer;border:0;padding:0;background:none;transform:rotate(-6deg);filter:drop-shadow(0 16px 24px #a0275a55);animation:abBob 2.4s ease-in-out infinite}
@keyframes abBob{50%{transform:rotate(-6deg) translateY(-8px)}}
.ab-pack.shake{animation:abShake .45s linear}
@keyframes abShake{20%{transform:rotate(-10deg)}40%{transform:rotate(-2deg)}60%{transform:rotate(-11deg)}80%{transform:rotate(-3deg)}}
.ab-pack .body{position:absolute;inset:7% 0 7%;border-radius:6px;overflow:hidden;background:var(--pk1)}
.ab-pack .foil{position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,#ffffff66 45%,transparent 55%);background-size:250% 100%;animation:abFoil 2.6s ease-in-out infinite}
@keyframes abFoil{from{background-position:120% 0}to{background-position:-120% 0}}
.ab-pack .crimp{position:absolute;left:0;right:0;height:8%;background:repeating-linear-gradient(90deg,#ffe0ec 0 5px,#ffc4da 5px 8px);border-radius:4px}
.ab-pack .crimp.t{top:0}.ab-pack .crimp.b{bottom:0}
.ab-pack .lid{position:absolute;left:0;right:0;top:0;height:16%;z-index:3}
.ab-pack .lid .crimp{height:50%}
.ab-pack .lid .strip{position:absolute;left:0;right:0;top:50%;height:50%;background:var(--pk1);border-bottom:2px dashed #ffffffaa}
.ab-pack.torn .lid{animation:abRip .6s cubic-bezier(.4,0,.6,1) forwards}
@keyframes abRip{40%{transform:translate(10px,-8px) rotate(6deg)}100%{transform:translate(260px,-140px) rotate(48deg);opacity:0}}
.ab-pack .logo{position:absolute;top:13%;left:0;right:0;text-align:center;font-family:"Baloo 2",Nunito,sans-serif;font-weight:800;color:#fff;font-size:clamp(18px,5.4vw,26px);line-height:1;text-shadow:0 3px 0 var(--pk2)}
.ab-pack .logo small{display:block;font-size:.5em;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px}
.ab-pack .medal{position:absolute;left:50%;top:53%;width:46%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background-size:cover;background-position:center;border:5px solid #fff;box-shadow:0 4px 0 #0002}
.ab-pack .five{position:absolute;left:10%;right:10%;bottom:16%;background:#e8467c;color:#fff;border-radius:6px;text-align:center;font-family:"Baloo 2",Nunito,sans-serif;font-weight:800;font-size:clamp(16px,4.6vw,22px);padding:2px 0;display:flex;justify-content:center;align-items:center;gap:6px}
.ab-pack .five i{display:inline-block;width:16px;height:21px;background:#fff;border-radius:3px;box-shadow:4px -3px 0 #ffd0e1}
.ab-pack .who{position:absolute;bottom:9%;left:0;right:0;text-align:center;color:#fff;font-weight:800;font-size:12px}
.ab-cards{position:relative;display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.ab-card{position:relative;width:min(150px,27vw);aspect-ratio:3/4;perspective:900px;border:0;padding:0;background:none;cursor:pointer;animation:abRise .55s cubic-bezier(.3,1.4,.5,1) backwards;font:inherit}
@keyframes abRise{from{transform:translateY(160px) scale(.4);opacity:0}}
.ab-card .in{position:absolute;inset:0;transition:transform .6s cubic-bezier(.3,1.3,.5,1);transform-style:preserve-3d}
.ab-card.flip .in{transform:rotateY(180deg)}
.ab-card .f,.ab-card .b{position:absolute;inset:0;border-radius:12px;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}
.ab-card .b{background:repeating-linear-gradient(45deg,#e8467c 0 10px,#ff6f9f 10px 20px);border:5px solid #fff;box-shadow:0 6px 14px #0003;display:grid;place-items:center;color:#fff;font-family:"Baloo 2",Nunito,sans-serif;font-size:30px;font-weight:800}
.ab-card .f{transform:rotateY(180deg);background:#fff;border:5px solid #fff;box-shadow:0 6px 14px #0003;display:flex;flex-direction:column}
.ab-card .f .pic{flex:1;background-repeat:no-repeat;position:relative;border-radius:6px;overflow:hidden}
.ab-card .f .lab{padding:4px 2px 0;font-size:12px;font-weight:800;line-height:1.2;text-align:center;color:#3a2a1c}
.ab-card .f .no{position:absolute;left:4px;top:4px;background:#fff;border-radius:6px;padding:0 6px;font-size:12px;font-weight:800;color:#3a2a1c;z-index:2}
.ab-card .new{position:absolute;right:-6px;top:-8px;z-index:4;background:#2e9b5b;color:#fff;font-size:11px;font-weight:800;border-radius:99px;padding:1px 8px;opacity:0;transition:opacity .3s .4s}
.ab-card.flip .new{opacity:1}
.ab-card .rar{position:absolute;left:50%;bottom:-11px;transform:translateX(-50%);z-index:4;font-size:11px;font-weight:800;border-radius:99px;padding:1px 9px;white-space:nowrap;opacity:0;transition:opacity .3s .4s;background:#fff;color:#7a6450;box-shadow:0 2px 4px #0002}
.ab-card.flip .rar{opacity:1}
.ab-card.gold .f{border-color:#f4b400;box-shadow:0 0 28px 6px #f4b400cc}
.ab-card.gold .rar{background:#f4b400;color:#3a2a1c}
.ab-card.rare .f{border-color:#3d8bfd;box-shadow:0 0 22px 4px #3d8bfd88}
.ab-card.rare .rar{background:#3d8bfd;color:#fff}
.ab-card.gold.flip .f::after{content:"";position:absolute;inset:-40%;background:conic-gradient(from 0deg,transparent 0 70%,#fff8 80%,transparent 90%);animation:abSpin 2.2s linear infinite;mix-blend-mode:screen;pointer-events:none}
.ab-ovf{position:relative;display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.ab-spark{position:fixed;width:10px;height:10px;border-radius:2px;pointer-events:none;z-index:440}
.ab-fly{position:fixed;z-index:430;pointer-events:none;border-radius:8px;background-repeat:no-repeat;box-shadow:0 10px 20px #0004;overflow:hidden}
.ab-toast{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:#3a2a1c;color:#fff;font:800 15px Nunito,system-ui,sans-serif;border-radius:14px;padding:10px 16px;z-index:450;max-width:calc(100% - 32px);text-align:center;animation:abTin .3s ease}
@keyframes abTin{from{transform:translate(-50%,20px);opacity:0}}
.ab-rw{position:fixed;inset:0;z-index:420;background:#3a2a1c88;display:grid;place-items:center;padding:16px;font-family:Nunito,system-ui,sans-serif}
.ab-rw .box{background:#fffaf0;color:#3a2a1c;border-radius:22px;padding:22px;max-width:380px;text-align:center;box-shadow:0 20px 50px #0005;animation:abPop .5s cubic-bezier(.3,1.6,.5,1)}
.ab-rw h3{margin:0 0 4px;font-family:"Baloo 2",Nunito,sans-serif;font-size:24px;color:#b92e5d}
.ab-rw .charm{width:110px;height:110px;margin:10px auto;border-radius:50%;background:#fff;border:6px solid #f4b400;box-shadow:0 0 24px #f4b400aa;display:grid;place-items:center}
.ab-rw .charm svg{width:70%;height:70%}
.bk-alb{position:relative}
.bk-alb .ab-badge{top:-10px;right:-10px;min-width:22px;height:22px;font-size:12px}
@media (max-width:620px){.ab-page{grid-template-columns:1fr}.ab-side{flex-direction:row}.ab-side>div{flex:1;min-width:0}}
@media (prefers-reduced-motion:reduce){.ab-ov *,.ab-pov *,.ab-rw *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}`;
const stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);

/* ---------- charm hoạ sĩ (mở khoá khi hoàn thành trang) ---------- */
const CHARM={
 hs_seurat:'<g>'+[[-12,-10,6],[2,-14,5],[14,-6,6],[-6,2,5],[8,6,6],[-14,12,4],[2,16,5],[16,14,4],[-2,-2,3]].map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}"/>`).join('')+'</g>',
 hs_delacroix:'<path d="M-16 22 L-16 -22 L-12 -22 L-12 22Z M-12 -20 C0 -26 8 -12 20 -18 L20 2 C8 8 0 -6 -12 0Z"/>',
 hs_cassatt:'<path d="M-6 16 C-26 2 -18 -18 -6 -8 C6 -18 14 2 -6 16Z"/><path d="M10 18 C-2 10 2 -2 10 4 C18 -2 22 10 10 18Z" opacity=".7"/>',
 hs_bruegel:'<path d="M0 -20 L14 -4 L4 -4 L4 6 C10 8 12 14 0 20 C-12 14 -10 8 -4 6 L-4 -4 L-14 -4Z"/>',
 hs_millet:'<g>'+[-10,-5,0,5,10].map((x,i)=>`<path d="M${x*.3} 22 Q${x*.6} 0 ${x} -14 Q${x+4} -20 ${x} -24 Q${x-4} -20 ${x} -14Z"/>`).join('')+'<rect x="-9" y="6" width="18" height="5" rx="2"/></g>',
 hs_monet:'<circle cx="0" cy="-4" r="9"/><path d="M-22 8 Q-16 4 -10 8 T2 8 T14 8 T24 8 L24 12 Q18 8 12 12 T0 12 T-12 12 T-22 12Z"/><path d="M-18 17 Q-12 13 -6 17 T6 17 T18 17 L18 20 Q12 16 6 20 T-6 20 T-18 20Z"/>',
 hs_hokusai:'<path d="M-22 18 C-22 -2 -10 -20 8 -20 C20 -20 24 -10 18 -4 C14 -12 4 -12 2 -4 C0 4 8 6 12 2 C10 12 -2 14 -6 6 C-10 12 -6 18 4 18Z"/>',
 hs_mucha:'<g>'+[...Array(12).keys()].map(i=>`<ellipse cx="0" cy="-16" rx="3.5" ry="6" transform="rotate(${i*30})"/>`).join('')+'<circle r="8"/></g>'
};
const CHN={hs_seurat:'Chấm màu (Seurat)',hs_delacroix:'Lá cờ (Delacroix)',hs_cassatt:'Mẹ con (Cassatt)',hs_bruegel:'Con quay (Bruegel)',hs_millet:'Bó lúa (Millet)',hs_monet:'Mặt trời mọc (Monet)',hs_hokusai:'Con sóng (Hokusai)',hs_mucha:'Vòng hoa (Mucha)'};

/* ---------- âm thanh nhỏ ---------- */
let AC=null;
function snd(type){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime;
 if(type==='rip'){const b=AC.createBuffer(1,AC.sampleRate*.35,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length)*.4;const s=AC.createBufferSource(),f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=1800;s.buffer=b;s.connect(f).connect(AC.destination);s.start();return}
 const notes={pop:[660,990],flip:[520,780],gold:[784,988,1175,1568],done:[523,659,784,1047,1319]}[type]||[600];
 notes.forEach((fq,i)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=type==='gold'||type==='done'?'triangle':'sine';o.frequency.value=fq;g.gain.setValueAtTime(.0001,t+i*.08);g.gain.exponentialRampToValueAtTime(.15,t+i*.08+.02);g.gain.exponentialRampToValueAtTime(.0001,t+i*.08+.25);o.connect(g).connect(AC.destination);o.start(t+i*.08);o.stop(t+i*.08+.3)})}catch(e){}}

/* ---------- vẽ sticker ---------- */
function artStyle(p,i){const d=AP[p];
 if(i<4){const x=i%2?100:0,y=i<2?0:100;return `background-image:url('${d.m.img}');background-size:200% 200%;background-position:${x}% ${y}%`}
 if(i===4){const z=d.s.zoom;return z?`background-image:url('${d.s.img}');background-size:${z[0]}%;background-position:${z[1]}% ${z[2]}%`:`background-image:url('${d.s.img}');background-size:cover;background-position:center`}
 return ''}
function cardHTML(p){const g=G(p),n=myNote(p);return `<div class="ab-pc"><b>${E(g.n)}</b><i>${E(g.y)} · ${E(g.c)}</i><em>${E(AP[p].k)}</em>${n?`<q>${E(n)}</q>`:''}</div>`}
function label(p,i){const d=AP[p];return i<4?`Mảnh ${i+1}/4 · ${d.m.t}`:i===4?d.s.t:'Thẻ hoạ sĩ'}
function slotHTML(p,i,cls){const f=has(p,i),r=RAR(i);
 return `<div class="ab-slot ${cls} ${r?'r-'+r:''} ${f?'on':''}" data-i="${i}" role="img" aria-label="Ô số ${no(p,i)}${f?': '+E(label(p,i)):' còn trống'}">
  ${i<5?`${i===4?`<div class="ab-ghost" style="${artStyle(p,i)}"></div>`:''}<div class="ab-art" style="${artStyle(p,i)}"></div>`:`<div class="ab-art">${cardHTML(p)}</div>`}
  <span class="ab-num">${no(p,i)}</span></div>`}

function toast(m){const t=document.createElement('div');t.className='ab-toast';t.setAttribute('role','status');t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2800)}
function burst(el,cols,n){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const b=el.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2;
 for(let i=0;i<n;i++){const s=document.createElement('div');s.className='ab-spark';s.style.background=cols[i%cols.length];s.style.left=cx+'px';s.style.top=cy+'px';document.body.appendChild(s);
  const a=Math.random()*Math.PI*2,v=60+Math.random()*(n>30?220:120);
  s.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${Math.cos(a)*v}px,${Math.sin(a)*v+60}px) rotate(${Math.random()*540}deg)`,opacity:0}],{duration:800+Math.random()*500,easing:'cubic-bezier(.2,.7,.4,1)'}).onfinish=()=>s.remove()}}

/* ---------- cửa sổ album ---------- */
let OV=null,PG=0,onClose=null;
function open(k,cb){AP.forEach((_,i)=>sync(i));S=load();PG=k|0;onClose=cb||null;if(OV)OV.remove();
 OV=document.createElement('div');OV.className='ab-ov';OV.setAttribute('role','dialog');OV.setAttribute('aria-label','Album sticker hoạ sĩ');
 OV.innerHTML=`<div class="ab-wrap"><div class="ab-top"><h2>📒 Album sticker hoạ sĩ</h2><button class="ab-btn" data-x>✕ Đóng album</button></div>
  <section class="ab-album"><div class="ab-bar"><button class="ab-ib" data-a="prev" aria-label="Trang trước">‹</button><button class="ab-ib" data-a="list" aria-label="Danh sách trang">☰</button><div class="ab-ttl"></div><span class="ab-ib" aria-hidden="true" style="visibility:hidden"></span><button class="ab-ib" data-a="next" aria-label="Trang sau">›</button></div>
   <div class="ab-page"></div><div class="ab-list" hidden></div>
   <div class="ab-foot"><button class="ab-btn pri" data-a="pack">🎁 Mở gói sticker<span class="ab-badge"></span></button><span class="ab-mini ab-tot"></span></div></section>
  <div class="ab-help"><b>Làm sao có sticker?</b><ul><li>Mỗi giàn giáo em hoàn thành ở đảo cho 1 <b>Mảnh Kiệt Tác</b> 🧩. Dán đủ 4 mảnh, bức tranh của hoạ sĩ hiện ra và <b>Sách khách mời mở các trang còn lại</b>.</li><li>Trả lời đúng hết <b>Thử thách</b> quan sát: sticker ◆ Hiếm.</li><li>Nhận thẻ ở trang <b>Thẻ & bí kíp</b>: sticker ★ Kiệt tác. Dán đủ 6 ô, em mở khoá một charm hoạ sĩ trong 🎁 Xưởng thiết kế.</li></ul></div></div>`;
 document.body.appendChild(OV);document.body.style.overflow='hidden';
 OV.addEventListener('click',e=>{const b=e.target.closest('[data-a],[data-x],[data-p]');if(!b||b.disabled)return;
  if(b.hasAttribute('data-x'))return close();
  if(b.dataset.p!=null&&b.classList.contains('ab-li')){PG=+b.dataset.p;OV.querySelector('.ab-list').hidden=true;return render(1)}
  const a=b.dataset.a;
  if(a==='prev'&&PG>0){PG--;render(1)}else if(a==='next'&&PG<AP.length-1){PG++;render(1)}
  else if(a==='list')toggleList();
  else if(a==='pack'){const p=pend(PG).length?PG:AP.findIndex((_,k)=>pend(k).length);if(p>=0)openPack(p)}});
 OV.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('.ab-pov,.ab-rw'))close()});
 addEventListener('resize',sizeFrame);render();OV.querySelector('[data-x]').focus()}
function close(){if(!OV)return;removeEventListener('resize',sizeFrame);OV.remove();OV=null;document.body.style.overflow=document.querySelector('.kmo')?'hidden':'';onClose&&onClose()}
function toggleList(){const L=OV.querySelector('.ab-list');if(!L.hidden){L.hidden=true;return}
 L.innerHTML=AP.map((d,i)=>{const c=cnt(i);return `<button class="ab-li ${c===PER?'done':''}" data-p="${i}"><div class="th ${c?'':'g'}" style="background-image:url('${d.m.img}')"></div><b>${i+1}. ${E(G(i).n)}</b><div class="bar2"><i style="width:${c/PER*100}%"></i></div><span class="ab-mini">${c}/${PER} sticker${S.packs[i]?' · 🎁 '+S.packs[i]:''}</span></button>`}).join('');L.hidden=false}
function render(anim){if(!OV)return;const p=PG,d=AP[p],c=cnt(p),g=G(p);
 OV.querySelector('.ab-ttl').textContent=`${p+1} / ${AP.length}`;
 OV.querySelector('[data-a="prev"]').disabled=p===0;OV.querySelector('[data-a="next"]').disabled=p===AP.length-1;
 const pg=OV.querySelector('.ab-page');
 pg.innerHTML=`<div class="ab-ph"><h3>${E(g.n)}</h3><small>Chủ đề ${p+1} · ${E(d.k)}</small><span class="ab-prog">${c}/${PER}</span></div>
  <div class="ab-main"><div class="ab-mf ${tilesDone(p)?'done':''}">${[0,1,2,3].map(i=>slotHTML(p,i,'')).join('')}</div><div class="ab-cap">${E(d.m.t)}</div></div>
  <div class="ab-side"><div>${slotHTML(p,4,'ab-s4')}<div class="ab-cap">${E(d.s.t)}</div></div><div>${slotHTML(p,5,'ab-s5')}<div class="ab-cap">Thẻ hoạ sĩ</div></div></div>
  ${c===PER?'<div class="ab-stamp">Hoàn thành trang!</div>':''}`;
 sizeFrame();
 if(anim){pg.classList.remove('turn');void pg.offsetWidth;pg.classList.add('turn')}
 const tp=packsAll(),pb=OV.querySelector('[data-a="pack"]');
 pb.querySelector('.ab-badge').textContent=tp;pb.querySelector('.ab-badge').hidden=!tp;pb.disabled=!tp;pb.classList.toggle('has',tp>0);
 OV.querySelector('.ab-tot').textContent=tp?`${AP.reduce((a,_,i)=>a+cnt(i),0)}/${TOTAL} sticker`:`${AP.reduce((a,_,i)=>a+cnt(i),0)}/${TOTAL} sticker · Chưa có gói nào. Em hoàn thành giàn giáo ở đảo để nhận Mảnh Kiệt Tác nhé.`}
function sizeFrame(){if(!OV)return;const mf=OV.querySelector('.ab-mf');if(!mf)return;const d=AP[PG],w=mf.parentElement.clientWidth,maxH=Math.min(400,innerHeight*.55);
 const W=Math.min(w,maxH*d.m.r);mf.style.width=W+'px';mf.style.height=(W/d.m.r)+'px'}

/* ---------- mở gói ---------- */
function openPack(p){
 const d=AP[p],got=pend(p).sort((a,b)=>a-b);
 if(!got.length){delete S.pend[p];save();render();return}
 const ov=document.createElement('div');ov.className='ab-pov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Mở gói sticker');
 ov.innerHTML=`<div class="ab-rays"></div><div class="ab-hint">Chạm vào gói để bóc!</div>
  <button class="ab-pack" style="--pk1:${d.pk[0]};--pk2:${d.pk[1]}" aria-label="Bóc gói sticker ${E(G(p).n)}">
   <div class="body"><div class="foil"></div><div class="logo"><small>Art Island</small>Sticker Hoạ sĩ</div>
    <div class="medal" style="background:#fff;display:grid;place-items:center;overflow:hidden">${window.kmHead?kmHead(KEYS[p],'86%'):''}</div>
    <div class="five">${got.length} × <i></i></div><div class="who">${E(G(p).n)}</div></div>
   <div class="crimp b"></div><div class="lid"><div class="crimp t"></div><div class="strip"></div></div>
  </button><div class="ab-cards"></div><div class="ab-ovf"></div>`;
 document.body.appendChild(ov);
 const pk=ov.querySelector('.ab-pack');pk.focus();
 pk.onclick=()=>{pk.onclick=null;pk.classList.add('shake');snd('rip');
  setTimeout(()=>{pk.classList.remove('shake');pk.classList.add('torn')},430);
  setTimeout(()=>{pk.style.transition='transform .4s, opacity .4s';pk.style.transform='translateY(140px) scale(.6)';pk.style.opacity='0'},900);
  setTimeout(()=>{pk.remove();showCards(p,got,ov)},1250)}}
function showCards(p,got,ov){
 ov.querySelector('.ab-hint').textContent='Chạm từng thẻ để lật';
 const cs=ov.querySelector('.ab-cards');
 cs.innerHTML=got.map((i,k)=>{const r=RAR(i);return `<button class="ab-card ${r}" data-i="${i}" style="animation-delay:${k*.12}s" aria-label="Lật thẻ ${k+1}">
  <div class="in"><div class="b">?</div><div class="f"><div class="pic" style="${i<5?artStyle(p,i):''}">${i===5?cardHTML(p):''}<span class="no">${no(p,i)}</span></div><div class="lab">${E(label(p,i))}</div></div></div>
  <span class="new">Mới!</span><span class="rar">${RAR_T[r]}</span></button>`}).join('');
 let left=got.length;
 const flip=c=>{if(c.classList.contains('flip'))return;c.classList.add('flip');left--;const r=RAR(+c.dataset.i);snd(r==='gold'?'gold':'flip');if(r)burst(c,r==='gold'?['#f4b400','#ffe27a','#fff']:['#3d8bfd','#9cc8ff','#fff'],r==='gold'?28:16);
  if(!left)setTimeout(()=>done(p,got,ov),600)};
 cs.querySelectorAll('.ab-card').forEach(c=>c.onclick=()=>flip(c));
 const of=ov.querySelector('.ab-ovf');of.innerHTML=`<button class="ab-btn">Lật hết</button>`;
 of.querySelector('button').onclick=()=>cs.querySelectorAll('.ab-card').forEach((c,k)=>setTimeout(()=>flip(c),k*220))}
function done(p,got,ov){
 ov.querySelector('.ab-hint').textContent=got.some(i=>RAR(i)==='gold')?'Wow, có thẻ Kiệt tác!':'Toàn sticker mới!';
 const of=ov.querySelector('.ab-ovf');of.innerHTML=`<button class="ab-btn pri">📒 Dán vào album</button>`;
 const b=of.querySelector('button');b.focus();b.onclick=()=>paste(p,got,ov)}
function paste(p,got,ov){
 const rects=got.map(i=>ov.querySelector(`.ab-card[data-i="${i}"] .f`).getBoundingClientRect());
 const wasT=tilesDone(p);delete S.pend[p];save();
 PG=p;OV.querySelector('.ab-list').hidden=true;render();
 ov.classList.add('fade');setTimeout(()=>ov.remove(),350);
 const page=OV.querySelector('.ab-page');page.scrollIntoView({block:'center',behavior:'smooth'});
 setTimeout(()=>{got.forEach((i,k)=>{
  const slot=page.querySelector(`.ab-slot[data-i="${i}"]`),to=slot.getBoundingClientRect(),fr=rects[k];
  const f=document.createElement('div');f.className='ab-fly';
  f.style.cssText=`left:${fr.left}px;top:${fr.top}px;width:${fr.width}px;height:${fr.height}px;transform-origin:0 0;`+(i<5?artStyle(p,i):'');
  if(i===5)f.innerHTML=cardHTML(p);
  document.body.appendChild(f);
  const dx=to.left-fr.left,dy=to.top-fr.top,sx=to.width/fr.width,sy=to.height/fr.height;
  const fin=()=>{f.remove();(S.have[p]=S.have[p]||{})[i]=1;save();
   slot.classList.add('on','pop','shine');slot.setAttribute('aria-label',`Ô số ${no(p,i)}: ${label(p,i)}`);snd('pop');
   burst(slot,RAR(i)==='gold'?['#f4b400','#fff']:['#e8467c','#ffd0e1','#fff'],10);
   const pr=page.querySelector('.ab-prog');if(pr)pr.textContent=`${cnt(p)}/${PER}`;
   if(k===got.length-1)setTimeout(()=>{render();if(!wasT&&tilesDone(p))reveal(p);else if(cnt(p)===PER)complete(p)},500)};
  const an=f.animate([{transform:'translate(0,0) rotate(0) scale(1)'},{transform:`translate(${dx*.5}px,${dy*.5-80}px) rotate(${k%2?10:-10}deg) scale(1.1)`,offset:.5},{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`}],{duration:700,delay:k*260,easing:'cubic-bezier(.5,0,.3,1)',fill:'forwards'});
  an.onfinish=fin;
 })},420)}
function reveal(p){const d=AP[p];snd('done');const mf=OV&&OV.querySelector('.ab-mf');if(mf)burst(mf,['#f4b400','#e8467c','#3d8bfd','#2e9b5b','#fff'],60);
 setTimeout(()=>{const r=document.createElement('div');r.className='ab-rw';
  r.innerHTML=`<div class="box" role="dialog" aria-label="Kiệt tác đã hiện ra"><h3>Kiệt tác đã hiện ra!</h3><p style="margin:0 0 8px">Em đã ghép đủ 4 mảnh bức <b>“${E(d.m.t)}”</b> của ${E(G(p).n)}.</p><p class="ab-mini" style="margin:0 0 14px">Sách khách mời đã mở: Phòng tranh, Thử thách, So sánh, Thẻ & bí kíp. Em vào ngắm tranh kĩ hơn và nhận thêm sticker nhé!</p><button class="ab-btn pri">📖 Vào phòng tranh</button></div>`;
  document.body.appendChild(r);const b=r.querySelector('button');b.focus();b.onclick=()=>{r.remove();afterReveal=p;close()}},900)}
function complete(p){const d=AP[p],ck='hs_'+KEYS[p];snd('done');
 const mf=OV&&OV.querySelector('.ab-mf');if(mf)burst(mf,['#f4b400','#e8467c','#3d8bfd','#2e9b5b','#fff'],60);
 setTimeout(()=>{const r=document.createElement('div');r.className='ab-rw';
  r.innerHTML=`<div class="box" role="dialog" aria-label="Hoàn thành trang"><h3>Hoàn thành trang ${E(short(p))}!</h3><p class="ab-mini" style="margin:0">Bức “${E(d.m.t)}” đã liền lại thành một kiệt tác.</p><div class="charm"><svg viewBox="-24 -24 48 48"><g fill="#e8467c" color="#e8467c" stroke-width="2">${CHARM[ck]}</g></svg></div><p style="margin:0 0 14px">Em mở khoá charm <b>“${E(CHN[ck])}”</b> trong 🎁 Xưởng thiết kế để trang trí đồ vật em yêu thích.</p><button class="ab-btn pri">Tuyệt quá!</button></div>`;
  document.body.appendChild(r);const b=r.querySelector('button');b.focus();b.onclick=()=>r.remove()},900)}

/* ---------- API cho Sách khách mời & Xưởng thiết kế ---------- */
let afterReveal=null;
const WHY=w=>w==='tt'?4:w==='bk'?5:/^g[0-3]$/.test(w)?+w[1]:-1;
function add(k,why){const i=WHY(why),id=k+':'+why;if(i<0||S.got[id])return -1;S.got[id]=1;if(has(k,i)){save();return -1}const a=S.pend[k]=S.pend[k]||[];if(!a.includes(i))a.push(i);save();return i}
/* bù mảnh cho giàn giáo đã xong (đọc ai_st) */
function sync(k){S=load();let st={};try{st=JSON.parse(localStorage.getItem('ai_st')||'{}')||{}}catch(e){}(st[k]||[]).forEach((x,j)=>{if(x&&j<4)add(k,'g'+j)})}
function grant(k,why){S=load();const i=add(k,why);if(i<0)return false;
 toast(i===5?`🎁 Em nhận được sticker ★ Kiệt tác của ${short(k)}! Mở ở nút 📒 Album sticker.`:`🎁 Em nhận được sticker ◆ Hiếm của ${short(k)}! Mở ở nút 📒 Album sticker.`);return true}
function grantQuiet(k,why){S=load();return add(k,why)>=0}
window.ALB={open,grant,grantQuiet,sync,tilesDone:k=>{S=load();return tilesDone(k)},takeReveal:()=>{const r=afterReveal;afterReveal=null;return r},packs:k=>{S=load();return k==null?packsAll():(pend(k).length?1:0)},charmOn:ck=>{S=load();const p=KEYS.indexOf(ck.replace('hs_',''));return p>=0&&cnt(p)===PER},CHARM,CHN};
})();
