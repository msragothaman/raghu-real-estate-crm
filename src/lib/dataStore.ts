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
  isSyncing: boolean;
  isAuthenticated: boolean;
}

type Listener = (state: CRMState) => void;

class CRMDataStore {
  private state: CRMState;
  private listeners: Set<Listener> = new Set();
  private storageKey = 'raghu_crm_database_v2';

  constructor() {
    this.state = this.loadInitialState();
    this.initSupabase();
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
            isSyncing: false,
            isAuthenticated: localStorage.getItem('raghu_crm_auth_session') === 'true',
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
      isSyncing: false,
      isAuthenticated: false,
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

  // --- SUPABASE CLOUD SYNC & OPERATIONS ---
  private async initSupabase() {
    const isConnected = await this.checkSupabaseSync();
    if (isConnected) {
      await this.loadFromSupabase();
    }
  }

  public async checkSupabaseSync(): Promise<boolean> {
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
      const { error } = await sb.from('sites').select('id').limit(1);
      if (!error) {
        this.state.supabaseConnected = true;
        this.notify();
        return true;
      }
    } catch (err) {
      console.warn('Supabase test query failed', err);
    }

    this.state.supabaseConnected = false;
    this.notify();
    return false;
  }

  public async loadFromSupabase(): Promise<boolean> {
    const sb = createSupabaseInstance();
    if (!sb || !this.state.supabaseConnected) return false;

    try {
      this.state.isSyncing = true;
      this.notify();

      const [sitesRes, plotsRes, leadsRes, partnersRes, followupsRes, notesRes, shRes, phRes] =
        await Promise.all([
          sb.from('sites').select('*').order('created_at', { ascending: false }),
          sb.from('plots').select('*'),
          sb.from('leads').select('*').order('created_at', { ascending: false }),
          sb.from('channel_partners').select('*'),
          sb.from('followups').select('*'),
          sb.from('notes').select('*'),
          sb.from('lead_status_history').select('*'),
          sb.from('partner_assignment_history').select('*'),
        ]);

      let hasSupabaseData = false;

      if (sitesRes.data && sitesRes.data.length > 0) {
        this.state.sites = sitesRes.data;
        hasSupabaseData = true;
      }
      if (plotsRes.data && plotsRes.data.length > 0) {
        this.state.plots = plotsRes.data;
        hasSupabaseData = true;
      }
      if (leadsRes.data && leadsRes.data.length > 0) {
        this.state.leads = leadsRes.data;
        hasSupabaseData = true;
      }
      if (partnersRes.data && partnersRes.data.length > 0) {
        this.state.channelPartners = partnersRes.data;
        hasSupabaseData = true;
      }
      if (followupsRes.data && followupsRes.data.length > 0) {
        this.state.followups = followupsRes.data;
        hasSupabaseData = true;
      }
      if (notesRes.data && notesRes.data.length > 0) {
        this.state.notes = notesRes.data;
        hasSupabaseData = true;
      }
      if (shRes.data && shRes.data.length > 0) {
        this.state.statusHistory = shRes.data;
      }
      if (phRes.data && phRes.data.length > 0) {
        this.state.partnerHistory = phRes.data;
      }

      this.state.isSyncing = false;
      this.saveState();
      return hasSupabaseData;
    } catch (err) {
      console.error('Failed to load from Supabase:', err);
      this.state.isSyncing = false;
      this.notify();
      return false;
    }
  }

