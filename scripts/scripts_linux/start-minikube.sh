#!/bin/bash
set -e

export PATH=$PATH:/usr/bin

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

# --- Verificar Docker ---
if ! docker info > /dev/null 2>&1; then
  echo "Docker no está corriendo. Ábrelo y vuelve a intentarlo."
  exit 1
fi

# --- Verificar/Iniciar Minikube ---
if ! minikube -p minikube status > /dev/null 2>&1; then
  echo "Minikube no está corriendo. Iniciando..."
  minikube start -p minikube --driver=docker
fi

if ! kubectl cluster-info > /dev/null 2>&1; then
  echo "Kubernetes API no responde. Corre 'minikube -p minikube start' y reintenta."
  exit 1
fi

# --- Tag dinámico igual que en Windows ---
IMAGE_TAG="dev-$(date +'%Y%m%d%H%M%S')"
echo "Using image tag: $IMAGE_TAG"

# --- Build y carga de imágenes ---
echo "Building service images..."

build_and_load() {
  local NAME=$1
  local SERVICE_PATH=$2
  local TAG=$3
  echo "Building $NAME..."
  docker build -t "$TAG" "$REPO_ROOT/$SERVICE_PATH"
  minikube -p minikube image load "$TAG"
}

build_and_load "users-service"         "services/users"         "novalink/users-service:$IMAGE_TAG"
build_and_load "products-service"      "services/products"      "novalink/products-service:$IMAGE_TAG"
build_and_load "orders-service"        "services/orders"        "novalink/orders-service:$IMAGE_TAG"
build_and_load "notifications-service" "services/notifications" "novalink/notifications-service:$IMAGE_TAG"

# --- Aplicar manifiestos de Kubernetes ---
echo "Applying Kubernetes manifests..."
kubectl apply -f "$REPO_ROOT/k8s/configmaps"
kubectl apply -f "$REPO_ROOT/k8s/deployments"

# --- Esperar bases de datos ---
echo "Waiting for database deployments..."
kubectl rollout status deployment/users-db --timeout=240s
kubectl rollout status deployment/products-db --timeout=240s
kubectl rollout status deployment/orders-db --timeout=240s

# --- Inicializar esquemas ---
echo "Initializing database schemas..."
bash "$(dirname "$0")/init-k8s-db.sh"

# --- Actualizar imágenes en deployments ---
echo "Updating deployments to the new image tags..."
kubectl set image deployment/users-service         users="novalink/users-service:$IMAGE_TAG"
kubectl set image deployment/products-service      products="novalink/products-service:$IMAGE_TAG"
kubectl set image deployment/orders-service        orders="novalink/orders-service:$IMAGE_TAG"
kubectl set image deployment/notifications-service notifications="novalink/notifications-service:$IMAGE_TAG"

# --- Esperar rollout ---
echo "Waiting for rollout..."
kubectl rollout status deployment/users-service --timeout=240s
kubectl rollout status deployment/products-service --timeout=240s
kubectl rollout status deployment/orders-service --timeout=240s
kubectl rollout status deployment/notifications-service --timeout=240s

echo "Done. Current pods:"
kubectl get pods -o wide