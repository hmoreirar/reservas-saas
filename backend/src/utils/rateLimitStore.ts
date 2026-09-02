import pool from '../config/db.js';

export interface RateLimitEntry {
  totalHits: number;
  resetTime: Date | undefined;
}

export class PostgresRateLimitStore {
  localKeys = false;
  private windowMs = 60_000;

  init(options: { windowMs?: number }): void {
    this.windowMs = options.windowMs ?? this.windowMs;
  }

  async increment(key: string): Promise<RateLimitEntry> {
    const now = new Date();
    const resetAt = new Date(now.getTime() + this.windowMs);
    const result = await pool.query(
      `INSERT INTO rate_limits (key, count, reset_at)
       VALUES ($1, 1, $2)
       ON CONFLICT (key) DO UPDATE
       SET count = CASE WHEN rate_limits.reset_at <= $3 THEN 1 ELSE rate_limits.count + 1 END,
           reset_at = CASE WHEN rate_limits.reset_at <= $3 THEN $2 ELSE rate_limits.reset_at END
       RETURNING count, reset_at`,
      [key, resetAt, now]
    );
    return {
      totalHits: result.rows[0].count,
      resetTime: new Date(result.rows[0].reset_at),
    };
  }

  async decrement(key: string): Promise<void> {
    await pool.query(
      'UPDATE rate_limits SET count = GREATEST(count - 1, 0) WHERE key = $1',
      [key]
    );
  }

  async resetKey(key: string): Promise<void> {
    await pool.query('DELETE FROM rate_limits WHERE key = $1', [key]);
  }

  async resetAll(): Promise<void> {
    await pool.query('DELETE FROM rate_limits');
  }
}
