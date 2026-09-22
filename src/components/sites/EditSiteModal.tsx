import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Site } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';
import { Trash2 } from 'lucide-react';

interface EditSiteModalProps {
  site: Site | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export const EditSiteModal: React.FC<EditSiteModalProps> = ({
  site,
  isOpen,
  onClose,
  onDeleted,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [totalArea, setTotalArea] = useState('');
  const [approvalInfo, setApprovalInfo] = useState('');
  const [description, setDescription] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [status, setStatus] = useState<Site['status']>('ACTIVE');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (site) {
      setName(site.name);
      setLocation(site.location);
      setAddress(site.address || '');
      setTotalArea(site.total_area || '');
      setApprovalInfo(site.approval_info || '');
      setDescription(site.description || '');
      setMapsUrl(site.maps_url || '');
      setStatus(site.status);
      setImageUrl(site.image_url || '');
    }
  }, [site]);

  if (!site) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      showToast('Name and location are required', 'error');
      return;
    }

    dataStore.updateSite(site.id, {
      name: name.trim(),
      location: location.trim(),
      address: address.trim() || undefined,
      total_area: totalArea.trim() || undefined,
      approval_info: approvalInfo.trim() || undefined,
      description: description.trim() || undefined,
      maps_url: mapsUrl.trim() || undefined,
      status,
      image_url: imageUrl.trim() || undefined,
    });

    showToast(`Site "${name}" updated successfully!`, 'success');
    onClose();
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${site.name}" and all of its plots? This action cannot be undone.`
      )
    ) {
      dataStore.deleteSite(site.id);
      showToast(`Site "${site.name}" was deleted.`, 'info');
      onClose();
      if (onDeleted) onDeleted();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Site: ${site.name}`}
      subtitle="Modify layout information, approvals, location, and photos"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
            Site / Layout Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Location / City *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Total Land Area
            </label>
            <input
              type="text"
              value={totalArea}
              onChange={(e) => setTotalArea(e.target.value)}
              placeholder="e.g. 15.5 Acres"
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
            Approvals & RERA Information
          </label>
          <input
            type="text"
            value={approvalInfo}
            onChange={(e) => setApprovalInfo(e.target.value)}
            placeholder="e.g. DTCP No: 48/2024 | RERA: TN/28/Layout/0329/2024"
            className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
            Detailed Address
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Google Maps URL
            </label>
            <input
              type="url"
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Project Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Site['status'])}
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ON_HOLD">ON HOLD</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
            Banner Photo URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
            Description & Highlights
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
          />
        </div>

        {/* Footer with Delete and Save */}
        <div className="flex items-center justify-between pt-3 border-t border-purple-100">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 p-2 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Site</span>
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
