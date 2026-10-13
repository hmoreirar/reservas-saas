# Memoria del proyecto — Reservas SaaS

## Stack
- Backend: Node.js + Express 5 + TypeScript + PostgreSQL + Zod + Pino
- Frontend: React 19 + React Router 7 + Tailwind CSS 4 + Vite 8
- Testing: Vitest (backend, 14 tests de integracion; frontend, 41 tests)

## Arquitectura backend
Routes → Controllers → Services → Repositories → PostgreSQL
JWT con bcrypt para auth, validacion con Zod, manejo de errores con AppError

## Estado del proyecto (26/06/2026)

### Fase 1 — Completada (commit 2da0806)
- `agendaService.ts`: getDayTimeline (timeline del dia con slots available/booked/blocked/past) y getWeekOverview (resumen de 7 dias)
- Endpoints nuevos: GET /api/agenda/day, GET /api/agenda/week
- Endpoint unificado: PUT /api/bookings/:id/status (reemplaza confirm/decline/complete/no-show)
- Refactor: eliminada duplicacion create/createPublic en bookingService.ts
- Frontend actualizado para usar endpoint unificado

### Fase 2 — Completada (commit fb92363)
- Nuevo ruteo: Dashboard con Outlet + 4 vistas (Agenda, Reservas, Servicios, Config)
- WeekBar: selector horizontal de 7 dias con navegacion semanal
- DayTimeline: timeline vertical del dia con slots available/booked/blocked/past
- InlineBookingForm: formulario inline (reemplaza BookingModal)
- BookingPopover: acciones rapidas sobre reserva existente
- Navbar con 4 tabs + bottom navigation fija en mobile
- Eliminados componentes viejos: CalendarView, AvailableSlots, BookingModal, RescheduleView

### Fase 3 — Completada (commit pendiente)
- BookingWizard: componente paso a paso con progress bar (3 pasos: Horario, Tus datos, Confirmar)
- Reemplazado PublicBookingModal por BookingWizard inline en BookingPage

### Fase 4 — Security pass (commit c58c190)
- PII leak cerrado: endpoint publico por slug ya no expone `provider_email`
- Guard de estados: reschedule/cancel rechazan reservas que no esten pending/confirmed
- Rate limit en registro (5/min por IP)
- Escape de HTML en correos + sanitizacion de asuntos (header injection)

### Fase 5 — Deploy Render + Neon (completado)
- `Dockerfile` multi-stage (node:22, layout repo intacto para static path)
- `docker-compose.yml` (app + postgres) y `.dockerignore`
- `backend/src/scripts/seedDemo.ts`: seed idempotente (gate `SEED_DEMO=true`), usuario demo `demo@reservas-saas.dev` / `demo1234`
- README reescrito: deploy Render/Neon, Docker, datos demo. Eliminado `railway.toml`
- Demo vivo: https://reservas-saas-bwa7.onrender.com/ (app Render free + DB Neon, seed con reservas pasadas y futuras)

### Fase 6 — Refactor de calidad (commits 81ec293..8b54cb2)
- Limpieza: UI kit muerto, API muerta, App.tsx, duplicacion de getWeekDays
- Bugs criticos: edicion real de servicios, Modal focus trap, fechas en timezone local (`@reservas/shared`), try/catch en handlers
- Contrato API: `ApiError` tipado reemplaza `{ error } as T`; workspace `@reservas/shared` con tipos wire + fechas
- UX: es-CL unificado, debounce+AbortController en busqueda, aria en kit UI, selector de tema en Configuracion
- Tests: 76 frontend (incl. suites de paginas), 54 backend, 2 E2E Playwright. Bug de foco de Modal y rechazos sin catch encontrados por tests

### Pendiente — Deuda tecnica
- ~~Migrar googleCalendar.js y zoom.js a TypeScript con logger Pino~~ (completado)
- ~~Agregar res.ok validation en frontend api.ts~~ (completado)
- ~~Agregar paginacion real a endpoints de bookings~~ (completado)
- ~~Tests de frontend: Vitest + RTL configurado, 41 tests (UI components, BookingWizard, api)~~ (completado)
- ~~Eliminar imports dinamicos en bookingService.ts~~ (completado)

## Convenios
- TypeScript strict mode, ESM modules, imports con extension .js
- Nombres de archivos en camelCase
- Frontend: fetch nativo, Context API para auth, Tailwind para estilos
- Backend: clases AppError para errores, logger Pino
- Endpoints publicos con rate limiting (login: 10/min, booking: 30/min)
