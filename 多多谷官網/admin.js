/* ===== 管理後台登入保護 ===== */
(function(){
  const API_BASE=window.location.hostname.endsWith('github.io')
    ? 'https://duoduo-website.onrender.com'
    : '';
  const TOKEN_KEY='duoduo_admin_session';

  const style=document.createElement('style');
  style.textContent=`
    #duoduo-admin-auth{position:fixed;inset:0;z-index:999999;background:#0b1118;color:#fff;display:flex;align-items:center;justify-content:center;padding:24px;font-family:inherit}
    #duoduo-admin-auth .auth-card{width:min(420px,100%);background:#111a24;border:1px solid #26384b;border-radius:16px;padding:30px;box-shadow:0 20px 60px rgba(0,0,0,.45)}
    #duoduo-admin-auth h1{margin:0 0 8px;font-size:24px}
    #duoduo-admin-auth p{margin:0 0 22px;color:#9eacbb;line-height:1.6}
    #duoduo-admin-auth label{display:block;margin:14px 0 7px;color:#cbd6e2;font-size:14px}
    #duoduo-admin-auth input{box-sizing:border-box;width:100%;padding:12px 13px;border:1px solid #34485d;border-radius:9px;background:#0b1118;color:#fff;outline:none;font:inherit}
    #duoduo-admin-auth input:focus{border-color:#6f8daa}
    #duoduo-admin-auth button{width:100%;margin-top:18px;padding:12px;border:0;border-radius:9px;background:#fff;color:#101820;font-weight:700;cursor:pointer;font:inherit}
    #duoduo-admin-auth .auth-error{min-height:22px;margin-top:12px;color:#ff8f8f;font-size:14px}
    body.duoduo-auth-lock{overflow:hidden}
  `;
  document.head.appendChild(style);

  const overlay=document.createElement('div');
  overlay.id='duoduo-admin-auth';
  overlay.innerHTML=`
    <div class="auth-card">
      <h1>🔐 多多谷管理後台</h1>
      <p>請輸入管理員帳號與密碼後進入後台。</p>
      <form id="duoduo-admin-login-form" autocomplete="off">
        <label>管理員帳號</label>
        <input id="duoduo-admin-username" type="text" autocomplete="username" required>
        <label>管理員密碼</label>
        <input id="duoduo-admin-password" type="password" autocomplete="current-password" required>
        <div id="duoduo-admin-auth-error" class="auth-error"></div>
        <button type="submit">登入後台</button>
      </form>
    </div>`;

  document.body.classList.add('duoduo-auth-lock');
  document.body.appendChild(overlay);

  function getToken(){
    try{return sessionStorage.getItem(TOKEN_KEY)||''}catch{return ''}
  }
  function setToken(token){
    try{sessionStorage.setItem(TOKEN_KEY,token)}catch{}
  }
  function clearToken(){
    try{sessionStorage.removeItem(TOKEN_KEY)}catch{}
  }
  function unlock(){
    overlay.remove();
    document.body.classList.remove('duoduo-auth-lock');
    window.dispatchEvent(new CustomEvent('duoduo-admin-authenticated'));
  }

  async function verify(token){
    if(!token)return false;
    try{
      const res=await fetch(`${API_BASE}/api/admin/me`,{
        headers:{Authorization:`Bearer ${token}`},
        cache:'no-store'
      });
      return res.ok;
    }catch{return false}
  }

  async function login(username,password){
    const res=await fetch(`${API_BASE}/api/admin/login`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({username,password})
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok||!data.ok||!data.token)throw new Error(data.error||'登入失敗');
    setToken(data.token);
    unlock();
  }

  document.getElementById('duoduo-admin-login-form').addEventListener('submit',async e=>{
    e.preventDefault();
    const errorBox=document.getElementById('duoduo-admin-auth-error');
    const button=e.currentTarget.querySelector('button');
    const username=document.getElementById('duoduo-admin-username').value.trim();
    const password=document.getElementById('duoduo-admin-password').value;
    errorBox.textContent='';
    button.disabled=true;
    button.textContent='登入中…';
    try{
      await login(username,password);
    }catch(error){
      errorBox.textContent='帳號或密碼錯誤，請重新輸入。';
      document.getElementById('duoduo-admin-password').value='';
    }finally{
      if(document.body.contains(button)){
        button.disabled=false;
        button.textContent='登入後台';
      }
    }
  });

  (async()=>{
    const token=getToken();
    if(await verify(token))unlock();
    else clearToken();
  })();
})();
/* ===== 管理後台登入保護結束 ===== */

if(!document.getElementById('heroUploadStyles')){const st=document.createElement('style');st.id='heroUploadStyles';st.textContent='.hero-slide-preview{margin:10px 0 0;min-height:90px;border:1px dashed var(--line,#294057);border-radius:10px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(0,0,0,.12);color:#8ea5bd}.hero-slide-preview img{display:block;width:180px;height:100px;object-fit:cover}.hero-slide-fields label{margin-bottom:8px}.field-note{display:block;margin-top:4px;opacity:.72;font-size:.8em}';document.head.appendChild(st)}
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const defaultLinks={"Discord":"https://discord.gg/duoduovalley","儲值入口":"https://fd-pay.com/ARrbXO","遊玩指南":"https://docs.google.com/document/d/13Ok02E9A_sS7LWrrFXw4S9jsPU6JWdTu6INpwuMlDdo/edit?usp=sharing","機率型道具說明":"https://docs.google.com/spreadsheets/d/1rAv38Kniphusog1CYCZQWkGW4OdDGRmeLUeHBfCi1BQ/edit?usp=sharing","上架商品":"https://docs.google.com/spreadsheets/d/1jvi3pVe9q0EjeMbTruptmLlT5eYNXMvr2glVt0-uxhs/edit?usp=sharing","每日 Checklist":"https://duoduovalley.github.io/duoduo-checklist/","登入器下載":"https://mega.nz/file/d3IVHYZY#iIv2y93Y2tPy2zORnDUUEWY-q4wO6PkdTqNZG3cYlM","整合包下載":"https://drive.google.com/file/d/1qohiBEHnrrAxIBPvSZ-MUerbp8xLD3tl/view?usp=sharing"};
const newsTagShort=t=>({'重要消息':'重要','維護通知':'維護','更新說明':'更新','活動資訊':'活動','序號發放':'序號','處分名單':'處分'}[t]||t); const defaults={news:[{tag:'重要消息',title:'DuoDuo Valley 官方網站持續完善中',date:'2026/10/04',body:'多多谷官方網站正在持續整理遊戲資訊、活動與玩家資源。'}],events:[],items:[]};
let news=read('duoduo_news',defaults.news),events=read('duoduo_events',defaults.events),items=read('duoduo_items',defaults.items);
let reviews=read('duoduo_reviews',[{id:'r1',rating:5,author:'玩家心得',text:'很多東西不用一直重複操作，玩起來比較舒服。',createdAt:1},{id:'r2',rating:5,author:'玩家心得',text:'活動蠻多的，不是每天只有掛著打怪。',createdAt:2},{id:'r3',rating:5,author:'玩家心得',text:'遇到問題有官方入口可以處理，這點很重要。',createdAt:3}]);
const defaultLayout={sections:[{id:'hero',name:'Hero 主視覺',visible:true,desc:'首頁第一屏／主視覺／CTA'},{id:'new-player',name:'新手三步驟',visible:true,desc:'第一次來多多谷的快速入口'},{id:'why',name:'為什麼選多多谷',visible:true,desc:'內容、便利、社群與長期遊玩理由'},{id:'about',name:'關於多多谷',visible:true,desc:'品牌與世界觀介紹'},{id:'quick-intro',name:'快速認識多多谷',visible:true,desc:'輪迴、BOSS、活動與便利玩法總覽'},{id:'features',name:'遊戲特色',visible:true,desc:'輪迴、強化、拳王、小屋等特色卡片'},{id:'events',name:'最新活動',visible:true,desc:'首頁活動卡片'},{id:'boss',name:'BOSS 挑戰',visible:true,desc:'BOSS 與副本宣傳'},{id:'community',name:'玩家社群',visible:true,desc:'社群與玩家交流'},{id:'stay',name:'為什麼留下來',visible:true,desc:'持續內容、養成與社群理由'},{id:'news',name:'最新公告',visible:true,desc:'官方公告與分類資訊'},{id:'versions',name:'版本紀錄',visible:true,desc:'目前版本與持續更新方向'},{id:'start',name:'開始遊玩',visible:true,desc:'登入器、整合包、指南與儲值'},{id:'quick-links',name:'玩家常用入口',visible:true,desc:'商城、機率、Checklist、Discord'}],featureColumns:3,heroEyebrow:'DUODUO VALLEY · OFFICIAL',heroTitle:'你的冒險，從多多谷開始。',heroSubtitle:'一個持續更新、充滿玩法，也讓玩家願意留下來的楓之谷世界。',aboutTitle:'一個正在慢慢變熱鬧的小小世界'};
const defaultContent={hero:{eyebrow:"DUODUO VALLEY · V282",title:"同樣都是楓之谷，為什麼是多多谷？",subtitle:"不是只換一個版本、調一組倍率。\n我們更在意：你上線之後，有沒有東西玩、有人一起玩，也有沒有值得留下來的理由。"},newPlayer:{eyebrow:"FOR NEW PLAYERS",title:"第一次來多多谷？",desc:"不用先研究一大堆名詞，只要 3 個步驟，就能開始你的冒險。",steps:[{title:"了解多多谷",desc:"先看看特色系統、玩法與世界觀。"},{title:"下載登入器",desc:"依照遊玩指南完成下載與設定。"},{title:"開始你的冒險",desc:"進入遊戲，和大家一起玩。"}]},why:{title:"你真正想知道的，這裡直接告訴你。",desc:"第一次看到多多谷，不需要先研究一堆名詞。先看看它能不能成為你想長期玩的那個服。",cards:[{title:"有內容",desc:"輪迴、陣營、強化、掛機、學院、BOSS、副本與各式特色活動，讓角色養成不只有一條路。"},{title:"夠方便",desc:"資源找回、掃蕩、裝備繼承、掛機等便利機制，減少重複操作，把時間留給真正想玩的內容。"},{title:"有人一起玩",desc:"打王、聊天、活動與競爭都不只是單機體驗，讓你有機會找到一起玩的玩家。"},{title:"找得到人",desc:"遊戲問題、BUG、活動疑問都有明確的官方處理入口，遇到問題不是只能自己摸索。"},{title:"福利持續有",desc:"特權、活動、限定福利與各式玩家企劃會持續推出，不只一次性活動。"},{title:"現在加入剛剛好",desc:"不用等下一個新服。版本持續更新，現在就能開始自己的進度。"}]},about:{title:"一個正在慢慢變熱鬧的小小世界",desc:"多多谷不只是一個伺服器，更是一個讓大家相聚、冒險與成長的家。",overlayTitle:"找到屬於自己的玩法",overlayDesc:"豐富且持續更新的遊戲內容、溫暖友善的社群環境、定期舉辦的活動與福利，以及用心傾聽玩家建議與回饋的世界。",image:"assets/logo3.jpg"},quickIntro:{title:"快速認識多多谷",desc:"不用一次看完所有系統，先從你最有興趣的地方開始。",cards:[{title:"輪迴 × 天賦",desc:"長期角色養成，慢慢打造屬於自己的成長方向。"},{title:"BOSS × 副本",desc:"角色變強之後，還有新的目標等著你挑戰。"},{title:"活動 × 休閒",desc:"練等之外，也有 BINGO、OX、拳王等不同玩法。"},{title:"便利 × 生活",desc:"掛機、掃蕩、資源找回等，讓日常遊玩更舒服。"}]},features:{title:"多多谷，不只是打怪練等。",desc:"把系統分類給你看，想深入了解再慢慢探索。",cards:[{title:"角色養成",desc:"輪迴、天賦、強化、裝備繼承等內容，讓角色成長有長期目標。",small:"輪迴系統 · 天賦系統 · 強化系統 · 裝備繼承"},{title:"挑戰內容",desc:"BOSS、副本、學院與排行榜，給想追求成長的玩家目標。"},{title:"休閒玩法",desc:"BINGO、OX、拳王爭霸、我的小屋等，練等之外也有事情做。"},{title:"便利功能",desc:"掛機、掃蕩、資源找回等，降低重複操作的負擔。"}]},events:{title:"正在進行的活動"},boss:{title:"挑戰更高的極限",desc:"獨家 BOSS、副本與排行榜，讓養成不只是數字，而是下一場挑戰的開始。"},community:{title:"一個私服好不好玩，玩家氣氛很重要。",desc:"多多谷不只希望你玩遊戲，也希望你能找到一起玩的玩家。",copyTitle:"不是一個人慢慢玩",copyDesc:"從打王、活動到日常聊天，多多谷希望玩家之間有交流、有目標，也有一起留下來的理由。"},stay:{title:"為什麼不是玩幾天就離開？",desc:"多多谷想做的，不只是讓你下載遊戲，而是讓你有下一個想完成的目標。",cards:[{title:"一直有東西可以玩",desc:"系統、活動、BOSS 與副本持續整理與更新，讓角色成長之後還有新的方向。"},{title:"進度是自己的",desc:"從養成、天賦到挑戰內容，不要求所有人走同一條路，慢慢建立自己的角色。"},{title:"有人一起玩",desc:"社群、活動、打王與玩家交流，讓你留下來的理由不只是一張角色數值表。"}]},news:{title:"最新消息"},versions:{title:"多多谷一直在往前走",desc:"版本不是結束，而是下一段內容的開始。"},start:{title:"現在，你知道為什麼是多多谷了。",desc:"不用等下一個新服。如果你正在找一個有內容、有人玩、持續更新的楓之谷私服，歡迎來看看。"},quickLinks:{title:"玩家常用入口"}};
let content=read('duoduo_content',defaultContent);
let editingReviewId=null;
const defaultSettings={name:'DuoDuo Valley｜多多谷',subtitle:'你的冒險，從多多谷開始。',nav:{home:'首頁',why:'為什麼選多多谷',features:'特色系統',news:'最新消息',events:'檔期活動',boss:'BOSS',guide:'遊玩指南',downloads:'下載專區',playerTools:'玩家工具'},footer:{description:'一個正在慢慢變熱鬧的小小世界。遊戲資訊、檔期活動與最新公告，都在這裡整理。',navTitle:'網站導覽',resourceTitle:'玩家資源',copyright:'© 2026 DuoDuo Valley · 多多谷'}};
const defaultHero={images:['assets/ad3.png','assets/birthday.png','assets/boss.png','assets/experience-rate.png'],interval:5000};
let hero=read('duoduo_hero',defaultHero);if(!Array.isArray(hero.slides)||!hero.slides.length){hero.slides=(Array.isArray(hero.images)&&hero.images.length?hero.images:defaultHero.images).map((image,i)=>({image,title:`多多谷宣傳 ${i+1}`,link:'',enabled:true}));}hero.slides=hero.slides.map((x,i)=>({image:x.image||'',title:x.title||`多多谷宣傳 ${i+1}`,link:x.link||'',enabled:x.enabled!==false}));hero.images=hero.slides.map(x=>x.image);hero.interval=Math.max(2000,Number(hero.interval)||5000);
let settings=read('duoduo_settings',defaultSettings);settings.nav=Object.assign({},defaultSettings.nav,settings.nav||{});settings.nav.playerTools=settings.nav.playerTools||'玩家工具';settings.footer=Object.assign({},defaultSettings.footer,settings.footer||{});const defaultNavOrder=['home','why','features','news','events','boss','guide','downloads','player-tools'];settings.navOrder=Array.isArray(settings.navOrder)?settings.navOrder.filter(k=>defaultNavOrder.includes(k)):[];settings.navOrder=[...settings.navOrder,...defaultNavOrder.filter(k=>!settings.navOrder.includes(k))];
const defaultResources=[{id:'guide',title:'完整遊玩指南',desc:'新手規則、系統說明與遊玩資訊。',url:defaultLinks['遊玩指南'],embedUrl:'https://docs.google.com/document/d/13Ok02E9A_sS7LWrrFXw4S9jsPU6JWdTu6INpwuMlDdo/preview',embed:true,enabled:true},{id:'checklist',title:'每日 Checklist',desc:'每天完成進度、活動與日常內容的快速檢查。',url:defaultLinks['每日 Checklist'],embedUrl:defaultLinks['每日 Checklist'],embed:true,enabled:true},{id:'rates',title:'機率型道具說明',desc:'查看機率型道具與相關說明。',url:defaultLinks['機率型道具說明'],embedUrl:'https://docs.google.com/spreadsheets/d/1rAv38Kniphusog1CYCZQWkGW4OdDGRmeLUeHBfCi1BQ/edit?usp=sharing',embed:true,enabled:true},{id:'products',title:'上架商品',desc:'查看目前可取得的商品與內容。',url:defaultLinks['上架商品'],embedUrl:'https://docs.google.com/spreadsheets/d/1jvi3pVe9q0EjeMbTruptmLlT5eYNXMvr2glVt0-uxhs/edit?usp=sharing',embed:true,enabled:true}];
let resources=read('duoduo_resources',defaultResources);

// 若仍是舊版預設順序，將 Checklist 移到第二個；已自行調整過的順序則完全保留。
(function(){
  const ids=Array.isArray(resources)?resources.map(r=>r?.id):[];
  const oldDefault=['guide','rates','products','checklist'];
  if(ids.length===oldDefault.length && ids.every((id,i)=>id===oldDefault[i])){
    const idx=ids.indexOf('checklist');
    if(idx>1){const item=resources.splice(idx,1)[0];resources.splice(1,0,item);save('duoduo_resources',resources);}
  }
})();

