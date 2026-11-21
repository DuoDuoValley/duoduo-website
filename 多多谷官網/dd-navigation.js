/* V9 integrated navigation: native links, optional deep targets, and shared dropdown.
 * No dependencies; leaves site theme, footer, player, and route code untouched. */
(()=>{'use strict';
// Standalone public pages count only once; embedded inner pages are skipped.
if(window.top===window&&!document.querySelector('#duoduo-admin-auth')){
 const script=document.createElement('script');
 script.src=new URL('dd-traffic-client.js?v=20261108-v1',document.currentScript?.src||location.href).href;
 script.defer=true;document.head.appendChild(script);
}
const header=document.querySelector('header.site-header');
const nav=header?.querySelector('nav.dd-main-nav');
if(!nav||!header)return;
/* V20: Reuse HOME's original logo behavior for standalone pages.
   HOME V18/V19 still owns its own logo; do not double-initialize it. */
(function connectHomeBrandEffect(){
 const brand=header.querySelector(':scope > a.brand');
 if(!brand||!brand.querySelector('img'))return;
 if(location.pathname.endsWith('/home.html'))return;
 if(brand.classList.contains('dd-shared-brand'))return;
 brand.classList.add('dd-shared-brand');
 function pulse(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  brand.classList.remove('dd-shared-brand-click');
  void brand.offsetWidth;
  brand.classList.add('dd-shared-brand-click');
 }
 brand.addEventListener('pointerdown',e=>{if(e.button===0)pulse()});
 brand.addEventListener('click',e=>{if(e.detail===0)pulse()});
 brand.addEventListener('animationend',e=>{
  if(e.animationName==='dd-shared-logo-tap'||e.animationName==='dd-shared-logo-ring')
   brand.classList.remove('dd-shared-brand-click');
 });
})();

const inTools=location.pathname.includes('/player-tools/');
const inJobs=location.pathname.includes('/jobs/');
const inLegion=location.pathname.includes('/legion-preview-6c82f4a9/');
const inItempedia=location.pathname.endsWith('/item-encyclopedia.html');
const inBossGuides=/\/boss-guides(?:-private)?\.html$/.test(location.pathname);
const prefix=(inTools||inJobs||inLegion)?'../':'';
const defaultGroups=window.DuoDuoNavDefaults||[];
// Each standalone page uses the same published game-version status as HOME.
// Replace the V282 literal before adding the shared reader. Do not modify
// unrelated WZ / launcher version numbers or the administrator preview.
(function connectPublishedGameVersion(){
 const status=header.querySelector('.header-status');
 const label=status&&[...status.children].find(node=>node.tagName==='SPAN'&&!node.classList.contains('status-dot'));
 if(!label)return;
 label.dataset.ddGameVersion='status';
 label.setAttribute('aria-live','polite');
 if(!document.documentElement.classList.contains('dd-game-version-ready'))label.textContent='版本載入中';
 // HOME already includes the shared reader as a deferred head script.
 if(document.querySelector('script[src*="dd-game-version.js"]')){
  if(window.DuoDuoGameVersionRender)window.DuoDuoGameVersionRender();
  return;
 }
 const script=document.createElement('script');
 script.src=new URL('dd-game-version.js?v=20261106-global-version-1',document.currentScript?.src||document.baseURI).href;
 script.async=true;
 document.head.appendChild(script);
})();
// Old published nav data may retain the previous default title. Upgrade only this exact link and label.
const currentJobsLabel=item=>{
 const label=String(item.label||'').trim();
 if(label!=='職業圖鑑')return label;
 try{const u=new URL(item.href,new URL(prefix,document.baseURI));
  if(u.pathname.endsWith('/jobs/jobs.html'))return '角色卡與傳授技能';
 }catch(_){}
 return label;
};
const cleanHref=value=>{
 const raw=String(value||'').trim();
 if(!raw||raw.length>700||/[\\\x00-\x1f]/.test(raw))return null;
 try{const url=new URL(raw,new URL(prefix,document.baseURI));
  if(!['https:','http:'].includes(url.protocol))return null;
  return url.href;
 }catch{return null}
};
function readNavSettings(){
 for(const name of ['sessionStorage','localStorage']){
  try{const storage=window[name];const raw=storage.getItem(name==='sessionStorage'?'duoduo_cloud_duoduo_settings':'duoduo_settings');
   if(raw){const cfg=JSON.parse(raw);if(cfg&&typeof cfg==='object')return cfg;}}
  catch(_){/* continue */}
 }return {};
}
let groups=defaultGroups.map(g=>({...g,items:g.items.map((item,i)=>({id:g.key+'-'+i,label:item[0],href:item[1],enabled:true}))}));
let siteNavConfig={};
// Keep both animated faces synchronized with labels supplied by published settings.
// The second face is visual only; the first face retains the accessible text.
function setMainNavLabel(linkOrLabel, value){
 const host=linkOrLabel?.matches?.('a[data-dd-nav]') ? linkOrLabel : linkOrLabel?.closest?.('a[data-dd-nav]');
 if(host){
  const labels=host.querySelectorAll('.dd-nav-roll-label,.dd-nav-label');
  if(labels.length){labels.forEach(node=>{node.textContent=value});return;}
 }
 if(linkOrLabel)linkOrLabel.textContent=value;
}
function buildRollItem(icon, value, hidden){
 const item=document.createElement('span');item.className='dd-nav-roll-item';
 if(hidden)item.setAttribute('aria-hidden','true');
 if(icon){
  const iconClone=icon.cloneNode(true);
  iconClone.classList.add('dd-nav-roll-icon');
  if(hidden)iconClone.setAttribute('aria-hidden','true');
  item.appendChild(iconClone);
 }
 const label=document.createElement('span');label.className='dd-nav-label dd-nav-roll-label';
 label.textContent=value;
 if(hidden)label.setAttribute('aria-hidden','true');
 item.appendChild(label);
 return item;
}
function prepareMainNavRoll(){
 if(getComputedStyle(nav).getPropertyValue('--dd-nav-roll-enabled').trim()!=='1')return;
 for(const link of nav.querySelectorAll('a[data-dd-nav]')){
  if(link.querySelector('.dd-nav-roll-viewport'))continue;
  const icon=link.querySelector('.dd-nav-icon');
  const label=link.querySelector('.dd-nav-label');
  const value=label?.textContent.trim()||link.textContent.trim();
  if(!value)continue;
  const viewport=document.createElement('span');viewport.className='dd-nav-roll-viewport';
  const track=document.createElement('span');track.className='dd-nav-roll-track';
  track.append(buildRollItem(icon,value,false),buildRollItem(icon,value,true));
  viewport.appendChild(track);
  link.replaceChildren(viewport);
 }
}
function applyNavSettings(cfg){
 siteNavConfig=cfg&&typeof cfg==='object'?cfg:{};
 const saved=siteNavConfig.navDropdown||{};
 const sections=saved.groups||{};
 const order=['news','events','boss','guide','downloads','player-tools'];
 const customOrder=Array.isArray(siteNavConfig.navOrder)?siteNavConfig.navOrder.filter(x=>order.includes(x)):[];
 const sorted=[...new Set([...customOrder,...order])];
 groups=defaultGroups.map(g=>{
  const section=sections[g.key]||{};
  const storedItems=Array.isArray(section.items)?section.items:g.items.map((x,i)=>({id:g.key+'-'+i,label:x[0],href:x[1],enabled:true}));
  const items=g.key==='news'&&Array.isArray(section.items)?window.DuoDuoNavEnsureNewsPunishment(window.DuoDuoNavEnsureNewsSerial(storedItems,saved.newsSerialAdded)):g.key==='boss'&&Array.isArray(section.items)?window.DuoDuoNavEnsureBossGuides(storedItems):g.key==='guide'&&Array.isArray(section.items)?window.DuoDuoNavEnsureItempedia(window.DuoDuoNavEnsureLegion(window.DuoDuoNavEnsureGuideChecklist(storedItems,saved.guideChecklistAdded))):g.key==='downloads'?(window.DuoDuoNavNormalizeDownloadTargets?.(storedItems)||storedItems):storedItems;
  return {...g,items:items.filter(x=>x&&x.enabled!==false&&cleanHref(x.href))
   .slice(0,20).map(x=>({id:String(x.id||''),label:currentJobsLabel(x).slice(0,50),href:String(x.href)}))};
 }).sort((a,b)=>sorted.indexOf(a.key)-sorted.indexOf(b.key));
 const navLabels=siteNavConfig.nav||{};
 for(const a of nav.querySelectorAll('[data-dd-nav]')){
  const key=a.dataset.ddNav;
  const lookup=key==='player-tools'?'playerTools':key;
  const label=navLabels[lookup];
  if(typeof label==='string'&&label.trim())setMainNavLabel(a,label.trim().slice(0,22));
 }
 const navLinks=[...nav.querySelectorAll('a[data-dd-nav]')];
 const sortedNav=['home',...groups.map(g=>g.key)];
 navLinks.sort((a,b)=>sortedNav.indexOf(a.dataset.ddNav)-sortedNav.indexOf(b.dataset.ddNav))
  .forEach(a=>nav.appendChild(a));
 const columns=menu?.querySelectorAll('.dd-nav-col');
 if(columns){columns.forEach(x=>x.remove());renderColumns()}
}
function renderColumns(){
 for(const group of groups){
  const col=document.createElement('div');col.className='dd-nav-col';col.dataset.ddGroup=group.key;
  const heading=document.createElement('span');heading.className='dd-nav-heading';
  const labelKey=group.key==='player-tools'?'playerTools':group.key;
  heading.textContent=siteNavConfig?.nav?.[labelKey]||group.name;col.appendChild(heading);
  for(const item of group.items){
   const a=document.createElement('a');a.href=cleanHref(item.href)||'#';a.textContent=item.label;col.appendChild(a);
  }
  rail.appendChild(col);
 }
}

let closeTimer=0;
const menu=document.createElement('div'); menu.id='dd-nav-menu';menu.className='dd-nav-menu';menu.hidden=true;
const rail=document.createElement('div');rail.className='dd-nav-rail';menu.appendChild(rail);
const base=document.createElement('span');base.setAttribute('aria-hidden','true');base.className='dd-nav-placeholder';rail.appendChild(base);
renderColumns();
header.appendChild(menu);header.classList.add('dd-nav-ready');
prepareMainNavRoll();
applyNavSettings(readNavSettings());
// Standalone Jobs and Player Tools also read published settings (not app.js).
if(inTools||inJobs||inLegion||inItempedia||inBossGuides){
 const endpoint=(location.hostname.endsWith('github.io')||location.hostname==='www.duoduovalley.com'||location.hostname==='duoduovalley.com')?'https://duoduo-website.onrender.com/api/site-data':'/api/site-data';
 let lastPublished='';
 async function loadPublishedNav(){
  if(document.visibilityState==='hidden'||!navigator.onLine)return;
  try{const res=await fetch(endpoint,{cache:'no-store',headers:{Accept:'application/json'}});
   const data=res.ok?await res.json():null;
   const cfg=data?.data?.duoduo_settings;
   if(data?.initialized===true&&cfg){
    const str=JSON.stringify(cfg);
    if(str===lastPublished)return;
    lastPublished=str;
    try{sessionStorage.setItem('duoduo_cloud_duoduo_settings',str)}catch(_){}
    applyNavSettings(cfg);
   }
  }catch(_){}
 }
 loadPublishedNav();
 // Pages with a shared cloud watcher already react to published settings.
 // Retain standalone fallback polling for pages without that watcher.
 setInterval(()=>{if(!window.DuoDuoCloudRefresh?.active)loadPublishedNav()},60000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')loadPublishedNav()});
}

// A new iframe can emit a synthetic mouseenter under the stationary pointer.
// A real page navigation must arrive with the menu closed until the visitor
// deliberately moves to another heading or exits/re-enters the header.
const NAV_ROUTE_CLOSE_KEY='dd_nav_close_after_route_v1';
let suppressArrivalHover=false,arrivalPointerDistance=0;
try{
 const raw=sessionStorage.getItem(NAV_ROUTE_CLOSE_KEY);
 if(raw){
  sessionStorage.removeItem(NAV_ROUTE_CLOSE_KEY);
  const marker=JSON.parse(raw),age=Date.now()-Number(marker?.at);
  suppressArrivalHover=marker?.path===location.pathname&&age>=0&&age<15000;
 }
 // Remove the old download-only handoff; cross-page links now all close.
 sessionStorage.removeItem('dd_download_nav_menu_handoff_v1');
}catch(_){}
const mobileToggle=nav.querySelector('.dd-mobile-toggle');
const hoverLinks=Array.from(nav.querySelectorAll('[data-dd-nav]'));
function align(){if(innerWidth<=700)return;const n=nav.getBoundingClientRect(),h=header.getBoundingClientRect();menu.style.setProperty('--dd-nav-left',`${Math.round(n.left-h.left)}px`);menu.style.setProperty('--dd-nav-width',`${Math.round(n.width)}px`)}
function open(force=false){
 if(suppressArrivalHover&&!force){close();return;}
 clearTimeout(closeTimer);align();menu.hidden=false;mobileToggle?.setAttribute('aria-expanded','true');
}
function close(){clearTimeout(closeTimer);menu.hidden=true;mobileToggle?.setAttribute('aria-expanded','false')}
window.DuoDuoNavCloseForRoute=close;
function scheduleClose(){clearTimeout(closeTimer);closeTimer=setTimeout(close,170)}
for(const a of hoverLinks){
 if(a.dataset.ddNav==='home'){a.addEventListener('mouseenter',close);a.addEventListener('focus',close);continue}
 a.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover)').matches)open()});
 a.addEventListener('focus',()=>{if(matchMedia('(hover:hover)').matches)open(true)});
 // Main headings are real links to the top of the destination page, never to first submenu item.
}
mobileToggle?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(menu.hidden)open(true);else close()});
header.addEventListener('mouseleave',event=>{
 // An iframe/document handoff can emit a synthetic leave with no target.
 // Do not release the arrival guard until the pointer really exits the header.
 if(event.relatedTarget){suppressArrivalHover=false;arrivalPointerDistance=0;}
 scheduleClose();
});
header.addEventListener('pointermove',event=>{
 if(!suppressArrivalHover||!event.isTrusted)return;
 arrivalPointerDistance+=Math.abs(event.movementX||0)+Math.abs(event.movementY||0);
 if(arrivalPointerDistance<12)return;
 // Ignore synthetic mouseenter after iframe adoption. Only a fresh,
 // deliberate pointer move onto a main heading should reopen the menu.
 const link=event.target?.closest?.('a[data-dd-nav]');
 if(!link)return;
 suppressArrivalHover=false;arrivalPointerDistance=0;
 if(link.dataset.ddNav!=='home'&&matchMedia('(hover:hover)').matches)open();
});
menu.addEventListener('mouseenter',()=>clearTimeout(closeTimer));
menu.addEventListener('mouseleave',scheduleClose);
document.addEventListener('pointerdown',e=>{if(!header.contains(e.target))close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
window.addEventListener('resize',()=>{if(!menu.hidden)align()});
window.addEventListener('scroll',()=>{if(!menu.hidden&&innerWidth>700)align()},{passive:true});
// Recalculate when parent shell/grid/header dimensions change.
if(typeof ResizeObserver==='function'){new ResizeObserver(()=>{if(!menu.hidden)align()}).observe(nav)}
// Same-page download selections keep the menu; cross-page transitions close it.
let downloadScrollSerial=0;
function scrollDownloadRequest(request){
 if(!request)return;
 const serial=++downloadScrollSerial;
 let tries=0;
 const poll=setInterval(()=>{
  if(serial!==downloadScrollSerial){clearInterval(poll);return;}
  // The outer shell preloads the next page in an invisible iframe. Beginning
  // the animation now would finish before the player sees the new page.
  try{if(window.frameElement?.id==='duoduoPendingPage')return;}catch(_){/* standalone */}
  const target=findNamed(request);
  if(!target){
   if(++tries<90)return;
   clearInterval(poll);
   const toast=document.createElement('div');toast.className='dd-nav-toast';
   toast.textContent='這個下載項目目前尚未在頁面公開，請以下載專區現有項目為準。';
   document.body.appendChild(toast);setTimeout(()=>toast.remove(),4800);return;
  }
  clearInterval(poll);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(serial!==downloadScrollSerial||!target.isConnected)return;
   const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   target.style.scrollMarginTop='110px';
   target.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});
  }));
 },100);
}
function downloadSubmenuClick(event){
 if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
 const element=event.target?.nodeType===1?event.target:event.target?.parentElement;
 const anchor=element?.closest?.('#dd-nav-menu a[href]');
 if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download'))return;
 let url;
 try{url=new URL(anchor.href)}catch(_){return;}
 if(url.origin!==location.origin||!url.pathname.endsWith('/downloads.html'))return;
 const request=url.searchParams.get('ddnav');if(!request)return;
 if(location.pathname.endsWith('/downloads.html')){
  event.preventDefault();
  window.DuoDuoNavSelectDownload?.(url.href);
 }
}
// Also callable by the persistent shell's capture-phase router when it was
// wired before this file loaded; never rebuild the iframe for download tabs.
window.DuoDuoNavSelectDownload=function(targetURL){
 if(!location.pathname.endsWith('/downloads.html'))return false;
 let url;try{url=new URL(String(targetURL||''),location.href)}catch(_){return false;}
 if(url.origin!==location.origin||url.pathname!==location.pathname)return false;
 const request=url.searchParams.get('ddnav');if(!request)return false;
 const cache=new URLSearchParams(location.search).get('_dd_page_cache');
 if(cache)url.searchParams.set('_dd_page_cache',cache);
 if(url.href!==location.href)history.pushState(history.state,'',url.href);
 scrollDownloadRequest(request);
 return true;
};
// Register before the shell's navigation capture handler (installed on frame
// load), so same-document download clicks are not misclassified as page swaps.
document.addEventListener('click',downloadSubmenuClick,true);
function scrollTarget(target){if(!target)return false;target.style.scrollMarginTop='110px';target.scrollIntoView({behavior:'instant',block:'start'});return true}
function findNamed(target){
 const cards=Array.from(document.querySelectorAll('#download-grid .download-card'));
 const requested=String(target||'');
 // Old player bookmarks and old published dropdowns remain supported.
 const kind=requested==='patch'||/^patch\d+to\d+$/i.test(requested)?'patch':
   requested==='manual'||/^patch\d+(?:[._-]\d+)?$/i.test(requested)?'manual':null;
 if(kind){
  const title=card=>String(card.querySelector('h3')?.textContent||'').trim();
  const find=kind==='manual'
   ?cards.find(card=>/手動\s*更新/.test(title(card)))
   :cards.find(card=>/更新檔|更新包|版本更新/.test(title(card))&&!/手動\s*更新/.test(title(card)));
  // A version-independent destination must follow the current card title.
  if(find)return find;
  // If the title was customized, identify by its stable/legacy ID.
  return cards.find(card=>{
   const id=String(card.id||'').replace(/^dd-download-/,'');
   return kind==='patch'?/^patch\d+to\d+$/i.test(id):
     /^patch\d+(?:[._-]\d+)?$/i.test(id);
  })||null;
 }
 const exact=document.getElementById('dd-download-'+requested);
 if(exact)return exact;
 const terms={manager:['遊戲橘子','主程式','遊戲本體'],launcher:['登入器'],pack:['整合包']}[requested]||[];
 return cards.find(card=>terms.some(term=>card.querySelector('h3')?.textContent?.includes(term)))||null;
}
function onceVisibleTarget(get,missMsg){let tick=0;let done=false;const timer=setInterval(()=>{
  if(done)return;
  const el=get();if(el){done=true;clearInterval(timer);requestAnimationFrame(()=>scrollTarget(el))}
  else if(++tick>=40){clearInterval(timer);if(missMsg){const toast=document.createElement('div');toast.className='dd-nav-toast';toast.textContent=missMsg;document.body.appendChild(toast);setTimeout(()=>toast.remove(),4800)}}
 },150)}
