import { Request, Response, NextFunction } from 'express';
import { serviceBreaksService } from '../services/serviceBreaksService.js';

export const getBreaks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const breaks = await serviceBreaksService.getByService(Number(id), req.user!.id);
    res.json(breaks);
  } catch (error) {
    next(error);
  }
};

export const createBreak = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await serviceBreaksService.create(Number(id), req.user!.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteBreak = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { breakId } = req.params;
    await serviceBreaksService.delete(Number(breakId), req.user!.id);
    res.json({ message: 'Break eliminado' });
  } catch (error) {
    next(error);
  }
};
