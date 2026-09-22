import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Plot, PlotStatus, Lead } from '../../types/crm';
import { PlotStatusBadge } from '../common/Badge';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';
import { Check, Edit3, User, Calendar, IndianRupee, Compass, Maximize2 } from 'lucide-react';

interface PlotDetailsModalProps {
  plot: Plot | null;
  leads: Lead[];
  isOpen: boolean;
  onClose: () => void;
  onSelectLead?: (lead: Lead) => void;
}

export const PlotDetailsModal: React.FC<PlotDetailsModalProps> = ({
  plot,
  leads,
  isOpen,
  onClose,
  onSelectLead,
}) => {
  const { showToast } = useToast();
  const [status, setStatus] = useState<PlotStatus>('AVAILABLE');
  const [customerName, setCustomerName] = useState('');
  const [leadId, setLeadId] = useState('');
  const [price, setPrice] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (plot) {
      setStatus(plot.status);
      setCustomerName(plot.customer_name || '');
      setLeadId(plot.lead_id || '');
      setPrice(plot.price);
      setNotes(plot.notes || '');
    }
  }, [plot]);

  if (!plot) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.updatePlotStatus(
      plot.id,
      status,
      customerName.trim() || null,
      leadId || null,
      notes.trim() || null,
      price
    );
    showToast(`Plot ${plot.plot_number} updated to ${status}`, 'success');
    onClose();
  };

  const matchedLead = leads.find((l) => l.id === plot.lead_id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Plot ${plot.plot_number} - Details & Status`}
      subtitle={`Plot dimensions: ${plot.size_sqft} sq.ft | Facing: ${plot.facing}`}
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Current summary pill */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C3BFF] font-bold flex items-center justify-center text-sm">
              {plot.plot_number}
            </div>
            <div>
              <p className="text-xs text-slate-500">Current Status</p>
              <PlotStatusBadge status={plot.status} size="sm" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Base Price</p>
            <p className="text-base font-bold text-slate-900">
              ₹{(plot.price / 100000).toFixed(2)} Lakhs
            </p>
          </div>
        </div>

        {/* Status Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Update Plot Status *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(
              [
                'AVAILABLE',
                'HOLD',
                'BOOKED',
                'SOLD',
                'REGISTRATION COMPLETED',
              ] as PlotStatus[]
            ).map((s) => {
              const isSelected = status === s;
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`py-2 px-2.5 text-xs font-bold rounded-xl border transition-all text-center ${
                    isSelected
                      ? 'bg-[#6C3BFF] text-white border-[#6C3BFF] shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {s === 'REGISTRATION COMPLETED' ? 'REGISTERED' : s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price & Size */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Plot Size (sq.ft)
            </label>
            <div className="flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
              <Maximize2 className="w-4 h-4 mr-2 text-slate-400" />
              <span>{plot.size_sqft} sq.ft</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Price (₹)
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#6C3BFF]"
              />
            </div>
          </div>
        </div>

        {/* Customer / Buyer Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Buyer / Customer Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. S. Narayanan"
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        {/* Linked CRM Lead */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Link to Lead in CRM (Optional)
          </label>
          <select
            value={leadId}
            onChange={(e) => {
              setLeadId(e.target.value);
              const selected = leads.find((l) => l.id === e.target.value);
              if (selected && !customerName) {
                setCustomerName(selected.name);
              }
            }}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#6C3BFF]"
          >
            <option value="">-- No linked CRM lead --</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.phone}) - [{l.status}]
              </option>
            ))}
          </select>
          {matchedLead && onSelectLead && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectLead(matchedLead);
              }}
              className="mt-1 text-xs text-[#6C3BFF] font-semibold hover:underline"
            >
              Open {matchedLead.name}'s lead card →
            </button>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Plot Notes / Advance Information
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Token advance ₹50,000 received. Balance within 15 days."
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#6C3BFF]"
          />
        </div>

        {/* Dates preview if already booked/registered */}
        {(plot.booking_date || plot.registration_date) && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex flex-col gap-1">
            {plot.booking_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Booked on: <strong>{plot.booking_date}</strong></span>
              </div>
            )}
            {plot.registration_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Registration completed on: <strong>{plot.registration_date}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-bold bg-[#6C3BFF] hover:bg-[#5A2FE0] text-white rounded-xl shadow-sm transition-all"
          >
            Save Plot Updates
          </button>
        </div>
      </form>
    </Modal>
  );
};
