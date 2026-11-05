/* DuoDuo HOME v8 official integration: only opt-in on home.html.
   All cloud-bound containers and original home/portal scripts remain intact.
   The default browser wheel is NEVER intercepted. */
(()=>{
 'use strict';
 const make=()=>{
  const main=document.querySelector('main'); if(!main||document.getElementById('dd-home-v8-experience'))return;
  document.documentElement.classList.add('dd-home-v8');
  const wrapper=document.createElement('template');
  wrapper.innerHTML="<div id=\"dd-home-v8-experience\" class=\"dd-home-v8-scope\"><section aria-label=\"多多谷捲動情境動畫\" class=\"story-run\" id=\"opening\">\n<div class=\"story-stage\">\n<div aria-hidden=\"true\" class=\"ambient ambient-day\"></div>\n<div aria-hidden=\"true\" class=\"ambient ambient-night\"></div>\n<div aria-hidden=\"true\" class=\"ambient ambient-sunrise\"></div>\n<div aria-hidden=\"true\" class=\"stage-grain\"></div>\n<div aria-hidden=\"true\" class=\"story-progress\"><i></i></div>\n<div aria-hidden=\"true\" class=\"story-topline\"><span>DUODUO SYSTEMS</span><span class=\"story-step\">01 / 03</span></div>\n<div class=\"scene scene-opening\">\n<div aria-hidden=\"true\" class=\"opening-halo\"></div>\n<p class=\"overline\">DUODUO SYSTEMS · SCROLL EXPERIENCE</p>\n<h2>真正有趣的地方，<br/><em>從這裡開始。</em></h2>\n<p class=\"opening-desc\">不是只換一個版本、調一組倍率。<br/>更在意你上線後，有東西玩、有人一起玩，也有值得留下來的理由。</p>\n</div>\n<div class=\"scene scene-orbit\">\n<div class=\"orbit-heading\">\n<p class=\"overline\">THE WORLD OF DUODUO / 01</p>\n<h2>不只一條路，<br/><em>可以成為你的冒險。</em></h2>\n<p>輪迴、天賦、副本與活動。想走哪條路，都能找到自己的節奏。</p>\n</div>\n<div aria-hidden=\"true\" class=\"float-grid\">\n<div class=\"float-card c1\"><span class=\"card-index\">01 / GROW</span><img alt=\"\" src=\"media/rebirth.png\"/><b>輪迴 × 天賦</b><small>繼續探索成長</small></div>\n<div class=\"float-card c2\"><span class=\"card-index\">02 / BUILD</span><img alt=\"\" src=\"media/bond.png\"/><b>角色羈絆</b><small>創造自己的路線</small></div>\n<div class=\"float-card c3\"><span class=\"card-index\">03 / DISCOVER</span><img alt=\"\" src=\"home-v8-assets/world-treasure.webp\"/><b>世界祕寶</b><small>尋找意外的驚喜</small></div>\n<div class=\"float-card c4\"><span class=\"card-index\">04 / PLAY</span><img alt=\"\" src=\"home-v8-assets/activities.webp\"/><b>活動 × 休閒</b><small>每天都有新故事</small></div>\n</div>\n</div>\n<div class=\"scene scene-night\">\n<div aria-hidden=\"true\" class=\"night-stars\"></div>\n<div class=\"night-copy\">\n<p class=\"overline\">CHARACTER GROWTH / 02</p>\n<h2>輪迴，<br/><em>不是歸零。</em></h2>\n<p>重新開始，並把累積的力量帶回角色。<br/>每次前進，都讓下一次挑戰更值得期待。</p>\n<span class=\"night-accent\">每一次成長，都是故事的一部分。</span>\n</div>\n<div aria-hidden=\"true\" class=\"night-art\">\n<div class=\"orbit-glow\"></div><div class=\"orbit-circle orbit-a\"></div><div class=\"orbit-circle orbit-b\"></div><div class=\"orbit-circle orbit-c\"></div>\n<img alt=\"\" class=\"night-center\" src=\"media/rebirth.png\"/>\n<img alt=\"\" class=\"night-mini n1\" src=\"media/bond.png\"/>\n<img alt=\"\" class=\"night-mini n2\" src=\"media/relic2.png\"/>\n<img alt=\"\" class=\"night-mini n3\" src=\"media/relic1.png\"/>\n</div>\n</div>\n<div class=\"scene scene-final\">\n<div class=\"final-copy\">\n<p class=\"overline\">MORE THAN ONE WAY TO PLAY / 03</p>\n<h2>真正有趣的地方，<br/><em>還在後面。</em></h2>\n<p>冒險不必只有打怪和練等。挑戰、便利、社交和休閒，都值得你慢慢探索。</p>\n</div>\n<div aria-hidden=\"true\" class=\"feature-cards\">\n<div class=\"feature-card f1\"><div class=\"feature-art feature-boss feature-ui-art\"><img alt=\"BOSS 與副本新版區塊圖片\" src=\"home-v8-assets/feature-boss-ui.png\"/></div><div class=\"feature-caption\"><span>CHALLENGE / 01</span><strong>BOSS 與副本</strong><small>新的目標，下一場挑戰</small></div></div>\n<div class=\"feature-card f2\"><div class=\"feature-art feature-afk\"><img alt=\"\" src=\"home-v8-assets/afk.webp\"/></div><div class=\"feature-caption\"><span>CONVENIENCE / 02</span><strong>便利的日常</strong><small>掛機、掃蕩與資源找回</small></div></div>\n<div class=\"feature-card f3\"><div class=\"feature-art feature-play feature-ui-art\"><img alt=\"不一樣的玩法新版區塊圖片\" src=\"home-v8-assets/feature-play-ui.png\"/></div><div class=\"feature-caption\"><span>PLAYGROUND / 03</span><strong>不一樣的玩法</strong><small>拳王、活動與玩家交流</small></div></div>\n</div>\n</div>\n<div class=\"scroll-hint\"><span>繼續向下探索</span><svg aria-hidden=\"true\" fill=\"none\" viewbox=\"0 0 24 24\"><path d=\"m6 9 6 6 6-6\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"></path></svg></div>\n</div>\n</section>\n<section aria-label=\"原官網特色系統整合區\" class=\"v3-system-collection\" id=\"system-collection\">\n<div class=\"v3-sys-shell\">\n<div class=\"v3-sys-head reveal\"><div><span class=\"v3-sys-overline\">THE SYSTEMS / REIMAGINED</span><h2 class=\"v6-animated-heading\"><span class=\"v6-line-mask\"><span class=\"v6-line\">不只練等打王，</span></span><span class=\"v6-line-mask\"><span class=\"v6-line\"><em>每一天都有不同的冒險。</em></span></span></h2></div><p>從強化、陣營到我的小屋，再到便利、探索與玩家活動，讓每一次上線都有不同的選擇。</p></div>\n<div class=\"v3-main-sys-grid\">\n<article class=\"v3-sys-feature v3-upgrade reveal\"><div aria-hidden=\"true\" class=\"v3-visual v3-upgrade-stage\"><div class=\"v3-up-orbit\"></div><img alt=\"\" class=\"v3-up-main\" src=\"media/upgrade.png\"/><img alt=\"\" class=\"v3-up-floating u1\" src=\"media/upgrade2.png\"/><img alt=\"\" class=\"v3-up-floating u2\" src=\"media/upgrade3.png\"/><img alt=\"\" class=\"v3-up-floating u3\" src=\"media/upgrade4.png\"/><img alt=\"\" class=\"v3-up-floating u4\" src=\"media/upgrade5.png\"/></div><div class=\"v3-sys-copy\"><span>01 / BUILD</span><h3>強化，讓努力看得見。</h3><p>強化、裝備繼承、速洗潛能與等級同步。把時間留給成長，而不是重複點擊。</p></div></article>\n<article class=\"v3-sys-feature v3-faction reveal\"><div aria-hidden=\"true\" class=\"v3-visual v3-faction-stage\"><div class=\"v3-faction-halo\"></div><img alt=\"\" class=\"v3-faction-hero h1\" src=\"media/faction1.png\"/><img alt=\"\" class=\"v3-faction-hero h2\" src=\"media/faction2.png\"/><img alt=\"\" class=\"v3-faction-hero h3\" src=\"media/faction3.png\"/><img alt=\"\" class=\"v3-faction-hero h4\" src=\"media/faction4.png\"/><img alt=\"\" class=\"v3-roguelike\" src=\"media/roguelike-detail.png\"/></div><div class=\"v3-sys-copy\"><span>02 / CHOOSE</span><h3>陣營與武陵，走自己的路。</h3><p>選擇立場，加入陣營對抗；再進入武陵 Roguelike，每一次挑戰都不一樣。</p></div></article>\n<article class=\"v3-sys-feature v3-house reveal\"><div aria-hidden=\"true\" class=\"v3-visual v3-house-stage\"><img alt=\"\" src=\"media/my-house.png\"/></div><div class=\"v3-sys-copy\"><span>03 / YOUR PLACE</span><h3>我的小屋，也是一種玩法。</h3><p>打完王、練完等，回到自己的空間。除了變強，也能有屬於自己的休息時間。</p></div></article>\n</div>\n<div aria-label=\"更多原官網系統\" class=\"v3-sys-short-grid\">\n<article class=\"v3-sys-short reveal\"><div class=\"v3-short-icon\"><img alt=\"\" loading=\"lazy\" src=\"media/afk-status.png\"/></div><div><span>SMARTER PLAY</span><h3>少一點重複，多一點遊戲</h3><p>掛機、掃蕩、資源找回，讓時間花在真正想玩的地方。</p></div></article>\n<article class=\"v3-sys-short reveal\"><div class=\"v3-short-icon\"><img alt=\"\" loading=\"lazy\" src=\"media/wandering-merchant.png\"/></div><div><span>DISCOVER MORE</span><h3>世界裡，總有東西值得找到</h3><p>冒險之書、世界秘寶、流浪商人與各種收藏。</p></div></article>\n<article class=\"v3-sys-short reveal\"><div class=\"v3-short-icon\"><img alt=\"\" loading=\"lazy\" src=\"media/boxing.png\"/></div><div><span>PLAY TOGETHER</span><h3>不想練等時，換一種玩法</h3><p>拳王爭霸、今彩539、BINGO、OX、旗幟與雪域活動。</p></div></article>\n</div>\n<p class=\"v3-sys-bottom-note\">輪迴、強化、陣營、武陵、探索與休閒都能在多多谷找到自己的節奏。</p>\n<div aria-hidden=\"true\" class=\"v6-ticker\"><div class=\"v6-ticker-track\"><span>輪迴與天賦　✦　強化與繼承　✦　陣營與武陵　✦　世界秘寶　✦　我的小屋　✦　BOSS 與副本　✦　活動與交流　✦　</span><span>輪迴與天賦　✦　強化與繼承　✦　陣營與武陵　✦　世界秘寶　✦　我的小屋　✦　BOSS 與副本　✦　活動與交流　✦　</span></div></div>\n</div></section>\n<section aria-label=\"原版養成挑戰動畫保留場景\" class=\"v2-cinematic\" id=\"cinematic\">\n<div class=\"v2-cinema-pin\">\n<video aria-label=\"多多谷原本 BOSS 角色動態場景\" autoplay=\"\" class=\"v2-cinema-video\" loop=\"\" muted=\"\" playsinline=\"\" preload=\"metadata\" src=\"media/boss.mp4\"></video>\n<div aria-hidden=\"true\" class=\"v2-cinema-shade\"></div>\n<div class=\"v2-cinema-copy\">\n<p class=\"cinema-eyebrow\">THE NEXT CHALLENGE / 08</p>\n<h2>養成，<br/>是為了下一場挑戰。</h2>\n<p>準備好迎接下一個極限。</p>\n<a class=\"v2-cinema-next\" href=\"#why\">繼續了解多多谷 <span>↓</span></a>\n</div>\n<div aria-hidden=\"true\" class=\"v2-cinema-progress\"><i></i></div>\n</div>\n</section></div>";
  const node=wrapper.content.firstElementChild;
  const original=document.getElementById('v9-story');
  if(original){original.querySelectorAll('video').forEach(v=>{v.pause();v.removeAttribute('autoplay')});}
  main.insertBefore(node,original||main.firstChild);
  // Real brand carousel (#heroCarousel) stays untouched; app.js still owns the slides and cloud settings.
  const originalHero=document.getElementById('hero');
  if(originalHero){node.after(originalHero)}
  // Replace only the six hard-coded emoji icons. Cloud-provided labels/descriptions stay intact.
  const icons=['why-content.png','why-convenient.png','why-friends.png','why-support.png','why-benefits.png','why-joinnow.png'];
  document.querySelectorAll('#why .why-grid article').forEach((card,i)=>{
   const box=card.querySelector('i');if(box&&icons[i]){
    const img=document.createElement('img');img.src='home-v8-assets/'+icons[i];img.alt='';img.loading='lazy';
    box.replaceChildren(img);
   }
  });
  const comm=document.getElementById('community');
  if(comm&&!comm.querySelector('.dd-v8-community-cards')){
   const cards=document.createElement('div');cards.className='dd-v8-community-cards';
   const items=[
    ['community-not-alone.png','01 / TOGETHER','不是自己一個人玩。','打王、聊天、玩家活動與競賽，讓旅途中有可以一起努力的人。'],
    ['community-your-way.png','02 / YOUR WAY','進度是自己的。','輪迴、裝備與不同成長路線，想慢慢玩也能照自己的節奏前進。'],
    ['community-new-story.png',"03 / WHAT’S NEXT",'總有新的故事。','持續整理玩法、推出活動與新內容，讓下一次上線有新的期待。']
   ];
   for(const [file,num,title,desc] of items){
    const item=document.createElement('article');item.className='dd-v8-community-card';
    const im=document.createElement('img');im.src='home-v8-assets/'+file;im.alt=title;im.loading='lazy';
    const cap=document.createElement('div');cap.className='dd-v8-community-text';
    const sm=document.createElement('small');sm.textContent=num;
    const hd=document.createElement('h3');hd.textContent=title;
    const para=document.createElement('p');para.textContent=desc;
    cap.append(sm,hd,para);item.append(im,cap);cards.append(item);
   }
   const grid=comm.querySelector('.community-grid');
   if(grid)comm.insertBefore(cards,grid);
  }
  // Three useful newcomer steps, preserve LIVE download URLs on existing #start [data-link].
  const start=document.getElementById('start');
  if(start&&!start.querySelector('.dd-v8-steps')){
   const steps=document.createElement('div');steps.className='dd-v8-steps';
   [['01','認識玩法','先看看特色系統、遊玩指南與角色養成方向。'],['02','準備遊戲','下載登入器或整合包，依照官方下載說明完成安裝。'],['03','加入冒險','進入遊戲，認識社群並開始自己的旅程。']].forEach(([n,t,d])=>{
    const card=document.createElement('div');card.className='dd-v8-step';
    const a=document.createElement('b'),b=document.createElement('strong'),c=document.createElement('p');
    a.textContent=n;b.textContent=t;c.textContent=d;card.append(a,b,c);steps.append(card);
   });start.prepend(steps);
  }
  // De-duplicate the five legacy overview sections without deleting their content or DOM IDs.
  const parts=['new-player','quick-intro','features','about','stay'].map(id=>document.getElementById(id)).filter(Boolean);
  if(parts.length&&!document.getElementById('dd-v8-more')){
   const more=document.createElement('details');more.className='dd-v8-more';more.id='dd-v8-more';
   const title=document.createElement('summary');title.textContent='想再深入了解？展開更多系統介紹';more.append(title);
   parts.forEach(section=>more.append(section));
   const before=document.getElementById('events')||document.getElementById('community');
   main.insertBefore(more,before||null);
   const revealHash=()=>{const hash=decodeURIComponent(location.hash.slice(1));if(!hash)return;const key=window.CSS&&CSS.escape?CSS.escape(hash):hash.replace(/[^a-zA-Z0-9_-]/g,'');if(parts.some(p=>p.id===hash||(key&&p.querySelector('#'+key))))more.open=true};
   window.addEventListener('hashchange',revealHash); if(location.hash)revealHash();
  }
  // Selected sections get different entrance effects. Cloud text and links are never replaced.
  const heads=['whyTitle','communityTitle','eventsTitle','bossTitle','newsTitle','versionsTitle'];
  const els=heads.map(id=>document.getElementById(id)).filter(Boolean);
  if(!matchMedia('(prefers-reduced-motion:reduce)').matches&&'IntersectionObserver' in window){
   els.forEach(h=>{h.classList.add('dd-v8-text-reveal');if(h.getBoundingClientRect().top<innerHeight*.92)h.classList.add('dd-v8-in')});
   document.documentElement.classList.add('dd-v8-motion-ready');
   const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('dd-v8-in');io.unobserve(e.target)}}),{threshold:.12});
   els.forEach(e=>io.observe(e));
  }
  // Native scroll-position only; no wheel preventDefault and no synthetic smooth scroll.
  initStoryMotion(node);
 };
 function initStoryMotion(node){
  const root=node.querySelector('.story-run'),stage=node.querySelector('.story-stage');if(!root||!stage)return;
  const get=q=>node.querySelector(q),cards=[...node.querySelectorAll('.float-card')],features=[...node.querySelectorAll('.feature-card')];
  const cinema=node.querySelector('.v2-cinematic'),video=node.querySelector('.v2-cinema-video'),copy=node.querySelector('.v2-cinema-copy');
  const ring=get('.night-art'),stepLabel=get('.story-step'),indicator=get('.story-progress i'),cinemaProgress=get('.v2-cinema-progress i'),hint=get('.scroll-hint');
  const clamp=n=>Math.min(1,Math.max(0,n));
  const sm=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
  const lerp=(a,b,x)=>a+(b-a)*x;
  const set=(el,o)=>{if(el)Object.assign(el.style,o)};
  const progress=(section,pin)=>{let r=section.getBoundingClientRect();return clamp(-r.top/Math.max(1,r.height-pin))};
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let frame=0,last=performance.now(),visual=0,target=0;
  function story(x){
   const a=sm(.055,.225,x),b=sm(.105,.235,x),c=sm(.385,.495,x),d=sm(.418,.54,x),e=sm(.655,.775,x),f=sm(.706,.852,x);
   set(get('.scene-opening'),{opacity:String(1-a),transform:`translate3d(0,${(-48*a).toFixed(1)}px,0) scale(${lerp(1,.87,a).toFixed(3)})`});
   set(get('.scene-orbit'),{opacity:String(b*(1-c)),transform:`translateY(${(24*(1-b)-24*c).toFixed(1)}px)`});
   set(get('.scene-night'),{opacity:String(d*(1-e)),transform:`translateY(${(40*(1-d)-42*e).toFixed(1)}px)`});
   set(get('.scene-final'),{opacity:String(f),transform:`translateY(${(36*(1-f)).toFixed(1)}px)`});
   set(get('.ambient-night'),{opacity:String(d*(1-e))});set(get('.ambient-sunrise'),{opacity:String(f)});
   if(stepLabel)stepLabel.textContent=x<.22?'01 / 04':x<.48?'02 / 04':x<.75?'03 / 04':'04 / 04';
   if(indicator)indicator.style.width=`${(x*100).toFixed(1)}%`;
   if(hint)hint.style.opacity=x<.1?'1':String((1-sm(.1,.2,x))*.7);
   const offsets=[[-145,40],[80,-105],[-65,135],[145,62]];
   cards.forEach((card,i)=>{const v=sm(.145+i*.022,.275+i*.018,x),off=sm(.382+i*.003,.477+i*.006,x),show=v*(1-off),[dx,dy]=offsets[i];
    set(card,{opacity:String(show),transform:`translate3d(${(dx*(1-v)-dx*.27*off).toFixed(1)}px,${(dy*(1-v)-60*off).toFixed(1)}px,0) rotate(${((i%2?-5:5)*(1-v)).toFixed(2)}deg) scale(${(lerp(.83,1,v)*(1-.08*off)).toFixed(3)})`});
   });
   if(ring)ring.style.transform=`rotate(${lerp(-28,53,sm(.42,.73,x)).toFixed(1)}deg) scale(${lerp(.84,1,sm(.4,.58,x)).toFixed(3)})`;
   features.forEach((card,i)=>{const v=sm(.755+i*.026,.875+i*.025,x);set(card,{opacity:String(v),transform:`translate3d(${((i-1)*88*(1-v)).toFixed(1)}px,${(120*(1-v)).toFixed(1)}px,0) rotate(${((i-1)*5*(1-v)).toFixed(1)}deg) scale(${lerp(.89,1,v).toFixed(3)})`})});
  }
  function movie(){if(!cinema)return;const p=progress(cinema,innerHeight-72);if(innerWidth>760){const a=sm(0,.35,p),b=sm(.16,.41,p);set(video,{opacity:String(.55+.45*a),transform:`scale(${(1.05-.05*a).toFixed(3)})`});set(copy,{opacity:String(b),transform:`translateY(${(35-35*b).toFixed(1)}px)`})}if(cinemaProgress)cinemaProgress.style.width=(p*100).toFixed(1)+'%'}
  function update(now){frame=0;if(document.hidden)return;const dt=Math.min(64,Math.max(1,now-last));last=now;
   const rect=root.getBoundingClientRect(),active=rect.bottom>-100&&rect.top<innerHeight+100;
   target=progress(root,stage.clientHeight);visual+=(target-visual)*(reduced?1:(1-Math.exp(-dt/95)));
   if(Math.abs(visual-target)<.0003)visual=target;
   if(active)story(visual);movie();if(active&&visual!==target)req();
  }
  function req(){if(!frame){last=performance.now();frame=requestAnimationFrame(update)}}
  const reveal=()=>{const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.09});node.querySelectorAll('.reveal').forEach(e=>observer.observe(e))};
  if('IntersectionObserver' in window)reveal();else node.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-visible'));
  if(video){video.muted=true;video.playsInline=true;video.loop=true;if(reduced)video.pause();else if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!document.hidden)video.play().catch(()=>{});else video.pause()}),{rootMargin:'300px 0px'});io.observe(cinema)}else video.play().catch(()=>{})}
  addEventListener('scroll',req,{passive:true});addEventListener('resize',req,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)video?.pause();else req()});
  visual=target=progress(root,stage.clientHeight);req();
  // User prefers a few entrance animations only. Keep these disabled when reduced motion is requested.
  if(!reduced&&'IntersectionObserver' in window){
   const nodes=[...node.querySelectorAll('.v6-animated-heading')];const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('v6-in');io.unobserve(e.target)}}),{threshold:.15});
   document.documentElement.classList.add('v6-motion-ready');nodes.forEach(n=>{if(n.getBoundingClientRect().top<innerHeight*.95)n.classList.add('v6-in');io.observe(n)})
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',make,{once:true});else make();
})();
