import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "reservas_saas",
  port: process.env.DB_PORT || 5432,
});

pool.query("SELECT NOW()")
  .then((res) => {
    console.log("✅ DB conectada:", res.rows[0]);
  })
  .catch((err) => {
    console.error("❌ Error conectando a DB:", err.message);
  });

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS services (
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
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        service_id INT REFERENCES services(id) ON DELETE CASCADE,
        client_name VARCHAR(100) NOT NULL,
        client_email VARCHAR(100) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100),
        email VARCHAR(100),
        role VARCHAR(50) DEFAULT 'staff'
      );

      CREATE TABLE IF NOT EXISTS service_packages (
        id SERIAL PRIMARY KEY,
        package_id INT REFERENCES services(id) ON DELETE CASCADE,
        service_id INT REFERENCES services(id),
        quantity INT DEFAULT 1
      );
    `);
    console.log("✅ Tablas creadas/migraciones aplicadas");
  } catch (err) {
    console.log("ℹ️ Tablas ya existen o migración no necesaria:", err.message);
  }
};

export default pool;
export { initDb };