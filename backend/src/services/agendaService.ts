import { bookingRepository } from '../repositories/bookingRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { serviceHoursRepository } from '../repositories/serviceHoursRepository.js';
import { serviceBreaksRepository } from '../repositories/serviceBreaksRepository.js';
import { NotFoundError, ForbiddenError } from '../errors/AppError.js';
import type { TimelineSlot, TimelineSlotType, DayAgenda, WeekDayOverview, WeekAgenda, Booking } from '../types/index.js';

function generateSlots(
  serviceId: number,
  date: string,
  startHour: number,
  endHour: number,
  duration: number,
  maxCapacity: number,
  breaks: { start_time: string; end_time: string; name: string }[],
  bookings: { id: number; start_time: Date; end_time: Date; status?: string }[]
): TimelineSlot[] {
  const slots: TimelineSlot[] = [];
  const now = new Date();
  const current = new Date(`${date}T${String(startHour).padStart(2, '0')}:00:00`);
  const endDay = new Date(`${date}T${String(endHour).padStart(2, '0')}:00:00`);

  while (current < endDay) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current.getTime() + duration * 60000);

    if (slotEnd > endDay) break;

    const isPast = slotStart < now;

    const matchingBreak = breaks.find((b) => {
      const breakStart = new Date(`${date}T${b.start_time}`);
      const breakEnd = new Date(`${date}T${b.end_time}`);
      return slotStart < breakEnd && slotEnd > breakStart;
    });

    if (matchingBreak) {
      if (!isPast) {
        slots.push({
          time: current.toTimeString().slice(0, 5),
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          type: 'blocked',
          break: { name: matchingBreak.name, start_time: matchingBreak.start_time, end_time: matchingBreak.end_time },
          capacity_used: 0,
          capacity_max: maxCapacity,
        });
      }
      current.setMinutes(current.getMinutes() + duration);
      continue;
    }

    if (isPast) {
      slots.push({
        time: current.toTimeString().slice(0, 5),
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        type: 'past',
        capacity_used: 0,
        capacity_max: maxCapacity,
      });
      current.setMinutes(current.getMinutes() + duration);
      continue;
    }

    const overlappingBookings = bookings.filter((b) => {
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);
      return slotStart < bEnd && slotEnd > bStart;
    });

    if (overlappingBookings.length > 0) {
      if (overlappingBookings.length >= maxCapacity) {
        for (const b of overlappingBookings) {
          const bookingStart = new Date(b.start_time);
          const bookingEnd = new Date(b.end_time);
          if (bookingStart >= slotStart && bookingEnd <= slotEnd) {
            slots.push({
              time: current.toTimeString().slice(0, 5),
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
              type: 'booked',
              booking: b as unknown as Booking,
              capacity_used: overlappingBookings.length,
              capacity_max: maxCapacity,
            });
          }
        }
      } else {
        slots.push({
          time: current.toTimeString().slice(0, 5),
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          type: 'available',
          booking: undefined,
          capacity_used: overlappingBookings.length,
          capacity_max: maxCapacity,
        });
      }
    } else {
      slots.push({
        time: current.toTimeString().slice(0, 5),
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        type: 'available',
        capacity_used: 0,
        capacity_max: maxCapacity,
      });
    }

    current.setMinutes(current.getMinutes() + duration);
  }

  return slots;
}

