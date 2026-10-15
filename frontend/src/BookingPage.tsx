import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router";
import { getServiceBySlug, getPublicAvailability, createPublicBooking, errorMessage } from "./api/api";
import { useWeekOffset } from "./hooks/useWeekOffset";
import { todayDateOnly } from "@reservas/shared";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import BookingSuccess from "./components/BookingSuccess";
import BookingWizard from "./components/BookingWizard";
import DatePicker from "./components/DatePicker";
import Button from "./components/ui/Button";
import type { Service, TimeSlot } from "./types";

export default function BookingPage() {
  const { slug } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    return todayDateOnly();
  });
  const slotsAbortRef = useRef<AbortController | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [wizardActive, setWizardActive] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [bookedWhen, setBookedWhen] = useState("");
  const { weekOffset, prevWeek, nextWeek } = useWeekOffset();

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        setService(await getServiceBySlug(slug));
      } catch (e) {
        setError(errorMessage(e, "Error al cargar servicio"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  useEffect(() => {
    if (!service) return;
    setSelectedSlot(null);
    setSlotsLoading(true);
    setError("");
    // respuesta vieja no debe pisar los slots del dia nuevo
    slotsAbortRef.current?.abort();
    const ctrl = new AbortController();
    slotsAbortRef.current = ctrl;
    const load = async () => {
      try {
        const slots = await getPublicAvailability(service.id, selectedDate, ctrl.signal);
        if (!ctrl.signal.aborted) setAvailableSlots(slots);
      } catch (e) {
        if (!ctrl.signal.aborted) {
          setAvailableSlots([]);
          setError(errorMessage(e, "Error al cargar horarios"));
        }
      } finally {
        if (!ctrl.signal.aborted) setSlotsLoading(false);
      }
    };
    load();
  }, [selectedDate, service]);

  const handleConfirmBooking = useCallback(
    async (data: { name: string; phone: string; email: string; notes: string }) => {
      if (!service || !selectedSlot) return "Error inesperado";
      try {
        await createPublicBooking(
          service.id, data.name, data.phone, selectedSlot.start, data.email, data.notes
        );
        setBookedWhen(
          `${new Date(selectedDate + "T12:00:00").toLocaleDateString("es-CL", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })} a las ${new Date(selectedSlot.start).toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: service.timezone || undefined,
          })}`
        );
        setBookingSuccess(true);
        setWizardActive(false);
        setClientPhone(data.phone);
        setClientEmail(data.email);
        return null;
      } catch (e) {
        return errorMessage(e, "Error al crear la reserva");
      }
    },
    [service, selectedSlot, selectedDate]
  );

  const isFutureOrToday = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr + "T12:00:00") >= today;
  };

  if (loading) return <LoadingSpinner />;

  if (error && !service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg font-sans">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-danger">{error}</h1>
          <p className="mt-2 text-text-secondary">El enlace puede haber expirado o ser invalido.</p>
        </div>
      </div>
    );
  }

  if (bookingSuccess && service) {
    return (
      <BookingSuccess
        service={service}
        when={bookedWhen}
        clientPhone={clientPhone}
        clientEmail={clientEmail || undefined}
        isPending
      />
    );
  }

  const formattedDate = new Date(selectedDate + "T12:00:00").toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="bg-accent px-4 py-8 text-center text-accent-text md:px-10 md:py-10">
        <h1 className="m-0 text-2xl font-bold md:text-3xl">{service?.name}</h1>
        <p className="mt-2 opacity-90">
          {service?.description} &bull; ${service?.price} &bull; {service?.duration}min
        </p>
        {service?.provider_name && (
          <p className="mt-2 text-sm opacity-80">
            Proveedor: {service.provider_name}
          </p>
        )}
      </div>

      <div className="mx-auto w-full max-w-[1100px] px-4 py-6 md:px-6 md:py-10">
        {wizardActive ? (
          <BookingWizard
             service={service!}
             slot={selectedSlot!}
             date={selectedDate!}
            onBack={() => setWizardActive(false)}
            onConfirm={handleConfirmBooking}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr] md:gap-8">
            <div>
              <DatePicker
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
                weekOffset={weekOffset}
                onPrevWeek={prevWeek}
                onNextWeek={nextWeek}
              />
            </div>

            <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
              <h2 className="m-0 mb-1 text-lg font-semibold text-text">
                Horarios disponibles
              </h2>
              <p className="mb-4 text-sm text-text-secondary">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </p>

                {service?.timezone && (
                <p className="mb-4 text-xs text-text-muted">
                  Zona horaria: {service.timezone}
                </p>
              )}

              {slotsLoading ? (
                <div className="flex max-h-[400px] flex-col gap-2 overflow-y-auto pr-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-11 animate-pulse rounded-lg bg-border" />
                  ))}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="py-12 text-center">
                  <p className={`text-sm ${error ? "text-danger" : "text-text-muted"}`}>
                    {error || "No hay horarios disponibles para esta fecha."}
                  </p>
                  {!error && (
                    <p className="mt-1 text-xs text-text-muted">
                      Prueba seleccionar otro dia en el calendario.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {availableSlots.map((slot) => {
                      const key = typeof slot.start === "string" ? slot.start : new Date(slot.start).toISOString();
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedSlot(slot)}
                          disabled={!isFutureOrToday(selectedDate)}
                          className={`cursor-pointer rounded-lg border px-4 py-3 text-center text-sm font-medium transition-all ${
                            selectedSlot?.start === slot.start
                              ? "border-accent bg-accent text-accent-text"
                              : "border-border text-text hover:border-accent hover:text-accent"
                          } disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          {new Date(slot.start).toLocaleTimeString("es-CL", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: service?.timezone || undefined,
                          })}
                        </button>
                      );
                    })}
                  </div>

                  {selectedSlot && (
                    <Button
                      onClick={() => setWizardActive(true)}
                      className="mt-6 w-full"
                    >
                      Reservar
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
