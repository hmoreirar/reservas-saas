import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/bookingService.js';

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
      req.query.date as string
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
    const bookings = await bookingService.getMyBookings(req.user!.id);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await bookingService.getStats(req.user!.id);
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
