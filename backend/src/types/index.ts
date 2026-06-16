export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
}

export interface Service {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  duration: number;
  price: number | null;
  slug: string;
  booking_slug: string;
  timezone: string;
  start_hour: number;
  end_hour: number;
  service_type: string;
  is_package: boolean;
  allow_multiple: boolean;
  created_at: Date;
  provider_name?: string;
  provider_email?: string;
}

export interface Booking {
  id: number;
  service_id: number;
  client_name: string;
  client_email: string;
  start_time: Date;
  end_time: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes: string | null;
  created_at: Date;
  staff_id: number | null;
  price: number | null;
  service_name?: string;
  duration?: number;
}

export interface Staff {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: string;
}

export interface ServicePackage {
  id: number;
  package_id: number;
  service_id: number;
  quantity: number;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface BookingStats {
  total: number;
  confirmed: number;
  cancelled: number;
  revenue: number;
  byService: { name: string; total: number; revenue: number }[];
  last7Days: { date: string; total: number }[];
  upcoming: Booking[];
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  duration?: number;
  price?: number;
  timezone?: string;
  start_hour?: number;
  end_hour?: number;
  service_type?: string;
  is_package?: boolean;
  package_services?: { service_id: number; quantity?: number }[];
  allow_multiple?: boolean;
}

export interface CreateBookingInput {
  service_id: number;
  client_name: string;
  client_email: string;
  start_time: string;
  notes?: string;
}

export interface CreatePublicBookingInput {
  service_id: number | string;
  client_name: string;
  client_email: string;
  start_time: string;
  notes?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface StaffInput {
  name: string;
  email: string;
  role?: string;
}

export interface JwtPayload {
  id: number;
  email: string;
}
