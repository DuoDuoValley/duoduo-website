/* DuoDuo Valley - BOSS entry rules, reward thresholds & exact HP calculator. */
(()=>{'use strict';
const anchor=document.getElementById('ddBossAtlas');if(!anchor)return;
const API=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
const publicGroups=['初階','中階','高階','終極'];
const assetNames=new Set(['凡雷恩','凱伊','卡翁','受選的賽蓮','史烏','咖凌','威爾','守護天使綠水靈','巴德利斯','希拉','戴斯克','戴米安','拉圖斯','斑斑','最初的敵對者','林波','梅格耐斯','森蘭丸','比艾樂','燦爛的凶星','瑪麗西亞','監視者卡洛斯','真希拉','粉豆','血腥皇后','西格諾斯','貝倫','阿卡伊農','露希妲','頓凱爾','黑魔法師']);
const diffNames=new Set(['簡單','普通','困難','混沌','終極']);
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const label=['','一階段','二階段','三階段','四階段'];
const baseUrl='assets/boss-atlas/calculator-ui/';
const nameImage=name=>assetNames.has(name)?baseUrl+encodeURIComponent(name)+'.png':'';
const diffImage=name=>diffNames.has(name)?'assets/boss-atlas/difficulties/'+encodeURIComponent(name)+'.png':'';
const units=[['京',10000000000000000n],['兆',1000000000000n],['億',100000000n],['萬',10000n]];
const unitMap=new Map([...units,['',1n]]);
function parseChineseNumber(source){
 const clean=String(source).replace(/[\s,，]/g,'');if(!clean)throw Error('缺少血量數值');
 let rest=clean,total=0n;
 while(rest){
  const m=rest.match(/^(\d+(?:\.\d+)?)(京|兆|億|萬)?/);
  if(!m||!m[0])throw Error('無法解析血量：'+clean);
  const num=m[1],unit=m[2]||'',scale=unitMap.get(unit);
  const [whole,frac='']=num.split('.');const denominator=10n**BigInt(frac.length);
  const numerator=BigInt(whole+frac)*scale;
  if(numerator%denominator!==0n)throw Error('血量精度不足：'+clean);
  total+=numerator/denominator;rest=rest.slice(m[0].length);
 }
 return total;
}
function parseFormula(value){
 const clean=String(value).replace(/[\s,，]/g,'').replace(/＋/g,'+').replace(/[＊*]/g,'×');
 if(!clean)throw Error('缺少血量');
 return clean.split('+').reduce((sum,part)=>{
  const factors=part.split('×');
  if(factors.length>2||!factors[0])throw Error('血量公式格式不支援');
  const amount=parseChineseNumber(factors[0]);
  if(factors.length===1)return sum+amount;
  if(!/^\d+$/.test(factors[1])||BigInt(factors[1])>1000n)throw Error('重複次數格式不支援');
  return sum+amount*BigInt(factors[1]);
 },0n);
}
function parseHp(raw){
 const value=String(raw??'').trim();
 if(!value||value.includes('尚未')||value==='—')throw Error('此難度尚未提供血量資料');
 const markers=[...value.matchAll(/\(([1-9])\)/g)];
 const sections=[];
 if(markers.length){
  for(let i=0;i<markers.length;i++){
   const begin=markers[i].index+markers[i][0].length;
   const end=i+1<markers.length?markers[i+1].index:value.length;
   sections.push({stage:Number(markers[i][1]),text:value.slice(begin,end).trim()});
  }
 }else sections.push({stage:0,text:value});
 return sections.map(section=>{
  const variants=section.text.split(/[／/]/).map(s=>s.trim());
  if(variants.some(s=>!s))throw Error('階段血量缺少數值');
  return {...section,variants:variants.map(text=>({text,value:parseFormula(text)}))};
 });
}
function formatHp(value){
 value=BigInt(value);if(value===0n)return '0';
 let output='';
 for(const [unit,base] of units){const n=value/base;if(n){output+=n.toString()+unit;value%=base;}}
 if(value)output+=value.toString();return output;
}
function ceilDiv(a,b){return (a+b-1n)/b;}
// Reward shares remain the same at every 10x+ HP multiplier. 1x retains
// its distinct published percentages; multiplier affects HP, not the shares.
const rewardRates={1:[100,10,15,20,25,30],10:[100,20,30,40,50,60]};
const rewardRateFor=(multiplier,party)=>rewardRates[multiplier===1?1:10][party-1];
const root=document.createElement('section');root.id='ddBossChallenge';root.setAttribute('aria-label','BOSS 挑戰規則與血量計算機');
root.innerHTML=`
 <div class="bc-header"><div><div class="bc-kicker">CHALLENGE GUIDE</div><h2>BOSS 挑戰指南與血量計算機</h2></div><p class="bc-intro">入場次數、獎勵門檻與血量倍率，一次查清楚。</p></div>
 <div class="bc-guides">
  <section class="bc-card" aria-labelledby="bc-entry-title"><div class="bc-card-head"><span class="bc-head-icon" aria-hidden="true">◷</span><h3 id="bc-entry-title">入場次數說明</h3></div><div class="bc-rule-list">
   <div class="bc-rule"><span class="bc-rule-type">初階 BOSS</span><span class="bc-rule-badges"><img src="assets/boss-atlas/difficulties/簡單.png" alt="簡單" loading="lazy"><img src="assets/boss-atlas/difficulties/普通.png" alt="普通" loading="lazy"></span><strong class="bc-rule-limit">每日可進行 1 次</strong></div>
   <div class="bc-rule"><span class="bc-rule-type">中階 BOSS</span><span class="bc-rule-badges bc-rule-badges--three"><img src="assets/boss-atlas/difficulties/簡單.png" alt="簡單" loading="lazy"><img src="assets/boss-atlas/difficulties/普通.png" alt="普通" loading="lazy"><img src="assets/boss-atlas/difficulties/混沌.png" alt="混沌" loading="lazy"></span><strong class="bc-rule-limit">每日可進行 1 次</strong></div>
   <div class="bc-rule"><span class="bc-rule-type">高階 BOSS</span><span class="bc-rule-badges"><img src="assets/boss-atlas/difficulties/普通.png" alt="普通" loading="lazy"><img src="assets/boss-atlas/difficulties/困難.png" alt="困難" loading="lazy"></span><strong class="bc-rule-limit">每日可進行 1 次</strong></div>
   <div class="bc-rule"><span class="bc-rule-type">終極 BOSS</span><span class="bc-rule-badges"><img src="assets/boss-atlas/difficulties/普通.png" alt="普通" loading="lazy"></span><strong class="bc-rule-limit">每日可進行 1 次</strong><small class="bc-rule-exception">※ 燦爛的凶星除外</small></div>
   <div class="bc-rule"><span class="bc-rule-type">終極 BOSS</span><span class="bc-rule-badges"><img src="assets/boss-atlas/difficulties/困難.png" alt="困難" loading="lazy"><img src="assets/boss-atlas/difficulties/終極.png" alt="終極" loading="lazy"></span><strong class="bc-rule-limit">每週可進行 1 次</strong></div>
  </div></section>
  <section class="bc-card" aria-labelledby="bc-reward-title"><div class="bc-card-head"><span class="bc-head-icon" aria-hidden="true">◇</span><h3 id="bc-reward-title">獎勵門檻計算規則</h3></div>
   <p class="bc-description">隊員必須達到個人輸出門檻才可獲得獎勵。<strong>個人門檻＝BOSS 總血量 × 倍率 ÷ 隊伍人數 × 需求比例</strong>。</p>
   <div class="bc-rate-table-wrap"><table class="bc-rate-table" aria-label="各隊伍人數的獎勵需求比例"><thead><tr><th scope="col">倍率</th>${[1,2,3,4,5,6].map(n=>`<th scope="col">${n} 人</th>`).join('')}</tr></thead><tbody>
   <tr><th scope="row">1 倍</th>${rewardRates[1].map(n=>`<td>${n}%</td>`).join('')}</tr>
   <tr><th scope="row">10 倍以上</th>${rewardRates[10].map(n=>`<td>${n}%</td>`).join('')}</tr>
   </tbody></table></div>
   <p class="bc-note"><strong>範例：</strong>1 倍 BOSS 總血量 1.6 兆、2 人隊伍，每人至少輸出 800 億。10～70 倍及更高倍率皆沿用 10 倍的隊伍需求比例，僅血量依所選倍率變化。</p>
  </section>
 </div>
 <section class="bc-card bc-calc" aria-labelledby="bc-calc-title">
  <div class="bc-calc-heading"><div class="bc-card-head" style="margin:0"><span class="bc-head-icon" aria-hidden="true">×</span><h3 id="bc-calc-title">BOSS 血量倍率計算機</h3></div><span class="bc-pill">依 BOSS 難度與階段換算</span></div>
  <div class="bc-calc-body">
   <div class="bc-controls">
    <label id="bc-boss-label" class="bc-label">① 選擇 BOSS</label>
    <div class="bc-picker-wrap"><button type="button" class="bc-picker" id="bc-picker" aria-haspopup="listbox" aria-expanded="false" aria-controls="bc-menu" aria-labelledby="bc-boss-label bc-picked"><span class="bc-picked" id="bc-picked">正在載入 BOSS…</span><span class="bc-picker-arrow" aria-hidden="true">⌄</span></button><div id="bc-menu" class="bc-picker-menu" role="listbox" aria-label="選擇 BOSS" hidden><div id="bc-picker-grid" class="bc-picker-grid"></div></div></div>
    <label class="bc-label" style="margin-top:13px">② 選擇難度</label><div id="bc-difficulties" class="bc-difficulties" role="group" aria-label="選擇 BOSS 難度"></div>
    <div class="bc-form-grid">
     <div class="bc-field"><label for="bc-multiplier" class="bc-label">③ 血量倍率</label><select id="bc-multiplier">${[1,10,20,30,40,50,60,70].map(n=>`<option value="${n}" ${n===10?'selected':''}>${n} 倍</option>`).join('')}<option value="custom">自訂倍率…</option></select></div>
     <div class="bc-field"><label for="bc-team" class="bc-label">④ 隊伍人數</label><select id="bc-team">${[1,2,3,4,5,6].map(n=>`<option value="${n}" ${n===2?'selected':''}>${n} 人</option>`).join('')}</select></div>
    </div>
    <div id="bc-custom-wrap" class="bc-field" hidden><label for="bc-custom-multiplier" class="bc-label">自訂倍數（1～10000）</label><input id="bc-custom-multiplier" type="number" inputmode="numeric" min="1" max="10000" step="1" value="80"></div>
    <p class="bc-hint">使用圖鑑的原始血量逐階段換算；未提供血量的難度不會猜測數字。</p>
   </div>
   <div class="bc-output" id="bc-result" aria-live="polite"><div class="bc-status">載入 BOSS 資料後即可開始計算。</div></div>
  </div>
 </section>`;
anchor.parentNode.insertBefore(root,anchor);
const $=id=>root.querySelector('#'+id);
let bosses=[],bossId='',diffName='',variantChoices={},baselineBosses=[];
function reconcileKnownHp(snapshot){
 if(!snapshot||!Array.isArray(snapshot.bosses))return snapshot;
 const revision=Number(snapshot.dataRevision||1);
 if(revision>=3)return snapshot;
 const normalized=structuredClone(snapshot);
 const baseline=new Map(baselineBosses.map(b=>[b.id,b]));
 for(const b of normalized.bosses){
  const source=baseline.get(b.id)||baselineBosses.find(x=>x.name===b.name);
  if(!source||!Array.isArray(b.difficulties))continue;
  if(revision<2&&b.name==='燦爛的凶星')b.difficulties=b.difficulties.filter(d=>d.name==='普通'||d.name==='困難');
  for(const d of b.difficulties){
   const fallback=source.difficulties?.find(x=>x.name===d.name);
   if((d.hp==null||String(d.hp).trim()==='')&&fallback?.hp)d.hp=fallback.hp;
   if(revision<2&&b.name==='燦爛的凶星'&&fallback?.hp)d.hp=fallback.hp;
  }
 }
 return normalized;
}
const closeMenu=()=>{$('bc-menu').hidden=true;$('bc-picker').setAttribute('aria-expanded','false');};
function currentBoss(){return bosses.find(b=>b.id===bossId);}
function currentDiff(){return currentBoss()?.difficulties?.find(d=>d.name===diffName);}
function renderSelection(){
 const b=currentBoss();if(!b)return;
 $('bc-picked').innerHTML=nameImage(b.name)?`<img src="${nameImage(b.name)}" alt="${escapeHTML(b.name)}">`:`<span class="bc-picker-fallback">${escapeHTML(b.name)}</span>`;
 $('bc-picker-grid').innerHTML=bosses.map(x=>`<button type="button" role="option" class="bc-boss-choice" data-id="${escapeHTML(x.id)}" aria-selected="${x.id===bossId}" title="${escapeHTML(x.name)}">${nameImage(x.name)?`<img src="${nameImage(x.name)}" alt="${escapeHTML(x.name)}" loading="lazy">`:`<span>${escapeHTML(x.name)}</span>`}</button>`).join('');
 $('bc-difficulties').innerHTML=(b.difficulties||[]).map(d=>`<button type="button" class="bc-diff" data-diff="${escapeHTML(d.name)}" aria-pressed="${d.name===diffName}">${diffImage(d.name)?`<img src="${diffImage(d.name)}" alt="${escapeHTML(d.name)}">`:escapeHTML(d.name)}</button>`).join('');
 renderResult();
}
function renderResult(){
 const difficulty=currentDiff();const result=$('bc-result');if(!difficulty){result.innerHTML='<p class="bc-error">請選擇 BOSS 及難度。</p>';return;}
 const selection=$('bc-multiplier').value;
 $('bc-custom-wrap').hidden=selection!=='custom';
 const n=selection==='custom'?Number($('bc-custom-multiplier').value):Number(selection);
 const party=Number($('bc-team').value);
 if(!Number.isSafeInteger(n)||n<1||n>10000){result.innerHTML='<p class="bc-error">請輸入介於 1～10000 的整數倍率。</p>';return;}
 let sections;try{sections=parseHp(difficulty.hp);}catch(error){result.innerHTML=`<div class="bc-output-title">${escapeHTML(difficulty.name)} · ${n} 倍</div><p class="bc-error">${escapeHTML(error.message)}</p>`;return;}
 let total=0n;const rows=[];
 for(const section of sections){
  const key=String(section.stage),choice=Number(variantChoices[key]||0);
  const index=Math.max(0,Math.min(choice,section.variants.length-1));const chosen=section.variants[index];
  total+=chosen.value;
  rows.push(`<div class="bc-stage"><span class="bc-stage-label">${section.stage?label[section.stage]:'基礎血量'}</span><strong>${formatHp(chosen.value)} × ${n} ＝ ${formatHp(chosen.value*BigInt(n))}</strong></div>`);
  if(section.variants.length>1)rows.push(`<div class="bc-alternative"><span>${section.stage?label[section.stage]:'血量'}有不同路線，請選擇：</span><select data-stage="${key}" aria-label="${section.stage?label[section.stage]:'血量'}路線">${section.variants.map((v,i)=>`<option value="${i}" ${i===index?'selected':''}>${escapeHTML(v.text)}</option>`).join('')}</select></div>`);
 }
 const adjusted=total*BigInt(n);
 const labelTitle=`${escapeHTML(difficulty.name)} · ${n} 倍 · ${party} 人`;
 const rate=rewardRateFor(n,party);
 const min=ceilDiv(adjusted*BigInt(rate),BigInt(party)*100n);
 const gate=`<div class="bc-gate"><strong>每位隊員獎勵門檻</strong><span class="bc-gate-value">${formatHp(min)}</span><div class="bc-status">${formatHp(adjusted)} ÷ ${party} 人 × ${rate}%（向上取整）</div></div>`;
 result.innerHTML=`<div class="bc-output-head"><span class="bc-output-title">換算後 BOSS 總血量</span><span class="bc-output-badge">${labelTitle}</span></div><div class="bc-total">${formatHp(adjusted)}</div><div class="bc-stage-list">${rows.join('')}</div>${gate}`;
}
$('bc-picker').addEventListener('click',()=>{const menu=$('bc-menu');menu.hidden=!menu.hidden;$('bc-picker').setAttribute('aria-expanded',String(!menu.hidden));});
$('bc-menu').addEventListener('click',e=>{const button=e.target.closest('[data-id]');if(!button)return;bossId=button.dataset.id;diffName=currentBoss()?.difficulties?.[0]?.name||'';variantChoices={};closeMenu();renderSelection();});
root.addEventListener('click',e=>{const button=e.target.closest('[data-diff]');if(!button)return;diffName=button.dataset.diff;variantChoices={};renderSelection();});
root.addEventListener('change',e=>{if(e.target.matches('[data-stage]')){variantChoices[e.target.dataset.stage]=e.target.value;renderResult();}else if(['bc-multiplier','bc-team'].includes(e.target.id))renderResult();});
root.addEventListener('input',e=>{if(e.target.id==='bc-custom-multiplier')renderResult();});
document.addEventListener('pointerdown',e=>{if(!root.contains(e.target)||!e.target.closest('.bc-picker-wrap'))closeMenu();},true);
root.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
function accept(data){
 if(!data||!Array.isArray(data.bosses))return;
 // The public reader does not show records flagged as unpublished.
 const items=data.bosses.filter(b=>b&&b.published!==false&&!['尤比太'].includes(b.name)&&Array.isArray(b.difficulties));
 bosses=items.filter(b=>b.difficulties.length).sort((a,b)=>{
  const d=publicGroups.indexOf(a.group)-publicGroups.indexOf(b.group);return d||0;
 });
 if(!bosses.length){$('bc-picked').textContent='目前沒有可選擇的 BOSS';return;}
 if(!bosses.some(b=>b.id===bossId))bossId=bosses.find(b=>b.name==='黑魔法師')?.id||bosses[0].id;
 const b=currentBoss();
 if(!b.difficulties.some(d=>d.name===diffName))diffName=b.difficulties[0].name;
 renderSelection();
}
(async()=>{
 try{
  const response=await fetch('boss-atlas-data.json?_ddv_boss='+encodeURIComponent(window.__ddBossAssetVersion||Date.now().toString(36)),{cache:'no-store'});if(!response.ok)throw Error('預設資料無法取得');
  const fallback=await response.json();baselineBosses=Array.isArray(fallback.bosses)?fallback.bosses:[];accept(fallback);
 }catch(e){$('bc-picked').textContent='BOSS 資料載入失敗';console.warn('BOSS Calculator',e);}
 try{
  const response=await fetch(`${API}/api/site-data`,{headers:{Accept:'application/json'},cache:'no-store'});
  if(!response.ok)return;const json=await response.json();
  if(json?.ok&&json.data?.duoduo_boss_atlas?.schema===1)accept(reconcileKnownHp(json.data.duoduo_boss_atlas));
 }catch(e){console.warn('BOSS Calculator cloud fallback',e);}
})();
})();
