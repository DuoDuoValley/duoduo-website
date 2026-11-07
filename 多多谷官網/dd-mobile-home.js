/* Progressive mobile layout: native disclosure and two manual scroll galleries.
   Original nodes and attributes are restored when returning to desktop. */
(()=>{
  'use strict';
  const mobile=matchMedia('(max-width:760px), (max-width:1024px) and (pointer:coarse)');
  const galleryLayout=matchMedia('(orientation:portrait), (min-height:600px)');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const cleanup=[];
  let systemsOpen=false;
  let releaseSystems=null;
  function gallery(selector,label){
    const track=document.querySelector(selector);
    if(!track || track.children.length<2)return;
    const attributes=['aria-hidden','role','aria-label','aria-roledescription','tabindex','id'];
    const original=new Map(attributes.map(key=>[key,track.getAttribute(key)]));
    track.removeAttribute('aria-hidden');track.setAttribute('role','region');
    track.setAttribute('aria-label',label);track.setAttribute('aria-roledescription','輪播');
    track.tabIndex=0;track.id ||= selector.includes('feature-cards')?'dd-mobile-features':'dd-mobile-community';
    track.classList.add('dd-mobile-gallery');
    const nav=document.createElement('div');nav.className='dd-mobile-gallery-nav';
    const count=document.createElement('span');count.setAttribute('aria-live','polite');count.setAttribute('aria-atomic','true');
    const previous=document.createElement('button'),next=document.createElement('button');
    for(const [button,text,name] of [[previous,'←','上一張'],[next,'→','下一張']]){
      button.type='button';button.textContent=text;button.setAttribute('aria-label',`${label}：${name}`);
      button.setAttribute('aria-controls',track.id);
    }
    nav.append(count,previous,next);track.after(nav);
    let index=0,frame=0;
    function update(){
      frame=0;const items=[...track.children];if(!items.length)return;
      const start=track.getBoundingClientRect().left+parseFloat(getComputedStyle(track).paddingLeft);
      let closest=Infinity;
      items.forEach((item,i)=>{const distance=Math.abs(item.getBoundingClientRect().left-start);if(distance<closest){closest=distance;index=i}});
      const text=`${index+1} / ${items.length} · 左右滑動`;
      if(count.textContent!==text)count.textContent=text;
      previous.disabled=index===0;next.disabled=index===items.length-1;
    }
    function queue(){if(!frame)frame=requestAnimationFrame(update);}
    function go(to){
      const items=[...track.children];const target=items[Math.max(0,Math.min(items.length-1,to))];
      if(!target)return;
      const left=track.scrollLeft+target.getBoundingClientRect().left-track.getBoundingClientRect().left-parseFloat(getComputedStyle(track).paddingLeft);
      track.scrollTo({left,behavior:reduced.matches?'instant':'smooth'});
    }
    const back=()=>go(index-1),forward=()=>go(index+1);
    const keyboard=event=>{
      if(event.target!==track || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();go(event.key==='Home'?0:event.key==='End'?track.children.length-1:index+(event.key==='ArrowRight'?1:-1));
    };
    previous.addEventListener('click',back);next.addEventListener('click',forward);
    track.addEventListener('keydown',keyboard);track.addEventListener('scroll',queue,{passive:true});
    addEventListener('resize',queue,{passive:true});
    const observer='ResizeObserver' in window?new ResizeObserver(queue):null;
    observer?.observe(track);queue();
    cleanup.push(()=>{
      cancelAnimationFrame(frame);observer?.disconnect();removeEventListener('resize',queue);
      track.removeEventListener('scroll',queue);track.removeEventListener('keydown',keyboard);
      previous.removeEventListener('click',back);next.removeEventListener('click',forward);nav.remove();
      track.classList.remove('dd-mobile-gallery');track.scrollLeft=0;
      original.forEach((value,key)=>{if(value===null)track.removeAttribute(key);else track.setAttribute(key,value)});
    });
  }
  function configure(){
    const existing=document.querySelector('.dd-mobile-system-details');
    if(existing)systemsOpen=existing.open;
    cleanup.splice(0).forEach(fn=>fn());
    if(!mobile.matches){releaseSystems?.();releaseSystems=null;return;}
    const first=document.querySelector('#system-collection .v3-main-sys-grid');
    const second=document.querySelector('#system-collection .v3-sys-short-grid');
    // Preserve the open native disclosure across rotation; only the galleries
    // need to change when a phone becomes a short landscape viewport.
    if(first && second && !existing){
      const details=document.createElement('details');details.className='dd-mobile-system-details';
      details.open=systemsOpen;
      const summary=document.createElement('summary');summary.textContent=`查看完整特色系統（${first.children.length+second.children.length} 項）`;
      first.before(details);details.append(summary,first,second);
      releaseSystems=()=>details.replaceWith(first,second);
    }
    if(galleryLayout.matches){
      gallery('#dd-story .scene-final .feature-cards','更多玩法');
      gallery('#dd-community-story .v2-community-grid','社群故事');
    }
  }
  mobile.addEventListener('change',configure);galleryLayout.addEventListener('change',configure);configure();
})();
