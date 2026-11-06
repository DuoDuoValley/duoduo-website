/* Native-scroll mobile storytelling. No wheel/touch interception, WebGL,
   image sequences or perpetual scroll-render loop. */
(()=>{
  'use strict';
  const story=document.getElementById('dd-story');
  if(!story || !('IntersectionObserver' in window) || !Element.prototype.animate)return;
  if(!window.CSS?.supports('scale','1') || !CSS.supports('rotate','0deg'))return;
  const stage=story.querySelector('.story-stage');
  const scenes=[...stage.querySelectorAll(':scope > .scene')];
  const mobile=matchMedia('(max-width:760px), (max-width:1024px) and (pointer:coarse)');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const world=story.querySelector('.dd14-world');
  const night=story.querySelector('.night-art');
  const seen=new WeakSet(),animations=new Set(),visible=new Set();
  let chapters=[],observer,entrances,metrics,frame=0,layoutFrame=0,enabled=false;
  let worldInView=false,nightInView=false,lastWidth=0,lastHeight=0;
  const clamp=n=>Math.max(0,Math.min(1,n));

  function syncAmbient(){
    const run=enabled && !reduced.matches && !document.hidden;
    story.classList.toggle('dd-mobile-world-running',run && worldInView);
    story.classList.toggle('dd-mobile-night-running',run && nightInView);
  }
  function cancelAnimations(){
    animations.forEach(a=>a.cancel());animations.clear();
  }
  function reveal(node){
    const card=node.matches('.dd-mobile-card');
    const identity=card?node.firstElementChild:node;
    if(!enabled || !mobile.matches || reduced.matches || document.hidden || seen.has(identity))return;
    seen.add(identity);
    const targets=[node];
    const index=card?[...node.parentElement.children].indexOf(node):0;
    targets.forEach((target,i)=>{
      // Animate child layers, keeping the original card layout readable.
      const image=card || target.matches('img,.feature-art');
      const from={opacity:.18,translate:`${card?(index%2?16:-16):0}px ${image?28:18}px`,scale:image?'.94':'1'};
      if(card)from.rotate=`${index%2?1.5:-1.5}deg`;
      if(target===world){delete from.translate;from.scale='.88';}
      try{
        const a=target.animate([from,{opacity:1,translate:'0 0',scale:'1',rotate:'0deg'}],{
          duration:image || target===world?950:720,delay:card?Math.min(index*55+i*45,220):0,
          easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'
        });
        animations.add(a);
        a.finished.then(()=>{a.cancel();animations.delete(a)},()=>animations.delete(a));
      }catch(_){/* Baseline content stays visible if effects are unsupported. */}
    });
  }
  function paint(){
    frame=0;
    if(!enabled || document.hidden || reduced.matches)return;
    // Read all geometry before writing; only near-screen chapters participate.
    const height=innerHeight;
    const samples=[...visible].map(chapter=>({chapter,rect:chapter.getBoundingClientRect()}));
    for(const {chapter,rect} of samples){
      const p=clamp((height*.8-rect.top)/(height*.8+rect.height*.35));
      chapter.style.setProperty('--dd-chapter-progress',Math.max(.04,p).toFixed(3));
      chapter.style.setProperty('--dd-route-progress',clamp(p*1.7).toFixed(3));
      if(chapter.contains(world))world.style.setProperty('--dd-camera-scale',(.94+p*.10).toFixed(3));
      chapter.querySelectorAll('.feature-art img').forEach(img=>{
        img.style.setProperty('--dd-art-shift',`${((p-.5)*12).toFixed(1)}px`);
      });
    }
  }
  function requestPaint(){if(enabled && visible.size && !frame && !document.hidden)frame=requestAnimationFrame(paint);}
  function measure(){
    layoutFrame=0;if(!enabled)return;
    const header=document.querySelector('.site-header');
    const top=Math.ceil(header?.getBoundingClientRect().height||100);
    // Use the stable small viewport, not the Safari toolbar's changing height.
    const probe=document.createElement('div');
    probe.style.cssText='position:fixed;height:100svh;visibility:hidden;pointer-events:none';
    story.appendChild(probe);const viewport=probe.getBoundingClientRect().height||innerHeight;probe.remove();
    const available=Math.floor(viewport-top-12);
    story.style.setProperty('--dd-mobile-header',`${top}px`);
    chapters.forEach(c=>c.classList.remove('is-pinned'));
    const heights=chapters.map(c=>c.firstElementChild.getBoundingClientRect().height);
    chapters.forEach((c,i)=>{
      // Tall text, large fonts and landscape always remain fully scrollable.
      const fits=available>=550 && heights[i]<=available && innerHeight>innerWidth;
      c.style.setProperty('--dd-scene-height',`${available}px`);
      c.style.setProperty('--dd-hold',`${Math.round(Math.min(180,viewport*.2))}px`);
      c.classList.toggle('is-pinned',fits);
    });
    requestPaint();
  }
  function requestMeasure(){if(enabled && !layoutFrame)layoutFrame=requestAnimationFrame(measure);}
  function teardown(){
    enabled=false;observer?.disconnect();entrances?.disconnect();metrics?.disconnect();cancelAnimations();
    cancelAnimationFrame(frame);cancelAnimationFrame(layoutFrame);frame=layoutFrame=0;
    visible.clear();worldInView=nightInView=false;
    story.querySelectorAll('.dd-mobile-card').forEach(c=>c.replaceWith(c.firstElementChild));
    chapters.forEach(c=>{const scene=c.firstElementChild;c.replaceWith(scene)});chapters=[];
    story.querySelectorAll('.dd-mobile-chapter-index').forEach(e=>e.remove());
    story.classList.remove('dd-mobile-cinema','dd-mobile-motion-ready','dd-mobile-world-running','dd-mobile-night-running');
    story.style.removeProperty('--dd-mobile-header');
    world?.style.removeProperty('--dd-camera-scale');
    story.querySelectorAll('.feature-art img').forEach(e=>e.style.removeProperty('--dd-art-shift'));
  }
  function configure(){
    teardown();
    if(!mobile.matches || reduced.matches)return;
    enabled=true;story.classList.add('dd-mobile-cinema','dd-mobile-motion-ready');
    chapters=scenes.map((scene,i)=>{
      const chapter=document.createElement('div');chapter.className='dd-mobile-chapter';
      scene.before(chapter);chapter.appendChild(scene);
      const label=document.createElement('div');label.className='dd-mobile-chapter-index';label.setAttribute('aria-hidden','true');
      const number=document.createElement('span');number.textContent=`0${i+1} / 04`;
      label.append(number,document.createElement('i'));scene.appendChild(label);
      return chapter;
    });
    story.querySelectorAll('.float-card,.feature-card').forEach(card=>{
      const layer=document.createElement('div');layer.className='dd-mobile-card';
      card.before(layer);layer.appendChild(card);
    });
    observer=new IntersectionObserver(entries=>{
      if(!enabled)return;
      for(const e of entries){
        if(e.target===world)worldInView=e.isIntersecting;
        else if(e.target===night)nightInView=e.isIntersecting;
        else if(e.isIntersecting)visible.add(e.target);else visible.delete(e.target);
      }
      syncAmbient();requestPaint();
    });
    chapters.forEach(c=>observer.observe(c));
    if(world)observer.observe(world);if(night)observer.observe(night);
    entrances=new IntersectionObserver(entries=>{
      if(!enabled || reduced.matches || !mobile.matches)return;
      entries.forEach(e=>{if(e.isIntersecting && !document.hidden){reveal(e.target);entrances.unobserve(e.target)}});
    },{threshold:.08});
    story.querySelectorAll('.dd14-opening-copy > *, .dd14-world, .orbit-heading > *, .dd-mobile-card, .night-copy > *, .night-art, .final-copy > *').forEach(e=>{
      if(!seen.has(e.matches('.dd-mobile-card')?e.firstElementChild:e))entrances.observe(e);
    });
    lastWidth=innerWidth;lastHeight=innerHeight;measure();
    if('ResizeObserver' in window){
      metrics=new ResizeObserver(requestMeasure);
      document.querySelectorAll('.site-header, #dd-story .dd14-opening-layout, #dd-story .orbit-heading, #dd-story .float-grid, #dd-story .night-copy, #dd-story .night-art, #dd-story .final-copy, #dd-story .feature-cards').forEach(e=>metrics.observe(e));
    }
  }
  mobile.addEventListener('change',configure);reduced.addEventListener('change',configure);
  addEventListener('scroll',requestPaint,{passive:true});
  addEventListener('resize',()=>{
    if(innerWidth!==lastWidth || Math.abs(innerHeight-lastHeight)>90){lastWidth=innerWidth;lastHeight=innerHeight;requestMeasure();}
    requestPaint();
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimations();cancelAnimationFrame(frame);frame=0;syncAmbient();}
    else configure();
  });
  addEventListener('pageshow',requestMeasure);
  story.querySelectorAll('img').forEach(img=>{if(!img.complete)img.addEventListener('load',requestMeasure,{once:true})});
  document.fonts?.ready.then(requestMeasure);
  configure();
})();
