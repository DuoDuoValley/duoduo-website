/* DuoDuo published cloud data watcher v4.2.
 * While foregrounded, news can update in place. Other confirmed changes refresh.
 * When returning from a long background pause, ANY confirmed published change
 * refreshes automatically (never prompts), while unchanged data never reloads.
 */
(()=>{'use strict';
 try{if(sessionStorage.getItem('duoduo_maintenance_admin_preview_v1')==='1' && sessionStorage.getItem('duoduo_admin_session'))return;}catch(_){}
 const script=document.currentScript;
 if(!script?.src)return;
 const inTools=location.pathname.includes('/player-tools/');
 const route=inTools?'player-tools':(location.pathname.split('/').pop()||'index.html').toLowerCase();
 const byPage={
  'index.html':['duoduo_news','duoduo_reviews','duoduo_content','duoduo_hero','duoduo_layout','duoduo_resources','duoduo_downloads','duoduo_items','duoduo_events','duoduo_boss_config'],
  'home.html':['duoduo_news','duoduo_reviews','duoduo_content','duoduo_hero','duoduo_layout','duoduo_resources','duoduo_downloads','duoduo_items','duoduo_events','duoduo_boss_config'],
  'news.html':['duoduo_news'],'events.html':['duoduo_events'],'event-detail.html':['duoduo_events'],
  'boss.html':['duoduo_boss_config','duoduo_boss_atlas'],
  'downloads.html':['duoduo_downloads','duoduo_resources','duoduo_items'],
  'guide.html':['duoduo_resources','duoduo_content','duoduo_items'],
  'player-tools':['duoduo_pools','duoduo_weekly_prizes']
 };
 const keys=[...new Set([...(inTools?['duoduo_settings']:['duoduo_settings','duoduo_links']),...(byPage[route]||[])])];
 const endpoint=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com/api/site-data':'/api/site-data';
 const debug={active:true,revision:'v4.2',status:'initializing',lastCheck:null,lastError:null,lastChangedKeys:[]};
 window.DuoDuoCloudRefresh=debug;
 let baseline=null, busy=false, refreshPending=false, backgroundSince=null, returnedAfterLongPause=false;
 const own=(obj,k)=>Object.prototype.hasOwnProperty.call(obj,k);
 function canonical(value){
  if(value===null||typeof value!=='object')return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(v=>canonical(v)??'null').join(',')+']';
  return '{'+Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
 }
 function digest(s){
  let a=2166136261,b=5381;
  for(let i=0;i<s.length;i++){a=Math.imul(a^s.charCodeAt(i),16777619);b=(Math.imul(b,33)^s.charCodeAt(i))>>>0;}
  return s.length+':'+(a>>>0).toString(16)+':'+(b>>>0).toString(16);
 }
 async function read(){
  const res=await fetch(endpoint,{headers:{Accept:'application/json'},cache:'no-store'});
  if(!res.ok)throw Error('HTTP '+res.status);
  const payload=await res.json();
  if(payload?.ok!==true||payload.initialized!==true||!payload.data||typeof payload.data!=='object')throw Error('incomplete cloud payload');
  const hashes={},values={};
  for(const key of keys){
   if(!own(payload.data,key)){
    if(baseline&&own(baseline.hashes,key))throw Error('partial cloud payload');
    continue;
   }
   hashes[key]=digest(canonical(payload.data[key]));
   values[key]=payload.data[key];
  }
  return {hashes,values};
 }
 function changedKeys(a,b){return keys.filter(k=>a.hashes[k]!==b.hashes[k]);}
 function store(next){
  for(const [key,value] of Object.entries(next.values)){
   try{sessionStorage.setItem('duoduo_cloud_'+key,JSON.stringify(value));}catch(_){}
  }
 }
 function applyNews(value){
  if(!Array.isArray(value))return false;
  try{
   if(route==='news.html'&&typeof window.DuoDuoApplyPageNews==='function')return window.DuoDuoApplyPageNews(value)===true;
   if(route==='home.html'&&typeof window.DuoDuoApplyNews==='function')return window.DuoDuoApplyNews(value)===true;
  }catch(e){debug.lastError='news render: '+String(e?.message||e);}
  return false;
 }
 async function check(){
  if(busy||refreshPending||document.visibilityState==='hidden'||navigator.onLine===false)return;
  busy=true;
  try{
   const next=await read();debug.lastCheck=new Date().toISOString();debug.lastError=null;
   if(!baseline){baseline=next;debug.status='watching';return;}
   const differences=changedKeys(baseline,next);
   if(!differences.length){debug.status='watching';returnedAfterLongPause=false;return;}
   // Confirm that the same published content exists on two fresh reads;
   // this avoids reacting to transient Supabase/CDN snapshots.
   const confirm=await read();
   if(differences.some(k=>confirm.hashes[k]!==next.hashes[k])){
    debug.status='waiting for stable cloud data';return;
   }
   const priorWasBackground=returnedAfterLongPause;
   returnedAfterLongPause=false;
   baseline=confirm;
   debug.lastChangedKeys=differences;store(confirm);
   let rest=differences;
   if(!priorWasBackground&&differences.includes('duoduo_news')&&applyNews(confirm.values.duoduo_news)){
    rest=differences.filter(k=>k!=='duoduo_news');
   }
   if(!rest.length){debug.status='news updated in place';return;}
   debug.status='cloud publication confirmed';refreshPending=true;
   if(route==='boss.html'&&typeof window.__ddBossRefreshFresh==='function')window.__ddBossRefreshFresh();
   else {
    let handled=false;
    try{if(window.parent!==window && typeof window.parent.duoduoRefreshCloudFrame==='function')handled=window.parent.duoduoRefreshCloudFrame(window)===true;}catch(_){}
    if(!handled)location.reload();
   }
  }catch(error){debug.status='retrying';debug.lastError=String(error?.message||error)}
  finally{busy=false;}
 }
 debug.checkNow=check;
 setTimeout(check,1800);
 setInterval(check,route==='news.html'||route==='home.html'?30000:60000);
 let focusTimer=null;
 function schedule(){clearTimeout(focusTimer);focusTimer=setTimeout(check,6000);}
 document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){backgroundSince=Date.now();return;}
  if(backgroundSince!==null && Date.now()-backgroundSince>60000)returnedAfterLongPause=true;
  backgroundSince=null;schedule();
 });
 window.addEventListener('online',schedule);
})();
