import { Request, Response, NextFunction } from 'express';
import { serviceService } from '../services/serviceService.js';

export const createService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await serviceService.create(req.user!.id, req.body);
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

export const getServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const services = await serviceService.getAll(req.user!.id);
    res.json(services);
  } catch (error) {
    next(error);
  }
};

export const getServiceBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const service = await serviceService.getBySlug(slug);
    res.json(service);
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await serviceService.update(Number(id), req.user!.id, req.body);
    res.json(service);
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await serviceService.delete(Number(id), req.user!.id);
    res.json({ message: 'Servicio eliminado' });
  } catch (error) {
    next(error);
  }
};
