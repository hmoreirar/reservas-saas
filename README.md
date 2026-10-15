# Reservas SaaS

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express-000?logo=express&logoColor=fff)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff)

> Sistema de agendamiento de turnos tipo Calendly. Los proveedores gestionan servicios desde un dashboard y los clientes reservan sin necesidad de login.

🔗 **Demo en vivo:** [reservas-saas-bwa7.onrender.com](https://reservas-saas-bwa7.onrender.com/) — cuenta demo `demo@reservas-saas.dev` / `demo1234`, reserva pública en `/book/corte-demo-book`.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, React Router v7, Vite |
| Backend | Node.js, Express 5, TypeScript (tipado en API) |
| Base de datos | PostgreSQL |
| Auth | JWT (bcrypt + jsonwebtoken) |
| Email | Nodemailer (opcional) |
| Deploy | Render + Neon (free tier), Docker |

## Features

- **Agenda tipo calendario** — bloques de citas reales, toca un hueco y agendás en dos pasos
- **Agendar en dos toques** — botón flotante "+ Agendar hora" con nombre y WhatsApp del cliente
- **WhatsApp primero** — confirmaciones y recordatorios con un click (links `wa.me` con mensaje listo)
- **Primeros pasos** — guía de 3 pasos para configurar el servicio y compartir el link de reservas
- **Booking público** — los clientes reservan sin registrarse via `/book/:slug`, con WhatsApp como contacto principal
- **Servicios** — duración y precio a la vista, ajustes avanzados colapsados (capacidad, timezone, horarios)
- **Estadísticas** — ingresos, estados y reservas por servicio (abajo de la agenda)
- **Modo oscuro** y diseño mobile-first minimalista

## Screenshots

| Agenda | Cita con WhatsApp |
|---|---|
| ![Agenda](screenshots/design-2026-10/02-agenda-light.png) | ![Cita](screenshots/design-2026-10/15-popover-whatsapp.png) |

| Agendar hora | Reserva pública |
|---|---|
| ![Agendar](screenshots/design-2026-10/10-sheet-calendario.png) | ![Reserva publica](screenshots/design-2026-10/04-booking-publico.png) |

| Primeros pasos | Modo oscuro |
|---|---|
| ![Primeros pasos](screenshots/design-2026-10/13-primeros-pasos.png) | ![Agenda dark](screenshots/design-2026-10/06-agenda-dark.png) |

> 💡 Diseño minimalista monocromo con modo oscuro y enfoque mobile-first. La vista pública de booking se genera automáticamente al crear un servicio (`/book/:slug`).

## Inicio rápido

### Opcion 1: Docker (recomendada)

```bash
git clone https://github.com/hmoreirar/reservas-saas.git
cd reservas-saas
docker compose up --build        # → http://localhost:3000

# (opcional) datos de ejemplo
docker compose run --rm -e SEED_DEMO=true app node dist/scripts/seedDemo.js
```

### Opcion 2: local

```bash
git clone https://github.com/hmoreirar/reservas-saas.git
cd reservas-saas

# Backend
cd backend
cp .env.example .env   # configurar DB, JWT_SECRET
npm install
npm run dev             # → http://localhost:3000

# Frontend (otra terminal)
cd frontend
npm install
npm run dev             # → http://localhost:5173
```

### Variables de entorno (`backend/.env`)

```
DATABASE_URL=postgresql://user:pass@host:5432/reservas_saas
JWT_SECRET=tu-secreto
SMTP_HOST=smtp.example.com    # opcional
SMTP_PORT=587
SMTP_USER=tu-email
SMTP_PASS=tu-password
```

### Datos de demo

```bash
cd backend
SEED_DEMO=true npm run seed
```

Crea proveedor demo, 3 servicios con horarios y descansos, reservas en varios
estados. Idempotente: repetir no duplica datos.

| Credencial | Valor |
|---|---|
| Email | `demo@reservas-saas.dev` |
| Password | `demo1234` |
| Reserva publica | `/book/corte-demo-book` |

## Deploy (Render + Neon)

Gratis, sin tarjeta de credito. ~15 minutos.

### 1. Base de datos (Neon)

1. Crear cuenta en [neon.com](https://neon.com) y un proyecto (plan Free)
2. Copiar el `DATABASE_URL` **pooled** (las transacciones usan
   `pg_advisory_xact_lock` dentro de `BEGIN/COMMIT`, pinneadas a un backend)
3. Restaurar datos si vienes de otro host:
   `pg_restore "$DATABASE_URL" --no-owner --no-privileges -d neondb reservas-saas.dump`
4. Las migraciones corren solas al arrancar (`runMigrations`)

### 2. App (Render)

1. En [render.com](https://render.com): **New +** → **Web Service** → conectar el repo de GitHub
2. Runtime **Docker** (detecta el `Dockerfile` de la raiz), instance **Free**
3. Health Check Path: `/api/health`
4. Variables de entorno:

```
DATABASE_URL=postgresql://...     # de Neon
JWT_SECRET=un-secreto-largo
NODE_ENV=production
FRONTEND_URL=https://<tu-servicio>.onrender.com
```

5. **Create Web Service** → build ~3-5 min
6. Seed de demo (opcional): `SEED_DEMO=true npm run seed` local con `backend/.env`
   apuntando a Neon

> Nota: el tier Free de Render duerme el servicio tras 15 min sin trafico;
> la primera visita tarda ~50s (cold start).

### 3. SMTP (opcional)

Sin SMTP configurado el sistema funciona completo, solo no envia correos.
Para activarlos: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (Gmail usa
`SMTP_USER` como remitente).

## API

Todas las rutas bajo `/api`. Las marcadas con (public) no requieren token.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/register` | Registro de usuario (rate limit 5/min) |
| POST | `/auth/login` | Inicio de sesión (rate limit 10/min) |
| GET | `/auth/me` | Usuario actual |
| GET | `/services` | Listar servicios del proveedor |
| POST | `/services` | Crear servicio |
| GET | `/services/:slug` | Servicio por slug (public) |
| PUT | `/services/:id` | Actualizar servicio |
| DELETE | `/services/:id` | Eliminar servicio |
| GET/PUT | `/services/:id/hours` | Horarios por dia |
| DELETE | `/services/:id/hours` | Restablecer horarios |
| GET/POST | `/services/:id/breaks` | Bloqueos y descansos |
| DELETE | `/services/:id/breaks/:breakId` | Eliminar bloqueo |
| GET | `/bookings/availability` | Slots disponibles |
| GET | `/bookings/public/availability` | Slots disponibles (public) |
| POST | `/bookings` | Crear reserva (proveedor) |
| POST | `/bookings/public` | Crear reserva (public, rate limit 30/min) |
| GET | `/bookings/day` | Reservas del dia |
| GET | `/bookings/my` | Mis reservas (paginadas, buscables) |
| GET | `/bookings/stats` | Estadisticas del dashboard |
| PUT | `/bookings/:id/status` | Confirmar/rechazar/completar/no-show |
| PUT | `/bookings/:id/cancel` | Cancelar reserva |
| PUT | `/bookings/:id/reschedule` | Reprogramar reserva |
| GET | `/agenda/day` | Timeline del dia |
| GET | `/agenda/week` | Resumen semanal |
| GET/POST | `/staff` | Listar/crear staff |
| PUT/DELETE | `/staff/:id` | Actualizar/eliminar staff |
| PUT | `/staff/assign/:bookingId` | Asignar staff a reserva |
| GET | `/health` | Healthcheck |

## Estructura del proyecto

```
reservas-saas/
├── backend/
│   └── src/
│       ├── config/        # Conexión DB, rate limit
│       ├── routes/        # Rutas de la API
│       ├── scripts/       # seedDemo.ts (datos de ejemplo)
│       └── server.ts      # Entry point
├── frontend/
│   └── src/
│       ├── api/           # Cliente API tipado (ApiError)
│       ├── components/    # Componentes React
│       │   └── ui/        # Button, Modal, Alert, Input, Toast, Tabs, StatusBadge
│       ├── context/       # AuthContext, ThemeContext (estado global)
│       ├── hooks/         # Custom hooks (useWeekOffset)
│       ├── pages/         # Agenda, Reservas, Servicios, Config, Login
│       ├── test/          # Tests unitarios y de paginas (Vitest + RTL)
│       └── main.tsx       # Router y providers
├── packages/
│   └── shared/            # Contrato wire y utilidades compartidas
├── e2e/                   # Tests end-to-end (Playwright)
├── screenshots/           # Capturas de pantalla
├── Dockerfile             # Build multi-stage (frontend + backend)
└── docker-compose.yml     # App + PostgreSQL para desarrollo
```

## Tests

```bash
npm test             # backend (Vitest + Supertest, PostgreSQL real)
npm run test:frontend  # frontend (Vitest + Testing Library)
npm run test:e2e     # end-to-end (Playwright, app completa)
```
