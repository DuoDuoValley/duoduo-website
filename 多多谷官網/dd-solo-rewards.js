/* Solo clear uses existing ranking card layout/expand behavior.
   Never mutates published event content or original pasted images. */
(()=>{'use strict';
 function parse(source){
  const helper=window.DuoDuoEventRewardQty;if(!helper)return null;
  const lines=String(source??'').replace(/\r\n?/g,'\n').split('\n');
  const notes=[],rewards=[];let sawReward=false;
  for(const raw of lines){
   const line=raw.trim();if(!line)continue;
   // Featured selection ticket stays above the list as before.
   const special=/\[\[DDIMG:/.test(line)&&/(?:特效選擇券|專屬勳章|專屬稱號)/u.test(line);
   const parsed=(!sawReward&&special)?null:helper.parseLineRich(line);
   if(parsed){rewards.push(...parsed);sawReward=true}
   else {
    if(sawReward)return null; // preserve atypical ordering via original renderer
    notes.push(line);
   }
  }
  if(!rewards.length||rewards.length>150||notes.length>30)return null;
  return {notes,rewards};
 }
 function render(source,textInline){
  const data=parse(source);
  if(!data||typeof textInline!=='function')return '';
  const normalize=window.DuoDuoEventRewardQty.normalize;
  const itemHTML=item=>'<div class="dd-rank-reward"><span class="dd-rank-reward-name'+(/\[\[DDIMG:/.test(item.name)?' dd-item-inline':'')+'">'+textInline(item.name)+'</span><strong class="dd-rank-reward-qty">X'+item.count+'</strong></div>';
  const notes=data.notes.length?'<div class="dd-rank-card-notes dd-solo-notes">'+data.notes.map(line=>'<div>'+textInline(normalize(line))+'</div>').join('')+'</div>':'';
  const first=data.rewards.slice(0,4),extra=data.rewards.slice(4);
  const more=extra.length?'<details class="dd-rank-more"><summary>查看其餘 '+extra.length+' 項獎勵</summary><div class="dd-rank-reward-list">'+extra.map(itemHTML).join('')+'</div></details>':'';
  const heading='<div class="dd-rank-card-heading"><span class="dd-rank-card-medal" aria-hidden="true">🎁</span><strong>擊破獎勵</strong><small>'+data.rewards.length+' 項</small></div>';
  return '<div class="dd-rank-module dd-solo-module"><div class="dd-rank-grid"><article class="dd-rank-card dd-solo-card">'+heading+notes+
   '<div class="dd-rank-reward-list">'+first.map(itemHTML).join('')+'</div>'+more+'</article></div></div>';
 }
 window.DuoDuoSoloRewards={parse,render};
})();
