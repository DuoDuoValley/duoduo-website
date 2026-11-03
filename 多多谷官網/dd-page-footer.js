/* Use the site's already-synced link/footer settings on feature-page footers. */
(()=>{'use strict';
 const root=document.querySelector('footer.dd-unified-footer');if(!root)return;
 const json=(name)=>{for(const key of ['duoduo_cloud_'+name,name])try{const v=(key.startsWith('duoduo_cloud_')?sessionStorage:localStorage).getItem(key);if(v!==null)return JSON.parse(v)}catch(_){}return null};
 const links=json('duoduo_links')||{},settings=json('duoduo_settings')||{};
 const legacy={topup:'儲值入口',guide:'遊玩指南',rates:'機率型道具說明',products:'上架商品',checklist:'每日 Checklist',discord:'Discord'};
 for(const a of root.querySelectorAll('[data-link]')){
  const key=a.dataset.link,url=links[key]||links[legacy[key]];
  if(typeof url==='string'&&/^https:\/\/[^\s<>]+$/i.test(url))a.href=url;
 }
 const values=settings.footer||{};
 for(const e of root.querySelectorAll('[data-footer]'))if(typeof values[e.dataset.footer]==='string')e.textContent=values[e.dataset.footer];
})();
