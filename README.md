# Reservas SaaS

Sistema de reservas similar a Calendly, construido con React, Node.js y PostgreSQL.

## Características

- 🔐 Autenticación de usuarios
- 📅 Gestión de servicios y disponibilidad
- 📆 Vista semanal del calendario
- 🎫 Crear, cancelar y reprogramar reservas
- 📊 Dashboard con estadísticas
- 🌐 Booking público sin login
- 📧 Notificaciones por email (opcional)
- 🌍 Zonas horarias configurables

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: React, Vite
- **Auth**: JWT

## Quick Start

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (otro terminal)
cd frontend
npm install
npm run dev
```

## Configuración

1. Crea la base de datos PostgreSQL:
```sql
CREATE DATABASE reservas_saas;
```

2. Configura `.env` en `backend/`:
```
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_NAME=reservas_saas
```

## Uso

1. Ejecuta ambos proyectos
2. Registra un usuario
3. Crea servicios
4. Comparte el link público (`/book/:slug`)

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/register | Registro |
| POST | /api/auth/login | Login |
| GET | /api/services | Listar servicios |
| POST | /api/services | Crear servicio |
| GET | /api/bookings/availability | Disponibilidad |
| POST | /api/bookings | Crear reserva |
| GET | /api/bookings/stats | Estadísticas |

## Licencia

MIT