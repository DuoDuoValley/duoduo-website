/* Outer-shell persistent YouTube dock. The iframe exists exactly once per video. */
(()=>{'use strict';
 if(document.documentElement.classList.contains('dd-bgm-embed'))return;
 if(window.DuoDuoPersistentVideo)return;
 const shell=document.getElementById('duoduoSite');
 if(!shell)return;
 const dock=document.createElement('section');
 dock.id='ddPersistentVideo';dock.hidden=true;
 dock.setAttribute('role','region');dock.setAttribute('aria-label','多多谷常駐 BOSS 攻略影片');
 dock.innerHTML='<div class="dd-video-toolbar"><span class="dd-video-indicator" aria-hidden="true">▶</span><span class="dd-video-title" id="ddPersistentVideoTitle">BOSS 攻略影片</span><div class="dd-video-actions"><button type="button" class="dd-video-toggle" id="ddPersistentVideoToggle" aria-expanded="false">⤢ 放大播放</button><button type="button" id="ddPersistentVideoClose" aria-label="關閉影片並停止播放">×</button></div></div><div class="dd-video-stage" id="ddPersistentVideoStage"></div><div class="dd-video-footer"><a href="https://www.youtube.com/" id="ddPersistentVideoLink" target="_blank" rel="noopener noreferrer">前往 YouTube 原影片 ↗</a><span>切換官網頁面不會中斷影片</span></div>';
 document.body.appendChild(dock);
 const title=dock.querySelector('#ddPersistentVideoTitle');
 const stage=dock.querySelector('#ddPersistentVideoStage');
 const link=dock.querySelector('#ddPersistentVideoLink');
 const toggle=dock.querySelector('#ddPersistentVideoToggle');
 const close=dock.querySelector('#ddPersistentVideoClose');
 let activeId='';
 function validId(id){return typeof id==='string'&&/^[A-Za-z0-9_-]{11}$/.test(id)}
 function syncToggle(){
   const expanded=dock.classList.contains('dd-video-expanded');
   toggle.textContent=expanded?'↙ 縮成迷你視窗':'⤢ 放大播放';
   toggle.setAttribute('aria-expanded',String(expanded));
 }
 function minimize(){
   if(dock.hidden)return;
   dock.classList.remove('dd-video-expanded');
   syncToggle();updatePosition();
 }
 function measureTop(node){
   if(!node||getComputedStyle(node).display==='none')return null;
   const rect=node.getBoundingClientRect();
   return rect.width>0&&rect.height>0?rect.top:null;
 }
 function updatePosition(){
   if(dock.hidden)return;
   const bgmTop=measureTop(document.body.classList.contains('collapsed')?document.getElementById('mini'):document.getElementById('player'));
   const bottom=bgmTop===null?100:Math.max(88,Math.round(innerHeight-bgmTop+12));
   // If the BGM panel is expanded on a short screen, reduce the dock's
   // footprint instead of letting the two players cover each other.
   const available=Math.max(130,innerHeight-bottom-12);
   const maxWidth=innerWidth<=520?300:355;
   const compactWidth=Math.max(145,Math.floor((available-77)*16/9));
   dock.style.setProperty('--dd-video-dock-width',Math.min(maxWidth,compactWidth)+'px');
   dock.style.setProperty('--dd-video-dock-bottom',bottom+'px');
 }
 function play(id,videoTitle){
   if(!validId(id))return false;
   const same=activeId===id&&stage.querySelector('iframe');
   if(!same){
     const iframe=document.createElement('iframe');
     iframe.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&playsinline=1';
     iframe.title='YouTube BOSS 攻略影片';
     iframe.referrerPolicy='strict-origin-when-cross-origin';
     iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
     iframe.allowFullscreen=true;
     stage.replaceChildren(iframe);
     activeId=id;
     dock.classList.add('dd-video-expanded');
   }
   title.textContent=String(videoTitle||'BOSS 攻略影片').slice(0,180);
   link.href='https://www.youtube.com/watch?v='+id;
   dock.hidden=false;
   syncToggle();updatePosition();
   return true;
 }
 function updateMetadata(id,text){
   if(activeId===id&&typeof text==='string'&&text.trim())title.textContent=text.trim().slice(0,180);
 }
 function stop(){
   dock.hidden=true;
   dock.classList.remove('dd-video-expanded');
   stage.replaceChildren();activeId='';
   syncToggle();
 }
 toggle.addEventListener('click',()=>{
   if(dock.hidden)return;
   dock.classList.toggle('dd-video-expanded');
   syncToggle();updatePosition();
 });
 close.addEventListener('click',stop);
 document.addEventListener('keydown',e=>{
   if(e.key==='Escape'&&!dock.hidden&&dock.classList.contains('dd-video-expanded'))minimize();
 });
 const observer=new MutationObserver(updatePosition);
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
 for(const id of ['player','mini']){
   const el=document.getElementById(id);
   if(el){observer.observe(el,{attributes:true,attributeFilter:['style','class','hidden']});
     if('ResizeObserver' in window)new ResizeObserver(updatePosition).observe(el);}
 }
 window.addEventListener('resize',updatePosition,{passive:true});
 // Expose only a small, same-origin API to the currently displayed guide iframe.
 function fromGuideFrame(){
   try{return shell.contentWindow?.location?.pathname?.endsWith('/boss-guides.html')===true}
   catch{return false}
 }
 window.DuoDuoPersistentVideo={
   playFromGuide(source,id,text){
     if(source!==shell.contentWindow||!fromGuideFrame())return false;
     return play(id,text);
   },
   metadataFromGuide(source,id,text){
     if(source!==shell.contentWindow||!fromGuideFrame())return false;
     updateMetadata(id,text);return true;
   },
   minimizeOnNavigation:minimize,
   get isPlaying(){return !dock.hidden&&!!activeId}
 };
})();
