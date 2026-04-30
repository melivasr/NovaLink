#!/bin/bash

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

SERVICES=(
  "users-service:3001:3001"
  "products-service:3002:3002"
  "orders-service:3003:3003"
  "notifications-service:3004:3004"
  "auth-service:3005:3005"
)

for ENTRY in "${SERVICES[@]}"; do
  NAME=$(echo "$ENTRY" | cut -d: -f1)
  LOCAL_PORT=$(echo "$ENTRY" | cut -d: -f2)
  REMOTE_PORT=$(echo "$ENTRY" | cut -d: -f3)

  echo "Starting port-forward for $NAME ($LOCAL_PORT -> $REMOTE_PORT)..."
  kubectl port-forward "svc/$NAME" "$LOCAL_PORT:$REMOTE_PORT" &
done

echo ""
echo "Port-forwards iniciados en background."
echo "URLs disponibles:"
echo "  http://127.0.0.1:3001/health"
echo "  http://127.0.0.1:3002/health"
echo "  http://127.0.0.1:3003/health"
echo "  http://127.0.0.1:3004/health"
echo "  http://127.0.0.1:3005/health"
echo ""
echo "Para detenerlos corre: kill \$(lsof -ti:3001,3002,3003,3004)"