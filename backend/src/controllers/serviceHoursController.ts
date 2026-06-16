import { Request, Response, NextFunction } from 'express';
import { serviceHoursService } from '../services/serviceHoursService.js';

export const getHours = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const hours = await serviceHoursService.getByService(Number(id), req.user!.id);
    res.json(hours);
  } catch (error) {
    next(error);
  }
};

export const updateHours = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const hours = await serviceHoursService.replaceAll(Number(id), req.user!.id, req.body.hours);
    res.json(hours);
  } catch (error) {
    next(error);
  }
};

export const deleteHours = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await serviceHoursService.deleteByService(Number(id), req.user!.id);
    res.json({ message: 'Horarios eliminados' });
  } catch (error) {
    next(error);
  }
};
