# NovaLink - Sistema de Habilidades Sociales 

## Arquitectura

4 servicios independientes que se comunican vía HTTP:

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
cd services/orders
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

## Códigos de Respuesta

- 200: OK
- 202: Accepted
- 201: Created
- 204: No Content
- 400: Bad Request
- 404: Not Found
- 409: Conflict (stock insuficiente)

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
