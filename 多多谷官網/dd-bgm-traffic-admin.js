/* Admin-only BGM telemetry: source-separated song leaderboard and live listeners. */
(()=>{'use strict';
 const root=document.getElementById('ddBgmTrafficOverview');if(!root)return;
 const api=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
 const status=root.querySelector('[data-bgm-status]');
 const buttons=[...root.querySelectorAll('[data-bgm-source]')];
 const refreshButton=root.querySelector('[data-bgm-refresh]');
 const table=root.querySelector('[data-bgm-tracks]');
 const values=Object.fromEntries(['liveListeners','todayListeners','todayPlays','totalPlays'].map(k=>[k,root.querySelector('[data-bgm-value="'+k+'"]')]));
 const fmt=new Intl.NumberFormat('zh-TW');
 let source='website',busy=false,lastSuccess=0,previousSource='';
 const canRead=()=>{
   if(document.getElementById('duoduo-admin-auth'))return false;
   try{return Boolean(sessionStorage.getItem('duoduo_admin_session'))}catch(_){return false}
 };
 const number=n=>Number.isSafeInteger(n)&&n>=0?fmt.format(n):'—';
 const clear=()=>{
   for(const el of Object.values(values))el.textContent='—';
   table.replaceChildren();
 };
 function renderTracks(tracks){
   table.replaceChildren();
   if(!Array.isArray(tracks)||tracks.length===0){
     const cell=document.createElement('div');
     cell.className='dd-bgm-empty';cell.textContent='尚無有效歌曲播放紀錄。';
     table.append(cell);return;
   }
   const head=document.createElement('div');head.className='dd-bgm-song-row dd-bgm-song-header';
   for(const label of ['歌曲名稱','今日播放','累計播放']){
     const c=document.createElement('span');c.textContent=label;head.append(c);
   }
   table.append(head);
   for(const track of tracks){
     const row=document.createElement('div');row.className='dd-bgm-song-row';
     const name=document.createElement('strong');name.textContent=String(track.title||track.id||'未知歌曲').slice(0,80);
     name.title=String(track.id||'');
     const daily=document.createElement('span');daily.textContent=number(track.today);
     const total=document.createElement('span');total.textContent=number(track.total);
     row.append(name,daily,total);table.append(row);
   }
 }
 async function refresh(force=false){
   if(!canRead()||busy)return;
   if(!force&&source===previousSource&&Date.now()-lastSuccess<30000)return;
   busy=true;refreshButton.disabled=true;status.textContent='正在讀取 BGM 統計…';
   const requested=source;
   try{
     const token=sessionStorage.getItem('duoduo_admin_session');
     const res=await fetch(api+'/api/bgm-traffic/summary?source='+requested+'&ts='+Date.now(),
       {cache:'no-store',headers:{Authorization:'Bearer '+token}});
     const payload=await res.json().catch(()=>({}));
     if(!res.ok||payload.ok!==true||payload.source!==requested)throw Error(payload.error||'HTTP '+res.status);
     for(const [key,node] of Object.entries(values))node.textContent=number(payload[key]);
     renderTracks(payload.tracks);
     previousSource=requested;lastSuccess=Date.now();
     status.textContent='統計正常 · 近 90 秒內有播放心跳 · 台灣時間 UTC+8'+
       (payload.limited?' · 數據量較大，已顯示部分歌曲':'');
   }catch(e){
     clear();
     status.textContent='無法讀取 BGM 統計：'+String(e.message||e);
   }finally{busy=false;refreshButton.disabled=false}
 }
 for(const btn of buttons)btn.addEventListener('click',()=>{
   const next=btn.dataset.bgmSource;if(next!=='website'&&next!=='checklist')return;
   source=next;
   for(const b of buttons)b.setAttribute('aria-pressed',String(b===btn));
   clear();lastSuccess=0;void refresh(true);
 });
 refreshButton.addEventListener('click',()=>{lastSuccess=0;void refresh(true)});
 document.addEventListener('visibilitychange',()=>{
   if(document.visibilityState==='visible'&&root.closest('.panel')?.classList.contains('active'))void refresh();
 });
 window.addEventListener('duoduo-admin-authenticated',()=>void refresh(true));
 setInterval(()=>{if(root.closest('.panel')?.classList.contains('active')&&document.visibilityState!=='hidden')void refresh()},30000);
 if(canRead())void refresh(true);
})();