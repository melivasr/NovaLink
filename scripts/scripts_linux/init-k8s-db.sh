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
exec_sql "$USERS_DB_POD" "users_db" "CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text))::uuid, name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, is_admin BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
exec_sql "$USERS_DB_POD" "users_db" "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;"
exec_sql "$USERS_DB_POD" "users_db" "CREATE TABLE IF NOT EXISTS user_skills (user_id UUID NOT NULL REFERENCES users(id), product_id UUID NOT NULL, xp_accumulated INT NOT NULL DEFAULT 0, acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, product_id));"
exec_sql "$USERS_DB_POD" "users_db" "ALTER TABLE user_skills ADD COLUMN IF NOT EXISTS xp_accumulated INT NOT NULL DEFAULT 0;"

echo "Initializing products_db schema..."
exec_sql "$PRODUCTS_DB_POD" "products_db" "CREATE TABLE IF NOT EXISTS products (id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text))::uuid, name VARCHAR(100) NOT NULL UNIQUE, difficulty VARCHAR(20) NOT NULL, xp_points INT NOT NULL, price NUMERIC(10,2) NOT NULL DEFAULT 0, stock INT NOT NULL DEFAULT 0, is_activated BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
exec_sql "$PRODUCTS_DB_POD" "products_db" "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_activated BOOLEAN NOT NULL DEFAULT TRUE;"
exec_sql "$PRODUCTS_DB_POD" "products_db" "ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) NOT NULL DEFAULT 0;"

echo "Initializing orders_db schema..."
exec_sql "$ORDERS_DB_POD" "orders_db" "CREATE TABLE IF NOT EXISTS orders (id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text))::uuid, user_id UUID NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'Pendiente', total_amount NUMERIC(10,2) NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
exec_sql "$ORDERS_DB_POD" "orders_db" "ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2) NOT NULL DEFAULT 0;"
exec_sql "$ORDERS_DB_POD" "orders_db" "CREATE TABLE IF NOT EXISTS cart_items (order_id UUID NOT NULL REFERENCES orders(id), product_id UUID NOT NULL, quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0), PRIMARY KEY (order_id, product_id));"
exec_sql "$ORDERS_DB_POD" "orders_db" "CREATE TABLE IF NOT EXISTS notifications (id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text))::uuid, user_id UUID NOT NULL, order_id UUID NOT NULL REFERENCES orders(id), message TEXT NOT NULL, is_read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

echo "Seeding users_db..."
exec_sql "$USERS_DB_POD" "users_db" "INSERT INTO users (name, email, password_hash, is_admin)
VALUES (
'Admin',
'admin@test.com',
'\$2a\$10\$MWyejpK4FMcDJpXU80uCM.bdS7ARGT3OdscRmH4qdXcNzRsdl/xda',
TRUE
)
ON CONFLICT (email)
DO UPDATE SET
password_hash = EXCLUDED.password_hash,
is_admin = EXCLUDED.is_admin;"

echo "Seeding products_db..."
exec_sql "$PRODUCTS_DB_POD" "products_db" "INSERT INTO products (name, difficulty, xp_points, price, stock) VALUES ('Empatia', 'Facil', 3, 4.99, 100), ('Amistad', 'Facil', 2, 3.99, 100), ('Escucha Activa', 'Facil', 3, 4.99, 100), ('Respeto', 'Facil', 2, 3.99, 100), ('Humor', 'Facil', 1, 2.99, 100), ('Comunicacion Asertiva', 'Medio', 5, 9.99, 80), ('Colaboracion', 'Medio', 5, 9.99, 80), ('Paciencia', 'Medio', 6, 11.99, 80), ('Confianza', 'Medio', 5, 9.99, 80), ('Adaptabilidad', 'Medio', 6, 11.99, 80), ('Liderazgo', 'Dificil', 8, 19.99, 50), ('Resiliencia', 'Dificil', 9, 22.99, 50), ('Sagacidad', 'Dificil', 8, 19.99, 50), ('Creatividad', 'Dificil', 7, 17.99, 50), ('Iniciativa', 'Dificil', 7, 17.99, 50) ON CONFLICT (name) DO UPDATE SET price = EXCLUDED.price, xp_points = EXCLUDED.xp_points, stock = EXCLUDED.stock;"

echo "Database schemas initialized and seeded."
