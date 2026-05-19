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
  notes = ""
): Promise<IdResponse> => {
  const res = await fetch(`${API_URL}/api/bookings`, {
    method: "POST",
    headers: authHeaders(),
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

export const getStats = async (): Promise<Stats | { error: string }> => {
  const res = await fetch(`${API_URL}/api/bookings/stats`, {
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