const hash=decodeURIComponent(location.hash.slice(1));
if(hash&&['boss.html','guide.html'].some(p=>location.pathname.endsWith('/'+p))){
 onceVisibleTarget(()=>document.getElementById(hash),null);
}
const request=new URLSearchParams(location.search).get('ddnav');
if(inTools&&request){onceVisibleTarget(()=>{
 const tab=document.querySelector(`.tabbar .tab[data-tab="${CSS.escape(request)}"]`);
 if(tab){tab.click();return document.getElementById(request)||document.querySelector('.tabbar')}
 return null;
},null)}
if(location.pathname.endsWith('/downloads.html')){
 if(request)scrollDownloadRequest(request);
 window.addEventListener('popstate',()=>{
  scrollDownloadRequest(new URLSearchParams(location.search).get('ddnav'));
 });
}
if(location.pathname.endsWith('/guide.html')){
 // Resources are created by the site's existing app.js without changing their embed timing.
 const box=document.getElementById('guide-resources-grid');
 if(box){const setIds=()=>{
  for(const card of box.querySelectorAll('.guide-resource-card')){
   const title=card.querySelector('h3')?.textContent?.trim();
   const key={'完整遊玩指南':'guide','玩法與系統介紹':'guide','機率型道具說明':'rates','上架商品':'products'}[title];
   if(key)card.id='dd-resource-'+key;
  }
 };
 setIds();new MutationObserver(setIds).observe(box,{childList:true});
 }
}
})();
