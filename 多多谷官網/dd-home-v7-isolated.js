/* Approved HOME v7 story and heading animation; never override scroll/wheel. */
/* DuoDuo HOME v2 visual prototype. Native scrolling stays in full control.
   All animation follows read-only scroll position, never intercepts wheel events.
   No cloud/API/localStorage calls; production home stays unchanged. */
(() => {
  'use strict';
  const root = document.querySelector('.story-run');
  const stage = document.querySelector('.story-stage');
  if (!root || !stage) return;
  const $ = q => document.querySelector(q);
  const clamp = n => Math.max(0,Math.min(1,n));
  const smooth = (a,b,x) => { const t=clamp((x-a)/(b-a)); return t*t*(3-2*t); };
  const lerp = (a,b,x) => a+(b-a)*x;
  const set = (el,styles) => {if(el) Object.assign(el.style,styles);};
  const cards=[...document.querySelectorAll('.float-card')];
  const features=[...document.querySelectorAll('.feature-card')];
  const ring=$('.night-art');
  const stepLabel=$('.story-step');
  const indicator=$('.story-progress i');
  const scrollHint=$('.scroll-hint');
  const cinema=$('.v2-cinematic');
  const cinemaVideo=$('.v2-cinema-video');
  const cinemaCopy=$('.v2-cinema-copy');
  const cinemaProgress=$('.v2-cinema-progress i');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frame=0;
  let last=performance.now();
  let visualProgress=0;
  let targetProgress=0;

  function scrollProgress(section,pin){
    const rect=section.getBoundingClientRect();
    return clamp(-rect.top/Math.max(1,rect.height-pin));
  }
  function paintStory(x){
    const introExit=smooth(.055,.225,x);
    const orbitIn=smooth(.105,.235,x);
    const orbitOut=smooth(.385,.495,x);
    const nightIn=smooth(.418,.54,x);
    const nightOut=smooth(.655,.775,x);
    const finalIn=smooth(.706,.852,x);
    const orb=orbitIn*(1-orbitOut);
    const dark=nightIn*(1-nightOut);
    set($('.scene-opening'),{opacity:String(1-introExit),transform:`translate3d(0,${(-48*introExit).toFixed(1)}px,0) scale(${lerp(1,.87,introExit).toFixed(3)})`});
    set($('.scene-orbit'),{opacity:String(orb),transform:`translate3d(0,${(24*(1-orbitIn)-24*orbitOut).toFixed(1)}px,0)`});
    set($('.scene-night'),{opacity:String(dark),transform:`translate3d(0,${(40*(1-nightIn)-42*nightOut).toFixed(1)}px,0)`});
    set($('.scene-final'),{opacity:String(finalIn),transform:`translate3d(0,${(36*(1-finalIn)).toFixed(1)}px,0)`});
    set($('.ambient-night'),{opacity:String(dark)});
    set($('.ambient-sunrise'),{opacity:String(finalIn)});
    if(stepLabel)stepLabel.textContent=x<.22?'01 / 04':x<.48?'02 / 04':x<.75?'03 / 04':'04 / 04';
    if(indicator)indicator.style.width=`${(x*100).toFixed(2)}%`;
    if(scrollHint)scrollHint.style.opacity=x<.1?'1':String((1-smooth(.1,.2,x))*.7);
    const offsets=[[-145,40],[80,-105],[-65,135],[145,62]];
    cards.forEach((card,i)=>{
      const v=smooth(.145+i*.022,.275+i*.018,x);
      const off=smooth(.382+i*.003,.477+i*.006,x);
      const show=v*(1-off);
      const [dx,dy]=offsets[i];
      set(card,{opacity:String(show),transform:`translate3d(${(dx*(1-v)+(-dx*.27)*off).toFixed(1)}px,${(dy*(1-v)-60*off).toFixed(1)}px,0) rotate(${((i%2?-5:5)*(1-v)+((i%2?-3:3)*off)).toFixed(2)}deg) scale(${(lerp(.83,1,v)*(1-.08*off)).toFixed(3)})`});
    });
    if(ring)ring.style.transform=`rotate(${lerp(-28,53,smooth(.42,.73,x)).toFixed(1)}deg) scale(${lerp(.84,1,smooth(.4,.58,x)).toFixed(3)})`;
    features.forEach((card,i)=>{
      const v=smooth(.755+i*.026,.875+i*.025,x);
      set(card,{opacity:String(v),transform:`translate3d(${((i-1)*88*(1-v)).toFixed(1)}px,${(120*(1-v)).toFixed(1)}px,0) rotate(${((i-1)*5*(1-v)).toFixed(1)}deg) scale(${lerp(.89,1,v).toFixed(3)})`});
    });
  }
  function paintCinema(){
    if(!cinema)return;
    const p=scrollProgress(cinema,innerHeight-(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header'))||72));
    const mobile=innerWidth<=760;
    if(mobile){
      if(cinemaProgress)cinemaProgress.style.width=`${(p*100).toFixed(1)}%`;
      return;
    }
    const v=smooth(0,.35,p);
    const cp=smooth(.16,.41,p);
    set(cinemaVideo,{opacity:String(.55+.45*v),transform:`scale(${(1.05-.05*v).toFixed(3)})`});
    set(cinemaCopy,{opacity:String(cp),transform:`translateY(${(35-35*cp).toFixed(1)}px)`});
    if(cinemaProgress)cinemaProgress.style.width=`${(p*100).toFixed(2)}%`;
  }
  // Follow the scroll position smoothly, but never hold or delay native scrolling.
  function tick(now){
    frame=0;
    if(document.hidden)return;
    const dt=Math.min(64,Math.max(1,now-last));
    last=now;
    const active=root.getBoundingClientRect().bottom>-100&&root.getBoundingClientRect().top<innerHeight+100;
    targetProgress=scrollProgress(root,stage.getBoundingClientRect().height);
    const easing=reduced?1:(1-Math.exp(-dt/95));
    visualProgress += (targetProgress-visualProgress)*easing;
    if(Math.abs(visualProgress-targetProgress)<.0003)visualProgress=targetProgress;
    if(active)paintStory(visualProgress);
    paintCinema();
    if(active&&visualProgress!==targetProgress)request();
  }
  function request(){if(!frame){last=performance.now();frame=requestAnimationFrame(tick)}}
  const themeButton=$('#themeToggle');
  const rootEl=document.documentElement;
  if(matchMedia('(prefers-color-scheme:dark)').matches)rootEl.dataset.theme='dark';
  themeButton?.addEventListener('click',()=>{
    rootEl.dataset.theme=rootEl.dataset.theme==='dark'?'light':'dark';
    themeButton.setAttribute('aria-label',rootEl.dataset.theme==='dark'?'切換為淺色模式':'切換為深色模式');
  });
  // Interactive FAQ: only one expanded answer so the layout stays easy to scan.
  document.querySelectorAll('.v2-faq-list details').forEach(detail=>{
    detail.addEventListener('toggle',()=>{
      if(detail.open)document.querySelectorAll('.v2-faq-list details').forEach(other=>{if(other!==detail)other.open=false});
    });
  });
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
    }),{threshold:.1,rootMargin:'0px 0px -4% 0px'});
    document.querySelectorAll('.reveal').forEach(node=>observer.observe(node));
  }else document.querySelectorAll('.reveal').forEach(node=>node.classList.add('is-visible'));
  const playVideo=()=>{if(!cinemaVideo)return;const pending=cinemaVideo.play();if(pending&&pending.catch)pending.catch(()=>{})};
  let cinemaInView=false;
  let cinemaFrame=0;
  const cinemaLooksVisible=()=>{
    if(!cinema) return false;
    const rect=cinema.getBoundingClientRect();
    return rect.top < innerHeight*0.92 && rect.bottom > innerHeight*0.14;
  };
  const syncCinemaPlayback=()=>{
    if(!cinemaVideo) return;
    if(reduced){cinemaVideo.pause();cinemaVideo.removeAttribute('autoplay');return;}
    const shouldPlay=!document.hidden && (cinemaInView || cinemaLooksVisible());
    if(shouldPlay){
      cinemaVideo.muted=true; cinemaVideo.playsInline=true; cinemaVideo.loop=true; cinemaVideo.autoplay=true;
      playVideo();
    }else if(!cinemaVideo.paused){
      cinemaVideo.pause();
    }
  };
  const queueCinemaSync=()=>{
    if(cinemaFrame) return;
    cinemaFrame=requestAnimationFrame(()=>{cinemaFrame=0;syncCinemaPlayback();});
  };
  if(cinemaVideo){
    cinemaVideo.muted=true;cinemaVideo.playsInline=true;cinemaVideo.loop=true;
    cinemaVideo.setAttribute('preload','auto');
    if(reduced){cinemaVideo.pause();cinemaVideo.removeAttribute('autoplay')}
    else if('IntersectionObserver' in window){
      const movieObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
        cinemaInView=!!e.isIntersecting;
        syncCinemaPlayback();
      }),{rootMargin:'250px 0px'});
      movieObserver.observe(cinema);
    }else playVideo();
    ['loadeddata','canplay','canplaythrough','playing','pageshow'].forEach(evt=>addEventListener(evt,queueCinemaSync,{passive:true}));
    cinemaVideo.addEventListener('loadeddata',queueCinemaSync);
    cinemaVideo.addEventListener('canplay',queueCinemaSync);
  }
  addEventListener('scroll',()=>{request();queueCinemaSync()},{passive:true});
  addEventListener('resize',()=>{visualProgress=targetProgress=scrollProgress(root,stage.clientHeight);request();queueCinemaSync()},{passive:true});
  addEventListener('focus',queueCinemaSync,{passive:true});
  document.addEventListener('visibilitychange',()=>{request();queueCinemaSync()});
  visualProgress=targetProgress=scrollProgress(root,stage.clientHeight);
  request();
})();

