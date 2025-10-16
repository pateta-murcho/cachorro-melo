# Script para testar o fluxo completo do motoboy
Write-Host "🧪 TESTE DO FLUXO DO MOTOBOY" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# 1. Testar health do backend
Write-Host "`n1️⃣ Testando health do backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET
    Write-Host "✅ Backend OK: $($health.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend não está rodando!" -ForegroundColor Red
    Write-Host "Execute: cd backend; node src/server-ultra-simples.js" -ForegroundColor Yellow
    exit 1
}

# 2. Fazer login como motoboy
Write-Host "`n2️⃣ Fazendo login como motoboy..." -ForegroundColor Yellow
$loginBody = @{
    phone = "11988776655"
    password = "motoboy123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/deliverer/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success) {
        $token = $loginResponse.data.token
        $delivererId = $loginResponse.data.deliverer.id
        Write-Host "✅ Login OK! Token: $token" -ForegroundColor Green
        Write-Host "   Deliverer: $($loginResponse.data.deliverer.name)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Erro no login: $($loginResponse.error.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao fazer login: $_" -ForegroundColor Red
    exit 1
}

# 3. Buscar pedidos disponíveis
Write-Host "`n3️⃣ Buscando pedidos disponíveis..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $availableOrders = Invoke-RestMethod -Uri "http://localhost:3001/api/deliverer/available-orders" -Method GET -Headers $headers
    
    if ($availableOrders.success) {
        Write-Host "✅ Pedidos disponíveis: $($availableOrders.data.Count)" -ForegroundColor Green
        
        if ($availableOrders.data.Count -eq 0) {
            Write-Host "⚠️ Nenhum pedido disponível!" -ForegroundColor Yellow
            Write-Host "   Crie pedidos primeiro no sistema" -ForegroundColor Gray
            exit 0
        }
        
        # Mostrar pedidos
        foreach ($order in $availableOrders.data) {
            Write-Host "   📦 Pedido #$($order.id) - $($order.customer_name) - R$ $($order.total)" -ForegroundColor Gray
        }
        
        # Selecionar primeiro pedido
        $selectedOrderId = $availableOrders.data[0].id
        Write-Host "`n   Selecionando pedido: $selectedOrderId" -ForegroundColor Cyan
        
    } else {
        Write-Host "❌ Erro: $($availableOrders.error.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao buscar pedidos: $_" -ForegroundColor Red
    exit 1
}

# 4. Iniciar entrega
Write-Host "`n4️⃣ Iniciando entrega..." -ForegroundColor Yellow
$startDeliveryBody = @{
    orderIds = @($selectedOrderId)
} | ConvertTo-Json

try {
    $startResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/deliverer/start-delivery" -Method POST -Headers $headers -Body $startDeliveryBody -ContentType "application/json"
    
    if ($startResponse.success) {
        Write-Host "✅ Entrega iniciada com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao iniciar: $($startResponse.error.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao iniciar entrega: $_" -ForegroundColor Red
    exit 1
}

# 5. Buscar entregas em andamento
Write-Host "`n5️⃣ Buscando entregas em andamento..." -ForegroundColor Yellow
try {
    $myDeliveries = Invoke-RestMethod -Uri "http://localhost:3001/api/deliverer/my-deliveries" -Method GET -Headers $headers
    
    if ($myDeliveries.success) {
        Write-Host "✅ Entregas em andamento: $($myDeliveries.data.Count)" -ForegroundColor Green
        
        foreach ($delivery in $myDeliveries.data) {
            Write-Host "   🚚 Pedido #$($delivery.id)" -ForegroundColor Gray
            Write-Host "      Cliente: $($delivery.customer_name)" -ForegroundColor Gray
            Write-Host "      Endereço: $($delivery.delivery_address)" -ForegroundColor Gray
            Write-Host "      Código OTP: $($delivery.delivery_code)" -ForegroundColor Yellow
            Write-Host "      Total: R$ $($delivery.total)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Erro: $($myDeliveries.error.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao buscar entregas: $_" -ForegroundColor Red
}

Write-Host "`n✅ TESTE COMPLETO!" -ForegroundColor Green
Write-Host "Agora acesse: http://localhost:8080/entregando" -ForegroundColor Cyan
