import { DateTime } from 'luxon';

export function serviceTimeZone(service: { timezone?: string | null }): string {
  return service.timezone || 'UTC';
}

export function dayStart(date: string, timezone: string): DateTime {
  return DateTime.fromISO(date, { zone: timezone });
}

export function dayUtcRange(date: string, timezone: string): { start: Date; end: Date } {
  const start = dayStart(date, timezone);
  return {
    start: start.toUTC().toJSDate(),
    end: start.plus({ days: 1 }).toUTC().toJSDate(),
  };
}

export function serviceDayOfWeek(date: string, timezone: string): number {
  return dayStart(date, timezone).weekday % 7;
}

export function timeParts(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(':').map(Number);
  return { hour: h ?? 0, minute: m ?? 0 };
}

export function toUtcIso(dateTime: DateTime): string {
  return dateTime.toUTC().toISO() as string;
}

export function instantToServiceDate(instant: Date, timezone: string): string {
  return DateTime.fromJSDate(instant).setZone(timezone).toFormat('yyyy-MM-dd');
}
