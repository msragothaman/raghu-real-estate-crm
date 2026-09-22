import {
  Site,
  Plot,
  Lead,
  ChannelPartner,
  FollowUp,
  LeadStatusHistory,
  PartnerAssignmentHistory,
  LeadNote,
  User,
  PlotStatus,
  LeadStatus,
  UserRole,
} from '../types/crm';
import {
  INITIAL_USERS,
  INITIAL_SITES,
  INITIAL_PLOTS,
  INITIAL_CHANNEL_PARTNERS,
  INITIAL_LEADS,
  INITIAL_FOLLOWUPS,
  INITIAL_STATUS_HISTORY,
  INITIAL_PARTNER_HISTORY,
  INITIAL_NOTES,
} from '../data/seedData';
import { getSupabaseCredentials, createSupabaseInstance } from './supabase';

interface CRMState {
  users: User[];
  currentUser: User;
  sites: Site[];
  plots: Plot[];
  leads: Lead[];
  channelPartners: ChannelPartner[];
  followups: FollowUp[];
  statusHistory: LeadStatusHistory[];
  partnerHistory: PartnerAssignmentHistory[];
  notes: LeadNote[];
  supabaseConnected: boolean;
}

type Listener = (state: CRMState) => void;

class CRMDataStore {
  private state: CRMState;
  private listeners: Set<Listener> = new Set();
  private storageKey = 'raghu_crm_database_v1';

  constructor() {
    this.state = this.loadInitialState();
    this.checkSupabaseSync();
  }

