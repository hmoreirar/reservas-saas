# Reservas SaaS

Sistema de reservas similar a Calendly, construido con React, Node.js y PostgreSQL.

## Caracteristicas

- Autenticacion de usuarios
- Gestion de servicios y disponibilidad
- Vista semanal del calendario
- Crear, cancelar y reprogramar reservas
- Dashboard con estadisticas
- Booking publico sin login
- Notificaciones por email (opcional)
- Zonas horarias configurables

## Tech Stack

- Backend: Node.js, Express, PostgreSQL
- Frontend: React, Vite
- Auth: JWT

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

## Configuracion

1. Crea la base de datos PostgreSQL:
```sql
CREATE DATABASE reservas_saas;
```

2. Configura `.env` en `backend/`:
```bash
cp backend/.env.example backend/.env
```

Luego ajusta los valores reales en `backend/.env`, especialmente `DB_*`, `JWT_SECRET` y SMTP si usarás correos.

## Uso

1. Ejecuta ambos proyectos
2. Registra un usuario
3. Crea servicios
4. Comparte el link publica (/book/:slug)

## API Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /api/auth/register | Registro |
| POST | /api/auth/login | Login |
| GET | /api/services | Listar servicios |
| POST | /api/services | Crear servicio |
| GET | /api/bookings/availability | Disponibilidad |
| POST | /api/bookings | Crear reserva |
| GET | /api/bookings/stats | Estadisticas |

## Licencia

MIT
