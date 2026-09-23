import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { FollowUp, Lead, ChannelPartner } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { soundManager } from '../../lib/soundEffects';
import { useToast } from '../common/Toast';
import {
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Sparkles,
  ArrowRight,
  User,
  Building2,
} from 'lucide-react';

interface DailyFollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  followups: FollowUp[];
  leads: Lead[];
  channelPartners: ChannelPartner[];
  onSelectLead: (lead: Lead) => void;
  onOpenCalendar: () => void;
}

export const DailyFollowupModal: React.FC<DailyFollowupModalProps> = ({
  isOpen,
  onClose,
  followups,
  leads,
  channelPartners,
  onSelectLead,
  onOpenCalendar,
}) => {
  const { showToast } = useToast();
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('11:00');

  const todayStr = new Date().toISOString().split('T')[0];

  // Pending follow-ups for today & overdue
  const todaysFollowups = followups.filter(
    (f) => f.status === 'Pending' && f.followup_date === todayStr
  );
  const overdueFollowups = followups.filter(
    (f) => f.status === 'Pending' && f.followup_date < todayStr
  );

  const totalUrgent = todaysFollowups.length + overdueFollowups.length;
  const displayItems = [...overdueFollowups, ...todaysFollowups];

  const handleMarkDone = (e: React.MouseEvent, id: string, leadName?: string) => {
    e.stopPropagation();
    dataStore.updateFollowUpStatus(id, 'Completed');
    soundManager.playSuccess();
    showToast(`Follow-up with ${leadName || 'customer'} marked as Completed!`, 'success');
  };

  const handleReschedule = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!newDate) {
      showToast('Please select a new date', 'error');
      return;
    }
    dataStore.rescheduleFollowUp(id, newDate, newTime);
    soundManager.playSuccess();
    showToast(`Rescheduled to ${newDate} at ${newTime}`, 'success');
    setReschedulingId(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Today's Customer Follow-up Briefing"
      subtitle="Good day! Here are the calls, site visits, and WhatsApp updates scheduled for you."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Top Summary Banner */}
        <div className="p-4 bg-gradient-to-r from-[#6C3BFF]/10 via-[#FAF8FF] to-purple-50/60 rounded-2xl border border-[#DFD0FF] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C3BFF] text-white flex items-center justify-center shadow-md shadow-[#6C3BFF]/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-purple-950">
                {totalUrgent > 0
                  ? `You have ${todaysFollowups.length} follow-up${todaysFollowups.length === 1 ? '' : 's'} scheduled for today!`
                  : "All caught up! No pending follow-ups today."}
              </h3>
              <p className="text-xs text-purple-700">
                {overdueFollowups.length > 0
                  ? `⚠️ ${overdueFollowups.length} overdue follow-up${overdueFollowups.length === 1 ? '' : 's'} require immediate attention.`
                  : 'Great job maintaining your schedule.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white rounded-xl border border-[#DFD0FF] text-xs font-bold text-[#6C3BFF] shadow-xs">
              Today: {todayStr}
            </span>
          </div>
        </div>

        {/* Follow-up Cards List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
          {displayItems.length === 0 ? (
            <div className="py-12 text-center text-purple-400 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="font-bold text-sm text-purple-900">Zero Pending Follow-ups for Today!</p>
              <p className="text-xs text-purple-600">You are all set for the morning.</p>
            </div>
          ) : (
            displayItems.map((f) => {
              const lead = leads.find((l) => l.id === f.lead_id);
              const partner = channelPartners.find((cp) => cp.id === f.assigned_partner_id);
              const isOverdue = f.followup_date < todayStr;
              const phoneClean = lead?.phone?.replace(/[^0-9]/g, '') || '';
              const whatsappClean = (lead?.whatsapp || lead?.phone || '').replace(/[^0-9]/g, '');

              return (
                <div
                  key={f.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isOverdue
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-white border-[#E5DAFF] hover:border-[#6C3BFF] shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Customer Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => {
                            if (lead) onSelectLead(lead);
                            onClose();
                          }}
                          className="font-black text-sm text-purple-950 hover:text-[#6C3BFF] cursor-pointer hover:underline"
                        >
                          {lead ? lead.name : 'Unknown Customer'}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-purple-100 text-[#6C3BFF]'
                          }`}
                        >
                          {f.type}
                        </span>

                        {isOverdue && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-600 text-white">
                            OVERDUE
                          </span>
                        )}
                      </div>

                      {/* Time, Phone & Budget */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-purple-600">
                        <span className="flex items-center gap-1 font-semibold text-purple-900">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>{f.followup_time || '11:00'}</span>
                        </span>

                        {lead?.phone && (
                          <>
                            <span>•</span>
                            <span>{lead.phone}</span>
                          </>
                        )}

                        {lead?.budget ? (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                              <IndianRupee className="w-3 h-3 text-emerald-600" />
                              <span>{lead.budget}</span>
                            </span>
                          </>
                        ) : (
                          <>
                            <span>•</span>
                            <span className="text-purple-400 italic">Budget: Ask during call</span>
                          </>
                        )}
                      </div>

                      {f.notes && (
                        <p className="text-xs text-slate-600 italic bg-[#FAF8FF] p-2 rounded-xl border border-[#EFE7FF] mt-1">
                          &ldquo;{f.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Right: Quick Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {lead?.phone && (
                        <>
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 transition-colors shadow-xs"
                            title="Call customer"
                          >
                            <Phone className="w-4 h-4 text-emerald-600" />
                          </a>

                          <a
                            href={`https://wa.me/${whatsappClean}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-green-50 hover:bg-green-100 text-green-800 rounded-xl border border-green-200 transition-colors shadow-xs"
                            title="WhatsApp customer"
                          >
                            <MessageCircle className="w-4 h-4 text-green-600" />
                          </a>
                        </>
                      )}

                      <button
                        onClick={(e) => handleMarkDone(e, f.id, lead?.name)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </button>

                      <button
                        onClick={() => {
                          setReschedulingId(reschedulingId === f.id ? null : f.id);
                          setNewDate(f.followup_date);
                          setNewTime(f.followup_time || '11:00');
                        }}
                        className="px-2.5 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-[#DFD0FF] font-semibold text-xs rounded-xl transition-colors"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>

                  {/* Reschedule Drawer */}
                  {reschedulingId === f.id && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200 flex flex-wrap items-center gap-2 animate-in fade-in duration-150">
                      <span className="text-xs font-bold text-[#6C3BFF]">Pick Date & Time:</span>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="p-1.5 text-xs bg-white border border-[#DFD0FF] rounded-lg"
                      />
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="p-1.5 text-xs bg-white border border-[#DFD0FF] rounded-lg"
                      />
                      <button
                        onClick={(e) => handleReschedule(e, f.id)}
                        className="px-3 py-1.5 bg-[#6C3BFF] text-white text-xs font-bold rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setReschedulingId(null)}
                        className="px-2 py-1.5 text-xs text-purple-600 hover:bg-purple-200 rounded-lg"
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

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#EFE7FF]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCalendar();
            }}
            className="text-xs font-bold text-[#6C3BFF] hover:underline flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Open Follow-up Calendar & Kanban Board →</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2 text-sm font-bold bg-[#6C3BFF] hover:bg-[#5820E0] text-white rounded-xl shadow-md shadow-[#6C3BFF]/25 transition-all"
          >
            Start Calling Customers
          </button>
        </div>
      </div>
    </Modal>
  );
};
