import { useState, useEffect, useCallback } from "react";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import MyBookings from "../components/MyBookings";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import RescheduleModal from "../components/RescheduleModal";
import { showToast } from "../components/ui/Toast";
import {
  getMyBookings,
  cancelBooking,
  updateBookingStatus,
  rescheduleBooking,
  errorMessage,
} from "../api/api";
import type { Booking, BookingStatusAction } from "../types";

export default function ReservasPage() {
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState<number | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);

  const loadMyBookings = useCallback(async (p: number, s: string, f: string) => {
    setFetching(true);
    try {
      const data = await getMyBookings(p, 20, s || undefined, f || undefined);
      setMyBookings(data.data);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (e) {
      setMyBookings([]);
      showToast(errorMessage(e, "Error al cargar reservas"), "error");
    } finally {
      setLoading(false);
      setFetching(false);
    }
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

  const handleCancelClick = (id: number) => {
    setCancelConfirm(id);
  };

  const handleReschedule = (id: number) => {
    const booking = myBookings.find((b) => b.id === id) ?? null;
    setRescheduleTarget(booking);
  };

  const confirmReschedule = async (newStartTime: string) => {
    if (!rescheduleTarget) return "Error inesperado";
    try {
      await rescheduleBooking(rescheduleTarget.id, newStartTime);
      setRescheduleTarget(null);
      loadMyBookings(page, search, statusFilter);
      showToast("Reserva reprogramada", "success");
      return null;
    } catch (e) {
      return errorMessage(e, "Error al reprogramar");
    }
  };

  const confirmCancel = async () => {
    if (cancelConfirm === null) return;
    try {
      await cancelBooking(cancelConfirm);
      loadMyBookings(page, search, statusFilter);
      showToast("Reserva cancelada", "success");
    } catch (e) {
      showToast(errorMessage(e, "Error al cancelar reserva"), "error");
    }
    setCancelConfirm(null);
  };

  const handleUpdateStatus = async (id: number, status: BookingStatusAction, reason?: string) => {
    try {
      await updateBookingStatus(id, status, reason);
      loadMyBookings(page, search, statusFilter);
      const labels: Record<string, string> = {
        confirmed: "Reserva confirmada",
        declined: "Reserva rechazada",
        completed: "Reserva completada",
        "no-show": "Cliente no asistio",
        cancelled: "Reserva cancelada",
      };
      showToast(labels[status] || "Estado actualizado", "success");
    } catch (e) {
      showToast(errorMessage(e, "Error al actualizar estado"), "error");
    }
  };

  if (loading && myBookings.length === 0) return <LoadingSpinner />;

  return (
    <div className="relative animate-fade-in">
      <h2 className="mb-8 text-xl font-semibold text-text">Mis Reservas</h2>

      {fetching && myBookings.length > 0 && (
        <div className="absolute inset-0 z-10 flex items-start justify-center rounded-xl bg-bg/60 pt-20">
          <LoadingSpinner size="sm" />
        </div>
      )}

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
        onReschedule={handleReschedule}
        onCancel={handleCancelClick}
        onStatusChange={handleUpdateStatus}
      />

      {rescheduleTarget && (
        <RescheduleModal
          booking={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onConfirm={confirmReschedule}
        />
      )}

      <ConfirmDialog
        open={cancelConfirm !== null}
        onClose={() => setCancelConfirm(null)}
        onConfirm={confirmCancel}
        title="Cancelar reserva"
        message="Esta accion no se puede deshacer. Se notificara al cliente."
        confirmLabel="Cancelar reserva"
        variant="danger"
      />
    </div>
  );
}
