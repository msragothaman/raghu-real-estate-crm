import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  Building,
  User,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { FollowUp, Lead, ChannelPartner, Site, FollowUpStatus } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';
import { FollowUpStatusBadge } from '../common/Badge';
import { AddFollowUpModal } from '../leads/AddFollowUpModal';

interface CalendarViewProps {
  followups: FollowUp[];
  leads: Lead[];
  channelPartners: ChannelPartner[];
  sites: Site[];
  onSelectLead: (lead: Lead) => void;
  initialTab?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  followups,
  leads,
  channelPartners,
  sites,
  onSelectLead,
  initialTab,
}) => {
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [listCategory, setListCategory] = useState<'today' | 'overdue' | 'upcoming' | 'all'>(
    (initialTab as any) || 'today'
  );
  const [currentDate, setCurrentDate] = useState(new Date('2026-09-22'));
  const [isAddFollowupOpen, setIsAddFollowupOpen] = useState(false);

  // Reschedule state
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('11:00');

  const todayStr = '2026-09-22'; // Match current simulated date or new Date().toISOString().split('T')[0]

  const todaysFollowups = followups.filter(
    (f) => f.status === 'Pending' && f.followup_date === todayStr
  );
  const overdueFollowups = followups.filter(
    (f) => f.status === 'Pending' && f.followup_date < todayStr
  );
  const upcomingFollowups = followups.filter(
    (f) => f.status === 'Pending' && f.followup_date > todayStr
  );

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate days for Month View
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleStatusChange = (id: string, status: FollowUpStatus) => {
    dataStore.updateFollowUpStatus(id, status);
    showToast(`Follow-up marked as ${status}`, 'success');
  };

  const handleRescheduleSubmit = (id: string) => {
    if (!newDate) {
      showToast('Please select a new date', 'error');
      return;
    }
    dataStore.rescheduleFollowUp(id, newDate, newTime);
    showToast(`Follow-up rescheduled to ${newDate} at ${newTime}`, 'success');
    setReschedulingId(null);
  };

  // Get items for current list tab
  const getCategorizedList = () => {
    switch (listCategory) {
      case 'today':
        return todaysFollowups;
      case 'overdue':
        return overdueFollowups;
      case 'upcoming':
        return upcomingFollowups;
      case 'all':
      default:
        return followups;
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>Follow-up Calendar</span>
            {overdueFollowups.length > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                {overdueFollowups.length} Overdue
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Plan, reschedule, and track customer calls, site visits, and WhatsApp check-ins
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-[#6C3BFF] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-[#6C3BFF] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda Lists
            </button>
          </div>

          <button
            onClick={() => setIsAddFollowupOpen(true)}
            className="inline-flex items-center gap-2 bg-[#6C3BFF] hover:bg-[#5A2FE0] text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {/* 3 Action Center Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => {
            setViewMode('list');
            setListCategory('today');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            listCategory === 'today' && viewMode === 'list'
              ? 'bg-[#F3EFFF] border-[#6C3BFF] ring-2 ring-[#6C3BFF]/20'
              : 'bg-white border-slate-200/80 hover:border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-purple-700">Today's Follow-ups</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#6C3BFF]" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 block">
            {todaysFollowups.length}
          </span>
          <p className="text-xs text-slate-500 mt-1">Due for action today</p>
        </div>

        <div
          onClick={() => {
            setViewMode('list');
            setListCategory('overdue');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            listCategory === 'overdue' && viewMode === 'list'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200/80 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-rose-700">Overdue Follow-ups</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-rose-600 mt-2 block">
            {overdueFollowups.length}
          </span>
          <p className="text-xs text-rose-600/80 mt-1">Passed scheduled date</p>
        </div>

        <div
          onClick={() => {
            setViewMode('list');
            setListCategory('upcoming');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            listCategory === 'upcoming' && viewMode === 'list'
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-blue-700">Upcoming Follow-ups</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 block">
            {upcomingFollowups.length}
          </span>
          <p className="text-xs text-slate-500 mt-1">Scheduled in future days</p>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'month' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          {/* Month Header Nav */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              {monthNames[month]} {year}
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date('2026-09-22'))}
                className="text-xs font-bold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 mb-2 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[100px] p-2 bg-slate-50/40 rounded-xl border border-transparent"
              />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const isToday = dStr === todayStr;

              const dayFollowups = followups.filter((f) => f.followup_date === dStr);

              return (
                <div
                  key={dStr}
                  className={`min-h-[100px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                    isToday
                      ? 'bg-[#F3EFFF]/40 border-[#6C3BFF] ring-2 ring-[#6C3BFF]/20'
                      : dayFollowups.length > 0
                      ? 'bg-white border-slate-200'
                      : 'bg-white/60 border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-[#6C3BFF] text-white'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayFollowups.length > 0 && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded-full">
                        {dayFollowups.length}
                      </span>
                    )}
                  </div>

                  {/* Follow-up events list */}
                  <div className="space-y-1 mt-1.5 flex-1 overflow-y-auto max-h-[85px] no-scrollbar">
                    {dayFollowups.map((f) => {
                      const lead = leads.find((l) => l.id === f.lead_id);
                      return (
                        <div
                          key={f.id}
                          onClick={() => lead && onSelectLead(lead)}
                          className={`text-[10px] p-1.5 rounded-lg border cursor-pointer truncate transition-all ${
                            f.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 line-through opacity-70'
                              : f.type === 'Site Visit'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold'
                              : 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
                          }`}
                          title={`${f.type} with ${lead?.name || 'Customer'}: ${f.notes || ''}`}
                        >
                          <span className="font-bold">{f.followup_time ? f.followup_time.slice(0, 5) + ' ' : ''}</span>
                          <span>{lead ? lead.name : 'Customer'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Categorized Agenda List View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          {/* Sub-tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
            {[
              { id: 'today', label: `Today's (${todaysFollowups.length})` },
              { id: 'overdue', label: `Overdue (${overdueFollowups.length})` },
              { id: 'upcoming', label: `Upcoming (${upcomingFollowups.length})` },
              { id: 'all', label: `All Follow-ups (${followups.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setListCategory(tab.id as any)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                  listCategory === tab.id
                    ? 'bg-[#6C3BFF] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Follow-up Cards List */}
          <div className="space-y-3">
            {getCategorizedList().length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm font-medium">No follow-ups found in this category.</p>
              </div>
            ) : (
              getCategorizedList().map((f) => {
                const lead = leads.find((l) => l.id === f.lead_id);
                const partner = channelPartners.find((cp) => cp.id === f.assigned_partner_id);
                const isOverdue = f.status === 'Pending' && f.followup_date < todayStr;

                return (
                  <div
                    key={f.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isOverdue
                        ? 'bg-rose-50/40 border-rose-200'
                        : f.status === 'Completed'
                        ? 'bg-slate-50 border-slate-200 opacity-80'
                        : 'bg-white border-slate-200 shadow-2xs hover:border-[#6C3BFF]/40'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-purple-100 text-[#6C3BFF] shrink-0 mt-0.5">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            onClick={() => lead && onSelectLead(lead)}
                            className="font-bold text-base text-slate-900 hover:text-[#6C3BFF] cursor-pointer"
                          >
                            {lead ? lead.name : 'Customer'}
                          </h4>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#6C3BFF] border border-purple-100">
                            {f.type}
                          </span>
                          <FollowUpStatusBadge status={f.status} size="sm" />
                          {isOverdue && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                              Overdue
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 mt-1">{f.notes || 'Routine follow-up'}</p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                          <span>
                            Date: <strong>{f.followup_date}</strong> {f.followup_time && `at ${f.followup_time}`}
                          </span>
                          {lead && (
                            <>
                              <span>•</span>
                              <span>Phone: {lead.phone}</span>
                            </>
                          )}
                          {partner && (
                            <>
                              <span>•</span>
                              <span>Partner: {partner.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {lead && (
                        <>
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200"
                            title="Call"
                          >
                            <Phone className="w-4 h-4 text-emerald-600" />
                          </a>
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-green-50 hover:bg-green-100 text-green-800 rounded-xl border border-green-200"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4 text-green-600" />
                          </a>
                        </>
                      )}

                      {f.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(f.id, 'Completed')}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                          >
                            Mark Completed
                          </button>

                          <button
                            onClick={() => {
                              setReschedulingId(f.id);
                              setNewDate(f.followup_date);
                              setNewTime(f.followup_time || '11:00');
                            }}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                          >
                            Reschedule
                          </button>

                          <button
                            onClick={() => handleStatusChange(f.id, 'Cancelled')}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                            title="Cancel Follow-up"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {lead && (
                        <button
                          onClick={() => onSelectLead(lead)}
                          className="text-xs font-bold text-[#6C3BFF] hover:underline px-2"
                        >
                          View Lead →
                        </button>
                      )}
                    </div>

                    {/* Reschedule inline drawer if active */}
                    {reschedulingId === f.id && (
                      <div className="w-full mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200 flex flex-wrap items-center gap-3">
                        <span className="text-xs font-bold text-[#6C3BFF]">Pick new date/time:</span>
                        <input
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="p-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                        <input
                          type="time"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="p-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                        <button
                          onClick={() => handleRescheduleSubmit(f.id)}
                          className="px-3 py-1.5 bg-[#6C3BFF] text-white text-xs font-bold rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setReschedulingId(null)}
                          className="px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add Follow-up Modal */}
      {isAddFollowupOpen && (
        <AddFollowUpModal
          isOpen={isAddFollowupOpen}
          onClose={() => setIsAddFollowupOpen(false)}
          leads={leads}
          channelPartners={channelPartners}
        />
      )}
    </div>
  );
};
