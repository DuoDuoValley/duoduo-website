/* Official encyclopedia: public published data, static fallback on offline/API failure. */
(async()=>{'use strict';
 const src=window.DuoDuoItemCatalogDefault||{items:[],categories:[]};
 const buff=window.DuoDuoBuffCatalogDefault||{tiers:[],buffs:[]};
 const endpoint=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com/api/site-data':'/api/site-data';
 const controller=new AbortController();const deadline=setTimeout(()=>controller.abort(),5500);
 try{
  const res=await fetch(endpoint,{cache:'no-store',headers:{Accept:'application/json'},signal:controller.signal});
  if(!res.ok)throw Error('HTTP '+res.status);
  const json=await res.json(), data=json?.data?.duoduo_itempedia;
  if(json?.initialized===true&&Array.isArray(data?.items)&&Array.isArray(data?.buffs)&&Array.isArray(data?.categories)&&Array.isArray(data?.tiers)){
   window.DuoDuoItemCatalogDefault={...src,version:data.version||src.version,categories:data.categories,items:data.items};
   window.DuoDuoBuffCatalogDefault={...buff,tiers:data.tiers,buffs:data.buffs};
   window.DuoDuoCloudInitialSnapshot=window.DuoDuoCloudInitialSnapshot||{};
   window.DuoDuoCloudInitialSnapshot.duoduo_itempedia=JSON.stringify(data);
  }
 }catch(err){console.warn('[道具百科] 正式資料讀取失敗，暫用隨網站發布的資料。',err?.message||err)}
 finally{clearTimeout(deadline)}
 function loadScript(path){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=path;s.onload=resolve;s.onerror=reject;document.body.append(s)})}
 try{await loadScript('itempedia/catalog.js?v=20261103-v28');await loadScript('itempedia/buffs.js?v=20261103-v28')}
 catch(err){console.error('[道具百科] 頁面初始化失敗。',err)}
})();
