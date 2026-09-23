import React from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { FollowUp, Lead, ChannelPartner, Site, FollowUpStatus } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { soundManager } from '../../lib/soundEffects';
import { useToast } from '../common/Toast';
import {
  Phone,
  MessageCircle,
  Clock,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  RotateCcw,
  ArrowRightLeft,
  User,
  IndianRupee,
} from 'lucide-react';

interface FollowUpKanbanProps {
  followups: FollowUp[];
  leads: Lead[];
  channelPartners: ChannelPartner[];
  sites: Site[];
  onSelectLead: (lead: Lead) => void;
  onEditFollowUp: (followUp: FollowUp) => void;
}

interface ColumnDef {
  id: FollowUpStatus;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  headerBg: string;
  badgeBg: string;
  accentColor: string;
}

export const FollowUpKanban: React.FC<FollowUpKanbanProps> = ({
  followups,
  leads,
  channelPartners,
  sites,
  onSelectLead,
  onEditFollowUp,
}) => {
  const { showToast } = useToast();

  const columns: ColumnDef[] = [
    {
      id: 'Pending',
      title: 'Scheduled / Pending',
      icon: Clock,
      headerBg: 'bg-[#F5F0FF] border-[#DFD0FF] text-purple-950',
      badgeBg: 'bg-[#6C3BFF] text-white',
      accentColor: '#6C3BFF',
    },
    {
      id: 'Completed',
      title: 'Completed',
      icon: CheckCircle2,
      headerBg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      badgeBg: 'bg-emerald-600 text-white',
      accentColor: '#059669',
    },
    {
      id: 'Cancelled',
      title: 'Cancelled',
      icon: XCircle,
      headerBg: 'bg-slate-100 border-slate-200 text-slate-900',
      badgeBg: 'bg-slate-600 text-white',
      accentColor: '#64748B',
    },
    {
      id: 'Missed',
      title: 'Missed / Overdue',
      icon: AlertCircle,
      headerBg: 'bg-amber-50 border-amber-200 text-amber-950',
      badgeBg: 'bg-amber-600 text-white',
      accentColor: '#D97706',
    },
  ];

  const handleDragStart = () => {
    soundManager.playGrab();
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as FollowUpStatus;
    dataStore.updateFollowUpStatus(draggableId, newStatus);

    if (newStatus === 'Completed') {
      soundManager.playSuccess();
    } else {
      soundManager.playDrop();
    }

    showToast(`Follow-up moved to "${newStatus}" status.`, 'success');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this follow-up?')) {
      dataStore.deleteFollowUp(id);
      showToast('Follow-up deleted successfully.', 'info');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Phone Call':
        return <Phone className="w-3.5 h-3.5 text-blue-600" />;
      case 'WhatsApp':
        return <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Site Visit':
        return <Building2 className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Calendar className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="p-3.5 bg-gradient-to-r from-[#F5F0FF] via-purple-50/50 to-white border border-[#DFD0FF] rounded-2xl flex items-center justify-between gap-3 text-xs text-purple-950 shadow-xs">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-[#6C3BFF] shrink-0" />
          <span>
            <strong>3D Drag-and-Drop Status Board:</strong> Drag any follow-up card between columns to change its status instantly with live haptic audio feedback.
          </span>
        </div>
        <span className="font-bold text-[#6C3BFF] shrink-0">
          {followups.length} Total Follow-ups
        </span>
      </div>

      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start min-h-[600px]">
          {columns.map((col) => {
            const colItems = followups.filter((f) => f.status === col.id);
            const Icon = col.icon;

            return (
              <div
                key={col.id}
                className="bg-white rounded-2xl border border-[#DFD0FF] shadow-xs flex flex-col overflow-hidden"
              >
                {/* Column Header */}
                <div
                  className={`p-3.5 border-b flex items-center justify-between ${col.headerBg}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <h3 className="text-xs font-black uppercase tracking-wider">{col.title}</h3>
                  </div>
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-full ${col.badgeBg}`}
                  >
                    {colItems.length}
                  </span>
                </div>

                {/* Droppable Container */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-3 space-y-3 min-h-[450px] max-h-[calc(100vh-280px)] overflow-y-auto transition-all duration-200 ${
                        snapshot.isDraggingOver
                          ? 'bg-gradient-to-b from-[#F7F3FF] to-purple-50/70 ring-2 ring-[#6C3BFF]/40 border-2 border-dashed border-[#6C3BFF]/60 rounded-b-2xl'
                          : ''
                      }`}
                    >
                      {colItems.length === 0 ? (
                        <div className="h-32 border-2 border-dashed border-[#E5DAFF] rounded-xl flex flex-col items-center justify-center text-xs text-purple-400 italic">
                          <span>No follow-ups in this stage</span>
                          <span className="text-[10px] text-purple-300 mt-0.5">
                            Drag a card here
                          </span>
                        </div>
                      ) : (
                        colItems.map((item, index) => {
                          const lead = leads.find((l) => l.id === item.lead_id);
                          const site = sites.find((s) => s.id === lead?.interested_site_id);
                          const partner = channelPartners.find(
                            (cp) => cp.id === item.assigned_partner_id
                          );

                          return (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className={`bg-white rounded-xl p-3.5 border border-[#E5DAFF] shadow-2xs hover:shadow-lg hover:-translate-y-0.5 hover:border-[#6C3BFF]/50 transition-all duration-200 cursor-grab active:cursor-grabbing ${
                                    dragSnapshot.isDragging
                                      ? 'shadow-[0_20px_45px_rgba(108,59,255,0.35)] rotate-2 scale-105 border-[#6C3BFF] ring-2 ring-[#6C3BFF]/40 z-50'
                                      : ''
                                  }`}
                                >
                                  {/* Card Top: Type & Date/Time */}
                                  <div className="flex items-center justify-between text-[11px] mb-2">
                                    <span className="inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-lg bg-[#FAF8FF] border border-[#E5DAFF] text-purple-950">
                                      {getTypeIcon(item.type)}
                                      <span>{item.type}</span>
                                    </span>

                                    <span className="font-semibold text-purple-700 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-purple-400" />
                                      <span>
                                        {item.followup_date} {item.followup_time || '11:00'}
                                      </span>
                                    </span>
                                  </div>

                                  {/* Card Body: Lead Info */}
                                  <div
                                    onClick={() => lead && onSelectLead(lead)}
                                    className="cursor-pointer group"
                                  >
                                    <h4 className="text-sm font-bold text-purple-950 group-hover:text-[#6C3BFF] transition-colors leading-tight">
                                      {lead ? lead.name : 'Unknown Customer'}
                                    </h4>

                                    {lead && (
                                      <div className="flex items-center gap-1 text-xs text-purple-600/90 mt-1">
                                        <Phone className="w-3 h-3 text-purple-400" />
                                        <span>{lead.phone}</span>
                                      </div>
                                    )}

                                    {lead?.budget ? (
                                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1.5">
                                        <IndianRupee className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span>Budget: {lead.budget}</span>
                                      </div>
                                    ) : (
                                      <div className="text-[10px] text-purple-400 italic mt-1">
                                        Budget: Pending call
                                      </div>
                                    )}

                                    {site && (
                                      <div className="flex items-center gap-1 text-[11px] text-purple-700/80 mt-1 truncate">
                                        <Building2 className="w-3 h-3 text-purple-400 shrink-0" />
                                        <span>{site.name}</span>
                                      </div>
                                    )}

                                    {partner && (
                                      <div className="flex items-center gap-1 text-[10px] text-purple-500 mt-1">
                                        <User className="w-3 h-3 text-purple-400" />
                                        <span>Partner: {partner.name}</span>
                                      </div>
                                    )}

                                    {item.notes && (
                                      <p className="text-[11px] text-purple-900/80 italic mt-2 p-1.5 bg-[#FAF8FF] rounded-lg border border-[#E5DAFF] line-clamp-2">
                                        &ldquo;{item.notes}&rdquo;
                                      </p>
                                    )}
                                  </div>

                                  {/* Card Footer: Quick Actions */}
                                  <div className="mt-3 pt-2.5 border-t border-[#F0E8FF] flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1">
                                      {lead?.phone && (
                                        <a
                                          href={`tel:${lead.phone}`}
                                          onClick={(e) => e.stopPropagation()}
                                          title="Call customer"
                                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                          <Phone className="w-3.5 h-3.5" />
                                        </a>
                                      )}
                                      {lead?.phone && (
                                        <a
                                          href={`https://wa.me/91${lead.phone.replace(/[^0-9]/g, '')}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          title="WhatsApp customer"
                                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                        >
                                          <MessageCircle className="w-3.5 h-3.5" />
                                        </a>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEditFollowUp(item);
                                        }}
                                        title="Edit follow-up"
                                        className="p-1.5 text-purple-600 hover:bg-[#F5F0FF] rounded-lg transition-colors cursor-pointer"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={(e) => handleDelete(e, item.id)}
                                        title="Delete follow-up"
                                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};
