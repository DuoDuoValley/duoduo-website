/* Shared by item and BUFF detail dialogs. Prevent scroll chaining to background. */
(()=>{'use strict';
 const overlay=document.getElementById('pediaBackdrop');const modal=document.getElementById('pediaModal');
 if(!overlay||!modal)return;
 let originY=0,opener=null,open=false;
 const close=()=>{
  if(!open){overlay.hidden=true;return;}
  overlay.hidden=true;document.body.classList.remove('pedia-modal-open');
  document.body.style.removeProperty('--pedia-lock-y');
  const current=document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior='auto';
  window.scrollTo(0,originY);
  document.documentElement.style.scrollBehavior=current;
  open=false;if(opener?.isConnected)opener.focus({preventScroll:true});
 };
 const show=()=>{
  if(!open){originY=window.scrollY||document.documentElement.scrollTop;opener=document.activeElement;open=true;}
  const contents=[...modal.children],scroller=document.createElement('div');
  scroller.className='pedia-modal-scroll';scroller.setAttribute('aria-label','詳細內容捲動區');
  for(const el of contents)if(!el.classList.contains('pedia-close'))scroller.append(el);
  modal.append(scroller);scroller.scrollTop=0;
  document.body.style.setProperty('--pedia-lock-y',`-${originY}px`);
  document.body.classList.add('pedia-modal-open');
  overlay.hidden=false;
  modal.querySelector('.pedia-close')?.focus({preventScroll:true});
 };
 overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open){e.stopPropagation();close();}});
 window.DuoDuoPediaModal={show,close};
})();
