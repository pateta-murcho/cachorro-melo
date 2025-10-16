Write-Host "TESTE FLUXO COMPLETO MOTOBOY" -ForegroundColor Cyan
Write-Host "=" * 60

# 1. LOGIN
Write-Host "1. LOGIN..." -ForegroundColor Yellow
$loginBody = @{phone = "11988776655"; password = "motoboy123"} | ConvertTo-Json
$login = Invoke-RestMethod -Uri "http://localhost:3001/api/deliverer/login" -Method POST -Body $loginBody -ContentType "application/json"

Write-Host "Login: $($login.data.deliverer.name)" -ForegroundColor Green
$token = $login.data.token
$headers = @{Authorization = "Bearer $token"; "Content-Type" = "application/json"}

# 2. BUSCAR PEDIDOS DISPONÍVEIS
Write-Host "2. PEDIDOS DISPONIVEIS..." -ForegroundColor Yellow
$available = Invoke-RestMethod -Uri "http://localhost:3001/api/deliverer/available-orders" -Headers $headers
Write-Host "Pedidos: $($available.data.Count)" -ForegroundColor Green

if ($available.data.Count -eq 0) {
    Write-Host "Nenhum pedido disponivel!" -ForegroundColor Red
    exit
}

$orderId = $available.data[0].id
Write-Host "Selecionado: $orderId - $($available.data[0].customer_name)" -ForegroundColor White

# 3. INICIAR ENTREGA
Write-Host "3. INICIAR ENTREGA..." -ForegroundColor Yellow
$startBody = @{orderIds = @($orderId)} | ConvertTo-Json
$start = Invoke-RestMethod -Uri "http://localhost:3001/api/deliverer/start-delivery" -Method POST -Headers $headers -Body $startBody
Write-Host "Entrega iniciada!" -ForegroundColor Green

Start-Sleep -Seconds 2

# 4. VERIFICAR MINHAS ENTREGAS
Write-Host "4. MINHAS ENTREGAS..." -ForegroundColor Yellow
$myDeliveries = Invoke-RestMethod -Uri "http://localhost:3001/api/deliverer/my-deliveries" -Headers $headers

if ($myDeliveries.data.Count -eq 0) {
    Write-Host "ERRO: Entrega não aparece!" -ForegroundColor Red
} else {
    Write-Host "Entregas ativas: $($myDeliveries.data.Count)" -ForegroundColor Green
    $delivery = $myDeliveries.data[0]
    Write-Host "  ID: $($delivery.id)" -ForegroundColor White
    Write-Host "  Status: $($delivery.status)" -ForegroundColor Cyan
    Write-Host "  Cliente: $($delivery.customer_name)" -ForegroundColor White
    Write-Host "  Codigo OTP: $($delivery.delivery_code)" -ForegroundColor Yellow
}

Write-Host "TESTE COMPLETO!" -ForegroundColor Green
