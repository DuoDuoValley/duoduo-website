/* Anonymous traffic count for the outer site shell and direct standalone pages.
 * No tracking pixels, cookies, IP or third-party analytics. */
(()=>{'use strict';
 if(window.DuoDuoTraffic)return;
 if(window.top!==window)return; // Never count embedded official subpages or BGM.
 if(location.pathname.includes('/ops-')||location.pathname.endsWith('/admin.html'))return;
 const API=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
 const KEY='duoduo_anonymous_visitor_v1';
 const hex=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
 function getVisitor(){
   for(const storage of [localStorage,sessionStorage]){
     try{
       let id=storage.getItem(KEY);
       if(!/^[a-f0-9]{32}$/i.test(id||'')){id=hex();storage.setItem(KEY,id)}
       return id;
     }catch(_){}
   }
   return hex();
 }
 const visitorId=getVisitor();
 let last=0;
 function pageview(){
   if(!navigator.onLine)return;
   const time=Date.now();
   if(time-last<500)return;
   last=time;
   const body=JSON.stringify({visitorId,viewId:hex()});
   fetch(API+'/api/traffic/record',{method:'POST',headers:{'Content-Type':'application/json'},body,cache:'no-store',keepalive:true})
     .catch(()=>{}); // Never interrupt the visitor if analytics is offline.
 }
 window.DuoDuoTraffic={pageview};
 // Automatic reloads and browser refreshes should not count as new visits.
 const navigation=performance.getEntriesByType?.('navigation')?.[0];
 if(navigation?.type!=='reload')pageview();
})();
