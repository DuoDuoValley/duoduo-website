/* Itempedia full-name-to-icon decoration for announcements and event descriptions.
 * Safe DOM text only: no HTML injection, no mutation of already illustrated rewards. */
(()=>{'use strict';
const defaults={items:window.DuoDuoItemCatalogDefault?.items||[],buffs:window.DuoDuoBuffCatalogDefault?.buffs||[]};
const endpoint=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com/api/site-data':'/api/site-data';
let patterns=[];
const skip='a,button,select,textarea,input,code,pre,script,style,svg,.news-exp-inline,.news-item-thumb,.pia-inline,.duoduo-exp-inline,[contenteditable]';
function prepare(items,buffs){const byName=new Map();
  for(const row of [...items,...buffs]){if(row?.enabled===false||!row?.image||!row?.name)continue;
   for(const word of [row.name,...(row.keywords||[])]){const name=String(word||'').trim();if(name.length<2||name.length>120||byName.has(name))continue;byName.set(name,row.image)}
  }
  patterns=[...byName.entries()].sort((a,b)=>b[0].length-a[0].length);
}
function decorate(root){if(!root||!patterns.length)return;
 const nodes=[];const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{
   if(!n.nodeValue?.trim())return NodeFilter.FILTER_REJECT;
   const p=n.parentElement;if(!p||p.closest(skip)||p.closest('.news-reward-description')?.querySelector('.news-item-thumb img'))return NodeFilter.FILTER_REJECT;
   return NodeFilter.FILTER_ACCEPT;
 }});
 while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){const content=node.nodeValue||'';if(content.length>8000||!patterns.some(([w])=>content.includes(w)))continue;
  const fragment=document.createDocumentFragment();let pos=0,hit=false;
  while(pos<content.length){let best=null,bestPos=content.length;
   for(const entry of patterns){const i=content.indexOf(entry[0],pos);if(i<0)continue;if(i<bestPos||(i===bestPos&&entry[0].length>best?.[0]?.length)){best=entry;bestPos=i}}
   if(!best)break;
   fragment.append(document.createTextNode(content.slice(pos,bestPos)));
   const wrap=document.createElement('span');wrap.className='pia-inline';const image=document.createElement('img');image.src=best[1];image.alt='';image.loading='lazy';image.onerror=()=>image.remove();wrap.append(image,document.createTextNode(best[0]));fragment.append(wrap);
   pos=bestPos+best[0].length;hit=true;
  }
  if(hit){fragment.append(document.createTextNode(content.slice(pos)));node.replaceWith(fragment)}
 }
}
function update(){for(const selector of ['.news-detail-card .news-body','.news-detail-card','.event-detail-copy .detail-body'])for(const el of document.querySelectorAll(selector))decorate(el)}
let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;observer.disconnect();update();observer.observe(document.body,{childList:true,subtree:true})})};
const observer=new MutationObserver(changes=>{if(changes.some(c=>[...c.addedNodes].some(n=>n.nodeType===1&&!n.closest?.('.pia-inline'))))schedule()});
prepare(defaults.items,defaults.buffs);
if(document.body)observer.observe(document.body,{childList:true,subtree:true});
schedule();
(async()=>{try{const res=await fetch(endpoint,{cache:'no-store'});if(!res.ok)return;const obj=await res.json();const live=obj?.data?.duoduo_itempedia;if(Array.isArray(live?.items?.items)&&Array.isArray(live?.buffs?.buffs)){prepare(live.items.items,live.buffs.buffs);schedule()}}catch(_){}})();
})();
