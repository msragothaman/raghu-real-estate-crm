import React, { useState } from 'react';
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Search,
  Filter,
  Users,
  Sparkles,
} from 'lucide-react';
import {
  Lead,
  Site,
  ChannelPartner,
  User,
  FollowUp,
  LeadStatusHistory,
  PartnerAssignmentHistory,
  LeadNote,
  LeadStatus,
  LeadSource,
} from '../../types/crm';
import { LeadKanban } from './LeadKanban';
import { LeadTable } from './LeadTable';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import { AddLeadModal } from './AddLeadModal';
import { AddFollowUpModal } from './AddFollowUpModal';

interface LeadManagementViewProps {
  leads: Lead[];
  sites: Site[];
  channelPartners: ChannelPartner[];
  users: User[];
  followups: FollowUp[];
  statusHistory: LeadStatusHistory[];
  partnerHistory: PartnerAssignmentHistory[];
  notes: LeadNote[];
  initialStatusFilter?: string;
  isAddLeadOpen: boolean;
  setIsAddLeadOpen: (open: boolean) => void;
  selectedLead: Lead | null;
  setSelectedLead: (lead: Lead | null) => void;
}

export const LeadManagementView: React.FC<LeadManagementViewProps> = ({
  leads,
  sites,
  channelPartners,
  users,
  followups,
  statusHistory,
  partnerHistory,
  notes,
  initialStatusFilter,
  isAddLeadOpen,
  setIsAddLeadOpen,
  selectedLead,
  setSelectedLead,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [siteFilter, setSiteFilter] = useState<string>('ALL');
  const [partnerFilter, setPartnerFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'ALL');

  // Follow-up scheduling modal state
  const [scheduleLeadId, setScheduleLeadId] = useState<string | null>(null);

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== 'ALL' && lead.status !== statusFilter) return false;
    if (sourceFilter !== 'ALL' && lead.source !== sourceFilter) return false;
    if (siteFilter !== 'ALL' && lead.interested_site_id !== siteFilter) return false;
    if (partnerFilter !== 'ALL' && lead.assigned_channel_partner_id !== partnerFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = lead.name.toLowerCase().includes(q);
      const matchPhone = lead.phone.toLowerCase().includes(q);
      const matchCampaign = lead.campaign?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchCampaign) return false;
    }

    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>Lead Pipeline & Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F3EFFF] text-[#6C3BFF] font-bold border border-[#DDD1FF]">
              {filteredLeads.length} leads
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Drag leads across status stages to automatically update lifecycle & Supabase history
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#6C3BFF] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#6C3BFF] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddLeadOpen(true)}
            className="inline-flex items-center gap-2 bg-[#6C3BFF] hover:bg-[#5A2FE0] text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or campaign..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6C3BFF]"
          />
        </div>

        {/* Source Filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:border-[#6C3BFF]"
        >
          <option value="ALL">All Sources</option>
          <option value="Meta">Meta (Facebook/IG)</option>
          <option value="Google">Google</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Website">Website</option>
          <option value="Referral">Referral</option>
          <option value="Channel Partner">Channel Partner</option>
        </select>

        {/* Site Filter */}
        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:border-[#6C3BFF]"
        >
          <option value="ALL">All Sites</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Partner Filter */}
        <select
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:border-[#6C3BFF]"
        >
          <option value="ALL">All Partners</option>
          {channelPartners.map((cp) => (
            <option key={cp.id} value={cp.id}>
              {cp.name}
            </option>
          ))}
        </select>

        {/* Status Filter for Table */}
        {viewMode === 'table' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:border-[#6C3BFF]"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="FOLLOW UP">Follow Up</option>
            <option value="SITE VISIT">Site Visit</option>
            <option value="INTERESTED">Interested</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="BOOKED">Booked</option>
            <option value="REGISTRATION COMPLETED">Registered</option>
            <option value="LOST">Lost</option>
          </select>
        )}

        {(search ||
          sourceFilter !== 'ALL' ||
          siteFilter !== 'ALL' ||
          partnerFilter !== 'ALL' ||
          statusFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearch('');
              setSourceFilter('ALL');
              setSiteFilter('ALL');
              setPartnerFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="text-xs font-bold text-[#6C3BFF] hover:underline px-2"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main View Area */}
      {viewMode === 'kanban' ? (
        <LeadKanban
          leads={filteredLeads}
          sites={sites}
          channelPartners={channelPartners}
          onSelectLead={(lead) => setSelectedLead(lead)}
        />
      ) : (
        <LeadTable
          leads={filteredLeads}
          sites={sites}
          channelPartners={channelPartners}
          onSelectLead={(lead) => setSelectedLead(lead)}
        />
      )}

      {/* Lead Detail Slide-over Drawer */}
      {selectedLead && (
        <LeadDetailDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          sites={sites}
          channelPartners={channelPartners}
          users={users}
          followups={followups}
          statusHistory={statusHistory}
          partnerHistory={partnerHistory}
          notes={notes}
          onOpenScheduleFollowup={(leadId) => setScheduleLeadId(leadId)}
        />
      )}

      {/* Add Lead Modal */}
      {isAddLeadOpen && (
        <AddLeadModal
          isOpen={isAddLeadOpen}
          onClose={() => setIsAddLeadOpen(false)}
          sites={sites}
          channelPartners={channelPartners}
          onLeadAdded={(lead) => setSelectedLead(lead)}
        />
      )}

      {/* Schedule Follow-up Modal */}
      {scheduleLeadId && (
        <AddFollowUpModal
          isOpen={Boolean(scheduleLeadId)}
          onClose={() => setScheduleLeadId(null)}
          leads={leads}
          channelPartners={channelPartners}
          defaultLeadId={scheduleLeadId}
        />
      )}
    </div>
  );
};
