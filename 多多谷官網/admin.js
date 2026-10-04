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

const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const defaultLinks={"Discord":"https://discord.gg/duoduovalley","儲值入口":"https://fd-pay.com/ARrbXO","遊玩指南":"https://docs.google.com/document/d/13Ok02E9A_sS7LWrrFXw4S9jsPU6JWdTu6INpwuMlDdo/edit?usp=sharing","機率型道具說明":"https://docs.google.com/spreadsheets/d/1rAv38Kniphusog1CYCZQWkGW4OdDGRmeLUeHBfCi1BQ/edit?usp=sharing","上架商品":"https://docs.google.com/spreadsheets/d/1jvi3pVe9q0EjeMbTruptmLlT5eYNXMvr2glVt0-uxhs/edit?usp=sharing","每日 Checklist":"https://duoduovalley.github.io/duoduo-checklist/","登入器下載":"https://mega.nz/file/d3IVHYZY#iIv2y93Y2tPy2zORnDUUEWY-q4wO6PkdTqNZG3cYlM","整合包下載":"https://drive.google.com/file/d/1qohiBEHnrrAxIBPvSZ-MUerbp8xLD3tl/view?usp=sharing"};
const newsTagShort=t=>({'重要消息':'重要','維護通知':'維護','更新說明':'更新','活動資訊':'活動','序號發放':'序號','處分名單':'處分'}[t]||t); const defaults={news:[{tag:'重要消息',title:'DuoDuo Valley 官方網站持續完善中',date:'2026/10/04',body:'多多谷官方網站正在持續整理遊戲資訊、活動與玩家資源。'}],events:[{id:'e1',name:'多多谷活動',image:'assets/ad3.png',desc:'持續更新的活動與玩法。',detail:'活動詳細內容會在這裡完整呈現。',start:'2026-10-01T00:00',end:'2026-10-31T23:59',url:'',published:true},{id:'e2',name:'福利活動',image:'assets/birthday.png',desc:'多多谷福利與社群活動資訊。',detail:'福利活動的完整說明與注意事項。',start:'2026-10-01T00:00',end:'2026-10-31T23:59',url:'',published:true}],items:[]};
let news=read('duoduo_news',defaults.news),events=read('duoduo_events',defaults.events),items=read('duoduo_items',defaults.items);
let reviews=read('duoduo_reviews',[{id:'r1',rating:5,author:'玩家心得',text:'很多東西不用一直重複操作，玩起來比較舒服。',createdAt:1},{id:'r2',rating:5,author:'玩家心得',text:'活動蠻多的，不是每天只有掛著打怪。',createdAt:2},{id:'r3',rating:5,author:'玩家心得',text:'遇到問題有官方入口可以處理，這點很重要。',createdAt:3}]);
const defaultLayout={sections:[{id:'hero',name:'Hero 主視覺',visible:true,desc:'首頁第一屏／主視覺／CTA'},{id:'new-player',name:'新手三步驟',visible:true,desc:'第一次來多多谷的快速入口'},{id:'why',name:'為什麼選多多谷',visible:true,desc:'內容、便利、社群與長期遊玩理由'},{id:'about',name:'關於多多谷',visible:true,desc:'品牌與世界觀介紹'},{id:'quick-intro',name:'快速認識多多谷',visible:true,desc:'輪迴、BOSS、活動與便利玩法總覽'},{id:'features',name:'遊戲特色',visible:true,desc:'輪迴、強化、拳王、小屋等特色卡片'},{id:'events',name:'最新活動',visible:true,desc:'首頁活動卡片'},{id:'boss',name:'BOSS 挑戰',visible:true,desc:'BOSS 與副本宣傳'},{id:'community',name:'玩家社群',visible:true,desc:'社群與玩家交流'},{id:'stay',name:'為什麼留下來',visible:true,desc:'持續內容、養成與社群理由'},{id:'news',name:'最新公告',visible:true,desc:'官方公告與分類資訊'},{id:'versions',name:'版本紀錄',visible:true,desc:'目前版本與持續更新方向'},{id:'start',name:'開始遊玩',visible:true,desc:'登入器、整合包、指南與儲值'},{id:'quick-links',name:'玩家常用入口',visible:true,desc:'商城、機率、Checklist、Discord'}],featureColumns:3,heroEyebrow:'DUODUO VALLEY · OFFICIAL',heroTitle:'你的冒險，從多多谷開始。',heroSubtitle:'一個持續更新、充滿玩法，也讓玩家願意留下來的楓之谷世界。',aboutTitle:'一個正在慢慢變熱鬧的小小世界'};
const defaultContent={hero:{eyebrow:"DUODUO VALLEY · V282",title:"同樣都是楓之谷，為什麼是多多谷？",subtitle:"不是只換一個版本、調一組倍率。\n我們更在意：你上線之後，有沒有東西玩、有人一起玩，也有沒有值得留下來的理由。"},newPlayer:{eyebrow:"FOR NEW PLAYERS",title:"第一次來多多谷？",desc:"不用先研究一大堆名詞，只要 3 個步驟，就能開始你的冒險。",steps:[{title:"了解多多谷",desc:"先看看特色系統、玩法與世界觀。"},{title:"下載登入器",desc:"依照遊玩指南完成下載與設定。"},{title:"開始你的冒險",desc:"進入遊戲，和大家一起玩。"}]},why:{title:"你真正想知道的，這裡直接告訴你。",desc:"第一次看到多多谷，不需要先研究一堆名詞。先看看它能不能成為你想長期玩的那個服。",cards:[{title:"有內容",desc:"輪迴、陣營、強化、掛機、學院、BOSS、副本與各式特色活動，讓角色養成不只有一條路。"},{title:"夠方便",desc:"資源找回、掃蕩、裝備繼承、掛機等便利機制，減少重複操作，把時間留給真正想玩的內容。"},{title:"有人一起玩",desc:"打王、聊天、活動與競爭都不只是單機體驗，讓你有機會找到一起玩的玩家。"},{title:"找得到人",desc:"遊戲問題、BUG、活動疑問都有明確的官方處理入口，遇到問題不是只能自己摸索。"},{title:"福利持續有",desc:"特權、活動、限定福利與各式玩家企劃會持續推出，不只一次性活動。"},{title:"現在加入剛剛好",desc:"不用等下一個新服。版本持續更新，現在就能開始自己的進度。"}]},about:{title:"一個正在慢慢變熱鬧的小小世界",desc:"多多谷不只是一個伺服器，更是一個讓大家相聚、冒險與成長的家。",overlayTitle:"找到屬於自己的玩法",overlayDesc:"豐富且持續更新的遊戲內容、溫暖友善的社群環境、定期舉辦的活動與福利，以及用心傾聽玩家建議與回饋的世界。",image:"assets/logo3.jpg"},quickIntro:{title:"快速認識多多谷",desc:"不用一次看完所有系統，先從你最有興趣的地方開始。",cards:[{title:"輪迴 × 天賦",desc:"長期角色養成，慢慢打造屬於自己的成長方向。"},{title:"BOSS × 副本",desc:"角色變強之後，還有新的目標等著你挑戰。"},{title:"活動 × 休閒",desc:"練等之外，也有 BINGO、OX、拳王等不同玩法。"},{title:"便利 × 生活",desc:"掛機、掃蕩、資源找回等，讓日常遊玩更舒服。"}]},features:{title:"多多谷，不只是打怪練等。",desc:"把系統分類給你看，想深入了解再慢慢探索。",cards:[{title:"角色養成",desc:"輪迴、天賦、強化、裝備繼承等內容，讓角色成長有長期目標。",small:"輪迴系統 · 天賦系統 · 強化系統 · 裝備繼承"},{title:"挑戰內容",desc:"BOSS、副本、學院與排行榜，給想追求成長的玩家目標。"},{title:"休閒玩法",desc:"BINGO、OX、拳王爭霸、我的小屋等，練等之外也有事情做。"},{title:"便利功能",desc:"掛機、掃蕩、資源找回等，降低重複操作的負擔。"}]},events:{title:"正在進行的活動"},boss:{title:"挑戰更高的極限",desc:"獨家 BOSS、副本與排行榜，讓養成不只是數字，而是下一場挑戰的開始。"},community:{title:"一個私服好不好玩，玩家氣氛很重要。",desc:"多多谷不只希望你玩遊戲，也希望你能找到一起玩的玩家。",copyTitle:"不是一個人慢慢玩",copyDesc:"從打王、活動到日常聊天，多多谷希望玩家之間有交流、有目標，也有一起留下來的理由。"},stay:{title:"為什麼不是玩幾天就離開？",desc:"多多谷想做的，不只是讓你下載遊戲，而是讓你有下一個想完成的目標。",cards:[{title:"一直有東西可以玩",desc:"系統、活動、BOSS 與副本持續整理與更新，讓角色成長之後還有新的方向。"},{title:"進度是自己的",desc:"從養成、天賦到挑戰內容，不要求所有人走同一條路，慢慢建立自己的角色。"},{title:"有人一起玩",desc:"社群、活動、打王與玩家交流，讓你留下來的理由不只是一張角色數值表。"}]},news:{title:"最新消息"},versions:{title:"多多谷一直在往前走",desc:"版本不是結束，而是下一段內容的開始。"},start:{title:"現在，你知道為什麼是多多谷了。",desc:"不用等下一個新服。如果你正在找一個有內容、有人玩、持續更新的楓之谷私服，歡迎來看看。"},quickLinks:{title:"玩家常用入口"}};
let content=read('duoduo_content',defaultContent);
let editingReviewId=null;
const defaultSettings={name:'DuoDuo Valley｜多多谷',subtitle:'你的冒險，從多多谷開始。',nav:{home:'首頁',why:'為什麼選多多谷',features:'特色系統',events:'檔期活動',boss:'BOSS',news:'最新消息',guide:'遊玩指南',downloads:'下載專區'},footer:{description:'一個正在慢慢變熱鬧的小小世界。遊戲資訊、檔期活動與最新公告，都在這裡整理。',navTitle:'網站導覽',resourceTitle:'玩家資源',copyright:'© 2026 DuoDuo Valley · 多多谷'}};
const defaultHero={images:['assets/ad3.png','assets/birthday.png','assets/boss.png','assets/experience-rate.png'],interval:5000};
let hero=read('duoduo_hero',defaultHero);if(!Array.isArray(hero.slides)||!hero.slides.length){hero.slides=(Array.isArray(hero.images)&&hero.images.length?hero.images:defaultHero.images).map((image,i)=>({image,title:`多多谷宣傳 ${i+1}`,link:'',enabled:true}));}hero.slides=hero.slides.map((x,i)=>({image:x.image||'',title:x.title||`多多谷宣傳 ${i+1}`,link:x.link||'',enabled:x.enabled!==false}));hero.images=hero.slides.map(x=>x.image);hero.interval=Math.max(2000,Number(hero.interval)||5000);
let settings=read('duoduo_settings',defaultSettings);settings.nav=Object.assign({},defaultSettings.nav,settings.nav||{});settings.footer=Object.assign({},defaultSettings.footer,settings.footer||{});const defaultNavOrder=['home','why','features','events','boss','news','guide','downloads'];settings.navOrder=Array.isArray(settings.navOrder)?settings.navOrder.filter(k=>defaultNavOrder.includes(k)):[];settings.navOrder=[...settings.navOrder,...defaultNavOrder.filter(k=>!settings.navOrder.includes(k))];
const defaultResources=[{id:'guide',title:'完整遊玩指南',desc:'新手規則、系統說明與遊玩資訊。',url:defaultLinks['遊玩指南'],embedUrl:'https://docs.google.com/document/d/13Ok02E9A_sS7LWrrFXw4S9jsPU6JWdTu6INpwuMlDdo/preview',embed:true,enabled:true},{id:'rates',title:'機率型道具說明',desc:'查看機率型道具與相關說明。',url:defaultLinks['機率型道具說明'],embedUrl:'https://docs.google.com/spreadsheets/d/1rAv38Kniphusog1CYCZQWkGW4OdDGRmeLUeHBfCi1BQ/edit?usp=sharing',embed:true,enabled:true},{id:'products',title:'上架商品',desc:'查看目前可取得的商品與內容。',url:defaultLinks['上架商品'],embedUrl:'https://docs.google.com/spreadsheets/d/1jvi3pVe9q0EjeMbTruptmLlT5eYNXMvr2glVt0-uxhs/edit?usp=sharing',embed:true,enabled:true},{id:'checklist',title:'每日 Checklist',desc:'每天完成進度、活動與日常內容的快速檢查。',url:defaultLinks['每日 Checklist'],embedUrl:defaultLinks['每日 Checklist'],embed:true,enabled:true}];
let resources=read('duoduo_resources',defaultResources);
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
function parseAdminDate(value){
  const raw=String(value??'').trim();
  if(!raw)return Number.MIN_SAFE_INTEGER;
  const normalized=raw.replace(/\s+/g,' ').replace(/\s*([\/\-])\s*/g,'$1');
  const m=normalized.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[T ]+(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?)?$/);
  if(m){
    const d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]),Number(m[4]||0),Number(m[5]||0),Number(m[6]||0));
    const t=d.getTime();
    if(Number.isFinite(t))return t;
  }
  const t=Date.parse(normalized);
  return Number.isFinite(t)?t:Number.MIN_SAFE_INTEGER;
}
function eventStartTimestamp(e){return parseAdminDate(e?.start)}
function sortEventsByStart(list){return [...list].sort((a,b)=>eventStartTimestamp(b)-eventStartTimestamp(a))}
function formatEventDateRange(e){const fmt=v=>{if(!v)return '';const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v).replace('T',' ');const pad=n=>String(n).padStart(2,'0');return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`};return `${fmt(e?.start)} ～ ${fmt(e?.end)}`}
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
function render(){
 $('#newsCount').textContent=news.length;$('#eventCount').textContent=events.filter(e=>e.published!==false).length;$('#itemCount').textContent=items.length;
 $('#bossSlidesAdmin')?.setAttribute('data-count',String(bossConfig.slides.length));
 $('#newsAdmin').innerHTML=news.map((n,i)=>`<div class="item"><div><b>${esc(n.title)}</b><small>${esc(newsTagShort(n.tag))} ・ ${esc(n.date)}</small><small class="multiline">${esc(n.body||'')}</small></div><div class="item-actions"><button onclick="editNews(${i})">編輯</button><button class="danger" onclick="removeNews(${i})">刪除</button></div></div>`).join('')||'<div class="note">目前沒有公告。</div>';
 const orderedReviews=[...reviews].sort((a,b)=>{if(Boolean(b.featured)!==Boolean(a.featured))return b.featured?1:-1;return (Number(a.order)||0)-(Number(b.order)||0)||(Number(a.createdAt)||0)-(Number(b.createdAt)||0)});
 $('#reviewsAdmin').innerHTML=orderedReviews.map((r,i)=>`<div class="item review-admin-item" draggable="true" data-review-index="${i}"><span class="drag">☰</span><div><b>${r.featured?'★ 精選　':''}${'★'.repeat(Math.max(1,Math.min(5,Number(r.rating)||5)))}</b><small>${esc(r.author||'玩家心得')}</small><small>${esc(r.text||'')}</small></div><div><button onclick="editReview('${r.id}')">編輯</button> <button class="ghost" onclick="toggleFeaturedReview('${r.id}')">${r.featured?'取消精選':'設為精選'}</button> <button class="danger" onclick="removeReviewById('${r.id}')">刪除</button></div></div>`).join('')||'<div class="note">目前沒有玩家心得。</div>';
 setupReviewDrag(orderedReviews);
 $('#eventsAdmin').innerHTML=sortEventsByStart(events).map((e,i)=>`<div class="item"><div><b>${esc(e.name)}</b><small>${esc(formatEventDateRange(e))} ・ ${e.published!==false?'公開':'隱藏'} ・ ${Array.isArray(e.images)&&e.images.length?e.images.length:1} 張圖片 ・ ${Math.max(2,Math.round((Number(e.interval)||5000)/1000))} 秒切換</small><small>${esc(e.desc||'')}</small></div><div><button onclick="editEvent(${i})">編輯</button> <button class="danger" onclick="removeEvent(${i})">刪除</button></div></div>`).join('')||'<div class="note">目前沒有檔期活動。</div>';
 $('#linksForm').innerHTML=Object.entries(defaultLinks).map(([k,v])=>`<label>${esc(k)}<input value="${esc(v)}" data-key="${esc(k)}"></label>`).join('')+'<button class="save" onclick="saveLinks()">儲存網址</button>';
 $('#siteName').value=settings.name;$('#siteSubtitle').value=settings.subtitle;$('#navHome').value=settings.nav.home;$('#navWhy').value=settings.nav.why;$('#navFeatures').value=settings.nav.features;$('#navEvents').value=settings.nav.events;$('#navBoss').value=settings.nav.boss;$('#navNews').value=settings.nav.news;$('#navGuide').value=settings.nav.guide;$('#navDownloads').value=settings.nav.downloads||'下載專區';renderNavOrder();$('#footerDescription').value=settings.footer.description;$('#footerNavTitle').value=settings.footer.navTitle;$('#footerResourceTitle').value=settings.footer.resourceTitle;$('#footerCopyright').value=settings.footer.copyright;
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
function renderHeroSlides(){const box=$('#heroSlidesAdmin');if(!box)return;box.innerHTML=hero.slides.map((slide,i)=>`<div class="hero-slide-admin" draggable="true" data-hero-index="${i}"><span class="drag">☰</span><div class="hero-slide-fields"><label>圖片<input data-hero-field="image" value="${esc(slide.image)}" placeholder="assets/ad3.png 或圖片網址"></label><label>標題<input data-hero-field="title" value="${esc(slide.title)}" placeholder="例如：生日活動"></label><label>點擊連結<input data-hero-field="link" value="${esc(slide.link)}" placeholder="可留空"></label></div><label class="hero-enabled"><input type="checkbox" data-hero-field="enabled" ${slide.enabled!==false?'checked':''}> 顯示</label><button class="danger" type="button" onclick="removeHeroSlide(${i})">刪除</button></div>`).join('')||'<div class="note">目前沒有輪播圖片。</div>';box.querySelectorAll('.hero-slide-admin').forEach(row=>{row.addEventListener('dragstart',()=>{row.classList.add('dragging');hero._dragFrom=Number(row.dataset.heroIndex)});row.addEventListener('dragend',()=>row.classList.remove('dragging'));row.addEventListener('dragover',e=>e.preventDefault());row.addEventListener('drop',e=>{e.preventDefault();const from=hero._dragFrom,to=Number(row.dataset.heroIndex);if(Number.isInteger(from)&&from!==to){const m=hero.slides.splice(from,1)[0];hero.slides.splice(to,0,m);renderHeroSlides()}})})}
window.removeHeroSlide=i=>{hero.slides.splice(i,1);renderHeroSlides()};$('#addHeroSlide').onclick=()=>{hero.slides.push({image:'',title:'新的輪播圖片',link:'',enabled:true});renderHeroSlides()};
window.toggleSection=i=>{layout.sections[i].visible=!layout.sections[i].visible;renderLayout()};
function setupDrag(){let from=null;document.querySelectorAll('.layout-row').forEach(r=>{r.addEventListener('dragstart',()=>{from=+r.dataset.index;r.classList.add('dragging')});r.addEventListener('dragend',()=>r.classList.remove('dragging'));r.addEventListener('dragover',e=>e.preventDefault());r.addEventListener('drop',e=>{e.preventDefault();const to=+r.dataset.index;if(from===null||from===to)return;const m=layout.sections.splice(from,1)[0];layout.sections.splice(to,0,m);renderLayout()})})}
$('#saveLayout').onclick=()=>{layout.heroEyebrow=$('#heroEyebrow').value.trim()||defaultLayout.heroEyebrow;layout.heroTitle=$('#heroTitle').value.trim()||defaultLayout.heroTitle;layout.heroSubtitle=$('#heroSubtitle').value.trim()||defaultLayout.heroSubtitle;layout.aboutTitle=$('#aboutTitle').value.trim()||defaultLayout.aboutTitle;layout.featureColumns=+$('#featureColumns').value||3;document.querySelectorAll('[data-hero-index]').forEach(row=>{const i=Number(row.dataset.heroIndex),slide=hero.slides[i];if(!slide)return;row.querySelectorAll('[data-hero-field]').forEach(el=>{const f=el.dataset.heroField;slide[f]=f==='enabled'?el.checked:el.value.trim()})});hero.slides=hero.slides.filter(x=>x.image);hero.images=hero.slides.filter(x=>x.enabled!==false).map(x=>x.image);hero.interval=Math.max(2000,(Number($('#heroInterval').value)||5)*1000);save('duoduo_layout',layout);save('duoduo_hero',hero);alert('首頁版面與主視覺輪播已儲存。')};
$('#resetLayout').onclick=()=>{if(confirm('恢復預設首頁版面？')){layout=structuredClone(defaultLayout);save('duoduo_layout',layout);renderLayout()}};
$('#addReview').onclick=()=>{const text=$('#reviewText').value.trim();if(!text)return alert('請先貼上玩家心得內容');const data={rating:Number($('#reviewRating').value)||5,author:$('#reviewAuthor').value.trim()||'玩家心得',text,featured:$('#reviewFeatured')?.checked===true};const isEdit=!!editingReviewId;if(isEdit){const target=reviews.find(r=>r.id===editingReviewId);if(target)Object.assign(target,data);editingReviewId=null;$('#addReview').textContent='＋ 新增玩家心得'}else{reviews.push({id:'r_'+Date.now(),...data,createdAt:Date.now(),order:reviews.length})}save('duoduo_reviews',reviews);$('#reviewAuthor').value='';$('#reviewText').value='';$('#reviewRating').value='5';if($('#reviewFeatured'))$('#reviewFeatured').checked=false;render();alert(isEdit?'玩家心得已更新。':'玩家心得已新增。')};
window.editReview=id=>{const r=reviews.find(x=>x.id===id);if(!r)return;editingReviewId=id;$('#reviewAuthor').value=r.author||'';$('#reviewRating').value=String(r.rating||5);$('#reviewText').value=r.text||'';if($('#reviewFeatured'))$('#reviewFeatured').checked=r.featured===true;$('#addReview').textContent='儲存玩家心得修改';document.querySelector('[data-panel="reviews"]')?.click();window.scrollTo({top:0,behavior:'smooth'})};
window.toggleFeaturedReview=id=>{const r=reviews.find(x=>x.id===id);if(!r)return;r.featured=!r.featured;save('duoduo_reviews',reviews);render()};window.removeReviewById=id=>{if(!confirm('確定刪除這則玩家心得？'))return;reviews=reviews.filter(r=>r.id!==id);save('duoduo_reviews',reviews);render()};function setupReviewDrag(ordered){document.querySelectorAll('.review-admin-item').forEach(row=>{row.addEventListener('dragstart',()=>{row.classList.add('dragging');row._from=Number(row.dataset.reviewIndex)});row.addEventListener('dragend',()=>row.classList.remove('dragging'));row.addEventListener('dragover',e=>e.preventDefault());row.addEventListener('drop',e=>{e.preventDefault();const from=row._from,to=Number(row.dataset.reviewIndex);if(from===to)return;const reordered=[...ordered];const moved=reordered.splice(from,1)[0];reordered.splice(to,0,moved);reordered.forEach((r,i)=>r.order=i);reviews.forEach(r=>{const x=reordered.find(v=>v.id===r.id);if(x)r.order=x.order});save('duoduo_reviews',reviews);render()})})}
let editingNewsIndex=null;$('#addNews').onclick=()=>{const title=$('#newsTitle').value.trim();if(!title)return alert('請先輸入公告標題');const data={tag:$('#newsTag').value,title,date:$('#newsDate').value||new Date().toLocaleDateString('zh-TW'),body:$('#newsBody').value.trim()};if(editingNewsIndex!==null&&news[editingNewsIndex]){news[editingNewsIndex]=Object.assign({},news[editingNewsIndex],data);editingNewsIndex=null;$('#addNews').textContent='＋ 新增公告';alert('公告已更新。')}else{news.unshift(data);alert('公告已新增。')}save('duoduo_news',news);$('#newsTitle').value='';$('#newsDate').value='';$('#newsBody').value='';render()};window.editNews=i=>{const n=news[i];if(!n)return;editingNewsIndex=i;$('#newsTag').value=n.tag||'重要消息';$('#newsTitle').value=n.title||'';$('#newsDate').value=n.date||'';$('#newsBody').value=n.body||'';$('#addNews').textContent='儲存公告修改';document.querySelector('[data-panel="news"]')?.click();window.scrollTo({top:0,behavior:'smooth'})};window.removeNews=i=>{if(confirm('確定刪除這則公告？')){news.splice(i,1);if(editingNewsIndex===i){editingNewsIndex=null;$('#addNews').textContent='＋ 新增公告'}save('duoduo_news',news);render()}};
async function fileToCompressedDataURL(file,maxW=1800,maxH=1200,quality=.86){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,maxW/img.naturalWidth,maxH/img.naturalHeight);const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/webp',quality));};img.onerror=reject;img.src=reader.result;};reader.onerror=reject;reader.readAsDataURL(file)});}async function uploadImageDataURL(dataUrl,originalName){
  const API_BASE=window.location.hostname.endsWith('github.io')
  ? 'https://duoduo-website.onrender.com'
  : '';

const token=sessionStorage.getItem('duoduo_admin_session')||'';
const res=await fetch(`${API_BASE}/api/upload-image`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({dataUrl,filename:originalName||'event-image'})});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||!data.ok||!data.path){
    const detail=String(data.detail||data.error||'upload_failed');
    throw new Error(detail);
  }
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
    return alert(`圖片上傳失敗：${error?.message||'請確認圖片後再試一次。'}`);
  }

  const data={
    name,
    image:cover,
    images:finalImages,
    interval:Math.max(2000,Number($('#eventInterval').value||5)*1000),
    desc:$('#eventDesc').value.trim(),
    detail:$('#eventDetail').value.trim(),
    start:$('#eventStart').value,
    end:$('#eventEnd').value,
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
let editingEventId=null;window.editEvent=i=>{const e=sortEventsByStart(events)[i];if(!e)return;editingEventId=e.id;pendingEventCoverImage='';pendingEventCarouselImages=[];$('#eventImageFile').value='';$('#eventImagesFiles').value='';$('#eventName').value=e.name||'';$('#eventImage').value=e.image||(e.images&&e.images[0])||'';$('#eventImages').value=(Array.isArray(e.images)&&e.images.length?e.images:[e.image||'']).join('\n');$('#eventInterval').value=Math.max(2,Math.round((Number(e.interval)||5000)/1000));$('#eventDesc').value=e.desc||'';$('#eventDetail').value=e.detail||e.desc||'';$('#eventStart').value=e.start||'';$('#eventEnd').value=e.end||'';$('#eventUrl').value=e.url||'';$('#eventPublished').checked=e.published!==false;renderEventUploadPreviews();$('#saveEvent').textContent='儲存檔期活動修改';document.querySelector('[data-panel="events"]')?.click();window.scrollTo({top:0,behavior:'smooth'})};function clearEventForm(){editingEventId=null;pendingEventCoverImage='';pendingEventCarouselImages=[];['eventName','eventImage','eventImages','eventDesc','eventDetail','eventStart','eventEnd','eventUrl','eventImageFile','eventImagesFiles'].forEach(id=>{const el=$('#'+id);if(el)el.value=''});$('#eventInterval').value='5';$('#eventPublished').checked=true;renderEventUploadPreviews();$('#saveEvent').textContent='＋ 新增檔期活動'}
window.saveLinks=()=>{const saved={};document.querySelectorAll('#linksForm input').forEach(i=>saved[i.dataset.key]=i.value.trim());localStorage.setItem('duoduo_links',JSON.stringify(saved));alert('網址已儲存到此瀏覽器。')};
function renderItems(){const box=$('#itemsAdmin');const q=($('#itemSearch')?.value||'').trim().toLowerCase();const f=items.filter(x=>`${x.name} ${x.category} ${x.description||''}`.toLowerCase().includes(q));box.innerHTML=f.length?f.map(x=>`<div class="item-row"><div class="item-thumb">${x.image?`<img src="${x.image}" alt="">`:'無圖片'}</div><div class="item-meta"><b>${esc(x.name)}</b><small>${esc(x.description||'尚未填寫描述')}</small></div><div class="item-category">${esc(x.category)}</div><div class="item-actions"><button onclick="editItem('${x.id}')">編輯</button><button class="danger" onclick="removeItem('${x.id}')">刪除</button></div></div>`).join(''):'<div class="note">目前沒有符合條件的道具。</div>'}
function resetItemForm(){editingItemId=null;pendingItemImage='';$('#itemFormTitle').textContent='新增道具';$('#itemName').value='';$('#itemCategory').value='裝備';$('#itemDescription').value='';$('#itemImage').value='';$('#itemImagePreview').innerHTML='<span>尚未選擇圖片</span>';$('#itemForm').hidden=true}
function openNewItem(){resetItemForm();$('#itemForm').hidden=false;$('#itemName').focus()}window.editItem=id=>{const x=items.find(i=>i.id===id);if(!x)return;editingItemId=id;pendingItemImage=x.image||'';$('#itemFormTitle').textContent='編輯道具';$('#itemName').value=x.name||'';$('#itemCategory').value=x.category||'裝備';$('#itemDescription').value=x.description||'';$('#itemImagePreview').innerHTML=x.image?`<img src="${x.image}" alt="">`:'<span>尚未設定圖片</span>';$('#itemForm').hidden=false};window.removeItem=id=>{if(!confirm('確定刪除？'))return;items=items.filter(x=>x.id!==id);save('duoduo_items',items);renderItems()};
$('#openItemForm').onclick=openNewItem;$('#cancelItem').onclick=resetItemForm;$('#itemSearch').oninput=renderItems;$('#itemImage').onchange=e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>2*1024*1024){alert('圖片請控制在 2MB 以下。');e.target.value='';return}const r=new FileReader();r.onload=()=>{pendingItemImage=r.result;$('#itemImagePreview').innerHTML=`<img src="${pendingItemImage}" alt="">`};r.readAsDataURL(f)};$('#saveItem').onclick=()=>{const name=$('#itemName').value.trim();if(!name)return alert('請輸入道具名稱');const data={name,category:$('#itemCategory').value,description:$('#itemDescription').value.trim(),image:pendingItemImage};if(editingItemId)Object.assign(items.find(x=>x.id===editingItemId),data);else items.unshift({id:`item_${Date.now()}`,...data});save('duoduo_items',items);resetItemForm();render();alert('道具資料已儲存。')};
$('#saveSettings').onclick=()=>{settings={name:$('#siteName').value.trim()||defaultSettings.name,subtitle:$('#siteSubtitle').value.trim()||defaultSettings.subtitle,nav:{home:$('#navHome').value.trim()||defaultSettings.nav.home,why:$('#navWhy').value.trim()||defaultSettings.nav.why,features:$('#navFeatures').value.trim()||defaultSettings.nav.features,events:$('#navEvents').value.trim()||defaultSettings.nav.events,boss:$('#navBoss').value.trim()||defaultSettings.nav.boss,news:$('#navNews').value.trim()||defaultSettings.nav.news,guide:$('#navGuide').value.trim()||defaultSettings.nav.guide,downloads:$('#navDownloads').value.trim()||defaultSettings.nav.downloads},navOrder:[...settings.navOrder],footer:{description:$('#footerDescription').value.trim()||defaultSettings.footer.description,navTitle:$('#footerNavTitle').value.trim()||defaultSettings.footer.navTitle,resourceTitle:$('#footerResourceTitle').value.trim()||defaultSettings.footer.resourceTitle,copyright:$('#footerCopyright').value.trim()||defaultSettings.footer.copyright}};save('duoduo_settings',settings);renderNavOrder();alert('網站設定已儲存到此瀏覽器。')};
render();
loadCloudBosses();
