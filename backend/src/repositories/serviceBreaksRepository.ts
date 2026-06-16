import pool from '../config/db.js';

export interface ServiceBreakRow {
  id: number;
  service_id: number;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
}

export const serviceBreaksRepository = {
  async findByService(serviceId: number): Promise<ServiceBreakRow[]> {
    const result = await pool.query(
      'SELECT * FROM service_breaks WHERE service_id = $1 ORDER BY date, start_time',
      [serviceId]
    );
    return result.rows;
  },

  async findByServiceAndDate(serviceId: number, date: string): Promise<ServiceBreakRow[]> {
    const result = await pool.query(
      `SELECT * FROM service_breaks
       WHERE service_id = $1
       AND (date = $2 OR (is_recurring = true AND EXTRACT(DOW FROM $2::date) = EXTRACT(DOW FROM date)))
       ORDER BY start_time`,
      [serviceId, date]
    );
    return result.rows;
  },

  async create(data: {
    service_id: number;
    name?: string;
    date: string;
    start_time: string;
    end_time: string;
    is_recurring?: boolean;
  }): Promise<ServiceBreakRow> {
    const result = await pool.query(
      `INSERT INTO service_breaks (service_id, name, date, start_time, end_time, is_recurring)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.service_id,
        data.name ?? '',
        data.date,
        data.start_time,
        data.end_time,
        data.is_recurring ?? false,
      ]
    );
    return result.rows[0];
  },

  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM service_breaks WHERE id = $1', [id]);
  },

  async findWithOwner(id: number): Promise<({ id: number; user_id: number } & ServiceBreakRow) | undefined> {
    const result = await pool.query(
      `SELECT sb.*, s.user_id FROM service_breaks sb
       JOIN services s ON sb.service_id = s.id
       WHERE sb.id = $1`,
      [id]
    );
    return result.rows[0];
  },
};
