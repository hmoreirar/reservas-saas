import jwt from "jsonwebtoken";
import { logger } from "./logger.js";
import type { Booking, Service } from "../types/index.js";

const ZOOM_API_KEY = process.env.ZOOM_API_KEY ?? "";
const ZOOM_API_SECRET = process.env.ZOOM_API_SECRET ?? "";

interface ZoomMeeting {
  join_url: string;
  start_url: string;
  meeting_id: number;
  password: string;
}

const generateZoomToken = (): string => {
  return jwt.sign(
    {
      iss: ZOOM_API_KEY,
      exp: Math.floor(Date.now() / 1000) + 60,
    },
    ZOOM_API_SECRET
  );
};

export const createZoomMeeting = async (
  booking: Booking,
  service: Service
): Promise<ZoomMeeting | null> => {
  try {
    if (!ZOOM_API_KEY || !ZOOM_API_SECRET) {
      logger.warn("Zoom credentials not configured");
      return null;
    }

    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    const response = await fetch(`https://api.zoom.us/v2/users/me/meetings`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${generateZoomToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: `${service.name} - ${booking.client_name}`,
        type: 2,
        start_time: startTime.toISOString(),
        duration,
        timezone: service.timezone || "America/Santiago",
        agenda: `Cliente: ${booking.client_name}\nEmail: ${booking.client_email}`,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          waiting_room: false,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Zoom API error");
    }

    const meeting = await response.json();
    logger.info({ joinUrl: meeting.join_url }, "Meeting Zoom creado");
    return {
      join_url: meeting.join_url,
      start_url: meeting.start_url,
      meeting_id: meeting.id,
      password: meeting.password,
    };
  } catch (error) {
    logger.error({ err: error }, "Error creating Zoom meeting");
    return null;
  }
};

export const deleteZoomMeeting = async (meetingId: number): Promise<boolean | null> => {
  try {
    if (!ZOOM_API_KEY || !meetingId) return null;

    await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${generateZoomToken()}`,
      },
    });

    logger.info("Meeting Zoom eliminado");
    return true;
  } catch (error) {
    logger.error({ err: error }, "Error deleting Zoom meeting");
    return false;
  }
};
