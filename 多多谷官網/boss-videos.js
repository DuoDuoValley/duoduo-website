/* Independent BOSS Video Guides; readonly reader, media lazy loaded on click. */
(()=>{'use strict';
const root=document.getElementById('ddBossVideos');if(!root)return;
const api=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validId=s=>/^[A-Za-z0-9_-]{11}$/.test(String(s||''));
const order=['高階','終極'];
let bosses=[],videos=[],search='',group='全部',selected='',sort='recommended';
const urlParams=new URLSearchParams(location.search);
const queriedBoss=urlParams.get('boss')||'';
root.innerHTML='<p class="vg-intro">精選高階與終極 BOSS 的機制教學、實戰紀錄與挑戰技巧。所有影片均來自原作者，點擊後才載入 YouTube 播放器。</p>'+
'<div class="vg-toolbar"><label>搜尋 BOSS 或影片<input id="vg-search" type="search" placeholder="例如：黑魔法師、卡洛斯"></label><label>難度分類<select id="vg-group"><option>全部</option><option>高階</option><option>終極</option></select></label><label>選擇 BOSS<select id="vg-boss"><option value="">全部 BOSS</option></select></label><label>排序<select id="vg-sort"><option value="recommended">精選推薦</option><option value="views">觀看數高到低</option><option value="likes">按讚數高到低</option><option value="latest">影片較新優先</option></select></label></div><p id="vg-count" class="vg-count"></p><div id="vg-list" class="vg-grid" aria-live="polite"></div><p class="vg-alert">提醒：本站收錄外部創作者的攻略影片，可能與多多谷 V282 的 BOSS 機制、血量與難度有所不同，實際以遊戲內設定為準。觀看與按讚數僅為收錄當時的快照，不代表即時排行榜。</p>';
const el=id=>root.querySelector('#'+id);
function renderBossOptions(){
 const options=bosses.filter(b=>b.published!==false&&order.includes(b.group)&&(!group||group==='全部'||b.group===group));
 el('vg-boss').innerHTML='<option value="">全部 BOSS</option>'+options.map(b=>'<option value="'+E(b.id)+'">'+E(b.name)+'</option>').join('');
 if(!options.some(b=>b.id===selected))selected='';
 el('vg-boss').value=selected;
}
function draw(){
 let rows=videos.filter(v=>v.enabled===true&&validId(v.videoId)).map((v,i)=>({...v,index:i,boss:bosses.find(b=>b.id===v.bossId)})).filter(v=>v.boss?.published!==false&&order.includes(v.boss?.group));
 if(group!=='全部')rows=rows.filter(v=>v.boss.group===group);
 if(selected)rows=rows.filter(v=>v.boss.id===selected);
 if(search){const q=search.toLocaleLowerCase();rows=rows.filter(v=>[v.title,v.author,v.boss.name,v.description,v.kind,v.difficulty].some(x=>String(x||'').toLocaleLowerCase().includes(q)))}
 if(sort==='views')rows.sort((a,b)=>(Number(b.views)||0)-(Number(a.views)||0));
 if(sort==='likes')rows.sort((a,b)=>(Number(b.likes)||0)-(Number(a.likes)||0));
 if(sort==='latest')rows.sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''));
 el('vg-count').textContent='共 '+rows.length+' 部影片 · '+new Set(rows.map(v=>v.boss.id)).size+' 隻 BOSS';
 el('vg-list').innerHTML=rows.length?rows.map(v=>{
 const url='https://www.youtube.com/watch?v='+encodeURIComponent(v.videoId),image=E(v.boss.image);
 return '<article class="vg-card" data-video="'+E(v.videoId)+'"><div class="vg-poster"><img src="'+image+'" alt="'+E(v.boss.name)+'" loading="lazy"></div><div class="vg-content"><div class="vg-overline">'+E(v.boss.name)+' <span class="vg-tag">'+E(v.boss.group)+'</span><span class="vg-tag">'+E(v.kind||'實戰影片')+'</span></div><h3 class="vg-title">'+E(v.title)+'</h3><div class="vg-author">作者：'+E(v.author||'原影片作者')+' · '+E(v.difficulty||'未標註難度')+'</div><p class="vg-description">'+E(v.description||'請以實際遊戲機制為準。')+'</p><div class="vg-meta">'+(Number.isFinite(v.views)?'觀看 '+Number(v.views).toLocaleString('zh-TW')+' 次':'觀看數待確認')+(Number.isFinite(v.likes)?' · 👍 '+Number(v.likes).toLocaleString('zh-TW'):'')+(v.publishedAt?' · '+E(v.publishedAt):'')+'</div><div class="vg-actions"><button class="vg-btn vg-btn-primary" type="button" data-play="'+E(v.videoId)+'">▶ 播放影片</button><a class="vg-btn" href="'+url+'" target="_blank" rel="noopener noreferrer">開啟原始影片 ↗</a></div></div></article>';
 }).join(''):'<div class="vg-empty">目前尚無符合條件且已審核公開的影片。可以稍後再來看看！</div>';
}
el('vg-search').oninput=e=>{search=e.target.value.trim();draw()};
el('vg-group').onchange=e=>{group=e.target.value;renderBossOptions();draw()};
el('vg-boss').onchange=e=>{selected=e.target.value;draw()};
el('vg-sort').onchange=e=>{sort=e.target.value;draw()};
el('vg-list').addEventListener('click',e=>{
 const button=e.target.closest('[data-play]');if(!button)return;
 const id=button.dataset.play;if(!validId(id))return;
 const card=button.closest('.vg-card');
 // Never insert untrusted HTML into the iframe URL.
 const container=document.createElement('div');container.className='vg-player';
 const iframe=document.createElement('iframe');
 iframe.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1';
 iframe.title='YouTube 攻略影片';iframe.loading='lazy';iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.allowFullscreen=true;
 container.appendChild(iframe);card.appendChild(container);button.remove();
});
async function start(){
 try{
  const [r,d]=await Promise.all([fetch('boss-atlas-data.json',{cache:'no-store'}),fetch('boss-videos-data.json',{cache:'no-store'})]);
  if(!r.ok||!d.ok)throw Error('預設資料載入失敗');
  const atlas=await r.json(),guides=await d.json();
  bosses=atlas.bosses||[];videos=guides.videos||[];
  // Cloud content is optional; a failed cloud fetch must not hide the static page.
  try{
   const cloud=await fetch(api+'/api/site-data',{cache:'no-store'});if(cloud.ok){
    const payload=await cloud.json(),data=payload?.data;
    if(Array.isArray(data?.duoduo_boss_atlas?.bosses))bosses=data.duoduo_boss_atlas.bosses;
    if(data?.duoduo_boss_videos?.schema===1&&Array.isArray(data.duoduo_boss_videos.videos))videos=data.duoduo_boss_videos.videos;
   }
  }catch(err){console.warn('BOSS 影片暫時使用預設資料',err)}
  if(bosses.some(b=>b.id===queriedBoss)){selected=queriedBoss;group=bosses.find(b=>b.id===selected)?.group||'全部';el('vg-group').value=group}
  renderBossOptions();draw();
 }catch(err){el('vg-list').textContent='影片清單暫時無法載入，請稍後重試。';console.warn(err)}
}
start();
})();