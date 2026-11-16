/* Compact, opt-in ranking cards for event detail only. No event data mutations. */
(()=>{'use strict';
 function plainTokens(value){
  return String(value||'').replace(/\[\[DDIMG:[^\]\r\n]{1,3200}\]\]/g,'').replace(/\[\[DDFMT:[A-Z]+\]\]/g,'').trim();
 }
 function header(line){
  let text=plainTokens(line),medal='';
  const symbol=text.match(/^([🥇🥈🥉🏅🏆])\s*/u);
  if(symbol){medal=symbol[1];text=text.slice(symbol[0].length).trim()}
  // Solo and team placements use the same compact card layout.
  // Require a complete rank heading to avoid interpreting arbitrary prose as a rank.
  const suffix='(?:\\s*(?:隊伍|隊|組別|組))?';
  const range=text.match(new RegExp('^第\\s*(\\d+)\\s*名\\s*[～~－—-]\\s*(?:第\\s*)?(\\d+)\\s*名'+suffix+'$','u'))||
              text.match(new RegExp('^第\\s*(\\d+)\\s*[～~－—-]\\s*(\\d+)\\s*名'+suffix+'$','u'));
  const single=text.match(new RegExp('^第\\s*(\\d+)\\s*名'+suffix+'$','u'));
  const team=/\s*(?:隊伍|隊|組別|組)$/u.test(text);
  if(!range&&!single)return null;
  const first=Number((range||single)[1]),last=range?Number(range[2]):first;
  if(first<1||last<first||last>100000)return null;
  if(!medal)medal=first===1?'🥇':first===2?'🥈':first===3?'🥉':'🏅';
  return {medal,label:(range?'第 '+first+'～'+last+' 名':'第 '+first+' 名')+(team?'隊伍':'')};
 }
 function items(line){
  const parsed=window.DuoDuoEventRewardQty?.parseLineRich(line);
  return parsed?.map(({name,count})=>({name,amount:count}))||null;
 }
 function parse(source){
  const text=String(source||'').replace(/\r\n?/g,'\n');
  // Rich image tokens in award descriptions are supported and rendered safely.
  const lines=text.split('\n'),groups=[],intro=[];
  let current=null;
  for(const raw of lines){
   const line=raw.trim();
   if(!line)continue;
   const rank=header(line);
   if(rank){current={...rank,rewards:[],notes:[]};groups.push(current);continue}
   if(!current){intro.push(line);continue}
   // Every numbered prize stays inside its own rank, including appearance
   // medals/titles and image-backed prizes. One or many per input line works.
   const found=items(line);
   if(found)current.rewards.push(...found);
   else{
    // Never silently drop arbitrary pasted images from other item rows.
    if(/\[\[DDIMG:/.test(line)&&/[×xX＊*]\s*\d/.test(plainTokens(line)))return null;
    current.notes.push(line);
   }
  }
  if(groups.length<2||groups.some(g=>!g.rewards.length))return null;
  // All ranks keep their own rewards. Never create a shared-award panel.
  return {intro,groups};
 }
 function render(source,escapeText){
  const data=parse(source);
  if(!data||typeof escapeText!=='function')return '';
  const esc=x=>escapeText(String(x??''));
  const rich=x=>{
   const text=window.DuoDuoEventRewardQty?.normalize(String(x??''))??String(x??'');
   // Uses the existing validated DDIMG/DDFMT renderer; never outputs raw HTML.
   const result=window.DuoDuoNewsImages?.renderInline(text,part=>esc(part));
   return result===null||result===undefined?esc(text):result;
  };
  // Manual images use dd-item-inline to avoid duplicating an automatic icon.
  const reward=item=>'<div class="dd-rank-reward"><span class="dd-rank-reward-name'+(/\[\[DDIMG:/.test(item.name)?' dd-item-inline':'')+'">'+rich(item.name)+'</span><strong class="dd-rank-reward-qty">X'+esc(item.amount)+'</strong></div>';
  const cards=data.groups.map(group=>{
   const initial=group.rewards.slice(0,4),remaining=group.rewards.slice(4);
   const description=group.notes.length?'<div class="dd-rank-card-notes">'+group.notes.map(x=>'<div>'+rich(x)+'</div>').join('')+'</div>':'';
   const more=remaining.length?'<details class="dd-rank-more"><summary>查看其餘 '+remaining.length+' 項獎勵</summary><div class="dd-rank-reward-list">'+remaining.map(reward).join('')+'</div></details>':'';
   return '<article class="dd-rank-card"><div class="dd-rank-card-heading"><span class="dd-rank-card-medal" aria-hidden="true">'+esc(group.medal)+'</span><strong>'+esc(group.label)+'</strong><small>'+group.rewards.length+' 項</small></div>'+description+'<div class="dd-rank-reward-list">'+initial.map(reward).join('')+'</div>'+more+'</article>';
  }).join('');
  const intro=data.intro.length?'<div class="dd-rank-intro">'+data.intro.map(rich).join('<br>')+'</div>':'';
  return '<div class="dd-rank-module">'+intro+'<div class="dd-rank-grid">'+cards+'</div></div>';
 }
 window.DuoDuoRankCards={parse,render};
})();
