import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Maximize,
  Plus,
  ArrowRight,
  ShieldCheck,
  Search,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Site, Plot } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { AddSiteModal } from './AddSiteModal';

interface SiteListProps {
  sites: Site[];
  plots: Plot[];
  onSelectSite: (site: Site) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const SiteList: React.FC<SiteListProps> = ({
  sites,
  onSelectSite,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');

  const filteredSites = sites.filter((site) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      site.name.toLowerCase().includes(q) ||
      site.location.toLowerCase().includes(q) ||
      site.approval_info?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Sites & Projects</h2>
          <p className="text-xs text-slate-500">
            Manage residential layouts, land approvals, and plot inventories
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-[#6C3BFF] shadow-xs' : 'text-slate-500'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-[#6C3BFF] shadow-xs' : 'text-slate-500'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#6C3BFF] hover:bg-[#5A2FE0] text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Site</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter sites by name, location, or approval..."
          className="w-full bg-white text-sm pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C3BFF]"
        />
      </div>

      {/* Sites Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSites.map((site) => {
            const metrics = dataStore.getSitePlotMetrics(site.id);

            return (
              <div
                key={site.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#6C3BFF]/40 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Image header */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={
                        site.image_url ||
                        'https://images.unsplash.com/photo-1500382017468-9049fed747ef'
                      }
                      alt={site.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${
                          site.status === 'ACTIVE'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {site.status}
                      </span>
                      {site.approval_info && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-slate-800 backdrop-blur-xs flex items-center gap-1 shadow-xs">
                          <ShieldCheck className="w-3 h-3 text-[#6C3BFF]" />
                          <span>Approved</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#6C3BFF] transition-colors">
                      {site.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{site.location}</span>
                      {site.total_area && (
                        <>
                          <span>•</span>
                          <Maximize className="w-3.5 h-3.5 text-slate-400" />
                          <span>{site.total_area}</span>
                        </>
                      )}
                    </div>

                    {/* Plots KPI Grid */}
                    <div className="grid grid-cols-4 gap-2 mt-4 p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                          Total
                        </span>
                        <span className="text-base font-bold text-slate-900">
                          {metrics.total}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-emerald-600 block uppercase">
                          Available
                        </span>
                        <span className="text-base font-bold text-emerald-700">
                          {metrics.available}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-blue-600 block uppercase">
                          Booked
                        </span>
                        <span className="text-base font-bold text-blue-700">
                          {metrics.booked}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-[#6C3BFF] block uppercase">
                          Sold
                        </span>
                        <span className="text-base font-bold text-[#6C3BFF]">
                          {metrics.sold + metrics.registrationCompleted}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {metrics.registrationCompleted} registered
                  </span>
                  <button
                    onClick={() => onSelectSite(site)}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-[#6C3BFF] text-[#6C3BFF] hover:text-white border border-[#DDD1FF] hover:border-[#6C3BFF] text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-xs"
                  >
                    <span>VIEW SITE & PLOTS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-3.5 px-4">Site Name</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-center">Total Plots</th>
                  <th className="py-3.5 px-4 text-center text-emerald-700">Available</th>
                  <th className="py-3.5 px-4 text-center text-blue-700">Booked</th>
                  <th className="py-3.5 px-4 text-center text-[#6C3BFF]">Sold</th>
                  <th className="py-3.5 px-4 text-center text-indigo-700">Registered</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSites.map((site) => {
                  const metrics = dataStore.getSitePlotMetrics(site.id);
                  return (
                    <tr key={site.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{site.name}</td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">{site.location}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {metrics.total}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                        {metrics.available}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-blue-700">
                        {metrics.booked}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#6C3BFF]">
                        {metrics.sold}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-indigo-700">
                        {metrics.registrationCompleted}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {site.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectSite(site)}
                          className="text-xs font-bold text-[#6C3BFF] hover:underline"
                        >
                          View Site →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Site Modal */}
      {isAddModalOpen && (
        <AddSiteModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSiteCreated={(site) => onSelectSite(site)}
        />
      )}
    </div>
  );
};
