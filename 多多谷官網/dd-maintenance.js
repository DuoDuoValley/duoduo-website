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
 // The public maintenance overlay is visual only; hidden page media can still play.
 // Guard later/autoplay/resumed media too, not only media present when show() runs.
 function isPublicMaintenanceAudioGate(){
  const root=document.documentElement;
  return root.classList.contains('dd-maintenance-checking')||root.classList.contains('dd-maintenance-on');
 }
 function pauseSiteMedia(){
  document.querySelectorAll('audio,video').forEach(el=>{
   if(el.closest('#dd-maintenance-screen'))return;
   try{if(!el.paused)el.pause()}catch(_){}
  });
 }
 document.addEventListener('play',event=>{
  if(!isPublicMaintenanceAudioGate())return;
  const el=event.target;
  if(!(el instanceof HTMLMediaElement)||el.closest('#dd-maintenance-screen'))return;
  try{el.pause()}catch(_){}
 },true);
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
 #dd-maint-admin-preview-bar{position:fixed;z-index:2147483646;top:12px;right:12px;max-width:calc(100vw - 24px);display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:9px 12px;background:rgba(12,29,43,.96);border:1px solid #77b7c3;border-radius:12px;box-shadow:0 10px 35px #0007;color:#f1fbff;font:600 12px/1.4 system-ui,"Microsoft JhengHei",sans-serif;visibility:visible!important;pointer-events:auto!important}
 #dd-maint-admin-preview-bar button,#dd-maint-admin-preview-bar a{font:inherit;color:#f1fbff;cursor:pointer;border:1px solid #477388;border-radius:7px;background:#1d4a63;padding:8px 10px;text-decoration:none;white-space:nowrap}
 #dd-maint-admin-preview-bar button:hover,#dd-maint-admin-preview-bar a:hover{background:#2b607b}
 #dd-maint-admin-preview-bar button:focus-visible,#dd-maint-admin-preview-bar a:focus-visible{outline:2px solid #fff;outline-offset:2px}
 @media(max-width:650px){#dd-maint-admin-preview-bar{left:8px;right:8px;top:8px;justify-content:center;padding:7px;gap:5px}#dd-maint-admin-preview-bar .dd-maint-preview-status{width:100%;text-align:center}#dd-maint-admin-preview-bar button,#dd-maint-admin-preview-bar a{padding:7px;font-size:11px}}
 #dd-maintenance-screen .dd-maint-hero video::-webkit-media-controls{display:none!important}
 #dd-maintenance-screen .dd-maint-hero video::-webkit-media-controls-enclosure{display:none!important}

 @media(max-width:540px){#dd-maintenance-screen{padding:12px}#dd-maintenance-screen .dd-maint-panel{padding:12px;border-radius:18px}#dd-maintenance-screen .dd-maint-hero{border-radius:12px}#dd-maintenance-screen .dd-maint-eyebrow{margin-top:16px}#dd-maintenance-screen .dd-maint-message{line-height:1.75;margin-bottom:20px}#dd-maintenance-screen .dd-maint-actions{gap:10px}#dd-maintenance-screen .dd-maint-action{min-width:172px;height:46px;padding:0 20px;font-size:14px}}
 @media(prefers-reduced-motion:reduce){#dd-maintenance-screen .dd-maint-hero video{display:none}#dd-maintenance-screen .dd-maint-hero .dd-maint-still{display:block}}
`;document.head.appendChild(css);
 // Preview is an authenticated Render-admin session, never a URL parameter.
 const PREVIEW_KEY='duoduo_maintenance_admin_preview_v1';
 const ADMIN_TOKEN_KEY='duoduo_admin_session';
 let panel=null,visible=false,working=false,lastKnown=null,previewBar=null;
 const PREVIEW_HANDSHAKE='duoduo-maint-preview-v2';
 const PREVIEW_WINDOW_PREFIX='duoduo-preview-v2:';
 let previewError='';
 function previewNonce(){
  try{
   if(window.name?.startsWith(PREVIEW_WINDOW_PREFIX))return window.name.slice(PREVIEW_WINDOW_PREFIX.length);
   const value=new URLSearchParams(location.search).get('dd_preview_request')||'';
   return /^[a-f0-9-]{36}$/i.test(value)?value:'';
  }catch(_){return ''}
 }
 function previewRequested(){
  try{return sessionStorage.getItem(PREVIEW_KEY)==='1'||!!previewNonce()}catch(_){return !!previewNonce()}
 }
 function reportPreview(action,reason=''){
  if(!canPlayMusic)return;
  const nonce=previewNonce();
  if(!nonce||!window.opener)return;
  try{window.opener.postMessage({type:PREVIEW_HANDSHAKE,action,nonce,reason},location.origin)}catch(_){}
 }
 async function recoverPreviewSession(){
  const nonce=previewNonce();
  if(!nonce||!window.opener)return false;
  return new Promise(resolve=>{
   let completed=false;
   const finish=success=>{
    if(completed)return;completed=true;window.removeEventListener('message',receive);clearTimeout(timer);resolve(success)
   };
   const receive=event=>{
    if(event.source!==window.opener||event.origin!==location.origin)return;
    const msg=event.data;
    if(!msg||msg.type!==PREVIEW_HANDSHAKE||msg.action!=='credentials'||msg.nonce!==nonce)return;
    if(typeof msg.token!=='string'||!msg.token){finish(false);return}
    try{
     sessionStorage.setItem(ADMIN_TOKEN_KEY,msg.token);
     sessionStorage.setItem(PREVIEW_KEY,'1');
     if(typeof msg.returnUrl==='string'){
      const u=new URL(msg.returnUrl);
      if(u.origin===location.origin && u.pathname.endsWith('.html'))
       sessionStorage.setItem('duoduo_maintenance_admin_return_v1',u.href)
     }
     finish(true)
    }catch(_){finish(false)}
   };
   window.addEventListener('message',receive);
   const timer=setTimeout(()=>finish(false),5000);
   try{window.opener.postMessage({type:PREVIEW_HANDSHAKE,action:'request',nonce},location.origin)}catch(_){finish(false)}
  })
 }
 async function verifyPreview(){
  previewError='';
  if(!previewRequested())return false;
  let token='';try{token=sessionStorage.getItem(ADMIN_TOKEN_KEY)||''}catch(_){}
  if(!token){
   const received=await recoverPreviewSession();
   if(received)try{token=sessionStorage.getItem(ADMIN_TOKEN_KEY)||''}catch(_){}
  }
  if(!token){previewError='管理員預覽尚未取得登入資訊；請由後台重新按「開啟管理員預覽」。';reportPreview('failed',previewError);return false}
  // Render can take several seconds to wake. A transient request failure is not
  // proof of invalid credentials; retry once, but never bypass authentication.
  for(let attempt=0;attempt<2;attempt++){
   const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),11000);
   try{
    const response=await fetch(api+'/api/admin/me',{cache:'no-store',headers:{Authorization:'Bearer '+token,Accept:'application/json'},signal:ctrl.signal});
    if(response.status===401||response.status===403){previewError='管理員登入已失效，請返回後台重新登入。';reportPreview('failed',previewError);return false}
    if(!response.ok){previewError='管理員驗證服務暫時無法使用。';continue}
    const data=await response.json();
    if(data?.ok===true)return true;
    previewError='Render 未確認管理員權限，請重新登入。';reportPreview('failed',previewError);return false;
   }catch(_){previewError='Render 連線逾時，管理員驗證未完成。'}
   finally{clearTimeout(timeout)}
  }
  reportPreview('failed',previewError);
  return false;
 }
 function endPreview(){
  document.documentElement.removeAttribute('data-dd-maintenance-admin-preview');
  if(previewBar){previewBar.remove();previewBar=null}
 }
 function startPreview(){
  hide();
  document.documentElement.setAttribute('data-dd-maintenance-admin-preview','1');
  reportPreview('verified');
  // Drop the non-secret intent marker after verification, without navigating.
  if(canPlayMusic){try{const u=new URL(location.href);if(u.searchParams.has('dd_preview_request')){u.searchParams.delete('dd_preview_request');history.replaceState(history.state,'',u.pathname+u.search+u.hash)}}catch(_){}}
  if(!canPlayMusic||previewBar)return;
  previewBar=document.createElement('aside');previewBar.id='dd-maint-admin-preview-bar';
  previewBar.setAttribute('aria-label','管理員網站預覽工具列');
  const label=document.createElement('span');label.className='dd-maint-preview-status';label.textContent='🔒 管理員預覽｜官網維護中';
  const manual=document.createElement('button');manual.type='button';manual.textContent='↻ 重新載入預覽';
  manual.title='只有按下此按鈕，才重新讀取已部署的網站與最新後台資料';
  manual.addEventListener('click',()=>location.reload());
  let returnUrl=null;
  try{
   const raw=sessionStorage.getItem('duoduo_maintenance_admin_return_v1');
   const parsed=raw?new URL(raw):null;
   if(parsed&&parsed.origin===base.origin&&parsed.pathname.startsWith(base.pathname)&&parsed.pathname.endsWith('.html'))returnUrl=parsed.href;
  }catch(_){}
  const admin=returnUrl?document.createElement('a'):null;
  if(admin){admin.href=returnUrl;admin.textContent='返回管理後台'}
  const exit=document.createElement('button');exit.type='button';exit.textContent='退出預覽';
  exit.addEventListener('click',()=>{
   try{sessionStorage.removeItem(PREVIEW_KEY)}catch(_){}
   endPreview();location.reload();
  });
  previewBar.append(label,manual);if(admin)previewBar.append(admin);previewBar.append(exit);
  document.documentElement.appendChild(previewBar);
 }

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
   pauseSiteMedia(); // A tap on the maintenance music must never restart the site's player.
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
  // Let the main BGM shell freeze its exact song/second/pause state before we pause it.
  // The dedicated maintenance song never participates in that snapshot.
  if(canPlayMusic)document.dispatchEvent(new Event('dd-maintenance-audio-blocked'));
  // Keep the provided muted branding video playing while pausing the actual site's BGM/media.
  try{pauseSiteMedia()}catch{}
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){const vid=panel.querySelector('video');vid?.play().catch(()=>panel.classList.add('dd-maint-video-failed'))}
  if(canPlayMusic)void startMusic();
 }
 function hide(){
  if(panel){const music=panel.querySelector('#dd-maint-audio');if(music&&!music.paused)music.pause();panel.classList.remove('dd-maint-audio-blocked')}
  musicAttempted=false;
  const hadGate=isPublicMaintenanceAudioGate();
  document.documentElement.classList.remove('dd-maintenance-checking','dd-maintenance-on');visible=false;
  // If the site BGM finished cloud loading while the gate was active, it may
  // resume only once maintenance is definitively off or admin preview verified.
  if(hadGate)document.dispatchEvent(new Event('dd-maintenance-audio-unblocked'));
 }
 async function check(manual=false){if(working)return;working=true;
   if(manual&&panel)panel.querySelector('#dd-maint-note').textContent='正在檢查最新狀態…';
   const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),6000);
   try{const res=await fetch(api+'/api/maintenance?check='+Date.now(),{cache:'no-store',signal:ctrl.signal});if(!res.ok)throw Error('HTTP '+res.status);
     const result=await res.json();if(result.ok!==true||typeof result.enabled!=='boolean')throw Error('maintenance status unavailable');
     lastKnown=result;
     if(result.enabled){
       if(await verifyPreview())startPreview();
       else {
         endPreview();show(result);
         if(panel)panel.querySelector('#dd-maint-note').textContent=previewError || '網站恢復開放後，本頁將自動重新載入。';
       }
     }
     else if(visible){endPreview();try{sessionStorage.removeItem(PREVIEW_KEY)}catch(_){}location.reload()}
     else {endPreview();try{sessionStorage.removeItem(PREVIEW_KEY)}catch(_){}hide()}
   }catch(e){if(visible){if(panel)panel.querySelector('#dd-maint-note').textContent='暫時無法取得伺服器狀態，請稍後再試。';}
     else hide(); /* Fail open if Render is asleep/offline. Static hosting cannot deny requests. */
   }finally{clearTimeout(timer);working=false}
 }
 // Checks begin immediately, before page body renders; later checks monitor an open tab.
 check();setInterval(()=>{if(document.visibilityState==='visible')check()},30000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
})();
