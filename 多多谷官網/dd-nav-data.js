/* Shared canonical six-category menu defaults for frontend and backend. */
window.DuoDuoNavDefaults=[
 {key:'news',name:'最新消息',href:'news.html',items:[['全部','news.html?ddnav=全部'],['重要','news.html?ddnav=重要消息'],['維護','news.html?ddnav=維護通知'],['更新','news.html?ddnav=更新說明'],['活動','news.html?ddnav=活動資訊'],['序號','news.html?ddnav=序號發放'],['處分','news.html?ddnav=處分名單']]},
 {key:'events',name:'檔期活動',href:'events.html',items:[['全部','events.html?ddnav=all'],['進行中','events.html?ddnav=active'],['已結束','events.html?ddnav=ended']]},
 {key:'boss',name:'BOSS',href:'boss.html',items:[['挑戰指南','boss.html#ddBossChallenge'],['血量倍率計算機','boss.html#bc-calc-title'],['個人傷害反推','boss.html#bc-inverse-title'],['BOSS 資訊','boss.html#ddBossAtlas'],['影片攻略','boss.html#ddBossVideos']]},
 {key:'guide',name:'遊玩指南',href:'guide.html',items:[['角色卡與傳授技能','jobs/jobs.html'],['戰地拼圖模擬器','legion-preview-6c82f4a9/index.html'],['玩法與系統介紹','guide.html#dd-resource-guide'],['每日 Checklist','guide.html#dd-resource-checklist'],['機率型道具說明','guide.html#dd-resource-rates'],['上架商品','guide.html#dd-resource-products'],['道具百科','item-encyclopedia.html']]},
 {key:'downloads',name:'下載專區',href:'downloads.html',items:[['主程式','downloads.html?ddnav=manager'],['更新檔','downloads.html?ddnav=patch281to282'],['手動更新檔','downloads.html?ddnav=patch2824'],['登入器','downloads.html?ddnav=launcher'],['整合包','downloads.html?ddnav=pack']]},
 {key:'player-tools',name:'玩家工具',href:'player-tools/index.html',items:[['裝備強化','player-tools/index.html?ddnav=enhance'],['阿斯特拉輔助武器強化','player-tools/index.html?ddnav=astra'],['圖騰強化','player-tools/index.html?ddnav=totem'],['內襯強化','player-tools/index.html?ddnav=liner'],['塔戒升級','player-tools/index.html?ddnav=tower'],['抽獎模擬器','player-tools/index.html?ddnav=gacha']]}
];;

// Migrate previously published dropdown settings once, without overwriting custom items.
// After the admin saves, newsSerialAdded preserves intentional later edits/removal.
window.DuoDuoNavEnsureNewsSerial=function(items,alreadyUpgraded){
 if(!Array.isArray(items)||alreadyUpgraded===true)return items;
 const exists=items.some(item=>{
  if(item?.id==='news-serial'||String(item?.label||'').trim()==='序號')return true;
  try{return new URL(String(item?.href||''),document.baseURI).searchParams.get('ddnav')==='序號發放'}catch(_){return false}
 });
 if(exists||items.length>=20)return items;
 const next=items.map(item=>({...item}));
 const eventIndex=next.findIndex(item=>{
  if(String(item?.label||'').trim()==='活動')return true;
  try{return new URL(String(item?.href||''),document.baseURI).searchParams.get('ddnav')==='活動資訊'}catch(_){return false}
 });
 next.splice(eventIndex<0?next.length:eventIndex+1,0,{id:'news-serial',label:'序號',href:'news.html?ddnav=序號發放',enabled:true});
 return next;
};


// Keep the Checklist submenu pointing to the existing resource card inside guide.html.
// Repair the old external URL from the previous release even if saved cloud settings
// already contain guideChecklistAdded=true. Other admin-customized URLs are preserved.
window.DuoDuoNavEnsureGuideChecklist=function(items,alreadyUpgraded){
 if(!Array.isArray(items))return items;
 const checklistUrl='guide.html#dd-resource-checklist';
 const priorUrl='https://duoduovalley.github.io/duoduo-checklist/';
 const isOldExternal=(value)=>{
  try{
   const u=new URL(String(value||''),document.baseURI);
   return u.href===priorUrl;
  }catch(_){return false}
 };
 const next=items.map(item=>{
  if(!item||typeof item!=='object')return item;
  const isChecklist=item.id==='guide-checklist'||String(item.label||'').trim()==='每日 Checklist';
  return isChecklist&&isOldExternal(item.href)?{...item,href:checklistUrl}:{...item};
 });
 if(alreadyUpgraded===true)return next;
 const exists=next.some(item=>{
  if(item?.id==='guide-checklist'||String(item?.label||'').trim()==='每日 Checklist')return true;
  try{
   const url=new URL(String(item?.href||''),document.baseURI);
   return url.pathname.endsWith('/guide.html')&&url.hash==='#dd-resource-checklist';
  }catch(_){return false}
 });
 if(exists||next.length>=20)return next;
 const after=next.findIndex(item=>{
  if(String(item?.label||'').trim()==='玩法與系統介紹')return true;
  try{return new URL(String(item?.href||''),document.baseURI).hash==='#dd-resource-guide'}catch(_){return false}
 });
 next.splice(after<0?next.length:after+1,0,{id:'guide-checklist',label:'每日 Checklist',href:checklistUrl,enabled:true});
 return next;
};


