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
  // V17: distinct, scroll-linked story typography. No second observer may replay it.
  const storyTitle={
    routeLead:$('.dd17-route-lead'),routeNext:$('.dd17-route-destination'),routeTrace:$('.dd17-route-trace i'),routeStar:$('.dd17-route-trace b'),
    rebirthLead:$('.dd17-rebirth-lead'),rebirthPieces:[...document.querySelectorAll('.dd17-rebirth-piece')],
    finaleLead:$('.dd17-finale-lead'),finaleNext:$('.dd17-finale-next')
  };
  const globe=$('.dd14-world');
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
    if(scrollHint){scrollHint.style.opacity=x<.1?'1':String((1-smooth(.1,.2,x))*.7);scrollHint.style.pointerEvents=x<.125?'auto':'none';}
    const offsets=[[-145,40],[80,-105],[-65,135],[145,62]];
    cards.forEach((card,i)=>{
      const v=smooth(.145+i*.022,.275+i*.018,x);
      const off=smooth(.382+i*.003,.477+i*.006,x);
      const show=v*(1-off);
      const [dx,dy]=offsets[i];
      set(card,{opacity:String(show),transform:`translate3d(${(dx*(1-v)+(-dx*.27)*off).toFixed(1)}px,${(dy*(1-v)-60*off).toFixed(1)}px,0) rotate(${((i%2?-5:5)*(1-v)+((i%2?-3:3)*off)).toFixed(2)}deg) scale(${(lerp(.83,1,v)*(1-.08*off)).toFixed(3)})`});
    });
    // V17: the captions become a story event, not generic fade-up reveals.
    // Motion is continuously linked to the existing chapter progress: it never
    // waits until the text is already visible then plays a second animation.
    if(!reduced){
      const route=smooth(.092,.238,x),path=smooth(.15,.29,x);
      set(storyTitle.routeLead,{opacity:String(route),clipPath:`inset(0 ${(100-100*route).toFixed(1)}% 0 0)`,transform:`translate3d(${(-22*(1-route)).toFixed(1)}px,0,0)`});
      set(storyTitle.routeNext,{opacity:String(path),clipPath:`inset(0 ${(100-100*path).toFixed(1)}% 0 0)`,transform:`perspective(780px) translate3d(0,${(12*(1-path)).toFixed(1)}px,0) rotateY(${(-9*(1-path)).toFixed(1)}deg)`});
      set(storyTitle.routeTrace,{transform:`scaleX(${path.toFixed(3)})`});
      set(storyTitle.routeStar,{opacity:String(path),transform:`translate3d(${(85*path).toFixed(1)}px,0,0) rotate(${(110*path).toFixed(1)}deg)`});
      const rebirth=smooth(.405,.548,x),pieces=smooth(.448,.58,x);
      set(storyTitle.rebirthLead,{opacity:String(rebirth),filter:`blur(${(5*(1-rebirth)).toFixed(2)}px)`,transform:`translate3d(0,${(12*(1-rebirth)).toFixed(1)}px,0) rotate(${(-4*(1-rebirth)).toFixed(2)}deg)`});
      const offsets=[[-23,-18],[-8,24],[17,-22],[33,16]];
      storyTitle.rebirthPieces.forEach((e,i)=>{const p=smooth(.443+i*.012,.57+i*.012,x); const [dx,dy]=offsets[i];
        set(e,{opacity:String(p),filter:`blur(${(6*(1-p)).toFixed(1)}px)`,transform:`translate3d(${(dx*(1-p)).toFixed(1)}px,${(dy*(1-p)).toFixed(1)}px,0) rotate(${((i%2?14:-11)*(1-p)).toFixed(1)}deg)`});
      });
      const lead=smooth(.692,.825,x),next=smooth(.745,.884,x);
      set(storyTitle.finaleLead,{opacity:String(lead),transform:`perspective(900px) translate3d(0,${(10*(1-lead)).toFixed(1)}px,${(-110*(1-lead)).toFixed(1)}px) scale(${(.83+.17*lead).toFixed(3)})`,filter:`blur(${(3*(1-lead)).toFixed(1)}px)`});
      set(storyTitle.finaleNext,{opacity:String(next),transform:`perspective(900px) translate3d(0,${(9*(1-next)).toFixed(1)}px,${(-150*(1-next)).toFixed(1)}px) scale(${(.76+.24*next).toFixed(3)})`,filter:`blur(${(4*(1-next)).toFixed(1)}px)`});
      if(globe)globe.style.setProperty('--dd17-scroll-shift',`${(-Math.min(x,.24)*26).toFixed(1)}px`);
    }
    // Individual planet tracks now have independent orbital paths; avoid rotating the whole artwork.
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
  // The first scene is pinned inside a multi-chapter scroll story; the button advances to chapter 2.
  scrollHint?.addEventListener('click',()=>{
    const span=Math.max(0,root.offsetHeight-stage.offsetHeight);
    const target=root.getBoundingClientRect().top+window.scrollY+span*.25;
    window.scrollTo({top:target,behavior:reduced?'auto':'smooth'});
  });
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
    }),{threshold:.03,rootMargin:'0px 0px 6% 0px'});
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



