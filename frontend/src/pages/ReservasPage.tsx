import { useState, useEffect, useCallback } from "react";
import ConfirmDialog from "../components/ui/ConfirmDialog";
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
  const [fetching, setFetching] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState<number | null>(null);

  const loadMyBookings = useCallback(async (p: number, s: string, f: string) => {
    setFetching(true);
    const data: PaginatedBookings = await getMyBookings(p, 20, s || undefined, f || undefined);
    if ("data" in data) {
      setMyBookings(data.data);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
    setFetching(false);
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

  const confirmCancel = async () => {
    if (cancelConfirm === null) return;
    const data = await cancelBooking(cancelConfirm);
    if (data.message) {
      loadMyBookings(page, search, statusFilter);
      showToast("Reserva cancelada", "success");
    }
    setCancelConfirm(null);
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
        onReschedule={() => {}}
        onCancel={handleCancelClick}
        onStatusChange={handleUpdateStatus}
      />

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
