import { describe, expect, it } from 'vitest';
import {
  createPublicBookingSchema,
  createServiceSchema,
  serviceHoursSchema,
} from '../validation/schemas.js';

describe('Validacion de reglas de negocio', () => {
  it('ignora un precio enviado por una reserva publica', () => {
    const result = createPublicBookingSchema.parse({
      service_id: 1,
      client_name: 'Cliente',
      client_phone: '+56912345678',
      client_email: 'cliente@example.com',
      start_time: '2030-01-01T10:00:00.000Z',
      price: 0,
    });

    expect(result).not.toHaveProperty('price');
  });

  it('rechaza horarios de servicio invertidos', () => {
    expect(() => createServiceSchema.parse({
      name: 'Servicio',
      start_hour: 18,
      end_hour: 9,
    })).toThrow();
  });

  it('rechaza horas activas invertidas', () => {
    expect(() => serviceHoursSchema.parse({
      hours: [{ day_of_week: 1, start_hour: 18, end_hour: 9, is_active: true }],
    })).toThrow();
  });

  it('exige telefono de cliente valido', () => {
    const base = {
      service_id: 1,
      client_name: 'Cliente',
      client_email: 'cliente@example.com',
      start_time: '2030-01-01T10:00:00.000Z',
    };
    expect(() => createPublicBookingSchema.parse({ ...base, client_phone: '123' })).toThrow();
    // formatos chilenos comunes: todos normalizan a +569XXXXXXXX
    for (const phone of ['9 1234 5678', '+56 9 1234 5678', '56912345678']) {
      expect(createPublicBookingSchema.parse({ ...base, client_phone: phone })).toBeTruthy();
    }
  });

  it('acepta reserva publica sin email (opcional)', () => {
    const result = createPublicBookingSchema.parse({
      service_id: 1,
      client_name: 'Cliente',
      client_phone: '+56 9 1234 5678',
      start_time: '2030-01-01T10:00:00.000Z',
    });
    expect(result.client_email).toBeUndefined();
  });
});
