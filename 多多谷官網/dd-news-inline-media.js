/* DuoDuo announcement image renderer.
   Supports V1 standalone image markers plus V2 natural-size images inline with text.
   No arbitrary markup or image hosts can be rendered from announcement data. */
(()=>{'use strict';
 const TOKEN=/\[\[DDIMG:([^|\]\r\n]{1,2400})\|(auto|25|50|100)\|(inline|left|center|right)\|([^|\]\r\n]{0,450})\]\]/g;
 const EXACT=new RegExp('^'+TOKEN.source+'$');
 const decode=s=>{try{return decodeURIComponent(s)}catch{return ''}};
 const esc=s=>String(s||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function safeURL(value){
   try{
     const u=new URL(String(value||''));
     return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&
       /^[a-z0-9-]+\.supabase\.co$/i.test(u.hostname)&&
       /^\/storage\/v1\/object\/public\/event-images\/events\/[a-zA-Z0-9._%+-]+\.webp$/.test(u.pathname);
   }catch(_){return false}
 }
 function parse(text){
   const m=EXACT.exec(String(text||'').trim());
   if(!m)return null;
   const url=decode(m[1]),alt=decode(m[4]);
   if(!safeURL(url)||alt.length>100)return null;
   return {url,size:m[2],align:m[3],alt};
 }
 function img(info){
   const width=info.size==='auto'?'':' style="max-width:'+info.size+'%"';
   return '<img class="dd-news-inline-asset dd-news-image-'+info.align+'" loading="lazy" decoding="async" src="'+esc(info.url)+'" alt="'+esc(info.alt||'公告插圖')+'"'+width+'>';
 }
 function render(info,forceInline=false){
   const image=img(info);
   if(forceInline||info.align==='inline')return image;
   return '<figure class="dd-news-inline-image dd-news-image-'+info.align+'">'+image+
     (info.alt?'<figcaption>'+esc(info.alt)+'</figcaption>':'')+'</figure>';
 }
 function renderLine(line){
   const info=parse(line);return info?render(info):'';
 }
 // Rich text is stored as a small, explicit token grammar; never render saved HTML.
 const FMT_KEYS=new Set(['B','I','U','S','CRED','CORANGE','CYELLOW','CGREEN','CBLUE','CPURPLE','HYELLOW','HPINK','HGREEN','HBLUE','END']);
 const FMT=/^\[\[DDFMT:([A-Z]+)\]\]$/;
 const MIXED=/\[\[DDIMG:[^\]\r\n]{1,3200}\]\]|\[\[DDFMT:[A-Z]+\]\]/g;
 const fmtTag=key=>key==='B'?'strong':key==='I'?'em':key==='U'?'u':key==='S'?'s':key[0]==='H'?'mark':'span';
 function fmtOpen(key){
   const tag=fmtTag(key);
   return '<'+tag+' class="dd-news-fmt dd-news-fmt-'+key.toLowerCase()+'">';
 }
 function renderInline(raw,formatText){
   const input=String(raw||'');let last=0,found=false,output=[],stack=[];
   MIXED.lastIndex=0;
   let match;
   while((match=MIXED.exec(input))!==null){
     const token=match[0];
     const info=token.startsWith('[[DDIMG:')?parse(token):null;
     const fmt=info?null:token.match(FMT);
     const key=fmt?.[1];
     if(!info&&(!key||!FMT_KEYS.has(key)||(key==='END'&&!stack.length)))continue;
     output.push(formatText(input.slice(last,match.index)));
     if(info)output.push(render(info,true));
     else if(key==='END')output.push('</'+stack.pop()+'>');
     else{stack.push(fmtTag(key));output.push(fmtOpen(key))}
     found=true;last=match.index+token.length;
   }
   if(!found)return null;
   output.push(formatText(input.slice(last)));
   while(stack.length)output.push('</'+stack.pop()+'>');
   return output.join('');
 }
 window.DuoDuoNewsImages={parse,renderLine,renderInline,safeURL};
})();