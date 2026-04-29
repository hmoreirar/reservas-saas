import pool from "../config/db.js";
import { sendBookingConfirmation, sendBookingCancellation, sendProviderNotification } from "../utils/emailService.js";

export const createBooking = async (req, res) => {
  try {
    const { service_id, client_name, client_email, start_time, notes } = req.body;
    const userId = req.user.id;
    const serviceId = Number(service_id);

    if (!service_id || !start_time) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const serviceCheck = await pool.query(
      "SELECT user_id FROM services WHERE id = $1",
      [serviceId]
    );

    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    if (serviceCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "No tienes permiso para crear reservas de este servicio" });
    }

    const start = new Date(start_time);
    const serviceResult = await pool.query("SELECT * FROM services WHERE id = $1", [serviceId]);
    const service = serviceResult.rows[0];
    const duration = service.duration || 30;
    const end = new Date(start.getTime() + duration * 60000);

    const conflict = await pool.query(
      `SELECT 1 FROM bookings
       WHERE service_id = $1
       AND status IN ('confirmed', 'pending')
       AND start_time < $3
       AND end_time > $2`,
      [serviceId, start, end]
    );

    if (conflict.rows.length > 0) {
      return res.status(400).json({ error: "Horario no disponible" });
    }

    const result = await pool.query(
      `INSERT INTO bookings (service_id, client_name, client_email, start_time, end_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [serviceId, client_name, client_email, start, end, notes]
    );

    const booking = result.rows[0];
    
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    const user = userResult.rows[0];
    
    try {
      await sendBookingConfirmation(booking, service, client_email, client_name);
      await sendProviderNotification(user.email, user.name, booking, service);
    } catch (emailErr) {
      console.log("📧 Email no enviado ( SMTP no configurado):", emailErr.message);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al crear reserva:", error.message);
    res.status(500).json({ error: "Error al crear reserva" });
  }
};

export const createPublicBooking = async (req, res) => {
  try {
    const { service_id, client_name, client_email, start_time, notes } = req.body;

    if (!service_id || !start_time || !client_name || !client_email) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const serviceResult = await pool.query("SELECT * FROM services WHERE id = $1 OR booking_slug = $1", [service_id]);
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }
    const service = serviceResult.rows[0];
    const serviceId = service.id;

    const start = new Date(start_time);
    const duration = service.duration || 30;
    const end = new Date(start.getTime() + duration * 60000);

    const conflict = await pool.query(
      `SELECT 1 FROM bookings
       WHERE service_id = $1
       AND status IN ('confirmed', 'pending')
       AND start_time < $3
       AND end_time > $2`,
      [serviceId, start, end]
    );

    if (conflict.rows.length > 0) {
      return res.status(400).json({ error: "Horario no disponible" });
    }

    const result = await pool.query(
      `INSERT INTO bookings (service_id, client_name, client_email, start_time, end_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [serviceId, client_name, client_email, start, end, notes]
    );

    const booking = result.rows[0];
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [service.user_id]);
    const user = userResult.rows[0];
    
    await sendBookingConfirmation(booking, service, client_email, client_name);
    await sendProviderNotification(user.email, user.name, booking, service);

    res.json({ booking: result.rows[0], service: service });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear reserva" });
  }
};

export const getBookingsByDay = async (req, res) => {
  try {
    const service_id = Number(req.query.service_id);
    const date = req.query.date;
    const userId = req.user.id;

    const serviceCheck = await pool.query(
      "SELECT user_id FROM services WHERE id = $1",
      [service_id]
    );

    if (serviceCheck.rows.length === 0 || serviceCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "No tienes permiso" });
    }

    const start = `${date} 00:00:00`;
    const end = `${date} 23:59:59`;

    const result = await pool.query(
      `SELECT * FROM bookings
       WHERE service_id = $1
       AND start_time BETWEEN $2 AND $3
       ORDER BY start_time`,
      [service_id, start, end]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
};

export const getAvailability = async (req, res) => {
  try {
    const { service_id, date } = req.query;
    const userId = req.user?.id;

    console.log("📅 getAvailability - service_id:", service_id, "date:", date);

    const serviceResult = await pool.query("SELECT * FROM services WHERE id = $1", [service_id]);
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }
    const service = serviceResult.rows[0];

    if (userId && service.user_id !== userId) {
      return res.status(403).json({ error: "No tienes permiso" });
    }

    const duration = service.duration || 30;
    const startHour = service.start_hour || 9;
    const endHour = service.end_hour || 18;

    if (!date) {
      return res.status(400).json({ error: "Fecha requerida" });
    }

    const slots = [];
    let current = new Date(`${date}T${String(startHour).padStart(2, "0")}:00:00`);
    const endDay = new Date(`${date}T${String(endHour).padStart(2, "0")}:00:00`);

    while (current < endDay) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + duration * 60000);

      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
      });

      current.setMinutes(current.getMinutes() + duration);
    }

    const bookingsResult = await pool.query(
      `SELECT id, start_time, end_time FROM bookings
       WHERE service_id = $1
       AND DATE(start_time) = $2
       AND status IN ('confirmed', 'pending')
       ORDER BY start_time`,
      [service_id, date]
    );

    const bookings = bookingsResult.rows;
    const available = slots.filter((slot) => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);

      return !bookings.some((b) => {
        const bookingStart = new Date(b.start_time);
        const bookingEnd = new Date(b.end_time);
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });
    });

    res.json(available);
  } catch (error) {
    console.error("❌ Error en getAvailability:", error);
    res.status(500).json({ error: "Error al calcular disponibilidad" });
  }
};

