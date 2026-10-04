@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "server.js" (
  echo 找不到 server.js，請確認檔案完整。
  pause
  exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo 找不到 Node.js。
  echo 請先安裝 Node.js 18 或以上版本。
  echo.
  pause
  exit /b 1
)
echo.
echo ========================================
echo   DuoDuo Valley 官方網站
 echo ========================================
echo.
echo 正在啟動網站：http://localhost:3000
start "" "http://localhost:3000"
node server.js
pause
