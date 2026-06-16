import { useState } from "react";
import Modal from "./ui/Modal";
import type { TimeSlot, Service } from "../types";

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
    if (!clientName.trim() || !clientEmail.trim()) {
      setError("Nombre y email son requeridos");
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
      <div className="mb-5 rounded-lg bg-stone-50 p-4">
        <p className="m-0 mb-1 font-semibold text-stone-800">{service?.name}</p>
        <p className="m-0 text-sm text-stone-500">
          {slot &&
            new Date(slot.start).toLocaleString("es-CL", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
        </p>
        <p className="m-0 mt-2 text-sm text-stone-500">
          {service?.duration} min
          {service?.price != null ? ` \u2022 $${service.price}` : " \u2022 Precio a convenir"}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-stone-700">Nombre completo *</label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Juan Pérez"
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-stone-700">Email *</label>
        <input
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          placeholder="juan@example.com"
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <div className="mb-5">
        <label className="mb-1 block text-sm font-medium text-stone-700">Notas (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Información adicional..."
          className="min-h-[60px] w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 cursor-pointer rounded-lg bg-stone-200 px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-300"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={isBooking}
          className={`flex-1 cursor-pointer rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors ${
            isBooking
              ? "cursor-not-allowed bg-stone-400"
              : "bg-amber-500 hover:bg-amber-600"
          }`}
        >
          {isBooking ? "Confirmando..." : "Confirmar Reserva"}
        </button>
      </div>
    </Modal>
  );
}
