/* Opt-in compact solo mission reward cards.
   No changes to published activity data or other section renderers. */
(()=>{'use strict';
 const RICH_TOKEN=/\[\[(?:DDIMG|DDFMT):/i;
 function parseItems(raw){
  const text=String(raw||'').trim();
  // Keep manually attached item artwork and custom formatting intact.
  if(!text||RICH_TOKEN.test(text))return null;
  const pattern=/(?:^|[\s　,，、;；|｜])([^\s　×＊*，,、；;|｜]+)\s*[×＊*]\s*([0-9][0-9,]*)/gu;
  let match,last=0,result=[];
  while((match=pattern.exec(text))!==null){
   if(text.slice(last,match.index).replace(/[\s　,，、;；|｜]/g,''))return null;
   const count=match[2].replace(/,/g,'');
   if(!/^\d+$/.test(count))return null;
   result.push({name:match[1],count});last=pattern.lastIndex;
  }
  if(!result.length||text.slice(last).replace(/[\s　,，、;；|｜]/g,''))return null;
  return result;
 }
 function parse(source){
  const lines=String(source??'').replace(/\r\n?/g,'\n').split('\n');
  const rows=[];let awardCount=0;
  for(const raw of lines){
   const line=raw.trim();if(!line)continue;
   const found=parseItems(line);
   if(found){
    awardCount+=found.length;
    if(rows.length&&rows[rows.length-1].kind==='items')rows[rows.length-1].items.push(...found);
    else rows.push({kind:'items',items:found});
   }else rows.push({kind:'feature',text:line});
  }
  // Unrecognized or purely prose content must always use the original renderer.
  if(!awardCount||rows.length>100)return null;
  return {rows,awardCount};
 }
 function render(source,textInline){
  const parsed=parse(source);
  if(!parsed||typeof textInline!=='function')return '';
  const rows=parsed.rows.map(row=>{
   if(row.kind==='feature'){
    return '<div class="dd-solo-feature">'+textInline(row.text)+'</div>';
   }
   return '<div class="dd-solo-grid">'+row.items.map(item=>
    '<div class="dd-solo-reward"><span class="dd-solo-reward-name">'+textInline(item.name)+
    '</span><strong class="dd-solo-reward-qty">×'+item.count+'</strong></div>'
   ).join('')+'</div>';
  }).join('');
  return '<div class="dd-solo-awards">'+rows+'</div>';
 }
 window.DuoDuoSoloRewards={parse,render};
})();
