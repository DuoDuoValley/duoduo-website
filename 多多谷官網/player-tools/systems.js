(() => {
const D=window.DUODUO_SYSTEM_DATA, $=id=>document.getElementById(id), imgFor=(key,fallback)=>window.duoduoImageFor?window.duoduoImageFor(key,fallback):fallback, fmt=n=>Number(n||0).toLocaleString('zh-TW',{maximumFractionDigits:2}), pct=n=>`${(n*100).toFixed(1).replace(/\.0$/,'')}%`;
const icons={'楓幣':'assets/mesos.png','楓葉點數':'assets/maple-points.png','基礎強化石':'assets/basic-stone.png','卓越強化石':'assets/excellent-stone.png','極限強化石':'assets/extreme-stone.png','昇華結晶':'assets/ascension-crystal.png','幸運石':'assets/lucky-stone.png','激戰的痕跡':'assets/battle-trace.png','艾里溫的碎片':'assets/ellium-fragment.png','時尚隨機箱':'assets/fashion-box.png'};
let kind='totem',tier='basic',level=0,attempts=0,successes=0,consumed={},consumedByStage={},logs=[],money=0;
const targetName=()=>kind==='totem'?$('systemTarget').value:kind==='liner'?$('linerTarget').value:`${({basic:'基礎',excellent:'卓越',extreme:'極限'})[tier]}阿斯特拉輔助武器`;
function steps(){return kind==='totem'?D.totem:kind==='liner'?D.liner:D.astra[tier];}
function attrs(){return kind==='totem'?['全屬性','攻魔','Boss%']:kind==='liner'?['全屬性','攻魔']:tier==='basic'?['全屬性','攻魔']:tier==='excellent'?['全屬性','攻魔','無視%','傷害%']:['全屬性','攻魔','Boss%','全屬性%'];}
function expandedAttrs(names,values){return names.flatMap((n,i)=>n==='攻魔'?[['攻擊力',values[i]??0],['魔法攻擊力',values[i]??0]]:[[n,values[i]??0]]);}
function step(){return steps()[level]||null}
function luckAllowed(){return kind==='astra'}
function chance(){return Math.min(1,(step()?.prob||0)+(luckAllowed()?Number($('systemLuck').value)*.05:0))}
function needs(s=step()){if(!s)return{};let m={...(s.materials||{})};if(kind==='totem'||kind==='liner')m['楓幣']=Number(s.mesosM||0)*1000000;if(luckAllowed()&&Number($('systemLuck').value)>0)m['幸運石']=Number($('systemLuck').value);return m}
function iconFor(n){return kind==='totem'&&window.DUODUO_TOTEM_MATERIAL_ICONS?.[n]?window.DUODUO_TOTEM_MATERIAL_ICONS[n]:(icons[n]||'assets/material-1.png')}
function renderItems(obj){let entries=Object.entries(obj||{});return entries.length?entries.map(([n,q])=>`<div class="material-item"><img src="${iconFor(n)}" alt=""><div><span>${n}</span><strong>${fmt(q)} ${n==='楓幣'?'楓幣':n==='楓葉點數'?'點':'個'}</strong></div></div>`).join(''):'<div class="empty-state">目前無需材料。</div>'}
function sums(to=level){let a=Array(attrs().length).fill(0);for(let i=0;i<to;i++)steps()[i].attrs.forEach((v,j)=>a[j]=(a[j]||0)+Number(v||0));return a}
function fillLevels(){const max=steps().length;$('systemStart').innerHTML='';$('systemTargetLevel').innerHTML='';for(let i=0;i<=max;i++){for(const id of ['systemStart','systemTargetLevel']){let o=document.createElement('option');o.value=i;o.textContent=`${i} 級`;$ (id).append(o)}}$('systemStart').value=level;$('systemTargetLevel').value=Math.min(max,level+1)}
function render(){
 const max=steps().length,s=step(),luck=luckAllowed()?Number($('systemLuck').value):0,base=s?s.prob:0;
 const labels={totem:['圖騰強化','TOTEM ENHANCEMENT','assets/category-totem.png','選擇圖騰，查看各階段成功率、能力提升與材料消耗。圖騰強化不可使用幸運石。'],liner:['內襯強化','LINER ENHANCEMENT','assets/category-liner.png','選擇內襯部位，查看各階段成功率、能力提升與材料消耗。內襯強化不可使用幸運石。'],astra:['阿斯特拉輔助武器強化','ASTRA SUB-WEAPON','assets/category-astra.png','選擇基礎、卓越或極限強化，試算成功率、材料與貨幣消耗。']}[kind];
 $('systemHeading').textContent=labels[0];$('systemDescription').textContent=labels[3];$('systemHeadIcon').innerHTML=`<img src="${imgFor('category-'+kind,labels[2])}" alt="">`;$('systemArtTitle').textContent=labels[0];$('systemArtSubtitle').textContent=labels[1];const targetArt=(()=>{
   if(kind==='totem'){
     const n=$('systemTarget').value;
     const key={'輪迴碑石':'totem-target-輪迴碑石','彩虹月石寶石圖騰':'totem-target-彩虹月石寶石圖騰','小筱精靈圖騰':'totem-target-小筱精靈圖騰'}[n];
      const fallback=n==='輪迴碑石'?'assets/totem-reincarnation.png':n==='彩虹月石寶石圖騰'?'assets/totem-rainbow.png':'assets/totem-xiaoxiao.png';return imgFor(key,fallback);
   }
   if(kind==='liner'){
     const n=$('linerTarget').value;
     const map={'帽子內襯':'assets/liner-hat.png','臉飾內襯':'assets/liner-face.png','武器內襯':'assets/liner-weapon.png','鞋子內襯':'assets/liner-shoes.png','套服內襯':'assets/liner-suit.png','披風內襯':'assets/liner-cape.png'};
     return imgFor('liner-target-'+n,map[n]||labels[2]);
   }
   return imgFor('astra-target-'+tier,labels[2]);
 })();
 $('systemArt').querySelector('.system-art-icon').innerHTML=`<img src="${targetArt}" alt="">`;$('systemTargetWrap').style.display=kind==='totem'?'':'none';$('systemTierWrap').style.display=kind==='astra'?'':'none';$('linerTargetWrap').style.display=kind==='liner'?'':'none';$('systemLuckControl').style.display=luckAllowed()?'':'none';$('systemLuckRateRow').style.display=luckAllowed()?'':'none';$('systemLuckNotice').textContent=luckAllowed()?'幸運石每顆增加 5 個百分點，最多 6 顆，成功率上限 100%。':'此類強化不可使用幸運石，成功率依原始設定計算。';
 $('systemLuckLabel').textContent=luck;
 if($('systemLuckItems')) $('systemLuckItems').innerHTML=Array.from({length:6},(_,i)=>`<img class="luck-item ${i<luck?'used':''}" src="${icons['幸運石']}" alt="幸運石 ${i+1}">`).join('');
 $('systemBaseRate').textContent=pct(base);$('systemLuckRate').textContent=`+${pct(luck*.05)}`;$('systemFinalRate').textContent=pct(Math.min(1,base+luck*.05));
 $('systemLevelTitle').textContent=kind==='astra'?`${({basic:'基礎',excellent:'卓越',extreme:'極限'})[tier]}強化 ${level} 級`:`${targetName()} ${level} 級`;$('systemLevelBadge').textContent=`${level} / ${max}`;$('systemProgress').style.width=`${level/max*100}%`;
 $('systemNextStep').innerHTML=s?`下一階段：<strong>${s.label}</strong><br>${expandedAttrs(attrs(),s.attrs).map(([n,v])=>`${n} +${v}`).join('　／　')}`:'<strong>已達最高等級</strong><br>目前已完成此類型的全部強化。';
 $('systemStats').innerHTML=expandedAttrs(attrs(),sums()).map(([n,v])=>`<div class="stat-tile"><span>${n}累積</span><strong>+${fmt(v)}</strong></div>`).join('');
 $('systemMaterials').innerHTML=renderItems(needs());$('systemCumulative').innerHTML=kind==='totem'?renderTotemCumulative():renderItems(consumed);
 $('systemAttempts').textContent=fmt(attempts);$('systemSuccesses').textContent=fmt(successes);$('systemObserved').textContent=attempts?`${(successes/attempts*100).toFixed(1)}%`:'—';
 $('systemAttempt').disabled=!s;$('systemToTarget').disabled=!s;$('systemStart').value=level;
 $('systemLog').innerHTML=logs.length?logs.slice(0,15).map(x=>`<div class="log-entry ${x.ok?'success':'fail'}"><span>${x.ok?'✓':'✕'} ${x.label}</span><span>${x.ok?'成功':'失敗'} · ${x.rate}</span></div>`).join(''):'<div class="empty-state">尚無強化紀錄</div>';
}
function renderTotemCumulative(){const groups=Object.entries(consumedByStage).filter(([,items])=>Object.values(items).some(v=>Number(v)>0));return groups.length?groups.map(([stage,items])=>`<div class="totem-cumulative-stage"><strong>${stage} 失敗累積</strong><div class="material-list">${renderItems(items)}</div></div>`).join(''):'<div class="empty-state">尚無強化失敗材料消耗</div>'}
function attempt(silent=false){const s=step();if(!s)return false;const n=needs(s),rate=chance(),ok=Math.random()<rate;attempts++;if(ok){successes++;level++}else if(kind==='totem'){const stage=s.label;consumedByStage[stage]=consumedByStage[stage]||{};Object.entries(n).forEach(([k,v])=>consumedByStage[stage][k]=(consumedByStage[stage][k]||0)+Number(v||0));}else{Object.entries(n).forEach(([k,v])=>consumed[k]=(consumed[k]||0)+Number(v||0));}logs.unshift({ok,label:`${s.label}（${targetName()}）`,rate:pct(rate)});if(!silent){$('systemMessage').className=`message ${ok?'success':'fail'}`;$('systemMessage').textContent=ok?`強化成功！目前等級提升至 ${level} 級。`:`強化失敗，等級維持 ${level} 級；本次材料仍已消耗。`}return ok}
function reset(){level=attempts=successes=money=0;consumed={};consumedByStage={};logs=[];$('systemMessage').className='message neutral';$('systemMessage').textContent='模擬已重設。';fillLevels();render()}
function changeKind(nextKind){kind=nextKind; if(!luckAllowed())$('systemLuck').value='0'; level=attempts=successes=0;consumed={};consumedByStage={};logs=[];$('systemMessage').className='message neutral';$('systemMessage').textContent='選擇設定後，開始模擬強化。';fillLevels();render()}
window.setDuoduoSystemKind=changeKind;$('systemTier').addEventListener('change',()=>{tier=$('systemTier').value;reset()});
$('systemTarget').addEventListener('change',()=>{reset()});$('linerTarget').addEventListener('change',()=>{reset()});
$('systemStart').addEventListener('change',e=>{level=Number(e.target.value);attempts=successes=0;consumed={};consumedByStage={};logs=[];if(Number($('systemTargetLevel').value)<=level)$('systemTargetLevel').value=Math.min(steps().length,level+1);render()});
$('systemLuck').addEventListener('input',render);
$('systemAttempt').addEventListener('click',()=>{attempt();render()});
$('systemToTarget').addEventListener('click',()=>{const target=Number($('systemTargetLevel').value);if(target<=level){$('systemMessage').className='message neutral';$('systemMessage').textContent='目標等級必須高於目前等級。';return}let guard=0,before=attempts;while(level<target&&guard++<10000)attempt(true);$('systemMessage').className=`message ${level>=target?'success':'fail'}`;$('systemMessage').textContent=level>=target?`已達成目標 ${target} 級！本次共嘗試 ${attempts-before} 次。`:'已達模擬安全上限。';render()});
$('systemReset').addEventListener('click',reset);$('systemClearLog').addEventListener('click',()=>{logs=[];render()});
fillLevels();render();
})();