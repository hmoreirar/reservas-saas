import { logger } from '../utils/logger.js';
import { createZoomMeeting } from '../utils/zoom.js';
import type { Booking, Service } from '../types/index.js';

export const integrationService = {
  async onBookingCreated(booking: Booking, service: Service): Promise<void> {
    logger.info(
      { bookingId: booking.id, service: service.name },
      'Google Calendar integration disponible - requiere tokens OAuth'
    );

    try {
      const meeting = await createZoomMeeting(booking, service);
      if (meeting) {
        logger.info(
          { bookingId: booking.id, meetingId: meeting.meeting_id },
          'Meeting Zoom creado'
        );
      }
    } catch (err) {
      logger.error({ err }, 'Error en integracion Zoom');
    }
  },

  async onBookingCancelled(_booking: Booking): Promise<void> {
    logger.info('Google Calendar eliminacion disponible - requiere tokens OAuth');
    logger.info('Zoom eliminacion disponible - requiere zoom_meeting_id en DB');
  },
};
