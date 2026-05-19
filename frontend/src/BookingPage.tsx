import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { getServiceBySlug, getPublicAvailability, createPublicBooking } from "./api/api";
import { getWeekDays } from "./hooks/useWeekDays";
import { useWeekOffset } from "./hooks/useWeekOffset";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import BookingSuccess from "./components/BookingSuccess";
import PublicBookingModal from "./components/PublicBookingModal";
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
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showModal, setShowModal] = useState(false);
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
    const load = async () => {
      const data = await getPublicAvailability(service.id, selectedDate);
      if (Array.isArray(data)) {
        setAvailableSlots(data);
      }
    };
    load();
  }, [selectedDate, service]);

  const handleConfirmBooking = useCallback(
    async (name: string, email: string, notes: string) => {
      if (!service || !selectedSlot) return "Error inesperado";
      const data = await createPublicBooking(service.id, name, email, selectedSlot.start, notes);
      if (data.booking?.id) {
        setBookingSuccess(true);
        setShowModal(false);
        setClientEmail(email);
        return null;
      }
      return data.error || "Error al crear reserva";
    },
    [service, selectedSlot]
  );

  const weekDays = getWeekDays(selectedDate, weekOffset);

  const todayStr = new Date().toISOString().split("T")[0];

  if (loading) return <LoadingSpinner />;

  if (error && !service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 font-sans">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">{error}</h1>
          <p className="mt-2 text-stone-500">El enlace puede haber expirado o ser inválido.</p>
        </div>
      </div>
    );
  }

  if (bookingSuccess && service) {
    return <BookingSuccess service={service} clientEmail={clientEmail} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-8 text-center text-white md:px-10 md:py-10">
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

      <div className="mx-auto w-full max-w-[900px] px-4 py-6 md:px-5 md:py-10">
        <div className="rounded-xl border border-stone-100 bg-white p-4 shadow-sm md:p-8">
          <h2 className="m-0 mb-5 text-lg font-semibold text-stone-800">
            Selecciona fecha y hora
          </h2>

          <div className="mb-5 flex items-center gap-3">
            <button
              onClick={prevWeek}
              className="cursor-pointer rounded-md bg-stone-100 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-200"
            >
              &larr; Sem. anterior
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-md border border-stone-300 px-3 py-2 text-sm"
            />
            <button
              onClick={nextWeek}
              className="cursor-pointer rounded-md bg-stone-100 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-200"
            >
              Sem. siguiente &rarr;
            </button>
          </div>

          <div className="mb-8 grid grid-cols-7 gap-3">
            {weekDays.map((day, i) => {
              const dateStr = day.toISOString().split("T")[0];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`cursor-pointer rounded-lg px-3 py-4 text-center transition-all ${
                    isSelected
                      ? "border-2 border-amber-500 bg-amber-50"
                      : isToday
                        ? "border-2 border-transparent bg-red-50"
                        : "border-2 border-transparent bg-stone-50 hover:bg-stone-100"
                  }`}
                >
                  <div className="text-xs capitalize text-stone-500">
                    {day.toLocaleDateString("es-ES", { weekday: "short" })}
                  </div>
                  <div
                    className={`text-lg ${
                      isToday ? "font-bold text-red-500" : "text-stone-800"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          <h3 className="mb-3 text-base font-semibold text-stone-800">Horarios disponibles</h3>
          {availableSlots.length === 0 ? (
            <p className="text-sm text-stone-500">No hay horarios disponibles para esta fecha</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {availableSlots.map((slot, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedSlot(slot);
                    setShowModal(true);
                  }}
                  className="cursor-pointer rounded-lg bg-amber-500 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-amber-600"
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

      <PublicBookingModal
        open={showModal}
        onClose={() => setShowModal(false)}
        service={service}
        slot={selectedSlot}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}
