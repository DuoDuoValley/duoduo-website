/* DuoDuo deployment watcher v4.0 — single deployment revision, not asset/CDN ETags.
 * Deployment workflow substitutes BUILD_RUN/BUILD_SHA in the uploaded artifact.
 * One deployed run => at most one automatic reload in this browser tab.
 * BGM shell is the only watcher when browsing embedded public pages.
 */
(()=>{'use strict';
 // A maintenance-preview tab is refreshed manually by the verified admin.
 // This flag is not an authentication bypass; dd-maintenance.js checks Render /api/admin/me.
 try{if(sessionStorage.getItem('duoduo_maintenance_admin_preview_v1')==='1' &&
        sessionStorage.getItem('duoduo_admin_session'))return;}catch(_){}

 const BUILD_RUN=Number('__DD_BUILD_RUN__');
 const BUILD_SHA='__DD_BUILD_SHA__';
 const script=document.currentScript;
 if(!script?.src)return;
 const root=new URL('./',script.src);
 if(location.origin!==root.origin||!location.pathname.startsWith(root.pathname))return;
 if(document.documentElement.classList.contains('dd-bgm-embed'))return;
 try{
   if(window!==window.top &&
      (window.parent.DuoDuoSiteUpdate?.active || window.parent.document.getElementById('duoduoSite')))return;
 }catch(_){}
 const KEY='duoduo_site_deployment_seen_v4:'+root.pathname;
 const debug={active:true,revision:'v4.0',mode:'deployment-run',buildRun:BUILD_RUN,
   status:'initializing',checkedAt:null,lastError:null,remoteRun:null,lastChange:null};
 window.DuoDuoSiteUpdate=debug;
 let seen=[BUILD_RUN], busy=false, refreshing=false, candidate=null, confirmationTimer=null;
 try{
   const raw=JSON.parse(sessionStorage.getItem(KEY)||'[]');
   if(Array.isArray(raw))seen=[...new Set([...raw.filter(x=>Number.isInteger(x)&&x>0),BUILD_RUN])].slice(-24);
 }catch(_){}
 function saveSeen(run){
   if(!seen.includes(run))seen.push(run);
   seen=seen.slice(-24);
   try{sessionStorage.setItem(KEY,JSON.stringify(seen))}catch(_){}
 }
 function deployedVersionURL(){
   const u=new URL('dd-release.json',root);
   u.searchParams.set('_dd_check',String(Date.now()));
   return u.href;
 }
 async function readRemote(){
   const response=await fetch(deployedVersionURL(),{cache:'no-store',credentials:'same-origin'});
   if(!response.ok)throw Error('部署版本查詢 HTTP '+response.status);
   const payload=await response.json();
   const run=Number(payload?.run),sha=String(payload?.sha||'');
   if(!Number.isSafeInteger(run)||run<1||!/^[a-f0-9]{40}$/i.test(sha))throw Error('尚無有效的部署版號');
   return {run,sha};
 }
 function scheduleConfirmation(){
   if(confirmationTimer!==null)clearTimeout(confirmationTimer);
   confirmationTimer=setTimeout(()=>{
     confirmationTimer=null;
     if(document.visibilityState!=='hidden')check();
   },12000);
 }
 function cancelConfirmation(){
   if(confirmationTimer!==null){clearTimeout(confirmationTimer);confirmationTimer=null;}
 }
 function isNewer(r){return r.run>BUILD_RUN&&r.sha!==BUILD_SHA&&!seen.includes(r.run)}
 async function check(){
   if(busy||refreshing||document.visibilityState==='hidden'||navigator.onLine===false)return;
   if(!(BUILD_RUN>0)&&BUILD_SHA==='__DD_BUILD_SHA__'){
     debug.status='not-stamped (needs GitHub Actions deployment)';return;
   }
   busy=true;
   try{
     const remote=await readRemote();
     debug.checkedAt=new Date().toISOString();debug.remoteRun=remote.run;debug.lastError=null;
     if(!isNewer(remote)){
       candidate=null;cancelConfirmation();debug.status='up-to-date';return;
     }
     // Compare the same *deployment identifier* twice, separated in time.
     if(!candidate||candidate.run!==remote.run||candidate.sha!==remote.sha){
       candidate={...remote,firstSeen:Date.now()};scheduleConfirmation();debug.status='confirming deployment';return;
     }
     if(Date.now()-candidate.firstSeen<10000){scheduleConfirmation();debug.status='confirming deployment';return;}
     // An independent second request is essential during GitHub Pages propagation.
     const confirmed=await readRemote();
     if(confirmed.run!==remote.run||confirmed.sha!==remote.sha){candidate=null;cancelConfirmation();debug.status='waiting for stable deployment';return;}
     if(!isNewer(confirmed))return;
     refreshing=true;cancelConfirmation();saveSeen(confirmed.run);
     debug.status='refreshing';debug.lastChange='GitHub Pages deployment '+confirmed.run;
     // Make the next navigation use the newly deployed watcher, if available.
     try{await fetch(new URL('dd-site-update.js',root),{cache:'reload',credentials:'same-origin'})}catch(_){}
     try{if(typeof window.duoduoPrepareForUpdate==='function')window.duoduoPrepareForUpdate()}catch(_){}
     const url=new URL(location.href);url.searchParams.set('ddv',String(confirmed.run));
     try{
       if(window!==window.top&&window.parent.location.origin===location.origin){
         const outer=new URL(window.parent.location.href);outer.searchParams.set('ddv',String(confirmed.run));
         window.parent.location.replace(outer.href);return;
       }
     }catch(_){}
     location.replace(url.href);
   }catch(error){
     candidate=null;cancelConfirmation();debug.status='retrying';debug.lastError=String(error?.message||error);
   }finally{busy=false;}
 }
 debug.checkNow=check;
 saveSeen(BUILD_RUN);
 setTimeout(check,2000);
 setInterval(check,60000);
 // Returning to a tab is not itself an update. Schedule a normal version check.
 let focusTimer=null;
 function scheduleCheck(){
   if(focusTimer!==null)clearTimeout(focusTimer);
   focusTimer=setTimeout(()=>{focusTimer=null;check()},4000);
 }
 document.addEventListener('visibilitychange',()=>{
   if(document.visibilityState!=='hidden')scheduleCheck();
 });
 window.addEventListener('online',scheduleCheck);
})();
