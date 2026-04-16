$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$services = @(
    @{ Name = 'users-service'; Path = 'services/users'; Tag = 'novalink/users-service:v3' },
    @{ Name = 'products-service'; Path = 'services/products'; Tag = 'novalink/products-service:v3' },
    @{ Name = 'orders-service'; Path = 'services/orders'; Tag = 'novalink/orders-service:v3' },
    @{ Name = 'notifications-service'; Path = 'services/notifications'; Tag = 'novalink/notifications-service:v3' }
)

Write-Host 'Building service images...'
foreach ($service in $services) {
    docker build -t $service.Tag (Join-Path $repoRoot $service.Path)
    minikube -p minikube image load $service.Tag
}

Write-Host 'Applying Kubernetes manifests...'
kubectl apply -f (Join-Path $repoRoot 'k8s/configmaps')
kubectl apply -f (Join-Path $repoRoot 'k8s/deployments')

Write-Host 'Initializing database schemas...'
& (Join-Path $PSScriptRoot 'init-k8s-db.ps1')

Write-Host 'Updating deployments to the new image tags...'
kubectl set image deployment/users-service users=novalink/users-service:v3
kubectl set image deployment/products-service products=novalink/products-service:v3
kubectl set image deployment/orders-service orders=novalink/orders-service:v3
kubectl set image deployment/notifications-service notifications=novalink/notifications-service:v3

Write-Host 'Waiting for rollout...'
kubectl rollout status deployment/users-service --timeout=240s
kubectl rollout status deployment/products-service --timeout=240s
kubectl rollout status deployment/orders-service --timeout=240s
kubectl rollout status deployment/notifications-service --timeout=240s

Write-Host 'Done. Current pods:'
kubectl get pods -o wide