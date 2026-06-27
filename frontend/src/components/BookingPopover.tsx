import Button from "./ui/Button";
import StatusBadge from "./ui/StatusBadge";
import type { Booking } from "../types";

interface BookingPopoverProps {
  booking: Booking;
  serviceName: string;
  onStatusChange: (id: number, status: string, reason?: string) => void;
  onReschedule: (id: number) => void;
  onCancel: (id: number) => void;
  onClose: () => void;
}

export default function BookingPopover({
  booking,
  serviceName,
  onStatusChange,
  onReschedule,
  onCancel,
  onClose,
}: BookingPopoverProps) {
  const timeLabel = new Date(booking.start_time).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateLabel = new Date(booking.start_time).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm md:p-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-text">{booking.client_name}</p>
          <p className="text-xs text-text-secondary">{booking.client_email}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mb-3 space-y-1 text-xs text-text-secondary">
        <p>{serviceName}</p>
        <p>{dateLabel} &middot; {timeLabel}</p>
        {booking.price != null && <p>Precio: ${booking.price}</p>}
        {booking.notes && <p>Notas: {booking.notes}</p>}
        {booking.cancellation_reason && (
          <p className="text-danger">Motivo: {booking.cancellation_reason}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {booking.status === "pending" && (
          <>
            <Button onClick={() => { onStatusChange(booking.id, "confirmed"); onClose(); }}>
              Confirmar
            </Button>
            <Button variant="danger" onClick={() => { onStatusChange(booking.id, "declined"); onClose(); }}>
              Rechazar
            </Button>
          </>
        )}

        {booking.status === "confirmed" && (
          <>
            <Button onClick={() => { onStatusChange(booking.id, "completed"); onClose(); }}>
              Completar
            </Button>
            <Button variant="ghost" onClick={() => { onStatusChange(booking.id, "no-show"); onClose(); }}>
              No show
            </Button>
            <Button variant="secondary" onClick={() => { onReschedule(booking.id); onClose(); }}>
              Reprogramar
            </Button>
            <Button variant="danger" onClick={() => { onCancel(booking.id); onClose(); }}>
              Cancelar
            </Button>
          </>
        )}

        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
