import pool from '../config/db.js';

export interface ServiceHourRow {
  id: number;
  service_id: number;
  day_of_week: number;
  start_hour: number;
  end_hour: number;
  is_active: boolean;
}

export const serviceHoursRepository = {
  async findByService(serviceId: number): Promise<ServiceHourRow[]> {
    const result = await pool.query(
      'SELECT * FROM service_hours WHERE service_id = $1 ORDER BY day_of_week',
      [serviceId]
    );
    return result.rows;
  },

  async upsert(
    serviceId: number,
    dayOfWeek: number,
    startHour: number,
    endHour: number,
    isActive: boolean
  ): Promise<ServiceHourRow> {
    const result = await pool.query(
      `INSERT INTO service_hours (service_id, day_of_week, start_hour, end_hour, is_active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (service_id, day_of_week)
       DO UPDATE SET start_hour = $3, end_hour = $4, is_active = $5
       RETURNING *`,
      [serviceId, dayOfWeek, startHour, endHour, isActive]
    );
    return result.rows[0];
  },

  async replaceAll(serviceId: number, hours: Omit<ServiceHourRow, 'id' | 'service_id'>[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM service_hours WHERE service_id = $1', [serviceId]);
      for (const h of hours) {
        await client.query(
          `INSERT INTO service_hours (service_id, day_of_week, start_hour, end_hour, is_active)
           VALUES ($1, $2, $3, $4, $5)`,
          [serviceId, h.day_of_week, h.start_hour, h.end_hour, h.is_active]
        );
      }
    } finally {
      client.release();
    }
  },

  async deleteByService(serviceId: number): Promise<void> {
    await pool.query('DELETE FROM service_hours WHERE service_id = $1', [serviceId]);
  },
};
