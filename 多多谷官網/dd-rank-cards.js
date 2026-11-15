/* Compact, opt-in ranking cards for event detail only. No event data mutations. */
(()=>{'use strict';
 function header(line){
  let text=String(line||'').trim(),medal='';
  const symbol=text.match(/^([🥇🥈🥉🏅🏆])\s*/u);
  if(symbol){medal=symbol[1];text=text.slice(symbol[0].length).trim()}
  const range=text.match(/^第\s*(\d+)\s*名\s*[～~－—-]\s*(?:第\s*)?(\d+)\s*名$/u)||
              text.match(/^第\s*(\d+)\s*[～~－—-]\s*(\d+)\s*名$/u);
  const single=text.match(/^第\s*(\d+)\s*名$/u);
  if(!range&&!single)return null;
  const first=Number((range||single)[1]),last=range?Number(range[2]):first;
  if(first<1||last<first||last>100000)return null;
  if(!medal)medal=first===1?'🥇':first===2?'🥈':first===3?'🥉':'🏅';
  return {medal,label:range?'第 '+first+'～'+last+' 名':'第 '+first+' 名'};
 }
 function items(line){
  const text=String(line||'').trim();
  if(!text)return null;
  const re=/(?:^|[\s　,，、;；|｜])([^\s　×＊*，,、；;|｜]+)\s*[×＊*]\s*([0-9][0-9,]*)/gu;
  let match,last=0,out=[];
  while((match=re.exec(text))!==null){
   if(text.slice(last,match.index).replace(/[\s　,，、;；|｜]/g,''))return null;
   const amount=match[2].replace(/,/g,'');
   if(!/^[0-9]+$/.test(amount))return null;
   out.push({name:match[1],amount});last=re.lastIndex;
  }
  if(!out.length||text.slice(last).replace(/[\s　,，、;；|｜]/g,''))return null;
  return out;
 }
 function parse(source){
  const text=String(source||'').replace(/\r\n?/g,'\n');
  // Rich format and image tokens remain rendered by the original safe editor path.
  if(/\[\[(?:DDIMG|DDFMT):/i.test(text))return null;
  const lines=text.split('\n'),groups=[],intro=[];
  let current=null;
  for(const raw of lines){
   const line=raw.trim();
   if(!line)continue;
   const rank=header(line);
   if(rank){current={...rank,rewards:[],notes:[]};groups.push(current);continue}
   if(!current){intro.push(line);continue}
   const found=items(line);
   if(found)current.rewards.push(...found);
   else current.notes.push(line);
  }
  if(groups.length<2||groups.some(g=>!g.rewards.length))return null;
  const common=groups[0].notes.filter((line,i,arr)=>arr.indexOf(line)===i&&groups.every(g=>g.notes.includes(line)));
  for(const g of groups)g.notes=g.notes.filter(line=>!common.includes(line));
  return {intro,groups,common};
 }
 function render(source,escapeText){
  const data=parse(source);
  if(!data||typeof escapeText!=='function')return '';
  const esc=x=>escapeText(String(x??''));
  const reward=item=>'<div class="dd-rank-reward"><span class="dd-rank-reward-name">'+esc(item.name)+'</span><strong class="dd-rank-reward-qty">×'+esc(item.amount)+'</strong></div>';
  const cards=data.groups.map(group=>{
   const initial=group.rewards.slice(0,4),remaining=group.rewards.slice(4);
   const description=group.notes.length?'<div class="dd-rank-card-notes">'+group.notes.map(x=>'<div>'+esc(x)+'</div>').join('')+'</div>':'';
   const more=remaining.length?'<details class="dd-rank-more"><summary>查看其餘 '+remaining.length+' 項獎勵</summary><div class="dd-rank-reward-list">'+remaining.map(reward).join('')+'</div></details>':'';
   return '<article class="dd-rank-card"><div class="dd-rank-card-heading"><span class="dd-rank-card-medal" aria-hidden="true">'+esc(group.medal)+'</span><strong>'+esc(group.label)+'</strong><small>'+group.rewards.length+' 項</small></div>'+description+'<div class="dd-rank-reward-list">'+initial.map(reward).join('')+'</div>'+more+'</article>';
  }).join('');
  const intro=data.intro.length?'<div class="dd-rank-intro">'+data.intro.map(esc).join('<br>')+'</div>':'';
  const common=data.common.length?'<aside class="dd-rank-common"><strong>所有上述名次共同獲得</strong><div>'+data.common.map(esc).join('<br>')+'</div></aside>':'';
  return '<div class="dd-rank-module">'+intro+'<div class="dd-rank-grid">'+cards+'</div>'+common+'</div>';
 }
 window.DuoDuoRankCards={parse,render};
})();
