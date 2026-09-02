import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/bookingService.js';
import type { BookingStatusAction } from '../types/index.js';

export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await bookingService.create(req.user!.id, req.body);
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export const createPublicBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await bookingService.createPublic(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getBookingsByDay = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service_id = Number(req.query.service_id as string);
    const date = req.query.date as string;
    const bookings = await bookingService.getBookingsByDay(service_id, date, req.user!.id);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slots = await bookingService.getAvailability(
      Number(req.query.service_id as string),
      req.query.date as string,
      req.user!.id
    );
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

export const getPublicAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.query.service_id || !req.query.date) {
      res.status(400).json({ error: 'Parametros requeridos' });
      return;
    }
    const slots = await bookingService.getAvailability(
      Number(req.query.service_id as string),
      req.query.date as string
    );
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const result = await bookingService.getMyBookings(req.user!.id, { page, limit, search, status });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const period = req.query.period as string | undefined;
    const stats = await bookingService.getStats(req.user!.id, period);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await bookingService.cancel(Number(id), req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const rescheduleBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { new_start_time } = req.body;
    const result = await bookingService.reschedule(Number(id), new_start_time, req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const result = await bookingService.updateStatus(Number(id), req.user!.id, status as BookingStatusAction, reason);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
