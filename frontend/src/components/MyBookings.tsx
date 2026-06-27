import { useState } from "react";
import type { Booking } from "../types";
import Input from "./ui/Input";
import EmptyState from "./ui/EmptyState";
import Modal from "./ui/Modal";
import Pagination from "./ui/Pagination";
import StatusBadge from "./ui/StatusBadge";

interface MyBookingsProps {
  bookings: Booking[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  statusFilter: string;
  onSearchChange: (q: string) => void;
  onFilterChange: (f: string) => void;
  onPageChange: (p: number) => void;
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
  total,
  page,
  totalPages,
  search,
  statusFilter,
  onSearchChange,
  onFilterChange,
  onPageChange,
  onReschedule,
  onCancel,
  onStatusChange,
}: MyBookingsProps) {
  const [declineModal, setDeclineModal] = useState<{ open: boolean; bookingId: number }>({ open: false, bookingId: 0 });
  const [declineReason, setDeclineReason] = useState("");

  const handleDecline = () => {
    onStatusChange(declineModal.bookingId, "declined", declineReason || undefined);
    setDeclineModal({ open: false, bookingId: 0 });
    setDeclineReason("");
  };

  if (total === 0) {
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
        <Input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="md:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
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

      {bookings.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          No se encontraron reservas con esos criterios.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {bookings.map((booking) => (
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

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={onPageChange} />

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
