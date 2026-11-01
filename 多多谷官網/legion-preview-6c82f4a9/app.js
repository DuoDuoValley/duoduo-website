(()=>{'use strict';
const W=22,H=20,SIZE=W*H,STORE='duoduo_legion_production_inventory_v1',MAX_DEPLOYED=45;
const WZ_ROOT='./assets/union/';
let stageScale=1,selectedStat='',selectedOuter='';
// V282 shapes, cross-checked against player's SS screenshot. One block per distinct V6.5 job;
// a Lv.250 block REPLACES the corresponding Lv.200 block (it is not an extra block).
const SHAPES=[

 {id:'ss_w',group:'Lv.200',name:'Lv.200｜劍士',meta:'方形・4 格',icon:'char_main.0.0.png',iconCell:[0,0],cells:[[0,0],[1,0],[0,1],[1,1]]},
 {id:'ss_a',group:'Lv.200',name:'Lv.200｜弓箭手',meta:'直線・4 格',icon:'char_main.3.0.png',iconCell:[1,0],cells:[[0,0],[1,0],[2,0],[3,0]]},
 {id:'ss_t',group:'Lv.200',name:'Lv.200｜盜賊',meta:'L 形・4 格',icon:'char_main.4.0.png',iconCell:[0,0],cells:[[0,0],[1,0],[2,0],[2,1]]},
 {id:'ss_m',group:'Lv.200',name:'Lv.200｜法師',meta:'T 形・4 格',icon:'char_main.2.0.png',iconCell:[1,0],cells:[[0,0],[1,0],[2,0],[1,1]]},
 {id:'ss_p',group:'Lv.200',name:'Lv.200｜海盜',meta:'S 形・4 格',icon:'char_main.5.0.png',iconCell:[0,1],cells:[[1,0],[0,1],[1,1],[0,2]]},
 {id:'ss_zero',group:'Lv.200',name:'Lv.200｜傑諾',meta:'L 形・4 格',icon:'char_main.36.0.png',iconCell:[1,0],cells:[[0,0],[1,0],[2,0],[2,1]]},
 {id:'sss_w',group:'Lv.250',name:'Lv.250｜劍士',meta:'5 格',icon:'char_main.0.0.png',iconCell:[0,0],cells:[[0,0],[1,0],[2,0],[0,1],[1,1]]},
 {id:'sss_a',group:'Lv.250',name:'Lv.250｜弓箭手',meta:'直線・5 格',icon:'char_main.3.0.png',cells:[[0,0],[1,0],[2,0],[3,0],[4,0]]},
 {id:'sss_t',group:'Lv.250',name:'Lv.250｜盜賊',meta:'側 T 形・5 格',icon:'char_main.4.0.png',iconCell:[2,1],cells:[[2,0],[0,1],[1,1],[2,1],[2,2]]},
 {id:'sss_m',group:'Lv.250',name:'Lv.250｜法師',meta:'十字・5 格',icon:'char_main.2.0.png',cells:[[1,0],[0,1],[1,1],[2,1],[1,2]]},
 {id:'sss_p',group:'Lv.250',name:'Lv.250｜海盜',meta:'彎折形・5 格',icon:'char_main.5.0.png',iconCell:[0,2],cells:[[1,0],[1,1],[0,2],[1,2],[0,3]]},
 {id:'sss_zero',group:'Lv.250',name:'Lv.250｜傑諾',meta:'階梯 L 形・5 格',icon:'char_main.36.0.png',cells:[[0,0],[1,0],[1,1],[1,2],[2,2]]}
];
const $=id=>document.getElementById(id);
// A real V6.5 job can contribute exactly one block: SS or SSS, never both.
const ROSTER=window.DuoDuoLegionRoster||[];
const GROUP_INFO=[['w','劍士'],['m','法師'],['a','弓箭手'],['t','盜賊'],['p','海盜'],['zero','傑諾']];
const GROUP_LIMITS=Object.fromEntries(GROUP_INFO.map(([code])=>[code,ROSTER.filter(j=>j.group===code).length]));
if(ROSTER.length!==51||Object.values(GROUP_LIMITS).reduce((a,b)=>a+b,0)!==51||new Set(ROSTER.map(j=>j.id)).size!==51){
 throw new Error('V6.5 51-job roster missing or invalid: cannot use unbounded block counts.');
}
const counts=Object.fromEntries(SHAPES.map(s=>[s.id,0]));
function groupCode(shape){return shape.id.replace(/^sss?_/, '')}
function groupTotal(code){return GROUP_LIMITS[code]||0}
function canUseCount(shape,n){return Number.isInteger(n)&&n>=0&&n<=groupTotal(groupCode(shape))}
function groupCapacity(code){
 const outside=countPieces()-counts['ss_'+code]-counts['sss_'+code];
 return Math.max(0,Math.min(groupTotal(code),MAX_DEPLOYED-outside));
}
function syncGroupCount(code,level,n){
 const id=(level==='sss'?'sss_':'ss_')+code,other=(level==='sss'?'ss_':'sss_')+code;
 const allowed=groupCapacity(code);
 const assigned=Math.min(allowed,Math.max(0,Math.trunc(Number(n)||0)));
 counts[id]=assigned;
 // When switching SS ↔ SSS, replace existing blocks in the same job group first.
 // Both the group roster size and the global 45 deployed slots must hold.
 if(assigned+counts[other]>allowed)counts[other]=allowed-assigned;
 return assigned;
}
function syncAllCountInputs(){
 for(const s of SHAPES){
  const code=groupCode(s),other=counts[s.id.startsWith('sss_')?'ss_'+code:'sss_'+code];
  if(s.input){
   s.input.value=counts[s.id];s.input.min=0;s.input.max=groupCapacity(code);
   s.input.setAttribute('aria-valuetext',`${counts[s.id]} 塊；同群合計 ${counts[s.id]+other}／${groupTotal(code)}，上場總數 ${countPieces()}／${MAX_DEPLOYED}`);
   const counter=s.input.closest('.counter');
   if(counter){
    counter.querySelector('[data-delta="-1"]').disabled=counts[s.id]===0;
    const zeroButton=counter.querySelector('[data-action="zero"]');
    if(zeroButton)zeroButton.disabled=counts[s.id]===0;
    counter.querySelector('[data-delta="1"]').disabled=counts[s.id]>=groupCapacity(code);
    const maxButton=counter.querySelector('[data-action="max"]');
    if(maxButton)maxButton.disabled=counts[s.id]>=groupCapacity(code);
   }
  }
 }
 for(const el of document.querySelectorAll('.shape-group-total')){
  const code=el.dataset.code;el.textContent=`SS ${counts['ss_'+code]} ＋ SSS ${counts['sss_'+code]} ／ 上限 ${groupTotal(code)}`;
 }
}
function restoreInventory(snapshot){
 let remaining=MAX_DEPLOYED,trimmed=false;
 for(const [code] of GROUP_INFO){
  const max=groupTotal(code);
  const requestedSS=Math.max(0,parseInt(snapshot?.['ss_'+code]??0,10)||0);
  const requestedSSS=Math.max(0,parseInt(snapshot?.['sss_'+code]??0,10)||0);
  const ss=Math.min(max,remaining,requestedSS);
  const sss=Math.min(max-ss,remaining-ss,requestedSSS);
  counts['ss_'+code]=ss;counts['sss_'+code]=sss;
  remaining-=ss+sss;
  if(ss!==requestedSS||sss!==requestedSSS)trimmed=true;
 }
 syncAllCountInputs();
 return trimmed;
}

const VERIFIED_PRESETS=Array.isArray(window.DuoDuoLegionPresets)?window.DuoDuoLegionPresets:[];
let activePresetId=null,selectedPresetId=VERIFIED_PRESETS[0]?.id||null,inventoryTrimmedOnRestore=false;
let target=new Set(),solution=null,recommendationPreview=null,smartSuggestions=[],rescueBusy=false,rescueRun=0,strokeAction='add',painting=false,lastPaint=-1,undoStack=[],runToken=0,solving=false,toastTimer=null;
let paintMode='single'; // single: one tile (drag allowed); region: a whole exact WZ stat region per click
const cellEls=[];
const pieceImgCache=new Map();
function getPieceImg(src){
 if(pieceImgCache.has(src))return pieceImgCache.get(src);
 const img=new Image(); img.decoding='async'; img.src=src; pieceImgCache.set(src,img); return img;
}
function preloadPieceAssets(){
 getPieceImg('./assets/pieces/char_sub.0.png');
 SHAPES.filter(s=>s.icon).forEach(s=>getPieceImg('./assets/pieces/'+s.icon));
}

function shapeCellCount(){return SHAPES.reduce((a,s)=>a+counts[s.id]*s.cells.length,0)}
function countPieces(){return SHAPES.reduce((a,s)=>a+counts[s.id],0)}
function miniMarkup(shape){
 let maxX=Math.max(...shape.cells.map(c=>c[0])),maxY=Math.max(...shape.cells.map(c=>c[1]));
 let width=maxX+1,height=maxY+1;
 let iconCell=shape.iconCell||shape.cells[Math.floor(shape.cells.length/2)]||shape.cells[0];
 // Compact preview is 66×47px; keep all five tiles inside, including tall Lv.250 pirate.
 const renderedWidth=(width-1)*24+26,renderedHeight=(height-1)*24+26;
 const previewScale=Math.min(.52,60/renderedWidth,42/renderedHeight);
 let html=`<div class="official-mini" style="--cells-x:${width};--cells-y:${height};transform:scale(${previewScale.toFixed(4)})">`;
 for(const [x,y] of shape.cells){
   const hasIcon=(x===iconCell[0]&&y===iconCell[1]);
   html+=`<span class="mini-tile" style="left:${x*24}px;top:${y*24}px"><img class="tile-base" src="./assets/pieces/char_sub.0.png" alt="">${hasIcon && shape.icon?`<img class="tile-icon" src="./assets/pieces/${shape.icon}" alt="">`:''}</span>`;
 }
 html+='</div>';
 return html;
}
function setupShapes(){
 let prev='';
 SHAPES.forEach(s=>{
   let group;
   if(s.group!==prev){
     group=document.createElement('div');
     group.className='shape-group';
     group.dataset.group=s.group;
     group.innerHTML='<div class="shape-label"><span class="shape-level-title"></span><button class="btn btn-small level-clear-btn" type="button"></button></div>';
     group.querySelector('.shape-level-title').textContent=s.group;
     const clearLevelButton=group.querySelector('.level-clear-btn');
     clearLevelButton.textContent='全部清零';
     clearLevelButton.setAttribute('aria-label',`將 ${s.group} 的六種角色卡數量全部清零`);
     clearLevelButton.addEventListener('click',()=>clearLevelCounts(s.group));
     $('shapes').appendChild(group);
     prev=s.group;
   }else group=$('shapes').lastElementChild;
   const el=document.createElement('div');
   el.className='shape-row';
   el.innerHTML=`<div class="shape-left"><div class="shape-mini shape-official">${miniMarkup(s)}</div><div class="shape-info"><b></b><small></small></div></div><div class="counter"><button class="counter-zero" aria-label="將 ${s.name} 數量歸零" title="此類拼圖清為 0" type="button" data-action="zero">0</button><button aria-label="減少 ${s.name} 數量" type="button" data-delta="-1">−</button><input type="number" min="0" max="45" step="1" inputmode="numeric" aria-label="${s.name} 數量" value="0"><button aria-label="增加 ${s.name} 數量" type="button" data-delta="1">＋</button><button class="counter-max" aria-label="將 ${s.name} 設為 MAX（同群上限 ${groupTotal(groupCode(s))} 塊）" title="最多上場 45 塊；以本職業群上限和剩餘名額為準" type="button" data-action="max">MAX</button></div>`;
   el.querySelector('b').textContent=s.name;
   el.querySelector('small').textContent=s.meta+'・同類型共 '+groupTotal(groupCode(s))+' 職業';
   let input=el.querySelector('input');
   s.input=input;
   input.addEventListener('change',()=>setCount(s,Number(input.value)));
   for(const b of el.querySelectorAll('button[data-delta]')) b.addEventListener('click',()=>setCount(s,counts[s.id]+Number(b.dataset.delta)));
   el.querySelector('[data-action="max"]').addEventListener('click',()=>setCount(s,groupTotal(groupCode(s))));
   el.querySelector('[data-action="zero"]').addEventListener('click',()=>setCount(s,0));
   group.appendChild(el);
 })
 syncAllCountInputs();
 const audit=$('rosterAudit');
 if(audit){
   for(const [code,label] of GROUP_INFO){
    const block=document.createElement('div');block.className='roster-audit-group';
    const title=document.createElement('b');title.textContent=`${label}（${groupTotal(code)}）`;
    const names=document.createElement('p');names.textContent=ROSTER.filter(j=>j.group===code).map(j=>j.name).join('、');
    block.append(title,names);audit.appendChild(block);
   }
 }
}
function setCount(s,n){
 const code=groupCode(s),rank=s.id.startsWith('sss_')?'sss':'ss';
 const assigned=syncGroupCount(code,rank,n);
 if(Number.isFinite(n)&&Math.trunc(n)>assigned&&countPieces()===MAX_DEPLOYED&&groupCapacity(code)<groupTotal(code))notify('同時最多上場 45 塊拼圖；請先減少其他類型的數量。');
 syncAllCountInputs();
 activePresetId=null;clearSolution(false);updateStatus();
 message(`已設定${GROUP_INFO.find(g=>g[0]===code)?.[1]||code}：Lv.200 ${counts['ss_'+code]} 塊，Lv.250 ${counts['sss_'+code]} 塊｜已選 ${countPieces()}／${MAX_DEPLOYED} 塊。`);
}
// V2.35: independent bulk reset for Lv.200 and Lv.250; never clear the opposite level.
function clearLevelCounts(level){
 const affected=SHAPES.filter(shape=>shape.group===level);
 if(!affected.some(shape=>counts[shape.id]>0)){
  notify(`${level} 的角色卡數量已經全部是 0。`);return;
 }
 for(const shape of affected)counts[shape.id]=0;
 syncAllCountInputs();
 activePresetId=null;
 clearSolution(false);
 updateStatus();
 message(`已將 ${level} 的角色卡數量全部清為 0；另一等級及目標區域均保持不變。`);
}
function clearSolution(notice=true){
 if(solving){runToken++;cancelRegionalSolver()}
 solving=false;$('solveBtn').disabled=false;$('solveBtn').textContent='✦ 開始自動排版';
 const had=Boolean(solution||recommendationPreview);
 solution=null;recommendationPreview=null;activePresetId=null;
 hideSmartRescue();
 if(had){updateBoard();if(notice)message('已清除計算結果。')}
}
function createBoard(){
 const f=document.createDocumentFragment();
 for(let i=0;i<SIZE;i++){
   const cell=document.createElement('button');cell.type='button';cell.className='cell';
   cell.setAttribute('role','gridcell');cell.setAttribute('aria-label',`第 ${Math.floor(i/W)+1} 列第 ${i%W+1} 欄`);cell.dataset.i=i;
   if(i%W===10)cell.classList.add('border-mid-right');
   if(Math.floor(i/W)===9)cell.classList.add('border-mid-bottom');
   cell.addEventListener('pointerdown',e=>{
     if(e.pointerType==='mouse'&&e.button!==0)return;
     e.preventDefault();
     if(paintMode==='region'){
       painting=false;lastPaint=-1;
       toggleRegionAtCell(i);
     }else{
       if(priorityBusy||rescueBusy){notify('請等目前的精算完成後再修改目標區域');return}
       saveUndo();painting=true;lastPaint=-1;
       strokeAction=target.has(i)?'erase':'add';
       paint(i,strokeAction);
     }
   });
   cell.addEventListener('pointerenter',()=>{if(painting&&paintMode==='single')paint(i,strokeAction)});
   cell.addEventListener('click',e=>{
     // Enter / Space trigger click without a preceding pointerdown.
     if(e.detail===0){
       if(paintMode==='region')toggleRegionAtCell(i);
       else if(priorityBusy||rescueBusy)notify('請等目前的精算完成後再修改目標區域');
       else{saveUndo();lastPaint=-1;paint(i,target.has(i)?'erase':'add')}
     }
   });
   cellEls.push(cell);f.appendChild(cell);
 }
 $('board').appendChild(f);
 window.addEventListener('pointerup',()=>{painting=false;lastPaint=-1});
 window.addEventListener('pointercancel',()=>{painting=false;lastPaint=-1});
 $('board').addEventListener('dragstart',e=>e.preventDefault());
}
function saveUndo(){undoStack.push([...target]);if(undoStack.length>30)undoStack.shift()}
function paint(i,action){
 if(i===lastPaint)return;
 lastPaint=i;
 if(solution||recommendationPreview||!$('smartRescue').hidden)clearSolution(false);
 if(action==='add')target.add(i);else target.delete(i);priorityPlannerExplicit=false;activePresetId=null;
 updateCell(i);updateStatus();
}
function clearPlacedCellVisual(el){
 el.classList.remove('placed','overlap');
 el.style.removeProperty('--piece-color');
 el.removeAttribute('data-overlap');
 el.removeAttribute('title');
 el.replaceChildren();
}
function decoratePlacedCell(el,item,i,multiplicity=1){
 el.classList.add('placed');
 el.classList.toggle('overlap',multiplicity>1);
 if(multiplicity>1){
   el.dataset.overlap=multiplicity;
   el.title=`此格有 ${multiplicity} 塊拼圖重疊；佔領效果只計算一次`;
 } else {el.removeAttribute('data-overlap');el.removeAttribute('title')}
 el.replaceChildren();
 const base=document.createElement('img');
 base.className='piece-base-img';base.alt='';base.draggable=false;
 base.src='./assets/pieces/char_sub.0.png';
 el.appendChild(base);
 if(item.icon && item.iconKey===i){
   const icon=document.createElement('img');icon.className='piece-icon-img';icon.alt='';icon.draggable=false;
   icon.src='./assets/pieces/'+item.icon;
   el.appendChild(icon);
 }
}
function pieceMap(){
 const cells=new Map();
 if(solution||recommendationPreview)(solution||recommendationPreview).forEach(p=>p.keys.forEach(i=>{
   const stack=cells.get(i)||[];stack.push(p);cells.set(i,stack);
 }));
 return cells;
}
// Keep each placed job piece separate, even when a neighbouring piece touches it.
// The same perimeter renderer is used for the live WZ board and PNG export.
function drawPieceOutlines(ctx,pieces){
 if(!ctx||!pieces?.length)return;
 ctx.save();
 ctx.lineJoin='round';ctx.lineCap='round';
 for(const piece of pieces){
   const own=new Set(piece.keys);
   ctx.beginPath();
   for(const k of own){
     const col=k%W,row=Math.floor(k/W),x=58+col*22,y=23+row*22;
     if(row===0||!own.has(k-W)){ctx.moveTo(x,y);ctx.lineTo(x+22,y)}
     if(col===W-1||!own.has(k+1)){ctx.moveTo(x+22,y);ctx.lineTo(x+22,y+22)}
     if(row===H-1||!own.has(k+W)){ctx.moveTo(x+22,y+22);ctx.lineTo(x,y+22)}
     if(col===0||!own.has(k-1)){ctx.moveTo(x,y+22);ctx.lineTo(x,y)}
   }
   // Dark separating edge under a slim gold contour keeps adjacent pieces distinct.
   ctx.shadowBlur=0;ctx.lineWidth=5;ctx.strokeStyle='rgba(31,23,17,.96)';ctx.stroke();
   ctx.lineWidth=2.1;ctx.strokeStyle='rgba(255,210,119,.98)';
   ctx.shadowColor='rgba(255,211,139,.55)';ctx.shadowBlur=2;ctx.stroke();
 }
 ctx.restore();
}
let pieceOutlineCanvas=null,pieceOutlineContext=null;
function renderPieceOutlines(){
 if(!pieceOutlineContext)return;
 pieceOutlineContext.clearRect(0,0,598,480);
 drawPieceOutlines(pieceOutlineContext,solution||recommendationPreview);
}
function updateCell(i){
 const el=cellEls[i];el.classList.toggle('target',target.has(i));clearPlacedCellVisual(el);
 const stack=pieceMap().get(i);
 if(stack?.length)decoratePlacedCell(el,stack.at(-1),i,stack.length);
}
function updateBoard(){
 const cells=pieceMap();
 for(let i=0;i<SIZE;i++){
   const el=cellEls[i];el.classList.toggle('target',target.has(i));
   const stack=cells.get(i);
   if(stack?.length)decoratePlacedCell(el,stack.at(-1),i,stack.length);
   else clearPlacedCellVisual(el);
 }
 renderPieceOutlines();
 renderLegionEffects();
 renderSmartCoverage();
}
function updateStatus(){let targetArea=target.size,area=shapeCellCount(),gap=targetArea-area;$('pieceCount').textContent=countPieces()+' / '+MAX_DEPLOYED; const meter=$('deploymentMeter');if(meter)meter.value=countPieces();$('pieceArea').textContent=area;$('targetCountSidebar').textContent=targetArea;$('targetCount').textContent=targetArea;$('totalArea').textContent=area;$('gap').textContent=(gap>0?'+':'')+gap;$('gap').style.color=gap===0?'var(--accent)':'#cf6674';}
function message(text,type=''){const el=$('message');el.textContent=text;el.className='message '+type;}
function notify(text){const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2100)}
function normalize(cells){let minx=Math.min(...cells.map(a=>a[0])),miny=Math.min(...cells.map(a=>a[1]));return cells.map(([x,y])=>[x-minx,y-miny]).sort((a,b)=>a[1]-b[1]||a[0]-b[0])}
function orientations(shape){
 const dedup=new Map();
 const anchor=shape.iconCell||shape.cells[Math.floor(shape.cells.length/2)]||shape.cells[0];
 // All rotations + horizontal mirror cover both horizontal and vertical reflection.
 for(let flip=0;flip<2;flip++)for(let rot=0;rot<4;rot++){
   const transform=([xx,yy])=>{
     let x=flip?-xx:xx,y=yy;
     for(let k=0;k<rot;k++)[x,y]=[-y,x];
     return [x,y];
   };
   const raw=shape.cells.map(transform),[ax,ay]=transform(anchor);
   const minx=Math.min(...raw.map(c=>c[0])),miny=Math.min(...raw.map(c=>c[1]));
   const p=raw.map(([x,y])=>[x-minx,y-miny]).sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
   p.iconAt=[ax-minx,ay-miny];
   // The job icon is a physical tile of the block, and its position matters.
   // Square/line/S pieces can look identical but place the icon elsewhere.
   const key=p.map(c=>c.join(',')).join(';')+'@'+p.iconAt.join(',');
   if(!dedup.has(key))dedup.set(key,p);
 }
 return [...dedup.values()];
}
function iconIndexForPlacedShape(keys,shape){
 const points=keys.map(k=>[k%W,Math.floor(k/W)]);
 const minx=Math.min(...points.map(p=>p[0])),miny=Math.min(...points.map(p=>p[1]));
 const targetKey=normalize(points).map(c=>c.join(',')).join(';');
 const match=orientations(shape).find(p=>p.map(c=>c.join(',')).join(';')===targetKey);
 return match?(miny+match.iconAt[1])*W+minx+match.iconAt[0]:keys[Math.floor(keys.length/2)];
}
// V2.20: A legally deployed Legion must be one edge-connected cluster, rooted at
// a job-icon cell in the four central squares. Diagonal contact is insufficient.
const CENTER_KEYS=[9*W+10,9*W+11,10*W+10,10*W+11];
const CENTER_SET=new Set(CENTER_KEYS);
function neighbors(k){
 const x=k%W,y=Math.floor(k/W),a=[];
 if(x>0)a.push(k-1);if(x+1<W)a.push(k+1);
 if(y>0)a.push(k-W);if(y+1<H)a.push(k+W);
 return a;
}
function isConnected(keys){
 const all=keys instanceof Set?keys:new Set(keys);
 if(!all.size)return false;
 const todo=[all.values().next().value],seen=new Set(todo);
 for(let j=0;j<todo.length;j++)for(const n of neighbors(todo[j])){
  if(all.has(n)&&!seen.has(n)){seen.add(n);todo.push(n)}
 }
 return seen.size===all.size;
}
// Single authoritative validation for both solver output and displayed recommendations.
// Zero-overlap is required by default. Only the explicitly labelled overlap
// fallback may pass allowOverlap:true. Every icon must lie on the block AND
// be one of its physically transformed anchor positions.
function validConnectedLayout(pieces,mandatory=target,{allowOverlap=false}={}){
 if(!Array.isArray(pieces)||!pieces.length||pieces.length>MAX_DEPLOYED)return false;
 const occupied=new Set(),used=Object.create(null);let centralIcon=false;
 for(const p of pieces){
  if(!p||!Array.isArray(p.keys)||!Number.isInteger(p.iconKey))return false;
  const shape=SHAPES.find(s=>s.id===p.id);
  if(!shape||p.keys.length!==shape.cells.length||new Set(p.keys).size!==p.keys.length)return false;
  if(p.keys.some(k=>!Number.isInteger(k)||k<0||k>=SIZE)||!p.keys.includes(p.iconKey))return false;
  const pts=p.keys.map(k=>[k%W,Math.floor(k/W)]);
  const minx=Math.min(...pts.map(a=>a[0])),miny=Math.min(...pts.map(a=>a[1]));
  const geometry=normalize(pts).map(c=>c.join(',')).join(';');
  const anchor=[p.iconKey%W-minx,Math.floor(p.iconKey/W)-miny];
  if(!orientations(shape).some(o=>o.map(c=>c.join(',')).join(';')===geometry&&o.iconAt[0]===anchor[0]&&o.iconAt[1]===anchor[1]))return false;
  used[p.id]=(used[p.id]||0)+1;
  if(used[p.id]>(counts[p.id]||0))return false;
  for(const k of p.keys){
   if(!allowOverlap&&occupied.has(k))return false;
   occupied.add(k);
  }
  if(CENTER_SET.has(p.iconKey))centralIcon=true;
 }
 return centralIcon&&isConnected(occupied)&&[...mandatory].every(k=>occupied.has(k));
}
// Connect each requested component to the centre using short
// orthogonal bridge paths (a heuristic, not a global minimum proof). These cells are mandatory too; the solver may cover
// extra *unmarked* squares to accommodate the real four/five-cell polyominoes.
function connectedRequirements(goals){
 if(!goals.size)return new Set();
 let best=null;
 for(const seed of CENTER_KEYS){
  const wanted=new Set(goals),required=new Set([seed]);
  let remaining=0;
  while(true){
   for(const k of required)wanted.delete(k);
   if(!wanted.size)break;
   const dist=new Int32Array(SIZE).fill(0x3fffffff),prev=new Int32Array(SIZE).fill(-1);
   const dq=[];
   for(const k of required){dist[k]=0;dq.push(k)}
   // 0-1 BFS: crossing a marked goal or already-connected square costs zero;
   // crossing a gap adds one bridge cell.
   while(dq.length){
    const k=dq.shift(),dk=dist[k];
    for(const n of neighbors(k)){
     const cost=goals.has(n)?0:1;
     if(dk+cost<dist[n]){
      dist[n]=dk+cost;prev[n]=k;
      if(cost===0)dq.unshift(n);else dq.push(n);
     }
    }
   }
   let end=-1,min=0x3fffffff;
   for(const k of wanted)if(dist[k]<min){end=k;min=dist[k]}
   if(end<0)return null;
   const prevSize=required.size;
   for(let k=end;k>=0&&!required.has(k);k=prev[k])required.add(k);
   // All adjacent goal squares in the same component are included without gaps.
   const todo=[...required];
   for(let i=0;i<todo.length;i++)for(const n of neighbors(todo[i])){
    if(goals.has(n)&&!required.has(n)){required.add(n);todo.push(n)}
   }
   if(required.size===prevSize||++remaining>SIZE)break;
  }
  if(!best||required.size<best.size)best=required;
 }
 return best;
}
function generateCandidates(types,required,allowExtra=false){
 const on=required instanceof Set?required:new Set(required);
 const byCell=Array.from({length:SIZE},()=>[]),centerCandidates=[],allCandidates=[];
 for(let t=0;t<types.length;t++){
  const type=types[t],visited=new Set();
  for(const cells of orientations(type)){
   const width=Math.max(...cells.map(c=>c[0]))+1,height=Math.max(...cells.map(c=>c[1]))+1;
   for(let sy=0;sy<=H-height;sy++)for(let sx=0;sx<=W-width;sx++){
    const keys=cells.map(([x,y])=>(sy+y)*W+sx+x);
    const intersection=keys.filter(k=>on.has(k));
    if(!intersection.length||(allowExtra?false:intersection.length!==keys.length))continue;
    const key=keys.slice().sort((a,b)=>a-b).join(',')+'@'+((sy+cells.iconAt[1])*W+sx+cells.iconAt[0]);
    if(visited.has(key))continue;visited.add(key);
    const item={t,id:type.id,keys,color:type.color,name:type.name,icon:type.icon,group:type.group,iconKey:(sy+cells.iconAt[1])*W+(sx+cells.iconAt[0]),hit:intersection.length};
    allCandidates.push(item);
    for(const k of intersection)byCell[k].push(item);
    if(CENTER_SET.has(item.iconKey)&&on.has(item.iconKey))centerCandidates.push(item);
   }
  }
 }
 return {byCell,centerCandidates,allCandidates};
}
const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
// All answers are constrained to real shape geometry, actual inventory, one
// connected cluster, and a genuine icon centered on a starting square.
async function searchConnectedCover(goals,token,budgetMs=6500,allowOverlap=false){
 const req=connectedRequirements(goals);
 if(!req)return {solution:null,cutoff:false,reason:'invalid'};
 const types=SHAPES.filter(s=>counts[s.id]>0),available=types.map(t=>counts[t.id]);
 if(!types.length||countPieces()>MAX_DEPLOYED||req.size>SIZE)return {solution:null,cutoff:false,reason:'limit',required:req.size};
 const capacity=types.reduce((sum,t,i)=>sum+available[i]*t.cells.length,0);
 if(capacity<req.size)return {solution:null,cutoff:false,reason:'pieces',required:req.size};
 // If the entire available area is exactly the requested area, any placement
 // extending outside that area makes exact coverage mathematically impossible.
 // Filtering them out here removes thousands of impossible branches.
 const exactNoSpill=!allowOverlap && capacity===req.size;
 const {byCell,centerCandidates}=generateCandidates(types,req,!exactNoSpill);
 const ordered=[...req],occupied=new Uint8Array(SIZE),chosen=[];
 const deadline=performance.now()+budgetMs,maxNodes=allowOverlap?75000:140000;
 let nodes=0,cutoff=false;
 const hasSpace=p=>chosen.length<MAX_DEPLOYED&&available[p.t]>0&&p.keys.every(k=>allowOverlap||!occupied[k]);
 function scores(p){
  let gain=0,repeat=0;
  for(const k of p.keys){if(req.has(k)&&!occupied[k])gain++;else if(occupied[k])repeat++}
  return {gain,repeat};
 }
 async function dfs(left){
  if(token!==runToken){cutoff=true;return false}
  if(!left){return validConnectedLayout(chosen,goals,{allowOverlap})}
  if(++nodes>maxNodes||performance.now()>deadline){cutoff=true;return false}
  if(nodes%500===0){await pause();if(token!==runToken){cutoff=true;return false}}
  const remainingArea=available.reduce((sum,n,t)=>sum+n*types[t].cells.length,0);
  if(remainingArea<left)return false;
  if(exactNoSpill && nodes%3===0 && types.every(t=>t.cells.length===5)){
   // Any disconnected pocket of uncovered squares must itself be tileable
   // with five-cell pieces, so a size not divisible by five is a dead end.
   const visited=new Uint8Array(SIZE);
   for(const start of ordered){
    if(occupied[start]||visited[start])continue;
    const todo=[start];visited[start]=1;
    for(let i=0;i<todo.length;i++)for(const next of neighbors(todo[i])){
     if(req.has(next)&&!occupied[next]&&!visited[next]){visited[next]=1;todo.push(next)}
    }
    if(todo.length%5!==0)return false;
   }
  }
  let best=null,minimum=Infinity;
  for(const k of ordered){
   if(occupied[k])continue;
   const options=byCell[k].filter(hasSpace);
   if(!options.length)return false;
   if(options.length<minimum){minimum=options.length;best=options;if(minimum===1)break}
  }
  const ranked=best.map(p=>({p,...scores(p)})).filter(o=>o.gain>0);
  ranked.sort((a,b)=>b.gain-a.gain||a.repeat-b.repeat||b.p.keys.length-a.p.keys.length||a.p.t-b.p.t);
  for(const {p,gain} of ranked){
   available[p.t]--;for(const k of p.keys)occupied[k]++;chosen.push(p);
   if(await dfs(left-gain))return true;
   chosen.pop();for(const k of p.keys)occupied[k]--;available[p.t]++;
   if(cutoff)return false;
  }
  return false;
 }
 centerCandidates.sort((a,b)=>b.hit-a.hit||b.keys.length-a.keys.length||a.t-b.t);
 for(const start of centerCandidates){
  if(!available[start.t])continue;
  available[start.t]--;for(const k of start.keys)occupied[k]++;chosen.push(start);
  if(await dfs(req.size-start.hit))return {solution:chosen.slice(),cutoff:false,required:req.size,nodes};
  chosen.pop();for(const k of start.keys)occupied[k]--;available[start.t]++;
  if(cutoff)break;
 }
 return {solution:null,cutoff,required:req.size,nodes,reason:cutoff?'timeout':'none'};
}

function renderSmartCoverage(){
 const line=$('coverageStatus');if(!line)return;
 const current=solution||recommendationPreview;
 if(!current?.length){line.hidden=true;line.textContent='';return}
 const m=scoreSmartResult(current,target);
 line.hidden=false;
 const percent=target.size?(m.matched===target.size?'100':(Math.floor(m.matched*1000/target.size)/10).toFixed(1)):'0';
 line.textContent=`${recommendationPreview&&!solution?'建議預覽':'實際排法'}｜原目標覆蓋 ${m.matched}/${target.size} 格（${percent}%）｜仍需調整 ${m.missed} 格｜目標外補位 ${m.extra} 格`;
}
// V2.22: heuristic rescue AFTER an exact-cover failure. These layouts are suggestions,
// never mathematical proofs of optimality. Every displayed proposal is validated with
// true V282 piece geometry, group inventory, centre icon and 4-direction connectivity.
function hideSmartRescue(){
 // A regional exact search may also be running for a smart suggestion.
 // Cancelling a suggestion must stop its worker rather than allowing a stale
 // answer to appear after the player edits the board.
 if(rescueBusy)cancelRegionalSolver();
 rescueRun++;rescueBusy=false;smartSuggestions=[];recommendationPreview=null;
 const section=$('smartRescue');if(section){section.hidden=true;$('smartOptions').replaceChildren();$('smartApply').disabled=true;$('smartGenerate').disabled=false;$('smartGenerate').textContent='✦ 產生智慧排法';}
}
function showSmartRescue(reason){
 const section=$('smartRescue');section.hidden=false;
 const capacity=shapeCellCount(),missing=Math.max(0,target.size-capacity);
 const central=!CENTER_KEYS.some(k=>target.has(k));
 const separated=!isConnected(target);
 const flags=[];
 if(missing)flags.push(`可用格數比目標少 ${missing} 格`);
 if(central)flags.push('中央四格未標為目標');
 if(separated)flags.push('目標區塊沒有全部相連');
 if(capacity===target.size&&(central||separated))flags.push('剛好等量，沒有多出的格數可以橋接');
 $('smartExplanation').textContent=reason+(flags.length?' 現況檢查：'+flags.join('；')+'。':'');
 $('smartOptions').replaceChildren();$('smartApply').disabled=true;
 $('smartNote').textContent='藍色目標全部列入求解；先盡可能填滿選取區域，未能覆蓋的格數會分區顯示。';
}
function scoreSmartResult(pieces,wanted){
 const occupied=new Set(pieces.flatMap(p=>p.keys));let matched=0;
 for(const k of wanted)if(occupied.has(k))matched++;
 return {matched,missed:wanted.size-matched,extra:occupied.size-matched,occupied:occupied.size,used:pieces.length};
}
function nearestGoalDistances(goals){
 const out=new Int16Array(SIZE).fill(999),queue=[];
 for(const k of goals){out[k]=0;queue.push(k)}
 for(let i=0;i<queue.length;i++)for(const near of neighbors(queue[i]))if(out[near]>out[queue[i]]+1){out[near]=out[queue[i]]+1;queue.push(near)}
 return out;
}
function preparedSmartPlacements(types){
 // Unlike exact-cover generation, rescue candidates can extend OUTSIDE selected goals.
 // The full board is a legal staging area as long as the overall placement is connected.
 return generateCandidates(types,new Set(Array.from({length:SIZE},(_,i)=>i)),true);
}
// Small deterministic variation explores multiple legitimate center-out routes.
function smartSeed(seed){let x=(seed||1)>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
// V2.25: score a complete stat sector rather than treating the individual
// highlighted squares as interchangeable. Each outer sector has 40 cells,
// each inner sector 15. Unselected sectors never count as completed.
let priorityPlannerExplicit=false;
function smartSectorPlan(wanted){
 const byLetter=new Map();
 for(const k of wanted){
  const letter=REGION_ROWS[Math.floor(k/W)][k%W];
  if(!byLetter.has(letter))byLetter.set(letter,new Set());
  byLetter.get(letter).add(k);
 }
 const desired=[];
 for(const [letter,cells] of byLetter){
  const area=letter===letter.toUpperCase()?40:15;
  // Every blue target cell is intentional. Never discard a partially selected sector.
  if(!cells.size)continue;
  const label=letter===letter.toUpperCase()
   ?OUTER_SECTORS.find(x=>OUTER_REGION_KEYS[letter]===x.id)?.label||letter
   :coreAssignments[CORE_REGION_KEYS[letter]]||letter;
  desired.push({letter,cells,area,label,fullRequest:cells.size===area,
   distance:nearestGoalDistances(cells)});
 }
 // The options shown on screen are real preferences, including the defaults.
 // Apply them only to properties actually included in the painted target.
 const preferred=[$('priorityFirst')?.value,$('prioritySecond')?.value,$('priorityThird')?.value]
  .map(regionLetterForChoice).filter(letter=>letter&&byLetter.has(letter));
 desired.sort((a,b)=>{
  const pa=preferred.indexOf(a.letter),pb=preferred.indexOf(b.letter);
  if(pa!==pb)return pa<0?1:pb<0?-1:pa-pb;
  // Preserve the player's blue-cell selection order for otherwise unranked
  // regions. A partially painted blue sector is not less important than an
  // easier fully painted one.
  return 0;
 });
 return {desired,preferred};
}
function smartSectorMetrics(pieces,wanted,plan){
 const base=scoreSmartResult(pieces,wanted),occupied=new Set(pieces.flatMap(p=>p.keys));
 const sectors=plan.desired.map(item=>{
  let hit=0;for(const k of item.cells)if(occupied.has(k))hit++;
  return {label:item.label,letter:item.letter,hit,total:item.cells.size,
   complete:hit===item.cells.size,fullRequest:item.fullRequest};
 });
 const whole=sectors.filter(x=>x.complete&&x.fullRequest).length;
 const complete=sectors.filter(x=>x.complete).length;
 const highPriority=plan.preferred.map(id=>sectors.find(x=>x.letter===id)).filter(Boolean);
 // A full high-priority property always outweighs a few scattered extra squares.
 const priorityScore=highPriority.reduce((sum,x,i)=>sum+(x.complete?1:0)*(3-i)*250,0);
 const wholeScore=whole*850+complete*250;
 const nearly=sectors.reduce((sum,x)=>sum+(x.hit/x.total)**3*x.total,0);
 return {...base,sectors,whole,complete,
  quality:wholeScore+priorityScore+base.matched*3+nearly*4-base.extra*.05};
}
function smartPlacementDistance(keys,dist){let n=1000;for(const k of keys)n=Math.min(n,dist[k]);return n}
function growSmartCluster(wanted,mode,trial,prepared,types,distance,plan,seedPieces=null){
 const inventory=types.map(t=>counts[t.id]),occupied=new Uint8Array(SIZE),picked=[];
 const rng=smartSeed(771+trial*317+mode*1801+wanted.size*11);
 const {byCell,centerCandidates}=prepared;
 const planRegions=plan.desired;
 const ordered=planRegions.slice();
 if(mode===1 && ordered.length>1){
  // Alternative order: nearest-to-center first, then continue through adjacent sectors.
  ordered.sort((a,b)=>{
   const da=Math.min(...CENTER_KEYS.map(k=>a.distance[k]));
   const db=Math.min(...CENTER_KEYS.map(k=>b.distance[k]));
   return da-db||b.cells.size-a.cells.size;
  });
 }else if(mode===2 && ordered.length>1){
  // Keep explicitly selected priority first, try alternate sector route thereafter.
  let first=ordered[0];ordered.splice(0,ordered.length,...[first,...ordered.slice(1).reverse()]);
 }
 let focusIndex=0,focusStall=0;
 const add=p=>{inventory[p.t]--;picked.push(p);for(const k of p.keys)occupied[k]=1};
 let first=null,firstScore=-Infinity;
 const firstFocus=ordered[0]||null;
 for(const p of centerCandidates){
  if(!inventory[p.t])continue;
  let hit=0;for(const k of p.keys)if(wanted.has(k))hit++;
  const to=firstFocus?smartPlacementDistance(p.keys,firstFocus.distance):0;
  const val=hit*9-to*7+rng()*4;
  if(val>firstScore){first=p;firstScore=val}
 }
 if(seedPieces?.length){
  if(!validConnectedLayout(seedPieces,new Set()))return null;
  for(const p of seedPieces){
   if(!inventory[p.t]||p.keys.some(k=>occupied[k]))return null;
   add(p);
  }
 }else{
  if(!first)return null;
  add(first);
 }
 let remaining=0;for(const k of wanted)if(!occupied[k])remaining++;
 while(picked.length<countPieces()){
  while(focusIndex<ordered.length){
   const region=ordered[focusIndex];
   if([...region.cells].some(k=>!occupied[k]))break;
   focusIndex++;focusStall=0;
  }
  const focus=ordered[focusIndex]||null;
  const frontier=new Set();
  for(const p of picked)for(const k of p.keys)for(const nb of neighbors(k))if(!occupied[nb])frontier.add(nb);
  const candidates=new Set();
  for(const k of frontier)for(const p of byCell[k])if(inventory[p.t]>0)candidates.add(p);
  let best=null,bestScore=-Infinity,bestFocus=0,bestGoal=0;
  for(const p of candidates){
   if(!inventory[p.t]||p.keys.some(k=>occupied[k]))continue;
   let gain=0,gainFocus=0,adj=0,adjFocus=0,reach=0;
   for(const k of p.keys){
    if(wanted.has(k))gain++;
    if(focus?.cells.has(k))gainFocus++;
    for(const nb of neighbors(k)){
     if(occupied[nb]){adj++;if(focus?.cells.has(k))adjFocus++}
     else if(focus?.cells.has(nb))reach++;
    }
   }
   const spare=p.keys.length-gain;
   const near=focus?smartPlacementDistance(p.keys,focus.distance):smartPlacementDistance(p.keys,distance);
   // The focus property gets a large incentive for complete dense filling;
   // other wanted areas are not equal-value until the active sector is done.
   // Bridge through empty cells is allowed when necessary to reach it.
   let score;
   if(focus){
    score=gainFocus*79 + gain*5 + adjFocus*4.5 + Math.min(reach,8)*1.25
     -near*(mode===1?13:17) -spare*2 + Math.min(adj,9)*1.1;
    if(gainFocus===0)score-=focusStall>4?10:25;
   }else{
    score=gain*38-spare*(mode===2?7:14)+Math.min(adj,10)*3.5-near*2;
   }
   score+=(rng()-.5)*(trial%4===0?10:24);
   if(score>bestScore){bestScore=score;best=p;bestFocus=gainFocus;bestGoal=gain}
  }
  if(!best)break;
  add(best);remaining-=bestGoal;
  if(focus){
   focusStall=bestFocus?0:focusStall+1;
   // Don't squander all 45 pieces chasing an unreachable final corner.
   if(focusStall>=Math.max(5,Math.floor(countPieces()/7))){focusIndex++;focusStall=0}
  }
  if(remaining===0)break;
 }
 if(!picked.length||!validConnectedLayout(picked,new Set()))return null;
 if(new Set(picked.flatMap(p=>p.keys)).size!==picked.reduce((n,p)=>n+p.keys.length,0))return null;
 return picked.map(p=>({...p}));
}
// A compact option ends at the earliest prefix achieving the maximum number
// of fully completed requested sectors. It avoids using leftover cards merely
// to scatter partial coverage across unrelated attributes.
function smartFullSectorPrefix(pieces,wanted,plan){
 if(!plan.desired.some(r=>r.fullRequest))return pieces;
 let best=pieces,bestScore=-Infinity;
 for(let n=1;n<=pieces.length;n++){
  const prefix=pieces.slice(0,n),metrics=smartSectorMetrics(prefix,wanted,plan);
  if(metrics.whole===0)continue;
  const incomplete=metrics.sectors.filter(s=>!s.complete&&s.hit>0).reduce((sum,s)=>sum+s.hit,0);
  const score=metrics.whole*10000+metrics.complete*3000-incomplete*1.5-n*.15;
  if(score>bestScore){bestScore=score;best=prefix}
 }
 return best;
}
function renderSmartOptions(){
 const options=$('smartOptions');options.replaceChildren();
 smartSuggestions.forEach((entry,index)=>{
  const el=document.createElement('div');el.className='smart-choice';
  const description=document.createElement('div');description.className='smart-choice-details';
  const heading=document.createElement('b');heading.textContent=entry.label+(index===0?' · 建議優先預覽':'');
  const detail=document.createElement('span');
  const whole=entry.metrics.sectors.filter(x=>x.complete&&x.fullRequest).map(x=>x.label);
  const partial=entry.metrics.sectors.filter(x=>!x.complete).sort((a,b)=>b.hit/b.total-a.hit/a.total);
  detail.textContent=`藍色目標已佔領 ${entry.metrics.matched}/${target.size} 格｜完整屬性 ${whole.length} 項${whole.length?'（'+whole.join('、')+'）':''}｜上場 ${entry.metrics.used}/${MAX_DEPLOYED} 張`;
  if(partial.length){const gaps=document.createElement('span');gaps.textContent='尚未滿格：'+partial.slice(0,5).map(x=>`${x.label} ${x.hit}/${x.total}`).join('、');description.append(heading,detail,gaps)}
  if(!description.contains(heading))description.prepend(heading,detail);
  const btn=document.createElement('button');btn.type='button';btn.className='btn btn-small';btn.textContent='預覽此排法';
  btn.addEventListener('click',()=>{
   recommendationPreview=entry.pieces;solution=null;
   options.querySelectorAll('.smart-choice').forEach(x=>x.classList.remove('selected'));
   el.classList.add('selected');
   $('smartApply').disabled=false;$('smartApply').dataset.index=String(index);
   $('smartNote').textContent=`正在預覽「${entry.label}」，尚未套用。淺色目標格代表仍未覆蓋的需求；按「套用預覽排法」才會採用。`;
   updateBoard();
   message(`智慧預覽：覆蓋 ${entry.metrics.matched}/${target.size} 個目標格，調整 ${entry.metrics.missed} 格；拼圖全部相連、無重疊。`);
  });
  el.append(description,btn);options.appendChild(el);
 });
}
// V2.25: sector-first constraint search (not cell-scoring greedy growth).
// Stage A packs EVERY requested cell of a whole property with bounded DFS and
// genuine polyomino geometry, allowing local backtracking on dead ends.
// Stage B connects completed islands to an icon in the 4 central start squares.
// Incomplete sector fragments are never fabricated as a "completed" recommendation.
function smartPlaceable(p,occupied,remaining){
 if(remaining[p.t]<=0)return false;
 for(const k of p.keys)if(occupied[k])return false;
 return true;
}
function smartPackWholeSector(sector,existing,inventory,prepared,variation,deadline){
 const goal=sector.cells,missing=[...goal].filter(k=>!existing[k]);
 if(!missing.length)return {pieces:[],remaining:inventory.slice()};
 const byCell=Array.from({length:SIZE},()=>[]),allowed=new Uint8Array(SIZE);
 for(const k of goal){allowed[k]=1;for(const n of neighbors(k))allowed[n]=1;}
 for(const k of missing){
  for(const p of prepared.byCell[k]){
   const spill=p.keys.reduce((n,c)=>n+!goal.has(c),0);
   // A sector may extend a little across its border, but never spread randomly
   // into distant parts of the board to win a fractional target score.
   if(spill>2||p.keys.some(c=>!allowed[c]))continue;
   byCell[k].push({p,spill});
  }
 }
 const occupied=existing.slice(),remaining=inventory.slice(),placed=[];
 const rng=smartSeed(variation*997+goal.size*71+missing[0]);
 const centerDistance=k=>Math.min(...CENTER_KEYS.map(c=>Math.abs(c%W-k%W)+Math.abs(Math.floor(c/W)-Math.floor(k/W))));
 let nodes=0,timeout=false;
 const capacity=()=>remaining.reduce((n,qty,t)=>n+qty*prepared.types[t].cells.length,0);
 function visit(left){
  if(!left)return true;
  if(++nodes>9500||performance.now()>deadline){timeout=true;return false}
  if(capacity()<left)return false;
  let pivot=-1,minOptions=Infinity,choices=null;
  for(const k of missing){
   if(occupied[k])continue;
   const candidates=[];
   for(const item of byCell[k]){
    if(!smartPlaceable(item.p,occupied,remaining))continue;
    let gain=0;for(const j of item.p.keys)if(goal.has(j)&&!occupied[j])gain++;
    if(!gain)continue;
    candidates.push({...item,gain});
   }
   if(!candidates.length)return false;
   if(candidates.length<minOptions){pivot=k;choices=candidates;minOptions=candidates.length;if(minOptions<=2)break}
  }
  if(pivot<0)return true;
  choices.sort((a,b)=>
   (b.gain*7-b.spill*5)-(a.gain*7-a.spill*5) ||
   (variation%3===0?centerDistance(a.p.keys[0])-centerDistance(b.p.keys[0]):0) ||
   (variation%2?b.p.t-a.p.t:a.p.t-b.p.t));
  // Escape deterministic dead ends: vary high-scoring candidates without
  // compromising feasibility or silently accepting a partly filled sector.
  if(variation%4===3&&choices.length>2){const n=1+Math.floor(rng()*Math.min(3,choices.length-1));choices.splice(1,0,choices.splice(n,1)[0])}
  for(const {p,gain} of choices){
   remaining[p.t]--;placed.push(p);for(const k of p.keys)occupied[k]=1;
   if(visit(left-gain))return true;
   for(const k of p.keys)occupied[k]=0;placed.pop();remaining[p.t]++;
   if(timeout)return false;
  }
  return false;
 }
 const ok=visit(missing.length);
 return ok?{pieces:placed.slice(),remaining:remaining.slice()}:null;
}
function smartTryBridge(locked,inv,prepared,variation,deadline){
 const all=new Uint8Array(SIZE),remaining=inv.slice();
 for(const p of locked)for(const k of p.keys)all[k]=1;
 const centers=prepared.centerCandidates.filter(p=>smartPlaceable(p,all,remaining));
 if(!centers.length)return null;
 const lockedKeys=locked.flatMap(p=>p.keys),rng=smartSeed(variation*3119+locked.length*11);
 const closest=(arr,targets)=>{
  let best=999;for(const k of arr)for(const j of targets){
   const n=Math.abs(k%W-j%W)+Math.abs((k/W|0)-(j/W|0));if(n<best)best=n;
  }return best;
 };
 centers.sort((a,b)=>closest(a.keys,lockedKeys)-closest(b.keys,lockedKeys));
 const limit=Math.min(centers.length,variation%3===0?12:6);
 for(let si=0;si<limit&&performance.now()<deadline;si++){
  const root=centers[(si+variation%3)%Math.min(centers.length,limit)];
  const occupied=all.slice(),available=remaining.slice(),added=[];
  if(!smartPlaceable(root,occupied,available))continue;
  available[root.t]--;added.push(root);for(const k of root.keys)occupied[k]=1;
  for(let round=0;round<Math.min(MAX_DEPLOYED-locked.length,28);round++){
   // Root-connected cells include any previously locked sector reached in this round.
   const rootSeen=new Uint8Array(SIZE),queue=[root.keys[0]];rootSeen[queue[0]]=1;
   for(let qi=0;qi<queue.length;qi++)for(const n of neighbors(queue[qi])){
    if(occupied[n]&&!rootSeen[n]){rootSeen[n]=1;queue.push(n)}
   }
   if(lockedKeys.every(k=>rootSeen[k])){
    const answer=[...locked,...added];
    if(answer.length<=MAX_DEPLOYED&&validConnectedLayout(answer,new Set())&&
       new Set(answer.flatMap(p=>p.keys)).size===answer.reduce((n,p)=>n+p.keys.length,0))return answer;
    break;
   }
   if(added.length+locked.length>=MAX_DEPLOYED)break;
   const pending=lockedKeys.filter(k=>!rootSeen[k]);
   const roots=queue.filter(k=>rootSeen[k]);
   const nearest=closest(roots,pending);
   const fringe=new Set();
   for(const k of roots)for(const n of neighbors(k))if(!occupied[n])fringe.add(n);
   let best=null,bestScore=-Infinity;
   const candidates=new Set();
   for(const k of fringe)for(const p of prepared.byCell[k])candidates.add(p);
   for(const p of candidates){
    if(!smartPlaceable(p,occupied,available))continue;
    let adjacent=false;for(const k of p.keys)for(const n of neighbors(k))if(rootSeen[n]){adjacent=true;break}
    if(!adjacent)continue;
    const newDist=closest(p.keys,pending);
    // The bridge must meaningfully approach the nearest remaining component,
    // not wander into random unselected sectors.
    const progress=nearest-newDist;
    if(progress<=0)continue;
    const score=progress*30-newDist*9+(p.keys.length===5?2:0)+rng()*3;
    if(score>bestScore){bestScore=score;best=p}
   }
   if(!best)break;
   available[best.t]--;added.push(best);for(const k of best.keys)occupied[k]=1;
  }
 }
 return null;
}
// V2.26: The highlighted BLUE cells, not a convenient alternate sector, are
// the contractual objective. Search orders are diversified while every candidate
// is validated against the original target, and low-target-coverage layouts are
// rejected instead of pretending to be a useful recommendation.
function smartRankMetrics(metrics,plan,wanted){
 const first=plan.desired[0];
 const firstSector=metrics.sectors.find(s=>s.letter===first?.letter);
 const priorityHits=plan.preferred.map(letter=>metrics.sectors.find(s=>s.letter===letter));
 const priorities=priorityHits.reduce((n,s,i)=>n+(s?.complete?1:0)*(3-i),0);
 // Completed entire 40-tile sectors are strongly favored, but not at the
 // expense of ignoring most of the user's blue cells.
 const coveredFraction=wanted.size?metrics.matched/wanted.size:0;
 const firstFraction=firstSector?firstSector.hit/firstSector.total:0;
 const untouched=metrics.sectors.filter(s=>s.hit===0).length;
 const allRequestedCovered=metrics.sectors.filter(s=>s.complete).length;
 // The order in which a player chose blue regions matters. Prefer completing
 // the longest *consecutive prefix* of requested sectors rather than skipping
 // one and filling a different, easier side of the board.
 let prefix=0;
 for(const desired of plan.desired){
  if(!metrics.sectors.find(s=>s.letter===desired.letter)?.complete)break;
  prefix++;
 }
 return priorities*80000+prefix*10000+metrics.whole*16000+
  allRequestedCovered*2000+metrics.matched*105+
  Math.round(coveredFraction*4500)+Math.round(firstFraction*5500)
  -untouched*1200-metrics.extra*11-metrics.used*.4;
}
// The *user's priority* (whole requested properties first) is authoritative.
// Do NOT throw away a completed priority sector just because another layout
// covers a few more scattered cells. Keep the maximum-coverage option as an
// explicit second choice rather than silently redefining the first choice.
function smartComparePriority(a,b,plan,wanted){
 const am=a.metrics,bm=b.metrics;
 if((am.matched===wanted.size)!==(bm.matched===wanted.size))return am.matched===wanted.size?-1:1;
 for(const letter of plan.preferred){
  const aa=am.sectors.find(s=>s.letter===letter),bb=bm.sectors.find(s=>s.letter===letter);
  const fullA=Boolean(aa?.complete),fullB=Boolean(bb?.complete);
  if(fullA!==fullB)return fullA?-1:1;
 }
 let ap=0,bp=0;
 for(const x of plan.desired){if(am.sectors.find(s=>s.letter===x.letter)?.complete)ap++;else break}
 for(const x of plan.desired){if(bm.sectors.find(s=>s.letter===x.letter)?.complete)bp++;else break}
 return bp-ap||bm.whole-am.whole||bm.complete-am.complete||bm.matched-am.matched||am.extra-bm.extra||am.used-bm.used||b.rank-a.rank;
}
function smartPresentCandidates(items,plan,wanted,maxCount=3){
 const unique=new Map();for(const entry of items){
  if(!entry?.pieces?.length||!validConnectedLayout(entry.pieces,new Set()))continue;
  if(!unique.has(entry.signature))unique.set(entry.signature,entry);
 }
 const list=[...unique.values()];if(!list.length)return [];
 const maxHit=Math.max(...list.map(x=>x.metrics.matched));
 // For a large, equally sized goal, presenting a scattered 175/220 layout as
 // a 'smart' recommendation is misleading. This is a confidence gate,
 // not a proof of impossibility: preserve the target and explain search limits.
 if(wanted.size>=120&&shapeCellCount()>=wanted.size&&maxHit<Math.ceil(wanted.size*.90))return [];
 // A tiny partial placement is not a useful recommendation for a large goal.
 if(wanted.size>=40&&maxHit<Math.ceil(wanted.size*.55))return [];
 // Do not recommend an absurdly small layout solely because its spill is zero.
 // Priority-first may trade some coverage for complete properties, but every
 // displayed option must remain materially useful for the requested target.
 const minUseful=Math.min(maxHit,Math.max(Math.floor(wanted.size*.6),Math.floor(maxHit*.80)));
 const useful=list.filter(x=>x.metrics.matched>=minUseful);
 const pr=useful.slice().sort((a,b)=>smartComparePriority(a,b,plan,wanted));
 const coverage=useful.slice().sort((a,b)=>b.metrics.matched-a.metrics.matched||b.metrics.whole-a.metrics.whole||a.metrics.extra-b.metrics.extra);
 const spill=useful.slice().sort((a,b)=>a.metrics.extra-b.metrics.extra||b.metrics.matched-a.metrics.matched);
 const chosen=[];
 function add(entry,label){if(entry&&!chosen.some(x=>x.signature===entry.signature))chosen.push({...entry,label})}
 add(pr[0],pr[0].metrics.matched===wanted.size?'完整覆蓋全部目標':'優先完成指定屬性（合法備案）');
 add(coverage[0],'最多目標格（合法備案）');
 add(spill[0],'最少目標外補位（合法備案）');
 for(const x of pr){if(chosen.length>=maxCount)break;add(x,'另一組合法排法')}
 return chosen.slice(0,maxCount);
}
function smartOrderVariants(sectors){
 const orders=[],seen=new Set();
 function add(arr){
  const sig=arr.map(s=>s.letter).join('');
  if(!seen.has(sig)){seen.add(sig);orders.push(arr)}
 }
 add(sectors.slice());
 if(sectors.length>1){
  // The original clicking sequence is primary, but allow alternative routes
  // when packing a sector early makes its neighbours inaccessible.
  add(sectors.slice().reverse());
  const nearCenter=sectors.slice().sort((a,b)=>
   Math.min(...CENTER_KEYS.map(k=>a.distance[k]))-
   Math.min(...CENTER_KEYS.map(k=>b.distance[k])));
  add(nearCenter);
  // Rotate every requested sector into the first position; this prevents a
  // single easier area from crowding out a difficult highlighted area.
  for(let k=0;k<sectors.length;k++){
   add([...sectors.slice(k),...sectors.slice(0,k)]);
   if(sectors.length>2)add([sectors[k],...sectors.filter(s=>s!==sectors[k]).reverse()]);
  }
 }
 return orders;
}
// V2.27: One connected exact-cover search, based on the constraint-first
// approach used by polyomino tilers. Build the central connector BEFORE
// tiling, then solve every blue cell AND the bridge in the SAME backtrack.
// Unlike V2.25/26 we never pack islands first and try to join them later.
async function smartGlobalExactCover(goals,types,prepared,deadline,variation,cancelled){
 if(!goals.size||cancelled())return null;
 const req=connectedRequirements(goals);
 if(!req)return null;
 const supply=types.reduce((n,t)=>n+counts[t.id]*t.cells.length,0);
 if(req.size>supply)return null;
 const allowed=new Uint8Array(SIZE);
 for(const k of req){allowed[k]=1;for(const n of neighbors(k)){allowed[n]=1;for(const nn of neighbors(n))allowed[nn]=1}}
 const byCell=Array.from({length:SIZE},()=>[]),center=[];
 // Only polygons touching a required cell participate. Requiring every
 // polygon to stay within a two-cell band prevents unrelated scattered fills.
 const all=new Set();
 for(const k of req)for(const p of prepared.byCell[k]){
  if(all.has(p)||p.keys.some(x=>!allowed[x]))continue;
  all.add(p);
  const hit=p.keys.reduce((n,x)=>n+req.has(x),0);
  if(!hit)continue;
  const item={p,hit,spill:p.keys.length-hit};
  for(const x of p.keys)if(req.has(x))byCell[x].push(item);
  if(CENTER_SET.has(p.iconKey)&&req.has(p.iconKey))center.push(item);
 }
 if(!center.length)return null;
 const required=[...req],available=types.map(s=>counts[s.id]);
 const occ=new Uint8Array(SIZE),chosen=[];
 let covered=0,nodes=0,expired=false;
 const rng=smartSeed(0x92b41+variation*993);
 const canAdd=item=>available[item.p.t]>0&&chosen.length<MAX_DEPLOYED&&item.p.keys.every(k=>!occ[k]);
 const put=item=>{
  available[item.p.t]--;chosen.push(item.p);
  for(const k of item.p.keys){occ[k]=1;if(req.has(k))covered++}
 };
 const pop=item=>{
  chosen.pop();available[item.p.t]++;
  for(const k of item.p.keys){occ[k]=0;if(req.has(k))covered--}
 };
 function dfs(){
  if(covered===required.length){
   // The required region itself is centre-connected. A piece may extend
   // beyond it, but every piece intersects that region and is attached.
   return validConnectedLayout(chosen,goals)&&
    new Set(chosen.flatMap(p=>p.keys)).size===chosen.reduce((n,p)=>n+p.keys.length,0);
  }
  if(++nodes%256===0&&(performance.now()>deadline||cancelled())){expired=true;return false}
  if(nodes>240000){expired=true;return false}
  if(available.reduce((n,q,i)=>n+q*types[i].cells.length,0)<required.length-covered)return false;
  let pivot=-1,choices=null,minimum=1e9;
  for(const k of required){
   if(occ[k])continue;
   const poss=[];
   for(const c of byCell[k])if(canAdd(c))poss.push(c);
   if(!poss.length)return false;
   if(poss.length<minimum){pivot=k;choices=poss;minimum=poss.length;if(minimum===1)break}
  }
  if(pivot<0)return false;
  choices.sort((a,b)=>b.hit-a.hit||a.spill-b.spill|| (variation%2?a.p.t-b.p.t:b.p.t-a.p.t));
  // Deterministic but varied tie breaks across trials.
  if(variation%3===2&&choices.length>3){const k=1+Math.floor(rng()*Math.min(choices.length-1,5));choices.splice(1,0,choices.splice(k,1)[0])}
  for(const item of choices){
   put(item);
   if(dfs())return true;
   pop(item);
   if(expired)return false;
  }
  return false;
 }
 center.sort((a,b)=>b.hit-a.hit||a.spill-b.spill||(variation%2?a.p.t-b.p.t:b.p.t-a.p.t));
 const maxRoots=Math.min(center.length,Math.max(5,Math.floor((deadline-performance.now())/130)));
 for(let j=0;j<maxRoots;j++){
  if(performance.now()>deadline||cancelled())break;
  const root=center[(j+variation)%center.length];
  if(!canAdd(root))continue;
  put(root);
  if(dfs())return {pieces:chosen.slice(),nodes,required:req.size,method:'global-exact'};
  pop(root);
  if(expired)break;
 }
 return null;
}
function smartGoalSubsets(plan){
 // Preserve the user's chosen priority order. Each attempt either fills a
 // selected whole region, or reports it not found; never silently swaps it
 // with an unrelated easier region.
 const wanted=[],orders=[];
 for(const section of plan.desired){
  wanted.push(...section.cells);
  orders.push({size:wanted.length,sections:orders.length+1,keys:new Set(wanted)});
 }
 return orders.reverse();
}
// V2.30: when a player has selected one square more/less
// than the number of SSS cells available, search nearby valid targets instead
// of pretending that their precise 221/219 choice has an exact cover.
function smartRegionalNeighborGoals(wanted){
 const delta=shapeCellCount()-wanted.size;
 if(Math.abs(delta)!==1||SHAPES.some(s=>s.id.startsWith('ss_')&&counts[s.id]))return [];
 const rg=k=>{const y=k/W|0,x=k%W;return y<10?0:x<11?1:2};
 const sizes=[0,0,0];for(const k of wanted)sizes[rg(k)]++;
 const expected=delta>0?4:1,sector=sizes.findIndex((n,i)=>n%5===expected&&sizes.every((m,j)=>i===j||m%5===0));
 if(sector<0)return [];
 const picks=new Map();
 if(delta<0){
  for(const k of wanted){
   if(rg(k)!==sector||CENTER_SET.has(k))continue;
   const deg=neighbors(k).filter(n=>wanted.has(n)).length;
   if(deg===4)continue;
   const goals=new Set(wanted);goals.delete(k);
   if(isConnected(goals)&&CENTER_KEYS.some(c=>goals.has(c))){
    // An exposed tip is less destructive than an interior tile, so try it first.
    picks.set(k,{goals,cell:k,score:(4-deg)*10-(Math.abs(k%W-11)+Math.abs((k/W|0)-10))*.02});
   }
  }
 }else{
  for(const k of wanted)for(const n of neighbors(k)){
   if(wanted.has(n)||rg(n)!==sector||picks.has(n))continue;
   const deg=neighbors(n).filter(x=>wanted.has(x)).length;
   const goals=new Set(wanted);goals.add(n);
   picks.set(n,{goals,cell:n,score:deg*10});
  }
 }
 return [...picks.values()].sort((a,b)=>b.score-a.score||a.cell-b.cell);
}
async function smartTryNearbyRegional(wanted,plan,deadline,cancelled){
 const trials=smartRegionalNeighborGoals(wanted).slice(0,18);
 for(const candidate of trials){
  if(cancelled())return null;
  const remaining=deadline-performance.now();
  if(remaining<850)break;
  const prepared=prepareRegionalSolver(candidate.goals);
  if(!prepared)continue;
  // No more than 2.8 seconds per nearby geometry. The worker can be cancelled.
  const pieces=await runRegionalSolver(prepared,runToken,candidate.goals,Math.min(2800,remaining-450));
  if(cancelled())return null;
  if(!pieces)continue;
  const metrics=smartSectorMetrics(pieces,wanted,plan);
  if(metrics.matched<Math.min(wanted.size,shapeCellCount())-1)continue;
  return {label:metrics.missed?'只差少數格的高覆蓋排法':'完整覆蓋目標（含必要補位）',
   pieces,metrics,signature:pieces.map(p=>p.id+':'+p.keys.join('.')).sort().join('|'),
   rank:smartRankMetrics(metrics,plan,wanted),method:'nearby-regional'};
 }
 return null;
}
// Sector-first stage: pack a whole requested sector with limited backtracking,
// bridge its resulting island to a true central job icon, and then continue
// growing the remaining requested area. All stages use the SAME strict validator.
// This is a supplementary candidate source, never proof of optimality.
async function smartStagedWholeCandidates(wanted,plan,types,prepared,deadline,cancelled){
 const output=[],distance=nearestGoalDistances(wanted);
 const orders=smartOrderVariants(plan.desired);
 const attempted=new Set();let trial=0;
 for(const order of orders){
  if(cancelled()||performance.now()>deadline-180)break;
  const first=order.find(s=>s.fullRequest)||order[0];
  if(!first||attempted.has(first.letter))continue;
  attempted.add(first.letter);
  for(let variant=0;variant<3&&performance.now()<deadline-150;variant++){
   if(cancelled())return output;
   const inventory=types.map(t=>counts[t.id]);
   const locked=smartPackWholeSector(first,new Uint8Array(SIZE),inventory,prepared,trial+variant,Math.min(deadline-80,performance.now()+950));
   if(!locked?.pieces?.length)continue;
   const bridge=validConnectedLayout(locked.pieces,new Set())?locked.pieces:
    smartTryBridge(locked.pieces,locked.remaining,prepared,trial+variant,Math.min(deadline-50,performance.now()+450));
   if(!bridge||!validConnectedLayout(bridge,new Set()))continue;
   const grown=growSmartCluster(wanted,variant,trial+variant,prepared,types,distance,plan,bridge);
   for(const pieces of [bridge,grown]){
    if(!pieces||!validConnectedLayout(pieces,new Set()))continue;
    const metrics=smartSectorMetrics(pieces,wanted,plan);
    if(metrics.matched<Math.max(1,Math.floor(wanted.size*.4)))continue;
    output.push({label:'指定屬性完整填滿（合法備案）',pieces,metrics,
     signature:pieces.map(p=>p.id+':'+p.keys.join('.')).sort().join('|'),
     rank:smartRankMetrics(metrics,plan,wanted),method:'whole-sector-bridge'});
   }
   trial++;
   await pause();
  }
 }
 return output;
}
// Bounded, centre-connected rescue for targets that the exact-cover engines
// cannot finish. Every recommendation is validated and labelled with uncovered
// cells. The best coverage and the best whole-sector result are kept separately.
async function smartGreedyRescue(wanted,plan,types,prepared,deadline,cancelled){
 const distance=nearestGoalDistances(wanted), all=[],known=new Set();
 for(let trial=0;trial<180&&performance.now()<deadline;trial++){
  if(cancelled())return [];
  const pieces=growSmartCluster(wanted,trial%3,trial,prepared,types,distance,plan);
  if(pieces&&validConnectedLayout(pieces,new Set())){
   // A centre-out greedy layout may complete a chosen sector early and then
   // squander spare cards filling unrelated half-sectors. Keep a legal
   // compact prefix as a separate candidate when its coverage is useful.
   const compact=smartFullSectorPrefix(pieces,wanted,plan);
   for(const candidate of compact.length<pieces.length?[pieces,compact]:[pieces]){
    if(!validConnectedLayout(candidate,new Set()))continue;
    const metrics=smartSectorMetrics(candidate,wanted,plan);
    if(metrics.matched<Math.max(1,Math.floor(wanted.size*.55)))continue;
    const signature=candidate.map(p=>p.id+':'+p.keys.join('.')).sort().join('|');
    if(!known.has(signature)){
     known.add(signature);all.push({label:'合法替代排法',pieces:candidate,metrics,signature,
      rank:smartRankMetrics(metrics,plan,wanted),method:'connected-approx'});
    }
   }
  }
  if(trial%5===4)await pause(); // Preserve buttons and paint responsiveness.
 }
 if(!all.length)return [];
 // Retain the entire validated result pool until the final objective comparison.
 // A solution that completes a priority sector must not be discarded by a
 // threshold computed solely from maximum cell coverage.
 const sorted=all.slice().sort((a,b)=>smartComparePriority(a,b,plan,wanted));
 const byCoverage=all.slice().sort((a,b)=>b.metrics.matched-a.metrics.matched||b.metrics.whole-a.metrics.whole);
 const bySpill=all.slice().sort((a,b)=>a.metrics.extra-b.metrics.extra||b.metrics.matched-a.metrics.matched);
 const diverse=new Map();
 for(const x of [...sorted.slice(0,4),...byCoverage.slice(0,4),...bySpill.slice(0,3)])diverse.set(x.signature,x);
 return [...diverse.values()];
}
async function computeSmartLayoutCandidates(wanted,budgetMs=23000,cancelled=()=>false){
 const plan=smartSectorPlan(wanted),desired=plan.desired;
 if(!desired.length)return {candidates:[],plan,reason:'no-target'};
 const types=SHAPES.filter(s=>counts[s.id]>0);
 if(!types.length)return {candidates:[],plan,reason:'no-pieces'};
 const end=performance.now()+budgetMs;
 // First ask the independent worker for a TRUE full exact solution. Saved
 // player examples are deliberately excluded from every automatic path.
 if(target.size===wanted.size&&[...wanted].every(k=>target.has(k))){
  const regional=prepareRegionalSolver(wanted);
  if(regional){
   const remaining=end-performance.now();
   const pieces=await runRegionalSolver(regional,runToken,wanted,Math.min(18500,Math.max(2500,remaining-2800)));
   if(cancelled())return {candidates:[],plan,cancelled:true};
   // A failed worker launch is a technical failure, not a reason to present
   // a poor greedy layout as if the exact solver proved the board unsolvable.
   if(!pieces&&/^(worker-start|worker-runtime|error|worker-timeout)/.test(regionalLastError))
    return {candidates:[],plan,reason:'worker-error',workerError:regionalLastError};
   if(pieces){
    const metrics=smartSectorMetrics(pieces,wanted,plan);
    return {candidates:[{label:'完整覆蓋全部目標',pieces,metrics,
      signature:pieces.map(p=>p.id+':'+p.keys.join('.')).sort().join('|'),
      rank:smartRankMetrics(metrics,plan,wanted),method:'regional-exact'}],
     plan,trials:1,reason:'solved'};
   }
  }
 }
 // One-cell over/under selection: search for a genuine, independently solved
 // nearby 5-cell arrangement before returning any partial heuristic layout.
 if(Math.abs(shapeCellCount()-wanted.size)===1&&performance.now()<end-1000){
  const near=await smartTryNearbyRegional(wanted,plan,Math.min(end-1800,performance.now()+10500),cancelled);
  if(cancelled())return {candidates:[],plan,cancelled:true};
  if(near)return {candidates:[near],plan,trials:1,reason:'nearby'};
 }
 const prepared={...preparedSmartPlacements(types),types};
 const subsets=smartGoalSubsets(plan), best=[],signatures=new Set();let trials=0;
 // Reserve at least 40% of the remaining time for a validated fallback.
 const exactEnd=Math.min(end-2200,performance.now()+Math.max(1200,(end-performance.now())*.55));
 for(const group of subsets){
  if(cancelled())return {candidates:[],plan,cancelled:true};
  const left=exactEnd-performance.now();if(left<180)break;
  const smaller=subsets.filter(x=>x.sections<group.sections).length;
  const allotted=Math.min(left-50,Math.max(230,Math.min(1400,left/(smaller+1))));
  const stop=performance.now()+allotted;
  for(let variant=0;variant<3&&performance.now()<stop;variant++){
   const exact=await smartGlobalExactCover(group.keys,types,prepared,stop,variant+trials,cancelled);
   trials++;
   if(cancelled())return {candidates:[],plan,cancelled:true};
   if(exact){
    const metrics=smartSectorMetrics(exact.pieces,wanted,plan);
    const signature=exact.pieces.map(p=>p.id+':'+p.keys.join('.')).sort().join('|');
    if(!signatures.has(signature)){
     signatures.add(signature);
     best.push({label:`優先完成 ${group.sections} 個區域`,pieces:exact.pieces,metrics,signature,
      rank:smartRankMetrics(metrics,plan,wanted),method:exact.method});
    }
    if(metrics.matched===wanted.size){return {candidates:best.slice(0,1),plan,trials,reason:'solved'}};
    break;
   }
   await pause();
  }
  if(best.length&&best.some(x=>x.metrics.matched===wanted.size))break;
 }
 if(cancelled())return {candidates:[],plan,cancelled:true};
 // Important V2.29 bug: old code returned no candidate after the exact-cover
 // limit, even if 180+ target cells could be covered by a legal arrangement.
 // Try true whole-property packing/bridging as a separate alternative.
 const stagedDeadline=Math.min(end-550,performance.now()+Math.max(150,Math.min(2200,(end-performance.now())*.32)));
 const staged=await smartStagedWholeCandidates(wanted,plan,types,prepared,stagedDeadline,cancelled);
 if(cancelled())return {candidates:[],plan,cancelled:true};
 for(const x of staged)if(!signatures.has(x.signature)){signatures.add(x.signature);best.push(x)}
 const fallback=await smartGreedyRescue(wanted,plan,types,prepared,end,cancelled);
 if(cancelled())return {candidates:[],plan,cancelled:true};
 for(const x of fallback)if(!signatures.has(x.signature)){signatures.add(x.signature);best.push(x)}
 if(!best.length)return {candidates:[],plan,trials,reason:'time-limit'};
 // Retain genuinely different objectives. Do not suppress a complete
 // priority region because another layout covers more scattered squares.
 const filtered=smartPresentCandidates(best,plan,wanted);
 const maxFound=Math.max(...best.map(x=>x.metrics.matched));
 return {candidates:filtered,plan,trials,reason:filtered.length?'partial':'quality-limit',
   weak:filtered.length?null:{matched:maxFound}};
}
async function generateSmartSuggestions(){
 if(rescueBusy||!target.size||!countPieces())return;
 rescueBusy=true;const task=++rescueRun,button=$('smartGenerate');
 recommendationPreview=null;smartSuggestions=[];
 $('smartApply').disabled=true;$('smartApply').removeAttribute('data-index');$('smartOptions').replaceChildren();
 updateBoard();button.disabled=true;button.textContent='依藍色目標精算中…';
 $('smartNote').textContent='正在以藍色指定格為目標，優先完成整區屬性並連接中央；不會拿其他區域的排列冒充目標成功。';
 try{
  const result=await computeSmartLayoutCandidates(new Set(target),23000,()=>task!==rescueRun);
  if(task!==rescueRun||result.cancelled)return;
  smartSuggestions=result.candidates;
  if(!smartSuggestions.length){
   $('smartNote').textContent=result.reason==='no-target'
    ?'請先標記想要佔領的藍色目標格。'
    :result.reason==='worker-error'
    ?`自動排版暫時無法啟動，請重新整理頁面再試；若持續發生，請聯絡官方。此情況不代表拼圖無解。`
    :`這次尚未找到合適的替代排法（搜尋有時間上限，不代表無解）。${result.weak?`最高僅覆蓋 ${result.weak.matched}/${target.size} 格，尚有大片缺口，因此不把它當成推薦方案。`:''}可調整目標屬性或拼圖數量後再試。`;
   return;
  }
  renderSmartOptions();
  const first=smartSuggestions[0].metrics;
  const topCoverage=Math.max(...smartSuggestions.map(x=>x.metrics.matched));
  $('smartNote').textContent=`已驗證 ${smartSuggestions.length} 組合法排法；優先屬性首選 ${first.matched}/${target.size} 格，整區完成 ${first.whole} 項；其中最高目標覆蓋 ${topCoverage}/${target.size} 格。未覆蓋的藍色格仍會顯示，此為限時搜尋，不保證全域最優。`;
 }catch(err){console.error(err);$('smartNote').textContent='目標精算發生錯誤，未修改原目標與職業數量。'}
 finally{if(task===rescueRun){rescueBusy=false;button.disabled=false;button.textContent='↻ 重新精算建議'}}
}
function setupSmartRescue(){
 $('smartGenerate').addEventListener('click',generateSmartSuggestions);
 $('smartApply').addEventListener('click',()=>{
  const index=Number($('smartApply').dataset.index),candidate=smartSuggestions[index];
  if(!candidate||!recommendationPreview||!validConnectedLayout(candidate.pieces,new Set())){notify('建議已過期，請重新產生');return}
  solution=candidate.pieces;recommendationPreview=null;activePresetId=null;
  const metrics=scoreSmartResult(solution,target);
  $('smartRescue').hidden=true;smartSuggestions=[];updateBoard();
  message(`已套用建議「${candidate.label}」：目標佔領 ${metrics.matched}/${target.size} 格；另外 ${metrics.extra} 格用於連接或補位；${metrics.used} 張上場，全部連通且無重疊。未覆蓋的目標仍保留標示。`,'success');
 });
 $('smartDismiss').addEventListener('click',()=>{const had=Boolean(recommendationPreview);hideSmartRescue();if(had)updateBoard();message('已取消智慧推薦，保留原目標與角色卡數量。')});
}

// V2.29: Independent from-zero regional exact cover for five-cell pieces.
// This solver does not read the V2.28 player proof and runs in a separate
// Web Worker to avoid freezing the board/BGM. It only applies when the selected
// goal can be exactly divided into 3 self-contained 5-cell regions. Otherwise
// the existing connected-cover engine remains unchanged.
let regionalWorker=null, regionalFinish=null, regionalCache=null;
let regionalLastError='';
// V2.34: inline, self-contained worker source. Browser security blocks
// relative file:// workers (origin null). Blob workers do not require
// loading a secondary file and are usable for local preview and GitHub Pages.
// The WASM bytes are already embedded inside this same worker source.
const REGIONAL_WORKER_SOURCE="/* V2.32: self-contained Legion solver worker.\n  No secondary WASM fetch; prevents stale/missing asset and mismatched deployment.\n  A solve result is never loaded from the player example. */\n'use strict';\nconst WASM_BASE64 = 'AGFzbQEAAAABJAZgAABgAAF/YAF/AX9gBX9+fn9/AGAEfn5/fwF/YAN/f38BfwMLCgABAQEBAgMEBQUFBgEBgAKACAZHCn8BQdDcpgELfwBBgAgLfwBB0NyiAQt/AEHQ3KIBC38AQdDcpgELfwBBgAgLfwBB0NymAQt/AEGAgIAIC38AQQALfwBBAQsH9AESBm1lbW9yeQIAEV9fd2FzbV9jYWxsX2N0b3JzAAAJZ2V0X2lucHV0AAEKZ2V0X291dHB1dAACCmdldF9zdGF0dXMAAxBnZXRfc2VhcmNoX25vZGVzAAQFc29sdmUABQZtZW1jcHkACAZtZW1zZXQACQxfX2Rzb19oYW5kbGUDAQpfX2RhdGFfZW5kAwILX19zdGFja19sb3cDAwxfX3N0YWNrX2hpZ2gDBA1fX2dsb2JhbF9iYXNlAwULX19oZWFwX2Jhc2UDBgpfX2hlYXBfZW5kAwcNX19tZW1vcnlfYmFzZQMIDF9fdGFibGVfYmFzZQMJCuo0CgIACwgAQaCIgIAACwgAQaCfooAACwsAQQAoAuigooAACwsAQQAoAvCgooAAC8YWAxB/An4Cf0EAQgA3A/CgooAAQQBBADYC+KCigABBAEEANgLooKKAAEEAQQA2AvygooAAQQBBADYCgKGigABBfyEBAkACQAJAIABBn7p3akGlundPDQBBfyECDAELQQBBACgCoIiAgAAiAzYCkKGigABBfiECIANBLUsNAEEAQQAoAqSIgIAAIgM2ApShooAAIANBLUsNAEEAQQAoAqiIgIAAIgM2ApihooAAIANBLUsNAEEAQQAoAqyIgIAAIgM2ApyhooAAIANBLUsNAEEAQQAoArCIgIAAIgM2AqChooAAIANBLUsNAEEAQQAoArSIgIAAIgM2AqShooAAIANBLUsNAEEGIQRBuPSwgAAhBUF/IQFBsKGigAAhBkEAIQcDQAJAIARBAmoiCCAATA0AQX0hAgwCCyAHQYjXFmxBsKGigABqIgkgBEECdCICQaCIgIAAaiIKKAIAIgs2AgAgCSACQaSIgIAAaigCACIMNgIEQXwhAiALQf9+akGEf0kNASAMQfdYakH4WEkNASAMQQN0IAhqIABKDQEgC0EHcSEDQQAhDQJAIAtBf2pBB0kNACALQfgBcSELQQAhDSAGIQIDQCACQaDTDmpCADcDACACQZjTDmpCADcDACACQZDTDmpCADcDACACQYjTDmpCADcDACACQSBqIQIgCyANQQhqIg1HDQALCwJAIANFDQAgBSANQQJ0aiECA0AgAkEANgIAIAJBBGohAiADQX9qIgMNAAsLAkACQCAMQQFODQAgCCEEDAELIAlBiNcOaiEOIAlBiNMOaiEMQQAhCyAGIQMgCCEEA0AgA0EwaiIIQgA3AwAgA0EoaiIPQgA3AwAgA0EIaiAKQQhqKAIANgIAIANBDGogCkEMaigCACICNgIAIANBEGogCkEQaigCADYCAAJAIAJBBU0NAEF7IQIMBAtBeiECIApBFGooAgAiDUEASA0DIA0gCSgCAE4NAyAMIA1BAnRqIhAoAgBB/wFKDQMgA0EUaiANNgIAAkACQCANQT9LDQAgD0IBIA2thiIRNwMAQgAhEgwBCyAIQgEgDUFAaq2GIhI3AwBCACERCyAQIBAoAgAiE0EBajYCACAOIA1BCnRqIBNBAnRqIAs2AgAgCkEYaigCACINQQBIDQMgDSAJKAIATg0DIAwgDUECdGoiECgCAEH/AUoNAyADQRhqIA02AgACQAJAIA1BwABJDQAgCCASQgEgDUFAaq2GhCISNwMADAELIA8gEUIBIA2thoQiETcDAAsgECAQKAIAIhNBAWo2AgAgDiANQQp0aiATQQJ0aiALNgIAIApBHGooAgAiDUEASA0DIA0gCSgCAE4NAyAMIA1BAnRqIhAoAgBB/wFKDQMgA0EcaiANNgIAAkACQCANQcAASQ0AIAggEkIBIA1BQGqthoQiEjcDAAwBCyAPIBFCASANrYaEIhE3AwALIBAgECgCACITQQFqNgIAIA4gDUEKdGogE0ECdGogCzYCACAKQSBqIhMoAgAiDUEASA0DIA0gCSgCAE4NAyAMIA1BAnRqIhAoAgBB/wFKDQMgA0EgaiANNgIAAkACQCANQcAASQ0AIAggEkIBIA1BQGqthoQiEjcDAAwBCyAPIBFCASANrYaEIhE3AwALIBAgECgCACIPQQFqNgIAIA4gDUEKdGogD0ECdGogCzYCACAKQSRqKAIAIg1BAEgNAyANIAkoAgBODQMgDCANQQJ0aiIKKAIAQf8BSg0DIANBJGogDTYCACAKIAooAgAiAkEBajYCACAOIA1BCnRqIAJBAnRqIAs2AgAgA0EoQTAgDUHAAEkiAhtqIBEgEiACG0IBIA0gDUFAaiACG62GhDcDACAEQQhqIQQgCCEDIBMhCiALQQFqIgsgCSgCBEgNAAsLIAVBiNcWaiEFIAZBiNcWaiEGIAdBAWoiB0EDRw0AC0EAQgA3A+Cm5oAAQQBCADcD2KbmgABBAEIANwPQpuaAAEEAQgBCAEEAQQAQhoCAgABBAEIANwPgpuaAAEEAQgA3A9im5oAAQQBCADcD0KbmgABBAkIAQgBBAEEAEIaAgIAAAkBBACgC+KCigAAiBUEBSA0AQQAhBkEAKAL8oKKAACILQQFIDQBBACgCpKGigAAhFEEAKAKgoaKAACEHQQAoApyhooAAIQ9BACgCmKGigAAhCEEAKAKUoaKAACEOQQAoApChooAAIQoDQCAGQdABbEHwpuaAAGoiCS0AACEBQQAhAgNAAkAgAkHQAWwiA0HwxumAAGoiAC0AACABaiINIApKDQAgAC0AASAJLQABaiIMIA5KDQAgAC0AAiAJLQACaiIEIAhKDQAgAC0AAyAJLQADaiIQIA9KDQAgAC0ABCAJLQAEaiITIAdKDQAgAC0ABSAJLQAFaiIAIBRKDQAgA0H2xumAAGoxAABCDIYgDUEGdK2EIAythEIYhiAEQRJ0IBBBDHRyrYQgE0EGdCAAcq2EIhJCAXwhESASQpX4qfqXtx5+QiCIpyEAQYCAAiEMA0AgAEH//wFxIgNBA3RB8NrzgABqIg0pAwAiEiARUQ0BAkAgElANACAAQQFqQf//AXEiA0EDdEHw2vOAAGoiDSkDACISIBFRDQIgElANACADQQFqIQAgDEF+aiIMDQEMAgsLIA0gETcDACADQQJ0IgBB0NySgQBqIAY2AgAgAEHQ3JqBAGogAjYCAAsgAkEBaiICIAtHDQALIAZBAWoiBiAFRw0ACwtBACgCkKGigAAhCEEAKAKUoaKAACEQQQAoApihooAAIQ9BACgCnKGigAAhBkEAKAKgoaKAACETQQAoAqShooAAIQdBACgCgKGigAAhCkEAIQsDQAJAIAtBA3RB8NrzgABqKQMAIhFQDQAgByARQn98IhGnIgJBP3FrIQQgCCARQh6Ip0E/cWshDiAQIAJBGHZBP3FrIQMgDyACQRJ2QT9xayENIAYgAkEMdkE/cWshCSATIAJBBnZBP3FrIQwCQCAKQQFIDQBB8NqDgQAhAiAOQf8BcSEBIAohAANAAkAgAi0AACABRw0AIAJBAWotAAAgA0H/AXFHDQAgAkECai0AACANQf8BcUcNACACQQNqLQAAIAlB/wFxRw0AIAJBBGotAAAgDEH/AXFHDQAgAkEFai0AACAEQf8BcUYNAwsgAkEGaiECIABBf2oiAA0ACwtBACAKQQFqIgA2AoChooAAIApBBmwiAkH12oOBAGogBDoAACACQfTag4EAaiAMOgAAIAJB89qDgQBqIAk6AAAgAkHy2oOBAGogDToAACACQfHag4EAaiADOgAAIAJB8NqDgQBqIA46AAAgACEKCyALQQFqIgtBgIACRw0ACwJAQQAoArj4uIAAIgJBAUgNAEHAz8eAACEEQQAhDgNAAkAgDkECdEHAy8eAAGoiDCgCAEECSA0AIA5BCnRBwM/HgABqIQpBASENIAQhCwNAIAogDUECdGooAgAiCUEwbEHE+LiAAGohAyALIQIgDSEAAkADQCACKAIAIgFBMGxBxPi4gABqKAIAQQJ0QYCIgIAAaigCACADKAIAQQJ0QYCIgIAAaigCAEwNASACQQRqIAE2AgAgAkF8aiECIABBf2oiAEEBakEBSg0AC0EAIQALIAogAEECdGogCTYCACALQQRqIQsgDUEBaiINIAwoAgBIDQALQQAoArj4uIAAIQILIARBgAhqIQQgDkEBaiIOIAJIDQALC0EAQgA3A+Cm5oAAQQBCADcD2KbmgABBAEIANwPQpuaAAEIAQgBBAEEAEIeAgIAAIgENAUEAIQFBACgC6KCigAANAUECIQILQQAgAjYC6KCigAALIAEL/QkCDH8CfiAAQQJ0QfDaj4EAaiIFIAUoAgBBAWo2AgACQAJAIABBAkcNAEEAKAL42o+BAEGA0w5LDQELAkAgBEEFbCAAQYjXFmxBsKGigABqIgUoAgAiBkcNAEEAKALcpuaAACIHrEIMhkEAKALYpuaAACIIrEIShoRBACgC0KbmgAAiCaxCBoYgA61CDIaEQQAoAtSm5oAAIgqshEIYhoRBACgC5KbmgAAiBqyEQQAoAuCm5oAAIgusQgaGhCIBQgF8IQJBgCBBgBAgABsiDEF/aiINIAFClfip+pe33puef35CIIincSEFQdDckIEAQdDcj4EAIAAbIQ4DQCAOIAVBA3RqIg8pAwAiASACUQ0CAkAgAVANACAOIAVBAWogDXEiBUEDdGoiDykDACIBIAJRDQMgAVANACAFQQFqIA1xIQUgDEF+aiIMDQEMAwsLIA8gAjcDAEH8oKKAAEH4oKKAACAAGyIOKAIAIgVBoAZBgAIgABtODQEgDiAFQQFqNgIAQfDG6YAAQfCm5oAAIAAbIAVB0AFsaiIMIAQ6AAcgDCADOgAGIAwgBjoABSAMIAs6AAQgDCAHOgADIAwgCDoAAiAMIAo6AAEgDCAJOgAAIARBAUgNASAEQQNxIQ9BACENAkAgBEEESQ0AIARB/P///wdxIQdBACEFQQAhDQNAIAwgBWoiDkEIaiAFQYDbj4EAaigCADYCACAOQQxqIAVBhNuPgQBqKAIANgIAIA5BEGogBUGI24+BAGooAgA2AgAgDkEUaiAFQYzbj4EAaigCADYCACAFQRBqIQUgByANQQRqIg1HDQALCyAPRQ0BIAxBCGohDiANQQJ0IQUDQCAOIAVqIAVBgNuPgQBqKAIANgIAIAVBBGohBSAPQX9qIg8NAAwCCwsgBkEBSA0AIAVBiNcOaiEJIAVBCGohDCAFQYjTDmohEEH/////ByEKQQAhB0F/IQsCQANAAkAgASACIAdBwABJIgUbIAcgB0FAaiAFG62Ip0EBcQ0AQQAhCAJAIBAgB0ECdGooAgAiDkEBSA0AIAkhBQNAAkAgDCAFKAIAQTBsaiIPKAIEQQJ0Ig1B0KbmgABqKAIAIA1BkKGigABqKAIATg0AIA9BKGopAwAgAoMgD0EgaikDACABg4RQRQ0AIAhBAWohCAsgBUEEaiEFIA5Bf2oiDg0ACwsgCyAHIAggCk4iBRshCyAIIAogCCAKSBshCiAFDQAgCEEBTA0CCyAJQYAIaiEJIAdBAWoiByAGRw0ACwsgC0EASA0AIBAgC0ECdGoiCigCACIHQQFIDQAgAEGI1xZsIAtBCnRqQbj4sIAAaiEFIARBAWohBiAEQQJ0QYDbj4EAaiELQQAhDwNAAkAgDCAFKAIAQTBsaiIOKAIEQQJ0Ig1B0KbmgABqIggoAgAiCSANQZChooAAaigCAE4NACAOQShqKQMAIhEgAoMgDkEgaikDACISIAGDhEIAUg0AQQEhDSAIIAlBAWo2AgAgCyAOKAIANgIAIBEgAoQhESASIAGEIRICQCADDQAgDigCCEEARyENCyAAIBIgESANIAYQhoCAgAAgDigCBEECdEHQpuaAAGoiDiAOKAIAQX9qNgIAQQAoAvygooAAQdgESEEAKAL4oKKAAEH4AEggABtBAUcNAiAKKAIAIQcLIAVBBGohBSAPQQFqIg8gB0gNAAsLC4IRBAF+A38Efg5/QQBBACkD8KCigABCAXwiBDcD8KCigABBAyEFQQAhBgJAIARCgNrECVYNAEEAIQUCQAJAAkAgA0EFbEEAKAK4+LiAACIHRw0AQQAoAqChooAAQQAoAuCm5oAAa6xCBoZBACgCpKGigABBACgC5KbmgABrrIQhBEEAKAKQoaKAAEEAKALQpuaAAGusQgaGIQhBACgCnKGigABBACgC3KbmgABrrCEJQQAoApihooAAQQAoAtim5oAAa6whCkEAKAKUoaKAAEEAKALUpuaAAGusIQsCQCACRQ0AIAQgCCALhEIYhiAKQhKGIAlCDIaEhIQiAEIBfCEBIABClfip+pe3Hn5CIIinIQxBgIACIQ0DQCAMQf//AXEiDkEDdEHw2vOAAGopAwAiACABUQ0EIABQDQEgDEEBakH//wFxIg5BA3RB8NrzgABqKQMAIgAgAVENBCAAUA0BIA5BAWohDCANQX5qIg0NAAsLIAggC4RCGIYgCkIShiAJQgyGhIQgBIRCgICAgIAChCIAQgF8IQEgAEKV+Kn6l7cefkIgiKchDEGAgAIhDQNAIAxB//8BcSIOQQN0QfDa84AAaikDACIAIAFRDQNBACEFIABQDQIgDEEBakH//wFxIg5BA3RB8NrzgABqKQMAIgAgAVENAyAAUA0CIA5BAWohDCANQX5qIg0NAAwCCwsgB0EBSA0AQf////8HIQ9BACEFQcDPx4AAIRBBfyERAkADQAJAIAAgASAFQcAASSIOGyAFIAVBQGogDhutiKdBAXENAEEAIQYCQCAFQQJ0QcDLx4AAaigCACIMQQFIDQAgECEOA0ACQCAOKAIAQTBsIhJBxPi4gABqKAIAQQJ0Ig1B0KbmgABqKAIAIA1BkKGigABqKAIATg0AIBJBwPi4gABqIg1BKGopAwAgAYMgDUEgaikDACAAg4RQRQ0AIAZBAWohBgsgDkEEaiEOIAxBf2oiDA0ACwsgESAFIAYgD04iDhshESAGIA8gBiAPSBshDyAODQAgBkEBTA0CCyAQQYAIaiEQIAVBAWoiBSAHRw0ACwtBACEFIBFBAEgNACARQQJ0QcDLx4AAaiITKAIAIg1BAUgNACADQQFqIRQgA0ECdEGA24+BAGohFSARQQp0IQNBACEGA0ACQCADIAZBAnRqQcDPx4AAaigCAEEwbCIMQcT4uIAAaigCACIRQQJ0Ig5B0KbmgABqIhIoAgAiDyAOQZChooAAaigCAE4NACAMQcD4uIAAaiIHQShqKQMAIgQgAYMgB0EgaikDACIIIACDhEIAUg0AIBIgD0EBajYCACAVIAcoAgA2AgBBACEFAkBBACgCgKGigAAiDUEBSA0AQQAhDEEAKALkpuaAACEWQQAoAuCm5oAAIRdBACgC3KbmgAAhGEEAKALYpuaAACEZQQAoAtSm5oAAIRBBACgC0KbmgAAhBUEBIRJB8NqDgQAhDgJAA0ACQCAFIA4tAABKDQAgECAOQQFqLQAASg0AIBkgDkECai0AAEoNACAYIA5BA2otAABKDQAgFyAOQQRqLQAASg0AIBYgDkEFai0AAEwNAgsgDkEGaiEOIAxBAWoiDCANSCESIA0gDEcNAAsLQQAhBSASQQFxRQ0AIAQgAYQhBCAIIACEIQhBASEOAkAgAg0AIAcoAghBAEchDgsgCCAEIA4gFBCHgICAACEFIAcoAgQiEUECdEHQpuaAAGooAgBBf2ohDwsgEUECdEHQpuaAAGogDzYCACAFQQBKDQJBACgC6KCigABBA0YNAiATKAIAIQ0LIAZBAWoiBiANSA0AC0EADwsgBQ8LIA5BAnQiDkHQ3JqBAGooAgAiEUHQAWxB8MbpgABqIRACQCAOQdDckoEAaigCAEHQAWwiDkH3puaAAGotAAAiBkUNACAOQfCm5oAAaiEFIAZBA3EhDUEAIRICQCAGQQRJDQAgBkECdEHwB3EhD0EAIQ5BACESA0AgDkGgn6KAAGogBSAOaiIMQQhqKAIANgIAIA5BpJ+igABqIAxBDGooAgA2AgAgDkGon6KAAGogDEEQaigCADYCACAOQayfooAAaiAMQRRqKAIANgIAIBJBBGohEiAPIA5BEGoiDkcNAAsLIA1FDQAgBUEIaiEMIBJBAnQhDgNAIA5BoJ+igABqIAwgDmooAgA2AgAgDkEEaiEOIA1Bf2oiDQ0ACwsCQCAQLQAHIg5FDQAgDkEDcSENAkACQCAOQQRPDQBBACEODAELIA5BAnRB8AdxIQ8gBkECdEGgn6KAAGohB0EAIQxBACEOA0AgByAOaiISIBAgDmoiBUEIaikDADcCACASQQhqIAVBEGopAwA3AgAgDEF8aiEMIA8gDkEQaiIORw0ACyAGIAxrIQZBACAMayEOCyANRQ0AIBFB0AFsIA5BAnRqQfjG6YAAaiEOIAYgDWohEiAGQQJ0QaCfooAAaiEMA0AgDCAOKAIANgIAIAxBBGohDCAOQQRqIQ4gDUF/aiINDQALIBIhBgtBASEFIANBAUgNACADQQNxIQ0CQAJAIANBBE8NAEEAIQwMAQtBACESQQAgA0H8////B3FrIRAgBkECdEGgn6KAAGohD0EAIQ4DQCAPIA5qIgwgDkGA24+BAGooAgA2AgAgDEEEaiAOQYTbj4EAaigCADYCACAMQQhqIA5BiNuPgQBqKAIANgIAIAxBDGogDkGM24+BAGooAgA2AgAgDkEQaiEOIBAgEkF8aiISRw0ACyAGIBJrIQZBACASayEMCyANRQ0AIAYgDWohEiAGQQJ0QaCfooAAaiEOIAxBAnRBgNuPgQBqIQwDQCAOIAwoAgA2AgAgDkEEaiEOIAxBBGohDCANQX9qIg0NAAsgEiEGC0EAIAU2AuigooAAIAYLuAEBBH8CQCACRQ0AIAJBA3EhA0EAIQQCQCACQQRJDQAgAkF8cSEFQQAhBANAIAAgBGoiAiABIARqIgYtAAA6AAAgAkEBaiAGQQFqLQAAOgAAIAJBAmogBkECai0AADoAACACQQNqIAZBA2otAAA6AAAgBSAEQQRqIgRHDQALCyADRQ0AIAEgBGohAiAAIARqIQQDQCAEIAItAAA6AAAgAkEBaiECIARBAWohBCADQX9qIgMNAAsLIAALtQEBA38CQCACRQ0AIAJBB3EhA0EAIQQCQCACQQhJDQAgAkF4cSEFQQAhBANAIAAgBGoiAiABOgAAIAJBB2ogAToAACACQQZqIAE6AAAgAkEFaiABOgAAIAJBBGogAToAACACQQNqIAE6AAAgAkECaiABOgAAIAJBAWogAToAACAFIARBCGoiBEcNAAsLIANFDQAgACAEaiECA0AgAiABOgAAIAJBAWohAiADQX9qIgMNAAsLIAALCx8BAEGACAsYBAAAAAMAAAACAAAABQAAAAEAAAAAAAAAALUBBG5hbWUAFRRsZWdpb24tcmVnaW9uYWwud2FzbQF3CgARX193YXNtX2NhbGxfY3RvcnMBCWdldF9pbnB1dAIKZ2V0X291dHB1dAMKZ2V0X3N0YXR1cwQQZ2V0X3NlYXJjaF9ub2RlcwUFc29sdmUGCWRmc19zbWFsbAcKZGZzX21pZGRsZQgGbWVtY3B5CQZtZW1zZXQHEgEAD19fc3RhY2tfcG9pbnRlcgkKAQAHLnJvZGF0YQB/CXByb2R1Y2VycwEMcHJvY2Vzc2VkLWJ5AQVjbGFuZ18xNy4wLjAgKGh0dHBzOi8vZ2l0aHViLmNvbS9zd2lmdGxhbmcvbGx2bS1wcm9qZWN0LmdpdCAxMDk5OWI2ZDAzNGZlMzE4ZjNkNTZjODNiZGRiNjU3MjU5M2E4YmIwKQBJD3RhcmdldF9mZWF0dXJlcwQrCm11bHRpdmFsdWUrD211dGFibGUtZ2xvYmFscysPcmVmZXJlbmNlLXR5cGVzKwhzaWduLWV4dA==';\nlet wasmPromise;\nfunction wasmInstance(){\n  if(!wasmPromise){\n    wasmPromise=(async()=>{\n      const binary=Uint8Array.from(atob(WASM_BASE64),char=>char.charCodeAt(0));\n      const module=await WebAssembly.instantiate(binary,{});\n      return module.instance;\n    })();\n  }\n  return wasmPromise;\n}\nself.onmessage=async event=>{\n  try {\n    const words=event.data?.words;\n    if(!Array.isArray(words))throw new Error('invalid-input');\n    const instance=await wasmInstance(),e=instance.exports;\n    const ptr=e.get_input();\n    if(ptr+words.length*4>e.memory.buffer.byteLength)throw new Error('memory-limit');\n    new Int32Array(e.memory.buffer,ptr,words.length).set(words);\n    const count=e.solve(words.length);\n    const pieces=count>0?Array.from(new Int32Array(e.memory.buffer,e.get_output(),count)):[];\n    self.postMessage({status:e.get_status(),pieces,nodes:e.get_search_nodes()});\n  }catch(err){\n    self.postMessage({status:'error',pieces:[],reason:String(err?.message||err)});\n  }\n};\n";
function newRegionalWorker(){
 const url=URL.createObjectURL(new Blob([REGIONAL_WORKER_SOURCE],{type:'text/javascript'}));
 try{return {worker:new Worker(url),url}}
 catch(err){URL.revokeObjectURL(url);throw err}
}

const REGIONAL_SSS=['sss_w','sss_a','sss_t','sss_m','sss_p','sss_zero'];
function regionalCacheKey(goals){
 // A cache contains only a layout independently solved in THIS browser tab.
 // It is never populated with the player-provided demonstration.
 return [...goals].sort((a,b)=>a-b).join(',')+'|'+REGIONAL_SSS.map(id=>counts[id]).join(',');
}
function cancelRegionalSolver(){
 if(regionalWorker){regionalWorker.terminate();regionalWorker=null}
 if(regionalFinish){const done=regionalFinish;regionalFinish=null;done(null)}
}
function prepareRegionalSolver(goals){
 if(!window.Worker||!window.WebAssembly||!isConnected(goals)||!CENTER_KEYS.some(k=>goals.has(k)))return null;
 if(goals.size!==countPieces()*5||SHAPES.some(s=>s.id.startsWith('ss_')&&counts[s.id]))return null;
 const typeIndex=Object.fromEntries(REGIONAL_SSS.map((id,j)=>[id,j]));
 const types=SHAPES.filter(s=>s.id.startsWith('sss_')&&counts[s.id]>0);
 if(!types.length)return null;
 const all=generateCandidates(types,goals).allCandidates;
 // The old fixed split was y=10 / x=11. Keep it FIRST to preserve the
 // verified 220-cell cases, but try other independent 3-region cuts when
 // that exact split cannot even represent the painted geometry.
 const splits=[[10,11]];
 // Use an actual sorted list; do not infer a split from UI sector labels.
 const alternatives=[];
 for(let y=5;y<=15;y++)for(let x=5;x<=17;x++)if(y!==10||x!==11)alternatives.push([y,x]);
 alternatives.sort((a,b)=>Math.abs(a[0]-10)+Math.abs(a[1]-11)-Math.abs(b[0]-10)-Math.abs(b[1]-11));
 splits.push(...alternatives);
 for(const [cutY,cutX] of splits){
  const regions=[[],[],[]],of=new Int8Array(SIZE).fill(-1);
  for(const k of goals){
   const y=Math.floor(k/W),x=k%W;
   const r=y<cutY?0:x<cutX?1:2;
   of[k]=r;regions[r].push(k);
  }
  if(regions.some(r=>r.length<5||r.length%5||r.length>128))continue;
  const packed=[...REGIONAL_SSS.map(id=>counts[id])],found=[];
  let okay=true;
  for(let ri=0;ri<3;ri++){
   regions[ri].sort((a,b)=>a-b);
   const mapping=new Int16Array(SIZE).fill(-1);
   regions[ri].forEach((k,i)=>mapping[k]=i);
   const inRegion=all.filter(p=>p.keys.every(k=>of[k]===ri));
   if(!inRegion.length||inRegion.length>5000){okay=false;break}
   packed.push(regions[ri].length,inRegion.length);
   for(const p of inRegion){
    const id=found.length;found.push(p);
    packed.push(id,typeIndex[p.id],CENTER_SET.has(p.iconKey)?1:0,...p.keys.map(k=>mapping[k]));
   }
  }
  if(okay&&packed.length<=140000)return {words:packed,placements:found,split:[cutY,cutX]};
 }
 return null;
}
async function runRegionalSolver(prepared,token,goals=target,timeoutMs=60000){
 if(!prepared){regionalLastError='unsupported-geometry';return null;}
 regionalLastError='';
 const cacheKey=regionalCacheKey(goals);
 if(regionalCache?.key===cacheKey&&validConnectedLayout(regionalCache.pieces,goals)){
  return regionalCache.pieces.map(p=>({...p,keys:p.keys.slice()}));
 }
 let worker,blobUrl;
 try{({worker,url:blobUrl}=newRegionalWorker())}catch(e){regionalLastError='worker-start: '+String(e?.message||e);return null}
 regionalWorker=worker;
 const payload=await new Promise(resolve=>{
   let finished=false;
   const done=result=>{
     if(finished)return;finished=true;
     clearTimeout(timeout);worker.terminate();URL.revokeObjectURL(blobUrl);
     if(regionalWorker===worker)regionalWorker=null;
     if(regionalFinish===done)regionalFinish=null;
     resolve(result);
   };
   regionalFinish=done;
   const timeout=setTimeout(()=>{regionalLastError='worker-timeout '+timeoutMs+'ms';done(null)},timeoutMs);
   worker.onmessage=e=>done(e.data);
   worker.onerror=e=>{regionalLastError='worker-runtime: '+String(e?.message||'unknown');done(null)};
   worker.postMessage({words:prepared.words});
 });
 if(token!==runToken){regionalLastError='cancelled-or-changed';return null;}
 if(payload?.status!==1||!Array.isArray(payload.pieces)){regionalLastError=payload?.reason||('wasm-status:'+String(payload?.status));return null;}
 const pieces=payload.pieces.map(i=>prepared.placements[i]);
 if(pieces.some(p=>!p)){regionalLastError='unmapped-placement';return null;}
 if(pieces.length!==countPieces()||new Set(pieces.flatMap(p=>p.keys)).size!==goals.size){regionalLastError='count-mismatch';return null;}
 if(!validConnectedLayout(pieces,goals)){regionalLastError='geometry-or-icon-validation';return null;}
 regionalCache={key:cacheKey,pieces:pieces.map(p=>({...p,keys:p.keys.slice()}))};
 return pieces;
}
async function solve(){
 if(solving){runToken++;cancelRegionalSolver();solving=false;$('solveBtn').textContent='✦ 開始自動排版';message('已停止計算。');return}
 clearSolution(false);
 const n=target.size;if(!n){message('請先在棋盤標示希望填滿的目標格。','error');return}
 if(!countPieces()){message('請先選擇拼圖數量。','error');return}
 if(countPieces()>MAX_DEPLOYED){message('最多同時上場 45 塊拼圖，請先調整數量。','error');return}
 // Prefer the independent WASM regional solver for compatible exact-cover layouts.
 // It is exact (no overlap) and never changes the player's chosen inventory.
 const regionalInput=prepareRegionalSolver(target);
 if(regionalInput){
   const token=++runToken;solving=true;$('solveBtn').textContent='停止計算';
   message('正在尋找符合規則的完整排列…');
   try{
     const computed=await runRegionalSolver(regionalInput,token);
     if(token!==runToken)return;
     if(computed){
       solution=computed;updateBoard();updateStatus();
       message(`排版完成：${computed.length} 張角色卡、完整覆蓋 ${target.size}/${target.size} 格；中央起點、連通與零重疊均已驗證。`,'success');return;
     }
   }catch(e){console.warn('Regional exact solver fallback:',e)}
   finally{if(token===runToken){solving=false;$('solveBtn').textContent='✦ 開始自動排版'}}
 }
 const token=++runToken;solving=true;$('solveBtn').textContent='停止計算';$('solveBtn').disabled=false;
 const capacity=shapeCellCount();
 if(capacity===n&&(!isConnected(target)||!CENTER_KEYS.some(k=>target.has(k)))){
   solving=false;$('solveBtn').textContent='✦ 開始自動排版';
   message('目前拼圖總格數恰好等於目標格數，但目標未與中央形成可用的完整連通區域；必須改動部分目標格，才能騰出橋接空間。','error');
   showSmartRescue(`目前 ${n} 對 ${capacity} 的條件下，無法把目標外的橋接格加入而不犧牲原目標。智慧排法可保留盡量多的目標格，再以必要的連接格補齊。`);return;
 }
 try{
  const required=connectedRequirements(target);
  const extras=required.size-n;
  message(`正在尋找從中央出發、全部相連的配置…${extras?`（已規劃 ${extras} 格連接路徑）`:''}`);
  const result=await searchConnectedCover(target,token,7000,false);
  if(token!==runToken)return;
  if(result.solution){
   solution=result.solution;updateBoard();
   const occupied=new Set(solution.flatMap(p=>p.keys));
   const extra=occupied.size-n;
   message(`合法排列完成：從中央連通所有拼圖！覆蓋目標 ${n} 格，額外連接／補足 ${extra} 格，使用 ${solution.length}/${countPieces()} 塊，不重疊。`,'success');
  }else if(result.cutoff){
   message('連通排列搜尋達時間／節點上限，尚未證明無解；不會顯示不符合正服規則的配置。','error');
  }else if(result.reason==='none' && shapeCellCount()>result.required){
   message('尚未找到無重疊的連通排列，開始搜尋符合中央起點及連通規則的重疊備案…');
   const fallback=await searchConnectedCover(target,token,4000,true);
   if(token!==runToken)return;
   if(fallback.solution){
    solution=fallback.solution;updateBoard();
    const covered=new Set(solution.flatMap(p=>p.keys));
    const overlap=solution.reduce((n,p)=>n+p.keys.length,0)-covered.size;
    message(`合法連通備案完成：中央起點、全部拼圖相接、覆蓋目標 ${n} 格；使用 ${solution.length} 塊，重複佔格 ${overlap} 格。此為可行解，不保證最優。`,'success');
   }else{
    message(fallback.cutoff?'重疊備案搜尋已達上限，尚未證明無解。':'依照目前庫存找不到中央起點、全部相連的完整覆蓋。','error');
   }
  }else{
   message(`未找到合法相連配置（中心起點＋拼圖連接）。${result.reason==='pieces'?`連接後需要覆蓋 ${result.required} 格，現有拼圖格數不足。`:'可試著增加拼圖數量或調整目標。'}`,'error');
  }
  if(token===runToken&&!solution && regionalInput){
   message('目前無法完成完整排列，可能已達計算上限；請嘗試調整目標或稍後重試。若持續發生，請聯絡官方協助。','error');
  }
  if(token===runToken&&!solution)showSmartRescue(result.cutoff?'精確求解達到搜尋上限：這不代表無解。你可以讓系統以高覆蓋率為目標，產生可驗證的替代排法。':'未找到完整覆蓋所有目標格的合法排列。系統可以嘗試保留目標、補上中央連接，並推薦可套用的替代排列。');
 }catch(e){console.error(e);message('連通排列計算發生錯誤，請重新嘗試。','error')}
 finally{if(token===runToken){solving=false;$('solveBtn').textContent='✦ 開始自動排版'}}
}
async function exportPng(){
 if(!solution){notify('請先成功計算拼圖排列');return}
 const bg=$('nativeBoardImage');if(!bg.complete||!bg.naturalWidth){notify('原始棋盤圖片尚未載入完成，請稍後再試');return}
 const baseImg=getPieceImg('./assets/pieces/char_sub.0.png');
 const loadImgs=[baseImg,...SHAPES.filter(s=>s.icon).map(s=>getPieceImg('./assets/pieces/'+s.icon))];
 await Promise.all(loadImgs.map(img=>img.complete?Promise.resolve():new Promise(r=>{img.onload=img.onerror=()=>r()})));
 const c=document.createElement('canvas');c.width=598;c.height=516;const x=c.getContext('2d');
 x.fillStyle='#202f3c';x.fillRect(0,0,c.width,c.height);x.drawImage(bg,0,0,598,480);
 const mapped=pieceMap();
 for(let i=0;i<SIZE;i++){
   let col=58+i%W*22,row=23+Math.floor(i/W)*22;const stack=mapped.get(i);const item=stack?.at(-1);
   if(item){
     x.drawImage(baseImg,col-2,row-2,26,26);
     if(item.icon && item.iconKey===i){
       const icon=getPieceImg('./assets/pieces/'+item.icon);
       x.drawImage(icon,col-2,row-2,26,26);
     }
     if(stack.length>1){x.fillStyle='#111b2699';x.fillRect(col-2,row-2,26,26)}
   }else if(target.has(i)){
     x.fillStyle='#4ce7e755';x.fillRect(col,row,22,22)
   }
 }
 drawPieceOutlines(x,solution); // The exported plan must show the same per-job contours.
 x.font='bold 12px sans-serif';x.fillStyle='#a4cfde';x.fillText('DuoDuo Valley • 戰地拼圖配置（加成請以遊戲內顯示為準）',14,503);
 for(const im of document.querySelectorAll('.native-sector .sector-label,.native-stat img')){if(im.complete&&im.naturalWidth){const parent=im.parentElement;const st=$(parent.closest('.native-sector')?'nativeSectors':'nativeCore');const a=im.getBoundingClientRect(),b=st.getBoundingClientRect();const ratio=stageScale||1;const xx=(a.left-b.left)/ratio,yy=(a.top-b.top)/ratio;const ww=a.width/ratio,hh=a.height/ratio;if(xx>=0&&yy>=0)x.drawImage(im,xx,yy,ww,hh)}}
 const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='多多谷_戰地拼圖配置.png';document.body.appendChild(a);a.click();a.remove();
}
// Every published package carries a precomputed exact-cover proof.
// Reject bad/incomplete data rather than displaying an inaccurate layout.
function checkLegionPreset(raw){
 if(!raw||!Array.isArray(raw.pieces)||!Array.isArray(raw.regions)||raw.regions.length!==2)return false;
 const wanted=new Set();
 for(let row=0;row<H;row++)for(let col=0;col<W;col++){
   if(raw.regions.includes(REGION_ROWS[row][col]))wanted.add(row*W+col);
 }
 if(wanted.size!==80||raw.pieces.length>MAX_DEPLOYED)return false;
 const seen=new Set(),counter={};
 for(const p of raw.pieces){
   const shape=SHAPES.find(s=>s.id===p.id);
   if(!shape||!Array.isArray(p.keys)||p.keys.length!==shape.cells.length)return false;
   if(new Set(p.keys).size!==p.keys.length)return false;
   const coords=[];
   for(const key of p.keys){
     if(!Number.isInteger(key)||!wanted.has(key)||seen.has(key))return false;
     seen.add(key);coords.push([key%W,Math.floor(key/W)]);
   }
   const norm=normalize(coords).map(p=>p.join(',')).join(';');
   if(!orientations(shape).some(o=>o.map(c=>c.join(',')).join(';')===norm))return false;
   counter[p.id]=(counter[p.id]||0)+1;
 }
 if(seen.size!==wanted.size||!isConnected(seen))return false;
 const hasCenterIcon=raw.pieces.some(p=>{const shape=SHAPES.find(s=>s.id===p.id);return CENTER_SET.has(iconIndexForPlacedShape(p.keys,shape))});
 if(!hasCenterIcon)return false;
 const claimed=raw.counts||{};
 if(GROUP_INFO.some(([code])=>(claimed['ss_'+code]||0)+(claimed['sss_'+code]||0)>groupTotal(code)))return false;
 if(raw.pieces.length>MAX_DEPLOYED||Object.values(claimed).reduce((n,v)=>n+(Number(v)||0),0)>MAX_DEPLOYED)return false;
 return SHAPES.every(s=>(claimed[s.id]||0)===(counter[s.id]||0))&&Object.keys(claimed).every(id=>SHAPES.some(s=>s.id===id));
}
function hydrateLegionPreset(raw){
 return raw.pieces.map(p=>{
   const shape=SHAPES.find(s=>s.id===p.id);
   return {id:shape.id,keys:p.keys.slice(),icon:shape.icon,name:shape.name,group:shape.group,color:'#cfa777',iconKey:iconIndexForPlacedShape(p.keys,shape)};
 });
}
function loadLegionPreset(raw,fromRestore=false){
 if(!checkLegionPreset(raw)){message('套餐資料沒有通過完整驗證，已拒絕套用。','error');return false}
 if(!fromRestore)saveUndo();
 if(solving){runToken++;solving=false;$('solveBtn').textContent='✦ 開始自動排版'}
 const missing=SHAPES.filter(s=>(raw.counts[s.id]||0)>counts[s.id]);
 if(missing.length){
  message('此套餐需要更多 Lv.250／Lv.200 職業拼圖：'+missing.map(s=>`${s.name} 缺 ${(raw.counts[s.id]||0)-counts[s.id]} 塊`).join('；')+'。請先按實際角色等級設定庫存。','error');
  return false;
 }
 target=new Set(raw.pieces.flatMap(p=>p.keys));
 solution=hydrateLegionPreset(raw);
 activePresetId=raw.id;
 updateBoard();updateStatus();
 message(`「${raw.title}」已套用：${solution.length} 塊、${target.size} 格，全部經精確驗證，無重疊、無漏格。`,'success');
 return true;
}

// V2.17 priority planner: stage-by-stage exact covers, using actual available inventory.
// Lower-priority regions are added only if a complete geometrically valid solution is found.
// Timeouts are 'undetermined', never 'impossible'; coverage and piece overlap checked before display.
function priorityChoices(){return [
 ...OUTER_SECTORS.map(s=>({id:'outer:'+s.id,label:s.label})),
 ...CORE_NAMES.map(s=>({id:'core:'+s,label:s==='PAD'?'攻擊力':s==='MAD'?'魔力':s}))
]}
let priorityBusy=false,priorityResultText='';
function regionLetterForChoice(id){
 if(!id)return null;
 if(id.startsWith('outer:'))return OUTER_LETTER_FOR_ID[Number(id.slice(6))]||null;
 if(id.startsWith('core:')){
   const slot=coreAssignments.indexOf(id.slice(5));
   return Object.keys(CORE_REGION_KEYS).find(c=>CORE_REGION_KEYS[c]===slot)||null;
 }
 return null;
}
function priorityKeyset(ids){
 const wanted=new Set(ids.map(regionLetterForChoice).filter(Boolean));
 const cells=new Set();
 for(let row=0;row<H;row++)for(let col=0;col<W;col++){
   if(wanted.has(REGION_ROWS[row][col]))cells.add(row*W+col);
 }
 return cells;
}

// V2.36: The two marking modes edit only the blue goal cells, not any solver.
// Region mode uses the SAME live WZ letter map as hover, smart goals and stats.
function setPaintMode(mode){
 if(mode!=='single'&&mode!=='region')return;
 paintMode=mode;painting=false;lastPaint=-1;
 for(const button of document.querySelectorAll('[data-paint-mode]')){
  const selected=button.dataset.paintMode===mode;
  button.setAttribute('aria-pressed',String(selected));
 }
 const label=$('paintModeHelp');
 if(label)label.textContent=mode==='region'?
  '區塊模式：點棋盤上任一屬性格，整個屬性區域一次填滿；再次點擊已滿區域即可取消。':
  '單格模式：點一下填入一格，再點一下擦除；可拖曳連續標記。';
}
function editWholeSector(letter,action){
 if(priorityBusy||rescueBusy){notify('請等目前的精算完成後再修改目標區域');return}
 if(!letter){notify('無法辨識此格的屬性區域');return}
 const id=Object.hasOwn(OUTER_REGION_KEYS,letter)?'outer:'+OUTER_REGION_KEYS[letter]:
  Object.hasOwn(CORE_REGION_KEYS,letter)?'core:'+coreAssignments[CORE_REGION_KEYS[letter]]:null;
 if(!id)return;
 const keys=priorityKeyset([id]);
 if(!keys.size)return;
 const adding=action==='toggle'?[...keys].some(k=>!target.has(k)):action==='fill';
 const change=[...keys].filter(k=>target.has(k)!==adding);
 if(!change.length)return;
 saveUndo(); // A whole area is ONE undo step, including when it had partial marks.
 clearSolution(false);
 for(const k of change){if(adding)target.add(k);else target.delete(k)}
 priorityPlannerExplicit=false;activePresetId=null;
 updateBoard();updateStatus();
 const name=priorityChoices().find(c=>c.id===id)?.label||'屬性區域';
 message(`${name}：已${adding?'填滿':'取消'}整個區域（${change.length} 格變更）；目前共標記 ${target.size} 格。`);
}
function toggleRegionAtCell(i){
 const letter=REGION_ROWS[Math.floor(i/W)]?.[i%W];
 editWholeSector(letter,'toggle');
}
// This only edits the blue target Set; it never runs or changes any solver.
function setupPaintModeButtons(){
 document.querySelectorAll('[data-paint-mode]').forEach(button=>{
  button.addEventListener('click',()=>setPaintMode(button.dataset.paintMode));
 });
 setPaintMode('single');
}
function setupPriorityPlanner(){
 const els=[$('priorityFirst'),$('prioritySecond'),$('priorityThird')];
 const defaults=['outer:12','outer:8',''];
 els.forEach((select,index)=>{
   const empty=document.createElement('option');empty.value='';empty.textContent=index===0?'請選擇屬性':'不指定';select.appendChild(empty);
   for(const choice of priorityChoices()){
     const option=document.createElement('option');option.value=choice.id;option.textContent=choice.label;select.appendChild(option);
   }
   select.value=defaults[index];
   select.addEventListener('change',()=>{
     priorityPlannerExplicit=true;
     const current=select.value;if(current){
       els.forEach((other,oi)=>{if(oi!==index&&other.value===current)other.value=''});
     }
     priorityResultText='';refreshPriorityChoices();
   });
 });
 const status=$('priorityStatus'),button=$('prioritySolve');
 function refreshPriorityChoices(){
   const chosen=els.map(e=>e.value).filter(Boolean);
   els.forEach(s=>{
     for(const opt of s.options){opt.disabled=Boolean(opt.value&&chosen.includes(opt.value)&&s.value!==opt.value)}
   });
   const n=chosen.length;
   if(!priorityBusy)status.textContent=priorityResultText||(n?`已選 ${n} 種屬性（${priorityKeyset(chosen).size} 格目標）。依順位先嘗試完整覆蓋，未證明的結果不宣稱最優。`:'請先選第一優先屬性');
   button.disabled=priorityBusy||!els[0].value;
   els.forEach(el=>{el.disabled=priorityBusy});
 }
 refreshPriorityChoices();
 button.addEventListener('click',async()=>{
   if(priorityBusy)return;
   priorityPlannerExplicit=true;
   const ids=els.map(el=>el.value).filter(Boolean);
   if(countPieces()>MAX_DEPLOYED){message('最多只能同時上場 45 塊拼圖。','error');return}
   if(!ids.length){message('請先選擇優先屬性。','error');return}
   priorityBusy=true;button.disabled=true;button.textContent='正在精算…';
   if(solving){runToken++;solving=false;$('solveBtn').textContent='✦ 開始自動排版'}
   clearSolution(false); // previous solution must not appear under a new target
   const token=++runToken;
   try{
     let best=null;const uncertain=[];
     // Start with the most desired full set; if not proven feasible within the budget,
     // try smaller prefixes, preserving first-priority coverage.
     for(let k=ids.length;k>=1;k--){
       const desired=priorityKeyset(ids.slice(0,k));
       const count=desired.size;
       target=new Set(desired);updateBoard();updateStatus();
       status.textContent=`正在嘗試前 ${k} 項優先屬性，共 ${count} 格…`;
       message(`依優先順序計算中：前 ${k} 項屬性 ${count} 格，優先無重疊。`);
       await pause();
       if(token!==runToken){status.textContent='已停止';return}
       const result=await searchPriorityExact(target,token,k===1?5000:3500);
       if(token!==runToken){status.textContent='已停止';return}
       if(result.solution){
         best={k,desired,solution:result.solution};break;
       }
       if(result.cutoff)uncertain.push(k);
     }
     if(!best){
       target=priorityKeyset(ids.slice(0,1));updateBoard();updateStatus();
       const uncertainText=uncertain.length?'部分搜尋達時間／節點上限，尚未證明無解。':'以目前庫存與已驗證形狀，未找到完整覆蓋。';
       priorityResultText='未取得經驗證的完整配置';status.textContent=priorityResultText;
       message(`已保留第一優先目標供手動調整。${uncertainText}`,'error');return;
     }
     target=new Set(best.desired);solution=best.solution;
     activePresetId=null;updateBoard();updateStatus();
     const missed=ids.length-best.k;
     const why=uncertain.length?'其餘組合可能尚未搜完，這不是全域最佳證明。':'本結果為可行的完整覆蓋配置，不等同全域最佳。';
     priorityResultText=`已驗證：前 ${best.k} 項完整覆蓋 ${target.size} 格｜使用 ${solution.length} 塊｜中央連通、無重疊${missed?'｜另 '+missed+' 項尚未覆蓋':''}`;
     status.textContent=priorityResultText;
     message(`依優先順序完成：前 ${best.k} 項完整佔領 ${target.size} 格，使用 ${solution.length} 塊，中央連通、無重疊。${why}`,'success');
   }catch(e){console.error(e);message('優先配置計算發生錯誤，請重試。','error')}
   finally{priorityBusy=false;button.textContent='依優先順序自動配置';refreshPriorityChoices()}
 });
}
async function searchPriorityExact(wanted,token,budgetMs){
 // Priority goals can be far apart. Mandatory bridge cells are added without
 // changing the player's priority choices; filler cells are allowed.
 return searchConnectedCover(wanted,token,budgetMs,false);
}

function setupLegionPresets(){
 const choices=$('presetChoices'),details=$('presetDetails'),button=$('applyLegionPreset');
 if(!choices||!details||!button)return;
 if(!AVAILABLE_PRESETS.length){details.textContent='目前沒有符合中央起點與連通規則的預設套餐；可改用依優先順序的自動配置。';button.disabled=true;return}
 selectedPresetId=AVAILABLE_PRESETS[0].id;
 function showPreset(){
   const preset=AVAILABLE_PRESETS.find(p=>p.id===selectedPresetId);
   if(!preset)return;
   for(const b of choices.querySelectorAll('button')){
     const selected=b.dataset.id===preset.id;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected))
   }
   details.replaceChildren();
   const main=document.createElement('p');main.className='preset-details-lead';
   main.textContent=`${preset.title}｜${preset.pieces.length} 塊拼圖，精確覆蓋 ${preset.pieces.flatMap(p=>p.keys).length} 格（40 + 40）。`;
   details.appendChild(main);
   const sub=document.createElement('div');sub.className='preset-requirements';
   SHAPES.forEach(s=>{const n=preset.counts[s.id]||0;if(!n)return;const tag=document.createElement('span');tag.textContent=`${s.name} ×${n}`;sub.appendChild(tag)});
   details.appendChild(sub);
   const warning=document.createElement('p');warning.className='preset-caution';
   warning.textContent='會檢查你已設定的 Lv.200／Lv.250 職業庫存，不足則拒絕套用；不會改動現有拼圖數量。';details.appendChild(warning);
 }
 for(const preset of AVAILABLE_PRESETS){
   const b=document.createElement('button');b.type='button';b.dataset.id=preset.id;b.textContent=preset.title;
   b.addEventListener('click',()=>{selectedPresetId=preset.id;showPreset()});choices.appendChild(b);
 }
 button.addEventListener('click',()=>{
   const preset=AVAILABLE_PRESETS.find(p=>p.id===selectedPresetId);if(!preset)return;
   if(loadLegionPreset(preset))$('legionPresets').open=false;
 });
 showPreset();
}
function save(){const data={v:1,counts,target:[...target],coreAssignments:[...coreAssignments],presetId:activePresetId};try{localStorage.setItem(STORE,JSON.stringify(data));notify('配置已保存至這台裝置')}catch(e){notify('儲存失敗，請檢查瀏覽器是否允許本機儲存')}}
function restore(){try{let data=JSON.parse(localStorage.getItem(STORE)||'null');if(!data||data.v!==1||!Array.isArray(data.target))return false;clearSolution(false);inventoryTrimmedOnRestore=restoreInventory(data.counts);target=new Set(data.target.filter(n=>Number.isInteger(n)&&n>=0&&n<SIZE));
 if(isValidAssignment(data.coreAssignments))coreAssignments=[...data.coreAssignments];
 const saved=AVAILABLE_PRESETS.find(p=>p.id===data.presetId);
 if(saved&&saved.pieces.length<=MAX_DEPLOYED&&saved.pieces.every(p=>p.keys.every(k=>target.has(k)))&&target.size===80&&SHAPES.every(s=>(saved.counts[s.id]||0)<=counts[s.id])){solution=hydrateLegionPreset(saved);activePresetId=saved.id}
 return true}catch{return false}}
