// Re-export del contrato wire compartido.
// Los tipos viven en packages/shared/src/types.ts.
export type {
  Service,
  ServiceHour,
  ServiceBreak,
  Booking,
  BookingStatus,
  BookingStatusAction,
  TimeSlot,
  Stats,
  TimelineSlot,
  TimelineSlotType,
  DayAgenda,
  PaginatedBookings,
  AuthUser,
  SessionResponse,
  MessageResponse,
} from "@reservas/shared";
