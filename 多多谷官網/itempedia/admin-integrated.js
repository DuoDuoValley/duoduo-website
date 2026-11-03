/* DuoDuo Itempedia — authenticated cloud publishing, independent from legacy item DB. */
(()=>{'use strict';
const host=document.getElementById('pediaAdminRoot');if(!host)return;
const $=id=>document.getElementById(id);
const api=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
const endpoint=api+'/api/site-data';
const defaultState={version:3,items:structuredClone(window.DuoDuoItemCatalogDefault),buffs:structuredClone(window.DuoDuoBuffCatalogDefault)};
const draftKey='duoduo_itempedia_admin_draft_v3';
let state=structuredClone(defaultState),lastPublished=null,loaded=false,dirty=false,kind='items',editing=null,filter='';
const copy=o=>structuredClone(o);
const canonical=v=>{if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(x=>canonical(x)??'null').join(',')+']';return '{'+Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}'};
const isValid=obj=>obj&&Array.isArray(obj.items?.items)&&Array.isArray(obj.items?.categories)&&Array.isArray(obj.buffs?.buffs)&&Array.isArray(obj.buffs?.tiers);
const token=()=>{try{return sessionStorage.getItem('duoduo_admin_session')||''}catch{return ''}};
const field=id=>$(id)?.value||'';
const msg=(s,error=false)=>{const x=$('pediaAdminStatus');x.textContent=s;x.style.color=error?'#ffb4b4':'#a9e3d6';};
function saveDraft(){try{localStorage.setItem(draftKey,JSON.stringify(state));}catch(e){msg('瀏覽器草稿儲存失敗，請立即匯出 JSON。',true);}dirty=true;}
const entries=()=>kind==='items'?state.items.items:state.buffs.buffs;
const options=()=>kind==='items'?state.items.categories:state.buffs.tiers;
const heading=()=>kind==='items'?'專屬道具':'BUFF 效果';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function badge(s){return document.createTextNode(s);}
function validate(data){
 if(!isValid(data))throw Error('匯入資料缺少道具或 BUFF 資料');
 if(data.items.items.length>2500||data.buffs.buffs.length>2500)throw Error('資料筆數超出上限');
 for(const [section,list,key] of [['道具',data.items.items,'category'],['BUFF',data.buffs.buffs,'tier']]){
  const ids=new Set();
  for(const x of list){if(typeof x.id!=='string'||!x.id||ids.has(x.id))throw Error(section+' ID 重複或空白');ids.add(x.id);
   if(typeof x.name!=='string'||!x.name.trim()||x.name.length>150||!String(x[key]||'').trim())throw Error(section+'名稱或分類不正確');
   if(typeof x.description!=='string'||x.description.length>12000)throw Error(section+'說明格式或長度不正確');
   if(x.image&&(!/^(?:itempedia\/assets\/[\p{L}\p{N}_().\-/% ]+\.(?:png|jpg|jpeg|webp|gif)|https:\/\/[^\s"'<>]+)$/iu.test(x.image)||x.image.length>1000))throw Error(section+'圖片路徑不安全：'+x.name);
  }
 }
 if(JSON.stringify(data).length>4_000_000)throw Error('資料超過 4 MB，請減少圖檔／內容');
}
function view(){
 const selected=entries().filter(x=>[x.name,x.category||x.tier,x.description].join(' ').toLowerCase().includes(filter.toLowerCase()));
 const root=$('pediaAdminRows');root.replaceChildren();
 $('pediaAdminCount').textContent=`${selected.length} / ${entries().length} 筆　｜　道具 ${state.items.items.length} 筆　BUFF ${state.buffs.buffs.length} 筆`;
 for(const entry of selected){const row=document.createElement('article');row.className='pia-row';
  const image=document.createElement('img');image.alt='';image.src=entry.image||'';image.loading='lazy';image.onerror=()=>{image.style.visibility='hidden'};
  const main=document.createElement('div');main.className='pia-row-main';
  const name=document.createElement('strong');name.textContent=entry.name;
  const hint=document.createElement('small');hint.textContent=(entry.category||entry.tier)+' · '+entry.description.replace(/\\n|#c|#/g,' ').slice(0,110);
  main.append(name,hint);
  const buttons=document.createElement('div');buttons.className='pia-actions';
  for(const [label,fn] of [['↑',()=>move(entry,-1)],['↓',()=>move(entry,1)],['編輯',()=>edit(entry)],['刪除',()=>remove(entry)]]){
   const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;buttons.append(b);
  }
  row.append(image,main,buttons);root.append(row);
 }
}
function move(entry,step){const a=entries().sort((x,y)=>(x.sort??0)-(y.sort??0));const at=a.findIndex(x=>x.id===entry.id);const neighbor=a[at+step];if(!neighbor)return;
 const n=a.indexOf(neighbor);[a[at],a[n]]=[a[n],a[at]];a.forEach((x,i)=>x.sort=i);saveDraft();view();}
function remove(entry){if(!confirm(`確定刪除「${entry.name}」的這一筆${heading()}？\n其他相同名稱的 BUFF 效果不會刪除；正式發布前仍可還原草稿。`))return;
 const list=entries();list.splice(list.findIndex(x=>x.id===entry.id),1);saveDraft();view();}
function updateChoices(current){const select=$('piaGroup');select.replaceChildren();const vals=[...new Set([...options(),...(current?[current]:[])])];
 for(const value of vals){const op=document.createElement('option');op.value=value;op.textContent=value;select.append(op)}
 select.value=current||vals[0]||'';}
function edit(entry){editing=entry?.id||null;
 $('piaEditor').hidden=false;$('piaEditorHeading').textContent=entry?'編輯 '+heading():'新增 '+heading();
 $('piaName').value=entry?.name||'';$('piaDescription').value=entry?.description||'';$('piaEffects').value=entry?.effectText||'';
 $('piaImage').value=entry?.image||'';$('piaKeywords').value=(entry?.keywords||[]).join('、');
 updateChoices(entry?.category||entry?.tier||options()[0]);$('piaCustomGroup').value='';
 $('piaTradeBox').hidden=kind!=='items';$('piaEffectsBox').hidden=kind!=='items';
 $('piaTrade').value=entry?.tradeable===true?'yes':entry?.tradeable===false?'no':'unknown';
 $('piaTimed').checked=entry?.timed===true;$('piaEnabled').checked=entry?.enabled!==false;
 $('piaImagePreview').src=entry?.image||'';$('piaImagePreview').hidden=!entry?.image;
 $('piaName').focus();}
function applyEdit(){const name=field('piaName').trim(),description=field('piaDescription').trim(),group=field('piaCustomGroup').trim()||field('piaGroup');
 if(!name||!group){msg('請填寫名稱和分類。',true);return;}
 if(name.length>150||group.length>80||description.length>12000){msg('名稱、分類或說明超出長度限制。',true);return;}
 let row=entries().find(x=>x.id===editing);if(!row){row={id:'pia-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),sort:entries().length};entries().push(row)}
 Object.assign(row,{name,description,image:field('piaImage').trim(),keywords:field('piaKeywords').split(/[、,，\n]/).map(x=>x.trim()).filter(Boolean),enabled:$('piaEnabled').checked});
 if(kind==='items'){row.category=group;row.tradeable=field('piaTrade')==='unknown'?null:field('piaTrade')==='yes';row.timed=$('piaTimed').checked?true:null;row.effectText=field('piaEffects').trim();}
 else row.tier=group;
 if(!options().includes(group))options().push(group);
 try{validate(state);}catch(error){msg(error.message,true);return;}
 saveDraft();$('piaEditor').hidden=true;view();msg('修改已保存為本機草稿；需按「發布到雲端」才會公開。');}
async function imageUpload(file){if(!file)return;
 if(!/^image\/(?:png|jpeg|webp|gif)$/.test(file.type)||file.size>5*1024*1024){msg('只接受 5 MB 以下 PNG、JPG、WebP、GIF。',true);return;}
 const t=token();if(!t){msg('登入已失效。',true);return;}
 msg('正在上傳道具圖片…');
 const url=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>resolve(reader.result);reader.readAsDataURL(file)});
 const res=await fetch(api+'/api/upload-image',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},body:JSON.stringify({dataUrl:url,filename:file.name})});
 const data=await res.json().catch(()=>({}));if(!res.ok||!data.ok||!data.path)throw Error(data.error||'圖片上傳失敗');
 $('piaImage').value=data.path;$('piaImagePreview').src=data.path;$('piaImagePreview').hidden=false;msg('圖片已上傳，請再儲存此道具草稿並發布。');}
async function cloudRead(){const res=await fetch(endpoint,{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);const data=await res.json();if(!data.ok||data.initialized!==true)throw Error('雲端資料未初始化');return data.data.duoduo_itempedia||null;}
async function initialize(){if(loaded)return;try{const published=await cloudRead();
  if(published){validate(published);lastPublished=canonical(published);state=copy(published);}else{state=copy(defaultState);lastPublished=null;}
  const local=localStorage.getItem(draftKey);if(local){try{const parsed=JSON.parse(local);validate(parsed);if(JSON.stringify(parsed)!==JSON.stringify(state)&&confirm('偵測到此瀏覽器有尚未發布的「道具百科」草稿。是否恢復？')){state=parsed;dirty=true;}}catch(e){console.warn('Bad draft',e)}}
  loaded=true;view();msg(published?'已讀取雲端最新版；編輯後需手動發布。':'雲端尚無道具百科資料，已載入初始 72 項道具與 64 筆 BUFF。');
 }catch(err){loaded=false;msg('無法讀取雲端，已停用編輯與發布，以防覆蓋正式資料：'+(err.message||err),true);}
}
async function publish(){if(!loaded||!token())return msg('尚未完成雲端讀取或登入已失效。',true);
 try{validate(state);}catch(e){return msg(e.message,true)}
 if(!confirm(`確定發布到多多谷正式官網？\n道具 ${state.items.items.length} 筆、BUFF ${state.buffs.buffs.length} 筆。\n這會取代目前道具百科的已發布版本，但不影響其他官網設定。`))return;
 const b=$('piaPublish');b.disabled=true;msg('正在比對雲端版本…');
 try{
  const latest=await cloudRead();if(canonical(latest)!==lastPublished){throw Error('雲端版本已被其他管理員變更，請先重新讀取，避免覆蓋他人修改。')}
  const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token()},body:JSON.stringify({values:{duoduo_itempedia:state}})});
  const result=await res.json().catch(()=>({}));if(!res.ok||!result.ok)throw Error(result.error||'雲端儲存失敗');
  const verify=await cloudRead();if(canonical(verify)!==canonical(state))throw Error('伺服器未保留道具百科資料。請先部署最新版 server.js 至 Render，資料未能確認發布。');
  lastPublished=canonical(verify);dirty=false;localStorage.removeItem(draftKey);msg('發布成功！雲端已重新讀取確認資料一致，玩家可以看到更新。');
 }catch(err){msg('發布未確認：'+err.message,true)}finally{b.disabled=false;}
}
function exportJSON(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='duoduo-itempedia-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)}
const html=`<div class="pia-toolbar"><button type="button" class="pia-primary" id="piaPublish">☁ 發布到雲端</button><button type="button" id="piaRefresh">重新讀取雲端</button><button type="button" id="piaExport">匯出備份 JSON</button><label class="pia-file">匯入備份 JSON<input id="piaImport" type="file" accept="application/json,.json" hidden></label><a class="pia-preview" href="item-encyclopedia.html" target="_blank" rel="noopener">查看前台 ↗</a></div>
<div class="pia-status" id="pediaAdminStatus" role="status">尚未讀取雲端資料</div>
<div class="pia-toolbar"><button type="button" id="piaItems" aria-pressed="true">專屬道具</button><button type="button" id="piaBuffs" aria-pressed="false">BUFF 增益</button><input id="piaSearch" type="search" placeholder="搜尋名稱、說明或分類…"><button type="button" class="pia-primary" id="piaAdd">＋ 新增</button></div>
<div class="pia-count" id="pediaAdminCount"></div><div class="pia-rows" id="pediaAdminRows"></div>
<section id="piaEditor" class="pia-editor" hidden><h2 id="piaEditorHeading">新增道具</h2><div class="pia-fields">
<label>名稱<input id="piaName" type="text" maxlength="150"></label>
<label>目前分類<select id="piaGroup"></select></label><label>新增分類（選填）<input id="piaCustomGroup" type="text" maxlength="80" placeholder="留空則使用上方分類"></label>
<label class="pia-full">道具簡介／BUFF 完整說明<textarea id="piaDescription" rows="4"></textarea></label>
<label class="pia-full" id="piaEffectsBox">能力加成／WZ Tooltip（選填）<textarea id="piaEffects" rows="5" placeholder="#c全屬性 +100#"></textarea></label>
<label class="pia-full">道具圖示路徑或 HTTPS 圖片網址<input id="piaImage" type="text" placeholder="itempedia/assets/道具.png 或 https://..."></label>
<div class="pia-full pia-image-input"><img id="piaImagePreview" alt="圖片預覽" hidden><label>上傳圖片（5 MB 以下）<input id="piaUpload" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label></div>
<label class="pia-full">自動辨識關鍵字（以頓號／逗號分隔；未填仍會匹配道具全名）<input id="piaKeywords" type="text"></label>
<div id="piaTradeBox" class="pia-full pia-options"><label>交易限制<select id="piaTrade"><option value="unknown">未標註</option><option value="yes">可交易</option><option value="no">無法交易</option></select></label><label><input id="piaTimed" type="checkbox"> 具時效性</label></div>
<label><input id="piaEnabled" type="checkbox" checked> 公開顯示</label></div>
<div class="pia-toolbar"><button class="pia-primary" type="button" id="piaSave">儲存草稿</button><button type="button" id="piaCancel">取消</button></div></section>`;
host.innerHTML=html;
$('piaItems').onclick=()=>{kind='items';$('piaItems').setAttribute('aria-pressed','true');$('piaBuffs').setAttribute('aria-pressed','false');$('piaEditor').hidden=true;view()};
$('piaBuffs').onclick=()=>{kind='buffs';$('piaItems').setAttribute('aria-pressed','false');$('piaBuffs').setAttribute('aria-pressed','true');$('piaEditor').hidden=true;view()};
$('piaSearch').oninput=e=>{filter=e.target.value;view()};$('piaAdd').onclick=()=>edit(null);$('piaSave').onclick=applyEdit;$('piaCancel').onclick=()=>{$('piaEditor').hidden=true};
$('piaUpload').onchange=async e=>{try{await imageUpload(e.target.files?.[0]);}catch(err){msg(err.message,true)}finally{e.target.value=''}};
$('piaPublish').onclick=publish;$('piaExport').onclick=exportJSON;
$('piaRefresh').onclick=async()=>{if(dirty&&!confirm('放棄目前未發布草稿並重新取得雲端資料？'))return;loaded=false;dirty=false;localStorage.removeItem(draftKey);await initialize()};
$('piaImport').onchange=async e=>{try{const file=e.target.files?.[0];if(!file)return;const next=JSON.parse(await file.text());validate(next);if(!confirm('以備份檔取代目前的本機草稿？不會立即發布。'))return;state=next;saveDraft();view();msg('已匯入本機草稿；按發布後才會更新官網。');}catch(err){msg('匯入失敗：'+err.message,true)}finally{e.target.value=''}};
window.addEventListener('duoduo-admin-authenticated',initialize);
// On a restored session the event may have fired before this deferred script.
if(token())fetch(api+'/api/admin/me',{headers:{Authorization:'Bearer '+token()},cache:'no-store'}).then(r=>{if(r.ok)initialize()}).catch(()=>{});
})();
