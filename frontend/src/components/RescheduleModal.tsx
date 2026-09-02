import { useState, useEffect, useCallback } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Input from "./ui/Input";
import LoadingSpinner from "./ui/LoadingSpinner";
import { getAvailability } from "../api/api";
import type { Booking, TimeSlot } from "../types";

interface RescheduleModalProps {
  booking: Booking;
  onClose: () => void;
  onConfirm: (newStartTime: string) => Promise<string | null>;
}

function toDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function RescheduleModal({ booking, onClose, onConfirm }: RescheduleModalProps) {
  const [date, setDate] = useState(() => toDateOnly(new Date()));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (d: string) => {
    setLoading(true);
    setError("");
    setSelectedSlot(null);
    try {
      const data = (await getAvailability(booking.service_id, d)) as unknown as
        | TimeSlot[]
        | { error?: string };
      if (Array.isArray(data)) {
        setSlots(data);
      } else {
        setSlots([]);
        setError(data.error || "Error al cargar horarios");
      }
    } catch {
      setSlots([]);
      setError("Error al cargar horarios");
    } finally {
      setLoading(false);
    }
  }, [booking.service_id]);

  useEffect(() => { load(date); }, [date, load]);

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    const err = await onConfirm(selectedSlot.start);
    setSubmitting(false);
    if (err) setError(err);
  };

  return (
    <Modal open onClose={onClose} title="Reprogramar reserva">
      <p className="mb-4 text-sm text-text-secondary">
        {booking.client_name} &middot; {booking.service_name || "Servicio"}
      </p>

      <div className="mb-4">
        <Input
          label="Nueva fecha"
          type="date"
          value={date}
          min={toDateOnly(new Date())}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error && slots.length === 0 ? (
        <p className="py-4 text-center text-sm text-danger">{error}</p>
      ) : slots.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-muted">
          No hay horarios disponibles para esta fecha.
        </p>
      ) : (
        <div className="mb-4 flex max-h-56 flex-wrap gap-2 overflow-y-auto pr-1">
          {slots.map((slot) => (
            <button
              key={slot.start}
              onClick={() => setSelectedSlot(slot)}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedSlot?.start === slot.start
                  ? "border-accent bg-accent text-accent-text"
                  : "border-border text-text hover:border-accent hover:text-accent"
              }`}
            >
              {new Date(slot.start).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </button>
          ))}
        </div>
      )}

      {error && slots.length > 0 && <p className="mb-3 text-sm text-danger">{error}</p>}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleConfirm} disabled={!selectedSlot || submitting} className="flex-1">
          {submitting ? "Reprogramando..." : "Reprogramar"}
        </Button>
      </div>
    </Modal>
  );
}
