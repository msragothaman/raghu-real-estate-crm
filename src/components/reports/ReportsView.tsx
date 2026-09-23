import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  TrendingUp,
  Building2,
  Handshake,
  PieChart,
  CheckCircle2,
  Clock,
  IndianRupee,
  Calendar,
  Layers,
  Phone,
  Target,
  ArrowUpRight,
  Filter,
  Sparkles,
} from 'lucide-react';
import { Lead, Site, ChannelPartner, Plot, FollowUp } from '../../types/crm';
import { useToast } from '../common/Toast';
import { soundManager } from '../../lib/soundEffects';

interface ReportsViewProps {
  leads: Lead[];
  sites: Site[];
  channelPartners: ChannelPartner[];
  plots: Plot[];
  followups?: FollowUp[];
}

type ReportTab = 'overview' | 'site-wise' | 'partner-wise' | 'source-wise';

export const ReportsView: React.FC<ReportsViewProps> = ({
  leads,
  sites,
  channelPartners,
  plots,
  followups = [],
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');

  // Interactive selectors for drill-down
  const [selectedSiteId, setSelectedSiteId] = useState<string>('ALL');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');

  // Helper: Format Indian Rupee
  const formatINR = (val: number): string => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // -------------------------------------------------------------
  // 1. OVERALL EXECUTIVE SALES REPORT CALCULATIONS
  // -------------------------------------------------------------
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const allBookedPlots = plots.filter(
    (p) => p.status === 'BOOKED' || p.status === 'SOLD' || p.status === 'REGISTRATION COMPLETED'
  );
  const registeredPlots = plots.filter((p) => p.status === 'REGISTRATION COMPLETED');
  const holdPlots = plots.filter((p) => p.status === 'HOLD');
  const availablePlots = plots.filter((p) => p.status === 'AVAILABLE');

  // Plots booked this current month
  const bookedThisMonth = plots.filter((p) => {
    const isBookedOrReg = ['BOOKED', 'SOLD', 'REGISTRATION COMPLETED'].includes(p.status);
    if (!isBookedOrReg) return false;
    const bDate = p.booking_date || p.updated_at?.split('T')[0] || '';
    return bDate.startsWith(currentMonthStr);
  });

  const totalRevenue = allBookedPlots.reduce((sum, p) => sum + (p.price || 0), 0);
  const registeredRevenue = registeredPlots.reduce((sum, p) => sum + (p.price || 0), 0);
  const pendingCollectionRevenue = totalRevenue - registeredRevenue;

  const totalFollowupsCount = followups.length;
  const completedFollowupsCount = followups.filter((f) => f.status === 'Completed').length;
  const pendingFollowupsCount = followups.filter((f) => f.status === 'Pending').length;

  const totalLeadsCount = leads.length;
  const overallConversionRate =
    totalLeadsCount > 0 ? Math.round((allBookedPlots.length / totalLeadsCount) * 100) : 0;

  // -------------------------------------------------------------
  // 2. SITE-WISE REPORT CALCULATIONS
  // -------------------------------------------------------------
  const siteReports = sites.map((site) => {
    const sitePlots = plots.filter((p) => p.site_id === site.id);
    const available = sitePlots.filter((p) => p.status === 'AVAILABLE').length;
    const hold = sitePlots.filter((p) => p.status === 'HOLD').length;
    const booked = sitePlots.filter((p) => p.status === 'BOOKED' || p.status === 'SOLD').length;
    const registered = sitePlots.filter((p) => p.status === 'REGISTRATION COMPLETED').length;
    const totalSiteRevenue = sitePlots
      .filter((p) => ['BOOKED', 'SOLD', 'REGISTRATION COMPLETED'].includes(p.status))
      .reduce((sum, p) => sum + (p.price || 0), 0);

    // Site Leads & Follow-ups
    const siteLeads = leads.filter((l) => l.interested_site_id === site.id);
    const siteFollowups = followups.filter((f) => {
      const lead = leads.find((l) => l.id === f.lead_id);
      return lead?.interested_site_id === site.id;
    }).length;

    const soldCount = booked + registered;
    const pctSold = sitePlots.length > 0 ? Math.round((soldCount / sitePlots.length) * 100) : 0;

    return {
      site,
      totalPlots: sitePlots.length,
      available,
      hold,
      booked,
      registered,
      totalSold: soldCount,
      revenue: totalSiteRevenue,
      leadCount: siteLeads.length,
      followupCount: siteFollowups,
      pctSold,
    };
  });

  const selectedSiteReport =
    selectedSiteId === 'ALL' ? null : siteReports.find((sr) => sr.site.id === selectedSiteId);

  // -------------------------------------------------------------
  // 3. CHANNEL PARTNER-WISE REPORT CALCULATIONS
  // -------------------------------------------------------------
  const partnerReports = channelPartners.map((cp) => {
    const partnerLeads = leads.filter((l) => l.assigned_channel_partner_id === cp.id);
    const partnerFollowups = followups.filter((f) => f.assigned_partner_id === cp.id).length;

    const bookedLeads = partnerLeads.filter((l) => l.status === 'BOOKED').length;
    const registeredLeads = partnerLeads.filter(
      (l) => l.status === 'REGISTRATION COMPLETED'
    ).length;
    const holdLeads = partnerLeads.filter((l) => l.status === 'INTERESTED' || l.status === 'NEGOTIATION').length;

    // Approximate revenue generated by partner's converted leads
    const partnerPlots = plots.filter((p) =>
      partnerLeads.some((l) => l.id === p.lead_id && ['BOOKED', 'SOLD', 'REGISTRATION COMPLETED'].includes(p.status))
    );
    const partnerRevenue = partnerPlots.reduce((sum, p) => sum + (p.price || 0), 0);

    const totalConversions = bookedLeads + registeredLeads;
    const convRate =
      partnerLeads.length > 0 ? Math.round((totalConversions / partnerLeads.length) * 100) : 0;

    return {
      partner: cp,
      leadsCount: partnerLeads.length,
      followupCount: partnerFollowups,
      holdCount: holdLeads,
      bookedCount: bookedLeads,
      registeredCount: registeredLeads,
      totalConversions,
      revenue: partnerRevenue,
      convRate,
    };
  });

  const selectedPartnerReport =
    selectedPartnerId === 'ALL'
      ? null
      : partnerReports.find((pr) => pr.partner.id === selectedPartnerId);

  // -------------------------------------------------------------
  // 4. SOURCE OF LEADS REPORT CALCULATIONS
  // -------------------------------------------------------------
  const allSources = [
    'Meta',
    'Google',
    'WhatsApp',
    'Website',
    'Referral',
    'Channel Partner',
    'Other',
  ];

  const sourceReports = allSources.map((sourceName) => {
    const srcLeads = leads.filter((l) => l.source === sourceName);
    const srcFollowups = followups.filter((f) => {
      const lead = leads.find((l) => l.id === f.lead_id);
      return lead?.source === sourceName;
    }).length;

    const booked = srcLeads.filter((l) => l.status === 'BOOKED').length;
    const registered = srcLeads.filter((l) => l.status === 'REGISTRATION COMPLETED').length;

    // Partner assignment distribution: who received these leads?
    const partnerDistribution: { [key: string]: number } = {};
    srcLeads.forEach((l) => {
      const pId = l.assigned_channel_partner_id || 'direct';
      partnerDistribution[pId] = (partnerDistribution[pId] || 0) + 1;
    });

    const directCount = partnerDistribution['direct'] || 0;
    const assignedToPartnersCount = srcLeads.length - directCount;

    // Attributed Revenue
    const attributedPlots = plots.filter((p) =>
      srcLeads.some((l) => l.id === p.lead_id && ['BOOKED', 'SOLD', 'REGISTRATION COMPLETED'].includes(p.status))
    );
    const revenue = attributedPlots.reduce((sum, p) => sum + (p.price || 0), 0);

    const conversions = booked + registered;
    const convRate = srcLeads.length > 0 ? Math.round((conversions / srcLeads.length) * 100) : 0;

    return {
      source: sourceName,
      leadsCount: srcLeads.length,
      directCount,
      assignedToPartnersCount,
      followupCount: srcFollowups,
      booked,
      registered,
      conversions,
      revenue,
      convRate,
      leads: srcLeads,
    };
  });

  const selectedSourceReport =
    selectedSource === 'ALL' ? null : sourceReports.find((sr) => sr.source === selectedSource);

  // -------------------------------------------------------------
  // CSV EXPORT LOGIC (Context-Sensitive)
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    soundManager.playClick();
    let csvHeaders: string[] = [];
    let csvRows: string[][] = [];
    let reportFilename = 'Raghu_CRM_Report.csv';

    if (activeTab === 'site-wise') {
      reportFilename = `Raghu_CRM_Site_Sales_Report_${today.toISOString().split('T')[0]}.csv`;
      csvHeaders = [
        'Site Name',
        'Location',
        'Total Plots',
        'Available Plots',
        'Hold / Advanced',
        'Booked Plots',
        'Followups Active',
        'Registered Plots',
        'Revenue (INR)',
        'Percent Sold',
      ];
      csvRows = siteReports.map((sr) => [
        `"${sr.site.name}"`,
        `"${sr.site.location}"`,
        String(sr.totalPlots),
        String(sr.available),
        String(sr.hold),
        String(sr.booked),
        String(sr.followupCount),
        String(sr.registered),
        String(sr.revenue),
        `${sr.pctSold}%`,
      ]);
    } else if (activeTab === 'partner-wise') {
      reportFilename = `Raghu_CRM_Partner_Report_${today.toISOString().split('T')[0]}.csv`;
      csvHeaders = [
        'Partner Name',
        'Phone',
        'City/Location',
        'Assigned Leads',
        'Follow-ups Done',
        'Advanced / Hold',
        'Booked Plots',
        'Registered Plots',
        'Total Revenue (INR)',
        'Conversion %',
      ];
      csvRows = partnerReports.map((pr) => [
        `"${pr.partner.name}"`,
        pr.partner.phone,
        `"${pr.partner.location || 'Tamil Nadu'}"`,
        String(pr.leadsCount),
        String(pr.followupCount),
        String(pr.holdCount),
        String(pr.bookedCount),
        String(pr.registeredCount),
        String(pr.revenue),
        `${pr.convRate}%`,
      ]);
    } else if (activeTab === 'source-wise') {
      reportFilename = `Raghu_CRM_Lead_Source_Report_${today.toISOString().split('T')[0]}.csv`;
      csvHeaders = [
        'Lead Source',
        'Total Leads So Far',
        'Direct Sales Leads',
        'Assigned to Partners',
        'Active Follow-ups',
        'Booked',
        'Registered',
        'Attributed Revenue (INR)',
        'Conversion %',
      ];
      csvRows = sourceReports.map((sr) => [
        `"${sr.source}"`,
        String(sr.leadsCount),
        String(sr.directCount),
        String(sr.assignedToPartnersCount),
        String(sr.followupCount),
        String(sr.booked),
        String(sr.registered),
        String(sr.revenue),
        `${sr.convRate}%`,
      ]);
    } else {
      reportFilename = `Raghu_CRM_Executive_Sales_Report_${today.toISOString().split('T')[0]}.csv`;
      csvHeaders = ['Metric', 'Value'];
      csvRows = [
        ['Total Plots Booked This Month', String(bookedThisMonth.length)],
        ['Total Plots Booked All-Time', String(allBookedPlots.length)],
        ['Total Plots Registered', String(registeredPlots.length)],
        ['Total Plots on Hold/Advanced', String(holdPlots.length)],
        ['Available Inventory Plots', String(availablePlots.length)],
        ['Total Follow-ups Scheduled', String(totalFollowupsCount)],
        ['Completed Follow-ups', String(completedFollowupsCount)],
        ['Pending Follow-ups', String(pendingFollowupsCount)],
        ['Total Sales Revenue', formatINR(totalRevenue)],
        ['Registered Realized Revenue', formatINR(registeredRevenue)],
        ['Overall Conversion Rate', `${overallConversionRate}%`],
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [csvHeaders.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', reportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    soundManager.playSuccess();
    showToast(`Report exported successfully as ${reportFilename}!`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-purple-950 flex items-center gap-2">
            <span>Sales & Performance Reports</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-[#6C3BFF] font-bold">
              Pure Purple Analytics
            </span>
          </h2>
          <p className="text-xs text-purple-700/80 mt-0.5">
            Real-time site velocity, channel partner performance, marketing source attribution, and revenue breakdown
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-[#6C3BFF] hover:bg-[#5820E0] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-[#6C3BFF]/25 transition-all hover:scale-102"
        >
          <Download className="w-4 h-4" />
          <span>Export {activeTab.toUpperCase().replace('-', ' ')} CSV</span>
        </button>
      </div>

      {/* 4 Interactive Report Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-2xl">
        {[
          { id: 'overview', label: 'Overall Sales Summary', icon: TrendingUp },
          { id: 'site-wise', label: 'Site-Wise Report', icon: Building2 },
          { id: 'partner-wise', label: 'Channel Partner Report', icon: Handshake },
          { id: 'source-wise', label: 'Source of Leads Report', icon: Target },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick();
                setActiveTab(tab.id as ReportTab);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                isActive
                  ? 'bg-[#6C3BFF] text-white shadow-sm shadow-[#6C3BFF]/30'
                  : 'text-purple-900 hover:text-purple-950 hover:bg-purple-100/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================= */}
      {/* 1. OVERALL EXECUTIVE SALES SUMMARY TAB */}
      {/* ============================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Booked This Month */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5DAFF] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-purple-700">Booked This Month</span>
                <span className="p-2 rounded-xl bg-purple-50 text-[#6C3BFF]">
                  <Calendar className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-purple-950 block">
                  {bookedThisMonth.length} <span className="text-sm font-semibold text-purple-500">plots</span>
                </span>
                <span className="text-xs text-purple-600 mt-1 block">
                  All-time Booked: <strong>{allBookedPlots.length} plots</strong>
                </span>
              </div>
            </div>

            {/* Total Registered Plots */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5DAFF] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-emerald-700">Registered Plots</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-emerald-900 block">
                  {registeredPlots.length} <span className="text-sm font-semibold text-emerald-600">plots</span>
                </span>
                <span className="text-xs text-emerald-700 mt-1 block">
                  On Hold / Advanced: <strong>{holdPlots.length} plots</strong>
                </span>
              </div>
            </div>

            {/* Follow-ups Overview */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5DAFF] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-indigo-700">Follow-ups Tracked</span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-indigo-950 block">
                  {totalFollowupsCount} <span className="text-sm font-semibold text-indigo-600">calls/visits</span>
                </span>
                <span className="text-xs text-indigo-700 mt-1 block">
                  Completed: <strong>{completedFollowupsCount}</strong> • Pending: <strong>{pendingFollowupsCount}</strong>
                </span>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5DAFF] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-[#6C3BFF]">Total Sales Revenue</span>
                <span className="p-2 rounded-xl bg-purple-50 text-[#6C3BFF]">
                  <IndianRupee className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-purple-950 block">
                  {formatINR(totalRevenue)}
                </span>
                <span className="text-xs text-purple-700 mt-1 block">
                  Realized Registry: <strong>{formatINR(registeredRevenue)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Sales Conversion Funnel */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5DAFF] shadow-xs">
            <h3 className="text-base font-bold text-purple-950 mb-1">Overall Sales Conversion Funnel</h3>
            <p className="text-xs text-purple-600/80 mb-6">
              Conversion pathway from initial customer enquiry down to registry completion
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                {
                  label: 'Total Enquiries',
                  count: totalLeadsCount,
                  percent: 100,
                  color: 'bg-purple-400',
                  bg: 'bg-purple-50/60',
                },
                {
                  label: 'Follow-ups Made',
                  count: totalFollowupsCount,
                  percent: totalLeadsCount ? Math.min(100, Math.round((totalFollowupsCount / totalLeadsCount) * 100)) : 0,
                  color: 'bg-[#6C3BFF]',
                  bg: 'bg-[#FAF8FF]',
                },
                {
                  label: 'Hold / Advanced',
                  count: holdPlots.length,
                  percent: totalLeadsCount ? Math.round((holdPlots.length / totalLeadsCount) * 100) : 0,
                  color: 'bg-indigo-500',
                  bg: 'bg-indigo-50/50',
                },
                {
                  label: 'Booked Plots',
                  count: allBookedPlots.length,
                  percent: totalLeadsCount ? Math.round((allBookedPlots.length / totalLeadsCount) * 100) : 0,
                  color: 'bg-emerald-500',
                  bg: 'bg-emerald-50/50',
                },
                {
                  label: 'Registered Plots',
                  count: registeredPlots.length,
                  percent: totalLeadsCount ? Math.round((registeredPlots.length / totalLeadsCount) * 100) : 0,
                  color: 'bg-green-600',
                  bg: 'bg-green-50/50',
                },
              ].map((stage, idx) => (
                <div
                  key={stage.label}
                  className={`p-4 rounded-xl border border-[#E5DAFF] ${stage.bg} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-purple-700 uppercase">
                      <span>{stage.label}</span>
                      <span className="text-purple-400">#{idx + 1}</span>
                    </div>
                    <span className="text-2xl font-black text-purple-950 mt-2 block">
                      {stage.count}
                    </span>
                  </div>

                  <div className="mt-4 pt-2 border-t border-purple-200/50">
                    <div className="flex items-center justify-between text-xs font-semibold text-purple-800">
                      <span>Rate</span>
                      <span>{stage.percent}%</span>
                    </div>
                    <div className="w-full bg-purple-200/60 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className={`${stage.color} h-full rounded-full`} style={{ width: `${stage.percent}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 2. SITE-WISE REPORT TAB */}
      {/* ============================================================= */}
      {activeTab === 'site-wise' && (
        <div className="space-y-6">
          {/* Site Selector Bar */}
          <div className="p-4 bg-white border border-[#E5DAFF] rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#6C3BFF]" />
              <span className="text-xs font-bold uppercase text-purple-950">Select Site / Project:</span>
              <select
                value={selectedSiteId}
                onChange={(e) => {
                  soundManager.playClick();
                  setSelectedSiteId(e.target.value);
                }}
                className="text-xs bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl px-3 py-2 font-bold text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
              >
                <option value="ALL">All Layout Sites (Overview Table)</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location})
                  </option>
                ))}
              </select>
            </div>

            {selectedSiteId !== 'ALL' && (
              <button
                onClick={() => setSelectedSiteId('ALL')}
                className="text-xs font-bold text-[#6C3BFF] hover:underline"
              >
                Clear Selection (Show All)
              </button>
            )}
          </div>

          {/* Selected Site Spotlight Card */}
          {selectedSiteReport && (
            <div className="p-5 bg-gradient-to-r from-[#FAF8FF] via-white to-purple-50/40 border-2 border-[#6C3BFF] rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EFE7FF]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C3BFF]">
                    Selected Project Analytics
                  </span>
                  <h3 className="text-lg font-black text-purple-950 leading-tight">
                    {selectedSiteReport.site.name}
                  </h3>
                  <p className="text-xs text-purple-600 mt-0.5">{selectedSiteReport.site.location}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-purple-500 block">Total Site Revenue</span>
                  <span className="text-xl font-black text-[#6C3BFF]">
                    {formatINR(selectedSiteReport.revenue)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
                <div className="p-3 bg-white rounded-xl border border-[#E5DAFF]">
                  <span className="text-[11px] text-purple-400 block font-semibold">Total Plots</span>
                  <span className="text-xl font-black text-purple-950">{selectedSiteReport.totalPlots}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[11px] text-emerald-700 block font-semibold">Available</span>
                  <span className="text-xl font-black text-emerald-900">{selectedSiteReport.available}</span>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                  <span className="text-[11px] text-indigo-700 block font-semibold">Hold / Advanced</span>
                  <span className="text-xl font-black text-indigo-900">{selectedSiteReport.hold}</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <span className="text-[11px] text-purple-700 block font-semibold">Booked</span>
                  <span className="text-xl font-black text-[#6C3BFF]">{selectedSiteReport.booked}</span>
                </div>
                <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                  <span className="text-[11px] text-green-700 block font-semibold">Registered</span>
                  <span className="text-xl font-black text-green-900">{selectedSiteReport.registered}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[11px] text-amber-700 block font-semibold">Follow-ups</span>
                  <span className="text-xl font-black text-amber-900">{selectedSiteReport.followupCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Full Site-Wise Table */}
          <div className="bg-white rounded-2xl border border-[#E5DAFF] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#EFE7FF] flex items-center justify-between bg-[#FAF8FF]">
              <h3 className="font-extrabold text-sm text-purple-950">Site-Wise Project Sales & Follow-up Table</h3>
              <span className="text-xs text-purple-600 font-semibold">{siteReports.length} Layout Sites</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8FF] border-b border-[#E5DAFF] text-purple-700 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Layout Site Name</th>
                    <th className="py-3 px-4 text-center">Total Plots</th>
                    <th className="py-3 px-4 text-center text-emerald-700">Available</th>
                    <th className="py-3 px-4 text-center text-indigo-700">Hold/Adv.</th>
                    <th className="py-3 px-4 text-center text-[#6C3BFF]">Booked</th>
                    <th className="py-3 px-4 text-center text-amber-700">Follow-ups</th>
                    <th className="py-3 px-4 text-center text-green-700">Registered</th>
                    <th className="py-3 px-4 text-right">Site Revenue</th>
                    <th className="py-3 px-4 text-center">% Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {siteReports.map((sr) => {
                    const isSelected = selectedSiteId === sr.site.id;
                    return (
                      <tr
                        key={sr.site.id}
                        onClick={() => {
                          soundManager.playClick();
                          setSelectedSiteId(sr.site.id);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-100/50 font-bold' : 'hover:bg-purple-50/40'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-purple-950">
                          <div>{sr.site.name}</div>
                          <span className="text-[10px] text-purple-400 font-normal">{sr.site.location}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-purple-900">{sr.totalPlots}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{sr.available}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-indigo-600">{sr.hold}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#6C3BFF]">{sr.booked}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-amber-700">{sr.followupCount}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-green-700">{sr.registered}</td>
                        <td className="py-3.5 px-4 text-right font-black text-purple-950">{formatINR(sr.revenue)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-[#6C3BFF] border border-purple-100">
                            {sr.pctSold}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 3. CHANNEL PARTNER-WISE REPORT TAB */}
      {/* ============================================================= */}
      {activeTab === 'partner-wise' && (
        <div className="space-y-6">
          {/* Partner Selector Bar */}
          <div className="p-4 bg-white border border-[#E5DAFF] rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Handshake className="w-4 h-4 text-[#6C3BFF]" />
              <span className="text-xs font-bold uppercase text-purple-950">Select Partner:</span>
              <select
                value={selectedPartnerId}
                onChange={(e) => {
                  soundManager.playClick();
                  setSelectedPartnerId(e.target.value);
                }}
                className="text-xs bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl px-3 py-2 font-bold text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
              >
                <option value="ALL">All Channel Partners (Overview Table)</option>
                {channelPartners.map((cp) => (
                  <option key={cp.id} value={cp.id}>
                    {cp.name} ({cp.location || 'Tamil Nadu'})
                  </option>
                ))}
              </select>
            </div>

            {selectedPartnerId !== 'ALL' && (
              <button
                onClick={() => setSelectedPartnerId('ALL')}
                className="text-xs font-bold text-[#6C3BFF] hover:underline"
              >
                Clear Selection (Show All)
              </button>
            )}
          </div>

          {/* Selected Partner Spotlight Card */}
          {selectedPartnerReport && (
            <div className="p-5 bg-gradient-to-r from-[#FAF8FF] via-white to-purple-50/40 border-2 border-[#6C3BFF] rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EFE7FF]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C3BFF]">
                    Partner Performance Spotlight
                  </span>
                  <h3 className="text-lg font-black text-purple-950 leading-tight">
                    {selectedPartnerReport.partner.name}
                  </h3>
                  <p className="text-xs text-purple-600 mt-0.5">
                    Phone: {selectedPartnerReport.partner.phone} • {selectedPartnerReport.partner.location || 'Tamil Nadu'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-purple-500 block">Revenue Brought In</span>
                  <span className="text-xl font-black text-[#6C3BFF]">
                    {formatINR(selectedPartnerReport.revenue)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-3 bg-white rounded-xl border border-[#E5DAFF]">
                  <span className="text-[11px] text-purple-400 block font-semibold">Assigned Leads</span>
                  <span className="text-xl font-black text-purple-950">{selectedPartnerReport.leadsCount}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[11px] text-amber-700 block font-semibold">Follow-ups Done</span>
                  <span className="text-xl font-black text-amber-900">{selectedPartnerReport.followupCount}</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <span className="text-[11px] text-purple-700 block font-semibold">Plots Booked</span>
                  <span className="text-xl font-black text-[#6C3BFF]">{selectedPartnerReport.bookedCount}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[11px] text-emerald-700 block font-semibold">Registered</span>
                  <span className="text-xl font-black text-emerald-900">{selectedPartnerReport.registeredCount}</span>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                  <span className="text-[11px] text-indigo-700 block font-semibold">Conversion Rate</span>
                  <span className="text-xl font-black text-indigo-900">{selectedPartnerReport.convRate}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Full Channel Partner Table */}
          <div className="bg-white rounded-2xl border border-[#E5DAFF] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#EFE7FF] flex items-center justify-between bg-[#FAF8FF]">
              <h3 className="font-extrabold text-sm text-purple-950">Channel Partner Sales & Follow-up Table</h3>
              <span className="text-xs text-purple-600 font-semibold">{partnerReports.length} Partners Active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8FF] border-b border-[#E5DAFF] text-purple-700 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Channel Partner</th>
                    <th className="py-3 px-4 text-center">Assigned Leads</th>
                    <th className="py-3 px-4 text-center text-amber-700">Follow-ups Done</th>
                    <th className="py-3 px-4 text-center text-indigo-700">Advanced / Hold</th>
                    <th className="py-3 px-4 text-center text-[#6C3BFF]">Booked</th>
                    <th className="py-3 px-4 text-center text-green-700">Registered</th>
                    <th className="py-3 px-4 text-right">Revenue Generated</th>
                    <th className="py-3 px-4 text-center">Conv. %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {partnerReports.map((pr) => {
                    const isSelected = selectedPartnerId === pr.partner.id;
                    return (
                      <tr
                        key={pr.partner.id}
                        onClick={() => {
                          soundManager.playClick();
                          setSelectedPartnerId(pr.partner.id);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-100/50 font-bold' : 'hover:bg-purple-50/40'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-purple-950">
                          <div>{pr.partner.name}</div>
                          <span className="text-[10px] text-purple-400 font-normal">{pr.partner.phone}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-purple-900">{pr.leadsCount}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-amber-700">{pr.followupCount}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-indigo-700">{pr.holdCount}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#6C3BFF]">{pr.bookedCount}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-green-700">{pr.registeredCount}</td>
                        <td className="py-3.5 px-4 text-right font-black text-purple-950">{formatINR(pr.revenue)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {pr.convRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 4. SOURCE OF LEADS REPORT TAB */}
      {/* ============================================================= */}
      {activeTab === 'source-wise' && (
        <div className="space-y-6">
          {/* Source Selector Bar */}
          <div className="p-4 bg-white border border-[#E5DAFF] rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#6C3BFF]" />
              <span className="text-xs font-bold uppercase text-purple-950">Select Lead Source:</span>
              <select
                value={selectedSource}
                onChange={(e) => {
                  soundManager.playClick();
                  setSelectedSource(e.target.value);
                }}
                className="text-xs bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl px-3 py-2 font-bold text-purple-950 focus:outline-none focus:border-[#6C3BFF]"
              >
                <option value="ALL">All Lead Sources (Overview Table)</option>
                {allSources.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>

            {selectedSource !== 'ALL' && (
              <button
                onClick={() => setSelectedSource('ALL')}
                className="text-xs font-bold text-[#6C3BFF] hover:underline"
              >
                Clear Selection (Show All)
              </button>
            )}
          </div>

          {/* Selected Source Spotlight Card */}
          {selectedSourceReport && (
            <div className="p-5 bg-gradient-to-r from-[#FAF8FF] via-white to-purple-50/40 border-2 border-[#6C3BFF] rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EFE7FF]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C3BFF]">
                    Marketing Channel Attribution
                  </span>
                  <h3 className="text-lg font-black text-purple-950 leading-tight">
                    {selectedSourceReport.source} Channel
                  </h3>
                  <p className="text-xs text-purple-600 mt-0.5">
                    Total Leads: {selectedSourceReport.leadsCount} • Assigned to Partners: {selectedSourceReport.assignedToPartnersCount}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-purple-500 block">Attributed Revenue</span>
                  <span className="text-xl font-black text-[#6C3BFF]">
                    {formatINR(selectedSourceReport.revenue)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-3 bg-white rounded-xl border border-[#E5DAFF]">
                  <span className="text-[11px] text-purple-400 block font-semibold">Total Leads So Far</span>
                  <span className="text-xl font-black text-purple-950">{selectedSourceReport.leadsCount}</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <span className="text-[11px] text-purple-700 block font-semibold">Partner Assigned</span>
                  <span className="text-xl font-black text-[#6C3BFF]">{selectedSourceReport.assignedToPartnersCount}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[11px] text-amber-700 block font-semibold">Follow-ups Active</span>
                  <span className="text-xl font-black text-amber-900">{selectedSourceReport.followupCount}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[11px] text-emerald-700 block font-semibold">Booked / Registered</span>
                  <span className="text-xl font-black text-emerald-900">{selectedSourceReport.conversions}</span>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                  <span className="text-[11px] text-indigo-700 block font-semibold">Channel Conv. %</span>
                  <span className="text-xl font-black text-indigo-900">{selectedSourceReport.convRate}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Full Lead Source Table */}
          <div className="bg-white rounded-2xl border border-[#E5DAFF] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#EFE7FF] flex items-center justify-between bg-[#FAF8FF]">
              <h3 className="font-extrabold text-sm text-purple-950">Marketing Source & Partner Allocation Table</h3>
              <span className="text-xs text-purple-600 font-semibold">{sourceReports.length} Lead Sources</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8FF] border-b border-[#E5DAFF] text-purple-700 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Lead Source</th>
                    <th className="py-3 px-4 text-center">Leads So Far</th>
                    <th className="py-3 px-4 text-center text-purple-800">Assigned to Partners</th>
                    <th className="py-3 px-4 text-center text-slate-600">In-House / Direct</th>
                    <th className="py-3 px-4 text-center text-amber-700">Follow-ups</th>
                    <th className="py-3 px-4 text-center text-[#6C3BFF]">Booked</th>
                    <th className="py-3 px-4 text-center text-green-700">Registered</th>
                    <th className="py-3 px-4 text-right">Attributed Revenue</th>
                    <th className="py-3 px-4 text-center">Conv. %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {sourceReports.map((sr) => {
                    const isSelected = selectedSource === sr.source;
                    return (
                      <tr
                        key={sr.source}
                        onClick={() => {
                          soundManager.playClick();
                          setSelectedSource(sr.source);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-100/50 font-bold' : 'hover:bg-purple-50/40'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-black text-purple-950">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-purple-50 text-[#6C3BFF] border border-purple-100 font-bold">
                            {sr.source}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-purple-950">{sr.leadsCount}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-purple-800">{sr.assignedToPartnersCount}</td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-600">{sr.directCount}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-amber-700">{sr.followupCount}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#6C3BFF]">{sr.booked}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-green-700">{sr.registered}</td>
                        <td className="py-3.5 px-4 text-right font-black text-purple-950">{formatINR(sr.revenue)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            {sr.convRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
