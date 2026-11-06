/* DuoDuo Itempedia: confirmed published data; static fallback with live recovery. */
(async()=>{'use strict';
 const originalItems=window.DuoDuoItemCatalogDefault||{items:[],categories:[]};
 const originalBuffs=window.DuoDuoBuffCatalogDefault||{tiers:[],buffs:[]};
 const endpoint=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com/api/site-data':'/api/site-data';
 let initialized=false,busy=false,lastPublished='';
 async function readPublished(timeout=5500){
  const controller=new AbortController();const deadline=setTimeout(()=>controller.abort(),timeout);
  try{
   const response=await fetch(endpoint,{cache:'no-store',headers:{Accept:'application/json'},signal:controller.signal});
   if(!response.ok)throw Error('HTTP '+response.status);
   const payload=await response.json(),data=payload?.data?.duoduo_itempedia;
   if(payload?.ok!==true||payload.initialized!==true||!Array.isArray(data?.items)||!Array.isArray(data?.buffs)||!Array.isArray(data?.categories)||!Array.isArray(data?.tiers))throw Error('incomplete published itempedia');
   return data;
  }finally{clearTimeout(deadline)}
 }
 function publish(data){
  const signature=JSON.stringify(data);
  if(signature===lastPublished)return;
  lastPublished=signature;
  window.DuoDuoItemCatalogDefault={...originalItems,version:data.version||originalItems.version,categories:data.categories,items:data.items};
  window.DuoDuoBuffCatalogDefault={...originalBuffs,tiers:data.tiers,buffs:data.buffs};
  window.DuoDuoCloudInitialSnapshot=window.DuoDuoCloudInitialSnapshot||{};
  window.DuoDuoCloudInitialSnapshot.duoduo_itempedia=signature;
  if(initialized){
   window.DuoDuoPediaApplyCatalog?.(data);
   window.DuoDuoPediaApplyBuffs?.(data);
  }
 }
 try{publish(await readPublished())}
 catch(err){console.warn('[道具百科] 正式資料讀取失敗，暫用隨網站發布的資料，將自動重試。',err?.message||err)}
 function loadScript(path){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=path;s.onload=resolve;s.onerror=reject;document.body.append(s)})}
 try{
  await loadScript('itempedia/catalog.js?v=20261106-cloud-recover-1');
  await loadScript('itempedia/buffs.js?v=20261106-cloud-recover-1');
  initialized=true;
 }catch(err){console.error('[道具百科] 頁面初始化失敗。',err)}
 async function recheck(){
  if(busy||document.visibilityState==='hidden'||navigator.onLine===false)return;
  busy=true;
  try{publish(await readPublished(8500))}
  catch(err){console.warn('[道具百科] 雲端重試稍後繼續。',err?.message||err)}
  finally{busy=false}
 }
 window.DuoDuoPediaRefresh=recheck;
 // Continue retrying after first-load timeout; recovered data replaces the
 // fallback in-place without resetting the search, category, or display mode.
 setInterval(recheck,45000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')recheck()});
 window.addEventListener('online',recheck);
 if(!lastPublished)setTimeout(recheck,9000);
})();
