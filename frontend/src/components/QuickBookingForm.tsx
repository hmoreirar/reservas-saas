import { useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";

export interface SlotOption {
  value: string;
  label: string;
}

interface QuickBookingFormProps {
  serviceName: string;
  timeLabel: string;
  /** huecos libres del dia: si se pasan, se muestra selector de hora (boton FAB) */
  slots?: SlotOption[];
  initialSlotValue?: string;
  onSubmit: (data: {
    name: string;
    phone: string;
    email: string;
    notes: string;
    slot: string;
  }) => Promise<string | null>;
}

// Formulario de agendamiento rapido: lo minimo que un recepcionista
// necesita cuando el cliente esta al telefono.
export default function QuickBookingForm({
  serviceName,
  timeLabel,
  slots,
  initialSlotValue,
  onSubmit,
}: QuickBookingFormProps) {
  const [slotValue, setSlotValue] = useState(initialSlotValue ?? slots?.[0]?.value ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Ingresa el nombre del cliente");
      return;
    }
    if (!phone.trim()) {
      setError("Ingresa el WhatsApp del cliente");
      return;
    }
    if (slots && !slotValue) {
      setError("Elige un horario");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const err = await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim(),
        slot: slotValue,
      });
      if (err) setError(err);
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-4 rounded-lg bg-accent-bg px-3 py-2 text-sm text-text-secondary">
        <span className="font-medium text-text">{serviceName}</span>
        {!slots && <> · {timeLabel}</>}
      </p>

      {error && (
        <div className="mb-4 border-l-4 border-l-danger bg-danger-bg px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {slots && (
        <div className="mb-4">
          <Input.Select
            label="Horario *"
            value={slotValue}
            onChange={(e) => setSlotValue(e.target.value)}
            options={slots}
            placeholder="Elige un horario"
          />
        </div>
      )}

      <div className="mb-4">
        <Input
          label="Nombre del cliente *"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="mb-4">
        <Input
          label="WhatsApp *"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+56 9 1234 5678"
          required
        />
        <p className="mt-1 text-xs text-text-muted">Avisaremos por aquí para confirmar la hora.</p>
      </div>

      <div className="mb-4">
        <Input
          label="Email (opcional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="cliente@ejemplo.com"
        />
        <p className="mt-1 text-xs text-text-muted">Solo para enviar la confirmación por correo.</p>
      </div>

      <div className="mb-6">
        <Input.Textarea
          label="Notas (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: primera visita"
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Agendando..." : "Agendar hora"}
      </Button>
    </form>
  );
}
