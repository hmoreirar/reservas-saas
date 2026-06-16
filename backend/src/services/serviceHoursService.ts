import { serviceHoursRepository } from '../repositories/serviceHoursRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { NotFoundError, ForbiddenError } from '../errors/AppError.js';

export const serviceHoursService = {
  async getByService(serviceId: number, userId: number) {
    const owner = await serviceRepository.findUserByServiceId(serviceId);
    if (!owner) throw new NotFoundError('Servicio no encontrado');
    if (owner.user_id !== userId) throw new ForbiddenError('No tienes permiso');
    return serviceHoursRepository.findByService(serviceId);
  },

  async replaceAll(
    serviceId: number,
    userId: number,
    hours: { day_of_week: number; start_hour: number; end_hour: number; is_active: boolean }[]
  ) {
    const owner = await serviceRepository.findUserByServiceId(serviceId);
    if (!owner) throw new NotFoundError('Servicio no encontrado');
    if (owner.user_id !== userId) throw new ForbiddenError('No tienes permiso');

    const validDays = hours.filter((h) => h.day_of_week >= 0 && h.day_of_week <= 6);
    await serviceHoursRepository.replaceAll(serviceId, validDays);
    return serviceHoursRepository.findByService(serviceId);
  },

  async deleteByService(serviceId: number, userId: number) {
    const owner = await serviceRepository.findUserByServiceId(serviceId);
    if (!owner) throw new NotFoundError('Servicio no encontrado');
    if (owner.user_id !== userId) throw new ForbiddenError('No tienes permiso');
    await serviceHoursRepository.deleteByService(serviceId);
  },
};
