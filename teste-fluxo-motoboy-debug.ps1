# Script de teste completo do fluxo do motoboy
Write-Host "🧪 TESTE COMPLETO DO FLUXO DO MOTOBOY" -ForegroundColor Cyan
Write-Host "=" * 60

$baseUrl = "http://localhost:3001/api"

# 1. LOGIN
Write-Host "`n1️⃣ FAZENDO LOGIN..." -ForegroundColor Yellow
$loginBody = @{
    phone = "11988776655"
    password = "motoboy123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/deliverer/login" -Method POST -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Login bem-sucedido!" -ForegroundColor Green
    Write-Host "Nome: $($loginResponse.data.deliverer.name)" -ForegroundColor White
    Write-Host "Token: $($loginResponse.data.token)" -ForegroundColor Gray
    
    $token = $loginResponse.data.token
    $delivererId = $loginResponse.data.deliverer.id
    
    # Extrair ID do token
    $tokenParts = $token -split '-'
    Write-Host "`n🔍 DEBUG TOKEN:" -ForegroundColor Magenta
    Write-Host "Token completo: $token" -ForegroundColor Gray
    Write-Host "Partes do token: $($tokenParts -join ' | ')" -ForegroundColor Gray
    Write-Host "ID extraído (parte [2]): $($tokenParts[2])" -ForegroundColor Gray
    Write-Host "ID esperado: $delivererId" -ForegroundColor Gray
    
    if ($tokenParts[2] -eq $delivererId) {
        Write-Host "✅ ID do token corresponde!" -ForegroundColor Green
    } else {
        Write-Host "❌ ID do token NÃO corresponde!" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erro no login:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host $_.Exception.Response -ForegroundColor Gray
    exit 1
}

# 2. BUSCAR PEDIDOS DISPONÍVEIS
Write-Host "`n2️⃣ BUSCANDO PEDIDOS DISPONÍVEIS..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $availableOrders = Invoke-RestMethod -Uri "$baseUrl/deliverer/available-orders" -Method GET -Headers $headers
    Write-Host "✅ Pedidos disponíveis: $($availableOrders.data.Count)" -ForegroundColor Green
    
    if ($availableOrders.data.Count -eq 0) {
        Write-Host "⚠️ Nenhum pedido disponível para teste!" -ForegroundColor Yellow
        exit 0
    }
    
    # Pegar primeiro pedido
    $orderId = $availableOrders.data[0].id
    Write-Host "📦 Pedido selecionado: $orderId" -ForegroundColor White
    Write-Host "Cliente: $($availableOrders.data[0].customer_name)" -ForegroundColor White
    Write-Host "Endereço: $($availableOrders.data[0].delivery_address)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Erro ao buscar pedidos: $_" -ForegroundColor Red
    exit 1
}

# 3. INICIAR ENTREGA
Write-Host "`n3️⃣ INICIANDO ENTREGA..." -ForegroundColor Yellow
$startBody = @{
    orderIds = @($orderId)
} | ConvertTo-Json

try {
    $startResponse = Invoke-RestMethod -Uri "$baseUrl/deliverer/start-delivery" -Method POST -Headers $headers -Body $startBody
    Write-Host "✅ Entrega iniciada!" -ForegroundColor Green
    Write-Host ($startResponse | ConvertTo-Json -Depth 3)
    
} catch {
    Write-Host "❌ Erro ao iniciar entrega: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# 4. VERIFICAR MINHAS ENTREGAS
Write-Host "`n4️⃣ VERIFICANDO MINHAS ENTREGAS..." -ForegroundColor Yellow

Start-Sleep -Seconds 1

try {
    $myDeliveries = Invoke-RestMethod -Uri "$baseUrl/deliverer/my-deliveries" -Method GET -Headers $headers
    Write-Host "✅ Minhas entregas: $($myDeliveries.data.Count)" -ForegroundColor Green
    
    if ($myDeliveries.data.Count -eq 0) {
        Write-Host "❌ PROBLEMA: Entrega iniciada mas não aparece em 'minhas entregas'!" -ForegroundColor Red
    } else {
        Write-Host "✅ Entrega encontrada:" -ForegroundColor Green
        $delivery = $myDeliveries.data[0]
        Write-Host "  ID: $($delivery.id)" -ForegroundColor White
        Write-Host "  Status: $($delivery.status)" -ForegroundColor White
        Write-Host "  Cliente: $($delivery.customer_name)" -ForegroundColor White
        Write-Host "  Código OTP: $($delivery.delivery_code)" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "❌ Erro ao buscar minhas entregas: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "`n✅ TESTE COMPLETO!" -ForegroundColor Green
