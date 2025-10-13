@echo off
echo 🔥🔥🔥 TESTE MANUAL DO BACKEND 🔥🔥🔥
echo.

echo 🧪 Testando Backend Health...
powershell -Command "try { $result = Invoke-RestMethod -Uri 'http://localhost:3001/health' -Method GET; Write-Host '✅ Backend Health: OK'; Write-Host 'Status:' $result.status; Write-Host 'Uptime:' $result.uptime } catch { Write-Host '❌ Backend Health: ERRO -' $_.Exception.Message }"
echo.

echo 🧪 Testando Supabase...
powershell -Command "try { $result = Invoke-RestMethod -Uri 'http://localhost:3001/api/test-supabase' -Method GET; if ($result.success) { Write-Host '✅ Supabase: OK' } else { Write-Host '❌ Supabase: FALHOU' } } catch { Write-Host '❌ Supabase: ERRO -' $_.Exception.Message }"
echo.

echo 🧪 Testando Produtos...
powershell -Command "try { $result = Invoke-RestMethod -Uri 'http://localhost:3001/api/products' -Method GET; if ($result.success) { Write-Host '✅ Produtos:' $result.data.Count 'produtos' } else { Write-Host '❌ Produtos: FALHOU' } } catch { Write-Host '❌ Produtos: ERRO -' $_.Exception.Message }"
echo.

echo 🧪 Testando Categorias...
powershell -Command "try { $result = Invoke-RestMethod -Uri 'http://localhost:3001/api/categories' -Method GET; if ($result.success) { Write-Host '✅ Categorias:' $result.data.Count 'categorias' } else { Write-Host '❌ Categorias: FALHOU' } } catch { Write-Host '❌ Categorias: ERRO -' $_.Exception.Message }"
echo.

echo 🔥🔥🔥 TESTE FRONTEND 🔥🔥🔥
echo.
echo 🌐 Frontend deve estar em: http://localhost:8080
echo 📋 Cardápio: http://localhost:8080/menu
echo 🛒 Checkout: http://localhost:8080/checkout
echo 👤 Admin: http://localhost:8080/admin
echo.

echo ✅ TESTES CONCLUÍDOS!