// Original V282 focused WZ sprites have the stepped highlighted AREA and the text baked in.
// Never show the default text sprite at the same time, otherwise two labels appear.
const OUTER_SECTORS=[
 {id:9,label:'異常狀態耐性',x:182,y:61,gx:76,gy:15,w:229,h:119},
 {id:10,label:'獲得經驗值',x:352,y:61,gx:298,gy:15,w:229,h:119},
 {id:8,label:'爆擊傷害',x:82,y:162,gx:54,gy:15,w:119,h:229},
 {id:11,label:'爆擊機率',x:464,y:162,gx:431,gy:15,w:119,h:229},
 {id:15,label:'無視防禦率',x:80,y:309,gx:54,gy:238,w:119,h:229},
 {id:12,label:'BOSS 傷害',x:466,y:309,gx:431,gy:238,w:119,h:229},
 {id:14,label:'Buff 持續時間',x:187,y:403,gx:76,gy:349,w:229,h:119},
 {id:13,label:'一般傷害',x:348,y:403,gx:298,gy:349,w:229,h:119}
];
// Central button positions were image-matched against the provided game recording.
// Each sprite uses original WZ dimensions; no additional 54px wrapper centering.
const CORE_STATS=[
 {name:'STR',x:255,y:180,focus:0,fx:187,fy:126},
 {name:'DEX',x:312,y:180,focus:1,fx:298,fy:126},
 {name:'MP',x:206,y:213,focus:4,fx:165,fy:126},
 {name:'INT',x:360,y:213,focus:2,fx:320,fy:126},
 {name:'HP',x:206,y:258,focus:1,fx:165,fy:238},
 {name:'LUK',x:361,y:258,focus:0,fx:320,fy:238},
 {name:'MAD',x:258,y:292,focus:2,fx:187,fy:238},
 {name:'PAD',x:312,y:292,focus:4,fx:298,fy:238}
];
// Central positions are immutable WZ geometry; these assignments only change which label occupies each position.
// A change always SWAPS two assignments, never duplicates or loses a stat.
const CORE_NAMES=CORE_STATS.map(s=>s.name);
const CORE_STORAGE='duoduo_legion_production_core_v1';
const CORE_SLOT_LABELS=['左上','右上','中上左','中上右','中下左','中下右','左下','右下'];
let coreAssignments=[...CORE_NAMES];
function isValidAssignment(arr){return Array.isArray(arr)&&arr.length===8&&new Set(arr).size===8&&arr.every(n=>CORE_NAMES.includes(n))}
function persistCoreAssignments(){try{localStorage.setItem(CORE_STORAGE,JSON.stringify(coreAssignments))}catch{}}
function restoreCoreAssignments(){try{let saved=JSON.parse(localStorage.getItem(CORE_STORAGE)||'null');if(isValidAssignment(saved))coreAssignments=[...saved]}catch{}}
let refreshCoreSprites=()=>{};
let activeCorePicker=null;
function closeCorePicker(){
 const picker=$('coreQuickPicker');
 if(picker){picker.hidden=true;picker.replaceChildren()}
 activeCorePicker=null;
}
function openCorePicker(slot){
 const picker=$('coreQuickPicker');if(!picker)return;
 if(activeCorePicker===slot&&!picker.hidden){closeCorePicker();return}
 activeCorePicker=slot;
 picker.replaceChildren();picker.hidden=false;
 const title=document.createElement('div');title.className='core-picker-title';
 title.textContent=CORE_SLOT_LABELS[slot]+'位置｜交換屬性';picker.appendChild(title);
 const options=document.createElement('div');options.className='core-picker-options';
 for(const name of CORE_NAMES){
   const btn=document.createElement('button');btn.type='button';btn.dataset.stat=name;
   btn.textContent=name==='PAD'?'攻擊力':name==='MAD'?'魔力':name;
   if(name===coreAssignments[slot]){btn.classList.add('current');btn.setAttribute('aria-current','true')}
   btn.addEventListener('click',e=>{
     e.stopPropagation();swapCoreStat(slot,name);
     closeCorePicker();
     message('已交換中央屬性位置。滑鼠移入時會高亮該位置的區域。');
   });
   options.appendChild(btn);
 }
 picker.appendChild(options);
 // Native stage is 598px wide; keep the dropdown fully within it.
 const source=CORE_STATS[slot];
 picker.style.left=(source.x>340?Math.max(12,source.x-135):Math.min(426,source.x+38))+'px';
 picker.style.top=Math.min(250,Math.max(5,source.y-15))+'px';
 const first=options.querySelector('button.current');if(first)first.focus({preventScroll:true});
}

