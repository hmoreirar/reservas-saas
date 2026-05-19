import { useState, useEffect } from "react";
import { getAvailability } from "../api/api";
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
    <div className="min-h-screen bg-gray-50 p-10 font-sans">
      <button
        onClick={onBack}
        className="mb-5 cursor-pointer rounded-lg bg-gray-200 px-5 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-300"
      >
        &larr; Volver
      </button>

      <h2 className="mb-5 text-xl font-semibold text-gray-800">Reprogramar Reserva</h2>

      <div className="mb-5">
        <label className="mr-3 text-sm text-gray-600">Selecciona fecha:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
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
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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

      <button
        onClick={handleConfirm}
        className="cursor-pointer rounded-lg bg-indigo-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
      >
        Confirmar Reprogramación
      </button>
    </div>
  );
}
