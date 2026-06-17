import { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import ServiceHoursEditor from "./ServiceHoursEditor";
import ServiceBreaksManager from "./ServiceBreaksManager";

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: string;
  timezone: string;
  start_hour: number;
  end_hour: number;
  max_capacity: number;
}

interface ServiceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => void;
  editingService?: { id: number } | null;
}

const initialData: ServiceFormData = {
  name: "",
  description: "",
  duration: 30,
  price: "",
  timezone: "America/Santiago",
  start_hour: 9,
  end_hour: 18,
  max_capacity: 1,
};

type Tab = "basico" | "horarios" | "bloqueos";

export default function ServiceFormModal({ open, onClose, onSubmit, editingService }: ServiceFormModalProps) {
  const [form, setForm] = useState<ServiceFormData>(initialData);
  const [tab, setTab] = useState<Tab>("basico");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justCreated, setJustCreated] = useState(false);

  useEffect(() => {
    if (editingService && justCreated) {
      setTab("horarios");
    }
  }, [editingService, justCreated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(form);
      setJustCreated(true);
      setForm(initialData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setJustCreated(false);
    setTab("basico");
  };

  const update = <K extends keyof ServiceFormData>(key: K, value: ServiceFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const tabs: { id: Tab; label: string }[] = [
    { id: "basico", label: "Basico" },
    { id: "horarios", label: "Horarios" },
    { id: "bloqueos", label: "Bloqueos" },
  ];

  const inputClass =
    "w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text transition-colors placeholder:text-text-muted focus:border-accent focus:outline-none";

  return (
    <Modal open={open} onClose={handleClose} title={editingService ? "Editar Servicio" : "Nuevo Servicio"}>
      <div className="mb-4 flex gap-1 rounded-lg bg-surface p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t.id ? "bg-white text-text" : "text-text-secondary hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "basico" && (
        <form id="service-form" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-text">Nombre del servicio *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-text">Descripcion</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className={`min-h-[80px] ${inputClass}`}
            />
          </div>

          <div className="mb-4 grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-text">Duracion (min) *</label>
              <input
                type="number"
                required
                min={1}
                value={form.duration}
                onChange={(e) => update("duration", parseInt(e.target.value) || 30)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text">Precio ($)</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text">Capacidad *</label>
              <input
                type="number"
                required
                min={1}
                value={form.max_capacity}
                onChange={(e) => update("max_capacity", parseInt(e.target.value) || 1)}
                className={inputClass}
                title="Personas por horario (1 = individual)"
              />
            </div>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-text">Zona Horaria</label>
              <select
                value={form.timezone}
                onChange={(e) => update("timezone", e.target.value)}
                className={inputClass}
              >
                <option value="America/Santiago">Santiago (CL)</option>
                <option value="America/Buenos_Aires">Buenos Aires (AR)</option>
                <option value="America/Mexico_City">CDMX (MX)</option>
                <option value="America/New_York">New York (US)</option>
                <option value="Europe/Madrid">Madrid (ES)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text">Hora inicio *</label>
              <input
                type="number"
                required
                min={0}
                max={23}
                value={form.start_hour}
                onChange={(e) => update("start_hour", parseInt(e.target.value) || 9)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text">Hora fin *</label>
              <input
                type="number"
                required
                min={0}
                max={23}
                value={form.end_hour}
                onChange={(e) => update("end_hour", parseInt(e.target.value) || 18)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" type="button" onClick={handleClose} className="flex-1">
              {editingService ? "Cerrar" : "Cancelar"}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creando..." : "Crear Servicio"}
            </Button>
          </div>
        </form>
      )}

      {tab === "horarios" && (
        <div>
          {editingService ? (
            <>
              {justCreated && (
                <div className="mb-3 rounded-lg bg-accent-bg px-4 py-2 text-xs text-accent">
                  Servicio creado. Ahora puedes configurar horarios por dia.
                </div>
              )}
              <ServiceHoursEditor serviceId={editingService.id} />
            </>
          ) : (
            <div className="py-6 text-center text-sm text-text-muted">
              Crea el servicio primero para configurar horarios por dia.
            </div>
          )}
        </div>
      )}

      {tab === "bloqueos" && (
        <div>
          {editingService ? (
            <ServiceBreaksManager serviceId={editingService.id} />
          ) : (
            <div className="py-6 text-center text-sm text-text-muted">
              Crea el servicio primero para gestionar bloqueos.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
