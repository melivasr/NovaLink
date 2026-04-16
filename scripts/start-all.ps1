$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host 'Starting/updating Kubernetes stack...'
& (Join-Path $PSScriptRoot 'start-minikube.ps1')

Write-Host 'Opening local port-forwards...'
& (Join-Path $PSScriptRoot 'port-forward-all.ps1')

Write-Host 'System ready for local browser tests.'