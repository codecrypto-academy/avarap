# PowerShell script to start Anvil in Docker
# Usage: .\anvil.ps1

Write-Host "Starting Anvil blockchain on http://localhost:8545" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

docker run --rm `
    -p 8545:8545 `
    ghcr.io/foundry-rs/foundry:latest `
    anvil --host 0.0.0.0
