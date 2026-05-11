import app from "./app.js";
import pool, { initDb } from "./config/db.js";

const PORT = process.env.PORT || 3000;

const start = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

start();