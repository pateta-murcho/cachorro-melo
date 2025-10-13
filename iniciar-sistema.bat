@echo off
title CACHORRO MELO - INICIALIZADOR COMPLETO
color 0A

echo.
echo 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
echo                  CACHORRO MELO DELIVERY
echo                 INICIALIZADOR COMPLETO
echo 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
echo.

echo ⏳ Parando processos anteriores...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo ✅ Verificando portas...
netstat -ano | findstr ":3001" >nul
if %errorlevel% equ 0 (
    echo ❌ Porta 3001 ainda ocupada! Matando processo...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do taskkill /f /pid %%a >nul 2>&1
)

netstat -ano | findstr ":8080" >nul
if %errorlevel% equ 0 (
    echo ❌ Porta 8080 ainda ocupada! Matando processo...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do taskkill /f /pid %%a >nul 2>&1
)

echo.
echo 🚀 Iniciando FRONTEND + BACKEND...
echo.
echo 📋 FRONTEND: http://localhost:8080
echo 🔧 BACKEND:  http://localhost:3001
echo 🧪 TESTES:   http://localhost:8080/teste-sistema-completo.html
echo.

start "CACHORRO MELO - SISTEMA COMPLETO" npm run dev

echo ⏳ Aguardando inicialização...
timeout /t 5 /nobreak >nul

echo.
echo 🔍 Testando conexões...

powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8080' -Method GET | Out-Null; Write-Host '✅ Frontend (8080): FUNCIONANDO' -ForegroundColor Green } catch { Write-Host '❌ Frontend (8080): FALHA' -ForegroundColor Red }"

powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3001/health' -Method GET | Out-Null; Write-Host '✅ Backend (3001): FUNCIONANDO' -ForegroundColor Green } catch { Write-Host '❌ Backend (3001): FALHA' -ForegroundColor Red }"

echo.
echo 🌐 SISTEMA INICIADO COM SUCESSO!
echo.
echo 📋 Acesse: http://localhost:8080
echo 🧪 Testes: http://localhost:8080/teste-sistema-completo.html
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

start http://localhost:8080/teste-sistema-completo.html