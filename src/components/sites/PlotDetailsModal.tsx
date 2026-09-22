import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Plot, PlotStatus, Lead } from '../../types/crm';
import { PlotStatusBadge } from '../common/Badge';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';
import {
  Check,
  Edit3,
  User,
  Calendar,
  IndianRupee,
  Maximize2,
  Trash2,
  Compass,
} from 'lucide-react';

interface PlotDetailsModalProps {
  plot: Plot | null;
  leads: Lead[];
  isOpen: boolean;
  onClose: () => void;
  onSelectLead?: (lead: Lead) => void;
  onPlotDeleted?: () => void;
}

export const PlotDetailsModal: React.FC<PlotDetailsModalProps> = ({
  plot,
  leads,
  isOpen,
  onClose,
  onSelectLead,
  onPlotDeleted,
}) => {
  const { showToast } = useToast();
  const [plotNumber, setPlotNumber] = useState('');
  const [sizeSqft, setSizeSqft] = useState(1200);
  const [price, setPrice] = useState(0);
  const [facing, setFacing] = useState<Plot['facing']>('East');
  const [status, setStatus] = useState<PlotStatus>('AVAILABLE');
  const [customerName, setCustomerName] = useState('');
  const [leadId, setLeadId] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');

  useEffect(() => {
    if (plot) {
      setPlotNumber(plot.plot_number);
      setSizeSqft(plot.size_sqft);
      setPrice(plot.price);
      setFacing(plot.facing);
      setStatus(plot.status);
      setCustomerName(plot.customer_name || '');
      setLeadId(plot.lead_id || '');
      setNotes(plot.notes || '');
      setBookingDate(plot.booking_date || '');
      setRegistrationDate(plot.registration_date || '');
    }
  }, [plot]);

  if (!plot) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.updatePlot(plot.id, {
      plot_number: plotNumber.trim() || plot.plot_number,
      size_sqft: sizeSqft,
      price,
      facing,
      status,
      customer_name: customerName.trim() || null,
      lead_id: leadId || null,
      notes: notes.trim() || null,
      booking_date: bookingDate || null,
      registration_date: registrationDate || null,
    });
    showToast(`Plot ${plotNumber} details saved successfully!`, 'success');
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete Plot ${plot.plot_number}?`)) {
      dataStore.deletePlot(plot.id);
      showToast(`Plot ${plot.plot_number} was deleted.`, 'info');
      onClose();
      if (onPlotDeleted) onPlotDeleted();
    }
  };

  const matchedLead = leads.find((l) => l.id === plot.lead_id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Plot ${plot.plot_number} - Edit & Status`}
      subtitle="Modify dimensions, price, buyer details, and registration status"
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Status Selector Pills */}
        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1.5">
            Plot Status *
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
                  onClick={() => {
                    setStatus(s);
                    const today = new Date().toISOString().split('T')[0];
                    if (s === 'BOOKED' && !bookingDate) setBookingDate(today);
                    if (s === 'REGISTRATION COMPLETED' && !registrationDate) setRegistrationDate(today);
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                    isSelected
                      ? 'bg-[#6C3BFF] text-white border-[#6C3BFF] shadow-sm'
                      : 'bg-white hover:bg-purple-50 text-purple-900 border-[#E5DAFF]'
                  }`}
                >
                  {s === 'REGISTRATION COMPLETED' ? 'REGISTERED' : s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Plot Number & Facing */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Plot Number *
            </label>
            <input
              type="text"
              value={plotNumber}
              onChange={(e) => setPlotNumber(e.target.value)}
              required
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm font-bold text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Facing Direction
            </label>
            <select
              value={facing}
              onChange={(e) => setFacing(e.target.value as Plot['facing'])}
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm font-semibold text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
            >
              <option value="East">East</option>
              <option value="North">North</option>
              <option value="West">West</option>
              <option value="South">South</option>
              <option value="North-East">North-East</option>
              <option value="North-West">North-West</option>
              <option value="South-East">South-East</option>
              <option value="South-West">South-West</option>
            </select>
          </div>
        </div>

        {/* Size & Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Plot Size (sq.ft) *
            </label>
            <input
              type="number"
              value={sizeSqft}
              onChange={(e) => setSizeSqft(Number(e.target.value))}
              min={100}
              required
              className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm font-semibold text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Total Price (₹) *
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm font-bold text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
              />
            </div>
          </div>
        </div>

        {/* Customer / Buyer Name */}
        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
            Buyer / Customer Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. S. Narayanan"
              className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-sm text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        {/* Linked CRM Lead */}
        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
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
            className="w-full px-3 py-2 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-xs text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
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

        {/* Dates for Booking and Registration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Booking Date
            </label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full p-2 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-xs text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
              Registration Date
            </label>
            <input
              type="date"
              value={registrationDate}
              onChange={(e) => setRegistrationDate(e.target.value)}
              className="w-full p-2 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-xs text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-purple-950 uppercase mb-1">
            Plot Notes / Advance Information
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Token advance ₹50,000 received. Balance within 15 days."
            className="w-full p-2.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl text-xs text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-100">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 p-2 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Plot</span>
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
