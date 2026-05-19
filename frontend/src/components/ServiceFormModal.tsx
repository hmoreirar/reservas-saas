import { useState } from "react";
import Modal from "./ui/Modal";

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: string;
  timezone: string;
  start_hour: number;
  end_hour: number;
}

interface ServiceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => void;
}

const initialData: ServiceFormData = {
  name: "",
  description: "",
  duration: 30,
  price: "",
  timezone: "America/Santiago",
  start_hour: 9,
  end_hour: 18,
};

export default function ServiceFormModal({ open, onClose, onSubmit }: ServiceFormModalProps) {
  const [form, setForm] = useState<ServiceFormData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    setForm(initialData);
  };

  const update = <K extends keyof ServiceFormData>(
    key: K,
    value: ServiceFormData[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Modal open={open} onClose={onClose} title="Nuevo Servicio">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nombre del servicio *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="min-h-[80px] w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Duración (min)
            </label>
            <input
              type="number"
              value={form.duration}
              onChange={(e) => update("duration", parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Precio ($)
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Zona Horaria
            </label>
            <select
              value={form.timezone}
              onChange={(e) => update("timezone", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="America/Santiago">Santiago (CL)</option>
              <option value="America/Buenos_Aires">Buenos Aires (AR)</option>
              <option value="America/Mexico_City">CDMX (MX)</option>
              <option value="America/New_York">New York (US)</option>
              <option value="Europe/Madrid">Madrid (ES)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Hora inicio
            </label>
            <input
              type="number"
              value={form.start_hour}
              onChange={(e) => update("start_hour", parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Hora fin
            </label>
            <input
              type="number"
              value={form.end_hour}
              onChange={(e) => update("end_hour", parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-lg bg-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 cursor-pointer rounded-lg bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
          >
            Crear Servicio
          </button>
        </div>
      </form>
    </Modal>
  );
}
