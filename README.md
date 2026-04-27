# Integra360

Arquitectura full-stack modular con Node.js + MySQL 8 + Vue 3, orientada a crecimiento, mantenibilidad y buenas practicas.

## Stack principal

- Backend: Node.js + TypeScript + Express modular
- Seguridad: JWT, Helmet, CORS, Rate limit
- Validacion: Zod
- Persistencia: Prisma ORM + MySQL 8+
- Logging: Pino
- Frontend: Vue 3 (Composition API), Vite, Router, Pinia, Vue Query
- UI: Tailwind CSS, Bootstrap 5, PrimeVue, Flowbite Vue
- Visualizacion: ApexCharts
- UX interactiva: SweetAlert2
- Testing base: Vitest
- DevOps: Docker + docker-compose

## Estructura

```
.
|-- backend/
|   |-- prisma/
|   |-- src/
|   |   |-- common/
|   |   |-- config/
|   |   |-- modules/
|   |   |-- routes/
|   |   `-- main.ts
|   `-- docker/
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- composables/
|   |   |-- layouts/
|   |   |-- router/
|   |   |-- services/
|   |   |-- store/
|   |   `-- views/
|   `-- docker/
`-- docker-compose.yml
```

## Configuracion de base de datos

La base `integra360` ya existe en MySQL. Credenciales de desarrollo:

- Usuario: `root`
- Password: `MySQL#2024!`
- Host: `localhost`
- Puerto: `3306`

La URL de conexion backend queda asi:

`mysql://root:MySQL%232024%21@localhost:3306/integra360`

## Ejecucion local (sin Docker)

1. Instalar dependencias:

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Configurar variables de entorno:

```bash
copy .env.example .env
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

3. Generar cliente Prisma y migrar:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

4. Iniciar servicios:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

## Ejecucion con Docker

```bash
copy .env.example .env
docker compose up --build
```

## Endpoints iniciales

- GET `/api/health`
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/users` (requiere JWT)
- GET `/api/products` (requiere JWT)

## Principios aplicados

- Arquitectura modular por dominio
- Separacion Controller-Service-Repository
- Manejo centralizado de errores
- Seguridad por defecto en capa HTTP
- Configuracion via variables de entorno
- Preparado para CI/CD y escalamiento por modulos

## Siguientes pasos recomendados

1. Agregar migraciones reales del dominio actual (inventario, ventas, caja, etc.)
2. Implementar refresh tokens y estrategia de revocacion JWT
3. Integrar pruebas unitarias por modulo y pruebas e2e
4. Agregar pipeline CI/CD (build, test, lint, deploy)