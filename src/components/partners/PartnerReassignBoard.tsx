import React from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { Lead, ChannelPartner, Site } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';
import { LeadStatusBadge } from '../common/Badge';
import {
  Phone,
  Building2,
  Handshake,
  UserX,
  ArrowRightLeft,
  Sparkles,
  Info,
} from 'lucide-react';

interface PartnerReassignBoardProps {
  leads: Lead[];
  channelPartners: ChannelPartner[];
  sites: Site[];
  onSelectLead: (lead: Lead) => void;
}

export const PartnerReassignBoard: React.FC<PartnerReassignBoardProps> = ({
  leads,
  channelPartners,
  sites,
  onSelectLead,
}) => {
  const { showToast } = useToast();

  // Create columns: Channel Partners + Unassigned/Direct Sales
  const partnerColumns = [
    {
      id: 'direct-inhouse',
      partner: null,
      name: 'Direct Sales / Unassigned',
      location: 'In-House Leads',
      isDirect: true,
    },
    ...channelPartners.map((cp) => ({
      id: cp.id,
      partner: cp,
      name: cp.name,
      location: cp.location || 'Tamil Nadu',
      isDirect: false,
    })),
  ];

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const newPartnerId =
      destination.droppableId === 'direct-inhouse' ? null : destination.droppableId;
    const destPartnerName =
      destination.droppableId === 'direct-inhouse'
        ? 'Direct In-House Sales'
        : channelPartners.find((cp) => cp.id === destination.droppableId)?.name || 'Partner';

    const lead = leads.find((l) => l.id === draggableId);

    // Call dataStore reassignment
    dataStore.reassignLeadPartner(draggableId, newPartnerId);

    // Show prompt requirement toast: "Lead reassigned successfully."
    showToast(`Lead reassigned successfully to ${destPartnerName}.`, 'success');
  };

  return (
    <div className="space-y-4">
      {/* Informative Banner */}
      <div className="p-3.5 bg-[#F3EFFF] border border-[#DDD1FF] rounded-2xl flex items-center justify-between gap-3 text-xs text-purple-900">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-[#6C3BFF] shrink-0" />
          <span className="font-medium">
            <strong>Drag-and-Drop Reassignment:</strong> Drag any customer lead card to another
            channel partner column to immediately reassign it, record partner audit logs, and update conversion metrics.
          </span>
        </div>
        <span className="font-bold text-[#6C3BFF] hidden sm:inline">
          {leads.length} Total Leads
        </span>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[600px] no-scrollbar">
          {partnerColumns.map((col) => {
            const partnerLeads = leads.filter((l) => {
              if (col.isDirect) {
                return !l.assigned_channel_partner_id;
              }
              return l.assigned_channel_partner_id === col.id;
            });

            return (
              <div
                key={col.id}
                className={`w-72 shrink-0 bg-white rounded-2xl border ${
                  col.isDirect
                    ? 'border-dashed border-slate-300 bg-slate-50/50'
                    : 'border-slate-200/80 shadow-2xs'
                } p-3.5 flex flex-col max-h-[calc(100vh-250px)]`}
              >
                {/* Column Header */}
                <div className="pb-3 mb-2 border-b border-slate-100 flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {col.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {col.location}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      col.isDirect
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-purple-100 text-[#6C3BFF]'
                    }`}
                  >
                    {partnerLeads.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto space-y-2.5 p-1 min-h-[220px] rounded-xl transition-colors ${
                        snapshot.isDraggingOver ? 'bg-[#F3EFFF]/50 ring-2 ring-[#6C3BFF]/20' : ''
                      }`}
                    >
                      {partnerLeads.length === 0 ? (
                        <div className="h-32 flex flex-col items-center justify-center text-slate-300 text-xs italic border border-dashed border-slate-200 rounded-xl">
                          <span>Drop leads here</span>
                        </div>
                      ) : (
                        partnerLeads.map((lead, index) => {
                          const site = sites.find((s) => s.id === lead.interested_site_id);

                          return (
                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  onClick={() => onSelectLead(lead)}
                                  className={`bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#6C3BFF]/40 cursor-grab active:cursor-grabbing transition-all ${
                                    dragSnapshot.isDragging
                                      ? 'shadow-xl scale-102 border-[#6C3BFF] ring-2 ring-[#6C3BFF]/30'
                                      : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="font-bold text-slate-400">{lead.id}</span>
                                    <LeadStatusBadge status={lead.status} size="sm" />
                                  </div>

                                  <h5 className="font-bold text-sm text-slate-900 leading-tight">
                                    {lead.name}
                                  </h5>

                                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{lead.phone}</span>
                                  </div>

                                  {site && (
                                    <div className="text-[11px] text-slate-600 truncate mt-1.5 flex items-center gap-1">
                                      <Building2 className="w-3 h-3 text-purple-400" />
                                      <span>{site.name}</span>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100 text-slate-500">
                                    <span>{lead.source}</span>
                                    <span className="font-semibold text-slate-800">
                                      {lead.budget || '₹15L'}
                                    </span>
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
