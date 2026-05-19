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

function App() {
  const { token, user, logout } = useAuth();
  const publicBaseUrl = window.location.origin;
  const [view, setView] = useState("dashboard");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null);

  useEffect(() => {
    if (token) {
      const loadInitialData = async () => {
        const [servicesData, bookingsData, statsData] = await Promise.all([
          getServices(),
          getMyBookings(),
          getStats(),
        ]);

        if (Array.isArray(servicesData)) setServices(servicesData);
        if (Array.isArray(bookingsData)) setMyBookings(bookingsData);
        if (statsData && !statsData.error) setStats(statsData);
      };

      loadInitialData().catch(console.error);
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
    if (data && !data.error) setStats(data);
  };

  const handleLogout = () => {
    logout();
    setServices([]);
    setMyBookings([]);
    setSelectedService(null);
  };

  const handleCreateService = async (formData) => {
    const payload = {
      ...formData,
      price: formData.price === "" || formData.price === null ? null : Number(formData.price),
    };
    const data = await createService(payload);
    if (data.id) {
      setShowServiceModal(false);
      loadServices();
      loadStats();
      setSuccess("Servicio creado");
    } else {
      setError(data.error || "Error al crear servicio");
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm("¿Eliminar servicio?")) return;
    const data = await deleteService(id);
    if (data.message) {
      loadServices();
      setSelectedService(null);
    }
  };

  const handleSelectService = async (service, date = selectedDate) => {
    setSelectedService(service);
    setSuccess("");
    setError("");
    const data = await getAvailability(service.id, date);
    if (Array.isArray(data)) {
      setAvailableSlots(data);
    }
  };

  const handleDateChange = (newDate) => {
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

  const handleOpenBookingModal = (slot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (clientName, clientEmail) => {
    const data = await createBooking(
      selectedService.id,
      clientName,
      clientEmail,
      selectedSlot.start
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

  const handleCancelBooking = async (id) => {
    if (!confirm("¿Cancelar reserva?")) return;
    const data = await cancelBooking(id);
    if (data.message) {
      loadMyBookings();
      loadStats();
      setSuccess("Reserva cancelada");
    }
  };

  const handleStartReschedule = async (bookingId) => {
    setRescheduleBookingId(bookingId);
  };

  const handleConfirmReschedule = async (slot) => {
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
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar view={view} onViewChange={setView} onLogout={handleLogout} />

      <div className="mx-auto max-w-[1200px] px-10 py-10">
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {view === "dashboard" && (
          <>
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
              >
                {selectedService.name}
              </CalendarView>
            )}

            {selectedService && (
              <div className="mt-5">
                <AvailableSlots
                  slots={availableSlots}
                  onSelectSlot={handleOpenBookingModal}
                />
              </div>
            )}
          </>
        )}

        {view === "bookings" && (
          <>
            <h2 className="mb-8 text-xl font-semibold text-gray-800">Mis Reservas</h2>
            <MyBookings
              bookings={myBookings}
              onReschedule={handleStartReschedule}
              onCancel={handleCancelBooking}
            />
          </>
        )}
      </div>

      <ServiceFormModal
        open={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSubmit={handleCreateService}
      />

      <BookingModal
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        service={selectedService}
        slot={selectedSlot}
        defaultEmail={user?.email || ""}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}

export default App;
