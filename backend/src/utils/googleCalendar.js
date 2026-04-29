import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export const createOAuth2Client = () => {
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
};

export const getAuthUrl = async (oauth2Client) => {
  const scopes = [
    "https://www.googleapis.com/auth/calendar",
  ];
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
};

export const getTokens = async (oauth2Client, code) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

export const addToGoogleCalendar = async (tokens, booking, service) => {
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
      resource: event,
      sendUpdates: "all",
    });

    console.log("📅 Evento creado en Google Calendar:", result.data.htmlLink);
    return result.data;
  } catch (error) {
    console.error("❌ Error adding to Google Calendar:", error.message);
    return null;
  }
};

export const removeFromGoogleCalendar = async (tokens, eventId) => {
  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });

    console.log("📅 Evento eliminado de Google Calendar");
    return true;
  } catch (error) {
    console.error("❌ Error removing from Google Calendar:", error.message);
    return false;
  }
};