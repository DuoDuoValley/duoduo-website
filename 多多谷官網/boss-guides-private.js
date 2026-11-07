/* 多多谷 BOSS 攻略未列入導覽的測試版。
 * 本頁不需要登入，不連動正式 BOSS 圖鑑或公開導覽列。
 * 注意：GitHub Pages 靜態網址可被任何知道連結的人開啟。
 * 草稿保存在當前瀏覽器 localStorage，不同步雲端。
 */
(()=>{'use strict';
 const API=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
 const DRAFT='duoduo_boss_guides_private_draft_v1';
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const plain=s=>String(s??'').trim();
 const youtubeId=s=>{try{const u=new URL(s);const host=u.hostname.replace(/^www\./,'');if(host==='youtu.be')return /^[\w-]{11}$/.test(u.pathname.slice(1))?u.pathname.slice(1):'';if(host==='youtube.com'||host==='m.youtube.com'||host==='youtube-nocookie.com'){const value=u.searchParams.get('v')||(u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)||[])[1]||'';return /^[\w-]{11}$/.test(value)?value:''}}catch(_){}return ''};
 const safeUrl=v=>{try{const u=new URL(plain(v),location.href);return u.protocol==='https:'?u.href:''}catch(_){return ''}};
 const safeImg=v=>{const s=plain(v);if(/^assets\/[\w./%()\-]+$/i.test(s)&&!s.includes('..'))return s;return safeUrl(s)};
 const FIELDS=['bossId','type','title','author','url','difficulty','stage','summary','content','image','approved'];
 const SEED_ENTRIES=[{"id":"seed-a1","bossId":"boss18","type":"article","title":"用三張圖簡單介紹一下威爾打法","author":"梨","url":"https://forum.gamer.com.tw/C.php?bsn=7650&snA=1021203","difficulty":"版本待核對","stage":"","summary":"每個階段分別整理主要機制，特別適合打王前快速複習。版本較舊，關鍵數值須重新核對。","content":"","image":"","approved":false,"origin":"候選資料（待審核）"},{"id":"seed-a2","bossId":"boss18","type":"article","title":"威爾機制教學","author":"SportMas","url":"https://forum.gamer.com.tw/C.php?bsn=7650&snA=1035639","difficulty":"版本待核對","stage":"","summary":"用簡短文字歸納三階段的判定、走位及應對，適合剛學習威爾的玩家。","content":"","image":"","approved":false,"origin":"候選資料（待審核）"},{"id":"seed-a3","bossId":"boss21","type":"article","title":"困七之路・真希拉招式與攻略思路","author":"nnr","url":"https://forum.gamer.com.tw/C.php?bsn=7650&snA=1028966","difficulty":"版本待核對","stage":"","summary":"整理場地機制、招式、練習思路與示範影片；文章註明更新至 TMS v266。","content":"","image":"","approved":false,"origin":"候選資料（待審核）"},{"id":"seed-a4","bossId":"boss21","type":"article","title":"真希拉進階攻略（GIF 圖解）","author":"喜德","url":"https://forum.gamer.com.tw/C.php?bsn=7650&snA=1026045","difficulty":"版本待核對","stage":"","summary":"介紹紅線安全點、收割週期、招式閃避與卡牆細節；適合想練習走位的玩家。","content":"","image":"","approved":false,"origin":"候選資料（待審核）"},{"id":"seed-a5","bossId":"boss23","type":"article","title":"黑魔法師招式整理（圖多）","author":"袋鼠","url":"https://forum.gamer.com.tw/C.php?bsn=7650&snA=999355","difficulty":"版本待核對","stage":"","summary":"整理四階段招式與詛咒等關鍵機制。歷史攻略，數值及機制變動需先核對。","content":"","image":"","approved":false,"origin":"候選資料（待審核）"},{"id":"seed-a6","bossId":"boss25","type":"article","title":"監視者卡洛斯招式整理","author":"大叮噹","url":"https://forum.gamer.com.tw/C.php?bsn=7650&snA=1023689","difficulty":"版本待核對","stage":"","summary":"主要整理普通難度機制；原作者指出混沌、終極差異較多，不能直接視為終極攻略。","content":"","image":"","approved":false,"origin":"候選資料（待審核）"},{"id":"seed-a7","bossId":"boss26","type":"article","title":"咖凌攻略 or 影音分享大樓","author":"Madoka 等玩家","url":"https://forum.gamer.com.tw/C.php?bsn=7650&snA=1036983","difficulty":"版本待核對","stage":"","summary":"多位玩家分享不同職業與難度實戰，適合作為補充資料，不是統一的完整圖文機制教學。","content":"","image":"","approved":false,"origin":"候選資料（待審核）"},{"id":"seed-a8","bossId":"boss14","type":"article","title":"手殘平民惡魔殺手 VS 普通史烏攻略","author":"staly","url":"https://forum.gamer.com.tw/C.php?bsn=7650&snA=1013582","difficulty":"版本待核對","stage":"","summary":"附裝備、角色資料及打法心得；只適合一般／普通難度參考，不適用終極史烏專屬機制。","content":"","image":"","approved":false,"origin":"候選資料（待審核）"},{"id":"seed-a9","bossId":"boss17","type":"article","title":"主教單吃簡單露希妲教學","author":"巴哈玩家","url":"https://forum.gamer.com.tw/C.php?bsn=7650&snA=1017000","difficulty":"版本待核對","stage":"","summary":"含示意圖及主教的炸彈、綠龍應對技巧；簡單模式且偏職業限定。","content":"","image":"","approved":false,"origin":"候選資料（待審核）"},{"id":"seed-v1","bossId":"boss24","type":"video","title":"賽蓮｜技能與機制攻略","author":"Kayson愷森","url":"https://www.youtube.com/watch?v=RggMBfS5HAU","difficulty":"版本待核對","stage":"","summary":"外部影片候選，需確認影片仍可播放及是否適用多多谷 V282。","content":"","image":"","approved":false,"origin":"候選資料（待審核）"},{"id":"seed-v2","bossId":"boss26","type":"video","title":"咖凌｜1–3 階段機制詳細解析","author":"Mico咪口","url":"https://www.youtube.com/watch?v=qMyoei_oWN8","difficulty":"版本待核對","stage":"","summary":"外部影片候選，需確認影片仍可播放及是否適用多多谷 V282。","content":"","image":"","approved":false,"origin":"候選資料（待審核）"},{"id":"seed-v3","bossId":"boss23","type":"video","title":"黑魔法師｜一、二階段攻略","author":"Kayson愷森","url":"https://www.youtube.com/watch?v=qdGeQs7DbCI","difficulty":"版本待核對","stage":"","summary":"外部影片候選，需確認影片仍可播放及是否適用多多谷 V282。","content":"","image":"","approved":false,"origin":"候選資料（待審核）"},{"id":"seed-v4","bossId":"boss23","type":"video","title":"黑魔法師｜三、四階段攻略","author":"Kayson愷森","url":"https://www.youtube.com/watch?v=kg2oLuqohTY","difficulty":"版本待核對","stage":"","summary":"外部影片候選，需確認影片仍可播放及是否適用多多谷 V282。","content":"","image":"","approved":false,"origin":"候選資料（待審核）"},{"id":"seed-v5","bossId":"boss26","type":"video","title":"咖凌｜單人實戰與操作","author":"KEKI姆Q","url":"https://www.youtube.com/watch?v=j7tbgQeZx6o","difficulty":"版本待核對","stage":"","summary":"外部影片候選，需確認影片仍可播放及是否適用多多谷 V282。","content":"","image":"","approved":false,"origin":"候選資料（待審核）"},{"id":"seed-v6","bossId":"boss25","type":"video","title":"混沌卡洛斯｜字幕實戰解析","author":"KEKI姆Q","url":"https://www.youtube.com/watch?v=6CaqPA37l9c","difficulty":"版本待核對","stage":"","summary":"外部影片候選，需確認影片仍可播放及是否適用多多谷 V282。","content":"","image":"","approved":false,"origin":"候選資料（待審核）"}];
 let bosses=[],entries=[],current='',currentTab='article',group='全部',editId='';
 async function readJson(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('無法讀取 '+url);return r.json()}
 async function openApp(){
   try{
    // Public sample links (unverified) are shown in this unlisted test page.
    // The whole page is public if someone knows the URL; do not store secrets here.
    bosses=[{"id":"boss14","name":"史烏","group":"高階"},{"id":"boss15","name":"戴米安","group":"高階"},{"id":"boss16","name":"守護天使綠水靈","group":"高階"},{"id":"boss17","name":"露希妲","group":"高階"},{"id":"boss18","name":"威爾","group":"高階"},{"id":"boss19","name":"戴斯克","group":"高階"},{"id":"boss20","name":"頓凱爾","group":"高階"},{"id":"boss21","name":"真希拉","group":"高階"},{"id":"boss23","name":"黑魔法師","group":"終極"},{"id":"boss24","name":"受選的賽蓮","group":"終極"},{"id":"boss25","name":"監視者卡洛斯","group":"終極"},{"id":"boss26","name":"咖凌","group":"終極"},{"id":"boss27","name":"林波","group":"終極"},{"id":"boss28","name":"巴德利斯","group":"終極"},{"id":"boss29","name":"最初的敵對者","group":"終極"},{"id":"boss30","name":"凱伊","group":"終極"},{"id":"boss22","name":"瑪麗西亞","group":"終極"},{"id":"boss31","name":"燦爛的凶星","group":"終極"}];
    entries=SEED_ENTRIES.map(x=>({...x}));
    // Only use published BOSS identities from the existing atlas; never change atlas data.
    try{
      const a=await readJson('boss-atlas-data.json');if(Array.isArray(a.bosses))bosses=a.bosses.filter(x=>['高階','終極'].includes(x.group)&&x.published!==false);
      try{const cloud=await readJson(API+'/api/site-data');const latest=cloud?.data?.duoduo_boss_atlas?.bosses;
       if(Array.isArray(latest))bosses=latest.filter(x=>['高階','終極'].includes(x.group)&&x.published!==false);
      }catch(_){/* static catalog remains valid */}
    }catch(_){/* seed fallback */}
    try{const stored=JSON.parse(localStorage.getItem(DRAFT)||'null');if(stored?.schema===1&&Array.isArray(stored.entries))entries=stored.entries.filter(validEntry)}catch(_){/* no local draft */}
    current=bosses.find(x=>x.id===new URLSearchParams(location.search).get('boss'))?.id||bosses[0]?.id||'';
    fillBossSelect();drawAll();$('privateApp').hidden=false;
   }catch(err){$('privateApp').hidden=false; document.querySelector('.hero p').textContent='測試資料載入異常：'+(err.message||'未知錯誤'); console.error(err)}
 }
 function validEntry(v){return v&&typeof v==='object'&&typeof v.id==='string'&&['article','video','note'].includes(v.type)&&typeof v.bossId==='string'}
 function saveDraft(){localStorage.setItem(DRAFT,JSON.stringify({schema:1,entries,updatedAt:new Date().toISOString()}))}
 function byBoss(id,type){return entries.filter(x=>x.bossId===id&&x.type===type)}
 function currentBoss(){return bosses.find(x=>x.id===current)||bosses[0]}
 function fillBossSelect(){const f=$('fBoss');f.innerHTML=bosses.map(b=>'<option value="'+esc(b.id)+'">'+esc(b.group)+' · '+esc(b.name)+'</option>').join('')}
 function drawAll(){const total=entries.filter(x=>bosses.some(b=>b.id===x.bossId));$('bossStats').textContent=bosses.length+' 隻 BOSS';$('articleStats').textContent=total.filter(x=>x.type==='article').length+' 篇圖文候選';$('videoStats').textContent=total.filter(x=>x.type==='video').length+' 部影片候選';drawBossGrid();drawDetail();if(!$('editorPanel').hidden)drawEditorList()}
 function drawBossGrid(){
   const q=$('searchBoss').value.trim().toLocaleLowerCase();const visible=bosses.filter(b=>(group==='全部'||b.group===group)&&b.name.toLocaleLowerCase().includes(q));
   $('countLabel').textContent=visible.length+'／'+bosses.length+' 隻';
   $('bossGrid').innerHTML=visible.length?visible.map(b=>{
    const image=safeImg(b.image)||('assets/boss-atlas/bosses/'+b.id+'.png');
    return '<button type="button" class="bossbtn '+(current===b.id?'active':'')+'" data-boss="'+esc(b.id)+'" aria-pressed="'+(current===b.id)+'"><div class="boss-art"><span class="fallback" aria-hidden="true">⚔</span><img loading="lazy" src="'+esc(image)+'" alt="" onerror="this.hidden=true"></div><div class="boss-text"><strong>'+esc(b.name)+'</strong><span class="badge '+(byBoss(b.id,'article').length?'verified':'')+'">📖 '+(byBoss(b.id,'article').length||'待收錄')+'</span><span class="badge '+(byBoss(b.id,'video').length?'verified':'')+'">▶ '+(byBoss(b.id,'video').length||'待收錄')+'</span></div></button>';
   }).join(''):'<div class="empty">找不到符合條件的 BOSS。</div>';
 }
 function renderItem(x){
   const link=safeUrl(x.url),video=x.type==='video'?youtubeId(x.url):'',image=safeImg(x.image);
   const intro=esc(x.summary||'');const badge=x.approved?'<span class="badge verified">✓ 已人工核對</span>':'<span class="badge">待核對來源／版本</span>';
   const boss=bosses.find(b=>b.id===x.bossId);
   const bossImage=boss?(safeImg(boss.image)||('assets/boss-atlas/bosses/'+boss.id+'.png')):'';
   const photo=(x.type==='video'&&video)?'https://i.ytimg.com/vi/'+video+'/hqdefault.jpg':(image||bossImage);
   const imageLabel=x.type==='video'?'YouTube 影片縮圖':(image?'攻略封面（自行提供）':'BOSS 形象圖（非原文截圖）');
   const thumb=(x.type==='article'||x.type==='video')?'<div class="guide-thumb '+(x.type==='video'?'guide-thumb-video':'guide-thumb-article')+'">'+
    (photo?'<img loading="lazy" src="'+esc(photo)+'" alt="'+esc(imageLabel)+'" onerror="this.hidden=true;this.parentNode.classList.add(\'guide-thumb-missing\')">':'')+
    '<span class="guide-thumb-fallback" aria-hidden="true">'+(x.type==='video'?'▶':'📖')+'</span><span class="guide-thumb-tag">'+esc(imageLabel)+'</span></div>':'';
   let content='';
   if(x.type==='note'&&x.content){content='<div class="owner-note">'+esc(x.content)+'</div>'+(image?'<img class="item-image" loading="lazy" alt="自編攻略圖片" src="'+esc(image)+'">':'')}
   return '<article class="item '+(thumb?'guide-has-thumb':'')+'">'+thumb+'<div class="guide-item-body"><div class="meta"><span class="badge">'+esc(x.stage||x.difficulty||'未標註階段')+'</span>'+badge+'</div><h3>'+esc(x.title||'未命名攻略')+'</h3><div class="by">'+esc(x.author||'未填作者')+(x.origin?' · '+esc(x.origin):'')+'</div>'+(intro?'<p>'+intro+'</p>':'')+content+'<div class="buttons">'+(link?'<a href="'+esc(link)+'" target="_blank" rel="noopener noreferrer" class="secondary">'+(x.type==='video'?'前往 YouTube 原影片 ↗':'查看原作者文章 ↗')+'</a>':'')+(video?'<button type="button" data-play="'+esc(video)+'" data-entry="'+esc(x.id)+'">▶ 開啟迷你播放器</button>':'')+'</div></div></article>';
 }
 function drawDetail(){
  const b=currentBoss();if(!b){$('guideBody').innerHTML='<div class="empty">沒有可公開的高階或終極 BOSS。</div>';return}
  $('bossName').textContent=b.name;$('bossGroup').textContent=b.group+' BOSS';$('bossDifficulties').textContent=(b.difficulties||[]).map(d=>d.name).join('／')||'難度請參考 BOSS 資訊';
  const counts={article:byBoss(b.id,'article').length,video:byBoss(b.id,'video').length,note:byBoss(b.id,'note').length};
  $('articleCount').textContent='('+counts.article+')';$('videoCount').textContent='('+counts.video+')';$('noteCount').textContent='('+counts.note+')';
  for(const type of ['Article','Video','Notes']){const is=(currentTab==={Article:'article',Video:'video',Notes:'note'}[type]);const t=$('tab'+type);t.classList.toggle('active',is);t.setAttribute('aria-selected',String(is))}
  let list=byBoss(b.id,currentTab);const kindName={article:'圖文攻略',video:'影片攻略',note:'自編機制筆記'}[currentTab];
  $('guideBody').innerHTML='<div class="sectionline"><h2>'+kindName+'</h2><span>'+(currentTab==='note'?'自編內容僅供內部審核':'只提供來源與摘要，外部機制須重新核對')+'</span></div>'+
  (list.length?'<div class="items">'+list.map(renderItem).join('')+'</div>':'<div class="empty">這隻 BOSS 的'+kindName+'目前尚未收錄。<br>可切換到「編輯攻略資料」新增草稿。</div>');
 }
 $('bossGrid').addEventListener('click',e=>{const target=e.target.closest('[data-boss]');if(!target)return;current=target.dataset.boss;currentTab='article';const u=new URL(location.href);u.searchParams.set('boss',current);history.replaceState(null,'',u);drawBossGrid();drawDetail();$('detail').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})});
 $('searchBoss').addEventListener('input',drawBossGrid);
 $('groupControls').addEventListener('click',e=>{const button=e.target.closest('[data-group]');if(!button)return;group=button.dataset.group;for(const b of $('groupControls').querySelectorAll('button'))b.classList.toggle('active',b===button);drawBossGrid()});
 $('tabArticle').onclick=()=>{currentTab='article';drawDetail()};$('tabVideo').onclick=()=>{currentTab='video';drawDetail()};$('tabNotes').onclick=()=>{currentTab='note';drawDetail()};
 // Keep the iframe OUTSIDE #guideBody, which is re-rendered when tabs or BOSS change.
 // A single permanent player node preserves the same YouTube iframe and playback position.
 const floatingPlayer=$('ddFloatingPlayer');
 const playerFrame=$('ddPlayerFrame');
 const playerTitle=$('ddPlayerTitle');
 const playerExternal=$('ddPlayerExternal');
 const playerToggle=$('ddPlayerToggle');
 let playingId='';
 function openVideo(id,entry){
   if(!/^[\w-]{11}$/.test(id))return;
   const isSame=playingId===id&&playerFrame.querySelector('iframe');
   if(!isSame){
     const frame=document.createElement('iframe');
     frame.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&playsinline=1';
     frame.title='YouTube 攻略影片（可能受到原作者嵌入設定限制）';
     frame.referrerPolicy='strict-origin-when-cross-origin';
     frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
     frame.allowFullscreen=true;
     // Iframe is created only on user interaction; never lazily replaced by tab switches.
     playerFrame.replaceChildren(frame);playingId=id;
   }
   playerTitle.textContent=(entry?.title||'BOSS 攻略影片');
   playerExternal.href='https://www.youtube.com/watch?v='+id;
   floatingPlayer.hidden=false;
   // Re-selecting the same video does not reload it or reset the current time.
   if(isSame)floatingPlayer.classList.remove('dd-player-expanded');
   playerToggle.textContent=floatingPlayer.classList.contains('dd-player-expanded')?'縮成迷你視窗':'放大播放';
   playerToggle.setAttribute('aria-expanded',String(floatingPlayer.classList.contains('dd-player-expanded')));
 }
 $('guideBody').addEventListener('click',e=>{
   const button=e.target.closest('[data-play]');if(!button)return;
   const entry=entries.find(x=>x.id===button.dataset.entry);
   if(!entry||entry.type!=='video'||youtubeId(entry.url)!==button.dataset.play)return;
   openVideo(button.dataset.play,entry);
 });
 playerToggle.onclick=()=>{
   const expanded=floatingPlayer.classList.toggle('dd-player-expanded');
   playerToggle.textContent=expanded?'縮成迷你視窗':'放大播放';
   playerToggle.setAttribute('aria-expanded',String(expanded));
 };
 $('ddPlayerClose').onclick=()=>{
   floatingPlayer.hidden=true;floatingPlayer.classList.remove('dd-player-expanded');
   // Closing is an intentional stop. Switching tabs or BOSS never reaches this path.
   playerFrame.replaceChildren();playingId='';
   playerToggle.textContent='放大播放';playerToggle.setAttribute('aria-expanded','false');
 };
 document.addEventListener('keydown',e=>{
   if(e.key==='Escape'&&!floatingPlayer.hidden&&floatingPlayer.classList.contains('dd-player-expanded'))playerToggle.click();
 });
 $('copyUrl').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('copyUrl').textContent='已複製';setTimeout(()=>$('copyUrl').textContent='複製預覽連結',1700)}catch(_){$('copyUrl').textContent='複製失敗'}};
 $('themeBtn').onclick=()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';try{localStorage.setItem('duoduo_boss_preview_theme',dark?'dark':'light')}catch(_){}};
 try{document.documentElement.dataset.theme=localStorage.getItem('duoduo_boss_preview_theme')||localStorage.getItem('duoduo_theme')||'light'}catch(_){document.documentElement.dataset.theme='light'};
 function drawEditorList(){const q=$('searchEntries').value.trim().toLocaleLowerCase();const visible=entries.filter(x=>[x.title,x.author,bosses.find(b=>b.id===x.bossId)?.name].some(s=>String(s||'').toLocaleLowerCase().includes(q)));
  $('entryList').innerHTML=visible.map(x=>'<button class="entry-btn '+(editId===x.id?'selected':'')+'" type="button" data-entry="'+esc(x.id)+'"><strong>'+esc(x.title||'未命名攻略')+'</strong><small>'+esc(bosses.find(b=>b.id===x.bossId)?.name||'未知 BOSS')+' · '+({article:'圖文',video:'影片',note:'機制筆記'}[x.type])+(x.approved?' · ✓ 已核對':' · 待核對')+'</small></button>').join('')||'<div class="empty">沒有條目。</div>';
 }
 $('editToggle').onclick=()=>{const p=$('editorPanel');p.hidden=!p.hidden;if(!p.hidden){drawEditorList();p.scrollIntoView({block:'start',behavior:'smooth'})}};
 $('searchEntries').oninput=drawEditorList;
 function beginEdit(x){editId=x.id;for(const k of FIELDS){const field=$(k==='bossId'?'fBoss':'f'+k[0].toUpperCase()+k.slice(1));if(!field)continue;field.type==='checkbox'?field.checked=Boolean(x[k]):field.value=x[k]??''} $('editorForm').hidden=false;$('editorHint').hidden=true;drawEditorList()}
 $('entryList').onclick=e=>{const b=e.target.closest('[data-entry]');if(!b)return;const row=entries.find(x=>x.id===b.dataset.entry);if(row)beginEdit(row)};
 $('newEntry').onclick=()=>beginEdit({id:'private-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),bossId:currentBoss()?.id||'',type:'article',title:'',author:'',url:'',difficulty:'',stage:'',summary:'',content:'',image:'',approved:false,origin:'管理員新增'});
 $('cancelEdit').onclick=()=>{editId='';$('editorForm').hidden=true;$('editorHint').hidden=false;drawEditorList()};
 $('editorForm').addEventListener('submit',e=>{
  e.preventDefault();const item={id:editId,origin:'管理員本機草稿'};
  // Explicit, stable field mapping avoids accidental field-name capitalization mismatch.
  Object.assign(item,{bossId:$('fBoss').value,type:$('fType').value,title:$('fTitle').value.trim(),author:$('fAuthor').value.trim(),url:$('fUrl').value.trim(),difficulty:$('fDifficulty').value.trim(),stage:$('fStage').value.trim(),summary:$('fSummary').value.trim(),content:$('fContent').value.trim(),image:$('fImage').value.trim(),approved:$('fApproved').checked});
  if(!item.title)return alert('請輸入攻略標題');
  if(!bosses.some(b=>b.id===item.bossId))return alert('請選擇有效 BOSS');
  if(item.type!=='note'&&!safeUrl(item.url))return alert('圖文與影片請輸入有效的 HTTPS 來源網址');
  if(item.type==='video'&&!youtubeId(item.url))return alert('影片目前僅支援有效的 YouTube 網址');
  if(item.image&&!safeImg(item.image))return alert('圖片僅接受安全的 HTTPS URL 或站內 assets/ 路徑');
  const position=entries.findIndex(x=>x.id===editId);if(position>=0)entries[position]=item;else entries.unshift(item);
  try{saveDraft()}catch(_){alert('瀏覽器儲存空間已滿，請先匯出 JSON 備份');return}
  drawAll();beginEdit(item);$('editorHint').hidden=false;$('editorHint').textContent='✅ 已保存為本機測試草稿；沒有同步到雲端。請記得匯出 JSON 備份。';
 });
 $('deleteEntry').onclick=()=>{if(!editId||!entries.some(x=>x.id===editId))return;if(!confirm('確定刪除此草稿條目？'))return;entries=entries.filter(x=>x.id!==editId);saveDraft();$('cancelEdit').click();drawAll()};
 $('exportJson').onclick=()=>{const blob=new Blob([JSON.stringify({schema:1,entries,updatedAt:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='多多谷_BOSS攻略_私人草稿備份.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2500)};
 $('importJson').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>2*1024*1024)throw Error('備份檔不得超過 2 MB');const j=JSON.parse(await f.text());if(j.schema!==1||!Array.isArray(j.entries)||j.entries.length>500||!j.entries.every(validEntry))throw Error('JSON 備份格式不符');if(!confirm('匯入會取代這台瀏覽器的全部私人草稿，確定嗎？'))return;const next=j.entries.map(x=>({id:String(x.id).slice(0,100),bossId:String(x.bossId).slice(0,90),type:x.type,title:String(x.title||'').slice(0,180),author:String(x.author||'').slice(0,120),url:String(x.url||'').slice(0,600),difficulty:String(x.difficulty||'').slice(0,100),stage:String(x.stage||'').slice(0,100),summary:String(x.summary||'').slice(0,1000),content:String(x.content||'').slice(0,12000),image:String(x.image||'').slice(0,700),approved:Boolean(x.approved),origin:'匯入私人草稿'}));localStorage.setItem(DRAFT,JSON.stringify({schema:1,entries:next}));entries=next;editId='';$('editorForm').hidden=true;drawAll();$('editorHint').textContent='✅ 已匯入私人草稿';}catch(err){alert(err.message||'匯入失敗')}finally{e.target.value=''}};
 openApp();
})();
