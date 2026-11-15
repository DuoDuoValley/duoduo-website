/* Recognize reward quantity separators used in code announcements; display X.
   Preserve source data, validated image markers, and links. */
(()=>{'use strict';
 const TOKEN_OR_LINK=/(\[\[(?:DDIMG|DDFMT):[^\]\r\n]{1,3200}\]\]|(?:https?:\/\/|www\.)[^\s<>"'\[\]]+)/g;
 const QUANTITY=/([^\s　×xX＊*，,、；;|｜]+)\s*[×xX＊*]\s*(\d[\d,]*(?:\.\d+)?(?:千|萬|億|[Ee])?)(?=$|[\s　,，、;；|｜])/gu;
 function normalize(raw){
  return String(raw??'').split(TOKEN_OR_LINK).map((part,i)=>{
   if(i%2)return part;
   QUANTITY.lastIndex=0;
   return part.replace(QUANTITY,(whole,label,count)=>/[\p{L}]/u.test(label)?label+'X'+count:whole);
  }).join('');
 }
 const ITEM=/([^×xX＊*]+?)\s*[×xX＊*]\s*(\d[\d,]*(?:\.\d+)?(?:千|萬|億|[Ee])?)(?=$|[\s　,，、;；|｜])/g;
 function parseLine(raw){
  const input=String(raw??'').trim();
  if(!input||/\[\[(?:DDIMG|DDFMT):/i.test(input))return null;
  const items=[];let last=0,match;ITEM.lastIndex=0;
  while((match=ITEM.exec(input))!==null){
   if(input.slice(last,match.index).replace(/[\s　,，、;；|｜]/g,''))return null;
   const name=match[1].replace(/^[\s　,，、;；|｜]+|[\s　,，、;；|｜]+$/g,'');
   if(!name||!(/[\p{L}]/u.test(name)))return null;
   items.push({name,count:match[2]});last=ITEM.lastIndex;
  }
  if(!items.length||input.slice(last).replace(/[\s　,，、;；|｜]/g,''))return null;
  return items;
 }
 window.DuoDuoEventRewardQty={normalize,parseLine};
})();
