/* Owner-approved DuoDuo HOME v7.2: official data + safe animation. */
(()=>{'use strict';
const root=document.querySelector('main.dd-home-v7'); if(!root)return;
// app.js reorders legacy section IDs for the old HOME layout. Restore the owner-approved sequence after app.js runs.
const approvedOrder=['opening','system-collection','cinematic','hero','why','community','events','boss','news','versions','join'];
for(const id of approvedOrder){const e=document.getElementById(id);if(e&&e.parentElement===root)root.appendChild(e);}

// Keep the approved brand English label instead of forcing V282 from legacy cached layout.
const eyebrow=document.getElementById('hero-eyebrow');if(eyebrow){eyebrow.textContent='DUODUO VALLEY · OFFICIAL';eyebrow.dataset.ddVersionHeroOriginal='DUODUO VALLEY · OFFICIAL';}
// app.js restores stored text with textContent. Rebuild only the approved blue phrase after it renders.
const joinTitle=document.getElementById('startTitle');
if(joinTitle){const raw=joinTitle.textContent.trim();const key='多多谷了。';const pos=raw.lastIndexOf(key);if(pos>0){
 joinTitle.textContent=raw.slice(0,pos);const br=document.createElement('br');const em=document.createElement('em');em.textContent=raw.slice(pos);joinTitle.append(br,em);
}}
// Ensure backend-updated headings retain a readable animated target.
const targets=[['whyTitle','reveal-right'],['eventsTitle','slide-left'],['bossTitle','focus'],['newsTitle','tighten'],['versionsTitle','wipe']];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
// app.js sets heading textContent from cloud data; wrap that *final* text
// rather than animating the h2, whose safe-visibility CSS uses !important.
function motionText(el){
 let span=el.querySelector('.dd-v7-motion-text');
 if(!span){const text=el.textContent;el.textContent='';span=document.createElement('span');
   span.className='dd-v7-motion-text';span.textContent=text;el.append(span);}
 return span;
}
function animateIn(el,type){
 if(reduced||el.dataset.ddAnimated)return;
 const target=motionText(el); el.dataset.ddAnimated='1';
 const variants={
 'reveal-right':[{transform:'translateX(38px)',opacity:.55},{transform:'translateX(0)',opacity:1}],
 'slide-left':[{transform:'translateX(-54px)',opacity:.55},{transform:'translateX(0)',opacity:1}],
 'focus':[{transform:'scale(.89)',opacity:.5,filter:'blur(2px)'},{transform:'scale(1)',opacity:1,filter:'blur(0px)'}],
 'tighten':[{letterSpacing:'.14em',opacity:.55},{letterSpacing:'normal',opacity:1}],
 'wipe':[{clipPath:'inset(0 100% 0 0)',opacity:.65},{clipPath:'inset(0 0 0 0)',opacity:1}]
 };
 target.animate(variants[type]||variants.focus,{duration:type==='focus'?780:880,iterations:1,easing:'cubic-bezier(.2,.8,.18,1)'});
}
let io=null;
if('IntersectionObserver'in window){io=new IntersectionObserver(es=>es.forEach(({target,isIntersecting})=>{if(isIntersecting){animateIn(target,target.dataset.ddMotion);io.unobserve(target)}}),{threshold:.16,rootMargin:'0px 0px -7% 0px'})}
for(const [id,type] of targets){const el=document.getElementById(id);if(!el)continue;el.dataset.ddMotion=type;if(io)io.observe(el);else animateIn(el,type)}
// Scroll fallback: some browser/resize combinations do not deliver the observer callback promptly.
const pollHeadings=()=>{for(const [id,type] of targets){const el=document.getElementById(id);if(!el||el.dataset.ddAnimated)continue;const r=el.getBoundingClientRect();if(r.top<innerHeight*.95&&r.bottom>0)animateIn(el,type);}};
addEventListener('scroll',pollHeadings,{passive:true});addEventListener('resize',pollHeadings,{passive:true});requestAnimationFrame(pollHeadings);

// Animate the brand title on entry without opacity=0 as the default style.
const hero=document.getElementById('hero');
if(hero&&'IntersectionObserver'in window){const o=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){hero.classList.add('v7-active');o.disconnect()}}),{threshold:.12});o.observe(hero)}
else hero?.classList.add('v7-active');
// Subtle variety for cards; content starts visible and animates only when reached.
if(!reduced&&'IntersectionObserver' in window){
 let seq=0;
 const observed=[...root.querySelectorAll('.reveal')].filter(el=>!el.closest('#review-grid')&&!el.closest('#boss-home-carousel'));
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{
  if(!entry.isIntersecting)return;const el=entry.target;observer.unobserve(el);
  if(el.dataset.ddCardAnimated)return;el.dataset.ddCardAnimated='1';
  const type=Number(el.dataset.ddCardType||0)%3;
  const frames=type===0?[{transform:'translateX(-16px)',opacity:.92},{transform:'none',opacity:1}]:type===1?[{transform:'translateX(20px)',opacity:.93},{transform:'none',opacity:1}]:[{transform:'scale(.98)',opacity:.94},{transform:'scale(1)',opacity:1}];
  el.animate(frames,{duration:700,easing:'cubic-bezier(.22,.88,.24,1)'});
 });},{threshold:.09});
 observed.forEach(el=>{el.dataset.ddCardType=String(seq++);observer.observe(el)});
}
for(const [query,type] of [['.v2-community-header h2','reveal-right'],['.v2-join-heading h2','slide-left'],['.v3-sys-head h2','focus']]){
 const el=root.querySelector(query);if(!el||!io)continue;el.dataset.ddMotion=type;io.observe(el);
}
// Existing backend visibility preferences also apply to nested chapters.
try{const raw=localStorage.getItem('duoduo_layout');if(raw){const layout=JSON.parse(raw);for(const v of layout.sections||[]){if(v.visible===false){const el=document.getElementById(v.id);if(el&&el.closest('main.dd-home-v7'))el.hidden=true;}}}}catch(e){}
})();

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
  // Official theme button remains managed by app.js; do not attach a second listener.
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
  if(cinemaVideo){
    cinemaVideo.muted=true;cinemaVideo.playsInline=true;cinemaVideo.loop=true;
    if(reduced){cinemaVideo.pause();cinemaVideo.removeAttribute('autoplay')}
    else if('IntersectionObserver' in window){
      const movieObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
        if(e.isIntersecting&&!document.hidden)playVideo();else cinemaVideo.pause();
      }),{rootMargin:'400px 0px'});
      movieObserver.observe(cinema);
    }else playVideo();
  }
  addEventListener('scroll',request,{passive:true});
  addEventListener('resize',()=>{visualProgress=targetProgress=scrollProgress(root,stage.clientHeight);request()},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cinemaVideo?.pause();else request()});
  visualProgress=targetProgress=scrollProgress(root,stage.clientHeight);
  request();
})();


