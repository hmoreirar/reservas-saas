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
  price: z.number().min(0).optional(),
  timezone: z.string().default('America/Santiago'),
  start_hour: z.number().int().min(0).max(23).default(9),
  end_hour: z.number().int().min(0).max(23).default(18),
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
});

export const updateServiceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  duration: z.number().int().positive().optional(),
  price: z.number().min(0).optional(),
  timezone: z.string().optional(),
  start_hour: z.number().int().min(0).max(23).optional(),
  end_hour: z.number().int().min(0).max(23).optional(),
});

export const createBookingSchema = z.object({
  service_id: z.number().int().positive(),
  client_name: z.string().min(1, 'Nombre del cliente requerido').max(100),
  client_email: z.string().email('Email del cliente invalido'),
  start_time: z.string().min(1, 'Fecha y hora requerida'),
  notes: z.string().optional(),
});

export const createPublicBookingSchema = z.object({
  service_id: z.union([z.number().int().positive(), z.string().min(1)]),
  client_name: z.string().min(1, 'Nombre requerido').max(100),
  client_email: z.string().email('Email invalido'),
  start_time: z.string().min(1, 'Fecha y hora requerida'),
  notes: z.string().optional(),
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
