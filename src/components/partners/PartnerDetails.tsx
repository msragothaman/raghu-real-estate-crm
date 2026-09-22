import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  Award,
  Users,
  Building,
  CheckCircle2,
  Clock,
  TrendingUp,
  ExternalLink,
  Edit,
} from 'lucide-react';
import { ChannelPartner, Lead, Site, Plot, FollowUp } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { LeadStatusBadge } from '../common/Badge';
import { EditPartnerModal } from './EditPartnerModal';

interface PartnerDetailsProps {
  partner: ChannelPartner;
  leads: Lead[];
  sites: Site[];
  plots: Plot[];
  followups: FollowUp[];
  onBack: () => void;
  onSelectLead: (lead: Lead) => void;
}

export const PartnerDetails: React.FC<PartnerDetailsProps> = ({
  partner,
  leads,
  sites,
  plots,
  followups,
  onBack,
  onSelectLead,
}) => {
  const [isEditPartnerOpen, setIsEditPartnerOpen] = useState(false);
  const metrics = dataStore.getPartnerMetrics(partner.id);
  const assignedLeads = leads.filter((l) => l.assigned_channel_partner_id === partner.id);

  const phoneClean = partner.phone.replace(/[^0-9]/g, '');
  const waClean = (partner.whatsapp || partner.phone).replace(/[^0-9]/g, '');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button & Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-purple-900 hover:text-[#6C3BFF] bg-white px-3.5 py-2 rounded-xl border border-[#E5DAFF] hover:border-[#6C3BFF]/30 transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Partners</span>
        </button>

        <button
          onClick={() => setIsEditPartnerOpen(true)}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-purple-50 text-purple-900 text-sm font-bold px-3.5 py-2 rounded-xl border border-[#E5DAFF] transition-all shadow-xs"
        >
          <Edit className="w-4 h-4 text-[#6C3BFF]" />
          <span>Edit Partner</span>
        </button>
      </div>

      {/* Partner Overview Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5DAFF] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8C5DFF] to-[#6C3BFF] text-white font-black text-2xl flex items-center justify-center shadow-md shadow-[#6C3BFF]/20 shrink-0">
              {partner.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-purple-950">{partner.name}</h2>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    partner.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {partner.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-purple-600 mt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>{partner.location || partner.address || 'Tamil Nadu'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Partner since {partner.joining_date}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Communication Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${partner.phone}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors shadow-xs"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call ({partner.phone})</span>
            </a>
            <a
              href={`https://wa.me/${waClean}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-green-50 hover:bg-green-100 text-green-800 font-bold text-xs rounded-xl border border-green-200 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              <span>WhatsApp</span>
            </a>
            {partner.email && (
              <a
                href={`mailto:${partner.email}`}
                className="p-2 text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-xl border border-[#E5DAFF]"
                title={partner.email}
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* 6 Performance Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-6 pt-6 border-t border-[#EFE7FF] text-center">
          <div className="p-3 bg-[#FAF8FF] rounded-xl border border-[#E5DAFF]">
            <span className="text-[11px] font-bold text-purple-600 block uppercase">
              Total Leads
            </span>
            <span className="text-xl font-black text-purple-950 mt-1 block">
              {metrics.totalLeads}
            </span>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <span className="text-[11px] font-bold text-blue-600 block uppercase">
              Follow-ups
            </span>
            <span className="text-xl font-black text-blue-700 mt-1 block">
              {metrics.followups}
            </span>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <span className="text-[11px] font-bold text-indigo-600 block uppercase">
              Site Visits
            </span>
            <span className="text-xl font-black text-indigo-700 mt-1 block">
              {metrics.siteVisits}
            </span>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <span className="text-[11px] font-bold text-amber-600 block uppercase">
              Bookings
            </span>
            <span className="text-xl font-black text-amber-700 mt-1 block">
              {metrics.bookings}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-600 block uppercase">
              Registrations
            </span>
            <span className="text-xl font-black text-emerald-700 mt-1 block">
              {metrics.registrations}
            </span>
          </div>

          <div className="p-3 bg-[#F3EFFF] rounded-xl border border-[#C7ACFF]">
            <span className="text-[11px] font-bold text-[#6C3BFF] block uppercase">
              Conversion
            </span>
            <span className="text-xl font-black text-[#6C3BFF] mt-1 block">
              {metrics.conversionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Assigned Leads Table */}
      <div className="bg-white rounded-2xl border border-[#E5DAFF] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#EFE7FF] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-purple-950">
              Leads Assigned to {partner.name}
            </h3>
            <p className="text-xs text-purple-600/80">
              Customer requirement, plot status, and current pipeline progress
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F3EFFF] text-[#6C3BFF] border border-[#DDD1FF]">
            {assignedLeads.length} Leads
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8FF] border-b border-[#E5DAFF] text-xs font-bold text-purple-700 uppercase">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Phone / WhatsApp</th>
                <th className="py-3.5 px-4">Interested Site</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Next Follow-up</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {assignedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-purple-300">
                    No leads currently assigned to this channel partner.
                  </td>
                </tr>
              ) : (
                assignedLeads.map((lead) => {
                  const site = sites.find((s) => s.id === lead.interested_site_id);
                  const pendingFollowup = followups.find(
                    (f) => f.lead_id === lead.id && f.status === 'Pending'
                  );

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-purple-50/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-bold text-purple-950">{lead.name}</td>
                      <td className="py-3.5 px-4 text-xs font-medium text-purple-800">
                        {lead.phone}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-purple-950">
                        {site ? site.name : 'Flexible'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                          {lead.source}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <LeadStatusBadge status={lead.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {pendingFollowup ? (
                          <span className="text-amber-700 font-semibold">
                            {pendingFollowup.type} ({pendingFollowup.followup_date})
                          </span>
                        ) : (
                          <span className="text-purple-300 italic">None scheduled</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLead(lead);
                          }}
                          className="text-xs font-bold text-[#6C3BFF] hover:underline"
                        >
                          View Lead →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Partner Modal */}
      {isEditPartnerOpen && (
        <EditPartnerModal
          partner={partner}
          isOpen={isEditPartnerOpen}
          onClose={() => setIsEditPartnerOpen(false)}
          onPartnerDeleted={onBack}
        />
      )}
    </div>
  );
};
