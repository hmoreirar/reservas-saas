import { useState, useEffect } from "react";
import ServicesGrid from "../components/ServicesGrid";
import ServiceFormModal from "../components/ServiceFormModal";
import { showToast } from "../components/ui/Toast";
import {
  getServices,
  createService,
  deleteService,
} from "../api/api";
import type { Service } from "../types";

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const publicBaseUrl = window.location.origin;

  useEffect(() => {
    getServices().then((data) => {
      if (Array.isArray(data)) setServices(data);
    });
  }, []);

  const loadServices = async () => {
    const data = await getServices();
    if (Array.isArray(data)) setServices(data);
  };

  const handleCreateService = async (formData: {
    name: string;
    description: string;
    duration: number;
    price: string;
    timezone: string;
    start_hour: number;
    end_hour: number;
    max_capacity: number;
  }) => {
    const payload = {
      ...formData,
      price: formData.price === "" || formData.price === null ? undefined : Number(formData.price),
    };
    const data = await createService(payload);
    if (data.id) {
      loadServices();
      setEditingServiceId(data.id);
      showToast("Servicio creado", "success");
    } else {
      showToast(data.error || "Error al crear servicio", "error");
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm("¿Eliminar servicio?")) return;
    const data = await deleteService(id);
    if (data.message) loadServices();
  };

  return (
    <div className="animate-fade-in">
      <ServicesGrid
        services={services}
        selectedService={null}
        onSelectService={() => {}}
        onDeleteService={handleDeleteService}
        onNewService={() => setShowServiceModal(true)}
        publicBaseUrl={publicBaseUrl}
      />

      <ServiceFormModal
        open={showServiceModal}
        onClose={() => { setShowServiceModal(false); setEditingServiceId(null); }}
        onSubmit={handleCreateService}
        editingService={editingServiceId ? { id: editingServiceId } : null}
      />
    </div>
  );
}
