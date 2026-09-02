import { serviceBreaksRepository } from '../repositories/serviceBreaksRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { serviceHoursRepository } from '../repositories/serviceHoursRepository.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../errors/AppError.js';

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export const serviceBreaksService = {
  async getByService(serviceId: number, userId: number) {
    const owner = await serviceRepository.findUserByServiceId(serviceId);
    if (!owner) throw new NotFoundError('Servicio no encontrado');
    if (owner.user_id !== userId) throw new ForbiddenError('No tienes permiso');
    return serviceBreaksRepository.findByService(serviceId);
  },

  async create(
    serviceId: number,
    userId: number,
    data: { name?: string; date: string; start_time: string; end_time: string; is_recurring?: boolean }
  ) {
    const owner = await serviceRepository.findUserByServiceId(serviceId);
    if (!owner) throw new NotFoundError('Servicio no encontrado');
    if (owner.user_id !== userId) throw new ForbiddenError('No tienes permiso');

    const service = await serviceRepository.findById(serviceId);
    if (!service) throw new NotFoundError('Servicio no encontrado');

    const dayOfWeek = new Date(data.date).getDay();
    const customHours = await serviceHoursRepository.findByService(serviceId);
    const day = customHours.find((h) => h.day_of_week === dayOfWeek);

    if (!day || day.is_active) {
      const startHour = day ? day.start_hour : service.start_hour ?? 9;
      const endHour = day ? day.end_hour : service.end_hour ?? 18;
      const startM = toMinutes(data.start_time);
      const endM = toMinutes(data.end_time);
      if (startM < startHour * 60 || endM > endHour * 60) {
        throw new ValidationError('El descanso debe estar dentro del horario del servicio');
      }
    }

    return serviceBreaksRepository.create({
      service_id: serviceId,
      ...data,
    });
  },

  async delete(breakId: number, userId: number) {
    const item = await serviceBreaksRepository.findWithOwner(breakId);
    if (!item) throw new NotFoundError('Break no encontrado');
    if (item.user_id !== userId) throw new ForbiddenError('No tienes permiso');

    await serviceBreaksRepository.delete(breakId);
  },
};
