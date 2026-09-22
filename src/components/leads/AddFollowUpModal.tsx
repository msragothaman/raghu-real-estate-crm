import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Lead, ChannelPartner, FollowUpType } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';

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

  const selectedLead = leads.find((l) => l.id === leadId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) {
      showToast('Please select a lead', 'error');
      return;
    }

    const partnerId =
      assignedPartnerId || (selectedLead ? selectedLead.assigned_channel_partner_id || null : null);

    dataStore.addFollowUp({
      lead_id: leadId,
      assigned_partner_id: partnerId,
      followup_date: followupDate,
      followup_time: followupTime,
      type,
      notes: notes.trim() || undefined,
      status: 'Pending',
    });

    showToast(
      `Follow-up scheduled for ${selectedLead ? selectedLead.name : 'customer'} on ${followupDate}`,
      'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Follow-up"
      subtitle="Plan customer call, WhatsApp check-in, or site visit"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
                {l.name} - {l.phone} ({l.status})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
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

        <div className="grid grid-cols-2 gap-3">
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Agenda</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Discuss corner plot facing, verify bank loan eligibility, or pick up from station."
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
            Save Follow-up
          </button>
        </div>
      </form>
    </Modal>
  );
};
