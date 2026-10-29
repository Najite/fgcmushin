import { createClient } from '@supabase/supabase-js';
import type { Database, SermonRow, EventRow, MinistryRow, ChurchSettingsRow, GuestVisitRow, PrayerRequestRow, GivingRecordRow, ChurchFinanceRow, ServiceAttendanceRow, StaffUserRow, PastoralNoteRow, AuditLogRow } from '../types/database';
import type { Sermon, ChurchEvent, Ministry } from '../types';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://tmjuucclnumavnbyukmf.supabase.co';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtanV1Y2NsbnVtYXZuYnl1a21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMDk3ODUsImV4cCI6MjEwODY4NTc4NX0.ijT1SQhmUz1FvYswxK1EI4Hepl5HSj8cuziHnWvJ7GI';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Fetch church global settings and announcements
 */
export async function getChurchSettings(): Promise<ChurchSettingsRow | null> {
  try {
    const { data, error } = await supabase
      .from('church_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching church_settings from Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Network error fetching church_settings:', err);
    return null;
  }
}

/**
 * Update church settings (CMS)
 */
export async function updateChurchSettings(settings: Partial<ChurchSettingsRow>): Promise<{ success: boolean; error?: string }> {
  try {
    const targetId = settings.id || 'default';
    const { error } = await supabase
      .from('church_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .or(`id.eq.${targetId},id.eq.default,id.eq.fgc-mushin-dhq`);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Fetch sermons ordered by date descending
 */
export async function getSermons(): Promise<Sermon[]> {
  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .order('date', { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) console.warn('Supabase sermons fetch warning:', error.message);
      return [];
    }

    return data.map((s: SermonRow) => ({
      id: s.id,
      title: s.title,
      series: s.series || 'SUNDAY CELEBRATION',
      speaker: s.speaker,
      date: s.date,
      duration: s.duration || '35 min',
      passage: s.passage || 'Hebrews 13:8',
      thumbnail: s.thumbnail || '/images/sermon-series.jpg',
      summary: s.summary || '',
      videoUrl: s.video_url || undefined,
    }));
  } catch (err) {
    console.warn('Network error fetching sermons:', err);
    return [];
  }
}

/**
 * Fetch events ordered by date ascending
 */
export async function getEvents(): Promise<ChurchEvent[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) console.warn('Supabase events fetch warning:', error.message);
      return [];
    }

    return data.map((e: EventRow) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time,
      location: e.location,
      category: (e.category as ChurchEvent['category']) || 'Community',
      description: e.description || '',
    }));
  } catch (err) {
    console.warn('Network error fetching events:', err);
    return [];
  }
}

/**
 * Fetch ministries ordered by sort_order
 */
export async function getMinistries(): Promise<Ministry[]> {
  try {
    const { data, error } = await supabase
      .from('ministries')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) console.warn('Supabase ministries fetch warning:', error.message);
      return [];
    }

    return data.map((m: MinistryRow) => {
      let highlights: string[] = [];
      if (Array.isArray(m.highlights)) {
        highlights = m.highlights.map(item => String(item));
      }
      return {
        id: m.id,
        title: m.title,
        tagline: m.tagline || '',
        ageGroup: m.age_group || 'All Ages',
        schedule: m.schedule || 'Sundays',
        description: m.description || '',
        image: m.image || '/images/community-welcome.jpg',
        lead: m.lead || 'Ministry Director',
        highlights,
      };
    });
  } catch (err) {
    console.warn('Network error fetching ministries:', err);
    return [];
  }
}

/**
 * Submit guest visit registration
 */
