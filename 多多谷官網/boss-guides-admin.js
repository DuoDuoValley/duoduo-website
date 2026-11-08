/* Admin-only BOSS guide editor.  Authenticated cloud writes use the existing site-data API.
 * Does not modify BOSS atlas, drops, navigation, itempedia or any other site data key. */
(()=>{'use strict';
 const panel=document.getElementById('bossGuidesPanel');if(!panel)return;
 const API=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
 const CLOUD_KEY='duoduo_boss_guides',DRAFT_KEY='duoduo_boss_guides_admin_v13_draft';
 const $=id=>panel.querySelector('#'+id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clone=x=>JSON.parse(JSON.stringify(x));
 // Supabase JSONB may reorder object keys while retaining exactly the same data.
 // Compare JSON structure, not JavaScript object insertion order; arrays keep order.
 const canonical=x=>Array.isArray(x)?x.map(canonical):
   (x!==null&&typeof x==='object')?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
 const sameDocument=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
 const cloudUrl=()=>API+'/api/site-data?guide_check='+Date.now()+'-'+Math.random().toString(36).slice(2,7);

 const token=()=>{try{return sessionStorage.getItem('duoduo_admin_session')||''}catch{return ''}};
 const TYPES={article:'圖文攻略',video:'影片攻略',note:'歷史機制筆記'};
 // Guide-only switch; never modify atlas `published` or other BOSS tools.
 const guideBossVisible=b=>data?.bossVisibility?.[b.id]===true||(data?.bossVisibility?.[b.id]!==false&&b.published!==false);
 let data=null,bosses=[],chosenBoss='',chosenType='article',selectedId='',dirty=false,loadedCloud=null,ready=false;
 const putStatus=(s,isError=false)=>{const p=$('bgStatus');p.textContent=s;p.classList.toggle('error',isError)};
 const validUrl=(url,type)=>{try{const u=new URL(String(url||''));if(u.protocol!=='https:')return false;if(type==='video'){const host=u.hostname.replace(/^www\./,'');const vid=host==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v');return ['youtube.com','m.youtube.com','youtu.be'].includes(host)&&/^[\w-]{11}$/.test(String(vid||''))}return true}catch{return false}};
 function verifyDraft(d){
   if(!d||d.schema!==1||!Array.isArray(d.entries)||d.entries.length>500)throw Error('攻略資料格式不符或超過 500 筆');
   if(d.bossVisibility!==undefined&&(d.bossVisibility===null||Array.isArray(d.bossVisibility)||typeof d.bossVisibility!=='object'||Object.keys(d.bossVisibility).some(id=>typeof d.bossVisibility[id]!=='boolean')))throw Error('BOSS 顯示設定格式不符');
   const used=new Set();
   for(const x of d.entries){
     if(!x||typeof x.id!=='string'||!x.id||used.has(x.id)||!['article','video','note'].includes(x.type)||!bosses.some(b=>b.id===x.bossId)||typeof x.title!=='string'||x.title.length>180)throw Error('包含無效／重複的攻略條目');
     used.add(x.id);
   }
 }
 function verify(d){
   verifyDraft(d);
   for(const x of d.entries){
     if(!String(x.title||'').trim())throw Error('仍有未命名攻略，請先填寫或刪除');
     if(x.type!=='note'&&!validUrl(x.url,x.type))throw Error('攻略網址有誤：'+x.title);
   }
 }
 function rows(){return data?.entries?.filter(x=>x.bossId===chosenBoss&&x.type===chosenType).sort((a,b)=>Number(a.order||99999)-Number(b.order||99999))||[]}
 const current=()=>data?.entries?.find(x=>x.id===selectedId);
 function draft(){dirty=true;data.updatedAt=new Date().toISOString();try{localStorage.setItem(DRAFT_KEY,JSON.stringify(data))}catch{putStatus('瀏覽器草稿儲存失敗。請立即匯出 JSON 備份。',true);return}putStatus('已儲存在本機後台草稿，尚未發布雲端。')}
 function normalize(){
   // Preserve the administrator's existing per-BOSS, per-type ordering when
   // deleting a record; never reset to the original JSON insertion order.
   const groups=new Map();
   for(const x of data.entries){const key=x.bossId+'|'+x.type;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(x)}
   for(const g of groups.values())g.sort((a,b)=>Number(a.order||99999)-Number(b.order||99999)).forEach((x,i)=>x.order=i+1);
 }
 function drawList(){
   const items=rows();$('bgCount').textContent=items.length+' 筆 · '+(dirty?'未發布草稿':'已載入');
   $('bgList').innerHTML=items.length?items.map((x,i)=>'<div class="bg-entry '+(x.id===selectedId?'active':'')+'"><div><button type="button" class="bg-title" data-edit="'+esc(x.id)+'">'+esc(x.title||'未命名攻略')+'</button><div class="bg-meta">'+(x.enabled===false?'⚪ 隱藏 · ':'🟢 顯示 · ')+esc(x.author||'作者待核對')+' · '+(x.approved?'已核對':'待核對')+'</div></div><div class="bg-arrows"><button type="button" aria-label="上移" title="上移" data-move="'+esc(x.id)+'" data-delta="-1" '+(i===0?'disabled':'')+'>↑</button><button type="button" aria-label="下移" title="下移" data-move="'+esc(x.id)+'" data-delta="1" '+(i===items.length-1?'disabled':'')+'>↓</button></div></div>').join(''):'<p class="bg-status">此 BOSS 尚無這類攻略，可按「＋ 新增」。</p>';
 }
 function drawForm(){
   const x=current();if(!x){$('bgEditor').hidden=true;$('bgEditorEmpty').hidden=false;return}
   $('bgEditorEmpty').hidden=true;$('bgEditor').hidden=false;
   for(const key of ['title','author','url','difficulty','stage','image'])$('bg'+key[0].toUpperCase()+key.slice(1)).value=x[key]||'';
   $('bgApproved').checked=Boolean(x.approved);$('bgEnabled').checked=x.enabled!==false;
   $('bgSourceInfo').textContent='條目 ID：'+x.id+' · 類型：'+TYPES[x.type]+' · 排序：'+(x.order||1);
   $('bgUrlField').hidden=x.type==='note';
 }
 function render(){if(!data)return;$('bgBoss').value=chosenBoss;$('bgType').value=chosenType;
   const boss=bosses.find(x=>x.id===chosenBoss);
   $('bgBossVisible').disabled=!boss;
   $('bgBossVisible').checked=Boolean(boss&&guideBossVisible(boss));
   $('bgBossVisibleLabel').textContent=boss?('此 BOSS 在攻略頁'+(guideBossVisible(boss)?'顯示':'隱藏')):'未選擇 BOSS';
   drawList();drawForm()}
 function move(id,delta){const set=rows(),at=set.findIndex(x=>x.id===id),other=set[at+delta];if(at<0||!other)return;const a=set[at];[a.order,other.order]=[other.order,a.order];draft();render()}
 function edit(id){selectedId=id;render()}
 function newItem(){
   if(!chosenBoss)return;
   const id='g-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
   const x={id,bossId:chosenBoss,type:chosenType,title:'',author:'',url:'',difficulty:'',stage:'',content:'',image:'',approved:false,enabled:false,order:rows().length+1,origin:'後台新增'};
   data.entries.push(x);selectedId=x.id;draft();render();$('bgTitle').focus();
 }
 function saveEditor(){
   const x=current();if(!x)return;
   const newValues={};for(const k of ['title','author','url','difficulty','stage','image'])newValues[k]=$('bg'+k[0].toUpperCase()+k.slice(1)).value.trim();
   newValues.approved=$('bgApproved').checked;newValues.enabled=$('bgEnabled').checked;
   if(!newValues.title||newValues.title.length>180)return putStatus('請填寫攻略標題（最多 180 字）。',true);
   if(x.type!=='note'&&!validUrl(newValues.url,x.type))return putStatus('請填寫有效 HTTPS 來源網址，影片限 YouTube。',true);
   Object.assign(x,newValues);delete x.summary;draft();render();
 }
 function removeItem(){const x=current();if(!x||!confirm('確定刪除此筆「'+x.title+'」？刪除會先保存在草稿，發布後才會生效。'))return;data.entries=data.entries.filter(i=>i.id!==x.id);selectedId='';normalize();draft();render()}
 const genericArticleTitle=t=>/^[^｜]+｜圖文攻略(?:\s*\d+)?$/.test(String(t||'').trim());
 const sourceKey=v=>{try{const u=new URL(String(v||''));return u.origin+u.pathname+'?'+[...u.searchParams].filter(([k])=>['bsn','snA','sn'].includes(k)).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k+'='+v).join('&')}catch{return ''}};
 const applyVerifiedArticleTitles=(target,reference)=>{
   const official=new Map(reference.filter(x=>x.type==='article'&&!genericArticleTitle(x.title)&&sourceKey(x.url)).map(x=>[sourceKey(x.url),x.title]));
   let count=0;
   for(const x of target){if(x.type!=='article'||!genericArticleTitle(x.title))continue;const name=official.get(sourceKey(x.url));if(name){x.title=name;count++}}
   return count;
 };
 const genericVideoTitle=t=>/^[^｜]+｜影片攻略(?:\s*\d+)?$/.test(String(t||'').trim());
 const unknownVideoAuthor=t=>!String(t||'').trim()||/^(?:原作者待核對|作者待核對|未填作者)$/.test(String(t||'').trim());
 const youtubeVideoId=url=>{try{const u=new URL(url),host=u.hostname.replace(/^www\./,'');const v=host==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v');return /^[\w-]{11}$/.test(String(v||''))?v:''}catch{return ''}};
 async function fillVideoMetadata(silent=false){
   if(!ready||!data)return;
   const all=data.entries.filter(x=>x.type==='video'&&(genericVideoTitle(x.title)||unknownVideoAuthor(x.author))&&youtubeVideoId(x.url));
   if(!all.length){if(!silent)putStatus('目前沒有需要補齊的 YouTube 標題或作者。');return}
   if(!silent&&!confirm('將查詢 '+all.length+' 筆 YouTube 原始標題與頻道名稱，只更新通用占位文字，保留自行編輯資料。查詢結果只存本機草稿，仍須人工檢查後再發布。確定繼續？'))return;
   const button=$('bgVideoMeta');button.disabled=true;
   const targetData=data;
   let changed=0,failed=0,cursor=0;
   const memo=new Map();
   const fetchMeta=id=>{
     if(memo.has(id))return memo.get(id);
     const task=(async()=>{
       const ctrl=new AbortController(),tm=setTimeout(()=>ctrl.abort(),7000);
       try{
         const url='https://www.youtube.com/oembed?format=json&url='+encodeURIComponent('https://www.youtube.com/watch?v='+id);
         const response=await fetch(url,{signal:ctrl.signal,credentials:'omit',referrerPolicy:'no-referrer'});
         const value=response.ok?await response.json():null;
         if(value?.provider_name!=='YouTube'||typeof value.title!=='string'||typeof value.author_name!=='string')return null;
         const title=value.title.trim(),author=value.author_name.trim();
         return title&&title.length<=180&&author&&author.length<=120?{title,author}:null;
       }catch(_){return null}finally{clearTimeout(tm)}
     })();
     memo.set(id,task);return task;
   };
   const worker=async()=>{
     while(cursor<all.length){
       const x=all[cursor++],id=youtubeVideoId(x.url);
       const meta=await fetchMeta(id);
       if(!meta){failed++;continue}
       const title=x.title,author=x.author;
       if(genericVideoTitle(title))x.title=meta.title;
       if(unknownVideoAuthor(author))x.author=meta.author;
       if(x.title!==title||x.author!==author)changed++;
     }
   };
   try{
     // Four bounded workers avoid a lengthy sequential wait with many videos.
     await Promise.all(Array.from({length:Math.min(4,all.length)},worker));
     // A reload can happen while requests are pending; never save stale results.
     if(data!==targetData)return;
     if(changed){draft();render()}
     if(!silent||changed||failed)putStatus('YouTube 查詢完成：已補齊 '+changed+' 筆，'+failed+' 筆無法讀取。變更僅在本機草稿；需由管理員發布雲端。');
   }finally{button.disabled=false}
 }

 function fileDownload(name,content){const b=new Blob([content],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
 async function load(force=false){
   try{
     putStatus('正在讀取 BOSS 攻略與雲端資料…');
     const [gr,br,cr]=await Promise.all([fetch('boss-guides-data.json',{cache:'no-store'}),fetch('boss-atlas-data.json',{cache:'no-store'}),fetch(API+'/api/site-data',{cache:'no-store'})]);
     if(!gr.ok||!br.ok)throw Error('找不到 GitHub 初始攻略或 BOSS 圖鑑資料');
     const initial=await gr.json(),atlas=await br.json(),cloud=cr.ok?await cr.json():null;
     bosses=(cloud?.data?.duoduo_boss_atlas?.bosses||atlas.bosses||[]).filter(b=>['高階','終極'].includes(b.group));
     loadedCloud=cloud?.data?.[CLOUD_KEY]||null;
     data=clone(loadedCloud?.schema===1&&Array.isArray(loadedCloud.entries)?loadedCloud:initial);
     const articleTitlesUpdated=applyVerifiedArticleTitles(data.entries,initial.entries);
     // Old cloud records may still contain summary fields; remove them only from
     // the local draft until an authenticated administrator explicitly publishes.
     const summariesRemoved=data.entries.reduce((n,x)=>{
       if(Object.prototype.hasOwnProperty.call(x,'summary')){delete x.summary;return n+1}
       return n;
     },0);
     verify(data);chosenBoss=bosses.some(b=>b.id===chosenBoss)?chosenBoss:bosses[0]?.id||'';
     $('bgBoss').innerHTML=bosses.map(b=>'<option value="'+esc(b.id)+'">'+esc(b.group)+' · '+esc(b.name)+'</option>').join('');
     dirty=false;selectedId='';ready=true;render();
     if(articleTitlesUpdated||summariesRemoved)draft();
     // Synchronize placeholder YouTube metadata into the administrator's local draft.
     // Cloud writes still require an authenticated publish.
     fillVideoMetadata(true).catch(e=>console.warn('影片標題同步未完成',e));
     putStatus(loadedCloud?'已讀取正式雲端資料。可編輯後先存草稿，再發布。':'目前使用 V13 GitHub 預設連結。尚未有雲端發布資料；按「儲存並發布雲端」可建立第一版。');
   }catch(e){putStatus('載入失敗：'+e.message,true)}
 }
 async function publish(){
   if(!ready||!data)return;
   try{verify(data)}catch(e){putStatus(e.message,true);return}
   const t=token();if(!t)return putStatus('後台尚未登入或登入狀態已過期。',true);
   if(!confirm('將目前 '+data.entries.length+' 筆攻略資料發布到雲端？此操作僅修改 BOSS 攻略專用欄位，不更動其他網站資料。'))return;
   const btn=$('bgPublish');btn.disabled=true;putStatus('正在檢查雲端版本與儲存權限…');
   try{
     const before=await fetch(API+'/api/site-data',{cache:'no-store'}),response=before.ok?await before.json():null;
     if(response?.ok!==true)throw Error('雲端現況讀取失敗，為避免覆蓋資料已中止');
     const currentCloud=response.data?.[CLOUD_KEY]||null;
     if(!sameDocument(currentCloud,loadedCloud))throw Error('雲端資料已由其他裝置更新，請先備份草稿並重新載入，不要直接覆蓋。');
     const payload=clone(data);for(const x of payload.entries)delete x.summary;payload.schema=1;payload.dataRevision=14;payload.updatedAt=new Date().toISOString();
     const sent=await fetch(API+'/api/site-data',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+t,'X-Admin-Activity':'1'},body:JSON.stringify({values:{[CLOUD_KEY]:payload}})});
     const saved=await sent.json().catch(()=>({}));if(!sent.ok||saved.ok!==true)throw Error(saved.error||'發布失敗：後端拒絕儲存');
     let confirmed=false,readSucceeded=false,mismatch=false,lastReadError='';
     // Retry read-back without re-submitting the original write.
     for(let attempt=0;attempt<8;attempt++){
       if(attempt)await new Promise(resolve=>setTimeout(resolve,1000));
       try{
         const check=await fetch(cloudUrl(),{cache:'no-store'});
         if(!check.ok){lastReadError='HTTP '+check.status;continue}
         const verified=await check.json();
         if(verified?.ok!==true){lastReadError='API 回傳異常';continue}
         readSucceeded=true;
         if(sameDocument(verified.data?.[CLOUD_KEY]??null,payload)){confirmed=true;break}
         mismatch=true;
       }catch(error){lastReadError=String(error?.message||error);console.warn('BOSS 攻略雲端讀回暫時失敗',error)}
     }
     if(!confirmed){
       try{localStorage.setItem(DRAFT_KEY,JSON.stringify(payload))}catch(_){}
       const reason=readSucceeded&&mismatch?'讀回內容與本次發布資料不同':('讀回 API 尚未成功'+(lastReadError?'（'+lastReadError+'）':''));
       putStatus('⚠ 後端已接受儲存，但'+reason+'。請按「重新載入正式資料」核對，勿重複發布。',true);
       return;
     }
     data=payload;loadedCloud=clone(payload);dirty=false;localStorage.removeItem(DRAFT_KEY);render();putStatus('✅ 雲端發布成功，且已讀回確認。本頁攻略將依新排序顯示。');
   }catch(e){putStatus('❌ '+e.message,true)}finally{btn.disabled=false}
 }
 panel.innerHTML='<h1>🎬 BOSS 圖文／影片攻略管理</h1>'+
 '<div class="bg-note">管理高階／終極 BOSS 圖文及影片，可單獨設定每隻 BOSS 在攻略頁顯示或隱藏。排序、編輯、新增、刪除只作用於獨立攻略資料，不會修改 BOSS 圖鑑、掉落機率或其他官網設定。<b>前台已取消編輯功能。</b></div>'+
 '<div class="bg-toolbar"><button type="button" class="bg-primary" id="bgPublish">☁️ 儲存並發布雲端</button><button type="button" id="bgReload">重新載入正式資料</button><button type="button" id="bgRestore">恢復本機草稿</button><button type="button" id="bgExport">備份 JSON</button><label>匯入 JSON <input type="file" id="bgImport" hidden accept=".json,application/json"></label><a href="boss-guides.html" target="_blank" rel="noopener noreferrer">預覽攻略頁 ↗</a></div>'+
 '<p id="bgStatus" role="status" class="bg-status">等待管理員登入…</p>'+
 '<div class="bg-layout"><div class="bg-pane"><div class="bg-filters"><label class="bg-field">選擇 BOSS<select id="bgBoss"></select></label><label class="bg-field">攻略種類<select id="bgType"><option value="article">圖文攻略</option><option value="video">影片攻略</option></select></label></div><label class="bg-boss-visibility"><input type="checkbox" id="bgBossVisible"><span id="bgBossVisibleLabel">此 BOSS 在攻略頁顯示</span><small>只影響 BOSS 攻略頁，不影響 BOSS 圖鑑或傷害反推。</small></label><div class="bg-toolbar"><button type="button" id="bgAdd">＋ 新增攻略</button><button type="button" id="bgVideoMeta" title="以 YouTube 公開資訊補齊通用占位文字，只儲存後台草稿">讀取 YouTube 原始標題／作者</button><span id="bgCount" style="font-size:12px;color:#a7bfcd"></span></div><div id="bgList" class="bg-list"></div></div>'+
 '<div class="bg-pane"><p id="bgEditorEmpty" class="bg-status">選擇條目或新增攻略後即可編輯。</p><div id="bgEditor" hidden><p id="bgSourceInfo" class="bg-note"></p><div class="bg-form"><label class="bg-field full">攻略標題<input id="bgTitle" maxlength="180"></label><label class="bg-field">作者名稱<input id="bgAuthor" maxlength="120"></label><label class="bg-field">難度／適用版本<input id="bgDifficulty" maxlength="120"></label><label class="bg-field">對應階段<input id="bgStage" maxlength="120"></label><label class="bg-field full" id="bgUrlField">原始網址<input id="bgUrl" type="url"></label><label class="bg-field full">已授權封面網址（選填）<input id="bgImage"></label><label class="bg-field bg-check"><input type="checkbox" id="bgEnabled">在前台顯示</label><label class="bg-field bg-check"><input type="checkbox" id="bgApproved">已核對來源／版本</label></div><div class="bg-toolbar"><button type="button" class="bg-primary" id="bgSave">儲存草稿</button><button type="button" id="bgDelete">刪除此筆</button></div></div></div></div>';
 $('bgBoss').onchange=v=>{chosenBoss=v.target.value;selectedId='';render()};
 $('bgBossVisible').onchange=e=>{if(!ready||!chosenBoss||!data)return;
   if(!data.bossVisibility||typeof data.bossVisibility!=='object'||Array.isArray(data.bossVisibility))data.bossVisibility={};
   data.bossVisibility[chosenBoss]=Boolean(e.target.checked);draft();render()};$('bgType').onchange=v=>{chosenType=v.target.value;selectedId='';render()};
 $('bgList').onclick=e=>{const m=e.target.closest('[data-move]');if(m){move(m.dataset.move,Number(m.dataset.delta));return}const b=e.target.closest('[data-edit]');if(b)edit(b.dataset.edit)};
 $('bgAdd').onclick=newItem;$('bgVideoMeta').onclick=()=>fillVideoMetadata(false);$('bgSave').onclick=saveEditor;$('bgDelete').onclick=removeItem;$('bgPublish').onclick=publish;
 $('bgReload').onclick=()=>{if(dirty&&!confirm('會放棄未發布草稿。建議先備份，仍確定重新載入？'))return;load(true)};
 $('bgRestore').onclick=()=>{try{const d=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null');verifyDraft(d);if(!confirm('恢復這台瀏覽器的未發布草稿，取代目前編輯中的內容？'))return;data=d;dirty=true;selectedId='';render();putStatus('已恢復本機草稿，尚未發布。')}catch(e){putStatus('沒有有效的本機草稿：'+e.message,true)}};
 $('bgExport').onclick=()=>{if(data)fileDownload('多多谷_BOSS攻略_備份.json',JSON.stringify(data,null,2))};
 $('bgImport').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>2e6)throw Error('檔案超過 2 MB');const v=JSON.parse(await file.text());verify(v);if(!confirm('確定匯入 JSON 並取代現有未發布草稿？'))return;data=clone(v);selectedId='';draft();render()}catch(e){putStatus('匯入失敗：'+e.message,true)}finally{e.target.value=''}};
 let started=false;
 const start=()=>{if(started)return;started=true;load()};
 window.addEventListener('duoduo-admin-authenticated',start);
 // The admin bootstrap may have completed before this defer script started.
 if(token()&&!document.getElementById('duoduo-admin-auth'))start();
})();
