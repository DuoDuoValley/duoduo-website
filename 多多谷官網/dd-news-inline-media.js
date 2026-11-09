/* Shared, strictly validated image-line renderer for news.html and the home news modal.
   Never renders arbitrary HTML or arbitrary image hosts from announcement text. */
(()=>{'use strict';
 const IMAGE=/^\[\[DDIMG:([^|\]\r\n]{1,2400})\|(25|50|100)\|(left|center|right)\|([^|\]\r\n]{0,450})\]\]$/;
 const decode=value=>{try{return decodeURIComponent(value)}catch{return ''}};
 const html=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function safeURL(value){
   try{
     const u=new URL(String(value||''));
     return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&
       /^[a-z0-9-]+\.supabase\.co$/i.test(u.hostname)&&
       /^\/storage\/v1\/object\/public\/event-images\/events\/[a-zA-Z0-9._%+-]+\.webp$/.test(u.pathname);
   }catch(_){return false}
 }
 function renderLine(line){
   const m=IMAGE.exec(String(line||'').trim());
   if(!m)return '';
   const url=decode(m[1]),alt=decode(m[4]);
   if(!safeURL(url)||alt.length>100)return '';
   return '<figure class="dd-news-inline-image dd-news-image-'+m[3]+'">'+
     '<img loading="lazy" decoding="async" src="'+html(url)+'" alt="'+html(alt||'公告插圖')+
     '" style="max-width:'+m[2]+'%">'+
     (alt?'<figcaption>'+html(alt)+'</figcaption>':'')+
     '</figure>';
 }
 window.DuoDuoNewsImages={renderLine,safeURL};
})();