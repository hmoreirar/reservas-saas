import { serviceRepository } from '../repositories/serviceRepository.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../errors/AppError.js';

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

export const serviceService = {
  async create(userId: number, data: {
    name: string;
    description?: string;
    duration?: number;
    price?: number | null;
    timezone?: string;
    start_hour?: number;
    end_hour?: number;
    max_capacity?: number;
    service_type?: string;
    is_package?: boolean;
    package_services?: { service_id: number; quantity?: number }[];
    allow_multiple?: boolean;
  }) {
    const slug = generateSlug(data.name);
    const bookingSlug = `${slug}-book-${Math.random().toString(36).substring(2, 6)}`;

    const service = await serviceRepository.create({
      user_id: userId,
      name: data.name,
      description: data.description ?? null,
      duration: data.duration ?? 30,
      price: data.price ?? null,
      slug,
      booking_slug: bookingSlug,
      timezone: data.timezone ?? 'America/Santiago',
      start_hour: data.start_hour ?? 9,
      end_hour: data.end_hour ?? 18,
      max_capacity: data.max_capacity ?? 1,
      service_type: data.service_type ?? 'standard',
      is_package: data.is_package ?? false,
      allow_multiple: data.allow_multiple ?? false,
    });

    if (data.is_package && data.package_services) {
      for (const svc of data.package_services) {
        await serviceRepository.addPackageService(
          service.id,
          svc.service_id,
          svc.quantity ?? 1
        );
      }
    }

    return service;
  },

  async getAll(userId: number) {
    const services = await serviceRepository.findAllByUser(userId);
    for (const service of services) {
      if (service.is_package) {
        (service as any).package_services = await serviceRepository.getPackageServices(service.id);
      }
    }
    return services;
  },

  async getBySlug(slug: string) {
    const service = await serviceRepository.findBySlug(slug);
    if (!service) {
      throw new NotFoundError('Servicio no encontrado');
    }
    return service;
  },

  async getById(id: number) {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Servicio no encontrado');
    }
    return service;
  },

  async update(id: number, userId: number, data: {
    name?: string;
    description?: string;
    duration?: number;
    price?: number;
    timezone?: string;
    start_hour?: number;
    end_hour?: number;
  }) {
    const owner = await serviceRepository.findUserByServiceId(id);
    if (!owner) throw new NotFoundError('Servicio no encontrado');
    if (owner.user_id !== userId) throw new ForbiddenError('No tienes permiso');

    const current = await serviceRepository.findById(id);
    if (!current) throw new NotFoundError('Servicio no encontrado');

    const startHour = data.start_hour ?? current.start_hour;
    const endHour = data.end_hour ?? current.end_hour;
    if (endHour <= startHour) {
      throw new ValidationError('La hora de cierre debe ser posterior a la de inicio');
    }

    const updated = await serviceRepository.update(id, data);
    if (!updated) throw new NotFoundError('Error al actualizar');
    return updated;
  },

  async delete(id: number, userId: number) {
    const owner = await serviceRepository.findUserByServiceId(id);
    if (!owner) throw new NotFoundError('Servicio no encontrado');
    if (owner.user_id !== userId) throw new ForbiddenError('No tienes permiso');

    await serviceRepository.delete(id);
  },
};
