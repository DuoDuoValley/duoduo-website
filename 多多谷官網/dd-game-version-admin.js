/* Dedicated game-version publisher. Updates only duoduo_settings.gameVersion,
 * reads latest cloud settings first, verifies after write, never touches downloads.
 */
(()=>{'use strict';
 const root=document.getElementById('gameVersionPanel');if(!root)return;
 const get=id=>document.getElementById(id);
 const api=(location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'')+'/api/site-data';
 const fallback={number:'282',phase:'active',customText:'',showBadge:true};
 // Legacy 'active' continues to display 持續更新; 'official' is an explicit new choice.
 const phrase={active:'持續更新',official:'正式開放',preparing:'即將更新',maintenance:'版本維護中',custom:'自訂文字'};
 // Quick-select copy for the existing {phase:'custom', customText} cloud schema.
 // Do not introduce new phase values: older public pages already support custom.
 const PRESET_PHRASES=Object.freeze({
  preset_launch:'全新登場',
  preset_major:'大型改版上線',
  preset_complete:'更新完成',
  preset_content:'新內容開放',
  preset_event:'限時活動進行中',
  preset_adventure:'冒險再啟'
 });
 const hasPreset=key=>Object.prototype.hasOwnProperty.call(PRESET_PHRASES,key);
 const tidy=v=>String(v??'').replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,' ').replace(/\s+/g,' ').trim();
 const clean=v=>({number:String(v?.number??fallback.number).trim(),phase:Object.prototype.hasOwnProperty.call(phrase,v?.phase)?v.phase:'active',customText:typeof v?.customText==='string'?tidy(v.customText).slice(0,24):'',showBadge:v?.showBadge!==false});
 const label=v=>v.phase==='custom'?(v.customText||'版本狀態未設定'):phrase[v.phase];
 let published=null,locked=false;
 function info(text,error=false){const el=get('ddGameVersionStatus');el.textContent=text;el.style.color=error?'#e97777':'';}
 function validate(){
  const uiPhase=get('ddGameVersionPhase').value;
  const value={
   number:get('ddGameVersionNumber').value.trim(),
   phase:hasPreset(uiPhase)?'custom':uiPhase,
   customText:hasPreset(uiPhase)?PRESET_PHRASES[uiPhase]:tidy(get('ddGameVersionCustomText').value),
   showBadge:get('ddGameVersionBadge').checked
  };
  if(!/^\d{2,4}(?:\.\d{1,2})?$/.test(value.number))throw Error('版本請輸入 2～4 位數字，可選小數版，例如 283 或 283.1');
  if(!Object.prototype.hasOwnProperty.call(phrase,value.phase))throw Error('版本狀態無效');
  if(value.customText.length>24)throw Error('自訂文字最多 24 字');
  if(value.phase==='custom'){
   if(!value.customText)throw Error('請填寫自訂文字，例如「全新登場」');
   if(/^v\d{2,4}(?:\.\d{1,2})?(?:\s|$)/i.test(value.customText))throw Error('自訂文字不需要重複輸入版本號，系統會自動顯示 V'+value.number);
  }
  return value;
 }
 function preview(){
  const isCustom=get('ddGameVersionPhase').value==='custom';
  get('ddGameVersionCustomWrap').hidden=!isCustom;
  get('ddGameVersionCustomText').disabled=!isCustom;
  const el=get('ddGameVersionPreview');
  let value;try{value=validate()}catch(err){el.textContent=err.message;return;}
  el.replaceChildren();
  const title=document.createElement('span');title.textContent='官網前台預覽';el.appendChild(title);
  if(value.showBadge){const pill=document.createElement('span');pill.className='dd-gv-pill';pill.textContent=`V${value.number} ${label(value)}`;el.appendChild(pill);}
  else{const hint=document.createElement('span');hint.style.marginLeft='10px';hint.textContent='右上角版本標籤已隱藏';el.appendChild(hint);}
 }
 function setForm(v){
  v=clean(v);
  const preset=v.phase==='custom'?Object.keys(PRESET_PHRASES).find(key=>PRESET_PHRASES[key]===v.customText):null;
  get('ddGameVersionNumber').value=v.number;
  get('ddGameVersionPhase').value=preset||v.phase;
  get('ddGameVersionCustomText').value=v.customText;
  get('ddGameVersionBadge').checked=v.showBadge;
  preview();
 }
 async function readCloud(){
  const response=await fetch(api,{cache:'no-store',headers:{Accept:'application/json'}});
  if(!response.ok)throw Error('讀取雲端失敗 HTTP '+response.status);
  const data=await response.json();
  if(data?.ok!==true||data?.initialized!==true||!data.data||typeof data.data!=='object')throw Error('雲端網站資料尚未初始化，請先確認後台雲端設定');
  return data.data;
 }
 function setDownloads(data){
  const node=get('ddGameVersionDownloads');
  const list=Array.isArray(data?.duoduo_downloads)?data.duoduo_downloads:[];
  const targets=list.filter(x=>['patch281to282','patch2824','pack'].includes(x?.id));
  const currentNumber=get('ddGameVersionNumber').value.trim();
  const stale=targets.filter(item=>item.enabled!==false&&/V282/i.test([item.title,item.desc].join(' '))&&!String([item.title,item.desc].join(' ')).includes('V'+currentNumber));
  node.textContent=targets.length?'目前雲端下載項目：'+targets.map(x=>`${x.title||x.id}（${x.enabled===false?'隱藏':'公開'}）`).join('；'):'雲端尚未確認更新檔／整合包項目；正式改版前請先檢查下載專區。';
  if(currentNumber!=='282'&&stale.length){node.textContent+='。⚠️ 下列公開下載說明仍標示 V282：'+stale.map(x=>x.title||x.id).join('、')+'；請確認是否需更新至 V'+currentNumber+'，不要只改文字不改網址。';}
  const links=data?.duoduo_links||{};
  const mismatch=['launcher','pack'].filter(key=>{
   const selected=list.find(x=>x?.id===key&&x.enabled!==false);
   const saved=typeof links[key]==='string'?links[key]:(typeof links[key==='launcher'?'登入器下載':'整合包下載']==='string'?links[key==='launcher'?'登入器下載':'整合包下載']:'');
   return !!(selected?.url&&saved&&selected.url!==saved);
  });
  if(mismatch.length){node.textContent+='。⚠️ 網址管理與下載專區的「'+mismatch.map(k=>k==='pack'?'整合包':'登入器').join('、')+'」連結不一致；請核對網址管理，避免入口指向舊版。';}
 }
 async function load(){
  if(locked)return;locked=true;get('ddGameVersionReload').disabled=true;
  info('正在讀取正式雲端版本…');
  try{
   const data=await readCloud();
   published=clean(data?.duoduo_settings?.gameVersion||fallback);setForm(published);setDownloads(data);
   info('雲端目前公開：V'+published.number+' · '+label(published)+'。修改欄位不會自動公開。');
  }catch(err){published=null;info('無法確認雲端版本：'+String(err.message||err)+'。請勿在未確認狀態下發布。',true);}
  finally{locked=false;get('ddGameVersionReload').disabled=false;}
 }
 async function publish(){
  if(locked)return;
  let next;try{next=validate()}catch(err){info(err.message,true);return;}
  if(!published){info('目前沒有讀到已確認的雲端版本，請先按重新讀取。',true);return;}
  if(!confirm(`確定將多多谷遊戲版本設定為 V${next.number}（${label(next)}）並發布至雲端？\n\n注意：這不會自動更改下載網址或更新遊戲程式。`))return;
  const btn=get('ddGameVersionPublish');btn.disabled=true;locked=true;info('正在核對既有網站設定並發布…');
  try{
   const token=sessionStorage.getItem('duoduo_admin_session')||'';
   if(!token)throw Error('管理員登入已失效');
   const all=await readCloud();
   const currentDownloads=Array.isArray(all.duoduo_downloads)?all.duoduo_downloads:[];
   if(['active','official'].includes(next.phase)&&next.number!=='282'){
    const suspect=currentDownloads.filter(x=>x?.enabled!==false&&['patch281to282','patch2824','pack'].includes(x?.id)&&/V282/i.test([x.title,x.desc].join(' '))&&!String([x.title,x.desc].join(' ')).includes('V'+next.number));
    if(suspect.length&&!confirm('注意：以下仍公開的下載項目可能保留舊版說明：\n'+suspect.map(x=>x.title||x.id).join('、')+'\n\n已確認相關下載檔案／網址及適用版本正確，仍要正式開放 V'+next.number+' 嗎？')){
     info('已取消版本發布；下載資料與雲端版本均未改動。');return;
    }
   }
   const original=all.duoduo_settings||{};
   if(typeof original!=='object'||Array.isArray(original))throw Error('雲端網站設定格式錯誤，為避免覆蓋其他欄位已中止發布');
   const latest=clean(original.gameVersion||fallback);
   if(JSON.stringify(latest)!==JSON.stringify(published))throw Error('另一個管理員或分頁已更改版本，請重新讀取雲端後再操作');
   const merged={...original,gameVersion:next};
   const response=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({values:{duoduo_settings:merged}})});
   const reply=await response.json().catch(()=>({}));
   if(!response.ok||reply.ok!==true)throw Error(reply.error||'雲端寫入失敗');
   let verified=false;
   for(let i=0;i<3;i++){
    if(i)await new Promise(resolve=>setTimeout(resolve,i*400));
    const check=await readCloud();
    if(JSON.stringify(clean(check?.duoduo_settings?.gameVersion))===JSON.stringify(next)){
     setDownloads(check);verified=true;break;
    }
   }
   if(!verified)throw Error('寫入已回應成功，但尚未讀回確認版本；請先重新讀取，勿連續發布');
   published={...next};
   const old=(()=>{try{return JSON.parse(localStorage.getItem('duoduo_settings')||'{}')||{}}catch{return {}}})();
   localStorage.setItem('duoduo_settings',JSON.stringify({...old,gameVersion:next}));
   try{if(typeof settings!=='undefined')settings.gameVersion=next}catch(_){}
   info(`✅ 已發布且讀回驗證：V${next.number} · ${label(next)}。玩家的版本顯示將讀取這份雲端設定。`);
  }catch(err){info('❌ '+String(err.message||err),true)}
  finally{btn.disabled=false;locked=false;}
 }
 ['ddGameVersionNumber','ddGameVersionPhase','ddGameVersionCustomText','ddGameVersionBadge'].forEach(id=>get(id).addEventListener('input',preview));
 get('ddGameVersionReload').addEventListener('click',load);
 get('ddGameVersionPublish').addEventListener('click',publish);
 get('ddGameVersionOpenDownloads').addEventListener('click',()=>document.querySelector('[data-panel="downloads"]')?.click());
 // Admin auth is verified by admin.js before use; public cloud read needs no token.
 load();
})();
