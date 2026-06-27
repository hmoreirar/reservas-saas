import { useEffect, useState } from "react";
import Input from "./ui/Input";
import LoadingSpinner from "./ui/LoadingSpinner";
import { getServiceHours, updateServiceHours } from "../api/api";
import type { ServiceHour } from "../types";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

interface ServiceHoursEditorProps {
  serviceId: number;
}

function defaultHours(): { day_of_week: number; start_hour: number; end_hour: number; is_active: boolean }[] {
  return DAY_NAMES.map((_, i) => ({
    day_of_week: i,
    start_hour: 9,
    end_hour: 18,
    is_active: i !== 0,
  }));
}

export default function ServiceHoursEditor({ serviceId }: ServiceHoursEditorProps) {
  const [hours, setHours] = useState<{ day_of_week: number; start_hour: number; end_hour: number; is_active: boolean }[]>(defaultHours());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await getServiceHours(serviceId);
      if (data && data.length > 0) {
        setHours(
          data.map((h: ServiceHour) => ({
            day_of_week: h.day_of_week,
            start_hour: h.start_hour,
            end_hour: h.end_hour,
            is_active: h.is_active,
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, [serviceId]);

  const update = (day: number, key: string, value: number | boolean) => {
    setHours((prev) =>
      prev.map((h) => (h.day_of_week === day ? { ...h, [key]: value } : h))
    );
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    const data = await updateServiceHours(serviceId, hours);
    if (data) {
      setMessage("Horarios guardados");
      setTimeout(() => setMessage(""), 2000);
    } else {
      setMessage("Error al guardar");
    }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-text">
        Horarios por dia
      </h4>
      <div className="space-y-2">
        {hours.map((h) => (
          <div key={h.day_of_week} className="flex items-center gap-3">
            <Input.Checkbox
              checked={h.is_active}
              onChange={(e) => update(h.day_of_week, "is_active", e.target.checked)}
              label={<span className={h.is_active ? "text-text" : "text-text-muted"}>{DAY_NAMES[h.day_of_week]}</span>}
            />
            {h.is_active && (
              <>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={h.start_hour}
                  onChange={(e) => update(h.day_of_week, "start_hour", parseInt(e.target.value) || 9)}
                  className="w-16 rounded border border-border px-2 py-1 text-center text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                />
                <span className="text-xs text-text-muted">a</span>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={h.end_hour}
                  onChange={(e) => update(h.day_of_week, "end_hour", parseInt(e.target.value) || 18)}
                  className="w-16 rounded border border-border px-2 py-1 text-center text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                />
              </>
            )}
            {!h.is_active && (
              <span className="text-xs text-text-muted">Cerrado</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="cursor-pointer rounded bg-accent px-3 py-1.5 text-xs font-medium text-accent-text transition-colors hover:bg-accent-hover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {saving ? "Guardando..." : "Guardar Horarios"}
        </button>
        {message && (
          <span className={`text-xs ${message.includes("Error") ? "text-danger" : "text-accent"}`}>
            {message}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-text-muted">
        Si no configuras horarios, se usara el horario general del servicio.
      </p>
    </div>
  );
}
