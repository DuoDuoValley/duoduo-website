/* DuoDuo deployment watcher v2.1 (2026-10-30)
   Prefer a generated commit SHA (Jekyll/CI); GitHub Pages Actions may serve
   dd-release.txt as raw Liquid text, so also watch response validators of the
   live static files actually used by the page. Never reload on an HTTP error,
   missing response validators, or the user's BGM cloud-data changes. */
(()=>{'use strict';
 const script=document.currentScript;
 if(!script?.src)return;
 const root=new URL('./',script.src);
 const current=new URL(location.href);
 if(current.origin!==root.origin||!current.pathname.startsWith(root.pathname))return;
 if(document.documentElement.classList.contains('dd-bgm-embed'))return;
 try{if(window!==window.top && window.parent.DuoDuoSiteUpdate?.active)return;}catch{}
 const shell=window===window.top&&!!document.getElementById('duoduoSite');
 const revisionKey='dd_site_revision_v2:'+root.pathname;
 const signaturesKey='dd_site_signatures_v2:'+root.pathname;
 const debug={active:true,mode:'starting',status:'initializing',checkedAt:null,watched:0,lastChange:null,lastError:null};
 window.DuoDuoSiteUpdate=debug;
 const sha=/^[0-9a-f]{40}$/i;
 // Shared assets are checked from every page. Route-specific files are
 // checked while that page is visible, avoiding ~30 HEAD requests/minute per
 // visitor when most of the site is not in use.
 const sharedPaths=['dd-release.txt','index.html','dd-site-update.js','styles.css',
   'dd-navigation.css','dd-navigation.js','dd-nav-data.js','app.js','dd-maintenance.js'];
 const routeAssets={
   'jobs/':['jobs/jobs.html','jobs/jobs.css','jobs/jobs.js','jobs/jobs-data.js',
     'jobs/jobs-header.css','jobs/jobs-header.js','jobs/jobs-hero-banner.webp'],
   'player-tools/':['player-tools/index.html','player-tools/styles.css',
     'player-tools/app.js','player-tools/systems.js','player-tools/data.js','player-tools/systems-data.js'],
   'boss.html':['boss.html','boss-atlas.js','boss-atlas.css','boss-challenge.js','boss-challenge.css'],
   'ops-c62e9f4a173b.html':['ops-c62e9f4a173b.html','admin.js','admin.css','dd-navigation-admin.js']
 };
 function currentRoute(){
   let url=location;
   if(shell){
     try{const frame=document.getElementById('duoduoSite');
       if(frame?.contentWindow?.location.origin===root.origin)url=frame.contentWindow.location;
     }catch{}
   }
   let path='';
   try{path=decodeURI(url.pathname).slice(decodeURI(root.pathname).length);}catch{}
   return path;
 }
 function pathsToCheck(){
   const paths=new Set(sharedPaths),route=currentRoute();
   if(route.startsWith('jobs/'))routeAssets['jobs/'].forEach(p=>paths.add(p));
   else if(route.startsWith('player-tools/'))routeAssets['player-tools/'].forEach(p=>paths.add(p));
   else if(routeAssets[route])routeAssets[route].forEach(p=>paths.add(p));
   else if(route&&/^[\w./%-]+$/.test(route)&&!route.includes('..'))paths.add(route);
   return [...paths];
 }
 function cacheURL(relative){const u=new URL(relative,root);u.searchParams.set('_dd_check',Date.now().toString());return u.href;}
 function store(key,value){try{sessionStorage.setItem(key,value)}catch{}}
 function load(key){try{return sessionStorage.getItem(key)||''}catch{return''}}
 async function getCommit(){
   const r=await fetch(cacheURL('dd-release.txt'),{cache:'no-store',credentials:'same-origin'});
   if(!r.ok) return null;
   const txt=(await r.text()).trim();
   return sha.test(txt)?txt.toLowerCase():null;
 }
 function digest(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
 async function signature(path){
   const opts={method:'HEAD',cache:'no-store',credentials:'same-origin'};
   let r=await fetch(cacheURL(path),opts);
   if(!r.ok)throw new Error('probe '+path+' HTTP '+r.status);
   let tag=r.headers.get('etag')||'';
   let mod=r.headers.get('last-modified')||'';
   let len=r.headers.get('content-length')||'';
   // Some static hosts send no validators. Content hashing avoids a false
   // 'everything unchanged' result in that case; bounded to small text files.
   if(!tag&&!mod){
     r=await fetch(cacheURL(path),{cache:'no-store',credentials:'same-origin'});
     if(!r.ok)throw new Error('read '+path+' HTTP '+r.status);
     const bytes=await r.arrayBuffer();
     // Hash bytes (not text) to handle images as well as JS, CSS and HTML.
     let h=2166136261;const b=new Uint8Array(bytes);
     for(let i=0;i<b.length;i++){h^=b[i];h=Math.imul(h,16777619);}
     return 'body:'+(h>>>0).toString(36)+':'+b.length;
   }
   return tag?'etag:'+tag:'modified:'+mod+':'+len;
 }
 async function getSignatures(){
   const paths=pathsToCheck();
   // A failed HEAD must NOT replace an existing fingerprint with an error page.
   const results=await Promise.allSettled(paths.map(p=>signature(p)));
   const all={};let failed=0;
   for(let i=0;i<paths.length;i++){
     if(results[i].status==='fulfilled')all[paths[i]]=results[i].value;
     else failed++;
   }
   if(!Object.keys(all).length)throw new Error('no site files available');
   debug.watched=Object.keys(all).length;
   return {all,failed};
 }
 async function refreshFiles(){
   // Prime the browser cache with the actual asset URLs before reloading the
   // outer player shell, so CSS/JS do not stay stale for the cache TTL.
   const paths=pathsToCheck();
   await Promise.allSettled(paths.map(p=>fetch(new URL(p,root).href,{cache:'reload',credentials:'same-origin'})));
 }
 function nextURL(version){
   const u=new URL(location.href);
   u.searchParams.set('ddv',version.replace(/[^a-z\d]/gi,'').slice(0,16));
   return u.href;
 }
 let busy=false,restarting=false;
 async function restart(version,why){
   if(restarting)return;
   restarting=true;debug.status='refreshing';debug.lastChange=why;
   await refreshFiles();
   try{
     if(typeof window.duoduoPrepareForUpdate==='function')window.duoduoPrepareForUpdate();
     else if(window!==window.top&&typeof window.parent.duoduoPrepareForUpdate==='function')window.parent.duoduoPrepareForUpdate();
   }catch{}
   if(window!==window.top){
     try{if(window.parent.location.origin===location.origin){
       const parentURL=new URL(window.parent.location.href);
       parentURL.searchParams.set('ddv',version.replace(/[^a-z\d]/gi,'').slice(0,16));
       window.parent.location.replace(parentURL.href);
       return;
     }}catch{}
   }
   location.replace(nextURL(version));
 }
 async function check(){
   if(busy||restarting||document.visibilityState==='hidden'||!navigator.onLine)return;
   busy=true;debug.lastError=null;
   try{
     const commit=await getCommit();
     debug.mode=commit?'commit-sha':'static-files';
     if(commit){
       const old=load(revisionKey);
       if(old&&old!==commit){
         // Save just before restart, not during a failed probe.
         store(revisionKey,commit);
         await restart(commit,'GitHub commit changed');
         return;
       }
       if(!old)store(revisionKey,commit);
       debug.status='watching';
     }else{
       const snapshot=await getSignatures();
       let previous={};try{previous=JSON.parse(load(signaturesKey)||'{}')||{}}catch{}
       const changed=Object.keys(snapshot.all).filter(k=>previous[k]&&previous[k]!==snapshot.all[k]);
       // Do not erase validator entries on temporary 404/timeout.
       store(signaturesKey,JSON.stringify({...previous,...snapshot.all}));
       if(changed.length){
         await restart('s'+digest(changed.map(k=>snapshot.all[k]).join('|')),'Changed: '+changed.join(', '));
         return;
       }
       debug.status=snapshot.failed?'watching (some checks will retry)':'watching';
     }
     debug.checkedAt=new Date().toISOString();
   }catch(error){
     debug.status='retrying';debug.lastError=String(error?.message||error);
     console.warn('多多谷官網更新偵測稍後重試',error);
   }finally{busy=false;}
 }
 debug.checkNow=check;
 setTimeout(check,1800);
 setInterval(check,60000);
 window.addEventListener('online',check);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
})();
