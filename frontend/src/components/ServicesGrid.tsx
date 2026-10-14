import type { Service } from "../types";
import EmptyState from "./ui/EmptyState";
import CopyLinkButton from "./CopyLinkButton";

interface ServicesGridProps {
  services: Service[];
  onDeleteService: (id: number) => void;
  onEditService: (service: Service) => void;
  onNewService: () => void;
  publicBaseUrl: string;
}

export default function ServicesGrid({
  services,
  onDeleteService,
  onEditService,
  onNewService,
  publicBaseUrl,
}: ServicesGridProps) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="m-0 text-xl font-semibold text-text">Mis Servicios</h2>
        <button
          onClick={onNewService}
          className="cursor-pointer rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-accent-text transition-colors hover:bg-accent-hover"
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
              className="rounded-xl border border-border bg-surface p-5 transition-all hover:border-border-hover"
            >
              <h3 className="m-0 mb-2 text-base font-semibold text-text">{s.name}</h3>
              <p className="mb-3 text-sm text-text-secondary">{s.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-accent">
                  ${s.price} &middot; {s.duration}min
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => onEditService(s)}
                    className="cursor-pointer text-xs text-text-muted hover:text-accent"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDeleteService(s.id)}
                    className="cursor-pointer text-xs text-text-muted hover:text-danger"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              {s.max_capacity != null && s.max_capacity > 1 && (
                <p className="mt-2 text-xs text-text-muted">Capacidad: {s.max_capacity} personas</p>
              )}
              {s.booking_slug && (
                <div className="mt-3">
                  <p className="mb-1.5 truncate text-xs text-text-muted">
                    {publicBaseUrl}/book/{s.booking_slug}
                  </p>
                  <CopyLinkButton
                    url={`${publicBaseUrl}/book/${s.booking_slug}`}
                    label="Copiar link de reservas"
                    variant="secondary"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
