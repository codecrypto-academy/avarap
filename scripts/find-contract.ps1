# Calculate contract address based on deployer nonce
# When account deploys first contract, it's at a predictable address

$deployer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

Write-Host "Checking deployment..." -ForegroundColor Cyan
Write-Host "Deployer: $deployer" -ForegroundColor Yellow
Write-Host ""

# Get nonce
$nonceHex = docker run --rm --network sc_foundry-network ghcr.io/foundry-rs/foundry:latest `
    cast nonce --rpc-url http://anvil:8545 $deployer

$nonce = [int]$nonceHex
Write-Host "Current nonce: $nonce" -ForegroundColor Yellow

# First contract deployment is usually at nonce 0
# Contract address for nonce 0: 0x5FbDB2315678afecb367f032d93F642f64180aa3
# Contract address for nonce 1: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

$addresses = @{
    0 = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    1 = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    2 = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
}

if ($nonce -gt 0 -and $addresses.ContainsKey($nonce - 1)) {
    $contractAddress = $addresses[$nonce - 1]
    Write-Host ""
    Write-Host "Contract likely deployed at: $contractAddress" -ForegroundColor Green
    Write-Host ""
    
    # Verify by calling admin()
    Write-Host "Verifying contract..." -ForegroundColor Cyan
    $admin = docker run --rm --network sc_foundry-network ghcr.io/foundry-rs/foundry:latest `
        cast call --rpc-url http://anvil:8545 $contractAddress "admin()(address)"
    
    if ($admin) {
        Write-Host "Contract verified! Admin: $admin" -ForegroundColor Green
        $contractAddress | Out-File -FilePath "contract-address.txt" -NoNewline
        Write-Host "Address saved to contract-address.txt" -ForegroundColor Green
    }
}
else {
    Write-Host "No contract deployed yet or nonce too high" -ForegroundColor Yellow
}
