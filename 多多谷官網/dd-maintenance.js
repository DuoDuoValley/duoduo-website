/* DuoDuo public maintenance screen. This is a visual gate for static GitHub Pages,
   not security/access control. Server-side publishing must use authenticated APIs. */
(()=>{'use strict';
 // The official Checklist embeds the existing BGM-only player from this site.
 // This narrow exception must run BEFORE the maintenance checking class is set,
 // otherwise the iframe would be hidden even though it should keep playing.
 // A URL query alone is insufficient: it must be an iframe hosted directly by
 // the official same-origin Checklist project, not a direct visit to the site.
 function isOfficialChecklistPlayer(){
  try{
   if(new URLSearchParams(location.search).get('bgm_embed')!=='checklist')return false;
   if(window.self===window.top||window.parent!==window.top)return false;
   if(window.parent.location.origin!==location.origin)return false;
   const path=window.parent.location.pathname.replace(/\/+$/,'');
   return path==='/duoduo-checklist'||path.startsWith('/duoduo-checklist/');
  }catch(_){return false;}
 }
 if(isOfficialChecklistPlayer()){
  document.documentElement.setAttribute('data-dd-maintenance-checklist-bgm','1');
  return; // No maintenance overlay/pause/reload; BGM keeps its own 60s cloud sync.
 }
 if(document.documentElement.hasAttribute('data-dd-maintenance-guard'))return;
 document.documentElement.setAttribute('data-dd-maintenance-guard','1');
 document.documentElement.classList.add('dd-maintenance-checking');
 const own=document.currentScript;
 const base=own?.src?new URL('./',own.src):new URL('./',location.href);
 const api=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
 const MAINT_MUSIC_NAME='Kerning Square Field';
 const MAINT_MUSIC_URL=new URL('assets/maintenance-bgm.mp3?v=4',base).href;
 // A nested site iframe can also check maintenance; only the top-level page may play audio.
 const canPlayMusic=window.self===window.top;
 const MAINT_DEFAULT_TITLE='多多谷官方網站維護中';
 const MAINT_DEFAULT_MESSAGE='親愛的多多谷玩家您好：\n\n為提供更穩定、完善的網站服務，多多谷官方網站目前正在進行系統維護與功能調整，相關頁面將暫時停止開放。\n\n維護完成後，網站將恢復正常使用。造成不便，敬請見諒，感謝您的耐心等候與支持。\n\n最新維護進度及相關消息，請留意多多谷官方 Discord 公告。';
 const css=document.createElement('style');css.id='dd-maintenance-style';css.textContent=`
 html.dd-maintenance-checking body,html.dd-maintenance-on body{visibility:hidden!important;pointer-events:none!important}
 html.dd-maintenance-on{overflow:hidden!important}
 #dd-maintenance-screen{position:fixed;z-index:2147483647;inset:0;overflow:auto;box-sizing:border-box;display:none;align-items:safe center;justify-content:center;padding:28px 16px;background:radial-gradient(circle at 80% 10%,#1d4352 0,transparent 45%),linear-gradient(130deg,#081a2c,#0e3140);color:#eaf6ff;font-family:"Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif;visibility:visible!important;pointer-events:auto!important}
 html.dd-maintenance-on #dd-maintenance-screen{display:flex}
 #dd-maintenance-screen .dd-maint-panel{text-align:center;max-width:760px;width:100%;box-sizing:border-box;padding:clamp(18px,3vw,29px);border:1px solid rgba(155,223,235,.34);border-radius:24px;background:rgba(9,29,44,.92);box-shadow:0 30px 100px #0007}
 #dd-maintenance-screen .dd-maint-hero{position:relative;overflow:hidden;aspect-ratio:16/9;border-radius:15px;background:linear-gradient(130deg,#17485f,#276b84)}
 #dd-maintenance-screen .dd-maint-hero video,#dd-maintenance-screen .dd-maint-hero .dd-maint-still{display:block;width:100%;height:100%;object-fit:cover}
 #dd-maintenance-screen .dd-maint-hero .dd-maint-still{display:none}
 #dd-maintenance-screen.dd-maint-video-failed .dd-maint-hero video{display:none}
 #dd-maintenance-screen.dd-maint-video-failed .dd-maint-hero .dd-maint-still{display:block}
 #dd-maintenance-screen .dd-maint-eyebrow{margin:22px auto 0;letter-spacing:.18em;font-size:11px;font-weight:800;color:#80d7e7}
 #dd-maintenance-screen h1{font-size:clamp(25px,4.5vw,37px);line-height:1.35;letter-spacing:.025em;color:#f2fdff;margin:11px auto 13px}
 #dd-maintenance-screen .dd-maint-message{max-width:635px;line-height:1.85;font-size:clamp(13px,1.9vw,15px);white-space:pre-line;overflow-wrap:anywhere;color:#cfdeeb;margin:0 auto 23px;text-align:left}
 #dd-maintenance-screen .dd-maint-actions{display:flex;justify-content:center;align-items:center;gap:12px;flex-wrap:wrap;margin-top:6px}
 #dd-maintenance-screen .dd-maint-action{min-width:204px;display:inline-flex;align-items:center;justify-content:center;height:48px;border:1px solid #83cadc;background:#153c52;color:#efffff;border-radius:999px;padding:0 24px;font:inherit;font-size:15px;font-weight:750;line-height:1;cursor:pointer;white-space:nowrap;box-sizing:border-box}
 #dd-maintenance-screen .dd-maint-action:hover{background:#245772}
 #dd-maintenance-screen .dd-maint-action:focus-visible{outline:2px solid #d5f5ff;outline-offset:3px}
 #dd-maintenance-screen .dd-maint-note{color:#95b5ca;font-size:12px;margin-top:13px;line-height:1.6}
 /* Audio has no visible player. Show a same-style action button only if the browser blocks autoplay. */
 #dd-maintenance-screen #dd-maint-audio-unlock{display:none}
 #dd-maintenance-screen.dd-maint-audio-blocked #dd-maint-audio-unlock{display:inline-flex}
 #dd-maintenance-screen .dd-maint-hero video::-webkit-media-controls{display:none!important}
 #dd-maintenance-screen .dd-maint-hero video::-webkit-media-controls-enclosure{display:none!important}

 @media(max-width:540px){#dd-maintenance-screen{padding:12px}#dd-maintenance-screen .dd-maint-panel{padding:12px;border-radius:18px}#dd-maintenance-screen .dd-maint-hero{border-radius:12px}#dd-maintenance-screen .dd-maint-eyebrow{margin-top:16px}#dd-maintenance-screen .dd-maint-message{line-height:1.75;margin-bottom:20px}#dd-maintenance-screen .dd-maint-actions{gap:10px}#dd-maintenance-screen .dd-maint-action{min-width:172px;height:46px;padding:0 20px;font-size:14px}}
 @media(prefers-reduced-motion:reduce){#dd-maintenance-screen .dd-maint-hero video{display:none}#dd-maintenance-screen .dd-maint-hero .dd-maint-still{display:block}}
`;document.head.appendChild(css);
 let panel=null,visible=false,working=false,lastKnown=null;
 function make(){
  if(panel)return panel;
  panel=document.createElement('div');panel.id='dd-maintenance-screen';panel.setAttribute('role','main');
  const videoUrl=new URL('assets/maintenance-logo.mp4',base).href;
  const posterUrl=new URL('assets/maintenance-poster.webp',base).href;
  panel.innerHTML=`<div class="dd-maint-panel"><div class="dd-maint-hero" aria-label="多多谷官方 LOGO 動態主視覺">
    <video muted autoplay loop playsinline preload="metadata" poster="${posterUrl}" aria-hidden="true" disablepictureinpicture disableremoteplayback controlslist="nodownload noplaybackrate noremoteplayback nofullscreen"><source src="${videoUrl}" type="video/mp4"></video>
    <img class="dd-maint-still" src="${posterUrl}" alt="多多谷 DUODUO VALLEY 官方 LOGO">
  </div><div class="dd-maint-eyebrow">DUODUO VALLEY · MAINTENANCE NOTICE</div>
  <h1 id="dd-maint-title">多多谷官方網站維護中</h1><p class="dd-maint-message" id="dd-maint-message"></p>
  <audio id="dd-maint-audio" preload="auto" loop src="${MAINT_MUSIC_URL}" aria-hidden="true"></audio>
  <div class="dd-maint-actions"><button class="dd-maint-action" id="dd-maint-audio-unlock" type="button" aria-label="啟用維護背景音樂">♫ 點擊啟用背景音樂</button>
  <button class="dd-maint-action" id="dd-maint-check" type="button">重新檢查維護狀態</button></div><div class="dd-maint-note" id="dd-maint-note">網站恢復開放後，本頁將自動重新載入。</div></div>`;
  document.documentElement.appendChild(panel);
  const vid=panel.querySelector('video');
  vid.addEventListener('error',()=>panel.classList.add('dd-maint-video-failed'));
  panel.querySelector('source')?.addEventListener('error',()=>panel.classList.add('dd-maint-video-failed'));
  const music=panel.querySelector('#dd-maint-audio');
  music.volume=0.55; // Maintain a comfortable background level without affecting site BGM settings.
  music.addEventListener('playing',()=>panel.classList.remove('dd-maint-audio-blocked'));
  music.addEventListener('error',()=>{if(canPlayMusic&&visible)panel.classList.add('dd-maint-audio-blocked')});
  panel.querySelector('#dd-maint-audio-unlock').addEventListener('click',()=>startMusic(true));
  panel.querySelector('#dd-maint-check').addEventListener('click',()=>check(true));return panel;
 }
 let musicAttempted=false;
 async function startMusic(fromGesture=false){
  if(!visible||!canPlayMusic||!panel)return;
  const music=panel.querySelector('#dd-maint-audio');
  if(!music||!music.paused)return;
  if(musicAttempted&&!fromGesture)return; // 30s status checks must never restart the track.
  musicAttempted=true;
  try{
   await music.play();
   panel.classList.remove('dd-maint-audio-blocked');
  }catch(_){
   // Unmuted autoplay is often blocked by the browser. A direct click is the fallback.
   if(visible)panel.classList.add('dd-maint-audio-blocked');
  }
 }
 function show(data){
  if(!document.body){document.addEventListener('DOMContentLoaded',()=>show(data),{once:true});return;}
  make();
  panel.querySelector('#dd-maint-title').textContent=String(data.title||MAINT_DEFAULT_TITLE);
  panel.querySelector('#dd-maint-message').textContent=String(data.message||MAINT_DEFAULT_MESSAGE);
  document.documentElement.classList.remove('dd-maintenance-checking');document.documentElement.classList.add('dd-maintenance-on');visible=true;
  // Keep the provided muted branding video playing while pausing the actual site's BGM/media.
  try{document.querySelectorAll('audio,video').forEach(el=>{if(!el.closest('#dd-maintenance-screen'))el.pause()})}catch{}
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){const vid=panel.querySelector('video');vid?.play().catch(()=>panel.classList.add('dd-maint-video-failed'))}
  if(canPlayMusic)void startMusic();
 }
 function hide(){
  if(panel){const music=panel.querySelector('#dd-maint-audio');if(music&&!music.paused)music.pause();panel.classList.remove('dd-maint-audio-blocked')}
  musicAttempted=false;
  document.documentElement.classList.remove('dd-maintenance-checking','dd-maintenance-on');visible=false;
 }
 async function check(manual=false){if(working)return;working=true;
   if(manual&&panel)panel.querySelector('#dd-maint-note').textContent='正在檢查最新狀態…';
   const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),6000);
   try{const res=await fetch(api+'/api/maintenance?check='+Date.now(),{cache:'no-store',signal:ctrl.signal});if(!res.ok)throw Error('HTTP '+res.status);
     const result=await res.json();if(result.ok!==true||typeof result.enabled!=='boolean')throw Error('maintenance status unavailable');
     lastKnown=result;
     if(result.enabled){show(result);if(panel)panel.querySelector('#dd-maint-note').textContent='網站恢復開放後，本頁將自動重新載入。'}
     else if(visible){location.reload()}
     else hide();
   }catch(e){if(visible){if(panel)panel.querySelector('#dd-maint-note').textContent='暫時無法取得伺服器狀態，請稍後再試。';}
     else hide(); /* Fail open if Render is asleep/offline. Static hosting cannot deny requests. */
   }finally{clearTimeout(timer);working=false}
 }
 // Checks begin immediately, before page body renders; later checks monitor an open tab.
 check();setInterval(()=>{if(document.visibilityState==='visible')check()},30000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
})();
