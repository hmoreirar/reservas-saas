import app from './app.js';
import { runMigrations } from './migrations/run.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await runMigrations();
    app.listen(PORT, () => {
      logger.info({ port: PORT }, 'Servidor iniciado');
    });
  } catch (err) {
    logger.error({ err }, 'Error al iniciar servidor');
    process.exit(1);
  }
};

start();
