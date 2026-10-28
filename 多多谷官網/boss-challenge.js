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
const inversePortraitUrl=name=>assetNames.has(name)?'assets/boss-atlas/inverse-ui/'+encodeURIComponent(name)+'.png':'';
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
   <div class="bc-rule"><span class="bc-rule-type">終極 BOSS</span><span class="bc-rule-badges"><img src="assets/boss-atlas/difficulties/普通.png" alt="普通" loading="lazy"></span><strong class="bc-rule-limit">每日可進行 1 次</strong><small class="bc-rule-exception">※ 燦爛的凶星、尤比太除外</small></div>
   <div class="bc-rule"><span class="bc-rule-type">終極 BOSS</span><span class="bc-rule-badges"><img src="assets/boss-atlas/difficulties/困難.png" alt="困難" loading="lazy"><img src="assets/boss-atlas/difficulties/終極.png" alt="終極" loading="lazy"></span><strong class="bc-rule-limit">每週可進行 1 次</strong></div>
  </div></section>
  <section class="bc-card" aria-labelledby="bc-reward-title"><div class="bc-card-head"><span class="bc-head-icon" aria-hidden="true">◇</span><h3 id="bc-reward-title">獎勵門檻計算規則</h3></div>
   <p class="bc-description">隊員必須達到個人輸出門檻才可獲得獎勵。<strong>個人門檻＝BOSS 總血量 × 倍率 ÷ 隊伍人數 × 需求比例</strong>。</p>
   <div class="bc-rate-table-wrap"><table class="bc-rate-table" aria-label="各隊伍人數的獎勵需求比例"><thead><tr><th scope="col">倍率</th>${[1,2,3,4,5,6].map(n=>`<th scope="col">${n} 人</th>`).join('')}</tr></thead><tbody>
   <tr><th scope="row">1 倍</th>${rewardRates[1].map(n=>`<td>${n}%</td>`).join('')}</tr>
   <tr><th scope="row">10 倍（含）以上</th>${rewardRates[10].map(n=>`<td>${n}%</td>`).join('')}</tr>
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
     <div class="bc-field"><label for="bc-multiplier" class="bc-label">③ 血量倍率 <span id="bc-multiplier-hint" style="font-weight:500;font-size:11px;margin-left:5px" aria-live="polite"></span></label><select id="bc-multiplier">${[1,10,20,30,40,50,60,70].map(n=>`<option value="${n}" ${n===10?'selected':''}>${n} 倍</option>`).join('')}<option value="custom">自訂倍率…</option></select><span id="bc-mobile-multiplier-hint" class="bc-mobile-multiplier-hint" aria-live="polite"></span></div>
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
// Independent reverse calculator: keep the original forward calculator intact.
const inversePanel=document.createElement('section');
inversePanel.className='bc-card bc-inverse';
inversePanel.setAttribute('aria-labelledby','bc-inverse-title');
inversePanel.innerHTML=`
 <div class="bc-calc-heading"><div class="bc-card-head" style="margin:0"><span class="bc-head-icon" aria-hidden="true">↶</span><h3 id="bc-inverse-title">個人傷害反推｜BOSS 獎勵門檻</h3></div><span class="bc-pill">反向試算</span></div>
 <p class="bc-description">輸入自己可輸出的傷害，反推哪些 BOSS、難度與血量倍率能達到獎勵資格。此為<strong>個人獎勵門檻</strong>，不代表隊伍一定能擊敗 BOSS。</p>
 <div class="bc-inverse-fields">
  <div class="bc-field"><label class="bc-label" for="bc-inverse-damage">① 個人輸出傷害</label><input id="bc-inverse-damage" type="text" inputmode="decimal" maxlength="60" placeholder="例如：800億、2兆5000億" autocomplete="off"><div class="bc-mobile-damage-tools" aria-label="手機傷害輸入輔助"><span class="bc-mobile-damage-tools-label">快速加單位</span><div class="bc-mobile-unit-buttons" role="group" aria-label="插入傷害單位">${['萬','億','兆','京'].map(u=>`<button type="button" class="bc-mobile-unit" data-bc-unit="${u}" aria-label="插入${u}">${u}</button>`).join('')}</div><button type="button" id="bc-mobile-keyboard" class="bc-mobile-keyboard" aria-pressed="false" aria-label="切換文字鍵盤">文字鍵盤</button></div></div>
  <div class="bc-field"><label class="bc-label" for="bc-inverse-team">② 隊伍人數</label><select id="bc-inverse-team">${[1,2,3,4,5,6].map(n=>`<option value="${n}" ${n===2?'selected':''}>${n} 人</option>`).join('')}</select></div>
  <div class="bc-field"><label class="bc-label" for="bc-inverse-max">③ 最高檢查倍率</label><select id="bc-inverse-max"><option value="70" selected>70 倍</option><option value="100">100 倍</option><option value="200">200 倍</option><option value="500">500 倍</option><option value="custom">自訂上限…</option></select></div>
 </div>
 <div class="bc-inverse-extra"><div class="bc-field" id="bc-inverse-custom-wrap" hidden><label class="bc-label" for="bc-inverse-custom">自訂最高倍率（10～10000，10 的倍數）</label><input type="number" id="bc-inverse-custom" inputmode="numeric" min="10" max="10000" step="10" value="100"></div>
  <div class="bc-field bc-inverse-status-field"><label class="bc-label" for="bc-inverse-status">篩選計算結果</label><select id="bc-inverse-status"><option value="qualified" selected>只看已達標</option><option value="all">全部結果</option><option value="unqualified">只看未達標</option></select></div></div>
 <div class="bc-inverse-select" aria-label="選擇 BOSS 分類與圖片">
  <div class="bc-inverse-select-head"><strong>選擇 BOSS 分類</strong><span id="bc-inverse-filter-count">載入 BOSS 中…</span></div>
  <div id="bc-inverse-categories" class="bc-inverse-categories" role="group" aria-label="BOSS 分類"></div>
  <div class="bc-inverse-select-head bc-inverse-select-head--boss"><strong>選擇 BOSS</strong><span>選「全部 BOSS」可顯示分類內所有結果</span></div>
  <div id="bc-inverse-bosses" class="bc-inverse-bosses" role="group" aria-label="BOSS 圖片選擇"></div>
 </div>
 <div id="bc-inverse-results" class="bc-inverse-results" aria-live="polite"><div class="bc-status">輸入個人傷害後，會自動列出可達標倍率。</div></div>
 <p class="bc-note">計算範圍包含 1 倍、10 倍、20 倍……所選上限，並以後台公布的各 BOSS 開放最高倍率為準；1 倍採原有比例，10 倍（含）以上採同一組多人比例。多路線 BOSS 在「全部」模式會以血量較高的路線保守估算。</p>
`;
root.appendChild(inversePanel);
let bosses=[],bossId='',diffName='',variantChoices={},baselineBosses=[];
let inverseCategory='全部',inverseBossId='all';
// A limit belongs to each BOSS, not individual difficulties. Older cloud records
// lacking this new field use the verified default until the admin publishes it.
const defaultBossMultiplier=name=>['瑪麗西亞','巴德利斯'].includes(name)?1:70;
function getBossMaxMultiplier(boss){
 const raw=boss?.maxMultiplier;
 const max=Number(raw);
 return raw!==undefined&&raw!==null&&raw!==''&&Number.isSafeInteger(max)&&(max===1||(max>=10&&max<=10000&&max%10===0))
  ?max:defaultBossMultiplier(boss?.name);
}
function syncForwardMultiplierOptions(){
 const max=getBossMaxMultiplier(currentBoss());
 const select=$('bc-multiplier'),old=select.value;
 const allowed=[1,...Array.from({length:Math.min(7,Math.floor(max/10))},(_,i)=>(i+1)*10)];
 select.innerHTML=allowed.map(n=>`<option value="${n}">${n} 倍</option>`).join('')+(max>70?'<option value="custom">自訂倍率…</option>':'');
 select.value=old==='custom'&&max>70?'custom':allowed.includes(Number(old))?old:(max===1?'1':'10');
 const custom=$('bc-custom-multiplier');custom.max=String(max);
 if(Number(custom.value)>max)custom.value=String(max);
 const hint=$('bc-multiplier-hint');if(hint)hint.textContent=`此 BOSS 目前開放最高 ${max} 倍`;
 const mobileHint=$('bc-mobile-multiplier-hint');if(mobileHint)mobileHint.textContent=`此 BOSS 目前開放最高 ${max} 倍`;
}

