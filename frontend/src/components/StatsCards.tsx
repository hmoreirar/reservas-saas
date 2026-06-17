import type { Stats } from "../types";
import StatusBadge from "./ui/StatusBadge";

interface StatsCardsProps {
  stats: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    { label: "Total Reservas", value: stats.total },
    { label: "Pendientes", value: stats.pending },
    { label: "Confirmadas", value: stats.confirmed },
    { label: "Completadas", value: stats.completed },
    { label: "Canceladas", value: stats.cancelled },
    { label: "Ingresos", value: `$${stats.revenue?.toLocaleString()}` },
  ];

  return (
    <div className="mb-10">
      <h2 className="mb-6 text-xl font-semibold text-text">Estadisticas</h2>
      <div className="grid grid-cols-2 gap-0 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className={`px-5 py-4 ${i < 2 ? "border-b border-border" : ""} ${
              i % 2 === 0 ? "" : "border-l border-border"
            } md:border-b-0 md:border-l md:border-border md:${
              i % 3 === 0 ? "border-l-0" : ""
            } lg:${
              i % 6 === 0 ? "border-l-0" : "border-l border-border"
            }`}
          >
            <div className="text-2xl font-semibold text-text">{card.value}</div>
            <div className="mt-0.5 text-sm text-text-secondary">{card.label}</div>
          </div>
        ))}
      </div>

      {stats.byService && stats.byService.length > 0 && (
        <div className="mt-8 border-t border-border pt-6">
          <h3 className="mb-4 text-base font-semibold text-text">Por Servicio</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-sm font-medium text-text-secondary">Servicio</th>
                <th className="px-3 py-2 text-center text-sm font-medium text-text-secondary">Reservas</th>
                <th className="px-3 py-2 text-right text-sm font-medium text-text-secondary">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {stats.byService.map((s, i) => (
                <tr key={i} className="border-b border-border hover:bg-bg">
                  <td className="px-3 py-2.5 text-sm text-text">{s.name}</td>
                  <td className="px-3 py-2.5 text-center text-sm text-text-secondary">{s.total}</td>
                  <td className="px-3 py-2.5 text-right text-sm text-text-secondary">
                    ${s.revenue?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stats.upcoming && stats.upcoming.length > 0 && (
        <div className="mt-8 border-t border-border pt-6">
          <h3 className="mb-4 text-base font-semibold text-text">Proximas Citas</h3>
          <div className="space-y-4">
            {stats.upcoming.map((b, i) => (
              <div
                key={i}
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
