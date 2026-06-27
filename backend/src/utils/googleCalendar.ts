import { google } from "googleapis";
import type { Credentials, OAuth2Client } from "google-auth-library";
import { logger } from "./logger.js";
import type { Booking, Service } from "../types/index.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export const createOAuth2Client = (): OAuth2Client => {
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
};

export const getAuthUrl = async (oauth2Client: OAuth2Client): Promise<string> => {
  const scopes = [
    "https://www.googleapis.com/auth/calendar",
  ];
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
};

export const getTokens = async (oauth2Client: OAuth2Client, code: string): Promise<Credentials> => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

export const addToGoogleCalendar = async (
  tokens: Credentials,
  booking: Booking,
  service: Service
): Promise<unknown> => {
  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);

    const event = {
      summary: `${service.name} - ${booking.client_name}`,
      description: `
Cliente: ${booking.client_name}
Email: ${booking.client_email}
${booking.notes ? `Notas: ${booking.notes}` : ""}
      `.trim(),
      start: {
        dateTime: startTime.toISOString(),
        timeZone: service.timezone || "America/Santiago",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: service.timezone || "America/Santiago",
      },
      attendees: [{ email: booking.client_email }],
    };

    const result = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      sendUpdates: "all",
    });

    logger.info({ htmlLink: result.data.htmlLink }, "Evento creado en Google Calendar");
    return result.data;
  } catch (error) {
    logger.error({ err: error }, "Error adding to Google Calendar");
    return null;
  }
};

export const removeFromGoogleCalendar = async (
  tokens: Credentials,
  eventId: string
): Promise<boolean> => {
  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });

    logger.info("Evento eliminado de Google Calendar");
    return true;
  } catch (error) {
    logger.error({ err: error }, "Error removing from Google Calendar");
    return false;
  }
};
