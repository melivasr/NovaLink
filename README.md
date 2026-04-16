# NovaLink - Sistema de Habilidades Sociales 

## Arquitectura

4 servicios independientes que se comunican vía HTTP:

- **Users Service** (puerto 3001): Gestión de usuarios y habilidades adquiridas
- **Inventory Service** (puerto 3002): Catálogo de habilidades sociales
- **Orders Service** (puerto 3003): Procesamiento de pedidos
- **Notifications Service** (puerto 3004): Envío de notificaciones


## Instalación y Ejecución

```bash
cd service-users
npm install
node app.js
```

```bash
cd service-inventory
npm install
node app.js
```

```bash
cd service-orders
npm install
node app.js
```

```bash
cd service-notifications
npm install
node app.js
```

## Endpoints

### Users Service (3001)

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | /api/v1/users | Crear usuario |
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
- 201: Created
- 204: No Content
- 400: Bad Request
- 404: Not Found
- 409: Conflict (stock insuficiente)

## Ejemplo de Uso Postman

### 1. Crear usuario
```json
POST http://localhost:3001/api/v1/users
{
	"name": "Juan Pérez",
	"email": "juan@example.com"
}
```