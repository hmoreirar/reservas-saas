import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pool from '../config/db.js';
import { runMigrations } from '../migrations/run.js';
import { bookingService } from '../services/bookingService.js';
import { serviceService } from '../services/serviceService.js';
import { authService } from '../services/authService.js';

let userId: number;
let serviceId: number;
let bookingId: number;

beforeAll(async () => {
  await runMigrations();
});

describe('Auth Flow', () => {
  it('deberia registrar un usuario', async () => {
    const user = await authService.register(
      `Test User ${Date.now()}`,
      `test${Date.now()}@example.com`,
      'password123'
    );
    userId = user.id;
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect((user as any).password).toBeUndefined();
  });

  it('deberia hacer login', async () => {
    const userData = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const result = await authService.login(userData.rows[0].email, 'password123');
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
  });

  it('deberia rechazar login con credenciales invalidas', async () => {
    await expect(
      authService.login('naipes@example.com', 'wrong')
    ).rejects.toThrow('Credenciales invalidas');
  });
});

describe('Service Flow', () => {
  it('deberia crear un servicio', async () => {
    const service = await serviceService.create(userId, {
      name: 'Test Service',
      duration: 45,
      price: 25000,
    });
    serviceId = service.id;
    expect(service.name).toBe('Test Service');
    expect(service.duration).toBe(45);
  });

  it('deberia listar servicios del usuario', async () => {
    const services = await serviceService.getAll(userId);
    expect(services.length).toBeGreaterThan(0);
    expect(services[0].user_id).toBe(userId);
  });

  it('deberia obtener servicio por slug', async () => {
    const service = await serviceService.getBySlug(
      (await serviceService.getAll(userId))[0].booking_slug
    );
    expect(service.id).toBe(serviceId);
  });
});

describe('Booking Flow', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  let availableSlot: string;

  it('deberia calcular disponibilidad', async () => {
    const slots = await bookingService.getAvailability(serviceId, dateStr);
    expect(slots.length).toBeGreaterThan(0);
    availableSlot = slots[0].start;
  });

  it('deberia crear una reserva', async () => {
    const booking = await bookingService.create(userId, {
      service_id: serviceId,
      client_name: 'Cliente Test',
      client_email: 'cliente@test.com',
      start_time: availableSlot,
    });
    bookingId = booking.id;
    expect(booking.status).toBe('confirmed');
    expect(booking.client_name).toBe('Cliente Test');
  });

  it('deberia bloquear horario ocupado', async () => {
    await expect(
      bookingService.create(userId, {
        service_id: serviceId,
        client_name: 'Otro Cliente',
        client_email: 'otro@test.com',
        start_time: availableSlot,
      })
    ).rejects.toThrow('Horario no disponible');
  });

  it('deberia obtener reservas del dia', async () => {
    const bookings = await bookingService.getBookingsByDay(
      serviceId,
      dateStr,
      userId
    );
    expect(bookings.length).toBe(1);
    expect(bookings[0].id).toBe(bookingId);
  });

  it('deberia obtener mis reservas', async () => {
    const result = await bookingService.getMyBookings(userId);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('deberia cancelar la reserva', async () => {
    const result = await bookingService.cancel(bookingId, userId);
    expect(result.message).toBe('Reserva cancelada');

    const booking = await pool.query('SELECT status FROM bookings WHERE id = $1', [bookingId]);
    expect(booking.rows[0].status).toBe('cancelled');
  });

  it('deberia reprogramar la reserva', async () => {
    const slots = await bookingService.getAvailability(serviceId, dateStr);
    expect(slots.length).toBeGreaterThan(0);

    const result = await bookingService.reschedule(
      bookingId,
      slots[0].start,
      userId
    );
    expect(result.message).toBe('Reserva reprogramada');
  });
});

describe('Stats Flow', () => {
  it('deberia obtener estadisticas', async () => {
    const stats = await bookingService.getStats(userId);
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('confirmed');
    expect(stats).toHaveProperty('cancelled');
    expect(stats).toHaveProperty('revenue');
    expect(stats).toHaveProperty('byService');
    expect(stats).toHaveProperty('last7Days');
    expect(stats).toHaveProperty('upcoming');
  });
});

afterAll(async () => {
  if (bookingId) {
    await pool.query('DELETE FROM bookings WHERE id = $1', [bookingId]);
  }
  if (serviceId) {
    await pool.query('DELETE FROM services WHERE id = $1', [serviceId]);
  }
  if (userId) {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  }
  await pool.end();
});
