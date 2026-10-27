/* DuoDuo BGM 2.0 — scoped admin controller. Site/BOSS/event admin code is unchanged. */
(()=>{
'use strict';
const by=id=>document.getElementById(id);
const base=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
let tracks=[],defaultId='',editingId='',busy=false;
const ids=()=>`bgm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
const token=()=>{try{return sessionStorage.getItem('duoduo_admin_session')||'';}catch{return ''}};
const status=(message,error=false)=>{by('bgmStatus').textContent=message;by('bgmStatus').classList.toggle('error',error);};
const safeUrl=value=>{try{if(!value)return '';const u=new URL(String(value).trim(),location.href);return (u.protocol==='https:'||((u.hostname==='localhost'||u.hostname==='127.0.0.1')&&u.protocol==='http:'))?u.href:'';}catch{return ''}};
const safeAccent=value=>/^#[0-9a-fA-F]{6}$/.test(value||'')?value:'#98cef8';
const formatUrl=url=>{try{const u=new URL(url);return u.hostname+u.pathname;}catch{return url;}};
const coverCanvas=by('bgmCoverCanvas'),existing=by('bgmExistingCover'),empty=by('bgmCoverEmpty'),zoomControl=by('bgmCoverZoom'),coverFile=by('bgmCoverFile');
let coverState={image:null,file:null,zoom:1,x:0,y:0};
let previewUrl='',loadSequence=0;
function releasePreview(){if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl='';}}
function clampOffset(dim,view,offset){return Math.min(Math.max(offset,-Math.max(0,(dim-view)/2)),Math.max(0,(dim-view)/2));}
function cropGeometry(view){
  const img=coverState.image;
  if(!img)return null;
  const scale=Math.max(view/img.naturalWidth,view/img.naturalHeight)*coverState.zoom;
  const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
  const factor=view/240;
  const x=clampOffset(w,view,coverState.x*factor),y=clampOffset(h,view,coverState.y*factor);
  return {w,h,x,y,left:(view-w)/2+x,top:(view-h)/2+y};
}
function drawCrop(canvas){
  if(!coverState.image)return;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('此瀏覽器不支援圖片裁切功能');
  const side=canvas.width,g=cropGeometry(side);
  ctx.clearRect(0,0,side,side);
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  ctx.drawImage(coverState.image,g.left,g.top,g.w,g.h);
  if(canvas===coverCanvas){coverState.x=g.x;coverState.y=g.y;}
}
function refreshCoverUI(currentCover=''){
  const hasImage=Boolean(coverState.image&&coverState.file);
  const selectedCurrent=safeUrl(currentCover)&&!by('bgmCoverRemove').checked;
  coverCanvas.hidden=!hasImage;
  existing.hidden=hasImage||!selectedCurrent;
  empty.hidden=hasImage||Boolean(selectedCurrent);
  zoomControl.disabled=!hasImage;
  by('bgmCoverCenter').disabled=!hasImage;
  if(!existing.hidden)existing.src=safeUrl(currentCover);
  if(hasImage)drawCrop(coverCanvas);
}
function existingCover(){return tracks.find(t=>t.id===editingId)?.cover||'';}
function resetCover(){
  loadSequence++;releasePreview();coverState={image:null,file:null,zoom:1,x:0,y:0};
  coverFile.value='';zoomControl.value='1';by('bgmCoverRemove').checked=false;
  by('bgmCoverHelp').textContent='可上傳任何長寬比例的圖片，拖曳取景位置；輸出統一為 512 × 512 WebP。';
  refreshCoverUI(existingCover());
}
function clearForm(){
  editingId='';by('bgmTitle').value='';by('bgmUrl').value='';by('bgmFile').value='';
  by('bgmAccent').value='#98cef8';by('bgmCaption').value='';
  by('bgmEnabled').checked=true;by('bgmDefault').checked=false;
  by('bgmAdd').textContent='＋ 加入歌曲清單';
  resetCover();
}
function render(){
  const holder=by('bgmRows');holder.replaceChildren();
  if(!tracks.length){const p=document.createElement('div');p.className='bgm-empty';p.textContent='目前沒有歌曲；先新增一首 MP3，再儲存並同步雲端。';holder.append(p);return;}
  tracks.forEach((t,i)=>{
    const row=document.createElement('div');row.className='bgm-admin-row';
    const summary=document.createElement('div');summary.className='bgm-track-summary';
    if(t.cover){const cover=document.createElement('img');cover.className='bgm-cover-preview-small';cover.alt='';cover.loading='lazy';cover.src=t.cover;summary.append(cover);}
    const label=document.createElement('div');label.className='bgm-admin-label';
    const name=document.createElement('strong');name.textContent=(defaultId===t.id?'★ 預設｜':'')+t.title+(t.enabled===false?'（未上架）':'');
    const url=document.createElement('small');url.textContent=formatUrl(t.url);
    const detail=document.createElement('div');detail.className='bgm-track-detail';detail.textContent=`主題色 ${t.accent||'#98cef8'}${t.caption?' · '+t.caption:''}`;
    label.append(name,url,detail);summary.append(label);
    const actions=document.createElement('div');actions.className='bgm-admin-actions';
    const make=(text,fn,disabled=false,cls='')=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.disabled=disabled;if(cls)b.className=cls;b.onclick=fn;actions.append(b);};
    make('↑',()=>move(i,-1),i===0);make('↓',()=>move(i,1),i===tracks.length-1);
    make('編輯',()=>{
      editingId=t.id;by('bgmTitle').value=t.title;by('bgmUrl').value=t.url;
      by('bgmAccent').value=safeAccent(t.accent);by('bgmCaption').value=t.caption||'';
      by('bgmEnabled').checked=t.enabled!==false;by('bgmDefault').checked=defaultId===t.id;
      by('bgmAdd').textContent='套用歌曲修改';resetCover();by('bgmTitle').focus();
    });
    make('刪除',()=>{
      if(!confirm(`確定從播放清單移除「${t.title}」？（雲端檔案不會因此刪除）`))return;
      tracks.splice(i,1);if(defaultId===t.id)defaultId=tracks[0]?.id||'';
      if(editingId===t.id)clearForm();render();status('已從草稿移除歌曲；按「儲存並同步雲端」才會發布。');
    },false,'bgm-danger');
    row.append(summary,actions);holder.append(row);
  });
}
function move(i,d){const n=i+d;if(n<0||n>=tracks.length)return;[tracks[i],tracks[n]]=[tracks[n],tracks[i]];render();}
async function readCloud(){
  const response=await fetch(`${base}/api/site-data`,{cache:'no-store'});
  const json=await response.json().catch(()=>({}));
  if(!response.ok||!json.ok)throw new Error(json.error||'無法取得 BGM 雲端資料');
  const value=json.data?.duoduo_bgm;
  if(value&&typeof value==='object'&&Array.isArray(value.tracks)){
    tracks=value.tracks.filter(t=>t&&t.id&&t.title&&safeUrl(t.url)).map(t=>({
      id:String(t.id),title:String(t.title),url:safeUrl(t.url),enabled:t.enabled!==false,
      cover:safeUrl(t.cover||''),accent:safeAccent(t.accent),caption:String(t.caption||'').slice(0,80)
    }));
    defaultId=String(value.defaultId||'');
    by('bgmMode').value=['sequential','shuffle','single'].includes(value.mode)?value.mode:'sequential';
  }else{tracks=[];defaultId='';by('bgmMode').value='sequential';}
  clearForm();render();status(`已載入雲端播放清單，共 ${tracks.length} 首。`);
}
async function uploadAudio(file){
  if(!/\.mp3$/i.test(file.name)||file.size>18*1024*1024||file.size<=0)throw new Error('請選擇小於 18 MB 的 MP3 檔案');
  const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('音樂檔案讀取失敗'));reader.readAsDataURL(file);});
  const response=await fetch(`${base}/api/upload-bgm`,{method:'POST',headers:{Authorization:`Bearer ${token()}`,'Content-Type':'application/json'},body:JSON.stringify({filename:file.name,dataUrl})});
  const json=await response.json().catch(()=>({}));
  if(!response.ok||!json.ok)throw new Error(json.error||'MP3 上傳失敗');
  return safeUrl(json.url);
}
async function uploadCover(){
  if(!coverState.image||!coverState.file)return '';
  const output=document.createElement('canvas');output.width=512;output.height=512;
  drawCrop(output);
  const dataUrl=output.toDataURL('image/webp',0.91);
  if(!dataUrl.startsWith('data:image/webp;base64,'))throw new Error('目前瀏覽器無法輸出 WebP，請使用最新 Chrome／Edge 上傳封面');
  const response=await fetch(`${base}/api/upload-image`,{method:'POST',headers:{Authorization:`Bearer ${token()}`,'Content-Type':'application/json'},body:JSON.stringify({filename:'bgm-cover.webp',dataUrl})});
  const json=await response.json().catch(()=>({}));
  if(!response.ok||!json.ok||!safeUrl(json.path))throw new Error(json.error||'封面上傳失敗，請檢查管理員登入或雲端圖片空間');
  return safeUrl(json.path);
}
function prepareFile(file){
  if(!file)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size<=0||file.size>8*1024*1024){
    coverFile.value='';status('封面僅接受 PNG／JPG／WebP，且必須小於 8 MB。',true);return;
  }
  const seq=++loadSequence;releasePreview();previewUrl=URL.createObjectURL(file);
  const picture=new Image();
  picture.onload=()=>{
    if(seq!==loadSequence)return;
    if(!picture.naturalWidth||!picture.naturalHeight){status('無法讀取圖片尺寸。',true);return;}
    coverState={image:picture,file,zoom:1,x:0,y:0};zoomControl.value='1';
    by('bgmCoverRemove').checked=false;
    by('bgmCoverHelp').textContent=`原圖 ${picture.naturalWidth} × ${picture.naturalHeight}｜拖曳圖片選擇裁切位置，滑桿可放大。儲存時輸出 512 × 512 WebP。`;
    refreshCoverUI(existingCover());
    if(Math.min(picture.naturalWidth,picture.naturalHeight)<512)status('圖片短邊小於 512px，封面可以使用，但放大時可能稍微模糊。');
    releasePreview();
  };
  picture.onerror=()=>{if(seq!==loadSequence)return;coverState={image:null,file:null,zoom:1,x:0,y:0};coverFile.value='';releasePreview();status('圖片無法開啟，請換一張 PNG、JPG 或 WebP。',true);refreshCoverUI(existingCover());};
  picture.src=previewUrl;
}
coverFile.addEventListener('change',()=>prepareFile(coverFile.files?.[0]));
zoomControl.addEventListener('input',()=>{if(!coverState.image)return;coverState.zoom=Number(zoomControl.value)||1;drawCrop(coverCanvas);});
by('bgmCoverCenter').addEventListener('click',()=>{coverState.x=coverState.y=0;coverState.zoom=1;zoomControl.value='1';drawCrop(coverCanvas);});
by('bgmCoverRemove').addEventListener('change',()=>{
  if(by('bgmCoverRemove').checked){loadSequence++;releasePreview();coverState={image:null,file:null,zoom:1,x:0,y:0};coverFile.value='';zoomControl.value='1';}
  refreshCoverUI(existingCover());
});
existing.addEventListener('error',()=>{existing.hidden=true;empty.hidden=false;});
let drag=null;
coverCanvas.addEventListener('pointerdown',event=>{
  if(!coverState.image)return;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,offsetX:coverState.x,offsetY:coverState.y};
  coverCanvas.setPointerCapture(event.pointerId);coverCanvas.classList.add('dragging');
});
coverCanvas.addEventListener('pointermove',event=>{
  if(!drag||drag.id!==event.pointerId||!coverState.image)return;
  const r=coverCanvas.getBoundingClientRect(),ratio=240/r.width;
  coverState.x=drag.offsetX+(event.clientX-drag.x)*ratio;
  coverState.y=drag.offsetY+(event.clientY-drag.y)*ratio;
  drawCrop(coverCanvas);
});
const endDrag=()=>{drag=null;coverCanvas.classList.remove('dragging');};
coverCanvas.addEventListener('pointerup',endDrag);coverCanvas.addEventListener('pointercancel',endDrag);coverCanvas.addEventListener('lostpointercapture',endDrag);
by('bgmAdd').addEventListener('click',async()=>{
  if(busy)return;
  const title=by('bgmTitle').value.trim().slice(0,120),file=by('bgmFile').files[0];
  if(!title){status('請輸入歌曲名稱。',true);return;}
  let url=safeUrl(by('bgmUrl').value);
  if(!url&&!file){status('請輸入 HTTPS 音訊連結，或選擇 MP3 檔案。',true);return;}
  if((file||coverState.file)&&!token()){status('請先登入管理員帳號，才能上傳 MP3 或封面。',true);return;}
  busy=true;by('bgmAdd').disabled=true;
  try{
    if(file){status('正在上傳 MP3 至雲端…');url=await uploadAudio(file);}
    if(!url)throw new Error('音樂網址格式不正確，必須使用 HTTPS');
    let cover=by('bgmCoverRemove').checked?'':existingCover();
    if(coverState.file){status('正在裁切並上傳歌曲封面…');cover=await uploadCover();}
    const id=editingId||ids();
    const item={id,title,url,enabled:by('bgmEnabled').checked,cover,accent:safeAccent(by('bgmAccent').value),caption:by('bgmCaption').value.trim().slice(0,80)};
    const i=tracks.findIndex(t=>t.id===id);if(i>=0)tracks[i]=item;else tracks.push(item);
    if(by('bgmDefault').checked||!tracks.some(t=>t.id===defaultId))defaultId=id;
    clearForm();render();status('已加入歌曲草稿；請再按「儲存並同步雲端」，玩家才會看到封面與主題。');
  }catch(err){status(err.message||'新增歌曲失敗',true);}
  finally{busy=false;by('bgmAdd').disabled=false;}
});
by('bgmCancel').onclick=()=>{if(busy)return;clearForm();status('已清空歌曲表單，不影響清單草稿。');};
by('bgmReload').onclick=async()=>{
  if(busy)return;
  if(!confirm('將放棄尚未同步的 BGM 草稿變更，重新讀取雲端，確定嗎？'))return;
  try{await readCloud();}catch(err){status(err.message||'載入雲端失敗',true);}
};
by('bgmPublish').onclick=async()=>{
  if(busy)return;
  if(!token()){status('請先登入管理員帳號。',true);return;}
  busy=true;by('bgmPublish').disabled=true;status('正在同步歌曲、封面與主題設定至雲端…');
  try{
    const data={tracks:tracks.map(t=>({id:t.id,title:t.title,url:t.url,enabled:t.enabled!==false,cover:t.cover||'',accent:safeAccent(t.accent),caption:t.caption||''})),defaultId,mode:by('bgmMode').value};
    const response=await fetch(`${base}/api/site-data`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token()}`},body:JSON.stringify({values:{duoduo_bgm:data}})});
    const json=await response.json().catch(()=>({}));
    if(!response.ok||!json.ok)throw new Error(json.error||'雲端同步失敗');
    status(`已發布 ${tracks.filter(t=>t.enabled).length} 首歌曲；封面、主題色與文案會一起同步給玩家。`);
  }catch(err){status(`同步失敗：${err.message||'請檢查連線'}`,true);}
  finally{busy=false;by('bgmPublish').disabled=false;}
};
// Only the initial opening of this panel auto-loads, to avoid losing local drafts.
let hasLoaded=false;
document.querySelector('[data-panel="bgmPanel"]')?.addEventListener('click',()=>{
  if(hasLoaded)return;hasLoaded=true;
  readCloud().catch(err=>{hasLoaded=false;status('雲端載入失敗：'+err.message,true);});
});
clearForm();
})();