export const agendaService = {
  async getDayTimeline(
    userId: number,
    date: string,
    serviceId?: number,
    _staffId?: number
  ): Promise<DayAgenda[]> {
    const services = serviceId
      ? [await serviceRepository.findById(serviceId)].filter(
          (service): service is NonNullable<typeof service> => Boolean(service && service.user_id === userId)
        )
      : await serviceRepository.findAllByUser(userId);

    if (!services.length) throw new NotFoundError('No se encontraron servicios');

    const agendas: DayAgenda[] = [];

    for (const service of services) {
      if (!service) continue;

      const dayOfWeek = new Date(date).getDay();
      const duration = service.duration || 30;

      let startHour = service.start_hour ?? 9;
      let endHour = service.end_hour ?? 18;

      const [customHours, breaks, bookings] = await Promise.all([
        serviceHoursRepository.findByService(service.id),
        serviceBreaksRepository.findByServiceAndDate(service.id, date),
        bookingRepository.findBookingsForDate(service.id, date),
      ]);

      const dayHours = customHours.find((h: { day_of_week: number }) => h.day_of_week === dayOfWeek);
      if (dayHours) {
        if (!dayHours.is_active) continue;
        startHour = dayHours.start_hour;
        endHour = dayHours.end_hour;
      }

      const maxCapacity = (service as any).max_capacity ?? 1;

      const slots = generateSlots(
        service.id,
        date,
        startHour,
        endHour,
        duration,
        maxCapacity,
        breaks.map((b: { name: string; start_time: string; end_time: string }) => ({
          start_time: b.start_time,
          end_time: b.end_time,
          name: b.name,
        })),
        bookings
      );

      agendas.push({
        date,
        service_id: service.id,
        service_name: service.name,
        slots,
      });
    }

    return agendas;
  },

  async getWeekOverview(
    userId: number,
    startDate: string,
    serviceId?: number
  ): Promise<WeekAgenda[]> {
    const services = serviceId
      ? [await serviceRepository.findById(serviceId)].filter(
          (service): service is NonNullable<typeof service> => Boolean(service && service.user_id === userId)
        )
      : await serviceRepository.findAllByUser(userId);

    if (!services.length) throw new NotFoundError('No se encontraron servicios');

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const agendas: WeekAgenda[] = [];

    for (const service of services) {
      if (!service) continue;

      const days: WeekDayOverview[] = [];

      for (const dateStr of weekDays) {
        const dayOfWeek = new Date(dateStr).getDay();
        const duration = service.duration || 30;

        let startHour = service.start_hour ?? 9;
        let endHour = service.end_hour ?? 18;

        const [customHours, breaks, bookings] = await Promise.all([
          serviceHoursRepository.findByService(service.id),
          serviceBreaksRepository.findByServiceAndDate(service.id, dateStr),
          bookingRepository.findBookingsForDate(service.id, dateStr),
        ]);

        const dayHours = customHours.find((h: { day_of_week: number }) => h.day_of_week === dayOfWeek);
        if (dayHours) {
          if (!dayHours.is_active) {
            days.push({
              date: dateStr,
              day_of_week: dayOfWeek,
              label: new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'short' }),
              total_slots: 0,
              booked: 0,
              available: 0,
              blocked: 0,
              past: 0,
            });
            continue;
          }
          startHour = dayHours.start_hour;
          endHour = dayHours.end_hour;
        }

        const maxCapacity = (service as any).max_capacity ?? 1;
        const totalMinutes = (endHour - startHour) * 60;
        const totalSlots = Math.floor(totalMinutes / duration);

        const now = new Date();
        const current = new Date(`${dateStr}T${String(startHour).padStart(2, '0')}:00:00`);
        let pastCount = 0;
        let blockedCount = 0;

        for (let i = 0; i < totalSlots; i++) {
          const slotStart = new Date(current.getTime() + i * duration * 60000);
          const slotEnd = new Date(slotStart.getTime() + duration * 60000);

          if (slotEnd > new Date(`${dateStr}T${String(endHour).padStart(2, '0')}:00:00`)) break;

          if (slotStart < now) {
            pastCount++;
            continue;
          }

          const matchingBreak = breaks.some((b: { start_time: string; end_time: string }) => {
            const breakStart = new Date(`${dateStr}T${b.start_time}`);
            const breakEnd = new Date(`${dateStr}T${b.end_time}`);
            return slotStart < breakEnd && slotEnd > breakStart;
          });

          if (matchingBreak) {
            blockedCount++;
          }
        }

        const bookedCount = bookings.length;

        days.push({
          date: dateStr,
          day_of_week: dayOfWeek,
          label: new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'short' }),
          total_slots: totalSlots,
          booked: bookedCount,
          available: Math.max(0, totalSlots - pastCount - bookedCount - blockedCount),
          blocked: blockedCount,
          past: pastCount,
        });
      }

      agendas.push({
        start_date: startDate,
        service_id: service.id,
        service_name: service.name,
        days,
      });
    }

    return agendas;
  },
};
