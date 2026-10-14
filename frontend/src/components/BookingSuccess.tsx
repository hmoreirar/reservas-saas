import type { Service } from "../types";

interface BookingSuccessProps {
  service: Service;
  when: string;
  clientPhone: string;
  clientEmail?: string;
  isPending?: boolean;
}

// Pantalla final sin ambiguedad: que se reservo, para cuando, y que pasa ahora.
export default function BookingSuccess({
  service,
  when,
  clientPhone,
  clientEmail,
  isPending,
}: BookingSuccessProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center md:p-12">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-accent-bg text-4xl text-accent">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-text">
          {isPending ? "Tu hora fue solicitada" : "Tu hora está reservada"}
        </h1>

        <div className="mb-6 rounded-xl bg-accent-bg px-4 py-4">
          <p className="text-base font-semibold text-text capitalize">{service.name}</p>
          <p className="mt-1 text-lg font-semibold text-text capitalize">{when}</p>
        </div>

        <div className="mb-6 space-y-2 text-left text-sm text-text-secondary">
          <p className="flex items-start gap-2">
            <span className="mt-0.5 text-accent">1.</span>
            {isPending
              ? "El proveedor revisa tu solicitud."
              : "Tu hora quedó registrada en la agenda."}
          </p>
          <p className="flex items-start gap-2">
            <span className="mt-0.5 text-accent">2.</span>
            Te avisamos por WhatsApp al <strong className="text-text">{clientPhone}</strong> para confirmar.
          </p>
          {clientEmail && (
            <p className="flex items-start gap-2">
              <span className="mt-0.5 text-accent">3.</span>
              También enviamos los detalles a <strong className="text-text">{clientEmail}</strong>.
            </p>
          )}
        </div>

        <p className="text-xs text-text-muted">
          Si necesitas cambiar la hora, avísanos por WhatsApp con anticipación.
        </p>
      </div>
    </div>
  );
}
