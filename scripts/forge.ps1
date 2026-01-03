# PowerShell script to run forge commands in Docker
# Usage: .\forge.ps1 build
#        .\forge.ps1 test
#        .\forge.ps1 test -vvv

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
)

$command = "forge $($Arguments -join ' ')"



$scPath = Resolve-Path "$PSScriptRoot\..\sc"

docker run --rm `
    -v "${scPath}:/app" `
    -w /app `
    ghcr.io/foundry-rs/foundry:latest `
    sh -c $command
