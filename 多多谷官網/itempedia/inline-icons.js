/* Shared automatic item icons for announcements and event details.
   Matches complete item names or admin-defined keywords in text nodes only;
   preserves links, existing reward icons, formatting and interactive controls. */
(()=>{'use strict';
 const defaults=window.DuoDuoItemCatalogDefault||{items:[]};
 const buffDefaults=window.DuoDuoBuffCatalogDefault||{buffs:[]};
 const endpoint=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com/api/site-data':'/api/site-data';
 const isSafeImage=src=>{if(typeof src!=='string'||!src||src.length>1400)return false;
  if(/^https:\/\//i.test(src))return true;
  return !/^(?:\/|\\|data:|blob:|javascript:|http:)/i.test(src)&&!src.includes('..')&&!/[<>"']/.test(src);
 };
 function iconEntries(items,buffs){
  const map=new Map();
  const add=(name,image)=>{const word=String(name||'').trim();if(!word||word.length<3||!isSafeImage(image)||map.has(word))return;map.set(word,image)};
  for(const item of items||[]){if(item?.enabled===false)continue;add(item.name,item.image);for(const k of item.keywords||[])add(k,item.image)}
  for(const buff of buffs||[]){if(buff?.enabled===false)continue;add(buff.name,buff.image);for(const k of buff.keywords||[])add(k,buff.image)}
  return [...map].sort((a,b)=>b[0].length-a[0].length);
 }
 let entries=iconEntries(defaults.items,buffDefaults.buffs);
 const allowedRoot=()=>document.querySelector('#pageDetail')||document.querySelector('#detailBody');
 function safeMatch(text,start){for(const [key,src] of entries){if(text.startsWith(key,start))return {key,src}}return null}
 const SKIP='a,button,code,pre,h1,h2,h3,h4,script,style,textarea,input,select,option,.news-inline-item,.news-exp-inline,.duoduo-exp-inline,.dd-item-inline,.news-reward-name,.news-item-thumb,[contenteditable]';
 function replaceText(node){const source=node.nodeValue||'';if(source.length<3)return;
  const owner=node.parentElement;if(!owner||owner.closest(SKIP))return;
  let current=0,changed=false;const fragment=document.createDocumentFragment();
  while(current<source.length){let found=null,index=current;
   for(;index<source.length;index++){found=safeMatch(source,index);if(found)break}
   if(!found){fragment.append(document.createTextNode(source.slice(current)));break}
   if(index>current)fragment.append(document.createTextNode(source.slice(current,index)));
   const wrap=document.createElement('span');wrap.className='dd-item-inline';const img=document.createElement('img');
   img.src=found.src;img.alt='';img.loading='lazy';img.decoding='async';img.onerror=()=>img.remove();
   wrap.append(img,document.createTextNode(found.key));fragment.append(wrap);
   current=index+found.key.length;changed=true;
  }
  if(changed)node.replaceWith(fragment);
 }
 function fillMissingRewardThumbs(root){
  for(const row of root.querySelectorAll('.news-reward-description')){
   if(row.querySelector('img'))continue;
   const name=row.querySelector('.news-reward-name')?.textContent?.trim();
   if(!name)continue;
   const hit=entries.find(x=>x[0]===name);
   if(!hit)continue;
   const holder=document.createElement('span');holder.className='news-item-thumb dd-item-auto-thumb';
   const image=document.createElement('img');image.alt='';image.src=hit[1];image.loading='lazy';image.decoding='async';image.onerror=()=>holder.remove();
   holder.append(image);row.prepend(holder);
  }
 }
 let painting=false;
 function paint(){if(painting||!entries.length)return;painting=true;
  try{const root=allowedRoot();if(!root)return;
   fillMissingRewardThumbs(root);
   const containers=root.matches('#detailBody')?[root]:[...root.querySelectorAll('.news-body')];
   for(const content of containers){const walker=document.createTreeWalker(content,NodeFilter.SHOW_TEXT);const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes)if(node.isConnected)replaceText(node);
   }
  }finally{painting=false}
 }
 const sty=document.createElement('style');sty.textContent='.dd-item-inline{display:inline-flex;gap:4px;align-items:center;vertical-align:middle;white-space:normal}.dd-item-inline img{width:23px;height:23px;object-fit:contain;image-rendering:pixelated;flex:none}.dd-item-auto-thumb{flex:none}';document.head.append(sty);
 const watch=()=>{const host=document.querySelector('#pageDetail')||document.querySelector('#detailBody');if(!host)return false;
  let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;paint()})}).observe(host,{subtree:true,childList:true,characterData:true});paint();return true};
 if(!watch())document.addEventListener('DOMContentLoaded',watch,{once:true});
 const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),5500);
 fetch(endpoint,{cache:'no-store',signal:controller.signal}).then(x=>x.ok?x.json():null).then(payload=>{
  const data=payload?.data?.duoduo_itempedia;
  if(payload?.initialized!==true||!Array.isArray(data?.items)||!Array.isArray(data?.buffs))return;
  entries=iconEntries(data.items,data.buffs);paint();
 }).catch(()=>{}).finally(()=>clearTimeout(timeout));
})();
