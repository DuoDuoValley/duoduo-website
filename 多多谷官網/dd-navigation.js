/* V9 integrated navigation: native links, optional deep targets, and shared dropdown.
 * No dependencies; leaves site theme, footer, player, and route code untouched. */
(()=>{'use strict';
const header=document.querySelector('header.site-header');
const nav=header?.querySelector('nav.dd-main-nav');
if(!nav||!header)return;
const inTools=location.pathname.includes('/player-tools/');
const prefix=inTools?'../':'';
const groups=[
 {key:'news',name:'最新消息',href:'news.html',items:[['全部','news.html?ddnav=全部'],['重要','news.html?ddnav=重要消息'],['維護','news.html?ddnav=維護通知'],['更新','news.html?ddnav=更新說明'],['活動','news.html?ddnav=活動資訊']]},
 {key:'events',name:'檔期活動',href:'events.html',items:[['全部','events.html?ddnav=all'],['進行中','events.html?ddnav=active'],['已結束','events.html?ddnav=ended']]},
 {key:'boss',name:'BOSS',href:'boss.html',items:[['挑戰指南','boss.html#ddBossChallenge'],['血量倍率計算機','boss.html#bc-calc-title'],['個人傷害反推','boss.html#bc-inverse-title'],['BOSS 資訊','boss.html#ddBossAtlas']]},
 {key:'guide',name:'遊玩指南',href:'guide.html',items:[['職業圖鑑','jobs/jobs.html'],['完整指南','guide.html#dd-resource-guide'],['機率型道具說明','guide.html#dd-resource-rates'],['上架商品','guide.html#dd-resource-products']]},
 {key:'downloads',name:'下載專區',href:'downloads.html',items:[['主程式','downloads.html?ddnav=manager'],['更新檔','downloads.html?ddnav=patch281to282'],['手動更新檔','downloads.html?ddnav=patch2824'],['登入器','downloads.html?ddnav=launcher'],['整合包','downloads.html?ddnav=pack']]},
 {key:'player-tools',name:'玩家工具',href:'player-tools/index.html',items:[['裝備強化','player-tools/index.html?ddnav=enhance'],['阿斯特拉輔助武器強化','player-tools/index.html?ddnav=astra'],['圖騰強化','player-tools/index.html?ddnav=totem'],['內襯強化','player-tools/index.html?ddnav=liner'],['塔戒升級','player-tools/index.html?ddnav=tower'],['抽獎模擬器','player-tools/index.html?ddnav=gacha']]}
];
let closeTimer=0;
const menu=document.createElement('div'); menu.id='dd-nav-menu';menu.className='dd-nav-menu';menu.hidden=true;
const rail=document.createElement('div');rail.className='dd-nav-rail';menu.appendChild(rail);
const base=document.createElement('span');base.setAttribute('aria-hidden','true');base.className='dd-nav-placeholder';rail.appendChild(base);
for(const group of groups){
 const col=document.createElement('div');col.className='dd-nav-col';col.dataset.ddGroup=group.key;
 const heading=document.createElement('span');heading.className='dd-nav-heading';heading.textContent=group.name;col.appendChild(heading);
 for(const [label,url] of group.items){const a=document.createElement('a');a.href=prefix+url;a.textContent=label;col.appendChild(a)}
 rail.appendChild(col);
}
header.appendChild(menu);header.classList.add('dd-nav-ready');
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
   const key={'完整遊玩指南':'guide','機率型道具說明':'rates','上架商品':'products'}[title];
   if(key)card.id='dd-resource-'+key;
  }
 };
 setIds();new MutationObserver(setIds).observe(box,{childList:true});
 }
}
})();
