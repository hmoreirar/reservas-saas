import pool from "../config/db.js";

export const getStaff = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT * FROM staff WHERE user_id = $1", [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener staff" });
  }
};

export const addStaff = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const userId = req.user.id;

    if (!name || !email) {
      return res.status(400).json({ error: "Nombre y email requeridos" });
    }

    const result = await pool.query(
      "INSERT INTO staff (user_id, name, email, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, name, email, role || "staff"]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar staff" });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const userId = req.user.id;

    const check = await pool.query("SELECT user_id FROM staff WHERE id = $1", [id]);
    if (check.rows.length === 0 || check.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "No tienes permiso" });
    }

    const result = await pool.query(
      "UPDATE staff SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING *",
      [name, email, role, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar staff" });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const check = await pool.query("SELECT user_id FROM staff WHERE id = $1", [id]);
    if (check.rows.length === 0 || check.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "No tienes permiso" });
    }

    await pool.query("DELETE FROM staff WHERE id = $1", [id]);
    res.json({ message: "Miembro eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar staff" });
  }
};

export const assignBookingToStaff = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { staffId } = req.body;
    const userId = req.user.id;

    const bookingCheck = await pool.query(
      `SELECT b.*, s.user_id FROM bookings b JOIN services s ON b.service_id = s.id WHERE b.id = $1`,
      [bookingId]
    );

    if (bookingCheck.rows.length === 0 || bookingCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "No tienes permiso" });
    }

    await pool.query("UPDATE bookings SET staff_id = $1 WHERE id = $2", [staffId, bookingId]);
    res.json({ message: "Reserva asignada a staff" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al asignar reserva" });
  }
};