import pool from '../config/db.js';
import { Booking } from '../types/index.js';
import { QueryResult } from 'pg';

export const bookingRepository = {
  async createIfAvailable(data: {
    service_id: number;
    client_name: string;
    client_email: string;
    start_time: Date;
    end_time: Date;
    notes: string | null;
    price?: number | null;
    status?: string;
    max_capacity: number;
  }): Promise<Booking | undefined> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Serialise bookings for one service so check-then-insert is atomic.
      await client.query('SELECT pg_advisory_xact_lock($1)', [data.service_id]);
      const conflict = await client.query(
        `SELECT COUNT(*)::int AS count FROM bookings
         WHERE service_id = $1
         AND status IN ('confirmed', 'pending')
         AND start_time < $3 AND end_time > $2`,
        [data.service_id, data.start_time, data.end_time]
      );
      if (conflict.rows[0].count >= data.max_capacity) {
        await client.query('ROLLBACK');
        return undefined;
      }

      const result = await client.query(
        `INSERT INTO bookings (service_id, client_name, client_email, start_time, end_time, notes, price, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [data.service_id, data.client_name, data.client_email, data.start_time, data.end_time,
          data.notes, data.price ?? null, data.status ?? 'confirmed']
      );
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async create(data: {
    service_id: number;
    client_name: string;
    client_email: string;
    start_time: Date;
    end_time: Date;
    notes: string | null;
    price?: number | null;
    status?: string;
  }): Promise<Booking> {
    const result = await pool.query(
      `INSERT INTO bookings (service_id, client_name, client_email, start_time, end_time, notes, price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [data.service_id, data.client_name, data.client_email, data.start_time, data.end_time, data.notes, data.price ?? null, data.status ?? 'confirmed']
    );
    return result.rows[0];
  },

  async findConflicts(
    serviceId: number,
    start: Date,
    end: Date,
    excludeId?: number
  ): Promise<boolean> {
    let query = `SELECT 1 FROM bookings
       WHERE service_id = $1
       AND status IN ('confirmed', 'pending')
       AND start_time < $3
       AND end_time > $2`;
    const params: unknown[] = [serviceId, start, end];

    if (excludeId) {
      query += ' AND id != $4';
      params.push(excludeId);
    }

    query += ' LIMIT 1';
    const result = await pool.query(query, params);
    return result.rows.length > 0;
  },

  async findByDay(serviceId: number, date: string): Promise<Booking[]> {
    const result = await pool.query(
      `SELECT * FROM bookings
       WHERE service_id = $1
       AND start_time BETWEEN $2 AND $3
       ORDER BY start_time`,
      [serviceId, `${date} 00:00:00`, `${date} 23:59:59`]
    );
    return result.rows;
  },

  async findBookingsForDate(serviceId: number, date: string): Promise<{ id: number; start_time: Date; end_time: Date }[]> {
    const result = await pool.query(
      `SELECT id, start_time, end_time FROM bookings
       WHERE service_id = $1
       AND DATE(start_time) = $2
       AND status IN ('confirmed', 'pending')
       ORDER BY start_time`,
      [serviceId, date]
    );
    return result.rows;
  },

  async findById(id: number): Promise<Booking | undefined> {
    const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findWithService(id: number): Promise<(Booking & { user_id: number; service_name: string; duration: number }) | undefined> {
    const result = await pool.query(
      `SELECT b.*, s.user_id, s.name as service_name, s.duration FROM bookings b JOIN services s ON b.service_id = s.id WHERE b.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async findUpcomingByUser(
    userId: number,
    options: {
      limit: number;
      offset: number;
      search?: string;
      status?: string;
    }
  ): Promise<{ rows: Booking[]; total: number }> {
    const conditions: string[] = ['s.user_id = $1', 'b.start_time >= NOW()'];
    const values: unknown[] = [userId];

    if (options.status) {
      conditions.push(`b.status = $${values.length + 1}`);
      values.push(options.status);
    }

    if (options.search) {
      conditions.push(
        `(LOWER(b.client_name) LIKE $${values.length + 1} OR LOWER(b.client_email) LIKE $${values.length + 1})`
      );
      values.push(`%${options.search.toLowerCase()}%`);
    }

    const where = conditions.join(' AND ');

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM bookings b JOIN services s ON b.service_id = s.id WHERE ${where}`,
      values
    );
    const total = parseInt(countResult.rows[0]?.total || '0');

    const dataResult = await pool.query(
      `SELECT b.*, s.name as service_name, s.duration, COALESCE(b.price, s.price) as price
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE ${where}
       ORDER BY b.start_time DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, options.limit, options.offset]
    );

    return { rows: dataResult.rows, total };
  },

  async findByServiceUser(serviceId: number, userId: number): Promise<Booking[]> {
    const result = await pool.query(
      `SELECT * FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.service_id = $1 AND s.user_id = $2`,
      [serviceId, userId]
    );
    return result.rows;
  },

  async updateStatus(id: number, status: string): Promise<void> {
    await pool.query(
      'UPDATE bookings SET status = $1, status_changed_at = NOW() WHERE id = $2',
      [status, id]
    );
  },

  async updateStatusWithReason(id: number, status: string, reason: string): Promise<void> {
    await pool.query(
      'UPDATE bookings SET status = $1, cancellation_reason = $2, status_changed_at = NOW() WHERE id = $3',
      [status, reason, id]
    );
  },

  async updateTime(id: number, start_time: Date, end_time: Date): Promise<void> {
    await pool.query(
      'UPDATE bookings SET start_time = $1, end_time = $2 WHERE id = $3',
      [start_time, end_time, id]
    );
  },

  async updateTimeIfAvailable(
    id: number,
    serviceId: number,
    startTime: Date,
    endTime: Date,
    maxCapacity: number
  ): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock($1)', [serviceId]);
      const conflict = await client.query(
        `SELECT COUNT(*)::int AS count FROM bookings
         WHERE service_id = $1 AND id <> $4
         AND status IN ('confirmed', 'pending')
         AND start_time < $3 AND end_time > $2`,
        [serviceId, startTime, endTime, id]
      );
      if (conflict.rows[0].count >= maxCapacity) {
        await client.query('ROLLBACK');
        return false;
      }
      await client.query(
        'UPDATE bookings SET start_time = $1, end_time = $2 WHERE id = $3',
        [startTime, endTime, id]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async assignStaff(bookingId: number, staffId: number): Promise<void> {
    await pool.query('UPDATE bookings SET staff_id = $1 WHERE id = $2', [staffId, bookingId]);
  },

  async getStatsByUser(userId: number, period?: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    revenue: number;
  }> {
    const periodClause = period === 'month' ? `AND b.start_time >= date_trunc('month', NOW())` : '';
    const [totalResult, pendingResult, confirmedResult, cancelledResult, completedResult, revenueResult] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) as total FROM bookings b JOIN services s ON b.service_id = s.id WHERE s.user_id = $1 ${periodClause}`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*) as total FROM bookings b JOIN services s ON b.service_id = s.id WHERE s.user_id = $1 AND b.status = 'pending' ${periodClause}`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*) as total FROM bookings b JOIN services s ON b.service_id = s.id WHERE s.user_id = $1 AND b.status = 'confirmed' ${periodClause}`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*) as total FROM bookings b JOIN services s ON b.service_id = s.id WHERE s.user_id = $1 AND b.status = 'cancelled' ${periodClause}`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*) as total FROM bookings b JOIN services s ON b.service_id = s.id WHERE s.user_id = $1 AND b.status = 'completed' ${periodClause}`,
        [userId]
      ),
      pool.query(
        `SELECT COALESCE(SUM(COALESCE(b.price, s.price)), 0) as revenue FROM bookings b JOIN services s ON b.service_id = s.id WHERE s.user_id = $1 AND b.status = 'confirmed' ${periodClause}`,
        [userId]
      ),
    ]);

    return {
      total: parseInt(totalResult.rows[0]?.total || '0'),
      pending: parseInt(pendingResult.rows[0]?.total || '0'),
      confirmed: parseInt(confirmedResult.rows[0]?.total || '0'),
      cancelled: parseInt(cancelledResult.rows[0]?.total || '0'),
      completed: parseInt(completedResult.rows[0]?.total || '0'),
      revenue: parseInt(revenueResult.rows[0]?.revenue || '0'),
    };
  },

  async getByServiceStats(userId: number, period?: string): Promise<{ name: string; total: number; revenue: number }[]> {
    const periodClause = period === 'month' ? `AND b.start_time >= date_trunc('month', NOW())` : '';
    const result = await pool.query(
      `SELECT s.name, COUNT(b.id) as total, COALESCE(SUM(COALESCE(b.price, s.price)), 0) as revenue
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       WHERE s.user_id = $1 AND b.status = 'confirmed' ${periodClause}
       GROUP BY s.id, s.name
       ORDER BY total DESC`,
      [userId]
    );
    return result.rows;
  },

  async getLast7Days(userId: number): Promise<{ date: string; total: number }[]> {
    const result = await pool.query(
      `SELECT DATE(b.start_time) as date, COUNT(*) as total
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       WHERE s.user_id = $1 AND b.start_time >= NOW() - INTERVAL '7 days' AND b.status = 'confirmed'
       GROUP BY DATE(b.start_time)
       ORDER BY date`,
      [userId]
    );
    return result.rows;
  },

  async getUpcoming(userId: number, limit = 10): Promise<Booking[]> {
    const result = await pool.query(
      `SELECT b.*, s.name as service_name
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       WHERE s.user_id = $1 AND b.start_time >= NOW() AND b.status IN ('pending', 'confirmed', 'completed')
       ORDER BY 
         CASE b.status WHEN 'pending' THEN 0 WHEN 'confirmed' THEN 1 ELSE 2 END,
         b.start_time
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  async getPendingCount(userId: number): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) as total FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE s.user_id = $1 AND b.status = 'pending'`,
      [userId]
    );
    return parseInt(result.rows[0]?.total || '0');
  },
};
