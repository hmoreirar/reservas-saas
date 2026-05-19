import type { Service } from "../types";

interface BookingSuccessProps {
  service: Service;
  clientEmail: string;
}

export default function BookingSuccess({ service, clientEmail }: BookingSuccessProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 font-sans">
      <div className="max-w-md rounded-2xl bg-white p-12 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">
          ✓
        </div>
        <h1 className="mb-2 text-2xl font-bold text-green-700">¡Reserva Confirmada!</h1>
        <p className="mb-5 text-stone-500">
          Tu reserva para <strong>{service.name}</strong> ha sido creada.
        </p>
        <p className="text-stone-500">
          Enviamos un correo de confirmación a <strong>{clientEmail}</strong>
        </p>
      </div>
    </div>
  );
}
