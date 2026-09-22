import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Maximize,
  PlusCircle,
  Search,
  Filter,
  Layers,
  Compass,
  IndianRupee,
  CheckCircle2,
  Edit,
} from 'lucide-react';
import { Site, Plot, Lead, PlotStatus } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { PlotStatusBadge } from '../common/Badge';
import { PlotDetailsModal } from './PlotDetailsModal';
import { AddPlotModal } from './AddPlotModal';
import { EditSiteModal } from './EditSiteModal';

interface SiteDetailsProps {
  site: Site;
  allPlots: Plot[];
  leads: Lead[];
  onBack: () => void;
  onSelectLead: (lead: Lead) => void;
}

export const SiteDetails: React.FC<SiteDetailsProps> = ({
  site,
  allPlots,
  leads,
  onBack,
  onSelectLead,
}) => {
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [isAddPlotOpen, setIsAddPlotOpen] = useState(false);
  const [isEditSiteOpen, setIsEditSiteOpen] = useState(false);

  // Filters for Plot Grid
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [facingFilter, setFacingFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const sitePlots = allPlots.filter((p) => p.site_id === site.id);
  const metrics = dataStore.getSitePlotMetrics(site.id);

  // Filtered plots
  const filteredPlots = sitePlots.filter((plot) => {
    if (statusFilter !== 'ALL' && plot.status !== statusFilter) return false;
    if (facingFilter !== 'ALL' && plot.facing !== facingFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = plot.plot_number.toLowerCase().includes(q);
      const buyerMatch = plot.customer_name?.toLowerCase().includes(q);
      if (!numMatch && !buyerMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar with Back Button & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-purple-900 hover:text-[#6C3BFF] bg-white px-3.5 py-2 rounded-xl border border-[#E5DAFF] hover:border-[#6C3BFF] transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Sites</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditSiteOpen(true)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-purple-50 text-purple-900 text-sm font-bold px-3.5 py-2 rounded-xl border border-[#E5DAFF] transition-all shadow-xs"
          >
            <Edit className="w-4 h-4 text-[#6C3BFF]" />
            <span>Edit Project</span>
          </button>

          <button
            onClick={() => setIsAddPlotOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#6C3BFF] hover:bg-[#5820E0] text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md shadow-[#6C3BFF]/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Plot(s)</span>
          </button>
        </div>
      </div>

      {/* Site Header Card */}
      <div className="bg-white rounded-2xl border border-[#E5DAFF] shadow-xs overflow-hidden">
        <div className="relative h-44 sm:h-56 w-full bg-[#2A086E]">
          <img
            src={site.image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef'}
            alt={site.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#200547]/95 via-[#200547]/50 to-transparent" />

          <div className="absolute bottom-5 left-5 right-5 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#6C3BFF] text-white text-xs font-bold uppercase tracking-wider">
                  {site.status}
                </span>
                {site.approval_info && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {site.approval_info}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{site.name}</h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200 mt-1">
                <MapPin className="w-4 h-4 text-[#C7ACFF]" />
                <span>{site.location}</span>
                {site.total_area && (
                  <>
                    <span>•</span>
                    <Maximize className="w-4 h-4 text-[#C7ACFF]" />
                    <span>{site.total_area}</span>
                  </>
                )}
              </div>
            </div>

            {site.maps_url && (
              <a
                href={site.maps_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-white text-purple-950 hover:bg-purple-50 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#6C3BFF]" />
              </a>
            )}
          </div>
        </div>

        {/* Site Details Sub-grid */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-[#EFE7FF]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
              Layout Address
            </span>
            <p className="text-sm font-medium text-purple-950 mt-1">
              {site.address || site.location}
            </p>
          </div>
          <div className="md:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
              Project Description & Highlights
            </span>
            <p className="text-sm text-purple-900 mt-1 leading-relaxed">
              {site.description || 'Premier gated plotted development with clear titles and bank loan approval.'}
            </p>
          </div>
        </div>

        {/* Plot Inventory Summary Metrics Strip */}
        <div className="p-4 bg-[#FAF8FF] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center border-t border-[#EFE7FF]">
          <div className="p-2.5 bg-white rounded-xl border border-[#E5DAFF]">
            <span className="text-xs font-semibold text-purple-700 block">Total Plots</span>
            <span className="text-xl font-bold text-purple-950">{metrics.total}</span>
          </div>
          <div
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-white border-[#E5DAFF] hover:border-emerald-200'
            }`}
          >
            <span className="text-xs font-semibold text-emerald-600 block">Available</span>
            <span className="text-xl font-bold text-emerald-700">{metrics.available}</span>
          </div>
          <div
            onClick={() => setStatusFilter('HOLD')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'HOLD'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
                : 'bg-white border-[#E5DAFF] hover:border-amber-200'
            }`}
          >
            <span className="text-xs font-semibold text-amber-600 block">On Hold</span>
            <span className="text-xl font-bold text-amber-700">{metrics.hold}</span>
          </div>
          <div
            onClick={() => setStatusFilter('BOOKED')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'BOOKED'
                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
                : 'bg-white border-[#E5DAFF] hover:border-blue-200'
            }`}
          >
            <span className="text-xs font-semibold text-blue-600 block">Booked</span>
            <span className="text-xl font-bold text-blue-700">{metrics.booked}</span>
          </div>
          <div
            onClick={() => setStatusFilter('SOLD')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'SOLD'
                ? 'bg-[#F3EFFF] border-[#C7ACFF] ring-2 ring-[#6C3BFF]/20'
                : 'bg-white border-[#E5DAFF] hover:border-[#C7ACFF]'
            }`}
          >
            <span className="text-xs font-semibold text-[#6C3BFF] block">Sold</span>
            <span className="text-xl font-bold text-[#6C3BFF]">{metrics.sold}</span>
          </div>
          <div
            onClick={() => setStatusFilter('REGISTRATION COMPLETED')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'REGISTRATION COMPLETED'
                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
                : 'bg-white border-[#E5DAFF] hover:border-indigo-200'
            }`}
          >
            <span className="text-xs font-semibold text-indigo-600 block">Registered</span>
            <span className="text-xl font-bold text-indigo-700">
              {metrics.registrationCompleted}
            </span>
          </div>
        </div>
      </div>

      {/* PLOT INVENTORY VISUALIZATION & MATRIX */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5DAFF] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-purple-950 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#6C3BFF]" />
              <span>Interactive Plot Matrix</span>
            </h3>
            <p className="text-xs text-purple-600/80">
              Click any plot to edit price, dimensions, status, buyer name, linked lead, or delete plot.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plot # or buyer..."
                className="pl-8 pr-3 py-1.5 text-xs bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl focus:outline-none focus:border-[#6C3BFF] w-44 text-purple-950"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl font-medium text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
            >
              <option value="ALL">All Statuses ({sitePlots.length})</option>
              <option value="AVAILABLE">Available ({metrics.available})</option>
              <option value="HOLD">Hold ({metrics.hold})</option>
              <option value="BOOKED">Booked ({metrics.booked})</option>
              <option value="SOLD">Sold ({metrics.sold})</option>
              <option value="REGISTRATION COMPLETED">Registered ({metrics.registrationCompleted})</option>
            </select>

            <select
              value={facingFilter}
              onChange={(e) => setFacingFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl font-medium text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
            >
              <option value="ALL">All Facings</option>
              <option value="East">East</option>
              <option value="North">North</option>
              <option value="West">West</option>
              <option value="South">South</option>
              <option value="North-East">North-East</option>
            </select>

            {(statusFilter !== 'ALL' || facingFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setFacingFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-[#6C3BFF] font-bold hover:underline px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-purple-900 mb-6 p-3 bg-[#FAF8FF] rounded-xl border border-[#EFE7FF]">
          <span className="font-bold text-purple-400 uppercase text-[10px]">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500" />
            <span>Hold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#6C3BFF]" />
            <span>Sold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-700" />
            <span>Registered</span>
          </div>
        </div>

        {/* Plot Matrix Visual Grid */}
        {filteredPlots.length === 0 ? (
          <div className="py-12 text-center text-purple-400">
            <p className="text-sm font-medium">No plots matched the selected filters.</p>
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setFacingFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-2 text-xs font-bold text-[#6C3BFF] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredPlots.map((plot) => {
              const statusStyles = {
                AVAILABLE:
                  'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200 text-emerald-900',
                HOLD: 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200 text-amber-900',
                BOOKED: 'bg-blue-50/80 hover:bg-blue-100/80 border-blue-200 text-blue-900',
                SOLD: 'bg-purple-50/80 hover:bg-purple-100/80 border-[#C7ACFF] text-purple-900',
                'REGISTRATION COMPLETED':
                  'bg-indigo-50/80 hover:bg-indigo-100/80 border-indigo-200 text-indigo-900',
              };

              const currentStyle = statusStyles[plot.status] || 'bg-slate-50 border-slate-200';

              return (
                <div
                  key={plot.id}
                  onClick={() => setSelectedPlot(plot)}
                  className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between min-h-[108px] ${currentStyle}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-black text-sm tracking-tight">{plot.plot_number}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/80 backdrop-blur-xs">
                      {plot.facing.slice(0, 2)}
                    </span>
                  </div>

                  <div className="my-1 text-center">
                    <PlotStatusBadge status={plot.status} size="sm" />
                  </div>

                  <div className="text-[11px] font-medium opacity-90 flex items-center justify-between pt-1 border-t border-black/5">
                    <span>{plot.size_sqft} sqft</span>
                    <span className="font-bold">₹{(plot.price / 100000).toFixed(1)}L</span>
                  </div>

                  {plot.customer_name && (
                    <div className="text-[10px] font-bold truncate text-purple-950 mt-1">
                      👤 {plot.customer_name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Plot Details & Edit Modal */}
      {selectedPlot && (
        <PlotDetailsModal
          plot={selectedPlot}
          leads={leads}
          isOpen={Boolean(selectedPlot)}
          onClose={() => setSelectedPlot(null)}
          onSelectLead={onSelectLead}
        />
      )}

      {/* Add Plot Modal */}
      {isAddPlotOpen && (
        <AddPlotModal
          site={site}
          isOpen={isAddPlotOpen}
          onClose={() => setIsAddPlotOpen(false)}
        />
      )}

      {/* Edit Site Modal */}
      {isEditSiteOpen && (
        <EditSiteModal
          site={site}
          isOpen={isEditSiteOpen}
          onClose={() => setIsEditSiteOpen(false)}
          onDeleted={onBack}
        />
      )}
    </div>
  );
};
