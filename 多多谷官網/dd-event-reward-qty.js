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
 // Parse previously uploaded item icons without confusing image URLs
 // (e.g. IMGX10.webp) with reward quantities.
 const RICH_TOKENS=/\[\[DDIMG:[^\]\r\n]{1,3200}\]\]|\[\[DDFMT:[A-Z]+\]\]/g;
 const RICH_QTY=/[×xX＊*]\s*(\d[\d,]*(?:\.\d+)?(?:千|萬|億)?)(?=$|[\s　,，、;；|｜])/gu;
 function parseLineRich(raw){
  const input=String(raw??'').trim();
  if(!input||input.length>15000)return null;
  const tokens=[];let invalid=false;
  const protectedText=input.replace(RICH_TOKENS,token=>{
   if(token.startsWith('[[DDIMG:')&&!window.DuoDuoNewsImages?.parse(token))invalid=true;
   if(tokens.length>=1000){invalid=true;return ''}
   return String.fromCharCode(0xe000+tokens.push(token)-1);
  });
  if(invalid||/\[\[(?:DDIMG|DDFMT):/i.test(protectedText))return null;
  const restore=value=>value.replace(/[\ue000-\ue3e7]/g,x=>tokens[x.charCodeAt(0)-0xe000]||'');
  const items=[];let last=0,match;RICH_QTY.lastIndex=0;
  while((match=RICH_QTY.exec(protectedText))!==null){
   const field=protectedText.slice(last,match.index).replace(/^[\s　,，、;；|｜]+|[\s　,，、;；|｜]+$/g,'');
   const name=restore(field);
   const plain=name.replace(RICH_TOKENS,'').trim();
   if(!name||!(/[\p{L}]/u.test(plain)))return null;
   items.push({name,count:match[1]});last=RICH_QTY.lastIndex;
  }
  if(!items.length||protectedText.slice(last).replace(/[\s　,，、;；|｜]/g,''))return null;
  return items;
 }
 window.DuoDuoEventRewardQty={normalize,parseLine,parseLineRich};
})();
