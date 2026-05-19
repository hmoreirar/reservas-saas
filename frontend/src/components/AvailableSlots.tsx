import type { TimeSlot } from "../types";
import EmptyState from "./ui/EmptyState";

interface AvailableSlotsProps {
  slots: TimeSlot[];
  onSelectSlot: (slot: TimeSlot) => void;
}

export default function AvailableSlots({ slots, onSelectSlot }: AvailableSlotsProps) {
  if (slots.length === 0) {
    return (
      <EmptyState
        variant="slots"
        title="Sin horarios disponibles"
        description="No hay horarios libres para esta fecha. Prueba con otro día."
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-2 md:gap-3">
      {slots.map((slot, i) => (
        <button
          key={i}
          onClick={() => onSelectSlot(slot)}
          className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-amber-600 md:px-5 md:py-3"
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
