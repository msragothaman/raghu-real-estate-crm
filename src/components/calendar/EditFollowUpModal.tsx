import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { FollowUp, Lead, ChannelPartner, FollowUpType, FollowUpStatus } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';
import { Trash2 } from 'lucide-react';

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

  useEffect(() => {
    if (followup) {
      setLeadId(followup.lead_id);
      setAssignedPartnerId(followup.assigned_partner_id || '');
      setType(followup.type);
      setStatus(followup.status);
      setFollowupDate(followup.followup_date);
      setFollowupTime(followup.followup_time || '11:00');
      setNotes(followup.notes || '');
    }
  }, [followup]);

  if (!followup) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !followupDate) {
      showToast('Lead and date are required', 'error');
      return;
    }

    dataStore.updateFollowUp(followup.id, {
      lead_id: leadId,
      assigned_partner_id: assignedPartnerId || null,
      type,
      status,
      followup_date: followupDate,
      followup_time: followupTime,
      notes: notes.trim() || undefined,
    });

    showToast('Follow-up updated successfully!', 'success');
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
      title="Edit Scheduled Follow-up"
      subtitle="Modify contact agenda, date, time, and assigned partner"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
            Customer / Lead *
          </label>
          <select
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            required
            className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
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

        <div className="grid grid-cols-2 gap-3">
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

        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
            Notes / Agenda
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
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
