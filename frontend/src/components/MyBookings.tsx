import { useState, useMemo } from "react";
import type { Booking } from "../types";
import EmptyState from "./ui/EmptyState";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import StatusBadge from "./ui/StatusBadge";

const PAGE_SIZE = 10;

interface MyBookingsProps {
  bookings: Booking[];
  onReschedule: (id: number) => void;
  onCancel: (id: number) => void;
  onStatusChange: (id: number, status: string, reason?: string) => void;
}

const FILTERS = [
  { key: "", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "completed", label: "Completadas" },
  { key: "cancelled", label: "Canceladas" },
  { key: "no-show", label: "No asistio" },
];

export default function MyBookings({
  bookings,
  onReschedule,
  onCancel,
  onStatusChange,
}: MyBookingsProps) {
  const [declineModal, setDeclineModal] = useState<{ open: boolean; bookingId: number }>({ open: false, bookingId: 0 });
  const [declineReason, setDeclineReason] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return bookings
      .filter((b) => !statusFilter || b.status === statusFilter)
      .filter((b) => !q || b.client_name.toLowerCase().includes(q) || b.client_email.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  }, [bookings, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleDecline = () => {
    onStatusChange(declineModal.bookingId, "declined", declineReason || undefined);
    setDeclineModal({ open: false, bookingId: 0 });
    setDeclineReason("");
  };

  if (bookings.length === 0) {
    return (
      <EmptyState
        variant="bookings"
        title="No tienes reservas"
        description="Tus reservas apareceran aqui cuando los clientes agenden un turno."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none md:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => { setStatusFilter(f.key); setPage(1); }}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f.key
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          No se encontraron reservas con esos criterios.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {paginated.map((booking) => (
            <div
              key={booking.id}
              className="py-4"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <h4 className="m-0 text-base font-semibold text-text">
                      {booking.service_name}
                    </h4>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="m-0 text-sm text-text-secondary">
                    {booking.client_name} ({booking.client_email})
                  </p>
                  <p className="m-0 mt-1 text-sm text-text-secondary">
                    {new Date(booking.start_time).toLocaleString("es-CL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {booking.cancellation_reason && (
                    <p className="m-0 mt-1 text-xs text-danger">
                      Motivo: {booking.cancellation_reason}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {booking.status === "pending" && (
                    <>
                      <Button onClick={() => onStatusChange(booking.id, "confirmed")}>
                        Confirmar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => setDeclineModal({ open: true, bookingId: booking.id })}
                      >
                        Rechazar
                      </Button>
                    </>
                  )}

                  {booking.status === "confirmed" && (
                    <>
                      <Button onClick={() => onStatusChange(booking.id, "completed")}>
                        Completar
                      </Button>
                      <Button variant="ghost" onClick={() => onStatusChange(booking.id, "no-show")}>
                        No show
                      </Button>
                      <Button variant="secondary" onClick={() => onReschedule(booking.id)}>
                        Reprogramar
                      </Button>
                      <Button variant="danger" onClick={() => onCancel(booking.id)}>
                        Cancelar
                      </Button>
                    </>
                  )}

                  {["cancelled", "completed", "no-show"].includes(booking.status) && (
                    <span className="text-xs italic text-text-muted">
                      {booking.status === "cancelled" ? "Cancelada" :
                       booking.status === "completed" ? "Completada" : "No asistio"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="secondary"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            &larr; Anterior
          </Button>
          <span className="text-sm text-text-secondary">
            {safePage} / {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente &rarr;
          </Button>
        </div>
      )}

      <Modal open={declineModal.open} onClose={() => setDeclineModal({ open: false, bookingId: 0 })} title="Rechazar Reserva">
        <p className="mb-4 text-sm text-text-secondary">
          Ingresa un motivo opcional para informar al cliente.
        </p>
        <textarea
          value={declineReason}
          onChange={(e) => setDeclineReason(e.target.value)}
          placeholder="Motivo del rechazo..."
          className="mb-4 min-h-[80px] w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeclineModal({ open: false, bookingId: 0 })} className="flex-1">
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDecline} className="flex-1">
            Rechazar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