/* Reapply approved original-v7 order after the existing CMS section-order loader. */
(()=>{'use strict';
 const root=document.querySelector('main#top');if(!root)return;
 const ids=['hero','dd-why','dd-community-story','community','events','boss','news','dd-version','dd-join'];
 for(const id of ids){const e=document.getElementById(id);if(e)root.appendChild(e);}
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




/* HOME V9 — distinct section choreography, CMS-safe and native-scroll-only. */
(()=>{
  'use strict';
  function init(){
    const eyebrow=document.getElementById('hero-eyebrow');
    if(eyebrow){
      // Hero eyebrow is the approved site identity, independent from game version.
      const official='DUODUO VALLEY · OFFICIAL';
      const enforce=()=>{if(eyebrow.textContent!==official) eyebrow.textContent=official;};
      enforce();
      new MutationObserver(enforce).observe(eyebrow,{childList:true,subtree:true,characterData:true});
    }
    const map=[
      ['hero','#hero'],
      ['why','#why'],
      ['communityStory','#community-story'],
      ['community','#community'],
      ['events','#events'],
      ['boss','#boss'],
      ['news','#news'],
      ['versions','#versions'],
      ['join','#start'],
      ['systems','#system-collection']
    ];
    const all=map.map(([name,selector])=>({name,node:document.querySelector(selector)})).filter(x=>x.node);
    if(!all.length)return;
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce || !('IntersectionObserver' in window)) {
      all.forEach(({node})=>node.classList.add('dd-motion-in'));
      return;
    }
    // Reveal at the headline's arrival, not when the tall section first touches
    // the viewport. A section may start appearing hundreds of pixels before its
    // message is actually readable; using its title keeps the action in sync.
    const activationAnchor=(name,node)=>{
      if(name==='hero') return node.querySelector('#hero-title')||node;
      if(name==='systems') return node.querySelector('.v3-sys-head h2')||node;
      if(name==='communityStory') return node.querySelector('.v2-community-header h2')||node;
      if(name==='why') return node.querySelector('#whyTitle')||node;
      if(name==='community') return node.querySelector('#communityTitle')||node;
      if(name==='events') return node.querySelector('#eventsTitle')||node;
      if(name==='boss') return node.querySelector('#bossTitle')||node;
      if(name==='news') return node.querySelector('#newsTitle')||node;
      if(name==='versions') return node.querySelector('#versionsTitle')||node;
      if(name==='join') return node.querySelector('#startTitle')||node;
      return node;
    };
    const anchors=new Map();
    const io=new IntersectionObserver(entries=>{
      entries.forEach(({target,isIntersecting})=>{
        if(!isIntersecting)return;
        const section=anchors.get(target);
        if(!section)return;
        section.classList.add('dd-motion-in');
        io.unobserve(target);
      });
    },{threshold:0,rootMargin:'0px 0px 9% 0px'});
    document.documentElement.classList.add('dd-motion-ready');
    all.forEach(({name,node})=>{
      const anchor=activationAnchor(name,node);
      anchors.set(anchor,node);
      io.observe(anchor);
      const rect=anchor.getBoundingClientRect();
      if(rect.top<innerHeight*1.09 && rect.bottom>0){
        node.classList.add('dd-motion-in');
        io.unobserve(anchor);
      }
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();


/* HOME V10 — restrained desktop mouse-wheel easing. Keeps touchpads, phones,
   menus, nested scroll containers, keyboard and reduced-motion users native. */
(()=>{
  'use strict';
  if(!('requestAnimationFrame' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(!matchMedia('(pointer:fine) and (hover:hover)').matches) return;
  let raf=0, target=window.scrollY, current=target, last=0, controlled=false;
  const maxScroll=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const stop=()=>{if(raf)cancelAnimationFrame(raf);raf=0;controlled=false;};
  const isNestedScrollable=(node)=>{
    for(let el=node;el&&el!==document.documentElement;el=el.parentElement){
      if(!(el instanceof Element))continue;
      if(el.matches('dialog[open], [role="dialog"], [aria-modal="true"], .dd-nav-panel, .dd-nav-menu, [data-scroll-lock]')) return true;
      const css=getComputedStyle(el);
      if(/auto|scroll/.test(css.overflowY) && el.scrollHeight>el.clientHeight+2) return true;
    }
    return false;
  };
  const apply=(y)=>{
    try{window.scrollTo({top:y,behavior:'instant'})}
    catch(_){window.scrollTo(0,y)}
  };
  const tick=(now)=>{
    raf=0;
    if(document.hidden){stop();return;}
    const dt=clamp(now-last,1,40); last=now;
    const ease=1-Math.exp(-dt/135); // quick easing, no long wheel queue
    current+=(target-current)*ease;
    if(Math.abs(target-current)<.6){current=target;apply(current);controlled=false;return;}
    apply(current);
    raf=requestAnimationFrame(tick);
  };
  window.addEventListener('wheel',e=>{
    if(e.defaultPrevented||!e.cancelable||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||
       innerWidth<900||document.hidden||isNestedScrollable(e.target))return;
    // Wheel detents only: small precise trackpad deltas stay native.
    const dy=e.deltaMode===1?e.deltaY*33:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY;
    if(!Number.isFinite(dy)||Math.abs(dy)<75||Math.abs(dy)>1800||Math.abs(e.deltaX)>Math.abs(e.deltaY)*.45)return;
    const base=window.scrollY;
    const start=controlled?target:base;
    const next=clamp(start+clamp(dy,-Math.min(310,innerHeight*.4),Math.min(310,innerHeight*.4)),0,maxScroll());
    if(Math.abs(next-base)<.5&&Math.abs(next-start)<.5)return;
    e.preventDefault();
    // On reverse direction, respond immediately rather than finishing the old scroll.
    if(controlled&&Math.sign(dy)!==Math.sign(target-base))target=base;
    else target=start;
    target=clamp(target+clamp(dy,-Math.min(310,innerHeight*.4),Math.min(310,innerHeight*.4)),0,maxScroll());
    current=base;
    controlled=true;
    if(!raf){last=performance.now();raf=requestAnimationFrame(tick)}
  },{passive:false});
  window.addEventListener('keydown',e=>{
    if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ','Spacebar'].includes(e.key))stop();
  },{passive:true});
  window.addEventListener('pointerdown',stop,{passive:true});
  window.addEventListener('resize',stop,{passive:true});
  document.addEventListener('visibilitychange',stop,{passive:true});
})();


/* V11: community-story headline uses horizontal character flips; keep the
   CMS-managed review title intact and let CSS animate it independently. */
(()=>{
  'use strict';
  const heading=document.querySelector('#community-story .v2-community-header h2');
  if(!heading || heading.dataset.ddFlipReady==='1')return;
  heading.dataset.ddFlipReady='1';
  const original=heading.textContent.replace(/\s+/g,' ').trim();
  heading.setAttribute('aria-label',original);
  const lines=[...heading.querySelectorAll('.v6-line')];
  let index=0;
  for(const line of lines){
    // Keep the approved <em> emphasis. Only replace text nodes inside it.
    const walker=document.createTreeWalker(line,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){
      const fragment=document.createDocumentFragment();
      for(const char of [...(node.nodeValue||'')]){
        const span=document.createElement('span');
        span.className='dd-flip-char';
        span.setAttribute('aria-hidden','true');
        span.style.setProperty('--dd-char-order',String(index++));
        span.textContent=char;
        fragment.appendChild(span);
      }
      node.replaceWith(fragment);
    }
  }
})();


/* HOME V13 — fail-visible theatrical timing. CSS never suppresses site content.
   Each headline's animation is a short WAAPI effect layered on visible content;
   interruption or missing observers leave the normal HTML readable. */
(()=>{
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const stages=[
  // V20 headlines for events and versions own their timing independently.
  ['#start #startTitle','finale']
 ];
 const nodes=stages.map(([selector,kind])=>({node:document.querySelector(selector),kind})).filter(x=>x.node);
 if(!nodes.length || reduce || !Element.prototype.animate)return;
 let scrollFrame=0;
 const done=new WeakSet();
 function run(node,kind){
  if(done.has(node))return;
  done.add(node);
  const effects={
   hero:[{clipPath:'inset(0 97% 0 0)',filter:'blur(3px)'},{clipPath:'inset(0 0 0 0)',filter:'blur(0)'}],
   reviews:[{clipPath:'polygon(0 0, 0 0, -12% 100%, 0 100%)'},{clipPath:'polygon(0 0, 115% 0, 100% 100%, 0 100%)'}],
   events:[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],
   news:[{letterSpacing:'.12em',filter:'blur(2.5px)',opacity:.65,transform:'translateX(-12px)'},{letterSpacing:'.045em',filter:'blur(.6px)',opacity:.93,transform:'translateX(0)'},{letterSpacing:'0',filter:'blur(0)',opacity:1,transform:'none'}],
   timeline:[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],
   finale:[{transform:'perspective(900px) rotateY(-13deg) scale(.98)',filter:'blur(3px)'},{transform:'none',filter:'blur(0)'}]
  };
  const frames=effects[kind];
  if(!frames)return;
  try{const animation=node.animate(frames,{duration:kind==='hero'?1180:kind==='finale'?1350:kind==='reviews'?1120:kind==='news'?1650:950,easing:'cubic-bezier(.18,.84,.2,1)',fill:'none'});
   animation.finished.catch(()=>{});}
  catch(_){/* The element is intentionally visible even without animation. */}
 }
 function check(){
  scrollFrame=0;
  const h=innerHeight;
  for(const {node,kind} of nodes){
   if(done.has(node))continue;
   const r=node.getBoundingClientRect();
   // Section text must reach a readable area. If user lands past it,
   // leave it visible and consider its animation completed.
   if(r.bottom<=0){done.add(node);continue;}
   if(r.top<h*1.06 && r.bottom>0)run(node,kind);
  }
 }
 function request(){if(!scrollFrame)scrollFrame=requestAnimationFrame(check)}
 addEventListener('scroll',request,{passive:true});
 addEventListener('resize',request,{passive:true});
 addEventListener('pageshow',request,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)request()});
 request();
})();


/* HOME V15 — timeline that follows the scroll and fail-visible entrance choreography.
   Never intercepts wheel/scroll and never hides CMS content outside a short WAAPI
   animation that is automatically cancelled at completion. */
(()=>{
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const track=document.querySelector('#versions .hybrid-timeline');
 const dots=track?[...track.querySelectorAll('.hybrid-timeline-item .timeline-dot')]:[];
 let frame=0;
 const clamp=v=>Math.max(0,Math.min(1,v));
 function paintTimeline(){
   frame=0;
   if(!track || dots.length<2) return;
   const box=track.getBoundingClientRect(),first=dots[0].getBoundingClientRect(),last=dots[dots.length-1].getBoundingClientRect();
   if(!first.height || !last.height) return;
   const top=first.top+first.height/2-box.top;
   const end=last.top+last.height/2-box.top;
   const x=first.left+first.width/2-box.left;
   const length=Math.max(1,end-top);
   const fraction=clamp((innerHeight*.73-(first.top+first.height/2))/length);
   track.style.setProperty('--dd15-rail-top',top.toFixed(2)+'px');
   track.style.setProperty('--dd15-rail-height',length.toFixed(2)+'px');
   track.style.setProperty('--dd15-rail-x',x.toFixed(2)+'px');
   track.style.setProperty('--dd15-rail-fill',String(reduce?1:fraction));
   dots.forEach((dot,i)=>{
     const center=dot.getBoundingClientRect().top+dot.offsetHeight/2-box.top;
     dot.classList.toggle('dd15-node-reached',reduce || fraction*length>=center-top-5);
   });
 }
 function queueTimeline(){if(!frame)frame=requestAnimationFrame(paintTimeline)}
 addEventListener('scroll',queueTimeline,{passive:true});
 addEventListener('resize',queueTimeline,{passive:true});
 addEventListener('pageshow',queueTimeline,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)queueTimeline()});
 queueTimeline();
 if(reduce || !Element.prototype.animate) return;
 // V16: independent movement vocabulary for each part of the join chapter.
 // All content remains visible if effects are unsupported/interrupted.
 const items=[
  ...[...document.querySelectorAll('#start .v2-steps > div')].map((node,i)=>({node,kind:'step'+i,delay:0})),
  ...[...document.querySelectorAll('#start .v2-download-hub')].map(node=>({node,kind:'hub',delay:0})),
  ...[...document.querySelectorAll('#start .v2-download-card')].map((node,i)=>({node,kind:'download',delay:i*90})),
  ...[...document.querySelectorAll('#start .v2-links')].map(node=>({node,kind:'links',delay:0})),
  ...[...document.querySelectorAll('#start .v2-link-grid a')].map((node,i)=>({node,kind:i%2?'linkRight':'linkLeft',delay:Math.min(i,7)*55})),
 ];
 const seen=new WeakSet();
 function appear(item){
   const {node,kind,delay}=item;
   if(seen.has(node))return;
   seen.add(node);
   const effects={
     step0:[{opacity:.32,clipPath:'inset(0 100% 0 0 round 20px)'},{opacity:1,clipPath:'inset(0 0 0 0 round 20px)'}],
     step1:[{opacity:.36,transform:'perspective(850px) rotateX(-38deg) scale(.96)'},{opacity:1,transform:'perspective(850px) rotateX(0deg) scale(1)'}],
     step2:[{opacity:.36,transform:'scale(.82)',filter:'blur(6px)'},{opacity:1,transform:'scale(1)',filter:'blur(0px)'}],
     hub:[{opacity:.6,clipPath:'inset(0 50% 0 50% round 28px)'},{opacity:1,clipPath:'inset(0 0 0 0 round 28px)'}],
     download:[{opacity:.22,transform:'perspective(600px) rotateY(-16deg) scale(.93)'},{opacity:1,transform:'perspective(600px) rotateY(0) scale(1)'}],
     links:[{opacity:.4,clipPath:'inset(0 0 100% 0 round 26px)'},{opacity:1,clipPath:'inset(0 0 0 0 round 26px)'}],
     linkLeft:[{opacity:.25,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0 0 0)'}],
     linkRight:[{opacity:.25,clipPath:'inset(0 0 0 100%)'},{opacity:1,clipPath:'inset(0 0 0 0)'}]
   }[kind];
   if(!effects) return;
   const durations={step0:1020,step1:1130,step2:1120,hub:1280,download:980,links:920,linkLeft:690,linkRight:690};
   if(kind==='hub')node.classList.add('dd16-hub-in');
   try{
     const a=node.animate(effects,{duration:durations[kind],delay,easing:'cubic-bezier(.16,.86,.22,1)',fill:'both'});
     a.finished.then(()=>a.cancel()).catch(()=>{});
   }catch(_){/* Content stays visible. */}
 }
 if(!('IntersectionObserver' in window)){items.forEach(appear);return;}
 const lookup=new Map(items.map(item=>[item.node,item]));
 const io=new IntersectionObserver(entries=>{
   for(const entry of entries){
     if(!entry.isIntersecting)continue;
     const item=lookup.get(entry.target);
     if(item)appear(item);
     io.unobserve(entry.target);
   }
 },{threshold:.015,rootMargin:'0px 0px 5% 0px'});
 items.forEach(({node})=>io.observe(node));
})();



/* HOME V18 – navigation logo feedback and one owner for news title motion. */
(()=>{
  'use strict';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const brand=document.querySelector('.site-header > a.brand');
  if(brand){
    brand.classList.add('dd18-brand');
    // On the current home page, a logo click becomes a responsive return-to-top.
    // Modified and middle clicks keep the normal link behavior.
    brand.addEventListener('click',e=>{
      if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
      brand.classList.remove('dd18-brand-click');
      void brand.offsetWidth;
      brand.classList.add('dd18-brand-click');
      if(document.querySelector('main#top')){
        e.preventDefault();
        window.scrollTo({top:0,behavior:reduce?'instant':'smooth'});
        setTimeout(()=>brand.classList.remove('dd18-brand-click'),650);
      }
    });
  }
})();


/* HOME V19 - three independent title treatments, no late WAAPI replay.
   CMS text remains the source of truth. Headings default visible without JS.
   Prep is applied off-screen; one scroll gate animates just before entry. */
(()=>{
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const title=document.getElementById('hero-title');
 const news=document.getElementById('newsTitle');
 const brand=document.querySelector('.site-header > a.brand');
 // Logo art only: no glow on the containing rectangle or neighboring label.
 if(brand)brand.classList.add('dd19-brand');
 function playHero(){if(!title || !Element.prototype.animate)return;
   // Debut in two deliberate beats. No content wrappers or innerHTML changes,
   // so the back-office title remains untouched.
   try{
     const a=title.animate([
       {offset:0,opacity:.10,transform:'perspective(1300px) translate3d(-26px,9px,-80px) rotateY(-6deg) scale(.92)',filter:'blur(11px)',clipPath:'inset(0 96% 0 0)'},
       {offset:.33,opacity:.88,transform:'perspective(1300px) translate3d(-4px,2px,-15px) rotateY(-2deg) scale(.99)',filter:'blur(1.5px)',clipPath:'inset(0 24% 0 0)'},
       {offset:.72,opacity:1,transform:'perspective(1300px) translate3d(0,0,0) rotateY(0) scale(1.01)',filter:'blur(0)',clipPath:'inset(0 0 0 0)'},
       {offset:1,opacity:1,transform:'none',filter:'none',clipPath:'inset(0 0 0 0)'}
     ],{duration:2320,easing:'cubic-bezier(.16,.77,.24,1)',fill:'none'});
     a.finished.catch(()=>{});
     const em=title.querySelector('em');
     if(em){const glow=em.animate([
       {opacity:.65,filter:'brightness(.68) saturate(.5)',textShadow:'0 0 0 transparent'},
       {opacity:1,filter:'brightness(1.28) saturate(1.18)',textShadow:'0 0 25px rgba(114,231,255,.36)',offset:.67},
       {opacity:1,filter:'none',textShadow:'none'}
     ],{duration:1820,delay:420,easing:'cubic-bezier(.15,.86,.22,1)',fill:'none'});glow.finished.catch(()=>{});}
   }catch(_){}
 }
 if(reduced) return;
 const targets=[];
 if(title)targets.push({node:title,kind:'hero',entered:false});
 if(news){
   // Safely turn the latest CMS headline into individual illuminated glyphs.
   // A later CMS textContent update is re-split without losing the state.
   news.classList.add('dd19-news');
   function buildGlyphs(){
     if(news.querySelector('.dd19-news-glyph'))return;
     const label=(news.textContent||'').trim();
     if(!label)return;
     news.setAttribute('aria-label',label);
     const frag=document.createDocumentFragment();
     [...label].forEach((char,i)=>{
       const span=document.createElement('span');span.className='dd19-news-glyph';
       span.setAttribute('aria-hidden','true');span.style.setProperty('--dd19-glyph',String(i));
       span.textContent=char;frag.appendChild(span);
     });
     news.replaceChildren(frag);
   }
   buildGlyphs();
   const changes=new MutationObserver(()=>{if(!news.querySelector('.dd19-news-glyph'))buildGlyphs()});
   changes.observe(news,{childList:true});
   targets.push({node:news,kind:'news',entered:false});
 }
 let raf=0;
 function check(){
   raf=0;
   const vh=innerHeight||720;
   for(const t of targets){
     if(t.entered)continue;
     const r=t.node.getBoundingClientRect();
     // Prepare only when outside the viewing area; avoid hiding visible
     // titles on deep-link restoration or BFCache return.
     if(r.bottom<=0){t.node.classList.add('dd19-entered');t.entered=true;continue;}
     if(r.top>vh+25){t.node.classList.add('dd19-prepared');continue;}
     // 25px before the section arrives: visual motion begins as it enters.
     t.node.classList.add('dd19-prepared');
     t.node.classList.add('dd19-entered');
     t.entered=true;
     if(t.kind==='hero')playHero();
   }
 }
 function queue(){if(!raf)raf=requestAnimationFrame(check)}
 addEventListener('scroll',queue,{passive:true});
 addEventListener('resize',queue,{passive:true});
 addEventListener('pageshow',queue,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)queue()});
 check();
})();


/* HOME V20 — only three headline motions: COMMUNITY, EVENTS, VERSION LOG.
   These headings have independent scroll gates; older section effects may
   still animate the CARDS, but cannot replay or pre-animate the headings.
   The real CMS text remains authoritative and can be rewritten safely. */
(()=>{
  'use strict';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes=[
    {id:'communityTitle',kind:'community',duration:1880},
    {id:'eventsTitle',kind:'events',duration:1720},
    {id:'versionsTitle',kind:'versions',duration:1920},
  ].map(x=>({...x,node:document.getElementById(x.id),entered:false,done:false})).filter(x=>x.node);
  if(!nodes.length || reduce) return;
  // Split only the SOCIAL headline into individually choreographed glyphs.
  // The two other headings use whole-title geometries, never glyph cascades.
  const refresh=(item)=>{
    const {node,kind}=item;
    if(node.querySelector(':scope > .dd20-text'))return;
    const label=(node.textContent||'').replace(/\s+/g,' ').trim();
    if(!label)return;
    node.setAttribute('aria-label',label);
    const span=document.createElement('span');span.className='dd20-text dd20-'+kind+'-text';
    if(kind==='community'){
      [...label].forEach((ch,i)=>{
        const glyph=document.createElement('span');glyph.className='dd20-community-char';
        glyph.setAttribute('aria-hidden','true');glyph.style.setProperty('--dd20-i',String(i));
        glyph.style.setProperty('--dd20-d',String(i%3-1));
        glyph.textContent=ch;span.appendChild(glyph);
      });
    } else span.textContent=label;
    node.replaceChildren(span);
  };
  nodes.forEach(item=>{
    refresh(item);
    new MutationObserver(()=>{if(!item.node.querySelector(':scope > .dd20-text'))refresh(item)})
      .observe(item.node,{childList:true});
  });
  document.documentElement.classList.add('dd20-motion-on');
  let frame=0;
  const check=()=>{
    frame=0;
    const h=innerHeight||720;
    for(const item of nodes){
      if(item.entered)continue;
      const rect=item.node.getBoundingClientRect();
      // If arriving from history/bfcache below the title, never hide it.
      if(rect.bottom < 0){item.entered=true;item.done=true;item.node.classList.add('dd20-done');continue;}
      // A title is revealed only as it starts entering the READING zone.
      // Never use 1.06h overscan: that is what let V19 finish off-screen.
      if(rect.top > h*.77 || rect.bottom < h*.14)continue;
      item.entered=true;item.node.classList.add('dd20-entered');
      // After the motion is complete, drop will-change and allow CMS edits.
      setTimeout(()=>{item.done=true;item.node.classList.add('dd20-done')},item.duration+350);
    }
  };
  const queue=()=>{if(!frame)frame=requestAnimationFrame(check)};
  addEventListener('scroll',queue,{passive:true});
  addEventListener('resize',queue,{passive:true});
  addEventListener('pageshow',queue,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)queue()});
  check();
})();
