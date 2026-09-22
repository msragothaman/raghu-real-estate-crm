export type PlotStatus = 'AVAILABLE' | 'HOLD' | 'BOOKED' | 'SOLD' | 'REGISTRATION COMPLETED';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'FOLLOW UP'
  | 'SITE VISIT'
  | 'INTERESTED'
  | 'NEGOTIATION'
  | 'BOOKED'
  | 'REGISTRATION COMPLETED'
  | 'LOST';

export type LeadSource =
  | 'Google'
  | 'Meta'
  | 'WhatsApp'
  | 'Website'
  | 'Referral'
  | 'Channel Partner'
  | 'Other';

export type UserRole = 'ADMIN' | 'SALES USER' | 'CHANNEL PARTNER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  created_at: string;
}

export interface Site {
  id: string;
  name: string;
  location: string;
  address?: string;
  total_area?: string;
  description?: string;
  maps_url?: string;
  approval_info?: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'ON_HOLD';
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Plot {
  id: string;
  site_id: string;
  plot_number: string;
  size_sqft: number;
  price: number;
  facing: 'East' | 'West' | 'North' | 'South' | 'North-East' | 'North-West' | 'South-East' | 'South-West';
  status: PlotStatus;
  lead_id?: string | null;
  customer_name?: string | null;
  booking_date?: string | null;
  registration_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChannelPartner {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  location?: string;
  status: 'ACTIVE' | 'INACTIVE';
  joining_date: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  source: LeadSource;
  campaign?: string;
  interested_site_id?: string | null;
  preferred_plot_size?: string;
  budget?: string;
  purpose?: string; // e.g. "Investment", "Own Villa / House"
  preferred_location?: string;
  status: LeadStatus;
  assigned_user_id?: string | null;
  assigned_channel_partner_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadStatusHistory {
  id: string;
  lead_id: string;
  old_status?: LeadStatus;
  new_status: LeadStatus;
  changed_by: string;
  changed_at: string;
}

export interface PartnerAssignmentHistory {
  id: string;
  lead_id: string;
  old_partner_id?: string | null;
  new_partner_id?: string | null;
  changed_by: string;
  changed_at: string;
}

export type FollowUpType = 'Phone Call' | 'WhatsApp' | 'Site Visit' | 'Meeting' | 'Other';
export type FollowUpStatus = 'Pending' | 'Completed' | 'Cancelled' | 'Missed';

export interface FollowUp {
  id: string;
  lead_id: string;
  assigned_partner_id?: string | null;
  followup_date: string; // YYYY-MM-DD
  followup_time?: string; // HH:MM
  type: FollowUpType;
  notes?: string;
  status: FollowUpStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  user_id?: string;
  author_name: string;
  note: string;
  created_at: string;
}

export interface SitePlotMetrics {
  total: number;
  available: number;
  hold: number;
  booked: number;
  sold: number;
  registrationCompleted: number;
}
