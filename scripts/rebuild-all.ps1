$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host 'Apuntando Docker a Minikube...'
minikube docker-env | Invoke-Expression

$services = @('users', 'products', 'orders', 'notifications')
$imageNames = @{
    'users'         = 'novalink/users-service:latest'
    'products'      = 'novalink/products-service:latest'
    'orders'        = 'novalink/orders-service:latest'
    'notifications' = 'novalink/notifications-service:latest'
}
$deployments = @{
    'users'         = 'users-service'
    'products'      = 'products-service'
    'orders'        = 'orders-service'
    'notifications' = 'notifications-service'
}

foreach ($svc in $services) {
    Write-Host "Rebuilding $svc..."
    docker build -t $imageNames[$svc] "./services/$svc"
}

foreach ($svc in $services) {
    Write-Host "Reiniciando pod $($deployments[$svc])..."
    kubectl rollout restart deployment $deployments[$svc]
}

Write-Host 'Esperando que los pods esten listos...'
foreach ($svc in $services) {
    kubectl rollout status deployment $deployments[$svc]
}

Write-Host 'Abriendo port-forwards...'
& (Join-Path $PSScriptRoot 'port-forward-all.ps1')

Write-Host 'Listo! Servicios actualizados y corriendo.'
