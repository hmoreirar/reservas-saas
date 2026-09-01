import type { Service, Stats, TimeSlot, DayAgenda, WeekAgenda } from "../types";

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

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    if (res.status === 401 && !url.includes("/auth/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
      return { error: "Sesion expirada" } as T;
    }
    try {
      const body = await res.json();
      return { error: body.error || `Error ${res.status}` } as T;
    } catch {
      return { error: `Error ${res.status}: ${res.statusText}` } as T;
    }
  }
  return res.json();
}

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  return apiFetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
};

export const registerUser = async (name: string, email: string, password: string): Promise<RegisterResponse> => {
  return apiFetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
};

const authHeaders = (): HeadersInit => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

export const getServices = async (): Promise<Service[]> => {
  return apiFetch(`${API_URL}/api/services`, { headers: authHeaders() });
};

export const getServiceBySlug = async (slug: string): Promise<Service | { error: string }> => {
  return apiFetch(`${API_URL}/api/services/${slug}`);
};

export const createService = async (serviceData: Record<string, unknown>): Promise<IdResponse> => {
  return apiFetch(`${API_URL}/api/services`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(serviceData),
  });
};

export const updateService = async (id: number, serviceData: Record<string, unknown>): Promise<IdResponse> => {
  return apiFetch(`${API_URL}/api/services/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(serviceData),
  });
};

export const deleteService = async (id: number): Promise<MessageResponse> => {
  return apiFetch(`${API_URL}/api/services/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
};

export const getAvailability = async (serviceId: number, date: string): Promise<TimeSlot[]> => {
  return apiFetch(
    `${API_URL}/api/bookings/availability?service_id=${serviceId}&date=${date}`,
    { headers: authHeaders() }
  );
};

export const getPublicAvailability = async (serviceId: number, date: string): Promise<TimeSlot[] | { error: string }> => {
  return apiFetch(
    `${API_URL}/api/bookings/public/availability?service_id=${serviceId}&date=${date}`
  );
};

export const createBooking = async (
  serviceId: number,
  clientName: string,
  clientEmail: string,
  startTime: string,
  notes = "",
): Promise<IdResponse> => {
  const body: Record<string, unknown> = {
    service_id: serviceId,
    client_name: clientName,
    client_email: clientEmail,
    start_time: startTime,
    notes,
  };
  return apiFetch(`${API_URL}/api/bookings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
};

export const createPublicBooking = async (
  serviceId: number,
  clientName: string,
  clientEmail: string,
  startTime: string,
  notes = ""
): Promise<PublicBookingResponse> => {
  return apiFetch(`${API_URL}/api/bookings/public`, {
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
};

export const getMyBookings = async (
  page = 1,
  limit = 20,
  search?: string,
  status?: string
): Promise<import("../types").PaginatedBookings> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  return apiFetch(`${API_URL}/api/bookings/my?${params}`, {
    headers: authHeaders(),
  });
};

export const getStats = async (period?: string): Promise<Stats | { error: string }> => {
  const params = period ? `?period=${period}` : "";
  return apiFetch(`${API_URL}/api/bookings/stats${params}`, {
    headers: authHeaders(),
  });
};

export const cancelBooking = async (id: number): Promise<MessageResponse> => {
  return apiFetch(`${API_URL}/api/bookings/${id}/cancel`, {
    method: "PUT",
    headers: authHeaders(),
  });
};

export const rescheduleBooking = async (id: number, newStartTime: string): Promise<MessageResponse> => {
  return apiFetch(`${API_URL}/api/bookings/${id}/reschedule`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ new_start_time: newStartTime }),
  });
};

export const getStaff = async (): Promise<unknown[]> => {
  return apiFetch(`${API_URL}/api/staff`, {
    headers: authHeaders(),
  });
};

export const addStaff = async (staffData: Record<string, unknown>): Promise<unknown> => {
  return apiFetch(`${API_URL}/api/staff`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(staffData),
  });
};

export const deleteStaff = async (id: number): Promise<MessageResponse> => {
  return apiFetch(`${API_URL}/api/staff/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
};

export const getServiceHours = async (serviceId: number): Promise<import("../types").ServiceHour[]> => {
  return apiFetch(`${API_URL}/api/services/${serviceId}/hours`, {
    headers: authHeaders(),
  });
};

export const updateServiceHours = async (serviceId: number, hours: { day_of_week: number; start_hour: number; end_hour: number; is_active: boolean }[]): Promise<import("../types").ServiceHour[]> => {
  return apiFetch(`${API_URL}/api/services/${serviceId}/hours`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ hours }),
  });
};

export const getServiceBreaks = async (serviceId: number): Promise<import("../types").ServiceBreak[]> => {
  return apiFetch(`${API_URL}/api/services/${serviceId}/breaks`, {
    headers: authHeaders(),
  });
};

export const createServiceBreak = async (serviceId: number, data: { name?: string; date: string; start_time: string; end_time: string; is_recurring?: boolean }): Promise<import("../types").ServiceBreak> => {
  return apiFetch(`${API_URL}/api/services/${serviceId}/breaks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
};

export const deleteServiceBreak = async (serviceId: number, breakId: number): Promise<MessageResponse> => {
  return apiFetch(`${API_URL}/api/services/${serviceId}/breaks/${breakId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
};

export const getDayAgenda = async (date: string, serviceId?: number): Promise<DayAgenda[]> => {
  const params = new URLSearchParams({ date });
  if (serviceId) params.set("service_id", String(serviceId));
  return apiFetch(`${API_URL}/api/agenda/day?${params}`, {
    headers: authHeaders(),
  });
};

export const getWeekAgenda = async (startDate: string, serviceId?: number): Promise<WeekAgenda[]> => {
  const params = new URLSearchParams({ start_date: startDate });
  if (serviceId) params.set("service_id", String(serviceId));
  return apiFetch(`${API_URL}/api/agenda/week?${params}`, {
    headers: authHeaders(),
  });
};

export const updateBookingStatus = async (id: number, status: string, reason?: string): Promise<MessageResponse> => {
  const body: Record<string, unknown> = { status };
  if (reason !== undefined) body.reason = reason;
  return apiFetch(`${API_URL}/api/bookings/${id}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
};
