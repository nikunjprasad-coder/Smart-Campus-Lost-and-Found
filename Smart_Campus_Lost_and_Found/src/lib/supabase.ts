import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Item = {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string | null;
  category_id: string | null;
  location_id: string | null;
  reported_by: string;
  status: string;
  report_date: string;
  incident_date: string | null;
  color: string | null;
  brand: string | null;
  image_url: string | null;
  contact_info: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  location?: Location | null;
  reporter?: Profile | null;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  sort_order: number;
};

export type Location = {
  id: string;
  name: string;
  building: string | null;
  floor: string | null;
  description: string | null;
  sort_order: number;
};

export type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  student_id: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  created_at: string;
};

export type Claim = {
  id: string;
  item_id: string;
  claimant_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  message: string;
  verification_answer: string | null;
  handover_date: string | null;
  handover_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  claimant?: Profile | null;
  item?: Item | null;
  reviewer?: Profile | null;
};
