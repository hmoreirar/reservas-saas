import { useState } from "react";
import Modal from "./ui/Modal";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    setForm(initialData);
    setTab("basico");
  };

  const update = <K extends keyof ServiceFormData>(key: K, value: ServiceFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const tabs: { id: Tab; label: string }[] = [
    { id: "basico", label: "Basico" },
    { id: "horarios", label: "Horarios" },
    { id: "bloqueos", label: "Bloqueos" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Nuevo Servicio">
      <div className="mb-4 flex gap-1 rounded-lg bg-stone-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t.id ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "basico" && (
        <form id="service-form" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-stone-700">Nombre del servicio *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-stone-700">Descripcion</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="min-h-[80px] w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <div className="mb-4 grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Duracion (min)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => update("duration", parseInt(e.target.value) || 30)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Precio ($)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Capacidad</label>
              <input
                type="number"
                min={1}
                value={form.max_capacity}
                onChange={(e) => update("max_capacity", parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                title="Personas por horario (1 = individual)"
              />
            </div>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Zona Horaria</label>
              <select
                value={form.timezone}
                onChange={(e) => update("timezone", e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="America/Santiago">Santiago (CL)</option>
                <option value="America/Buenos_Aires">Buenos Aires (AR)</option>
                <option value="America/Mexico_City">CDMX (MX)</option>
                <option value="America/New_York">New York (US)</option>
                <option value="Europe/Madrid">Madrid (ES)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Hora inicio</label>
              <input
                type="number"
                value={form.start_hour}
                onChange={(e) => update("start_hour", parseInt(e.target.value) || 9)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Hora fin</label>
              <input
                type="number"
                value={form.end_hour}
                onChange={(e) => update("end_hour", parseInt(e.target.value) || 18)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-lg bg-stone-200 px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 cursor-pointer rounded-lg bg-amber-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-amber-600"
            >
              Crear Servicio
            </button>
          </div>
        </form>
      )}

      {tab === "horarios" && (
        <div>
          {editingService ? (
            <ServiceHoursEditor serviceId={editingService.id} />
          ) : (
            <div className="py-6 text-center text-sm text-stone-400">
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
            <div className="py-6 text-center text-sm text-stone-400">
              Crea el servicio primero para gestionar bloqueos.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
