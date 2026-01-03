# Deploy and Configure Supply Chain Contract
# This script compiles, deploys the contract, and updates the frontend config

Write-Host "🚀 Starting Supply Chain Contract Deployment..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Anvil is running
Write-Host "📡 Checking if Anvil is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8545" -Method POST -Headers @{"Content-Type" = "application/json" } -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' -ErrorAction Stop
    Write-Host "✅ Anvil is running!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Anvil is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start Anvil in a separate terminal:" -ForegroundColor Yellow
    Write-Host "  cd c:\REPO\98_pfm_traza_2025\scripts" -ForegroundColor White
    Write-Host "  .\anvil.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Compile the contract
Write-Host "🔨 Compiling contract..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\sc"

$compileOutput = forge build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
    Write-Host $compileOutput
    exit 1
}

Write-Host "✅ Contract compiled successfully!" -ForegroundColor Green
Write-Host ""

# Step 3: Deploy the contract
Write-Host "📦 Deploying contract to local Anvil..." -ForegroundColor Yellow

# Use Anvil's first account private key
$env:PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

$deployOutput = forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast -vvv 2>&1 | Out-String

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host $deployOutput
    exit 1
}

# Extract contract address from deployment output
$contractAddress = $null
if ($deployOutput -match "Contract Address: (0x[a-fA-F0-9]{40})") {
    $contractAddress = $matches[1]
}
elseif ($deployOutput -match "Deployed to: (0x[a-fA-F0-9]{40})") {
    $contractAddress = $matches[1]
}
else {
    # Try to find any address in the output
    $addresses = [regex]::Matches($deployOutput, "0x[a-fA-F0-9]{40}")
    if ($addresses.Count -gt 0) {
        # Usually the contract address is one of the last addresses
        $contractAddress = $addresses[$addresses.Count - 1].Value
    }
}

if (-not $contractAddress) {
    Write-Host "⚠️  Could not automatically extract contract address." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Deployment output:" -ForegroundColor Cyan
    Write-Host $deployOutput
    Write-Host ""
    Write-Host "Please enter the contract address manually:" -ForegroundColor Yellow
    $contractAddress = Read-Host "Contract Address"
}

Write-Host "✅ Contract deployed at: $contractAddress" -ForegroundColor Green
Write-Host ""

# Step 4: Update frontend config
Write-Host "⚙️  Updating frontend configuration..." -ForegroundColor Yellow

$configPath = "c:\REPO\98_pfm_traza_2025\web\src\contracts\config.ts"
$configContent = Get-Content $configPath -Raw

# Replace the address
$newConfigContent = $configContent -replace 'address: "0x0000000000000000000000000000000000000000"', "address: `"$contractAddress`""

Set-Content -Path $configPath -Value $newConfigContent

Write-Host "✅ Configuration updated!" -ForegroundColor Green
Write-Host ""

# Step 5: Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contract Address: $contractAddress" -ForegroundColor White
Write-Host "Network: Anvil Local (http://localhost:8545)" -ForegroundColor White
Write-Host "Admin Account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Make sure MetaMask is connected to http://localhost:8545" -ForegroundColor White
Write-Host "  2. Import the admin account using the private key:" -ForegroundColor White
Write-Host "     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" -ForegroundColor Gray
Write-Host "  3. Restart your Next.js dev server:" -ForegroundColor White
Write-Host "     cd c:\REPO\98_pfm_traza_2025\web" -ForegroundColor Gray
Write-Host "     npm run dev" -ForegroundColor Gray
Write-Host "  4. Connect your wallet and try creating a token!" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