const defaultDownloads=[
{id:'manager',title:'遊戲橘子遊戲管理器',type:'遊戲本體',url:'https://tw.beanfun.com/beanfunCommon/Redirect/Redirect.aspx?ID=B258',desc:'第一次安裝遊戲時，先使用官方遊戲管理器下載新楓之谷。',instructions:'1.於官方網站或多多谷Discord下載並安裝「遊戲橘子遊戲管理器」。\n2.開啟「遊戲橘子遊戲管理器」，找到「新楓之谷」點擊開始下載並選擇安裝路徑。',image:'assets/download-manager-guide.png',enabled:true},
{id:'patch281to282',title:'V281 ～ V282 更新檔',type:'版本更新',url:'https://maplestory-download.beanfun.com/maplestory/download/282DTOpqU2UWtIc/8MCDwQMvJ47u/MaplePatch281to282.zip',desc:'已經安裝對應遊戲版本的玩家，可使用此檔案更新至 V282。',instructions:'1.於官方網站下載符合需求的更新檔案。\n2.下載完畢後，使用右鍵選更新檔，並選擇「以系統管理員身分執行」。\n3.選擇自己安裝新楓之谷主程式時的位置。',image:'assets/manual-update-guide.png',enabled:true},
{id:'patch2824',title:'V282 ～ V282.4 手動更新檔',type:'版本更新',url:'https://maplestory-download.beanfun.com/maplestory/download/282DTOpqU2UWtIc/GmWKbVkc4O6B/MapleStoryV282.4.exe',desc:'需要從 V282 更新至 V282.4 時使用的手動更新檔。',instructions:'1.於官方網站下載符合需求的更新檔案。\n2.下載完畢後，使用右鍵選更新檔，並選擇「以系統管理員身分執行」。\n3.選擇自己安裝新楓之谷主程式時的位置。',image:'assets/manual-update-guide.png',enabled:true},
{id:'launcher',title:'多多谷登入器',type:'DuoDuo',url:'https://mega.nz/file/d3IVHYZY#iIv2y93Y2tPy2zORnDUUEWY-q4wO6Pkd8TqNZG3cYlM',desc:'將登入器放入 MapleStory 遊戲資料夾後，即可註冊帳號並進入遊戲。',instructions:'1.將「多多谷」放入 MapleStory 遊戲資料夾內。\n2.開啟多多谷登入器後，於該介面註冊遊戲帳號。\n3.點擊「GAME START」按鈕，即可進入遊戲。',image:'',enabled:true},
{id:'pack',title:'DuoDuo 整合包',type:'DuoDuo',url:'https://drive.google.com/file/d/1qohiBEHnrrAxIBPvSZ-MUerbp8xLD3tl/view?usp=sharing',desc:'已整理好的 DuoDuo MapleStoryV282 遊戲資料，適合需要完整環境的玩家。',instructions:'1.將 DuoDuo MapleStoryV282 遊戲資料夾內「多多谷」開啟。\n2.開啟多多谷登入器後，於該介面註冊遊戲帳號。\n3.點擊「GAME START」按鈕，即可進入遊戲。',image:'',enabled:true}
];
let downloads=read('duoduo_downloads',defaultDownloads),editingDownloadId=null;
const defaultBossConfig={interval:5000,slides:[{image:'assets/boss.png',title:'燦爛的凶星',link:'',enabled:true}]};
let bossConfig=read('duoduo_boss_config',defaultBossConfig);
bossConfig={interval:Math.max(2000,Number(bossConfig.interval)||5000),slides:Array.isArray(bossConfig.slides)&&bossConfig.slides.length?bossConfig.slides:structuredClone(defaultBossConfig.slides)};
let pendingBossUploads=[];

let layout=read('duoduo_layout',defaultLayout);let editingItemId=null,pendingItemImage='';let pendingEventCoverImage='';let pendingEventCarouselImages=[];
function read(k,f){try{return JSON.parse(localStorage.getItem(k)||'null')??structuredClone(f)}catch{return structuredClone(f)}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}

const CLOUD_SITE_KEYS=['duoduo_news','duoduo_reviews','duoduo_content','duoduo_hero','duoduo_layout','duoduo_settings','duoduo_resources','duoduo_downloads','duoduo_items','duoduo_links','duoduo_pools'];
function getAdminToken(){try{return sessionStorage.getItem('duoduo_admin_session')||''}catch{return ''}}
async function pushSiteDataToCloud(keys=CLOUD_SITE_KEYS){
  const API_BASE=window.location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
  const token=getAdminToken();
  if(!token)throw new Error('未登入');
  const values={};
  for(const key of keys){
    const raw=localStorage.getItem(key);
    if(raw===null)continue;
    try{values[key]=JSON.parse(raw)}catch{values[key]=raw}
  }
  const res=await fetch(`${API_BASE}/api/site-data`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({values})});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||!data.ok)throw new Error(res.status===401?'登入已失效':(data.error||'網站資料同步失敗'));
  return data;
}
// 雲端同步改為「手動」：平常所有編輯只寫入目前瀏覽器。
function queueSiteDataCloudSave(key){/* 保留函式名稱以避免其他舊程式碼出錯，但不再自動同步。 */}
function addCloudMigrationButton(){
  if(document.getElementById('duoduo-cloud-migrate'))return;
  const style=document.createElement('style');style.textContent='#duoduo-cloud-migrate{position:fixed;right:22px;bottom:22px;z-index:99990;padding:11px 16px;border:1px solid #39536d;border-radius:999px;background:#132234;color:#fff;font:600 14px/1.2 inherit;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.28)}#duoduo-cloud-migrate:hover{background:#1b3047}';document.head.appendChild(style);
  const btn=document.createElement('button');btn.id='duoduo-cloud-migrate';btn.type='button';btn.textContent='☁️ 將目前資料同步到雲端';
  btn.addEventListener('click',async()=>{
    if(!confirm('會將這台瀏覽器目前的公告、評論、首頁內容、主視覺、版面、網站設定、資源、下載、檔期活動與 BOSS 設定，一次覆蓋同步到雲端。\n\n請先確認你已經把所有修改完成。\n\n確定要同步嗎？'))return;
    const old=btn.textContent;btn.disabled=true;btn.textContent='☁️ 同步中…';
    try{
      await pushSiteDataToCloud();
      await syncEventsToServer();
      await saveBossesToServer();
      alert('目前瀏覽器資料已成功同步到雲端。之後玩家即可讀取這份資料。');
    }
    catch(error){
      console.error(error);
      alert(error.message==='登入已失效'?'登入已失效，請重新登入後再試。':'雲端同步失敗，原本瀏覽器資料沒有被刪除。');
    }
    finally{btn.disabled=false;btn.textContent=old}
  });
  document.body.appendChild(btn);
}

// 抽獎獎池管理：以共用網站資料 API 儲存，玩家工具端讀取同一份資料。
(function initPoolAdmin(){
  const $=id=>document.getElementById(id);
  const sel=$('poolAdminSelect');
  if(!sel)return;
  const defaults=window.DUODUO_TOOL_DATA&&Array.isArray(window.DUODUO_TOOL_DATA.pools)?window.DUODUO_TOOL_DATA.pools:[];
  let pools=[];
  let weeklyPrizes=[{name:'天上的氣息',prob:0.0005,image:'assets/gacha/apple/天上的氣息.png'}];
  let weeklyImageCatalog=[];
  const apiBase=window.location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function status(msg,bad=false){$('poolAdminStatus').textContent=msg;$('poolAdminStatus').style.color=bad?'#d9534f':'';}
  function selected(){return pools.find(p=>p.key===sel.value)||null;}
  function paintSelect(preferred){
    const keep=preferred||sel.value;
    sel.innerHTML=pools.map(p=>`<option value="${esc(p.key)}">${esc(p.name)} (${esc(p.key)})</option>`).join('');
    if(pools.some(p=>p.key===keep))sel.value=keep;
    paintForm();
  }
  function imageFileName(path){try{return decodeURIComponent(String(path||'').split(/[?#]/)[0].split('/').pop()||'');}catch{return String(path||'').split('/').pop()||''}}
  function paintWeeklyPrizes(){
    const host=$('weeklyPrizeAdminRows');if(!host)return;
    const options=weeklyImageCatalog.map(x=>`<option value="${esc(x.name)}"></option>`).join('');
    host.innerHTML=weeklyPrizes.map((item,i)=>{const currentName=imageFileName(item.image);const found=weeklyImageCatalog.find(x=>x.path===item.image||x.name===currentName);return `<div class="builder-card weekly-prize-card" style="margin:0"><div class="form"><label>大獎名稱<input data-weekly-name="${i}" value="${esc(item.name)}" placeholder="例如：天上的氣息"></label><label>機率（%）<input data-weekly-prob="${i}" type="number" min="0" max="100" step="0.0001" value="${Number(item.prob||0)*100}" placeholder="0.05"></label><label class="full">從共用圖片庫搜尋<input data-weekly-image-search="${i}" list="weeklyImageCatalog" value="${esc(found?.name||'')}" placeholder="輸入道具名稱或圖片檔名"></label><label class="full">目前圖片路徑／網址<input data-weekly-image="${i}" value="${esc(item.image||'')}" placeholder="選擇圖片後自動填入；也可手動輸入"></label><div class="weekly-image-preview full">${item.image?`<img src="${esc(item.image.startsWith('http')?item.image:'player-tools/'+item.image)}" alt="圖片預覽" onerror="this.parentElement.innerHTML='<span>目前圖片無法預覽，請重新選擇或上傳。</span>'">`:'<span>尚未設定圖片</span>'}</div><label class="full">找不到圖片？上傳新圖片<input data-weekly-upload="${i}" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><small class="field-note">上傳後會使用雲端圖片網址，不必手動填路徑。</small></label><div class="form-actions"><button class="ghost" type="button" data-weekly-delete="${i}">刪除這項大獎</button></div></div></div>`}).join('')||'<div class="note">目前沒有設定本週大獎。</div>';
    let list=$('weeklyImageCatalog');if(!list){list=document.createElement('datalist');list.id='weeklyImageCatalog';host.appendChild(list);}list.innerHTML=options;
  }
  async function loadWeeklyImageCatalog(){
    try{const res=await fetch('player-tools/image-manifest.json',{cache:'no-store'});if(!res.ok)throw new Error('manifest unavailable');const data=await res.json();weeklyImageCatalog=Array.isArray(data)?data.filter(x=>x&&x.name&&x.path):[];paintWeeklyPrizes();}
    catch{weeklyImageCatalog=[];}
  }
  function readWeeklyPrizes(){
    const host=$('weeklyPrizeAdminRows');
    const rows=[...host.querySelectorAll('[data-weekly-name]')].map(nameEl=>{const i=Number(nameEl.dataset.weeklyName),probEl=host.querySelector(`[data-weekly-prob="${i}"]`),imageEl=host.querySelector(`[data-weekly-image="${i}"]`),percent=Number(probEl?.value),name=nameEl.value.trim(),image=(imageEl?.value||'').trim();if(!name)throw new Error(`第 ${i+1} 項本週大獎缺少名稱。`);if(!Number.isFinite(percent)||percent<0||percent>100)throw new Error(`第 ${i+1} 項本週大獎機率需介於 0 到 100%。`);if(!image)throw new Error(`第 ${i+1} 項本週大獎缺少圖片路徑。`);return {name,prob:percent/100,image};});
    if(!rows.length)throw new Error('請至少保留一項本週大獎。');return rows;
  }
  function ensurePlatinumOracle(pools){
    if(!Array.isArray(pools))return;
    const platinum=pools.find(p=>p?.key==='platinum');
    if(!platinum||!Array.isArray(platinum.items))return;
    const existing=platinum.items.find(it=>it?.name==='神諭者的戒指');
    platinum.items=platinum.items.filter(it=>it?.name!=='神諭者的戒指');
    platinum.items.unshift({...existing,name:'神諭者的戒指',prob:0.0003,image:'assets/gacha/apple/神諭者的戒指.png'});
  }
  function excludeUnscheduledOracle(pools,weekly){
    if((weekly||[]).some(it=>it?.name==='神諭者的戒指'))return;
    const golden=pools.find(p=>p?.key==='golden');
    if(golden&&Array.isArray(golden.items))golden.items=golden.items.filter(it=>it?.name!=='神諭者的戒指');
  }
  function paintForm(){
    const p=selected();
    $('poolKey').value=p?.key||'';$('poolName').value=p?.name||'';$('poolImage').value=p?.image||'';
    $('poolItemsJson').value=p?JSON.stringify(p.items||[],null,2):'[]';
    $('poolDelete').disabled=!p;paintWeeklyPrizes();
  }
  async function load(){
    try{
      const res=await fetch(`${apiBase}/api/site-data`,{cache:'no-store'});
      const json=await res.json();
      const remote=json?.data?.duoduo_pools;
      const remoteWeekly=json?.data?.duoduo_weekly_prizes;
      pools=Array.isArray(remote)&&remote.length?remote:JSON.parse(JSON.stringify(defaults));
      if(Array.isArray(remoteWeekly)&&remoteWeekly.length)weeklyPrizes=remoteWeekly.map(x=>({name:String(x.name||''),prob:Number(x.prob)||0,image:String(x.image||'')}));
      else weeklyPrizes=[{name:'天上的氣息',prob:0.0005,image:'assets/gacha/apple/天上的氣息.png'}];
      // The admin JSON stores probability as a 0-1 ratio. The intended 0.05% for 天上的氣息 is 0.0005, not 0.05 (5%).
      let correctedHeavenlyRate=false;
      const golden=pools.find(p=>p&&p.key==='golden');
      if(golden&&Array.isArray(golden.items)){golden.items=golden.items.map(item=>{if(item&&item.name==='天上的氣息'&&Number(item.prob)===0.05){correctedHeavenlyRate=true;return {...item,prob:0.0005};}return item;});}
      ensurePlatinumOracle(pools);
      excludeUnscheduledOracle(pools,weeklyPrizes);
      localStorage.setItem('duoduo_pools',JSON.stringify(pools));
      paintSelect(pools[0]?.key);status(correctedHeavenlyRate?'已將「天上的氣息」機率修正為 0.05%（0.0005）。請選擇黃金蘋果並按「儲存獎池並同步雲端」完成雲端更新。':(remote?'已載入雲端獎池資料。':'目前雲端尚無獎池設定，已載入預設獎池；儲存後即可同步。'));
    }catch(e){
      try{pools=JSON.parse(localStorage.getItem('duoduo_pools')||'null')||JSON.parse(JSON.stringify(defaults));}catch{pools=JSON.parse(JSON.stringify(defaults));}
      ensurePlatinumOracle(pools);excludeUnscheduledOracle(pools,weeklyPrizes);
      paintSelect(pools[0]?.key);status('雲端讀取失敗，暫時載入本機／預設獎池。儲存前請確認後端連線。',true);
    }
  }
  sel.addEventListener('change',paintForm);
  loadWeeklyImageCatalog();
  $('weeklyPrizeAdd').addEventListener('click',()=>{weeklyPrizes.push({name:'新大獎',prob:0.0005,image:'assets/gacha/apple/天上的氣息.png'});paintWeeklyPrizes();status('已新增大獎欄位；填寫名稱、百分比與圖片後再儲存。');});
  $('weeklyPrizeAdminRows').addEventListener('input',e=>{const raw=e.target.dataset.weeklyName??e.target.dataset.weeklyProb??e.target.dataset.weeklyImage;if(raw===undefined)return;const i=Number(raw),host=$('weeklyPrizeAdminRows');if(!weeklyPrizes[i])return;const nameEl=host.querySelector(`[data-weekly-name="${i}"]`),probEl=host.querySelector(`[data-weekly-prob="${i}"]`),imageEl=host.querySelector(`[data-weekly-image="${i}"]`);weeklyPrizes[i]={name:nameEl.value,prob:(Number(probEl.value)||0)/100,image:imageEl.value};});
  $('weeklyPrizeAdminRows').addEventListener('change',async e=>{
    const search=e.target.closest('[data-weekly-image-search]');
    if(search){const i=Number(search.dataset.weeklyImageSearch),query=search.value.trim().toLocaleLowerCase(),stripExt=v=>String(v||'').replace(/\.(png|jpe?g|webp|gif)$/i,'').toLocaleLowerCase(),match=weeklyImageCatalog.find(x=>x.name===search.value.trim()||stripExt(x.name)===stripExt(query)||stripExt(x.path.split('/').pop())===stripExt(query));if(!match){status('圖片庫找不到這個名稱或檔名；可以改用下方上傳圖片。',true);return;}weeklyPrizes[i].image=match.path;paintWeeklyPrizes();status(`已選擇圖片：${match.name}。儲存獎池後才會正式同步。`);return;}
    const upload=e.target.closest('[data-weekly-upload]');
    if(upload&&upload.files&&upload.files[0]){const i=Number(upload.dataset.weeklyUpload),file=upload.files[0];if(file.size>8*1024*1024){status('圖片請控制在 8MB 以下。',true);upload.value='';return;}try{status('正在上傳圖片…');upload.disabled=true;const dataUrl=await fileToCompressedDataURL(file,1200,1200,.9);const path=await uploadImageDataURL(dataUrl,file.name);weeklyPrizes[i].image=path;paintWeeklyPrizes();status('圖片已上傳並套用；按「儲存獎池並同步雲端」後才會更新玩家工具。');}catch(err){status(`圖片上傳失敗：${err.message||'請稍後再試。'}`,true);}finally{upload.disabled=false;}}
  });
  $('weeklyPrizeAdminRows').addEventListener('click',e=>{const btn=e.target.closest('[data-weekly-delete]');if(!btn)return;weeklyPrizes.splice(Number(btn.dataset.weeklyDelete),1);paintWeeklyPrizes();status('已移除這項大獎；按儲存後才會正式同步。');});
  $('poolItemAdd').addEventListener('click',()=>{
    try{const items=JSON.parse($('poolItemsJson').value||'[]');if(!Array.isArray(items))throw new Error();items.push({name:'新獎品',prob:0.01});$('poolItemsJson').value=JSON.stringify(items,null,2);status('已加入獎品範本，請修改名稱與機率後儲存。');}
    catch{status('目前獎品 JSON 格式錯誤，請先修正格式再新增。',true);}
  });
  $('poolItemRemove').addEventListener('click',()=>{
    try{const items=JSON.parse($('poolItemsJson').value||'[]');if(!Array.isArray(items)||!items.length)throw new Error();items.pop();$('poolItemsJson').value=JSON.stringify(items,null,2);status('已移除最後一項獎品，按儲存後才會正式生效。');}
    catch{status('目前沒有可刪除的獎品，或 JSON 格式錯誤。',true);}
  });
  $('poolNew').addEventListener('click',()=>{
    const base='new-pool';let key=base,n=2;while(pools.some(p=>p.key===key))key=`${base}-${n++}`;
    pools.push({key,name:'新獎池',image:'',items:[]});paintSelect(key);status('已新增未儲存獎池，填寫內容後按「儲存獎池並同步雲端」。');
  });
  $('poolDelete').addEventListener('click',()=>{
    const p=selected();if(!p)return;
    if(!confirm(`確定刪除「${p.name}」獎池？儲存後所有玩家都會看不到這個獎池。`))return;
    pools=pools.filter(x=>x.key!==p.key);paintSelect(pools[0]?.key);status('已刪除選取獎池，請按儲存同步才會正式生效。');
  });
  $('poolSave').addEventListener('click',async()=>{
    const previousPools=JSON.parse(JSON.stringify(pools));
    const previousWeekly=JSON.parse(JSON.stringify(weeklyPrizes));
    try{
      weeklyPrizes=readWeeklyPrizes();
      const old=selected(),key=$('poolKey').value.trim(),name=$('poolName').value.trim(),image=$('poolImage').value.trim();
      if(!/^[a-zA-Z0-9_-]{1,50}$/.test(key))throw new Error('獎池識別碼只能使用英文、數字、底線或連字號。');
      if(!name)throw new Error('請填寫獎池名稱。');
      let items;try{items=JSON.parse($('poolItemsJson').value);}catch{throw new Error('獎品清單 JSON 格式錯誤。');}
      if(!Array.isArray(items))throw new Error('獎品清單必須是 JSON 陣列。');
      items=items.map((it,i)=>{
        const prob=Number(it?.prob);
        if(!String(it?.name||'').trim())throw new Error(`第 ${i+1} 個獎品缺少名稱。`);
        if(!Number.isFinite(prob)||prob<0||prob>1)throw new Error(`第 ${i+1} 個獎品機率需介於 0 到 1。`);
        return {...it,name:String(it.name).trim(),prob};
      });
      const duplicate=pools.some(p=>p.key===key&&p!==old);
      if(duplicate)throw new Error('獎池識別碼已存在，請使用不同識別碼。');
      const next={key,name,image,items};
      if(old){pools=pools.map(p=>p===old?next:p);}else pools.push(next);
      if(!pools.length)throw new Error('至少需保留一個獎池。');
      const golden=pools.find(p=>p.key==='golden');
      if(golden){
        const newNames=new Set(weeklyPrizes.map(x=>x.name));
        golden.items=(golden.items||[]).filter(it=>!['M-DAY機器心臟','燃燒之戒'].includes(it.name)||newNames.has(it.name));
        for(const prize of weeklyPrizes){const found=golden.items.find(it=>it.name===prize.name);if(found){found.prob=prize.prob;found.image=prize.image;}else golden.items.unshift({name:prize.name,prob:prize.prob,image:prize.image});}
      }
      ensurePlatinumOracle(pools);
      excludeUnscheduledOracle(pools,weeklyPrizes);
      const btn=$('poolSave');btn.disabled=true;status('正在同步到雲端…');
      const token=sessionStorage.getItem('duoduo_admin_session')||'';
      if(!token)throw new Error('管理員登入狀態已失效，請重新登入。');
      const response=await fetch(`${apiBase}/api/site-data`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({values:{duoduo_pools:pools,duoduo_weekly_prizes:weeklyPrizes}})});
      const result=await response.json().catch(()=>({}));
      if(!response.ok||!result.ok)throw new Error(result.error||'雲端儲存失敗，請確認後端版本與登入狀態。');
      localStorage.setItem('duoduo_pools',JSON.stringify(pools));
      paintSelect(key);status('已儲存並同步雲端。玩家工具重新載入後會取得最新獎池。');
    }catch(e){
      // Roll back the editor state when cloud saving fails.
      pools=previousPools;weeklyPrizes=previousWeekly;
      try{localStorage.setItem('duoduo_pools',JSON.stringify(pools));paintSelect(pools[0]?.key);}catch{}
      status(e.message||'儲存失敗。',true);alert(e.message||'儲存失敗。');
    }
    finally{$('poolSave').disabled=false;}
  });
  load();
})();

window.addEventListener('duoduo-admin-authenticated',addCloudMigrationButton);
setTimeout(()=>{if(document.getElementById('duoduo-admin-auth')===null)addCloudMigrationButton()},1000);
function eventStartTimestamp(e){const raw=String(e?.start??'').trim();if(!raw)return Number.MIN_SAFE_INTEGER;const m=raw.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:[T ]+(\d{1,2})(?::(\d{1,2}))?)?/);if(m){const d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]),Number(m[4]||0),Number(m[5]||0));if(Number.isFinite(d.getTime()))return d.getTime();}const t=Date.parse(raw);return Number.isFinite(t)?t:Number.MIN_SAFE_INTEGER}
function sortEventsByStart(list){return [...list].sort((a,b)=>eventStartTimestamp(b)-eventStartTimestamp(a))}
function formatEventDateRange(e){const fmt=v=>{if(!v)return '';const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v).replace('T',' ');const pad=n=>String(n).padStart(2,'0');return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`};return `${fmt(e?.start)} ～ ${fmt(e?.end)}`}
function eventDateTimeParts(value){const raw=String(value??'').trim();if(!raw)return {date:'',time:''};const m=raw.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:[T ]+(\d{1,2})(?::(\d{1,2}))?)?/);if(m){return {date:`${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`,time:`${String(m[4]||0).padStart(2,'0')}:${String(m[5]||0).padStart(2,'0')}`};}const d=new Date(raw);if(Number.isNaN(d.getTime()))return {date:'',time:''};return {date:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,time:`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`};}
function combineEventDateTime(dateId,timeId){const date=$(`#${dateId}`)?.value||'';const time=$(`#${timeId}`)?.value||'';return date?`${date}T${time||'00:00'}`:'';}
function setEventDateTime(dateId,timeId,value){const parts=eventDateTimeParts(value);const date=$(`#${dateId}`),time=$(`#${timeId}`);if(date)date.value=parts.date;if(time)time.value=parts.time;}
document.querySelectorAll('.nav').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$('#'+btn.dataset.panel).classList.add('active');render()});
const contentFields=[
['hero','Hero 主視覺',[['eyebrow','小標'],['title','標題'],['subtitle','副標題']]],['newPlayer','新手三步驟',[['title','標題'],['desc','介紹'],['steps.0.title','步驟 1 標題'],['steps.0.desc','步驟 1 說明'],['steps.1.title','步驟 2 標題'],['steps.1.desc','步驟 2 說明'],['steps.2.title','步驟 3 標題'],['steps.2.desc','步驟 3 說明']]],['why','為什麼選多多谷',[['title','標題'],['desc','介紹'],...Array.from({length:6},(_,i)=>[`cards.${i}.title`,`卡片 ${i+1} 標題`]).concat(Array.from({length:6},(_,i)=>[`cards.${i}.desc`,`卡片 ${i+1} 說明`]))]],['about','關於多多谷',[['title','標題'],['desc','介紹'],['overlayTitle','圖片上的標題'],['overlayDesc','圖片上的說明'],['image','世界觀圖片路徑']]],['quickIntro','快速認識多多谷',[['title','標題'],['desc','介紹'],...Array.from({length:4},(_,i)=>[`cards.${i}.title`,`卡片 ${i+1} 標題`]).concat(Array.from({length:4},(_,i)=>[`cards.${i}.desc`,`卡片 ${i+1} 說明`]))]],['features','特色系統',[['title','標題'],['desc','介紹'],...Array.from({length:4},(_,i)=>[`cards.${i}.title`,`卡片 ${i+1} 標題`]).concat(Array.from({length:4},(_,i)=>[`cards.${i}.desc`,`卡片 ${i+1} 說明`]).concat([['cards.0.small','第一張卡片底部文字']]))]],['events','活動',[['title','標題']]],['boss','BOSS',[['title','標題'],['desc','介紹']]],['community','玩家社群',[['title','標題'],['desc','介紹'],['copyTitle','內文標題'],['copyDesc','內文說明']]],['stay','為什麼留下來',[['title','標題'],['desc','介紹'],...Array.from({length:3},(_,i)=>[`cards.${i}.title`,`卡片 ${i+1} 標題`]).concat(Array.from({length:3},(_,i)=>[`cards.${i}.desc`,`卡片 ${i+1} 說明`]))]],['news','最新消息',[['title','標題']]],['versions','版本紀錄',[['title','標題'],['desc','介紹']]],['start','開始遊玩',[['title','標題'],['desc','介紹']]],['quickLinks','玩家常用入口',[['title','標題']]]];
function getPath(obj,path){return path.split('.').reduce((o,k)=>o?.[k],obj)??''}function setPath(obj,path,val){const ks=path.split('.');let o=obj;for(let i=0;i<ks.length-1;i++)o=o[ks[i]]??=(/^\d+$/.test(ks[i+1])?[]:{});o[ks.at(-1)]=val}
function renderContentEditor(){const box=$('#contentEditor');if(!box)return;box.innerHTML=contentFields.map(([key,name,fields])=>`<details class="content-block" open><summary>${esc(name)}</summary><div class="form two content-form">${fields.map(([path,label])=>{const val=getPath(content[key],path);const area=String(val).length>80||path.toLowerCase().includes('desc')||path.toLowerCase().includes('subtitle')||path.toLowerCase().includes('small');return `<label>${esc(label)}${area?`<textarea data-content-key="${key}" data-content-path="${path}">${esc(val)}</textarea>`:`<input data-content-key="${key}" data-content-path="${path}" value="${esc(val)}">`}</label>`}).join('')}</div></details>`).join('')}
$('#saveContent').onclick=()=>{document.querySelectorAll('[data-content-key][data-content-path]').forEach(el=>setPath(content,`${el.dataset.contentKey}.${el.dataset.contentPath}`,el.value));save('duoduo_content',content);alert('首頁內容已儲存。')};$('#resetContent').onclick=()=>{if(confirm('恢復全部首頁內容預設值？')){content=structuredClone(defaultContent);save('duoduo_content',content);renderContentEditor()}};

