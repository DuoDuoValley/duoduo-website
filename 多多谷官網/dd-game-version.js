/* DuoDuo current GAME version (not GitHub deployment revision or V282 WZ references).
 * Admin source of truth: duoduo_settings.gameVersion in the published site-data API.
 * Never reveal a compiled-in V282 while the current cloud value is unresolved.
 */
(()=>{'use strict';
 const READY='dd-game-version-ready';
 const d=document;
 const hide=d.createElement('style');
 hide.id='dd-game-version-paint-guard';
 hide.textContent=`html:not(.${READY}) [data-dd-game-version],html:not(.${READY}) #download-grid{visibility:hidden!important}html:not(.${READY}) [data-dd-game-version="status"]{visibility:visible!important}html:not(.${READY}) a[data-link="launcher"],html:not(.${READY}) a[data-link="pack"]{pointer-events:none!important;opacity:.55}.header-status[hidden]{display:none!important}`;
 d.head.appendChild(hide);
 const DEFAULT={number:'282',phase:'active',showBadge:true};
 const PHASES={active:'持續更新',official:'正式開放',preparing:'即將更新',maintenance:'版本維護中',custom:'自訂文字'};
 const endpoint=(location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'')+'/api/site-data';
 let current=null,loaded=false,serverError=null;
 let cloudData=null;
 function hydratePublishedDownloads(){
  const grid=d.getElementById('download-grid');
  if(!grid)return;
  const downloads=cloudData?.duoduo_downloads;
  if(Array.isArray(downloads)&&typeof window.DuoDuoApplyDownloads==='function'){
   window.DuoDuoApplyDownloads(downloads);
  }else if(!cloudData){
   grid.innerHTML='<div class="empty">目前無法確認最新下載資訊，請稍後重新整理或至官方 Discord 查詢。</div>';
  }else if(!Array.isArray(downloads)){
   grid.innerHTML='<div class="empty">雲端尚未提供正式下載清單，請留意官方公告。</div>';
  }
 }
 function hydratePublishedLinks(){
  if(!cloudData){
   // A stale launcher/pack URL must not masquerade as verified while offline.
   for(const el of d.querySelectorAll('a[data-link="launcher"],a[data-link="pack"]')){
    el.removeAttribute('href');el.setAttribute('aria-disabled','true');el.title='最新下載網址暫不可確認';
   }
   return;
  }
  const stored=cloudData.duoduo_links;
  const map={'Discord':'discord','儲值入口':'topup','遊玩指南':'guide','機率型道具說明':'rates','上架商品':'products','每日 Checklist':'checklist','登入器下載':'launcher','整合包下載':'pack'};
  const updated={};
  if(stored&&typeof stored==='object'&&!Array.isArray(stored)){
   for(const [label,key] of Object.entries(map)){
    const url=typeof stored[key]==='string'?stored[key]:stored[label];
    if(url&&/^https:\/\//i.test(url))updated[key]=url;
   }
  }
  const dl=cloudData.duoduo_downloads;
  if(Array.isArray(dl))for(const key of ['launcher','pack']){
   if(updated[key])continue;
   const entry=dl.find(item=>item?.id===key);
   if(typeof entry?.url==='string'&&/^https:\/\//i.test(entry.url))updated[key]=entry.url;
  }
  for(const [key,url] of Object.entries(updated)){
   d.querySelectorAll(`[data-link="${key}"]`).forEach(el=>{el.href=url;el.removeAttribute('aria-disabled');el.removeAttribute('title')});
  }
  // Download links without an authoritative cloud URL must stay unavailable.
  for(const key of ['launcher','pack'])if(!updated[key]){
   d.querySelectorAll(`[data-link="${key}"]`).forEach(el=>{el.removeAttribute('href');el.setAttribute('aria-disabled','true');el.title='最新下載網址暫不可確認'});
  }
 }
 const normalize=value=>{
  if(!value||typeof value!=='object')return {...DEFAULT};
  const number=String(value.number??'').trim();
  return {
   number:/^\d{2,4}(?:\.\d{1,2})?$/.test(number)?number:DEFAULT.number,
   phase:Object.prototype.hasOwnProperty.call(PHASES,value.phase)?value.phase:'active',
   customText:typeof value.customText==='string'?value.customText.replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,' ').replace(/\s+/g,' ').trim().slice(0,24):'',
   showBadge:value.showBadge!==false
  };
 };
 function apply(version){
  hydratePublishedDownloads();
  hydratePublishedLinks();
  const ver=version?'V'+version.number:'';
  const message=version?(version.phase==='custom'?(version.customText||'版本狀態未設定'):PHASES[version.phase]):'';
  const nodes=d.querySelectorAll('[data-dd-game-version]');
  for(const node of nodes){
   const type=node.dataset.ddGameVersion;
   if(type==='status'){
    const host=node.closest('.header-status');
    if(host)host.hidden=!!version&&!version.showBadge;
    node.textContent=version?`${ver} ${message}`:'遊戲版本暫不可用';
   }else if(type==='hero'){
    // Preserve custom Hero copy, updating only its *current-version* token.
    const raw=node.dataset.ddVersionHeroOriginal||node.textContent;
    if(!node.dataset.ddVersionHeroOriginal)node.dataset.ddVersionHeroOriginal=raw;
    node.textContent=version
      ?(/\{GAME_VERSION\}|\bV\d{2,4}(?:\.\d{1,2})?\b/.test(raw)
        ?raw.replace(/\{GAME_VERSION\}|\bV\d{2,4}(?:\.\d{1,2})?\b/g,ver):raw)
      :'DUODUO VALLEY · OFFICIAL';
   }else if(type==='caption'){
    node.textContent=version?`${ver} · ${version.phase==='active'?'版本持續更新中':message}`:'版本資訊載入中';
   }else if(type==='timeline'){
    node.textContent=version?ver:'—';
   }else if(type==='timeline-phase'){
    // Same authoritative status string as the header badge and the admin preview.
    node.textContent=version?message:'版本狀態暫不可用';
   }else if(type==='timeline-label'){
    node.textContent=version?.phase==='preparing'?'預計版本':'目前版本';
   }
  }
  d.documentElement.classList.add(READY);
  window.DuoDuoGameVersion={current:version?{...version}:null,loaded:true,error:serverError};
 }
 let domReady=d.readyState!=='loading';
 function renderIfReady(){if(domReady&&loaded)apply(current)}
 window.DuoDuoGameVersionRender=renderIfReady;
 d.addEventListener('DOMContentLoaded',()=>{domReady=true;renderIfReady()},{once:true});
 // Only a confirmed published value can become visible. Existing tabs (including
 // the standalone Jobs/Legion pages) recheck periodically without forced reload.
 let busy=false,visibilityTimer=null;
 async function checkCloud(){
  if(busy||document.visibilityState==='hidden')return;
  busy=true;
  try{
   const res=await fetch(endpoint,{cache:'no-store',headers:{Accept:'application/json'}});
   if(!res.ok)throw Error('HTTP '+res.status);
   const data=await res.json();
   if(data?.ok!==true)throw Error('site-data not confirmed');
   let nextVersion=null,nextData=null;
   if(data.initialized===false){nextVersion={...DEFAULT};nextData={duoduo_downloads:[]};}
   else if(data.initialized===true&&data.data&&typeof data.data==='object'){
    nextVersion=normalize(data.data.duoduo_settings?.gameVersion);
    nextData=data.data;
   }else throw Error('incomplete site-data');
   const changed=!current||JSON.stringify(nextVersion)!==JSON.stringify(current);
   current=nextVersion;cloudData=nextData;serverError=null;loaded=true;
   if(changed||document.getElementById('download-grid')||!d.documentElement.classList.contains(READY))renderIfReady();
  }catch(err){
   serverError=String(err?.message||err);
   if(!loaded){current=null;cloudData=null;loaded=true;renderIfReady();}
   else if(window.DuoDuoGameVersion)window.DuoDuoGameVersion.error=serverError;
  }finally{busy=false;}
 }
 window.DuoDuoGameVersionCheck=checkCloud;
 checkCloud();
 setInterval(checkCloud,60000);
 document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){if(visibilityTimer!==null)clearTimeout(visibilityTimer);return;}
  if(visibilityTimer!==null)clearTimeout(visibilityTimer);
  visibilityTimer=setTimeout(()=>{visibilityTimer=null;checkCloud()},2000);
 });
 window.addEventListener('online',()=>{if(document.visibilityState!=='hidden')checkCloud()});
 // Render a neutral label while a cold-started API takes longer than expected.
 setTimeout(()=>{if(!loaded){serverError='cloud version still loading';loaded=true;current=null;renderIfReady()}},12000);
})();
