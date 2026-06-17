import { useState } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import type { TimeSlot, Service } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface PublicBookingModalProps {
  open: boolean;
  onClose: () => void;
  service: Service | null;
  slot: TimeSlot | null;
  onConfirm: (name: string, email: string, notes: string) => Promise<string | null>;
}

export default function PublicBookingModal({
  open,
  onClose,
  service,
  slot,
  onConfirm,
}: PublicBookingModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!clientName.trim()) {
      setError("Por favor ingresa tu nombre");
      return;
    }
    if (!EMAIL_RE.test(clientEmail)) {
      setError("Ingresa un email valido");
      return;
    }
    setError("");
    setIsBooking(true);
    const err = await onConfirm(clientName, clientEmail, notes);
    setIsBooking(false);
    if (err) {
      setError(err);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Confirmar Reserva">
      <div className="mb-5 rounded-lg bg-bg p-4">
        <p className="m-0 mb-1 font-semibold text-text">{service?.name}</p>
        <p className="m-0 text-sm text-text-secondary">
          {slot &&
            new Date(slot.start).toLocaleString("es-CL", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
        </p>
        <p className="m-0 mt-2 text-sm text-text-secondary">
          {service?.duration} min
          {service?.price != null ? ` \u2022 $${service.price}` : " \u2022 Precio a convenir"}
        </p>
      </div>

      {error && (
        <div className="mb-4 border-l-4 border-l-danger px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-text">Nombre completo *</label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Juan Pérez"
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-text">Email *</label>
        <input
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          placeholder="juan@example.com"
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div className="mb-5">
        <label className="mb-1 block text-sm font-medium text-text">Notas (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Informacion adicional..."
          className="min-h-[60px] w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleConfirm} disabled={isBooking} className="flex-1">
          {isBooking ? "Confirmando..." : "Confirmar Reserva"}
        </Button>
      </div>
    </Modal>
  );
}
