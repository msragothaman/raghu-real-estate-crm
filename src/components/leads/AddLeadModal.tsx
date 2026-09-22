import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Lead, LeadSource, LeadStatus, Site, ChannelPartner } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  channelPartners: ChannelPartner[];
  onLeadAdded?: (lead: Lead) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  sites,
  channelPartners,
  onLeadAdded,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<LeadSource>('Meta');
  const [campaign, setCampaign] = useState('');
  const [interestedSiteId, setInterestedSiteId] = useState(sites[0]?.id || '');
  const [preferredPlotSize, setPreferredPlotSize] = useState('1200 - 1500 sqft');
  const [budget, setBudget] = useState('₹15L - ₹25L');
  const [purpose, setPurpose] = useState('Own Villa / Construction');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [assignedPartnerId, setAssignedPartnerId] = useState(channelPartners[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Lead name and phone number are required', 'error');
      return;
    }

    const newLead = dataStore.addLead({
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: (whatsapp.trim() || phone.trim()),
      email: email.trim() || undefined,
      source,
      campaign: campaign.trim() || `${source} Inbound Enquiry`,
      interested_site_id: interestedSiteId || null,
      preferred_plot_size: preferredPlotSize.trim() || undefined,
      budget: budget.trim() || undefined,
      purpose: purpose.trim() || undefined,
      preferred_location: preferredLocation.trim() || undefined,
      status: 'NEW',
      assigned_channel_partner_id: assignedPartnerId || null,
      assigned_user_id: dataStore.getState().currentUser.id,
    });

    showToast(`Lead for ${newLead.name} created successfully!`, 'success');
    if (onLeadAdded) onLeadAdded(newLead);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Real Estate Lead"
      subtitle="Enter customer contact details, property requirements, and channel partner assignment"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Suresh Kumar"
              required
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (!whatsapp) setWhatsapp(e.target.value);
              }}
              placeholder="+91 98400 00000"
              required
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+91 98400 00000"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@gmail.com"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        {/* Lead Source & Campaign */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lead Source *
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as LeadSource)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campaign / Ad Set Name
            </label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="e.g. Villupuram Plots Promo Sept"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        {/* Requirement */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interested Site / Project
            </label>
            <select
              value={interestedSiteId}
              onChange={(e) => setInterestedSiteId(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            >
              <option value="">-- Select Site --</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Plot Size
            </label>
            <input
              type="text"
              value={preferredPlotSize}
              onChange={(e) => setPreferredPlotSize(e.target.value)}
              placeholder="e.g. 1200 sqft / 1800 sqft"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Budget Range
            </label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. ₹15L - ₹20L"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Purchase Purpose
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            >
              <option value="Own Villa / House">Own Villa / House</option>
              <option value="Investment / Appreciation">Investment / Appreciation</option>
              <option value="Commercial / Resale">Commercial / Resale</option>
              <option value="Farmhouse / Weekend Villa">Farmhouse / Weekend Villa</option>
            </select>
          </div>
        </div>

        {/* Partner Assignment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Assign to Channel Partner
          </label>
          <select
            value={assignedPartnerId}
            onChange={(e) => setAssignedPartnerId(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
          >
            <option value="">-- Direct Sales Team (No Partner) --</option>
            {channelPartners.map((cp) => (
              <option key={cp.id} value={cp.id}>
                {cp.name} ({cp.location || 'Tamil Nadu'})
              </option>
            ))}
          </select>
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
            Create Lead
          </button>
        </div>
      </form>
    </Modal>
  );
};
