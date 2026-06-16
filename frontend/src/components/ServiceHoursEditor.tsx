import { useEffect, useState } from "react";
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
      <h4 className="mb-3 text-sm font-semibold text-stone-700">
        Horarios por dia
      </h4>
      <div className="space-y-2">
        {hours.map((h) => (
          <div key={h.day_of_week} className="flex items-center gap-3">
            <label className="flex w-10 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={h.is_active}
                onChange={(e) => update(h.day_of_week, "is_active", e.target.checked)}
                className="h-4 w-4 accent-amber-500"
              />
              <span className={h.is_active ? "" : "text-stone-400"}>
                {DAY_NAMES[h.day_of_week]}
              </span>
            </label>
            {h.is_active && (
              <>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={h.start_hour}
                  onChange={(e) => update(h.day_of_week, "start_hour", parseInt(e.target.value) || 9)}
                  className="w-16 rounded border border-stone-300 px-2 py-1 text-center text-sm"
                />
                <span className="text-xs text-stone-500">a</span>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={h.end_hour}
                  onChange={(e) => update(h.day_of_week, "end_hour", parseInt(e.target.value) || 18)}
                  className="w-16 rounded border border-stone-300 px-2 py-1 text-center text-sm"
                />
              </>
            )}
            {!h.is_active && (
              <span className="text-xs text-stone-400">Cerrado</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="cursor-pointer rounded bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar Horarios"}
        </button>
        {message && (
          <span className={`text-xs ${message.includes("Error") ? "text-red-500" : "text-emerald-600"}`}>
            {message}
          </span>
        )}
      </div>
      <p className="mt-2 text-[11px] text-stone-400">
        Si no configuras horarios, se usara el horario general del servicio.
      </p>
    </div>
  );
}
