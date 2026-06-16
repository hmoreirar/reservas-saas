import { Router } from 'express';
import {
  createBooking,
  createPublicBooking,
  getBookingsByDay,
  getAvailability,
  getPublicAvailability,
  getMyBookings,
  getStats,
  cancelBooking,
  rescheduleBooking,
} from '../controllers/bookingController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../validation/validate.js';
import { createBookingSchema, createPublicBookingSchema } from '../validation/schemas.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Demasiadas solicitudes, intente en 1 minuto' },
});

router.post('/', authMiddleware, validate(createBookingSchema), createBooking);
router.post('/public', publicLimiter, validate(createPublicBookingSchema), createPublicBooking);
router.get('/day', authMiddleware, getBookingsByDay);
router.get('/availability', authMiddleware, getAvailability);
router.get('/public/availability', getPublicAvailability);
router.get('/my', authMiddleware, getMyBookings);
router.get('/stats', authMiddleware, getStats);
router.put('/:id/cancel', authMiddleware, cancelBooking);
router.put('/:id/reschedule', authMiddleware, rescheduleBooking);

export default router;
