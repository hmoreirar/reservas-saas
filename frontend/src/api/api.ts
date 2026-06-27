import type { Service, Booking, Stats, TimeSlot } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "";

interface AuthResponse {
  token?: string;
  user?: { id: number; name: string; email: string };
  error?: string;
}

interface RegisterResponse {
  id?: number;
  error?: string;
}

interface IdResponse {
  id?: number;
  error?: string;
}

interface MessageResponse {
  message?: string;
  error?: string;
}

interface PublicBookingResponse {
  booking?: { id: number };
  error?: string;
}

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const registerUser = async (name: string, email: string, password: string): Promise<RegisterResponse> => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
};

const authHeaders = (): HeadersInit => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

export const getServices = async (): Promise<Service[]> => {
  const res = await fetch(`${API_URL}/api/services`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const getServiceBySlug = async (slug: string): Promise<Service | { error: string }> => {
  const res = await fetch(`${API_URL}/api/services/${slug}`);
  return res.json();
};

export const createService = async (serviceData: Record<string, unknown>): Promise<IdResponse> => {
  const res = await fetch(`${API_URL}/api/services`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(serviceData),
  });
  return res.json();
};

export const updateService = async (id: number, serviceData: Record<string, unknown>): Promise<IdResponse> => {
  const res = await fetch(`${API_URL}/api/services/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(serviceData),
  });
  return res.json();
};

export const deleteService = async (id: number): Promise<MessageResponse> => {
  const res = await fetch(`${API_URL}/api/services/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const getAvailability = async (serviceId: number, date: string): Promise<TimeSlot[]> => {
  const res = await fetch(
    `${API_URL}/api/bookings/availability?service_id=${serviceId}&date=${date}`,
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
  return res.json();
};

export const getPublicAvailability = async (serviceId: number, date: string): Promise<TimeSlot[]> => {
  const res = await fetch(
    `${API_URL}/api/bookings/public/availability?service_id=${serviceId}&date=${date}`
  );
  return res.json();
};

export const createBooking = async (
  serviceId: number,
  clientName: string,
  clientEmail: string,
  startTime: string,
  notes = "",
  price?: number | null,
): Promise<IdResponse> => {
  const body: Record<string, unknown> = {
    service_id: serviceId,
    client_name: clientName,
    client_email: clientEmail,
    start_time: startTime,
    notes,
  };
  if (price !== undefined) body.price = price;
  const res = await fetch(`${API_URL}/api/bookings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
};

export const createPublicBooking = async (
  serviceId: number,
  clientName: string,
  clientEmail: string,
  startTime: string,
  notes = ""
): Promise<PublicBookingResponse> => {
  const res = await fetch(`${API_URL}/api/bookings/public`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: serviceId,
      client_name: clientName,
      client_email: clientEmail,
      start_time: startTime,
      notes,
    }),
  });
  return res.json();
};

export const getMyBookings = async (): Promise<Booking[]> => {
  const res = await fetch(`${API_URL}/api/bookings/my`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const getStats = async (period?: string): Promise<Stats | { error: string }> => {
  const params = period ? `?period=${period}` : "";
  const res = await fetch(`${API_URL}/api/bookings/stats${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const cancelBooking = async (id: number): Promise<MessageResponse> => {
  const res = await fetch(`${API_URL}/api/bookings/${id}/cancel`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const rescheduleBooking = async (id: number, newStartTime: string): Promise<MessageResponse> => {
  const res = await fetch(`${API_URL}/api/bookings/${id}/reschedule`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ new_start_time: newStartTime }),
  });
  return res.json();
};

export const getStaff = async (): Promise<unknown[]> => {
  const res = await fetch(`${API_URL}/api/staff`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const addStaff = async (staffData: Record<string, unknown>): Promise<unknown> => {
  const res = await fetch(`${API_URL}/api/staff`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(staffData),
  });
  return res.json();
};

export const deleteStaff = async (id: number): Promise<MessageResponse> => {
  const res = await fetch(`${API_URL}/api/staff/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const getServiceHours = async (serviceId: number): Promise<import("../types").ServiceHour[]> => {
  const res = await fetch(`${API_URL}/api/services/${serviceId}/hours`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const updateServiceHours = async (serviceId: number, hours: { day_of_week: number; start_hour: number; end_hour: number; is_active: boolean }[]): Promise<import("../types").ServiceHour[]> => {
  const res = await fetch(`${API_URL}/api/services/${serviceId}/hours`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ hours }),
  });
  return res.json();
};

export const getServiceBreaks = async (serviceId: number): Promise<import("../types").ServiceBreak[]> => {
  const res = await fetch(`${API_URL}/api/services/${serviceId}/breaks`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const createServiceBreak = async (serviceId: number, data: { name?: string; date: string; start_time: string; end_time: string; is_recurring?: boolean }): Promise<import("../types").ServiceBreak> => {
  const res = await fetch(`${API_URL}/api/services/${serviceId}/breaks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteServiceBreak = async (serviceId: number, breakId: number): Promise<MessageResponse> => {
  const res = await fetch(`${API_URL}/api/services/${serviceId}/breaks/${breakId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const updateBookingStatus = async (id: number, status: string, reason?: string): Promise<MessageResponse> => {
  const body: Record<string, unknown> = { status };
  if (reason !== undefined) body.reason = reason;
  const res = await fetch(`${API_URL}/api/bookings/${id}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
};
