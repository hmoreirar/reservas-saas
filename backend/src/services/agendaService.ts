import { DateTime } from 'luxon';
import { bookingRepository } from '../repositories/bookingRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { serviceHoursRepository } from '../repositories/serviceHoursRepository.js';
import { serviceBreaksRepository } from '../repositories/serviceBreaksRepository.js';
import { NotFoundError, ForbiddenError } from '../errors/AppError.js';
import { serviceTimeZone, dayStart, dayUtcRange, serviceDayOfWeek, timeParts, toUtcIso } from '../utils/datetime.js';
import type { TimelineSlot, DayAgenda, WeekDayOverview, WeekAgenda, Booking } from '../types/index.js';

function generateSlots(
  date: string,
  timezone: string,
  startHour: number,
  endHour: number,
  duration: number,
  maxCapacity: number,
  breaks: { start_time: string; end_time: string; name: string }[],
  bookings: { id: number; start_time: Date; end_time: Date; status?: string }[]
): TimelineSlot[] {
  const slots: TimelineSlot[] = [];
  const now = DateTime.now();
  const day = dayStart(date, timezone);
  let current = day.set({ hour: startHour, minute: 0 });
  const endDay = day.set({ hour: endHour, minute: 0 });

  while (current < endDay) {
    const slotStart = current;
    const slotEnd = current.plus({ minutes: duration });

    if (slotEnd > endDay) break;

    const isPast = slotStart < now;

    const matchingBreak = breaks.find((b) => {
      const bs = timeParts(b.start_time);
      const be = timeParts(b.end_time);
      const breakStart = day.set({ hour: bs.hour, minute: bs.minute });
      const breakEnd = day.set({ hour: be.hour, minute: be.minute });
      return slotStart < breakEnd && slotEnd > breakStart;
    });

    const startIso = toUtcIso(slotStart);
    const endIso = toUtcIso(slotEnd);

    if (matchingBreak) {
      if (!isPast) {
        slots.push({
          time: slotStart.toFormat('HH:mm'),
          start: startIso,
          end: endIso,
          type: 'blocked',
          break: { name: matchingBreak.name, start_time: matchingBreak.start_time, end_time: matchingBreak.end_time },
          capacity_used: 0,
          capacity_max: maxCapacity,
        });
      }
      current = current.plus({ minutes: duration });
      continue;
    }

    if (isPast) {
      slots.push({
        time: slotStart.toFormat('HH:mm'),
        start: startIso,
        end: endIso,
        type: 'past',
        capacity_used: 0,
        capacity_max: maxCapacity,
      });
      current = current.plus({ minutes: duration });
      continue;
    }

    const slotStartDate = slotStart.toJSDate();
    const slotEndDate = slotEnd.toJSDate();

    const overlappingBookings = bookings.filter((b) => {
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);
      return slotStartDate < bEnd && slotEndDate > bStart;
    });

    if (overlappingBookings.length > 0) {
      if (overlappingBookings.length >= maxCapacity) {
        for (const b of overlappingBookings) {
          const bookingStart = new Date(b.start_time);
          const bookingEnd = new Date(b.end_time);
          if (bookingStart >= slotStartDate && bookingEnd <= slotEndDate) {
            slots.push({
              time: slotStart.toFormat('HH:mm'),
              start: startIso,
              end: endIso,
              type: 'booked',
              booking: b as unknown as Booking,
              capacity_used: overlappingBookings.length,
              capacity_max: maxCapacity,
            });
          }
        }
      } else {
        slots.push({
          time: slotStart.toFormat('HH:mm'),
          start: startIso,
          end: endIso,
          type: 'available',
          booking: undefined,
          capacity_used: overlappingBookings.length,
          capacity_max: maxCapacity,
        });
      }
    } else {
      slots.push({
        time: slotStart.toFormat('HH:mm'),
        start: startIso,
        end: endIso,
        type: 'available',
        capacity_used: 0,
        capacity_max: maxCapacity,
      });
    }

    current = current.plus({ minutes: duration });
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

      const timezone = serviceTimeZone(service);
      const dayOfWeek = serviceDayOfWeek(date, timezone);
      const duration = service.duration || 30;

      let startHour = service.start_hour ?? 9;
      let endHour = service.end_hour ?? 18;

      const { start: rangeStart, end: rangeEnd } = dayUtcRange(date, timezone);
      const [customHours, breaks, bookings] = await Promise.all([
        serviceHoursRepository.findByService(service.id),
        serviceBreaksRepository.findByServiceAndDate(service.id, date),
        bookingRepository.findBookingsInRange(service.id, rangeStart, rangeEnd),
      ]);

      const dayHours = customHours.find((h: { day_of_week: number }) => h.day_of_week === dayOfWeek);
      if (dayHours) {
        if (!dayHours.is_active) continue;
        startHour = dayHours.start_hour;
        endHour = dayHours.end_hour;
      }

      const maxCapacity = service.max_capacity ?? 1;

      const slots = generateSlots(
        date,
        timezone,
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

    const agendas: WeekAgenda[] = [];

    for (const service of services) {
      if (!service) continue;

      const timezone = serviceTimeZone(service);
      const base = dayStart(startDate, timezone);
      const weekDays = Array.from({ length: 7 }, (_, i) =>
        base.plus({ days: i }).toFormat('yyyy-MM-dd')
      );

      const days: WeekDayOverview[] = [];

      for (const dateStr of weekDays) {
        const dayOfWeek = serviceDayOfWeek(dateStr, timezone);
        const duration = service.duration || 30;

        let startHour = service.start_hour ?? 9;
        let endHour = service.end_hour ?? 18;

        const { start: rangeStart, end: rangeEnd } = dayUtcRange(dateStr, timezone);
        const [customHours, breaks, bookings] = await Promise.all([
          serviceHoursRepository.findByService(service.id),
          serviceBreaksRepository.findByServiceAndDate(service.id, dateStr),
          bookingRepository.findBookingsInRange(service.id, rangeStart, rangeEnd),
        ]);

        const dayHours = customHours.find((h: { day_of_week: number }) => h.day_of_week === dayOfWeek);
        if (dayHours) {
          if (!dayHours.is_active) {
            days.push({
              date: dateStr,
              day_of_week: dayOfWeek,
              label: dayStart(dateStr, timezone).toFormat('EEE'),
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

        const maxCapacity = service.max_capacity ?? 1;
        const totalMinutes = (endHour - startHour) * 60;
        const totalSlots = Math.floor(totalMinutes / duration);

        const now = DateTime.now();
        const day = dayStart(dateStr, timezone);
        let pastCount = 0;
        let blockedCount = 0;

        for (let i = 0; i < totalSlots; i++) {
          const slotStart = day.set({ hour: startHour, minute: 0 }).plus({ minutes: i * duration });
          const slotEnd = slotStart.plus({ minutes: duration });

          if (slotEnd > day.set({ hour: endHour, minute: 0 })) break;

          if (slotStart < now) {
            pastCount++;
            continue;
          }

          const matchingBreak = breaks.some((b: { start_time: string; end_time: string }) => {
            const bs = timeParts(b.start_time);
            const be = timeParts(b.end_time);
            const breakStart = day.set({ hour: bs.hour, minute: bs.minute });
            const breakEnd = day.set({ hour: be.hour, minute: be.minute });
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
          label: dayStart(dateStr, timezone).toFormat('EEE'),
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
