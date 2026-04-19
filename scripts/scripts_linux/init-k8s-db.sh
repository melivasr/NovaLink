#!/bin/bash
set -e

exec_sql() {
  local POD=$1
  local DATABASE=$2
  local SQL=$3
  kubectl exec "$POD" -- psql -U novalink_user -d "$DATABASE" -v ON_ERROR_STOP=1 -c "$SQL"
  if [ $? -ne 0 ]; then
    echo "SQL execution failed for database $DATABASE"
    exit 1
  fi
}

get_pod_by_component() {
  local COMPONENT=$1
  local POD
  POD=$(kubectl get pod -l "component=$COMPONENT" -o jsonpath='{.items[0].metadata.name}')
  if [ -z "$POD" ]; then
    echo "No pod found for component '$COMPONENT'."
    exit 1
  fi
  echo "$POD"
}

USERS_DB_POD=$(get_pod_by_component "users-db")
PRODUCTS_DB_POD=$(get_pod_by_component "products-db")
ORDERS_DB_POD=$(get_pod_by_component "orders-db")

echo "Initializing users_db schema..."
exec_sql "$USERS_DB_POD" "users_db" "CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text))::uuid, name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
exec_sql "$USERS_DB_POD" "users_db" "CREATE TABLE IF NOT EXISTS user_skills (user_id UUID NOT NULL REFERENCES users(id), product_id UUID NOT NULL, acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, product_id));"

echo "Initializing products_db schema..."
exec_sql "$PRODUCTS_DB_POD" "products_db" "CREATE TABLE IF NOT EXISTS products (id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text))::uuid, name VARCHAR(100) NOT NULL UNIQUE, difficulty VARCHAR(20) NOT NULL, xp_points INT NOT NULL, stock INT NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

echo "Initializing orders_db schema..."
exec_sql "$ORDERS_DB_POD" "orders_db" "CREATE TABLE IF NOT EXISTS orders (id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text))::uuid, user_id UUID NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'Pendiente', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
exec_sql "$ORDERS_DB_POD" "orders_db" "CREATE TABLE IF NOT EXISTS cart_items (order_id UUID NOT NULL REFERENCES orders(id), product_id UUID NOT NULL, quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0), PRIMARY KEY (order_id, product_id));"
exec_sql "$ORDERS_DB_POD" "orders_db" "CREATE TABLE IF NOT EXISTS notifications (id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text))::uuid, user_id UUID NOT NULL, order_id UUID NOT NULL REFERENCES orders(id), message TEXT NOT NULL, is_read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

echo "Seeding products_db..."
exec_sql "$PRODUCTS_DB_POD" "products_db" "INSERT INTO products (name, difficulty, xp_points, stock) VALUES ('Empatia', 'Facil', 3, 100), ('Amistad', 'Facil', 2, 100), ('Escucha Activa', 'Facil', 3, 100), ('Respeto', 'Facil', 2, 100), ('Humor', 'Facil', 1, 100), ('Comunicacion Asertiva', 'Medio', 5, 80), ('Colaboracion', 'Medio', 5, 80), ('Paciencia', 'Medio', 6, 80), ('Confianza', 'Medio', 5, 80), ('Adaptabilidad', 'Medio', 6, 80), ('Liderazgo', 'Dificil', 8, 50), ('Resiliencia', 'Dificil', 9, 50), ('Sagacidad', 'Dificil', 8, 50), ('Creatividad', 'Dificil', 7, 50), ('Iniciativa', 'Dificil', 7, 50) ON CONFLICT (name) DO NOTHING;"

echo "Database schemas initialized and seeded."