function renderResources(){const box=$('#resourcesForm');if(!box)return;box.innerHTML=resources.map((r,i)=>`<div class="builder-card resource-admin-card"><div class="form two"><label>顯示名稱<input data-res-index="${i}" data-res-field="title" value="${esc(r.title)}"></label><label>顯示狀態<select data-res-index="${i}" data-res-field="enabled"><option value="true" ${r.enabled!==false?'selected':''}>顯示</option><option value="false" ${r.enabled===false?'selected':''}>隱藏</option></select></label><label class="full">簡短介紹<textarea data-res-index="${i}" data-res-field="desc">${esc(r.desc||'')}</textarea></label><label class="full">玩家開啟網址<input data-res-index="${i}" data-res-field="url" value="${esc(r.url||'')}"></label><label class="full">網站內嵌網址<input data-res-index="${i}" data-res-field="embedUrl" value="${esc(r.embedUrl||'')}"></label><label class="check"><input type="checkbox" data-res-index="${i}" data-res-field="embed" ${r.embed!==false?'checked':''}> 在網站內直接鑲嵌</label></div></div>`).join('');}
$('#saveResources').onclick=()=>{document.querySelectorAll('[data-res-index][data-res-field]').forEach(el=>{const i=+el.dataset.resIndex,field=el.dataset.resField;if(!resources[i])return;if(field==='embed')resources[i][field]=el.checked;else if(field==='enabled')resources[i][field]=el.value==='true';else resources[i][field]=el.value.trim()});save('duoduo_resources',resources);alert('文件與 Checklist 設定已儲存。')};
function clearDownloadForm(){editingDownloadId=null;$('#downloadTitle').value='';$('#downloadType').value='';$('#downloadUrl').value='';$('#downloadDesc').value='';$('#downloadInstructions').value='';$('#downloadImage').value='';$('#downloadEnabled').checked=true;$('#saveDownload').textContent='＋ 新增下載項目'}
function renderDownloads(){const box=$('#downloadsAdmin');if(!box)return;box.innerHTML=downloads.map((d,i)=>`<div class="item"><div><b>${esc(d.title)}</b><small>${esc(d.type||'')} ・ ${d.enabled!==false?'公開':'隱藏'}</small><small>${esc(d.desc||'')}</small></div><div><button onclick="editDownload(${i})">編輯</button> <button class="danger" onclick="removeDownload(${i})">刪除</button></div></div>`).join('')||'<div class="note">目前沒有下載項目。</div>'}
window.editDownload=i=>{const d=downloads[i];if(!d)return;editingDownloadId=d.id;$('#downloadTitle').value=d.title||'';$('#downloadType').value=d.type||'';$('#downloadUrl').value=d.url||'';$('#downloadDesc').value=d.desc||'';$('#downloadInstructions').value=d.instructions||'';$('#downloadImage').value=d.image||'';$('#downloadEnabled').checked=d.enabled!==false;$('#saveDownload').textContent='儲存下載項目修改';document.querySelector('[data-panel="downloads"]')?.click();window.scrollTo({top:0,behavior:'smooth'})};
window.removeDownload=i=>{if(!confirm('確定刪除這個下載項目？'))return;downloads.splice(i,1);save('duoduo_downloads',downloads);render()};
$('#saveDownload').onclick=()=>{const title=$('#downloadTitle').value.trim();if(!title)return alert('請輸入下載項目名稱');const data={title,type:$('#downloadType').value.trim(),url:$('#downloadUrl').value.trim(),desc:$('#downloadDesc').value.trim(),instructions:$('#downloadInstructions').value.trim(),image:$('#downloadImage').value.trim(),enabled:$('#downloadEnabled').checked};if(editingDownloadId){const target=downloads.find(d=>d.id===editingDownloadId);if(target)Object.assign(target,data)}else{downloads.unshift({id:'d_'+Date.now(),...data})}save('duoduo_downloads',downloads);clearDownloadForm();render();alert('下載專區已儲存。')};
$('#cancelDownload').onclick=clearDownloadForm;

