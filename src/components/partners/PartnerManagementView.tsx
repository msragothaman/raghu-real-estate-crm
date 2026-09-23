import React, { useState } from 'react';
import {
  Handshake,
  ArrowRightLeft,
  Plus,
  Phone,
  MessageCircle,
  MapPin,
  TrendingUp,
  Award,
  Users,
  Search,
  Edit,
} from 'lucide-react';
import { ChannelPartner, Lead, Site, Plot, FollowUp, User } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { PartnerDetails } from './PartnerDetails';
import { PartnerReassignBoard } from './PartnerReassignBoard';
import { AddPartnerModal } from './AddPartnerModal';
import { EditPartnerModal } from './EditPartnerModal';

interface PartnerManagementViewProps {
  channelPartners: ChannelPartner[];
  leads: Lead[];
  sites: Site[];
  plots: Plot[];
  followups: FollowUp[];
  onSelectLead: (lead: Lead) => void;
  selectedPartnerId?: string | null;
  onClearSelectedPartner?: () => void;
  currentUser?: User;
}

export const PartnerManagementView: React.FC<PartnerManagementViewProps> = ({
  channelPartners,
  leads,
  sites,
  plots,
  followups,
  onSelectLead,
  selectedPartnerId,
  onClearSelectedPartner,
  currentUser,
}) => {
  const activeUser = currentUser || dataStore.getState().currentUser;
  const isAdmin = activeUser.role === 'ADMIN';
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'reassign'>('directory');
  const [activePartner, setActivePartner] = useState<ChannelPartner | null>(
    selectedPartnerId
      ? channelPartners.find((cp) => cp.id === selectedPartnerId) || null
      : null
  );
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<ChannelPartner | null>(null);
  const [search, setSearch] = useState('');

  // If a specific partner was clicked from outside
  if (activePartner) {
    return (
      <PartnerDetails
        partner={activePartner}
        leads={leads}
        sites={sites}
        plots={plots}
        followups={followups}
        onBack={() => {
          setActivePartner(null);
          if (onClearSelectedPartner) onClearSelectedPartner();
        }}
        onSelectLead={onSelectLead}
      />
    );
  }

  const filteredPartners = channelPartners.filter((cp) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      cp.name.toLowerCase().includes(q) ||
      cp.phone.includes(q) ||
      cp.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-purple-950 flex items-center gap-2">
            <span>Channel Partners</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F3EFFF] text-[#6C3BFF] font-bold border border-[#DDD1FF]">
              {channelPartners.length} Partners
            </span>
          </h2>
          <p className="text-xs text-purple-600/80 mt-0.5">
            Manage real estate brokers, track performance conversions, and reassign leads
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-tab switcher */}
          <div className="flex bg-[#F5F0FF] p-1 rounded-xl border border-[#E5DAFF]">
            <button
              onClick={() => setActiveSubTab('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'directory'
                  ? 'bg-white text-[#6C3BFF] shadow-xs'
                  : 'text-purple-700 hover:text-purple-950'
              }`}
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Partner Directory</span>
            </button>
            <button
              onClick={() => setActiveSubTab('reassign')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'reassign'
                  ? 'bg-white text-[#6C3BFF] shadow-xs'
                  : 'text-purple-700 hover:text-purple-950'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Drag & Drop Reassignment</span>
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsAddPartnerOpen(true)}
              className="inline-flex items-center gap-2 bg-[#6C3BFF] hover:bg-[#5820E0] text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-[#6C3BFF]/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard Partner</span>
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'reassign' ? (
        <PartnerReassignBoard
          currentUser={activeUser}
          leads={leads}
          channelPartners={channelPartners}
          sites={sites}
          onSelectLead={onSelectLead}
        />
      ) : (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search partner by name, phone, location..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#E5DAFF] rounded-xl focus:outline-none focus:border-[#6C3BFF] text-purple-950"
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPartners.map((partner) => {
              const metrics = dataStore.getPartnerMetrics(partner.id);
              const waClean = (partner.whatsapp || partner.phone).replace(/[^0-9]/g, '');

              return (
                <div
                  key={partner.id}
                  className="bg-white rounded-2xl border border-[#E5DAFF] shadow-xs hover:shadow-md hover:border-[#6C3BFF] transition-all p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-purple-100 text-[#6C3BFF] font-black text-lg flex items-center justify-center shrink-0">
                          {partner.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-black text-base text-purple-950 leading-tight">
                            {partner.name}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-purple-500 mt-0.5">
                            <MapPin className="w-3 h-3 text-purple-400" />
                            <span>{partner.location || 'Tamil Nadu'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {isAdmin && (
                          <button
                            onClick={() => setEditingPartner(partner)}
                            className="p-1.5 text-purple-400 hover:text-[#6C3BFF] hover:bg-purple-50 rounded-lg"
                            title="Edit Partner"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            partner.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {partner.status}
                        </span>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#EFE7FF] text-xs">
                      <a
                        href={`tel:${partner.phone}`}
                        className="flex-1 py-1.5 px-2.5 bg-[#FAF8FF] hover:bg-purple-50 rounded-lg text-purple-950 font-semibold flex items-center justify-center gap-1.5 border border-[#E5DAFF]"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{partner.phone}</span>
                      </a>
                      <a
                        href={`https://wa.me/${waClean}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 text-green-600" />
                      </a>
                    </div>

                    {/* Metrics 4-cell strip */}
                    <div className="grid grid-cols-4 gap-2 mt-4 p-3 bg-[#FAF8FF] rounded-xl text-center border border-[#EFE7FF]">
                      <div>
                        <span className="text-[10px] font-semibold text-purple-600 block uppercase">
                          Leads
                        </span>
                        <span className="text-base font-bold text-purple-950">
                          {metrics.totalLeads}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-blue-600 block uppercase">
                          Visits
                        </span>
                        <span className="text-base font-bold text-blue-700">
                          {metrics.siteVisits}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-amber-600 block uppercase">
                          Booked
                        </span>
                        <span className="text-base font-bold text-amber-700">
                          {metrics.bookings}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-[#6C3BFF] block uppercase">
                          Conv.
                        </span>
                        <span className="text-base font-bold text-[#6C3BFF]">
                          {metrics.conversionRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="mt-4 pt-3 border-t border-[#EFE7FF] flex items-center justify-between">
                    <span className="text-xs text-purple-400">
                      {metrics.registrations} registered
                    </span>
                    <button
                      onClick={() => setActivePartner(partner)}
                      className="text-xs font-bold text-[#6C3BFF] hover:underline"
                    >
                      View Partner Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {isAddPartnerOpen && (
        <AddPartnerModal
          isOpen={isAddPartnerOpen}
          onClose={() => setIsAddPartnerOpen(false)}
        />
      )}

      {/* Edit Partner Modal */}
      {editingPartner && (
        <EditPartnerModal
          partner={editingPartner}
          isOpen={Boolean(editingPartner)}
          onClose={() => setEditingPartner(null)}
        />
      )}
    </div>
  );
};
