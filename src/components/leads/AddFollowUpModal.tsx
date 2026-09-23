import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Lead, ChannelPartner, FollowUpType } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';
import { IndianRupee, Tag, Check, HelpCircle } from 'lucide-react';

interface AddFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  channelPartners: ChannelPartner[];
  defaultLeadId?: string;
}

export const AddFollowUpModal: React.FC<AddFollowUpModalProps> = ({
  isOpen,
  onClose,
  leads,
  channelPartners,
  defaultLeadId,
}) => {
  const { showToast } = useToast();
  const todayStr = new Date().toISOString().split('T')[0];

  const [leadId, setLeadId] = useState(defaultLeadId || leads[0]?.id || '');
  const [type, setType] = useState<FollowUpType>('Phone Call');
  const [followupDate, setFollowupDate] = useState(todayStr);
  const [followupTime, setFollowupTime] = useState('11:00');
  const [assignedPartnerId, setAssignedPartnerId] = useState('');
  const [notes, setNotes] = useState('');

  // Customer Budget & Plot Requirements captured during follow-up
  const [budget, setBudget] = useState('');
  const [preferredPlotSize, setPreferredPlotSize] = useState('');
  const [purpose, setPurpose] = useState('Plot for Immediate Construction');

  const selectedLead = leads.find((l) => l.id === leadId);

  // Sync budget & requirements from selected lead
  useEffect(() => {
    if (selectedLead) {
      setBudget(selectedLead.budget || '');
      setPreferredPlotSize(selectedLead.preferred_plot_size || '1200 - 1500 sqft');
      setPurpose(selectedLead.purpose || 'Plot for Immediate Construction');
      if (!assignedPartnerId && selectedLead.assigned_channel_partner_id) {
        setAssignedPartnerId(selectedLead.assigned_channel_partner_id);
      }
    }
  }, [leadId, selectedLead]);

  const budgetPresets = [
    '₹10L - ₹15L',
    '₹15L - ₹25L',
    '₹25L - ₹35L',
    '₹35L - ₹50L',
    '₹50L+',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) {
      showToast('Please select a lead', 'error');
      return;
    }

    const partnerId =
      assignedPartnerId || (selectedLead ? selectedLead.assigned_channel_partner_id || null : null);

    // 1. Create Follow-Up
    dataStore.addFollowUp({
      lead_id: leadId,
      assigned_partner_id: partnerId,
      followup_date: followupDate,
      followup_time: followupTime,
      type,
      notes: notes.trim() || undefined,
      status: 'Pending',
    });

    // 2. Automatically update Lead's budget & plot requirement in database & CRM
    dataStore.updateLead(leadId, {
      budget: budget.trim() || undefined,
      preferred_plot_size: preferredPlotSize.trim() || undefined,
      purpose: purpose.trim() || undefined,
    });

    showToast(
      `Follow-up saved & customer budget updated for ${selectedLead ? selectedLead.name : 'customer'}!`,
      'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Follow-up & Qualify Budget"
      subtitle="Plan customer call, record budget discussed, and set plot requirements"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Customer / Lead *
          </label>
          <select
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            required
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
          >
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} - {l.phone} ({l.status}) {l.budget ? `[Budget: ${l.budget}]` : '[Budget: Not set]'}
              </option>
            ))}
          </select>
        </div>

        {/* Follow-up Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Follow-up Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as FollowUpType)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            >
              <option value="Phone Call">Phone Call</option>
              <option value="WhatsApp">WhatsApp Message</option>
              <option value="Site Visit">Site Visit</option>
              <option value="Meeting">Meeting</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Partner
            </label>
            <select
              value={assignedPartnerId}
              onChange={(e) => setAssignedPartnerId(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            >
              <option value="">
                {selectedLead?.assigned_channel_partner_id
                  ? 'Default Lead Partner'
                  : 'Direct Sales Team'}
              </option>
              {channelPartners.map((cp) => (
                <option key={cp.id} value={cp.id}>
                  {cp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
            <input
              type="date"
              value={followupDate}
              onChange={(e) => setFollowupDate(e.target.value)}
              required
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
            <input
              type="time"
              value={followupTime}
              onChange={(e) => setFollowupTime(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        {/* Customer Budget & Plot Requirements (Discussed during call) */}
        <div className="p-4 bg-[#FAF8FF] border border-[#E5DAFF] rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-[#6C3BFF]" />
              <span>Customer Budget & Plot Requirements (Follow-up Qualification)</span>
            </h4>
            <span className="text-[11px] text-purple-600 font-medium">Updates Customer Profile</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Budget Range
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {budgetPresets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setBudget(preset)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                    budget === preset
                      ? 'bg-[#6C3BFF] text-white shadow-xs'
                      : 'bg-white text-purple-800 border border-[#E5DAFF] hover:border-[#6C3BFF]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. ₹18 Lakhs or ₹15L - ₹22L"
              className="w-full p-2.5 bg-white border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Plot Size
              </label>
              <input
                type="text"
                value={preferredPlotSize}
                onChange={(e) => setPreferredPlotSize(e.target.value)}
                placeholder="e.g. 1200 sqft / 1500 sqft"
                className="w-full p-2.5 bg-white border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Plot Purchase Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
              >
                <option value="Plot for Immediate Construction">Plot for Immediate Construction</option>
                <option value="Plot for Investment / Appreciation">Plot for Investment / Appreciation</option>
                <option value="Plot for Future Family Asset">Plot for Future Family Asset</option>
                <option value="Plot for Resale">Plot for Resale</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Call Agenda</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Customer asked for east-facing plot near main road, requested layout copy on WhatsApp."
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-bold bg-[#6C3BFF] hover:bg-[#5A2FE0] text-white rounded-xl shadow-sm"
          >
            Save Follow-up & Budget
          </button>
        </div>
      </form>
    </Modal>
  );
};
