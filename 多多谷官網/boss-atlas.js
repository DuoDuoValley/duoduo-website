/* BOSS Atlas public reader; separate from the home-page BOSS carousel. */
(()=>{'use strict';
const root=document.querySelector('#ddBossAtlas');if(!root)return;
const API=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const safeImg=v=>{const s=String(v||'').trim();return /^assets\/boss-atlas\/[\w./%()\-]+$/i.test(s)||/^https:\/\//i.test(s)?s:''};
let data=null,group='全部',search='',selected={};
const escapeAttr=escapeHTML;
const itemMap=()=>new Map((data?.items||[]).map(x=>[x.id,x]));
const publicBosses=()=>Array.isArray(data?.bosses)?data.bosses.filter(b=>b&&b.published!==false):[];
function render(){if(!data)return;
 const filtered=publicBosses().filter(b=>(group==='全部'||b.group===group)&&(`${b.name} ${b.group}`.toLowerCase().includes(search.toLowerCase())));
 const map=itemMap();
 root.innerHTML=`<div class="dd-atlas-head"><div><div class="dd-atlas-kicker">BOSS ARCHIVE · DUODUO VALLEY</div><h2>冒險者的 BOSS 圖鑑</h2><p>挑選難度、查看血量與掉落物；點擊道具圖示可查看數量與機率。</p></div><span class="dd-atlas-count">${filtered.length} 隻 BOSS</span></div><div class="dd-atlas-filters"><input id="ddBossSearch" class="dd-atlas-search" placeholder="搜尋 BOSS 名稱…" aria-label="搜尋 BOSS" value="${escapeAttr(search)}"><div class="dd-atlas-tabs" role="group" aria-label="BOSS 分類">${['全部','初階','中階','高階','終極'].map(x=>`<button type="button" data-group="${x}" class="${group===x?'active':''}">${x}</button>`).join('')}</div></div><div class="dd-atlas-grid">${filtered.map(b=>card(b,map)).join('')}</div>${filtered.length?'':'<p class="dd-empty">沒有符合條件的 BOSS。</p>'}<p class="dd-atlas-footnote">掉落機率依各 BOSS／難度獨立計算。沒有提供機率的項目會顯示「未提供」，不代表必定掉落。未公開的 BOSS 不會出現在圖鑑。資料僅供多多谷伺服器使用。</p>`;
}
function card(b,map){const ds=Array.isArray(b.difficulties)?b.difficulties:[];
 const d=ds.find(x=>x.name===selected[b.id]?.diff)||ds[0];
 const active=selected[b.id]?.item;
 const drop=d?.drops?.find(x=>x.itemId===active);const item=drop&&map.get(drop.itemId);
 const dropCards=(d?.drops||[]).filter(x=>map.has(x.itemId)).map(x=>{
  const it=map.get(x.itemId),image=safeImg(it.image);
  return `<button type="button" class="dd-drop" data-item="${escapeAttr(x.itemId)}" data-boss="${escapeAttr(b.id)}" aria-expanded="${active===x.itemId?'true':'false'}" aria-label="查看${escapeAttr(it.name)}的掉落資訊" title="${escapeAttr(it.name)}">${image?`<img src="${escapeAttr(image)}" alt="" loading="lazy">`:'◇'}${x.quantity?`<span class="dd-drop-count">×${escapeHTML(x.quantity)}</span>`:''}</button>`;
 }).join('');
 const img=safeImg(b.image);
 const runeNames={arcane:'祕法符文',authentic:'真實符文'};
 const runeImages={arcane:'assets/boss-atlas/symbols/arcane-symbol.png',authentic:'assets/boss-atlas/symbols/authentic-symbol.png'};
 const runeType=runeNames[d?.runeType]?d.runeType:'';
 const runeValue=String(d?.runeRequirement??'').trim();
 const defenseValue=String(d?.defensePercent??'').replace(/%/g,'').trim();
 const runeContent=runeValue?(runeType?`<img src="${runeImages[runeType]}" alt="${runeNames[runeType]}" title="${runeNames[runeType]}">`:'')+`<strong>${escapeHTML(runeValue)}</strong>`:'<strong class="dd-requirement-empty">—</strong>';
 const defenseContent=defenseValue?`<strong>${escapeHTML(defenseValue)}%</strong>`:'<strong class="dd-requirement-empty">—</strong>';
 return `<article class="dd-boss" data-boss-id="${escapeAttr(b.id)}"><div class="dd-boss-top">${img?`<img class="dd-boss-pic" src="${escapeAttr(img)}" alt="${escapeAttr(b.name)}" loading="lazy">`:''}<div class="dd-boss-title"><span class="dd-group-label">${escapeHTML(b.group)}</span><h3>${escapeHTML(b.name)}</h3><div class="dd-boss-meta">${ds.length} 種難度${b.note?' · '+escapeHTML(b.note):''}</div></div></div><div class="dd-boss-info"><div class="dd-diff-list" aria-label="${escapeAttr(b.name)}難度">${ds.map(x=>`<button class="dd-diff ${d===x?'active':''}" data-boss="${escapeAttr(b.id)}" data-diff="${escapeAttr(x.name)}" type="button">${escapeHTML(x.name)}</button>`).join('')}</div><div class="dd-hp"><span class="cap">BOSS 血量</span><strong>${escapeHTML(d?.hp||'尚未提供')}</strong></div><div class="dd-requirements"><div class="dd-requirement"><span class="cap">符文需求</span><div class="dd-requirement-value">${runeContent}</div></div><div class="dd-requirement"><span class="cap">防禦%</span><div class="dd-requirement-value">${defenseContent}</div></div></div><div class="dd-drops"><div class="dd-drop-head">掉落圖鑑 <small>${d?.drops?.length||0} 種道具</small></div><div class="dd-drop-icons">${dropCards||'<span style="font-size:12px;color:var(--muted)">掉落資訊整理中</span>'}</div>${item?`<div class="dd-drop-detail"><img src="${escapeAttr(safeImg(item.image))}" alt=""><div><b>${escapeHTML(item.name)}</b><p>數量：${escapeHTML(drop.quantity?'×'+drop.quantity:'未提供')}　｜　機率：${drop.chance===null||drop.chance===undefined?'未提供':escapeHTML(drop.chance)+'%'}</p></div></div>`:''}</div></div></article>`;
}
root.addEventListener('click',e=>{
 const btn=e.target.closest('button');if(!btn||!root.contains(btn))return;
 if(btn.dataset.group){group=btn.dataset.group;render();return}
 if(btn.dataset.diff){selected[btn.dataset.boss]={diff:btn.dataset.diff,item:null};render();return}
 if(btn.dataset.item){const b=btn.dataset.boss; selected[b]??={};selected[b].item=selected[b].item===btn.dataset.item?null:btn.dataset.item;render();return}
});
root.addEventListener('input',e=>{if(e.target.id!=='ddBossSearch')return;const caret=e.target.selectionStart;search=e.target.value;render();const input=root.querySelector('#ddBossSearch');input?.focus();input?.setSelectionRange(caret,caret)});
(async()=>{
 try{const r=await fetch('boss-atlas-data.json',{cache:'no-store'});if(!r.ok)throw Error('無法讀取圖鑑預設資料');data=await r.json();render();}
 catch(e){root.textContent='BOSS 圖鑑目前無法載入，請稍後再試。';console.warn(e);return}
 try{const r=await fetch(`${API}/api/site-data`,{headers:{Accept:'application/json'},cache:'no-store'});if(!r.ok)return;const p=await r.json();if(p?.ok&&p?.data?.duoduo_boss_atlas?.schema===1){data=p.data.duoduo_boss_atlas;render()}}
 catch(e){console.warn('BOSS 圖鑑雲端資料暫時無法取得，使用預設資料。',e)}
})();
})();
