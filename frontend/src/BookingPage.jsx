import { useState, useEffect } from "react";
import { getPublicAvailability, createPublicBooking } from "./api/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function BookingPage({ slug }) {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    loadService();
  }, []);

  useEffect(() => {
    if (service) {
      handleDateChange(selectedDate);
    }
  }, [selectedDate, service]);

  const loadService = async () => {
    try {
      const res = await fetch(`${API_URL}/api/services/${slug}`);
      const data = await res.json();
      if (data.id) {
        setService(data);
      } else {
        setError("Servicio no encontrado");
      }
    } catch (e) {
      setError("Error al cargar servicio");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = async (date) => {
    const data = await getPublicAvailability(service.id, date);
    if (Array.isArray(data)) {
      setAvailableSlots(data);
    }
  };

  const getWeekDays = () => {
    const days = [];
    const baseDate = new Date(selectedDate);
    const dayOfWeek = baseDate.getDay();
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7);
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const handleConfirmBooking = async () => {
    if (!clientName.trim() || !clientEmail.trim()) {
      setError("Nombre y email son requeridos");
      return;
    }
    setError("");
    setIsBooking(true);
    const data = await createPublicBooking(
      service.id,
      clientName,
      clientEmail,
      selectedSlot.start,
      notes
    );
    setIsBooking(false);
    if (data.booking?.id) {
      setBookingSuccess(true);
      setShowModal(false);
    } else {
      setError(data.error || "Error al crear reserva");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        Cargando...
      </div>
    );
  }

  if (error && !service) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
          background: "#f5f7fa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ color: "#e53e3e" }}>{error}</h1>
          <p>El enlace puede haber expirado o ser inválido.</p>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "50px",
            borderRadius: "16px",
            textAlign: "center",
            maxWidth: "500px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "#c6f6d5",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "40px",
            }}
          >
            ✓
          </div>
          <h1 style={{ color: "#2f855a", marginBottom: "10px" }}>¡Reserva Confirmada!</h1>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Tu reserva para <strong>{service.name}</strong> ha sido creada.
          </p>
          <p style={{ color: "#666" }}>
            Envíamos un correo de confirmación a <strong>{clientEmail}</strong>
          </p>
        </div>
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
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "40px",
          textAlign: "center",
          color: "white",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "32px" }}>{service?.name}</h1>
        <p style={{ margin: "10px 0 0", opacity: 0.9 }}>
          {service?.description} • ${service?.price} • {service?.duration}min
        </p>
        <p style={{ margin: "10px 0 0", opacity: 0.8, fontSize: "14px" }}>
          Provider: {service?.provider_name}
        </p>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#333" }}>Selecciona fecha y hora</h2>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              style={{
                padding: "10px 16px",
                background: "#f0f0f0",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              ← Sem. anterior
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
            />
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              style={{
                padding: "10px 16px",
                background: "#f0f0f0",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Sem. siguiente →
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px", marginBottom: "30px" }}>
            {getWeekDays().map((day, i) => {
              const dateStr = day.toISOString().split("T")[0];
              const isToday = dateStr === new Date().toISOString().split("T")[0];
              const isSelected = dateStr === selectedDate;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(dateStr)}
                  style={{
                    background: isSelected ? "#e6efff" : isToday ? "#fff5f5" : "#f9f9f9",
                    padding: "15px 10px",
                    borderRadius: "8px",
                    textAlign: "center",
                    cursor: "pointer",
                    border: isSelected ? "2px solid #667eea" : "2px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#666", textTransform: "capitalize" }}>
                    {day.toLocaleDateString("es-ES", { weekday: "short" })}
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: isToday ? "bold" : "normal", color: isToday ? "#e53e3e" : "#333" }}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          <h3 style={{ color: "#333" }}>Horarios disponibles</h3>
          {availableSlots.length === 0 ? (
            <p style={{ color: "#666" }}>No hay horarios disponibles para esta fecha</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {availableSlots.map((slot, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedSlot(slot);
                    setShowModal(true);
                  }}
                  style={{
                    padding: "12px 20px",
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "500",
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
      </div>

      {showModal && (
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
            <h2 style={{ marginTop: 0 }}>Confirmar Reserva</h2>
            <div style={{ background: "#f5f7fa", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
              <p style={{ margin: "0 0 5px", fontWeight: "600" }}>{service?.name}</p>
              <p style={{ margin: 0, color: "#666" }}>
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
              <p style={{ margin: "10px 0 0", color: "#666" }}>
                ⏱️ {service?.duration} min • ${service?.price}
              </p>
            </div>

            {error && <p style={{ color: "#e53e3e", marginBottom: "15px" }}>{error}</p>}

            <div style={{ marginBottom: "15px" }}>
              <label>Nombre completo *</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Juan Pérez"
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
              <label>Email *</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="juan@example.com"
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
              <label>Notas (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Información adicional..."
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  minHeight: "60px",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowModal(false)}
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
                {isBooking ? "Confirmando..." : "Confirmar Reserva"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingPage;