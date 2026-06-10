import type { Service } from "../types";
import EmptyState from "./ui/EmptyState";

interface ServicesGridProps {
  services: Service[];
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
  onDeleteService: (id: number) => void;
  onNewService: () => void;
  publicBaseUrl: string;
}

export default function ServicesGrid({
  services,
  selectedService,
  onSelectService,
  onDeleteService,
  onNewService,
  publicBaseUrl,
}: ServicesGridProps) {
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="m-0 text-xl font-semibold text-stone-800">Mis Servicios</h2>
        <button
          onClick={onNewService}
          className="cursor-pointer rounded-lg bg-amber-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-amber-600"
        >
          + Nuevo Servicio
        </button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          variant="services"
          title="Crea tu primer servicio"
          description="Los servicios son los tipos de turno que ofreces. Duración, precio y horarios."
          action={{ label: "+ Nuevo Servicio", onClick: onNewService }}
        />
      ) : (
        <div className="mb-10 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {services.map((s, i) => (
            <div
              key={s.id}
              style={{ animationDelay: `${i * 80}ms` }}
              className={`animate-slide-down cursor-pointer rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${
                selectedService?.id === s.id
                  ? "border-3 border-amber-500"
                  : "border-transparent"
              }`}
              onClick={() => onSelectService(s)}
            >
              <h3 className="m-0 mb-2 text-base font-semibold text-stone-800">{s.name}</h3>
              <p className="mb-3 text-sm text-stone-500">{s.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-500">
                  ${s.price} &bull; {s.duration}min
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteService(s.id);
                  }}
                  className="cursor-pointer rounded-md bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-100"
                >
                  Eliminar
                </button>
              </div>
              {s.booking_slug && (
                <p className="mt-2.5 text-xs text-stone-400">
                  {publicBaseUrl}/book/{s.booking_slug}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
