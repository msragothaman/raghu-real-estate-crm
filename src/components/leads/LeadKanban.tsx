import React from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { Lead, LeadStatus, Site, ChannelPartner } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';
import {
  Phone,
  MessageCircle,
  Building2,
  Handshake,
  Clock,
  Sparkles,
  IndianRupee,
} from 'lucide-react';

interface LeadKanbanProps {
  leads: Lead[];
  sites: Site[];
  channelPartners: ChannelPartner[];
  onSelectLead: (lead: Lead) => void;
}

export const LeadKanban: React.FC<LeadKanbanProps> = ({
  leads,
  sites,
  channelPartners,
  onSelectLead,
}) => {
  const { showToast } = useToast();

  const columns: { id: LeadStatus; title: string; color: string; badgeColor: string }[] = [
    {
      id: 'NEW',
      title: 'New',
      color: 'border-t-blue-500',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'CONTACTED',
      title: 'Contacted',
      color: 'border-t-purple-500',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'FOLLOW UP',
      title: 'Follow Up',
      color: 'border-t-amber-500',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'SITE VISIT',
      title: 'Site Visit',
      color: 'border-t-indigo-500',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'INTERESTED',
      title: 'Interested',
      color: 'border-t-[#6C3BFF]',
      badgeColor: 'bg-[#F3EFFF] text-[#6C3BFF]',
    },
    {
      id: 'NEGOTIATION',
      title: 'Negotiation',
      color: 'border-t-orange-500',
      badgeColor: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'BOOKED',
      title: 'Booked',
      color: 'border-t-emerald-500',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'REGISTRATION COMPLETED',
      title: 'Registered',
      color: 'border-t-green-600',
      badgeColor: 'bg-green-100 text-green-800',
    },
    {
      id: 'LOST',
      title: 'Lost',
      color: 'border-t-rose-500',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
  ];

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as LeadStatus;
    const lead = leads.find((l) => l.id === draggableId);

    dataStore.updateLeadStatus(draggableId, newStatus);
    showToast(
      `${lead ? lead.name : 'Lead'} moved to ${newStatus}`,
      'success'
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[650px] no-scrollbar">
        {columns.map((col) => {
          const columnLeads = leads.filter((l) => l.status === col.id);

          return (
            <div
              key={col.id}
              className={`w-72 shrink-0 bg-slate-100/70 rounded-2xl border-t-4 ${col.color} border border-slate-200/70 p-3 shadow-2xs flex flex-col max-h-[calc(100vh-210px)]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pb-3 mb-1 border-b border-slate-200/60">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  {col.title}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}
                >
                  {columnLeads.length}
                </span>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto space-y-2.5 p-1 min-h-[200px] rounded-xl transition-colors ${
                      snapshot.isDraggingOver ? 'bg-purple-50/50' : ''
                    }`}
                  >
                    {columnLeads.map((lead, index) => {
                      const site = sites.find((s) => s.id === lead.interested_site_id);
                      const partner = channelPartners.find(
                        (cp) => cp.id === lead.assigned_channel_partner_id
                      );

                      return (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              onClick={() => onSelectLead(lead)}
                              className={`bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#6C3BFF]/40 cursor-grab active:cursor-grabbing transition-all ${
                                dragSnapshot.isDragging
                                  ? 'shadow-xl rotate-1 scale-102 border-[#6C3BFF]'
                                  : ''
                              }`}
                            >
                              {/* Source Pill & Date */}
                              <div className="flex items-center justify-between text-[10px] mb-1.5">
                                <span className="font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {lead.source}
                                </span>
                                <span className="text-slate-400">
                                  {new Date(lead.created_at).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>

                              {/* Customer Name */}
                              <h4 className="font-bold text-sm text-slate-900 leading-tight">
                                {lead.name}
                              </h4>

                              {/* Phone */}
                              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{lead.phone}</span>
                              </div>

                              {/* Site requirement */}
                              {site && (
                                <div className="flex items-center gap-1.5 text-xs text-[#6C3BFF] font-medium mt-2 bg-[#F3EFFF]/60 px-2 py-1 rounded-lg">
                                  <Building2 className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{site.name}</span>
                                </div>
                              )}

                              {/* Budget & Plot Size */}
                              <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-100">
                                <span>{lead.preferred_plot_size || '1200 sqft'}</span>
                                <span className="font-bold text-slate-800">
                                  {lead.budget || '₹15L-20L'}
                                </span>
                              </div>

                              {/* Assigned Channel Partner */}
                              {partner && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                  <Handshake className="w-3 h-3 text-blue-500 shrink-0" />
                                  <span className="truncate">{partner.name}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
