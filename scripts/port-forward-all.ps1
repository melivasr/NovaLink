$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$services = @(
    @{ Name = 'users-service'; LocalPort = 3001; RemotePort = 3001 },
    @{ Name = 'products-service'; LocalPort = 3002; RemotePort = 3002 },
    @{ Name = 'orders-service'; LocalPort = 3003; RemotePort = 3003 },
    @{ Name = 'notifications-service'; LocalPort = 3004; RemotePort = 3004 }
)

foreach ($service in $services) {
    $command = "kubectl port-forward svc/$($service.Name) $($service.LocalPort):$($service.RemotePort)"
    Start-Process powershell -ArgumentList @('-NoExit', '-Command', $command)
}

Write-Host 'Port-forwards started in separate PowerShell windows.'
Write-Host 'Use these URLs:'
Write-Host 'http://127.0.0.1:3001/health'
Write-Host 'http://127.0.0.1:3002/health'
Write-Host 'http://127.0.0.1:3003/health'
Write-Host 'http://127.0.0.1:3004/health'