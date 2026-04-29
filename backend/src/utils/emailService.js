import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

const formatDate = (dateStr) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("es-CL", { dateStyle: "long", hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
};

export const sendBookingConfirmation = async (booking, service, clientEmail, clientName) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Reservas SaaS" <noreply@reservassaas.com>',
    to: clientEmail,
    subject: `Confirmación de tu reserva: ${service?.name || "Servicio"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #667eea;">Reserva Confirmada</h1>
        <p>Hola ${clientName},</p>
        <p>Tu reserva ha sido confirmada exitosamente.</p>
        
        <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${service?.name || "Servicio"}</h2>
          <p><strong>Fecha:</strong> ${formatDate(booking?.start_time)}</p>
          <p><strong>Duración:</strong> ${service?.duration || 30} minutos</p>
          <p><strong>Precio:</strong> $${service?.price || 0}</p>
        </div>
        
        <p>Si necesitas cancelar o reprogramar, contacta al proveedor.</p>
        <p>¡Gracias por confiar en nosotros!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Error enviando email:", error.message);
  }
};

export const sendBookingCancellation = async (booking, service, clientEmail, clientName) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Reservas SaaS" <noreply@reservassaas.com>',
    to: clientEmail,
    subject: `Reserva cancelada: ${service?.name || "Servicio"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e53e3e;">Reserva Cancelada</h1>
        <p>Hola ${clientName},</p>
        <p>Tu reserva ha sido cancelada.</p>
        
        <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Servicio:</strong> ${service?.name || "Servicio"}</p>
          <p><strong>Fecha cancelada:</strong> ${formatDate(booking?.start_time)}</p>
        </div>
        
        <p>Si deseas volver a reservar, visita el enlace.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Error enviando email:", error.message);
  }
};

export const sendProviderNotification = async (providerEmail, providerName, booking, service) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Reservas SaaS" <noreply@reservassaas.com>',
    to: providerEmail,
    subject: `Nueva reserva: ${service?.name || "Servicio"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #667eea;">Nueva Reserva</h1>
        <p>Hola ${providerName},</p>
        <p>Tienes una nueva reserva.</p>
        
        <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Cliente:</strong> ${booking?.client_name}</p>
          <p><strong>Email:</strong> ${booking?.client_email}</p>
          <p><strong>Servicio:</strong> ${service?.name || "Servicio"}</p>
          <p><strong>Fecha:</strong> ${formatDate(booking?.start_time)}</p>
          ${booking?.notes ? `<p><strong>Notas:</strong> ${booking.notes}</p>` : ""}
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Error enviando email:", error.message);
  }
};