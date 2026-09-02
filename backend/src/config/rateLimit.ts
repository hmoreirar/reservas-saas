import rateLimit from 'express-rate-limit';
import { PostgresRateLimitStore } from '../utils/rateLimitStore.js';

const message = { error: 'Demasiadas solicitudes, intente en 1 minuto' };

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  store: new PostgresRateLimitStore(),
  keyGenerator: (req) => `login:${req.ip ?? 'unknown'}`,
  message,
});

export const publicBookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  store: new PostgresRateLimitStore(),
  keyGenerator: (req) => `booking:${req.ip ?? 'unknown'}`,
  message,
});
