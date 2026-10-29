/* DuoDuo maintenance administration. Requires valid Render admin session. */
(()=>{'use strict';
 const base=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
 const $=id=>document.getElementById(id);
 const status=$('ddMaintStatus'),enable=$('ddMaintEnable'),disable=$('ddMaintDisable'),reload=$('ddMaintReload');
 if(!status||!enable||!disable||!reload)return;
 let current=null,busy=false;
 const buttons=[enable,disable,reload];
 function setStatus(text,state=''){status.textContent=text;status.className='dd-maint-state'+(state?' dd-'+state:'')}
 function lock(value){busy=value;buttons.forEach(x=>x.disabled=value)}
 function token(){try{return sessionStorage.getItem('duoduo_admin_session')||''}catch{return ''}}
 async function request(url,opts={}){const res=await fetch(base+url,{cache:'no-store',...opts});const data=await res.json().catch(()=>({}));if(!res.ok||!data.ok)throw new Error(data.error||'HTTP '+res.status);return data}
 async function load(){if(busy)return;lock(true);try{
   const result=await request('/api/maintenance');current=!!result.enabled;
   $('ddMaintTitle').value=String(result.title||'多多谷官網維護中');$('ddMaintMessage').value=String(result.message||'官網正在進行維護與調整，請稍後再回來看看。');
   setStatus(current?'網站目前正在維護｜訪客只看到維護畫面':'網站目前正常開放｜玩家可瀏覽官網',current?'on':'off');
 }catch(err){current=null;setStatus('讀取失敗：'+err.message+'。請確認 Render 已更新 server.js，且後端服務可連線。','error')}finally{lock(false)}}
 async function save(wantOn){if(busy)return;if(!token())return setStatus('後台登入已失效，請重新登入。','error');
   if(wantOn&&!current&&!confirm('確定啟用官網維護模式？玩家將改看到維護頁面。'))return;
   if(!wantOn&&current&&!confirm('確定結束維護模式，讓玩家重新進入官網？'))return;
   const title=$('ddMaintTitle').value.trim();const message=$('ddMaintMessage').value.trim();
   if(!title||!message){setStatus('請填寫維護頁標題及公告內容。','error');return}
   lock(true);setStatus('正在儲存至伺服器…');
   try{const payload=await request('/api/maintenance',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token()},body:JSON.stringify({enabled:wantOn,title,message})});current=!!payload.enabled;
    setStatus(current?'維護模式已啟用，訪客畫面即將更新。':'維護模式已關閉，訪客可重新進入官網。',current?'on':'off');
   }catch(err){setStatus('儲存失敗，狀態尚未確認：'+err.message,'error')}
   finally{lock(false)}
 }
 enable.addEventListener('click',()=>save(true));disable.addEventListener('click',()=>save(false));reload.addEventListener('click',load);
 // Allow updating copy while maintenance is already on, without changing enabled state.
 enable.addEventListener('mouseenter',()=>{enable.title=current?'維護中：按這裡可更新公告內容':'啟用網站維護'})
 document.querySelector('[data-panel="maintenancePanel"]')?.addEventListener('click',load);
 window.addEventListener('duoduo-admin-authenticated',()=>{if(document.querySelector('#maintenancePanel.panel.active'))load()});
})();
