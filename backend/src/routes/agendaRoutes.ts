import { Router } from 'express';
import { getDayTimeline, getWeekOverview } from '../controllers/agendaController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/day', authMiddleware, getDayTimeline);
router.get('/week', authMiddleware, getWeekOverview);

export default router;