export const getPublicAvailability = async (req, res) => {
  try {
    const { service_id, date } = req.query;

    if (!service_id || !date) {
      return res.status(400).json({ error: "Parámetros requeridos" });
    }

    return getAvailability(req, res);
  } catch (error) {
    console.error("❌ Error en getPublicAvailability:", error);
    res.status(500).json({ error: "Error al calcular disponibilidad" });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT b.*, s.name as service_name, s.duration, s.price 
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       WHERE s.user_id = $1 
       AND b.start_time >= NOW() 
       ORDER BY b.start_time`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
};

export const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalBookings = await pool.query(
      `SELECT COUNT(*) as total FROM bookings b JOIN services s ON b.service_id = s.id WHERE s.user_id = $1`,
      [userId]
    );

    const confirmedBookings = await pool.query(
      `SELECT COUNT(*) as total FROM bookings b JOIN services s ON b.service_id = s.id WHERE s.user_id = $1 AND b.status = 'confirmed'`,
      [userId]
    );

    const cancelledBookings = await pool.query(
      `SELECT COUNT(*) as total FROM bookings b JOIN services s ON b.service_id = s.id WHERE s.user_id = $1 AND b.status = 'cancelled'`,
      [userId]
    );

    const totalRevenue = await pool.query(
      `SELECT COALESCE(SUM(s.price), 0) as total FROM bookings b JOIN services s ON b.service_id = s.id WHERE s.user_id = $1 AND b.status = 'confirmed'`,
      [userId]
    );

    const byService = await pool.query(
      `SELECT s.name, COUNT(b.id) as total, COALESCE(SUM(s.price), 0) as revenue
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       WHERE s.user_id = $1 AND b.status = 'confirmed'
       GROUP BY s.id, s.name
       ORDER BY total DESC`,
      [userId]
    );

    const last7Days = await pool.query(
      `SELECT DATE(b.start_time) as date, COUNT(*) as total
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       WHERE s.user_id = $1 AND b.start_time >= NOW() - INTERVAL '7 days' AND b.status = 'confirmed'
       GROUP BY DATE(b.start_time)
       ORDER BY date`,
      [userId]
    );

    const upcomingBookings = await pool.query(
      `SELECT b.*, s.name as service_name
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       WHERE s.user_id = $1 AND b.start_time >= NOW() AND b.status = 'confirmed'
       ORDER BY b.start_time
       LIMIT 5`,
      [userId]
    );

    res.json({
      total: parseInt(totalBookings.rows[0]?.total || 0),
      confirmed: parseInt(confirmedBookings.rows[0]?.total || 0),
      cancelled: parseInt(cancelledBookings.rows[0]?.total || 0),
      revenue: parseInt(totalRevenue.rows[0]?.total || 0),
      byService: byService.rows,
      last7Days: last7Days.rows,
      upcoming: upcomingBookings.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const bookingResult = await pool.query(
      `SELECT b.*, s.user_id, s.name as service_name FROM bookings b JOIN services s ON b.service_id = s.id WHERE b.id = $1`,
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const booking = bookingResult.rows[0];
    if (booking.user_id !== userId) {
      return res.status(403).json({ error: "No tienes permiso" });
    }

    await pool.query(`UPDATE bookings SET status = 'cancelled' WHERE id = $1`, [id]);

    await sendBookingCancellation(booking, { name: booking.service_name }, booking.client_email, booking.client_name);

    res.json({ message: "Reserva cancelada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cancelar reserva" });
  }
};

export const rescheduleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_start_time } = req.body;
    const userId = req.user.id;

    if (!new_start_time) {
      return res.status(400).json({ error: "Nueva fecha y hora requeridas" });
    }

    const bookingResult = await pool.query(
      `SELECT b.*, s.user_id, s.duration FROM bookings b JOIN services s ON b.service_id = s.id WHERE b.id = $1`,
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const booking = bookingResult.rows[0];
    if (booking.user_id !== userId) {
      return res.status(403).json({ error: "No tienes permiso" });
    }

    const start = new Date(new_start_time);
    const duration = booking.duration || 30;
    const end = new Date(start.getTime() + duration * 60000);

    const conflict = await pool.query(
      `SELECT 1 FROM bookings
       WHERE service_id = $1
       AND id != $2
       AND status IN ('confirmed', 'pending')
       AND start_time < $4
       AND end_time > $3`,
      [booking.service_id, id, start, end]
    );

    if (conflict.rows.length > 0) {
      return res.status(400).json({ error: "Nuevo horario no disponible" });
    }

    await pool.query(
      `UPDATE bookings SET start_time = $1, end_time = $2 WHERE id = $3`,
      [start, end, id]
    );

    res.json({ message: "Reserva reprogramada", new_start: start, new_end: end });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al reprogramar reserva" });
  }
};