export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      church_settings: {
        Row: {
          address: string
          announcement_active: boolean | null
          announcement_text: string | null
          email: string | null
          full_name: string
          id: string
          motto: string | null
          name: string
          phone: string | null
          service_times: Json | null
          short_address: string | null
          tagline: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          announcement_active?: boolean | null
          announcement_text?: string | null
          email?: string | null
          full_name: string
          id?: string
          motto?: string | null
          name: string
          phone?: string | null
          service_times?: Json | null
          short_address?: string | null
          tagline?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          announcement_active?: boolean | null
          announcement_text?: string | null
          email?: string | null
          full_name?: string
          id?: string
          motto?: string | null
          name?: string
          phone?: string | null
          service_times?: Json | null
          short_address?: string | null
          tagline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          location: string
          time: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          date: string
          description?: string | null
          id: string
          location: string
          time: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          location?: string
          time?: string
          title?: string
        }
        Relationships: []
      }
      giving_records: {
        Row: {
          amount: number
          created_at: string | null
          donor_email: string | null
          donor_name: string | null
          frequency: string
          fund: string
          id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          donor_email?: string | null
          donor_name?: string | null
          frequency: string
          fund: string
          id?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          donor_email?: string | null
          donor_name?: string | null
          frequency?: string
          fund?: string
          id?: string
        }
        Relationships: []
      }
      guest_visits: {
        Row: {
          adults_count: number | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          kids_count: number | null
          phone: string | null
          service_time: string
          status: string | null
        }
        Insert: {
          adults_count?: number | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          kids_count?: number | null
          phone?: string | null
          service_time: string
          status?: string | null
        }
        Update: {
          adults_count?: number | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          kids_count?: number | null
          phone?: string | null
          service_time?: string
          status?: string | null
        }
        Relationships: []
      }
      ministries: {
        Row: {
          age_group: string | null
          color_theme: string | null
          description: string | null
          highlights: Json | null
          id: string
          image: string | null
          lead: string | null
          schedule: string | null
          sort_order: number | null
          tagline: string | null
          title: string
        }
        Insert: {
          age_group?: string | null
          color_theme?: string | null
          description?: string | null
          highlights?: Json | null
          id: string
          image?: string | null
          lead?: string | null
          schedule?: string | null
          sort_order?: number | null
          tagline?: string | null
          title: string
        }
        Update: {
          age_group?: string | null
          color_theme?: string | null
          description?: string | null
          highlights?: Json | null
          id?: string
          image?: string | null
          lead?: string | null
          schedule?: string | null
          sort_order?: number | null
          tagline?: string | null
          title?: string
        }
        Relationships: []
      }
      prayer_requests: {
        Row: {
          category: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_confidential: boolean | null
          phone: string | null
          request: string
          status: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_confidential?: boolean | null
          phone?: string | null
          request: string
          status?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_confidential?: boolean | null
          phone?: string | null
          request?: string
          status?: string | null
        }
        Relationships: []
      }
      sermons: {
        Row: {
          created_at: string | null
          date: string
          duration: string | null
          id: string
          is_featured: boolean | null
          passage: string | null
          series: string | null
          speaker: string
          summary: string | null
          thumbnail: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          duration?: string | null
          id: string
          is_featured?: boolean | null
          passage?: string | null
          series?: string | null
          speaker: string
          summary?: string | null
          thumbnail?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          duration?: string | null
          id?: string
          is_featured?: boolean | null
          passage?: string | null
          series?: string | null
          speaker?: string
          summary?: string | null
          thumbnail?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      service_attendance: {
        Row: {
          id: string
          service_date: string
          service_name: string
          men_count: number
          women_count: number
          children_count: number
          total_count: number
          head_usher_name: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          service_date: string
          service_name: string
          men_count?: number
          women_count?: number
          children_count?: number
          head_usher_name?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          service_date?: string
          service_name?: string
          men_count?: number
          women_count?: number
          children_count?: number
          head_usher_name?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      staff_users: {
        Row: {
          id: string
          name: string
          role: string
          title: string
          email: string
          phone: string | null
          passkey: string
          avatar_initials: string
          is_active: boolean
          last_login_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          role: string
          title: string
          email: string
          phone?: string | null
          passkey: string
          avatar_initials: string
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          role?: string
          title?: string
          email?: string
          phone?: string | null
          passkey?: string
          avatar_initials?: string
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type ChurchSettingsRow = Database['public']['Tables']['church_settings']['Row']
export type SermonRow = Database['public']['Tables']['sermons']['Row']
export type EventRow = Database['public']['Tables']['events']['Row']
export type MinistryRow = Database['public']['Tables']['ministries']['Row']
export type PrayerRequestRow = Database['public']['Tables']['prayer_requests']['Row']
export type GuestVisitRow = Database['public']['Tables']['guest_visits']['Row']
export type GivingRecordRow = Database['public']['Tables']['giving_records']['Row']

export interface ServiceAttendanceRow {
  id: string;
  service_date: string;
  service_name: string;
  men_count: number;
  women_count: number;
  children_count: number;
  total_count: number;
  head_usher_name?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface StaffUserRow {
  id: string;
  name: string;
  role: 'admin' | 'district_overseer' | 'resident_pastor' | 'secretariat' | 'head_usher';
  title: string;
  email: string;
  phone?: string | null;
  passkey: string;
  avatar_initials: string;
  is_active: boolean;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

