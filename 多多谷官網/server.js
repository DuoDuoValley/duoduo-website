const http=require('http'),fs=require('fs'),path=require('path');

const root=__dirname,port=3000;

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

/* =========================
   圖片上傳
========================= */

function handleUpload(req,res){
  let body='';

  req.on('data',chunk=>{
    body+=chunk;

    if(body.length>20*1024*1024){
      res.writeHead(413);
      res.end('Payload Too Large');
      req.destroy();
    }
  });

  req.on('end',()=>{
    try{
      const data=JSON.parse(body);

      const match=String(data.dataUrl||'')
        .match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/);

      if(!match){
        return sendJSON(res,400,{
          ok:false,
          error:'無效的圖片資料'
        });
      }

      const ext=
        match[1]==='jpeg'||match[1]==='jpg'
          ? 'jpg'
          : match[1];

      const base=safeName(
        data.filename||`event_${Date.now()}`
      );

      const filename=
        `${Date.now()}_${Math.random().toString(36).slice(2,8)}_`+
        `${base.replace(/\.[^.]+$/,'')}.${ext}`;

      const file=path.join(uploadDir,filename);

      fs.writeFileSync(
        file,
        Buffer.from(match[2],'base64')
      );

      sendJSON(res,200,{
        ok:true,
        path:`https://duoduo-website.onrender.com/assets/uploads/${filename}`
      });

    }catch(err){
      console.error('圖片上傳失敗:',err);

      sendJSON(res,500,{
        ok:false,
        error:'圖片上傳失敗'
      });
    }
  });
}

/* =========================
   Supabase：讀取活動
========================= */

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

    return sendJSON(res,200,{
      ok:true,
      events:rows
    });

  }catch(err){
    console.error('活動 API 失敗:',err);

    return sendJSON(res,500,{
      ok:false,
      error:'活動 API 發生錯誤'
    });
  }
}

/* =========================
   Supabase：儲存活動
========================= */

async function handleSaveEvents(req,res){
  try{
    const adminPassword=process.env.ADMIN_PASSWORD;
    const requestPassword=req.headers['x-admin-password'];

    if(!adminPassword){
      return sendJSON(res,500,{
        ok:false,
        error:'ADMIN_PASSWORD 尚未設定'
      });
    }

    if(!requestPassword || requestPassword!==adminPassword){
      return sendJSON(res,401,{
        ok:false,
        error:'未授權'
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

        /* 取得目前資料庫活動 */
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

        /* 刪除 Supabase 裡已不存在的活動 */
        for(const row of existingRows){
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

        /* 新增／更新活動 */
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

/* =========================
   HTTP Server
========================= */

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
    'Content-Type, X-Admin-Password'
  );

  if(req.method==='OPTIONS'){
    res.writeHead(204);
    return res.end();
  }

  const requestPath=(req.url||'').split('?')[0];

  /* Supabase 活動 API：讀取 */
  if(
    req.method==='GET' &&
    requestPath==='/api/events'
  ){
    return handleGetEvents(req,res);
  }

  /* Supabase 活動 API：儲存 */
  if(
    req.method==='POST' &&
    requestPath==='/api/events'
  ){
    return handleSaveEvents(req,res);
  }

  /* 圖片上傳 API */
  if(
    req.method==='POST' &&
    requestPath==='/api/upload-image'
  ){
    return handleUpload(req,res);
  }

  /* 靜態網站 */
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
