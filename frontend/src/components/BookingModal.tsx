import { useState } from "react";
import Modal from "./ui/Modal";
import type { TimeSlot, Service } from "../types";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  service: Service;
  slot: TimeSlot | null;
  defaultEmail: string;
  onConfirm: (name: string, email: string) => Promise<string | null>;
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
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!clientName.trim()) {
      setError("Por favor ingresa el nombre del cliente");
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
      setClientEmail(defaultEmail);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Crear Reserva">
      <p className="mb-5 text-sm text-stone-500">
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
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Nombre del cliente *
        </label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Email del cliente
        </label>
        <input
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
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
          {isBooking ? "Creando..." : "Confirmar Reserva"}
        </button>
      </div>
    </Modal>
  );
}