const navOrderLabels={home:'首頁',why:'為什麼選擇多多谷',features:'特色系統',events:'檔期活動',boss:'BOSS',news:'最新消息',guide:'遊玩指南',downloads:'下載專區'};
function renderNavOrder(){const box=$('#navOrderList');if(!box)return;box.innerHTML=settings.navOrder.map((key)=>`<div class="nav-order-item" draggable="true" data-nav-order-key="${key}"><span class="drag-handle">☰</span><span class="nav-order-label">${esc(navOrderLabels[key]||key)}</span><span class="nav-order-key">${esc(key)}</span></div>`).join('');let dragKey=null;box.querySelectorAll('.nav-order-item').forEach(item=>{item.addEventListener('dragstart',e=>{dragKey=item.dataset.navOrderKey;item.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',dragKey)});item.addEventListener('dragend',()=>{dragKey=null;item.classList.remove('dragging')});item.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move'});item.addEventListener('drop',e=>{e.preventDefault();const targetKey=item.dataset.navOrderKey;if(!dragKey||dragKey===targetKey)return;const from=settings.navOrder.indexOf(dragKey),to=settings.navOrder.indexOf(targetKey);if(from<0||to<0)return;settings.navOrder.splice(from,1);settings.navOrder.splice(to,0,dragKey);renderNavOrder()})})}
// 公告與活動的後台管理列表（只管理顯示，不改動既有儲存／雲端同步機制）
const manageNewsState={query:'',filter:'全部',sort:'new',size:10,page:1};
const manageEventState={query:'',filter:'全部',sort:'new',size:10,page:1};
const manageNewsOptions=['全部','重要','維護','更新','活動','序號','處分'];
const manageEventOptions=['全部','進行中','未開始','已結束','未公開'];
function manageListDate(value){
 const raw=String(value||'').trim();
 const match=raw.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
 if(match){const ms=new Date(Number(match[1]),Number(match[2])-1,Number(match[3])).getTime();return Number.isFinite(ms)?ms:0;}
 const time=Date.parse(raw);return Number.isFinite(time)?time:0;
}
function manageEventEndTimestamp(e){
 const raw=String(e?.end||'').trim();
 if(!raw)return null;
 const val=eventStartTimestamp({start:raw});return val===Number.MIN_SAFE_INTEGER?null:val;
}
function manageEventStatus(e){
 if(e.published===false)return '未公開';
 const start=eventStartTimestamp(e),end=manageEventEndTimestamp(e),now=Date.now();
 if(start!==Number.MIN_SAFE_INTEGER&&start>now)return '未開始';
 if(end!==null&&end<now)return '已結束';
 return start===Number.MIN_SAFE_INTEGER&&end===null?'未設定時間':'進行中';
}
function managePreviewText(text){return String(text||'').replace(/\r\n?/g,'\n').slice(0,1000)}
function manageFilterButtons(container,options,state,fn){
 if(!container)return;
 container.innerHTML=options.map(option=>`<button type="button" class="${state.filter===option?'is-active':''}" data-manage-filter="${esc(option)}" aria-pressed="${state.filter===option?'true':'false'}">${esc(option)}</button>`).join('');
 container.querySelectorAll('[data-manage-filter]').forEach(b=>b.onclick=()=>{state.filter=b.dataset.manageFilter;state.page=1;fn()});
}
function managePagination(element,state,total,pageCount,fn){
 if(!element)return;
 element.innerHTML=`<button type="button" data-page-nav="prev" ${state.page<=1?'disabled':''}>上一頁</button><span>第 ${state.page}／${pageCount} 頁</span><button type="button" data-page-nav="next" ${state.page>=pageCount?'disabled':''}>下一頁</button>`;
 element.querySelector('[data-page-nav="prev"]').onclick=()=>{if(state.page>1){state.page--;fn()}};
 element.querySelector('[data-page-nav="next"]').onclick=()=>{if(state.page<pageCount){state.page++;fn()}};
}
function toggleManagedPreview(kind,index){
 const row=document.querySelector(`#${kind==='news'?'newsAdmin':'eventsAdmin'} [data-managed-index="${index}"]`);
 const preview=row?.querySelector('.manage-entry-preview');
 const button=row?.querySelector('.manage-preview-toggle');
 if(!preview||!button)return;
 preview.hidden=!preview.hidden;
 button.textContent=preview.hidden?'預覽':'收合';
 button.setAttribute('aria-expanded',String(!preview.hidden));
}
function renderManagedNews(){
 const list=$('#newsAdmin');if(!list)return;
 const s=manageNewsState,q=s.query.trim().toLowerCase();
 manageFilterButtons($('#manageNewsFilters'),manageNewsOptions,s,renderManagedNews);
 const indexed=news.map((n,i)=>({n,i})).filter(({n})=>
  (s.filter==='全部'||newsTagShort(n.tag)===s.filter)&&
  (!q||[n.title,n.date,n.tag,n.body,n.newsLead,(n.newsSections||[]).map(v=>`${v.title||''} ${v.body||''}`).join(' ')].join(' ').toLowerCase().includes(q)));
 indexed.sort((a,b)=>(s.sort==='new'?1:-1)*(manageListDate(b.n.date)-manageListDate(a.n.date)||a.i-b.i));
 const total=indexed.length,pages=Math.max(1,Math.ceil(total/s.size));s.page=Math.min(Math.max(1,s.page),pages);
 const offset=(s.page-1)*s.size;
 list.innerHTML=indexed.slice(offset,offset+s.size).map(({n,i})=>{
  const preview=managePreviewText([n.newsLead,n.newsSections?.map(x=>`${x.title||''}\n${x.body||''}`).join('\n\n'),n.body].filter(Boolean).join('\n\n'));
  return `<article class="manage-entry" data-managed-index="${i}"><div class="manage-entry-main"><div class="manage-entry-body"><div class="manage-entry-title">${esc(n.title||'未命名公告')}</div><div class="manage-entry-info"><span class="manage-tag">${esc(newsTagShort(n.tag)||'未分類')}</span><span>${esc(n.date||'未設定日期')}</span></div></div><div class="manage-entry-actions"><button type="button" class="manage-preview-toggle" aria-expanded="false" onclick="toggleManagedPreview('news',${i})">預覽</button><button type="button" class="manage-edit" onclick="editNews(${i})">編輯</button><button type="button" class="manage-delete" onclick="removeNews(${i})">刪除</button></div></div><div class="manage-entry-preview" hidden>${esc(preview||'沒有可預覽的公告內容')}</div></article>`;
 }).join('')||'<div class="manage-empty">沒有符合條件的公告</div>';
 $('#manageNewsCount').textContent=`符合 ${total} 篇／總共 ${news.length} 篇公告`;
 managePagination($('#manageNewsPagination'),s,total,pages,renderManagedNews);
}
function renderManagedEvents(){
 const list=$('#eventsAdmin');if(!list)return;
 const s=manageEventState,q=s.query.trim().toLowerCase();
 manageFilterButtons($('#manageEventFilters'),manageEventOptions,s,renderManagedEvents);
 const sorted=sortEventsByStart(events).map((e,i)=>({e,i}));
 const indexed=sorted.filter(({e})=>
  (s.filter==='全部'||manageEventStatus(e)===s.filter)&&
  (!q||[e.name,e.start,e.end,e.desc,e.detail,(e.sectionBlocks||[]).map(x=>`${x.title||''} ${x.body||''}`).join(' ')].join(' ').toLowerCase().includes(q)));
 if(s.sort==='old')indexed.reverse();
 const total=indexed.length,pages=Math.max(1,Math.ceil(total/s.size));s.page=Math.min(Math.max(1,s.page),pages);
 const offset=(s.page-1)*s.size;
 list.innerHTML=indexed.slice(offset,offset+s.size).map(({e,i})=>{
  const status=manageEventStatus(e),cls=status==='進行中'?'status-active':status==='已結束'?'status-done':status==='未公開'?'status-hidden':'';
  const cover=e.image||(Array.isArray(e.images)?e.images[0]:'');
  const preview=managePreviewText([e.desc,e.sectionBlocks?.map(x=>`${x.title||''}\n${x.body||''}`).join('\n\n'),e.detail].filter(Boolean).join('\n\n'));
  return `<article class="manage-entry" data-managed-index="${i}"><div class="manage-entry-main">${cover?`<img class="manage-thumb" src="${esc(cover)}" alt="" loading="lazy" onerror="this.hidden=true">`:''}<div class="manage-entry-body"><div class="manage-entry-title">${esc(e.name||'未命名活動')}</div><div class="manage-entry-info"><span class="manage-tag ${cls}">${esc(status)}</span><span>${esc(formatEventDateRange(e))}</span><span>${e.published===false?'未公開':'公開'}</span></div></div><div class="manage-entry-actions"><button type="button" class="manage-preview-toggle" aria-expanded="false" onclick="toggleManagedPreview('events',${i})">預覽</button><button type="button" class="manage-edit" onclick="editEvent(${i})">編輯</button><button type="button" class="manage-delete" onclick="removeEvent(${i})">刪除</button></div></div><div class="manage-entry-preview" hidden>${esc(preview||'沒有可預覽的活動內容')}</div></article>`;
 }).join('')||'<div class="manage-empty">沒有符合條件的檔期活動</div>';
 $('#manageEventCount').textContent=`符合 ${total} 筆／總共 ${events.length} 筆活動`;
 managePagination($('#manageEventPagination'),s,total,pages,renderManagedEvents);
}
function focusManagedForm(id){const details=document.getElementById(id);if(!details)return;details.open=true;requestAnimationFrame(()=>details.scrollIntoView({behavior:'smooth',block:'start'}));}
window.toggleManagedPreview=toggleManagedPreview;
function render(){
 $('#newsCount').textContent=news.length;$('#eventCount').textContent=events.filter(e=>e.published!==false).length;$('#itemCount').textContent=items.length;
 $('#bossSlidesAdmin')?.setAttribute('data-count',String(bossConfig.slides.length));
 renderManagedNews();
 const orderedReviews=[...reviews].sort((a,b)=>{if(Boolean(b.featured)!==Boolean(a.featured))return b.featured?1:-1;return (Number(a.order)||0)-(Number(b.order)||0)||(Number(a.createdAt)||0)-(Number(b.createdAt)||0)});
 $('#reviewsAdmin').innerHTML=orderedReviews.map((r,i)=>`<div class="item review-admin-item" draggable="true" data-review-index="${i}"><span class="drag">☰</span><div><b>${r.featured?'★ 精選　':''}${'★'.repeat(Math.max(1,Math.min(5,Number(r.rating)||5)))}</b><small>${esc(r.author||'玩家心得')}</small><small>${esc(r.text||'')}</small></div><div><button onclick="editReview('${r.id}')">編輯</button> <button class="ghost" onclick="toggleFeaturedReview('${r.id}')">${r.featured?'取消精選':'設為精選'}</button> <button class="danger" onclick="removeReviewById('${r.id}')">刪除</button></div></div>`).join('')||'<div class="note">目前沒有玩家心得。</div>';
 setupReviewDrag(orderedReviews);
 renderManagedEvents();
 $('#linksForm').innerHTML=Object.entries(defaultLinks).map(([k,v])=>`<label>${esc(k)}<input value="${esc(v)}" data-key="${esc(k)}"></label>`).join('')+'<button class="save" onclick="saveLinks()">儲存網址</button>';
 $('#siteName').value=settings.name;$('#siteSubtitle').value=settings.subtitle;$('#navHome').value=settings.nav.home;$('#navWhy').value=settings.nav.why;$('#navFeatures').value=settings.nav.features;$('#navEvents').value=settings.nav.events;$('#navBoss').value=settings.nav.boss;$('#navNews').value=settings.nav.news;$('#navGuide').value=settings.nav.guide;$('#navDownloads').value=settings.nav.downloads||'下載專區';if($('#navPlayerTools'))$('#navPlayerTools').value=settings.nav.playerTools||'玩家工具';renderNavOrder();$('#footerDescription').value=settings.footer.description;$('#footerNavTitle').value=settings.footer.navTitle;$('#footerResourceTitle').value=settings.footer.resourceTitle;$('#footerCopyright').value=settings.footer.copyright;
renderLayout();renderItems();renderContentEditor();renderResources();renderDownloads();renderBossSlides();
}
function renderBossSlides(){
  const box=$('#bossSlidesAdmin');
  if(!box)return;
  $('#bossInterval').value=String(Math.round(bossConfig.interval/1000));
  box.innerHTML=bossConfig.slides.map((slide,i)=>`<div class="hero-slide-admin" draggable="true" data-boss-index="${i}"><span class="drag">☰</span><div class="hero-slide-fields"><label>圖片網址<input data-boss-field="image" value="${esc(slide.image||'')}" placeholder="上傳圖片後會自動填入"></label><label>標題<input data-boss-field="title" value="${esc(slide.title||'')}" placeholder="例如：燦爛的凶星"></label><label>點擊連結<input data-boss-field="link" value="${esc(slide.link||'')}" placeholder="可留空，例如：boss.html"></label></div><label class="hero-enabled"><input type="checkbox" data-boss-field="enabled" ${slide.enabled!==false?'checked':''}> 顯示</label><button class="danger" type="button" onclick="removeBossSlide(${i})">刪除</button></div>`).join('')||'<div class="note">目前沒有 BOSS 輪播圖片。</div>';
  box.querySelectorAll('.hero-slide-admin').forEach(row=>{
    row.addEventListener('dragstart',()=>{row.classList.add('dragging');bossConfig._dragFrom=Number(row.dataset.bossIndex)});
    row.addEventListener('dragend',()=>row.classList.remove('dragging'));
    row.addEventListener('dragover',e=>e.preventDefault());
    row.addEventListener('drop',e=>{e.preventDefault();const from=bossConfig._dragFrom,to=Number(row.dataset.bossIndex);if(Number.isInteger(from)&&from!==to){const m=bossConfig.slides.splice(from,1)[0];bossConfig.slides.splice(to,0,m);renderBossSlides();}});
  });
}
window.removeBossSlide=i=>{bossConfig.slides.splice(i,1);renderBossSlides()};
async function saveBossesToServer(){
  const API_BASE=window.location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
  const token=sessionStorage.getItem('duoduo_admin_session')||'';
  if(!token)throw new Error('未登入');
  const slides=[];
  for(let i=0;i<bossConfig.slides.length;i++){
    const slide=bossConfig.slides[i];
    let image=String(slide.image||'').trim();
    if(slide._pendingDataUrl){
      image=await uploadImageDataURL(slide._pendingDataUrl,slide._pendingName||`boss-${i+1}`);
    }
    if(!image)continue;
    slides.push({image,title:String(slide.title||`BOSS ${i+1}`).trim(),link:String(slide.link||'').trim(),enabled:slide.enabled!==false});
  }
  const interval=Math.max(2000,(Number($('#bossInterval').value)||5)*1000);
  const res=await fetch(`${API_BASE}/api/bosses`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({bosses:slides,interval})});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||!data.ok){if(res.status===401)throw new Error('登入已失效');throw new Error(data.error||'BOSS 儲存失敗');}
  bossConfig={interval,slides};
  save('duoduo_boss_config',bossConfig);
}
$('#bossImagesFiles').onchange=async e=>{
  const files=[...(e.target.files||[])];
  if(!files.length)return;
  try{
    for(const file of files){
      const dataUrl=await fileToCompressedDataURL(file);
      bossConfig.slides.push({image:'',title:file.name.replace(/\.[^.]+$/,''),link:'',enabled:true,_pendingDataUrl:dataUrl,_pendingName:file.name});
    }
    e.target.value='';
    renderBossSlides();
  }catch{alert('BOSS 圖片讀取失敗，請重新選擇。');e.target.value='';}
};
$('#saveBosses').onclick=async()=>{
  try{
    document.querySelectorAll('[data-boss-index]').forEach(row=>{const i=Number(row.dataset.bossIndex),slide=bossConfig.slides[i];if(!slide)return;row.querySelectorAll('[data-boss-field]').forEach(el=>{const f=el.dataset.bossField;slide[f]=f==='enabled'?el.checked:el.value.trim()});});
    await saveBossesToServer();
    renderBossSlides();
    alert('BOSS 輪播已儲存，並同步到官網。');
  }catch(error){console.error(error);alert(error.message==='登入已失效'?'登入已失效，請重新登入後再試一次。':'BOSS 輪播儲存失敗，請稍後再試。');}
};
$('#resetBosses').onclick=()=>{if(confirm('恢復預設 BOSS 輪播？')){bossConfig=structuredClone(defaultBossConfig);save('duoduo_boss_config',bossConfig);renderBossSlides();}};
async function loadCloudBosses(){
  const API_BASE=window.location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
  try{
    const res=await fetch(`${API_BASE}/api/bosses`,{headers:{Accept:'application/json'},cache:'no-store'});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const data=await res.json();
    if(Array.isArray(data.bosses)&&data.bosses.length){bossConfig={interval:Math.max(2000,Number(data.interval)||5000),slides:data.bosses};save('duoduo_boss_config',bossConfig);renderBossSlides();}
  }catch(error){console.warn('雲端 BOSS 設定讀取失敗，使用本機設定。',error);}
}

function renderLayout(){$('#layoutList').innerHTML=layout.sections.map((s,i)=>`<div class="layout-row" draggable="true" data-index="${i}"><span class="drag">☰</span><div class="layout-copy"><b>${esc(s.name)}</b><small>${esc(s.desc)}</small></div><button class="visibility ${s.visible?'on':''}" onclick="toggleSection(${i})">${s.visible?'👁':'◌'}</button></div>`).join('');$('#heroEyebrow').value=layout.heroEyebrow;$('#heroTitle').value=layout.heroTitle;$('#heroSubtitle').value=layout.heroSubtitle;$('#aboutTitle').value=layout.aboutTitle;$('#featureColumns').value=String(layout.featureColumns);$('#heroInterval').value=String(Math.round(hero.interval/1000));renderHeroSlides();setupDrag()}
function renderHeroSlides(){const box=$('#heroSlidesAdmin');if(!box)return;box.innerHTML=hero.slides.map((slide,i)=>`<div class="hero-slide-admin" draggable="true" data-hero-index="${i}"><span class="drag">☰</span><div class="hero-slide-fields"><label>圖片<input data-hero-field="image" value="${esc(slide.image||'')}" placeholder="assets/ad3.png 或圖片網址"></label><label>瀏覽檔案<input data-hero-file="${i}" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><small class="field-note">選擇圖片後會先預覽，按「儲存版面」才會正式上傳。</small></label><label>標題<input data-hero-field="title" value="${esc(slide.title||'')}" placeholder="例如：生日活動"></label><label>點擊連結<input data-hero-field="link" value="${esc(slide.link||'')}" placeholder="可留空"></label></div><div class="hero-slide-preview">${(slide._pendingDataUrl||slide.image)?`<img src="${esc(slide._pendingDataUrl||slide.image)}" alt="">`:'<span>尚未選擇圖片</span>'}</div><label class="hero-enabled"><input type="checkbox" data-hero-field="enabled" ${slide.enabled!==false?'checked':''}> 顯示</label><button class="danger" type="button" onclick="removeHeroSlide(${i})">刪除</button></div>`).join('')||'<div class="note">目前沒有輪播圖片。</div>';box.querySelectorAll('.hero-slide-admin').forEach(row=>{row.addEventListener('dragstart',()=>{row.classList.add('dragging');hero._dragFrom=Number(row.dataset.heroIndex)});row.addEventListener('dragend',()=>row.classList.remove('dragging'));row.addEventListener('dragover',e=>e.preventDefault());row.addEventListener('drop',e=>{e.preventDefault();const from=hero._dragFrom,to=Number(row.dataset.heroIndex);if(Number.isInteger(from)&&from!==to){const m=hero.slides.splice(from,1)[0];hero.slides.splice(to,1);hero.slides.splice(to,0,m);renderHeroSlides()}})});box.querySelectorAll('[data-hero-file]').forEach(input=>{input.addEventListener('change',async e=>{const i=Number(input.dataset.heroFile),file=input.files?.[0],slide=hero.slides[i];if(!file||!slide)return;try{slide._pendingDataUrl=await fileToCompressedDataURL(file);slide._pendingName=file.name;slide.image='';renderHeroSlides()}catch{alert('圖片讀取失敗，請重新選擇。');input.value='';}})})}
window.removeHeroSlide=i=>{hero.slides.splice(i,1);renderHeroSlides()};$('#addHeroSlide').onclick=()=>{hero.slides.push({image:'',title:'新的輪播圖片',link:'',enabled:true});renderHeroSlides()};
window.toggleSection=i=>{layout.sections[i].visible=!layout.sections[i].visible;renderLayout()};
function setupDrag(){let from=null;document.querySelectorAll('.layout-row').forEach(r=>{r.addEventListener('dragstart',()=>{from=+r.dataset.index;r.classList.add('dragging')});r.addEventListener('dragend',()=>r.classList.remove('dragging'));r.addEventListener('dragover',e=>e.preventDefault());r.addEventListener('drop',e=>{e.preventDefault();const to=+r.dataset.index;if(from===null||from===to)return;const m=layout.sections.splice(from,1)[0];layout.sections.splice(to,0,m);renderLayout()})})}
$('#saveLayout').onclick=async()=>{
  layout.heroEyebrow=$('#heroEyebrow').value.trim()||defaultLayout.heroEyebrow;
  layout.heroTitle=$('#heroTitle').value.trim()||defaultLayout.heroTitle;
  layout.heroSubtitle=$('#heroSubtitle').value.trim()||defaultLayout.heroSubtitle;
  layout.aboutTitle=$('#aboutTitle').value.trim()||defaultLayout.aboutTitle;
  layout.featureColumns=+$('#featureColumns').value||3;
  document.querySelectorAll('[data-hero-index]').forEach(row=>{
    const i=Number(row.dataset.heroIndex),slide=hero.slides[i];
    if(!slide)return;
    row.querySelectorAll('[data-hero-field]').forEach(el=>{
      const f=el.dataset.heroField;
      slide[f]=f==='enabled'?el.checked:el.value.trim();
    });
  });
  const saveBtn=$('#saveLayout');
  const oldText=saveBtn?.textContent||'';
  try{
    if(saveBtn){saveBtn.disabled=true;saveBtn.textContent='圖片上傳中…';}
    for(let i=0;i<hero.slides.length;i++){
      const slide=hero.slides[i];
      if(!slide?._pendingDataUrl)continue;
      slide.image=await uploadImageDataURL(slide._pendingDataUrl,slide._pendingName||`hero-${i+1}`);
      delete slide._pendingDataUrl;
      delete slide._pendingName;
    }
    hero.slides=hero.slides.filter(x=>x.image);
    hero.images=hero.slides.filter(x=>x.enabled!==false).map(x=>x.image);
    hero.interval=Math.max(2000,(Number($('#heroInterval').value)||5)*1000);
    save('duoduo_layout',layout);
    save('duoduo_hero',hero);
    renderHeroSlides();
    alert('首頁版面與主視覺輪播已儲存。');
  }catch(error){
    console.error(error);
    alert(error.message==='登入已失效'?'登入已失效，請重新登入後再試一次。':'圖片上傳失敗，請確認登入狀態與圖片後再試一次。');
  }finally{
    if(saveBtn){saveBtn.disabled=false;saveBtn.textContent=oldText||'儲存首頁版面';}
  }
};
$('#resetLayout').onclick=()=>{if(confirm('恢復預設首頁版面？')){layout=structuredClone(defaultLayout);save('duoduo_layout',layout);renderLayout()}};
$('#addReview').onclick=()=>{const text=$('#reviewText').value.trim();if(!text)return alert('請先貼上玩家心得內容');const data={rating:Number($('#reviewRating').value)||5,author:$('#reviewAuthor').value.trim()||'玩家心得',text,featured:$('#reviewFeatured')?.checked===true};const isEdit=!!editingReviewId;if(isEdit){const target=reviews.find(r=>r.id===editingReviewId);if(target)Object.assign(target,data);editingReviewId=null;$('#addReview').textContent='＋ 新增玩家心得'}else{reviews.push({id:'r_'+Date.now(),...data,createdAt:Date.now(),order:reviews.length})}save('duoduo_reviews',reviews);$('#reviewAuthor').value='';$('#reviewText').value='';$('#reviewRating').value='5';if($('#reviewFeatured'))$('#reviewFeatured').checked=false;render();alert(isEdit?'玩家心得已更新。':'玩家心得已新增。')};
window.editReview=id=>{const r=reviews.find(x=>x.id===id);if(!r)return;editingReviewId=id;$('#reviewAuthor').value=r.author||'';$('#reviewRating').value=String(r.rating||5);$('#reviewText').value=r.text||'';if($('#reviewFeatured'))$('#reviewFeatured').checked=r.featured===true;$('#addReview').textContent='儲存玩家心得修改';document.querySelector('[data-panel="reviews"]')?.click();window.scrollTo({top:0,behavior:'smooth'})};
window.toggleFeaturedReview=id=>{const r=reviews.find(x=>x.id===id);if(!r)return;r.featured=!r.featured;save('duoduo_reviews',reviews);render()};window.removeReviewById=id=>{if(!confirm('確定刪除這則玩家心得？'))return;reviews=reviews.filter(r=>r.id!==id);save('duoduo_reviews',reviews);render()};function setupReviewDrag(ordered){document.querySelectorAll('.review-admin-item').forEach(row=>{row.addEventListener('dragstart',()=>{row.classList.add('dragging');row._from=Number(row.dataset.reviewIndex)});row.addEventListener('dragend',()=>row.classList.remove('dragging'));row.addEventListener('dragover',e=>e.preventDefault());row.addEventListener('drop',e=>{e.preventDefault();const from=row._from,to=Number(row.dataset.reviewIndex);if(from===to)return;const reordered=[...ordered];const moved=reordered.splice(from,1)[0];reordered.splice(to,0,moved);reordered.forEach((r,i)=>r.order=i);reviews.forEach(r=>{const x=reordered.find(v=>v.id===r.id);if(x)r.order=x.order});save('duoduo_reviews',reviews);render()})})}

