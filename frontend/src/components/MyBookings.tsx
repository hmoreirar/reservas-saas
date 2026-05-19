import type { Booking } from "../types";

interface MyBookingsProps {
  bookings: Booking[];
  onReschedule: (id: number) => void;
  onCancel: (id: number) => void;
}

export default function MyBookings({ bookings, onReschedule, onCancel }: MyBookingsProps) {
  if (bookings.length === 0) {
    return <p className="text-sm text-gray-500">No tienes reservas</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div>
            <h4 className="m-0 mb-1.5 text-base font-semibold text-gray-800">
              {booking.service_name}
            </h4>
            <p className="m-0 text-sm text-gray-500">
              {booking.client_name} ({booking.client_email})
            </p>
            <p className="m-0 mt-1.5 text-sm text-gray-500">
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
              className="cursor-pointer rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              Reprogramar
            </button>
            <button
              onClick={() => onCancel(booking.id)}
              className="cursor-pointer rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
