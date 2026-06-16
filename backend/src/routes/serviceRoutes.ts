import { Router } from 'express';
import { createService, getServices, getServiceBySlug, updateService, deleteService } from '../controllers/serviceController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../validation/validate.js';
import { createServiceSchema, updateServiceSchema } from '../validation/schemas.js';

const router = Router();

router.post('/', authMiddleware, validate(createServiceSchema), createService);
router.get('/', authMiddleware, getServices);
router.get('/:slug', getServiceBySlug);
router.put('/:id', authMiddleware, validate(updateServiceSchema), updateService);
router.delete('/:id', authMiddleware, deleteService);

export default router;
