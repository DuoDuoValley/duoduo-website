/* DuoDuo BGM listener tracking. Never changes the music element or playback. */
(()=>{'use strict';
 if(window.__duoduoBgmTelemetry)return;window.__duoduoBgmTelemetry=true;
 const embedded=document.documentElement.classList.contains('dd-bgm-embed');
 if(window.top!==window&&!embedded)return; // Only the official player, including the Checklist embed.
 const source=embedded?'checklist':'website';
 const audio=document.getElementById('music');
 const select=document.getElementById('trackList');
 if(!audio||!select)return;
 const endpoint=location.hostname.endsWith('github.io')?
   'https://duoduo-website.onrender.com/api/bgm-traffic/record':'/api/bgm-traffic/record';
 const hex=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),v=>v.toString(16).padStart(2,'0')).join('');
 function identifier(key,storage){
   try{
     let value=storage.getItem(key);
     if(!/^[a-f0-9]{32}$/i.test(value||'')){value=hex();storage.setItem(key,value)}
     return value;
   }catch(_){return hex()}
 }
 const listenerId=identifier('duoduo_anonymous_visitor_v1',localStorage);
 const sessionId=identifier('duoduo_bgm_metric_session_'+source,sessionStorage);
 let cycle=null,lastHeartbeat=0;
 const track=()=>String(select.value||'');
 const title=()=>String(document.getElementById('trackName')?.textContent||'').slice(0,80);
 const validTrack=id=>/^[a-z0-9_-]{1,80}$/i.test(id);
 function post(kind,playId){
   const trackId=track();
   if(!validTrack(trackId)||!navigator.onLine)return;
   const payload={kind,source,trackId,trackTitle:title(),listenerId,sessionId};
   if(playId)payload.playId=playId;
   try{
     fetch(endpoint,{method:'POST',mode:'cors',headers:{'Content-Type':'application/json'},
       body:JSON.stringify(payload),cache:'no-store',keepalive:true}).catch(()=>{});
   }catch(_){/* Playback never waits for statistics. */}
 }
 function newCycle(){
   cycle={track:track(),src:audio.currentSrc||audio.src,playId:hex(),progress:0,
     lastTime:Number(audio.currentTime)||0,committed:false,seeking:false};
   return cycle;
 }
 function ensureCycle(){
   const id=track(),src=audio.currentSrc||audio.src;
   if(!validTrack(id)||!src)return null;
   if(!cycle||cycle.track!==id||cycle.src!==src)return newCycle();
   return cycle;
 }
 function heartbeat(){
   if(audio.paused||audio.ended)return;
   if(!ensureCycle())return;
   const n=Date.now();
   if(n-lastHeartbeat<25000)return;
   lastHeartbeat=n;post('heartbeat');
 }
 function stop(){
   if(cycle&&validTrack(track()))post('stop');
   lastHeartbeat=0;
 }
 audio.addEventListener('playing',()=>{ensureCycle();heartbeat()});
 audio.addEventListener('seeking',()=>{if(cycle)cycle.seeking=true});
 audio.addEventListener('seeked',()=>{
   if(cycle){cycle.seeking=false;cycle.lastTime=Number(audio.currentTime)||0}
 });
 audio.addEventListener('timeupdate',()=>{
   if(audio.paused||audio.ended)return;
   const c=ensureCycle();if(!c)return;
   const t=Number(audio.currentTime);
   if(!Number.isFinite(t))return;
   if(!c.seeking){
     const delta=t-c.lastTime;
     // Count real forward progress, not a time jump produced by seeking.
     if(delta>0&&delta<=4)c.progress+=delta;
   }
   c.lastTime=t;
   if(c.progress>=15&&!c.committed){c.committed=true;post('play',c.playId)}
 });
 audio.addEventListener('pause',stop);
 audio.addEventListener('ended',()=>{stop();cycle=null});
 window.addEventListener('pagehide',stop);
 setInterval(heartbeat,30000);
 if(!audio.paused){ensureCycle();heartbeat()}
})();