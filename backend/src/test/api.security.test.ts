import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import pool from '../config/db.js';
import { runMigrations } from '../migrations/run.js';
import { PostgresRateLimitStore } from '../utils/rateLimitStore.js';

let owner: { id: number; token: string };
let attacker: { id: number; token: string };

const unique = (prefix: string) => `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

async function registerAndLogin(prefix: string) {
  const email = `${unique(prefix)}@example.com`;
  const reg = await request(app).post('/api/auth/register').send({
    name: prefix,
    email,
    password: 'password123',
  });
  expect(reg.status).toBe(201);
  const login = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
  expect(login.status).toBe(200);
  return { id: (reg.body as { id: number }).id, token: (login.body as { token: string }).token };
}

function daysFromNow(days: number, hour = 9, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

async function createService(token: string, extra: Record<string, unknown> = {}) {
  const res = await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: unique('Svc'), duration: 30, price: 25000, ...extra });
  expect(res.status).toBe(201);
  return res.body as { id: number; slug: string; price: number | null; booking_slug: string };
}

async function getAvailability(token: string, serviceId: number, date: string) {
  const res = await request(app)
    .get(`/api/bookings/availability?service_id=${serviceId}&date=${date}`)
    .set('Authorization', `Bearer ${token}`);
  expect(res.status).toBe(200);
  return res.body as { start: string; end: string }[];
}

function dateOnly(iso: string) {
  return iso.slice(0, 10);
}

beforeAll(async () => {
  await runMigrations();
  owner = await registerAndLogin('Owner');
  attacker = await registerAndLogin('Attacker');
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE id = ANY($1)', [[owner.id, attacker.id]]);
  await pool.end();
});

describe('Autorizacion entre usuarios', () => {
  let serviceId: number;

  beforeAll(async () => {
    serviceId = (await createService(owner.token)).id;
  });

  it('un usuario no ve la agenda de otro proveedor', async () => {
    const res = await request(app)
      .get(`/api/agenda/day?service_id=${serviceId}&date=${dateOnly(daysFromNow(1))}`)
      .set('Authorization', `Bearer ${attacker.token}`);
    expect(res.status).toBe(404);
  });

  it('un usuario no edita los horarios de otro proveedor', async () => {
    const res = await request(app)
      .put(`/api/services/${serviceId}/hours`)
      .set('Authorization', `Bearer ${attacker.token}`)
      .send({ hours: [{ day_of_week: 1, start_hour: 9, end_hour: 18, is_active: true }] });
    expect(res.status).toBe(403);
  });

  it('un usuario no ve los descansos de otro proveedor', async () => {
    const res = await request(app)
      .get(`/api/services/${serviceId}/breaks`)
      .set('Authorization', `Bearer ${attacker.token}`);
    expect(res.status).toBe(403);
  });

  it('un usuario no actualiza el servicio de otro proveedor', async () => {
    const res = await request(app)
      .put(`/api/services/${serviceId}`)
      .set('Authorization', `Bearer ${attacker.token}`)
      .send({ name: 'Hackeado' });
    expect(res.status).toBe(403);
  });

  it('el dueño si puede consultar su agenda', async () => {
    const res = await request(app)
      .get(`/api/agenda/day?service_id=${serviceId}&date=${dateOnly(daysFromNow(1))}`)
      .set('Authorization', `Bearer ${owner.token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Reglas de reserva', () => {
  it('ignora el precio enviado por el cliente', async () => {
    const service = await createService(owner.token, { price: 25000.9 });
    const slots = await getAvailability(owner.token, service.id, dateOnly(daysFromNow(1)));
    const res = await request(app).post('/api/bookings/public').send({
      service_id: service.id,
      client_name: 'Cliente',
      client_email: 'cliente@example.com',
      start_time: slots[0].start,
      price: 1,
    });
    expect(res.status).toBe(200);
    const price = (res.body as { booking: { price: unknown } }).booking.price;
    expect(Number(price)).toBe(25000.9);
    expect(price).not.toBe(1);
    expect(typeof price).toBe('number');
  });

  it('calcula los ingresos con decimales correctamente', async () => {
    const service = await createService(owner.token, { price: 15000.75 });
    const slot = (await getAvailability(owner.token, service.id, dateOnly(daysFromNow(1))))[0];
    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        service_id: service.id,
        client_name: 'Cliente',
        client_email: 'cli-rev@example.com',
        start_time: slot.start,
      });
    expect(bookingRes.status).toBe(200);

    const statsRes = await request(app)
      .get('/api/bookings/stats')
      .set('Authorization', `Bearer ${owner.token}`);
    expect(statsRes.status).toBe(200);
    const stats = statsRes.body as { revenue: unknown };
    expect(Math.abs(Number(stats.revenue) - 15000.75)).toBeLessThan(0.001);
  });

  it('rechaza reservas en fecha pasada', async () => {
    const service = await createService(owner.token);
    const res = await request(app).post('/api/bookings/public').send({
      service_id: service.id,
      client_name: 'Cliente',
      client_email: 'cliente@example.com',
      start_time: daysFromNow(-2),
    });
    expect(res.status).toBe(400);
  });

  it('rechaza reservas fuera del horario del servicio', async () => {
    const service = await createService(owner.token, { start_hour: 9, end_hour: 10 });
    const slot = (await getAvailability(owner.token, service.id, dateOnly(daysFromNow(1))))[0];
    const outside = new Date(new Date(slot.start).getTime() + 3 * 60 * 60 * 1000).toISOString();
    const res = await request(app).post('/api/bookings/public').send({
      service_id: service.id,
      client_name: 'Cliente',
      client_email: 'cliente@example.com',
      start_time: outside,
    });
    expect(res.status).toBe(409);
  });

  it('rechaza reservas durante un descanso', async () => {
    const date = dateOnly(daysFromNow(1));
    const service = await createService(owner.token, { start_hour: 9, end_hour: 13 });
    const before = await getAvailability(owner.token, service.id, date);

    const breakRes = await request(app)
      .post(`/api/services/${service.id}/breaks`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Pausa', date, start_time: '10:00', end_time: '11:00' });
    expect(breakRes.status).toBe(201);

    const after = await getAvailability(owner.token, service.id, date);
    const removed = before.filter((b) => !after.some((a) => a.start === b.start));
    expect(removed.length).toBeGreaterThan(0);

    const res = await request(app).post('/api/bookings/public').send({
      service_id: service.id,
      client_name: 'Cliente',
      client_email: 'cliente@example.com',
      start_time: removed[0].start,
    });
    expect(res.status).toBe(409);
  });

  it('no permite doble reserva simultanea en el mismo horario', async () => {
    const service = await createService(owner.token);
    const slot = (await getAvailability(owner.token, service.id, dateOnly(daysFromNow(1))))[0];

    const [a, b] = await Promise.all([
      request(app).post('/api/bookings/public').send({
        service_id: service.id,
        client_name: 'Cliente A',
        client_email: 'clientea@example.com',
        start_time: slot.start,
      }),
      request(app).post('/api/bookings/public').send({
        service_id: service.id,
        client_name: 'Cliente B',
        client_email: 'clienteb@example.com',
        start_time: slot.start,
      }),
    ]);

    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([200, 409]);

    const count = await pool.query(
      `SELECT COUNT(*)::int AS total FROM bookings
       WHERE service_id = $1 AND start_time = $2 AND status IN ('confirmed', 'pending')`,
      [service.id, new Date(slot.start)]
    );
    expect(count.rows[0].total).toBe(1);
  });

  it('respeta la capacidad multiple por servicio', async () => {
    const service = await createService(owner.token, { max_capacity: 2 });
    const slot = (await getAvailability(owner.token, service.id, dateOnly(daysFromNow(1))))[0];

    const first = await request(app).post('/api/bookings/public').send({
      service_id: service.id,
      client_name: 'Cliente 1',
      client_email: 'cliente1@example.com',
      start_time: slot.start,
    });
    const second = await request(app).post('/api/bookings/public').send({
      service_id: service.id,
      client_name: 'Cliente 2',
      client_email: 'cliente2@example.com',
      start_time: slot.start,
    });
    const third = await request(app).post('/api/bookings/public').send({
      service_id: service.id,
      client_name: 'Cliente 3',
      client_email: 'cliente3@example.com',
      start_time: slot.start,
    });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(third.status).toBe(409);
  });
});

