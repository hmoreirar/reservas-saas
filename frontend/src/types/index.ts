export interface Service {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  duration: number;
  price: number | null;
  slug: string;
  booking_slug: string | null;
  timezone: string;
  start_hour: number;
  end_hour: number;
  service_type: string;
  is_package: boolean;
  allow_multiple: boolean;
  max_capacity?: number;
  created_at: string;
}

export interface ServiceHour {
  id: number;
  service_id: number;
  day_of_week: number;
  start_hour: number;
  end_hour: number;
  is_active: boolean;
}

export interface ServiceBreak {
  id: number;
  service_id: number;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
}

export interface Booking {
  id: number;
  service_id: number;
  client_name: string;
  client_email: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  notes: string | null;
  created_at: string;
  price?: number | null;
  cancellation_reason?: string | null;
  service_name?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  revenue: number;
  byService: { name: string; total: number; revenue: number }[];
  upcoming: Booking[];
  last7Days: { date: string; total: number }[];
}

export type TimelineSlotType = 'available' | 'booked' | 'blocked' | 'past';

export interface TimelineSlot {
  time: string;
  start: string;
  end: string;
  type: TimelineSlotType;
  booking?: Booking;
  break?: {
    name: string;
    start_time: string;
    end_time: string;
  };
  capacity_used: number;
  capacity_max: number;
}

export interface DayAgenda {
  date: string;
  service_id: number;
  service_name: string;
  slots: TimelineSlot[];
}

export interface WeekDayOverview {
  date: string;
  day_of_week: number;
  label: string;
  total_slots: number;
  booked: number;
  available: number;
  blocked: number;
  past: number;
}

export interface PaginatedBookings {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WeekAgenda {
  start_date: string;
  service_id: number;
  service_name: string;
  days: WeekDayOverview[];
}
