const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');

const root=__dirname,port=3000;
const SUPABASE_BUCKET='event-images';
const adminSessions=new Map();
const ADMIN_SESSION_TTL=8*60*60*1000;
const LOGIN_MAX_FAILURES=5;
const LOGIN_LOCK_MS=10*60*1000;
const loginAttempts=new Map();

const types={
  '.html':'text/html; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.webp':'image/webp',
  '.gif':'image/gif',
  '.svg':'image/svg+xml',
  '.txt':'text/plain; charset=utf-8'
};

const uploadDir=path.join(root,'assets','uploads');

if(!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir,{recursive:true});
}

function sendJSON(res,status,data){
  res.writeHead(status,{
    'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store'
  });
  res.end(JSON.stringify(data));
}

function safeName(name){
  return String(name||'image')
    .replace(/[^a-zA-Z0-9._-]/g,'_')
    .slice(0,80);
}

async function ensureSupabaseBucket(supabaseUrl,supabaseSecretKey){
  const headers={
    'apikey':supabaseSecretKey,
    'Authorization':`Bearer ${supabaseSecretKey}`,
    'Content-Type':'application/json'
  };

  // 先確認 Bucket 是否已存在；避免每次圖片上傳都重複建立 Bucket。
  const checkResponse=await fetch(
    `${supabaseUrl}/storage/v1/bucket/${encodeURIComponent(SUPABASE_BUCKET)}`,
    {method:'GET',headers}
  );

  if(checkResponse.ok)return true;

  if(checkResponse.status!==404){
    const errorText=await checkResponse.text();
    console.error('Supabase Storage Bucket 檢查失敗:',errorText);
    throw new Error('Supabase Storage Bucket 檢查失敗');
  }

  const createResponse=await fetch(
    `${supabaseUrl}/storage/v1/bucket`,
    {
      method:'POST',
      headers,
      body:JSON.stringify({
        id:SUPABASE_BUCKET,
        name:SUPABASE_BUCKET,
        public:true,
        allowed_mime_types:['image/*'],
        file_size_limit:10*1024*1024
      })
    }
  );

  if(createResponse.ok||createResponse.status===409)return true;

  const errorText=await createResponse.text();
  if(/already exists|duplicate|exists/i.test(errorText))return true;

  console.error('Supabase Storage 建立 Bucket 失敗:',errorText);
  throw new Error('Supabase Storage Bucket 建立失敗');
}

function cleanupAdminSessions(){
  const now=Date.now();
  for(const [token,session] of adminSessions){
    if(now-session.createdAt>ADMIN_SESSION_TTL){
      adminSessions.delete(token);
    }
  }
  for(const [key,attempt] of loginAttempts){
    if(attempt.lockedUntil && attempt.lockedUntil<=now){
      loginAttempts.delete(key);
    }
  }
}

function getClientIp(req){
  const forwarded=String(req.headers['x-forwarded-for']||'').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}

function getLoginAttempt(key){
  const now=Date.now();
  const current=loginAttempts.get(key);
  if(!current)return {failures:0,lockedUntil:0};
  if(current.lockedUntil && current.lockedUntil>now)return current;
  if(current.lockedUntil && current.lockedUntil<=now){
    loginAttempts.delete(key);
    return {failures:0,lockedUntil:0};
  }
  return current;
}

function recordLoginFailure(key){
  const current=getLoginAttempt(key);
  const failures=current.failures+1;
  const lockedUntil=failures>=LOGIN_MAX_FAILURES?Date.now()+LOGIN_LOCK_MS:0;
  loginAttempts.set(key,{failures,lockedUntil});
  return {failures,lockedUntil};
}

function clearLoginFailure(key){
  loginAttempts.delete(key);
}

function getAdminSession(req){
  cleanupAdminSessions();
  const header=String(req.headers.authorization||'');
  const match=header.match(/^Bearer\s+(.+)$/i);
  if(!match)return null;
  const session=adminSessions.get(match[1]);
  if(!session)return null;
  if(Date.now()-session.createdAt>ADMIN_SESSION_TTL){
    adminSessions.delete(match[1]);
    return null;
  }
  return session;
}

