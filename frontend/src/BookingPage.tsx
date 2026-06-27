import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { getServiceBySlug, getPublicAvailability, createPublicBooking } from "./api/api";
import { useWeekOffset } from "./hooks/useWeekOffset";
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
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [wizardActive, setWizardActive] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const { weekOffset, prevWeek, nextWeek } = useWeekOffset();

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        const data = await getServiceBySlug(slug);
        if ("id" in data) {
          setService(data);
        } else {
          setError("Servicio no encontrado");
        }
      } catch {
        setError("Error al cargar servicio");
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
    const load = async () => {
      const data = await getPublicAvailability(service.id, selectedDate);
      if (Array.isArray(data)) {
        setAvailableSlots(data);
      }
      setSlotsLoading(false);
    };
    load();
  }, [selectedDate, service]);

  const handleConfirmBooking = useCallback(
    async (name: string, email: string, notes: string) => {
      if (!service || !selectedSlot) return "Error inesperado";
      const data = await createPublicBooking(service.id, name, email, selectedSlot.start, notes);
      if (data.booking?.id) {
        setBookingSuccess(true);
        setWizardActive(false);
        setClientEmail(email);
        return null;
      }
      return data.error || "Error al crear reserva";
    },
    [service, selectedSlot]
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
    return <BookingSuccess service={service} clientEmail={clientEmail} isPending />;
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
        {service && "provider_name" in service && (
          <p className="mt-2 text-sm opacity-80">
            Provider: {(service as Record<string, unknown>).provider_name as string}
          </p>
        )}
      </div>

      <div className="mx-auto w-full max-w-[1100px] px-4 py-6 md:px-6 md:py-10">
        {wizardActive ? (
          <BookingWizard
            service={service}
            slot={selectedSlot}
            date={selectedDate}
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
              <p className="mb-4 text-sm capitalize text-text-secondary">
                {formattedDate}
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
                  <p className="text-sm text-text-muted">
                    No hay horarios disponibles para esta fecha.
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Prueba seleccionar otro dia en el calendario.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex max-h-[400px] flex-col gap-2 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const key = typeof slot.start === "string" ? slot.start : new Date(slot.start).toISOString();
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedSlot(slot)}
                          disabled={!isFutureOrToday(selectedDate)}
                          className={`cursor-pointer rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-all ${
                            selectedSlot?.start === slot.start
                              ? "border-accent bg-accent text-accent-text"
                              : "border-border text-text hover:border-accent hover:text-accent"
                          } disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          {new Date(slot.start).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
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