describe('Aislamiento de staff', () => {
  it('no permite asignar staff de otro proveedor', async () => {
    const ownerStaff = await request(app)
      .post('/api/staff')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Staff Owner', email: 'staffowner@example.com' });
    expect(ownerStaff.status).toBe(201);

    const attackerService = await createService(attacker.token);
    const slot = (await getAvailability(attacker.token, attackerService.id, dateOnly(daysFromNow(1))))[0];

    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${attacker.token}`)
      .send({
        service_id: attackerService.id,
        client_name: 'Cliente',
        client_email: 'cli@example.com',
        start_time: slot.start,
      });
    expect(bookingRes.status).toBe(200);
    const bookingId = (bookingRes.body as { id: number }).id;

    const ownerStaffId = (ownerStaff.body as { id: number }).id;
    const assign = await request(app)
      .put(`/api/staff/assign/${bookingId}`)
      .set('Authorization', `Bearer ${attacker.token}`)
      .send({ staffId: ownerStaffId });
    expect(assign.status).toBe(403);
  });

  it('permite asignar el propio staff', async () => {
    const attackerStaff = await request(app)
      .post('/api/staff')
      .set('Authorization', `Bearer ${attacker.token}`)
      .send({ name: 'Staff Attacker', email: 'staffattacker@example.com' });
    expect(attackerStaff.status).toBe(201);

    const attackerService = await createService(attacker.token);
    const slot = (await getAvailability(attacker.token, attackerService.id, dateOnly(daysFromNow(1))))[0];
    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${attacker.token}`)
      .send({
        service_id: attackerService.id,
        client_name: 'Cliente',
        client_email: 'cli2@example.com',
        start_time: slot.start,
      });
    const bookingId = (bookingRes.body as { id: number }).id;

    const assign = await request(app)
      .put(`/api/staff/assign/${bookingId}`)
      .set('Authorization', `Bearer ${attacker.token}`)
      .send({ staffId: (attackerStaff.body as { id: number }).id });
    expect(assign.status).toBe(200);
  });
});

