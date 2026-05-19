import type { Stats } from "../types";

interface StatsCardsProps {
  stats: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="mb-8">
      <h2 className="mb-5 text-xl font-semibold text-stone-800">Estadísticas</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {[
          { label: "Total Reservas", value: stats.total, color: "text-amber-500" },
          { label: "Confirmadas", value: stats.confirmed, color: "text-green-600" },
          { label: "Canceladas", value: stats.cancelled, color: "text-red-500" },
          { label: "Ingresos", value: `$${stats.revenue?.toLocaleString()}`, color: "text-teal-500" },
        ].map((card, i) => (
          <div
            key={card.label}
            style={{ animationDelay: `${i * 100}ms` }}
            className="animate-slide-down rounded-xl border border-stone-100 bg-white p-5 text-center shadow-sm"
          >
            <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
            <div className="mt-1 text-sm text-stone-500">{card.label}</div>
          </div>
        ))}
      </div>

      {stats.byService && stats.byService.length > 0 && (
        <div className="mt-5 rounded-xl border border-stone-100 bg-white p-5 shadow-sm">
          <h3 className="mt-0 mb-3 text-base font-semibold text-stone-800">Por Servicio</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-stone-200">
                <th className="px-3 py-2 text-left text-sm text-stone-500">Servicio</th>
                <th className="px-3 py-2 text-center text-sm text-stone-500">Reservas</th>
                <th className="px-3 py-2 text-right text-sm text-stone-500">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {stats.byService.map((s, i) => (
                <tr key={i} className="border-b border-stone-100">
                  <td className="px-3 py-2.5 text-sm">{s.name}</td>
                  <td className="px-3 py-2.5 text-center text-sm">{s.total}</td>
                  <td className="px-3 py-2.5 text-right text-sm">
                    ${s.revenue?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stats.upcoming && stats.upcoming.length > 0 && (
        <div className="mt-5 rounded-xl border border-stone-100 bg-white p-5 shadow-sm">
          <h3 className="mt-0 mb-3 text-base font-semibold text-stone-800">Próximas Citas</h3>
          {stats.upcoming.map((b, i) => (
            <div
              key={i}
              className={`py-2.5 text-sm ${
                i < stats.upcoming.length - 1 ? "border-b border-stone-100" : ""
              }`}
            >
              <strong>{b.client_name}</strong> - {b.service_name}
              <br />
              <span className="text-stone-500">
                {new Date(b.start_time).toLocaleString("es-CL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
