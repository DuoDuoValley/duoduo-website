/* Official item encyclopedia: publicly readable; authoritative edits via authenticated backend. */
(()=>{'use strict';
 const endpoint=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com/api/site-data':'/api/site-data';
 const defaults={version:1,items:window.DuoDuoItemCatalogDefault,buffs:window.DuoDuoBuffCatalogDefault};
 window.DuoDuoItempedia={data:defaults,loaded:false,loadError:null};
 const valid=x=>x&&Array.isArray(x.items?.items)&&Array.isArray(x.items?.categories)&&Array.isArray(x.buffs?.buffs)&&Array.isArray(x.buffs?.tiers);
 const publish=data=>{if(!valid(data))return;window.DuoDuoItempedia.data=data;window.DuoDuoItempedia.loaded=true;window.dispatchEvent(new CustomEvent('duoduo-itempedia-data',{detail:data}));};
 (async()=>{try{const res=await fetch(endpoint,{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);const obj=await res.json();if(obj?.ok&&valid(obj?.data?.duoduo_itempedia))publish(obj.data.duoduo_itempedia);else window.DuoDuoItempedia.loaded=true;}catch(e){window.DuoDuoItempedia.loadError=String(e.message||e);}})();
})();
