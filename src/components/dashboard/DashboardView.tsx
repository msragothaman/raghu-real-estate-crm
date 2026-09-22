import React from 'react';
import {
  Building2,
  Grid,
  CheckCircle2,
  Clock,
  Award,
  Users,
  Sparkles,
  CalendarCheck,
  Handshake,
  ArrowRight,
  Phone,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { PlotStatusBadge, LeadStatusBadge } from '../common/Badge';
import { Site, Plot, Lead, ChannelPartner, FollowUp, LeadStatus } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { TabType } from '../layout/Sidebar';

interface DashboardViewProps {
  sites: Site[];
  plots: Plot[];
  leads: Lead[];
  channelPartners: ChannelPartner[];
  followups: FollowUp[];
  onNavigate: (tab: TabType, filterOrId?: string) => void;
  onSelectLead: (lead: Lead) => void;
  onSelectSite: (site: Site) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sites,
  plots,
  leads,
  channelPartners,
  followups,
  onNavigate,
  onSelectLead,
  onSelectSite,
}) => {
  const stats = dataStore.getDashboardStats();

  // Today's Follow-ups calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysFollowups = followups.filter(
    (f) => f.status === 'Pending' && f.followup_date === todayStr
  );
  const overdueFollowups = followups.filter(
    (f) => f.status === 'Pending' && f.followup_date < todayStr
  );

  // Pipeline statuses order
  const pipelineStatuses: { status: LeadStatus; label: string; color: string }[] = [
    { status: 'NEW', label: 'New', color: 'bg-blue-500' },
    { status: 'CONTACTED', label: 'Contacted', color: 'bg-purple-500' },
    { status: 'FOLLOW UP', label: 'Follow Up', color: 'bg-amber-500' },
    { status: 'SITE VISIT', label: 'Site Visit', color: 'bg-indigo-500' },
    { status: 'INTERESTED', label: 'Interested', color: 'bg-[#6C3BFF]' },
    { status: 'NEGOTIATION', label: 'Negotiation', color: 'bg-orange-500' },
    { status: 'BOOKED', label: 'Booked', color: 'bg-emerald-500' },
    { status: 'REGISTRATION COMPLETED', label: 'Registered', color: 'bg-green-600' },
    { status: 'LOST', label: 'Lost', color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#6C3BFF] to-[#4B1FB8] text-white p-6 rounded-2xl shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Real Estate CRM Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Raghu Real Estate CRM
          </h2>
          <p className="text-purple-100 text-sm mt-1">
            Real-time plot inventory, channel partner sales, and lead follow-ups.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('leads')}
            className="px-4 py-2.5 bg-white text-[#6C3BFF] font-bold text-sm rounded-xl hover:bg-purple-50 transition-colors shadow-sm"
          >
            Manage Leads
          </button>
          <button
            onClick={() => onNavigate('sites')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl transition-colors border border-white/20"
          >
            View Plot Matrix
          </button>
        </div>
      </div>

      {/* 10 Summary Cards Grid as defined in Section 4 */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Business Overview & Plot Inventory
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <MetricCard
            label="Total Sites"
            value={stats.totalSites}
            subtext="Active projects"
            icon={Building2}
            variant="purple"
            onClick={() => onNavigate('sites')}
          />
          <MetricCard
            label="Total Plots"
            value={stats.totalPlots}
            subtext="Across all layouts"
            icon={Grid}
            variant="slate"
            onClick={() => onNavigate('sites')}
          />
          <MetricCard
            label="Available Plots"
            value={stats.availablePlots}
            subtext="Ready for booking"
            icon={CheckCircle2}
            variant="emerald"
            onClick={() => onNavigate('sites')}
          />
          <MetricCard
            label="Booked Plots"
            value={stats.bookedPlots}
            subtext="Advance received"
            icon={Clock}
            variant="blue"
            onClick={() => onNavigate('sites')}
          />
          <MetricCard
            label="Sold Plots"
            value={stats.soldPlots}
            subtext="Full payment done"
            icon={Award}
            variant="purple"
            onClick={() => onNavigate('sites')}
          />

          <MetricCard
            label="Registered Plots"
            value={stats.registrationCompletedPlots}
            subtext="Registration done"
            icon={Award}
            variant="emerald"
            onClick={() => onNavigate('sites')}
          />
          <MetricCard
            label="Total Leads"
            value={stats.totalLeads}
            subtext="Google / Meta / WA"
            icon={Users}
            variant="blue"
            onClick={() => onNavigate('leads')}
          />
          <MetricCard
            label="New Leads"
            value={stats.newLeads}
            subtext="Awaiting first call"
            icon={Sparkles}
            variant="purple"
            onClick={() => onNavigate('leads')}
          />
          <MetricCard
            label="Follow-ups Due"
            value={stats.followupsDue}
            subtext="Pending action"
            icon={CalendarCheck}
            variant="amber"
            onClick={() => onNavigate('calendar')}
          />
          <MetricCard
            label="Active Partners"
            value={stats.activePartners}
            subtext="Channel partners"
            icon={Handshake}
            variant="emerald"
            onClick={() => onNavigate('partners')}
          />
        </div>
      </div>

      {/* Lead Pipeline Visualizer */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Lead Pipeline Funnel</h3>
            <p className="text-xs text-slate-500">
              Live count of leads in each stage of the sales lifecycle
            </p>
          </div>
          <button
            onClick={() => onNavigate('leads')}
            className="text-xs font-semibold text-[#6C3BFF] hover:underline flex items-center gap-1"
          >
            <span>Open Kanban Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5">
          {pipelineStatuses.map((item) => {
            const count = leads.filter((l) => l.status === item.status).length;
            return (
              <div
                key={item.status}
                onClick={() => onNavigate('leads', item.status)}
                className="bg-slate-50 hover:bg-[#F3EFFF] border border-slate-200/80 hover:border-[#DDD1FF] rounded-xl p-3 text-center cursor-pointer transition-all"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${item.color} mx-auto mb-2`} />
                <span className="text-[11px] font-semibold text-slate-600 block truncate">
                  {item.label}
                </span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dual Section: Site Performance & Today's Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Site Performance Breakdown */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Site Performance</h3>
              <p className="text-xs text-slate-500">Plot availability and sales velocity by project</p>
            </div>
            <button
              onClick={() => onNavigate('sites')}
              className="text-xs font-semibold text-[#6C3BFF] hover:underline flex items-center gap-1"
            >
              <span>View All Sites</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {sites.map((site) => {
              const metrics = dataStore.getSitePlotMetrics(site.id);
              const soldOrBookedPercent =
                metrics.total > 0
                  ? Math.round(
                      ((metrics.sold + metrics.booked + metrics.registrationCompleted) /
                        metrics.total) *
                        100
                    )
                  : 0;

              return (
                <div
                  key={site.id}
                  onClick={() => onSelectSite(site)}
                  className="p-4 rounded-xl border border-slate-200/70 hover:border-[#6C3BFF]/50 bg-white hover:bg-purple-50/20 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{site.name}</h4>
                      <p className="text-xs text-slate-500">{site.location}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {soldOrBookedPercent}% Sold / Booked
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden flex">
                    <div
                      style={{
                        width: `${metrics.total ? (metrics.registrationCompleted / metrics.total) * 100 : 0}%`,
                      }}
                      className="bg-indigo-600 h-full"
                      title="Registered"
                    />
                    <div
                      style={{
                        width: `${metrics.total ? (metrics.sold / metrics.total) * 100 : 0}%`,
                      }}
                      className="bg-[#6C3BFF] h-full"
                      title="Sold"
                    />
                    <div
                      style={{
                        width: `${metrics.total ? (metrics.booked / metrics.total) * 100 : 0}%`,
                      }}
                      className="bg-blue-400 h-full"
                      title="Booked"
                    />
                    <div
                      style={{
                        width: `${metrics.total ? (metrics.hold / metrics.total) * 100 : 0}%`,
                      }}
                      className="bg-amber-400 h-full"
                      title="Hold"
                    />
                  </div>

                  {/* Plot count pills */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
                    <span>
                      <strong className="text-slate-900">{metrics.total}</strong> Total
                    </span>
                    <span className="text-emerald-700">
                      <strong className="text-emerald-800">{metrics.available}</strong> Available
                    </span>
                    <span className="text-blue-700">
                      <strong className="text-blue-800">{metrics.booked}</strong> Booked
                    </span>
                    <span className="text-[#6C3BFF]">
                      <strong className="text-purple-800">{metrics.sold}</strong> Sold
                    </span>
                    <span className="text-indigo-700">
                      <strong className="text-indigo-800">{metrics.registrationCompleted}</strong> Registered
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's & Overdue Follow-ups */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Follow-up Action Center</h3>
                <p className="text-xs text-slate-500">Scheduled calls, meetings, & site visits</p>
              </div>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs font-semibold text-[#6C3BFF] hover:underline flex items-center gap-1"
              >
                <span>Full Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Overdue alert if any */}
            {overdueFollowups.length > 0 && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
                <span className="font-semibold">⚠️ {overdueFollowups.length} Overdue Follow-up(s)</span>
                <button
                  onClick={() => onNavigate('calendar', 'overdue')}
                  className="font-bold underline hover:text-rose-900"
                >
                  View Now
                </button>
              </div>
            )}

            {/* List */}
            <div className="space-y-2.5">
              {todaysFollowups.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CalendarCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-medium">No pending follow-ups for today.</p>
                  <p className="text-xs mt-1">Great job! All customer touches are up to date.</p>
                </div>
              ) : (
                todaysFollowups.slice(0, 4).map((f) => {
                  const lead = leads.find((l) => l.id === f.lead_id);
                  const partner = channelPartners.find((cp) => cp.id === f.assigned_partner_id);

                  return (
                    <div
                      key={f.id}
                      className="p-3 bg-slate-50 hover:bg-[#F3EFFF]/40 border border-slate-200/80 rounded-xl transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {lead ? lead.name : 'Customer'}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-[#6C3BFF]">
                            {f.type}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {f.followup_time || '10:00'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {f.notes || 'Routine follow-up call'}
                        </p>
                        {partner && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Partner: {partner.name}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {lead && (
                          <>
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 shadow-xs"
                              title="Call"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            </a>
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 shadow-xs"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                            </a>
                          </>
                        )}
                        <button
                          onClick={() => dataStore.updateFollowUpStatus(f.id, 'Completed')}
                          className="px-2.5 py-1.5 bg-[#6C3BFF] hover:bg-[#5A2FE0] text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total scheduled follow-ups: {followups.length}</span>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-[#6C3BFF] font-semibold hover:underline"
            >
              Open Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Channel Partner Performance Table */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Channel Partner Performance</h3>
            <p className="text-xs text-slate-500">
              Assigned leads, conversion velocity, and booking metrics by partner
            </p>
          </div>
          <button
            onClick={() => onNavigate('partners')}
            className="text-xs font-semibold text-[#6C3BFF] hover:underline flex items-center gap-1"
          >
            <span>Partner Directory & Reassignment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-xs">
                <th className="pb-3 pl-2">Partner Name</th>
                <th className="pb-3">Location</th>
                <th className="pb-3 text-center">Leads Assigned</th>
                <th className="pb-3 text-center">Site Visits</th>
                <th className="pb-3 text-center">Bookings</th>
                <th className="pb-3 text-center">Registrations</th>
                <th className="pb-3 text-center">Conversion</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {channelPartners.map((partner) => {
                const metrics = dataStore.getPartnerMetrics(partner.id);
                return (
                  <tr key={partner.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pl-2 font-bold text-slate-900">
                      {partner.name}
                    </td>
                    <td className="py-3 text-slate-500">{partner.location || 'Tamil Nadu'}</td>
                    <td className="py-3 text-center font-semibold text-slate-800">
                      {metrics.totalLeads}
                    </td>
                    <td className="py-3 text-center text-slate-600">{metrics.siteVisits}</td>
                    <td className="py-3 text-center font-bold text-blue-600">
                      {metrics.bookings}
                    </td>
                    <td className="py-3 text-center font-bold text-emerald-600">
                      {metrics.registrations}
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-[#6C3BFF] border border-purple-100">
                        {metrics.conversionRate}%
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={() => onNavigate('partners', partner.id)}
                        className="text-xs font-semibold text-[#6C3BFF] hover:underline"
                      >
                        View Details
                      </button>
                    </td>
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
