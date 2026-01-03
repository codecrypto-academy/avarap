# PowerShell script to run cast commands in Docker
# Usage: .\cast.ps1 --version
#        .\cast.ps1 call [address] [signature]

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
)

$command = "cast $($Arguments -join ' ')"



$scPath = Resolve-Path "$PSScriptRoot\..\sc"

docker run --rm `
    -v "${scPath}:/app" `
    -w /app `
    --network host `
    ghcr.io/foundry-rs/foundry:latest `
    sh -c $command
