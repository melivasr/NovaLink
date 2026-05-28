# NovaLink - Sistema de Habilidades Sociales 

## Finalidad del Proyecto
NovaLink es una plataforma diseñada para la compra, gestión y seguimiento de un catálogo virtual de "habilidades sociales". Su propósito principal es brindar un ecosistema altamente escalable que sirva como caso práctico integral para la implementación de arquitecturas distribuidas modernas. El sistema permite a los usuarios registrarse, explorar inventarios de habilidades, realizar pedidos de forma segura mediante JWT y recibir notificaciones asíncronas, demostrando el uso efectivo de microservicios, eventos (EDA) y orquestación con Kubernetes.

## Estado del Proyecto
**En fase de integración activa:** Toda la arquitectura backend (compuesta por los 5 microservicios base, bases de datos independientes y message broker) ya se encuentra completamente funcional y optimizada para ser desplegada en un clúster local de Kubernetes. Actualmente, el estado del proyecto se enfoca en consolidar la integración de las interfaces visuales a través del FrontEnd (React/Vite).

## Arquitectura

5 microservicios independientes desacoplados:

- **Auth Service** (puerto 3005): Autenticación centralizada con JWT
- **Users Service** (puerto 3001): Gestión de usuarios y habilidades adquiridas
- **Inventory Service** (puerto 3002): Catálogo de habilidades sociales
- **Orders Service** (puerto 3003): Procesamiento de pedidos
- **Notifications Service** (puerto 3004): Envío de notificaciones

## Diagramas

Puedes consultar los diagramas de arquitectura:
- diagrama-componentes.puml
- diagrama-despliegue.puml
- diagrama-eda.puml
- diagrama-secuencia-compra.puml

## Registros de Decisiones Arquitectónicas (ADRs)

Para mantener un seguimiento de las decisiones de diseño del sistema, documentamos los Arquitecture Decision Records (ADRs).

### ADR 001: Arquitectura basada en Microservicios
- **Contexto**: NovaLink necesita ser un sistema escalable y mantenible por múltiples equipos o desarrolladores en paralelo.
- **Decisión**: Se separó la lógica de negocio en 5 microservicios independientes (Auth, Users, Inventory, Orders, Notifications) más un API Gateway.
- **Consecuencias**: Permite escalabilidad y despliegue independiente, pero aumenta la complejidad operativa y requiere estrategias para consistencia distribuida.

### ADR 002: Patrón Base de Datos por Microservicio (Database per Service)
- **Contexto**: Un microservicio debe ser autónomo y su estado no debe ser modificado por otros servicios directamente.
- **Decisión**: Se provee una base de datos PostgreSQL separada para cada dominio de negocio (usuarios, productos, órdenes).
- **Consecuencias**: Se garantiza un fuerte aislamiento. Como un servicio no puede hacer "JOINs" con las tablas de otro, la agregación de datos se maneja a nivel de aplicación (API Gateway) o replicación por eventos.

### ADR 003: Comunicación Asíncrona basada en Eventos (EDA)
- **Contexto**: Los flujos de negocio que involucran varios servicios (ej. crear una orden de compra, reducir inventario, enviar notificación) no deben fallar en bloque si un solo servicio temporalmente no responde.
- **Decisión**: Implementar un bus de mensajes (RabbitMQ) y el patrón coreografía/eventos (`diagrama-eda.puml`) para comunicación entre microservicios.
- **Consecuencias**: Favorece fuertemente el desacoplamiento y resiliencia del sistema. Requiere lidiar con consistencia eventual y manejo de errores asíncronos.

### ADR 004: Adopción centralizada de un API Gateway
- **Contexto**: Los clientes FrontEnd necesitan consumir diferentes microservicios, lo cual requeriría conocer múltiples puertos, hostnames y complicaría el control de acceso (CORS/Auth).
- **Decisión**: Implementar un API Gateway como único punto de entrada para todas las aplicaciones cliente.
- **Consecuencias**: Facilita enormemente el consumo para el frontend. El API Gateway se convierte en una pieza crítica de la arquitectura que puede sufrir desgaste de agregación si alberga demasiada lógica de negocio.


## Instalación y Ejecución

### Kubernetes local

Para levantar todo el sistema en Minikube con un solo comando desde PowerShell:

```powershell
.\scripts\start-minikube.ps1
```

Para levantar el sistema y abrir automáticamente los 5 port-forwards locales (para probar desde navegador):

```powershell
.\scripts\start-all.ps1
```

Ese script:
- construye las 5 imágenes
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
kubectl exec -it $(kubectl get pod -l component=notifications-db -o jsonpath='{.items[0].metadata.name}') -- psql -U novalink_user -d notifications-db
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

## Endpoints (API Gateway)

Todas las peticiones (incluyendo las del FrontEnd) se realizan a través del **API Gateway** en el puerto `3000`. Internamente este se comunica con los microservicios correspondientes de forma unificada.

### Auth (`/api/v1/auth`)

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | /api/v1/auth/login | Obtener JWT token |
| POST | /api/v1/auth/verify | Verificar token (requiere Bearer) |

### Users (`/api/users`)

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | /api/users | Listar usuarios |
| POST | /api/users | Crear usuario |
| GET | /api/users/{id} | Obtener usuario |
| PUT | /api/users/{id} | Actualizar usuario |
| DELETE | /api/users/{id} | Eliminar usuario |
| GET | /api/users/{id}/skills | Listar habilidades de usuario |

### Products / Inventory (`/api/products`)

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | /api/products | Obtener catálogo de productos (habilidades) |
| GET | /api/products/{id} | Obtener producto individual |

### Orders (`/api/orders`)

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | /api/orders | Crear pedido (requiere JWT) |
| GET | /api/orders/{id} | Obtener pedido por ID |
| DELETE | /api/orders/{id} | Cancelar pedido |
| GET | /api/orders/user/{id} | Historial de órdenes de un usuario |

### Notifications (`/api/notifications`)

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | /api/notifications | Crear notificación |
| GET | /api/notifications/user/{id} | Notificaciones de un usuario |
| PUT | /api/notifications/{id}/read | Marcar notificación como leída |
| DELETE | /api/notifications/{id} | Eliminar notificación |

## Códigos de Respuesta

- 200: OK
- 202: Accepted (Operación asíncrona enviada al broker)
- 201: Created


- 204: No Content
- 400: Bad Request
- 401: Unauthorized (Token inválido o faltante)
- 403: Forbidden (Token expirado)
- 404: Not Found

## Autenticación con JWT

NovaLink utiliza JSON Web Tokens (JWT) para proteger endpoints sensibles como la creación de pedidos.

### Flujo de Autenticación:

1. **Login** para obtener token:
```json
POST http://localhost:3000/api/v1/auth/login
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
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "is_admin": false,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login exitoso"
}
```

2. **Usar token** en requests protegidos (ejemplo: crear pedido via API Gateway):
```json
POST http://localhost:3000/api/orders
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
POST http://localhost:3000/api/v1/auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Notas de Seguridad:

- El token expira en 24 horas
- Los eventos publicados incluyen `user_id` y `issued_by: "auth-service"` para auditoría
- El servicio de Pedidos rechazará requests sin token válido con HTTP 401
- En producción, cambiar `JWT_SECRET_KEY` en `k8s/configmaps/novalink-secrets.yaml`

## Ejemplo de Uso Postman

### 1. Crear usuario (Al API Gateway)
```json
POST http://localhost:3000/api/users
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
