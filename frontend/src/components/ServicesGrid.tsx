import type { Service } from "../types";

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
        <h2 className="m-0 text-xl font-semibold text-gray-800">Mis Servicios</h2>
        <button
          onClick={onNewService}
          className="cursor-pointer rounded-lg bg-indigo-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
        >
          + Nuevo Servicio
        </button>
      </div>

      <div className="mb-10 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
        {services.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelectService(s)}
            className={`cursor-pointer rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${
              selectedService?.id === s.id
                ? "border-3 border-indigo-500"
                : "border-transparent"
            }`}
          >
            <h3 className="m-0 mb-2 text-base font-semibold text-gray-800">{s.name}</h3>
            <p className="mb-3 text-sm text-gray-500">{s.description}</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-500">
                ${s.price} &bull; {s.duration}min
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteService(s.id);
                }}
                className="cursor-pointer rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-200"
              >
                Eliminar
              </button>
            </div>
            {s.booking_slug && (
              <p className="mt-2.5 text-xs text-gray-400">
                {publicBaseUrl}/book/{s.booking_slug}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