function handleAdminLogin(req,res){
  let body='';

  req.on('data',chunk=>{
    body+=chunk;
    if(body.length>64*1024){
      res.writeHead(413);
      res.end('Payload Too Large');
      req.destroy();
    }
  });

  req.on('end',()=>{
    try{
      const payload=JSON.parse(body||'{}');
      const username=String(payload.username||'');
      const password=String(payload.password||'');
      const expectedUsername=String(process.env.ADMIN_USERNAME||'');
      const expectedPassword=String(process.env.ADMIN_PASSWORD||'');
      const attemptKey=`${getClientIp(req)}:${username}`;
      const attempt=getLoginAttempt(attemptKey);

      if(!expectedUsername||!expectedPassword){
        return sendJSON(res,500,{ok:false,error:'管理員登入環境變數尚未設定'});
      }

      if(attempt.lockedUntil> Date.now()){
        const retryAfter=Math.max(1,Math.ceil((attempt.lockedUntil-Date.now())/1000));
        res.setHeader('Retry-After',String(retryAfter));
        return sendJSON(res,429,{ok:false,error:'登入嘗試次數過多，請稍後再試'});
      }

      if(username!==expectedUsername||password!==expectedPassword){
        const result=recordLoginFailure(attemptKey);
        if(result.lockedUntil){
          const retryAfter=Math.max(1,Math.ceil((result.lockedUntil-Date.now())/1000));
          res.setHeader('Retry-After',String(retryAfter));
          return sendJSON(res,429,{ok:false,error:'登入嘗試次數過多，請 10 分鐘後再試'});
        }
        return sendJSON(res,401,{ok:false,error:'帳號或密碼錯誤'});
      }

      clearLoginFailure(attemptKey);
      cleanupAdminSessions();
      const token=crypto.randomBytes(32).toString('hex');
      adminSessions.set(token,{createdAt:Date.now()});

      return sendJSON(res,200,{ok:true,token});
    }catch(err){
      console.error('管理員登入失敗:',err);
      return sendJSON(res,400,{ok:false,error:'登入資料格式錯誤'});
    }
  });
}

function handleAdminMe(req,res){
  const session=getAdminSession(req);
  if(!session){
    return sendJSON(res,401,{ok:false,error:'未登入'});
  }
  return sendJSON(res,200,{ok:true});
}

async function handleUpload(req,res){
  let body='';

  req.on('data',chunk=>{
    body+=chunk;

    if(body.length>20*1024*1024){
      res.writeHead(413);
      res.end('Payload Too Large');
      req.destroy();
    }
  });

  req.on('end',async()=>{
    try{
      const supabaseUrl=process.env.SUPABASE_URL;
      const supabaseSecretKey=process.env.SUPABASE_SECRET_KEY;

      if(!supabaseUrl||!supabaseSecretKey){
        return sendJSON(res,500,{
          ok:false,
          error:'Supabase 環境變數尚未設定'
        });
      }

      const data=JSON.parse(body);

      const match=String(data.dataUrl||'')
        .match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/);

      if(!match){
        return sendJSON(res,400,{
          ok:false,
          error:'無效的圖片資料'
        });
      }

      await ensureSupabaseBucket(
        supabaseUrl,
        supabaseSecretKey
      );

      const base=safeName(
        data.filename||`event_${Date.now()}`
      );

      // 前端目前會將圖片壓成 WebP，因此統一以 WebP 儲存。
      const filename=
        `${Date.now()}_${Math.random().toString(36).slice(2,10)}_`+
        `${base.replace(/\.[^.]+$/,'')}.webp`;

      const storagePath=`events/${filename}`;

      const uploadResponse=await fetch(
        `${supabaseUrl}/storage/v1/object/${SUPABASE_BUCKET}/${encodeURIComponent(storagePath).replace(/%2F/g,'/')}`,
        {
          method:'POST',
          headers:{
            'apikey':supabaseSecretKey,
            'Authorization':`Bearer ${supabaseSecretKey}`,
            'Content-Type':'image/webp',
            'x-upsert':'false',
            'Cache-Control':'31536000'
          },
          body:Buffer.from(match[2],'base64')
        }
      );

      if(!uploadResponse.ok){
        const errorText=await uploadResponse.text();

        console.error(
          'Supabase Storage 圖片上傳失敗:',
          errorText
        );

        return sendJSON(res,500,{
          ok:false,
          error:'Supabase Storage 圖片上傳失敗',
          detail:errorText.slice(0,500)
        });
      }

      const publicUrl=
        `${supabaseUrl}/storage/v1/object/public/`+
        `${SUPABASE_BUCKET}/${storagePath}`;

      return sendJSON(res,200,{
        ok:true,
        path:publicUrl
      });

    }catch(err){
      console.error('圖片上傳失敗:',err);

      return sendJSON(res,500,{
        ok:false,
        error:'圖片上傳失敗'
      });
    }
  });
}

