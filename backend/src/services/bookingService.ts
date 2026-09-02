import { bookingRepository } from '../repositories/bookingRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { serviceHoursRepository } from '../repositories/serviceHoursRepository.js';
import { serviceBreaksRepository } from '../repositories/serviceBreaksRepository.js';
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '../errors/AppError.js';
import type { Booking, BookingStats, BookingStatusAction } from '../types/index.js';
import type { Service } from '../types/index.js';
import {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingConfirmed,
  sendBookingDeclined,
  sendProviderNotification,
} from '../utils/emailService.js';
import { integrationService } from './integrationService.js';
import { serviceTimeZone, dayStart, dayUtcRange, serviceDayOfWeek, timeParts, toUtcIso, instantToServiceDate } from '../utils/datetime.js';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled', 'no-show'],
};

async function findServiceByIdOrSlug(serviceId: number | string): Promise<Service> {
  if (typeof serviceId === 'number' || !isNaN(Number(serviceId))) {
    const service = await serviceRepository.findById(Number(serviceId));
    if (service) return service;
  }
  const service = await serviceRepository.findBySlug(String(serviceId));
  if (!service) throw new NotFoundError('Servicio no encontrado');
  return service;
}

async function createBookingRecord(data: {
  service: Service;
  client_name: string;
  client_email: string;
  start_time: string;
  notes?: string;
  status?: string;
}) {
  const start = new Date(data.start_time);
  if (Number.isNaN(start.getTime()) || start <= new Date()) {
    throw new ValidationError('La fecha de la reserva debe ser valida y futura');
  }
  const duration = data.service.duration || 30;
  const end = new Date(start.getTime() + duration * 60000);

  const date = instantToServiceDate(start, serviceTimeZone(data.service));
  const availableSlots = await bookingService.getAvailability(data.service.id, date);
  const isAvailableSlot = availableSlots.some((slot) => new Date(slot.start).getTime() === start.getTime());
  if (!isAvailableSlot) {
    throw new ConflictError('Horario no disponible');
  }

  const maxCapacity = data.service.max_capacity ?? 1;
  const booking = await bookingRepository.createIfAvailable({
    service_id: data.service.id,
    client_name: data.client_name,
    client_email: data.client_email,
    start_time: start,
    end_time: end,
    notes: data.notes ?? null,
    price: data.service.price,
    status: data.status ?? 'confirmed',
    max_capacity: maxCapacity,
  });
  if (!booking) {
    throw new ConflictError('Horario no disponible');
  }

  return { booking, service: data.service, start, end };
}

async function sendBookingNotifications(
  booking: Booking,
  service: Service,
  clientEmail: string,
  clientName: string
) {
  const userResult = await userRepository.findById(service.user_id);
  if (userResult) {
    try {
      await sendBookingConfirmation(
        booking,
        { name: service.name, duration: service.duration, price: service.price },
        clientEmail,
        clientName
      );
      await sendProviderNotification(
        userResult.email,
        userResult.name,
        booking,
        service
      );
    } catch (_emailErr) {
      // email es opcional
    }
  }

  try {
    await integrationService.onBookingCreated(booking, service);
  } catch (_integrationErr) {
    // integraciones son opcionales
  }
}

