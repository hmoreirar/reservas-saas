import { useState, useEffect } from "react";
import ServicesGrid from "../components/ServicesGrid";
import ServiceFormModal from "../components/ServiceFormModal";
import { showToast } from "../components/ui/Toast";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  errorMessage,
} from "../api/api";
import type { Service } from "../types";

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const publicBaseUrl = window.location.origin;

  const loadServices = async (): Promise<void> => {
    setServices(await getServices());
  };

  useEffect(() => {
    loadServices().catch((e) => showToast(errorMessage(e, "Error al cargar servicios"), "error"));
  }, []);

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
    try {
      const saved = editingService
        ? await updateService(editingService.id, payload)
        : await createService(payload);
      await loadServices();
      if (editingService) {
        showToast("Servicio actualizado", "success");
      } else {
        setEditingService(saved);
        showToast("Servicio creado", "success");
      }
      return true;
    } catch (e) {
      showToast(errorMessage(e, "Error al guardar servicio"), "error");
      return false;
    }
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
    try {
      await deleteService(id);
      await loadServices();
      showToast("Servicio eliminado", "success");
    } catch (e) {
      showToast(errorMessage(e, "Error al eliminar servicio"), "error");
    }
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
