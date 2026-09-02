import pool from '../config/db.js';
import { logger } from '../utils/logger.js';

const migrations = [
  `CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration INT DEFAULT 30,
    price DECIMAL(10,2),
    slug VARCHAR(100) UNIQUE,
    booking_slug VARCHAR(100) UNIQUE,
    timezone VARCHAR(50) DEFAULT 'America/Santiago',
    start_hour INT DEFAULT 9,
    end_hour INT DEFAULT 18,
    service_type VARCHAR(50) DEFAULT 'standard',
    is_package BOOLEAN DEFAULT false,
    allow_multiple BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    email VARCHAR(100),
    role VARCHAR(50) DEFAULT 'staff'
  )`,
  `CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    service_id INT REFERENCES services(id) ON DELETE CASCADE,
    client_name VARCHAR(100) NOT NULL,
    client_email VARCHAR(100) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS service_packages (
    id SERIAL PRIMARY KEY,
    package_id INT REFERENCES services(id) ON DELETE CASCADE,
    service_id INT REFERENCES services(id),
    quantity INT DEFAULT 1
  )`,
  `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS staff_id INT REFERENCES staff(id) ON DELETE SET NULL`,
  `CREATE TABLE IF NOT EXISTS service_hours (
    id SERIAL PRIMARY KEY,
    service_id INT REFERENCES services(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_hour INT NOT NULL CHECK (start_hour BETWEEN 0 AND 23),
    end_hour INT NOT NULL CHECK (end_hour BETWEEN 0 AND 23),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(service_id, day_of_week)
  )`,
  `CREATE TABLE IF NOT EXISTS service_breaks (
    id SERIAL PRIMARY KEY,
    service_id INT REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT '',
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT false
  )`,
  `ALTER TABLE services ADD COLUMN IF NOT EXISTS max_capacity INT DEFAULT 1`,
  `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price DECIMAL(10,2)`,
  `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMP`,
  `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(255)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_service_time_status
   ON bookings (service_id, start_time, end_time, status)`,
  `CREATE INDEX IF NOT EXISTS idx_services_user_id ON services (user_id)`,
  `CREATE OR REPLACE FUNCTION enforce_booking_capacity()
   RETURNS TRIGGER AS $$
   DECLARE
     service_capacity INTEGER;
     overlap_count INTEGER;
   BEGIN
     IF NEW.status NOT IN ('confirmed', 'pending') THEN
       RETURN NEW;
     END IF;

     PERFORM pg_advisory_xact_lock(NEW.service_id);

     SELECT max_capacity INTO service_capacity FROM services WHERE id = NEW.service_id;
     IF service_capacity IS NULL OR service_capacity < 1 THEN
       service_capacity := 1;
     END IF;

     SELECT COUNT(*) INTO overlap_count FROM bookings
      WHERE service_id = NEW.service_id
        AND id <> COALESCE(NEW.id, 0)
        AND status IN ('confirmed', 'pending')
        AND start_time < NEW.end_time
        AND end_time > NEW.start_time;

     IF overlap_count >= service_capacity THEN
       RAISE EXCEPTION 'Horario no disponible';
     END IF;

     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql`,
  `DROP TRIGGER IF EXISTS trg_booking_capacity ON bookings`,
  `CREATE TRIGGER trg_booking_capacity
   BEFORE INSERT OR UPDATE OF start_time, end_time, status ON bookings
   FOR EACH ROW EXECUTE FUNCTION enforce_booking_capacity()`,
  `DROP TRIGGER IF EXISTS trg_booking_capacity ON bookings`,
  `ALTER TABLE bookings ALTER COLUMN start_time TYPE timestamptz USING start_time AT TIME ZONE 'UTC'`,
  `ALTER TABLE bookings ALTER COLUMN end_time TYPE timestamptz USING end_time AT TIME ZONE 'UTC'`,
  `CREATE TRIGGER trg_booking_capacity
   BEFORE INSERT OR UPDATE OF start_time, end_time, status ON bookings
   FOR EACH ROW EXECUTE FUNCTION enforce_booking_capacity()`,
];

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(migrations[0]);

    for (let i = 1; i < migrations.length; i++) {
      const name = `migration_${i}`;
      const exists = await client.query(
        'SELECT 1 FROM migrations WHERE name = $1',
        [name]
      );
      if (exists.rows.length === 0) {
        await client.query(migrations[i]);
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [name]
        );
        logger.info({ migration: name }, 'Migracion aplicada');
      }
    }
    await client.query('COMMIT');
    logger.info('Migraciones completadas');
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error({ err }, 'Error ejecutando migraciones');
    throw err;
  } finally {
    client.release();
  }
}
