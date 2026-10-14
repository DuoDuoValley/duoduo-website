(() => {
  const KEY='duoduo-player-tools-image-map-v1';
  const defaults={
    'category-equipment':'assets/category-equipment.png','category-astra':'assets/category-astra.png','category-totem':'assets/category-totem.png','category-liner':'assets/category-liner.png','category-gacha':'assets/platinum-apple.png',
    'totem-target-輪迴碑石':'assets/totem-reincarnation.png','totem-target-彩虹月石寶石圖騰':'assets/totem-rainbow.png','totem-target-小筱精靈圖騰':'assets/totem-xiaoxiao.png',
    'liner-target-帽子內襯':'assets/liner-hat.png','liner-target-臉飾內襯':'assets/liner-face.png','liner-target-武器內襯':'assets/liner-weapon.png','liner-target-鞋子內襯':'assets/liner-shoes.png','liner-target-套服內襯':'assets/liner-suit.png','liner-target-披風內襯':'assets/liner-cape.png',
    'astra-target-basic':'assets/category-astra.png','astra-target-excellent':'assets/category-astra.png','astra-target-extreme':'assets/category-astra.png'
  };
  const labels={
    'category-equipment':'裝備強化分類','category-astra':'阿斯特拉分類','category-totem':'圖騰分類','category-liner':'內襯分類','category-gacha':'抽獎模擬器分類（白金蘋果）',
    'totem-target-輪迴碑石':'輪迴碑石','totem-target-彩虹月石寶石圖騰':'彩虹月石寶石圖騰','totem-target-小筱精靈圖騰':'小筱精靈圖騰',
    'liner-target-帽子內襯':'帽子內襯','liner-target-臉飾內襯':'臉飾內襯','liner-target-武器內襯':'武器內襯','liner-target-鞋子內襯':'鞋子內襯','liner-target-套服內襯':'套服內襯','liner-target-披風內襯':'披風內襯',
    'astra-target-basic':'基礎阿斯特拉','astra-target-excellent':'卓越阿斯特拉','astra-target-extreme':'極限阿斯特拉'
  };
  let map={};
  const failedOverrides=new Set();
  const fallbackBySrc=new Map();
  function read(){try{map=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){map={}}}
  read();
  window.duoduoImageFor=(key,fallback)=>{const override=map[key];if(override&&fallback)fallbackBySrc.set(override,fallback);return override&&!failedOverrides.has(override)?override:fallback};
  function applyStatic(){
    const srcMap={'assets/category-equipment.png':'category-equipment','assets/category-astra.png':'category-astra','assets/category-totem.png':'category-totem','assets/category-liner.png':'category-liner','assets/platinum-apple.png':'category-gacha'};
    document.querySelectorAll('img').forEach(img=>{
      const src=img.getAttribute('src')||'';
      const key=srcMap[src];
      if(key&&!img.dataset.duoduoDefaultSrc)img.dataset.duoduoDefaultSrc=src;
      const fallback=img.dataset.duoduoDefaultSrc;
      if(key&&map[key]&&!failedOverrides.has(map[key])){
        img.dataset.duoduoOverrideSrc=map[key];
        fallbackBySrc.set(map[key],fallback);
        if(img.getAttribute('src')!==map[key])img.setAttribute('src',map[key]);
      }
    });
  }
  // Custom image paths are saved in localStorage and can become invalid when
  // a tool is moved under a different URL path. Recover per image instead of
  // leaving a broken icon or repeatedly re-applying the failed override.
  document.addEventListener('error',event=>{
    const img=event.target;
    if(!img||img.tagName!=='IMG')return;
    const src=img.getAttribute('src')||'';
    const fallback=img.dataset.duoduoDefaultSrc||fallbackBySrc.get(src);
    if(fallback&&src!==fallback){
      if(img.dataset.duoduoOverrideSrc)failedOverrides.add(img.dataset.duoduoOverrideSrc);
      else failedOverrides.add(src);
      img.dataset.duoduoFallbackApplied='1';
      img.setAttribute('src',fallback);
    }
  },true);
  function adminMode(){
    if(location.hash!=='#admin-images')return;
    document.body.classList.add('admin-image-mode');
    const main=document.querySelector('main');if(!main)return;
    main.innerHTML=`<section class="hero"><div class="eyebrow">ADMIN · ASSET MANAGER</div><h1>玩家工具圖片管理</h1><p>管理員專用測試介面，可分批補上圖片並指定對應項目。此頁不會出現在玩家工具導覽列。</p></section>
    <section class="card" style="padding:24px;margin:20px 0"><h2>新增／替換圖片</h2><div class="admin-image-grid"><div><label for="adminImageKey">指定項目</label><select id="adminImageKey">${Object.keys(labels).map(k=>`<option value="${k}">${labels[k]}</option>`).join('')}</select><label for="adminImageFile">選擇圖片</label><input id="adminImageFile" type="file" accept="image/*"><p class="note">圖片會縮放至最長邊 512px，降低本機儲存空間。選圖後需按儲存才會套用。</p></div><div><div id="adminImagePreview" class="admin-image-preview">尚未選擇圖片</div><button id="adminImageSave" class="admin-image-btn">儲存圖片對應</button> <button id="adminImageRemove" class="admin-image-btn secondary">恢復預設圖片</button><p id="adminImageStatus" class="note"></p></div></div></section>
    <section class="card" style="padding:24px;margin:20px 0"><h2>已設定圖片</h2><div id="adminImageList" class="admin-image-list"></div><p class="note">設定保存在目前瀏覽器。本機測試版不會自動同步到其他電腦或正式官網。</p><button id="adminImageExport" class="admin-image-btn secondary">匯出 JSON 備份</button> <label class="admin-image-btn secondary" for="adminImageImport">匯入 JSON</label><input id="adminImageImport" type="file" accept="application/json" hidden><button id="adminImageClear" class="admin-image-btn danger">清除全部自訂圖片</button><p><a href="index.html">返回玩家工具</a></p></section>`;
    const style=document.createElement('style');style.textContent=`body.admin-image-mode main{max-width:1050px;margin:auto;padding:24px}.admin-image-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}.admin-image-grid label{display:block;font-weight:700;margin:12px 0 6px}.admin-image-grid select,.admin-image-grid input{width:100%;padding:11px;border:1px solid #ccd9e6;border-radius:10px;background:white}.admin-image-preview{height:150px;background:#f1f6fb;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:8px 0 14px}.admin-image-preview img{max-width:120px;max-height:120px;object-fit:contain}.admin-image-btn{display:inline-block;border:0;border-radius:9px;background:#087eaa;color:white;padding:10px 14px;font-weight:700;cursor:pointer;margin:4px 3px 4px 0}.admin-image-btn.secondary{background:#e6eef5;color:#29455e}.admin-image-btn.danger{background:#a63e49}.admin-image-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}.admin-image-item{display:flex;align-items:center;gap:9px;border:1px solid #e0e8ef;border-radius:10px;padding:10px}.admin-image-item img{width:42px;height:42px;object-fit:contain}.admin-image-item span{font-size:12px;flex:1}.admin-image-item button{border:0;border-radius:7px;padding:7px;background:#a63e49;color:white;cursor:pointer}@media(max-width:650px){.admin-image-grid{grid-template-columns:1fr}}`;
    document.head.append(style);
    let pending='';
    const $=id=>document.getElementById(id);
    function save(){localStorage.setItem(KEY,JSON.stringify(map))}
    function preview(src){$('adminImagePreview').innerHTML=src?`<img src="${src}" alt="預覽">`:'尚未選擇圖片'}
    function renderList(){const el=$('adminImageList');el.innerHTML='';Object.entries(map).forEach(([k,v])=>{const row=document.createElement('div');row.className='admin-image-item';const im=document.createElement('img');im.src=v;const label=document.createElement('span');label.textContent=labels[k]||k;const btn=document.createElement('button');btn.textContent='刪除';btn.onclick=()=>{delete map[k];save();read();applyStatic();renderList();if(k===$('adminImageKey').value)preview(defaults[k]);$('adminImageStatus').textContent='已移除自訂圖片。'};row.append(im,label,btn);el.append(row)});if(!Object.keys(map).length)el.textContent='目前尚未設定自訂圖片。'}
    $('adminImageFile').onchange=()=>{const f=$('adminImageFile').files[0];if(!f)return;const url=URL.createObjectURL(f),im=new Image();im.onload=()=>{const scale=Math.min(1,512/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*scale));c.height=Math.max(1,Math.round(im.height*scale));c.getContext('2d').drawImage(im,0,0,c.width,c.height);pending=c.toDataURL('image/webp',.88);URL.revokeObjectURL(url);preview(pending);$('adminImageStatus').textContent='預覽已載入，請儲存以套用。'};im.onerror=()=>{$('adminImageStatus').textContent='圖片讀取失敗。';URL.revokeObjectURL(url)};im.src=url};
    $('adminImageKey').onchange=()=>{pending='';$('adminImageFile').value='';preview(map[$('adminImageKey').value]||defaults[$('adminImageKey').value])};
    $('adminImageSave').onclick=()=>{if(!pending){$('adminImageStatus').textContent='請先選擇圖片。';return}map[$('adminImageKey').value]=pending;try{save();read();pending='';applyStatic();renderList();preview(map[$('adminImageKey').value]);$('adminImageStatus').textContent='已儲存圖片對應。'}catch(e){$('adminImageStatus').textContent='儲存失敗，可能是瀏覽器儲存空間不足。'}};
    $('adminImageRemove').onclick=()=>{delete map[$('adminImageKey').value];save();read();pending='';applyStatic();renderList();preview(defaults[$('adminImageKey').value]);$('adminImageStatus').textContent='已恢復預設圖片。'};
    $('adminImageExport').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(map,null,2)],{type:'application/json'}));a.download='duoduo-player-tool-images.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
    $('adminImageImport').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const v=JSON.parse(await f.text());if(!v||typeof v!=='object'||Array.isArray(v))throw Error();map={...map,...v};save();read();applyStatic();renderList();$('adminImageStatus').textContent='匯入完成。'}catch(_){$('adminImageStatus').textContent='匯入失敗，請確認 JSON 格式。'}e.target.value=''};
    $('adminImageClear').onclick=()=>{if(confirm('確定清除全部自訂圖片？')){map={};save();read();applyStatic();renderList();$('adminImageStatus').textContent='已清除全部自訂圖片。'}};
    preview(map[$('adminImageKey').value]||defaults[$('adminImageKey').value]);renderList();
  }
  document.addEventListener('DOMContentLoaded',()=>{applyStatic();adminMode()});
  const observer=new MutationObserver(applyStatic);observer.observe(document.documentElement,{subtree:true,childList:true});
  window.addEventListener('storage',()=>{read();failedOverrides.clear();fallbackBySrc.clear();applyStatic()});
})();
