// Utilidades de fecha en zona local.
// Evitar `new Date().toISOString().split("T")[0]`: devuelve la fecha UTC y
// en Chile (UTC-3/-4) marca "manana" despues de las 20/21h.
// Evitar `new Date("YYYY-MM-DD")`: se parsea como medianoche UTC.

export function toDateOnly(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayDateOnly(): string {
  return toDateOnly(new Date());
}

export function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDateOnly(dateStr);
  d.setDate(d.getDate() + days);
  return toDateOnly(d);
}

export function getWeekDays(selectedDate: string, weekOffset = 0): Date[] {
  const date = parseDateOnly(selectedDate);
  const dayOfWeek = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}