describe('Disponibilidad aislada por proveedor', () => {
  it('un usuario no consulta la disponibilidad del servicio de otro', async () => {
    const service = await createService(owner.token);
    const res = await request(app)
      .get(`/api/bookings/availability?service_id=${service.id}&date=${dateOnly(daysFromNow(1))}`)
      .set('Authorization', `Bearer ${attacker.token}`);
    expect(res.status).toBe(403);
  });

  it('el dueño si consulta su disponibilidad', async () => {
    const service = await createService(owner.token);
    const res = await request(app)
      .get(`/api/bookings/availability?service_id=${service.id}&date=${dateOnly(daysFromNow(1))}`)
      .set('Authorization', `Bearer ${owner.token}`);
    expect(res.status).toBe(200);
  });
});

describe('Validacion de horarios', () => {
  it('rechaza una actualizacion parcial que invierte la jornada', async () => {
    const service = await createService(owner.token, { start_hour: 9, end_hour: 13 });
    const res = await request(app)
      .put(`/api/services/${service.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ end_hour: 5 });
    expect(res.status).toBe(400);
  });

  it('acepta una actualizacion parcial valida', async () => {
    const service = await createService(owner.token, { start_hour: 9, end_hour: 13 });
    const res = await request(app)
      .put(`/api/services/${service.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ end_hour: 14 });
    expect(res.status).toBe(200);
  });

  it('rechaza un descanso con horas invertidas', async () => {
    const service = await createService(owner.token);
    const res = await request(app)
      .post(`/api/services/${service.id}/breaks`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Invertido', date: dateOnly(daysFromNow(1)), start_time: '14:00', end_time: '10:00' });
    expect(res.status).toBe(400);
  });

  it('rechaza un descanso fuera de la jornada del servicio', async () => {
    const service = await createService(owner.token, { start_hour: 9, end_hour: 13 });
    const res = await request(app)
      .post(`/api/services/${service.id}/breaks`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Fuera', date: dateOnly(daysFromNow(1)), start_time: '14:00', end_time: '15:00' });
    expect(res.status).toBe(400);
  });

  it('rechaza una fecha de descanso con formato invalido', async () => {
    const service = await createService(owner.token);
    const res = await request(app)
      .post(`/api/services/${service.id}/breaks`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Mal', date: '02/09/2026', start_time: '10:00', end_time: '11:00' });
    expect(res.status).toBe(400);
  });

  it('acepta un descanso dentro de la jornada', async () => {
    const service = await createService(owner.token, { start_hour: 9, end_hour: 18 });
    const res = await request(app)
      .post(`/api/services/${service.id}/breaks`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Pausa', date: dateOnly(daysFromNow(1)), start_time: '12:00', end_time: '13:00' });
    expect(res.status).toBe(201);
  });
});

describe('Zona horaria', () => {
  it('genera los horarios en la zona del servicio, no la del servidor', async () => {
    const service = await createService(owner.token, { timezone: 'Asia/Tokyo', start_hour: 9, end_hour: 10 });
    const slots = await getAvailability(owner.token, service.id, '2030-01-07');
    expect(slots.length).toBeGreaterThan(0);
    // 09:00 en Asia/Tokyo (UTC+9, sin DST) == 00:00 UTC
    expect(new Date(slots[0].start).toISOString()).toBe('2030-01-07T00:00:00.000Z');
  });
});

describe('Rate limit store', () => {
  it('incrementa, decrementa y resetea contadores por clave', async () => {
    const store = new PostgresRateLimitStore();
    store.init({ windowMs: 60_000 });
    const key = `test:${Date.now()}`;

    expect((await store.increment(key)).totalHits).toBe(1);
    expect((await store.increment(key)).totalHits).toBe(2);

    await store.decrement(key);
    expect((await store.increment(key)).totalHits).toBe(2);

    await store.resetKey(key);
    expect((await store.increment(key)).totalHits).toBe(1);

    await store.resetKey(key);
  });
});

describe('Cabeceras de seguridad', () => {
  it('expone cabeceras de helmet en las respuestas', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('Integridad a nivel de base de datos', () => {
  async function rawBooking(serviceId: number, start: string, email: string) {
    return pool.query(
      `INSERT INTO bookings (service_id, client_name, client_email, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, 'confirmed')`,
      [serviceId, email, email, new Date(start), new Date(new Date(start).getTime() + 30 * 60000)]
    );
  }

  it('la base rechaza un segundo registro solapado sin pasar por la API', async () => {
    const service = await createService(owner.token, { max_capacity: 1 });
    const slot = (await getAvailability(owner.token, service.id, dateOnly(daysFromNow(1))))[0];

    await rawBooking(service.id, slot.start, 'directo1@example.com');
    await expect(rawBooking(service.id, slot.start, 'directo2@example.com')).rejects.toThrow();
  });

  it('la base permite hasta dos registros solapados con capacidad 2', async () => {
    const service = await createService(owner.token, { max_capacity: 2 });
    const slot = (await getAvailability(owner.token, service.id, dateOnly(daysFromNow(1))))[0];

    await rawBooking(service.id, slot.start, 'cap1@example.com');
    await rawBooking(service.id, slot.start, 'cap2@example.com');
    await expect(rawBooking(service.id, slot.start, 'cap3@example.com')).rejects.toThrow();
  });
});