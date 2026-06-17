import type { Service } from "../types";

interface BookingSuccessProps {
  service: Service;
  clientEmail: string;
  isPending?: boolean;
}

export default function BookingSuccess({ service, clientEmail, isPending }: BookingSuccessProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg font-sans">
      <div className="max-w-md rounded-2xl border border-border bg-surface p-12 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-accent-bg text-4xl text-accent">
          {isPending ? "\u23F3" : "\u2713"}
        </div>
        <h1 className="mb-2 text-2xl font-bold text-text">
          {isPending ? "Reserva Solicitada" : "Reserva Confirmada"}
        </h1>
        <p className="mb-5 text-text-secondary">
          {isPending
            ? `Tu solicitud para ${service.name} ha sido enviada. El proveedor confirmara tu reserva pronto.`
            : `Tu reserva para ${service.name} ha sido creada.`}
        </p>
        <p className="text-text-secondary">
          Enviamos un correo a <strong>{clientEmail}</strong>
          {isPending ? " con los detalles de tu solicitud." : " de confirmacion."}
        </p>
      </div>
    </div>
  );
}
