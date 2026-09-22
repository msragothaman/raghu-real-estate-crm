import React from 'react';
import { Lead, Site, ChannelPartner } from '../../types/crm';
import { LeadStatusBadge } from '../common/Badge';
import { Phone, MessageCircle, ExternalLink, Handshake, Building } from 'lucide-react';

interface LeadTableProps {
  leads: Lead[];
  sites: Site[];
  channelPartners: ChannelPartner[];
  onSelectLead: (lead: Lead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  sites,
  channelPartners,
  onSelectLead,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E5DAFF] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAF8FF] border-b border-[#E5DAFF] text-xs font-bold text-purple-700 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Customer Name</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4">Source & Campaign</th>
              <th className="py-3.5 px-4">Interested Site</th>
              <th className="py-3.5 px-4">Budget / Size</th>
              <th className="py-3.5 px-4">Assigned Partner</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-purple-400">
                  No leads found matching current filters.
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const site = sites.find((s) => s.id === lead.interested_site_id);
                const partner = channelPartners.find(
                  (cp) => cp.id === lead.assigned_channel_partner_id
                );
                const phoneClean = lead.phone.replace(/[^0-9]/g, '');

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="hover:bg-purple-50/40 transition-colors cursor-pointer"
                  >
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <p className="font-black text-purple-950">{lead.name}</p>
                      <span className="text-[10px] text-purple-400">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-purple-900">{lead.phone}</span>
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-purple-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/${phoneClean}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-purple-400 hover:text-emerald-500 hover:bg-emerald-50 rounded"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 text-[#6C3BFF] border border-purple-100">
                        {lead.source}
                      </span>
                      {lead.campaign && (
                        <p className="text-[11px] text-purple-400 truncate max-w-[150px] mt-0.5">
                          {lead.campaign}
                        </p>
                      )}
                    </td>

                    {/* Site */}
                    <td className="py-3.5 px-4 text-xs font-bold text-purple-950">
                      {site ? site.name : 'Any'}
                    </td>

                    {/* Budget */}
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-bold text-purple-950 block">{lead.budget || '—'}</span>
                      <span className="text-purple-600 text-[11px]">
                        {lead.preferred_plot_size || '1200 sqft'}
                      </span>
                    </td>

                    {/* Partner */}
                    <td className="py-3.5 px-4 text-xs">
                      {partner ? (
                        <span className="inline-flex items-center gap-1 font-bold text-purple-950">
                          <Handshake className="w-3.5 h-3.5 text-[#6C3BFF]" />
                          {partner.name}
                        </span>
                      ) : (
                        <span className="text-purple-400 italic">Direct</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <LeadStatusBadge status={lead.status} size="sm" />
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead(lead);
                        }}
                        className="text-xs font-bold text-[#6C3BFF] hover:underline"
                      >
                        View →
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
  );
};
