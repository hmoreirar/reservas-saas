import { serviceBreaksRepository } from '../repositories/serviceBreaksRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { NotFoundError, ForbiddenError } from '../errors/AppError.js';

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
