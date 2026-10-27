/* Dedicated, admin-authenticated BOSS Atlas manager. Independent of BOSS carousel. */
(()=>{'use strict';
const p=document.getElementById('bossAtlasPanel');if(!p)return;
const API=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
const KEY='duoduo_boss_atlas',DRAFT='duoduo_boss_atlas_draft';
const by=id=>p.querySelector('#'+id);const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let base=null,data=null,chosen='',q='',itemQuery='',chosenItem='',dirty=false,loading=false;
const CATEGORIES=['裝備','強化','素材','箱子','其他'];
const clone=x=>JSON.parse(JSON.stringify(x));
function token(){return sessionStorage.getItem('duoduo_admin_session')||''}
function status(msg,error=false){const el=by('atStatus');el.textContent=msg;el.classList.toggle('error',error)}
function draft(){if(!data)return;localStorage.setItem(DRAFT,JSON.stringify(data));dirty=true;by('atDraftState').textContent='草稿尚未發布'}
function chooseBoss(){return data?.bosses?.find(x=>x.id===chosen)}
function uid(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function validate(d){if(!d||d.schema!==1||!Array.isArray(d.bosses)||!Array.isArray(d.items))throw Error('圖鑑資料格式不符');if(d.bosses.length>200||d.items.length>5000)throw Error('資料數量超過安全上限');}
function names(){return data.items.map(x=>({id:x.id,name:x.name,image:x.image,category:CATEGORIES.includes(x.category)?x.category:'其他'})).sort((a,b)=>CATEGORIES.indexOf(a.category)-CATEGORIES.indexOf(b.category)||a.name.localeCompare(b.name,'zh-Hant'))}
function selectItems(options,current){return CATEGORIES.map(category=>{
 const entries=options.filter(x=>x.category===category);if(!entries.length)return '';
 return `<optgroup label="${category}">${entries.map(x=>`<option value="${esc(x.id)}" ${current===x.id?'selected':''}>${esc(x.name)}</option>`).join('')}</optgroup>`;
 }).join('')}

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

function enrichData(value){
 if(!Array.isArray(value.items))value.items=[];
 const known=new Map(value.items.map(it=>[it.id,it]));
 for(const it of (base?.items||[])){
  const original=known.get(it.id);
  if(original){if(!CATEGORIES.includes(original.category))original.category=it.category||'其他';}
  else if(!value.items.some(x=>x.name===it.name))value.items.push(clone(it));
 }
 for(const it of value.items)if(!CATEGORIES.includes(it.category))it.category='其他';
 return value;
}
function renderList(){if(!data)return;const list=by('atBossList');list.replaceChildren();for(const boss of data.bosses.filter(b=>b.name.includes(q))){const b=document.createElement('button');b.type='button';b.className=boss.id===chosen?'selected':'';const img=document.createElement('img');img.src=boss.image||'';img.alt='';const text=document.createElement('span');text.textContent=boss.name+(boss.published===false?'（隱藏）':'');b.append(img,text);b.onclick=()=>{chosen=boss.id;renderList();renderEditor()};list.append(b)}}
function renderEditor(){const root=by('atBossEditor'),b=chooseBoss();if(!b){root.innerHTML='<p class="at-sub">請選擇 BOSS 或新增 BOSS。</p>';return}
root.innerHTML=`<h2>👹 ${esc(b.name)}</h2><div class="at-info"><label class="at-field">BOSS 名稱<input data-boss-key="name" value="${esc(b.name)}"></label><label class="at-field">分類<select data-boss-key="group">${['初階','中階','高階','終極'].map(v=>`<option ${b.group===v?'selected':''}>${v}</option>`).join('')}</select></label><label class="at-field at-full">圖片網址<input data-boss-key="image" value="${esc(b.image)}" placeholder="assets/... 或 https://"></label><label class="at-field at-full">備註<input data-boss-key="note" value="${esc(b.note||'')}"></label><label class="at-field at-full"><span>公開狀態（未勾選：只有後台保存，玩家看不到）</span><span><input type="checkbox" data-boss-key="published" style="width:auto" ${b.published!==false?'checked':''}> 在 BOSS 圖鑑公開</span></label></div><div class="at-toolbar"><button class="at-btn" id="atAddDifficulty" type="button">＋ 新增難度</button><label class="at-btn">更換 BOSS 圖片<input id="atBossImageUpload" type="file" accept="image/png,image/jpeg,image/webp" hidden></label></div>${(b.difficulties||[]).map((d,i)=>diffEditor(d,i)).join('')}`;
root.querySelectorAll('[data-boss-key]').forEach(el=>el.addEventListener('change',()=>{const key=el.dataset.bossKey;b[key]=el.type==='checkbox'?el.checked:el.value;draft();renderList();if(key==='name')root.querySelector('h2').textContent='👹 '+b.name}));
root.querySelector('#atAddDifficulty').onclick=()=>{const name=prompt('新增難度（簡單、普通、困難、混沌、終極）');if(!name)return;if(b.difficulties.some(d=>d.name===name.trim()))return status('已有相同難度',true);b.difficulties.push({name:name.trim(),hp:'',runeType:'',runeRequirement:'',defensePercent:'',drops:[],note:''});draft();renderEditor()};
root.querySelector('#atBossImageUpload').onchange=e=>uploadIcon(e.target.files?.[0],url=>{b.image=url;draft();renderList();renderEditor()});
root.querySelectorAll('.at-diff').forEach(div=>{const i=Number(div.dataset.dif),d=b.difficulties[i];
 div.querySelector('[data-field=hp]').addEventListener('change',e=>{d.hp=e.target.value;draft()});
 div.querySelector('[data-field=note]').addEventListener('change',e=>{d.note=e.target.value;draft()});
 div.querySelector('[data-field=runeType]').addEventListener('change',e=>{d.runeType=e.target.value;draft();const preview=div.querySelector('.at-rune-preview img');if(preview){preview.src=runeIcon(d.runeType)||'';preview.hidden=!runeIcon(d.runeType)}});
 div.querySelector('[data-field=runeRequirement]').addEventListener('change',e=>{d.runeRequirement=e.target.value.trim();draft()});
 div.querySelector('[data-field=defensePercent]').addEventListener('change',e=>{const value=e.target.value.trim().replace(/%/g,'');if(value!==''&&(!Number.isFinite(Number(value))||Number(value)<0||Number(value)>1000)){status('防禦% 請輸入 0～1000 的數值，不需輸入 %',true);e.target.value=d.defensePercent??'';return}d.defensePercent=value; e.target.value=value;draft()});
 div.querySelector('.at-diff-remove').onclick=()=>{if(!confirm(`確定刪除「${b.name} ${d.name}」的所有掉落資料？`))return;b.difficulties.splice(i,1);draft();renderEditor()};
 div.querySelector('.at-drop-add').onclick=()=>{const id=div.querySelector('.at-add-item').value;if(!id)return;const exist=d.drops.find(x=>x.itemId===id);if(exist)return status('這個難度已加入相同道具',true);d.drops.push({itemId:id,chance:null,quantity:null});draft();renderEditor()};
 div.querySelectorAll('.at-drop-line').forEach((row,j)=>{
  const drop=d.drops[j];
  row.querySelector('[data-drop=item]').onchange=e=>{if(d.drops.some((x,k)=>k!==j&&x.itemId===e.target.value))return status('此難度已有這個道具',true);drop.itemId=e.target.value;draft();renderEditor()};
  row.querySelector('[data-drop=chance]').onchange=e=>{const v=e.target.value.trim();if(v&&(!Number.isFinite(Number(v))||Number(v)<0||Number(v)>100)){status('掉落機率只能是 0～100%',true);e.target.value=drop.chance??'';return}drop.chance=v===''?null:Number(v);draft()};
  row.querySelector('[data-drop=quantity]').onchange=e=>{drop.quantity=e.target.value.trim()||null;draft()};
  row.querySelector('.at-drop-remove').onclick=()=>{d.drops.splice(j,1);draft();renderEditor()};
 });
 });
}
function runeIcon(type){return ({arcane:'assets/boss-atlas/symbols/arcane-symbol.png',authentic:'assets/boss-atlas/symbols/authentic-symbol.png'})[type]||''}
function diffEditor(d,i){const options=names();return `<div class="at-diff" data-dif="${i}"><h3>${esc(d.name)}<button class="at-btn danger at-diff-remove" type="button">刪除難度</button></h3><div class="at-info"><label class="at-field">血量（可用多階段文字）<textarea rows="2" data-field="hp">${esc(d.hp||'')}</textarea></label><label class="at-field">難度補充備註<textarea rows="2" data-field="note">${esc(d.note||'')}</textarea></label></div><div class="at-requirements-admin"><label class="at-field">符文種類（可留白）<select data-field="runeType"><option value="" ${!d.runeType?'selected':''}>未設定</option><option value="arcane" ${d.runeType==='arcane'?'selected':''}>祕法符文</option><option value="authentic" ${d.runeType==='authentic'?'selected':''}>真實符文</option></select></label><label class="at-field">符文需求（可留白）<input data-field="runeRequirement" inputmode="numeric" placeholder="例如 810" value="${esc(d.runeRequirement??'')}"></label><label class="at-field">防禦%（可留白）<input data-field="defensePercent" inputmode="decimal" placeholder="例如 380；不用填 %" value="${esc(d.defensePercent??'')}"></label><span class="at-rune-preview"><img src="${runeIcon(d.runeType)}" alt="符文種類圖示" ${runeIcon(d.runeType)?'':'hidden'}></span></div><div class="at-sub">該難度掉落道具：數量和機率分開管理，未提供機率請留白。</div>${(d.drops||[]).map(x=>dropEditor(x,options)).join('')}<div class="at-toolbar"><select class="at-add-item at-search" style="max-width:360px">${selectItems(options,'')}</select><button class="at-btn at-drop-add" type="button">＋ 加入掉落物</button></div></div>`}
function dropEditor(drop,options){const item=data.items.find(x=>x.id===drop.itemId);return `<div class="at-drop-line"><img src="${esc(item?.image||'')}" alt=""><select data-drop="item" aria-label="掉落道具">${selectItems(options,drop.itemId)}</select><input data-drop="quantity" aria-label="數量" placeholder="數量" value="${esc(drop.quantity??'')}"><input data-drop="chance" aria-label="掉落機率百分比" placeholder="機率 %" value="${esc(drop.chance??'')}"><button class="at-drop-remove" type="button" title="刪除此掉落物">×</button></div>`}
function renderItemList(){const holder=by('atItemList');holder.replaceChildren();for(const item of data.items.filter(x=>x.name.includes(itemQuery)).slice(0,140)){const btn=document.createElement('button');const img=document.createElement('img');img.src=item.image;img.alt='';const txt=document.createElement('span');txt.textContent=`【${item.category||'其他'}】${item.name}`;btn.append(img,txt);btn.onclick=()=>{chosenItem=item.id;by('atItemName').value=item.name;by('atItemImage').value=item.image;by('atItemCategory').value=CATEGORIES.includes(item.category)?item.category:'其他';by('atItemCurrent').src=item.image;status('正在編輯「'+item.name+'」')};holder.append(btn)}}
function readItemForm(){const name=by('atItemName').value.trim(),image=by('atItemImage').value.trim();if(!name)throw Error('請輸入道具名稱');if(!/^(assets\/|https:\/\/)/.test(image))throw Error('請上傳圖片或輸入 HTTPS／assets 圖片路徑');return {name,image,category:by('atItemCategory').value}}
function saveItem(){try{const input=readItemForm(),existing=data.items.find(x=>x.id===chosenItem);if(existing)Object.assign(existing,input);else{const it={id:uid('item'),...input};data.items.push(it);chosenItem=it.id}draft();renderItemList();renderEditor();status(`已保存道具草稿：「${input.name}」，尚未發布。`)}catch(e){status(e.message,true)}}
async function uploadIcon(file,done){if(!file)return;
 if(file.size>8*1024*1024||file.size===0)return status('請使用 8MB 以內圖片',true);
 if(!/^image\/(png|jpeg|webp)$/.test(file.type))return status('僅支援 PNG／JPG／WebP',true);
 if(!token())return status('請先登入管理員帳號',true);
 status('正在處理並上傳圖片…');
 try{
  const blob=await new Promise((resolve,reject)=>{const image=new Image(),url=URL.createObjectURL(file);image.onload=()=>{const canvas=document.createElement('canvas'),scale=Math.min(1,768/image.naturalWidth,768/image.naturalHeight);canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);resolve(canvas.toDataURL('image/webp',.93))};image.onerror=()=>{URL.revokeObjectURL(url);reject(Error('圖片無法開啟'))};image.src=url});
  const response=await fetch(`${API}/api/upload-image`,{method:'POST',headers:{Authorization:`Bearer ${token()}`,'Content-Type':'application/json'},body:JSON.stringify({dataUrl:blob,filename:file.name})});const payload=await response.json().catch(()=>({}));if(!response.ok||!payload.ok||!payload.path)throw Error(payload.error||'上傳失敗');done(payload.path);status('圖片已上傳，請記得保存草稿並發布。');
 }catch(e){status('圖片上傳失敗：'+e.message,true)}
}
async function fetchBase(){const r=await fetch('boss-atlas-data.json',{cache:'no-store'});if(!r.ok)throw Error('找不到 boss-atlas-data.json');const j=await r.json();validate(j);return j}
async function fetchCloud(){const r=await fetch(`${API}/api/site-data`,{cache:'no-store'});const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw Error(j.error||'雲端讀取失敗');return j.data?.[KEY]}
async function initialize(){if(loading)return;loading=true;
 try{base=await fetchBase();let cloud=null;try{cloud=await fetchCloud()}catch(e){console.warn('雲端圖鑑尚未連線，使用靜態版本',e)}
  data=enrichData(cloud?.schema===1?cloud:clone(base));
  const saved=localStorage.getItem(DRAFT);
  if(saved){try{const draftValue=JSON.parse(saved);validate(draftValue);if(confirm('偵測到這台瀏覽器尚未發布的 BOSS 圖鑑草稿，是否恢復？')){data=enrichData(draftValue);dirty=true;}}catch(e){console.warn('無法恢復 BOSS 草稿',e)}}
  const migrated=migrateAtlasV2(data);
  if(migrated){draft();}
  chosen=data.bosses[0]?.id||'';renderList();renderEditor();renderItemList();
  status(migrated?'已套用 BOSS 資料更新（方塊／楓幣／楓葉點數 100% 與燦爛的凶星難度修正），尚未發布；請先備份 JSON，再發布雲端。':dirty?'已恢復這台瀏覽器的未發布草稿。':cloud?'已載入雲端圖鑑。':'已載入隨更新包提供的初始資料；尚未發布到雲端。');
 }catch(e){status('無法載入圖鑑：'+e.message,true)}finally{loading=false}
}
// Supabase JSONB can reorder object keys. Compare normalized structure, not raw JSON.stringify order.
function canonicalJSON(value){
 return JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)
  ?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
}
async function publish(){if(!data)return;let body;
 try{validate(data);if(!token())throw Error('管理員登入已失效');if(!confirm(`確定發布 BOSS 圖鑑？\n公開 ${data.bosses.filter(b=>b.published!==false).length} 隻 BOSS。\n\n這只更新圖鑑資料，不會改 BOSS 首頁輪播。`))return;
 by('atPublish').disabled=true;status('正在發布雲端 BOSS 圖鑑…');
 const r=await fetch(`${API}/api/site-data`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token()}`},body:JSON.stringify({values:{[KEY]:data}})});body=await r.json().catch(()=>({}));if(!r.ok||!body.ok)throw Error(body.error||'雲端發布失敗');
 const verified=await fetchCloud();if(!verified||verified.schema!==1)throw Error('寫入請求已送出，但雲端沒有返回 BOSS 圖鑑欄位。請確認 GitHub 的 server.js 已部署到 Render（Build & Deploy 最新成功），並使用目前網站後台重新登入後再試。草稿仍保留。');
 if(canonicalJSON(verified)!==canonicalJSON(data))throw Error('雲端有 BOSS 圖鑑資料，但讀回與草稿不同；可能是其他管理員同時發布或後端資料被正規化。草稿已保留，請先備份 JSON 並檢查 Render Logs，避免覆蓋其他資料。');
 localStorage.removeItem(DRAFT);dirty=false;by('atDraftState').textContent='已發布';status('✅ 雲端發布成功且已讀回驗證。玩家重新整理後即可查看。');
 }catch(e){status('❌ '+e.message,true)}finally{by('atPublish').disabled=false}
}
by('atBossSearch').oninput=e=>{q=e.target.value;renderList()};by('atItemSearch').oninput=e=>{itemQuery=e.target.value;renderItemList()};
by('atAddBoss').onclick=()=>{const name=prompt('新 BOSS 名稱');if(!name)return;const b={id:uid('boss'),name:name.trim(),image:'',group:'高階',published:false,difficulties:[],note:''};data.bosses.push(b);chosen=b.id;draft();renderList();renderEditor()};
by('atNewItem').onclick=()=>{chosenItem='';by('atItemName').value='';by('atItemImage').value='';by('atItemCategory').value='素材';by('atItemCurrent').removeAttribute('src')};by('atSaveItem').onclick=saveItem;by('atItemImageUpload').onchange=e=>uploadIcon(e.target.files?.[0],url=>{by('atItemImage').value=url;by('atItemCurrent').src=url});
by('atPublish').onclick=publish;
by('atReload').onclick=async()=>{if(dirty&&!confirm('將捨棄未發布草稿，重新載入雲端或初始資料，確定嗎？'))return;localStorage.removeItem(DRAFT);dirty=false;data=null;initialize()};
by('atExport').onclick=()=>{if(!data)return;const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='duoduo-boss-atlas-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500)};
by('atImport').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const j=JSON.parse(await file.text());validate(j);if(!confirm('確定用匯入資料取代目前的圖鑑草稿？（不會直接發布）'))return;data=enrichData(j);chosen=data.bosses[0]?.id||'';draft();renderList();renderEditor();renderItemList();status('JSON 已匯入草稿，尚未發布。')}catch(error){status('匯入失敗：'+error.message,true)}finally{e.target.value=''}};
let begun=false;const nav=document.querySelector('[data-panel="bossAtlasPanel"]');nav?.addEventListener('click',()=>{if(!begun){begun=true;initialize()}});
})();
