$ErrorActionPreference = 'Stop'

function Get-PodByComponent {
    param([string]$Component)
    return (kubectl get pod -l "component=$Component" -o jsonpath='{.items[0].metadata.name}')
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
Exec-Sql -Pod $usersDbPod -Database 'users_db' -Sql 'CREATE TABLE IF NOT EXISTS user_skills (user_id UUID NOT NULL REFERENCES users(id), product_id UUID NOT NULL, acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, product_id));'

Write-Host 'Initializing products_db schema...'
Exec-Sql -Pod $productsDbPod -Database 'products_db' -Sql "CREATE TABLE IF NOT EXISTS products (id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text))::uuid, name VARCHAR(100) NOT NULL UNIQUE, difficulty VARCHAR(20) NOT NULL, xp_points INT NOT NULL, stock INT NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

Write-Host 'Initializing orders_db schema...'
Exec-Sql -Pod $ordersDbPod -Database 'orders_db' -Sql "CREATE TABLE IF NOT EXISTS orders (id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text))::uuid, user_id UUID NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'Pendiente', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
Exec-Sql -Pod $ordersDbPod -Database 'orders_db' -Sql 'CREATE TABLE IF NOT EXISTS cart_items (order_id UUID NOT NULL REFERENCES orders(id), product_id UUID NOT NULL, quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0), PRIMARY KEY (order_id, product_id));'
Exec-Sql -Pod $ordersDbPod -Database 'orders_db' -Sql "CREATE TABLE IF NOT EXISTS notifications (id UUID PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text))::uuid, user_id UUID NOT NULL, order_id UUID NOT NULL REFERENCES orders(id), message TEXT NOT NULL, is_read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

Write-Host 'Database schemas initialized.'