import { useState, useEffect, useCallback, useMemo } from "react";
import StatsCards from "../components/StatsCards";
import WeekBar from "../components/WeekBar";
import DayTimeline from "../components/DayTimeline";
import Modal from "../components/ui/Modal";
import QuickBookingForm, { type SlotOption } from "../components/QuickBookingForm";
import GettingStarted from "../components/GettingStarted";
import BookingPopover from "../components/BookingPopover";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import RescheduleModal from "../components/RescheduleModal";
import { SkeletonStatCard } from "../components/ui/Skeleton";
import { showToast } from "../components/ui/Toast";
import { todayDateOnly, addDays } from "@reservas/shared";
import {
  getDayAgenda,
  getStats,
  getServices,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
  errorMessage,
} from "../api/api";
import type { Stats, DayAgenda, TimelineSlot, BookingStatusAction, Service } from "../types";

export default function AgendaPage() {
  const [agendas, setAgendas] = useState<DayAgenda[]>([]);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    return todayDateOnly();
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
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    getServices()
      .then((data) => setServices(data))
      .catch(() => setServices([]));
  }, []);

  // huecos libres del dia para el boton flotante "+ Agendar hora"
  const freeSlots = useMemo(() => {
    const options: (SlotOption & { serviceId: number; start: string })[] = [];
    for (const agenda of agendas) {
      for (const slot of agenda.slots) {
        if (slot.type !== "available") continue;
        const label = new Date(slot.start).toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        options.push({
          value: slot.start,
          start: slot.start,
          label: `${label} · ${agenda.service_name}`,
          serviceId: agenda.service_id,
        });
      }
    }
    return options;
  }, [agendas]);
  const [rescheduleTarget, setRescheduleTarget] = useState<{
    booking: import("../types").Booking;
    serviceName: string;
  } | null>(null);

  const loadAgenda = useCallback(async (date: string) => {
    setAgendaLoading(true);
    try {
      setAgendas(await getDayAgenda(date));
    } catch (e) {
      setAgendas([]);
      showToast(errorMessage(e, "Error al cargar agenda"), "error");
    } finally {
      setAgendaLoading(false);
    }
  }, []);

  useEffect(() => {
    getStats(periodFilter)
      .then(setStats)
      .catch((e) => showToast(errorMessage(e, "Error al cargar estadisticas"), "error"));
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
    handleDateChange(addDays(selectedDate, -7));
  };

  const handleNextWeek = () => {
    handleDateChange(addDays(selectedDate, 7));
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

  const handleConfirmBooking = async (data: {
    name: string;
    phone: string;
    email: string;
    notes: string;
    slot: string;
  }) => {
    const target = selectedSlot
      ? { serviceId: selectedSlot.serviceId, start: selectedSlot.slot.start }
      : freeSlots.find((s) => s.value === data.slot);
    if (!target) return "Elige un horario disponible";
    try {
      await createBooking(target.serviceId, data.name, data.phone, target.start, data.email, data.notes);
      setShowBookingForm(false);
      setSelectedSlot(null);
      loadAgenda(selectedDate);
      showToast("Hora agendada", "success");
      return null;
    } catch (e) {
      return errorMessage(e, "Error al agendar la hora");
    }
  };

  const handleStatusChange = async (id: number, status: BookingStatusAction, reason?: string) => {
    try {
      await updateBookingStatus(id, status, reason);
      loadAgenda(selectedDate);
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

  const handleCancelBooking = async (id: number) => {
    setCancelConfirm(id);
  };

  const handleReschedule = (_id: number) => {
    if (selectedBooking) {
      setRescheduleTarget(selectedBooking);
      setShowPopover(false);
    }
  };

  const confirmReschedule = async (newStartTime: string) => {
    if (!rescheduleTarget) return "Error inesperado";
    try {
      await rescheduleBooking(rescheduleTarget.booking.id, newStartTime);
      setRescheduleTarget(null);
      loadAgenda(selectedDate);
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
      loadAgenda(selectedDate);
      showToast("Reserva cancelada", "success");
    } catch (e) {
      showToast(errorMessage(e, "Error al cancelar reserva"), "error");
    }
    setCancelConfirm(null);
  };

  return (
    <div className="animate-fade-in">
      {stats && stats.total === 0 && (
        <GettingStarted
          hasService={services.length > 0}
          bookingUrl={
            services[0]?.booking_slug
              ? `${window.location.origin}/book/${services[0].booking_slug}`
              : undefined
          }
        />
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

      {/* Estadisticas abajo: agendar es la accion principal, no los numeros */}
      <div className="mt-10">
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
      </div>

      {showBookingForm && (
        <Modal
          sheet
          open
          title="Agendar hora"
          onClose={() => { setShowBookingForm(false); setSelectedSlot(null); }}
        >
          <QuickBookingForm
            serviceName={selectedSlot?.serviceName ?? "Nueva cita"}
            timeLabel={
              selectedSlot
                ? new Date(selectedSlot.slot.start).toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : ""
            }
            slots={selectedSlot ? undefined : freeSlots}
            initialSlotValue={selectedSlot?.slot.start}
            onSubmit={handleConfirmBooking}
          />
        </Modal>
      )}

      {showPopover && selectedBooking && (
        <div className="mt-4 animate-slide-up">
          <BookingPopover
            booking={selectedBooking.booking}
            serviceName={selectedBooking.serviceName}
            onStatusChange={handleStatusChange}
            onReschedule={handleReschedule}
            onCancel={handleCancelBooking}
            onClose={() => { setShowPopover(false); setSelectedBooking(null); }}
          />
        </div>
      )}

      {rescheduleTarget && (
        <RescheduleModal
          booking={rescheduleTarget.booking}
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

      {/* Accion principal siempre visible: agendar la hora del paciente que llama */}
      <button
        onClick={() => { setSelectedSlot(null); setShowBookingForm(true); }}
        disabled={freeSlots.length === 0}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-accent px-5 py-3.5 text-sm font-medium text-accent-text shadow-lg transition-colors hover:bg-accent-hover disabled:opacity-40 md:bottom-6 md:right-6"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Agendar hora
      </button>
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
