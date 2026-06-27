import type { TimelineSlot, DayAgenda } from "../types";
import StatusBadge from "./ui/StatusBadge";
import EmptyState from "./ui/EmptyState";

interface DayTimelineProps {
  agendas: DayAgenda[];
  onSlotClick: (slot: TimelineSlot, serviceId: number, serviceName: string) => void;
}

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
          <h3 className="mb-3 text-base font-semibold text-text">{agenda.service_name}</h3>
          <div className="rounded-xl border border-border bg-surface">
            {agenda.slots.length === 0 ? (
              <div className="py-8 text-center text-sm text-text-muted">
                Sin horarios configurados para este dia.
              </div>
            ) : (
              <div className="divide-y divide-border">
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
        </div>
      ))}
    </div>
  );
}

interface TimelineRowProps {
  slot: TimelineSlot;
  onClick: () => void;
}

function TimelineRow({ slot, onClick }: TimelineRowProps) {
  const timeLabel = new Date(slot.start).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = new Date(slot.end).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (slot.type === "past") {
    return (
      <div className="flex items-center gap-4 px-4 py-3 opacity-40 md:px-6">
        <span className="w-16 text-sm text-text-muted">{timeLabel}</span>
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-muted">Pasado</span>
      </div>
    );
  }

  if (slot.type === "blocked") {
    return (
      <div className="flex items-center gap-4 bg-warning/5 px-4 py-3 md:px-6">
        <span className="w-16 text-sm text-text-muted line-through">{timeLabel}</span>
        <div className="h-px flex-1 bg-warning/30" />
        <span className="flex items-center gap-1.5 text-xs font-medium text-warning">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {slot.break?.name || "Bloqueado"}
        </span>
      </div>
    );
  }

  if (slot.type === "booked" && slot.booking) {
    const { booking } = slot;
    return (
      <button
        onClick={onClick}
        className="flex w-full cursor-pointer items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-accent-bg/50 md:px-6"
      >
        <span className="w-16 text-sm font-medium text-text">{timeLabel}</span>
        <div className="flex flex-1 items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium text-text">{booking.client_name}</span>
            <span className="ml-2 text-xs text-text-muted">{booking.client_email}</span>
            {slot.capacity_max > 1 && (
              <span className="ml-2 text-xs text-text-muted">
                ({slot.capacity_used}/{slot.capacity_max})
              </span>
            )}
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-accent-bg/50 md:px-6"
    >
      <span className="w-16 text-sm font-medium text-accent">{timeLabel}</span>
      <div className="h-px flex-1 bg-border" />
      <span className="flex items-center gap-1.5 text-xs font-medium text-accent">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Disponible
        {slot.capacity_used > 0 && (
          <span>({slot.capacity_used}/{slot.capacity_max})</span>
        )}
      </span>
    </button>
  );
}
