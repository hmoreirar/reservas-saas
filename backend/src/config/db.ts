import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool, types } = pg;

// PostgreSQL devuelve NUMERIC e INT8 (COUNT/SUM) como strings.
// Los normalizamos a number en la frontera del driver para evitar
// inconsistencias de tipos y perdidas de decimales en los reportes.
types.setTypeParser(1700, (value: string) => Number(value)); // NUMERIC
types.setTypeParser(20, (value: string) => Number(value)); // INT8

export const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false'
            ? { rejectUnauthorized: false }
            : { rejectUnauthorized: true },
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'reservas_saas',
        port: Number(process.env.DB_PORT) || 5432,
      }
);

export default pool;
