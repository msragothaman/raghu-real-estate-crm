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
  Edit,
} from 'lucide-react';
import { Site, Plot } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { AddSiteModal } from './AddSiteModal';
import { EditSiteModal } from './EditSiteModal';

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
  const [editingSite, setEditingSite] = useState<Site | null>(null);

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
          <h2 className="text-xl sm:text-2xl font-black text-purple-950">Sites & Projects</h2>
          <p className="text-xs text-purple-600/80">
            Manage residential layouts, plot inventories, and land approvals
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-[#F5F0FF] p-1 rounded-xl border border-[#E5DAFF]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-[#6C3BFF] shadow-xs' : 'text-purple-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-[#6C3BFF] shadow-xs' : 'text-purple-600'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#6C3BFF] hover:bg-[#5820E0] text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-[#6C3BFF]/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Site</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter sites by name, location, or approval..."
          className="w-full bg-white text-sm pl-9 pr-4 py-2 rounded-xl border border-[#E5DAFF] focus:outline-none focus:border-[#6C3BFF] text-purple-950"
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
                className="bg-white rounded-2xl border border-[#E5DAFF] shadow-xs hover:shadow-md hover:border-[#6C3BFF] transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Image header */}
                  <div className="relative h-44 w-full bg-[#2A086E] overflow-hidden">
                    <img
                      src={
                        site.image_url ||
                        'https://images.unsplash.com/photo-1500382017468-9049fed747ef'
                      }
                      alt={site.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
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
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-purple-950 backdrop-blur-xs flex items-center gap-1 shadow-xs">
                          <ShieldCheck className="w-3 h-3 text-[#6C3BFF]" />
                          <span>Approved</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSite(site);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-purple-900 rounded-xl shadow-md transition-colors"
                      title="Edit Site Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-black text-purple-950 group-hover:text-[#6C3BFF] transition-colors">
                      {site.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-purple-600 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />
                      <span>{site.location}</span>
                      {site.total_area && (
                        <>
                          <span>•</span>
                          <Maximize className="w-3.5 h-3.5 text-purple-400" />
                          <span>{site.total_area}</span>
                        </>
                      )}
                    </div>

                    {/* Plots KPI Grid */}
                    <div className="grid grid-cols-4 gap-2 mt-4 p-3 bg-[#FAF8FF] rounded-xl text-center border border-[#EFE7FF]">
                      <div>
                        <span className="text-[10px] font-semibold text-purple-600 block uppercase">
                          Total
                        </span>
                        <span className="text-base font-bold text-purple-950">
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
                <div className="p-4 bg-[#FAF8FF] border-t border-[#EFE7FF] flex items-center justify-between">
                  <span className="text-xs text-purple-600">
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
        <div className="bg-white rounded-2xl border border-[#E5DAFF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8FF] border-b border-[#E5DAFF] text-xs font-bold text-purple-700 uppercase">
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
              <tbody className="divide-y divide-purple-50">
                {filteredSites.map((site) => {
                  const metrics = dataStore.getSitePlotMetrics(site.id);
                  return (
                    <tr key={site.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-purple-950">{site.name}</td>
                      <td className="py-3.5 px-4 text-purple-700 text-xs">{site.location}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-purple-950">
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingSite(site)}
                            className="p-1 text-purple-600 hover:text-[#6C3BFF]"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectSite(site)}
                            className="text-xs font-bold text-[#6C3BFF] hover:underline"
                          >
                            View →
                          </button>
                        </div>
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

      {/* Edit Site Modal */}
      {editingSite && (
        <EditSiteModal
          site={editingSite}
          isOpen={Boolean(editingSite)}
          onClose={() => setEditingSite(null)}
        />
      )}
    </div>
  );
};
