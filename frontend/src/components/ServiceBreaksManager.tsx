import { useCallback, useEffect, useState } from "react";
import Input from "./ui/Input";
import LoadingSpinner from "./ui/LoadingSpinner";
import Modal from "./ui/Modal";
import { getServiceBreaks, createServiceBreak, deleteServiceBreak } from "../api/api";
import type { ServiceBreak } from "../types";

interface ServiceBreaksManagerProps {
  serviceId: number;
}

export default function ServiceBreaksManager({ serviceId }: ServiceBreaksManagerProps) {
  const [breaks, setBreaks] = useState<ServiceBreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", date: "", start_time: "", end_time: "", is_recurring: false });

  const load = useCallback(async () => {
    const data = await getServiceBreaks(serviceId);
    if (Array.isArray(data)) setBreaks(data);
    setLoading(false);
  }, [serviceId]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.start_time || !form.end_time) return;
    await createServiceBreak(serviceId, form);
    setShowModal(false);
    setForm({ name: "", date: "", start_time: "", end_time: "", is_recurring: false });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminar este bloque?")) return;
    await deleteServiceBreak(serviceId, id);
    load();
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d + "T12:00:00").toLocaleDateString("es-CL", {
        dateStyle: "medium",
      });
    } catch {
      return d;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text">
          Bloques no disponibles
        </h4>
        <button
          onClick={() => setShowModal(true)}
          className="cursor-pointer rounded bg-accent px-3 py-1.5 text-xs font-medium text-accent-text transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          + Agregar
        </button>
      </div>

      {breaks.length === 0 && (
        <p className="text-xs text-text-muted">
          Sin bloqueos configurados.
        </p>
      )}

      <div className="space-y-1.5">
        {breaks.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
          >
            <div className="flex items-center gap-3 text-sm">
              <span className="h-2 w-2 rounded-full bg-danger" />
              <div>
                <span className="font-medium text-text">
                  {b.name || "Bloqueo"}
                </span>
                <span className="ml-2 text-xs text-text-muted">
                  {formatDate(b.date)} {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                  {b.is_recurring ? " (semanal)" : ""}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleDelete(b.id)}
              className="cursor-pointer text-xs text-danger hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2"
              title="Eliminar"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nuevo Bloqueo">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Motivo"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej: Feriado, Vacaciones..."
          />
          <Input
            label="Fecha"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Desde"
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              required
            />
            <Input
              label="Hasta"
              type="time"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              required
            />
          </div>
          <Input.Checkbox
            checked={form.is_recurring}
            onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })}
            label="Repetir semanalmente"
          />
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-text transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Agregar
          </button>
        </form>
      </Modal>
    </div>
  );
}
