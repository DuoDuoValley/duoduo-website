const DEFAULT_LINKS={discord:"https://discord.gg/duoduovalley",topup:"https://fd-pay.com/ARrbXO",guide:"https://docs.google.com/document/d/13Ok02E9A_sS7LWrrFXw4S9jsPU6JWdTu6INpwuMlDdo/edit?usp=sharing",rates:"https://docs.google.com/spreadsheets/d/1rAv38Kniphusog1CYCZQWkGW4OdDGRmeLUeHBfCi1BQ/edit?usp=sharing",products:"https://docs.google.com/spreadsheets/d/1jvi3pVe9q0EjeMbTruptmLlT5eYNXMvr2glVt0-uxhs/edit?usp=sharing",checklist:"https://duoduovalley.github.io/duoduo-checklist/",launcher:"https://mega.nz/file/d3IVHYZY#iIv2Y93Y2tPy2zORnDUUEWY-q4wO6PkdTqNZG3cYlM",pack:"https://drive.google.com/file/d/1qohiBEHnrrAxIBPvSZ-MUerbp8xLD3tl/view?usp=sharing"};
function getJSONSafe(key,fallback){try{return JSON.parse(localStorage.getItem(key)||"null")??fallback}catch{return fallback}}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function eventImages(e){const list=Array.isArray(e?.images)?e.images.filter(Boolean):[];return list.length?list:(e?.image?[e.image]:["assets/ad3.png"])}
function eventCarouselHTML(e,extraClass=""){const imgs=eventImages(e);const interval=Math.max(2000,Number(e?.interval)||5000);return `<div class="event-carousel ${extraClass}" data-images='${esc(JSON.stringify(imgs))}' data-interval="${interval}"><div class="event-carousel-track">${imgs.map((src,i)=>`<img class="event-slide${i===0?" active":""}" src="${esc(src)}" alt="" loading="lazy">`).join("")}</div>${imgs.length>1?`<button class="event-carousel-arrow prev" type="button" aria-label="上一張">‹</button><button class="event-carousel-arrow next" type="button" aria-label="下一張">›</button><div class="event-carousel-bottom"><div class="event-carousel-dots">${imgs.map((_,i)=>`<button type="button" class="event-carousel-dot${i===0?" active":""}" data-slide="${i}" aria-label="第 ${i+1} 張"></button>`).join("")}</div><span class="event-carousel-count">01 / ${String(imgs.length).padStart(2,"0")}</span><button class="event-carousel-pause" type="button" aria-label="暫停輪播">Ⅱ</button></div>`:""}</div>`}
function initEventCarousels(scope=document){scope.querySelectorAll('.event-carousel').forEach(root=>{if(root.dataset.ready)return;root.dataset.ready='1';const slides=[...root.querySelectorAll('.event-slide')],dots=[...root.querySelectorAll('.event-carousel-dot')],count=root.querySelector('.event-carousel-count'),pause=root.querySelector('.event-carousel-pause');if(slides.length<2)return;let index=0,timer=null,paused=false;const interval=Math.max(2000,Number(root.dataset.interval)||5000);const show=(next)=>{index=(next+slides.length)%slides.length;slides.forEach((el,i)=>el.classList.toggle('active',i===index));dots.forEach((el,i)=>el.classList.toggle('active',i===index));if(count)count.textContent=`${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`};const start=()=>{clearInterval(timer);if(!paused)timer=setInterval(()=>show(index+1),interval)};root.querySelector('.prev')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();show(index-1);start()});root.querySelector('.next')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();show(index+1);start()});dots.forEach(d=>d.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();show(Number(d.dataset.slide)||0);start()}));pause?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();paused=!paused;pause.textContent=paused?'▶':'Ⅱ';start()});root.addEventListener('mouseenter',()=>{paused=true;clearInterval(timer)});root.addEventListener('mouseleave',()=>{paused=false;start()});show(0);start()})}
const LINKS=Object.assign({},DEFAULT_LINKS,getJSONSafe("duoduo_links",{}));
const DEFAULT_RESOURCES=[
  {id:"guide",title:"完整遊玩指南",desc:"新手規則、系統說明與遊玩資訊。",url:DEFAULT_LINKS.guide,embedUrl:"https://docs.google.com/document/d/13Ok02E9A_sS7LWrrFXw4S9jsPU6JWdTu6INpwuMlDdo/preview",embed:true},
  {id:"rates",title:"機率型道具說明",desc:"查看機率型道具與相關說明。",url:DEFAULT_LINKS.rates,embedUrl:"https://docs.google.com/spreadsheets/d/1rAv38Kniphusog1CYCZQWkGW4OdDGRmeLUeHBfCi1BQ/edit?usp=sharing",embed:true},
  {id:"products",title:"上架商品",desc:"查看目前可取得的商品與內容。",url:DEFAULT_LINKS.products,embedUrl:"https://docs.google.com/spreadsheets/d/1jvi3pVe9q0EjeMbTruptmLlT5eYNXMvr2glVt0-uxhs/edit?usp=sharing",embed:true},
  {id:"checklist",title:"每日 Checklist",desc:"每天完成進度、活動與日常內容的快速檢查。",url:DEFAULT_LINKS.checklist,embedUrl:DEFAULT_LINKS.checklist,embed:true}
];
const RESOURCES=getJSONSafe("duoduo_resources",DEFAULT_RESOURCES);
const DEFAULT_DOWNLOADS=[
  {id:"manager",title:"遊戲橘子遊戲管理器",type:"遊戲本體",url:"https://tw.beanfun.com/beanfunCommon/Redirect/Redirect.aspx?ID=B258",desc:"第一次安裝遊戲時，先使用官方遊戲管理器下載新楓之谷。",instructions:"1.於官方網站或多多谷Discord下載並安裝「遊戲橘子遊戲管理器」。\n2.開啟「遊戲橘子遊戲管理器」，找到「新楓之谷」點擊開始下載並選擇安裝路徑。",image:"assets/download-manager-guide.png",enabled:true},
  {id:"patch281to282",title:"V281 ～ V282 更新檔",type:"版本更新",url:"https://maplestory-download.beanfun.com/maplestory/download/282DTOpqU2UWtIc/8MCDwQMvJ47u/MaplePatch281to282.zip",desc:"已經安裝對應遊戲版本的玩家，可使用此檔案更新至 V282。",instructions:"1.於官方網站下載符合需求的更新檔案。\n2.下載完畢後，使用右鍵選更新檔，並選擇「以系統管理員身分執行」。\n3.選擇自己安裝新楓之谷主程式時的位置。",image:"assets/manual-update-guide.png",enabled:true},
  {id:"patch2824",title:"V282 ～ V282.4 手動更新檔",type:"版本更新",url:"https://maplestory-download.beanfun.com/maplestory/download/282DTOpqU2UWtIc/GmWKbVkc4O6B/MapleStoryV282.4.exe",desc:"需要從 V282 更新至 V282.4 時使用的手動更新檔。",instructions:"1.於官方網站下載符合需求的更新檔案。\n2.下載完畢後，使用右鍵選更新檔，並選擇「以系統管理員身分執行」。\n3.選擇自己安裝新楓之谷主程式時的位置。",image:"assets/manual-update-guide.png",enabled:true},
  {id:"launcher",title:"多多谷登入器",type:"DuoDuo",url:"https://mega.nz/file/d3IVHYZY#iIv2y93Y2tPy2zORnDUUEWY-q4wO6Pkd8TqNZG3cYlM",desc:"將登入器放入 MapleStory 遊戲資料夾後，即可註冊帳號並進入遊戲。",instructions:"1.將「多多谷」放入 MapleStory 遊戲資料夾內。\n2.開啟多多谷登入器後，於該介面註冊遊戲帳號。\n3.點擊「GAME START」按鈕，即可進入遊戲。",image:"",enabled:true},
  {id:"pack",title:"DuoDuo 整合包",type:"DuoDuo",url:"https://drive.google.com/file/d/1qohiBEHnrrAxIBPvSZ-MUerbp8xLD3tl/view?usp=sharing",desc:"已整理好的 DuoDuo MapleStoryV282 遊戲資料，適合需要完整環境的玩家。",instructions:"1.將 DuoDuo MapleStoryV282 遊戲資料夾內「多多谷」開啟。\n2.開啟多多谷登入器後，於該介面註冊遊戲帳號。\n3.點擊「GAME START」按鈕，即可進入遊戲。",image:"",enabled:true}
];
const DOWNLOADS=getJSONSafe("duoduo_downloads",DEFAULT_DOWNLOADS);

