import { logger } from '../utils/logger.js';
import { Booking, Service } from '../types/index.js';

let googleCalendar: typeof import('../utils/googleCalendar.js') | null = null;
let zoom: typeof import('../utils/zoom.js') | null = null;

async function loadModules() {
  if (!googleCalendar) {
    try {
      googleCalendar = await import('../utils/googleCalendar.js');
    } catch {
      // google calendar module not available
    }
  }
  if (!zoom) {
    try {
      zoom = await import('../utils/zoom.js');
    } catch {
      // zoom module not available
    }
  }
}

export const integrationService = {
  async onBookingCreated(booking: Booking, service: Service): Promise<void> {
    await loadModules();

    if (googleCalendar) {
      try {
        // TODO: get user's google tokens from DB when OAuth flow is implemented
        // For now, this requires tokens to be passed or stored per user
        logger.info(
          { bookingId: booking.id, service: service.name },
          'Google Calendar integration disponible - requiere tokens OAuth'
        );
      } catch (err) {
        logger.error({ err }, 'Error en integracion Google Calendar');
      }
    }

    if (zoom) {
      try {
        const meeting = await zoom.createZoomMeeting(booking, service);
        if (meeting) {
          logger.info(
            { bookingId: booking.id, meetingId: meeting.meeting_id },
            'Meeting Zoom creado'
          );
          // TODO: guardar meeting info en la reserva cuando se agregue columna a la tabla
        }
      } catch (err) {
        logger.error({ err }, 'Error en integracion Zoom');
      }
    }
  },

  async onBookingCancelled(booking: Booking): Promise<void> {
    await loadModules();

    if (googleCalendar) {
      try {
        logger.info(
          { bookingId: booking.id },
          'Google Calendar eliminacion disponible - requiere tokens OAuth'
        );
      } catch (err) {
        logger.error({ err }, 'Error al eliminar evento Google Calendar');
      }
    }

    if (zoom) {
      try {
        // TODO: guardar zoom_meeting_id en la tabla bookings
        // await zoom.deleteZoomMeeting(booking.zoom_meeting_id);
        logger.info(
          { bookingId: booking.id },
          'Zoom eliminacion disponible - requiere zoom_meeting_id en DB'
        );
      } catch (err) {
        logger.error({ err }, 'Error al eliminar meeting Zoom');
      }
    }
  },
};