  private loadInitialState(): CRMState {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            users: parsed.users || INITIAL_USERS,
            currentUser: parsed.currentUser || INITIAL_USERS[0],
            sites: parsed.sites || INITIAL_SITES,
            plots: parsed.plots || INITIAL_PLOTS,
            leads: parsed.leads || INITIAL_LEADS,
            channelPartners: parsed.channelPartners || INITIAL_CHANNEL_PARTNERS,
            followups: parsed.followups || INITIAL_FOLLOWUPS,
            statusHistory: parsed.statusHistory || INITIAL_STATUS_HISTORY,
            partnerHistory: parsed.partnerHistory || INITIAL_PARTNER_HISTORY,
            notes: parsed.notes || INITIAL_NOTES,
            supabaseConnected: false,
          };
        }
      }
    } catch (e) {
      console.warn('LocalStorage unavailable or parsing failed', e);
    }

    return {
      users: INITIAL_USERS,
      currentUser: INITIAL_USERS[0],
      sites: INITIAL_SITES,
      plots: INITIAL_PLOTS,
      leads: INITIAL_LEADS,
      channelPartners: INITIAL_CHANNEL_PARTNERS,
      followups: INITIAL_FOLLOWUPS,
      statusHistory: INITIAL_STATUS_HISTORY,
      partnerHistory: INITIAL_PARTNER_HISTORY,
      notes: INITIAL_NOTES,
      supabaseConnected: false,
    };
  }

  private saveState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      }
    } catch (e) {
      console.warn('Failed to save state to localStorage', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): CRMState {
    return this.state;
  }

  public async checkSupabaseSync() {
    const { isConfigured } = getSupabaseCredentials();
    if (!isConfigured) {
      this.state.supabaseConnected = false;
      this.notify();
      return false;
    }

    const sb = createSupabaseInstance();
    if (!sb) {
      this.state.supabaseConnected = false;
      this.notify();
      return false;
    }

    try {
      // Test querying sites
      const { data, error } = await sb.from('sites').select('id').limit(1);
      if (!error) {
        this.state.supabaseConnected = true;
        this.notify();
        return true;
      }
    } catch {
      // Fallback
    }
    this.state.supabaseConnected = false;
    this.notify();
    return false;
  }

  public resetToDefaultSeedData() {
    localStorage.removeItem(this.storageKey);
    this.state = {
      users: INITIAL_USERS,
      currentUser: INITIAL_USERS[0],
      sites: INITIAL_SITES,
      plots: INITIAL_PLOTS,
      leads: INITIAL_LEADS,
      channelPartners: INITIAL_CHANNEL_PARTNERS,
      followups: INITIAL_FOLLOWUPS,
      statusHistory: INITIAL_STATUS_HISTORY,
      partnerHistory: INITIAL_PARTNER_HISTORY,
      notes: INITIAL_NOTES,
      supabaseConnected: this.state.supabaseConnected,
    };
    this.saveState();
  }

  // --- CURRENT USER / ROLE SWITCHING ---
  public setCurrentUserRole(role: UserRole) {
    const user = this.state.users.find((u) => u.role === role) || {
      ...this.state.currentUser,
      role,
    };
    this.state.currentUser = user;
    this.saveState();
  }

  // --- SITES ---
  public addSite(siteData: Omit<Site, 'id' | 'created_at' | 'updated_at'>): Site {
    const newSite: Site = {
      ...siteData,
      id: `site-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.sites.unshift(newSite);
    this.saveState();
    return newSite;
  }

  public updateSite(id: string, updates: Partial<Site>) {
    this.state.sites = this.state.sites.map((site) =>
      site.id === id ? { ...site, ...updates, updated_at: new Date().toISOString() } : site
    );
    this.saveState();
  }

  // --- PLOTS ---
  public addPlot(plotData: Omit<Plot, 'id' | 'created_at' | 'updated_at'>): Plot {
    const newPlot: Plot = {
      ...plotData,
      id: `plot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.plots.push(newPlot);
    this.saveState();
    return newPlot;
  }

  public updatePlotStatus(
    plotId: string,
    status: PlotStatus,
    customerName?: string | null,
    leadId?: string | null,
    notes?: string | null,
    price?: number
  ) {
    const today = new Date().toISOString().split('T')[0];
    this.state.plots = this.state.plots.map((p) => {
      if (p.id === plotId) {
        return {
          ...p,
          status,
          customer_name: customerName !== undefined ? customerName : p.customer_name,
          lead_id: leadId !== undefined ? leadId : p.lead_id,
          notes: notes !== undefined ? notes : p.notes,
          price: price !== undefined ? price : p.price,
          booking_date: status === 'BOOKED' ? today : p.booking_date,
          registration_date: status === 'REGISTRATION COMPLETED' ? today : p.registration_date,
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });
    this.saveState();
  }

  // --- LEADS ---
  public addLead(leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Lead {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.leads.unshift(newLead);

    // Record initial status in history
    this.state.statusHistory.unshift({
      id: `sh-${Date.now()}`,
      lead_id: newLead.id,
      old_status: undefined,
      new_status: newLead.status,
      changed_by: this.state.currentUser.name,
      changed_at: new Date().toISOString(),
    });

    // Record initial partner assignment if any
    if (newLead.assigned_channel_partner_id) {
      this.state.partnerHistory.unshift({
        id: `pah-${Date.now()}`,
        lead_id: newLead.id,
        old_partner_id: null,
        new_partner_id: newLead.assigned_channel_partner_id,
        changed_by: this.state.currentUser.name,
        changed_at: new Date().toISOString(),
      });
    }

    this.saveState();
    return newLead;
  }

  public updateLeadStatus(leadId: string, newStatus: LeadStatus) {
    const lead = this.state.leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    const oldStatus = lead.status;
    this.state.leads = this.state.leads.map((l) =>
      l.id === leadId ? { ...l, status: newStatus, updated_at: new Date().toISOString() } : l
    );

    this.state.statusHistory.unshift({
      id: `sh-${Date.now()}`,
      lead_id: leadId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: this.state.currentUser.name,
      changed_at: new Date().toISOString(),
    });

    this.saveState();
  }

  public reassignLeadPartner(leadId: string, newPartnerId: string | null) {
    const lead = this.state.leads.find((l) => l.id === leadId);
    if (!lead || lead.assigned_channel_partner_id === newPartnerId) return;

    const oldPartnerId = lead.assigned_channel_partner_id;
    this.state.leads = this.state.leads.map((l) =>
      l.id === leadId
        ? { ...l, assigned_channel_partner_id: newPartnerId, updated_at: new Date().toISOString() }
        : l
    );

    this.state.partnerHistory.unshift({
      id: `pah-${Date.now()}`,
      lead_id: leadId,
      old_partner_id: oldPartnerId,
      new_partner_id: newPartnerId,
      changed_by: this.state.currentUser.name,
      changed_at: new Date().toISOString(),
    });

    this.saveState();
  }

  public updateLead(leadId: string, updates: Partial<Lead>) {
    this.state.leads = this.state.leads.map((l) =>
      l.id === leadId ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
    );
    this.saveState();
  }

  // --- CHANNEL PARTNERS ---
  public addChannelPartner(partnerData: Omit<ChannelPartner, 'id' | 'created_at' | 'updated_at'>): ChannelPartner {
    const newPartner: ChannelPartner = {
      ...partnerData,
      id: `cp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.channelPartners.push(newPartner);
    this.saveState();
    return newPartner;
  }

  public updateChannelPartner(id: string, updates: Partial<ChannelPartner>) {
    this.state.channelPartners = this.state.channelPartners.map((cp) =>
      cp.id === id ? { ...cp, ...updates, updated_at: new Date().toISOString() } : cp
    );
    this.saveState();
  }

  // --- FOLLOW-UPS ---
  public addFollowUp(data: Omit<FollowUp, 'id' | 'created_at' | 'updated_at'>): FollowUp {
    const newFollowUp: FollowUp = {
      ...data,
      id: `f-${Date.now()}`,
      created_by: this.state.currentUser.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.followups.unshift(newFollowUp);
    this.saveState();
    return newFollowUp;
  }

  public updateFollowUpStatus(id: string, status: FollowUp['status']) {
    this.state.followups = this.state.followups.map((f) =>
      f.id === id ? { ...f, status, updated_at: new Date().toISOString() } : f
    );
    this.saveState();
  }

  public rescheduleFollowUp(id: string, date: string, time: string, notes?: string) {
    this.state.followups = this.state.followups.map((f) =>
      f.id === id
        ? {
            ...f,
            followup_date: date,
            followup_time: time,
            notes: notes || f.notes,
            status: 'Pending',
            updated_at: new Date().toISOString(),
          }
        : f
    );
    this.saveState();
  }

  // --- NOTES ---
  public addNote(leadId: string, noteText: string): LeadNote {
    const newNote: LeadNote = {
      id: `note-${Date.now()}`,
      lead_id: leadId,
      user_id: this.state.currentUser.id,
      author_name: this.state.currentUser.name,
      note: noteText,
      created_at: new Date().toISOString(),
    };
    this.state.notes.unshift(newNote);
    this.saveState();
    return newNote;
  }

  // --- COMPUTED / REPORTING HELPERS ---
  public getDashboardStats() {
    const { sites, plots, leads, channelPartners, followups } = this.state;

    const availablePlots = plots.filter((p) => p.status === 'AVAILABLE').length;
    const bookedPlots = plots.filter((p) => p.status === 'BOOKED').length;
    const soldPlots = plots.filter((p) => p.status === 'SOLD').length;
    const registrationCompletedPlots = plots.filter((p) => p.status === 'REGISTRATION COMPLETED').length;

    const newLeads = leads.filter((l) => l.status === 'NEW').length;
    const activePartners = channelPartners.filter((cp) => cp.status === 'ACTIVE').length;

    // Follow-ups due (Pending and date <= today)
    const today = new Date().toISOString().split('T')[0];
    const followupsDue = followups.filter((f) => f.status === 'Pending' && f.followup_date <= today).length;

    return {
      totalSites: sites.length,
      totalPlots: plots.length,
      availablePlots,
      bookedPlots,
      soldPlots,
      registrationCompletedPlots,
      totalLeads: leads.length,
      newLeads,
      followupsDue,
      activePartners,
    };
  }

  public getSitePlotMetrics(siteId: string) {
    const sitePlots = this.state.plots.filter((p) => p.site_id === siteId);
    return {
      total: sitePlots.length,
      available: sitePlots.filter((p) => p.status === 'AVAILABLE').length,
      hold: sitePlots.filter((p) => p.status === 'HOLD').length,
      booked: sitePlots.filter((p) => p.status === 'BOOKED').length,
      sold: sitePlots.filter((p) => p.status === 'SOLD').length,
      registrationCompleted: sitePlots.filter((p) => p.status === 'REGISTRATION COMPLETED').length,
    };
  }

  public getPartnerMetrics(partnerId: string) {
    const leads = this.state.leads.filter((l) => l.assigned_channel_partner_id === partnerId);
    const activeLeads = leads.filter((l) => l.status !== 'LOST' && l.status !== 'REGISTRATION COMPLETED');
    const bookings = leads.filter((l) => l.status === 'BOOKED').length;
    const registrations = leads.filter((l) => l.status === 'REGISTRATION COMPLETED').length;
    const followups = this.state.followups.filter((f) => f.assigned_partner_id === partnerId).length;
    const siteVisits = leads.filter((l) => l.status === 'SITE VISIT').length;
    const conversionRate = leads.length > 0 ? Math.round(((bookings + registrations) / leads.length) * 100) : 0;

    return {
      totalLeads: leads.length,
      activeLeads: activeLeads.length,
      bookings,
      registrations,
      followups,
      siteVisits,
      conversionRate,
    };
  }
}

export const dataStore = new CRMDataStore();