export async function submitGuestVisit(data: {
  fullName: string;
  email: string;
  phone?: string;
  serviceTime: string;
  adultsCount?: number;
  kidsCount?: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('guest_visits').insert({
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || null,
      service_time: data.serviceTime,
      adults_count: data.adultsCount ?? 1,
      kids_count: data.kidsCount ?? 0,
      status: 'pending'
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Submit prayer request
 */
export async function submitPrayerRequest(data: {
  fullName: string;
  email?: string;
  phone?: string;
  category: string;
  request: string;
  isConfidential?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('prayer_requests').insert({
      full_name: data.fullName,
      email: data.email || null,
      phone: data.phone || null,
      category: data.category,
      request: data.request,
      is_confidential: data.isConfidential ?? false,
      status: 'received'
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Submit giving / pledge transaction record
 */
export async function submitGivingRecord(data: {
  amount: number;
  fund: string;
  frequency: string;
  donorName?: string;
  donorEmail?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('giving_records').insert({
      amount: data.amount,
      fund: data.fund,
      frequency: data.frequency,
      donor_name: data.donorName || null,
      donor_email: data.donorEmail || null
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

// ================= CMS Content Management Operations =================

/**
 * Add or update sermon
 */
export async function saveSermon(sermon: Partial<SermonRow> & { title: string; speaker: string; date: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const id = sermon.id || `sermon-${Date.now()}`;
    const payload = {
      ...sermon,
      id
    };
    const { error } = await supabase.from('sermons').upsert(payload);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Delete sermon
 */
export async function deleteSermon(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('sermons').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Add or update event
 */
export async function saveEvent(event: Partial<EventRow> & { title: string; date: string; time: string; location: string; category: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const id = event.id || `event-${Date.now()}`;
    const payload = {
      ...event,
      id
    };
    const { error } = await supabase.from('events').upsert(payload);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Delete event
 */
export async function deleteEvent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * CMS Fetch guest visits
 */
export async function getGuestVisits(): Promise<GuestVisitRow[]> {
  try {
    const { data, error } = await supabase
      .from('guest_visits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching guest visits:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Error fetching guest visits:', err);
    return [];
  }
}

/**
 * CMS Fetch prayer requests
 */
export async function getPrayerRequests(): Promise<PrayerRequestRow[]> {
  try {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching prayer requests:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Error fetching prayer requests:', err);
    return [];
  }
}

/**
 * CMS Fetch giving transactions
 */
export async function getGivingRecords(): Promise<GivingRecordRow[]> {
  try {
    const { data, error } = await supabase
      .from('giving_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching giving records:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Error fetching giving records:', err);
    return [];
  }
}

/**
 * Update prayer request status
 */
export async function updatePrayerStatus(id: string, status: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('prayer_requests').update({ status }).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Update guest visit follow-up status
 */
export async function updateGuestVisitStatus(id: string, status: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('guest_visits').update({ status }).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

// ================= IAM Staff Accounts & Service Headcount =================

/**
 * Fetch all registered church staff accounts
 */
export async function getStaffUsers(): Promise<StaffUserRow[]> {
  try {
    const { data, error } = await supabase
      .from('staff_users')
      .select('*')
      .order('role', { ascending: true });

    if (error) {
      console.warn('Error fetching staff_users:', error.message);
      return [];
    }
    return (data as unknown as StaffUserRow[]) || [];
  } catch (err) {
    console.warn('Network error fetching staff_users:', err);
    return [];
  }
}

/**
 * Update staff profile or passkey (Admin IAM)
 */
export async function updateStaffUser(id: string, updates: Partial<StaffUserRow>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('staff_users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Fetch service attendance logs
 */
export async function getServiceAttendance(): Promise<ServiceAttendanceRow[]> {
  try {
    const { data, error } = await supabase
      .from('service_attendance')
      .select('*')
      .order('service_date', { ascending: false });

    if (error) {
      console.warn('Error fetching service_attendance:', error.message);
      return [];
    }
    return (data as unknown as ServiceAttendanceRow[]) || [];
  } catch (err) {
    console.warn('Network error fetching service_attendance:', err);
    return [];
  }
}

/**
 * Fetch church finances records (inflows and outflows)
 */
export async function getChurchFinances(): Promise<ChurchFinanceRow[]> {
  try {
    const { data, error } = await supabase
      .from('church_finances')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (error) {
      console.warn('Error fetching church_finances:', error.message);
      return [];
    }
    return (data as unknown as ChurchFinanceRow[]) || [];
  } catch (err) {
    console.warn('Network error fetching church_finances:', err);
    return [];
  }
}

/**
 * Log new financial transaction (Income or Expense)
 */
export async function logFinancialTransaction(entry: {
  transaction_date: string;
  transaction_type: 'inflow' | 'outflow';
  category: string;
  amount: number;
  payment_method?: string;
  donor_or_payee?: string;
  reference_code?: string;
  notes?: string;
  recorded_by?: string;
}): Promise<{ success: boolean; data?: ChurchFinanceRow; error?: string }> {
  try {
    const { data, error } = await supabase.from('church_finances').insert({
      transaction_date: entry.transaction_date,
      transaction_type: entry.transaction_type,
      category: entry.category,
      amount: entry.amount,
      payment_method: entry.payment_method || 'bank_transfer',
      donor_or_payee: entry.donor_or_payee || null,
      reference_code: entry.reference_code || `TXN-${Date.now().toString().slice(-6)}`,
      notes: entry.notes || null,
      recorded_by: entry.recorded_by || 'Secretariat & Accounts'
    }).select().single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as unknown as ChurchFinanceRow };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Log new service attendance (Head Usher & Protocol)
 */
export async function logServiceAttendance(entry: {
  service_date: string;
  service_name: string;
  service_type?: string;
  men_count: number;
  women_count: number;
  children_count: number;
  head_usher_name?: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('service_attendance').insert({
      service_date: entry.service_date,
      service_name: entry.service_name,
      service_type: entry.service_type || 'sunday_service',
      men_count: entry.men_count,
      women_count: entry.women_count,
      children_count: entry.children_count,
      head_usher_name: entry.head_usher_name || 'Bro. Emmanuel Kalu',
      notes: entry.notes || null
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Fetch pastoral follow-up notes for guest visits
 */
export async function getPastoralNotes(guestId?: string): Promise<PastoralNoteRow[]> {
  try {
    let query = supabase.from('pastoral_notes').select('*').order('created_at', { ascending: false });
    if (guestId) {
      query = query.eq('guest_id', guestId);
    }
    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching pastoral_notes:', error.message);
      return [];
    }
    return (data as unknown as PastoralNoteRow[]) || [];
  } catch (err) {
    console.warn('Network error fetching pastoral_notes:', err);
    return [];
  }
}

/**
 * Add a pastoral interaction / counseling note
 */
export async function addPastoralNote(entry: {
  guest_id: string;
  staff_id: string;
  staff_name: string;
  staff_role: string;
  note: string;
  category?: string;
}): Promise<{ success: boolean; data?: PastoralNoteRow; error?: string }> {
  try {
    const { data, error } = await supabase.from('pastoral_notes').insert({
      guest_id: entry.guest_id,
      staff_id: entry.staff_id,
      staff_name: entry.staff_name,
      staff_role: entry.staff_role,
      note: entry.note,
      category: entry.category || 'follow_up'
    }).select().single();

    if (error) return { success: false, error: error.message };

    // Also write an audit log
    await logAuditEvent({
      staff_id: entry.staff_id,
      staff_name: entry.staff_name,
      staff_role: entry.staff_role,
      action: 'PASTORAL_NOTE_ADDED',
      entity_type: 'guest_visit',
      details: `Logged pastoral note on guest (${entry.guest_id.slice(0, 8)}...): ${entry.note.slice(0, 50)}...`
    });

    return { success: true, data: data as unknown as PastoralNoteRow };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Fetch enterprise audit logs for governance & compliance
 */
export async function getAuditLogs(limit: number = 50): Promise<AuditLogRow[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Error fetching audit_logs:', error.message);
      return [];
    }
    return (data as unknown as AuditLogRow[]) || [];
  } catch (err) {
    console.warn('Network error fetching audit_logs:', err);
    return [];
  }
}

/**
 * Record an audit log event
 */
export async function logAuditEvent(entry: {
  staff_id: string;
  staff_name: string;
  staff_role: string;
  action: string;
  entity_type: string;
  details?: string;
}): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      staff_id: entry.staff_id,
      staff_name: entry.staff_name,
      staff_role: entry.staff_role,
      action: entry.action,
      entity_type: entry.entity_type,
      details: entry.details || null
    });
  } catch (err) {
    console.warn('Audit logging note:', err);
  }
}

