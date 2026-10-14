import { useState } from "react";
import WizardProgressBar from "./WizardProgressBar";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { normalizeClPhone } from "@reservas/shared";
import type { TimeSlot, Service } from "../types";

// El horario ya fue elegido: arranca en el paso 2 y lo marcamos como hecho.
const STEPS = [
  { label: "Elige tu hora" },
  { label: "Tus datos" },
  { label: "Confirmar" },
];

interface BookingWizardProps {
  service: Service;
  slot: TimeSlot;
  date: string;
  onBack: () => void;
  onConfirm: (data: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  }) => Promise<string | null>;
}

export default function BookingWizard({ service, slot, date, onBack, onConfirm }: BookingWizardProps) {
  const [step, setStep] = useState(1);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const formattedDate = new Date(date + "T12:00:00").toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const formattedTime = new Date(slot.start).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: service.timezone || undefined,
  });

  const handleNext = () => {
    if (!clientName.trim()) {
      setError("Ingresa tu nombre");
      return;
    }
    if (!normalizeClPhone(clientPhone)) {
      setError("Ingresa un WhatsApp valido, ej: +56 9 1234 5678");
      return;
    }
    if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      setError("El email no parece valido");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleConfirm = async () => {
    setError("");
    setIsBooking(true);
    try {
      const err = await onConfirm({
        name: clientName.trim(),
        phone: clientPhone.trim(),
        email: clientEmail.trim(),
        notes: notes.trim(),
      });
      if (err) {
        setError(err);
      }
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      <WizardProgressBar steps={STEPS} currentStep={step + 1} />

      {error && (
        <div className="mb-5 border-l-4 border-l-danger bg-danger-bg px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="mb-6 text-lg font-semibold text-text">Tus datos</h2>

          <div className="mb-4">
            <Input
              label="Tu nombre *"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Juan Perez"
              autoFocus
            />
          </div>

          <div className="mb-4">
            <Input
              label="Tu WhatsApp *"
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="+56 9 1234 5678"
            />
            <p className="mt-1 text-xs text-text-muted">
              Te contactaremos por aquí para confirmar tu hora.
            </p>
          </div>

          <div className="mb-4">
            <Input
              label="Email (opcional)"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="juan@example.com"
            />
          </div>

          <div className="mb-8">
            <Input.Textarea
              label="Notas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informacion adicional..."
            />
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onBack} className="flex-1">
              Volver
            </Button>
            <Button onClick={handleNext} className="flex-[2]">
              Continuar
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="mb-6 text-lg font-semibold text-text">Confirma tu hora</h2>

          <div className="mb-6 rounded-xl border border-border bg-surface p-5">
            <p className="mb-1 text-base font-semibold text-text">{service.name}</p>
            <p className="text-sm capitalize text-text-secondary">
              {formattedDate} a las {formattedTime}
            </p>
            <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm text-text-secondary">
              <p>Nombre: <span className="text-text">{clientName}</span></p>
              <p>WhatsApp: <span className="text-text">{clientPhone}</span></p>
              {clientEmail && <p>Email: <span className="text-text">{clientEmail}</span></p>}
            </div>
          </div>

          <p className="mb-6 text-xs text-text-muted">
            Al confirmar, el proveedor revisa tu solicitud y te avisa por WhatsApp.
          </p>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
              Volver
            </Button>
            <Button onClick={handleConfirm} disabled={isBooking} className="flex-[2]">
              {isBooking ? "Enviando..." : "Reservar ahora"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
