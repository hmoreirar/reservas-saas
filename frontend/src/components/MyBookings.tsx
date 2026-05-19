import type { Booking } from "../types";
import EmptyState from "./ui/EmptyState";

interface MyBookingsProps {
  bookings: Booking[];
  onReschedule: (id: number) => void;
  onCancel: (id: number) => void;
}

export default function MyBookings({ bookings, onReschedule, onCancel }: MyBookingsProps) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        variant="bookings"
        title="No tienes reservas"
        description="Tus reservas aparecerán aquí cuando los clientes agenden un turno."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking, i) => (
        <div
          key={booking.id}
          style={{ animationDelay: `${i * 80}ms` }}
          className="animate-slide-down flex flex-col justify-between gap-4 rounded-xl border border-stone-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:p-5"
        >
          <div className="min-w-0">
            <h4 className="m-0 mb-1.5 text-base font-semibold text-stone-800">
              {booking.service_name}
            </h4>
            <p className="m-0 text-sm text-stone-500">
              {booking.client_name} ({booking.client_email})
            </p>
            <p className="m-0 mt-1.5 text-sm text-stone-500">
              {new Date(booking.start_time).toLocaleString("es-CL", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onReschedule(booking.id)}
              className="cursor-pointer rounded-lg bg-amber-100 px-5 py-2.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-200"
            >
              Reprogramar
            </button>
            <button
              onClick={() => onCancel(booking.id)}
              className="cursor-pointer rounded-lg bg-orange-100 px-5 py-2.5 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
