import { Link } from "react-router";
import CopyLinkButton from "./CopyLinkButton";

interface GettingStartedProps {
  hasService: boolean;
  bookingUrl?: string;
}

// Guia de los primeros pasos: que hacer despues de registrarse.
// Un usuario nuevo no adivina el flujo: crear servicio, compartir link, recibir citas.
export default function GettingStarted({ hasService, bookingUrl }: GettingStartedProps) {
  const steps = [
    {
      done: hasService,
      title: "Crea tu primer servicio",
      description: "Ej: Consulta, Limpieza, Control. Con duracion y precio.",
      action: (
        <Link
          to="/servicios"
          className="text-sm font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
        >
          Crear servicio
        </Link>
      ),
    },
    {
      done: hasService && !!bookingUrl,
      title: "Comparte tu link de reservas",
      description: "Mandalo por WhatsApp a tus pacientes para que agenden solos.",
      action: bookingUrl ? (
        <div className="max-w-xs">
          <CopyLinkButton url={bookingUrl} />
        </div>
      ) : (
        <span className="text-sm text-text-muted">Primero crea un servicio</span>
      ),
    },
    {
      done: false,
      title: "Recibe tus primeras citas",
      description: "Te avisamos por email cuando alguien agende. Tu confirmas desde la agenda.",
      action: null,
    },
  ];

  return (
    <div className="mb-8 rounded-xl border border-border bg-surface p-6">
      <h2 className="mb-1 text-lg font-semibold text-text">Primeros pasos</h2>
      <p className="mb-5 text-sm text-text-secondary">
        Tres pasos y tus pacientes pueden agendar solos.
      </p>

      <ol className="space-y-4">
        {steps.map((step, i) => (
          <li key={step.title} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                step.done ? "bg-accent text-accent-text" : "border border-border text-text-muted"
              }`}
            >
              {step.done ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text">{step.title}</p>
              <p className="text-xs text-text-muted">{step.description}</p>
              {step.action && <div className="mt-2">{step.action}</div>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
