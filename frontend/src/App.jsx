import { useState, useEffect } from "react";
import {
  loginUser,
  registerUser,
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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [view, setView] = useState("dashboard");
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
  const [calendarView, setCalendarView] = useState("week");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    duration: 30,
    price: "",
    timezone: "America/Santiago",
    start_hour: 9,
    end_hour: 18,
  });
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState([]);

  useEffect(() => {
    if (token) {
      loadServices();
      loadMyBookings();
      loadStats();
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const data = await loginUser(email, password);
    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setError("");
    } else {
      setError(data.error || "Error en login");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    const data = await registerUser(name, email, password);
    if (data.id) {
      setSuccess("Cuenta creada. Inicia sesión.");
      setShowRegister(false);
      setName("");
    } else {
      setError(data.error || "Error al registrar");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setServices([]);
    setMyBookings([]);
    setSelectedService(null);
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    const data = await createService(newService);
    if (data.id) {
      setShowServiceModal(false);
      setNewService({
        name: "",
        description: "",
        duration: 30,
        price: "",
        timezone: "America/Santiago",
        start_hour: 9,
        end_hour: 18,
      });
      loadServices();
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

  const getWeekDays = () => {
    const days = [];
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const handleOpenBookingModal = (slot) => {
    setSelectedSlot(slot);
    setClientName("");
    setClientEmail(email);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!clientName.trim()) {
      setError("Por favor ingresa el nombre del cliente");
      return;
    }
    setError("");
    setIsBooking(true);
    const data = await createBooking(
      selectedService.id,
      clientName,
      clientEmail,
      selectedSlot.start
    );
    setIsBooking(false);
    if (data.id) {
      setShowBookingModal(false);
      setSuccess("Reserva creada");
      loadMyBookings();
      handleSelectService(selectedService, selectedDate);
    } else {
      setError(data.error || "Error al crear reserva");
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm("¿Cancelar reserva?")) return;
    const data = await cancelBooking(id);
    if (data.message) {
      loadMyBookings();
      setSuccess("Reserva cancelada");
    }
  };

  const handleReschedule = async (bookingId) => {
    setRescheduleBookingId(bookingId);
    const booking = myBookings.find((b) => b.id === bookingId);
    if (booking) {
      const date = new Date(booking.start_time).toISOString().split("T")[0];
      setRescheduleDate(date);
      const data = await getAvailability(booking.service_id, date);
      if (Array.isArray(data)) {
        setRescheduleSlots(data);
      }
    }
  };

  const handleConfirmReschedule = async () => {
    if (!selectedSlot) {
      setError("Selecciona un nuevo horario");
      return;
    }
    const data = await rescheduleBooking(rescheduleBookingId, selectedSlot.start);
    if (data.message) {
      setRescheduleBookingId(null);
      setSelectedSlot(null);
      loadMyBookings();
      setSuccess("Reserva reprogramada");
    } else {
      setError(data.error || "Error al reprogramar");
    }
  };

  if (!token) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            width: "400px",
          }}
        >
          <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
            {showRegister ? "Crear Cuenta" : "Reservas SaaS"}
          </h1>
          {error && (
            <p style={{ color: "#e53e3e", marginBottom: "15px" }}>{error}</p>
          )}
          {success && (
            <p style={{ color: "#38a169", marginBottom: "15px" }}>{success}</p>
          )}
          <form onSubmit={showRegister ? handleRegister : handleLogin}>
            {showRegister && (
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", color: "#555" }}>
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>
            )}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: "#555" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: "#555" }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "15px",
              }}
            >
              {showRegister ? "Crear Cuenta" : "Ingresar"}
            </button>
            <p style={{ textAlign: "center", color: "#666" }}>
              {showRegister ? (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <span
                    style={{ color: "#667eea", cursor: "pointer" }}
                    onClick={() => {
                      setShowRegister(false);
                      setError("");
                    }}
                  >
                    Ingresar
                  </span>
                </>
              ) : (
                <>
                  ¿No tienes cuenta?{" "}
                  <span
                    style={{ color: "#667eea", cursor: "pointer" }}
                    onClick={() => {
                      setShowRegister(true);
                      setError("");
                    }}
                  >
                    Crear cuenta
                  </span>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    );
  }

  if (rescheduleBookingId) {
    return (
      <div style={{ padding: "40px", fontFamily: "'Inter', sans-serif" }}>
        <button
          onClick={() => setRescheduleBookingId(null)}
          style={{
            padding: "10px 20px",
            background: "#f0f0f0",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          ← Volver
        </button>
        <h2>Reprogramar Reserva</h2>
        <div style={{ marginBottom: "20px" }}>
          <label>Selecciona fecha:</label>
          <input
            type="date"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
            style={{ padding: "10px", marginLeft: "10px" }}
          />
        </div>
        {rescheduleSlots.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {rescheduleSlots.map((slot, i) => (
              <button
                key={i}
                onClick={() => setSelectedSlot(slot)}
                style={{
                  padding: "10px 15px",
                  background: selectedSlot?.start === slot.start ? "#667eea" : "#f0f0f0",
                  color: selectedSlot?.start === slot.start ? "white" : "#333",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                {new Date(slot.start).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={handleConfirmReschedule}
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Confirmar Reprogramación
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <nav
        style={{
          background: "white",
          padding: "15px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px", color: "#333" }}>📅 Reservas SaaS</h1>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <button
            onClick={() => setView("dashboard")}
            style={{
              background: "transparent",
              border: view === "dashboard" ? "2px solid #667eea" : "none",
              color: view === "dashboard" ? "#667eea" : "#666",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView("bookings")}
            style={{
              background: "transparent",
              border: view === "bookings" ? "2px solid #667eea" : "none",
              color: view === "bookings" ? "#667eea" : "#666",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Mis Reservas
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              background: "#e53e3e",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        {error && (
          <div
            style={{
              background: "#fed7d7",
              color: "#c53030",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              background: "#c6f6d5",
              color: "#2f855a",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {success}
          </div>
        )}

        {view === "dashboard" && (
          <>
            {/* STATS */}
            {stats && (
              <div style={{ marginBottom: "30px" }}>
                <h2 style={{ marginBottom: "20px", color: "#333" }}>📊 Estadísticas</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
                  <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", textAlign: "center" }}>
                    <div style={{ fontSize: "32px", fontWeight: "bold", color: "#667eea" }}>{stats.total}</div>
                    <div style={{ color: "#666" }}>Total Reservas</div>
                  </div>
                  <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", textAlign: "center" }}>
                    <div style={{ fontSize: "32px", fontWeight: "bold", color: "#38a169" }}>{stats.confirmed}</div>
                    <div style={{ color: "#666" }}>Confirmadas</div>
                  </div>
                  <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", textAlign: "center" }}>
                    <div style={{ fontSize: "32px", fontWeight: "bold", color: "#e53e3e" }}>{stats.cancelled}</div>
                    <div style={{ color: "#666" }}>Canceladas</div>
                  </div>
                  <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", textAlign: "center" }}>
                    <div style={{ fontSize: "32px", fontWeight: "bold", color: "#ed8936" }}>${stats.revenue?.toLocaleString()}</div>
                    <div style={{ color: "#666" }}>Ingresos</div>
                  </div>
                </div>

                {stats.byService?.length > 0 && (
                  <div style={{ marginTop: "20px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                    <h3 style={{ marginTop: 0, color: "#333" }}>Por Servicio</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid #eee" }}>
                          <th style={{ textAlign: "left", padding: "10px", color: "#666" }}>Servicio</th>
                          <th style={{ textAlign: "center", padding: "10px", color: "#666" }}>Reservas</th>
                          <th style={{ textAlign: "right", padding: "10px", color: "#666" }}>Ingresos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.byService.map((s, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "10px" }}>{s.name}</td>
                            <td style={{ textAlign: "center", padding: "10px" }}>{s.total}</td>
                            <td style={{ textAlign: "right", padding: "10px" }}>${s.revenue?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {stats.upcoming?.length > 0 && (
                  <div style={{ marginTop: "20px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                    <h3 style={{ marginTop: 0, color: "#333" }}>Próximas Citas</h3>
                    {stats.upcoming.map((b, i) => (
                      <div key={i} style={{ padding: "10px 0", borderBottom: i < stats.upcoming.length - 1 ? "1px solid #eee" : "none" }}>
                        <strong>{b.client_name}</strong> - {b.service_name}
                        <br />
                        <span style={{ color: "#666" }}>
                          {new Date(b.start_time).toLocaleString("es-CL", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              <h2 style={{ margin: 0, color: "#333" }}>Mis Servicios</h2>
              <button
                onClick={() => setShowServiceModal(true)}
                style={{
                  padding: "12px 24px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                + Nuevo Servicio
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
                marginBottom: "40px",
              }}
            >
              {services.map((s) => (
                <div
                  key={s.id}
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                    border:
                      selectedService?.id === s.id ? "3px solid #667eea" : "3px solid transparent",
                  }}
                  onClick={() => handleSelectService(s)}
                >
                  <h3 style={{ margin: "0 0 10px", color: "#333" }}>{s.name}</h3>
                  <p style={{ color: "#666", fontSize: "14px" }}>{s.description}</p>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#667eea", fontWeight: "600" }}>
                      ${s.price} • {s.duration}min
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteService(s.id);
                      }}
                      style={{
                        background: "#fed7d7",
                        color: "#c53030",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                  {s.booking_slug && (
                    <p style={{ marginTop: "10px", fontSize: "12px", color: "#999" }}>
                      🔗 {API_URL}/book/{s.booking_slug}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {selectedService && (
              <div
                style={{
                  background: "white",
                  padding: "30px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              >
                <h3 style={{ margin: "0 0 20px", color: "#333" }}>
                  Agenda - {selectedService.name}
                </h3>

                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <button
                    onClick={() => {
                      const d = new Date(selectedDate);
                      d.setDate(d.getDate() - 7);
                      handleDateChange(d.toISOString().split("T")[0]);
                    }}
                    style={{
                      padding: "8px 16px",
                      background: "#f0f0f0",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    ← Semana anterior
                  </button>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
                  />
                  <button
                    onClick={() => {
                      const d = new Date(selectedDate);
                      d.setDate(d.getDate() + 7);
                      handleDateChange(d.toISOString().split("T")[0]);
                    }}
                    style={{
                      padding: "8px 16px",
                      background: "#f0f0f0",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Semana siguiente →
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px" }}>
                  {getWeekDays().map((day, i) => {
                    const dateStr = day.toISOString().split("T")[0];
                    const isToday = dateStr === new Date().toISOString().split("T")[0];
                    return (
                      <div
                        key={i}
                        style={{
                          background: dateStr === selectedDate ? "#e6efff" : "#f9f9f9",
                          padding: "15px",
                          borderRadius: "8px",
                          minHeight: "100px",
                        }}
                        onClick={() => handleDateChange(dateStr)}
                      >
                        <div
                          style={{
                            fontWeight: isToday ? "bold" : "normal",
                            color: isToday ? "#667eea" : "#333",
                            marginBottom: "10px",
                          }}
                        >
                          {day.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <h4 style={{ marginTop: "30px", color: "#333" }}>
                  Horarios disponibles para {selectedDate}
                </h4>
                {availableSlots.length === 0 ? (
                  <p style={{ color: "#666" }}>No hay horarios disponibles</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {availableSlots.map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => handleOpenBookingModal(slot)}
                        style={{
                          padding: "12px 20px",
                          background: "#667eea",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "500",
                          transition: "all 0.2s",
                        }}
                      >
                        {new Date(slot.start).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {view === "bookings" && (
          <>
            <h2 style={{ marginBottom: "30px", color: "#333" }}>Mis Reservas</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {myBookings.length === 0 ? (
                <p style={{ color: "#666" }}>No tienes reservas</p>
              ) : (
                myBookings.map((booking) => (
                  <div
                    key={booking.id}
                    style={{
                      background: "white",
                      padding: "20px",
                      borderRadius: "12px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 5px", color: "#333" }}>
                        {booking.service_name}
                      </h4>
                      <p style={{ margin: 0, color: "#666" }}>
                        📧 {booking.client_name} ({booking.client_email})
                      </p>
                      <p style={{ margin: "5px 0 0", color: "#666" }}>
                        🕐{" "}
                        {new Date(booking.start_time).toLocaleString("es-CL", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleReschedule(booking.id)}
                        style={{
                          padding: "10px 20px",
                          background: "#ed8936",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        Reprogramar
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        style={{
                          padding: "10px 20px",
                          background: "#e53e3e",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {showServiceModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "12px",
              width: "500px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Nuevo Servicio</h2>
            <form onSubmit={handleCreateService}>
              <div style={{ marginBottom: "15px" }}>
                <label>Nombre del servicio *</label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) =>
                    setNewService({ ...newService, name: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label>Descripción</label>
                <textarea
                  value={newService.description}
                  onChange={(e) =>
                    setNewService({ ...newService, description: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    minHeight: "80px",
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>Duración (minutos)</label>
                  <input
                    type="number"
                    value={newService.duration}
                    onChange={(e) =>
                      setNewService({ ...newService, duration: parseInt(e.target.value) })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                    }}
                  />
                </div>
                <div>
                  <label>Precio ($)</label>
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) =>
                      setNewService({ ...newService, price: parseInt(e.target.value) })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>Zona Horaria</label>
                  <select
                    value={newService.timezone}
                    onChange={(e) =>
                      setNewService({ ...newService, timezone: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                    }}
                  >
                    <option value="America/Santiago">Santiago (CL)</option>
                    <option value="America/Buenos_Aires">Buenos Aires (AR)</option>
                    <option value="America/Mexico_City">Ciudad de México (MX)</option>
                    <option value="America/New_York">New York (US)</option>
                    <option value="Europe/Madrid">Madrid (ES)</option>
                  </select>
                </div>
                <div>
                  <label>Hora inicio</label>
                  <input
                    type="number"
                    value={newService.start_hour}
                    onChange={(e) =>
                      setNewService({ ...newService, start_hour: parseInt(e.target.value) })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                    }}
                  />
                </div>
                <div>
                  <label>Hora fin</label>
                  <input
                    type="number"
                    value={newService.end_hour}
                    onChange={(e) =>
                      setNewService({ ...newService, end_hour: parseInt(e.target.value) })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#ddd",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Crear Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBookingModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "12px",
              width: "400px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Crear Reserva</h2>
            <p style={{ color: "#666" }}>
              🕐{" "}
              {selectedSlot &&
                new Date(selectedSlot.start).toLocaleString("es-CL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </p>
            <div style={{ marginBottom: "15px" }}>
              <label>Nombre del cliente *</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label>Email del cliente</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#ddd",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: isBooking ? "#a0aec0" : "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isBooking ? "not-allowed" : "pointer",
                }}
              >
                {isBooking ? "Creando..." : "Confirmar Reserva"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;