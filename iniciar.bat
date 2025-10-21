@echo off
echo ========================================
echo   INICIANDO SISTEMA CACHORRO MELO
echo ========================================
echo.
echo [1/2] Iniciando Backend...
cd backend
start "Backend - Cachorro Melo" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo.
echo [2/2] Iniciando Frontend...
cd ..
start "Frontend - Cachorro Melo" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul
echo.
echo ========================================
echo   SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
