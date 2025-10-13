Write-Host "🔥🔥🔥 TESTE FINAL COMPLETO 🔥🔥🔥" -ForegroundColor Yellow

$tests = @()

# 🧪 Teste 1: Backend Health
Write-Host "`n🧪 TESTANDO BACKEND HEALTH..." -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
    Write-Host "✅ Backend Health: OK" -ForegroundColor Green
    Write-Host "   Status: $($result.status)" -ForegroundColor White
    Write-Host "   Uptime: $([math]::Round($result.uptime))s" -ForegroundColor White
    $tests += @{Name="Backend Health"; Status="✅"; Details="OK"}
} catch {
    Write-Host "❌ Backend Health: ERRO" -ForegroundColor Red
    $tests += @{Name="Backend Health"; Status="❌"; Details="ERRO"}
}

# 🧪 Teste 2: Supabase
Write-Host "`n🧪 TESTANDO SUPABASE..." -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/test-supabase" -Method GET
    if ($result.success) {
        Write-Host "✅ Supabase: OK" -ForegroundColor Green
        $tests += @{Name="Supabase"; Status="✅"; Details="Conectado"}
    } else {
        Write-Host "❌ Supabase: FALHOU" -ForegroundColor Red
        $tests += @{Name="Supabase"; Status="❌"; Details="Falhou"}
    }
} catch {
    Write-Host "❌ Supabase: ERRO" -ForegroundColor Red
    $tests += @{Name="Supabase"; Status="❌"; Details="ERRO"}
}

# 🧪 Teste 3: Produtos
Write-Host "`n🧪 TESTANDO PRODUTOS..." -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/products" -Method GET
    if ($result.success) {
        Write-Host "✅ Produtos: $($result.data.Count) produtos carregados" -ForegroundColor Green
        $tests += @{Name="Produtos"; Status="✅"; Details="$($result.data.Count) produtos"}
    } else {
        Write-Host "❌ Produtos: FALHOU" -ForegroundColor Red
        $tests += @{Name="Produtos"; Status="❌"; Details="Falhou"}
    }
} catch {
    Write-Host "❌ Produtos: ERRO" -ForegroundColor Red
    $tests += @{Name="Produtos"; Status="❌"; Details="ERRO"}
}

# 🧪 Teste 4: Categorias
Write-Host "`n🧪 TESTANDO CATEGORIAS..." -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/categories" -Method GET
    if ($result.success) {
        Write-Host "✅ Categorias: $($result.data.Count) categorias carregadas" -ForegroundColor Green
        $tests += @{Name="Categorias"; Status="✅"; Details="$($result.data.Count) categorias"}
    } else {
        Write-Host "❌ Categorias: FALHOU" -ForegroundColor Red
        $tests += @{Name="Categorias"; Status="❌"; Details="Falhou"}
    }
} catch {
    Write-Host "❌ Categorias: ERRO" -ForegroundColor Red
    $tests += @{Name="Categorias"; Status="❌"; Details="ERRO"}
}

# 🧪 Teste 5: Admin Login
Write-Host "`n🧪 TESTANDO ADMIN LOGIN..." -ForegroundColor Cyan
try {
    $loginData = @{
        email = "admin@cachorromelo.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    if ($result.success) {
        Write-Host "✅ Admin Login: OK ($($result.admin.name))" -ForegroundColor Green
        $tests += @{Name="Admin Login"; Status="✅"; Details="OK"}
    } else {
        Write-Host "❌ Admin Login: FALHOU" -ForegroundColor Red
        $tests += @{Name="Admin Login"; Status="❌"; Details="Falhou"}
    }
} catch {
    Write-Host "❌ Admin Login: ERRO" -ForegroundColor Red
    $tests += @{Name="Admin Login"; Status="❌"; Details="ERRO"}
}

# 🧪 Teste 6: Criar Pedido
Write-Host "`n🧪 TESTANDO CRIAR PEDIDO..." -ForegroundColor Cyan
try {
    $orderData = @{
        customer = @{
            name = "João Teste"
            phone = "11999999999"
            email = "teste@teste.com"
        }
        items = @(
            @{
                productId = "1"
                name = "Hot Dog Teste"
                quantity = 2
                price = 10.0
            }
        )
        total = 20.0
        deliveryAddress = "Rua Teste, 123"
        paymentMethod = "money"
    } | ConvertTo-Json -Depth 3
    
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/orders" -Method POST -Body $orderData -ContentType "application/json"
    if ($result.success) {
        Write-Host "✅ Criar Pedido: OK ($($result.data.orderNumber))" -ForegroundColor Green
        $tests += @{Name="Criar Pedido"; Status="✅"; Details="OK"}
    } else {
        Write-Host "❌ Criar Pedido: FALHOU" -ForegroundColor Red
        $tests += @{Name="Criar Pedido"; Status="❌"; Details="Falhou"}
    }
} catch {
    Write-Host "❌ Criar Pedido: ERRO" -ForegroundColor Red
    $tests += @{Name="Criar Pedido"; Status="❌"; Details="ERRO"}
}

# 🧪 Teste 7: Dashboard
Write-Host "`n🧪 TESTANDO DASHBOARD..." -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/admin/dashboard" -Method GET
    if ($result.success) {
        Write-Host "✅ Dashboard: OK (Produtos: $($result.data.totalProducts))" -ForegroundColor Green
        $tests += @{Name="Dashboard"; Status="✅"; Details="OK"}
    } else {
        Write-Host "❌ Dashboard: FALHOU" -ForegroundColor Red
        $tests += @{Name="Dashboard"; Status="❌"; Details="Falhou"}
    }
} catch {
    Write-Host "❌ Dashboard: ERRO" -ForegroundColor Red
    $tests += @{Name="Dashboard"; Status="❌"; Details="ERRO"}
}

# 📊 RELATÓRIO FINAL
Write-Host "`n🔥🔥🔥 RELATÓRIO FINAL 🔥🔥🔥" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

$passed = ($tests | Where-Object { $_.Status -eq "✅" }).Count
$total = $tests.Count

foreach ($test in $tests) {
    Write-Host "$($test.Status) $($test.Name): $($test.Details)" -ForegroundColor White
}

Write-Host "`n📊 RESULTADO: $passed/$total testes passaram ($([math]::Round(($passed/$total)*100))%)" -ForegroundColor White

if ($passed -eq $total) {
    Write-Host "`n🎉🎉🎉 TODOS OS TESTES PASSARAM! SISTEMA 100% FUNCIONAL! 🎉🎉🎉" -ForegroundColor Green
} else {
    Write-Host "`n⚠️⚠️⚠️ ALGUNS TESTES FALHARAM - VERIFICAR LOGS ⚠️⚠️⚠️" -ForegroundColor Red
}

Write-Host "`n🌐 FRONTEND URLs:" -ForegroundColor Cyan
Write-Host "   - Principal: http://localhost:8080" -ForegroundColor White
Write-Host "   - Cardápio: http://localhost:8080/menu" -ForegroundColor White
Write-Host "   - Checkout: http://localhost:8080/checkout" -ForegroundColor White
Write-Host "   - Admin: http://localhost:8080/admin" -ForegroundColor White

Write-Host "`n=================================" -ForegroundColor Yellow