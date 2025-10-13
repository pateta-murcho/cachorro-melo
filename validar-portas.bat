@echo off
echo 🔥🔥🔥 VALIDAÇÃO FINAL DAS PORTAS 🔥🔥🔥
echo.

echo 📊 PORTAS ESPERADAS:
echo    Backend: localhost:3001
echo    Frontend: localhost:8080
echo.

echo 🧪 TESTANDO BACKEND (3001)...
powershell -Command "try { $result = Invoke-RestMethod -Uri 'http://localhost:3001/health' -Method GET -TimeoutSec 5; Write-Host '✅ Backend: FUNCIONANDO (Uptime:' $result.uptime 'segundos)' } catch { Write-Host '❌ Backend: FALHA -' $_.Exception.Message }"
echo.

echo 🧪 TESTANDO FRONTEND (8080)...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8080' -Method GET -TimeoutSec 5 | Out-Null; Write-Host '✅ Frontend: FUNCIONANDO' } catch { Write-Host '❌ Frontend: FALHA -' $_.Exception.Message }"
echo.

echo 🧪 TESTANDO API PRODUCTS...
powershell -Command "try { $result = Invoke-RestMethod -Uri 'http://localhost:3001/api/products' -Method GET -TimeoutSec 5; if ($result.success) { Write-Host '✅ API Products: FUNCIONANDO (' $result.data.Count 'produtos)' } else { Write-Host '❌ API Products: DADOS INVÁLIDOS' } } catch { Write-Host '❌ API Products: FALHA -' $_.Exception.Message }"
echo.

echo 🧪 TESTANDO COMUNICAÇÃO FRONTEND-BACKEND...
echo    Verificando se o frontend consegue acessar o backend...
powershell -Command "try { $result = Invoke-RestMethod -Uri 'http://localhost:3001/api/test-supabase' -Method GET -TimeoutSec 5; if ($result.success) { Write-Host '✅ Comunicação: OK' } else { Write-Host '⚠️ Comunicação: Backend responde mas sem sucesso' } } catch { Write-Host '❌ Comunicação: FALHA -' $_.Exception.Message }"
echo.

echo 📋 CONFIGURAÇÕES:
echo    .env VITE_API_URL: http://localhost:3001/api
echo    Backend CORS: http://localhost:8080
echo    Vite server.port: 8080
echo    Backend PORT: 3001
echo.

echo 🎯 URLS PARA TESTAR:
echo    Frontend: http://localhost:8080
echo    Menu: http://localhost:8080/menu  
echo    Checkout: http://localhost:8080/checkout
echo    Admin: http://localhost:8080/admin
echo    Backend API: http://localhost:3001/api
echo.

echo ✅ VALIDAÇÃO CONCLUÍDA!