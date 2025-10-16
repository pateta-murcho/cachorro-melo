Write-Host "Testando login motoboy..." -ForegroundColor Cyan

$body = @{
    phone = "11988776655"
    password = "motoboy123"
} | ConvertTo-Json

Write-Host "Body: $body" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/deliverer/login" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "`n✅ LOGIN BEM-SUCEDIDO!" -ForegroundColor Green
    Write-Host "Nome: $($response.data.deliverer.name)" -ForegroundColor White
    Write-Host "ID: $($response.data.deliverer.id)" -ForegroundColor White
    Write-Host "Token: $($response.data.token)" -ForegroundColor Gray
    
    $global:token = $response.data.token
    $global:delivererId = $response.data.deliverer.id
    
    Write-Host "`nToken salvo em `$global:token" -ForegroundColor Yellow
    Write-Host "ID salvo em `$global:delivererId" -ForegroundColor Yellow
    
} catch {
    Write-Host "`n❌ ERRO:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
