# Deploy Supply Chain Contract using Docker
# This script uses Docker to compile and deploy the contract

# Set context to project root
Set-Location "$PSScriptRoot\.."

Write-Host "Starting Docker-based deployment..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Start Anvil
Write-Host "Starting Anvil blockchain..." -ForegroundColor Yellow
docker-compose up -d anvil

Start-Sleep -Seconds 3

# Check if Anvil is running
Write-Host "Checking Anvil status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8545" -Method POST -Headers @{"Content-Type" = "application/json" } -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' -UseBasicParsing -ErrorAction Stop
    Write-Host "Anvil is running!" -ForegroundColor Green
}
catch {
    Write-Host "Anvil failed to start!" -ForegroundColor Red
    Write-Host "Check Docker logs: docker-compose logs anvil" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Compile the contract
Write-Host "Compiling contract with Docker..." -ForegroundColor Yellow
docker-compose run --rm foundry sh -c "forge build"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Contract compiled successfully!" -ForegroundColor Green
Write-Host ""

# Step 3: Deploy the contract
Write-Host "Deploying contract..." -ForegroundColor Yellow

# Use Anvil's first account private key
$env:PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

$deployOutput = docker-compose run --rm -e PRIVATE_KEY=$env:PRIVATE_KEY foundry sh -c "forge script script/Deploy.s.sol --rpc-url http://anvil:8545 --broadcast -vvv" 2>&1 | Out-String

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed!" -ForegroundColor Red
    Write-Host $deployOutput
    exit 1
}

# Extract contract address
$contractAddress = $null
if ($deployOutput -match "Contract Address: (0x[a-fA-F0-9]{40})") {
    $contractAddress = $matches[1]
}
elseif ($deployOutput -match "Deployed to: (0x[a-fA-F0-9]{40})") {
    $contractAddress = $matches[1]
}
else {
    $addresses = [regex]::Matches($deployOutput, "0x[a-fA-F0-9]{40}")
    if ($addresses.Count -gt 0) {
        $contractAddress = $addresses[$addresses.Count - 1].Value
    }
}

if (-not $contractAddress) {
    Write-Host "Could not extract contract address automatically." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Deployment output:" -ForegroundColor Cyan
    Write-Host $deployOutput
    Write-Host ""
    Write-Host "Please enter the contract address manually:" -ForegroundColor Yellow
    $contractAddress = Read-Host "Contract Address"
}

Write-Host "Contract deployed at: $contractAddress" -ForegroundColor Green
Write-Host ""

# Step 4: Update frontend config
Write-Host "Updating frontend configuration..." -ForegroundColor Yellow

$configPath = "c:\REPO\98_pfm_traza_2025\web\src\contracts\config.ts"
$configContent = Get-Content $configPath -Raw
$newConfigContent = $configContent -replace 'address: "0x0000000000000000000000000000000000000000"', "address: `"$contractAddress`""
Set-Content -Path $configPath -Value $newConfigContent

Write-Host "Configuration updated!" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contract Address: $contractAddress" -ForegroundColor White
Write-Host "Network: Anvil (http://localhost:8545)" -ForegroundColor White
Write-Host "Admin Account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" -ForegroundColor White
Write-Host ""
Write-Host "Anvil is running in Docker. To stop it:" -ForegroundColor Yellow
Write-Host "  docker-compose down" -ForegroundColor Gray
Write-Host ""
Write-Host "To view Anvil logs:" -ForegroundColor Yellow
Write-Host "  docker-compose logs -f anvil" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Configure MetaMask to http://localhost:8545 (Chain ID: 31337)" -ForegroundColor White
Write-Host "  2. Import admin account with private key:" -ForegroundColor White
Write-Host "     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" -ForegroundColor Gray
Write-Host "  3. Restart Next.js dev server:" -ForegroundColor White
Write-Host "     cd web && npm run dev" -ForegroundColor Gray
Write-Host "  4. Connect wallet and create tokens! 🚀" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