/* HOME v11: home-page announcement detail. Same source records as app.js; never navigate away. */
(()=>{'use strict';
 const list=document.getElementById('news-list');if(!list)return;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tags={'重要消息':'重要','維護通知':'維護','更新說明':'更新','活動資訊':'活動','序號發放':'序號','處分名單':'處分'};
 const tagClass={'重要消息':'category-important','維護通知':'category-maintenance','更新說明':'category-update','活動資訊':'category-event','序號發放':'category-code','處分名單':'category-punishment'};
 // Keep the body readable even if an older announcement uses only plain lines.
 const inline=source=>{
  let s=esc(source);
  // Discord custom emoji (animated or static) are displayed using Discord CDN images.
  s=s.replace(/&lt;(a?):([A-Za-z0-9_]+):(\d{16,22})&gt;/g,(_,animated,name,id)=>`<img class="dd-news-emoji" src="https://cdn.discordapp.com/emojis/${id}.${animated?'gif':'png'}" alt=":${esc(name)}:" loading="lazy">`);
  s=s.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
  s=s.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,(_,label,url)=>`<a href="${url.replace(/&amp;/g,'&amp;')}" target="_blank" rel="noopener noreferrer">${label}</a>`);
  return s;
 };
 const formatBody=raw=>{
   const lines=String(raw??'').replace(/\r\n?/g,'\n').split('\n');let html='',items=[],kind='',para=[];
   const flushP=()=>{if(para.length){html+=`<p>${para.map(inline).join('<br>')}</p>`;para=[]}};
   const flushL=()=>{if(items.length){html+=`<${kind} class="dd-news-list">${items.map(x=>`<li>${inline(x)}</li>`).join('')}</${kind}>`;items=[];kind=''}};
   for(const line of lines){const t=line.trim();if(!t){flushP();flushL();continue}
     const title=t.match(/^#{1,4}\s+(.+)$/);
     const m=t.match(/^(?:[-*•·・]\s+)(.+)$/),n=t.match(/^\d+[.、．)]\s*(.+)$/);
     if(title){flushP();flushL();html+=`<h3>${inline(title[1])}</h3>`;continue}
     if(m||n){flushP();const next=n?'ol':'ul';if(items.length&&kind!==next)flushL();kind=next;items.push((m||n)[1]);continue}
     flushL();para.push(t);
   }flushP();flushL();return html;
 };
 function bodyHTML(n){
   const blocks=Array.isArray(n.newsSections)?n.newsSections.filter(x=>x&&typeof x==='object'):[];
   const lead=String(n.newsLead||'').trim();const serial=n.newsSerial||null;
   if(!blocks.length&&!lead&&!serial)return formatBody(n.body);
   let html=lead?`<div class="dd-news-intro">${formatBody(lead)}</div>`:'';
   for(const block of blocks){if(!String(block.title||block.body||'').trim())continue;
     html+=`<section class="dd-news-detail-block"><h3>${inline(block.title||'公告內容')}</h3>${formatBody(block.body)}</section>`;
   }
   if(serial&&typeof serial==='object'){
    if(serial.rewards)html+=`<section class="dd-news-detail-block"><h3>序號獎勵</h3>${formatBody(serial.rewards)}</section>`;
    if(serial.code)html+=`<section class="dd-news-detail-block"><h3>活動序號</h3><div class="dd-news-copy-row"><code>${esc(serial.code)}</code><button type="button" class="dd-news-copy" data-code="${esc(serial.code)}">複製序號</button></div></section>`;
    if(serial.period)html+=`<section class="dd-news-detail-block"><h3>使用期限</h3>${formatBody(serial.period)}</section>`;
    if(serial.notes)html+=`<section class="dd-news-detail-block"><h3>注意事項</h3>${formatBody(serial.notes)}</section>`;
   }
   return html||formatBody(n.body);
 }
 function open(index){
  const data=window.DuoDuoHomepageNews;
  const n=Array.isArray(data)?data[index]:null;
  if(!n){location.href=`news.html#n-${index}`;return}
  document.getElementById('dd-home-news-modal')?.remove();
  const d=document.createElement('dialog');d.id='dd-home-news-modal';
  const className=tagClass[n.tag]||'category-default';
  d.innerHTML=`<div class="dd-news-modal-dialog" role="document">
  <button type="button" class="dd-news-close" aria-label="關閉公告">×</button>
  <div class="dd-news-modal-scroll" tabindex="0"><article class="dd-news-detail-card">
  <div class="dd-news-meta"><span class="tag ${className}">${esc(tags[n.tag]||n.tag||'公告')}</span><time>${esc(n.date)}</time></div>
  <h2 id="dd-news-modal-title">${esc(n.title)}</h2><div class="dd-news-body">${bodyHTML(n)}</div>
  </article></div></div>`;
  d.setAttribute('aria-labelledby','dd-news-modal-title');document.body.append(d);d.showModal();
  const close=()=>{if(d.open)d.close();d.remove()};
  d.querySelector('.dd-news-close').addEventListener('click',close);
  d.addEventListener('click',e=>{if(e.target===d)close()});
  d.addEventListener('cancel',e=>{e.preventDefault();close()});
  d.querySelectorAll('[data-code]').forEach(b=>b.addEventListener('click',()=>{
    const text=b.dataset.code||'';
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>b.textContent='已複製',()=>prompt('請複製序號：',text));
    else prompt('請複製序號：',text);
  }));
  d.querySelector('.dd-news-modal-scroll').focus({preventScroll:true});
 }
 list.addEventListener('click',e=>{
  const row=e.target.closest('.news-item');if(!row||!list.contains(row))return;
  e.preventDefault();e.stopPropagation();
  const index=[...list.querySelectorAll('.news-item')].indexOf(row);if(index>=0)open(index);
 });
})();
