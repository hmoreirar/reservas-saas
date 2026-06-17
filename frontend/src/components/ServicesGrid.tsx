import type { Service } from "../types";
import EmptyState from "./ui/EmptyState";
import { showToast } from "./ui/Toast";

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
  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${publicBaseUrl}/book/${slug}`);
    showToast("Link copiado al portapapeles", "success");
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="m-0 text-xl font-semibold text-text">Mis Servicios</h2>
        <button
          onClick={onNewService}
          className="cursor-pointer rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          + Nuevo Servicio
        </button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          variant="services"
          title="Crea tu primer servicio"
          description="Los servicios son los tipos de turno que ofreces. Duracion, precio y horarios."
          action={{ label: "+ Nuevo Servicio", onClick: onNewService }}
        />
      ) : (
        <div className="mb-10 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {services.map((s) => (
            <div
              key={s.id}
              className={`cursor-pointer rounded-xl border bg-surface p-5 transition-all hover:border-border-hover ${
                selectedService?.id === s.id
                  ? "border-accent"
                  : "border-border"
              }`}
              onClick={() => onSelectService(s)}
            >
              <h3 className="m-0 mb-2 text-base font-semibold text-text">{s.name}</h3>
              <p className="mb-3 text-sm text-text-secondary">{s.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-accent">
                  ${s.price} &middot; {s.duration}min
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteService(s.id); }}
                  className="cursor-pointer text-xs text-text-muted hover:text-danger"
                >
                  Eliminar
                </button>
              </div>
              {s.max_capacity != null && s.max_capacity > 1 && (
                <p className="mt-2 text-xs text-text-muted">Capacidad: {s.max_capacity} personas</p>
              )}
              {s.booking_slug && (
                <p
                  onClick={(e) => { e.stopPropagation(); copyLink(s.booking_slug!); }}
                  className="mt-2 cursor-pointer text-xs text-text-muted underline underline-offset-2 hover:text-accent"
                  title="Click para copiar"
                >
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
