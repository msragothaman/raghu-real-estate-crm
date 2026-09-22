import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Lead, LeadSource, LeadStatus, Site, ChannelPartner } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';
import { Trash2 } from 'lucide-react';

interface EditLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  channelPartners: ChannelPartner[];
  onLeadDeleted?: () => void;
}

export const EditLeadModal: React.FC<EditLeadModalProps> = ({
  lead,
  isOpen,
  onClose,
  sites,
  channelPartners,
  onLeadDeleted,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<LeadSource>('Meta');
  const [campaign, setCampaign] = useState('');
  const [interestedSiteId, setInterestedSiteId] = useState('');
  const [preferredPlotSize, setPreferredPlotSize] = useState('');
  const [budget, setBudget] = useState('');
  const [purpose, setPurpose] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [assignedPartnerId, setAssignedPartnerId] = useState('');
  const [status, setStatus] = useState<LeadStatus>('NEW');

  useEffect(() => {
    if (lead) {
      setName(lead.name);
      setPhone(lead.phone);
      setWhatsapp(lead.whatsapp || lead.phone);
      setEmail(lead.email || '');
      setSource(lead.source);
      setCampaign(lead.campaign || '');
      setInterestedSiteId(lead.interested_site_id || '');
      setPreferredPlotSize(lead.preferred_plot_size || '');
      setBudget(lead.budget || '');
      setPurpose(lead.purpose || '');
      setPreferredLocation(lead.preferred_location || '');
      setAssignedPartnerId(lead.assigned_channel_partner_id || '');
      setStatus(lead.status);
    }
  }, [lead]);

  if (!lead) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Lead name and phone number are required', 'error');
      return;
    }

    dataStore.updateLead(lead.id, {
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      email: email.trim() || undefined,
      source,
      campaign: campaign.trim() || undefined,
      interested_site_id: interestedSiteId || null,
      preferred_plot_size: preferredPlotSize.trim() || undefined,
      budget: budget.trim() || undefined,
      purpose: purpose.trim() || undefined,
      preferred_location: preferredLocation.trim() || undefined,
      assigned_channel_partner_id: assignedPartnerId || null,
      status,
    });

    showToast(`Lead "${name}" updated successfully!`, 'success');
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete lead "${lead.name}"?`)) {
      dataStore.deleteLead(lead.id);
      showToast(`Lead "${lead.name}" was deleted.`, 'info');
      onClose();
      if (onLeadDeleted) onLeadDeleted();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Lead: ${lead.name}`}
      subtitle="Modify contact details, requirements, stage, and partner assignment"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        {/* Source & Campaign */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Lead Source *
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as LeadSource)}
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            >
              <option value="Meta">Meta (Facebook / Instagram Ads)</option>
              <option value="Google">Google Search / Ads</option>
              <option value="WhatsApp">WhatsApp Inbound</option>
              <option value="Website">Website Organic Form</option>
              <option value="Referral">Referral / Word of Mouth</option>
              <option value="Channel Partner">Channel Partner</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Campaign / Ad Set
            </label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        {/* Site & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Interested Site
            </label>
            <select
              value={interestedSiteId}
              onChange={(e) => setInterestedSiteId(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            >
              <option value="">-- Any / Flexible --</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Pipeline Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm font-bold text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
            >
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="FOLLOW UP">FOLLOW UP</option>
              <option value="SITE VISIT">SITE VISIT</option>
              <option value="INTERESTED">INTERESTED</option>
              <option value="NEGOTIATION">NEGOTIATION</option>
              <option value="BOOKED">BOOKED</option>
              <option value="REGISTRATION COMPLETED">REGISTRATION COMPLETED</option>
              <option value="LOST">LOST</option>
            </select>
          </div>
        </div>

        {/* Budget & Plot Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Budget Range
            </label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. ₹15L - ₹25L"
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Preferred Size
            </label>
            <input
              type="text"
              value={preferredPlotSize}
              onChange={(e) => setPreferredPlotSize(e.target.value)}
              placeholder="e.g. 1200 sqft / 1800 sqft"
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        {/* Purpose & Channel Partner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Purchase Purpose
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Own Villa / Investment"
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
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
              <option value="">-- Direct Sales (No Partner) --</option>
              {channelPartners.map((cp) => (
                <option key={cp.id} value={cp.id}>
                  {cp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-purple-100">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 p-2 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Lead</span>
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