async function handleGetEvents(req,res){
  try{
    const supabaseUrl=process.env.SUPABASE_URL;
    const supabaseSecretKey=process.env.SUPABASE_SECRET_KEY;

    if(!supabaseUrl||!supabaseSecretKey){
      return sendJSON(res,500,{
        ok:false,
        error:'Supabase 環境變數尚未設定'
      });
    }

    const url=
      `${supabaseUrl}/rest/v1/events`+
      `?select=id,data,updated_at`+
      `&order=updated_at.desc`;

    const response=await fetch(url,{
      method:'GET',
      headers:{
        'apikey':supabaseSecretKey,
        'Authorization':`Bearer ${supabaseSecretKey}`,
        'Content-Type':'application/json'
      }
    });

    const text=await response.text();

    if(!response.ok){
      console.error('Supabase 讀取活動失敗:',text);

      return sendJSON(res,500,{
        ok:false,
        error:'Supabase 讀取失敗'
      });
    }

    const rows=JSON.parse(text);
    const events=rows.filter(row=>String(row.id)!=='__boss_config__');

    return sendJSON(res,200,{
      ok:true,
      events
    });

  }catch(err){
    console.error('活動 API 失敗:',err);

    return sendJSON(res,500,{
      ok:false,
      error:'活動 API 發生錯誤'
    });
  }
}

