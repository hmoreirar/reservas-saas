import { staffRepository } from '../repositories/staffRepository.js';
import { bookingRepository } from '../repositories/bookingRepository.js';
import { NotFoundError, ForbiddenError } from '../errors/AppError.js';

export const staffService = {
  async getAll(userId: number) {
    return staffRepository.findAllByUser(userId);
  },

  async create(userId: number, data: { name: string; email: string; role?: string }) {
    return staffRepository.create({
      user_id: userId,
      name: data.name,
      email: data.email,
      role: data.role ?? 'staff',
    });
  },

  async update(id: number, userId: number, data: { name?: string; email?: string; role?: string }) {
    const check = await staffRepository.findById(id);
    if (!check) throw new NotFoundError('Staff no encontrado');
    if (check.user_id !== userId) throw new ForbiddenError('No tienes permiso');

    const updated = await staffRepository.update(id, data);
    if (!updated) throw new NotFoundError('Error al actualizar');
    return updated;
  },

  async delete(id: number, userId: number) {
    const check = await staffRepository.findById(id);
    if (!check) throw new NotFoundError('Staff no encontrado');
    if (check.user_id !== userId) throw new ForbiddenError('No tienes permiso');

    await staffRepository.delete(id);
  },

  async assignToBooking(bookingId: number, staffId: number, userId: number) {
    const booking = await bookingRepository.findWithService(bookingId);
    if (!booking) throw new NotFoundError('Reserva no encontrada');
    if (booking.user_id !== userId) throw new ForbiddenError('No tienes permiso');

    const staff = await staffRepository.findById(staffId);
    if (!staff) throw new NotFoundError('Staff no encontrado');
    if (staff.user_id !== userId) throw new ForbiddenError('No tienes permiso');

    await bookingRepository.assignStaff(bookingId, staffId);
    return { message: 'Reserva asignada a staff' };
  },
};
