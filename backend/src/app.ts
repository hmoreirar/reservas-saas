import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pinoHttp from 'pino-http';
import pool from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(cors());

app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'API funcionando',
      time: result.rows[0],
    });
  } catch (error) {
    logger.error(error, 'Health check fallo');
    res.status(500).send('Error DB');
  }
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(distPath));
}

app.use((req, res) => {
  if (process.env.NODE_ENV === 'production' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }
  res.status(404).send('Not found');
});

app.use(errorHandler);

export default app;