export const bookingService = {
  async create(
    userId: number,
    data: {
      service_id: number;
      client_name: string;
      client_email: string;
      start_time: string;
      notes?: string;
    }
  ) {
    const owner = await serviceRepository.findUserByServiceId(data.service_id);
    if (!owner) throw new NotFoundError('Servicio no encontrado');
    if (owner.user_id !== userId)
      throw new ForbiddenError('No tienes permiso para crear reservas de este servicio');

    const service = await serviceRepository.findById(data.service_id);
    if (!service) throw new NotFoundError('Servicio no encontrado');

    const { booking } = await createBookingRecord({
      service,
      client_name: data.client_name,
      client_email: data.client_email,
      start_time: data.start_time,
      notes: data.notes,
      status: 'confirmed',
    });

    await sendBookingNotifications(booking, service, data.client_email, data.client_name);

    return booking;
  },

  async createPublic(data: {
    service_id: number | string;
    client_name: string;
    client_email: string;
    start_time: string;
    notes?: string;
  }) {
    const service = await findServiceByIdOrSlug(data.service_id);

    const { booking } = await createBookingRecord({
      service,
      client_name: data.client_name,
      client_email: data.client_email,
      start_time: data.start_time,
      notes: data.notes,
      status: 'pending',
    });

    await sendBookingNotifications(booking, service, data.client_email, data.client_name);

    return { booking, service };
  },

  async updateStatus(id: number, userId: number, action: BookingStatusAction, reason?: string) {
    const booking = await bookingRepository.findWithService(id);
    if (!booking) throw new NotFoundError('Reserva no encontrada');
    if (booking.user_id !== userId) throw new ForbiddenError('No tienes permiso');

    const validNext = VALID_TRANSITIONS[booking.status];
    if (!validNext || !validNext.includes(action === 'declined' ? 'cancelled' : action)) {
      throw new ConflictError(`No se puede cambiar el estado de ${booking.status} a ${action}`);
    }

    const targetStatus = action === 'declined' ? 'cancelled' : action;

    if (reason) {
      await bookingRepository.updateStatusWithReason(id, targetStatus, reason);
    } else {
      await bookingRepository.updateStatus(id, targetStatus);
    }

    const service = await serviceRepository.findById(booking.service_id);

    if (action === 'confirmed' && service) {
      try {
        await sendBookingConfirmed(
          booking,
          { name: service.name, duration: service.duration, price: service.price },
          booking.client_email,
          booking.client_name
        );
      } catch (_emailErr) {}
    }

    if (action === 'declined' && service) {
      try {
        await sendBookingDeclined(
          booking,
          { name: service.name },
          booking.client_email,
          booking.client_name,
          reason
        );
      } catch (_emailErr) {}
    }

    if (action === 'cancelled' || action === 'declined') {
      try {
        await integrationService.onBookingCancelled(booking);
      } catch (_integrationErr) {}
    }

    return { message: `Reserva ${action === 'declined' ? 'rechazada' : action === 'confirmed' ? 'confirmada' : action === 'cancelled' ? 'cancelada' : action === 'completed' ? 'completada' : 'marcada como no show'}` };
  },

  async getAvailability(serviceId: number, date: string, userId?: number) {
    const service = await serviceRepository.findById(serviceId);
    if (!service) throw new NotFoundError('Servicio no encontrado');
    if (userId !== undefined && service.user_id !== userId) {
      throw new ForbiddenError('No tienes permiso');
    }

    const timezone = serviceTimeZone(service);
    const dayOfWeek = serviceDayOfWeek(date, timezone);
    const duration = service.duration || 30;

    let startHour = service.start_hour ?? 9;
    let endHour = service.end_hour ?? 18;

    const { start: rangeStart, end: rangeEnd } = dayUtcRange(date, timezone);
    const [customHours, breaks, bookings] = await Promise.all([
      serviceHoursRepository.findByService(serviceId),
      serviceBreaksRepository.findByServiceAndDate(serviceId, date),
      bookingRepository.findBookingsInRange(serviceId, rangeStart, rangeEnd),
    ]);

    const dayHours = customHours.find((h: { day_of_week: number }) => h.day_of_week === dayOfWeek);

    if (dayHours) {
      if (!dayHours.is_active) return [];
      startHour = dayHours.start_hour;
      endHour = dayHours.end_hour;
    }

    const maxCapacity = service.max_capacity ?? 1;

    const slots: { start: string; end: string }[] = [];
    const day = dayStart(date, timezone);
    let current = day.set({ hour: startHour, minute: 0 });
    const endDay = day.set({ hour: endHour, minute: 0 });

    while (current < endDay) {
      const slotStart = current;
      const slotEnd = current.plus({ minutes: duration });

      if (slotEnd > endDay) break;

      const isInBreak = breaks.some((b: { start_time: string; end_time: string }) => {
        const bs = timeParts(b.start_time);
        const be = timeParts(b.end_time);
        const breakStart = day.set({ hour: bs.hour, minute: bs.minute });
        const breakEnd = day.set({ hour: be.hour, minute: be.minute });
        return slotStart < breakEnd && slotEnd > breakStart;
      });

      if (!isInBreak) {
        slots.push({
          start: toUtcIso(slotStart),
          end: toUtcIso(slotEnd),
        });
      }

      current = current.plus({ minutes: duration });
    }

    if (maxCapacity > 1) {
      return slots.filter((slot) => {
        const slotStart = new Date(slot.start);
        const slotEnd = new Date(slot.end);
        const count = bookings.filter((b: { start_time: Date; end_time: Date }) => {
          const bStart = new Date(b.start_time);
          const bEnd = new Date(b.end_time);
          return slotStart < bEnd && slotEnd > bStart;
        }).length;
        return count < maxCapacity;
      });
    }

    return slots.filter((slot) => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      return !bookings.some((b: { start_time: Date; end_time: Date }) => {
        const bookingStart = new Date(b.start_time);
        const bookingEnd = new Date(b.end_time);
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });
    });
  },

  async getBookingsByDay(serviceId: number, date: string, userId: number) {
    const owner = await serviceRepository.findUserByServiceId(serviceId);
    if (!owner || owner.user_id !== userId)
      throw new ForbiddenError('No tienes permiso');

    const service = await serviceRepository.findById(serviceId);
    if (!service) throw new NotFoundError('Servicio no encontrado');

    const { start, end } = dayUtcRange(date, serviceTimeZone(service));
    return bookingRepository.findByRange(serviceId, start, end);
  },

  async getMyBookings(
    userId: number,
    options: { page?: number; limit?: number; search?: string; status?: string } = {}
  ) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const { rows, total } = await bookingRepository.findUpcomingByUser(userId, {
      limit,
      offset,
      search: options.search,
      status: options.status,
    });

    return {
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getStats(userId: number, period?: string): Promise<BookingStats> {
    const [counts, byService, last7Days, upcoming] = await Promise.all([
      bookingRepository.getStatsByUser(userId, period),
      bookingRepository.getByServiceStats(userId, period),
      bookingRepository.getLast7Days(userId),
      bookingRepository.getUpcoming(userId),
    ]);

    return {
      ...counts,
      revenue: counts.revenue,
      byService,
      last7Days,
      upcoming,
    };
  },

  async cancel(id: number, userId: number) {
    const booking = await bookingRepository.findWithService(id);
    if (!booking) throw new NotFoundError('Reserva no encontrada');
    if (booking.user_id !== userId) throw new ForbiddenError('No tienes permiso');

    await bookingRepository.updateStatus(id, 'cancelled');

    try {
      await sendBookingCancellation(
        booking,
        { name: booking.service_name },
        booking.client_email,
        booking.client_name
      );
    } catch (_emailErr) {}

    try {
      await integrationService.onBookingCancelled(booking);
    } catch (_integrationErr) {}

    return { message: 'Reserva cancelada' };
  },

  async reschedule(id: number, newStartTime: string, userId: number) {
    const booking = await bookingRepository.findWithService(id);
    if (!booking) throw new NotFoundError('Reserva no encontrada');
    if (booking.user_id !== userId) throw new ForbiddenError('No tienes permiso');

    const start = new Date(newStartTime);
    if (Number.isNaN(start.getTime()) || start <= new Date()) {
      throw new ValidationError('La fecha de la reserva debe ser valida y futura');
    }
    const duration = booking.duration || 30;
    const end = new Date(start.getTime() + duration * 60000);

    const service = await serviceRepository.findById(booking.service_id);
    if (!service) throw new NotFoundError('Servicio no encontrado');
    const availableSlots = await bookingService.getAvailability(
      booking.service_id,
      instantToServiceDate(start, serviceTimeZone(service))
    );
    if (!availableSlots.some((slot) => new Date(slot.start).getTime() === start.getTime())) {
      throw new ConflictError('Nuevo horario no disponible');
    }

    const updated = await bookingRepository.updateTimeIfAvailable(
      id,
      booking.service_id,
      start,
      end,
      service.max_capacity ?? 1
    );
    if (!updated) {
      throw new ConflictError('Nuevo horario no disponible');
    }
    return { message: 'Reserva reprogramada', new_start: start, new_end: end };
  },
};
