# NovaLink - Sistema de Habilidades Sociales 

## Arquitectura

5 servicios independientes que se comunican vía HTTP:

- **Auth Service** (puerto 3005): Autenticación centralizada con JWT
- **Users Service** (puerto 3001): Gestión de usuarios y habilidades adquiridas
- **Inventory Service** (puerto 3002): Catálogo de habilidades sociales
- **Orders Service** (puerto 3003): Procesamiento de pedidos
- **Notifications Service** (puerto 3004): Envío de notificaciones


## Instalación y Ejecución

### Kubernetes local

Para levantar todo el sistema en Minikube con un solo comando desde PowerShell:

```powershell
.\scripts\start-minikube.ps1
```

Para levantar el sistema y abrir automáticamente los 4 port-forwards locales (para probar desde navegador):

```powershell
.\scripts\start-all.ps1
```

Ese script:
- construye las 4 imágenes
- las carga en Minikube
- aplica todos los manifiestos de `k8s/`
- espera el rollout de los deployments

### Ejecución manual de servicios

Si quieres ejecutar un servicio individual en local, usa la carpeta bajo `services/`:

```bash
cd services/users
npm install
npm start
```

```bash
cd services/products
npm install
npm start
```

```bash
cd services/auth
npm install
npm start
```

```bash
cd services/notifications
npm install
npm start
```

## Ver Bases de Datos (Kubernetes)

Para conectarte a cada base de datos PostgreSQL dentro del cluster:

```powershell
kubectl exec -it $(kubectl get pod -l component=users-db -o jsonpath='{.items[0].metadata.name}') -- psql -U novalink_user -d users_db
kubectl exec -it $(kubectl get pod -l component=products-db -o jsonpath='{.items[0].metadata.name}') -- psql -U novalink_user -d products_db
kubectl exec -it $(kubectl get pod -l component=orders-db -o jsonpath='{.items[0].metadata.name}') -- psql -U novalink_user -d orders_db
```

Comandos útiles dentro de `psql`:

```sql
\dt
SELECT * FROM users;
SELECT * FROM user_skills;
SELECT * FROM products;
SELECT * FROM orders;
SELECT * FROM notifications;
\q
```

Los comandos anteriores ya buscan el pod actual automáticamente por label.

## Endpoints

### Users Service (3001)

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | /api/v1/users | Crear usuario |
| POST | /api/v1/users/login | Autenticación usuario |
| GET | /api/v1/users/{id} | Obtener usuario |
| PUT | /api/v1/users/{id} | Actualizar usuario |
| DELETE | /api/v1/users/{id} | Eliminar usuario |
| GET | /api/v1/users/{id}/skill | Listar habilidades |
| PUT | /api/v1/users/{id}/skill | Agregar habilidad |
| DELETE | /api/v1/users/{id}/skill | Quitar habilidad |

### Inventory Service (3002)

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | /api/v1/inventory | Crear habilidad |
| GET | /api/v1/inventory | Obtener habilidades |
| GET | /api/v1/inventory/{id} | Obtener habilidad |
| PUT | /api/v1/inventory/{id} | Actualizar habilidad o stock |
| DELETE | /api/v1/inventory/{id} | Eliminar habilidad |

### Orders Service (3003)

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | /api/v1/orders | Crear pedido |
| GET | /api/v1/orders/{id} | Obtener pedido |
| PUT | /api/v1/orders/{id} | Checkout (confirmar) |
| DELETE | /api/v1/orders/{id} | Cancelar pedido |
| GET | /api/v1/orders/user/{id} | Historial de usuario |

### Notifications Service (3004)

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | /api/v1/noti | Crear notificacion |
| GET | /api/v1/noti/user/{id} | Notificaciones de usuario |
| PUT | /api/v1/noti/{id}/read | Marcar como leida |
| DELETE | /api/v1/noti/{id} | Eliminar notificacion |

### Auth Service (3005)

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | /api/v1/auth/login | Obtener JWT token |
| GET | /api/v1/auth/verify | Verificar token (requiere Bearer) |

## Códigos de Respuesta

- 200: OK
- 202: Accepted
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized (Token inválido o faltante)
- 403: Forbidden (Token expirado)
- 404: Not Found
- 409: Conflict (stock insuficiente)

## Autenticación con JWT

NovaLink utiliza JSON Web Tokens (JWT) para proteger endpoints sensibles como la creación de pedidos.

### Flujo de Autenticación:

1. **Login** para obtener token:
```json
POST http://127.0.0.1:3005/api/v1/auth/login
{
  "email": "juan@example.com",
  "password": "secreto123"
}
```

Respuesta exitosa:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "juan@example.com",
      "name": "Juan Pérez"
    }
  },
  "message": "Login exitoso"
}
```

2. **Usar token** en requests protegidos (ejemplo: crear pedido):
```json
POST http://127.0.0.1:3003/api/v1/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "items": [
    {
      "skillId": "550e8400-e29b-41d4-a716-446655440001",
      "quantity": 2
    }
  ]
}
```

3. **Verificar token** (endpoint de diagnóstico):
```json
GET http://127.0.0.1:3005/api/v1/auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Notas de Seguridad:

- El token expira en 24 horas
- Los eventos publicados incluyen `user_id` y `issued_by: "auth-service"` para auditoría
- El servicio de Pedidos rechazará requests sin token válido con HTTP 401
- En producción, cambiar `JWT_SECRET_KEY` en `k8s/configmaps/novalink-secrets.yaml`

## Ejemplo de Uso Postman

### 1. Crear usuario
```json
POST http://127.0.0.1:3001/api/v1/users
{
	"name": "Juan Pérez",
	"email": "juan@example.com",
  	"password": "secreto123"
}
```


# Pagina WEB
## Montar 
cd NovaLink/FrontEnd
npm run dev
