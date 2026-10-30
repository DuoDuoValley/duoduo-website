/* V9 navigation editor — edits only duoduo_settings.navDropdown, using the
   established authenticated '儲存設定' action. Never auto-publishes changes. */
(()=>{'use strict';
 const host=document.getElementById('ddNavSubmenus');
 const submit=document.getElementById('saveSettings');
 if(!host||!submit||!Array.isArray(window.DuoDuoNavDefaults))return;
 const defaults=window.DuoDuoNavDefaults;
 const safeHref=value=>{
  const v=String(value||'').trim();
  if(!v||v.length>700||/[\\\x00-\x1f]/.test(v))return false;
  try{const u=new URL(v,document.baseURI);return u.protocol==='https:'||u.protocol==='http:'}catch{return false}
 };
 const base=()=>defaults.reduce((o,g)=>{
  o[g.key]={items:g.items.map(([label,href],i)=>({id:g.key+'-'+i,label,href,enabled:true}))};return o;
 },{});
 let root;
 try{root=JSON.parse(localStorage.getItem('duoduo_settings')||'{}')}catch{root={}}
 const saved=root?.navDropdown?.groups;
 const groups=base();
 const upgradeJobsTitle=item=>{
  if(String(item.label||'').trim()!=='職業圖鑑')return item;
  try{if(new URL(item.href,document.baseURI).pathname.endsWith('/jobs/jobs.html'))item.label='角色卡與傳授技能'}catch(_){}
  return item;
 };
 if(saved&&typeof saved==='object')for(const key of Object.keys(groups)){
  if(Array.isArray(saved[key]?.items)){
   const items=saved[key].items.map(x=>upgradeJobsTitle({...x})).slice(0,20);
   groups[key].items=key==='news'?window.DuoDuoNavEnsureNewsSerial(items,root?.navDropdown?.newsSerialAdded):items;
  }
 }
 const nameMap={'news':'最新消息',events:'檔期活動',boss:'BOSS',guide:'遊玩指南',downloads:'下載專區','player-tools':'玩家工具'};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const panelStyle=document.createElement('style');
 panelStyle.textContent=`#ddNavSubmenus .dd-admin-menu{margin:12px 0 22px;padding:15px;border:1px solid #a3b5c43d;border-radius:12px}#ddNavSubmenus .dd-admin-row{display:grid;grid-template-columns:minmax(110px,1fr) minmax(160px,2.3fr) auto auto auto;gap:8px;align-items:end;margin:8px 0}#ddNavSubmenus label{font-size:12px}#ddNavSubmenus input[type=text]{width:100%;min-width:0;padding:8px;border:1px solid #a0b5c4;border-radius:7px}#ddNavSubmenus .dd-admin-row button{padding:8px 10px;border-radius:7px;border:1px solid #9bb1c5;background:transparent;color:inherit;cursor:pointer}#ddNavSubmenus .dd-admin-row button:disabled{opacity:.4}#ddNavSubmenus .dd-add-item{margin-top:6px;border:1px solid #9bb1c5;border-radius:8px;padding:8px 12px;background:transparent;color:inherit;cursor:pointer}@media(max-width:850px){#ddNavSubmenus .dd-admin-row{grid-template-columns:repeat(4,minmax(0,1fr))}#ddNavSubmenus .dd-admin-row label:nth-child(1){grid-column:1/3}#ddNavSubmenus .dd-admin-row label:nth-child(2){grid-column:3/5}}`;
 document.head.appendChild(panelStyle);
 function draw(){
  host.innerHTML=defaults.map(g=>{
   const items=groups[g.key].items;
   return `<div class="dd-admin-menu" data-group="${esc(g.key)}"><h3>${esc(nameMap[g.key])}（${items.length} 項）</h3>${items.map((it,i)=>
    `<div class="dd-admin-row" data-index="${i}"><label>顯示名稱<input type="text" data-field="label" maxlength="50" value="${esc(it.label)}"></label><label>連結／分類篩選目標<input type="text" data-field="href" maxlength="700" value="${esc(it.href)}"></label><label><input type="checkbox" data-field="enabled" ${it.enabled!==false?'checked':''}> 顯示</label><button type="button" data-act="up" ${i===0?'disabled':''} aria-label="上移">↑</button><button type="button" data-act="down" ${i===items.length-1?'disabled':''} aria-label="下移">↓</button></div>`).join('')}<button type="button" class="dd-add-item" data-act="add" ${items.length>=20?'disabled':''}>＋ 新增項目</button></div>`;
  }).join('');
 }
 function updateRow(row){
  const key=row.closest('[data-group]')?.dataset.group,index=Number(row.dataset.index);
  const target=groups[key]?.items[index];if(!target)return;
  row.querySelectorAll('[data-field]').forEach(input=>{
   if(input.dataset.field==='enabled')target.enabled=input.checked;
   else target[input.dataset.field]=input.value;
  });
 }
 host.addEventListener('change',e=>{const row=e.target.closest('.dd-admin-row');if(row)updateRow(row)});
 host.addEventListener('input',e=>{const row=e.target.closest('.dd-admin-row');if(row)updateRow(row)});
 host.addEventListener('click',e=>{
  const button=e.target.closest('button[data-act]');if(!button)return;
  const key=button.closest('[data-group]')?.dataset.group,items=groups[key]?.items;
  if(!items)return;
  const action=button.dataset.act,index=Number(button.closest('[data-index]')?.dataset.index);
  if(action==='add'){
   if(items.length>=20)return;
   items.push({id:'custom-'+Date.now().toString(36),label:'新項目',href:'guide.html',enabled:false});
  }else if(action==='up'&&index>0){[items[index-1],items[index]]=[items[index],items[index-1]]}
  else if(action==='down'&&index<items.length-1){[items[index+1],items[index]]=[items[index],items[index+1]]}
  draw();
 });
 // Capture runs BEFORE admin.js's existing saveSettings.onclick, which writes
 // settings to localStorage and publishes the exact same object via cloud API.
 submit.addEventListener('click',e=>{
  for(const g of defaults){for(const item of groups[g.key].items){
    if(!String(item.label||'').trim()||!safeHref(item.href)){
     e.preventDefault();e.stopImmediatePropagation();alert('導覽選單有空白名稱或無效網址：'+nameMap[g.key]);return;
    }
   }}
  if(typeof settings!=='undefined'){
   settings.navDropdown={groups:structuredClone(groups),newsSerialAdded:true};
  }
 },true);
 const checkVersion=document.getElementById('ddCheckDeployVersion');
 const versionState=document.getElementById('ddDeployVersionState');
 if(checkVersion&&versionState)checkVersion.addEventListener('click',async()=>{
  checkVersion.disabled=true;versionState.textContent='正在讀取部署版本…';
  try{const res=await fetch('dd-release.txt?_dd_check='+Date.now(),{cache:'no-store'});
   if(!res.ok)throw Error('HTTP '+res.status);
   const value=(await res.text()).trim();
   versionState.textContent=/^[0-9a-f]{40}$/i.test(value)?'GitHub 版本碼：'+value+'（SHA 偵測正常）':'此站未產生 Jekyll 版本碼；官網已啟用靜態檔案更新偵測。';
  }catch(err){versionState.textContent='讀取失敗：'+(err.message||err)}finally{checkVersion.disabled=false}
 });
 draw();
})();
