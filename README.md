# Reservas SaaS

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express-000?logo=express&logoColor=fff)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?logo=railway&logoColor=fff)

> Sistema de agendamiento de turnos tipo Calendly. Los proveedores gestionan servicios desde un dashboard y los clientes reservan sin necesidad de login.

🔗 **Demo:** [reservas-saas-production.up.railway.app](https://reservas-saas-production.up.railway.app/)

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, React Router v7, Vite |
| Backend | Node.js, Express 5, TypeScript (tipado en API) |
| Base de datos | PostgreSQL |
| Auth | JWT (bcrypt + jsonwebtoken) |
| Email | Nodemailer (opcional) |
| Deploy | Railway |

## Features

- **Dashboard** con estadísticas de reservas (totales, confirmadas, canceladas, ingresos)
- **Servicios** — CRUD completo con nombre, descripción, duración, precio y horarios configurables
- **Calendario semanal** con navegación y slots disponibles
- **Booking público** — los clientes reservan turnos sin registrarse via `/book/:slug`
- **Reprogramación y cancelación** de turnos desde el dashboard
- **Autenticación** con registro e inicio de sesión
- **Diseño responsive** con menú hamburguesa en mobile
- **Micro-interacciones** — animaciones CSS (fade, scale, stagger, slide) sin librerías externas
- **Estados vacíos** con ilustraciones SVG inline

## Screenshots

| Login | Dashboard |
|---|---|
| ![Login](screenshots/login.png) | ![Dashboard](screenshots/dashboard.png) |

| Mis Reservas | Mobile login |
|---|---|---|
| ![Bookings](screenshots/bookings.png) | ![Login mobile](screenshots/login-mobile.png) |

| Mobile dashboard |
|---|
| ![Dashboard mobile](screenshots/dashboard-mobile.png) |

> 💡 Las capturas del dashboard muestran el panel con estadísticas, servicios y calendario. La vista pública de booking se genera automáticamente al crear un servicio.

## Inicio rápido

```bash
git clone https://github.com/tu-usuario/reservas-saas.git
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

## API

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/services` | Listar servicios |
| POST | `/api/services` | Crear servicio |
| DELETE | `/api/services/:id` | Eliminar servicio |
| GET | `/api/bookings/availability?service_id=&date=` | Slots disponibles |
| POST | `/api/bookings` | Crear reserva (público) |
| GET | `/api/bookings` | Mis reservas |
| DELETE | `/api/bookings/:id` | Cancelar reserva |
| PATCH | `/api/bookings/:id/reschedule` | Reprogramar reserva |
| GET | `/api/bookings/stats` | Estadísticas del dashboard |

## Estructura del proyecto

```
reservas-saas/
├── backend/
│   └── src/
│       ├── config/        # Conexión DB, auth
│       ├── routes/        # Rutas de la API
│       └── server.js      # Entry point
├── frontend/
│   └── src/
│       ├── api/           # Cliente API con tipos TypeScript
│       ├── components/    # Componentes React
│       │   └── ui/        # Button, Modal, Alert, Input, Card, Logo, EmptyState
│       ├── context/       # AuthContext (estado global)
│       ├── hooks/         # Custom hooks (useWeekDays)
│       ├── pages/         # LoginPage, BookingPage
│       ├── types/         # Interfaces TypeScript
│       └── App.tsx        # Orquestador del dashboard
├── screenshots/           # Capturas de pantalla
└── railway.toml           # Configuración de Railway
```
