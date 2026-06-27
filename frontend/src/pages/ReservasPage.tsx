import { useState, useEffect, useCallback } from "react";
import MyBookings from "../components/MyBookings";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { showToast } from "../components/ui/Toast";
import {
  getMyBookings,
  cancelBooking,
  updateBookingStatus,
} from "../api/api";
import type { Booking, PaginatedBookings } from "../types";

export default function ReservasPage() {
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<number | null>(null);

  const loadMyBookings = useCallback(async (p: number, s: string, f: string) => {
    setLoading(true);
    const data: PaginatedBookings = await getMyBookings(p, 20, s || undefined, f || undefined);
    if ("data" in data) {
      setMyBookings(data.data);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMyBookings(page, search, statusFilter);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (q: string) => {
    setSearch(q);
    loadMyBookings(1, q, statusFilter);
  };

  const handleFilterChange = (f: string) => {
    setStatusFilter(f);
    loadMyBookings(1, search, f);
  };

  const handlePageChange = (p: number) => {
    loadMyBookings(p, search, statusFilter);
  };

  const handleUpdateStatus = async (id: number, status: string, reason?: string) => {
    const data = await updateBookingStatus(id, status, reason);
    if (data.message) {
      loadMyBookings(page, search, statusFilter);
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
      loadMyBookings(page, search, statusFilter);
      showToast("Reserva cancelada", "success");
    }
  };

  if (loading && myBookings.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="mb-8 text-xl font-semibold text-text">Mis Reservas</h2>
      <MyBookings
        bookings={myBookings}
        total={total}
        page={page}
        totalPages={totalPages}
        search={search}
        statusFilter={statusFilter}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onReschedule={(id) => setRescheduleBookingId(id)}
        onCancel={handleCancelBooking}
        onStatusChange={handleUpdateStatus}
      />
    </div>
  );
}
