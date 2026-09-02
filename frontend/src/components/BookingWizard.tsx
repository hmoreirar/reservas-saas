import { useState } from "react";
import WizardProgressBar from "./WizardProgressBar";
import Input from "./ui/Input";
import Button from "./ui/Button";
import type { TimeSlot, Service } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEPS = [
  { label: "Horario" },
  { label: "Tus datos" },
  { label: "Confirmar" },
];

interface BookingWizardProps {
  service: Service;
  slot: TimeSlot;
  date: string;
  onBack: () => void;
  onConfirm: (name: string, email: string, notes: string) => Promise<string | null>;
}

export default function BookingWizard({ service, slot, date, onBack, onConfirm }: BookingWizardProps) {
  const [step, setStep] = useState(1);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const formattedDate = new Date(date + "T12:00:00").toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = new Date(slot.start).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: service.timezone || undefined,
  });

  const handleNext = () => {
    if (!clientName.trim()) {
      setError("Por favor ingresa tu nombre");
      return;
    }
    if (!EMAIL_RE.test(clientEmail)) {
      setError("Ingresa un email valido");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleConfirm = async () => {
    setError("");
    setIsBooking(true);
    const err = await onConfirm(clientName, clientEmail, notes);
    setIsBooking(false);
    if (err) {
      setError(err);
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
          <div className="mb-6 rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-lg font-semibold text-text">Resumen de la reserva</h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>
                <span className="font-medium text-text">Servicio:</span> {service.name}
              </p>
              <p>
                <span className="font-medium text-text">Fecha:</span> {formattedDate}
              </p>
              <p>
                <span className="font-medium text-text">Hora:</span> {formattedTime}
              </p>
              <p>
                <span className="font-medium text-text">Duracion:</span> {service.duration} min
              </p>
              {service.price != null && (
                <p>
                  <span className="font-medium text-text">Precio:</span> ${service.price}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <Input
              label="Nombre completo *"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Juan Perez"
            />
          </div>

          <div className="mb-4">
            <Input
              label="Email *"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="juan@example.com"
            />
          </div>

          <div className="mb-6">
            <Input.Textarea
              label="Notas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informacion adicional..."
            />
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onBack} className="flex-1">
              Atras
            </Button>
            <Button onClick={handleNext} className="flex-1">
              Continuar
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="mb-6 rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-lg font-semibold text-text">Confirma tu reserva</h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>
                <span className="font-medium text-text">Servicio:</span> {service.name}
              </p>
              <p>
                <span className="font-medium text-text">Fecha:</span> {formattedDate}
              </p>
              <p>
                <span className="font-medium text-text">Hora:</span> {formattedTime}
              </p>
              <p>
                <span className="font-medium text-text">Duracion:</span> {service.duration} min
              </p>
              {service.price != null && (
                <p>
                  <span className="font-medium text-text">Precio:</span> ${service.price}
                </p>
              )}
            </div>
            <hr className="my-4 border-border" />
            <div className="space-y-2 text-sm text-text-secondary">
              <p>
                <span className="font-medium text-text">Nombre:</span> {clientName}
              </p>
              <p>
                <span className="font-medium text-text">Email:</span> {clientEmail}
              </p>
              {notes && (
                <p>
                  <span className="font-medium text-text">Notas:</span> {notes}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
              Atras
            </Button>
            <Button onClick={handleConfirm} disabled={isBooking} className="flex-1">
              {isBooking ? "Confirmando..." : "Confirmar reserva"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
