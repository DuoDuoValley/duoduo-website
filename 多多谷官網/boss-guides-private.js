/* 多多谷正式 BOSS 圖文與影片攻略頁。
 * 本頁不需要登入，不會寫入 BOSS 圖鑑或其他正式資料。
 * 注意：GitHub Pages 靜態網址可被任何知道連結的人開啟。
 * 所有編輯功能已移至既有管理後台；此頁僅唯讀展示。
 */
(()=>{'use strict';
 const API=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
 const DATA_KEY='duoduo_boss_guides';
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const plain=s=>String(s??'').trim();
 const youtubeId=s=>{try{const u=new URL(s);const host=u.hostname.replace(/^www\./,'');if(host==='youtu.be')return /^[\w-]{11}$/.test(u.pathname.slice(1))?u.pathname.slice(1):'';if(host==='youtube.com'||host==='m.youtube.com'||host==='youtube-nocookie.com'){const value=u.searchParams.get('v')||(u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)||[])[1]||'';return /^[\w-]{11}$/.test(value)?value:''}}catch(_){}return ''};
 const safeUrl=v=>{try{const u=new URL(plain(v),location.href);return u.protocol==='https:'?u.href:''}catch(_){return ''}};
 const safeImg=v=>{const s=plain(v);if(/^assets\/[\w./%()\-]+$/i.test(s)&&!s.includes('..'))return s;return safeUrl(s)};
 // Fetch original YouTube title + channel name only for placeholder entries.
 // Does NOT modify site data, the administrator's cloud records, or version approvals.
 const officialVideoMeta=new Map();
 const genericArticleTitle=t=>/^[^｜]+｜圖文攻略(?:\s*\d+)?$/.test(String(t||'').trim());
 const sourceKey=v=>{try{const u=new URL(String(v||''));return u.origin+u.pathname+'?'+[...u.searchParams].filter(([k])=>['bsn','snA','sn'].includes(k)).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k+'='+v).join('&')}catch{return ''}};
 const applyVerifiedArticleTitles=(target,reference)=>{
   const official=new Map(reference.filter(x=>x.type==='article'&&!genericArticleTitle(x.title)&&sourceKey(x.url)).map(x=>[sourceKey(x.url),x.title]));
   let count=0;
   for(const x of target){if(x.type!=='article'||!genericArticleTitle(x.title))continue;const name=official.get(sourceKey(x.url));if(name){x.title=name;count++}}
   return count;
 };
 const placeholderTitle=x=>/^[^｜]+｜影片攻略(?:\s*\d+)?$/.test(plain(x.title));
 const placeholderAuthor=x=>!plain(x.author)||/^(?:原作者待核對|作者待核對|未填作者)$/.test(plain(x.author));
 const needsOfficialMeta=x=>x?.type==='video'&&(placeholderTitle(x)||placeholderAuthor(x));
 const getOfficialMeta=id=>{
   if(officialVideoMeta.has(id))return officialVideoMeta.get(id);
   const url='https://www.youtube.com/oembed?format=json&url='+encodeURIComponent('https://www.youtube.com/watch?v='+id);
   const promise=fetch(url,{credentials:'omit',referrerPolicy:'no-referrer'}).then(r=>r.ok?r.json():null).then(v=>{
     if(!v||v.provider_name!=='YouTube')return null;
     const title=plain(v.title),author=plain(v.author_name);
     return title.length>0&&title.length<=180&&author.length>0&&author.length<=120?{title,author}:null;
   }).catch(()=>null);
   officialVideoMeta.set(id,promise);return promise;
 };
 function fillVisibleOfficialMeta(){
   if(currentTab!=='video')return;
   for(const x of byBoss(current,'video').filter(needsOfficialMeta)){
     const id=youtubeId(x.url);if(!id)continue;
     getOfficialMeta(id).then(meta=>{
       if(!meta||currentTab!=='video'||x.bossId!==current)return;
       const box=[...$('guideBody').querySelectorAll('[data-guide-entry]')].find(el=>el.dataset.guideEntry===x.id);
       if(!box)return;
       const title=box.querySelector('.guide-original-title'),author=box.querySelector('.guide-original-author');
       if(placeholderTitle(x)){x.title=meta.title;if(title)title.textContent=meta.title}
       if(placeholderAuthor(x)){x.author=meta.author;if(author)author.textContent=meta.author}
       // Update an already-playing floating player title without recreating
       // the iframe (which would interrupt the video).
       if(typeof playingId!=='undefined'&&playingId===id&&playerTitle&&!floatingPlayer.hidden)playerTitle.textContent=x.title;
       // When embedded in the official site, the persistent parent dock owns the playing iframe.
       try{if(window.parent!==window)window.parent.DuoDuoPersistentVideo?.metadataFromGuide(window,id,x.title)}catch(_){}
     });
   }
 }

 let bosses=[],entries=[],current='',currentTab='article',group='全部',guideVisibility={};
 const isGuideBossVisible=b=>guideVisibility[b.id]===true||(guideVisibility[b.id]!==false&&b.published!==false);
 async function readJson(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('無法讀取 '+url);return r.json()}
 // Wait until the visible detail and its primary layout have painted.
 // The same offset as a manual BOSS selection keeps the heading and tabs visible.
 function scrollToSharedBoss(){
   let cancelled=false;
   const interrupt=()=>{cancelled=true};
   const signals=['wheel','touchstart','pointerdown','keydown'];
   for(const name of signals)window.addEventListener(name,interrupt,{once:true,passive:true});
   const cleanup=()=>{for(const name of signals)window.removeEventListener(name,interrupt)};
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
     setTimeout(()=>{
       cleanup();
       if(cancelled)return;
       const detail=$('detail');
       if(!detail||detail.hidden||!detail.getClientRects().length)return;
       const offset=window.innerWidth<=650?100:154;
       window.scrollTo({top:Math.max(0,window.scrollY+detail.getBoundingClientRect().top-offset),behavior:'instant'});
     },100);
   }));
 }
 async function openApp(){
   // The tested static JSON is the safe fallback until a matching admin cloud
   // publication exists. A visitor's old localStorage draft NEVER overrides it.
   try{
     const [guideData,atlas]=await Promise.all([readJson('boss-guides-data.json'),readJson('boss-atlas-data.json')]);
     if(guideData?.schema!==1||!Array.isArray(guideData.entries))throw Error('攻略清單資料格式不符');
     entries=guideData.entries.filter(validEntry);
     bosses=(atlas?.bosses||[]).filter(x=>['高階','終極'].includes(x.group));
     guideVisibility=guideData.bossVisibility&&typeof guideData.bossVisibility==='object'&&!Array.isArray(guideData.bossVisibility)?guideData.bossVisibility:{};
     try{
       const cloud=await readJson(API+'/api/site-data');
       const atlasCloud=cloud?.data?.duoduo_boss_atlas?.bosses;
       if(Array.isArray(atlasCloud))bosses=atlasCloud.filter(x=>['高階','終極'].includes(x.group));
       const published=cloud?.data?.[DATA_KEY];
       if(published?.schema===1&&Array.isArray(published.entries)){
         // Cloud edits are intentionally authoritative after first publication.
         entries=published.entries.filter(validEntry);
         applyVerifiedArticleTitles(entries,guideData.entries);
         guideVisibility=published.bossVisibility&&typeof published.bossVisibility==='object'&&!Array.isArray(published.bossVisibility)?published.bossVisibility:{};
       }
     }catch(e){console.warn('暫時使用靜態 BOSS 攻略與圖鑑資料',e)}
     bosses=bosses.filter(isGuideBossVisible);
     const params=new URLSearchParams(location.search);
     const sharedBoss=bosses.find(x=>x.id===params.get('boss'));
     current=sharedBoss?.id||bosses[0]?.id||'';
     currentTab=params.get('tab')==='video'?'video':'article';
     drawAll();$('privateApp').hidden=false;
     // Share links land at the selected BOSS, not at the catalog or footer.
     // Only explicit, visible BOSS IDs trigger this once on initial load.
     // Keep generic visits at the top, and preserve manual selection scrolling.
     if(sharedBoss)scrollToSharedBoss();
   }catch(err){$('privateApp').hidden=false;const message=document.querySelector('.guide-hero-description');if(message)message.textContent='攻略資料暫時無法載入，請稍後重新整理。（'+(err.message||'未知錯誤')+'）';console.error(err)}
 }
 function validEntry(v){return v&&typeof v==='object'&&typeof v.id==='string'&&['article','video'].includes(v.type)&&typeof v.bossId==='string'&&v.enabled!==false}

 function byBoss(id,type){return entries.filter(x=>x.bossId===id&&x.type===type&&x.enabled!==false).sort((a,b)=>Number(a.order||9999)-Number(b.order||9999))}
 function currentBoss(){return bosses.find(x=>x.id===current)||bosses[0]}

 function drawAll(){const total=entries.filter(x=>bosses.some(b=>b.id===x.bossId));$('bossStats').textContent=bosses.length+' 隻 BOSS';$('articleStats').textContent=total.filter(x=>x.type==='article').length+' 篇圖文攻略';$('videoStats').textContent=total.filter(x=>x.type==='video').length+' 部影片攻略';drawBossGrid();drawDetail();}
 function drawBossGrid(){
   const q=$('searchBoss').value.trim().toLocaleLowerCase();
   const visible=bosses.filter(b=>(group==='全部'||b.group===group)&&b.name.toLocaleLowerCase().includes(q));
   $('countLabel').textContent=visible.length+'／'+bosses.length+' 隻';
   const card=b=>{
     const image=safeImg(b.image)||('assets/boss-atlas/bosses/'+b.id+'.png');
     // Keep the original full BOSS artwork in this picker. Only the detail header uses square icon.
     return '<button type="button" class="bossbtn '+(current===b.id?'active':'')+'" data-boss="'+esc(b.id)+'" aria-pressed="'+(current===b.id)+'"><div class="boss-art"><span class="fallback" aria-hidden="true">⚔</span><img loading="lazy" src="'+esc(image)+'" alt="" onerror="this.hidden=true"></div><div class="boss-text"><strong>'+esc(b.name)+'</strong><span class="boss-metrics"><span class="badge '+(byBoss(b.id,'article').length?'verified':'')+'">📖 '+(byBoss(b.id,'article').length||'待收錄')+'</span><span class="badge '+(byBoss(b.id,'video').length?'verified':'')+'">▶ '+(byBoss(b.id,'video').length||'待收錄')+'</span></span></div></button>';
   };
   const sections=['高階','終極'].map(tier=>{
     const rows=visible.filter(b=>b.group===tier);
     if(!rows.length)return '';
     return '<section class="boss-tier" aria-label="'+tier+' BOSS"><div class="boss-tier-head"><h3>'+tier+' BOSS</h3><span>'+rows.length+' 隻</span></div><div class="boss-grid">'+rows.map(card).join('')+'</div></section>';
   }).join('');
   $('bossGrid').innerHTML=sections||'<div class="empty">找不到符合條件的 BOSS。</div>';
 }

 function renderItem(x){
   const link=safeUrl(x.url),video=x.type==='video'?youtubeId(x.url):'',image=safeImg(x.image);
   const badge=x.approved?'<span class="badge verified">✓ 已人工核對</span>':'<span class="badge">外部攻略</span>';
   const boss=bosses.find(b=>b.id===x.bossId);
   const bossImage=boss?(safeImg(boss.image)||('assets/boss-atlas/bosses/'+boss.id+'.png')):'';
   // Use the source site's own brand asset for uncatalogued Bahamut article covers.
   // It identifies an EXTERNAL SOURCE; it never suggests Bahamut has endorsed this guide.
   let isBahaArticle=false;
   try{
     const host=new URL(link).hostname.toLowerCase();
     isBahaArticle=x.type==='article'&&(host==='gamer.com.tw'||host.endsWith('.gamer.com.tw'));
   }catch(_){}
   const bahaLogo='https://www.oneup.com.tw/cis/download/Brand_logo1.png';
   const photo=(x.type==='video'&&video)?'https://i.ytimg.com/vi/'+video+'/hqdefault.jpg':(isBahaArticle?bahaLogo:(image||bossImage));
   const imageLabel=x.type==='video'?'YouTube 影片縮圖':(isBahaArticle?'巴哈姆特（文章來源）':image?'攻略封面（自行提供）':'BOSS 形象圖（非原文截圖）');
   const playableThumb=x.type==='video'&&Boolean(video);
   const articleThumb=x.type==='article'&&Boolean(link);
   const thumb=(x.type==='article'||x.type==='video')?'<'+(playableThumb?'button type="button" data-play="'+esc(video)+'" data-entry="'+esc(x.id)+'" aria-label="播放 '+esc(x.title||'BOSS 攻略影片')+'"':articleThumb?'a href="'+esc(link)+'" target="_blank" rel="noopener noreferrer" aria-label="查看原作者文章：'+esc(x.title||'圖文攻略')+'"':'div')+' class="guide-thumb '+(x.type==='video'?'guide-thumb-video':'guide-thumb-article')+(isBahaArticle?' guide-thumb-bahamut':'')+'">'+
    (photo?'<img loading="lazy" src="'+esc(photo)+'" alt="'+esc(imageLabel)+'" onload="this.parentNode.classList.add(\'logo-loaded\')" onerror="this.hidden=true;this.parentNode.classList.add(\'guide-thumb-missing\')">':'')+
    '<span class="guide-thumb-fallback" aria-hidden="true">'+(isBahaArticle?'<span class="baha-wordmark"><span class="baha-mark" aria-hidden="true">◆</span>巴哈姆特</span>':x.type==='video'?'▶':'📖')+'</span><span class="guide-thumb-tag">'+esc(imageLabel)+'</span></'+(playableThumb?'button':articleThumb?'a':'div')+'>':'';
   return '<article data-guide-entry="'+esc(x.id)+'" class="item '+(thumb?'guide-has-thumb':'')+'">'+thumb+'<div class="guide-item-body"><div class="meta">'+(x.stage||x.difficulty?'<span class="badge">'+esc(x.stage||x.difficulty)+'</span>':'')+badge+'</div><h3 class="guide-original-title">'+esc(x.title||'未命名攻略')+'</h3><div class="by"><span class="guide-original-author">'+esc(x.author||'未填作者')+'</span>'+(x.type==='video'&&/^\d{4}-\d{2}-\d{2}$/.test(String(x.publishedDate||''))?'<span class="guide-video-date"> · 發布於 '+esc(x.publishedDate)+'</span>':'')+'</div>' + '<div class="buttons">'+(link?'<a href="'+esc(link)+'" target="_blank" rel="noopener noreferrer" class="secondary">'+(x.type==='video'?'前往 YouTube 原影片 ↗':'查看原作者文章 ↗')+'</a>':'')+(video?'<button type="button" data-play="'+esc(video)+'" data-entry="'+esc(x.id)+'">▶ 播放影片</button>':'')+'</div></div></article>';
 }
 function drawDetail(){
  const b=currentBoss();if(!b){$('guideBody').innerHTML='<div class="empty">沒有可公開的高階或終極 BOSS。</div>';return}
  $('bossName').textContent=b.name;
  $('bossGroup').textContent=b.group+' BOSS';
  const portrait=$('bossHeadPortrait');
  // Use the exact square icon from the existing 個人傷害反推 BOSS picker.
  // Keep the left BOSS selection gallery (large portrait artwork) unchanged.
  const portraitUrl='assets/boss-atlas/inverse-ui/'+encodeURIComponent(b.name)+'.png';
  if(portrait){
    portrait.hidden=false;
    portrait.alt=b.name+' 頭像';
    portrait.onerror=()=>{
      portrait.onerror=null;
      portrait.src=safeImg(b.image)||('assets/boss-atlas/bosses/'+b.id+'.png');
    };
    portrait.src=portraitUrl;
  }
  const allowedDifficulties=new Set(['簡單','普通','困難','混沌','終極']);
  const difficultyNames=[...new Set((Array.isArray(b.difficulties)?b.difficulties:[])
    .map(d=>String(d?.name||'')) .filter(n=>allowedDifficulties.has(n)))];
  $('bossDifficulties').innerHTML=difficultyNames.map(n=>'<img src="assets/boss-atlas/difficulties/'+encodeURIComponent(n)+'.png" alt="'+esc(n)+'" title="'+esc(n)+'" loading="lazy">').join('');
  $('bossDifficulties').setAttribute('aria-label','可挑戰難度：'+difficultyNames.join('、'));

  const counts={article:byBoss(b.id,'article').length,video:byBoss(b.id,'video').length};
  $('articleCount').textContent='('+counts.article+')';$('videoCount').textContent='('+counts.video+')';
  for(const type of ['Article','Video']){const is=(currentTab==={Article:'article',Video:'video'}[type]);const t=$('tab'+type);t.classList.toggle('active',is);t.setAttribute('aria-selected',String(is))}
  let list=byBoss(b.id,currentTab);const kindName={article:'圖文攻略',video:'影片攻略'}[currentTab];
  $('guideBody').innerHTML='<div class="sectionline"><h2>'+kindName+'</h2><span>請依原作者攻略及目前遊戲版本核對機制</span></div>'+
  (list.length?'<div class="items">'+list.map(renderItem).join('')+'</div>':'<div class="empty">這隻 BOSS 的'+kindName+'目前尚未收錄。<br>後續將由官網管理後台新增攻略。</div>');
  if(currentTab==='video')queueMicrotask(fillVisibleOfficialMeta);
 }
 const updateShareUrl=()=>{const u=new URL(location.href);u.searchParams.set('boss',current);u.searchParams.set('tab',currentTab);if(u.href!==location.href)history.pushState({boss:current,tab:currentTab},'',u)};
 window.addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);current=bosses.find(b=>b.id===p.get('boss'))?.id||bosses[0]?.id||'';currentTab=p.get('tab')==='video'?'video':'article';drawBossGrid();drawDetail()});
 $('bossGrid').addEventListener('click',e=>{const target=e.target.closest('[data-boss]');if(!target)return;current=target.dataset.boss;currentTab='article';updateShareUrl();drawBossGrid();drawDetail();window.scrollTo({top:Math.max(0,window.scrollY+$('detail').getBoundingClientRect().top-(window.innerWidth<=650?100:154)),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})});
 $('backToBoss').onclick=()=>{$('bossCatalog').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});};
 $('searchBoss').addEventListener('input',drawBossGrid);
 $('groupControls').addEventListener('click',e=>{const button=e.target.closest('[data-group]');if(!button)return;group=button.dataset.group;for(const b of $('groupControls').querySelectorAll('button'))b.classList.toggle('active',b===button);drawBossGrid()});
 $('tabArticle').onclick=()=>{if(currentTab==='article')return;currentTab='article';updateShareUrl();drawDetail()};$('tabVideo').onclick=()=>{if(currentTab==='video')return;currentTab='video';updateShareUrl();drawDetail()};
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
   // Keep the same iframe alive when moving between official site categories.
   // Standalone BOSS guide URLs retain their existing local floating player.
   try{
     if(window.parent!==window&&window.parent.DuoDuoPersistentVideo?.playFromGuide(window,id,entry?.title||'BOSS 攻略影片')===true)return;
   }catch(_){/* Standalone or external embedding: use the local player below. */}
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
   // Start NEW videos at normal player size. Only the viewer may switch to mini.
   // Re-selecting the SAME video preserves both the current size and playback iframe.
   if(!isSame)floatingPlayer.classList.add('dd-player-expanded');
   playerToggle.textContent=floatingPlayer.classList.contains('dd-player-expanded')?'↙ 縮成迷你視窗':'⤢ 放大播放';
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
   playerToggle.textContent=expanded?'↙ 縮成迷你視窗':'⤢ 放大播放';
   playerToggle.setAttribute('aria-expanded',String(expanded));
 };
 $('ddPlayerClose').onclick=()=>{
   floatingPlayer.hidden=true;floatingPlayer.classList.remove('dd-player-expanded');
   // Closing is an intentional stop. Switching tabs or BOSS never reaches this path.
   playerFrame.replaceChildren();playingId='';
   playerToggle.textContent='⤢ 放大播放';playerToggle.setAttribute('aria-expanded','false');
 };
 document.addEventListener('keydown',e=>{
   if(e.key==='Escape'&&!floatingPlayer.hidden&&floatingPlayer.classList.contains('dd-player-expanded'))playerToggle.click();
 });
 $('copyUrl').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('copyUrl').textContent='已複製';setTimeout(()=>$('copyUrl').textContent='複製此 BOSS 網址',1700)}catch(_){$('copyUrl').textContent='複製失敗'}};
 // Share the official light/dark choice across the whole DuoDuo website.
 const updateThemeButton=()=>{
   const light=document.documentElement.dataset.theme!=='dark';
   $('themeIcon').textContent=light?'☾':'☼';
   $('themeLabel').textContent=light?'深色模式':'淺色模式';
   $('themeToggle').title=light?'切換深色模式':'切換淺色模式';
   $('themeToggle').setAttribute('aria-pressed',String(!light));
 };
 $('themeToggle').onclick=()=>{
   const dark=document.documentElement.dataset.theme!=='dark';
   document.documentElement.dataset.theme=dark?'dark':'light';
   try{localStorage.setItem('duoduo_theme',dark?'dark':'light')}catch(_){}
   updateThemeButton();
 };
 updateThemeButton();
 openApp();
})();
