/* Official site header for the standalone Legion planner, no solver dependencies. */
(()=>{'use strict';
 const root=document.documentElement,btn=document.getElementById('themeToggle');
 function displayTheme(){const light=root.dataset.theme!=='dark';root.dataset.theme=light?'light':'dark';
  const icon=document.getElementById('themeIcon'),label=document.getElementById('themeLabel');
  if(icon)icon.textContent=light?'☾':'☼';if(label)label.textContent=light?'深色模式':'淺色模式';
  if(btn)btn.title=light?'切換深色模式':'切換淺色模式';}
 btn?.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
  try{localStorage.setItem('duoduo_theme',root.dataset.theme)}catch(_){}displayTheme()});
 window.addEventListener('storage',e=>{if(e.key==='duoduo_theme'){root.dataset.theme=e.newValue==='dark'?'dark':'light';displayTheme()}});
 displayTheme();
 let saved={};try{saved=JSON.parse(sessionStorage.getItem('duoduo_cloud_duoduo_links')||localStorage.getItem('duoduo_links')||'{}')||{}}catch(_){}
 const defaults={topup:'https://fd-pay.com/ARrbXO',discord:'https://discord.gg/duoduovalley'};
 for(const [key,fallback] of Object.entries(defaults)){
  const value=saved[key]??saved[key==='topup'?'儲值':'Discord'];
  const href=typeof value==='string'&&/^https:\/\//i.test(value)?value:fallback;
  document.querySelectorAll(`[data-link="${key}"]`).forEach(a=>{a.href=href;a.rel='noopener noreferrer'});
 }
})();
