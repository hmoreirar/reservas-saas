import pool from '../config/db.js';
import { Staff } from '../types/index.js';

export const staffRepository = {
  async findAllByUser(userId: number): Promise<Staff[]> {
    const result = await pool.query('SELECT * FROM staff WHERE user_id = $1', [userId]);
    return result.rows;
  },

  async findById(id: number): Promise<Staff | undefined> {
    const result = await pool.query('SELECT * FROM staff WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create(data: { user_id: number; name: string; email: string; role: string }): Promise<Staff> {
    const result = await pool.query(
      'INSERT INTO staff (user_id, name, email, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.user_id, data.name, data.email, data.role]
    );
    return result.rows[0];
  },

  async update(id: number, data: { name?: string; email?: string; role?: string }): Promise<Staff | undefined> {
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
      `UPDATE staff SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM staff WHERE id = $1', [id]);
  },
};
