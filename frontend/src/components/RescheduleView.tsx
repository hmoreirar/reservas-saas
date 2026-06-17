import { useState, useEffect } from "react";
import { getAvailability } from "../api/api";
import Button from "../components/ui/Button";
import type { Booking, TimeSlot } from "../types";

interface RescheduleViewProps {
  bookingId: number;
  bookings: Booking[];
  onBack: () => void;
  onConfirm: (slot: TimeSlot) => Promise<string | null>;
}

export default function RescheduleView({
  bookingId,
  bookings,
  onBack,
  onConfirm,
}: RescheduleViewProps) {
  const booking = bookings.find((b) => b.id === bookingId);
  const [date, setDate] = useState(
    booking ? new Date(booking.start_time).toISOString().split("T")[0] : ""
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!booking) return;
    const load = async () => {
      const data = await getAvailability(booking.service_id, date);
      if (Array.isArray(data)) {
        setSlots(data);
        setSelectedSlot(null);
      }
    };
    load();
  }, [date, booking]);

  if (!booking) return null;

  const handleConfirm = async () => {
    if (!selectedSlot) {
      setError("Selecciona un nuevo horario");
      return;
    }
    const err = await onConfirm(selectedSlot);
    if (err) setError(err);
  };

  return (
    <div className="min-h-screen bg-bg p-10 font-sans">
      <Button variant="secondary" onClick={onBack} className="mb-5">
        &larr; Volver
      </Button>

      <h2 className="mb-5 text-xl font-semibold text-text">Reprogramar Reserva</h2>

      <div className="mb-5">
        <label className="mr-3 text-sm text-text-secondary">Selecciona fecha:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-border px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
        />
      </div>

      {error && (
        <div className="mb-4 border-l-4 border-l-danger px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {slots.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-3">
          {slots.map((slot, i) => (
            <button
              key={i}
              onClick={() => setSelectedSlot(slot)}
              className={`cursor-pointer rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                selectedSlot?.start === slot.start
                  ? "bg-accent text-accent-text"
                  : "bg-surface text-text-secondary hover:bg-accent-bg hover:text-text"
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

      <Button onClick={handleConfirm}>
        Confirmar Reprogramacion
      </Button>
    </div>
  );
}