async function handleSaveEvents(req,res){
  try{
    if(!getAdminSession(req)){
      return sendJSON(res,401,{
        ok:false,
        error:'未登入'
      });
    }

    const supabaseUrl=process.env.SUPABASE_URL;
    const supabaseSecretKey=process.env.SUPABASE_SECRET_KEY;

    if(!supabaseUrl||!supabaseSecretKey){
      return sendJSON(res,500,{
        ok:false,
        error:'Supabase 環境變數尚未設定'
      });
    }

    let body='';

    req.on('data',chunk=>{
      body+=chunk;

      if(body.length>10*1024*1024){
        res.writeHead(413);
        res.end('Payload Too Large');
        req.destroy();
      }
    });

    req.on('end',async()=>{
      try{
        const payload=JSON.parse(body);
        const events=Array.isArray(payload.events)
          ? payload.events
          : [];

        const headers={
          'apikey':supabaseSecretKey,
          'Authorization':`Bearer ${supabaseSecretKey}`,
          'Content-Type':'application/json',
          'Prefer':'resolution=merge-duplicates,return=minimal'
        };

        const getUrl=
          `${supabaseUrl}/rest/v1/events?select=id`;

        const existingResponse=await fetch(getUrl,{
          method:'GET',
          headers
        });

        if(!existingResponse.ok){
          const errorText=await existingResponse.text();

          console.error(
            'Supabase 取得既有活動失敗:',
            errorText
          );

          return sendJSON(res,500,{
            ok:false,
            error:'無法取得既有活動'
          });
        }

        const existingRows=await existingResponse.json();

        const newIds=new Set(
          events.map(e=>String(e.id))
        );

        for(const row of existingRows){
          if(['__boss_config__','__site_data__'].includes(String(row.id)))continue;
          if(!newIds.has(String(row.id))){
            const deleteUrl=
              `${supabaseUrl}/rest/v1/events?id=eq.${encodeURIComponent(row.id)}`;

            const deleteResponse=await fetch(deleteUrl,{
              method:'DELETE',
              headers
            });

            if(!deleteResponse.ok){
              const errorText=await deleteResponse.text();

              console.error(
                'Supabase 刪除活動失敗:',
                errorText
              );

              return sendJSON(res,500,{
                ok:false,
                error:'刪除活動失敗'
              });
            }
          }
        }

        if(events.length){
          const rows=events.map(event=>({
            id:String(event.id),
            data:event,
            updated_at:new Date().toISOString()
          }));

          const saveUrl=
            `${supabaseUrl}/rest/v1/events`;

          const saveResponse=await fetch(saveUrl,{
            method:'POST',
            headers,
            body:JSON.stringify(rows)
          });

          if(!saveResponse.ok){
            const errorText=await saveResponse.text();

            console.error(
              'Supabase 儲存活動失敗:',
              errorText
            );

            return sendJSON(res,500,{
              ok:false,
              error:'儲存活動失敗'
            });
          }
        }

        return sendJSON(res,200,{
          ok:true,
          count:events.length
        });

      }catch(err){
        console.error('活動資料處理失敗:',err);

        return sendJSON(res,500,{
          ok:false,
          error:'活動資料格式錯誤'
        });
      }
    });

  }catch(err){
    console.error('活動儲存 API 失敗:',err);

    return sendJSON(res,500,{
      ok:false,
      error:'活動儲存 API 發生錯誤'
    });
  }
}

async function handleGetBosses(req,res){
  try{
    const supabaseUrl=process.env.SUPABASE_URL;
    const supabaseSecretKey=process.env.SUPABASE_SECRET_KEY;
    if(!supabaseUrl||!supabaseSecretKey){
      return sendJSON(res,500,{ok:false,error:'Supabase 環境變數尚未設定'});
    }
    const url=`${supabaseUrl}/rest/v1/events?id=eq.__boss_config__&select=data`;
    const response=await fetch(url,{method:'GET',headers:{'apikey':supabaseSecretKey,'Authorization':`Bearer ${supabaseSecretKey}`,'Content-Type':'application/json'}});
    const text=await response.text();
    if(!response.ok){
      console.error('Supabase 讀取 BOSS 設定失敗:',text);
      return sendJSON(res,500,{ok:false,error:'BOSS 設定讀取失敗'});
    }
    const rows=JSON.parse(text);
    const data=rows[0]?.data;
    return sendJSON(res,200,{ok:true,bosses:data?.bosses||[],interval:Number(data?.interval)||5000});
  }catch(err){
    console.error('BOSS API 讀取失敗:',err);
    return sendJSON(res,500,{ok:false,error:'BOSS API 發生錯誤'});
  }
}

