import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";


const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "API funcionando",
      time: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error DB");
  }
});

app.get("/debug/data", async (req, res) => {
  try {
    const users = await pool.query("SELECT id, name, email, created_at FROM users");
    const services = await pool.query("SELECT id, user_id, name, description, duration, price, slug, booking_slug FROM services");
    const bookings = await pool.query("SELECT id, service_id, client_name, client_email, start_time, end_time, status FROM bookings");
    
    res.json({
      users: users.rows,
      services: services.rows,
      bookings: bookings.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo datos" });
  }
});

app.use((req, res) => {
  console.log("Ruta no encontrada:", req.method, req.url);
  res.status(404).send("Not found");
});

export default app;