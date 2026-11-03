/* Official DuoDuo Itempedia. All source text is safely rendered as text nodes. */
(()=>{'use strict';
const defaults=window.DuoDuoItemCatalogDefault||{items:[],categories:[]};
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
let catalog=defaults;
let category='全部',query='',view='grid';
const all=()=>catalog.items.filter(x=>x.enabled!==false).sort((a,b)=>(a.sort??0)-(b.sort??0));
function el(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
function img(path,name){const node=el('img');node.src=path||'';node.alt=name||'';node.loading='lazy';node.onerror=()=>{node.hidden=true;};return node;}
function qnorm(s){return String(s||'').toLowerCase().normalize('NFKC').replace(/\s/g,'');}
function normalizeWzText(raw){return String(raw||'').replace(/\\r\\n/g,'\n').replace(/\\n/g,'\n').replace(/\r\n?/g,'\n');}
function plainWzText(raw){return normalizeWzText(raw).replace(/#c/g,'').replace(/#/g,'').replace(/\s+/g,' ').trim();}
function formattedDescription(raw){
 const text=normalizeWzText(raw),para=el('p','pedia-modal-copy pedia-wz-description');
 let accent=false,buffer='';
 const flush=()=>{if(!buffer)return;const span=el('span',accent?'pedia-wz-emphasis':'',buffer);para.append(span);buffer='';};
 for(let i=0;i<text.length;i++){
   if(text.startsWith('#c',i)){flush();accent=true;i++;continue;}
   if(text[i]==='#'&&accent){flush();accent=false;continue;}
   buffer+=text[i];
 }
 flush();return para;
}
function getDetail(item){
  // Keep previously saved preview drafts compatible with newly added effect fields.
  const original=defaults.items.find(x=>x.id===item.id)||{};
  // Refresh older local preview drafts whose effect data was still pending.
  // Keep any user-entered effect intact.
  const oldPending=item.effectStatus==='pending'&&!String(item.effectText||'').trim();
  const useConfirmedDefault=oldPending&&Boolean(original.effectText);
  return {effectText:useConfirmedDefault?original.effectText:(item.effectText??original.effectText??''),
          effectStatus:useConfirmedDefault?original.effectStatus:(item.effectStatus??original.effectStatus??'')};
}
function renderWzTooltip(raw){const src=String(raw||'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');const wrap=el('div','pedia-item-tooltip');const body=el('div','wz-body');wrap.append(body);const blocks=src.split(/\n\n+/);
  for(const block of blocks){const lineBox=el('div','wz-block');let mode='normal',buf='';const flush=()=>{if(!buf)return;const span=el('span',mode==='accent'?'wz-accent':mode==='muted'?'wz-muted':'wz-normal');span.textContent=buf;lineBox.append(span);buf='';};
    for(let i=0;i<block.length;i++){if(block.startsWith('#c',i)){flush();mode='accent';i++;continue;}if(block[i]==='#'&&mode!=='normal'){flush();mode='normal';continue;}buf+=block[i];}
    flush();body.append(lineBox);}
  return wrap;}
function drawFilters(){const root=$('pediaFilters');root.replaceChildren();const counts=new Map();for(const i of all())counts.set(i.category,(counts.get(i.category)||0)+1);for(const k of ['全部',...catalog.categories,...[...counts.keys()].filter(x=>!catalog.categories.includes(x))]){const count=k==='全部'?all().length:(counts.get(k)||0);if(k!=='全部'&&!count)continue;const b=el('button');b.type='button';b.setAttribute('aria-pressed',String(category===k));b.append(document.createTextNode(k));b.append(el('b','',count));b.onclick=()=>{category=k;drawFilters();render()};root.append(b);}}
function filtered(){return all().filter(i=>(category==='全部'||i.category===category)&&(!query||qnorm([i.name,i.description,...(i.keywords||[])].join(' ')).includes(qnorm(query))));}
function render(){const out=$('pediaCards');out.replaceChildren();out.classList.toggle('pedia-list',view==='list');const items=filtered();$('pediaCount').textContent=`目前顯示 ${items.length} 項／共 ${all().length} 項道具`;
if(!items.length){out.append(el('div','pedia-none','沒有符合條件的道具，試試其他關鍵字或分類。'));return;}
for(const item of items){const b=el('button','pedia-card');b.type='button';const thumb=el('span','pedia-thumb');thumb.append(img(item.image,item.name));const c=el('span','pedia-card-content');c.append(el('span','pedia-chip',item.category),el('span','pedia-name',item.name),el('span','pedia-short',plainWzText(item.description)));b.append(thumb,c);b.onclick=()=>openDetail(item);out.append(b);}}
function openDetail(item){
  const back=$('pediaBackdrop'),dialog=$('pediaModal'),detail=getDetail(item);
  dialog.replaceChildren();
  const close=el('button','pedia-close','×');close.type='button';close.setAttribute('aria-label','關閉');close.onclick=()=>back.hidden=true;
  const head=el('div','pedia-modal-head');head.append(img(item.image,item.name));
  const text=el('div');text.append(el('small','',item.category),el('h2','',item.name));head.append(text);
  dialog.append(close,head,el('h3','', '道具介紹'),formattedDescription(item.description));
  // Show effect lines only; never repeat the plain description inside the dark tooltip.
  if(detail.effectText.trim()){
    dialog.append(el('h3','pedia-effect-heading','能力加成'));
    dialog.append(renderWzTooltip(detail.effectText));
  }else if(detail.effectStatus==='pending'){
    dialog.append(el('div','pedia-effect-pending','能力加成數值待核對：提供的 Excel 僅有頭銜簡介，尚未包含遊戲內的實際加成。'));
  }
  const meta=el('div','pedia-modal-meta');meta.append(el('span','',item.tradeable===true?'可交易':item.tradeable===false?'無法交易':'交易限制未標註'));
  if(item.timed===true)meta.append(el('span','','具時效性'));
  dialog.append(meta);back.hidden=false;close.focus();
}
function keywordDemo(){const node=$('pediaDemoOutput');if(!node)return;node.replaceChildren();const text=$('pediaDemoText').value;const names=[];
for(const item of all())for(const word of [item.name,...(item.keywords||[])])if(word?.trim())names.push({word:String(word).trim(),item});
names.sort((a,b)=>b.word.length-a.word.length);
let offset=0;
while(offset<text.length){let found=null;for(const x of names){if(text.startsWith(x.word,offset)){found=x;break;}}if(!found){const t=el('span','',text[offset]);node.append(t);offset++;continue;}
const wrap=el('span','pedia-inline-item');wrap.append(img(found.item.image,found.item.name),document.createTextNode(found.word));node.append(wrap);offset+=found.word.length;}
}
const back=$('pediaBackdrop');back.addEventListener('click',e=>{if(e.target===back)back.hidden=true});document.addEventListener('keydown',e=>{if(e.key==='Escape')back.hidden=true;});
$('pediaSearch').addEventListener('input',e=>{query=e.target.value;render()});
$('pediaSearch').value=params.get('q')||'';query=$('pediaSearch').value;
document.querySelectorAll('[data-pedia-view]').forEach(btn=>btn.onclick=()=>{view=btn.dataset.pediaView;document.querySelectorAll('[data-pedia-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));render()});
$('pediaDemoText')?.addEventListener('input',keywordDemo);
$('pediaTotal').textContent=all().length;
if($('pediaCategoryTotal'))$('pediaCategoryTotal').textContent=(catalog.categories||[]).length;
drawFilters();render();keywordDemo();
window.addEventListener('duoduo-itempedia-data',ev=>{const next=ev.detail?.items;if(!Array.isArray(next?.items)||!Array.isArray(next?.categories))return;catalog=next;if(category!=='全部'&&!catalog.categories.includes(category))category='全部';$('pediaTotal').textContent=all().length;const catTotal=$('pediaCategoryTotal');if(catTotal)catTotal.textContent=catalog.categories.length;drawFilters();render();keywordDemo();});
})();
