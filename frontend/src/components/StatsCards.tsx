import { useMemo } from "react";
import type { Stats } from "../types";
import StatusBadge from "./ui/StatusBadge";

interface StatsCardsProps {
  stats: Stats;
  period: string;
  onPeriodChange: (period: string) => void;
}

const PERIODS = [
  { key: "all", label: "Todo" },
  { key: "month", label: "Este mes" },
];

const CARD_META: Record<string, { label: string; border: string }> = {
  total: { label: "Total", border: "border-t-border" },
  pending: { label: "Pendientes", border: "border-t-warning" },
  confirmed: { label: "Confirmadas", border: "border-t-accent" },
  completed: { label: "Completadas", border: "border-t-info" },
  cancelled: { label: "Canceladas", border: "border-t-danger" },
  revenue: { label: "Ingresos", border: "border-t-accent" },
};

export default function StatsCards({ stats, period, onPeriodChange }: StatsCardsProps) {
  const maxLast7 = useMemo(
    () => Math.max(...stats.last7Days.map((d) => d.total), 1),
    [stats.last7Days]
  );

  const cards = [
    { key: "total", value: stats.total },
    { key: "pending", value: stats.pending },
    { key: "confirmed", value: stats.confirmed },
    { key: "completed", value: stats.completed },
    { key: "cancelled", value: stats.cancelled },
    { key: "revenue", value: `$${stats.revenue?.toLocaleString()}` },
  ];

  return (
    <div className="mb-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text">Estadisticas</h2>
        <div className="flex gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => onPeriodChange(p.key)}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p.key
                  ? "bg-accent text-accent-text"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => {
          const meta = CARD_META[card.key];
          return (
            <div
              key={card.key}
              className={`rounded-xl border border-border border-t-2 bg-surface p-5 ${meta.border}`}
            >
              <div className="text-2xl font-semibold text-text">{card.value}</div>
              <div className="mt-0.5 text-sm text-text-secondary">{meta.label}</div>
            </div>
          );
        })}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-4 text-sm font-semibold text-text">Reservas ultimos 7 dias</h3>
          {stats.last7Days.length === 0 ? (
            <p className="py-4 text-center text-sm text-text-muted">
              Sin reservas en los ultimos 7 dias
            </p>
          ) : (
            <div className="flex items-end gap-2" style={{ height: 120 }}>
              {stats.last7Days.map((day) => {
                const height = (day.total / maxLast7) * 100;
                const label = new Date(day.date + "T12:00:00").toLocaleDateString("es-ES", {
                  weekday: "short",
                });
                return (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-xs text-text-secondary">{day.total}</span>
                    <div
                      className="w-full rounded-sm bg-accent transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-xs capitalize text-text-muted">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-4 text-sm font-semibold text-text">Por Servicio</h3>
          {stats.byService.length === 0 ? (
            <p className="py-4 text-center text-sm text-text-muted">
              Sin reservas confirmadas
            </p>
          ) : (
            <div className="space-y-3">
              {stats.byService.map((s) => {
                const pct = stats.byService.length > 0
                  ? Math.round((s.total / Math.max(...stats.byService.map((x) => x.total))) * 100)
                  : 0;
                return (
                  <div key={s.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-text">{s.name}</span>
                      <span className="font-medium text-text">
                        {s.total} — ${s.revenue?.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {stats.upcoming.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-4 text-sm font-semibold text-text">Proximas Citas</h3>
          <div className="space-y-4">
            {stats.upcoming.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-text">
                    <strong>{b.client_name}</strong> &middot; {b.service_name}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {new Date(b.start_time).toLocaleString("es-CL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
