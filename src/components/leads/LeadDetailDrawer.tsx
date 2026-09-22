import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Building2,
  Maximize2,
  Tag,
  UserCheck,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Handshake,
  FileText,
  Plus,
} from 'lucide-react';
import {
  Lead,
  Site,
  ChannelPartner,
  LeadStatus,
  FollowUp,
  LeadStatusHistory,
  PartnerAssignmentHistory,
  LeadNote,
  User,
} from '../../types/crm';
import { LeadStatusBadge } from '../common/Badge';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  sites: Site[];
  channelPartners: ChannelPartner[];
  users: User[];
  followups: FollowUp[];
  statusHistory: LeadStatusHistory[];
  partnerHistory: PartnerAssignmentHistory[];
  notes: LeadNote[];
  onOpenScheduleFollowup: (leadId: string) => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  onClose,
  sites,
  channelPartners,
  users,
  followups,
  statusHistory,
  partnerHistory,
  notes,
  onOpenScheduleFollowup,
}) => {
  const { showToast } = useToast();
  const [newNoteText, setNewNoteText] = useState('');
  const [isEditingPartner, setIsEditingPartner] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');

  if (!lead) return null;

  const interestedSite = sites.find((s) => s.id === lead.interested_site_id);
  const assignedPartner = channelPartners.find((cp) => cp.id === lead.assigned_channel_partner_id);
  const assignedSalesperson = users.find((u) => u.id === lead.assigned_user_id);

  const leadFollowups = followups
    .filter((f) => f.lead_id === lead.id)
    .sort((a, b) => b.followup_date.localeCompare(a.followup_date));

  const nextPendingFollowup = leadFollowups.find((f) => f.status === 'Pending');

  const leadNotes = notes
    .filter((n) => n.lead_id === lead.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const leadStatusLogs = statusHistory
    .filter((sh) => sh.lead_id === lead.id)
    .sort((a, b) => b.changed_at.localeCompare(a.changed_at));

  const leadPartnerLogs = partnerHistory
    .filter((ph) => ph.lead_id === lead.id)
    .sort((a, b) => b.changed_at.localeCompare(a.changed_at));

  // Build unified timeline
  interface TimelineItem {
    id: string;
    type: 'status' | 'partner' | 'note' | 'created';
    title: string;
    description?: string;
    date: string;
    author?: string;
  }

  const timelineItems: TimelineItem[] = [
    {
      id: `created-${lead.id}`,
      type: 'created',
      title: 'Lead created via ' + lead.source,
      description: lead.campaign ? `Campaign: ${lead.campaign}` : undefined,
      date: lead.created_at,
    },
  ];

  leadStatusLogs.forEach((sh) => {
    timelineItems.push({
      id: sh.id,
      type: 'status',
      title: `Status changed to ${sh.new_status}`,
      description: sh.old_status ? `From ${sh.old_status}` : undefined,
      date: sh.changed_at,
      author: sh.changed_by,
    });
  });

  leadPartnerLogs.forEach((ph) => {
    const oldP = channelPartners.find((p) => p.id === ph.old_partner_id)?.name || 'Direct';
    const newP = channelPartners.find((p) => p.id === ph.new_partner_id)?.name || 'Unassigned';
    timelineItems.push({
      id: ph.id,
      type: 'partner',
      title: `Reassigned to Partner: ${newP}`,
      description: `Previously assigned to: ${oldP}`,
      date: ph.changed_at,
      author: ph.changed_by,
    });
  });

  leadNotes.forEach((n) => {
    timelineItems.push({
      id: n.id,
      type: 'note',
      title: `Note added by ${n.author_name}`,
      description: n.note,
      date: n.created_at,
      author: n.author_name,
    });
  });

  // Sort descending
  timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleStatusChange = (newStatus: LeadStatus) => {
    dataStore.updateLeadStatus(lead.id, newStatus);
    showToast(`Lead status moved to ${newStatus}`, 'success');
  };

  const handlePartnerSave = () => {
    dataStore.reassignLeadPartner(lead.id, selectedPartnerId || null);
    setIsEditingPartner(false);
    showToast('Channel Partner reassigned successfully.', 'success');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    dataStore.addNote(lead.id, newNoteText.trim());
    setNewNoteText('');
    showToast('Note added to lead timeline', 'success');
  };

  const phoneSanitized = lead.phone.replace(/[^0-9]/g, '');
  const whatsappSanitized = (lead.whatsapp || lead.phone).replace(/[^0-9]/g, '');

  const allStatuses: LeadStatus[] = [
    'NEW',
    'CONTACTED',
    'FOLLOW UP',
    'SITE VISIT',
    'INTERESTED',
    'NEGOTIATION',
    'BOOKED',
    'REGISTRATION COMPLETED',
    'LOST',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lead.id}
            </span>
            <LeadStatusBadge status={lead.status} size="sm" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 leading-tight">{lead.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body Scroll */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Quick Actions Bar */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors shadow-xs"
          >
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Call Customer</span>
          </a>

          <a
            href={`https://wa.me/${whatsappSanitized}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-green-50 hover:bg-green-100 text-green-800 font-bold text-xs rounded-xl border border-green-200 transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4 text-green-600" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={() => onOpenScheduleFollowup(lead.id)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#F3EFFF] hover:bg-purple-100 text-[#6C3BFF] font-bold text-xs rounded-xl border border-[#DDD1FF] transition-colors shadow-xs"
          >
            <Calendar className="w-4 h-4 text-[#6C3BFF]" />
            <span>Schedule Follow-up</span>
          </button>
        </div>

        {/* Change Status Fast Selector */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
          <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
            Change Lead Pipeline Status
          </label>
          <div className="flex flex-wrap gap-1.5">
            {allStatuses.map((st) => {
              const isCurrent = lead.status === st;
              return (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    isCurrent
                      ? 'bg-[#6C3BFF] text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Customer Information
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Phone</span>
              <span className="font-semibold text-slate-800">{lead.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block">WhatsApp</span>
              <span className="font-semibold text-slate-800">
                {lead.whatsapp || lead.phone}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Email</span>
              <span className="font-semibold text-slate-800">{lead.email || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Lead Source</span>
              <span className="font-semibold text-slate-800">
                {lead.source} ({lead.campaign || 'Direct'})
              </span>
            </div>
          </div>
        </div>

        {/* Property Requirement */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Property Requirement
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Interested Site</span>
              <span className="font-semibold text-[#6C3BFF]">
                {interestedSite ? interestedSite.name : 'Flexible / Any'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Preferred Size</span>
              <span className="font-semibold text-slate-800">
                {lead.preferred_plot_size || '1200 - 1500 sqft'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Budget</span>
              <span className="font-semibold text-slate-800">
                {lead.budget || '₹15L - ₹25L'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Purpose</span>
              <span className="font-semibold text-slate-800">
                {lead.purpose || 'Own Villa Construction'}
              </span>
            </div>
          </div>
        </div>

        {/* Partner & Salesperson Assignment */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assignment Details
            </h4>
            {!isEditingPartner && (
              <button
                onClick={() => {
                  setSelectedPartnerId(lead.assigned_channel_partner_id || '');
                  setIsEditingPartner(true);
                }}
                className="text-xs font-bold text-[#6C3BFF] hover:underline"
              >
                Reassign Partner
              </button>
            )}
          </div>

          {isEditingPartner ? (
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Select Channel Partner:
              </label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
              >
                <option value="">Direct Sales (No Channel Partner)</option>
                {channelPartners.map((cp) => (
                  <option key={cp.id} value={cp.id}>
                    {cp.name} ({cp.location || 'Tamil Nadu'})
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingPartner(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePartnerSave}
                  className="px-3 py-1 text-xs font-bold bg-[#6C3BFF] text-white rounded-md"
                >
                  Save Reassignment
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Assigned Channel Partner</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Handshake className="w-3.5 h-3.5 text-[#6C3BFF]" />
                  {assignedPartner ? assignedPartner.name : 'Direct In-House Sales'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Assigned Sales Executive</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  {assignedSalesperson ? assignedSalesperson.name : 'Raghu Admin'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Next Scheduled Follow-up */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Next Scheduled Follow-up
            </h4>
            <button
              onClick={() => onOpenScheduleFollowup(lead.id)}
              className="text-xs font-bold text-[#6C3BFF] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Follow-up</span>
            </button>
          </div>

          {nextPendingFollowup ? (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{nextPendingFollowup.type}</span>
                  <span>•</span>
                  <span>{nextPendingFollowup.followup_date}</span>
                  {nextPendingFollowup.followup_time && (
                    <span>at {nextPendingFollowup.followup_time}</span>
                  )}
                </div>
                <p className="text-slate-600 mt-1">{nextPendingFollowup.notes || 'No notes'}</p>
              </div>
              <button
                onClick={() => {
                  dataStore.updateFollowUpStatus(nextPendingFollowup.id, 'Completed');
                  showToast('Follow-up marked as Completed', 'success');
                }}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 text-xs shadow-xs"
              >
                Mark Done
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No upcoming follow-up scheduled.</p>
          )}
        </div>

        {/* Add Note Input */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Add Quick Interaction Note
          </h4>
          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              type="text"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="e.g. Discussed corner plot facing, requested site visit this Saturday..."
              className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6C3BFF]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#6C3BFF] text-white text-xs font-bold rounded-xl hover:bg-[#5A2FE0] transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </form>
        </div>

        {/* Lead Activity Timeline */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Lead Activity Timeline
          </h4>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timelineItems.map((item) => (
              <div key={item.id} className="relative">
                <div
                  className={`absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    item.type === 'status'
                      ? 'bg-[#6C3BFF]'
                      : item.type === 'partner'
                      ? 'bg-blue-500'
                      : item.type === 'note'
                      ? 'bg-emerald-500'
                      : 'bg-slate-400'
                  }`}
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span>{new Date(item.date).toLocaleString()}</span>
                    {item.author && <span>• by {item.author}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
