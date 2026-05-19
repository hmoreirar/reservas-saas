import type { TimeSlot } from "../types";

interface AvailableSlotsProps {
  slots: TimeSlot[];
  onSelectSlot: (slot: TimeSlot) => void;
}

export default function AvailableSlots({ slots, onSelectSlot }: AvailableSlotsProps) {
  if (slots.length === 0) {
    return <p className="text-sm text-gray-500">No hay horarios disponibles</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {slots.map((slot, i) => (
        <button
          key={i}
          onClick={() => onSelectSlot(slot)}
          className="cursor-pointer rounded-lg bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-indigo-600"
        >
          {new Date(slot.start).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </button>
      ))}
    </div>
  );
}
