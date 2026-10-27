/* BOSS Atlas public reader; separate from the home-page BOSS carousel. */
(()=>{'use strict';
const root=document.querySelector('#ddBossAtlas');if(!root)return;
const API=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const safeImg=v=>{const s=String(v||'').trim();return /^assets\/boss-atlas\/[\w./%()\-]+$/i.test(s)||/^https:\/\//i.test(s)?s:''};
let data=null,group='全部',search='',selected={};
let searchComposing=false,renderDeferred=false;
const escapeAttr=escapeHTML;
const CATEGORIES=['裝備','強化','素材','箱子','其他'];
let staticCatalog=[],staticBossCatalog=[];

// Atlas v2 one-time data correction. Older cloud snapshots may override the updated JSON.
// Only apply corrections to v1 snapshots; never overwrite subsequent admin edits.
function migrateAtlasV2(value){
 if(!value || Number(value.dataRevision||1)>=2)return false;
 const certainItems=new Set(['item033','item034','item045','item046','item066','item067','item071','item072']);
 for(const it of (value.items||[]))if(String(it.name||'').includes('方塊')||['楓幣','楓葉點數'].includes(it.name))certainItems.add(it.id);
 for(const boss of (value.bosses||[])){
  if(boss.name==='燦爛的凶星'){
   const ds=Array.isArray(boss.difficulties)?boss.difficulties:[];
   const retired=ds.filter(d=>d.name==='終極');
   if(retired.length && !Array.isArray(boss.archivedDifficulties))boss.archivedDifficulties=retired;
   boss.difficulties=ds.filter(d=>d.name==='普通'||d.name==='困難');
   for(const difficulty of boss.difficulties){
    difficulty.hp=difficulty.name==='普通'?'(1)10京3700兆':'(1)23京3700兆';
   }
  }
  for(const difficulty of (boss.difficulties||[])){
   for(const drop of (difficulty.drops||[])){
    if(certainItems.has(drop.itemId))drop.chance=100;
   }
  }
 }
 value.dataRevision=2;
 return true;
}

function hydrateCatalog(source){
 const value=structuredClone(source);if(!Array.isArray(value.items))value.items=[];
 const existing=new Map(value.items.map(x=>[x.id,x]));
 for(const template of staticCatalog){
  const current=existing.get(template.id);
  if(current){if(!CATEGORIES.includes(current.category))current.category=template.category||'其他';}
  else if(!value.items.some(x=>x.name===template.name))value.items.push({...template});
 }
 for(const item of value.items){if(!CATEGORIES.includes(item.category))item.category='其他';}
 return value;
}
// Read-only reconciliation for old cloud revisions: the initial JSON already
// contains confirmed HP and guaranteed cube/currency drops. This never writes
// to Supabase; the admin publishes the migrated snapshot separately.
function reconcileOldPublicSnapshot(value){
 if(!value || Number(value.dataRevision||1)>=3)return;
 const baseline=new Map(staticBossCatalog.map(b=>[b.id,b]));
 const always=new Set(['item033','item034','item045','item046','item066','item067','item071','item072']);
 for(const it of (value.items||[]))if(String(it.name||'').includes('方塊')||['楓幣','楓葉點數'].includes(it.name))always.add(it.id);
 for(const b of (value.bosses||[])){
  const old=baseline.get(b.id)||staticBossCatalog.find(x=>x.name===b.name);
  for(const d of (b.difficulties||[])){
   const ref=old?.difficulties?.find(x=>x.name===d.name);
   if((d.hp==null||String(d.hp).trim()==='')&&ref?.hp)d.hp=ref.hp;
   const oldDrops=new Map((ref?.drops||[]).map(x=>[x.itemId,x]));
   for(const entry of (d.drops||[])){
    const other=oldDrops.get(entry.itemId);
    if((entry.quantity==null||String(entry.quantity).trim()==='')&&other?.quantity!=null)entry.quantity=other.quantity;
    if(always.has(entry.itemId))entry.chance=100;
   }
  }
 }
 value.dataRevision=3;
}
const itemMap=()=>new Map((data?.items||[]).map(x=>[x.id,x]));
const publicBosses=()=>Array.isArray(data?.bosses)?data.bosses.filter(b=>b&&b.published!==false):[];
// Render the frame only on first load / explicit selection, never rebuild the
// focused search input on each keystroke (especially during Zhuyin IME input).
function render(){
 if(!data)return;
 if(searchComposing){renderDeferred=true;return;}
 root.innerHTML=`<div class="dd-atlas-head"><div><div class="dd-atlas-kicker">BOSS ARCHIVE · DUODUO VALLEY</div><h2>BOSS 資訊</h2><p>切換難度、查看血量、符文需求、防禦及分類掉落；點擊圖示可查詢數量與機率。</p></div><span class="dd-atlas-count"></span></div><div class="dd-atlas-filters"><input id="ddBossSearch" class="dd-atlas-search" placeholder="搜尋 BOSS 名稱…" aria-label="搜尋 BOSS" value="${escapeAttr(search)}"><div class="dd-atlas-tabs" role="group" aria-label="BOSS 分類">${['全部','初階','中階','高階','終極'].map(x=>`<button type="button" data-group="${x}" class="${group===x?'active':''}">${x}</button>`).join('')}</div></div><div class="dd-atlas-grid"></div><p class="dd-empty" hidden>沒有符合條件的 BOSS。</p><p class="dd-atlas-footnote">掉落機率依各 BOSS／難度獨立計算。沒有提供機率的項目會顯示「未提供」，不代表必定掉落。未公開的 BOSS 不會出現在圖鑑。資料僅供多多谷伺服器使用。</p>`;
 renderResults();
}
function renderResults(){
 if(!data||searchComposing)return;
 const filtered=publicBosses().filter(b=>(group==='全部'||b.group===group)&&(`${b.name} ${b.group}`.toLowerCase().includes(search.trim().toLowerCase())));
 const container=root.querySelector('.dd-atlas-grid');if(!container)return;
 container.innerHTML=filtered.map(b=>card(b,itemMap())).join('');
 root.querySelector('.dd-atlas-count').textContent=`${filtered.length} 隻 BOSS`;
 root.querySelector('.dd-empty').hidden=filtered.length>0;
 scheduleRowAlignment();
}
let alignmentFrame=0;
function scheduleRowAlignment(){
 if(alignmentFrame)cancelAnimationFrame(alignmentFrame);
 alignmentFrame=requestAnimationFrame(()=>{alignmentFrame=0;alignBossRows()});
}
function alignBossRows(){
 const cards=[...root.querySelectorAll('.dd-atlas-grid > .dd-boss')];
 for(const el of root.querySelectorAll('.dd-boss-top,.dd-diff-list,.dd-drop-group')){el.style.minHeight='';el.style.display='';}
 if(!cards.length||matchMedia('(max-width:669px)').matches)return;
 // Only cards in the same visual row share heights; other rows stay independent.
 const rows=new Map();
 for(const card of cards){const y=Math.round(card.getBoundingClientRect().top);
  if(!rows.has(y))rows.set(y,[]);rows.get(y).push(card);}
 for(const row of rows.values()){
  const blocks=row.map(card=>card.querySelector('.dd-boss-top'));
  let topHeight=Math.max(...blocks.map(el=>el?.getBoundingClientRect().height||0));
  blocks.forEach(el=>{if(el)el.style.minHeight=Math.ceil(topHeight)+'px'});
  const tabs=row.map(card=>card.querySelector('.dd-diff-list'));
  const tabsHeight=Math.max(...tabs.map(el=>el?.getBoundingClientRect().height||0));
  tabs.forEach(el=>{if(el)el.style.minHeight=Math.ceil(tabsHeight)+'px'});
  for(const category of CATEGORIES){
   const sections=row.map(card=>[...card.querySelectorAll('.dd-drop-group')].find(e=>e.dataset.category===category));
   const visible=sections.some(el=>el?.dataset.hasDrops==='1');
   sections.forEach(el=>{if(el&&!visible)el.style.display='none'});
   if(!visible)continue;
   const height=Math.max(...sections.map(el=>el?.getBoundingClientRect().height||0));
   sections.forEach(el=>{if(el)el.style.minHeight=Math.ceil(height)+'px'});
  }
 }
}
window.addEventListener('resize',scheduleRowAlignment,{passive:true});
root.addEventListener('load',event=>{if(event.target.tagName==='IMG')scheduleRowAlignment()},true);
// Keep the stored HP text unchanged, but replace its numbered stage markers
// with readable Chinese labels in the public interface.
function formatHp(value){
 const text=String(value||'尚未提供');
 const pattern=/\(([1-4])\)\s*([\s\S]*?)(?=\s*\([1-4]\)|$)/g;
 const parts=[...text.matchAll(pattern)];
 if(!parts.length)return `<strong class="dd-hp-value">${escapeHTML(text)}</strong>`;
 const names=['','一階段','二階段','三階段','四階段'];
 return `<div class="dd-hp-phases">${parts.map(match=>`<div class="dd-hp-phase"><span class="dd-hp-step">${names[+match[1]]}</span><strong>${escapeHTML(match[2].trim()||'—')}</strong></div>`).join('')}</div>`;
}

function card(b,map){
 const ds=Array.isArray(b.difficulties)?b.difficulties:[];
 const choice=selected[b.id]||{};
 const d=ds.find(x=>x.name===choice.diff)||ds[0];
 const active=choice.item;
 const drop=d?.drops?.find(x=>x.itemId===active);
 const item=drop&&map.get(drop.itemId);
 const buckets=new Map(CATEGORIES.map(c=>[c,[]]));
 for(const entry of (d?.drops||[])){
  const it=map.get(entry.itemId);if(!it)continue;
  const image=safeImg(it.image);
  const node=`<button type="button" class="dd-drop" data-item="${escapeAttr(entry.itemId)}" data-boss="${escapeAttr(b.id)}" aria-expanded="${active===entry.itemId?'true':'false'}" aria-label="查看${escapeAttr(it.name)}的掉落資訊" title="${escapeAttr(it.name)}">${image?`<img src="${escapeAttr(image)}" alt="" loading="lazy">`:'◇'}${entry.quantity?`<span class="dd-drop-count" title="×${escapeAttr(entry.quantity)}">×${escapeHTML(entry.quantity)}</span>`:''}</button>`;
  const cat=CATEGORIES.includes(it.category)?it.category:'其他';buckets.get(cat).push(node);
 }
 const dropCards=CATEGORIES.map(cat=>`<div class="dd-drop-group" data-category="${cat}" data-has-drops="${buckets.get(cat).length?'1':'0'}"><div class="dd-drop-group-title">${cat}</div><div class="dd-drop-icons">${buckets.get(cat).join('')}</div></div>`).join('');
 const img=safeImg(b.image);
 const runeNames={arcane:'祕法符文',authentic:'真實符文'};
 const runeImages={arcane:'assets/boss-atlas/symbols/arcane-symbol.png',authentic:'assets/boss-atlas/symbols/authentic-symbol.png'};
 const runeType=runeNames[d?.runeType]?d.runeType:'';
 const runeValue=String(d?.runeRequirement??'').trim();
 const defenseValue=String(d?.defensePercent??'').replace(/%/g,'').trim();
 const runeStages=(d?.runeByPhase && typeof d.runeByPhase==='object' && !Array.isArray(d.runeByPhase))?d.runeByPhase:{};
 const runeStageNames=['','一階段','二階段','三階段','四階段'];
 const runeStageKeys=Object.keys(runeStages).filter(k=>/^[1-4]$/.test(k)&&String(runeStages[k]??'').trim()!=='').sort((a,b)=>Number(a)-Number(b));
 const runeIcon=runeType?`<img src="${runeImages[runeType]}" alt="${runeNames[runeType]}" title="${runeNames[runeType]}">`:'';
 const runeContent=runeStageKeys.length
  ?`<span class="dd-rune-wrap">${runeIcon}<span class="dd-rune-phases">${runeStageKeys.map(stage=>`<span class="dd-rune-phase"><em>${runeStageNames[+stage]}</em><strong>${escapeHTML(String(runeStages[stage]))}</strong></span>`).join('')}${runeValue?`<small title="未指定的階段沿用此數值">其餘 ${escapeHTML(runeValue)}</small>`:''}</span></span>`
  :runeValue?runeIcon+`<strong>${escapeHTML(runeValue)}</strong>`:'<strong class="dd-requirement-empty">—</strong>';
 const byStage=(d?.defenseByPhase && typeof d.defenseByPhase==='object')?d.defenseByPhase:{};
 const stageNames=['','一階段','二階段','三階段','四階段'];
 const stageKeys=Object.keys(byStage).filter(k=>/^[1-4]$/.test(k)&&String(byStage[k]??'').trim()!=='').sort((a,b)=>Number(a)-Number(b));
 const defenseContent=stageKeys.length?`<div class="dd-defense-phases">${stageKeys.map(stage=>`<span class="dd-defense-phase"><em>${stageNames[+stage]}</em><strong>${escapeHTML(String(byStage[stage]).replace(/%/g,''))}%</strong></span>`).join('')}${defenseValue?`<small title="未指定的階段沿用此數值">其餘 ${escapeHTML(defenseValue)}%</small>`:''}</div>`:defenseValue?`<strong>${escapeHTML(defenseValue)}%</strong>`:'<strong class="dd-requirement-empty">—</strong>';
 const hp=String(d?.hp||'尚未提供');
 return `<article class="dd-boss" data-boss-id="${escapeAttr(b.id)}">
   <div class="dd-boss-top">
    ${img?`<img class="dd-boss-pic" src="${escapeAttr(img)}" alt="${escapeAttr(b.name)}" loading="lazy">`:''}
    <div class="dd-boss-summary">
     <span class="dd-group-label">${escapeHTML(b.group)}</span>
     <h3>${escapeHTML(b.name)}</h3>
     <div class="dd-boss-meta">${ds.length} 種難度${b.note?' · '+escapeHTML(b.note):''}</div>
     <div class="dd-summary-stats">
      <div class="dd-stat hp" title="${escapeAttr(hp)}"><span>BOSS 血量</span>${formatHp(hp)}</div>
      <div class="dd-stat"><span>符文</span><b>${runeContent}</b></div>
      <div class="dd-stat"><span>防禦</span><b>${defenseContent}</b></div>
     </div>
    </div>
   </div>
   <div class="dd-boss-info">
    <div class="dd-diff-list" aria-label="${escapeAttr(b.name)}難度">${ds.map(x=>`<button class="dd-diff ${d===x?'active':''}" data-boss="${escapeAttr(b.id)}" data-diff="${escapeAttr(x.name)}" type="button" aria-label="${escapeAttr(x.name)}" aria-pressed="${d===x?'true':'false'}">${['簡單','普通','困難','混沌','終極'].includes(x.name)?`<img src="assets/boss-atlas/difficulties/${escapeAttr(x.name)}.png" alt="${escapeAttr(x.name)}" loading="lazy">`:escapeHTML(x.name)}</button>`).join('')}</div>
    <div class="dd-drops">
     <div class="dd-drop-head">掉落物 <small>${d?.drops?.length||0} 種</small></div>
     <div class="dd-drop-list" id="dd-drops-${escapeAttr(b.id)}">${d?.drops?.length?dropCards:'<span class="dd-no-drop">掉落資訊整理中</span>'}</div>
     ${item?`<div class="dd-drop-detail"><img src="${escapeAttr(safeImg(item.image))}" alt=""><div><b>${escapeHTML(item.name)}</b><p>數量：${escapeHTML(drop.quantity?'×'+drop.quantity:'未提供')}　｜　機率：${drop.chance===null||drop.chance===undefined?'未提供':escapeHTML(drop.chance)+'%'}</p></div></div>`:''}
    </div>
   </div>
  </article>`;
}
root.addEventListener('click',e=>{
 const btn=e.target.closest('button');if(!btn||!root.contains(btn))return;
 if(btn.dataset.group){group=btn.dataset.group;render();return}
 if(btn.dataset.diff){selected[btn.dataset.boss]={diff:btn.dataset.diff,item:null,expanded:false};render();return}
 if(btn.dataset.item){const b=btn.dataset.boss; selected[b]??={};selected[b].item=selected[b].item===btn.dataset.item?null:btn.dataset.item;if(selected[b].item)selected[b].expanded=true;render();return}
});
root.addEventListener('compositionstart',event=>{if(event.target.id==='ddBossSearch')searchComposing=true;});
root.addEventListener('compositionend',event=>{
 if(event.target.id!=='ddBossSearch')return;
 searchComposing=false;search=event.target.value;
 if(renderDeferred)renderDeferred=false;
 renderResults();
});
root.addEventListener('input',event=>{
 if(event.target.id!=='ddBossSearch')return;
 search=event.target.value;
 if(searchComposing||event.isComposing)return;
 renderResults();
});
(async()=>{
 try{const r=await fetch('boss-atlas-data.json',{cache:'no-store'});if(!r.ok)throw Error('無法讀取圖鑑預設資料');data=await r.json();staticCatalog=Array.isArray(data.items)?data.items:[];staticBossCatalog=structuredClone(data.bosses||[]);data=hydrateCatalog(data);migrateAtlasV2(data);reconcileOldPublicSnapshot(data);render();}
 catch(e){root.textContent='BOSS 圖鑑目前無法載入，請稍後再試。';console.warn(e);return}
 try{const r=await fetch(`${API}/api/site-data`,{headers:{Accept:'application/json'},cache:'no-store'});if(!r.ok)return;const p=await r.json();if(p?.ok&&p?.data?.duoduo_boss_atlas?.schema===1){data=hydrateCatalog(p.data.duoduo_boss_atlas);migrateAtlasV2(data);reconcileOldPublicSnapshot(data);render()}}
 catch(e){console.warn('BOSS 圖鑑雲端資料暫時無法取得，使用預設資料。',e)}
})();
})();
