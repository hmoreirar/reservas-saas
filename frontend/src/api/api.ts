import type {
  Service,
  ServiceHour,
  ServiceBreak,
  Booking,
  TimeSlot,
  Stats,
  DayAgenda,
  PaginatedBookings,
  AuthUser,
  SessionResponse,
  MessageResponse,
  BookingStatusAction,
} from "@reservas/shared";

const API_URL = import.meta.env.VITE_API_URL || "";

// Error tipado de la API: reemplaza el patron antiguo de devolver `{ error } as T`.
// Los call sites capturan con try/catch y muestran err.message.
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function errorMessage(e: unknown, fallback = "Error inesperado"): string {
  return e instanceof ApiError ? e.message : fallback;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch {
    throw new ApiError("Error de conexion. Intenta de nuevo.", 0);
  }

  if (!res.ok) {
    if (res.status === 401 && !url.includes("/auth/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
      throw new ApiError("Sesion expirada", 401);
    }
    let message = `Error ${res.status}`;
    let code: string | undefined;
    try {
      const body = await res.json();
      message = body.error || message;
      code = body.code;
    } catch {
      // respuesta sin cuerpo JSON
    }
    throw new ApiError(message, res.status, code);
  }

  return res.json() as Promise<T>;
}

const authHeaders = (): HeadersInit => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

export const loginUser = async (email: string, password: string): Promise<SessionResponse> => {
  return apiFetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
};

export const registerUser = async (name: string, email: string, password: string): Promise<AuthUser> => {
  return apiFetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
};

export const getServices = async (): Promise<Service[]> => {
  return apiFetch(`${API_URL}/api/services`, { headers: authHeaders() });
};

export const getServiceBySlug = async (slug: string): Promise<Service> => {
  return apiFetch(`${API_URL}/api/services/${slug}`);
};

export const createService = async (serviceData: Record<string, unknown>): Promise<Service> => {
  return apiFetch(`${API_URL}/api/services`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(serviceData),
  });
};

export const updateService = async (id: number, serviceData: Record<string, unknown>): Promise<Service> => {
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

export const getPublicAvailability = async (serviceId: number, date: string): Promise<TimeSlot[]> => {
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
): Promise<Booking> => {
  return apiFetch(`${API_URL}/api/bookings`, {
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
};

export const createPublicBooking = async (
  serviceId: number,
  clientName: string,
  clientEmail: string,
  startTime: string,
  notes = ""
): Promise<{ booking: Booking; service: Service }> => {
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
): Promise<PaginatedBookings> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  return apiFetch(`${API_URL}/api/bookings/my?${params}`, {
    headers: authHeaders(),
  });
};

export const getStats = async (period?: string): Promise<Stats> => {
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

export const getServiceHours = async (serviceId: number): Promise<ServiceHour[]> => {
  return apiFetch(`${API_URL}/api/services/${serviceId}/hours`, {
    headers: authHeaders(),
  });
};

export const updateServiceHours = async (
  serviceId: number,
  hours: { day_of_week: number; start_hour: number; end_hour: number; is_active: boolean }[]
): Promise<ServiceHour[]> => {
  return apiFetch(`${API_URL}/api/services/${serviceId}/hours`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ hours }),
  });
};

export const getServiceBreaks = async (serviceId: number): Promise<ServiceBreak[]> => {
  return apiFetch(`${API_URL}/api/services/${serviceId}/breaks`, {
    headers: authHeaders(),
  });
};

export const createServiceBreak = async (
  serviceId: number,
  data: { name?: string; date: string; start_time: string; end_time: string; is_recurring?: boolean }
): Promise<ServiceBreak> => {
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

export const updateBookingStatus = async (
  id: number,
  status: BookingStatusAction,
  reason?: string
): Promise<MessageResponse> => {
  const body: Record<string, unknown> = { status };
  if (reason !== undefined) body.reason = reason;
  return apiFetch(`${API_URL}/api/bookings/${id}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
};
