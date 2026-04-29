import pool from "../config/db.js";

export const createService = async (req, res) => {
  try {
    const { name, description, duration, price, timezone, start_hour, end_hour, service_type, is_package, package_services, allow_multiple } = req.body;
    const userId = req.user.id;

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).substring(2, 6);

    const bookingSlug = slug + "-book-" + Math.random().toString(36).substring(2, 6);

    const result = await pool.query(
      `INSERT INTO services (user_id, name, description, duration, price, slug, booking_slug, timezone, start_hour, end_hour, service_type, is_package, allow_multiple) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        userId,
        name,
        description,
        duration,
        price,
        slug,
        bookingSlug,
        timezone || "America/Santiago",
        start_hour || 9,
        end_hour || 18,
        service_type || "standard",
        is_package || false,
        allow_multiple || false,
      ]
    );

    const serviceId = result.rows[0].id;

    if (is_package && package_services && package_services.length > 0) {
      for (const svc of package_services) {
        await pool.query(
          `INSERT INTO service_packages (package_id, service_id, quantity) VALUES ($1, $2, $3)`,
          [serviceId, svc.service_id, svc.quantity || 1]
        );
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear servicio" });
  }
};

export const getServices = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query("SELECT * FROM services WHERE user_id = $1", [userId]);

    const services = result.rows;

    for (let i = 0; i < services.length; i++) {
      if (services[i].is_package) {
        const packageResult = await pool.query(
          `SELECT sp.*, s.name, s.duration, s.price FROM service_packages sp 
           JOIN services s ON sp.service_id = s.id WHERE sp.package_id = $1`,
          [services[i].id]
        );
        services[i].package_services = packageResult.rows;
      }
    }

    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener servicios" });
  }
};

export const getServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `SELECT s.*, u.name as provider_name, u.email as provider_email 
       FROM services s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.slug = $1 OR s.booking_slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener servicio" });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, price, timezone, start_hour, end_hour } = req.body;
    const userId = req.user.id;

    const check = await pool.query("SELECT user_id FROM services WHERE id = $1", [id]);
    if (check.rows.length === 0 || check.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "No tienes permiso" });
    }

    const result = await pool.query(
      `UPDATE services SET name = $1, description = $2, duration = $3, price = $4, timezone = $5, start_hour = $6, end_hour = $7 
       WHERE id = $8 RETURNING *`,
      [name, description, duration, price, timezone, start_hour, end_hour, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar servicio" });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const check = await pool.query("SELECT user_id FROM services WHERE id = $1", [id]);
    if (check.rows.length === 0 || check.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "No tienes permiso" });
    }

    await pool.query("DELETE FROM services WHERE id = $1", [id]);

    res.json({ message: "Servicio eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar servicio" });
  }
};