/* HOME v6 · selective text animation only. Never intercept wheel/scroll. */
(()=>{
  'use strict';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced || !('IntersectionObserver' in window)) return;
  const headings=[...document.querySelectorAll('.v6-animated-heading')];
  if(!headings.length) return;
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      entry.target.classList.add('v6-in');
      observer.unobserve(entry.target);
    }
  },{threshold:.12,rootMargin:'0px 0px -5% 0px'});
  // Mark headings already visible before adding the entrance-only motion state.
  for(const heading of headings){
    const rect=heading.getBoundingClientRect();
    if(rect.top<innerHeight*.94 && rect.bottom>0)heading.classList.add('v6-in');
  }
  document.documentElement.classList.add('v6-motion-ready');
  headings.forEach(h=>observer.observe(h));
})();

/* Reapply approved original-v7 order after the existing CMS section-order loader. */
(()=>{'use strict';
 const root=document.querySelector('main#top');if(!root)return;
 const ids=['hero','dd-why','dd-community-story','community','events','boss','news','dd-version','dd-join'];
 const trust=root.querySelector(':scope > .trust');
 for(const id of ids){const e=document.getElementById(id);if(e)root.appendChild(e);if(id==='hero'&&trust)root.appendChild(trust);}
 // Honour visibility toggles for sections now wrapped to isolate their CSS.
 try{
   const raw=sessionStorage.getItem('duoduo_cloud_duoduo_layout')||localStorage.getItem('duoduo_layout');
   const layout=raw?JSON.parse(raw):null;
   const aliases={why:'dd-why',versions:'dd-version',start:'dd-join'};
   for(const section of layout?.sections||[]){
     const wrapper=aliases[section.id]&&document.getElementById(aliases[section.id]);
     if(wrapper)wrapper.hidden=section.visible===false;
   }
 }catch(_){}
 // Link-only labels are loaded from official site data; this is not a carousel renderer.
 const heading=document.getElementById('startTitle');
 if(heading){const value=heading.textContent.trim();const idx=value.lastIndexOf('多多谷');
   if(idx>0){heading.textContent=value.slice(0,idx).trim();heading.appendChild(document.createElement('br'));
     const em=document.createElement('em');em.textContent=value.slice(idx);heading.appendChild(em);}
 }
 const headings=['whyTitle','versionsTitle'];
 for(const id of headings){const el=document.getElementById(id);if(!el)continue;
  const title=el.textContent.trim(); if(!title||el.querySelector('.v6-line'))continue;
  el.textContent='';const mask=document.createElement('span');mask.className='v6-line-mask';
  const line=document.createElement('span');line.className='v6-line';line.textContent=title;
  mask.appendChild(line);el.appendChild(mask);
 }
 // The official backend version publisher owns this node (not a hard-coded version).
 window.DuoDuoGameVersionRender?.();
})();


/* HOME v7 · section title animations for preserved official blocks. */
(()=>{
  'use strict';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const titles=[...document.querySelectorAll('.dd-title-anim')];
  if(!titles.length) return;
  if(reduced || !('IntersectionObserver' in window)){
    titles.forEach(node=>node.classList.add('is-in'));
    return;
  }
  document.documentElement.classList.add('dd-title-motion-ready');
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    }
  },{threshold:.22,rootMargin:'0px 0px -8% 0px'});
  titles.forEach(node=>observer.observe(node));
})();
