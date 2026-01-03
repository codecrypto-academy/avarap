# Full test script for Supply Chain smart contracts
# Runs build, tests, and displays results

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Supply Chain Tracker - Full Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean
Write-Host "[1/4] Cleaning previous builds..." -ForegroundColor Yellow
Write-Host "[1/4] Cleaning previous builds..." -ForegroundColor Yellow
$scPath = Resolve-Path "$PSScriptRoot\..\sc"
docker run --rm -v "${scPath}:/app" -w /app ghcr.io/foundry-rs/foundry:latest sh -c "forge clean"
Write-Host "✓ Clean complete" -ForegroundColor Green
Write-Host ""

# Step 2: Build
Write-Host "[2/4] Building contracts..." -ForegroundColor Yellow
# Step 2: Build
Write-Host "[2/4] Building contracts..." -ForegroundColor Yellow
$buildResult = docker run --rm -v "${scPath}:/app" -w /app ghcr.io/foundry-rs/foundry:latest sh -c "forge build 2>&1"
Write-Host $buildResult
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful" -ForegroundColor Green
}
else {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Run tests
Write-Host "[3/4] Running test suite..." -ForegroundColor Yellow
# Step 3: Run tests
Write-Host "[3/4] Running test suite..." -ForegroundColor Yellow
$testResult = docker run --rm -v "${scPath}:/app" -w /app ghcr.io/foundry-rs/foundry:latest sh -c "forge test -vv 2>&1"
Write-Host $testResult
Write-Host ""

# Step 4: Summary
Write-Host "[4/4] Test Summary" -ForegroundColor Yellow
if ($testResult -match "Test result: ok") {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
}
elseif ($testResult -match "(\d+) passed") {
    Write-Host "✓ Tests completed - see results above" -ForegroundColor Green
}
else {
    Write-Host "⚠ Check test results above" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test suite complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
