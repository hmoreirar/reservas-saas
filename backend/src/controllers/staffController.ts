import { Request, Response, NextFunction } from 'express';
import { staffService } from '../services/staffService.js';

export const getStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const staff = await staffService.getAll(req.user!.id);
    res.json(staff);
  } catch (error) {
    next(error);
  }
};

export const addStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await staffService.create(req.user!.id, req.body);
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const member = await staffService.update(Number(id), req.user!.id, req.body);
    res.json(member);
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await staffService.delete(Number(id), req.user!.id);
    res.json({ message: 'Miembro eliminado' });
  } catch (error) {
    next(error);
  }
};

export const assignBookingToStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { staffId } = req.body;
    const result = await staffService.assignToBooking(Number(bookingId), Number(staffId), req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
