/* DuoDuo deployment revision watcher. GitHub Pages (Jekyll branch publishing)
   replaces the Liquid token in dd-release.txt with the current commit SHA.
   Unlike old HTML-only watchers this changes on a CSS/JS/data-only commit.
   Does not read/write administrator cloud content. */
(()=>{'use strict';
 const script=document.currentScript;
 if(!script?.src)return;
 const root=new URL('./',script.src);
 const release=new URL('dd-release.txt',root);
 const marker='duoduo_git_release_v1:'+root.pathname;
 const ownPath=new URL(location.href);
 if(ownPath.origin!==root.origin||!ownPath.pathname.startsWith(root.pathname))return;
 const isOuter=window===window.top && !!document.getElementById('duoduoSite');
 if(document.documentElement.classList.contains('dd-bgm-embed'))return; // External Checklist embed keeps its existing player update policy.
 let busy=false,restarting=false;
 const sha=/^[0-9a-f]{40}$/i;
 async function getRelease(){
  const url=new URL(release.href);url.searchParams.set('_dd_check',Date.now().toString());
  const res=await fetch(url.href,{cache:'no-store',credentials:'same-origin'});
  if(!res.ok)throw new Error('release status '+res.status);
  const value=(await res.text()).trim();
  return sha.test(value)?value.toLowerCase():null;
 }
 async function refreshFiles(){
  // Fetch real asset URLs with cache:'reload', otherwise reloading HTML alone
  // can reuse old CSS/JS served with a 10-minute browser cache lifetime.
  const paths=['styles.css','dd-navigation.css','dd-navigation.js','dd-nav-data.js','dd-navigation-admin.js','dd-site-update.js','app.js',
   'admin.css','admin.js','jobs/jobs.css','jobs/jobs.js','jobs/jobs-data.js',
   'jobs/jobs-header.css','jobs/jobs-header.js',
   'player-tools/styles.css','player-tools/app.js','player-tools/systems.js',
   'player-tools/data.js','player-tools/systems-data.js',
   'boss-atlas.js','boss-challenge.js',
   'index.html','home.html','news.html','events.html','event-detail.html',
   'boss.html','guide.html','downloads.html','jobs/jobs.html','player-tools/index.html','admin.html'];
  await Promise.allSettled(paths.map(path=>fetch(new URL(path,root).href,{
   cache:'reload',credentials:'same-origin'})));
 }
 function nextUrl(version){const u=new URL(location.href);
  // Leave the music shell's ?page=... route intact.
  u.searchParams.set('ddv',version.slice(0,12));return u.href;
 }
 async function check(){
  if(busy||restarting||document.visibilityState==='hidden'||!navigator.onLine)return;
  busy=true;
  try{
   const version=await getRelease();
   if(!version)return; // Local preview, .nojekyll, or Actions static deployment: do not reload-loop.
   let previous='';try{previous=sessionStorage.getItem(marker)||''}catch{}
   if(!previous){try{sessionStorage.setItem(marker,version)}catch{};return;}
   if(previous===version)return;
   restarting=true;
   // Only persist after refresh is actually being started, so a failed fetch
   // does not silently declare an obsolete page up to date.
   await refreshFiles();
   try{sessionStorage.setItem(marker,version)}catch{}
   try{
    if(isOuter && typeof window.duoduoPrepareForUpdate==='function')window.duoduoPrepareForUpdate();
    else if(window!==window.top&&typeof window.parent.duoduoPrepareForUpdate==='function')window.parent.duoduoPrepareForUpdate();
   }catch{}
   if(window!==window.top){
    try{if(window.parent.location.origin===location.origin){
      const parentUrl=new URL(window.parent.location.href);parentUrl.searchParams.set('ddv',version.slice(0,12));window.parent.location.replace(parentUrl.href);
      return;
    }}catch{}
   }
   location.replace(nextUrl(version));
  }catch(err){console.warn('官網版本偵測稍後重試',err)}finally{busy=false;}
 }
 // The normal shell source watcher remains as fallback; the revision watcher
 // is the source of truth for ALL file changes on GitHub Pages.
 setTimeout(check,1800);
 setInterval(check,60000);
 window.addEventListener('online',check);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
})();