  public async pushAllToSupabase(): Promise<{ success: boolean; message: string }> {
    const sb = createSupabaseInstance();
    if (!sb) {
      return { success: false, message: 'Supabase credentials not configured or invalid.' };
    }

    try {
      this.state.isSyncing = true;
      this.notify();

      // 1. Upsert users first so leads_assigned_user_id_fkey is satisfied
      if (this.state.users.length > 0) {
        const { error: usersErr } = await sb.from('users').upsert(this.state.users);
        if (usersErr) console.warn(`Users upsert warning: ${usersErr.message}`);
      }

      // 2. Upsert sites
      if (this.state.sites.length > 0) {
        const { error: sitesErr } = await sb.from('sites').upsert(this.state.sites);
        if (sitesErr) throw new Error(`Sites: ${sitesErr.message}`);
      }

      // 3. Upsert channel partners
      if (this.state.channelPartners.length > 0) {
        const { error: cpErr } = await sb.from('channel_partners').upsert(this.state.channelPartners);
        if (cpErr) throw new Error(`Channel Partners: ${cpErr.message}`);
      }

      // Foreign key lookup sets
      const validUserIds = new Set(this.state.users.map((u) => u.id));
      const validSiteIds = new Set(this.state.sites.map((s) => s.id));
      const validPartnerIds = new Set(this.state.channelPartners.map((cp) => cp.id));

      // 4. Upsert leads (sanitizing foreign keys)
      const sanitizedLeads = this.state.leads.map((l) => ({
        ...l,
        assigned_user_id:
          l.assigned_user_id && validUserIds.has(l.assigned_user_id)
            ? l.assigned_user_id
            : null,
        interested_site_id:
          l.interested_site_id && validSiteIds.has(l.interested_site_id)
            ? l.interested_site_id
            : null,
        assigned_channel_partner_id:
          l.assigned_channel_partner_id && validPartnerIds.has(l.assigned_channel_partner_id)
            ? l.assigned_channel_partner_id
            : null,
      }));

      if (sanitizedLeads.length > 0) {
        const { error: leadsErr } = await sb.from('leads').upsert(sanitizedLeads);
        if (leadsErr) throw new Error(`Leads: ${leadsErr.message}`);
      }

      // 5. Upsert plots (sanitizing lead_id and site_id)
      const validLeadIds = new Set(sanitizedLeads.map((l) => l.id));
      const sanitizedPlots = this.state.plots.map((p) => ({
        ...p,
        lead_id: p.lead_id && validLeadIds.has(p.lead_id) ? p.lead_id : null,
        site_id: validSiteIds.has(p.site_id) ? p.site_id : this.state.sites[0]?.id || p.site_id,
      }));

      if (sanitizedPlots.length > 0) {
        const { error: plotsErr } = await sb.from('plots').upsert(sanitizedPlots);
        if (plotsErr) throw new Error(`Plots: ${plotsErr.message}`);
      }

      // 6. Upsert followups (sanitizing lead_id and partner_id)
      const sanitizedFollowups = this.state.followups
        .filter((f) => validLeadIds.has(f.lead_id))
        .map((f) => ({
          ...f,
          assigned_partner_id:
            f.assigned_partner_id && validPartnerIds.has(f.assigned_partner_id)
              ? f.assigned_partner_id
              : null,
        }));

      if (sanitizedFollowups.length > 0) {
        const { error: fErr } = await sb.from('followups').upsert(sanitizedFollowups);
        if (fErr) throw new Error(`Followups: ${fErr.message}`);
      }

      // 7. Upsert notes (sanitizing lead_id and user_id)
      const sanitizedNotes = this.state.notes
        .filter((n) => validLeadIds.has(n.lead_id))
        .map((n) => ({
          ...n,
          user_id: n.user_id && validUserIds.has(n.user_id) ? n.user_id : null,
        }));

      if (sanitizedNotes.length > 0) {
        const { error: nErr } = await sb.from('notes').upsert(sanitizedNotes);
        if (nErr) throw new Error(`Notes: ${nErr.message}`);
      }

      this.state.isSyncing = false;
      this.state.supabaseConnected = true;
      this.saveState();
      return {
        success: true,
        message: `Successfully uploaded ${this.state.sites.length} sites, ${this.state.plots.length} plots, ${this.state.leads.length} leads, and ${this.state.channelPartners.length} partners to Supabase!`,
      };
    } catch (err: any) {
      console.error('Error pushing data to Supabase:', err);
      this.state.isSyncing = false;
      this.notify();
      return {
        success: false,
        message: `Upload error: ${err.message || 'Check your Supabase tables and schema.sql.'}`,
      };
    }
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
      isSyncing: false,
      isAuthenticated: this.state.isAuthenticated,
    };
    this.saveState();
  }

  // --- USER ROLE ---
  public setCurrentUserRole(role: UserRole, partnerId?: string) {
    let user = this.state.users.find((u) => u.role === role);
    if (!user) {
      user = {
        ...this.state.currentUser,
        role,
        partner_id: partnerId || (role === 'CHANNEL PARTNER' ? 'cp-1' : null),
      };
    } else {
      user = { ...user };
      if (partnerId && role === 'CHANNEL PARTNER') {
        user.partner_id = partnerId;
      }
    }
    this.state.currentUser = user;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('raghu_crm_current_user', JSON.stringify(this.state.currentUser));
      }
    } catch (e) {}
    this.saveState();
  }

  public updateCurrentUser(updates: Partial<User>) {
    this.state.currentUser = {
      ...this.state.currentUser,
      ...updates,
    };
    this.state.users = this.state.users.map((u) =>
      u.id === this.state.currentUser.id ? { ...u, ...updates } : u
    );
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('raghu_crm_current_user', JSON.stringify(this.state.currentUser));
      }
    } catch (e) {}
    this.saveState();
  }

  // --- SITES (CRUD) ---
  public addSite(siteData: Omit<Site, 'id' | 'created_at' | 'updated_at'>): Site {
    const newSite: Site = {
      ...siteData,
      id: `site-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.sites.unshift(newSite);
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('sites').insert(newSite).then(({ error }) => {
        if (error) console.warn('Supabase site insert failed:', error);
      });
    }

    return newSite;
  }

  public updateSite(id: string, updates: Partial<Site>) {
    const updated = { ...updates, updated_at: new Date().toISOString() };
    this.state.sites = this.state.sites.map((site) =>
      site.id === id ? { ...site, ...updated } : site
    );
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('sites').update(updated).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase site update failed:', error);
      });
    }
  }

  public deleteSite(id: string) {
    this.state.sites = this.state.sites.filter((s) => s.id !== id);
    this.state.plots = this.state.plots.filter((p) => p.site_id !== id);
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('sites').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase site delete failed:', error);
      });
    }
  }

  // --- PLOTS (CRUD) ---
  public addPlot(plotData: Omit<Plot, 'id' | 'created_at' | 'updated_at'>): Plot {
    const newPlot: Plot = {
      ...plotData,
      id: `plot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.plots.push(newPlot);
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('plots').insert(newPlot).then(({ error }) => {
        if (error) console.warn('Supabase plot insert failed:', error);
      });
    }

    return newPlot;
  }

  public updatePlot(id: string, updates: Partial<Plot>) {
    const updated = { ...updates, updated_at: new Date().toISOString() };
    this.state.plots = this.state.plots.map((p) => (p.id === id ? { ...p, ...updated } : p));
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('plots').update(updated).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase plot update failed:', error);
      });
    }
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
    const plot = this.state.plots.find((p) => p.id === plotId);
    if (!plot) return;

    const updatedFields: Partial<Plot> = {
      status,
      customer_name: customerName !== undefined ? customerName : plot.customer_name,
      lead_id: leadId !== undefined ? leadId : plot.lead_id,
      notes: notes !== undefined ? notes : plot.notes,
      price: price !== undefined ? price : plot.price,
      booking_date: status === 'BOOKED' ? today : plot.booking_date,
      registration_date: status === 'REGISTRATION COMPLETED' ? today : plot.registration_date,
      updated_at: new Date().toISOString(),
    };

    this.state.plots = this.state.plots.map((p) =>
      p.id === plotId ? { ...p, ...updatedFields } : p
    );
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('plots').update(updatedFields).eq('id', plotId).then(({ error }) => {
        if (error) console.warn('Supabase plot status update failed:', error);
      });
    }
  }

  public deletePlot(id: string) {
    this.state.plots = this.state.plots.filter((p) => p.id !== id);
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('plots').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase plot delete failed:', error);
      });
    }
  }

  // --- LEADS (CRUD) ---
  public addLead(leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Lead {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.leads.unshift(newLead);

    // Initial status history
    const shEntry: LeadStatusHistory = {
      id: `sh-${Date.now()}`,
      lead_id: newLead.id,
      old_status: undefined,
      new_status: newLead.status,
      changed_by: this.state.currentUser.name,
      changed_at: new Date().toISOString(),
    };
    this.state.statusHistory.unshift(shEntry);

    // Initial partner history
    let pahEntry: PartnerAssignmentHistory | null = null;
    if (newLead.assigned_channel_partner_id) {
      pahEntry = {
        id: `pah-${Date.now()}`,
        lead_id: newLead.id,
        old_partner_id: null,
        new_partner_id: newLead.assigned_channel_partner_id,
        changed_by: this.state.currentUser.name,
        changed_at: new Date().toISOString(),
      };
      this.state.partnerHistory.unshift(pahEntry);
    }

    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('leads').insert(newLead).then(({ error }) => {
        if (error) console.warn('Supabase lead insert failed:', error);
      });
      sb.from('lead_status_history').insert(shEntry).then();
      if (pahEntry) {
        sb.from('partner_assignment_history').insert(pahEntry).then();
      }
    }

    return newLead;
  }

  public addLeadsBatch(leadsData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>[]): Lead[] {
    const timestamp = Date.now();
    const newLeads: Lead[] = [];
    const shEntries: LeadStatusHistory[] = [];
    const pahEntries: PartnerAssignmentHistory[] = [];

    leadsData.forEach((leadData, index) => {
      const newLead: Lead = {
        ...leadData,
        id: `lead-${timestamp}-${index}`,
        created_at: new Date(timestamp + index).toISOString(),
        updated_at: new Date(timestamp + index).toISOString(),
      };
      newLeads.push(newLead);

      const shEntry: LeadStatusHistory = {
        id: `sh-${timestamp}-${index}`,
        lead_id: newLead.id,
        old_status: undefined,
        new_status: newLead.status,
        changed_by: this.state.currentUser.name,
        changed_at: new Date(timestamp + index).toISOString(),
      };
      shEntries.push(shEntry);

      if (newLead.assigned_channel_partner_id) {
        const pahEntry: PartnerAssignmentHistory = {
          id: `pah-${timestamp}-${index}`,
          lead_id: newLead.id,
          old_partner_id: null,
          new_partner_id: newLead.assigned_channel_partner_id,
          changed_by: this.state.currentUser.name,
          changed_at: new Date(timestamp + index).toISOString(),
        };
        pahEntries.push(pahEntry);
      }
    });

    this.state.leads.unshift(...newLeads);
    this.state.statusHistory.unshift(...shEntries);
    if (pahEntries.length > 0) {
      this.state.partnerHistory.unshift(...pahEntries);
    }

    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('leads').insert(newLeads).then(({ error }) => {
        if (error) console.warn('Supabase batch leads insert failed:', error);
      });
      sb.from('lead_status_history').insert(shEntries).then();
      if (pahEntries.length > 0) {
        sb.from('partner_assignment_history').insert(pahEntries).then();
      }
    }

    return newLeads;
  }

  public updateLead(leadId: string, updates: Partial<Lead>) {
    const updated = { ...updates, updated_at: new Date().toISOString() };
    this.state.leads = this.state.leads.map((l) =>
      l.id === leadId ? { ...l, ...updated } : l
    );
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('leads').update(updated).eq('id', leadId).then(({ error }) => {
        if (error) console.warn('Supabase lead update failed:', error);
      });
    }
  }

  public updateLeadStatus(leadId: string, newStatus: LeadStatus) {
    const lead = this.state.leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    const oldStatus = lead.status;
    const updated = { status: newStatus, updated_at: new Date().toISOString() };

    this.state.leads = this.state.leads.map((l) =>
      l.id === leadId ? { ...l, ...updated } : l
    );

    const shEntry: LeadStatusHistory = {
      id: `sh-${Date.now()}`,
      lead_id: leadId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: this.state.currentUser.name,
      changed_at: new Date().toISOString(),
    };
    this.state.statusHistory.unshift(shEntry);
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('leads').update(updated).eq('id', leadId).then();
      sb.from('lead_status_history').insert(shEntry).then();
    }
  }

  public reassignLeadPartner(leadId: string, newPartnerId: string | null) {
    const lead = this.state.leads.find((l) => l.id === leadId);
    if (!lead || lead.assigned_channel_partner_id === newPartnerId) return;

    const oldPartnerId = lead.assigned_channel_partner_id;
    const updated = { assigned_channel_partner_id: newPartnerId, updated_at: new Date().toISOString() };

    this.state.leads = this.state.leads.map((l) =>
      l.id === leadId ? { ...l, ...updated } : l
    );

    const pahEntry: PartnerAssignmentHistory = {
      id: `pah-${Date.now()}`,
      lead_id: leadId,
      old_partner_id: oldPartnerId,
      new_partner_id: newPartnerId,
      changed_by: this.state.currentUser.name,
      changed_at: new Date().toISOString(),
    };
    this.state.partnerHistory.unshift(pahEntry);
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('leads').update(updated).eq('id', leadId).then();
      sb.from('partner_assignment_history').insert(pahEntry).then();
    }
  }

  public deleteLead(leadId: string) {
    this.state.leads = this.state.leads.filter((l) => l.id !== leadId);
    this.state.followups = this.state.followups.filter((f) => f.lead_id !== leadId);
    this.state.notes = this.state.notes.filter((n) => n.lead_id !== leadId);
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('leads').delete().eq('id', leadId).then(({ error }) => {
        if (error) console.warn('Supabase lead delete failed:', error);
      });
    }
  }

  // --- CHANNEL PARTNERS (CRUD) ---
  public addChannelPartner(partnerData: Omit<ChannelPartner, 'id' | 'created_at' | 'updated_at'>): ChannelPartner {
    const newPartner: ChannelPartner = {
      ...partnerData,
      id: `cp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.channelPartners.push(newPartner);
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('channel_partners').insert(newPartner).then(({ error }) => {
        if (error) console.warn('Supabase partner insert failed:', error);
      });
    }

    return newPartner;
  }

  public updateChannelPartner(id: string, updates: Partial<ChannelPartner>) {
    const updated = { ...updates, updated_at: new Date().toISOString() };
    this.state.channelPartners = this.state.channelPartners.map((cp) =>
      cp.id === id ? { ...cp, ...updated } : cp
    );
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('channel_partners').update(updated).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase partner update failed:', error);
      });
    }
  }

  public deleteChannelPartner(id: string) {
    this.state.channelPartners = this.state.channelPartners.filter((cp) => cp.id !== id);
    // Unassign partner from leads
    this.state.leads = this.state.leads.map((l) =>
      l.assigned_channel_partner_id === id ? { ...l, assigned_channel_partner_id: null } : l
    );
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('channel_partners').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase partner delete failed:', error);
      });
    }
  }

  // --- FOLLOW-UPS (CRUD) ---
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

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('followups').insert(newFollowUp).then(({ error }) => {
        if (error) console.warn('Supabase followup insert failed:', error);
      });
    }

    return newFollowUp;
  }

  public updateFollowUp(id: string, updates: Partial<FollowUp>) {
    const updated = { ...updates, updated_at: new Date().toISOString() };
    this.state.followups = this.state.followups.map((f) =>
      f.id === id ? { ...f, ...updated } : f
    );
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('followups').update(updated).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase followup update failed:', error);
      });
    }
  }

  public updateFollowUpStatus(id: string, status: FollowUp['status']) {
    this.updateFollowUp(id, { status });
  }

  public rescheduleFollowUp(id: string, date: string, time: string, notes?: string) {
    this.updateFollowUp(id, {
      followup_date: date,
      followup_time: time,
      notes,
      status: 'Pending',
    });
  }

  public deleteFollowUp(id: string) {
    this.state.followups = this.state.followups.filter((f) => f.id !== id);
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('followups').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase followup delete failed:', error);
      });
    }
  }

  // --- NOTES (CRUD) ---
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

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('notes').insert(newNote).then(({ error }) => {
        if (error) console.warn('Supabase note insert failed:', error);
      });
    }

    return newNote;
  }

  public deleteNote(id: string) {
    this.state.notes = this.state.notes.filter((n) => n.id !== id);
    this.saveState();

    const sb = createSupabaseInstance();
    if (sb && this.state.supabaseConnected) {
      sb.from('notes').delete().eq('id', id).then();
    }
  }

  // --- COMPUTED HELPERS ---
  public getDashboardStats() {
    const { sites, plots, leads, channelPartners, followups } = this.state;

    const availablePlots = plots.filter((p) => p.status === 'AVAILABLE').length;
    const bookedPlots = plots.filter((p) => p.status === 'BOOKED').length;
    const soldPlots = plots.filter((p) => p.status === 'SOLD').length;
    const registrationCompletedPlots = plots.filter((p) => p.status === 'REGISTRATION COMPLETED').length;

    const newLeads = leads.filter((l) => l.status === 'NEW').length;
    const activePartners = channelPartners.filter((cp) => cp.status === 'ACTIVE').length;

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

  // --- AUTH METHODS ---
  public login(user?: User) {
    if (user) {
      this.state.currentUser = user;
    }
    this.state.isAuthenticated = true;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('raghu_crm_auth_session', 'true');
        localStorage.setItem('raghu_crm_current_user', JSON.stringify(this.state.currentUser));
      }
    } catch (e) {}
    this.saveState();
  }

  public logout() {
    this.state.isAuthenticated = false;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('raghu_crm_auth_session');
      }
    } catch (e) {}
    this.saveState();
  }
}

export const dataStore = new CRMDataStore();
