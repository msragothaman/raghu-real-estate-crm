import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Site, Plot } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';

interface AddPlotModalProps {
  site: Site;
  isOpen: boolean;
  onClose: () => void;
}

export const AddPlotModal: React.FC<AddPlotModalProps> = ({ site, isOpen, onClose }) => {
  const { showToast } = useToast();
  const [plotNumber, setPlotNumber] = useState('');
  const [sizeSqft, setSizeSqft] = useState(1200);
  const [pricePerSqft, setPricePerSqft] = useState(1200);
  const [facing, setFacing] = useState<Plot['facing']>('East');

  // Bulk add mode
  const [isBulk, setIsBulk] = useState(false);
  const [prefix, setPrefix] = useState('P-');
  const [startNum, setStartNum] = useState(1);
  const [count, setCount] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isBulk) {
      for (let i = 0; i < count; i++) {
        const num = startNum + i;
        const formattedNum = num < 10 ? `0${num}` : `${num}`;
        dataStore.addPlot({
          site_id: site.id,
          plot_number: `${prefix}${formattedNum}`,
          size_sqft: sizeSqft,
          price: sizeSqft * pricePerSqft,
          facing,
          status: 'AVAILABLE',
        });
      }
      showToast(`Created ${count} plots successfully for ${site.name}`, 'success');
    } else {
      if (!plotNumber.trim()) {
        showToast('Please enter a plot number', 'error');
        return;
      }
      dataStore.addPlot({
        site_id: site.id,
        plot_number: plotNumber.trim(),
        size_sqft: sizeSqft,
        price: sizeSqft * pricePerSqft,
        facing,
        status: 'AVAILABLE',
      });
      showToast(`Plot ${plotNumber} added to ${site.name}`, 'success');
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Plot(s) - ${site.name}`}
      subtitle="Expand layout inventory with single or batch plots"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Single vs Bulk */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setIsBulk(false)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              !isBulk ? 'bg-white text-[#6C3BFF] shadow-xs' : 'text-slate-600'
            }`}
          >
            Single Plot
          </button>
          <button
            type="button"
            onClick={() => setIsBulk(true)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              isBulk ? 'bg-white text-[#6C3BFF] shadow-xs' : 'text-slate-600'
            }`}
          >
            Bulk Generate Plots
          </button>
        </div>

        {isBulk ? (
          <div className="grid grid-cols-3 gap-2 p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="P-"
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start #</label>
              <input
                type="number"
                value={startNum}
                onChange={(e) => setStartNum(Number(e.target.value))}
                min={1}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Count</label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                min={1}
                max={100}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Plot Number *
            </label>
            <input
              type="text"
              value={plotNumber}
              onChange={(e) => setPlotNumber(e.target.value)}
              placeholder="e.g. Plot 41 or L-41"
              required={!isBulk}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Plot Size (sq.ft) *
            </label>
            <input
              type="number"
              value={sizeSqft}
              onChange={(e) => setSizeSqft(Number(e.target.value))}
              min={100}
              required
              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Price per sq.ft (₹) *
            </label>
            <input
              type="number"
              value={pricePerSqft}
              onChange={(e) => setPricePerSqft(Number(e.target.value))}
              min={100}
              required
              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Facing</label>
            <select
              value={facing}
              onChange={(e) => setFacing(e.target.value as Plot['facing'])}
              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6C3BFF]"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Calculated Total</label>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900">
              ₹{((sizeSqft * pricePerSqft) / 100000).toFixed(2)} Lakhs
            </div>
          </div>
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
            {isBulk ? `Generate ${count} Plots` : 'Add Plot'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
