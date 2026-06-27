import { useState, useEffect, useCallback } from "react";
import StatsCards from "../components/StatsCards";
import WeekBar from "../components/WeekBar";
import DayTimeline from "../components/DayTimeline";
import InlineBookingForm from "../components/InlineBookingForm";
import BookingPopover from "../components/BookingPopover";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { SkeletonStatCard } from "../components/ui/Skeleton";
import { showToast } from "../components/ui/Toast";
import {
  getDayAgenda,
  getStats,
  createBooking,
  updateBookingStatus,
  cancelBooking,
} from "../api/api";
import type { Stats, DayAgenda, TimelineSlot } from "../types";

export default function AgendaPage() {
  const [agendas, setAgendas] = useState<DayAgenda[]>([]);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [periodFilter, setPeriodFilter] = useState("all");
  const [selectedSlot, setSelectedSlot] = useState<{
    slot: TimelineSlot;
    serviceId: number;
    serviceName: string;
  } | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{
    booking: import("../types").Booking;
    serviceName: string;
  } | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<number | null>(null);

  const loadAgenda = useCallback(async (date: string) => {
    setAgendaLoading(true);
    try {
      const data = await getDayAgenda(date);
      if (Array.isArray(data)) {
        setAgendas(data);
      } else {
        setAgendas([]);
        showToast("Error al cargar agenda", "error");
      }
    } catch {
      setAgendas([]);
      showToast("Error al cargar agenda", "error");
    } finally {
      setAgendaLoading(false);
    }
  }, []);

  useEffect(() => {
    getStats(periodFilter).then((data) => {
      if (data && !("error" in data)) setStats(data);
    });
  }, [periodFilter]);

  useEffect(() => {
    loadAgenda(selectedDate);
  }, [selectedDate, loadAgenda]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setShowBookingForm(false);
    setShowPopover(false);
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

  const handleSlotClick = (slot: TimelineSlot, serviceId: number, serviceName: string) => {
    setSelectedSlot({ slot, serviceId, serviceName });
    if (slot.type === "available") {
      setShowBookingForm(true);
      setShowPopover(false);
    } else if (slot.type === "booked" && slot.booking) {
      setSelectedBooking({ booking: slot.booking, serviceName });
      setShowPopover(true);
      setShowBookingForm(false);
    }
  };

  const handleConfirmBooking = async (name: string, email: string, price?: number | null) => {
    if (!selectedSlot) return "Error inesperado";
    const data = await createBooking(
      selectedSlot.serviceId, name, email,
      selectedSlot.slot.start, "", price,
    );
    if (data.id) {
      setShowBookingForm(false);
      setSelectedSlot(null);
      loadAgenda(selectedDate);
      showToast("Reserva creada", "success");
      return null;
    }
    return data.error || "Error al crear reserva";
  };

  const handleStatusChange = async (id: number, status: string, reason?: string) => {
    const data = await updateBookingStatus(id, status, reason);
    if (data.message) {
      loadAgenda(selectedDate);
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
    setCancelConfirm(id);
  };

  const confirmCancel = async () => {
    if (cancelConfirm === null) return;
    const data = await cancelBooking(cancelConfirm);
    if (data.message) {
      loadAgenda(selectedDate);
      showToast("Reserva cancelada", "success");
    }
    setCancelConfirm(null);
  };

  return (
    <div className="animate-fade-in">
      {stats ? (
        <StatsCards stats={stats} period={periodFilter} onPeriodChange={setPeriodFilter} />
      ) : (
        <div className="mb-8">
          <h2 className="mb-5 text-xl font-semibold text-text">Estadisticas</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonStatCard key={i} />)}
          </div>
        </div>
      )}

      <div className="mb-6">
        <WeekBar
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
        />
      </div>

      {agendaLoading ? (
        <DayTimelineSkeleton />
      ) : (
        <DayTimeline
          agendas={agendas}
          onSlotClick={handleSlotClick}
        />
      )}

      {showBookingForm && selectedSlot && (
        <div className="mt-4 animate-slide-up">
          <InlineBookingForm
            slot={selectedSlot.slot}
            serviceName={selectedSlot.serviceName}
            defaultPrice={null}
            onConfirm={handleConfirmBooking}
            onCancel={() => { setShowBookingForm(false); setSelectedSlot(null); }}
          />
        </div>
      )}

      {showPopover && selectedBooking && (
        <div className="mt-4 animate-slide-up">
          <BookingPopover
            booking={selectedBooking.booking}
            serviceName={selectedBooking.serviceName}
            onStatusChange={handleStatusChange}
            onReschedule={() => {}}
            onCancel={handleCancelBooking}
            onClose={() => { setShowPopover(false); setSelectedBooking(null); }}
          />
        </div>
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

function DayTimelineSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i}>
          <div className="mb-3 h-5 w-40 animate-pulse rounded bg-border" />
          <div className="rounded-xl border border-border bg-surface">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-4 px-4 py-3 md:px-6">
                <div className="h-4 w-16 animate-pulse rounded bg-border" />
                <div className="h-px flex-1 bg-border" />
                <div className="h-4 w-20 animate-pulse rounded bg-border" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
