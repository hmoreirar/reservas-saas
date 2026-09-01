import { useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import type { TimelineSlot } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InlineBookingFormProps {
  slot: TimelineSlot;
  serviceName: string;
  onConfirm: (name: string, email: string) => Promise<string | null>;
  onCancel: () => void;
}

export default function InlineBookingForm({
  slot,
  serviceName,
  onConfirm,
  onCancel,
}: InlineBookingFormProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");

  const timeLabel = new Date(slot.start).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateLabel = new Date(slot.start).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
    const err = await onConfirm(clientName, clientEmail);
    setIsBooking(false);
    if (err) {
      setError(err);
    } else {
      setClientName("");
      setClientEmail("");
    }
  };

  return (
    <div className="rounded-xl border border-accent bg-surface p-4 shadow-sm md:p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-text">{serviceName}</p>
        <p className="text-xs text-text-secondary">
          {dateLabel} &middot; {timeLabel}
        </p>
      </div>

      {error && (
        <div className="mb-3 border-l-4 border-l-danger px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="mb-3">
        <Input
          label="Nombre del cliente *"
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Juan Perez"
        />
      </div>

      <div className="mb-3">
        <Input
          label="Email del cliente *"
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          placeholder="juan@example.com"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleConfirm} disabled={isBooking} className="flex-1">
          {isBooking ? "Creando..." : "Confirmar Reserva"}
        </Button>
      </div>
    </div>
  );
}
