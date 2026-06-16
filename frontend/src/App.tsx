import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import StatsCards from "./components/StatsCards";
import ServicesGrid from "./components/ServicesGrid";
import CalendarView from "./components/CalendarView";
import AvailableSlots from "./components/AvailableSlots";
import ServiceFormModal from "./components/ServiceFormModal";
import BookingModal from "./components/BookingModal";
import MyBookings from "./components/MyBookings";
import RescheduleView from "./components/RescheduleView";
import Alert from "./components/ui/Alert";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import {
  getServices,
  getAvailability,
  createService,
  deleteService,
  getMyBookings,
  getStats,
  cancelBooking,
  rescheduleBooking,
  createBooking,
} from "./api/api";
import type { Service, Stats, TimeSlot, Booking } from "./types";

export default function App() {
  const { token, user, logout } = useAuth();
  const publicBaseUrl = window.location.origin;
  const [view, setView] = useState<"dashboard" | "bookings">("dashboard");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const loadInitialData = async () => {
        setLoading(true);
        const [servicesData, bookingsData, statsData] = await Promise.all([
          getServices(),
          getMyBookings(),
          getStats(),
        ]);

        if (Array.isArray(servicesData)) setServices(servicesData);
        if (Array.isArray(bookingsData)) setMyBookings(bookingsData);
        if (statsData && !("error" in statsData)) setStats(statsData);
        setLoading(false);
      };

      loadInitialData().catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadServices = async () => {
    const data = await getServices();
    if (Array.isArray(data)) setServices(data);
  };

  const loadMyBookings = async () => {
    const data = await getMyBookings();
    if (Array.isArray(data)) setMyBookings(data);
  };

  const loadStats = async () => {
    const data = await getStats();
    if (data && !("error" in data)) setStats(data);
  };

  const handleLogout = () => {
    logout();
    setServices([]);
    setMyBookings([]);
    setSelectedService(null);
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
      price: formData.price === "" || formData.price === null ? null : Number(formData.price),
    };
    const data = await createService(payload);
    if (data.id) {
      setShowServiceModal(false);
      loadServices();
      loadStats();
      setEditingServiceId(data.id);
      setSuccess("Servicio creado");
    } else {
      setError(data.error || "Error al crear servicio");
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm("¿Eliminar servicio?")) return;
    const data = await deleteService(id);
    if (data.message) {
      loadServices();
      setSelectedService(null);
    }
  };

  const handleSelectService = async (service: Service, date = selectedDate) => {
    setSelectedService(service);
    setSuccess("");
    setError("");
    const data = await getAvailability(service.id, date);
    if (Array.isArray(data)) {
      setAvailableSlots(data);
    }
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    if (selectedService) {
      handleSelectService(selectedService, newDate);
    }
  };

  const handlePrevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    handleDateChange(d.toISOString().split("T")[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    handleDateChange(d.toISOString().split("T")[0]);
  };

  const handleOpenBookingModal = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (clientName: string, clientEmail: string, price?: number | null) => {
    if (!selectedService || !selectedSlot) return "Error inesperado";
    const data = await createBooking(
      selectedService.id,
      clientName,
      clientEmail,
      selectedSlot.start,
      "",
      price,
    );
    if (data.id) {
      setShowBookingModal(false);
      setSuccess("Reserva creada");
      loadMyBookings();
      loadStats();
      handleSelectService(selectedService, selectedDate);
      return null;
    }
    return data.error || "Error al crear reserva";
  };

  const handleCancelBooking = async (id: number) => {
    if (!confirm("¿Cancelar reserva?")) return;
    const data = await cancelBooking(id);
    if (data.message) {
      loadMyBookings();
      loadStats();
      setSuccess("Reserva cancelada");
    }
  };

  const handleStartReschedule = (bookingId: number) => {
    setRescheduleBookingId(bookingId);
  };

  const handleConfirmReschedule = async (slot: TimeSlot) => {
    if (!rescheduleBookingId) return "Error inesperado";
    const data = await rescheduleBooking(rescheduleBookingId, slot.start);
    if (data.message) {
      setRescheduleBookingId(null);
      setSelectedSlot(null);
      loadMyBookings();
      loadStats();
      setSuccess("Reserva reprogramada");
      return null;
    }
    return data.error || "Error al reprogramar";
  };

  if (!token) {
    return <LoginPage />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (rescheduleBookingId) {
    return (
      <RescheduleView
        bookingId={rescheduleBookingId}
        bookings={myBookings}
        onBack={() => setRescheduleBookingId(null)}
        onConfirm={handleConfirmReschedule}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navbar view={view} onViewChange={setView} onLogout={handleLogout} />

      <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-10 md:py-10">
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {view === "dashboard" && (
          <div key="dashboard" className="animate-fade-in">
            {stats && <StatsCards stats={stats} />}

            <ServicesGrid
              services={services}
              selectedService={selectedService}
              onSelectService={handleSelectService}
              onDeleteService={handleDeleteService}
              onNewService={() => setShowServiceModal(true)}
              publicBaseUrl={publicBaseUrl}
            />

            {selectedService && (
              <CalendarView
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
                serviceName={selectedService.name}
                slots={
                  <AvailableSlots
                    slots={availableSlots}
                    onSelectSlot={handleOpenBookingModal}
                  />
                }
              />
            )}
          </div>
        )}

        {view === "bookings" && (
          <div key="bookings" className="animate-fade-in">
            <h2 className="mb-8 text-xl font-semibold text-stone-800">Mis Reservas</h2>
            <MyBookings
              bookings={myBookings}
              onReschedule={handleStartReschedule}
              onCancel={handleCancelBooking}
            />
          </div>
        )}
      </div>

      <ServiceFormModal
        open={showServiceModal}
        onClose={() => { setShowServiceModal(false); setEditingServiceId(null); }}
        onSubmit={handleCreateService}
        editingService={editingServiceId ? { id: editingServiceId } : null}
      />

      <BookingModal
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        service={selectedService!}
        slot={selectedSlot}
        defaultEmail={user?.email || ""}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}
