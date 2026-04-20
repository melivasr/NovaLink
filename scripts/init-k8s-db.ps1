$ErrorActionPreference = 'Stop'

function Get-PodByComponent {
    param([string]$Component)
    $pod = (kubectl get pod -l "component=$Component" -o jsonpath='{.items[0].metadata.name}')
    if ([string]::IsNullOrWhiteSpace($pod)) {
        throw "No pod found for component '$Component'."
    }

    return $pod
}

function Exec-Sql {
    param(
        [string]$Pod,
        [string]$Database,
        [string]$Sql
    )

    kubectl exec $Pod -- psql -U novalink_user -d $Database -v ON_ERROR_STOP=1 -c $Sql | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "SQL execution failed for database $Database"
    }
}

$usersDbPod = Get-PodByComponent -Component 'users-db'
$productsDbPod = Get-PodByComponent -Component 'products-db'
$ordersDbPod = Get-PodByComponent -Component 'orders-db'

Write-Host 'Initializing users_db schema...'
Exec-Sql -Pod $usersDbPod -Database 'users_db' -Sql "CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text))::uuid, name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
Exec-Sql -Pod $usersDbPod -Database 'users_db' -Sql 'CREATE TABLE IF NOT EXISTS user_skills (user_id UUID NOT NULL REFERENCES users(id), product_id UUID NOT NULL, xp_accumulated INT NOT NULL DEFAULT 0, acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, product_id));'
Exec-Sql -Pod $usersDbPod -Database 'users_db' -Sql 'ALTER TABLE user_skills ADD COLUMN IF NOT EXISTS xp_accumulated INT NOT NULL DEFAULT 0;'

Write-Host 'Initializing products_db schema...'
Exec-Sql -Pod $productsDbPod -Database 'products_db' -Sql "CREATE TABLE IF NOT EXISTS products (id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text))::uuid, name VARCHAR(100) NOT NULL UNIQUE, difficulty VARCHAR(20) NOT NULL, xp_points INT NOT NULL, price NUMERIC(10,2) NOT NULL DEFAULT 0, stock INT NOT NULL DEFAULT 0, is_activated BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
Exec-Sql -Pod $productsDbPod -Database 'products_db' -Sql "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_activated BOOLEAN NOT NULL DEFAULT TRUE;"
Exec-Sql -Pod $productsDbPod -Database 'products_db' -Sql "ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) NOT NULL DEFAULT 0;"

Write-Host 'Initializing orders_db schema...'
Exec-Sql -Pod $ordersDbPod -Database 'orders_db' -Sql "CREATE TABLE IF NOT EXISTS orders (id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text))::uuid, user_id UUID NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'Pendiente', total_amount NUMERIC(10,2) NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
Exec-Sql -Pod $ordersDbPod -Database 'orders_db' -Sql "ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2) NOT NULL DEFAULT 0;"
Exec-Sql -Pod $ordersDbPod -Database 'orders_db' -Sql 'CREATE TABLE IF NOT EXISTS cart_items (order_id UUID NOT NULL REFERENCES orders(id), product_id UUID NOT NULL, quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0), PRIMARY KEY (order_id, product_id));'
Exec-Sql -Pod $ordersDbPod -Database 'orders_db' -Sql "CREATE TABLE IF NOT EXISTS notifications (id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text))::uuid, user_id UUID NOT NULL, order_id UUID NOT NULL REFERENCES orders(id), message TEXT NOT NULL, is_read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

Write-Host 'Seeding products_db...'
Exec-Sql -Pod $productsDbPod -Database 'products_db' -Sql "INSERT INTO products (name, difficulty, xp_points, price, stock) VALUES ('Empatia', 'Facil', 3, 4.99, 100), ('Amistad', 'Facil', 2, 3.99, 100), ('Escucha Activa', 'Facil', 3, 4.99, 100), ('Respeto', 'Facil', 2, 3.99, 100), ('Humor', 'Facil', 1, 2.99, 100), ('Comunicacion Asertiva', 'Medio', 5, 9.99, 80), ('Colaboracion', 'Medio', 5, 9.99, 80), ('Paciencia', 'Medio', 6, 11.99, 80), ('Confianza', 'Medio', 5, 9.99, 80), ('Adaptabilidad', 'Medio', 6, 11.99, 80), ('Liderazgo', 'Dificil', 8, 19.99, 50), ('Resiliencia', 'Dificil', 9, 22.99, 50), ('Sagacidad', 'Dificil', 8, 19.99, 50), ('Creatividad', 'Dificil', 7, 17.99, 50), ('Iniciativa', 'Dificil', 7, 17.99, 50) ON CONFLICT (name) DO UPDATE SET price = EXCLUDED.price, xp_points = EXCLUDED.xp_points, stock = EXCLUDED.stock;"

Write-Host 'Database schemas initialized and seeded.'