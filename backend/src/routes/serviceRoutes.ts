import { Router } from 'express';
import { createService, getServices, getServiceBySlug, updateService, deleteService } from '../controllers/serviceController.js';
import { getHours, updateHours, deleteHours } from '../controllers/serviceHoursController.js';
import { getBreaks, createBreak, deleteBreak } from '../controllers/serviceBreaksController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../validation/validate.js';
import { createServiceSchema, updateServiceSchema, serviceHoursSchema, serviceBreakSchema } from '../validation/schemas.js';

const router = Router();

router.post('/', authMiddleware, validate(createServiceSchema), createService);
router.get('/', authMiddleware, getServices);
router.get('/:slug', getServiceBySlug);
router.put('/:id', authMiddleware, validate(updateServiceSchema), updateService);
router.delete('/:id', authMiddleware, deleteService);

router.get('/:id/hours', authMiddleware, getHours);
router.put('/:id/hours', authMiddleware, validate(serviceHoursSchema), updateHours);
router.delete('/:id/hours', authMiddleware, deleteHours);

router.get('/:id/breaks', authMiddleware, getBreaks);
router.post('/:id/breaks', authMiddleware, validate(serviceBreakSchema), createBreak);
router.delete('/:id/breaks/:breakId', authMiddleware, deleteBreak);

export default router;
