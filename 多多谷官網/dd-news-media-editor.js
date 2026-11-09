/* DuoDuo news image helper — additive to existing plain-text section storage.
   Images are uploaded first. Only a strict single-line reference is stored. */
(()=>{'use strict';
 const IMAGE=/^\[\[DDIMG:([^|\]\r\n]{1,2400})\|(25|50|100)\|(left|center|right)\|([^|\]\r\n]{0,450})\]\]$/;
 const ACCEPT=/^image\/(?:png|jpeg|webp)$/i;
 const MAX_FILE=8*1024*1024;
 let pending=0;
 const decode=value=>{try{return decodeURIComponent(value)}catch{return ''}};
 function safeURL(value){
   try{
     const u=new URL(String(value||''));
     if(u.protocol!=='https:'||u.username||u.password||u.port)return false;
     return /^[a-z0-9-]+\.supabase\.co$/i.test(u.hostname)&&
       /^\/storage\/v1\/object\/public\/event-images\/events\/[a-zA-Z0-9._%+-]+\.webp$/.test(u.pathname);
   }catch(_){return false}
 }
 function parse(line){
   const m=IMAGE.exec(String(line||'').trim());
   if(!m)return null;
   const url=decode(m[1]),alt=decode(m[4]);
   if(!safeURL(url)||alt.length>100)return null;
   return {url,size:Number(m[2]),align:m[3],alt};
 }
 function marker({url,size,align,alt}){
   if(!safeURL(url))throw Error('圖片網址未通過安全驗證');
   return '[[DDIMG:'+encodeURIComponent(url)+'|'+size+'|'+align+'|'+encodeURIComponent(String(alt||'').slice(0,100))+']]';
 }
 function optionSelect(choices,value,title){
   const select=document.createElement('select');select.setAttribute('aria-label',title);
   for(const [key,label] of choices){const o=document.createElement('option');o.value=key;o.textContent=label;select.append(o)}
   select.value=String(value);return select;
 }
 function mount(textarea,item){
   if(!textarea||textarea.dataset.newsMediaMounted==='1')return;
   textarea.dataset.newsMediaMounted='1';
   const root=document.createElement('div');root.className='dd-news-media-editor';
   const toolbar=document.createElement('div');toolbar.className='dd-news-media-toolbar';
   const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp';input.hidden=true;
   input.setAttribute('aria-label','選擇公告圖片');
   const add=document.createElement('button');add.type='button';add.className='dd-news-media-upload';add.textContent='＋ 插入圖片';
   const size=optionSelect([['25','小（25%）'],['50','中（50%）'],['100','大（100%）']],'50','新圖片寬度');
   const align=optionSelect([['left','靠左'],['center','置中'],['right','靠右']],'center','新圖片對齊');
   const tip=document.createElement('span');tip.className='dd-news-media-tip';tip.textContent='支援 Ctrl + V 貼圖、拖入圖片，會插入到文字游標位置';
   toolbar.append(add,size,align,tip,input);
   const status=document.createElement('div');status.className='dd-news-media-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
   const preview=document.createElement('div');preview.className='dd-news-media-preview';
   const previewTitle=document.createElement('strong');previewTitle.className='dd-news-media-preview-title';previewTitle.textContent='圖文排列預覽';
   const previewBody=document.createElement('div');previewBody.className='dd-news-media-preview-body';
   preview.append(previewTitle,previewBody);
   root.append(toolbar,status,preview);
   textarea.after(root);
   add.addEventListener('click',()=>input.click());
   function changed(){
     item.body=textarea.value;
     textarea.dispatchEvent(new Event('input',{bubbles:true}));
     showPreview();
   }
   function replaceAt(lineIndex,value){
     const lines=textarea.value.replace(/\r\n?/g,'\n').split('\n');
     if(!parse(lines[lineIndex]))return;
     if(value===null)lines.splice(lineIndex,1);
     else lines[lineIndex]=value;
     textarea.value=lines.join('\n');changed();
   }
   function showPreview(){
     previewBody.replaceChildren();
     const lines=textarea.value.replace(/\r\n?/g,'\n').split('\n');
     let hasImage=false;
     lines.forEach((line,i)=>{
       const info=parse(line);
       if(info){
         hasImage=true;
         const figure=document.createElement('figure');figure.className='dd-news-media-figure';figure.dataset.align=info.align;
         const img=document.createElement('img');img.src=info.url;img.alt=info.alt||'公告插圖';img.loading='lazy';
         img.style.maxWidth=info.size+'%';
         const controls=document.createElement('figcaption');controls.className='dd-news-media-controls';
         const controlSize=optionSelect([['25','25%'],['50','50%'],['100','100%']],info.size,'調整圖片寬度');
         const controlAlign=optionSelect([['left','靠左'],['center','置中'],['right','靠右']],info.align,'調整圖片對齊');
         const del=document.createElement('button');del.type='button';del.textContent='移除圖片';del.className='dd-news-media-remove';
         controlSize.addEventListener('change',()=>replaceAt(i,marker({...info,size:Number(controlSize.value)})));
         controlAlign.addEventListener('change',()=>replaceAt(i,marker({...info,align:controlAlign.value})));
         del.addEventListener('click',()=>replaceAt(i,null));
         controls.append(controlSize,controlAlign,del);figure.append(img,controls);previewBody.append(figure);
       }else{
         const text=document.createElement('div');text.className='dd-news-media-text';
         if(!line)text.classList.add('dd-news-media-blank');
         text.textContent=line||'\u00a0';previewBody.append(text);
       }
     });
     previewTitle.textContent=hasImage?'圖文排列預覽（可直接調整圖片）':'內容預覽（貼上圖片後顯示在這裡）';
   }
   async function insertFile(file){
     if(!file||!ACCEPT.test(file.type)){status.textContent='僅支援 PNG、JPG、WebP 圖片';return}
     if(!file.size||file.size>MAX_FILE){status.textContent='圖片檔案須小於 8 MB';return}
     if(pending){status.textContent='前一張圖片仍在上傳，請先完成';return}
     const start=textarea.selectionStart??textarea.value.length;
     const end=textarea.selectionEnd??start;
     pending++;add.disabled=true;input.disabled=true;textarea.readOnly=true;
     status.textContent='正在壓縮並上傳圖片，請勿關閉此頁或儲存公告…';
     try{
       if(typeof window.fileToCompressedDataURL!=='function'||typeof window.uploadImageDataURL!=='function')
         throw Error('圖片上傳功能未就緒，請重新開啟後台');
       const data=await window.fileToCompressedDataURL(file,1600,1600,.94);
       if(!data.startsWith('data:image/webp;base64,')||data.length>15*1024*1024)
         throw Error('圖片壓縮結果不符合要求');
       const url=await window.uploadImageDataURL(data,file.name||'news-image.png');
       if(!safeURL(url))throw Error('上傳後的圖片網址無法驗證');
       if(!textarea.isConnected)throw Error('編輯器已被關閉，圖片未插入');
       const token=marker({url,size:Number(size.value),align:align.value,alt:(file.name||'公告圖片').slice(0,100)});
       const original=textarea.value,head=original.slice(0,start),tail=original.slice(end);
       const before=head&&!head.endsWith('\n')?'\n':'';
       const after=tail&&!tail.startsWith('\n')?'\n':'';
       textarea.setRangeText(before+token+after,start,end,'end');
       changed();status.textContent='圖片已插入到內文；仍須按「儲存公告」及原本的雲端發布流程。';
     }catch(err){status.textContent='圖片未插入：'+String(err?.message||'上傳失敗') }
     finally{pending--;add.disabled=false;input.disabled=false;textarea.readOnly=false;input.value='';}
   }
   input.addEventListener('change',()=>{if(input.files?.[0])void insertFile(input.files[0])});
   textarea.addEventListener('paste',event=>{
     const items=Array.from(event.clipboardData?.items||[]);
     const image=items.find(x=>x.kind==='file'&&ACCEPT.test(x.type));
     if(!image)return;
     event.preventDefault();const file=image.getAsFile();if(file)void insertFile(file);
   });
   textarea.addEventListener('dragover',event=>{
     if(Array.from(event.dataTransfer?.items||[]).some(x=>x.kind==='file'&&ACCEPT.test(x.type)))event.preventDefault();
   });
   textarea.addEventListener('drop',event=>{
     const file=Array.from(event.dataTransfer?.files||[]).find(x=>ACCEPT.test(x.type));
     if(!file)return;event.preventDefault();void insertFile(file);
   });
   textarea.addEventListener('input',showPreview);
   showPreview();
 }
 window.DuoDuoNewsMedia={mount,busy:()=>pending>0,parse,marker,safeURL};
})();
