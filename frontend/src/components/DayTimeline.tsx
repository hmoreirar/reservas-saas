import type { TimelineSlot, DayAgenda, Booking } from "../types";
import StatusBadge from "./ui/StatusBadge";
import EmptyState from "./ui/EmptyState";

interface DayTimelineProps {
  agendas: DayAgenda[];
  onSlotClick: (slot: TimelineSlot, serviceId: number, serviceName: string) => void;
}

// Vista tipo calendario: bloques de cita reales y huecos tappable.
// Mobile-first: cada fila es un tap target de altura minima comoda.
export default function DayTimeline({ agendas, onSlotClick }: DayTimelineProps) {
  if (!agendas.length) {
    return (
      <EmptyState
        variant="slots"
        title="Sin horarios disponibles"
        description="No hay horarios disponibles para esta fecha."
      />
    );
  }

  return (
    <div className="space-y-6">
      {agendas.map((agenda) => (
        <div key={agenda.service_id}>
          <h3 className="mb-2 px-1 text-sm font-semibold text-text">{agenda.service_name}</h3>
          {agenda.slots.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface py-8 text-center text-sm text-text-muted">
              Sin horarios configurados para este dia.
            </div>
          ) : (
            <div className="space-y-1.5">
              {agenda.slots.map((slot) => (
                <TimelineRow
                  key={slot.start}
                  slot={slot}
                  onClick={() => onSlotClick(slot, agenda.service_id, agenda.service_name)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const BOOKED_BORDER: Record<Booking["status"], string> = {
  confirmed: "border-l-accent",
  pending: "border-l-warning",
  completed: "border-l-text-muted",
  "no-show": "border-l-danger",
  cancelled: "border-l-border",
};

interface TimelineRowProps {
  slot: TimelineSlot;
  onClick: () => void;
}

function TimelineRow({ slot, onClick }: TimelineRowProps) {
  const timeLabel = new Date(slot.start).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const endLabel = new Date(slot.end).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <button
      onClick={onClick}
      disabled={slot.type === "past" || slot.type === "blocked"}
      className="flex w-full items-stretch gap-2.5 text-left disabled:cursor-default"
    >
      <span className="w-12 pt-2.5 text-right text-xs tabular-nums text-text-muted">{timeLabel}</span>

      {slot.type === "booked" && slot.booking ? (
        <div
          className={`flex-1 rounded-lg border border-border border-l-4 bg-surface px-3 py-2 shadow-sm transition-colors hover:border-border-hover ${BOOKED_BORDER[slot.booking.status]}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-sm font-medium text-text">
              {slot.booking.client_name}
            </span>
            <StatusBadge status={slot.booking.status} />
          </div>
          <div className="mt-0.5 text-xs text-text-muted">
            {timeLabel}–{endLabel}
            {slot.booking.client_phone && <> · {slot.booking.client_phone}</>}
            {slot.capacity_max > 1 && <> · {slot.capacity_used}/{slot.capacity_max}</>}
          </div>
        </div>
      ) : slot.type === "blocked" ? (
        <div className="flex-1 rounded-lg border border-dashed border-warning/40 bg-warning/5 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-warning">
            {slot.break?.name || "No disponible"}
          </div>
          <div className="mt-0.5 text-xs text-text-muted line-through">{timeLabel}–{endLabel}</div>
        </div>
      ) : slot.type === "past" ? (
        <div className="flex-1 rounded-lg border border-border/60 bg-bg px-3 py-2.5 opacity-50">
          <div className="text-xs text-text-muted">Pasado</div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-between rounded-lg border border-dashed border-border px-3 py-2.5 transition-colors hover:border-accent hover:bg-accent-bg/40 group-hover:border-accent">
          <span className="text-xs text-text-muted">{timeLabel}–{endLabel}</span>
          <span className="flex items-center gap-1 text-xs font-medium text-text-muted">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Agendar
          </span>
        </div>
      )}
    </button>
  );
}