function updateCoreControls(){
 const selectors=$('coreSelectors'); if(!selectors)return;
 for(const select of selectors.querySelectorAll('select'))select.value=coreAssignments[Number(select.dataset.slot)];
 const custom=coreAssignments.some((name,i)=>name!==CORE_NAMES[i]);
 $('coreStatus').textContent=custom?'自訂位置已套用':'使用正服預設位置';
}
function swapCoreStat(slot,newName){
 const other=coreAssignments.indexOf(newName);
 if(other<0||slot<0||slot>=CORE_NAMES.length)return;
 if(other!==slot){
   [coreAssignments[slot],coreAssignments[other]]=[coreAssignments[other],coreAssignments[slot]];
   persistCoreAssignments();
   refreshCoreSprites();
   renderLegionEffects();
 }
 updateCoreControls();
}
function setupCoreControls(){
 const form=$('coreSelectors');
 CORE_STATS.forEach((slot,i)=>{
   const label=document.createElement('label'); label.className='core-select-row';
   const caption=document.createElement('span'); caption.textContent=CORE_SLOT_LABELS[i];
   const select=document.createElement('select');select.dataset.slot=String(i);select.setAttribute('aria-label',CORE_SLOT_LABELS[i]+'位置的屬性');
   CORE_NAMES.forEach(n=>{const op=document.createElement('option');op.value=n;op.textContent=n==='PAD'?'攻擊力':n==='MAD'?'魔力':n;select.appendChild(op)});
   select.addEventListener('change',()=>swapCoreStat(i,select.value));
   label.append(caption,select);form.appendChild(label);
 });
 $('coreReset').addEventListener('click',()=>{coreAssignments=[...CORE_NAMES];persistCoreAssignments();refreshCoreSprites();updateCoreControls();renderLegionEffects()});
 updateCoreControls();
}
// V2.9: The 16 WZ region sprites partition the 22x20 board into 440 unique cells.
// Each outer sector has 40 cells; each of the 8 core sectors has 15 cells.
// These rows were extracted by sampling the ORIGINAL V282 WZ focused sprites at the
// physical grid-cell centers, after correcting the four misassigned core orientations.
// No runtime image alpha sampling: works on file:// and at any stage CSS scale.
const REGION_ROWS=[
 "CAAAAAAAAAABBBBBBBBBBD",
 "CCAAAAAAAAABBBBBBBBBDD",
 "CCCAAAAAAAABBBBBBBBDDD",
 "CCCCAAAAAAABBBBBBBDDDD",
 "CCCCCAAAAAABBBBBBDDDDD",
 "CCCCCcaaaaabbbbbdDDDDD",
 "CCCCCccaaaabbbbddDDDDD",
 "CCCCCcccaaabbbdddDDDDD",
 "CCCCCccccaabbddddDDDDD",
 "CCCCCcccccabdddddDDDDD",
 "EEEEEeeeeeghfffffFFFFF",
 "EEEEEeeeegghhffffFFFFF",
 "EEEEEeeeggghhhfffFFFFF",
 "EEEEEeegggghhhhffFFFFF",
 "EEEEEeggggghhhhhfFFFFF",
 "EEEEEGGGGGGHHHHHHFFFFF",
 "EEEEGGGGGGGHHHHHHHFFFF",
 "EEEGGGGGGGGHHHHHHHHFFF",
 "EEGGGGGGGGGHHHHHHHHHFF",
 "EGGGGGGGGGGHHHHHHHHHHF"
];
const OUTER_REGION_KEYS={A:9,B:10,C:8,D:11,E:15,F:12,G:14,H:13};
const OUTER_LETTER_FOR_ID={9:'A',10:'B',8:'C',11:'D',15:'E',12:'F',14:'G',13:'H'};
const CORE_REGION_KEYS={a:0,b:1,c:2,d:3,e:4,f:5,g:6,h:7};
// Reference occupation bonuses for classic PC MapleStory Legion, NOT yet verified against DuoDuo V282.
const OCCUPATION_REFERENCE={
 '異常狀態耐性':{amount:1,unit:'',label:'異常狀態耐性'},
 '獲得經驗值':{amount:0.25,unit:'%',label:'獲得經驗值'},
 '爆擊傷害':{amount:0.5,unit:'%',label:'爆擊傷害'},
 '爆擊機率':{amount:1,unit:'%',label:'爆擊機率'},
 '無視防禦率':{amount:1,unit:'%',label:'無視防禦率'},
 'BOSS 傷害':{amount:1,unit:'%',label:'BOSS 傷害'},
 'Buff 持續時間':{amount:1,unit:'%',label:'Buff 持續時間'},
 '一般傷害':{amount:1,unit:'%',label:'一般傷害'},
 'STR':{amount:5,unit:'',label:'STR'},'DEX':{amount:5,unit:'',label:'DEX'},
 'INT':{amount:5,unit:'',label:'INT'},'LUK':{amount:5,unit:'',label:'LUK'},
 'HP':{amount:250,unit:'',label:'MaxHP'},'MP':{amount:250,unit:'',label:'MaxMP'},
 'PAD':{amount:1,unit:'',label:'攻擊力'},'MAD':{amount:1,unit:'',label:'魔力'}
};
function statAtCell(idx){
 const code=REGION_ROWS[Math.floor(idx/W)][idx%W];
 if(OUTER_REGION_KEYS[code]!==undefined){
   return OUTER_SECTORS.find(s=>s.id===OUTER_REGION_KEYS[code])?.label||null;
 }
 const slot=CORE_REGION_KEYS[code];
 return slot===undefined?null:coreAssignments[slot];
}
function formatUnionAmount(n,unit){return (n>=0?'+':'')+Number(n.toFixed(5)).toString()+unit}
function renderLegionEffects(){
 const panel=$('legionEffects');if(!panel)return;
 const live=$('boardLiveEffectsValue'),occupation=$('legionOccupationResults');
 const summary=$('legionEffectsSummary'),occupiedNumber=$('occupiedTiles'),deployedNumber=$('deployedTiles'),duplicateNumber=$('duplicateTiles');
 occupation.replaceChildren();
 const displayed=solution||recommendationPreview;
 if(!displayed?.length){
  if(live)live.textContent='完成排版後顯示已佔領的屬性。';
  summary.textContent='完成排列後，自動依有效佔領格計算加成。';
  occupiedNumber.textContent='0';deployedNumber.textContent='0 / '+MAX_DEPLOYED;duplicateNumber.textContent='0';
  const p=document.createElement('p');p.className='occupancy-empty';p.textContent='尚未排版。請先選擇拼圖與目標格，開始自動排版後即可查看佔領效果。';occupation.appendChild(p);
  return;
 }
 const stacks=pieceMap(),occupied=[...stacks.keys()],dupes=[...stacks.values()].reduce((n,s)=>n+Math.max(0,s.length-1),0);
 const totals=new Map();occupied.forEach(i=>{const s=statAtCell(i);if(s)totals.set(s,(totals.get(s)||0)+1)});
 occupiedNumber.textContent=String(occupied.length);deployedNumber.textContent=displayed.length+' / '+MAX_DEPLOYED;duplicateNumber.textContent=String(dupes);
 if(live){
  const top=[...totals.entries()].filter(([key,n])=>n>0&&OCCUPATION_REFERENCE[key])
   .sort((a,b)=>b[1]-a[1]).slice(0,3).map(([key,n])=>{
    const ref=OCCUPATION_REFERENCE[key];
    return ref.label+' '+formatUnionAmount(n*ref.amount,ref.unit);
   });
  live.textContent=top.length?top.join(' · ')+'（共 '+occupied.length+' 格）':'尚無有效佔領格';
 }
 summary.textContent=`${recommendationPreview&&!solution?'智慧建議預覽（尚未套用）｜':'已使用 '}${displayed.length}／${MAX_DEPLOYED} 張角色卡｜不重複計算 ${occupied.length} 格`;
 const order=['BOSS 傷害','爆擊傷害','無視防禦率','爆擊機率','獲得經驗值','Buff 持續時間','一般傷害','異常狀態耐性',...CORE_NAMES];
 for(const name of order){
  const n=totals.get(name)||0;if(!n)continue;const ref=OCCUPATION_REFERENCE[name];if(!ref)continue;
  const row=document.createElement('div');row.className='occupancy-item';
  const main=document.createElement('div');main.className='occupancy-item-main';
  const label=document.createElement('span');label.className='occupancy-name';label.textContent=ref.label;
  const count=document.createElement('small');count.textContent=n+' 格';main.append(label,count);
  const right=document.createElement('strong');right.textContent=formatUnionAmount(n*ref.amount,ref.unit);
  row.title=`${n} 格 × 每格 ${ref.amount}${ref.unit}`;
  row.append(main,right);occupation.appendChild(row);
 }
 if(!occupation.children.length){const p=document.createElement('p');p.className='occupancy-empty';p.textContent='目前沒有可計算的佔領屬性。';occupation.appendChild(p)}
}
const AVAILABLE_PRESETS=VERIFIED_PRESETS.filter(checkLegionPreset);
let hoveredSector=null;
let regionCanvas=null,regionContext=null,activeRegionLetter=null;
function setPreciseRegionHighlight(letter){
 if(!regionContext)return;
 if(activeRegionLetter===letter)return;
 activeRegionLetter=letter;
 const ctx=regionContext;
 ctx.clearRect(0,0,598,480);
 if(!letter)return;
 const cellSize=22,x0=58,y0=23;
 ctx.save();
 // Draw fills ONLY on WZ cells belonging to this exact sector.
 ctx.fillStyle='rgba(183,217,231,.31)';
 for(let row=0;row<H;row++)for(let col=0;col<W;col++){
  if(REGION_ROWS[row][col]===letter)ctx.fillRect(x0+col*cellSize,y0+row*cellSize,cellSize,cellSize);
 }
 // Build the outline from the SAME grid classification as pointer hit-testing.
 // Only external edges are stroked: no offset PNG, guessed dimensions or duplicated seams.
 ctx.beginPath();
 for(let row=0;row<H;row++)for(let col=0;col<W;col++){
  if(REGION_ROWS[row][col]!==letter)continue;
  const x=x0+col*cellSize,y=y0+row*cellSize;
  if(row===0||REGION_ROWS[row-1][col]!==letter){ctx.moveTo(x,y);ctx.lineTo(x+cellSize,y)}
  if(row===H-1||REGION_ROWS[row+1][col]!==letter){ctx.moveTo(x,y+cellSize);ctx.lineTo(x+cellSize,y+cellSize)}
  if(col===0||REGION_ROWS[row][col-1]!==letter){ctx.moveTo(x,y);ctx.lineTo(x,y+cellSize)}
  if(col===W-1||REGION_ROWS[row][col+1]!==letter){ctx.moveTo(x+cellSize,y);ctx.lineTo(x+cellSize,y+cellSize)}
 }
 ctx.lineWidth=1.5;ctx.strokeStyle='rgba(236,252,255,.97)';
 ctx.shadowColor='rgba(186,237,255,.85)';ctx.shadowBlur=4;
 ctx.stroke();ctx.restore();
}
function hoverSector(id){
 if(id===hoveredSector)return;
 hoveredSector=id;
 document.querySelectorAll('.native-sector').forEach(el=>{
   el.dataset.hovered=String(id!==null&&el.dataset.sector===String(id));
 });
}
function regionAt(x,y){
 const col=Math.floor((x-58)/22),row=Math.floor((y-23)/22);
 if(col<0||col>=22||row<0||row>=20)return null;
 return REGION_ROWS[row][col];
}
function renderNativeUI(){
 regionCanvas=document.createElement('canvas');
 regionCanvas.id='regionHoverCanvas';regionCanvas.className='region-hover-canvas';
 regionCanvas.width=598;regionCanvas.height=480;
 regionCanvas.setAttribute('aria-hidden','true');
 $('nativeStage').appendChild(regionCanvas);
 regionContext=regionCanvas.getContext('2d');
 if(!regionContext)console.warn('此瀏覽器無法使用 Canvas；區域高亮將停用。');
 pieceOutlineCanvas=document.createElement('canvas');
 pieceOutlineCanvas.id='pieceOutlineCanvas';pieceOutlineCanvas.className='piece-outline-canvas';
 pieceOutlineCanvas.width=598;pieceOutlineCanvas.height=480;
 pieceOutlineCanvas.setAttribute('aria-hidden','true');
 $('nativeStage').appendChild(pieceOutlineCanvas);
 pieceOutlineContext=pieceOutlineCanvas.getContext('2d');
 for(const p of OUTER_SECTORS){
   const el=document.createElement('div');el.className='native-sector';el.dataset.sector=p.id;
   Object.assign(el.style,{left:p.gx+'px',top:p.gy+'px',width:p.w+'px',height:p.h+'px'});
   const normal=document.createElement('img');normal.className='sector-label';normal.alt='';
   normal.src=WZ_ROOT+'AreaButtons__AreaMouseOver__'+p.id+'__default__0.png';
   normal.style.left=(p.x-p.gx)+'px';normal.style.top=(p.y-p.gy)+'px';
   el.append(normal);$('nativeSectors').appendChild(el);
 }
 const coreLayer=$('nativeCore');

 const picker=document.createElement('div');picker.id='coreQuickPicker';picker.className='core-quick-picker';picker.hidden=true;picker.addEventListener('pointermove',e=>e.stopPropagation());picker.addEventListener('click',e=>e.stopPropagation());coreLayer.appendChild(picker);
 const coreImgs=new Map();
 for(let index=0;index<CORE_STATS.length;index++){
   const s=CORE_STATS[index];
   const el=document.createElement('button');el.type='button';el.className='native-stat';el.dataset.slot=String(index);
   el.setAttribute('aria-label',CORE_SLOT_LABELS[index]+'位置，點擊交換屬性');
   // Keep native position center stable even when the replacement icon has a different width.
   el.style.left=(s.x+18.5)+'px';el.style.top=s.y+'px';
   el.addEventListener('click',e=>{e.stopPropagation();openCorePicker(index)});
   const im=document.createElement('img');im.alt='';
   im.src=WZ_ROOT+'AreaButtons__button_'+coreAssignments[index]+'__normal__0.png';
   el.appendChild(im);coreLayer.appendChild(el);coreImgs.set(index,im);

 }

 let currentCore=null;
 function updateCoreHover(s){
   const next=s?s.slot:null;if(next===currentCore)return;
   currentCore=next;
   refreshCoreSprites();
   if(s){
   }
 }
 refreshCoreSprites=()=>{
   for(let i=0;i<CORE_STATS.length;i++){
     const img=coreImgs.get(i);
     const name=coreAssignments[i];
     const desired=WZ_ROOT+'AreaButtons__button_'+name+'__'+(currentCore===i?'mouseOver':'normal')+'__0.png';
     if(img.dataset.currentSprite!==desired){img.dataset.currentSprite=desired;img.src=desired}
     img.parentElement.title=CORE_SLOT_LABELS[i]+'：'+(name==='PAD'?'攻擊力':name==='MAD'?'魔力':name);
   }
 };
 const stage=$('nativeStage');
 stage.addEventListener('click',e=>{if(!e.target.closest('.native-stat')&&!e.target.closest('#coreQuickPicker'))closeCorePicker()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCorePicker()});
 stage.addEventListener('pointermove',e=>{
   if(e.target.closest('#coreQuickPicker'))return;
   if(e.pointerType==='touch'){hoverSector(null);updateCoreHover(null);setPreciseRegionHighlight(null);return}
   const rect=stage.getBoundingClientRect();
   // Read actual transformed bounds: ignores page zoom, viewport size and CSS responsive scale.
   const x=(e.clientX-rect.left)*598/rect.width;
   const y=(e.clientY-rect.top)*480/rect.height;
   const region=regionAt(x,y);
   // A single lookup determines BOTH layers, so outer and center can never compete.
   if(region&&Object.prototype.hasOwnProperty.call(OUTER_REGION_KEYS,region)){
     updateCoreHover(null);
     hoverSector(OUTER_REGION_KEYS[region]);
     setPreciseRegionHighlight(region);
   }else if(region&&Object.prototype.hasOwnProperty.call(CORE_REGION_KEYS,region)){
     hoverSector(null);
     const slot=CORE_REGION_KEYS[region];
     updateCoreHover({...CORE_STATS[slot],slot});
     setPreciseRegionHighlight(region);
   }else{
     hoverSector(null);updateCoreHover(null);setPreciseRegionHighlight(null);
   }
 });
 stage.addEventListener('pointerleave',()=>{hoverSector(null);updateCoreHover(null);setPreciseRegionHighlight(null)});
}
function resizeNativeStage(){
 const area=$('boardScroll');if(!area)return;
 const available=area.clientWidth;
 // Keep quick actions level with the board's top edge whenever a usable
 // side gutter is available. Smaller phones retain an accessible top strip.
 const beside=available>=572;
 const controlsWidth=beside?196:0;
 const wanted=Math.min(1,Math.max(.60,(available-controlsWidth-(beside?16:2))/598));
 stageScale=wanted;
 const holder=$('nativeStageHolder');
 const visibleWidth=598*wanted;
 holder.style.width=visibleWidth+'px';holder.style.height=(480*wanted)+'px';
 $('nativeStage').style.setProperty('--stage-scale',String(wanted));
 area.classList.toggle('board-toolbar-stacked',!beside);
 if(beside){
  const offset=Math.max(10,Math.min((available-visibleWidth)/2,available-visibleWidth-controlsWidth));
  holder.style.marginLeft=offset+'px';holder.style.marginRight='0';
 }else{
  holder.style.marginLeft='auto';holder.style.marginRight='auto';
 }
}
function bind(){$('clearBoard').addEventListener('click',()=>{saveUndo();target.clear();activePresetId=null;clearSolution(false);updateBoard();updateStatus();message('已清空目標格。')});$('undoBtn').addEventListener('click',()=>{if(!undoStack.length){notify('目前沒有可還原的操作');return}target=new Set(undoStack.pop());activePresetId=null;clearSolution(false);updateBoard();updateStatus();message('已還原上一次棋盤修改。')});$('solveBtn').addEventListener('click',solve);$('resetSolution').addEventListener('click',()=>clearSolution());$('exportPng').addEventListener('click',exportPng);$('saveBtn').addEventListener('click',save);$('loadBtn').addEventListener('click',()=>{if(restore()){refreshCoreSprites();updateCoreControls();updateBoard();updateStatus();message(inventoryTrimmedOnRestore?'已載入本機配置；超過 45 張的數量已依上限縮減，請重新檢查。':'已載入你之前保存的本機配置。',inventoryTrimmedOnRestore?'error':'')}else notify('尚未找到可載入的本機配置')});$('themeBtn').addEventListener('click',()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';$('themeBtn').textContent=dark?'☀ 淺色模式':'☾ 深色模式';try{localStorage.setItem('duoduo_legion_production_theme_v1',dark?'dark':'light')}catch{}});try{let theme=localStorage.getItem('duoduo_legion_production_theme_v1');if(theme==='dark'){document.documentElement.dataset.theme='dark';$('themeBtn').textContent='☀ 淺色模式'}}catch{}}
preloadPieceAssets();setupShapes();createBoard();restoreCoreAssignments();renderNativeUI();setupPaintModeButtons();setupSmartRescue();bind();resizeNativeStage();window.addEventListener('resize',resizeNativeStage);if('ResizeObserver' in window)new ResizeObserver(resizeNativeStage).observe($('boardScroll'));restoreInventory(null);updateBoard();updateStatus();message('所有拼圖數量預設為 0，請按實際 Lv.200／Lv.250 人數設定；如需以前儲存的數量，請主動點選「載入本機配置」。');
})();
