import { Router } from 'express';
import { getStaff, addStaff, updateStaff, deleteStaff, assignBookingToStaff } from '../controllers/staffController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../validation/validate.js';
import { staffSchema, updateStaffSchema } from '../validation/schemas.js';

const router = Router();

router.get('/', authMiddleware, getStaff);
router.post('/', authMiddleware, validate(staffSchema), addStaff);
router.put('/:id', authMiddleware, validate(updateStaffSchema), updateStaff);
router.delete('/:id', authMiddleware, deleteStaff);
router.put('/assign/:bookingId', authMiddleware, assignBookingToStaff);

export default router;
