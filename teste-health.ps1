try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
    Write-Host "✅ BACKEND FUNCIONANDO!"
    Write-Host "Status: $($result.status)"
    Write-Host "Uptime: $($result.uptime)s"
    Write-Host "Message: $($result.message)"
} catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)"
}