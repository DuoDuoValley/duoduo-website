/* Shared canonical six-category menu defaults for frontend and backend. */
window.DuoDuoNavDefaults=[
 {key:'news',name:'最新消息',href:'news.html',items:[['全部','news.html?ddnav=全部'],['重要','news.html?ddnav=重要消息'],['維護','news.html?ddnav=維護通知'],['更新','news.html?ddnav=更新說明'],['活動','news.html?ddnav=活動資訊'],['序號','news.html?ddnav=序號發放']]},
 {key:'events',name:'檔期活動',href:'events.html',items:[['全部','events.html?ddnav=all'],['進行中','events.html?ddnav=active'],['已結束','events.html?ddnav=ended']]},
 {key:'boss',name:'BOSS',href:'boss.html',items:[['挑戰指南','boss.html#ddBossChallenge'],['血量倍率計算機','boss.html#bc-calc-title'],['個人傷害反推','boss.html#bc-inverse-title'],['BOSS 資訊','boss.html#ddBossAtlas']]},
 {key:'guide',name:'遊玩指南',href:'guide.html',items:[['角色卡與傳授技能','jobs/jobs.html'],['玩法與系統介紹','guide.html#dd-resource-guide'],['機率型道具說明','guide.html#dd-resource-rates'],['上架商品','guide.html#dd-resource-products']]},
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
