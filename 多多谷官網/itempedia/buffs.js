/* DuoDuo Itempedia V2 — BUFF viewer (static local preview, no cloud writes) */
(()=>{'use strict';
const defaults=window.DuoDuoBuffCatalogDefault||{tiers:[],buffs:[]};
const draftKey='duoduo_itempedia_buff_draft_v2';
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
let db=defaults;
if(false){
 try {const parsed=JSON.parse(localStorage.getItem(draftKey));if(Array.isArray(parsed?.buffs)&&Array.isArray(parsed?.tiers))db=parsed;}catch(_){ /* use defaults */ }
}
let selected='全部',keyword='',buffView='grid';
if((db.tiers||[]).includes(params.get('tier')))selected=params.get('tier');
const norm=s=>String(s||'').toLowerCase().normalize('NFKC').replace(/\s/g,'');
const txt=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
const visible=()=>db.buffs.filter(x=>x.enabled!==false);
const activeRows=()=>{const rows=visible().filter(x=>selected==='全部'||x.tier===selected);if(!keyword)return rows;
  const q=norm(keyword),nameMatches=rows.filter(x=>norm([x.name,...(x.keywords||[])].join(' ')).includes(q));
  return nameMatches.length?nameMatches:rows.filter(x=>norm(x.description).includes(q));
};
function groups(rows){const by=new Map();for(const row of rows){if(!by.has(row.name))by.set(row.name,[]);by.get(row.name).push(row);}return [...by.values()].sort((a,b)=>Math.min(...a.map(x=>Number(x.sourceRow??999999)))-Math.min(...b.map(x=>Number(x.sourceRow??999999))));}
function pic(src,alt){const i=txt('img');i.alt=alt||'';i.src=src||'';i.loading='lazy';i.onerror=()=>{i.style.visibility='hidden';};return i;}
function plain(s){return String(s||'').replace(/\\r\\n/g,'\n').replace(/\\n/g,'\n').replace(/\r\n?/g,'\n').replace(/#c/g,'').replace(/#/g,'').replace(/\s+/g,' ').trim();}
/* No HTML injection: #c starts a highlight, # ends it; actual or escaped newlines preserved. */
function renderWzText(raw){const s=String(raw||'').replace(/\\r\\n/g,'\n').replace(/\\n/g,'\n').replace(/\r\n?/g,'\n');const outer=txt('div','pedia-buff-wz');let highlighted=false;let buffer='';
 const flush=()=>{if(buffer){const piece=txt('span',highlighted?'buff-accent':'',buffer);outer.append(piece);buffer='';}};
 for(let i=0;i<s.length;i++){if(s.startsWith('#c',i)){flush();highlighted=true;i++;continue;}if(s[i]==='#'&&highlighted){flush();highlighted=false;continue;}buffer+=s[i];}
 flush();return outer;}
function paintFilters(){const root=$('buffFilters');root.replaceChildren();for(const tier of ['全部',...db.tiers]){const names=new Set(visible().filter(x=>tier==='全部'||x.tier===tier).map(x=>x.name));const b=txt('button','',tier);b.type='button';b.setAttribute('aria-pressed',String(tier===selected));b.append(txt('b','',names.size));b.onclick=()=>{selected=tier;paintFilters();paintCards();const u=new URL(location.href);u.searchParams.set('section','buffs');if(tier==='全部')u.searchParams.delete('tier');else u.searchParams.set('tier',tier);const href=u.pathname+u.search+u.hash;if(href!==location.pathname+location.search+location.hash)history.pushState({},'',href);};root.append(b);}}
function allTiers(rows){return db.tiers.filter(t=>rows.some(x=>x.tier===t));}
function paintCards(){const items=groups(activeRows());const node=$('buffCards');node.replaceChildren();node.classList.toggle('pedia-list',buffView==='list');$('buffCount').textContent=`顯示 ${items.length} 種 BUFF／${activeRows().length} 筆效果（完整資料 ${groups(visible()).length} 種／${visible().length} 筆）`;
 if(!items.length){node.append(txt('div','pedia-none','找不到符合條件的 BUFF，請嘗試更換關鍵字或會員類別。'));return;}
 for(const versions of items){const first=versions[0];const card=txt('button','pedia-card pedia-buff-card');card.type='button';const thumb=txt('span','pedia-thumb');thumb.append(pic(first.image,first.name));const content=txt('span','pedia-card-content');const label=allTiers(versions).join(' · ');content.append(txt('span','pedia-chip',label),txt('span','pedia-name',first.name),txt('span','pedia-short',plain(first.description)));const info=txt('span','buff-versions-count',`${versions.length} 筆效果`);card.append(thumb,content,info);card.onclick=()=>openBuff(first.name);node.append(card);
 }
}
function openBuff(name){const rows=visible().filter(x=>x.name===name&& (selected==='全部'||x.tier===selected));const modal=$('pediaModal'),overlay=$('pediaBackdrop');modal.replaceChildren();if(!rows.length)return;
 const close=txt('button','pedia-close','×');close.type='button';close.setAttribute('aria-label','關閉 BUFF 詳細內容');close.onclick=()=>window.DuoDuoPediaModal.close();const head=txt('div','pedia-modal-head');head.append(pic(rows[0].image,name));const header=txt('div');header.append(txt('small','','BUFF · '+rows.length+' 筆效果'),txt('h2','',name));head.append(header);modal.append(close,head);
 const info=txt('p','pedia-buff-modal-intro',`同名道具共用一張圖示；以下保留 Excel 每筆原始效果${selected==='全部'?'，依類別整理':'（已套用「'+selected+'」篩選）'}。效果編號僅為資料區分，並非遊戲官方版本名。`);modal.append(info);
 for(const tier of db.tiers){const subset=rows.filter(x=>x.tier===tier).sort((a,b)=>(a.sort??0)-(b.sort??0));if(!subset.length)continue;modal.append(txt('h3','pedia-buff-tier-title',tier));for(const [i,r] of subset.entries()){const section=txt('section','pedia-buff-detail');const h=txt('div','pedia-buff-detail-head');h.append(txt('strong','',subset.length>1?`效果 ${i+1} / ${subset.length}`:'完整效果'));h.append(txt('span','',`原始 Excel 第 ${r.sourceRow||'—'} 列`));section.append(h,renderWzText(r.description));modal.append(section);}}
 window.DuoDuoPediaModal.show();}
$('buffSearch').addEventListener('input',e=>{keyword=e.target.value||'';paintCards();});
// The two content sections keep independent view choices while switching tabs.
document.querySelectorAll('[data-buff-view]').forEach(btn=>btn.addEventListener('click',()=>{
 buffView=btn.dataset.buffView;
 document.querySelectorAll('[data-buff-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.buffView===buffView)));
 paintCards();
}));
const tabs=[...document.querySelectorAll('[data-pedia-section]')];
function switchSection(section){for(const b of tabs)b.setAttribute('aria-pressed',String(b.dataset.pediaSection===section));$('pediaItemsSection').hidden=section!=='items';$('pediaBuffsSection').hidden=section!=='buffs';$('pediaTotal').textContent=section==='buffs'?groups(visible()).length:(window.DuoDuoItemCatalogDefault?.items?.length||72);$('pediaMetricLabel').textContent=section==='buffs'?'種 BUFF 名稱':'項專屬道具';$('pediaHeroDesc').innerHTML=section==='buffs'?'依永恆祝福、VIP、VVIP、SSVIP 查看原始 BUFF 效果，<br>同名同圖示的不同數值，也可逐一查詢。':'從進階繼承、強化工坊到經驗加倍與會員福利，<br>快速找到每件道具的用途、增益效果與使用限制。';}
for(const b of tabs)b.addEventListener('click',()=>{
 const section=b.dataset.pediaSection;
 switchSection(section);
 const u=new URL(location.href);
 if(section==='items')u.searchParams.delete('section');else u.searchParams.set('section','buffs');
 const href=u.pathname+u.search+u.hash;
 if(href!==location.pathname+location.search+location.hash)history.pushState({},'',href);
});
window.addEventListener('popstate',()=>{
 const q=new URLSearchParams(location.search);
 switchSection(q.get('section')==='buffs'?'buffs':'items');
 selected=(db.tiers||[]).includes(q.get('tier'))?q.get('tier'):'全部';
 paintFilters();paintCards();
});
if($('pediaBuffTotal'))$('pediaBuffTotal').textContent=groups(visible()).length;
paintFilters();paintCards();switchSection(params.get('section')==='buffs'?'buffs':'items');
window.DuoDuoPediaApplyBuffs=(data)=>{
 if(!Array.isArray(data?.buffs)||!Array.isArray(data?.tiers))return false;
 db={...db,tiers:data.tiers,buffs:data.buffs};
 if(selected!=='全部'&&!db.tiers.includes(selected))selected='全部';
 if($('pediaBuffTotal'))$('pediaBuffTotal').textContent=groups(visible()).length;
 paintFilters();paintCards();
 const section=$('pediaBuffsSection').hidden?'items':'buffs';
 switchSection(section);
 return true;
};
})();
