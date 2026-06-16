import { bookingRepository } from '../repositories/bookingRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../errors/AppError.js';
import { TimeSlot, BookingStats } from '../types/index.js';
import {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendProviderNotification,
} from '../utils/emailService.js';
import { integrationService } from './integrationService.js';

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

    const start = new Date(data.start_time);
    const duration = service.duration || 30;
    const end = new Date(start.getTime() + duration * 60000);

    const hasConflict = await bookingRepository.findConflicts(data.service_id, start, end);
    if (hasConflict) {
      throw new ConflictError('Horario no disponible');
    }

    const booking = await bookingRepository.create({
      service_id: data.service_id,
      client_name: data.client_name,
      client_email: data.client_email,
      start_time: start,
      end_time: end,
      notes: data.notes ?? null,
    });

    const user = await serviceRepository.findUserByServiceId(data.service_id);
    if (user) {
      const userResult = await import('../repositories/userRepository.js').then(
        (m) => m.userRepository.findById(user.user_id)
      );
      if (userResult) {
        try {
          await sendBookingConfirmation(
            booking,
            { name: service.name, duration: service.duration, price: service.price },
            data.client_email,
            data.client_name
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
    }

    try {
      await integrationService.onBookingCreated(booking, service);
    } catch (_integrationErr) {
      // integraciones son opcionales
    }

    return booking;
  },

  async createPublic(data: {
    service_id: number | string;
    client_name: string;
    client_email: string;
    start_time: string;
    notes?: string;
  }) {
    const service = await serviceRepository.findById(
      typeof data.service_id === 'string' ? 0 : data.service_id
    );

    let serviceRecord;
    if (!service) {
      serviceRecord = await serviceRepository.findBySlug(String(data.service_id));
    } else {
      serviceRecord = service;
    }

    if (!serviceRecord) throw new NotFoundError('Servicio no encontrado');

    const start = new Date(data.start_time);
    const duration = serviceRecord.duration || 30;
    const end = new Date(start.getTime() + duration * 60000);

    const hasConflict = await bookingRepository.findConflicts(
      serviceRecord.id,
      start,
      end
    );
    if (hasConflict) {
      throw new ConflictError('Horario no disponible');
    }

    const booking = await bookingRepository.create({
      service_id: serviceRecord.id,
      client_name: data.client_name,
      client_email: data.client_email,
      start_time: start,
      end_time: end,
      notes: data.notes ?? null,
    });

    const userResult = await import('../repositories/userRepository.js').then((m) =>
      m.userRepository.findById(serviceRecord.user_id)
    );
    if (userResult) {
      try {
        await sendBookingConfirmation(
          booking,
          { name: serviceRecord.name, duration: serviceRecord.duration, price: serviceRecord.price },
          data.client_email,
          data.client_name
        );
        await sendProviderNotification(
          userResult.email,
          userResult.name,
          booking,
          serviceRecord
        );
      } catch (_emailErr) {
        // email es opcional
      }
    }

    try {
      await integrationService.onBookingCreated(booking, serviceRecord);
    } catch (_integrationErr) {
      // integraciones son opcionales
    }

    return { booking, service: serviceRecord };
  },

  async getAvailability(serviceId: number, date: string) {
    const service = await serviceRepository.findById(serviceId);
    if (!service) throw new NotFoundError('Servicio no encontrado');

    const duration = service.duration || 30;
    const startHour = service.start_hour || 9;
    const endHour = service.end_hour || 18;

    const slots: TimeSlot[] = [];
    const current = new Date(`${date}T${String(startHour).padStart(2, '0')}:00:00`);
    const endDay = new Date(`${date}T${String(endHour).padStart(2, '0')}:00:00`);

    while (current < endDay) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + duration * 60000);
      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
      });
      current.setMinutes(current.getMinutes() + duration);
    }

    const bookings = await bookingRepository.findBookingsForDate(serviceId, date);
    return slots.filter((slot) => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      return !bookings.some((b) => {
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

  async getMyBookings(userId: number) {
    return bookingRepository.findUpcomingByUser(userId);
  },

  async getStats(userId: number): Promise<BookingStats> {
    const [counts, byService, last7Days, upcoming] = await Promise.all([
      bookingRepository.getStatsByUser(userId),
      bookingRepository.getByServiceStats(userId),
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
    } catch (_emailErr) {
      // email es opcional
    }

    try {
      await integrationService.onBookingCancelled(booking);
    } catch (_integrationErr) {
      // integraciones son opcionales
    }

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