const DEFAULT_SITE_SETTINGS={
  name:"DuoDuo Valley｜多多谷",
  subtitle:"你的冒險，從多多谷開始。",
  nav:{home:"首頁",why:"為什麼選多多谷",features:"特色系統",events:"檔期活動",boss:"BOSS",news:"最新消息",guide:"遊玩指南",downloads:"下載專區"},
  footer:{description:"一個正在慢慢變熱鬧的小小世界。遊戲資訊、檔期活動與最新公告，都在這裡整理。",navTitle:"網站導覽",resourceTitle:"玩家資源",copyright:"© 2026 DuoDuo Valley · 多多谷"}
};
const DEFAULT_HERO_SLIDES={images:["assets/ad3.png","assets/birthday.png","assets/boss.png","assets/experience-rate.png"],slides:[{image:"assets/ad3.png",title:"多多谷宣傳",link:"",enabled:true},{image:"assets/birthday.png",title:"生日福利",link:"",enabled:true},{image:"assets/boss.png",title:"BOSS 挑戰",link:"boss.html",enabled:true},{image:"assets/experience-rate.png",title:"經驗倍率",link:"guide.html",enabled:true}],interval:5000};
const SAVED_HERO=getJSONSafe("duoduo_hero",null);
const OLD_HERO=["assets/ad3.png","assets/birthday.png"];
let HERO_SLIDES=SAVED_HERO?Object.assign({},DEFAULT_HERO_SLIDES,SAVED_HERO):structuredClone(DEFAULT_HERO_SLIDES);
if(!Array.isArray(HERO_SLIDES.slides)||!HERO_SLIDES.slides.length){
  const imgs=Array.isArray(HERO_SLIDES.images)&&HERO_SLIDES.images.length?HERO_SLIDES.images:DEFAULT_HERO_SLIDES.images;
  HERO_SLIDES.slides=imgs.map((image,i)=>({image,title:`多多谷宣傳 ${i+1}`,link:"",enabled:true}));
}
HERO_SLIDES.slides=HERO_SLIDES.slides.filter(x=>x&&x.image&&x.enabled!==false);
if(!HERO_SLIDES.slides.length){
  const fallbackImages=Array.isArray(HERO_SLIDES.images)&&HERO_SLIDES.images.length?HERO_SLIDES.images:DEFAULT_HERO_SLIDES.images;
  HERO_SLIDES.slides=fallbackImages.filter(Boolean).map((image,i)=>({image,title:`多多谷宣傳 ${i+1}`,link:"",enabled:true}));
}
HERO_SLIDES.images=HERO_SLIDES.slides.map(x=>x.image);
HERO_SLIDES.interval=Math.max(2000,Number(HERO_SLIDES.interval)||5000);

function initHeroCarousel(){
  const root=document.getElementById("heroCarousel");
  const track=document.getElementById("heroCarouselTrack");
  const dotsBox=document.getElementById("heroDots");
  const count=document.getElementById("heroCount");
  const pause=document.getElementById("heroPause");
  if(!root||!track||!dotsBox)return;
  const slidesData=HERO_SLIDES.slides;
  track.innerHTML=slidesData.map((slide,i)=>{const image=esc(slide.image);const alt=esc(slide.title||`多多谷宣傳圖片 ${i+1}`);return `<img class="hero-carousel-slide${i===0?" active":""}" src="${image}" alt="${alt}" loading="${i===0?"eager":"lazy"}" data-link="${esc(slide.link||"")}">`;}).join("");
  dotsBox.innerHTML=slidesData.map((_,i)=>`<button type="button" class="hero-carousel-dot${i===0?" active":""}" data-slide="${i}" aria-label="第 ${i+1} 張"></button>`).join("");
  const slides=[...track.querySelectorAll(".hero-carousel-slide")],dots=[...dotsBox.querySelectorAll(".hero-carousel-dot")];
  let index=0,timer=null,paused=false;
  const show=next=>{index=(next+slides.length)%slides.length;slides.forEach((el,i)=>el.classList.toggle("active",i===index));dots.forEach((el,i)=>el.classList.toggle("active",i===index));if(count)count.textContent=`${String(index+1).padStart(2,"0")} / ${String(slides.length).padStart(2,"0")}`};
  slides.forEach(slide=>slide.addEventListener("click",()=>{const link=slide.dataset.link||"";if(!link)return;if(/^https?:\/\//i.test(link))window.open(link,"_blank","noopener");else window.location.href=link;}));
  const start=()=>{clearInterval(timer);if(!paused&&slides.length>1)timer=setInterval(()=>show(index+1),HERO_SLIDES.interval)};
  document.getElementById("heroPrev")?.addEventListener("click",e=>{e.preventDefault();show(index-1);start()});
  document.getElementById("heroNext")?.addEventListener("click",e=>{e.preventDefault();show(index+1);start()});
  dots.forEach(d=>d.addEventListener("click",e=>{e.preventDefault();show(Number(d.dataset.slide)||0);start()}));
  pause?.addEventListener("click",e=>{e.preventDefault();paused=!paused;pause.textContent=paused?"▶":"Ⅱ";start()});
  show(0);start();
}

const SITE_SETTINGS=Object.assign({},DEFAULT_SITE_SETTINGS,getJSONSafe("duoduo_settings",{}));
SITE_SETTINGS.nav=Object.assign({},DEFAULT_SITE_SETTINGS.nav,SITE_SETTINGS.nav||{});
SITE_SETTINGS.footer=Object.assign({},DEFAULT_SITE_SETTINGS.footer,SITE_SETTINGS.footer||{});
Object.entries(LINKS).forEach(([key,url])=>document.querySelectorAll(`[data-link="${key}"]`).forEach(a=>a.href=url));
document.querySelectorAll("[data-nav]").forEach(el=>{const key=el.dataset.nav;if(SITE_SETTINGS.nav[key])el.textContent=SITE_SETTINGS.nav[key]});
const navOrder=Array.isArray(SITE_SETTINGS.navOrder)?SITE_SETTINGS.navOrder:['home','why','features','events','boss','news','guide','downloads'];
document.querySelectorAll('header .nav-pill[data-nav]').forEach(el=>el.dataset.navOrder=String(navOrder.indexOf(el.dataset.nav)));
const navContainers=new Set();document.querySelectorAll('header .nav-pill[data-nav]').forEach(el=>{if(el.parentElement)navContainers.add(el.parentElement)});navContainers.forEach(container=>{[...container.querySelectorAll('.nav-pill[data-nav]')].sort((a,b)=>(Number(a.dataset.navOrder)-Number(b.dataset.navOrder))).forEach(el=>container.appendChild(el))});
document.querySelectorAll("[data-footer]").forEach(el=>{const key=el.dataset.footer;if(SITE_SETTINGS.footer[key]!==undefined)el.textContent=SITE_SETTINGS.footer[key]});
const guideResources=document.getElementById("guide-resources-grid");
if(guideResources){
  guideResources.innerHTML=RESOURCES.filter(r=>r.enabled!==false).map(r=>`<article class="guide-resource-card"><div class="guide-resource-head"><div><span class="eyebrow">RESOURCE</span><h3>${esc(r.title)}</h3><p>${esc(r.desc||"")}</p></div><a class="btn btn-outline" href="${esc(r.url)}" target="_blank" rel="noopener">另開完整頁面 ↗</a></div>${r.embed!==false&&r.embedUrl?`<div class="guide-embed"><iframe src="${esc(r.embedUrl)}" loading="lazy" title="${esc(r.title)}" referrerpolicy="strict-origin-when-cross-origin"></iframe></div><div class="guide-embed-note">如果外部服務限制嵌入，仍可使用上方「另開完整頁面」正常查看。</div>`:`<div class="guide-open-only">此資源目前以外部頁面開啟。<a href="${esc(r.url)}" target="_blank" rel="noopener">立即開啟 ↗</a></div>`}</article>`).join("");
}


const downloadGrid=document.getElementById("download-grid");
if(downloadGrid){
  downloadGrid.innerHTML=DOWNLOADS.filter(d=>d.enabled!==false).map(d=>{
    const steps=String(d.instructions||"").split(/\n+/).filter(Boolean);
    return `<article class="download-card"><div class="download-card-top"><div><span class="tag">${esc(d.type||"下載")}</span><h3>${esc(d.title)}</h3><p>${esc(d.desc||"")}</p></div><a class="btn btn-gold" href="${esc(d.url)}" target="_blank" rel="noopener">立即下載 ↗</a></div>${d.image?`<div class="download-guide-image"><img src="${esc(d.image)}" alt="${esc(d.title)} 使用說明"></div>`:""}<div class="download-instructions"><h4>使用說明</h4><ol>${steps.map(step=>`<li>${esc(step.replace(/^\d+[.、]\s*/,""))}</li>`).join("")}</ol></div></article>`;}).join("")||`<div class="empty">目前沒有公開下載項目。</div>`;
}

// Theme: shared by every page.
const savedTheme=localStorage.getItem("duoduo_theme");
const preferred=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";
const initialTheme=savedTheme||preferred;
document.documentElement.dataset.theme=initialTheme;
function updateThemeButton(){const b=document.getElementById("themeToggle"),i=document.getElementById("themeIcon"),l=document.getElementById("themeLabel");if(!b)return;const light=document.documentElement.dataset.theme==="light";if(i)i.textContent=light?"☾":"☼";if(l)l.textContent=light?"深色模式":"淺色模式";b.title=light?"切換深色模式":"切換淺色模式"}
function toggleTheme(){const next=document.documentElement.dataset.theme==="light"?"dark":"light";document.documentElement.dataset.theme=next;localStorage.setItem("duoduo_theme",next);updateThemeButton()}
document.getElementById("themeToggle")?.addEventListener("click",toggleTheme);updateThemeButton();

const defaultNews=[{tag:"重要消息",title:"DuoDuo Valley 官方網站持續完善中",date:"2026/10/04",body:"多多谷官方網站正在持續整理遊戲資訊、活動與玩家資源。"},{tag:"活動資訊",title:"多多谷最新活動與福利，持續更新中",date:"2026/10/04",body:"活動檔期與福利資訊請以官方公告為準。"},{tag:"更新說明",title:"遊戲內容與系統資訊請留意官方公告",date:"2026/10/04",body:"系統、玩法與內容更新會陸續整理至官網。"},{tag:"序號發放",title:"最新序號與福利請留意官方公告",date:"2026/10/04",body:"官方發放的序號與福利資訊會集中整理。"}];
const defaultEvents=[{id:"e1",name:"多多谷活動",image:"assets/ad3.png",desc:"持續更新的活動與玩法，詳細內容請依官方公告為準。",start:"2026-10-01T00:00",end:"2026-10-31T23:59",url:"",published:true},{id:"e2",name:"福利活動",image:"assets/birthday.png",desc:"多多谷福利與社群活動資訊。",start:"2026-10-01T00:00",end:"2026-10-31T23:59",url:"",published:true}];
const defaultBosses=[{name:"多多谷 BOSS",image:"assets/boss.png",desc:"挑戰獨家 BOSS、副本與排行榜，讓養成不只是數字，而是下一個目標。"}];
const defaultReviews=[
  {id:"r1",rating:5,author:"玩家心得",text:"很多東西不用一直重複操作，玩起來比較舒服。"},
  {id:"r2",rating:5,author:"玩家心得",text:"活動蠻多的，不是每天只有掛著打怪。"},
  {id:"r3",rating:5,author:"玩家心得",text:"遇到問題有官方入口可以處理，這點很重要。"}
];
function eventStartTime(e){const t=Date.parse(e?.start||"");return Number.isNaN(t)?Number.MAX_SAFE_INTEGER:t;}
function sortEventsByStart(list){return [...list].sort((a,b)=>eventStartTime(a)-eventStartTime(b));}
function formatEventDate(value){if(!value)return "";const d=new Date(value);if(Number.isNaN(d.getTime()))return String(value);const pad=n=>String(n).padStart(2,"0");return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;}
function formatEventDateRange(e){const a=formatEventDate(e?.start),b=formatEventDate(e?.end);return a&&b?`${a} ～ ${b}`:(a||b||"");}
const news=getJSONSafe("duoduo_news",defaultNews),bosses=getJSONSafe("duoduo_bosses",defaultBosses),reviews=getJSONSafe("duoduo_reviews",defaultReviews);
let events=sortEventsByStart(getJSONSafe("duoduo_events",defaultEvents).filter(e=>e.published!==false));

const newsTagShort=t=>({"重要消息":"重要","維護通知":"維護","更新說明":"更新","活動資訊":"活動","序號發放":"序號","處分名單":"處分"}[t]||t);const newsList=document.getElementById("news-list");if(newsList)newsList.innerHTML=news.slice(0,6).map((n,i)=>`<a class="news-item" href="news.html#n-${i}"><span class="tag">${esc(newsTagShort(n.tag))}</span><div><h3>${esc(n.title)}</h3><p>${esc(n.body||"")}</p></div><time>${esc(n.date)}</time></a>`).join("");

function renderPublicEvents(){
  const eventGrid=document.getElementById("event-grid");
  if(!eventGrid)return;
  eventGrid.innerHTML=events.slice(0,3).map(e=>`<article class="event-card"><div class="event-image">${eventCarouselHTML(e)}</div><div class="event-copy"><span class="tag">檔期活動</span><h3>${esc(e.name)}</h3><p>${esc(e.desc)}</p><a class="text-link" href="event-detail.html?id=${encodeURIComponent(e.id||e.name)}">查看檔期活動 →</a></div></article>`).join("")||`<div class="empty">目前沒有公開活動。</div>`;
  initEventCarousels(eventGrid);
}

renderPublicEvents();

async function loadCloudEvents(){
  const API_BASE=window.location.hostname.endsWith("github.io")
    ? "https://duoduo-website.onrender.com"
    : "";

  try{
    const res=await fetch(`${API_BASE}/api/events`,{
      method:"GET",
      headers:{"Accept":"application/json"},
      cache:"no-store"
    });

    if(!res.ok)throw new Error(`HTTP ${res.status}`);

    const data=await res.json();
    const cloudEvents=Array.isArray(data.events)
      ? data.events.map(row=>row?.data||row).filter(e=>e&&e.published!==false)
      : [];

    if(cloudEvents.length){
      events=sortEventsByStart(cloudEvents);
      try{
        localStorage.setItem("duoduo_events",JSON.stringify(events));
      }catch{}

      renderPublicEvents();
    }
  }catch(error){
    console.warn("雲端活動讀取失敗，使用本機活動資料。",error);
  }
}

loadCloudEvents();
const bossHome=document.getElementById("boss-home-image");if(bossHome&&bosses[0])bossHome.src=bosses[0].image;
const reviewGrid=document.getElementById("review-grid");
if(reviewGrid){
  const orderedReviews=[...reviews].sort((a,b)=>{if(Boolean(b.featured)!==Boolean(a.featured))return b.featured?1:-1;return (Number(a.order)||0)-(Number(b.order)||0) || (Number(b.createdAt)||0)-(Number(a.createdAt)||0);});
  reviewGrid.innerHTML=orderedReviews.map((r,i)=>{
    const rating=Math.max(1,Math.min(5,Number(r.rating)||5));
    const stars="★".repeat(rating)+"☆".repeat(5-rating);
    return `<article class="review-card${i===0&&orderedReviews.length>2?" featured-review":""}" tabindex="0" role="button" data-review-index="${i}" aria-label="查看完整玩家心得"><div class="review-stars" aria-label="${rating} 顆星">${stars}</div><p>「${esc(r.text||"")}」</p><small>— ${esc(r.author||"玩家心得")}</small><span class="review-read-more">點擊查看完整心得 →</span></article>`;
  }).join("")||`<div class="empty">目前還沒有玩家心得。</div>`;

  // 玩家心得：固定卡片高度，長文以摘要呈現，點擊後用彈窗查看完整內容。
  if(!document.getElementById("reviewExpandStyles")){
    const style=document.createElement("style");
    style.id="reviewExpandStyles";
    style.textContent=`
      .review-card{height:240px;min-height:240px;box-sizing:border-box;overflow:hidden;position:relative;cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;}
      .review-card:hover{transform:translateY(-2px);}
      .review-card:focus-visible{outline:2px solid var(--gold,#eab44d);outline-offset:3px;}
      .review-card p{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:6;overflow:hidden;}
      .review-read-more{position:absolute;left:24px;right:24px;bottom:18px;font-size:12px;color:var(--gold,#eab44d);opacity:.9;}
      .review-card p{margin-bottom:38px;}
      .review-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(3,10,18,.72);backdrop-filter:blur(5px);}
      .review-modal[hidden]{display:none;}
      .review-modal-box{width:min(680px,calc(100vw - 40px));max-height:min(80vh,620px);overflow:auto;box-sizing:border-box;padding:28px;border:1px solid var(--line,#294057);border-radius:20px;background:var(--panel,#0d1827);box-shadow:0 24px 70px rgba(0,0,0,.4);position:relative;}
      .review-modal-close{position:absolute;top:14px;right:16px;width:34px;height:34px;border:1px solid var(--line,#294057);border-radius:50%;background:transparent;color:var(--text,#fff);font-size:22px;line-height:1;cursor:pointer;}
      .review-modal-stars{color:var(--gold,#eab44d);letter-spacing:2px;font-size:18px;margin-bottom:14px;}
      .review-modal-text{margin:0 34px 18px 0;color:var(--text,#fff);font-size:15px;line-height:1.9;white-space:pre-wrap;word-break:break-word;}
      .review-modal-author{color:var(--muted,#9fb0c5);font-size:13px;}
      @media(max-width:700px){.review-card{height:220px;min-height:220px}.review-read-more{left:20px;right:20px}.review-modal{padding:16px}.review-modal-box{padding:24px 20px;border-radius:16px;}}
    `;
    document.head.appendChild(style);
  }

  let reviewModal=document.getElementById("reviewModal");
  if(!reviewModal){
    reviewModal=document.createElement("div");
    reviewModal.id="reviewModal";
    reviewModal.className="review-modal";
    reviewModal.hidden=true;
    reviewModal.innerHTML=`<div class="review-modal-box" role="dialog" aria-modal="true" aria-labelledby="reviewModalTitle"><button type="button" class="review-modal-close" aria-label="關閉">×</button><div id="reviewModalTitle" class="review-modal-stars"></div><p class="review-modal-text"></p><div class="review-modal-author"></div></div>`;
    document.body.appendChild(reviewModal);
  }
  const openReview=(index)=>{
    const r=orderedReviews[index];
    if(!r)return;
    const rating=Math.max(1,Math.min(5,Number(r.rating)||5));
    reviewModal.querySelector(".review-modal-stars").textContent="★".repeat(rating)+"☆".repeat(5-rating);
    reviewModal.querySelector(".review-modal-text").textContent=`「${r.text||""}」`;
    reviewModal.querySelector(".review-modal-author").textContent=`— ${r.author||"玩家心得"}`;
    reviewModal.hidden=false;
    document.body.style.overflow="hidden";
    reviewModal.querySelector(".review-modal-close").focus();
  };
  const closeReview=()=>{reviewModal.hidden=true;document.body.style.overflow="";};
  reviewGrid.querySelectorAll(".review-card").forEach(card=>{
    const open=()=>openReview(Number(card.dataset.reviewIndex));
    card.addEventListener("click",open);
    card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
  });
  reviewModal.querySelector(".review-modal-close").onclick=closeReview;
  reviewModal.onclick=e=>{if(e.target===reviewModal)closeReview();};
  if(!reviewModal.dataset.escapeReady){
    reviewModal.dataset.escapeReady="1";
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!reviewModal.hidden)closeReview();});
  }
}
const DEFAULT_LAYOUT={sections:[{id:"hero",visible:true},{id:"new-player",visible:true},{id:"why",visible:true},{id:"about",visible:true},{id:"quick-intro",visible:true},{id:"features",visible:true},{id:"events",visible:true},{id:"boss",visible:true},{id:"community",visible:true},{id:"stay",visible:true},{id:"news",visible:true},{id:"versions",visible:true},{id:"start",visible:true},{id:"quick-links",visible:true}],featureColumns:3,heroEyebrow:"DUODUO VALLEY · V282",heroTitle:"同樣都是楓之谷，為什麼是多多谷？",heroSubtitle:"不是只換一個版本、調一組倍率。\n我們更在意：你上線之後，有沒有東西玩、有人一起玩，也有沒有值得留下來的理由。",aboutTitle:"一個正在慢慢變熱鬧的小小世界"};
const siteLayout=getJSONSafe("duoduo_layout",DEFAULT_LAYOUT),main=document.querySelector("main");
// Keep older saved layouts compatible when new homepage sections are added.
if(siteLayout.sections){const existing=new Set(siteLayout.sections.map(x=>x.id));DEFAULT_LAYOUT.sections.forEach(x=>{if(!existing.has(x.id))siteLayout.sections.push({...x})})}
if(main){const map=new Map([...main.querySelectorAll(":scope > section")].map(el=>[el.id,el]));(siteLayout.sections||DEFAULT_LAYOUT.sections).forEach(item=>{const el=map.get(item.id);if(!el)return;el.style.display=item.visible===false?"none":"";main.appendChild(el)})}
const DEFAULT_CONTENT={
  hero:{eyebrow:"DUODUO VALLEY · V282",title:"同樣都是楓之谷，為什麼是多多谷？",subtitle:"不是只換一個版本、調一組倍率。\n我們更在意：你上線之後，有沒有東西玩、有人一起玩，也有沒有值得留下來的理由。"},
  newPlayer:{eyebrow:"FOR NEW PLAYERS",title:"第一次來多多谷？",desc:"不用先研究一大堆名詞，只要 3 個步驟，就能開始你的冒險。",steps:[{title:"了解多多谷",desc:"先看看特色系統、玩法與世界觀。"},{title:"下載登入器",desc:"依照遊玩指南完成下載與設定。"},{title:"開始你的冒險",desc:"進入遊戲，和大家一起玩。"}]},
  why:{title:"你真正想知道的，這裡直接告訴你。",desc:"第一次看到多多谷，不需要先研究一堆名詞。先看看它能不能成為你想長期玩的那個服。",cards:[{title:"有內容",desc:"輪迴、陣營、強化、掛機、學院、BOSS、副本與各式特色活動，讓角色養成不只有一條路。"},{title:"夠方便",desc:"資源找回、掃蕩、裝備繼承、掛機等便利機制，減少重複操作，把時間留給真正想玩的內容。"},{title:"有人一起玩",desc:"打王、聊天、活動與競爭都不只是單機體驗，讓你有機會找到一起玩的玩家。"},{title:"找得到人",desc:"遊戲問題、BUG、活動疑問都有明確的官方處理入口，遇到問題不是只能自己摸索。"},{title:"福利持續有",desc:"特權、活動、限定福利與各式玩家企劃會持續推出，不只一次性活動。"},{title:"現在加入剛剛好",desc:"不用等下一個新服。版本持續更新，現在就能開始自己的進度。"}]},
  about:{title:"一個正在慢慢變熱鬧的小小世界",desc:"多多谷不只是一個伺服器，更是一個讓大家相聚、冒險與成長的家。",overlayTitle:"找到屬於自己的玩法",overlayDesc:"豐富且持續更新的遊戲內容、溫暖友善的社群環境、定期舉辦的活動與福利，以及用心傾聽玩家建議與回饋的世界。",image:"assets/logo3.jpg"},
  quickIntro:{title:"快速認識多多谷",desc:"不用一次看完所有系統，先從你最有興趣的地方開始。",cards:[{title:"輪迴 × 天賦",desc:"長期角色養成，慢慢打造屬於自己的成長方向。"},{title:"BOSS × 副本",desc:"角色變強之後，還有新的目標等著你挑戰。"},{title:"活動 × 休閒",desc:"練等之外，也有 BINGO、OX、拳王等不同玩法。"},{title:"便利 × 生活",desc:"掛機、掃蕩、資源找回等，讓日常遊玩更舒服。"}]},
  features:{title:"多多谷，不只是打怪練等。",desc:"把系統分類給你看，想深入了解再慢慢探索。",cards:[{title:"角色養成",desc:"輪迴、天賦、強化、裝備繼承等內容，讓角色成長有長期目標。",small:"輪迴系統 · 天賦系統 · 強化系統 · 裝備繼承"},{title:"挑戰內容",desc:"BOSS、副本、學院與排行榜，給想追求成長的玩家目標。"},{title:"休閒玩法",desc:"BINGO、OX、拳王爭霸、我的小屋等，練等之外也有事情做。"},{title:"便利功能",desc:"掛機、掃蕩、資源找回等，降低重複操作的負擔。"}]},
  events:{title:"正在進行的檔期活動"},boss:{title:"挑戰更高的極限",desc:"獨家 BOSS、副本與排行榜，讓養成不只是數字，而是下一場挑戰的開始。"},
  community:{title:"一個私服好不好玩，玩家氣氛很重要。",desc:"多多谷不只希望你玩遊戲，也希望你能找到一起玩的玩家。",copyTitle:"不是一個人慢慢玩",copyDesc:"從打王、活動到日常聊天，多多谷希望玩家之間有交流、有目標，也有一起留下來的理由。"},
  stay:{title:"為什麼不是玩幾天就離開？",desc:"多多谷想做的，不只是讓你下載遊戲，而是讓你有下一個想完成的目標。",cards:[{title:"一直有東西可以玩",desc:"系統、活動、BOSS 與副本持續整理與更新，讓角色成長之後還有新的方向。"},{title:"進度是自己的",desc:"從養成、天賦到挑戰內容，不要求所有人走同一條路，慢慢建立自己的角色。"},{title:"有人一起玩",desc:"社群、活動、打王與玩家交流，讓你留下來的理由不只是一張角色數值表。"}]},
  news:{title:"最新消息"},versions:{title:"多多谷一直在往前走",desc:"版本不是結束，而是下一段內容的開始。"},start:{title:"現在，你知道為什麼是多多谷了。",desc:"不用等下一個新服。如果你正在找一個有內容、有人玩、持續更新的楓之谷私服，歡迎來看看。"},quickLinks:{title:"玩家常用入口"}
};
const siteContent=getJSONSafe("duoduo_content",DEFAULT_CONTENT);
const heroEyebrow=document.getElementById("hero-eyebrow"),heroTitle=document.getElementById("hero-title"),heroSubtitle=document.getElementById("hero-subtitle"),aboutTitle=document.getElementById("about-title");
if(heroEyebrow)heroEyebrow.textContent=siteContent.hero?.eyebrow||siteLayout.heroEyebrow||DEFAULT_LAYOUT.heroEyebrow;
if(heroTitle){const t=siteContent.hero?.title||siteLayout.heroTitle||DEFAULT_LAYOUT.heroTitle;const p=t.split("，");heroTitle.innerHTML=p.length>1?`${esc(p[0])}，<br><em>${esc(p.slice(1).join("，"))}</em>`:esc(t)}
if(heroSubtitle)heroSubtitle.innerHTML=esc(siteContent.hero?.subtitle||siteLayout.heroSubtitle||DEFAULT_LAYOUT.heroSubtitle).replace(/\n/g,"<br>");
if(aboutTitle)aboutTitle.textContent=siteLayout.aboutTitle||DEFAULT_LAYOUT.aboutTitle;
function setText(id,val){const el=document.getElementById(id);if(el&&val!==undefined)el.textContent=val}
setText("newPlayerTitle",siteContent.newPlayer?.title);setText("newPlayerDesc",siteContent.newPlayer?.desc);setText("whyTitle",siteContent.why?.title);setText("whyDesc",siteContent.why?.desc);setText("aboutTitle",siteContent.about?.title);setText("aboutDesc",siteContent.about?.desc);setText("aboutOverlayTitle",siteContent.about?.overlayTitle);setText("aboutOverlayDesc",siteContent.about?.overlayDesc);setText("quickIntroTitle",siteContent.quickIntro?.title);setText("quickIntroDesc",siteContent.quickIntro?.desc);setText("featuresTitle",siteContent.features?.title);setText("featuresDesc",siteContent.features?.desc);setText("eventsTitle",siteContent.events?.title);setText("bossTitle",siteContent.boss?.title);setText("bossDesc",siteContent.boss?.desc);setText("communityTitle",siteContent.community?.title);setText("communityDesc",siteContent.community?.desc);setText("communityCopyTitle",siteContent.community?.copyTitle);setText("communityCopyDesc",siteContent.community?.copyDesc);setText("stayTitle",siteContent.stay?.title);setText("stayDesc",siteContent.stay?.desc);setText("newsTitle",siteContent.news?.title);setText("versionsTitle",siteContent.versions?.title);setText("versionsDesc",siteContent.versions?.desc);setText("startTitle",siteContent.start?.title);setText("startDesc",siteContent.start?.desc);setText("quickLinksTitle",siteContent.quickLinks?.title);
if(siteContent.about?.image){const el=document.getElementById("aboutImage");if(el)el.src=siteContent.about.image}
(siteContent.why?.cards||[]).forEach((c,i)=>{const a=document.querySelector(`[data-why-title="${i}"]`),b=document.querySelector(`[data-why-desc="${i}"]`);if(a)a.textContent=c.title;if(b)b.textContent=c.desc});
(siteContent.quickIntro?.cards||[]).forEach((c,i)=>{const a=document.querySelector(`[data-quick-title="${i}"]`),b=document.querySelector(`[data-quick-desc="${i}"]`);if(a)a.textContent=c.title;if(b)b.textContent=c.desc});
(siteContent.features?.cards||[]).forEach((c,i)=>{const a=document.querySelector(`[data-feature-title="${i}"]`),b=document.querySelector(`[data-feature-desc="${i}"]`);if(a)a.textContent=c.title;if(b)b.textContent=c.desc;if(i===0&&c.small){const x=document.getElementById("featureSmall0");if(x)x.textContent=c.small}});
(siteContent.stay?.cards||[]).forEach((c,i)=>{const a=document.querySelector(`[data-stay-title="${i}"]`),b=document.querySelector(`[data-stay-desc="${i}"]`);if(a)a.textContent=c.title;if(b)b.textContent=c.desc});

const featureGrid=document.getElementById("feature-grid");if(featureGrid)featureGrid.style.gridTemplateColumns=`repeat(${Math.max(2,Math.min(4,Number(siteLayout.featureColumns)||3))},minmax(0,1fr))`;
initHeroCarousel();
