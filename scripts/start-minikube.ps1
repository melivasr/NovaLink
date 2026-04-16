$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Assert-LastExit {
    param([string]$Step)
    if ($LASTEXITCODE -ne 0) {
        throw "$Step failed (exit code $LASTEXITCODE)."
    }
}

function Ensure-Docker {
    docker info | Out-Null
    if ($LASTEXITCODE -eq 0) {
        return
    }

    $dockerDesktop = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
    if (Test-Path $dockerDesktop) {
        Write-Host 'Docker engine is down. Trying to launch Docker Desktop...'
        Start-Process $dockerDesktop
    }

    docker info | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw 'Docker is not running. Open Docker Desktop, wait for "Engine running", then run the script again.'
    }
}

function Ensure-Minikube {
    minikube -p minikube status | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'Minikube is not running. Starting minikube profile...'
        minikube start -p minikube --driver=docker
        Assert-LastExit 'minikube start'
    }

    kubectl cluster-info | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw 'Kubernetes API is unreachable. Run "minikube -p minikube start" and try again.'
    }
}

Ensure-Docker
Ensure-Minikube

$services = @(
    @{ Name = 'users-service'; Path = 'services/users'; Tag = 'novalink/users-service:v3' },
    @{ Name = 'products-service'; Path = 'services/products'; Tag = 'novalink/products-service:v3' },
    @{ Name = 'orders-service'; Path = 'services/orders'; Tag = 'novalink/orders-service:v3' },
    @{ Name = 'notifications-service'; Path = 'services/notifications'; Tag = 'novalink/notifications-service:v3' }
)

Write-Host 'Building service images...'
foreach ($service in $services) {
    docker build -t $service.Tag (Join-Path $repoRoot $service.Path)
    Assert-LastExit "docker build ($($service.Name))"
    minikube -p minikube image load $service.Tag
    Assert-LastExit "minikube image load ($($service.Name))"
}

Write-Host 'Applying Kubernetes manifests...'
kubectl apply -f (Join-Path $repoRoot 'k8s/configmaps')
Assert-LastExit 'kubectl apply configmaps'
kubectl apply -f (Join-Path $repoRoot 'k8s/deployments')
Assert-LastExit 'kubectl apply deployments'

Write-Host 'Waiting for database deployments...'
kubectl rollout status deployment/users-db --timeout=240s
Assert-LastExit 'users-db rollout'
kubectl rollout status deployment/products-db --timeout=240s
Assert-LastExit 'products-db rollout'
kubectl rollout status deployment/orders-db --timeout=240s
Assert-LastExit 'orders-db rollout'

Write-Host 'Initializing database schemas...'
& (Join-Path $PSScriptRoot 'init-k8s-db.ps1')

Write-Host 'Updating deployments to the new image tags...'
kubectl set image deployment/users-service users=novalink/users-service:v3
Assert-LastExit 'set image users-service'
kubectl set image deployment/products-service products=novalink/products-service:v3
Assert-LastExit 'set image products-service'
kubectl set image deployment/orders-service orders=novalink/orders-service:v3
Assert-LastExit 'set image orders-service'
kubectl set image deployment/notifications-service notifications=novalink/notifications-service:v3
Assert-LastExit 'set image notifications-service'

Write-Host 'Waiting for rollout...'
kubectl rollout status deployment/users-service --timeout=240s
Assert-LastExit 'users-service rollout'
kubectl rollout status deployment/products-service --timeout=240s
Assert-LastExit 'products-service rollout'
kubectl rollout status deployment/orders-service --timeout=240s
Assert-LastExit 'orders-service rollout'
kubectl rollout status deployment/notifications-service --timeout=240s
Assert-LastExit 'notifications-service rollout'

Write-Host 'Done. Current pods:'
kubectl get pods -o wide