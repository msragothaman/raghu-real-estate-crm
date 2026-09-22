import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ChannelPartner } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';
import { Trash2 } from 'lucide-react';

interface EditPartnerModalProps {
  partner: ChannelPartner | null;
  isOpen: boolean;
  onClose: () => void;
  onPartnerDeleted?: () => void;
}

export const EditPartnerModal: React.FC<EditPartnerModalProps> = ({
  partner,
  isOpen,
  onClose,
  onPartnerDeleted,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<ChannelPartner['status']>('ACTIVE');

  useEffect(() => {
    if (partner) {
      setName(partner.name);
      setPhone(partner.phone);
      setWhatsapp(partner.whatsapp || partner.phone);
      setEmail(partner.email || '');
      setLocation(partner.location || '');
      setAddress(partner.address || '');
      setStatus(partner.status);
    }
  }, [partner]);

  if (!partner) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Name and phone number are required', 'error');
      return;
    }

    dataStore.updateChannelPartner(partner.id, {
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      email: email.trim() || undefined,
      location: location.trim() || undefined,
      address: address.trim() || undefined,
      status,
    });

    showToast(`Partner "${name}" updated successfully!`, 'success');
    onClose();
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete Channel Partner "${partner.name}"? Their assigned leads will be unassigned to Direct Sales.`
      )
    ) {
      dataStore.deleteChannelPartner(partner.id);
      showToast(`Partner "${partner.name}" was deleted.`, 'info');
      onClose();
      if (onPartnerDeleted) onPartnerDeleted();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Channel Partner: ${partner.name}`}
      subtitle="Modify broker contact information, operating locations, and status"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
            Agency / Partner Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
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
        </div>

        <div className="grid grid-cols-2 gap-3">
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

          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Operating City / Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
            Office Address
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
            Partner Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ChannelPartner['status'])}
            className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-purple-100">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 p-2 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Partner</span>
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