// V2.46: keep the new official Legion submenu visible directly below Jobs,
// including sites whose cloud-saved navigation predates this release.
window.DuoDuoNavEnsureLegion=function(items){
 if(!Array.isArray(items))return items;
 const href='legion-preview-6c82f4a9/index.html';
 const title='戰地拼圖模擬器';
 const result=items.map(x=>({...x}));
 const isLegion=item=>{
  if(!item)return false;
  if(item.id==='guide-legion'||String(item.label||'').trim()===title)return true;
  return /(?:^|\/)legion-preview-6c82f4a9\/index\.html(?:[?#]|$)/.test(String(item.href||''));
 };
 const present=result.findIndex(isLegion);
 let entry;
 if(present>=0){entry={...result.splice(present,1)[0],label:title,href,enabled:true}}
 else if(result.length<20)entry={id:'guide-legion',label:title,href,enabled:true};
 else return result; // avoid deleting admin-customized entries at the 20-item limit
 const jobs=result.findIndex(item=>{
  if(String(item.label||'').trim()==='角色卡與傳授技能'||String(item.label||'').trim()==='職業圖鑑')return true;
  try{return new URL(String(item.href||''),document.baseURI).pathname.endsWith('/jobs/jobs.html')}catch(_){return false}
 });
 result.splice(jobs<0?0:jobs+1,0,entry);
 return result;
};

// V2.7: retain the canonical encyclopedia entry after 上架商品 even on already saved nav settings.
window.DuoDuoNavEnsureItempedia=function(items){
 if(!Array.isArray(items))return items;
 const result=items.map(item=>({...item})), title='道具百科',href='item-encyclopedia.html';
 const matches=item=>{
  if(!item)return false;
  if(item.id==='guide-itempedia'||String(item.label||'').trim()===title)return true;
  try{return new URL(String(item.href||''),document.baseURI).pathname.endsWith('/item-encyclopedia.html')}catch(_){return false}
 };
 const present=result.findIndex(matches);
 let entry=present<0?null:result.splice(present,1)[0];
 if(!entry&&result.length>=20)return result; // preserve administrator customizations at the limit
 entry={...(entry||{}),id:'guide-itempedia',label:title,href,enabled:true};
 const idx=result.findIndex(item=>String(item.label||'').trim()==='上架商品'||String(item.href||'').includes('dd-resource-products'));
 result.splice(idx<0?result.length:idx+1,0,entry);
 return result;
};

// V3.8: add the punishment category after 序號 on previously saved cloud menus.
// Preserve all unrelated admin-defined entries, labels and URLs.
window.DuoDuoNavEnsureNewsPunishment=function(items){
 if(!Array.isArray(items))return items;
 const next=items.map(item=>({...item}));
 const isPunishment=item=>{
  if(!item)return false;
  if(item.id==='news-punishment'||String(item.label||'').trim()==='處分')return true;
  try{return new URL(String(item.href||''),document.baseURI).searchParams.get('ddnav')==='處分名單'}catch(_){return false}
 };
 const index=next.findIndex(isPunishment);
 if(index>=0)next.splice(index,1);
 else if(next.length>=20)return next;
 const serial=next.findIndex(item=>{
  if(String(item.label||'').trim()==='序號'||item.id==='news-serial')return true;
  try{return new URL(String(item.href||''),document.baseURI).searchParams.get('ddnav')==='序號發放'}catch(_){return false}
 });
 next.splice(serial>=0?serial+1:next.length,0,{id:'news-punishment',label:'處分',href:'news.html?ddnav=處分名單',enabled:true});
 return next;
};

/* Append the new BOSS Videos entry to older cloud-saved navigation only. */
window.DuoDuoNavEnsureBossVideos=function(items){
 if(!Array.isArray(items))return items;
 const has=items.some(i=>i?.id==='boss-video-guides'||String(i?.label||'').trim()==='影片攻略'||String(i?.href||'').includes('#ddBossVideos'));
 if(has||items.length>=20)return items;
 const out=items.map(i=>({...i}));
 const idx=out.findIndex(i=>String(i.label||'').trim()==='BOSS 資訊'||String(i.href||'').includes('#ddBossAtlas'));
 out.splice(idx>=0?idx+1:out.length,0,{id:'boss-video-guides',label:'影片攻略',href:'boss.html#ddBossVideos',enabled:true});
 return out;
};