// Atlas and reverse calculator must use the same published, normalized HP.
// Cache the most recent atlas event in case the scripts finish in either order.
let hasSharedAtlasSnapshot=false;
function receiveSharedAtlasSnapshot(snapshot){
 if(!snapshot||!Array.isArray(snapshot.bosses))return;
 hasSharedAtlasSnapshot=true;
 accept(snapshot);
}
window.addEventListener('duoduo:boss-atlas-snapshot',event=>receiveSharedAtlasSnapshot(event.detail));
if(window.__ddBossPublicAtlasSnapshot)receiveSharedAtlasSnapshot(window.__ddBossPublicAtlasSnapshot);

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
 syncForwardMultiplierOptions();
 $('bc-difficulties').innerHTML=(b.difficulties||[]).map(d=>`<button type="button" class="bc-diff" data-diff="${escapeHTML(d.name)}" aria-pressed="${d.name===diffName}">${diffImage(d.name)?`<img src="${diffImage(d.name)}" alt="${escapeHTML(d.name)}">`:escapeHTML(d.name)}</button>`).join('');
 renderResult();
 renderInverse();
}
function renderResult(){
 const difficulty=currentDiff();const result=$('bc-result');if(!difficulty){result.innerHTML='<p class="bc-error">請選擇 BOSS 及難度。</p>';return;}
 const selection=$('bc-multiplier').value;
 $('bc-custom-wrap').hidden=selection!=='custom';
 const n=selection==='custom'?Number($('bc-custom-multiplier').value):Number(selection);
 const party=Number($('bc-team').value);
 const max=getBossMaxMultiplier(currentBoss());
 if(!Number.isSafeInteger(n)||(n!==1&&(n<10||n%10!==0))||n>max){result.innerHTML=`<p class="bc-error">目前該 BOSS 最高只開放 ${max} 倍，請選擇已開放的血量倍率。</p>`;return;}
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

function inverseEntries(){
 // The reverse calculator has its own category / image picker and never
 // changes the forward calculator's selected BOSS or difficulty.
 return bosses.filter(b=>(inverseCategory==='全部'||b.group===inverseCategory)
  &&(inverseBossId==='all'||b.id===inverseBossId))
  .flatMap(b=>(b.difficulties||[]).map(d=>({boss:b,difficulty:d,selected:false})));
}
function inversePortrait(b){
 const src=inversePortraitUrl(b.name);
 return src?`<img class="bc-inverse-portrait" src="${src}" alt="" loading="lazy" decoding="async">`
  :`<span class="bc-inverse-portrait bc-inverse-portrait--fallback" aria-hidden="true">◇</span>`;
}
function inverseBanner(b){
 const src=nameImage(b.name);
 return src?`<img src="${src}" alt="${escapeHTML(b.name)}" loading="lazy" decoding="async">`
  :`<span class="bc-inverse-image-fallback">${escapeHTML(b.name)}</span>`;
}
function renderInverseFilters(){
 const categories=$('bc-inverse-categories');
 const current=categories.querySelector('[aria-pressed="true"]');
 categories.innerHTML=['全部',...publicGroups].map(g=>`<button type="button" class="bc-inverse-category" data-category="${g}" aria-pressed="${g===inverseCategory}">${g==='全部'?'全部 BOSS':g+' BOSS'}</button>`).join('');
 const filtered=bosses.filter(b=>inverseCategory==='全部'||b.group===inverseCategory);
 if(inverseBossId!=='all'&&!filtered.some(b=>b.id===inverseBossId))inverseBossId='all';
 $('bc-inverse-filter-count').textContent=`${filtered.length} 隻已公開 BOSS`;
 $('bc-inverse-bosses').innerHTML=`<button type="button" class="bc-inverse-boss-choice bc-inverse-all-choice" data-inverse-boss="all" aria-pressed="${inverseBossId==='all'}"><span class="bc-inverse-all-symbol" aria-hidden="true">▦</span><span>全部 BOSS</span></button>`
 +filtered.map(b=>`<button type="button" class="bc-inverse-boss-choice" data-inverse-boss="${escapeHTML(b.id)}" aria-pressed="${inverseBossId===b.id}" title="${escapeHTML(b.name)}">${inversePortrait(b)}<span class="bc-inverse-choice-name">${escapeHTML(b.name)}</span></button>`).join('');
}
function inverseHp(entry){
 const sections=parseHp(entry.difficulty.hp);
 let hasAlternates=false,total=0n;
 for(const section of sections){
  if(section.variants.length>1)hasAlternates=true;
  // In the selected-difficulty view reuse the route selected in the forward calculator.
  if(entry.selected){
   const index=Math.min(Math.max(0,Number(variantChoices[String(section.stage)]||0)),section.variants.length-1);
   total+=section.variants[index].value;
  }else{
   // Do not claim a route is eligible when only its easiest variant qualifies.
   total+=section.variants.reduce((max,v)=>v.value>max?v.value:max,0n);
  }
 }
 return {total,hasAlternates};
}
function renderInverse(){
 const target=$('bc-inverse-results');
 const damageText=$('bc-inverse-damage').value.trim();
 $('bc-inverse-custom-wrap').hidden=$('bc-inverse-max').value!=='custom';
 if(!damageText){target.innerHTML='<div class="bc-status">輸入自己的傷害量，再用上方分類與圖片選擇 BOSS，即可反推可領獎的倍率。</div>';return;}
 let damage;
 try{
  if(!/^[0-9.,，\s京兆億萬]+$/.test(damageText)||damageText.length>60)throw Error('請使用數字與京、兆、億、萬單位');
  damage=parseChineseNumber(damageText);
  if(damage<=0n)throw Error('傷害量必須大於 0');
 }catch(err){target.innerHTML=`<p class="bc-error">${escapeHTML(err.message)}</p>`;return;}
 const party=Number($('bc-inverse-team').value);
 const maxSelector=$('bc-inverse-max').value;
 $('bc-inverse-custom-wrap').hidden=maxSelector!=='custom';
 const limit=maxSelector==='custom'?Number($('bc-inverse-custom').value):Number(maxSelector);
 if(!Number.isSafeInteger(limit)||limit<10||limit>10000||limit%10!==0){target.innerHTML='<p class="bc-error">最高倍率請填入 10～10000，且必須是 10 的倍數。</p>';return;}
 const candidates=[1];for(let n=10;n<=limit;n+=10)candidates.push(n);
 const status=$('bc-inverse-status').value;
 const rows=[];let missing=0,qualifiedCount=0;let alternateCount=0;
 for(const entry of inverseEntries()){
  let hpInfo;
  try{hpInfo=inverseHp(entry);}catch(_){missing++;continue;}
  if(hpInfo.hasAlternates&&!entry.selected)alternateCount++;
  const valid=[];
  for(const n of candidates){
   if(n>getBossMaxMultiplier(entry.boss))continue;
   const rate=rewardRateFor(n,party);
   const threshold=ceilDiv(hpInfo.total*BigInt(n)*BigInt(rate),BigInt(party)*100n);
   if(damage>=threshold)valid.push(n);
  }
  if(valid.length)qualifiedCount++;
  if(status==='qualified'&&!valid.length)continue;
  if(status==='unqualified'&&valid.length)continue;
  const maxEligible=valid.length?Math.max(...valid):null;
  const difficulty=entry.difficulty.name;
  const diffIcon=diffImage(difficulty);
  const icon=diffIcon?`<img src="${diffIcon}" alt="${escapeHTML(difficulty)}">`:`<span>${escapeHTML(difficulty)}</span>`;
  const summary=maxEligible===null?'未達標':`最高 ${maxEligible} 倍`;
  rows.push({id:entry.boss.id,name:entry.boss.name,boss:entry.boss,html:`<div class="bc-inverse-diff"><span class="bc-inverse-diff-icon">${icon}</span><strong class="${maxEligible===null?'bc-inverse-fail':'bc-inverse-pass'}">${summary}</strong></div><div class="bc-inverse-multiples">${valid.length?valid.map(n=>`<span class="bc-inverse-multiple">${n} 倍</span>`).join(''):'目前傷害尚不足以達到所選倍率的個人領獎門檻'}</div>`});
 }
 // Keep original BOSS group order from atlas; no unpublished records appear.
 const groups=[];
 for(const row of rows){
  let found=groups.find(group=>group.id===row.id);
  if(!found){found={id:row.id,name:row.name,boss:row.boss,items:[]};groups.push(found);}
  found.items.push(row.html);
 }
 const countText=`${qualifiedCount} 組難度可達標`;
 const notice=alternateCount?`<p class="bc-inverse-warning">其中 ${alternateCount} 組含多路線血量；全部查詢採最高血量，詳細路線請切換「目前選擇的 BOSS、難度」。</p>`:'';
 const note=missing?`<p class="bc-inverse-warning">另外 ${missing} 組難度未提供可計算的血量，已略過。</p>`:'';
 const list=groups.map(g=>`<div class="bc-inverse-group"><div class="bc-inverse-group-title">${inverseBanner(g.boss)}<span class="bc-inverse-group-name">${escapeHTML(g.name)}<small>${escapeHTML(g.boss.group)} BOSS</small></span></div>${g.items.join('')}</div>`).join('');
 target.innerHTML=`<div class="bc-inverse-summary"><strong>個人傷害：${formatHp(damage)}</strong><span>${party} 人隊伍 · ${countText}</span></div>${note}${notice}${list?`<div class="bc-inverse-list">${list}</div>`:'<div class="bc-status bc-inverse-empty">目前設定的傷害量，沒有符合條件的 BOSS 難度；可調整傷害、人數或顯示全部。</div>'}`;
}
inversePanel.addEventListener('input',e=>{if(e.target.id==='bc-inverse-damage'||e.target.id==='bc-inverse-custom')renderInverse();});
inversePanel.addEventListener('change',e=>{
 if(['bc-inverse-team','bc-inverse-max','bc-inverse-custom','bc-inverse-status'].includes(e.target.id))renderInverse();
});

// Phone input: keep the numeric keypad by default; allow Chinese-unit insertion
// or switch to a full keyboard. Existing damage parsing and calculations are unchanged.
inversePanel.addEventListener('click',e=>{
 const unitButton=e.target.closest('[data-bc-unit]');
 const keyboardButton=e.target.closest('#bc-mobile-keyboard');
 if(unitButton){
  const input=$('bc-inverse-damage'),unit=unitButton.dataset.bcUnit;
  if(!['萬','億','兆','京'].includes(unit))return;
  const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;
  if(input.value.length+unit.length>input.maxLength)return;
  input.setRangeText(unit,start,end,'end');
  input.dispatchEvent(new Event('input',{bubbles:true}));
  input.focus({preventScroll:true});
  return;
 }
 if(keyboardButton){
  const input=$('bc-inverse-damage');
  const fullText=keyboardButton.getAttribute('aria-pressed')!=='true';
  input.blur();
  input.setAttribute('inputmode',fullText?'text':'decimal');
  keyboardButton.setAttribute('aria-pressed',String(fullText));
  keyboardButton.textContent=fullText?'數字鍵盤':'文字鍵盤';
  keyboardButton.setAttribute('aria-label',fullText?'切換數字鍵盤':'切換文字鍵盤');
  input.focus({preventScroll:true});
 }
});
inversePanel.addEventListener('click',e=>{
 const category=e.target.closest('[data-category]');
 if(category){inverseCategory=category.dataset.category;inverseBossId='all';renderInverseFilters();renderInverse();return;}
 const boss=e.target.closest('[data-inverse-boss]');
 if(boss){inverseBossId=boss.dataset.inverseBoss;renderInverseFilters();renderInverse();}
});
$('bc-picker').addEventListener('click',()=>{const menu=$('bc-menu');menu.hidden=!menu.hidden;$('bc-picker').setAttribute('aria-expanded',String(!menu.hidden));});
$('bc-menu').addEventListener('click',e=>{const button=e.target.closest('[data-id]');if(!button)return;bossId=button.dataset.id;diffName=currentBoss()?.difficulties?.[0]?.name||'';variantChoices={};closeMenu();renderSelection();});
root.addEventListener('click',e=>{const button=e.target.closest('[data-diff]');if(!button)return;diffName=button.dataset.diff;variantChoices={};renderSelection();});
root.addEventListener('change',e=>{if(e.target.matches('[data-stage]')){variantChoices[e.target.dataset.stage]=e.target.value;renderResult();renderInverse();}else if(['bc-multiplier','bc-team'].includes(e.target.id))renderResult();});
root.addEventListener('input',e=>{if(e.target.id==='bc-custom-multiplier')renderResult();});
document.addEventListener('pointerdown',e=>{if(!root.contains(e.target)||!e.target.closest('.bc-picker-wrap'))closeMenu();},true);
root.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
// Use identical BOSS order in both forward and reverse calculators,
// regardless of whether data came from the static JSON or older cloud records.
function bossDisplayOrder(records){
 const result=[...records];
 const isMaria=b=>b?.id==='boss22'||['瑪麗西亞','瑪莉西亞'].includes(b?.name);
 const isKai=b=>b?.id==='boss30'||b?.name==='凱伊';
 const maria=result.findIndex(isMaria);
 if(maria<0||!result.some(isKai))return result;
 const [entry]=result.splice(maria,1);
 result.splice(result.findIndex(isKai)+1,0,entry);
 return result;
}
function accept(data){
 if(!data||!Array.isArray(data.bosses))return;
 // The public reader does not show records flagged as unpublished.
 const items=data.bosses.filter(b=>b&&b.published!==false&&!['尤比太'].includes(b.name)&&Array.isArray(b.difficulties));
 bosses=bossDisplayOrder(items.filter(b=>b.difficulties.length).sort((a,b)=>{
  const d=publicGroups.indexOf(a.group)-publicGroups.indexOf(b.group);return d||0;
 }));
 if(!bosses.length){$('bc-picked').textContent='目前沒有可選擇的 BOSS';return;}
 if(!bosses.some(b=>b.id===bossId))bossId=bosses.find(b=>b.name==='黑魔法師')?.id||bosses[0].id;
 const b=currentBoss();
 if(!b.difficulties.some(d=>d.name===diffName))diffName=b.difficulties[0].name;
 renderSelection();
 renderInverseFilters();
}
(async()=>{
 try{
  const response=await fetch('boss-atlas-data.json?_ddv_boss='+encodeURIComponent(window.__ddBossAssetVersion||Date.now().toString(36)),{cache:'no-store'});if(!response.ok)throw Error('預設資料無法取得');
  const fallback=await response.json();baselineBosses=Array.isArray(fallback.bosses)?fallback.bosses:[];if(!hasSharedAtlasSnapshot)accept(fallback);
 }catch(e){if(!hasSharedAtlasSnapshot)$('bc-picked').textContent='BOSS 資料載入失敗';console.warn('BOSS Calculator',e);}
 try{
  const response=await fetch(`${API}/api/site-data`,{headers:{Accept:'application/json'},cache:'no-store'});
  if(!response.ok)return;const json=await response.json();
  if(!hasSharedAtlasSnapshot&&json?.ok&&json.data?.duoduo_boss_atlas?.schema===1)accept(reconcileKnownHp(json.data.duoduo_boss_atlas));
 }catch(e){console.warn('BOSS Calculator cloud fallback',e);}
})();
})();
