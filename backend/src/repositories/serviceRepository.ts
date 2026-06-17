import pool from '../config/db.js';
import { Service } from '../types/index.js';

export const serviceRepository = {
  async findAllByUser(userId: number): Promise<Service[]> {
    const result = await pool.query('SELECT * FROM services WHERE user_id = $1', [userId]);
    return result.rows;
  },

  async findById(id: number): Promise<Service | undefined> {
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findBySlug(slug: string): Promise<Service | undefined> {
    const result = await pool.query(
      `SELECT s.*, u.name as provider_name, u.email as provider_email 
       FROM services s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.slug = $1 OR s.booking_slug = $1`,
      [slug]
    );
    return result.rows[0];
  },

  async findUserByServiceId(serviceId: number): Promise<{ user_id: number } | undefined> {
    const result = await pool.query('SELECT user_id FROM services WHERE id = $1', [serviceId]);
    return result.rows[0];
  },

  async create(data: {
    user_id: number;
    name: string;
    description: string | null;
    duration: number;
    price: number | null;
    slug: string;
    booking_slug: string;
    timezone: string;
    start_hour: number;
    end_hour: number;
    max_capacity: number;
    service_type: string;
    is_package: boolean;
    allow_multiple: boolean;
  }): Promise<Service> {
    const result = await pool.query(
      `INSERT INTO services (user_id, name, description, duration, price, slug, booking_slug, timezone, start_hour, end_hour, max_capacity, service_type, is_package, allow_multiple) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        data.user_id,
        data.name,
        data.description,
        data.duration,
        data.price,
        data.slug,
        data.booking_slug,
        data.timezone,
        data.start_hour,
        data.end_hour,
        data.max_capacity,
        data.service_type,
        data.is_package,
        data.allow_multiple,
      ]
    );
    return result.rows[0];
  },

  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      duration?: number;
      price?: number;
      timezone?: string;
      start_hour?: number;
      end_hour?: number;
    }
  ): Promise<Service | undefined> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) return undefined;

    values.push(id);
    const result = await pool.query(
      `UPDATE services SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM services WHERE id = $1', [id]);
  },

  async getPackageServices(packageId: number): Promise<{ service_id: number; quantity: number; name: string; duration: number; price: number }[]> {
    const result = await pool.query(
      `SELECT sp.*, s.name, s.duration, s.price FROM service_packages sp 
       JOIN services s ON sp.service_id = s.id WHERE sp.package_id = $1`,
      [packageId]
    );
    return result.rows;
  },

  async addPackageService(
    packageId: number,
    serviceId: number,
    quantity: number
  ): Promise<void> {
    await pool.query(
      'INSERT INTO service_packages (package_id, service_id, quantity) VALUES ($1, $2, $3)',
      [packageId, serviceId, quantity]
    );
  },
};
