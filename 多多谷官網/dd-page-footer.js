/* One canonical DuoDuo footer for official pages and nested feature pages. */
(()=>{'use strict';
 const source=document.currentScript?.src||'';
 if(!source)return;
 const rootBase=new URL('./',source);
 const asset=(path)=>new URL(path,rootBase).href;
 const styleHref=asset('dd-page-footer.css?v=20261105-footer-v1');
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
  const a=document.createElement('a');a.textContent=label;
  a.href=options.external?external(path):internal(path);
  if(options.external){a.dataset.link=path;a.target='_blank';a.rel='noopener noreferrer'}
  return a;
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
  bottom.append(copy,legal);root.append(bottom);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();
