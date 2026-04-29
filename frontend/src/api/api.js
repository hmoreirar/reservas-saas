const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const registerUser = async (name, email, password) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
};

export const getServices = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/services`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getServiceBySlug = async (slug) => {
  const res = await fetch(`${API_URL}/api/services/${slug}`);
  return res.json();
};

export const createService = async (serviceData) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(serviceData),
  });
  return res.json();
};

export const updateService = async (id, serviceData) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/services/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(serviceData),
  });
  return res.json();
};

export const deleteService = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/services/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getAvailability = async (serviceId, date) => {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `${API_URL}/api/bookings/availability?service_id=${serviceId}&date=${date}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.json();
};

export const getPublicAvailability = async (serviceId, date) => {
  const res = await fetch(
    `${API_URL}/api/bookings/public/availability?service_id=${serviceId}&date=${date}`
  );
  return res.json();
};

export const createBooking = async (serviceId, clientName, clientEmail, startTime, notes = "") => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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

export const createPublicBooking = async (serviceId, clientName, clientEmail, startTime, notes = "") => {
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

export const getMyBookings = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/bookings/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getStats = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/bookings/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const cancelBooking = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/bookings/${id}/cancel`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const rescheduleBooking = async (id, newStartTime) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/bookings/${id}/reschedule`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ new_start_time: newStartTime }),
  });
  return res.json();
};

export const getStaff = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/staff`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const addStaff = async (staffData) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/staff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(staffData),
  });
  return res.json();
};

export const deleteStaff = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/staff/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};