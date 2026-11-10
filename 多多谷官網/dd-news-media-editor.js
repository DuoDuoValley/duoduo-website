/* DuoDuo news WYSIWYG V2. Text and native-size images appear in the SAME editor.
   Existing announcement bodies continue to store plain text + validated image tokens.
   No HTML, blob URL, or base64 image is ever written to announcement storage. */
(()=>{'use strict';
 const TOKEN=/\[\[DDIMG:([^|\]\r\n]{1,2400})\|(auto|25|50|100)\|(inline|left|center|right)\|([^|\]\r\n]{0,450})\]\]/g;
 const EXACT=new RegExp('^'+TOKEN.source+'$');
 const ACCEPT=/^image\/(?:png|jpeg|webp)$/i;
 const MAX_FILE=8*1024*1024;
 const FMT_KEYS=new Set(['B','I','U','S','CRED','CORANGE','CYELLOW','CGREEN','CBLUE','CPURPLE','HYELLOW','HPINK','HGREEN','HBLUE']);
 const FMT_RE=/\[\[DDFMT:([A-Z]+)\]\]/g;
 const LOAD_TOKENS=/\[\[DDIMG:[^\]\r\n]{1,3200}\]\]|\[\[DDFMT:[A-Z]+\]\]/g;
 const OPEN_FMT=key=>'[[DDFMT:'+key+']]';
 const CLOSE_FMT='[[DDFMT:END]]';
 let pending=0;
 const decode=s=>{try{return decodeURIComponent(s)}catch{return ''}};
 function safeURL(value){
   try{
     const u=new URL(String(value||''));
     return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&
       /^[a-z0-9-]+\.supabase\.co$/i.test(u.hostname)&&
       /^\/storage\/v1\/object\/public\/event-images\/events\/[a-zA-Z0-9._%+-]+\.webp$/.test(u.pathname);
   }catch(_){return false}
 }
 function parse(input){
   const match=EXACT.exec(String(input||'').trim());
   if(!match)return null;
   const url=decode(match[1]),alt=decode(match[4]);
   if(!safeURL(url)||alt.length>100)return null;
   return {url,size:match[2],align:match[3],alt};
 }
 function marker(value){
   if(!safeURL(value.url))throw Error('圖片網址不符合安全規範');
   const size=String(value.size||'auto'),align=String(value.align||'inline');
   if(!['auto','25','50','100'].includes(size)||!['inline','left','center','right'].includes(align))
     throw Error('圖片尺寸或對齊方式不支援');
   return '[[DDIMG:'+encodeURIComponent(value.url)+'|'+size+'|'+align+'|'+
     encodeURIComponent(String(value.alt||'').slice(0,100))+']]';
 }
 function dropdown(title,options){
   const el=document.createElement('select');
   el.setAttribute('aria-label',title);
   for(const [value,label] of options){const opt=document.createElement('option');opt.value=value;opt.textContent=label;el.append(opt)}
   return el;
 }
 function mount(textarea,item){
   if(!textarea||textarea.dataset.newsMediaMounted==='2')return;
   textarea.dataset.newsMediaMounted='2';
   const editor=document.createElement('div');
   editor.className='dd-news-media-wysiwyg';
   editor.contentEditable='true';
   editor.spellcheck=false;
   editor.setAttribute('role','textbox');
   editor.setAttribute('aria-label','公告圖文內文，可直接輸入文字並貼上圖片');
   editor.setAttribute('aria-multiline','true');
   editor.dataset.placeholder='在這裡輸入公告內容，也可直接 Ctrl + V 貼上道具圖片…';
   textarea.hidden=true;
   textarea.setAttribute('aria-hidden','true');
   textarea.style.display='none';
   // Keep contenteditable outside the textarea label so clicking inside never
   // redirects focus back to the hidden textarea.
   const fieldLabel=textarea.closest('label');
   if(fieldLabel&&fieldLabel.classList.contains('event-section-full')){
     editor.classList.add('event-section-full');fieldLabel.after(editor);
   }else textarea.after(editor);
   const toolbar=document.createElement('div');toolbar.className='dd-news-media-toolbar';
   const fileInput=document.createElement('input');fileInput.type='file';
   fileInput.accept='image/png,image/jpeg,image/webp';fileInput.hidden=true;
   fileInput.setAttribute('aria-label','上傳公告圖片');
   const insertButton=document.createElement('button');insertButton.type='button';
   insertButton.className='dd-news-media-upload';insertButton.textContent='＋ 插入圖片';
   const helper=document.createElement('span');helper.className='dd-news-media-tip';
   helper.textContent='圖片會直接出現在游標位置，預設顯示原始大小；可和文字排在同一行';
   const formatBar=document.createElement('div');formatBar.className='dd-news-format-tools';
   const formatNote=document.createElement('span');formatNote.className='dd-news-format-note';
   formatNote.textContent='先反白選取文字，再套用樣式';
   function formatButton(label,title,key){
     const b=document.createElement('button');b.type='button';b.textContent=label;
     b.className='dd-news-format-btn';b.title=title;b.setAttribute('aria-label',title);
     b.addEventListener('mousedown',event=>{event.preventDefault();rememberRange()});
     b.addEventListener('click',()=>key==='CLEAR'?clearSelectedFormat():applySelectedFormat(key));
     formatBar.append(b);return b;
   }
   formatButton('B','粗體','B');
   formatButton('I','斜體','I');
   formatButton('U','底線','U');
   formatButton('S','刪除線','S');
   const colors=dropdown('文字顏色',[['','文字顏色'],['CRED','紅色'],['CORANGE','橘色'],['CYELLOW','黃色'],['CGREEN','綠色'],['CBLUE','藍色'],['CPURPLE','紫色']]);
   const marks=dropdown('螢光標記',[['','螢光標記'],['HYELLOW','黃色底'],['HPINK','粉色底'],['HGREEN','綠色底'],['HBLUE','藍色底']]);
   colors.className=marks.className='dd-news-format-select';
   colors.addEventListener('mousedown',rememberRange);
   marks.addEventListener('mousedown',rememberRange);
   colors.addEventListener('change',()=>{if(colors.value)applySelectedFormat(colors.value);colors.value=''});
   marks.addEventListener('change',()=>{if(marks.value)applySelectedFormat(marks.value);marks.value=''});
   formatBar.append(colors,marks);
   const linkButton=document.createElement('button');linkButton.type='button';
   linkButton.className='dd-news-format-btn';linkButton.textContent='🔗 連結';linkButton.title='插入 HTTPS 超連結';
   linkButton.addEventListener('mousedown',event=>{event.preventDefault();rememberRange()});
   linkButton.addEventListener('click',insertSelectedLink);
   formatBar.append(linkButton);
   formatButton('清除格式','只清除反白範圍內的文字格式','CLEAR');
   toolbar.append(formatNote,insertButton,fileInput,helper);
   // Toolbar is inserted once the editor root has been created.
   const controls=document.createElement('div');controls.className='dd-news-image-controls';controls.hidden=true;
   const size=dropdown('所選圖片大小',[['auto','原始尺寸'],['25','25%'],['50','50%'],['100','100%']]);
   const align=dropdown('所選圖片對齊',[['inline','文字行內'],['left','靠左另起行'],['center','置中另起行'],['right','靠右另起行']]);
   const remove=document.createElement('button');remove.type='button';remove.className='dd-news-media-remove';remove.textContent='移除此圖片';
   controls.append(size,align,remove);
   const status=document.createElement('div');status.className='dd-news-media-status';
   status.setAttribute('role','status');status.setAttribute('aria-live','polite');
   const root=document.createElement('div');root.className='dd-news-media-editor event-section-full';
   root.append(formatBar,toolbar,controls,status);
   editor.after(root);
   let selectedImage=null,savedRange=null;
   function setImageStyle(image,info){
     image.dataset.newsToken=marker(info);
     image.dataset.newsSize=info.size;
     image.dataset.newsAlign=info.align;
     image.className='dd-news-edit-image dd-news-edit-'+info.align;
     image.style.width='auto';
     image.style.height='auto';
     image.style.maxWidth=info.size==='auto'?'100%':info.size+'%';
     image.alt=info.alt||'公告插圖';
     image.contentEditable='false';
     image.draggable=false;
   }
   function imageElement(info){
     const image=document.createElement('img');
     image.src=info.url;image.loading='lazy';
     setImageStyle(image,info);return image;
   }
   function formattedSpan(key){
     const span=document.createElement('span');span.className='dd-news-fmt dd-news-fmt-'+key.toLowerCase();
     span.dataset.newsFormat=key;return span;
   }
   function load(){
     editor.replaceChildren();
     const lines=String(textarea.value||'').replace(/\r\n?/g,'\n').split('\n');
     const stack=[editor];
     for(let i=0;i<lines.length;i++){
       if(i)stack[stack.length-1].append(document.createElement('br'));
       let last=0;LOAD_TOKENS.lastIndex=0;let match;
       while((match=LOAD_TOKENS.exec(lines[i]))!==null){
         if(match.index>last)stack[stack.length-1].append(document.createTextNode(lines[i].slice(last,match.index)));
         const token=match[0];
         const image=token.startsWith('[[DDIMG:')?parse(token):null;
         const key=token.match(/^\[\[DDFMT:([A-Z]+)\]\]$/)?.[1];
         if(image)stack[stack.length-1].append(imageElement(image));
         else if(key==='END'&&stack.length>1)stack.pop();
         else if(FMT_KEYS.has(key)){const span=formattedSpan(key);stack[stack.length-1].append(span);stack.push(span)}
         else stack[stack.length-1].append(document.createTextNode(token));
         last=match.index+token.length;
       }
       if(last<lines[i].length)stack[stack.length-1].append(document.createTextNode(lines[i].slice(last)));
     }
   }
   function serialize(){
     let output='';
     const blocks=new Set(['DIV','P','LI']);
     function walk(node){
       if(node.nodeType===3){output+=String(node.nodeValue||'').replace(/\u200B/g,'');return}
       if(node.nodeType!==1)return;
       if(node.tagName==='IMG'){
         const token=String(node.dataset?.newsToken||'');
         if(parse(token))output+=token;return;
       }
       if(node.tagName==='BR'){output+='\n';return}
       const native={'STRONG':'B','B':'B','EM':'I','I':'I','U':'U','S':'S','STRIKE':'S'};
       const key=FMT_KEYS.has(node.dataset?.newsFormat)?node.dataset.newsFormat:native[node.tagName];
       if(key)output+=OPEN_FMT(key);
       const isBlock=blocks.has(node.tagName);
       if(isBlock&&output&&!output.endsWith('\n'))output+='\n';
       for(const child of node.childNodes)walk(child);
       if(isBlock&&output&&!output.endsWith('\n'))output+='\n';
       if(key)output+=CLOSE_FMT;
     }
     for(const node of editor.childNodes)walk(node);
     // Frontend paragraph rendering is line-based. Keep each format self-contained
     // within every line, even when selection includes a line break.
     const normalized=output.replace(/\n$/,'').replace(/\u00a0/g,' ');
     const active=[];let result='';
     const pieces=normalized.split(/(\[\[DDFMT:[A-Z]+\]\]|\n)/);
     for(const part of pieces){
       const key=part.match(/^\[\[DDFMT:([A-Z]+)\]\]$/)?.[1];
       if(key==='END'){if(active.length)active.pop();result+=part}
       else if(FMT_KEYS.has(key)){active.push(key);result+=part}
       else if(part==='\n'){
         result+=CLOSE_FMT.repeat(active.length)+'\n'+active.map(OPEN_FMT).join('');
       }else result+=part;
     }
     return result;
   }
   function sync(){
     const value=serialize();
     textarea.value=value;item.body=value;
     textarea.dispatchEvent(new Event('input',{bubbles:true}));
   }
   function loadSelectedImage(image){
     selectedImage=image;
     controls.hidden=!image;
     if(image){
       const info=parse(image.dataset.newsToken);
       if(!info){controls.hidden=true;selectedImage=null;return}
       size.value=info.size;align.value=info.align;
     }
   }
   function rememberRange(){
     const sel=window.getSelection?.();
     if(sel?.rangeCount&&sel.anchorNode&&editor.contains(sel.anchorNode))
       savedRange=sel.getRangeAt(0).cloneRange();
   }
   function selectionRange(){
     const sel=window.getSelection?.();
     let range=null;
     if(sel?.rangeCount&&sel.anchorNode&&editor.contains(sel.anchorNode))
       range=sel.getRangeAt(0).cloneRange();
     else if(savedRange&&editor.contains(savedRange.commonAncestorContainer))
       range=savedRange.cloneRange();
     return range&&!range.collapsed&&editor.contains(range.commonAncestorContainer)?range:null;
   }
   function useRangeAfter(node){
     const range=document.createRange();range.selectNodeContents(node);range.collapse(false);
     const sel=window.getSelection?.();
     if(sel){sel.removeAllRanges();sel.addRange(range)}
     savedRange=range.cloneRange();editor.focus();sync();
   }
   function applySelectedFormat(key){
     if(!FMT_KEYS.has(key))return;
     const range=selectionRange();
     if(!range){status.textContent='請先在公告內文反白選取要套用格式的文字。';return}
     const wrapper=formattedSpan(key);
     wrapper.append(range.extractContents());range.insertNode(wrapper);
     useRangeAfter(wrapper);status.textContent='已套用文字格式（儲存並同步雲端後才會公開）。';
   }
   function stripFormatInside(node){
     const children=Array.from(node.childNodes);
     for(const child of children){
       if(child.nodeType!==1)continue;
       stripFormatInside(child);
       if(FMT_KEYS.has(child.dataset?.newsFormat)||/^(STRONG|B|EM|I|U|S|STRIKE)$/.test(child.tagName)){
         child.replaceWith(...Array.from(child.childNodes));
       }
     }
   }
   function clearSelectedFormat(){
     const range=selectionRange();
     if(!range){status.textContent='請先反白選取要清除格式的文字。';return}
     const fragment=range.extractContents();stripFormatInside(fragment);
     const marker=document.createElement('span');marker.dataset.newsClear='1';marker.append(fragment);
     range.insertNode(marker);
     // Split each styled ancestor around the unformatted selection so that a
     // partially selected phrase is not styled again by its parent.
     let parent=marker.parentElement;
     while(parent&&parent!==editor){
       const styled=FMT_KEYS.has(parent.dataset?.newsFormat)||/^(STRONG|B|EM|I|U|S|STRIKE)$/.test(parent.tagName);
       if(styled){
         const after=parent.cloneNode(false);
         while(marker.nextSibling)after.append(marker.nextSibling);
         if(after.hasChildNodes())parent.after(after);
         parent.after(marker);
         const next=marker.parentElement;
         if(!parent.hasChildNodes())parent.remove();
         parent=next;
       }else parent=parent.parentElement;
     }
     const last=marker.lastChild||marker;
     marker.replaceWith(...Array.from(marker.childNodes));
     const cursor=document.createRange();cursor.setStartAfter(last);cursor.collapse(true);
     const sel=window.getSelection?.();if(sel){sel.removeAllRanges();sel.addRange(cursor)}
     savedRange=cursor.cloneRange();editor.focus();sync();status.textContent='已清除選取文字的格式。';
   }
   function insertSelectedLink(){
     const range=selectionRange();
     if(!range){status.textContent='請先反白選取連結要顯示的文字。';return}
     const label=range.toString().trim();
     if(!label||label.length>80||/[\[\]\n\r]/.test(label)){
       status.textContent='連結文字須在 80 字內，且不能包含換行或方括號。';return;
     }
     const raw=window.prompt('請輸入安全的 HTTPS 連結網址：','https://');
     if(raw===null)return;
     let url;
     try{url=new URL(raw.trim());if(url.protocol!=='https:'||url.username||url.password)throw Error('invalid')}catch(_){
       status.textContent='網址必須為有效的 HTTPS 連結。';return;
     }
     const text=document.createTextNode('['+label+']('+url.href+')');
     range.deleteContents();range.insertNode(text);
     useRangeAfter(text);status.textContent='超連結已插入；原有 Markdown 超連結功能仍可使用。';
   }
   function insertionRange(){
     const sel=window.getSelection?.();
     let range=null;
     if(sel?.rangeCount&&sel.anchorNode&&editor.contains(sel.anchorNode))
       range=sel.getRangeAt(0).cloneRange();
     else if(savedRange&&editor.contains(savedRange.commonAncestorContainer))
       range=savedRange.cloneRange();
     if(!range){range=document.createRange();range.selectNodeContents(editor);range.collapse(false)}
     // Adding an image never deletes highlighted text. Failed uploads cannot lose any text.
     range.collapse(false);
     return range;
   }
   function insertAtCaret(node,range){
     editor.focus();
     range.insertNode(node);
     const sel=window.getSelection?.();
     range.setStartAfter(node);range.collapse(true);
     if(sel){sel.removeAllRanges();sel.addRange(range)}
     savedRange=range.cloneRange();
     sync();
   }
   function insertPlain(text){
     if(!text)return;
     const range=insertionRange();
     const fragment=document.createDocumentFragment();
     const segments=String(text).replace(/\r\n?/g,'\n').split('\n');
     let last=null;
     segments.forEach((segment,i)=>{
       if(i){last=document.createElement('br');fragment.append(last)}
       if(segment){last=document.createTextNode(segment);fragment.append(last)}
     });
     if(!last)return;
     range.insertNode(fragment);
     const sel=window.getSelection?.();
     range.setStartAfter(last);range.collapse(true);
     if(sel){sel.removeAllRanges();sel.addRange(range)}
     savedRange=range.cloneRange();sync();
   }
   async function insertFile(file){
     if(!file||!ACCEPT.test(file.type)){status.textContent='僅支援 PNG／JPG／WebP';return}
     if(!file.size||file.size>MAX_FILE){status.textContent='單張圖片須小於 8 MB';return}
     if(pending){status.textContent='請先完成上一張圖片上傳';return}
     let blob=null,temporary=null;
     try{
       // Show the real image immediately, at its native pixel size, before upload finishes.
       temporary=document.createElement('img');
       temporary.className='dd-news-edit-image dd-news-image-pending';
       temporary.alt='圖片上傳中';
       temporary.contentEditable='false';temporary.draggable=false;
       blob=URL.createObjectURL(file);
       temporary.src=blob;
       insertAtCaret(temporary,insertionRange());
     }catch(err){
       if(blob)URL.revokeObjectURL(blob);
       status.textContent='無法顯示貼上的圖片：'+String(err.message||err);return;
     }
     pending++;insertButton.disabled=true;fileInput.disabled=true;
     status.textContent='圖片顯示中，正在安全上傳…儲存公告前會確認完成。';
     try{
       if(typeof window.fileToCompressedDataURL!=='function'||typeof window.uploadImageDataURL!=='function')
         throw Error('圖片上傳服務未就緒，請重新開啟後台');
       const data=await window.fileToCompressedDataURL(file,1600,1600,.94);
       if(!data.startsWith('data:image/webp;base64,')||data.length>15*1024*1024)
         throw Error('圖片壓縮結果超出限制');
       const url=await window.uploadImageDataURL(data,file.name||'news.png');
       if(!safeURL(url))throw Error('雲端圖片網址驗證失敗');
       if(!editor.isConnected||!temporary.isConnected)throw Error('編輯器或圖片已被關閉');
       setImageStyle(temporary,{url,size:'auto',align:'inline',alt:''});
       temporary.src=url;sync();
       status.textContent='圖片已插入。預設原始尺寸，請依原本流程儲存並發布公告。';
     }catch(err){
       if(temporary?.isConnected){temporary.remove();sync()}
       status.textContent='圖片上傳未完成，原本文字已保留：'+String(err.message||err);
     }finally{
       if(blob)URL.revokeObjectURL(blob);
       pending--;insertButton.disabled=false;fileInput.disabled=false;fileInput.value='';
     }
   }
   insertButton.addEventListener('click',()=>{rememberRange();fileInput.click()});
   fileInput.addEventListener('change',()=>{if(fileInput.files?.[0])void insertFile(fileInput.files[0])});
   editor.addEventListener('paste',event=>{
     const files=Array.from(event.clipboardData?.items||[]);
     const image=files.find(x=>x.kind==='file'&&ACCEPT.test(x.type));
     event.preventDefault();
     if(image){const file=image.getAsFile();if(file)void insertFile(file)}
     else insertPlain(event.clipboardData?.getData('text/plain')||'');
   });
   editor.addEventListener('dragover',event=>event.preventDefault());
   editor.addEventListener('drop',event=>{
     event.preventDefault();
     const file=Array.from(event.dataTransfer?.files||[]).find(f=>ACCEPT.test(f.type));
     if(file)void insertFile(file);
     else insertPlain(event.dataTransfer?.getData('text/plain')||'');
   });
   editor.addEventListener('input',()=>{sync();rememberRange()});
   editor.addEventListener('keyup',rememberRange);
   editor.addEventListener('mouseup',rememberRange);
   editor.addEventListener('click',event=>{
     const image=event.target?.closest?.('img.dd-news-edit-image');
     loadSelectedImage(image&&editor.contains(image)?image:null);
   });
   function changeImage(){
     if(!selectedImage?.isConnected)return;
     const old=parse(selectedImage.dataset.newsToken);
     if(!old)return;
     const next={...old,size:size.value,align:align.value};
     setImageStyle(selectedImage,next);sync();
   }
   size.addEventListener('change',changeImage);
   align.addEventListener('change',changeImage);
   remove.addEventListener('click',()=>{
     if(!selectedImage)return;
     selectedImage.remove();loadSelectedImage(null);sync();editor.focus();
   });
   load();
 }
 window.DuoDuoNewsMedia={mount,busy:()=>pending>0,parse,marker,safeURL};
})();