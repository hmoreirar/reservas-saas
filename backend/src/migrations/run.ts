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
];

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
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
    logger.info('Migraciones completadas');
  } catch (err) {
    logger.error({ err }, 'Error ejecutando migraciones');
    throw err;
  } finally {
    client.release();
  }
}
