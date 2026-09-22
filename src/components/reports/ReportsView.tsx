import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  TrendingUp,
  Filter,
  Users,
  Building2,
  Handshake,
  PieChart,
  CheckCircle2,
} from 'lucide-react';
import { Lead, Site, ChannelPartner, Plot } from '../../types/crm';
import { useToast } from '../common/Toast';

interface ReportsViewProps {
  leads: Lead[];
  sites: Site[];
  channelPartners: ChannelPartner[];
  plots: Plot[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  leads,
  sites,
  channelPartners,
  plots,
}) => {
  const { showToast } = useToast();
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [siteFilter, setSiteFilter] = useState<string>('ALL');
  const [partnerFilter, setPartnerFilter] = useState<string>('ALL');

  // Filter leads based on selected controls
  const filteredLeads = leads.filter((l) => {
    if (sourceFilter !== 'ALL' && l.source !== sourceFilter) return false;
    if (siteFilter !== 'ALL' && l.interested_site_id !== siteFilter) return false;
    if (partnerFilter !== 'ALL' && l.assigned_channel_partner_id !== partnerFilter) return false;
    return true;
  });

  // Conversion Funnel Metrics
  const totalLeads = filteredLeads.length;
  const contacted = filteredLeads.filter((l) =>
    ['CONTACTED', 'FOLLOW UP', 'SITE VISIT', 'INTERESTED', 'NEGOTIATION', 'BOOKED', 'REGISTRATION COMPLETED'].includes(
      l.status
    )
  ).length;
  const siteVisits = filteredLeads.filter((l) =>
    ['SITE VISIT', 'INTERESTED', 'NEGOTIATION', 'BOOKED', 'REGISTRATION COMPLETED'].includes(l.status)
  ).length;
  const bookings = filteredLeads.filter((l) =>
    ['BOOKED', 'REGISTRATION COMPLETED'].includes(l.status)
  ).length;
  const registrations = filteredLeads.filter((l) => l.status === 'REGISTRATION COMPLETED').length;

  // Leads by Source
  const sources = ['Google', 'Meta', 'WhatsApp', 'Website', 'Referral', 'Channel Partner', 'Other'];
  const sourceBreakdown = sources.map((src) => ({
    name: src,
    count: filteredLeads.filter((l) => l.source === src).length,
  }));

  // Leads by Status
  const statuses = [
    'NEW',
    'CONTACTED',
    'FOLLOW UP',
    'SITE VISIT',
    'INTERESTED',
    'NEGOTIATION',
    'BOOKED',
    'REGISTRATION COMPLETED',
    'LOST',
  ];
  const statusBreakdown = statuses.map((st) => ({
    name: st,
    count: filteredLeads.filter((l) => l.status === st).length,
  }));

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = [
      'Lead ID',
      'Name',
      'Phone',
      'Source',
      'Campaign',
      'Status',
      'Interested Site',
      'Budget',
      'Preferred Plot Size',
      'Assigned Partner',
      'Created At',
    ];

    const rows = filteredLeads.map((l) => {
      const site = sites.find((s) => s.id === l.interested_site_id)?.name || '';
      const partner = channelPartners.find((cp) => cp.id === l.assigned_channel_partner_id)?.name || 'Direct';
      return [
        l.id,
        `"${l.name}"`,
        l.phone,
        l.source,
        `"${l.campaign || ''}"`,
        l.status,
        `"${site}"`,
        `"${l.budget || ''}"`,
        `"${l.preferred_plot_size || ''}"`,
        `"${partner}"`,
        l.created_at,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Raghu_CRM_Leads_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Leads CSV Report downloaded successfully.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Reports & Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Conversion funnel, marketing lead channel attribution, and site sales velocity
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all"
        >
          <Download className="w-4 h-4 text-[#6C3BFF]" />
          <span>Export Leads CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Reports:</span>
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700"
        >
          <option value="ALL">All Lead Sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700"
        >
          <option value="ALL">All Sites</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700"
        >
          <option value="ALL">All Channel Partners</option>
          {channelPartners.map((cp) => (
            <option key={cp.id} value={cp.id}>
              {cp.name}
            </option>
          ))}
        </select>

        {(sourceFilter !== 'ALL' || siteFilter !== 'ALL' || partnerFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSourceFilter('ALL');
              setSiteFilter('ALL');
              setPartnerFilter('ALL');
            }}
            className="text-xs font-bold text-[#6C3BFF] hover:underline px-2"
          >
            Reset
          </button>
        )}
      </div>

      {/* CONVERSION FUNNEL SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Sales Conversion Funnel</h3>
        <p className="text-xs text-slate-500 mb-6">
          Step-by-step progression from initial marketing enquiry to final plot registry
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
          {[
            {
              label: 'Total Leads',
              count: totalLeads,
              percent: 100,
              color: 'bg-blue-500',
              bg: 'bg-blue-50/50',
            },
            {
              label: 'Contacted',
              count: contacted,
              percent: totalLeads ? Math.round((contacted / totalLeads) * 100) : 0,
              color: 'bg-purple-500',
              bg: 'bg-purple-50/50',
            },
            {
              label: 'Site Visits',
              count: siteVisits,
              percent: totalLeads ? Math.round((siteVisits / totalLeads) * 100) : 0,
              color: 'bg-indigo-500',
              bg: 'bg-indigo-50/50',
            },
            {
              label: 'Bookings',
              count: bookings,
              percent: totalLeads ? Math.round((bookings / totalLeads) * 100) : 0,
              color: 'bg-emerald-500',
              bg: 'bg-emerald-50/50',
            },
            {
              label: 'Registrations',
              count: registrations,
              percent: totalLeads ? Math.round((registrations / totalLeads) * 100) : 0,
              color: 'bg-green-600',
              bg: 'bg-green-50/50',
            },
          ].map((stage, i) => (
            <div
              key={stage.label}
              className={`p-4 rounded-xl border border-slate-200/80 ${stage.bg} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {stage.label}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Step {i + 1}</span>
                </div>
                <span className="text-2xl font-bold text-slate-900 mt-2 block">
                  {stage.count}
                </span>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200/60">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Conv. Rate</span>
                  <span className="text-slate-800">{stage.percent}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`${stage.color} h-full rounded-full`}
                    style={{ width: `${stage.percent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DUAL BREAKDOWN: Sources & Statuses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Source */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Leads by Marketing Source</h3>
          <p className="text-xs text-slate-500 mb-4">Ad platforms, referrals, and organic channels</p>

          <div className="space-y-3">
            {sourceBreakdown.map((item) => {
              const pct = totalLeads ? Math.round((item.count / totalLeads) * 100) : 0;
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="text-slate-900">
                      {item.count} leads ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#6C3BFF] h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leads by Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Leads by Pipeline Stage</h3>
          <p className="text-xs text-slate-500 mb-4">Current distribution across CRM stages</p>

          <div className="space-y-3">
            {statusBreakdown.map((item) => {
              const pct = totalLeads ? Math.round((item.count / totalLeads) * 100) : 0;
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="text-slate-900">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SALES BY SITE & SALES BY PARTNER TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Site */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Sales Velocity by Site</h3>
            <p className="text-xs text-slate-500">Bookings and registrations across layouts</p>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold">
              <tr>
                <th className="py-3 px-4">Site Name</th>
                <th className="py-3 px-4 text-center">Total Plots</th>
                <th className="py-3 px-4 text-center text-blue-700">Booked</th>
                <th className="py-3 px-4 text-center text-[#6C3BFF]">Sold</th>
                <th className="py-3 px-4 text-center text-indigo-700">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sites.map((site) => {
                const sitePlots = plots.filter((p) => p.site_id === site.id);
                const booked = sitePlots.filter((p) => p.status === 'BOOKED').length;
                const sold = sitePlots.filter((p) => p.status === 'SOLD').length;
                const registered = sitePlots.filter(
                  (p) => p.status === 'REGISTRATION COMPLETED'
                ).length;

                return (
                  <tr key={site.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">{site.name}</td>
                    <td className="py-3 px-4 text-center">{sitePlots.length}</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-600">{booked}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#6C3BFF]">{sold}</td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-700">{registered}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sales by Channel Partner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Sales by Channel Partner</h3>
            <p className="text-xs text-slate-500">Bookings and registered plots generated</p>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold">
              <tr>
                <th className="py-3 px-4">Partner</th>
                <th className="py-3 px-4 text-center">Leads</th>
                <th className="py-3 px-4 text-center text-blue-700">Bookings</th>
                <th className="py-3 px-4 text-center text-indigo-700">Registrations</th>
                <th className="py-3 px-4 text-center">Conv. %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {channelPartners.map((cp) => {
                const partnerLeads = leads.filter((l) => l.assigned_channel_partner_id === cp.id);
                const b = partnerLeads.filter((l) => l.status === 'BOOKED').length;
                const r = partnerLeads.filter((l) => l.status === 'REGISTRATION COMPLETED').length;
                const conv =
                  partnerLeads.length > 0
                    ? Math.round(((b + r) / partnerLeads.length) * 100)
                    : 0;

                return (
                  <tr key={cp.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">{cp.name}</td>
                    <td className="py-3 px-4 text-center">{partnerLeads.length}</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-600">{b}</td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-700">{r}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#6C3BFF]">{conv}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