// 最新消息：自訂段落（保留既有公告 body 資料結構）。
const NEWS_SECTION_TYPES=[
 ['intro','公告說明','book-open'],['updates','更新內容','file-text'],['maintenance','維護時間','clock'],
 ['time','公告時程','calendar-clock'],['method','參加方式','list-checks'],['rules','規則說明','scroll-text'],
 ['steps','操作步驟','list-ordered'],['compensation','補償內容','gift'],['rewards','獎勵內容','gift'],
 ['warning','注意事項','info'],['reminder','重要提醒','bell'],['deadline','截止時間','clock-alert'],
 ['details','補充說明','file-text'],['links','相關連結','link'],
 // 遊戲版本更新公告專用段落，可直接選擇名稱及預設線條圖示。
 ['new_features','新增內容','file-text'],['system_changes','系統調整','settings'],
 ['shop_updates','商城更新','shopping-cart'],['bug_fixes','已修正問題','check-circle'],
 ['features_optimized','功能優化','list-checks'],['balance_changes','平衡調整','shield-check'],
 ['skill_changes','技能調整','swords'],['update_reminders','更新提醒','info'],
 ['custom','自訂標題','file-text']
];
let editingNewsIndex=null,newsSectionDraft=[];
const newsEl=id=>document.getElementById(id);
function newsNewBlock(){return {type:'intro',title:'公告說明',icon:'book-open',body:''};}
function normalizeNewsBlocks(n){
 if(!Array.isArray(n?.newsSections))return [];
 return n.newsSections.filter(x=>x&&typeof x==='object').map(x=>{
  const preset=NEWS_SECTION_TYPES.find(t=>t[0]===x.type);
  const type=preset?x.type:'custom';
  return {type,title:String(x.title||preset?.[1]||''),icon:duoduoEventIconId(x.icon||preset?.[2]||'file-text'),body:String(x.body||'')};
 });
}
function newsSerialMode(){newsEl('newsSerialEditor').hidden=newsEl('newsTag').value!=='序號發放';}
function newsIconChooser(item,container){
 const header=document.createElement('div');header.className='event-section-icon-header';
 const label=document.createElement('span');label.textContent='標題圖示（點選線條圖示）';
 const current=document.createElement('span');current.className='event-section-icon-selected';
 const toggle=document.createElement('button');toggle.type='button';toggle.className='event-section-icon-toggle';toggle.textContent='更換圖示';
 header.append(label,current,toggle);container.append(header);
 const tools=document.createElement('div');tools.className='event-section-icon-tools';tools.hidden=true;
 const search=document.createElement('input');search.type='search';search.className='event-section-icon-search';search.placeholder='搜尋圖示，例如：禮物、維護、時鐘';
 const categories=document.createElement('div');categories.className='event-section-icon-categories';
 const count=document.createElement('span');count.className='event-section-icon-count';
 const preview=document.createElement('div');preview.className='event-section-icon-live-preview';
 let chosenCategory='全部';
 const catButtons=EVENT_SECTION_ICON_CATEGORIES.map(c=>{
  const b=document.createElement('button');b.type='button';b.className='event-section-icon-category';b.textContent=c;
  b.onclick=()=>{chosenCategory=c;refresh();};categories.appendChild(b);return [c,b];
 });
 tools.append(search,categories,count,preview);
 const gallery=document.createElement('div');gallery.className='event-section-icon-gallery';gallery.hidden=true;
 const buttons=EVENT_SECTION_ICONS.map(([id,name,category])=>{
  const b=document.createElement('button');b.type='button';b.className='event-section-icon-option';b.title=name;b.setAttribute('aria-label',name);
  const sym=document.createElement('span');sym.className='event-section-svg-icon';sym.innerHTML=duoduoEventIconSvg(id);
  const text=document.createElement('span');text.className='event-section-icon-caption';text.textContent=name.split('／')[0];b.append(sym,text);
  b.onclick=()=>{item.icon=id;gallery.hidden=tools.hidden=true;toggle.textContent='更換圖示';update();};
  gallery.append(b);return [id,name,category,b];
 });
 function refresh(){
  const q=search.value.trim().toLowerCase();let visible=0;
  buttons.forEach(([id,name,category,b])=>{
   const inCategory=chosenCategory==='全部'||category===chosenCategory||(chosenCategory==='時間與通知'&&id==='clock');
   b.hidden=!(inCategory&&(!q||`${id} ${name} ${category}`.toLowerCase().includes(q)));
   if(!b.hidden)visible++;
  });
  catButtons.forEach(([key,b])=>b.classList.toggle('is-active',key===chosenCategory));
  count.textContent=`顯示 ${visible}／${buttons.length} 款圖示`;
 }
 function update(){
  current.innerHTML=duoduoEventIconSvg(item.icon);
  const found=EVENT_SECTION_ICONS.find(t=>t[0]===item.icon);
  current.append(document.createTextNode(' '+(found?.[1]||'文件')));
  preview.innerHTML=duoduoEventIconSvg(item.icon);
  const text=document.createElement('span');text.textContent=`前台效果預覽：${item.title||'公告段落'}`;preview.append(text);
  buttons.forEach(([id,name,c,b])=>b.classList.toggle('is-selected',id===item.icon));
 }
 toggle.onclick=()=>{const show=gallery.hidden;gallery.hidden=!show;tools.hidden=!show;toggle.textContent=show?'收起圖示':'更換圖示';if(show)refresh();};
 search.addEventListener('input',refresh);
 container.append(tools,gallery);update();refresh();
 return update;
}
function renderNewsEditor(){
 const list=newsEl('newsSectionList');if(!list)return;list.replaceChildren();
 if(!newsSectionDraft.length){const empty=document.createElement('div');empty.className='event-section-empty';empty.textContent='尚無分段內容。點選「＋ 新增段落」後，可自選標題、圖示與文字。';list.append(empty);return;}
 newsSectionDraft.forEach((item,index)=>{
  const panel=document.createElement('div');panel.className='event-section-row';
  const head=document.createElement('div');head.className='event-section-row-head';
  const name=document.createElement('strong');name.className='event-section-row-name';name.textContent=`段落 ${index+1}`;
  const actions=document.createElement('div');actions.className='event-section-actions';
  [[-1,'↑ 上移'],[1,'↓ 下移']].forEach(([d,t])=>{
   const b=document.createElement('button');b.type='button';b.textContent=t;b.disabled=index+d<0||index+d>=newsSectionDraft.length;
   b.onclick=()=>{const j=index+d;[newsSectionDraft[index],newsSectionDraft[j]]=[newsSectionDraft[j],newsSectionDraft[index]];renderNewsEditor();};actions.append(b);
  });
  const del=document.createElement('button');del.type='button';del.className='event-section-delete';del.textContent='刪除';del.onclick=()=>{newsSectionDraft.splice(index,1);renderNewsEditor();};actions.append(del);
  head.append(name,actions);panel.append(head);
  const fields=document.createElement('div');fields.className='event-section-row-fields';
  const makeLabel=(text,control,cls)=>{const l=document.createElement('label');l.textContent=text;if(cls)l.className=cls;l.append(control);fields.append(l);return l;};
  const type=document.createElement('select');NEWS_SECTION_TYPES.forEach(([id,label])=>{const option=document.createElement('option');option.value=id;option.textContent=label;type.append(option);});type.value=item.type;
  makeLabel('段落類別',type);
  const iconField=document.createElement('div');iconField.className='event-section-icon-field event-section-full';
  const refreshIcon=newsIconChooser(item,iconField);fields.append(iconField);
  const custom=document.createElement('input');custom.type='text';custom.maxLength=60;custom.value=item.title;custom.placeholder='輸入自己的標題，例如：伺服器補償安排';
  const titleLabel=makeLabel('自訂段落標題',custom,'event-section-custom-title');
  titleLabel.hidden=item.type!=='custom';
  const body=document.createElement('textarea');body.rows=5;body.value=item.body;body.placeholder='輸入這個段落的公告內容，可使用換行與清單';
  makeLabel('段落內容',body,'event-section-full');
  type.addEventListener('change',()=>{
   item.type=type.value;const def=NEWS_SECTION_TYPES.find(t=>t[0]===item.type);
   if(item.type==='custom'){item.title='';item.icon='file-text';}else{item.title=def[1];item.icon=def[2];}
   custom.value=item.title;titleLabel.hidden=item.type!=='custom';refreshIcon();
  });
  custom.addEventListener('input',()=>{item.title=custom.value;refreshIcon();});
  body.addEventListener('input',()=>{item.body=body.value;});
  panel.append(fields);list.append(panel);
 });
}
function addNewsSection(){newsSectionDraft.push(newsNewBlock());renderNewsEditor();newsEl('newsSectionList').querySelector('.event-section-row:last-child textarea')?.focus();}
newsEl('newsAddSection').onclick=addNewsSection;
newsEl('newsAddSectionBottom').onclick=addNewsSection;
newsEl('newsTag').addEventListener('change',newsSerialMode);
function readNewsSerial(){return {
 code:newsEl('newsSerialCode').value.trim(),expiry:newsEl('newsSerialExpiry').value.trim(),
 method:newsEl('newsSerialMethod').value.trim(),rewards:newsEl('newsSerialRewards').value.trim(),notes:newsEl('newsSerialNotes').value.trim()
};}
function showNewsSerial(obj){const s=obj||{};for(const [id,key] of [['newsSerialCode','code'],['newsSerialExpiry','expiry'],['newsSerialMethod','method'],['newsSerialRewards','rewards'],['newsSerialNotes','notes']])newsEl(id).value=String(s[key]||'');}
function newsResetEditor(){
 editingNewsIndex=null;
 newsEl('newsTag').value='重要消息';newsEl('newsTitle').value='';newsEl('newsDate').value='';
 newsEl('newsLead').value='';newsEl('newsBody').value='';newsEl('newsIncludeLegacy').checked=false;
 newsEl('newsLegacyEditor').open=false;newsSectionDraft=[];showNewsSerial(null);renderNewsEditor();newsSerialMode();
 newsEl('addNews').textContent='＋ 新增公告';
}
newsEl('cancelEditNews').onclick=()=>{newsResetEditor();};
newsEl('addNews').onclick=()=>{
 const title=newsEl('newsTitle').value.trim();if(!title)return alert('請先輸入公告標題');
 const items=newsSectionDraft.map(x=>({type:x.type,title:(x.type==='custom'?x.title:NEWS_SECTION_TYPES.find(t=>t[0]===x.type)?.[1]||x.title).trim(),icon:duoduoEventIconId(x.icon),body:String(x.body||'').trim()})).filter(x=>x.title&&x.body);
 const tag=newsEl('newsTag').value;
 const data={tag,title,date:newsEl('newsDate').value.trim()||new Date().toLocaleDateString('zh-TW'),body:newsEl('newsBody').value.trim(),
 newsLead:newsEl('newsLead').value.trim(),newsSections:items,newsIncludeLegacy:newsEl('newsIncludeLegacy').checked,newsSerial:readNewsSerial()};
 if(editingNewsIndex!==null&&news[editingNewsIndex]){news[editingNewsIndex]=Object.assign({},news[editingNewsIndex],data);alert('公告已更新（目前瀏覽器）。');}
 else{news.unshift(data);alert('公告已新增（目前瀏覽器）。');}
 save('duoduo_news',news);newsResetEditor();render();
};
window.editNews=i=>{
 const n=news[i];if(!n)return;editingNewsIndex=i;
 newsEl('newsTag').value=n.tag||'重要消息';newsEl('newsTitle').value=n.title||'';newsEl('newsDate').value=n.date||'';
 newsEl('newsBody').value=n.body||'';newsEl('newsLead').value=n.newsLead||'';
 newsEl('newsIncludeLegacy').checked=Boolean(n.newsIncludeLegacy);
 newsSectionDraft=normalizeNewsBlocks(n);showNewsSerial(n.newsSerial);renderNewsEditor();newsSerialMode();
 newsEl('addNews').textContent='儲存公告修改';
 document.querySelector('[data-panel="news"]')?.click();focusManagedForm('newsManageForm');
};
window.removeNews=i=>{if(confirm('確定刪除這則公告？')){
 news.splice(i,1);if(editingNewsIndex===i)newsResetEditor();
 save('duoduo_news',news);render();
}};
renderNewsEditor();newsSerialMode();
async function fileToCompressedDataURL(file,maxW=1800,maxH=1200,quality=.86){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,maxW/img.naturalWidth,maxH/img.naturalHeight);const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/webp',quality));};img.onerror=reject;img.src=reader.result;};reader.onerror=reject;reader.readAsDataURL(file)});}async function uploadImageDataURL(dataUrl,originalName){
  const API_BASE=window.location.hostname.endsWith('github.io')
  ? 'https://duoduo-website.onrender.com'
  : '';

