const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname,port=3000;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
const uploadDir=path.join(root,'assets','uploads');
if(!fs.existsSync(uploadDir))fs.mkdirSync(uploadDir,{recursive:true});

function sendJSON(res,status,data){
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(data));
}
function safeName(name){
  return String(name||'image').replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,80);
}
function handleUpload(req,res){
  let body='';
  req.on('data',chunk=>{
    body+=chunk;
    if(body.length>20*1024*1024){res.writeHead(413);res.end('Payload Too Large');req.destroy();}
  });
  req.on('end',()=>{
    try{
      const data=JSON.parse(body);
      const match=String(data.dataUrl||'').match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/);
      if(!match)return sendJSON(res,400,{ok:false,error:'無效的圖片資料'});
      const ext=match[1]==='jpeg'||match[1]==='jpg'?'jpg':match[1];
      const base=safeName(data.filename||`event_${Date.now()}`);
      const filename=`${Date.now()}_${Math.random().toString(36).slice(2,8)}_${base.replace(/\.[^.]+$/,'')}.${ext}`;
      const file=path.join(uploadDir,filename);
      fs.writeFileSync(file,Buffer.from(match[2],'base64'));
      sendJSON(res,200,{ok:true,path:`https://duoduo-website.onrender.com/assets/uploads/${filename}`});
    }catch(err){
      console.error('圖片上傳失敗:',err);
      sendJSON(res,500,{ok:false,error:'圖片上傳失敗'});
    }
  });
}
const server=http.createServer((req,res)=>{
    res.setHeader('Access-Control-Allow-Origin','https://duoduovalley.github.io');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS'){
    res.writeHead(204);
    return res.end();
  }
  if(req.method==='POST' && (req.url||'').split('?')[0]==='/api/upload-image') return handleUpload(req,res);
  let urlPath=decodeURIComponent((req.url||'/').split('?')[0]);if(urlPath==='/')urlPath='/index.html';
  const file=path.normalize(path.join(root,urlPath));
  if(!file.startsWith(root))return res.writeHead(403).end('Forbidden');
  fs.readFile(file,(err,data)=>{
    if(err)return res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Not Found');
    res.writeHead(200,{'Content-Type':types[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(data)
  })
});
server.listen(port,()=>{console.log(`DuoDuo Valley 官網已啟動：http://localhost:${port}`);console.log('按 Ctrl+C 可停止伺服器。')});
