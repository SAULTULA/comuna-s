@echo off
title Comuna-S — Iniciando...
color 0B

echo.
echo  ==========================================
echo   COMUNA-S  -  Inicio de servidores
echo  ==========================================
echo.

set ROOT=%~dp0
set FRONTEND=%ROOT%frontend
set BACKEND=%ROOT%backend
set ADMIN=%ROOT%admin

:: ── Liberar puertos ocupados ────────────────────────────
echo  Liberando puertos en uso...

for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3500 "') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":4000 "') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 "') do (
    taskkill /f /pid %%a >nul 2>&1
)

timeout /t 1 /nobreak >nul

:: ── Iniciar servidores en ventanas separadas ─────────────
echo  [1/3] Backend   ^(puerto 4000^)...
start "Backend  :4000"  cmd /k "cd /d "%BACKEND%" && npm run dev"

timeout /t 2 /nobreak >nul

echo  [2/3] Frontend  ^(puerto 5173^)...
start "Frontend :5173"  cmd /k "cd /d "%FRONTEND%" && npm run dev"

echo  [3/3] Admin     ^(puerto 3500^)...
start "Admin    :3500"  cmd /k "cd /d "%ADMIN%" && node server.js"

:: ── Esperar y abrir navegador ────────────────────────────
timeout /t 4 /nobreak >nul

echo  Abriendo navegador...
start "" "http://localhost:5173"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3500"

echo.
echo  ==========================================
echo   OK - App:    http://localhost:5173
echo   OK - Admin:  http://localhost:3500
echo   OK - API:    http://localhost:4000
echo  ==========================================
echo.

:: Esta ventana se cierra sola en 3 segundos
timeout /t 3 /nobreak >nul
exit
