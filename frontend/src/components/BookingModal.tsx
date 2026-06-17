import { useState } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import type { TimeSlot, Service } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  service: Service | null;
  slot: TimeSlot | null;
  defaultEmail: string;
  onConfirm: (name: string, email: string, price?: number | null) => Promise<string | null>;
}

export default function BookingModal({
  open,
  onClose,
  service,
  slot,
  defaultEmail,
  onConfirm,
}: BookingModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState(defaultEmail);
  const [manualPrice, setManualPrice] = useState(service?.price ? String(service.price) : "");
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!clientName.trim()) {
      setError("Por favor ingresa el nombre del cliente");
      return;
    }
    if (!EMAIL_RE.test(clientEmail)) {
      setError("Ingresa un email valido");
      return;
    }
    setError("");
    setIsBooking(true);
    const price = manualPrice ? Number(manualPrice) : null;
    const err = await onConfirm(clientName, clientEmail, price);
    setIsBooking(false);
    if (err) {
      setError(err);
    } else {
      setClientName("");
      setClientEmail(defaultEmail);
      setManualPrice(service?.price ? String(service.price) : "");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Crear Reserva">
      <p className="mb-5 text-sm text-text-secondary">
        {slot &&
          new Date(slot.start).toLocaleString("es-CL", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
      </p>

      {error && (
        <div className="mb-4 border-l-4 border-l-danger px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-text">
          Nombre del cliente *
        </label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-text">
          Email del cliente *
        </label>
        <input
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-text">
          Precio ($)
        </label>
        <input
          type="number"
          value={manualPrice}
          onChange={(e) => setManualPrice(e.target.value)}
          placeholder={service?.price ? String(service.price) : "Precio variable"}
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleConfirm} disabled={isBooking} className="flex-1">
          {isBooking ? "Creando..." : "Confirmar Reserva"}
        </Button>
      </div>
    </Modal>
  );
}
