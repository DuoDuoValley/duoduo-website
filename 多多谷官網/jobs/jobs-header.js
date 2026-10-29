/* 使用官網現有儲值與 Discord 連結設定；不重新載入 app.js 或影響技能資料。 */
(()=>{'use strict';
 const defaults={topup:'https://fd-pay.com/ARrbXO',discord:'https://discord.gg/duoduovalley'};
 const oldNames={topup:'儲值',discord:'Discord'};
 let saved={};
 try{saved=JSON.parse(sessionStorage.getItem('duoduo_cloud_duoduo_links')||localStorage.getItem('duoduo_links')||'{}')||{}}catch{}
 for(const [key,fallback] of Object.entries(defaults)){
   const configured=saved[key]??saved[oldNames[key]];
   const href=(typeof configured==='string'&&/^https:\/\//i.test(configured))?configured:fallback;
   document.querySelectorAll(`[data-link="${key}"]`).forEach(a=>{a.href=href;a.rel='noopener noreferrer'});
 }
})();
