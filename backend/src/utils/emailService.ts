import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const smtpConfigured = (): boolean =>
  !!(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = smtpConfigured()
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    })
  : null;

const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('es-CL', {
      dateStyle: 'long' as const,
      hour: '2-digit' as const,
      minute: '2-digit' as const,
    });
  } catch {
    return dateStr;
  }
};

interface EmailBooking {
  start_time?: Date | string;
  client_name?: string;
  client_email?: string;
  notes?: string | null;
}

interface EmailService {
  name?: string;
  duration?: number | null;
  price?: number | null;
}

export const sendBookingConfirmation = async (
  booking: EmailBooking,
  service: EmailService,
  clientEmail: string,
  clientName: string
): Promise<void> => {
  if (!transporter) return;

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM || '"Reservas SaaS" <noreply@reservassaas.com>',
    to: clientEmail,
    subject: `Confirmacion de tu reserva: ${service?.name || 'Servicio'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #667eea;">Reserva Confirmada</h1>
        <p>Hola ${clientName},</p>
        <p>Tu reserva ha sido confirmada exitosamente.</p>
        
        <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${service?.name || 'Servicio'}</h2>
          <p><strong>Fecha:</strong> ${formatDate(String(booking?.start_time))}</p>
          <p><strong>Duracion:</strong> ${service?.duration || 30} minutos</p>
          <p><strong>Precio:</strong> $${service?.price || 0}</p>
        </div>
        
        <p>Si necesitas cancelar o reprogramar, contacta al proveedor.</p>
        <p>Gracias por confiar en nosotros!</p>
      </div>
    `,
  });
};

export const sendBookingCancellation = async (
  booking: EmailBooking,
  service: EmailService,
  clientEmail: string,
  clientName: string
): Promise<void> => {
  if (!transporter) return;

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM || '"Reservas SaaS" <noreply@reservassaas.com>',
    to: clientEmail,
    subject: `Reserva cancelada: ${service?.name || 'Servicio'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e53e3e;">Reserva Cancelada</h1>
        <p>Hola ${clientName},</p>
        <p>Tu reserva ha sido cancelada.</p>
        
        <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Servicio:</strong> ${service?.name || 'Servicio'}</p>
          <p><strong>Fecha cancelada:</strong> ${formatDate(String(booking?.start_time))}</p>
        </div>
        
        <p>Si deseas volver a reservar, visita el enlace.</p>
      </div>
    `,
  });
};

export const sendProviderNotification = async (
  providerEmail: string,
  providerName: string,
  booking: EmailBooking,
  service: EmailService
): Promise<void> => {
  if (!transporter) return;

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM || '"Reservas SaaS" <noreply@reservassaas.com>',
    to: providerEmail,
    subject: `Nueva reserva: ${service?.name || 'Servicio'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #667eea;">Nueva Reserva</h1>
        <p>Hola ${providerName},</p>
        <p>Tienes una nueva reserva.</p>
        
        <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Cliente:</strong> ${booking?.client_name}</p>
          <p><strong>Email:</strong> ${booking?.client_email}</p>
          <p><strong>Servicio:</strong> ${service?.name || 'Servicio'}</p>
          <p><strong>Fecha:</strong> ${formatDate(String(booking?.start_time))}</p>
          ${booking?.notes ? `<p><strong>Notas:</strong> ${booking.notes}</p>` : ''}
        </div>
      </div>
    `,
  });
};
