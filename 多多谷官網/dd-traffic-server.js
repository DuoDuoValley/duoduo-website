/* DuoDuo Valley visitor metrics — server-only pseudonymous counters.
 * Uses dedicated event row IDs, never the site's shared settings JSON.
 * Browser identity is an anonymous random token, HMACed before storage.
 * Metrics begin at activation; no historical visits are inferred.
 */
'use strict';
const crypto=require('crypto');
const PREFIX='__dd_traffic_';
const SUPABASE_TABLE='/rest/v1/events';
const VISITOR_RE=/^[a-f0-9]{32}$/i;
const VIEW_RE=/^[a-f0-9]{32}$/i;
const BUCKET_MS=60*1000;
const recent=new Map();
function taiwanDay(now=Date.now()){return new Date(now+8*3600000).toISOString().slice(0,10).replace(/-/g,'')}
function createTrafficHandlers({getAdminSession,sendJSON,fetchImpl=fetch,now=Date.now,env=process.env}){
  const config=()=>{
    const url=env.SUPABASE_URL,secret=env.SUPABASE_SECRET_KEY;
    if(!url||!secret)throw Error('流量統計尚未連接 Supabase');
    return {url,secret,headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'}};
  };
  const hash=(token,secret)=>crypto.createHmac('sha256',secret).update(token).digest('hex').slice(0,40);
  async function record(req,res){
    const origin=String(req.headers.origin||'');
    // Same-origin Render local/testing is allowed; public pages use the official GitHub Pages origin.
    if(origin&&origin!=='https://duoduovalley.github.io'&&!origin.startsWith('http://localhost:')&&!origin.startsWith('http://127.0.0.1:'))
      return sendJSON(res,403,{ok:false,error:'來源不允許'});
    if(/bot|crawler|spider|headless|lighthouse|uptime|monitor/i.test(String(req.headers['user-agent']||'')))
      return sendJSON(res,200,{ok:true,ignored:true});
    let body='',oversize=false;
    req.setEncoding('utf8');
    req.on('data',chunk=>{body+=chunk;if(body.length>512){oversize=true}});
    req.on('end',async()=>{
      if(oversize)return sendJSON(res,413,{ok:false,error:'請求過長'});
      let payload;
      try{payload=JSON.parse(body)}catch{return sendJSON(res,400,{ok:false,error:'統計格式錯誤'})}
      if(!VISITOR_RE.test(String(payload.visitorId||''))||!VIEW_RE.test(String(payload.viewId||'')))
        return sendJSON(res,400,{ok:false,error:'統計識別碼格式錯誤'});
      try{
        const cfg=config(),time=now(),day=taiwanDay(time),visitor=hash(payload.visitorId,cfg.secret),view=hash(payload.viewId,cfg.secret);
        // Suppress abusive bursts, but never store an IP or user-agent in Supabase.
        const prior=recent.get(visitor)||{start:time,count:0};
        if(time-prior.start>BUCKET_MS){prior.start=time;prior.count=0}
        prior.count++;
        recent.set(visitor,prior);
        if(recent.size>4000)for(const [k,v] of recent){if(time-v.start>2*BUCKET_MS)recent.delete(k)}
        if(prior.count>40)return sendJSON(res,200,{ok:true,rateLimited:true});
        const timeText=new Date(time).toISOString();
        const rows=[
          {id:PREFIX+'total_uv_'+visitor,data:{kind:'unique-visitor'},updated_at:timeText},
          {id:PREFIX+'uv_'+day+'_'+visitor,data:{kind:'daily-visitor',date:day},updated_at:timeText},
          {id:PREFIX+'pv_'+day+'_'+view,data:{kind:'pageview',date:day},updated_at:timeText}
        ];
        const result=await fetchImpl(cfg.url+SUPABASE_TABLE,{method:'POST',headers:{...cfg.headers,Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(rows)});
        if(!result.ok){
          console.error('流量紀錄寫入失敗',result.status);
          return sendJSON(res,503,{ok:false,error:'流量統計服務暫時不可用'});
        }
        return sendJSON(res,200,{ok:true});
      }catch(e){console.error('流量紀錄錯誤',e?.message);return sendJSON(res,503,{ok:false,error:'流量統計暫時不可用'})}
    });
  }
  async function summary(req,res){
    if(!getAdminSession(req))return sendJSON(res,401,{ok:false,error:'請先登入管理後台'});
    try{
      const cfg=config(),day=taiwanDay(now());
      async function count(pattern){
        const url=cfg.url+SUPABASE_TABLE+'?select=id&id=like.'+encodeURIComponent(pattern)+'&limit=1';
        const response=await fetchImpl(url,{method:'GET',headers:{...cfg.headers,Prefer:'count=exact'}});
        if(!response.ok)throw Error('Supabase count HTTP '+response.status);
        const contentRange=response.headers.get('content-range')||'';
        const match=contentRange.match(/\/(\d+)$/);
        if(!match)throw Error('資料庫未提供精確筆數');
        return Number(match[1]);
      }
      const [todayVisitors,totalVisitors,todayViews,totalViews]=await Promise.all([
        count(PREFIX+'uv_'+day+'_*'),
        count(PREFIX+'total_uv_*'),
        count(PREFIX+'pv_'+day+'_*'),
        count(PREFIX+'pv_*')
      ]);
      const firstResponse=await fetchImpl(cfg.url+SUPABASE_TABLE+'?select=id&id=like.'+encodeURIComponent(PREFIX+'pv_*')+'&order=id.asc&limit=1',{method:'GET',headers:cfg.headers});
      let since=null;
      if(firstResponse.ok){
        const items=await firstResponse.json();
        const id=items?.[0]?.id||'';
        const match=id.match(/^__dd_traffic_pv_(\d{4})(\d{2})(\d{2})_/);
        if(match)since=match[1]+'-'+match[2]+'-'+match[3];
      }
      return sendJSON(res,200,{ok:true,timezone:'Asia/Taipei',date:day.slice(0,4)+'-'+day.slice(4,6)+'-'+day.slice(6),since,todayVisitors,totalVisitors,todayViews,totalViews,updatedAt:new Date(now()).toISOString()});
    }catch(e){console.error('統計讀取失敗',e?.message);return sendJSON(res,503,{ok:false,error:'無法讀取流量統計，請確認 Render 和 Supabase 服務'})}
  }
  return {record,summary};
}
module.exports={createTrafficHandlers,taiwanDay,PREFIX};