const token=sessionStorage.getItem('duoduo_admin_session')||'';
const res=await fetch(`${API_BASE}/api/upload-image`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({dataUrl,filename:originalName||'event-image'})});
  if(!res.ok) throw new Error('upload_failed');
  const data=await res.json();
  if(!data.ok||!data.path) throw new Error('upload_failed');
  return data.path;
}
async function syncEventsToServer(){
  const API_BASE=window.location.hostname.endsWith('github.io')
    ? 'https://duoduo-website.onrender.com'
    : '';

  const token=sessionStorage.getItem('duoduo_admin_session')||'';

  if(!token){
    throw new Error('未登入');
  }

  const res=await fetch(`${API_BASE}/api/events`,{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${token}`
    },
    body:JSON.stringify({
      events
    })
  });

  const data=await res.json().catch(()=>({}));

  if(!res.ok||!data.ok){
    if(res.status===401){
      try{sessionStorage.removeItem('duoduo_admin_session')}catch{}
      throw new Error('登入已失效');
    }

    throw new Error(data.error||'活動同步失敗');
  }

  return true;
}
function renderEventUploadPreviews(){const cover=$('#eventImagePreview');if(cover)cover.innerHTML=pendingEventCoverImage?`<img src="${pendingEventCoverImage}" alt="">`:'<span>尚未選擇新圖片</span>';const box=$('#eventImagesPreview');if(box)box.innerHTML=pendingEventCarouselImages.length?pendingEventCarouselImages.map((src,i)=>`<div><img src="${src}" alt="輪播圖片 ${i+1}"><small>第 ${i+1} 張</small></div>`).join(''):'<span>尚未選擇新輪播圖片</span>';}
$('#eventImageFile').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{pendingEventCoverImage=await fileToCompressedDataURL(f);renderEventUploadPreviews();}catch{alert('圖片讀取失敗，請重新選擇。');e.target.value='';}};
$('#eventImagesFiles').onchange=async e=>{const files=[...(e.target.files||[])];if(!files.length)return;try{pendingEventCarouselImages=await Promise.all(files.map(f=>fileToCompressedDataURL(f)));renderEventUploadPreviews();}catch{alert('輪播圖片讀取失敗，請重新選擇。');e.target.value='';}};

/* Event detail block editor: order, category, icon and text are persisted as sectionBlocks. */
/* Inline outline-SVG icon library: no CDN and no Emoji renderer. */
const DUODUO_EVENT_ICON_PATHS={"book-open":"<path d=\"M12 7v14\"/><path d=\"M3 18V5a2 2 0 0 1 2-2h3a4 4 0 0 1 4 4 4 4 0 0 1 4-4h3a2 2 0 0 1 2 2v13h-5a4 4 0 0 0-4 3 4 4 0 0 0-4-3z\"/>","list-checks":"<path d=\"m3 5 2 2 4-4\"/><path d=\"M12 6h9\"/><path d=\"m3 12 2 2 4-4\"/><path d=\"M12 13h9\"/><path d=\"m3 19 2 2 4-4\"/><path d=\"M12 20h9\"/>","scroll-text":"<path d=\"M8 21h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H6\"/><path d=\"M4 17h13a2 2 0 0 1 2 2v2H6a3 3 0 0 1-3-3V6a3 3 0 0 1 6 0v1H5\"/><path d=\"M11 9h7M11 13h7\"/>","gift":"<rect x=\"3\" y=\"8\" width=\"18\" height=\"4\" rx=\"1\"/><path d=\"M5 12v9h14v-9M12 8v13\"/><path d=\"M12 8H8a2 2 0 0 1 0-4c3 0 4 4 4 4zM12 8h4a2 2 0 0 0 0-4c-3 0-4 4-4 4z\"/>","info":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4M12 8h.01\"/>","file-text":"<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/><path d=\"M14 2v6h6M8 13h8M8 17h8\"/>","send":"<path d=\"m22 2-7 20-4-9-9-4z\"/><path d=\"M22 2 11 13\"/>","target":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>","shopping-cart":"<circle cx=\"9\" cy=\"21\" r=\"1\"/><circle cx=\"20\" cy=\"21\" r=\"1\"/><path d=\"M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6\"/>","trophy":"<path d=\"M8 21h8M12 17v4\"/><path d=\"M7 4h10v8a5 5 0 0 1-10 0z\"/><path d=\"M7 6H4v3a4 4 0 0 0 4 4M17 6h3v3a4 4 0 0 1-4 4\"/>","calendar-days":"<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01\"/>","star":"<path d=\"m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z\"/>","sparkles":"<path d=\"m12 3 1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9zM5 2v4M3 4h4M19 17v4M17 19h4\"/>","skull":"<path d=\"M12 2a8 8 0 0 0-8 8c0 3 1 5 3 6v4h10v-4c2-1 3-3 3-6a8 8 0 0 0-8-8z\"/><path d=\"M9 21v1M12 21v1M15 21v1\"/><circle cx=\"9\" cy=\"11\" r=\"1\"/><circle cx=\"15\" cy=\"11\" r=\"1\"/><path d=\"m12 13-1 2h2z\"/>","swords":"<path d=\"m14.5 17.5 3-3L6 3H3v3l11.5 11.5zM13 19l2-2M16 16l3 3M2 22l6-6M9 9l11-6h2v2l-7 7\"/>","gem":"<path d=\"M6 3h12l4 6-10 13L2 9zM2 9h20M6 3l3 6 3 13 3-13 3-6\"/>","lightbulb":"<path d=\"M9 18h6M10 22h4M15 15.5A7 7 0 1 0 9 15.5c.7.5 1 1.2 1 2.5h4c0-1.3.3-2 1-2.5z\"/>","bell":"<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4\"/>","heart":"<path d=\"M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z\"/>","users":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/>","clipboard-list":"<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"/><path d=\"M9 4.5V3h6v1.5M9 11h.01M12 11h4M9 15h.01M12 15h4M9 19h.01M12 19h4\"/>","clock":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>","shield-alert":"<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/><path d=\"M12 8v5M12 17h.01\"/>","map-pin":"<path d=\"M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z\"/><circle cx=\"12\" cy=\"10\" r=\"2.5\"/>","coins":"<circle cx=\"8\" cy=\"8\" r=\"6\"/><path d=\"M8 5v6M6 6h3a1.5 1.5 0 0 1 0 3H6M16 7a6 6 0 1 1-9 9M16 14v5M14 15h3a1.5 1.5 0 0 1 0 3h-3\"/>","megaphone":"<path d=\"m3 11 18-5v12L3 13zM3 11v2M7 14l2 6h4l-2.3-7\"/>","ticket":"<path d=\"M2 9a2 2 0 0 0 0 6v3h20v-3a2 2 0 0 0 0-6V6H2zM13 6v2M13 11v2M13 16v2\"/>","flag":"<path d=\"M4 22V4m0 1c5-4 9 3 16-1v12c-7 4-11-3-16 1\"/>","check-circle":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m8 12 3 3 5-6\"/>","clipboard-check":"<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"/><path d=\"M9 4V2h6v2m-6 9 2.5 2.5L16 10\"/>","list-todo":"<path d=\"M3 5h.01M8 5h13M3 11h.01M8 11h13M3 17h.01M8 17h13\"/>","list-ordered":"<path d=\"M8 6h13M8 12h13M8 18h13M2 4h2v4M2 10h2l-2 4h2M2 16h2v4H2\"/>","route":"<circle cx=\"5\" cy=\"5\" r=\"2\"/><circle cx=\"19\" cy=\"19\" r=\"2\"/><path d=\"M5 7v5a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V9\"/>","map":"<path d=\"m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16M15 5v16\"/>","footprints":"<ellipse cx=\"7\" cy=\"14\" rx=\"3\" ry=\"5\" transform=\"rotate(-18 7 14)\"/><ellipse cx=\"17\" cy=\"10\" rx=\"3\" ry=\"5\" transform=\"rotate(18 17 10)\"/><path d=\"M3 6h.01M6 4h.01M17 19h.01M20 17h.01\"/>","compass":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m16 8-2 6-6 2 2-6z\"/>","search":"<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m16 16 5 5\"/>","filter":"<path d=\"M3 4h18l-7 8v7l-4 2v-9z\"/>","puzzle":"<path d=\"M5 3h5a2 2 0 1 0 4 0h5v6a2 2 0 1 1 0 4v6h-6a2 2 0 1 1-4 0H5v-6a2 2 0 1 0 0-4z\"/>","book-check":"<path d=\"M12 7V21M3 18V4c3-1 6-1 9 2 3-3 6-3 9-2v14c-3-1-6-1-9 3-3-4-6-4-9-3z\"/><path d=\"m15 11 2 2 3-4\"/>","pen-line":"<path d=\"m4 17-1 4 4-1L20 7l-3-3zM14 7l3 3M3 10v-6h7\"/>","check-check":"<path d=\"m2 12 4 4 7-8M10 12l4 4 8-9\"/>","bookmark":"<path d=\"M5 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v18l-7-5-7 5z\"/>","clipboard-pen":"<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"/><path d=\"M9 4V2h6v2m-6 11 6-6 2 2-6 6-3 1z\"/>","file-check":"<path d=\"M14 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9zM14 2v7h7m-13 7 3 3 5-6\"/>","list-filter":"<path d=\"M4 7h16M7 12h10M10 17h4\"/><path d=\"M3 4v6M21 4v6\"/>","package":"<path d=\"m3 7 9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10M7 5l9 4\"/>","package-open":"<path d=\"m3 9 9 4 9-4M12 13v8M3 13v5l9 3 9-3v-5M3 9l5-6 4 4 4-4 5 6-5 3-4-5-4 5z\"/>","medal":"<circle cx=\"12\" cy=\"16\" r=\"5\"/><path d=\"M8 12 5 3h5l2 5 2-5h5l-3 9m-4 1 1 2 2 .5-1.5 1.5.5 2-2-1-2 1 .5-2L9 15l2-.5z\"/>","award":"<circle cx=\"12\" cy=\"9\" r=\"6\"/><path d=\"m8 14-2 8 6-3 6 3-2-8M12 6l1 2 2 .4-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1L9 8.4l2-.4z\"/>","crown":"<path d=\"m2 7 5 5 5-7 5 7 5-5-2 12H4zM5 22h14\"/>","wallet":"<rect x=\"3\" y=\"6\" width=\"18\" height=\"15\" rx=\"2\"/><path d=\"M3 9V5a2 2 0 0 1 2-2h13M15 13h6v5h-6a2 2 0 0 1 0-5z\"/>","credit-card":"<rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\"/><path d=\"M2 10h20M6 15h4\"/>","key-round":"<circle cx=\"16\" cy=\"8\" r=\"5\"/><path d=\"m12 12-9 9 4-1 1-3 3-1 2-3\"/>","lock-keyhole":"<rect x=\"4\" y=\"10\" width=\"16\" height=\"12\" rx=\"2\"/><path d=\"M8 10V7a4 4 0 0 1 8 0v3M12 15v3\"/>","shopping-bag":"<path d=\"M4 8h16l-1 13H5zM9 9V6a3 3 0 0 1 6 0v3\"/>","box":"<rect x=\"3\" y=\"8\" width=\"18\" height=\"13\" rx=\"2\"/><path d=\"M3 12h18M10 12v4h4v-4M7 8V5h10v3\"/>","gift-card":"<rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\"/><path d=\"M2 10h20M12 10v9M12 10H9a2 2 0 0 1 0-4c2 0 3 4 3 4zM12 10h3a2 2 0 0 0 0-4c-2 0-3 4-3 4z\"/>","diamond":"<path d=\"M12 2 22 12 12 22 2 12z\"/><path d=\"M2 12h20M12 2l4 10-4 10-4-10z\"/>","coins-stack":"<ellipse cx=\"12\" cy=\"6\" rx=\"8\" ry=\"3\"/><path d=\"M4 6v5c0 2 3.5 3 8 3s8-1 8-3V6M4 11v5c0 2 3.5 3 8 3s8-1 8-3v-5M4 16v2c0 2 3.5 3 8 3s8-1 8-3v-2\"/>","piggy-bank":"<path d=\"M5 11a7 7 0 0 1 13-3l3-1v6l-3 1a7 7 0 0 1-2 3v3h-3v-2H9v2H6v-4a7 7 0 0 1-1-5zM8 6l-1-3 4 2M16 10h.01\"/>","percent":"<circle cx=\"6\" cy=\"6\" r=\"3\"/><circle cx=\"18\" cy=\"18\" r=\"3\"/><path d=\"M3 21 21 3\"/>","hand-coins":"<circle cx=\"17\" cy=\"6\" r=\"4\"/><path d=\"M15 6h4M4 16l5-2 5 2h4a2 2 0 0 1 0 4h-8l-6 2M2 13h3v9H2\"/>","scroll":"<path d=\"M8 20h11a3 3 0 0 0 3-3V5H7v12a3 3 0 0 1-3 3h4M7 4H5a3 3 0 0 0-3 3v2h5M11 10h7M11 14h7\"/>","flask-conical":"<path d=\"M9 2h6M10 2v7L4 20a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V2M7 16h10\"/>","shield-check":"<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/><path d=\"m9 12 2 2 4-4\"/>","dices":"<rect x=\"3\" y=\"3\" width=\"14\" height=\"14\" rx=\"2\"/><path d=\"M8 8h.01M12 12h.01M18 9h3v12H9v-3M13 18h.01M18 14h.01\"/>","chess-knight":"<path d=\"M7 21h13M9 18h9v3H7v-3l3-5-5-4 1-5 6-2 6 5v4l-3 7M9 7l2 1M5 9l4 1\"/>","party-popper":"<path d=\"m3 22 6-2-4-6-2 8zM5 14l7 7M13 3v3M21 4l-2 2M20 12h3M9 8l2-2M15 11l3-3\"/><path d=\"M8 2c5 0 9 4 9 8\"/>","users-round":"<circle cx=\"9\" cy=\"8\" r=\"4\"/><path d=\"M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2M17 5a3 3 0 0 1 0 6M18 14a4 4 0 0 1 4 4v3\"/>","user-round":"<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 22v-2a8 8 0 0 1 16 0v2\"/>","user-plus":"<circle cx=\"9\" cy=\"8\" r=\"4\"/><path d=\"M2 21v-2a7 7 0 0 1 11-6M18 14v8M14 18h8\"/>","message-circle":"<path d=\"M21 11a9 9 0 0 1-9 9c-2 0-4-.5-5-1l-5 2 2-5a9 9 0 1 1 17-5z\"/>","messages-square":"<rect x=\"3\" y=\"3\" width=\"15\" height=\"12\" rx=\"2\"/><path d=\"M7 15v5l4-5M18 8h2a2 2 0 0 1 2 2v9h-7l-3 3v-4\"/>","thumbs-up":"<path d=\"M3 10h4v12H3zM7 11l5-9a2 2 0 0 1 3 2l-1 4h5a3 3 0 0 1 3 4l-3 9H7z\"/>","share-2":"<circle cx=\"18\" cy=\"5\" r=\"3\"/><circle cx=\"6\" cy=\"12\" r=\"3\"/><circle cx=\"18\" cy=\"19\" r=\"3\"/><path d=\"m9 11 6-5M9 13l6 5\"/>","radio":"<circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M7 7a7 7 0 0 0 0 10M17 7a7 7 0 0 1 0 10M4 4a11 11 0 0 0 0 16M20 4a11 11 0 0 1 0 16\"/>","camera":"<path d=\"M3 7h4l2-3h6l2 3h4v13H3z\"/><circle cx=\"12\" cy=\"13\" r=\"4\"/>","image":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8\" cy=\"8\" r=\"2\"/><path d=\"m3 17 5-5 4 4 4-6 5 7\"/>","video":"<rect x=\"2\" y=\"5\" width=\"15\" height=\"14\" rx=\"2\"/><path d=\"m17 10 5-3v10l-5-3\"/>","mic":"<rect x=\"9\" y=\"2\" width=\"6\" height=\"12\" rx=\"3\"/><path d=\"M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8\"/>","music-2":"<path d=\"M9 18V5l12-2v12M9 5l12-2\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"18\" cy=\"15\" r=\"3\"/>","headphones":"<path d=\"M3 14v-2a9 9 0 0 1 18 0v2M3 14h4v7H5a2 2 0 0 1-2-2zM17 14h4v5a2 2 0 0 1-2 2h-2z\"/>","heart-handshake":"<path d=\"M12 21 3 12a5 5 0 0 1 7-7l2 2 2-2a5 5 0 0 1 7 7z\"/><path d=\"m8 12 2 2 4-4\"/>","sword":"<path d=\"m14 12 8-10-10 8-2 4-3 3 3 3 3-3M6 18l-3 3M4 15l5 5\"/>","shield":"<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/>","flame":"<path d=\"M12 22c5 0 8-4 8-9 0-4-3-7-5-10 0 5-4 5-5 9-1-2-2-3-2-5-3 3-4 6-4 9 0 4 3 6 8 6z\"/><path d=\"M12 22c3 0 4-2 4-4 0-2-2-4-3-5 0 3-4 4-4 6 0 2 1 3 3 3z\"/>","wand-sparkles":"<path d=\"m4 20 13-13 3 3L7 23zM17 2v4M15 4h4M3 5v4M1 7h4M20 15v4M18 17h4\"/>","mountain":"<path d=\"m2 21 8-16 5 10 3-5 4 11zM8 11l2 2 2-2\"/>","trees":"<path d=\"m7 3 5 8H9l5 7H1l5-7H3zM7 18v4M17 5l5 8h-3l4 7H12l3-7h-2zM17 20v2\"/>","castle":"<path d=\"M3 22V9h4V4h4v5h2V4h4v5h4v13zM9 22v-6h6v6M3 13h18M6 3v3M18 3v3\"/>","landmark":"<path d=\"m2 9 10-6 10 6zM4 10v10M9 10v10M15 10v10M20 10v10M2 22h20M3 20h18\"/>","door-open":"<path d=\"M4 22h16M6 22V4l12-2v20M6 4h12M15 13h.01\"/><path d=\"M20 12h3m-1-2 2 2-2 2\"/>","map-pinned":"<path d=\"m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15\"/><circle cx=\"15\" cy=\"11\" r=\"2\"/>","anchor":"<circle cx=\"12\" cy=\"5\" r=\"3\"/><path d=\"M12 8v13M5 12H2M22 12h-3M5 14a7 7 0 0 0 14 0M5 14l-2 2M19 14l2 2\"/>","ship":"<path d=\"M12 2v12M5 14V6l7-4 7 4v8M2 15l10 7 10-7-10-3z\"/>","ghost":"<path d=\"M5 21V11a7 7 0 0 1 14 0v10l-4-3-3 3-3-3z\"/><path d=\"M9 11h.01M15 11h.01\"/>","bot":"<rect x=\"4\" y=\"7\" width=\"16\" height=\"14\" rx=\"3\"/><path d=\"M12 7V3M9 3h6M4 12H2M22 12h-2M8 14h.01M16 14h.01M9 18h6\"/>","rocket":"<path d=\"M4 13c1-6 7-10 16-11 1 9-3 15-9 16l-7-5zM11 18l-3 3M4 13l-2 6 6-2\"/><circle cx=\"15\" cy=\"9\" r=\"2\"/>","zap":"<path d=\"m13 2-9 12h7l-1 8 10-12h-7z\"/>","activity":"<path d=\"M2 12h5l3-8 4 16 3-8h5\"/>","bug":"<rect x=\"7\" y=\"8\" width=\"10\" height=\"13\" rx=\"5\"/><path d=\"M9 8V5a3 3 0 0 1 6 0v3M4 9l3 2M20 9l-3 2M3 15h4M17 15h4M5 21l3-3M19 21l-3-3M12 8v13\"/>","fish":"<path d=\"M2 12C7 5 15 5 20 12c-5 7-13 7-18 0zM20 12l3-4v8zM7 11h.01\"/>","leaf":"<path d=\"M20 3C8 2 4 8 4 14a7 7 0 0 0 7 7c6 0 10-6 9-18zM4 21C7 16 11 13 16 9\"/>","flower-2":"<circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M12 10c-5-8 5-10 3-3M14 11c8-5 10 5 3 3M14 14c5 8-5 10-3 3M10 14c-8 5-10-5-3-3M12 14v8\"/>","calendar-check":"<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M8 2v4M16 2v4M3 10h18m-12 6 2 2 4-4\"/>","calendar-clock":"<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M8 2v4M16 2v4M3 10h18\"/><circle cx=\"13\" cy=\"16\" r=\"4\"/><path d=\"M13 14v2l2 1\"/>","alarm-clock":"<circle cx=\"12\" cy=\"13\" r=\"8\"/><path d=\"M12 9v4l3 2M5 3 2 5M19 3l-2 5M5 21l2-3M19 21l-2-3\"/>","timer":"<circle cx=\"12\" cy=\"14\" r=\"8\"/><path d=\"M12 10v4l3 2M9 2h6M12 2v4M19 7l2-2\"/>","hourglass":"<path d=\"M6 2h12M6 22h12M7 2v4l5 6-5 6v4M17 2v4l-5 6 5 6v4\"/>","sun":"<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2\"/>","moon":"<path d=\"M20 15a9 9 0 0 1-11-11 9 9 0 1 0 11 11z\"/>","sunrise":"<path d=\"M2 20h20M4 16h16M12 3v3M5 7l2 2M19 7l-2 2M7 16a5 5 0 0 1 10 0\"/>","sunset":"<path d=\"M2 20h20M4 16h16M12 3v3M5 7l2 2M19 7l-2 2M7 16a5 5 0 0 1 10 0\"/><path d=\"m10 10 2 2 2-2\"/>","repeat":"<path d=\"m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3\"/>","refresh-cw":"<path d=\"M21 9a9 9 0 0 0-16-3L2 9m0-6v6h6M3 15a9 9 0 0 0 16 3l3-3m0 6v-6h-6\"/>","bell-ring":"<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4M3 4l2 2M21 4l-2 2\"/>","alert-triangle":"<path d=\"m12 3 10 18H2zM12 9v5M12 18h.01\"/>","circle-help":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3M12 18h.01\"/>","settings":"<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M10 2h4l1 3 2 1 3-1 2 4-2 2v2l2 2-2 4-3-1-2 1-1 3h-4l-1-3-2-1-3 1-2-4 2-2v-2L2 9l2-4 3 1 2-1z\"/>","link":"<path d=\"M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2\"/>","external-link":"<path d=\"M14 3h7v7M21 3 10 14\"/><path d=\"M20 13v7H4V4h7\"/>","qr-code":"<path d=\"M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3M21 14v4M17 17v4M20 21h1M6 6h1M17 6h1M6 17h1\"/>","clover":"<circle cx=\"9\" cy=\"8\" r=\"4\"/><circle cx=\"15\" cy=\"8\" r=\"4\"/><circle cx=\"9\" cy=\"14\" r=\"4\"/><circle cx=\"15\" cy=\"14\" r=\"4\"/><path d=\"M12 16v6\"/>","snowflake":"<path d=\"M12 2v20M2 12h20M5 5l14 14M19 5 5 19M9 4l3-2 3 2M9 20l3 2 3-2\"/>","candy":"<rect x=\"7\" y=\"8\" width=\"10\" height=\"8\" rx=\"2\"/><path d=\"m7 10-5-3v10l5-3M17 10l5-3v10l-5-3\"/>","cake":"<path d=\"M3 13h18v9H3zM3 17h18M8 13V9M12 13V9M16 13V9M8 5v2M12 5v2M16 5v2\"/>","balloons":"<ellipse cx=\"8\" cy=\"8\" rx=\"5\" ry=\"6\"/><ellipse cx=\"17\" cy=\"7\" rx=\"4\" ry=\"5\"/><path d=\"m8 14-1 2h2zM17 12l-1 2h2zM8 16c0 3 4 3 4 6M17 14c0 5-3 5-3 8\"/>","confetti":"<path d=\"M3 21 8 8l8 8L3 21zM13 2v4M19 5l-2 2M21 12h-4M3 4l2 2M11 7l2-2M10 18l-2-2\"/>","palette":"<path d=\"M12 2a10 10 0 1 0 0 20h2a2 2 0 0 0 1-4 2 2 0 0 1 1-4h2a4 4 0 0 0 4-4A10 10 0 0 0 12 2z\"/><path d=\"M8 8h.01M13 6h.01M18 9h.01M7 15h.01\"/>","paintbrush":"<path d=\"m14 3 7 7-11 11-7 1 1-7zM11 6l7 7M3 21l4-4\"/>","masks":"<path d=\"M3 7c6 2 12 2 18 0v9c0 5-6 6-9 6S3 21 3 16zM7 12l3 1-3 1M14 13l3-1M9 17c2 2 4 2 6 0\"/>","pumpkin":"<path d=\"M12 6c-7-3-11 3-9 9 1 5 6 7 9 7s8-2 9-7c2-6-2-12-9-9zM12 6V2l3 2M9 8c-3 4-3 8 0 12M15 8c3 4 3 8 0 12\"/>","moon-star":"<path d=\"M19 15a9 9 0 0 1-10-10 9 9 0 1 0 10 10zM19 2l1 3 3 1-3 1-1 3-1-3-3-1 3-1z\"/>","cloud":"<path d=\"M7 19h11a4 4 0 0 0 0-8 7 7 0 0 0-13-2 5 5 0 0 0 2 10z\"/>","umbrella":"<path d=\"M3 12a9 9 0 0 1 18 0H3zM12 3v15a3 3 0 0 1-6 0\"/>","coffee":"<path d=\"M3 6h14v9a6 6 0 0 1-12 0V6M17 8h3a3 3 0 0 1 0 6h-3M2 22h19\"/>","apple":"<path d=\"M12 8c-5-5-11-1-9 7 2 8 7 8 9 6 2 2 7 2 9-6 2-8-4-12-9-7zM12 8c0-3 1-5 3-6M12 7c-2-3-4-4-7-3\"/>","heart-pulse":"<path d=\"M20 5a6 6 0 0 0-8 0 6 6 0 0 0-8 8l8 8 8-8a6 6 0 0 0 0-8z\"/><path d=\"M2 13h5l2-4 3 8 2-4h8\"/>","calendar-range":"<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M8 2v4M16 2v4M3 10h18M7 15h10M7 18h10\"/>","calendar-plus":"<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M8 2v4M16 2v4M3 10h18M12 13v6M9 16h6\"/>","calendar-x":"<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M8 2v4M16 2v4M3 10h18m6 3 6 6m0-6-6 6\"/>","clock-alert":"<circle cx=\"11\" cy=\"12\" r=\"9\"/><path d=\"M11 7v5l3 2M21 16v4M21 23h.01\"/>","book-marked":"<path d=\"M4 3h16v18H7a3 3 0 0 1-3-3V3zM4 18a3 3 0 0 1 3-3h13M10 3v7l3-2 3 2V3\"/>","notebook-pen":"<rect x=\"5\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"/><path d=\"M9 7h7M9 11h5M3 7h3M3 12h3M3 17h3m7 2 6-6 2 2-6 6-3 1z\"/>","list-tree":"<path d=\"M5 3v15M5 6h5M5 12h5M5 18h5M10 5h11M10 11h11M10 17h11\"/><circle cx=\"5\" cy=\"3\" r=\"1\"/>","badge-check":"<path d=\"m12 2 3 2 4-.2.2 4 2 3-2 3 .2 4-4 .2-3 2-3-2-4-.2.2-4-2-3 2-3-.2-4 4-.2z\"/><path d=\"m9 12 2 2 4-4\"/>","ticket-check":"<path d=\"M3 6h18v5a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4V6zM14 6v3M14 15v3m-8-6 2 2 3-4\"/>","badge-percent":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m8 16 8-8\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1\"/><circle cx=\"15.5\" cy=\"15.5\" r=\"1\"/>","receipt-text":"<path d=\"M5 2h14v20l-3-2-4 2-4-2-3 2V2zM8 7h8M8 11h8M8 15h5\"/>","vote":"<rect x=\"3\" y=\"11\" width=\"18\" height=\"10\" rx=\"2\"/><path d=\"M7 11V6h10v5M8 4h8M9 16l2 2 4-4\"/>","podium":"<path d=\"M2 21v-7h6v7M8 21V9h8v12M16 21v-5h6v5M2 21h20M12 5v4M10 7l2-2 2 2\"/>","handshake":"<path d=\"m2 11 5-5 4 1 3-2 8 6-3 4-2-2-2 3-2-2-2 2-5-5-3 3-1-3zM7 6l3-3h5l2 3M11 7l-3 3 4 3 3-2M5 15l3 3M9 17l3 3\"/>","images":"<rect x=\"5\" y=\"5\" width=\"16\" height=\"16\" rx=\"2\"/><path d=\"M3 17V4a2 2 0 0 1 2-2h13M5 18l4-4 3 3 4-6 5 6\"/><circle cx=\"10\" cy=\"10\" r=\"2\"/>","message-square-text":"<path d=\"M4 3h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9l-5 3V5a2 2 0 0 1 2-2zM8 9h10M8 13h7\"/>","crosshair":"<circle cx=\"12\" cy=\"12\" r=\"8\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v4M12 18v4M2 12h4M18 12h4\"/>","axe":"<path d=\"M4 21 16 9M7 18l-3 3M15 4c4-2 6-2 7-2-1 5-2 8-5 11l-6-6zM5 16l3 3\"/>","shield-plus":"<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 8v8M8 12h8\"/>","orbit":"<circle cx=\"12\" cy=\"12\" r=\"3\"/><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\" transform=\"rotate(-35 12 12)\"/><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"4\" transform=\"rotate(35 12 12)\"/>","tree-pine":"<path d=\"m12 2 7 9h-3l5 7H3l5-7H5zM12 18v4M9 22h6\"/>","snowman":"<circle cx=\"12\" cy=\"7\" r=\"4\"/><circle cx=\"12\" cy=\"17\" r=\"6\"/><path d=\"M9 2h6M12 3v-1M9 7h.01M15 7h.01M12 14h.01M12 18h.01M5 13l-3-2M19 13l3-2\"/>"};
const DUODUO_EVENT_LEGACY_ICON_MAP={"📖":"book-open","🎮":"list-checks","📜":"scroll-text","🎁":"gift","📌":"info","📝":"file-text","📨":"send","🎯":"target","🛒":"shopping-cart","🏆":"trophy","📅":"calendar-days","⭐":"star","✨":"sparkles","🎃":"skull","⚔️":"swords","💎":"gem","💡":"lightbulb","🔔":"bell","❤️":"heart"};
function duoduoEventIconId(value){
  const raw=String(value||'');
  const id=Object.prototype.hasOwnProperty.call(DUODUO_EVENT_LEGACY_ICON_MAP,raw)?DUODUO_EVENT_LEGACY_ICON_MAP[raw]:raw;
  return Object.prototype.hasOwnProperty.call(DUODUO_EVENT_ICON_PATHS,id)?id:'file-text';
}
function duoduoEventIconSvg(id){
  const path=DUODUO_EVENT_ICON_PATHS[duoduoEventIconId(id)];
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
}
const EVENT_SECTION_TYPES = [["intro","活動介紹","book-open"],["method","活動方式","list-checks"],["rules","活動規則","scroll-text"],["rewards","活動獎勵","gift"],["notes","注意事項","info"],["extra","補充說明","file-text"],["signup","報名方式","send"],["objectives","任務目標","target"],["shop","兌換商店","shopping-cart"],["ranking","排名獎勵","trophy"],["time","活動時程","calendar-clock"],["event-time","活動時間","clock"],["custom","自訂標題","file-text"]];
const EVENT_SECTION_ICONS=[["book-open","書本／介紹","常用"],["list-checks","清單／方式","常用"],["scroll-text","卷軸／規則","常用"],["gift","禮物／獎勵","常用"],["info","資訊／注意","常用"],["file-text","文件／補充","常用"],["send","報名／寄送","常用"],["target","目標／任務","常用"],["shopping-cart","購物車／商店","常用"],["trophy","獎盃／排名","常用"],["calendar-days","日曆／時程","常用"],["star","星星","常用"],["sparkles","閃光","常用"],["skull","骷髏／萬聖節","常用"],["swords","武器／挑戰","常用"],["gem","寶石","常用"],["lightbulb","燈泡／提示","常用"],["bell","鈴鐺／通知","常用"],["heart","愛心","常用"],["users","玩家／組隊","常用"],["clipboard-list","任務清單","常用"],["clock","時鐘／活動時間","常用"],["shield-alert","盾牌／警告","常用"],["map-pin","定位","常用"],["coins","硬幣","常用"],["megaphone","公告","常用"],["ticket","票券","常用"],["flag","旗幟","任務與活動"],["check-circle","完成","任務與活動"],["clipboard-check","簽到","任務與活動"],["list-todo","待辦事項","任務與活動"],["list-ordered","順序清單","任務與活動"],["route","路線","任務與活動"],["map","地圖","任務與活動"],["footprints","足跡","任務與活動"],["compass","指南針","任務與活動"],["search","搜尋","任務與活動"],["filter","篩選","任務與活動"],["puzzle","拼圖","任務與活動"],["book-check","攻略","任務與活動"],["pen-line","投稿","任務與活動"],["check-check","確認事項","任務與活動"],["bookmark","收藏","任務與活動"],["clipboard-pen","填寫表單","任務與活動"],["file-check","完成證明","任務與活動"],["list-filter","任務分類","任務與活動"],["book-marked","劇情章節／故事","任務與活動"],["notebook-pen","活動投稿／記錄","任務與活動"],["list-tree","階段任務／分支","任務與活動"],["badge-check","任務認證／資格","任務與活動"],["package","禮包","獎勵與道具"],["package-open","開箱","獎勵與道具"],["medal","勳章","獎勵與道具"],["award","獎牌","獎勵與道具"],["crown","皇冠","獎勵與道具"],["wallet","錢包","獎勵與道具"],["credit-card","點數","獎勵與道具"],["key-round","鑰匙","獎勵與道具"],["lock-keyhole","解鎖資格","獎勵與道具"],["shopping-bag","商店","獎勵與道具"],["box","寶箱","獎勵與道具"],["gift-card","兌換券","獎勵與道具"],["diamond","鑽石","獎勵與道具"],["coins-stack","代幣","獎勵與道具"],["piggy-bank","存錢","獎勵與道具"],["percent","加成","獎勵與道具"],["hand-coins","領取獎勵","獎勵與道具"],["scroll","卷軸道具","獎勵與道具"],["flask-conical","藥水","獎勵與道具"],["shield-check","保護道具","獎勵與道具"],["ticket-check","兌換券／驗票","獎勵與道具"],["badge-percent","活動加成／優惠","獎勵與道具"],["receipt-text","兌換紀錄／清單","獎勵與道具"],["dices","骰子","賽事與社群"],["chess-knight","棋賽","賽事與社群"],["party-popper","慶典","賽事與社群"],["users-round","組隊","賽事與社群"],["user-round","角色","賽事與社群"],["user-plus","招募","賽事與社群"],["message-circle","聊天","賽事與社群"],["messages-square","交流","賽事與社群"],["thumbs-up","按讚","賽事與社群"],["share-2","分享","賽事與社群"],["radio","直播","賽事與社群"],["camera","截圖","賽事與社群"],["image","圖片","賽事與社群"],["video","影片","賽事與社群"],["mic","主持","賽事與社群"],["music-2","音樂","賽事與社群"],["headphones","耳機","賽事與社群"],["heart-handshake","合作","賽事與社群"],["vote","票選／投票","賽事與社群"],["podium","前三名／排行榜","賽事與社群"],["handshake","合作／組隊合作","賽事與社群"],["images","作品集／投稿作品","賽事與社群"],["message-square-text","留言／參賽介紹","賽事與社群"],["sword","武器","冒險與戰鬥"],["shield","防禦","冒險與戰鬥"],["flame","火焰","冒險與戰鬥"],["wand-sparkles","魔法","冒險與戰鬥"],["mountain","山岳","冒險與戰鬥"],["trees","森林","冒險與戰鬥"],["castle","城堡","冒險與戰鬥"],["landmark","建築","冒險與戰鬥"],["door-open","傳送門","冒險與戰鬥"],["map-pinned","地點","冒險與戰鬥"],["anchor","錨點","冒險與戰鬥"],["ship","航行","冒險與戰鬥"],["ghost","幽靈","冒險與戰鬥"],["bot","機器人","冒險與戰鬥"],["rocket","衝刺","冒險與戰鬥"],["zap","閃電","冒險與戰鬥"],["activity","戰力","冒險與戰鬥"],["bug","怪物","冒險與戰鬥"],["fish","魚類","冒險與戰鬥"],["leaf","自然","冒險與戰鬥"],["flower-2","花朵","冒險與戰鬥"],["crosshair","Boss 目標／討伐","冒險與戰鬥"],["axe","戰鬥／武器","冒險與戰鬥"],["shield-plus","防護／守護任務","冒險與戰鬥"],["orbit","世界事件／裂縫","冒險與戰鬥"],["calendar-check","活動日期","時間與通知"],["calendar-clock","時間排程","時間與通知"],["alarm-clock","提醒時間","時間與通知"],["timer","倒數計時","時間與通知"],["hourglass","沙漏","時間與通知"],["sun","白天","時間與通知"],["moon","夜晚","時間與通知"],["sunrise","日出","時間與通知"],["sunset","日落","時間與通知"],["repeat","每日重複","時間與通知"],["refresh-cw","重新整理","時間與通知"],["bell-ring","通知","時間與通知"],["alert-triangle","警示","時間與通知"],["circle-help","常見問題","時間與通知"],["settings","設定","時間與通知"],["link","連結","時間與通知"],["external-link","外部網站","時間與通知"],["qr-code","QR 碼","時間與通知"],["calendar-range","活動期間／日期範圍","時間與通知"],["calendar-plus","新增日期／報名開始","時間與通知"],["calendar-x","截止日期／活動結束","時間與通知"],["clock-alert","時間提醒／截止時間","時間與通知"],["clover","幸運","節慶與特色"],["snowflake","冬季","節慶與特色"],["candy","糖果","節慶與特色"],["cake","生日","節慶與特色"],["balloons","氣球","節慶與特色"],["confetti","彩帶","節慶與特色"],["palette","造型設計","節慶與特色"],["paintbrush","彩繪","節慶與特色"],["masks","變裝","節慶與特色"],["pumpkin","南瓜","節慶與特色"],["moon-star","星空","節慶與特色"],["cloud","雲朵","節慶與特色"],["umbrella","雨傘","節慶與特色"],["coffee","咖啡","節慶與特色"],["apple","蘋果","節慶與特色"],["heart-pulse","健康","節慶與特色"],["tree-pine","聖誕樹／冬季活動","節慶與特色"],["snowman","雪人／雪季活動","節慶與特色"]];
const EVENT_SECTION_ICON_CATEGORIES=["全部", "常用", "任務與活動", "獎勵與道具", "賽事與社群", "冒險與戰鬥", "時間與通知", "節慶與特色"];
const EVENT_LEGACY_KEYS = ['intro','method','rules','rewards','notes','extra'];
let eventSectionDraft = [];
function normalizeEventSections(event){
  if(Array.isArray(event?.sectionBlocks) && event.sectionBlocks.length){
    return event.sectionBlocks.filter(x=>x&&typeof x==='object').map(x=>{
      const known=EVENT_SECTION_TYPES.find(t=>t[0]===x.type);
      const type=known?x.type:'custom';
      return {type,title:String(x.title||known?.[1]||''),icon:duoduoEventIconId(x.icon||known?.[2]),body:String(x.body||'')};
    });
  }
  const old=event?.sections;
  if(old&&typeof old==='object'&&!Array.isArray(old)){
    return EVENT_LEGACY_KEYS.filter(key=>typeof old[key]==='string'&&old[key].trim()).map(key=>{
      const def=EVENT_SECTION_TYPES.find(t=>t[0]===key);
      return {type:key,title:def[1],icon:def[2],body:old[key]};
    });
  }
  return [];
}
function createEventSelect(entries,current){
  const select=document.createElement('select');
  entries.forEach(([value,label])=>{
    const opt=document.createElement('option');opt.value=value;opt.textContent=label;select.appendChild(opt);
  });
  select.value=current;
  return select;
}
function renderEventSectionEditor(){
  const container=$('#eventSectionList');if(!container)return;
  container.replaceChildren();
  if(!eventSectionDraft.length){
    const empty=document.createElement('div');empty.className='event-section-empty';
    empty.textContent='目前沒有段落。按「＋ 新增段落」就能自行設定標題、圖示及內容。';
    container.appendChild(empty);return;
  }
  eventSectionDraft.forEach((item,index)=>{
    const panel=document.createElement('div');panel.className='event-section-row';
    const head=document.createElement('div');head.className='event-section-row-head';
    const heading=document.createElement('span');heading.className='event-section-row-name';heading.textContent=`段落 ${index+1}`;
    head.appendChild(heading);
    const actions=document.createElement('div');actions.className='event-section-actions';
    [['↑ 上移',-1],['↓ 下移',1]].forEach(([label,direction])=>{
      const b=document.createElement('button');b.type='button';b.textContent=label;
      b.disabled=(direction===-1&&index===0)||(direction===1&&index===eventSectionDraft.length-1);
      b.addEventListener('click',()=>{
        const target=index+direction;
        [eventSectionDraft[index],eventSectionDraft[target]]=[eventSectionDraft[target],eventSectionDraft[index]];
        renderEventSectionEditor();
      });actions.appendChild(b);
    });
    const remove=document.createElement('button');remove.type='button';remove.textContent='刪除';remove.className='event-section-delete';
    remove.addEventListener('click',()=>{eventSectionDraft.splice(index,1);renderEventSectionEditor();});actions.appendChild(remove);
    head.appendChild(actions);panel.appendChild(head);
    const fields=document.createElement('div');fields.className='event-section-row-fields';
    const makeLabel=(title,control,extraClass='')=>{
      const label=document.createElement('label');label.textContent=title;
      if(extraClass)label.className=extraClass;
      label.appendChild(control);fields.appendChild(label);return label;
    };
    const typeSelect=createEventSelect(EVENT_SECTION_TYPES.map(([key,title])=>[key,title]),item.type);
    makeLabel('段落類別',typeSelect);
    const iconField=document.createElement('div');iconField.className='event-section-icon-field event-section-full';
    const iconHeader=document.createElement('div');iconHeader.className='event-section-icon-header';
    const iconText=document.createElement('span');iconText.textContent='標題圖示（點選線條圖示）';
    const iconSelected=document.createElement('span');iconSelected.className='event-section-icon-selected';
    const iconToggle=document.createElement('button');iconToggle.type='button';iconToggle.className='event-section-icon-toggle';iconToggle.textContent='更換圖示';
    iconHeader.append(iconText,iconSelected,iconToggle);iconField.appendChild(iconHeader);
    const iconGallery=document.createElement('div');iconGallery.className='event-section-icon-gallery';iconGallery.hidden=true;
    iconToggle.addEventListener('click',()=>{iconGallery.hidden=!iconGallery.hidden;iconTools.hidden=iconGallery.hidden;iconToggle.textContent=iconGallery.hidden?'更換圖示':'收起圖示';if(!iconGallery.hidden)refreshIconFilters();});
    iconGallery.setAttribute('role','group');iconGallery.setAttribute('aria-label','選擇段落標題圖示');
    const iconTools=document.createElement('div');iconTools.className='event-section-icon-tools';iconTools.hidden=true;
    const iconSearch=document.createElement('input');iconSearch.type='search';iconSearch.className='event-section-icon-search';iconSearch.placeholder='搜尋圖示名稱，例如：禮物、魔法、時間';iconSearch.setAttribute('aria-label','搜尋線條圖示');
    const iconCategories=document.createElement('div');iconCategories.className='event-section-icon-categories';iconCategories.setAttribute('role','group');iconCategories.setAttribute('aria-label','圖示類別');
    const iconCount=document.createElement('span');iconCount.className='event-section-icon-count';
    const iconPreview=document.createElement('div');iconPreview.className='event-section-icon-live-preview';
    let selectedIconCategory='全部';
    const categoryButtons=[];
    EVENT_SECTION_ICON_CATEGORIES.forEach(category=>{
      const button=document.createElement('button');button.type='button';button.textContent=category;button.className='event-section-icon-category';
      button.addEventListener('click',()=>{selectedIconCategory=category;refreshIconFilters();});
      iconCategories.appendChild(button);categoryButtons.push([category,button]);
    });
    iconTools.append(iconSearch,iconCategories,iconCount,iconPreview);
    iconField.appendChild(iconTools);
    const iconButtons=[];
    EVENT_SECTION_ICONS.forEach(([iconId,iconName,iconCategory])=>{
      const button=document.createElement('button');button.type='button';button.className='event-section-icon-option';
      button.title=iconName;button.setAttribute('aria-label',iconName);
      const preview=document.createElement('span');preview.className='event-section-svg-icon';
      preview.innerHTML=duoduoEventIconSvg(iconId);
      const caption=document.createElement('span');caption.className='event-section-icon-caption';caption.textContent=iconName.split('／')[0];
      button.append(preview,caption);
      button.addEventListener('click',()=>{item.icon=iconId;refreshIconSelection();iconGallery.hidden=true;iconToggle.textContent='更換圖示';});
      iconGallery.appendChild(button);iconButtons.push([iconId,iconName,iconCategory,button]);
    });
    const refreshIconFilters=()=>{
      const search=iconSearch.value.toLocaleLowerCase('zh-Hant').trim();
      let visible=0;
      iconButtons.forEach(([id,name,category,button])=>{
        const matchingCategory=selectedIconCategory==='全部'||selectedIconCategory===category||(selectedIconCategory==='時間與通知'&&id==='clock');
        const matchingText=!search||(`${name} ${id} ${category}`.toLocaleLowerCase('zh-Hant')).includes(search);
        button.hidden=!(matchingCategory&&matchingText);
        if(!button.hidden)visible++;
      });
      categoryButtons.forEach(([name,button])=>{
        button.classList.toggle('is-active',name===selectedIconCategory);
        button.setAttribute('aria-pressed',String(name===selectedIconCategory));
      });
      iconCount.textContent=`顯示 ${visible}／${iconButtons.length} 款圖示`;
    };
    iconSearch.addEventListener('input',refreshIconFilters);
    const refreshIconSelection=()=>{
      const selectedId=duoduoEventIconId(item.icon);
      const selected=EVENT_SECTION_ICONS.find(([id])=>id===selectedId);
      iconSelected.innerHTML=duoduoEventIconSvg(selectedId);
      iconSelected.appendChild(document.createTextNode(' '+(selected?.[1]||'文件')));
      iconPreview.innerHTML=duoduoEventIconSvg(selectedId);
      const previewLabel=document.createElement('span');previewLabel.textContent=`前台效果預覽：${item.title||'活動段落'}`;iconPreview.appendChild(previewLabel);
      iconButtons.forEach(([id,name,category,button])=>{
        const isSelected=id===selectedId;
        button.classList.toggle('is-selected',isSelected);
        button.setAttribute('aria-pressed',String(isSelected));
      });
    };
    iconField.appendChild(iconGallery);fields.appendChild(iconField);
    refreshIconFilters();
    const customTitle=document.createElement('input');customTitle.type='text';customTitle.maxLength=50;customTitle.value=item.title;
    customTitle.placeholder='例如：萬聖節限定兌換商店';
    const titleLabel=makeLabel('自訂段落標題',customTitle,'event-section-custom-title');
    const content=document.createElement('textarea');content.rows=5;
    content.placeholder='輸入這個段落的活動內容，可直接換行';content.value=item.body;
    makeLabel('段落內容',content,'event-section-full');
    const updateVisibility=()=>{
      titleLabel.hidden=item.type!=='custom';
      refreshIconSelection();
    };
    typeSelect.addEventListener('change',()=>{
      item.type=typeSelect.value;
      const preset=EVENT_SECTION_TYPES.find(t=>t[0]===item.type);
      if(preset&&item.type!=='custom'){
        item.title=preset[1];item.icon=preset[2];
        customTitle.value=item.title;
      }else{item.title='';customTitle.value='';item.icon='file-text';}
      updateVisibility();
    });
    customTitle.addEventListener('input',()=>{item.title=customTitle.value;refreshIconSelection();});
    content.addEventListener('input',()=>{item.body=content.value;});
    panel.appendChild(fields);container.appendChild(panel);updateVisibility();
  });
}
$('#eventAddSection').addEventListener('click',()=>{
  eventSectionDraft.push({type:'method',title:'活動方式',icon:'list-checks',body:''});
  renderEventSectionEditor();
  $('#eventSectionList .event-section-row:last-child textarea')?.focus();
});
$('#eventAddSectionBottom').addEventListener('click',()=>$('#eventAddSection').click());
function collectEventSectionBlocks(){
  return eventSectionDraft.map(item=>({
    type:item.type==='custom'?'custom':item.type,
    title:(item.type==='custom'?item.title:EVENT_SECTION_TYPES.find(t=>t[0]===item.type)?.[1]||item.title).trim(),
    icon:duoduoEventIconId(item.icon),
    body:String(item.body||'').trim()
  })).filter(item=>item.title&&item.body);
}
renderEventSectionEditor();

$('#saveEvent').onclick=async()=>{
  const name=$('#eventName').value.trim();
  if(!name)return alert('請輸入活動名稱');

  const existing=editingEventId?events.find(d=>d.id===editingEventId):null;
  let cover=$('#eventImage').value.trim()||existing?.image||existing?.images?.[0]||'assets/ad3.png';

  const typedImages=$('#eventImages').value
    .split(/\r?\n/)
    .map(x=>x.trim())
    .filter(Boolean);

  let finalImages=typedImages.length
    ? typedImages
    : (existing?.images?.length?existing.images:[cover]);

  try{
    if(pendingEventCoverImage){
      cover=await uploadImageDataURL(
        pendingEventCoverImage,
        $('#eventImageFile').files?.[0]?.name||'event-cover'
      );

      if(!pendingEventCarouselImages.length){
        finalImages=[cover];
      }
    }

    if(pendingEventCarouselImages.length){
      const files=[...($('#eventImagesFiles').files||[])];
      finalImages=[];

      for(let i=0;i<pendingEventCarouselImages.length;i++){
        finalImages.push(
          await uploadImageDataURL(
            pendingEventCarouselImages[i],
            files[i]?.name||`event-${i+1}`
          )
        );
      }

      if(pendingEventCoverImage){
        cover=finalImages[0]||cover;
      }
    }

    if(!finalImages.length){
      finalImages=[cover];
    }

  }catch(error){
    console.error(error);
    return alert('圖片上傳失敗，請確認圖片後再試一次。');
  }

  const data={
    name,
    image:cover,
    images:finalImages,
    interval:Math.max(2000,Number($('#eventInterval').value||5)*1000),
    desc:$('#eventDesc').value.trim(),
    detail:$('#eventDetail').value.trim(),
    sections:{},
    sectionBlocks:collectEventSectionBlocks(),
    start:combineEventDateTime('eventStart','eventStartTime'),
    end:combineEventDateTime('eventEnd','eventEndTime'),
    url:$('#eventUrl').value.trim(),
    published:$('#eventPublished').checked
  };

  const previous=[...events];

  try{
    if(editingEventId){
      const target=events.find(d=>d.id===editingEventId);
      if(target)Object.assign(target,data);
    }else{
      events.unshift({
        id:'e_'+Date.now(),
        ...data
      });
    }

    save('duoduo_events',events);
    await syncEventsToServer();

  }catch(error){
    console.error(error);
    events=previous;
    save('duoduo_events',events);
    render();

    if(error.message==='cancelled')return;
    if(error.message==='登入已失效'){
      return alert('登入已失效，請重新整理後重新登入管理後台。');
    }
    return alert('活動同步到雲端失敗，請稍後再試。');
  }

  clearEventForm();
  render();
  alert('檔期活動已儲存，並同步到雲端。');
};

window.removeEvent=async i=>{
  const ordered=sortEventsByStart(events),target=ordered[i];
  if(!target)return;
  if(!confirm('確定刪除這個檔期活動？'))return;

  const previous=[...events];
  const idx=events.indexOf(target);
  if(idx>-1)events.splice(idx,1);

  save('duoduo_events',events);

  try{
    await syncEventsToServer();
  }catch(error){
    console.error(error);
    events=previous;
    save('duoduo_events',events);
    render();

    if(error.message==='cancelled')return;
    if(error.message==='登入已失效'){
      return alert('登入已失效，請重新整理後重新登入管理後台。');
    }
    return alert('活動同步到雲端失敗，活動已恢復。');
  }

  render();
  alert('檔期活動已刪除，並同步到雲端。');
};
let editingEventId=null;window.editEvent=i=>{const e=sortEventsByStart(events)[i];if(!e)return;editingEventId=e.id;pendingEventCoverImage='';pendingEventCarouselImages=[];$('#eventImageFile').value='';$('#eventImagesFiles').value='';$('#eventName').value=e.name||'';$('#eventImage').value=e.image||(e.images&&e.images[0])||'';$('#eventImages').value=(Array.isArray(e.images)&&e.images.length?e.images:[e.image||'']).join('\n');$('#eventInterval').value=Math.max(2,Math.round((Number(e.interval)||5000)/1000));$('#eventDesc').value=e.desc||'';$('#eventDetail').value=e.detail||e.desc||'';eventSectionDraft=normalizeEventSections(e);renderEventSectionEditor();setEventDateTime('eventStart','eventStartTime',e.start);setEventDateTime('eventEnd','eventEndTime',e.end);$('#eventUrl').value=e.url||'';$('#eventPublished').checked=e.published!==false;renderEventUploadPreviews();$('#saveEvent').textContent='儲存檔期活動修改';document.querySelector('[data-panel="events"]')?.click();focusManagedForm('eventManageForm')};function clearEventForm(){editingEventId=null;pendingEventCoverImage='';pendingEventCarouselImages=[];['eventName','eventImage','eventImages','eventDesc','eventDetail','eventStart','eventStartTime','eventEnd','eventEndTime','eventUrl','eventImageFile','eventImagesFiles'].forEach(id=>{const el=$('#'+id);if(el)el.value=''});eventSectionDraft=[];renderEventSectionEditor();$('#eventInterval').value='5';$('#eventPublished').checked=true;renderEventUploadPreviews();$('#saveEvent').textContent='＋ 新增檔期活動'}
window.saveLinks=()=>{const saved={};document.querySelectorAll('#linksForm input').forEach(i=>saved[i.dataset.key]=i.value.trim());localStorage.setItem('duoduo_links',JSON.stringify(saved));alert('網址已儲存到此瀏覽器。')};
function renderItems(){const box=$('#itemsAdmin');const q=($('#itemSearch')?.value||'').trim().toLowerCase();const f=items.filter(x=>`${x.name} ${x.category} ${x.description||''}`.toLowerCase().includes(q));box.innerHTML=f.length?f.map(x=>`<div class="item-row"><div class="item-thumb">${x.image?`<img src="${x.image}" alt="">`:'無圖片'}</div><div class="item-meta"><b>${esc(x.name)}</b><small>${esc(x.description||'尚未填寫描述')}</small></div><div class="item-category">${esc(x.category)}</div><div class="item-actions"><button onclick="editItem('${x.id}')">編輯</button><button class="danger" onclick="removeItem('${x.id}')">刪除</button></div></div>`).join(''):'<div class="note">目前沒有符合條件的道具。</div>'}
function resetItemForm(){editingItemId=null;pendingItemImage='';$('#itemFormTitle').textContent='新增道具';$('#itemName').value='';$('#itemCategory').value='裝備';$('#itemDescription').value='';$('#itemImage').value='';$('#itemImagePreview').innerHTML='<span>尚未選擇圖片</span>';$('#itemForm').hidden=true}
function openNewItem(){resetItemForm();$('#itemForm').hidden=false;$('#itemName').focus()}window.editItem=id=>{const x=items.find(i=>i.id===id);if(!x)return;editingItemId=id;pendingItemImage=x.image||'';$('#itemFormTitle').textContent='編輯道具';$('#itemName').value=x.name||'';$('#itemCategory').value=x.category||'裝備';$('#itemDescription').value=x.description||'';$('#itemImagePreview').innerHTML=x.image?`<img src="${x.image}" alt="">`:'<span>尚未設定圖片</span>';$('#itemForm').hidden=false};window.removeItem=id=>{if(!confirm('確定刪除？'))return;items=items.filter(x=>x.id!==id);save('duoduo_items',items);renderItems()};
$('#openItemForm').onclick=openNewItem;$('#cancelItem').onclick=resetItemForm;$('#itemSearch').oninput=renderItems;$('#itemImage').onchange=e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>2*1024*1024){alert('圖片請控制在 2MB 以下。');e.target.value='';return}const r=new FileReader();r.onload=()=>{pendingItemImage=r.result;$('#itemImagePreview').innerHTML=`<img src="${pendingItemImage}" alt="">`};r.readAsDataURL(f)};$('#saveItem').onclick=()=>{const name=$('#itemName').value.trim();if(!name)return alert('請輸入道具名稱');const data={name,category:$('#itemCategory').value,description:$('#itemDescription').value.trim(),image:pendingItemImage};if(editingItemId)Object.assign(items.find(x=>x.id===editingItemId),data);else items.unshift({id:`item_${Date.now()}`,...data});save('duoduo_items',items);resetItemForm();render();alert('道具資料已儲存。')};
$('#saveSettings').onclick=async()=>{settings={name:$('#siteName').value.trim()||defaultSettings.name,subtitle:$('#siteSubtitle').value.trim()||defaultSettings.subtitle,nav:{home:$('#navHome').value.trim()||defaultSettings.nav.home,why:$('#navWhy').value.trim()||defaultSettings.nav.why,features:$('#navFeatures').value.trim()||defaultSettings.nav.features,events:$('#navEvents').value.trim()||defaultSettings.nav.events,boss:$('#navBoss').value.trim()||defaultSettings.nav.boss,news:$('#navNews').value.trim()||defaultSettings.nav.news,guide:$('#navGuide').value.trim()||defaultSettings.nav.guide,downloads:$('#navDownloads').value.trim()||defaultSettings.nav.downloads,playerTools:$('#navPlayerTools')?.value.trim()||defaultSettings.nav.playerTools},navOrder:[...settings.navOrder],footer:{description:$('#footerDescription').value.trim()||defaultSettings.footer.description,navTitle:$('#footerNavTitle').value.trim()||defaultSettings.footer.navTitle,resourceTitle:$('#footerResourceTitle').value.trim()||defaultSettings.footer.resourceTitle,copyright:$('#footerCopyright').value.trim()||defaultSettings.footer.copyright}};save('duoduo_settings',settings);renderNavOrder();const btn=$('#saveSettings');btn.disabled=true;const oldLabel=btn.textContent;btn.textContent='同步中…';try{await pushSiteDataToCloud(['duoduo_settings']);alert('網站設定已儲存並同步到雲端。');}catch(error){console.error('網站設定雲端同步失敗：',error);alert('網站設定已儲存在目前瀏覽器，但雲端同步失敗：'+(error.message||'請確認登入狀態與後端連線。'));}finally{btn.disabled=false;btn.textContent=oldLabel;}};

// 即時篩選、分頁及新增入口：只影響後台檢視狀態
$('#manageNewsSearch').oninput=e=>{manageNewsState.query=e.target.value;manageNewsState.page=1;renderManagedNews()};
$('#manageNewsSort').onchange=e=>{manageNewsState.sort=e.target.value;manageNewsState.page=1;renderManagedNews()};
$('#manageNewsSize').onchange=e=>{manageNewsState.size=Number(e.target.value)||10;manageNewsState.page=1;renderManagedNews()};
$('#manageEventSearch').oninput=e=>{manageEventState.query=e.target.value;manageEventState.page=1;renderManagedEvents()};
$('#manageEventSort').onchange=e=>{manageEventState.sort=e.target.value;manageEventState.page=1;renderManagedEvents()};
$('#manageEventSize').onchange=e=>{manageEventState.size=Number(e.target.value)||10;manageEventState.page=1;renderManagedEvents()};
$('#manageNewNews').onclick=()=>{newsResetEditor();focusManagedForm('newsManageForm');newsEl('newsTitle')?.focus({preventScroll:true})};
$('#manageNewEvent').onclick=()=>{clearEventForm();focusManagedForm('eventManageForm');$('#eventName')?.focus({preventScroll:true})};

render();
loadCloudBosses();
