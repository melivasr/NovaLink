#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting/updating Kubernetes stack..."
bash "$SCRIPT_DIR/start-minikube.sh"

echo "Opening local port-forwards..."
bash "$SCRIPT_DIR/port-forward-all.sh"

echo "System ready for local browser tests."