import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Password debe tener al menos 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'Password requerido'),
});

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  description: z.string().optional(),
  duration: z.number().int().positive('Duracion debe ser positiva').default(30),
  price: z.number().min(0).nullable().optional(),
  timezone: z.string().default('America/Santiago'),
  start_hour: z.number().int().min(0).max(23).default(9),
  end_hour: z.number().int().min(0).max(23).default(18),
  max_capacity: z.number().int().positive().default(1),
  service_type: z.string().default('standard'),
  is_package: z.boolean().default(false),
  package_services: z
    .array(
      z.object({
        service_id: z.number().int().positive(),
        quantity: z.number().int().positive().default(1),
      })
    )
    .optional(),
  allow_multiple: z.boolean().default(false),
}).refine((data) => data.end_hour > data.start_hour, {
  message: 'La hora de cierre debe ser posterior a la de inicio',
  path: ['end_hour'],
});

export const updateServiceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  duration: z.number().int().positive().optional(),
  price: z.number().min(0).optional(),
  timezone: z.string().optional(),
  start_hour: z.number().int().min(0).max(23).optional(),
  end_hour: z.number().int().min(0).max(23).optional(),
}).refine((data) => data.start_hour === undefined || data.end_hour === undefined || data.end_hour > data.start_hour, {
  message: 'La hora de cierre debe ser posterior a la de inicio',
  path: ['end_hour'],
});

export const createBookingSchema = z.object({
  service_id: z.number().int().positive(),
  client_name: z.string().min(1, 'Nombre del cliente requerido').max(100),
  client_email: z.string().email('Email del cliente invalido'),
  start_time: z.string().datetime({ offset: true }),
  notes: z.string().max(1000).optional(),
});

export const createPublicBookingSchema = z.object({
  service_id: z.union([z.number().int().positive(), z.string().min(1)]),
  client_name: z.string().min(1, 'Nombre requerido').max(100),
  client_email: z.string().email('Email invalido'),
  start_time: z.string().datetime({ offset: true }),
  notes: z.string().max(1000).optional(),
});

export const staffSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  email: z.string().email('Email invalido'),
  role: z.string().default('staff'),
});

export const updateStaffSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
});

export const serviceHoursSchema = z.object({
  hours: z.array(
    z.object({
      day_of_week: z.number().int().min(0).max(6),
      start_hour: z.number().int().min(0).max(23),
      end_hour: z.number().int().min(0).max(23),
      is_active: z.boolean().default(true),
    })
  ).superRefine((hours, ctx) => {
    for (const [index, hour] of hours.entries()) {
      if (hour.is_active && hour.end_hour <= hour.start_hour) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, 'end_hour'],
          message: 'La hora de cierre debe ser posterior a la de inicio',
        });
      }
    }
  }),
});

export const serviceBreakSchema = z.object({
  name: z.string().max(100).default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha invalida'),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Hora inicio invalida'),
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Hora fin invalida'),
  is_recurring: z.boolean().default(false),
}).refine((b) => b.end_time > b.start_time, {
  message: 'La hora de fin debe ser posterior a la de inicio',
  path: ['end_time'],
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'declined', 'cancelled', 'completed', 'no-show']),
  reason: z.string().optional(),
});
