import type { Booking, Service } from "../types";

// Mensajes pre-armados para WhatsApp: el proveedor confirma y recuerda
// citas con un click, sin escribir el mensaje a mano.

function whenLabel(booking: Booking): string {
  const date = new Date(booking.start_time).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const time = new Date(booking.start_time).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} a las ${time}`;
}

export function waRequestReceived(booking: Booking, service: Pick<Service, "name">): string {
  return `Hola ${booking.client_name}, recibimos tu solicitud de ${service.name} para el ${whenLabel(booking)}. Te confirmamos la hora por aqui mismo.`;
}

export function waConfirmed(booking: Booking, service: Pick<Service, "name">): string {
  return `Hola ${booking.client_name}, tu hora de ${service.name} quedo confirmada para el ${whenLabel(booking)}. ¡Te esperamos!`;
}

export function waReminder(booking: Booking, service: Pick<Service, "name">): string {
  return `Hola ${booking.client_name}, te recordamos tu cita de ${service.name} el ${whenLabel(booking)}. Si no puedes venir, avisanos por aqui.`;
}

export function waCancelled(booking: Booking, service: Pick<Service, "name">): string {
  return `Hola ${booking.client_name}, tu cita de ${service.name} del ${whenLabel(booking)} fue cancelada. Escribenos para agendar una nueva hora.`;
}
