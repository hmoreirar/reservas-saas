import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { runMigrations } from '../migrations/run.js';
import { logger } from '../utils/logger.js';
import { userRepository } from '../repositories/userRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { serviceHoursRepository } from '../repositories/serviceHoursRepository.js';
import { serviceBreaksRepository } from '../repositories/serviceBreaksRepository.js';
import { bookingRepository } from '../repositories/bookingRepository.js';
import { bookingService } from '../services/bookingService.js';
import { instantToServiceDate } from '../utils/datetime.js';
import type { Service } from '../types/index.js';

// Seed idempotente para el demo publico. Correr con SEED_DEMO=true.
// Crea un proveedor demo, servicios con horarios/descansos y reservas
// en distintos estados para que el dashboard se vea vivo.

const DEMO_USER = {
  name: 'Demo Proveedor',
  email: 'demo@reservas-saas.dev',
  password: 'demo1234',
};

const DEMO_SERVICES = [
  {
    name: 'Corte de pelo',
    description: 'Corte clasico con lavado incluido.',
    duration: 30,
    price: 15000,
    slug: 'corte-demo',
    booking_slug: 'corte-demo-book',
    max_capacity: 1,
    start_hour: 9,
    end_hour: 18,
  },
  {
    name: 'Consulta online',
    description: 'Sesion por videollamada de 45 minutos.',
    duration: 45,
    price: 25000,
    slug: 'consulta-demo',
    booking_slug: 'consulta-demo-book',
    max_capacity: 2,
    start_hour: 10,
    end_hour: 19,
  },
  {
    name: 'Clase grupal',
    description: 'Clase presencial en grupo reducido.',
    duration: 60,
    price: 10000,
    slug: 'clase-demo',
    booking_slug: 'clase-demo-book',
    max_capacity: 4,
    start_hour: 9,
    end_hour: 13,
  },
];

const DEMO_CLIENTS = [
  { name: 'Ana Torres', email: 'ana@example.com' },
  { name: 'Luis Rojas', email: 'luis@example.com' },
  { name: 'Maria Diaz', email: 'maria@example.com' },
  { name: 'Pedro Soto', email: 'pedro@example.com' },
];

function dateOnlyDaysFromNow(days: number): string {
  return instantToServiceDate(new Date(Date.now() + days * 24 * 60 * 60 * 1000), 'America/Santiago');
}

async function ensureUser(): Promise<number> {
  const existing = await userRepository.findByEmail(DEMO_USER.email);
  if (existing) return existing.id;
  const hashed = await bcrypt.hash(DEMO_USER.password, 10);
  const user = await userRepository.create(DEMO_USER.name, DEMO_USER.email, hashed);
  logger.info({ email: DEMO_USER.email }, 'Usuario demo creado');
  return user.id;
}

async function ensureService(userId: number, seed: (typeof DEMO_SERVICES)[number]): Promise<Service> {
  const existing = await serviceRepository.findBySlug(seed.slug);
  if (existing) return existing;

  return serviceRepository.create({
    user_id: userId,
    name: seed.name,
    description: seed.description,
    duration: seed.duration,
    price: seed.price,
    slug: seed.slug,
    booking_slug: seed.booking_slug,
    timezone: 'America/Santiago',
    start_hour: seed.start_hour,
    end_hour: seed.end_hour,
    max_capacity: seed.max_capacity,
    service_type: 'standard',
    is_package: false,
    allow_multiple: false,
  });
}

async function ensureHours(service: Service): Promise<void> {
  const existing = await serviceHoursRepository.findByService(service.id);
  if (existing.length > 0) return;

  const hours = [];
  for (let day = 0; day <= 6; day++) {
    hours.push({
      day_of_week: day,
      start_hour: service.start_hour,
      end_hour: service.end_hour,
      is_active: day >= 1 && day <= 5,
    });
  }
  await serviceHoursRepository.replaceAll(service.id, hours);
}

async function ensureBreaks(service: Service): Promise<void> {
  const existing = await serviceBreaksRepository.findByService(service.id);
  if (existing.length > 0) return;

  await serviceBreaksRepository.create({
    service_id: service.id,
    name: 'Almuerzo',
    date: dateOnlyDaysFromNow(7),
    start_time: '13:00',
    end_time: '14:00',
    is_recurring: true,
  });
}

async function ensureBookings(userId: number, service: Service): Promise<void> {
  const existing = await bookingRepository.findByServiceUser(service.id, userId);
  if (existing.length > 0) return;

  // Mezcla de pasado y futuro para que el dashboard se vea vivo:
  // historial (grafico de ultimos 7 dias, revenue) + agenda futura.
  const targets = [
    { days: -6, status: "completed" },
    { days: -4, status: "completed" },
    { days: -3, status: "cancelled" },
    { days: -2, status: "completed" },
    { days: -1, status: "no-show" },
    { days: 1, status: "confirmed" },
    { days: 2, status: "confirmed" },
    { days: 3, status: "pending" },
    { days: 5, status: "cancelled" },
  ];

  let clientIndex = 0;
  for (const target of targets) {
    const date = dateOnlyDaysFromNow(target.days);
    const slots = await bookingService.getAvailability(service.id, date);
    if (slots.length === 0) continue;

    const slot = slots[0];
    const client = DEMO_CLIENTS[clientIndex % DEMO_CLIENTS.length];
    clientIndex += 1;

    const booking = await bookingRepository.createIfAvailable({
      service_id: service.id,
      client_name: client.name,
      client_email: client.email,
      start_time: new Date(slot.start),
      end_time: new Date(slot.end),
      notes: target.status === "pending" ? 'Reserva creada desde el enlace publico.' : null,
      price: service.price,
      status: target.status,
      max_capacity: service.max_capacity ?? 1,
    });

    if (booking) {
      logger.info({ bookingId: booking.id, status: target.status, service: service.name }, 'Reserva demo creada');
    }
  }
}

async function main(): Promise<void> {
  if (process.env.SEED_DEMO !== 'true') {
    logger.info('Seed demo deshabilitado. Correr con SEED_DEMO=true');
    return;
  }

  await runMigrations();
  const userId = await ensureUser();

  for (const seed of DEMO_SERVICES) {
    const service = await ensureService(userId, seed);
    await ensureHours(service);
    await ensureBreaks(service);
    await ensureBookings(userId, service);
    logger.info({ service: service.name, booking_slug: service.booking_slug }, 'Servicio demo listo');
  }

  logger.info({ email: DEMO_USER.email, password: DEMO_USER.password }, 'Seed demo completado');
}

main()
  .then(() => pool.end())
  .catch(async (err) => {
    logger.error({ err }, 'Error en seed demo');
    await pool.end();
    process.exit(1);
  });
