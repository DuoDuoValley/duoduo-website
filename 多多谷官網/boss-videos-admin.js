/* BOSS Videos admin - separate cloud key and draft, never modifies boss-atlas. */
(()=>{'use strict';
const panel=document.getElementById('bossVideoPanel');if(!panel)return;
const ROOT='duoduo_boss_videos',DRAFT='duoduo_boss_videos_draft';
const api=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
const input=id=>panel.querySelector('#'+id);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data={schema:1,videos:[]},bosses=[],activeId='',dirty=false,loaded=false;
panel.innerHTML='<h1>🎬 BOSS 影片攻略管理</h1><p style="line-height:1.8">獨立管理高階／終極 BOSS 影片。新增或編輯只保存在草稿；必須按「儲存並發布雲端」才會公開。不會修改原有 BOSS 圖鑑、倍率及道具資料。</p>'+
'<div class="toolbar"><button type="button" class="save" id="bva-publish">☁️ 儲存並發布雲端</button> <button type="button" class="ghost" id="bva-new">＋ 新增影片</button> <button type="button" class="ghost" id="bva-reload">重新載入雲端</button> <button type="button" class="ghost" id="bva-export">備份 JSON</button> <a class="preview-link" href="boss.html#ddBossVideos" target="_blank">查看前台 ↗</a></div>'+
'<p id="bva-status" role="status" style="padding:10px 0;color:#9db9d6"></p><div style="display:grid;grid-template-columns:minmax(180px,1fr) minmax(0,2.2fr);gap:16px" id="bva-layout"><div><input type="search" id="bva-search" placeholder="搜尋影片或 BOSS" style="width:100%;padding:10px"><div id="bva-list" style="margin-top:10px;display:grid;gap:5px;max-height:650px;overflow:auto"></div></div><div id="bva-editor"><p>請先選取影片或新增。</p></div></div>';
const status=(msg,error=false)=>{const n=input('bva-status');n.textContent=msg;n.style.color=error?'#ee8585':'#92b6cd'};
const validId=s=>/^[A-Za-z0-9_-]{11}$/.test(String(s||''));
const parseVideoId=v=>{const s=String(v||'').trim();if(validId(s))return s;try{const u=new URL(s);if(u.hostname==='youtu.be'||u.hostname==='www.youtu.be')return u.pathname.replace('/','');if(['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(u.hostname)){if(u.pathname.startsWith('/shorts/')||u.pathname.startsWith('/embed/'))return u.pathname.split('/')[2];return u.searchParams.get('v')||''}}catch(_){}return ''};
const draft=()=>{dirty=true;localStorage.setItem(DRAFT,JSON.stringify(data));status('草稿已儲存在此瀏覽器，尚未發布。')};
const matchingBosses=()=>bosses.filter(b=>['高階','終極'].includes(b.group)&&b.published!==false);
function drawList(){
 const q=input('bva-search').value.trim().toLowerCase();
 const rows=data.videos.filter(v=>{const b=bosses.find(x=>x.id===v.bossId);return [v.title,v.author,b?.name].some(s=>String(s||'').toLowerCase().includes(q))});
 input('bva-list').innerHTML=rows.length?rows.map(v=>{const b=bosses.find(x=>x.id===v.bossId);return '<button type="button" data-id="'+E(v.id)+'" style="padding:10px;text-align:left;border:1px solid #60758b;border-radius:9px;background:'+(activeId===v.id?'#27526a':'#1c3044')+';color:#eef6ff;cursor:pointer"><strong>'+E(b?.name||'未指定')+'</strong> '+(v.enabled?'🟢':'⚪')+'<br>'+E(v.title||'未命名影片')+'</button>'}).join(''):'<p>沒有影片資料。</p>';
}
function drawEditor(){
 const v=data.videos.find(v=>v.id===activeId);if(!v){input('bva-editor').innerHTML='<p>請先選取影片或新增。</p>';return}
 const fields=[['title','影片標題','text'],['author','作者名稱','text'],['videoId','YouTube 網址或影片 ID','text'],['difficulty','適用難度（如：困難）','text'],['publishedAt','影片發布日期（YYYY-MM-DD）','text'],['description','攻略說明','textarea']];
 const options=matchingBosses().map(b=>'<option value="'+E(b.id)+'" '+(v.bossId===b.id?'selected':'')+'>'+E(b.group)+' · '+E(b.name)+'</option>').join('');
 const textInput=f=>f[2]==='textarea'?'<textarea data-field="'+f[0]+'" style="min-height:85px;width:100%;padding:10px">'+E(v[f[0]])+'</textarea>':'<input type="text" data-field="'+f[0]+'" value="'+E(v[f[0]]||'')+'" style="width:100%;padding:10px">';
 input('bva-editor').innerHTML='<div style="display:grid;gap:12px;max-width:720px"><label>對應 BOSS<select data-field="bossId" style="width:100%;padding:10px">'+options+'</select></label>'+fields.map(f=>'<label style="display:grid;gap:5px">'+f[1]+textInput(f)+'</label>').join('')+
 '<div class="form two"><label>攻略種類<select data-field="kind"><option>機制教學</option><option>完整實戰</option><option>實戰解析</option><option>特殊技巧</option></select></label><label>觀看數快照（選填，須查證）<input data-field="views" type="number" min="0" value="'+(Number.isFinite(v.views)?v.views:'')+'"></label><label>按讚快照（選填，須查證）<input data-field="likes" type="number" min="0" value="'+(Number.isFinite(v.likes)?v.likes:'')+'"></label><label><input data-field="enabled" type="checkbox" '+(v.enabled?'checked':'')+'> 審核通過、公開顯示</label></div><div class="toolbar"><button type="button" class="save" id="bva-save">儲存到草稿</button><button type="button" class="ghost" id="bva-remove">刪除影片</button></div></div>';
 input('bva-editor').querySelector('[data-field="kind"]').value=v.kind||'機制教學';
 input('bva-save').onclick=()=>{
  const values={};input('bva-editor').querySelectorAll('[data-field]').forEach(node=>values[node.dataset.field]=node.type==='checkbox'?node.checked:node.value.trim());
  const id=parseVideoId(values.videoId);
  if(!validId(id))return status('請輸入有效 YouTube 影片網址或 11 碼 ID。',true);
  if(!values.title||!values.author||!values.bossId)return status('請填寫 BOSS、標題與作者。',true);
  if(data.videos.some(other=>other.id!==v.id&&other.videoId===id))return status('影片 ID 重複，無法儲存。',true);
  if(values.publishedAt&&!/^\d{4}-\d{2}-\d{2}$/.test(values.publishedAt))return status('日期請使用 YYYY-MM-DD 格式。',true);
  for(const key of ['views','likes']){values[key]=values[key]===''?null:Number(values[key]);if(values[key]!==null&&(!Number.isSafeInteger(values[key])||values[key]<0))return status('觀看及按讚數須是非負整數。',true)}
  Object.assign(v,values,{videoId:id});
  draft();drawList();drawEditor();
 };
 input('bva-remove').onclick=()=>{if(!confirm('確定從草稿刪除這支影片？'))return;data.videos=data.videos.filter(x=>x.id!==v.id);activeId=data.videos[0]?.id||'';draft();drawList();drawEditor()};
}
input('bva-list').onclick=e=>{const b=e.target.closest('[data-id]');if(b){activeId=b.dataset.id;drawList();drawEditor()}};
input('bva-search').oninput=drawList;
input('bva-new').onclick=()=>{
 const boss=matchingBosses()[0];if(!boss)return status('找不到公開的高階或終極 BOSS，無法新增。',true);
 const v={id:'guide-'+Date.now().toString(36),bossId:boss.id,videoId:'',title:'',author:'',kind:'機制教學',difficulty:'',publishedAt:'',views:null,likes:null,description:'',enabled:false};
 data.videos.unshift(v);activeId=v.id;draft();drawList();drawEditor();
};
const jsonEqual=(a,b)=>JSON.stringify(a,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v)===JSON.stringify(b,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
async function cloudRead(){
 const r=await fetch(api+'/api/site-data',{cache:'no-store'});const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw Error(j.error||'雲端讀取失敗');
 return j.data?.[ROOT];
}
async function load(skipDraft=false){
 try{
  const [br,dr]=await Promise.all([fetch('boss-atlas-data.json',{cache:'no-store'}),fetch('boss-videos-data.json',{cache:'no-store'})]);
  if(!br.ok||!dr.ok)throw Error('找不到初始資料');
  bosses=(await br.json()).bosses||[];
  let baseline=await dr.json(),cloud=null;
  try{const c=await fetch(api+'/api/site-data',{cache:'no-store'});if(c.ok){const p=await c.json();if(p?.data?.duoduo_boss_atlas?.bosses)bosses=p.data.duoduo_boss_atlas.bosses;cloud=p?.data?.[ROOT]}}catch(_){}
  data=cloud?.schema===1&&Array.isArray(cloud.videos)?cloud:baseline;
  if(!skipDraft){let saved=null;try{saved=JSON.parse(localStorage.getItem(DRAFT)||'null')}catch(_){}
    if(saved?.schema===1&&Array.isArray(saved.videos)&&confirm('發現未發布的影片攻略草稿，要恢復嗎？')){data=saved;dirty=true}
  }
  activeId=data.videos[0]?.id||'';loaded=true;drawList();drawEditor();status(dirty?'已恢復未發布草稿。':cloud?'已讀取雲端正式資料。':'目前使用預設候選資料，尚未發布。');
 }catch(e){status(e.message,true)}
}
input('bva-reload').onclick=()=>{if(dirty&&!confirm('確定放棄未發布草稿並重新載入？'))return;localStorage.removeItem(DRAFT);dirty=false;load(true)};
input('bva-export').onclick=()=>{const a=document.createElement('a'),blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});a.href=URL.createObjectURL(blob);a.download='duoduo-boss-videos-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
input('bva-publish').onclick=async()=>{
 if(!loaded)return;
 if(data.videos.some(v=>v.enabled&&!validId(v.videoId)))return status('仍有已公開影片的 YouTube ID 無效。',true);
 const token=sessionStorage.getItem('duoduo_admin_session');if(!token)return status('管理員尚未登入。',true);
 if(!confirm('確定發布 '+data.videos.filter(v=>v.enabled).length+' 部影片至官網？此操作僅更新影片資料。'))return;
 const btn=input('bva-publish');btn.disabled=true;status('正在發布雲端…');
 try{
  const r=await fetch(api+'/api/site-data',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({values:{[ROOT]:data}})});
  const answer=await r.json().catch(()=>({}));if(!r.ok||!answer.ok)throw Error(answer.error||'發布失敗');
  let verified=false;for(let i=0;i<4;i++){if(i)await new Promise(resolve=>setTimeout(resolve,300*i));if(jsonEqual(await cloudRead(),data)){verified=true;break}}
  if(!verified)throw Error('寫入成功，但尚未讀回相同資料，請先核對雲端，勿反覆發布。');
  localStorage.removeItem(DRAFT);dirty=false;status('✅ 影片資料已發布，且已讀回確認。');
 }catch(e){status('❌ '+e.message,true)}finally{btn.disabled=false}
};
load();
})();