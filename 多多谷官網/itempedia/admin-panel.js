/* Official encyclopedia editor. Public writes only through the existing authenticated API.
   Keeps itempedia independent from legacy duoduo_items and from global bulk cloud publish. */
(()=>{'use strict';
 const mount=document.getElementById('ipAdminMount');if(!mount)return;
 const $=id=>document.getElementById(id);
 const api=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
 const draftKey='duoduo_itempedia_official_draft_v1';
 const defaults=()=>({version:3,categories:structuredClone(window.DuoDuoItemCatalogDefault?.categories||[]),
  items:structuredClone(window.DuoDuoItemCatalogDefault?.items||[]),
  tiers:structuredClone(window.DuoDuoBuffCatalogDefault?.tiers||[]),
  buffs:structuredClone(window.DuoDuoBuffCatalogDefault?.buffs||[])});
 let state=defaults(),loaded=false,sourceVersion='null',mode='items',search='',editing=null;
 const known=(id)=>$(id),clone=x=>structuredClone(x);
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const validImage=src=>{if(typeof src!=='string'||src.length>1400)return false;
  if(/^https:\/\//i.test(src))return true;
  return !/^(?:\/|\\|data:|blob:|javascript:|http:)/i.test(src)&&!src.includes('..')&&!/[<>"']/.test(src);
 };
 const parseWords=s=>[...new Set(String(s||'').split(/[、，,\n]/).map(x=>x.trim()).filter(Boolean))];
 function status(text,bad=false){const el=$('ipStatus');el.textContent=text;el.classList.toggle('ip-error',bad)}
 function token(){try{return sessionStorage.getItem('duoduo_admin_session')||''}catch(_){return ''}}
 function validate(db){if(!db||typeof db!=='object'||!Array.isArray(db.items)||!Array.isArray(db.buffs)||!Array.isArray(db.categories)||!Array.isArray(db.tiers))throw Error('道具百科 JSON 缺少必要欄位');
  if(db.items.length>1000||db.buffs.length>1500||db.categories.length>100||db.tiers.length>60)throw Error('資料量超出單次發布限制');
  const id=new Set(),names=new Set();
  for(const row of [...db.items,...db.buffs]){
   if(!row||typeof row!=='object'||!String(row.id||'').trim()||!String(row.name||'').trim())throw Error('存在缺少 ID／名稱的資料');
   if(id.has(row.id))throw Error('存在重複的 ID：'+row.id);id.add(row.id);
   if(!validImage(row.image||''))throw Error('圖片網址不合法：'+row.name);
   if(String(row.name).length>150||String(row.description||'').length>5000||String(row.effectText||'').length>4000)throw Error('資料欄位過長：'+row.name);
   if(!Array.isArray(row.keywords||[]))throw Error('關鍵字欄位格式錯誤：'+row.name);
  }
  for(const row of db.items){if(names.has(row.name))throw Error('一般道具不能有重複名稱：'+row.name);names.add(row.name)}
  return db;
 }
 const rows=()=>mode==='buffs'?state.buffs:state.items;
 const fieldGroup=()=>mode==='buffs'?'tier':'category';
 const modeTitle=()=>mode==='buffs'?'BUFF 效果':'專屬道具';
 function persist(){try{localStorage.setItem(draftKey,JSON.stringify(state));status('已保存本機草稿；玩家尚看不到更改。請按「儲存並發布雲端」才會公開。')}catch(e){status('本機儲存失敗，請匯出 JSON 保留資料。',true)}}
 function refreshSelects(){
  const setList=$('ipCategories');setList.replaceChildren();for(const c of state.categories){const o=document.createElement('option');o.value=c;setList.append(o)}
  const tiers=$('ipTiers');tiers.replaceChildren();for(const t of state.tiers){const o=document.createElement('option');o.value=t;tiers.append(o)}
  const filter=$('ipFilter');const old=filter.value;filter.replaceChildren();for(const c of ['全部',...(mode==='buffs'?state.tiers:state.categories)]){const o=document.createElement('option');o.value=c;o.textContent=c;filter.append(o)}filter.value=[...filter.options].some(o=>o.value===old)?old:'全部';
 }
 function setMode(value){mode=value;editing=null;$('ipEditor').hidden=true;$('ipMode').value=value;refreshSelects();render()}
 function collection(){return [...rows()].sort((a,b)=>(Number(a.sort)||0)-(Number(b.sort)||0));}
 function filtered(){const q=search.toLowerCase().normalize('NFKC');const type=$('ipFilter').value;return collection().filter(x=>(type==='全部'||x[fieldGroup()]===type)&&(!q||[x.name,x.category,x.tier,x.description].join(' ').toLowerCase().normalize('NFKC').includes(q)));}
 function newElement(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
 function render(){const list=$('ipRows');list.replaceChildren();const visible=filtered();const kind=mode==='buffs'?'筆效果':'項道具';
  $('ipCount').textContent=`目前顯示 ${visible.length} ${kind}；完整資料 ${state.items.length} 項道具、${state.buffs.length} 筆 BUFF 效果（同名不同效果分別保留）。`;
  for(const item of visible){const row=newElement('div','ip-row');row.dataset.id=item.id;
   const img=newElement('img');if(validImage(item.image||''))img.src=item.image;img.alt='';img.onerror=()=>img.style.visibility='hidden';
   const info=newElement('div','ip-info');info.append(newElement('strong','',item.name),newElement('small','',`${item[fieldGroup()]||'未分類'}${mode==='buffs'?' · '+item.id:''}｜${String(item.description||'').replace(/#c|#/g,'').replace(/\\n|\n/g,' ').slice(0,78)}`));
   const actions=newElement('div','ip-actions');for(const [action,label] of [['up','↑ 上移'],['down','↓ 下移'],['edit','編輯'],['delete','刪除']]){
    const button=newElement('button',action==='delete'?'ip-warn':'',label);button.type='button';button.dataset.action=action;
    button.onclick=()=>doAction(item.id,action);actions.append(button);
   }row.append(img,info,actions);list.append(row);
  }
 }
 function doAction(id,action){const data=rows(),item=data.find(x=>x.id===id);if(!item)return;
  if(action==='edit')return edit(item);
  if(action==='delete'){if(!confirm(`確定刪除「${item.name}」這一筆${modeTitle()}？\n此操作先寫入本機草稿，正式發布後才生效。`))return;
   if(mode==='buffs')state.buffs=state.buffs.filter(x=>x.id!==id);else state.items=state.items.filter(x=>x.id!==id);persist();return render();}
  const same=collection().filter(x=>x[fieldGroup()]===item[fieldGroup()]);const idx=same.findIndex(x=>x.id===id),other=same[idx+(action==='up'?-1:1)];if(!other)return;
  const temp=item.sort;item.sort=other.sort;other.sort=temp;
  if(item.sort===other.sort){ // duplicates from imports: reassign stable sort throughout both collections.
   collection().forEach((x,i)=>x.sort=i);
  }
  persist();render();
 }
 function updateImagePreview(){const src=$('ipImage').value.trim();const img=$('ipImagePreview');if(validImage(src)&&src){img.src=src;img.hidden=false}else{img.removeAttribute('src');img.hidden=true}}
 function edit(item){editing=item?.id||null;$('ipEditor').hidden=false;$('ipEditorTitle').textContent=(item?'編輯':'新增')+modeTitle();
  $('ipName').value=item?.name||'';$('ipCategory').value=item?.[fieldGroup()]||(mode==='buffs'?state.tiers[0]:state.categories[0]);
  $('ipDesc').value=item?.description||'';$('ipEffect').value=item?.effectText||'';$('ipImage').value=item?.image||'';
  $('ipKeywords').value=(item?.keywords||[]).join('、');$('ipTrade').value=item?.tradeable===true?'yes':item?.tradeable===false?'no':'unknown';
  $('ipTimed').checked=item?.timed===true;$('ipEnabled').checked=item?.enabled!==false;
  $('ipCategoryLabel').textContent=mode==='buffs'?'BUFF 分類／會員等級':'道具分類（可輸入新分類）';
  $('ipCategory').setAttribute('list',mode==='buffs'?'ipTiers':'ipCategories');
  $('ipEffectGroup').hidden=mode==='buffs';$('ipTradeGroup').hidden=mode==='buffs';$('ipTimedGroup').hidden=mode==='buffs';
  $('ipImageFile').value='';updateImagePreview();$('ipName').focus();
 }
 function saveEditor(){const name=$('ipName').value.trim(),cat=$('ipCategory').value.trim(),image=$('ipImage').value.trim();
  if(!name||!cat)return alert('請輸入名稱和分類');if(!validImage(image))return alert('圖片只能使用網站內相對路徑或 HTTPS 圖片網址');
  if(mode==='items'&&state.items.some(x=>x.name===name&&x.id!==editing))return alert('一般道具名稱已存在，請編輯原有道具。');
  const target=editing?rows().find(x=>x.id===editing):null;
  const next=target||{id:'pedia-'+mode+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),sourceRow:null,sort:Math.max(-1,...rows().map(x=>Number(x.sort)||0))+1};
  const normalizedImg=image||(mode==='buffs'?state.buffs.find(x=>x.name===name&&x.image)?.image:'')||'';
  if(!normalizedImg)return alert('請設定圖片路徑或從電腦上傳圖片');
  Object.assign(next,{name,description:$('ipDesc').value.trim(),image:normalizedImg,keywords:parseWords($('ipKeywords').value),enabled:$('ipEnabled').checked});
  if(mode==='items')Object.assign(next,{category:cat,effectText:$('ipEffect').value.trim(),tradeable:$('ipTrade').value==='yes'?true:$('ipTrade').value==='no'?false:null,timed:$('ipTimed').checked});
  else Object.assign(next,{tier:cat});
  if(!target)rows().push(next);
  const group=mode==='items'?state.categories:state.tiers;if(!group.includes(cat))group.push(cat);
  validate(state);persist();refreshSelects();$('ipEditor').hidden=true;editing=null;render();
 }
 async function uploadImage(){const file=$('ipImageFile').files?.[0];if(!file)return alert('請先選擇圖片');
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>4*1024*1024)return alert('請選擇 4 MB 以下 PNG／JPG／WebP 圖片');
  if(!token())return alert('請先登入管理後台');
  const b=$('ipUploadImage');b.disabled=true;status('正在上傳道具圖片…');
  try{
   const img=await createImageBitmap(file);const c=document.createElement('canvas');const scale=Math.min(1,256/Math.max(img.width,img.height));c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));
   const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(img,0,0,c.width,c.height);img.close?.();
   const dataUrl=c.toDataURL('image/webp',1);
   const res=await fetch(api+'/api/upload-image',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token()},body:JSON.stringify({filename:file.name,dataUrl})});
   const out=await res.json().catch(()=>({}));if(!res.ok||!out.path)throw Error(out.error||'圖片上傳失敗');
   $('ipImage').value=out.path;updateImagePreview();status('圖片已上傳；請按「儲存這筆資料」，再發布雲端才會顯示在前台。');
  }catch(e){status('圖片上傳失敗：'+(e.message||e),true)}finally{b.disabled=false}
 }
 function downloadJSON(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='duoduo-itempedia-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),800)}
 async function reloadPublished(){status('正在載入目前發布的雲端道具資料…');
  try{const res=await fetch(api+'/api/site-data',{cache:'no-store',headers:{Accept:'application/json'}});if(!res.ok)throw Error('HTTP '+res.status);
   const json=await res.json();if(json.ok!==true||json.initialized!==true)throw Error('雲端尚未初始化');
   const cloud=json.data?.duoduo_itempedia;sourceVersion=JSON.stringify(cloud??null);
   if(cloud){validate(cloud);state=clone(cloud);status('已載入正式網站目前發布的道具百科資料；修改前建議匯出備份。');}
   else{state=defaults();status('雲端尚無道具百科，已載入本次 Excel 匯入初始資料；可先檢查並發布。');}
   loaded=true;setMode('items');
  }catch(e){state=defaults();loaded=true;sourceVersion=null;status('無法確認正式雲端資料：'+(e.message||e)+'。可先編輯與匯出，但為保護現有資料，本次不允許直接發布。',true);setMode('items')}
 }
 async function publish(){if(!loaded||sourceVersion===null)return alert('尚未成功讀取伺服器，為避免覆蓋正式資料，不能發布。');
  try{validate(state)}catch(e){return alert('資料檢查未通過：'+e.message)}
  const t=token();if(!t)return alert('後台登入已失效，請重新登入');
  if(!confirm(`即將發布 ${state.items.length} 項道具和 ${state.buffs.length} 筆 BUFF 至正式網站。\n這會取代目前已發布的道具百科資料，但不影響其他公告、獎池與官網設定。\n\n確定發布嗎？`))return;
  const btn=$('ipPublish');btn.disabled=true;let posted=false;status('正在確認雲端版本並發布…');
  try{
   const check=await fetch(api+'/api/site-data',{cache:'no-store'});if(!check.ok)throw Error('無法再次取得雲端資料');
   const remote=await check.json();if(remote?.ok!==true||remote?.initialized!==true)throw Error('雲端資料未初始化');
   const current=JSON.stringify(remote.data?.duoduo_itempedia??null);
   if(current!==sourceVersion)throw Error('其他管理員或分頁已更新正式資料。請先匯出本機草稿、重新載入雲端版本再合併，避免覆蓋別人的更新。');
   const payload={...state,version:3,updatedAt:new Date().toISOString()};
   const res=await fetch(api+'/api/site-data',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+t},body:JSON.stringify({values:{duoduo_itempedia:payload}})});
   const reply=await res.json().catch(()=>({}));if(!res.ok||reply.ok!==true)throw Error(reply.error||('HTTP '+res.status));
   // The server may reply OK while an older backend silently drops unknown keys.
   // Read back the published encyclopedia before telling the administrator it is live.
   posted=true;
   const confirmRes=await fetch(api+'/api/site-data',{cache:'no-store',headers:{Accept:'application/json'}});
   if(!confirmRes.ok)throw Error('已送出儲存請求，但無法再次讀取雲端資料以核對');
   const verified=await confirmRes.json();
   const actual=verified?.data?.duoduo_itempedia;
   if(verified?.initialized!==true||!actual||['version','updatedAt','categories','items','tiers','buffs'].some(key=>JSON.stringify(actual[key])!==JSON.stringify(payload[key])))
     throw Error('雲端讀回的道具百科與本次發布內容不一致，請確認伺服器已支援新版資料欄位');
   state=clone(actual);sourceVersion=JSON.stringify(actual);persist();status(`已完成雲端讀回核對：${state.items.length} 項道具、${state.buffs.length} 筆 BUFF 發布成功。`);
  }catch(e){status((posted?'儲存請求已送出，但尚未確認發布成功：':'發布失敗：')+(e.message||e)+(posted?'。請先重新讀取雲端確認，不要立即重複發布。':'。已保留本機草稿，不會刪除原有正式資料。'),true)}
  finally{btn.disabled=false}
 }
 mount.innerHTML=`
  <div class="ip-control-bar"><select id="ipMode" aria-label="管理類型"><option value="items">專屬道具</option><option value="buffs">BUFF 與增益</option></select><select id="ipFilter" aria-label="分類篩選"></select><input id="ipSearch" type="search" placeholder="搜尋名稱、分類、效果…"><button type="button" id="ipAdd" class="ip-primary">＋ 新增</button></div>
  <div class="ip-control-bar"><button type="button" id="ipSaveDraft">保存本機草稿</button><button type="button" id="ipLoadDraft">載入先前草稿</button><button type="button" id="ipReloadCloud">重新讀取雲端</button><button type="button" id="ipExport">匯出 JSON 備份</button><label class="ip-note">匯入 JSON<input type="file" id="ipImport" accept=".json,application/json"></label><button type="button" id="ipPublish" class="ip-primary">☁️ 儲存並發布雲端</button><a target="_blank" rel="noopener" href="item-encyclopedia.html">開啟前台 ↗</a></div>
  <p class="ip-summary" id="ipCount"></p>
  <section id="ipEditor" class="ip-editor" hidden><h2 id="ipEditorTitle">編輯</h2><div class="ip-fields">
    <label>名稱<input id="ipName" maxlength="150"></label><label><span id="ipCategoryLabel">分類</span><input id="ipCategory" list="ipCategories" maxlength="80"><datalist id="ipCategories"></datalist><datalist id="ipTiers"></datalist></label>
    <label class="ip-full">道具介紹／BUFF 原始說明（支援 #c...# 與 \\n）<textarea id="ipDesc" rows="4" maxlength="5000"></textarea></label>
    <label class="ip-full" id="ipEffectGroup">獨立能力加成（支援 #c...# 與 \\n，不會重複上方介紹）<textarea id="ipEffect" rows="4" maxlength="4000"></textarea></label>
    <label class="ip-full">圖片路徑或 HTTPS 網址<input id="ipImage" maxlength="1400" placeholder="itempedia/assets/道具圖片.png"><span class="ip-image-tools"><img id="ipImagePreview" alt="圖片預覽" hidden><input type="file" id="ipImageFile" accept="image/png,image/jpeg,image/webp"><button type="button" id="ipUploadImage">上傳新圖片到雲端</button></span><small class="ip-note">同名 BUFF 可共用圖片；圖片會存入現有網站圖片儲存區。</small></label>
    <label class="ip-full">公告圖示關鍵字（使用「、」分隔，不必重複輸入道具名稱）<input id="ipKeywords" maxlength="1200"></label>
    <label id="ipTradeGroup">交易限制<select id="ipTrade"><option value="unknown">未標註</option><option value="yes">可交易</option><option value="no">無法交易</option></select></label>
    <label id="ipTimedGroup" class="ip-inline-check"><input id="ipTimed" type="checkbox"> 具時效性</label>
    <label class="ip-inline-check"><input id="ipEnabled" type="checkbox" checked> 前台顯示</label>
   </div><div class="ip-editor-actions"><button id="ipCommit" class="ip-primary" type="button">儲存這筆資料</button><button id="ipCancel" type="button">取消編輯</button></div></section>
  <div class="ip-rows" id="ipRows"></div><div class="ip-status" id="ipStatus" role="status">請登入後台以載入道具百科。</div>`;
 $('ipMode').onchange=e=>setMode(e.target.value);$('ipSearch').oninput=e=>{search=e.target.value.trim();render()};$('ipFilter').onchange=render;
 $('ipAdd').onclick=()=>edit(null);$('ipCommit').onclick=()=>{try{saveEditor()}catch(e){status('儲存失敗：'+e.message,true)}};
 $('ipCancel').onclick=()=>{$('ipEditor').hidden=true;editing=null};$('ipImage').oninput=updateImagePreview;$('ipUploadImage').onclick=uploadImage;
 $('ipSaveDraft').onclick=persist;$('ipPublish').onclick=publish;$('ipExport').onclick=downloadJSON;
 $('ipLoadDraft').onclick=()=>{const raw=localStorage.getItem(draftKey);if(!raw)return alert('目前沒有保存的本機草稿');try{const draft=validate(JSON.parse(raw));if(!confirm('以先前本機草稿覆蓋目前尚未發布的編輯內容？'))return;state=clone(draft);setMode('items');status('已載入本機草稿，尚未發布。')}catch(e){alert('草稿無法使用：'+e.message)}};
 $('ipReloadCloud').onclick=()=>{if(confirm('重新讀取雲端會覆蓋目前編輯中的內容。建議先保存草稿或匯出備份，確定繼續？'))reloadPublished()};
 $('ipImport').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const parsed=validate(JSON.parse(await file.text()));if(!confirm('確定匯入並取代目前本機道具百科草稿？'))return;state=clone(parsed);persist();setMode('items')}catch(ex){alert('匯入失敗：'+ex.message)}finally{e.target.value=''}};
 // Global login overlay remains the owner of authorization. No public API write without bearer token.
 const begin=()=>{if(loaded)return;reloadPublished()};
 if(!document.getElementById('duoduo-admin-auth'))begin();
 window.addEventListener('duoduo-admin-authenticated',begin);
})();
