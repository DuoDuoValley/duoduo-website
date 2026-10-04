DuoDuo Valley｜多多谷 官方網站 V4 完整前端原型

本版本整合 V1 的文案與資訊架構，以及 V3 的品牌視覺、活動/BOSS/公告/遊玩指南與後台原型。

新增：
- 深色／淺色模式切換，所有頁面共用並記住設定
- V1 的 WHY DUODUO／特色介紹／社群／Ready to Play 文案融入首頁
- V3 的活動、BOSS、公告、遊玩指南、玩家資源保留
- start.bat：Windows 雙擊即可啟動本機網站
- server.js：無第三方套件的簡易靜態伺服器
- package.json：可用 npm start 啟動

目前仍是前端原型：
- 後台資料使用 localStorage，尚未接正式資料庫
- 尚未加入遊戲帳號註冊／MariaDB
- 尚未加入登入
- Discord 僅保留加入 Discord 入口，不同步頻道或訊息

啟動：
1. Windows 直接雙擊 start.bat
2. 或在此資料夾執行：node server.js
3. 瀏覽器開啟：http://localhost:3000

注意：正式上線前仍需將 localStorage 後台資料改為真正的 Backend + Database。


本版本新增：首頁新手三步驟、快速認識多多谷、為什麼留下來、版本紀錄，以及更具視覺層次的首頁導覽列與主視覺。深色／淺色模式共用。

V6 changes: new navigation style, latest news nav item, transparent DuoDuo logo, clickable event detail pages, and homepage content editor in Admin.


V10 新增：下載專區、遊戲橘子遊戲管理器、版本更新檔、DuoDuo 登入器與整合包管理；所有下載網址、簡介、使用說明、說明圖片與顯示狀態皆可由後台編輯。

V14：首頁主視覺輪播維持原 V10 主視覺框尺寸與比例，僅加入輪播功能，不放大主視覺。


V21 檔期活動圖片修正版：後台選取的檔期活動圖片會實際上傳至 assets/uploads/，活動資料只保存圖片路徑。請使用 start.bat 以 http://localhost:3000 開啟網站。
