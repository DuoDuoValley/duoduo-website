/* V9 integrated navigation: native links, optional deep targets, and shared dropdown.
 * No dependencies; leaves site theme, footer, player, and route code untouched. */
(()=>{'use strict';
const header=document.querySelector('header.site-header');
const nav=header?.querySelector('nav.dd-main-nav');
if(!nav||!header)return;
const inTools=location.pathname.includes('/player-tools/');
const inJobs=location.pathname.includes('/jobs/');
const prefix=(inTools||inJobs)?'../':'';
const defaultGroups=window.DuoDuoNavDefaults||[];
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
function applyNavSettings(cfg){
 siteNavConfig=cfg&&typeof cfg==='object'?cfg:{};
 const saved=siteNavConfig.navDropdown||{};
 const sections=saved.groups||{};
 const order=['news','events','boss','guide','downloads','player-tools'];
 const customOrder=Array.isArray(siteNavConfig.navOrder)?siteNavConfig.navOrder.filter(x=>order.includes(x)):[];
 const sorted=[...new Set([...customOrder,...order])];
 groups=defaultGroups.map(g=>{
  const section=sections[g.key]||{};
  const items=Array.isArray(section.items)?section.items:g.items.map((x,i)=>({id:g.key+'-'+i,label:x[0],href:x[1],enabled:true}));
  return {...g,items:items.filter(x=>x&&x.enabled!==false&&cleanHref(x.href))
   .slice(0,20).map(x=>({id:String(x.id||''),label:currentJobsLabel(x).slice(0,50),href:String(x.href)}))};
 }).sort((a,b)=>sorted.indexOf(a.key)-sorted.indexOf(b.key));
 const navLabels=siteNavConfig.nav||{};
 for(const a of nav.querySelectorAll('[data-dd-nav]')){
  const key=a.dataset.ddNav;
  const lookup=key==='player-tools'?'playerTools':key;
  const label=navLabels[lookup];
  if(typeof label==='string'&&label.trim())a.querySelector('.dd-nav-label').textContent=label.trim().slice(0,22);
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
applyNavSettings(readNavSettings());
// Standalone Jobs and Player Tools also read published settings (not app.js).
if(inTools||inJobs){
 const endpoint=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com/api/site-data':'/api/site-data';
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
 setInterval(loadPublishedNav,60000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')loadPublishedNav()});
}

const mobileToggle=nav.querySelector('.dd-mobile-toggle');
const hoverLinks=Array.from(nav.querySelectorAll('[data-dd-nav]'));
function align(){if(innerWidth<=700)return;const n=nav.getBoundingClientRect(),h=header.getBoundingClientRect();menu.style.setProperty('--dd-nav-left',`${Math.round(n.left-h.left)}px`);menu.style.setProperty('--dd-nav-width',`${Math.round(n.width)}px`)}
function open(){clearTimeout(closeTimer);align();menu.hidden=false;mobileToggle?.setAttribute('aria-expanded','true')}
function close(){clearTimeout(closeTimer);menu.hidden=true;mobileToggle?.setAttribute('aria-expanded','false')}
function scheduleClose(){clearTimeout(closeTimer);closeTimer=setTimeout(close,170)}
for(const a of hoverLinks){
 if(a.dataset.ddNav==='home'){a.addEventListener('mouseenter',close);a.addEventListener('focus',close);continue}
 a.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover)').matches)open()});
 a.addEventListener('focus',()=>{if(matchMedia('(hover:hover)').matches)open()});
 // Main headings are real links to the top of the destination page, never to first submenu item.
}
mobileToggle?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(menu.hidden)open();else close()});
header.addEventListener('mouseleave',scheduleClose);
menu.addEventListener('mouseenter',()=>clearTimeout(closeTimer));
menu.addEventListener('mouseleave',scheduleClose);
document.addEventListener('pointerdown',e=>{if(!header.contains(e.target))close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
window.addEventListener('resize',()=>{if(!menu.hidden)align()});
window.addEventListener('scroll',()=>{if(!menu.hidden&&innerWidth>700)align()},{passive:true});
// Recalculate when parent shell/grid/header dimensions change.
if(typeof ResizeObserver==='function'){new ResizeObserver(()=>{if(!menu.hidden)align()}).observe(nav)}
function scrollTarget(target){if(!target)return false;target.style.scrollMarginTop='110px';target.scrollIntoView({behavior:'instant',block:'start'});return true}
function findNamed(target){
 const id=document.getElementById('dd-download-'+target);if(id)return id;
 if(target==='manager')return Array.from(document.querySelectorAll('.download-card')).find(c=>/遊戲橘子|主程式|遊戲本體/.test(c.querySelector('h3')?.textContent||''))||null;
 const cards=Array.from(document.querySelectorAll('.download-card'));
 const match={patch281to282:['281','282'],patch2824:['282.4','手動更新'],launcher:['登入器'],pack:['整合包']}[target]||[];
 return cards.find(c=>match.some(term=>c.textContent.includes(term)))||null;
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
if(location.pathname.endsWith('/downloads.html')&&request){
 onceVisibleTarget(()=>findNamed(request),'這個下載項目目前尚未在頁面公開，請以下載專區現有項目為準。');
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
