import { Request, Response, NextFunction } from 'express';
import { agendaService } from '../services/agendaService.js';

export const getDayTimeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const date = req.query.date as string;
    const serviceId = req.query.service_id ? Number(req.query.service_id) : undefined;
    const staffId = req.query.staff_id ? Number(req.query.staff_id) : undefined;

    if (!date) {
      res.status(400).json({ error: 'El parametro date es requerido' });
      return;
    }

    const agendas = await agendaService.getDayTimeline(req.user!.id, date, serviceId, staffId);
    res.json(agendas);
  } catch (error) {
    next(error);
  }
};

export const getWeekOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const startDate = req.query.start_date as string;
    const serviceId = req.query.service_id ? Number(req.query.service_id) : undefined;

    if (!startDate) {
      res.status(400).json({ error: 'El parametro start_date es requerido' });
      return;
    }

    const agendas = await agendaService.getWeekOverview(req.user!.id, startDate, serviceId);
    res.json(agendas);
  } catch (error) {
    next(error);
  }
};
