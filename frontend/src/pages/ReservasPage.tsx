import { useState, useEffect } from "react";
import MyBookings from "../components/MyBookings";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { showToast } from "../components/ui/Toast";
import {
  getMyBookings,
  cancelBooking,
  updateBookingStatus,
} from "../api/api";
import type { Booking } from "../types";

export default function ReservasPage() {
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<number | null>(null);

  useEffect(() => {
    getMyBookings().then((data) => {
      if (Array.isArray(data)) setMyBookings(data);
      setLoading(false);
    });
  }, []);

  const loadMyBookingsFn = async () => {
    const data = await getMyBookings();
    if (Array.isArray(data)) setMyBookings(data);
  };

  const handleUpdateStatus = async (id: number, status: string, reason?: string) => {
    const data = await updateBookingStatus(id, status, reason);
    if (data.message) {
      loadMyBookingsFn();
      const labels: Record<string, string> = {
        confirmed: "Reserva confirmada",
        declined: "Reserva rechazada",
        completed: "Reserva completada",
        "no-show": "Cliente no asistio",
        cancelled: "Reserva cancelada",
      };
      showToast(labels[status] || "Estado actualizado", "success");
    } else {
      showToast(data.error || "Error al actualizar estado", "error");
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!confirm("¿Cancelar reserva?")) return;
    const data = await cancelBooking(id);
    if (data.message) {
      loadMyBookingsFn();
      showToast("Reserva cancelada", "success");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="mb-8 text-xl font-semibold text-text">Mis Reservas</h2>
      <MyBookings
        bookings={myBookings}
        onReschedule={(id) => setRescheduleBookingId(id)}
        onCancel={handleCancelBooking}
        onStatusChange={handleUpdateStatus}
      />
    </div>
  );
}
