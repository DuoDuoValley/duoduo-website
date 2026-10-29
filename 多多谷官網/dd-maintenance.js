/* DuoDuo public maintenance screen. This is a visual gate for static GitHub Pages,
   not security/access control. Server-side publishing must use authenticated APIs. */
(()=>{'use strict';
 if(document.documentElement.hasAttribute('data-dd-maintenance-guard'))return;
 document.documentElement.setAttribute('data-dd-maintenance-guard','1');
 document.documentElement.classList.add('dd-maintenance-checking');
 const own=document.currentScript;
 const base=own?.src?new URL('./',own.src):new URL('./',location.href);
 const api=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
 const css=document.createElement('style');css.id='dd-maintenance-style';css.textContent=`
 html.dd-maintenance-checking body,html.dd-maintenance-on body{visibility:hidden!important;pointer-events:none!important}
 html.dd-maintenance-on{overflow:hidden!important}
 #dd-maintenance-screen{position:fixed;z-index:2147483647;inset:0;overflow-y:auto;box-sizing:border-box;display:none;align-items:center;justify-content:center;padding:28px 16px;background:radial-gradient(circle at 80% 10%,#1d4352 0,transparent 45%),linear-gradient(130deg,#081a2c,#0e3140);color:#eaf6ff;font-family:"Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif;visibility:visible!important;pointer-events:auto!important}
 html.dd-maintenance-on #dd-maintenance-screen{display:flex}
 #dd-maintenance-screen .dd-maint-panel{text-align:center;max-width:690px;width:100%;box-sizing:border-box;padding:clamp(25px,5vw,62px) clamp(20px,5vw,55px);border:1px solid rgba(155,223,235,.3);border-radius:23px;background:rgba(9,29,44,.82);box-shadow:0 30px 100px #0006}
 #dd-maintenance-screen img{display:block;object-fit:contain;max-width:min(180px,65vw);max-height:98px;height:auto;margin:0 auto 24px}
 #dd-maintenance-screen .dd-maint-eyebrow{letter-spacing:.22em;font-size:11px;font-weight:800;color:#80d7e7}
 #dd-maintenance-screen h1{font-size:clamp(26px,5vw,42px);line-height:1.3;letter-spacing:.03em;color:#f2fdff;margin:16px auto 18px}
 #dd-maintenance-screen p{line-height:1.9;font-size:clamp(14px,2vw,16px);white-space:pre-line;overflow-wrap:anywhere;color:#bfd5e4;margin:0 auto 24px}
 #dd-maintenance-screen button{border:1px solid #83cadc;background:#153c52;color:#efffff;border-radius:999px;padding:11px 23px;font:inherit;font-weight:750;cursor:pointer}
 #dd-maintenance-screen button:hover{background:#245772}
 #dd-maintenance-screen .dd-maint-note{color:#8eadc0;font-size:12px;margin-top:19px}
 `;document.head.appendChild(css);
 let panel=null,visible=false,working=false,lastKnown=null;
 function make(){if(panel)return panel;panel=document.createElement('div');panel.id='dd-maintenance-screen';panel.setAttribute('role','main');panel.innerHTML=`<div class="dd-maint-panel"><img src="${new URL('assets/logo1-header.png',base).href}" alt="多多谷"><div class="dd-maint-eyebrow">DUODUO VALLEY · MAINTENANCE</div><h1 id="dd-maint-title">多多谷官網維護中</h1><p id="dd-maint-message">官網正在進行維護與調整，請稍後再回來看看。</p><button id="dd-maint-check" type="button">重新檢查維護狀態</button><div class="dd-maint-note" id="dd-maint-note">維護完成後，本頁將自動恢復。</div></div>`;document.documentElement.appendChild(panel);panel.querySelector('button').addEventListener('click',()=>check(true));return panel}
 function show(data){if(!document.body){document.addEventListener('DOMContentLoaded',()=>show(data),{once:true});return;}make();panel.querySelector('#dd-maint-title').textContent=String(data.title||'多多谷官網維護中');panel.querySelector('#dd-maint-message').textContent=String(data.message||'官網正在進行維護與調整，請稍後再回來看看。');
   document.documentElement.classList.remove('dd-maintenance-checking');document.documentElement.classList.add('dd-maintenance-on');visible=true;
   try{document.querySelectorAll('audio,video').forEach(el=>el.pause())}catch{}
 }
 function hide(){document.documentElement.classList.remove('dd-maintenance-checking','dd-maintenance-on');visible=false}
 async function check(manual=false){if(working)return;working=true;
   if(manual&&panel)panel.querySelector('#dd-maint-note').textContent='正在檢查最新狀態…';
   const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),6000);
   try{const res=await fetch(api+'/api/maintenance?check='+Date.now(),{cache:'no-store',signal:ctrl.signal});if(!res.ok)throw Error('HTTP '+res.status);
     const result=await res.json();if(result.ok!==true||typeof result.enabled!=='boolean')throw Error('maintenance status unavailable');
     lastKnown=result;
     if(result.enabled){show(result);if(panel)panel.querySelector('#dd-maint-note').textContent='維護完成後，本頁將自動恢復。'}
     else if(visible){location.reload()}
     else hide();
   }catch(e){if(visible){if(panel)panel.querySelector('#dd-maint-note').textContent='暫時無法取得伺服器狀態，請稍後再試。';}
     else hide(); /* Fail open if Render is asleep/offline. Static hosting cannot deny requests. */
   }finally{clearTimeout(timer);working=false}
 }
 // Checks begin immediately, before page body renders; later checks monitor an open tab.
 check();setInterval(()=>{if(document.visibilityState==='visible')check()},30000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
})();
