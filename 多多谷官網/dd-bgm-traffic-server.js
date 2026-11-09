/* DuoDuo BGM analytics. Separate anonymous counters; existing public data untouched. */
'use strict';
const crypto=require('crypto');
const PREFIX='__dd_bgm_';
const TABLE='/rest/v1/events';
const TOKEN=/^[a-f0-9]{32}$/i;
const TRACK=/^[a-z0-9_-]{1,80}$/i;
const SOURCES=new Set(['website','checklist']);
const recent=new Map();
const hash=(v,k)=>crypto.createHmac('sha256',k).update(v).digest('hex').slice(0,40);
const dayOf=(n)=>new Date(n+8*3600000).toISOString().slice(0,10).replace(/-/g,'');
const safeTitle=v=>String(v||'').replace(/[\u0000-\u001f\u007f]/g,'').slice(0,80);
function createBgmTrafficHandlers({getAdminSession,sendJSON,fetchImpl=fetch,now=Date.now,env=process.env}){
  const config=()=>{
    if(!env.SUPABASE_URL||!env.SUPABASE_SECRET_KEY)throw Error('BGM 統計尚未連接 Supabase');
    const secret=env.SUPABASE_SECRET_KEY;
    return {url:env.SUPABASE_URL,secret,headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'}};
  };
  const allowedOrigin=origin=>!origin||origin==='https://duoduovalley.github.io'||/^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(origin);
  function readBody(req,cb){
    let size=0,body='',oversize=false;
    req.setEncoding('utf8');
    req.on('data',chunk=>{size+=Buffer.byteLength(chunk,'utf8');if(size>1024)oversize=true;else body+=chunk});
    req.on('end',()=>{if(oversize)return cb(null,true);let data;try{data=JSON.parse(body)}catch{return cb(null,false)}cb(data,false)});
  }
  async function record(req,res){
    if(!allowedOrigin(String(req.headers.origin||'')))return sendJSON(res,403,{ok:false,error:'來源不允許'});
    if(/bot|crawler|spider|headless|lighthouse|uptime|monitor/i.test(String(req.headers['user-agent']||'')))
      return sendJSON(res,200,{ok:true,ignored:true});
    readBody(req,async(data,oversize)=>{
      if(oversize)return sendJSON(res,413,{ok:false,error:'請求過長'});
      const source=data?.source,kind=data?.kind,trackId=String(data?.trackId||'');
      if(!SOURCES.has(source)||!['play','heartbeat','stop'].includes(kind)||!TRACK.test(trackId)||
         !TOKEN.test(String(data?.listenerId||''))||!TOKEN.test(String(data?.sessionId||''))||
         (kind==='play'&&!TOKEN.test(String(data?.playId||''))))
        return sendJSON(res,400,{ok:false,error:'BGM 統計格式錯誤'});
      try{
        const cfg=config(),time=now(),day=dayOf(time),visitor=hash(data.listenerId,cfg.secret),
          session=hash(data.sessionId,cfg.secret),key=source+'_'+session,timeText=new Date(time).toISOString();
        const state=recent.get(key)||{at:0,plays:0,start:time};
        if(time-state.start>60000){state.start=time;state.plays=0}
        if(kind==='play'){state.plays++;if(state.plays>6)return sendJSON(res,200,{ok:true,rateLimited:true})}
        if(kind==='heartbeat'&&time-state.at<20000)return sendJSON(res,200,{ok:true,ignored:true});
        if(kind==='heartbeat')state.at=time;
        recent.set(key,state);
        if(recent.size>3500)for(const [k,v] of recent)if(time-v.start>180000)recent.delete(k);
        let rows,prefer;
        if(kind==='play'){
          const playId=hash(data.playId,cfg.secret);
          rows=[
            {id:PREFIX+'play_'+source+'_'+trackId+'_'+day+'_'+playId,data:{kind:'bgm-play',source,trackId},updated_at:timeText},
            {id:PREFIX+'listener_'+source+'_'+day+'_'+visitor,data:{kind:'bgm-daily-listener',source},updated_at:timeText},
            {id:PREFIX+'song_'+source+'_'+trackId,data:{kind:'bgm-song',source,trackId,title:safeTitle(data.trackTitle)||trackId},updated_at:timeText}
          ];
          prefer='resolution=ignore-duplicates,return=minimal';
        }else{
          rows=[{id:PREFIX+'live_'+source+'_'+session,data:{kind:'bgm-live',source,listener:visitor,trackId,playing:kind==='heartbeat'},updated_at:timeText}];
          prefer='resolution=merge-duplicates,return=minimal';
        }
        const response=await fetchImpl(cfg.url+TABLE,{method:'POST',headers:{...cfg.headers,Prefer:prefer},body:JSON.stringify(rows)});
        if(!response.ok)throw Error('BGM insert HTTP '+response.status);
        return sendJSON(res,200,{ok:true});
      }catch(e){console.error('BGM 記錄失敗',e?.message);return sendJSON(res,503,{ok:false,error:'BGM 統計暫時不可用'})}
    });
  }
  const cache=new Map();
  async function summary(req,res){
    if(!getAdminSession(req))return sendJSON(res,401,{ok:false,error:'請先登入管理後台'});
    const source=new URL(req.url||'/', 'http://internal').searchParams.get('source')||'website';
    if(!SOURCES.has(source))return sendJSON(res,400,{ok:false,error:'統計來源無效'});
    const current=now(),hit=cache.get(source);
    if(hit&&current-hit.time<30000)return sendJSON(res,200,hit.data);
    try{
      const cfg=config(),day=dayOf(current),h={...cfg.headers,Prefer:'count=exact'};
      async function count(pattern){
        const url=cfg.url+TABLE+'?select=id&id=like.'+encodeURIComponent(pattern)+'&limit=1';
        const response=await fetchImpl(url,{method:'GET',headers:h});
        if(!response.ok)throw Error('BGM count HTTP '+response.status);
        const range=response.headers.get('content-range')||'';
        const found=range.match(/\/(\d+)$/);if(!found)throw Error('BGM count not exact');
        return Number(found[1]);
      }
      async function rows(filter){
        const response=await fetchImpl(cfg.url+TABLE+'?select=id,data,updated_at&'+filter,{method:'GET',headers:cfg.headers});
        if(!response.ok)throw Error('BGM list HTTP '+response.status);
        return response.json();
      }
      const since=new Date(current-90000).toISOString();
      const [todayPlays,totalPlays,todayListeners,registry,live]=await Promise.all([
        count(PREFIX+'play_'+source+'_*_'+day+'_*'),
        count(PREFIX+'play_'+source+'_*'),
        count(PREFIX+'listener_'+source+'_'+day+'_*'),
        rows('id=like.'+encodeURIComponent(PREFIX+'song_'+source+'_*')+'&limit=100'),
        rows('id=like.'+encodeURIComponent(PREFIX+'live_'+source+'_*')+
             '&updated_at=gte.'+encodeURIComponent(since)+'&order=updated_at.desc&limit=1000')
      ]);
      const active=new Set();
      for(const row of live)if(row?.data?.playing===true&&/^[a-f0-9]{40}$/.test(row.data.listener||''))active.add(row.data.listener);
      const tracks=(Array.isArray(registry)?registry:[]).filter(r=>TRACK.test(String(r?.data?.trackId||''))).slice(0,60);
      const result=[];
      for(let i=0;i<tracks.length;i+=6){
        const group=tracks.slice(i,i+6);
        const groupCounts=await Promise.all(group.map(async row=>{
          const trackId=row.data.trackId;
          const [todayCount,totalCount]=await Promise.all([
            count(PREFIX+'play_'+source+'_'+trackId+'_'+day+'_*'),
            count(PREFIX+'play_'+source+'_'+trackId+'_*')
          ]);
          return {id:trackId,title:safeTitle(row.data.title)||trackId,today:todayCount,total:totalCount};
        }));
        result.push(...groupCounts);
      }
      result.sort((a,b)=>b.total-a.total||b.today-a.today);
      const payload={ok:true,source,date:day,timezone:'Asia/Taipei',liveListeners:active.size,
        todayListeners,todayPlays,totalPlays,tracks:result,limited:registry.length>60||live.length>=1000,updatedAt:new Date(current).toISOString()};
      cache.set(source,{time:current,data:payload});
      return sendJSON(res,200,payload);
    }catch(e){console.error('BGM 統計讀取失敗',e?.message);return sendJSON(res,503,{ok:false,error:'BGM 統計暫時無法讀取'})}
  }
  return {record,summary};
}
module.exports={createBgmTrafficHandlers,dayOf,PREFIX};
