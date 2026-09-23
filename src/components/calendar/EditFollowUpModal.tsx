import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { FollowUp, Lead, ChannelPartner, FollowUpType, FollowUpStatus } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';
import { Trash2, IndianRupee } from 'lucide-react';

interface EditFollowUpModalProps {
  followup: FollowUp | null;
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  channelPartners: ChannelPartner[];
  onFollowUpDeleted?: () => void;
}

export const EditFollowUpModal: React.FC<EditFollowUpModalProps> = ({
  followup,
  isOpen,
  onClose,
  leads,
  channelPartners,
  onFollowUpDeleted,
}) => {
  const { showToast } = useToast();
  const [leadId, setLeadId] = useState('');
  const [assignedPartnerId, setAssignedPartnerId] = useState('');
  const [type, setType] = useState<FollowUpType>('Phone Call');
  const [status, setStatus] = useState<FollowUpStatus>('Pending');
  const [followupDate, setFollowupDate] = useState('');
  const [followupTime, setFollowupTime] = useState('11:00');
  const [notes, setNotes] = useState('');

  // Customer Budget & Plot Requirements
  const [budget, setBudget] = useState('');
  const [preferredPlotSize, setPreferredPlotSize] = useState('');
  const [purpose, setPurpose] = useState('Plot for Immediate Construction');

  const selectedLead = leads.find((l) => l.id === leadId);

  useEffect(() => {
    if (followup) {
      setLeadId(followup.lead_id);
      setAssignedPartnerId(followup.assigned_partner_id || '');
      setType(followup.type);
      setStatus(followup.status);
      setFollowupDate(followup.followup_date);
      setFollowupTime(followup.followup_time || '11:00');
      setNotes(followup.notes || '');

      const currentLead = leads.find((l) => l.id === followup.lead_id);
      if (currentLead) {
        setBudget(currentLead.budget || '');
        setPreferredPlotSize(currentLead.preferred_plot_size || '1200 - 1500 sqft');
        setPurpose(currentLead.purpose || 'Plot for Immediate Construction');
      }
    }
  }, [followup, leads]);

  if (!followup) return null;

  const budgetPresets = [
    '₹10L - ₹15L',
    '₹15L - ₹25L',
    '₹25L - ₹35L',
    '₹35L - ₹50L',
    '₹50L+',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !followupDate) {
      showToast('Lead and date are required', 'error');
      return;
    }

    // 1. Update Follow-up
    dataStore.updateFollowUp(followup.id, {
      lead_id: leadId,
      assigned_partner_id: assignedPartnerId || null,
      type,
      status,
      followup_date: followupDate,
      followup_time: followupTime,
      notes: notes.trim() || undefined,
    });

    // 2. Sync updated budget & plot requirements to Lead profile
    dataStore.updateLead(leadId, {
      budget: budget.trim() || undefined,
      preferred_plot_size: preferredPlotSize.trim() || undefined,
      purpose: purpose.trim() || undefined,
    });

    showToast('Follow-up & customer requirements updated successfully!', 'success');
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this scheduled follow-up?')) {
      dataStore.deleteFollowUp(followup.id);
      showToast('Follow-up deleted.', 'info');
      onClose();
      if (onFollowUpDeleted) onFollowUpDeleted();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Scheduled Follow-up & Budget"
      subtitle="Modify contact agenda, date, time, and customer qualification"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
            Customer / Lead *
          </label>
          <select
            value={leadId}
            onChange={(e) => {
              setLeadId(e.target.value);
              const targetLead = leads.find((l) => l.id === e.target.value);
              if (targetLead) {
                setBudget(targetLead.budget || '');
                setPreferredPlotSize(targetLead.preferred_plot_size || '1200 - 1500 sqft');
                setPurpose(targetLead.purpose || 'Plot for Immediate Construction');
              }
            }}
            required
            className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
          >
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} - {l.phone} ({l.status}) {l.budget ? `[Budget: ${l.budget}]` : '[Budget: Not set]'}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Follow-up Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as FollowUpType)}
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            >
              <option value="Phone Call">Phone Call</option>
              <option value="WhatsApp">WhatsApp Message</option>
              <option value="Site Visit">Site Visit</option>
              <option value="Meeting">Meeting</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as FollowUpStatus)}
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm font-bold text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Missed">Missed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">Date *</label>
            <input
              type="date"
              value={followupDate}
              onChange={(e) => setFollowupDate(e.target.value)}
              required
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">Time</label>
            <input
              type="time"
              value={followupTime}
              onChange={(e) => setFollowupTime(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
            Assigned Channel Partner
          </label>
          <select
            value={assignedPartnerId}
            onChange={(e) => setAssignedPartnerId(e.target.value)}
            className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
          >
            <option value="">Direct Sales (No Partner)</option>
            {channelPartners.map((cp) => (
              <option key={cp.id} value={cp.id}>
                {cp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Budget & Plot Requirements */}
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
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
            Notes / Agenda
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Follow-up notes and customer discussion points..."
            className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-purple-100">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 p-2 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Follow-up</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-purple-800 hover:bg-purple-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold bg-[#6C3BFF] hover:bg-[#5820E0] text-white rounded-xl shadow-md shadow-[#6C3BFF]/30"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
