# setup-monitoring.ps1
# Despliega el stack de observabilidad (Prometheus + Grafana) en Minikube
# Prerequisito: Minikube corriendo con los servicios de NovaLink ya desplegados

Write-Host "=== NovaLink - Setup de Observabilidad ===" -ForegroundColor Cyan

#Repo de Helm de prometheus-community
Write-Host "`n[1/5] Agregando repositorio Helm prometheus-community..." -ForegroundColor Yellow
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Crear namespace de monitoreo
Write-Host "`n[2/5] Creando namespace 'monitoring'..." -ForegroundColor Yellow
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

# Instalar kube-prometheus-stack con valores optimizados para Minikube
Write-Host "`n[3/5] Instalando kube-prometheus-stack (esto puede tardar 2-3 minutos)..." -ForegroundColor Yellow
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack `
  --namespace monitoring `
  -f k8s/monitoring/prometheus-values.yaml `
  --wait --timeout 5m

# Aplicar ServiceMonitors y dashboard de Grafana
Write-Host "`n[4/5] Aplicando ServiceMonitors y dashboard de Grafana..." -ForegroundColor Yellow
kubectl apply -f k8s/monitoring/servicemonitor-orders.yaml
kubectl apply -f k8s/monitoring/servicemonitor-products.yaml
kubectl apply -f k8s/monitoring/grafana-dashboard-configmap.yaml

# Port-forward para acceder localmente
Write-Host "`n[5/5] Iniciando port-forward de Grafana y Prometheus..." -ForegroundColor Yellow
Write-Host "  Grafana    -> http://localhost:3010  (admin / novalink-admin)" -ForegroundColor Green
Write-Host "  Prometheus -> http://localhost:9090" -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "kubectl port-forward -n monitoring svc/prometheus-grafana 3010:80"

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090"

Write-Host "`n=== Setup completado ===" -ForegroundColor Cyan
Write-Host "Espera ~60s para que Prometheus empiece a recolectar metricas de los servicios." -ForegroundColor White
Write-Host "Verifica los targets en: http://localhost:9090/targets" -ForegroundColor White
