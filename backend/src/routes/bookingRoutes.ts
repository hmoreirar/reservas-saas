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
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../validation/validate.js';
import { createBookingSchema, createPublicBookingSchema, updateBookingStatusSchema } from '../validation/schemas.js';
import { publicBookingLimiter } from '../config/rateLimit.js';

const router = Router();

router.post('/', authMiddleware, validate(createBookingSchema), createBooking);
router.post('/public', publicBookingLimiter, validate(createPublicBookingSchema), createPublicBooking);
router.get('/day', authMiddleware, getBookingsByDay);
router.get('/availability', authMiddleware, getAvailability);
router.get('/public/availability', getPublicAvailability);
router.get('/my', authMiddleware, getMyBookings);
router.get('/stats', authMiddleware, getStats);
router.put('/:id/cancel', authMiddleware, cancelBooking);
router.put('/:id/reschedule', authMiddleware, rescheduleBooking);
router.put('/:id/status', authMiddleware, validate(updateBookingStatusSchema), updateBookingStatus);

export default router;
