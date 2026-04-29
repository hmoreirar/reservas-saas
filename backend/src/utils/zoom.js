import dotenv from "dotenv";

dotenv.config();

const ZOOM_API_KEY = process.env.ZOOM_API_KEY;
const ZOOM_API_SECRET = process.env.ZOOM_API_SECRET;

export const createZoomMeeting = async (booking, service) => {
  try {
    if (!ZOOM_API_KEY || !ZOOM_API_SECRET) {
      console.log("⚠️ Zoom credentials not configured");
      return null;
    }

    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);
    const duration = Math.round((endTime - startTime) / 60000);

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
        duration: duration,
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
    console.log("📹 Meeting Zoom creado:", meeting.join_url);
    return {
      join_url: meeting.join_url,
      start_url: meeting.start_url,
      meeting_id: meeting.id,
      password: meeting.password,
    };
  } catch (error) {
    console.error("❌ Error creating Zoom meeting:", error.message);
    return null;
  }
};

const generateZoomToken = () => {
  return `${ZOOM_API_KEY}:${ZOOM_API_SECRET}`;
};

export const deleteZoomMeeting = async (meetingId) => {
  try {
    if (!ZOOM_API_KEY || !meetingId) return null;

    await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${generateZoomToken()}`,
      },
    });

    console.log("📹 Meeting Zoom eliminado");
    return true;
  } catch (error) {
    console.error("❌ Error deleting Zoom meeting:", error.message);
    return false;
  }
};