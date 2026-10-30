/* DuoDuo published cloud data watcher v4.0.
 * A returned JSON object, resume event or transient response is not a publication.
 * Confirm a relevant, canonical payload change on two independent fetches.
 */
(()=>{'use strict';
 const script=document.currentScript;
 if(!script?.src)return;
 const root=new URL('./',script.src);
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
 const KEY='duoduo_published_seen_v4:'+route;
 const debug={active:true,revision:'v4.0',status:'initializing',lastCheck:null,lastError:null};
 window.DuoDuoCloudRefresh=debug;
 let checked=false, baseline=null, pending=null, busy=false, refreshing=false, seen=[];
 const knownKeys=new Set();
 try{const arr=JSON.parse(sessionStorage.getItem(KEY)||'[]');if(Array.isArray(arr))seen=arr.filter(x=>typeof x==='string').slice(-16)}catch(_){}
 function remember(hash){if(!seen.includes(hash))seen.push(hash);seen=seen.slice(-16);try{sessionStorage.setItem(KEY,JSON.stringify(seen))}catch(_){}}
 function canonical(value){
   if(value===null||typeof value!=='object')return JSON.stringify(value);
   if(Array.isArray(value))return '['+value.map(x=>canonical(x)??'null').join(',')+']';
   return '{'+Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
 }
 function hashValue(value){
   let a=2166136261,b=5381;
   for(let i=0;i<value.length;i++){
     a=Math.imul(a^value.charCodeAt(i),16777619);
     b=(Math.imul(b,33)^value.charCodeAt(i))>>>0;
   }
   return value.length+':'+(a>>>0).toString(16)+':'+(b>>>0).toString(16);
 }
 async function load(){
   const res=await fetch(endpoint,{headers:{Accept:'application/json'},cache:'no-store'});
   if(!res.ok)throw Error('HTTP '+res.status);
   const payload=await res.json();
   if(payload?.ok!==true||payload.initialized!==true||!payload.data||typeof payload.data!=='object')throw Error('incomplete cloud data');
   const selected={};
   for(const key of keys){
     if(Object.prototype.hasOwnProperty.call(payload.data,key))selected[key]=payload.data[key];
     else if(knownKeys.has(key))throw Error('Partial cloud response; retry without reloading');
   }
   return {hash:hashValue(canonical(selected)),selected};
 }
 async function check(){
   if(busy||refreshing||document.visibilityState==='hidden'||navigator.onLine===false)return;
   busy=true;
   try{
     const incoming=await load();debug.lastCheck=new Date().toISOString();debug.lastError=null;
     if(!checked){checked=true;baseline=incoming.hash;Object.keys(incoming.selected).forEach(k=>knownKeys.add(k));remember(incoming.hash);debug.status='watching';return;}
     if(incoming.hash===baseline){pending=null;debug.status='watching';return;}
     if(seen.includes(incoming.hash)){
       // CDN/API returned a prior, already observed snapshot: do not reload.
       baseline=incoming.hash;pending=null;debug.status='watching';return;
     }
     if(!pending||pending.hash!==incoming.hash){
       pending={hash:incoming.hash,since:Date.now()};debug.status='confirming cloud publication';return;
     }
     if(Date.now()-pending.since<10000){debug.status='confirming cloud publication';return;}
     const verify=await load();
     if(verify.hash!==incoming.hash){pending=null;debug.status='waiting for stable cloud data';return;}
     // Always store the published values before refreshing, to avoid a second
     // initialization reload in app.js when the new page starts.
     for(const [key,value] of Object.entries(verify.selected)){
       try{sessionStorage.setItem('duoduo_cloud_'+key,JSON.stringify(value))}catch(_){}
     }
     remember(baseline);remember(verify.hash);baseline=verify.hash;Object.keys(verify.selected).forEach(k=>knownKeys.add(k));pending=null;
     refreshing=true;debug.status='refreshing';
     if(route==='boss.html'&&typeof window.__ddBossRefreshFresh==='function')window.__ddBossRefreshFresh();
     else {
       let handled=false;
       try{
         if(window.parent!==window&&typeof window.parent.duoduoRefreshCloudFrame==='function')
           handled=window.parent.duoduoRefreshCloudFrame(window)===true;
       }catch(_){}
       if(!handled)location.reload();
     }
   }catch(e){pending=null;debug.status='retrying';debug.lastError=String(e?.message||e)}
   finally{busy=false}
 }
 debug.checkNow=check;
 setTimeout(check,1800);
 setInterval(check,60000);
 let focusTimer=null;
 function scheduleCheck(){
   clearTimeout(focusTimer);focusTimer=setTimeout(check,6000);
 }
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleCheck()});
 window.addEventListener('online',scheduleCheck);
})();
