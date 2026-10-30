/* DuoDuo maintenance administration. Requires valid Render admin session. */
(()=>{'use strict';
 const base=location.hostname.endsWith('github.io')?'https://duoduo-website.onrender.com':'';
 const $=id=>document.getElementById(id);
 const status=$('ddMaintStatus'),enable=$('ddMaintEnable'),disable=$('ddMaintDisable'),reload=$('ddMaintReload');
 if(!status||!enable||!disable||!reload)return;
 let current=null,busy=false;
 const preview=document.createElement('button');
 preview.type='button';preview.id='ddMaintPreview';preview.className='ghost';
 preview.textContent='🔒 開啟管理員預覽';
 preview.title='僅已登入管理員可進入維護期間的完整官網，預覽中不會自動重新整理';
 reload.after(preview);
 const buttons=[enable,disable,reload,preview];
 function setStatus(text,state=''){status.textContent=text;status.className='dd-maint-state'+(state?' dd-'+state:'')}
 function lock(value){busy=value;buttons.forEach(x=>x.disabled=value)}
 function token(){try{return sessionStorage.getItem('duoduo_admin_session')||''}catch{return ''}}
 async function request(url,opts={}){const res=await fetch(base+url,{cache:'no-store',...opts});const data=await res.json().catch(()=>({}));if(!res.ok||!data.ok)throw new Error(data.error||'HTTP '+res.status);return data}
 async function load(){if(busy)return;lock(true);try{
   const result=await request('/api/maintenance');current=!!result.enabled;
   $('ddMaintTitle').value=String(result.title||'多多谷官方網站維護中');$('ddMaintMessage').value=String(result.message||'親愛的多多谷玩家您好：\n\n為提供更穩定、完善的網站服務，多多谷官方網站目前正在進行系統維護與功能調整，相關頁面將暫時停止開放。\n\n維護完成後，網站將恢復正常使用。造成不便，敬請見諒，感謝您的耐心等候與支持。\n\n最新維護進度及相關消息，請留意多多谷官方 Discord 公告。');
   enable.textContent=current?'儲存並更新維護公告':'啟用維護模式';
   setStatus(current?'網站目前正在維護｜訪客只看到維護畫面':'網站目前正常開放｜玩家可瀏覽官網',current?'on':'off');
 }catch(err){current=null;setStatus('讀取失敗：'+err.message+'。請確認 Render 已更新 server.js，且後端服務可連線。','error')}finally{lock(false)}}
 async function save(wantOn){if(busy)return;if(!token())return setStatus('後台登入已失效，請重新登入。','error');
   if(wantOn&&!current&&!confirm('確定啟用官網維護模式？玩家將改看到維護頁面。'))return;
   if(!wantOn&&current&&!confirm('確定結束維護模式，讓玩家重新進入官網？'))return;
   const title=$('ddMaintTitle').value.trim();const message=$('ddMaintMessage').value.trim();
   if(!title||!message){setStatus('請填寫維護頁標題及公告內容。','error');return}
   lock(true);setStatus('正在儲存至伺服器…');
   try{const payload=await request('/api/maintenance',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token()},body:JSON.stringify({enabled:wantOn,title,message})});current=!!payload.enabled;enable.textContent=current?'儲存並更新維護公告':'啟用維護模式';
    setStatus(current?'維護模式已啟用，訪客畫面即將更新。':'維護模式已關閉，訪客可重新進入官網。',current?'on':'off');
   }catch(err){setStatus('儲存失敗，狀態尚未確認：'+err.message,'error')}
   finally{lock(false)}
 }
 preview.addEventListener('click',async()=>{
   if(busy)return;
   const adminToken=token();
   if(!adminToken)return setStatus('請先登入後台，再開啟管理員預覽。','error');
   // Open synchronously on user gesture so popup blockers do not interfere.
   // about:blank inherits the exact same origin; the token stays in sessionStorage,
   // never in a query string, URL fragment, referer or server logs.
   const child=window.open('about:blank','_blank');
   if(!child)return setStatus('瀏覽器阻擋了新視窗，請允許本站開啟分頁。','error');
   preview.disabled=true;
   try{
     const result=await fetch(base+'/api/admin/me',{cache:'no-store',headers:{Authorization:'Bearer '+adminToken,Accept:'application/json'}});
     const identity=await result.json().catch(()=>({}));
     if(!result.ok||identity?.ok!==true)throw Error('管理員登入已失效，請重新登入後台。');
     child.sessionStorage.setItem('duoduo_admin_session',adminToken);
     child.sessionStorage.setItem('duoduo_maintenance_admin_preview_v1','1');
     child.sessionStorage.setItem('duoduo_maintenance_admin_return_v1',location.href);
     child.location.replace(new URL('index.html',location.href).href);
     setStatus('已開啟管理員專屬預覽。預覽期間不會自動重整；請按預覽工具列的「重新載入預覽」檢查修改。',current?'on':'off');
   }catch(error){try{child.close()}catch(_){}setStatus('無法開啟預覽：'+(error?.message||'驗證失敗'),'error')}
   finally{preview.disabled=false}
 });
 enable.addEventListener('click',()=>save(true));disable.addEventListener('click',()=>save(false));reload.addEventListener('click',load);
 // Allow updating copy while maintenance is already on, without changing enabled state.
 enable.addEventListener('mouseenter',()=>{enable.title=current?'維護中：按這裡可更新公告內容':'啟用網站維護'})
 document.querySelector('[data-panel="maintenancePanel"]')?.addEventListener('click',load);
 window.addEventListener('duoduo-admin-authenticated',()=>{if(document.querySelector('#maintenancePanel.panel.active'))load()});
})();
