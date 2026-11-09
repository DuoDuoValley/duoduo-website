/* Owner-only site traffic panel. Never fetch before admin authentication. */
(()=>{'use strict';
 const root=document.getElementById('ddTrafficOverview');
 if(!root)return;
 const siteButtons=[...root.querySelectorAll('[data-traffic-site]')];
 let site='website';
 const api=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
 const status=root.querySelector('[data-traffic-status]');
 const numbers=Object.fromEntries(['todayVisitors','totalVisitors','todayViews','totalViews'].map(k=>[k,root.querySelector('[data-traffic-value="'+k+'"]')]));
 const start=root.querySelector('[data-traffic-since]'),updated=root.querySelector('[data-traffic-updated]'),lastVisit=root.querySelector('[data-traffic-last-visit]');
 const refreshButton=root.querySelector('[data-traffic-refresh]');
 let busy=false,lastSuccess=0,requestSite='';
 const fmt=new Intl.NumberFormat('zh-TW');
 function canRead(){
   if(document.getElementById('duoduo-admin-auth'))return false;
   try{return Boolean(sessionStorage.getItem('duoduo_admin_session'))}catch{return false}
 }
 async function refresh(force=false){
   if(!canRead()||busy)return;
   if(!force&&site===requestSite&&Date.now()-lastSuccess<30000)return;
   busy=true;const requested=site;refreshButton.disabled=true;
   status.textContent='正在讀取流量統計…';
   try{
     const token=sessionStorage.getItem('duoduo_admin_session');
     const res=await fetch(api+'/api/traffic/summary?site='+requested+'&ts='+Date.now(),{cache:'no-store',headers:{Authorization:'Bearer '+token}});
     const payload=await res.json().catch(()=>({}));
     if(!res.ok||payload.ok!==true||payload.site!==requested)throw Error(payload.error||'HTTP '+res.status);
     if(site!==requested)return;
     for(const [key,node] of Object.entries(numbers)){
       const value=payload[key];
       node.textContent=Number.isSafeInteger(value)&&value>=0?fmt.format(value):'—';
     }
     start.textContent=payload.since?'統計起始：'+payload.since.replaceAll('-','/'):'尚未收集到第一筆有效瀏覽紀錄';
     const dateTime=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
     const formatTime=value=>{
       if(typeof value!=='string')return null;
       const date=new Date(value);
       return Number.isFinite(date.getTime())?dateTime.format(date):null;
     };
     const lastVisitTime=formatTime(payload.lastVisitAt);
     lastVisit.textContent=lastVisitTime?'最後訪問：'+lastVisitTime:'最後訪問：尚無有效瀏覽紀錄';
     const refreshTime=formatTime(payload.updatedAt);
     updated.textContent=refreshTime?'統計更新：'+refreshTime:'統計更新：尚未取得時間';
     status.textContent='統計正常 · 台灣時間 UTC+8';
     lastSuccess=Date.now();requestSite=requested;
   }catch(error){
     // Do not turn an unavailable backend into fabricated zeros.
     status.textContent='無法讀取統計：'+String(error.message||error)+'（請確認 Render 已部署統計 API）';
   }finally{busy=false;refreshButton.disabled=false;if(site!==requested)void refresh(true)}
 }
 siteButtons.forEach(button=>button.addEventListener('click',()=>{
   const next=button.dataset.trafficSite;
   if(!['website','checklist'].includes(next)||next===site)return;
   site=next;lastSuccess=0;
   siteButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   for(const el of Object.values(numbers))el.textContent='—';
   start.textContent='載入來源統計中…';lastVisit.textContent='最後訪問：—';updated.textContent='統計更新：—';
   void refresh(true);
 }));
 refreshButton.addEventListener('click',()=>refresh(true));
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&root.closest('.panel')?.classList.contains('active'))refresh()});
 window.addEventListener('duoduo-admin-authenticated',()=>refresh(true));
 setInterval(()=>{if(root.closest('.panel')?.classList.contains('active')&&document.visibilityState!=='hidden')refresh()},30000);
 if(canRead())refresh(true);
})();
