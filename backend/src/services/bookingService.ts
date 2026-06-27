import { bookingRepository } from '../repositories/bookingRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { serviceHoursRepository } from '../repositories/serviceHoursRepository.js';
import { serviceBreaksRepository } from '../repositories/serviceBreaksRepository.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../errors/AppError.js';
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
  price?: number | null;
  status?: string;
}) {
  const start = new Date(data.start_time);
  const duration = data.service.duration || 30;
  const end = new Date(start.getTime() + duration * 60000);

  const hasConflict = await bookingRepository.findConflicts(data.service.id, start, end);
  if (hasConflict) {
    throw new ConflictError('Horario no disponible');
  }

  const bookingPrice = data.price ?? data.service.price;

  const booking = await bookingRepository.create({
    service_id: data.service.id,
    client_name: data.client_name,
    client_email: data.client_email,
    start_time: start,
    end_time: end,
    notes: data.notes ?? null,
    price: bookingPrice,
    status: data.status ?? 'confirmed',
  });

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
      price?: number | null;
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
      price: data.price,
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
    price?: number | null;
  }) {
    const service = await findServiceByIdOrSlug(data.service_id);

    const { booking } = await createBookingRecord({
      service,
      client_name: data.client_name,
      client_email: data.client_email,
      start_time: data.start_time,
      notes: data.notes,
      price: data.price,
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

  async getAvailability(serviceId: number, date: string) {
    const service = await serviceRepository.findById(serviceId);
    if (!service) throw new NotFoundError('Servicio no encontrado');

    const dayOfWeek = new Date(date).getDay();
    const duration = service.duration || 30;

    let startHour = service.start_hour ?? 9;
    let endHour = service.end_hour ?? 18;

    const [customHours, breaks, bookings] = await Promise.all([
      serviceHoursRepository.findByService(serviceId),
      serviceBreaksRepository.findByServiceAndDate(serviceId, date),
      bookingRepository.findBookingsForDate(serviceId, date),
    ]);

    const dayHours = customHours.find((h: { day_of_week: number }) => h.day_of_week === dayOfWeek);

    if (dayHours) {
      if (!dayHours.is_active) return [];
      startHour = dayHours.start_hour;
      endHour = dayHours.end_hour;
    }

    const maxCapacity = (service as any).max_capacity ?? 1;

    const slots: { start: string; end: string }[] = [];
    const current = new Date(`${date}T${String(startHour).padStart(2, '0')}:00:00`);
    const endDay = new Date(`${date}T${String(endHour).padStart(2, '0')}:00:00`);

    while (current < endDay) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + duration * 60000);

      if (slotEnd > endDay) break;

      const isInBreak = breaks.some((b: { start_time: string; end_time: string }) => {
        const breakStart = new Date(`${date}T${b.start_time}`);
        const breakEnd = new Date(`${date}T${b.end_time}`);
        return slotStart < breakEnd && slotEnd > breakStart;
      });

      if (!isInBreak) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
        });
      }

      current.setMinutes(current.getMinutes() + duration);
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

    return bookingRepository.findByDay(serviceId, date);
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
    const duration = booking.duration || 30;
    const end = new Date(start.getTime() + duration * 60000);

    const hasConflict = await bookingRepository.findConflicts(
      booking.service_id,
      start,
      end,
      id
    );
    if (hasConflict) {
      throw new ConflictError('Nuevo horario no disponible');
    }

    await bookingRepository.updateTime(id, start, end);
    return { message: 'Reserva reprogramada', new_start: start, new_end: end };
  },
};
