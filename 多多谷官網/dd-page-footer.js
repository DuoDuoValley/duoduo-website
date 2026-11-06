/* One canonical DuoDuo footer for official pages and nested feature pages. */
(()=>{'use strict';
 const source=document.currentScript?.src||'';
 if(!source)return;
 const rootBase=new URL('./',source);
 const asset=(path)=>new URL(path,rootBase).href;
 const styleHref=asset('dd-page-footer.css?v=20261105-footer-v2');
 if(![...document.querySelectorAll('link[rel="stylesheet"]')].some(el=>{try{return new URL(el.href).pathname===new URL(styleHref).pathname}catch(_){return false}})){
  const style=document.createElement('link');style.rel='stylesheet';style.href=styleHref;style.dataset.ddFooterStyle='true';document.head.appendChild(style);
 }
 const getJSON=(key)=>{
  for(const [type,name] of [['sessionStorage','duoduo_cloud_'+key],['localStorage',key]]){
   try{const store=window[type];const raw=store.getItem(name);if(raw!==null){const parsed=JSON.parse(raw);if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))return parsed}}catch(_){}}
  return {};
 };
 const legacy={topup:'儲值入口',rates:'機率型道具說明',products:'上架商品',checklist:'每日 Checklist',discord:'Discord'};
 const defaults={
  topup:'https://fd-pay.com/ARrbXO',discord:'https://discord.gg/duoduovalley',
  rates:'https://docs.google.com/spreadsheets/d/1rAv38Kniphusog1CYCZQWkGW4OdDGRmeLUeHBfCi1BQ/edit?usp=sharing',
  products:'https://docs.google.com/spreadsheets/d/1jvi3pVe9q0EjeMbTruptmLlT5eYNXMvr2glVt0-uxhs/edit?usp=sharing',
  checklist:'https://duoduovalley.github.io/duoduo-checklist/'
 };
 const oldDescription='一個正在慢慢變熱鬧的小小世界。遊戲資訊、檔期活動與最新公告，都在這裡整理。';
 const defaultDescription='每一次冒險，都有新的故事。最新活動、遊玩攻略與實用工具，都在這裡陪你一起探索。';
 const settings=getJSON('duoduo_settings').footer||{};
 const links=getJSON('duoduo_links');
 const footerText=(key,fallback)=>{
  const s=settings[key];return typeof s==='string'&&s.trim()?s.trim():fallback;
 };
 const description=footerText('description',defaultDescription);
 const navTitle=footerText('navTitle','網站導覽');
 const savedResourceTitle=footerText('resourceTitle','玩家服務');
 const resourceTitle=savedResourceTitle==='玩家資源'?'玩家服務':savedResourceTitle;
 const copyright=footerText('copyright','© 2026 DuoDuo Valley · 多多谷');
 const internal=(path)=>asset(path);
 const external=(key)=>{
  const configured=Object.hasOwn(links,key)?links[key]:links[legacy[key]];
  const url=typeof configured==='string'?configured:defaults[key];
  try{const parsed=new URL(url);return parsed.protocol==='https:'?parsed.href:defaults[key]}catch(_){return defaults[key]}
 };
 const make=(label,path,options={})=>{
  const a=document.createElement('a');
  a.href=options.external?external(path):internal(path);
  if(options.external){
   a.dataset.link=path;a.target='_blank';a.rel='noopener noreferrer';
   a.setAttribute('aria-label',label+'（在新分頁開啟）');
   a.title=label+'（在新分頁開啟）';
  }
  if(path==='discord'&&options.external){
   const icon=document.createElement('img');
   icon.className='dd-footer-discord-icon';icon.src=asset('assets/discordico.PNG');
   icon.alt='';icon.width=18;icon.height=18;icon.decoding='async';
   a.append(icon);
  }
  a.append(document.createTextNode(label));
  return a;
 };
 const goToTop=()=>{
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top:0,behavior:reduce?'instant':'smooth'});
 };
 const addColumn=(footer,title,entries,footerKey,className='')=>{
  const column=document.createElement('div');column.className='footer-column'+(className?' '+className:'');
  const heading=document.createElement('strong');heading.textContent=title;
  if(footerKey)heading.dataset.footer=footerKey;
  column.append(heading);
  const list=document.createElement('div');list.className='footer-links';
  for(const [label,path,options] of entries)list.append(make(label,path,options));
  column.append(list);footer.append(column);
 };
 function render(){
  const root=document.querySelector('footer.site-footer');if(!root||root.dataset.ddFooterVersion==='2')return;
  root.dataset.ddFooterVersion='2';root.classList.add('dd-unified-footer','dd-footer-v2');
  root.replaceChildren();
  const brand=document.createElement('div');brand.className='footer-brand';
  const eyebrow=document.createElement('span');eyebrow.className='dd-footer-eyebrow';eyebrow.textContent='DUODUO VALLEY · OFFICIAL';
  const name=document.createElement('b');name.textContent='DuoDuo Valley｜多多谷';
  const desc=document.createElement('p');desc.dataset.footer='description';desc.textContent=description===oldDescription?defaultDescription:description;
  brand.append(eyebrow,name,desc);root.append(brand);
  addColumn(root,navTitle,[
   ['首頁','index.html'],['最新消息','news.html'],['檔期活動','events.html'],['BOSS 資訊','boss.html#ddBossAtlas']
  ],'navTitle');
  addColumn(root,'遊玩與工具',[
   ['角色卡與傳授技能','jobs/jobs.html'],['戰地拼圖模擬器','legion-preview-6c82f4a9/index.html'],
   ['每日 Checklist','checklist',{external:true}],['玩家工具','player-tools/index.html'],['道具百科','item-encyclopedia.html']
  ]);
  addColumn(root,resourceTitle,[
   ['下載專區','downloads.html'],['儲值入口','topup',{external:true}],
   ['機率型道具說明','rates',{external:true}],['上架商品','products',{external:true}],['Discord 社群','discord',{external:true}]
  ],'resourceTitle','dd-footer-service');
  // Public game-rating and safety information, shared across all footer instances.
  // Use the original one-frame age-rating asset supplied by the site owner.
  const rating=document.createElement('section');rating.className='dd-footer-rating';
  rating.setAttribute('aria-label','遊戲分級與注意事項');
  const badge=document.createElement('img');badge.className='dd-footer-rating-badge';
  badge.src=asset('assets/class_12.gif');badge.alt='輔12級：輔導十二歲級';
  badge.width=64;badge.height=64;badge.decoding='async';
  const ratingBody=document.createElement('div');ratingBody.className='dd-footer-rating-body';
  const ratingTitle=document.createElement('strong');ratingTitle.className='dd-footer-rating-title';
  ratingTitle.textContent='遊戲分級與注意事項';
  const ratingNotes=document.createElement('ul');ratingNotes.className='dd-footer-rating-notes';
  for(const note of [
   '本遊戲部分內容涉及暴力情節。',
   '請避免沉迷遊戲。',
   '本遊戲部分內容需另行支付費用。',
   '未成年或無行為能力人，需由法定代理人同意後方得使用本遊戲服務。'
  ]){const line=document.createElement('li');line.textContent=note;ratingNotes.append(line)}
  ratingBody.append(ratingTitle,ratingNotes);rating.append(badge,ratingBody);root.append(rating);
  const bottom=document.createElement('div');bottom.className='footer-bottom';
  const copy=document.createElement('span');copy.dataset.footer='copyright';copy.textContent=copyright;
  const legal=document.createElement('span');legal.className='footer-legal';
  legal.append(make('隱私權政策','privacy.html'),make('使用條款','terms.html'));
  const inlineTop=document.createElement('button');inlineTop.type='button';
  inlineTop.className='dd-footer-inline-top';inlineTop.textContent='↑ 回到頂部';
  inlineTop.setAttribute('aria-label','回到頁面頂部');
  inlineTop.addEventListener('click',goToTop);
  legal.append(inlineTop);
  bottom.append(copy,legal);root.append(bottom);
  // One unobtrusive back-to-top control for long pages; keep it away from
  // the site's right-hand music controls and respect reduced-motion settings.
  if(!document.querySelector('[data-dd-back-to-top]')){
   const up=document.createElement('button');up.type='button';
   up.className='dd-footer-backtop';up.dataset.ddBackToTop='true';
   up.setAttribute('aria-label','回到頁面頂部');up.title='回到頁面頂部';
   up.hidden=true;
   up.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 14 6-6 6 6"/></svg><span>回到頂部</span>';
   document.body.appendChild(up);
   const update=()=>{
    const scroller=document.scrollingElement||document.documentElement;
    up.hidden=scroller.scrollTop<500||root.getBoundingClientRect().top<window.innerHeight-45;
   };
   let queued=false;
   const onScroll=()=>{
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{queued=false;update()});
   };
   window.addEventListener('scroll',onScroll,{passive:true});
   up.addEventListener('click',goToTop);
   update();
  }
 }
 // Cloud-published footer values are authoritative. Cached settings are only a
 // first-paint fallback; do not leave first-time visitors with stale links.
 const cloudEndpoint=(location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'')+'/api/site-data';
 let busy=false,lastPublished='',lastSuccessful=0;
 const safePublishedLink=(record,key)=>{
  const candidate=record?.[key]??record?.[legacy[key]];
  if(typeof candidate!=='string')return defaults[key];
  try{const url=new URL(candidate);return url.protocol==='https:'?url.href:defaults[key]}
  catch(_){return defaults[key]}
 };
 function updateFooterFromCloud(data){
  const root=document.querySelector('footer.site-footer');
  const cfg=data?.duoduo_settings?.footer||{};
  const pubLinks=data?.duoduo_links||{};
  if(!root||root.dataset.ddFooterVersion!=='2')return;
  const show=(field,property,fallback)=>{
   const val=typeof cfg[property]==='string'&&cfg[property].trim()?cfg[property].trim():fallback;
   const el=root.querySelector(`[data-footer="${field}"]`);
   if(el)el.textContent=val;
  };
  show('description','description',defaultDescription);
  show('navTitle','navTitle','網站導覽');
  show('resourceTitle','resourceTitle','玩家服務');
  show('copyright','copyright','© 2026 DuoDuo Valley · 多多谷');
  for(const a of root.querySelectorAll('a[data-link]')){
   const key=a.dataset.link;
   if(!Object.hasOwn(defaults,key))continue;
   a.href=safePublishedLink(pubLinks,key);
  }
 }
 async function refreshCloudFooter(){
  if(busy||document.visibilityState==='hidden'||navigator.onLine===false)return;
  busy=true;
  try{
   const response=await fetch(cloudEndpoint,{cache:'no-store',headers:{Accept:'application/json'}});
   if(!response.ok)throw Error('HTTP '+response.status);
   const payload=await response.json();
   if(payload?.ok!==true||payload.initialized!==true||!payload.data||typeof payload.data!=='object')throw Error('incomplete site-data');
   const published={duoduo_settings:payload.data.duoduo_settings,duoduo_links:payload.data.duoduo_links};
   const signature=JSON.stringify(published);
   if(signature!==lastPublished){
    lastPublished=signature;
    // Publish only a confirmed server response to this tab's cache.
    for(const [key,value] of Object.entries(published))if(value&&typeof value==='object'){
     try{sessionStorage.setItem('duoduo_cloud_'+key,JSON.stringify(value))}catch(_){/* storage optional */}
    }
    updateFooterFromCloud(published);
   }
   lastSuccessful=Date.now();
  }catch(err){
   // Existing footer stays readable when offline; do not overwrite cache.
   console.warn('[多多谷頁尾] 雲端設定暫不可確認，保留目前顯示。',err?.message||err);
  }finally{busy=false}
 }
 window.DuoDuoFooterRefresh=refreshCloudFooter;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{render();refreshCloudFooter()},{once:true});
 else{render();refreshCloudFooter()}
 window.setInterval(()=>{if(Date.now()-lastSuccessful>=45000)refreshCloudFooter()},60000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshCloudFooter()});
 window.addEventListener('online',refreshCloudFooter);
})();
