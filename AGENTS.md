# Memoria del proyecto — Reservas SaaS

## Stack
- Backend: Node.js + Express 5 + TypeScript + PostgreSQL + Zod + Pino
- Frontend: React 19 + React Router 7 + Tailwind CSS 4 + Vite 8
- Testing: Vitest (backend, 14 tests de integracion)

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

### Pendiente — Deuda tecnica
- Migrar googleCalendar.js y zoom.js a TypeScript con logger Pino
- Agregar res.ok validation en frontend api.ts
- Agregar paginacion real a endpoints de bookings
- Tests de frontend
- Eliminar imports dinamicos en bookingService.ts

## Convenios
- TypeScript strict mode, ESM modules, imports con extension .js
- Nombres de archivos en camelCase
- Frontend: fetch nativo, Context API para auth, Tailwind para estilos
- Backend: clases AppError para errores, logger Pino
- Endpoints publicos con rate limiting (login: 10/min, booking: 30/min)
