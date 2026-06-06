$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$minikubeStatus = minikube status --format='{{.Host}}' 2>$null
if ($minikubeStatus -ne 'Running') {
    Write-Error "Minikube no está corriendo. Ejecuta: minikube start --cpus 4 --memory 7000"
    exit 1
}

$services = @('users', 'products', 'orders', 'notifications')
$imageNames = @{
    'users' = 'novalink/users-service:local'
    'products' = 'novalink/products-service:local'
    'orders' = 'novalink/orders-service:local'
    'notifications' = 'novalink/notifications-service:local'
}
$deployments = @{
    'users' = 'users-service'
    'products' = 'products-service'
    'orders' = 'orders-service'
    'notifications' = 'notifications-service'
}

foreach ($svc in $services) {
    Write-Host "Rebuilding $svc directly into Minikube..."
    minikube image build -t $imageNames[$svc] "./services/$svc"
}

$containerNames = @{
    'users'= 'users'
    'products' = 'products'
    'orders' = 'orders'
    'notifications' = 'notifications'
}

foreach ($svc in $services) {
    Write-Host "Actualizando imagen de $($deployments[$svc])..."
    kubectl set image "deployment/$($deployments[$svc])" "$($containerNames[$svc])=$($imageNames[$svc])"
}

Write-Host 'Esperando que los pods esten listos...'
foreach ($svc in $services) {
    kubectl rollout status deployment $deployments[$svc]
}

Write-Host 'Inicializando bases de datos...'
& (Join-Path $PSScriptRoot 'init-k8s-db.ps1')

Write-Host 'Abriendo port-forwards...'
& (Join-Path $PSScriptRoot 'port-forward-all.ps1')

Write-Host 'Listo! Servicios actualizados y corriendo.'
