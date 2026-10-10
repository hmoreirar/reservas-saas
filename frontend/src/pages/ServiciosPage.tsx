import { useState, useEffect } from "react";
import ServicesGrid from "../components/ServicesGrid";
import ServiceFormModal from "../components/ServiceFormModal";
import { showToast } from "../components/ui/Toast";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../api/api";
import type { Service } from "../types";

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const publicBaseUrl = window.location.origin;

  useEffect(() => {
    getServices().then((data) => {
      if (Array.isArray(data)) setServices(data);
    });
  }, []);

  const loadServices = async (): Promise<Service[]> => {
    const data = await getServices();
    if (Array.isArray(data)) {
      setServices(data);
      return data;
    }
    return [];
  };

  const handleSaveService = async (formData: {
    name: string;
    description: string;
    duration: number;
    price: string;
    timezone: string;
    start_hour: number;
    end_hour: number;
    max_capacity: number;
  }): Promise<boolean> => {
    const payload = {
      ...formData,
      price: formData.price === "" || formData.price === null ? undefined : Number(formData.price),
    };
    const data = editingService
      ? await updateService(editingService.id, payload)
      : await createService(payload);
    if (data.id) {
      const list = await loadServices();
      if (editingService) {
        showToast("Servicio actualizado", "success");
      } else {
        setEditingService(list.find((s) => s.id === data.id) ?? null);
        showToast("Servicio creado", "success");
      }
      return true;
    }
    showToast(data.error || "Error al guardar servicio", "error");
    return false;
  };

  const handleNewService = () => {
    setEditingService(null);
    setShowServiceModal(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowServiceModal(true);
  };

  const handleCloseModal = () => {
    setShowServiceModal(false);
    setEditingService(null);
    loadServices();
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
        onDeleteService={handleDeleteService}
        onEditService={handleEditService}
        onNewService={handleNewService}
        publicBaseUrl={publicBaseUrl}
      />

      <ServiceFormModal
        open={showServiceModal}
        onClose={handleCloseModal}
        onSubmit={handleSaveService}
        editingService={editingService}
      />
    </div>
  );
}
