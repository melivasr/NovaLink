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

    $maxAttempts = 24
    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        Start-Sleep -Seconds 5
        docker info | Out-Null
        if ($LASTEXITCODE -eq 0) {
            return
        }

        Write-Host "Waiting for Docker engine... attempt $attempt of $maxAttempts"
    }

    throw 'Docker is not running. Open Docker Desktop, wait for "Engine running", then run the script again.'
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

$imageTag = 'dev-{0}' -f (Get-Date -Format 'yyyyMMddHHmmss')

$services = @(
    @{ Name = 'users-service'; Container = 'users'; Path = 'services/users'; Tag = "novalink/users-service:$imageTag" },
    @{ Name = 'auth-service'; Container = 'auth'; Path = 'services/auth'; Tag = "novalink/auth-service:$imageTag" },
    @{ Name = 'products-service'; Container = 'products'; Path = 'services/products'; Tag = "novalink/products-service:$imageTag" },
    @{ Name = 'orders-service'; Container = 'orders'; Path = 'services/orders'; Tag = "novalink/orders-service:$imageTag" },
    @{ Name = 'notifications-service'; Container = 'notifications'; Path = 'services/notifications'; Tag = "novalink/notifications-service:$imageTag" },
    @{ Name = 'api-gateway'; Container = 'api-gateway'; Path = 'services/api-gateway'; Tag = "novalink/api-gateway:$imageTag" }
)

Write-Host 'Building service images directly into Minikube...'
foreach ($service in $services) {
    minikube image build -t $service.Tag (Join-Path $repoRoot $service.Path)
    Assert-LastExit "minikube image build ($($service.Name))"
}

Write-Host 'Applying Kubernetes manifests...'
kubectl apply -f (Join-Path $repoRoot 'k8s/configmaps')
Assert-LastExit 'kubectl apply configmaps'
kubectl apply -f (Join-Path $repoRoot 'k8s/deployments')
Assert-LastExit 'kubectl apply deployments'

Write-Host 'Waiting for database deployments...'
kubectl rollout status deployment/rabbitmq --timeout=240s
Assert-LastExit 'rabbitmq rollout'
kubectl rollout status deployment/users-db --timeout=240s
Assert-LastExit 'users-db rollout'
kubectl rollout status deployment/products-db --timeout=240s
Assert-LastExit 'products-db rollout'
kubectl rollout status deployment/orders-db --timeout=240s
Assert-LastExit 'orders-db rollout'
kubectl rollout status deployment/notifications-db --timeout=240s
Assert-LastExit 'notifications-db rollout'

Write-Host 'Initializing database schemas...'
& (Join-Path $PSScriptRoot 'init-k8s-db.ps1')

Write-Host 'Updating deployments to the new image tags...'
foreach ($service in $services) {
    kubectl set image "deployment/$($service.Name)" "$($service.Container)=$($service.Tag)"
    Assert-LastExit "set image $($service.Name)"
}

Write-Host 'Waiting for rollout...'
kubectl rollout status deployment/users-service --timeout=240s
Assert-LastExit 'users-service rollout'
kubectl rollout status deployment/products-service --timeout=240s
Assert-LastExit 'products-service rollout'
kubectl rollout status deployment/auth-service --timeout=240s
Assert-LastExit 'auth-service rollout'
kubectl rollout status deployment/orders-service --timeout=240s
Assert-LastExit 'orders-service rollout'
kubectl rollout status deployment/notifications-service --timeout=240s
Assert-LastExit 'notifications-service rollout'
kubectl rollout status deployment/api-gateway --timeout=240s
Assert-LastExit 'api-gateway rollout'

Write-Host 'Done. Current pods:'
kubectl get pods -o wide