async function handleSaveBosses(req,res){
  try{
    if(!getAdminSession(req))return sendJSON(res,401,{ok:false,error:'未登入'});
    const supabaseUrl=process.env.SUPABASE_URL;
    const supabaseSecretKey=process.env.SUPABASE_SECRET_KEY;
    if(!supabaseUrl||!supabaseSecretKey)return sendJSON(res,500,{ok:false,error:'Supabase 環境變數尚未設定'});
    let body='';
    req.on('data',chunk=>{body+=chunk;if(body.length>10*1024*1024){res.writeHead(413);res.end('Payload Too Large');req.destroy();}});
    req.on('end',async()=>{
      try{
        const payload=JSON.parse(body||'{}');
        const bosses=Array.isArray(payload.bosses)?payload.bosses:[];
        const interval=Math.max(2000,Number(payload.interval)||5000);
        const row={id:'__boss_config__',data:{type:'boss-config',bosses,interval},updated_at:new Date().toISOString()};
        const url=`${supabaseUrl}/rest/v1/events`;
        const response=await fetch(url,{method:'POST',headers:{'apikey':supabaseSecretKey,'Authorization':`Bearer ${supabaseSecretKey}`,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify([row])});
        if(!response.ok){const text=await response.text();console.error('Supabase 儲存 BOSS 設定失敗:',text);return sendJSON(res,500,{ok:false,error:'BOSS 設定儲存失敗'});}
        return sendJSON(res,200,{ok:true,count:bosses.length});
      }catch(err){
        console.error('BOSS 設定格式錯誤:',err);
        return sendJSON(res,400,{ok:false,error:'BOSS 設定格式錯誤'});
      }
    });
  }catch(err){
    console.error('BOSS 儲存 API 發生錯誤:',err);
    return sendJSON(res,500,{ok:false,error:'BOSS 儲存 API 發生錯誤'});
  }
}



const SITE_DATA_KEYS=[
  'duoduo_news','duoduo_reviews','duoduo_content','duoduo_hero',
  'duoduo_layout','duoduo_settings','duoduo_resources','duoduo_downloads',
  'duoduo_items','duoduo_links'
];

async function handleGetSiteData(req,res){
  try{
    const supabaseUrl=process.env.SUPABASE_URL;
    const supabaseSecretKey=process.env.SUPABASE_SECRET_KEY;
    if(!supabaseUrl||!supabaseSecretKey)return sendJSON(res,500,{ok:false,error:'Supabase 環境變數尚未設定'});
    const headers={'apikey':supabaseSecretKey,'Authorization':`Bearer ${supabaseSecretKey}`,'Content-Type':'application/json'};
    const siteResponse=await fetch(`${supabaseUrl}/rest/v1/events?id=eq.__site_data__&select=data`,{method:'GET',headers});
    const siteText=await siteResponse.text();
    if(!siteResponse.ok){console.error('Supabase 讀取網站資料失敗:',siteText);return sendJSON(res,500,{ok:false,error:'網站資料讀取失敗'});}
    const siteRows=JSON.parse(siteText);
    const record=siteRows[0]?.data;
    if(record?.initialized!==true)return sendJSON(res,200,{ok:true,initialized:false,data:{}});

    const data={...(record.values||{})};

    const eventsResponse=await fetch(`${supabaseUrl}/rest/v1/events?select=id,data,updated_at&order=updated_at.desc`,{method:'GET',headers});
    if(eventsResponse.ok){
      const rows=await eventsResponse.json();
      const eventRows=rows.filter(row=>!['__boss_config__','__site_data__'].includes(String(row.id)));
      data.duoduo_events=eventRows.map(row=>row.data).filter(Boolean);
    }

    const bossResponse=await fetch(`${supabaseUrl}/rest/v1/events?id=eq.__boss_config__&select=data`,{method:'GET',headers});
    if(bossResponse.ok){
      const rows=await bossResponse.json();
      const boss=rows[0]?.data;
      if(boss)data.duoduo_boss_config={interval:Number(boss.interval)||5000,slides:Array.isArray(boss.bosses)?boss.bosses:[]};
    }

    return sendJSON(res,200,{ok:true,initialized:true,data});
  }catch(err){
    console.error('網站資料 API 讀取失敗:',err);
    return sendJSON(res,500,{ok:false,error:'網站資料 API 發生錯誤'});
  }
}

async function handleSaveSiteData(req,res){
  try{
    if(!getAdminSession(req))return sendJSON(res,401,{ok:false,error:'未登入'});
    const supabaseUrl=process.env.SUPABASE_URL;
    const supabaseSecretKey=process.env.SUPABASE_SECRET_KEY;
    if(!supabaseUrl||!supabaseSecretKey)return sendJSON(res,500,{ok:false,error:'Supabase 環境變數尚未設定'});
    let body='';
    req.on('data',chunk=>{body+=chunk;if(body.length>10*1024*1024){res.writeHead(413);res.end('Payload Too Large');req.destroy();}});
    req.on('end',async()=>{
      try{
        const payload=JSON.parse(body||'{}');
        const incoming=payload.values&&typeof payload.values==='object'?payload.values:{};
        const values={};
        for(const key of SITE_DATA_KEYS){
          if(Object.prototype.hasOwnProperty.call(incoming,key))values[key]=incoming[key];
        }
        const row={id:'__site_data__',data:{type:'site-data',initialized:true,values},updated_at:new Date().toISOString()};
        const url=`${supabaseUrl}/rest/v1/events`;
        const response=await fetch(url,{method:'POST',headers:{'apikey':supabaseSecretKey,'Authorization':`Bearer ${supabaseSecretKey}`,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify([row])});
        if(!response.ok){const text=await response.text();console.error('Supabase 儲存網站資料失敗:',text);return sendJSON(res,500,{ok:false,error:'網站資料儲存失敗'});}
        return sendJSON(res,200,{ok:true,count:Object.keys(values).length});
      }catch(err){console.error('網站資料格式錯誤:',err);return sendJSON(res,400,{ok:false,error:'網站資料格式錯誤'});}
    });
  }catch(err){console.error('網站資料儲存 API 發生錯誤:',err);return sendJSON(res,500,{ok:false,error:'網站資料 API 發生錯誤'});}
}

const server=http.createServer((req,res)=>{

  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://duoduovalley.github.io'
  );

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, DELETE, OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Admin-Password, Authorization'
  );

  if(req.method==='OPTIONS'){
    res.writeHead(204);
    return res.end();
  }

  const requestPath=(req.url||'').split('?')[0];

  if(
    req.method==='POST' &&
    requestPath==='/api/admin/login'
  ){
    return handleAdminLogin(req,res);
  }

  if(
    req.method==='GET' &&
    requestPath==='/api/admin/me'
  ){
    return handleAdminMe(req,res);
  }

  if(
    req.method==='GET' &&
    requestPath==='/api/events'
  ){
    return handleGetEvents(req,res);
  }
  if(
    req.method==='GET' &&
    requestPath==='/api/bosses'
  ){
    return handleGetBosses(req,res);
  }

  if(
    req.method==='GET' &&
    requestPath==='/api/site-data'
  ){
    return handleGetSiteData(req,res);
  }

  if(
    req.method==='POST' &&
    requestPath==='/api/bosses'
  ){
    return handleSaveBosses(req,res);
  }

  if(
    req.method==='POST' &&
    requestPath==='/api/site-data'
  ){
    return handleSaveSiteData(req,res);
  }


  if(
    req.method==='POST' &&
    requestPath==='/api/events'
  ){
    return handleSaveEvents(req,res);
  }

  if(
    req.method==='POST' &&
    requestPath==='/api/upload-image'
  ){
    if(!getAdminSession(req)){
      return sendJSON(res,401,{ok:false,error:'未登入'});
    }
    return handleUpload(req,res);
  }

  let urlPath=decodeURIComponent(requestPath);

  if(urlPath==='/'){
    urlPath='/index.html';
  }

  const file=path.normalize(
    path.join(root,urlPath)
  );

  if(!file.startsWith(root)){
    return res.writeHead(403).end('Forbidden');
  }

  fs.readFile(file,(err,data)=>{
    if(err){
      return res.writeHead(
        404,
        {'Content-Type':'text/plain; charset=utf-8'}
      ).end('Not Found');
    }

    res.writeHead(
      200,
      {
        'Content-Type':
          types[path.extname(file).toLowerCase()]||
          'application/octet-stream',
        'Cache-Control':'no-cache'
      }
    );

    res.end(data);
  });
});

server.listen(port,()=>{
  console.log(
    `DuoDuo Valley 官網已啟動：http://localhost:${port}`
  );

  console.log(
    '按 Ctrl+C 可停止伺服器。'
  );
});
