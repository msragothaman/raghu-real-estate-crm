import React, { useState } from 'react';
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Search,
  Filter,
  Users,
  Sparkles,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { useToast } from '../common/Toast';
import { soundManager } from '../../lib/soundEffects';
import {
  Lead,
  Site,
  ChannelPartner,
  User,
  FollowUp,
  LeadStatusHistory,
  PartnerAssignmentHistory,
  LeadNote,
  LeadStatus,
  LeadSource,
} from '../../types/crm';
import { LeadKanban } from './LeadKanban';
import { LeadTable } from './LeadTable';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import { AddLeadModal } from './AddLeadModal';
import { AddFollowUpModal } from './AddFollowUpModal';
import { ImportLeadsModal } from './ImportLeadsModal';

interface LeadManagementViewProps {
  leads: Lead[];
  sites: Site[];
  channelPartners: ChannelPartner[];
  users: User[];
  followups: FollowUp[];
  statusHistory: LeadStatusHistory[];
  partnerHistory: PartnerAssignmentHistory[];
  notes: LeadNote[];
  initialStatusFilter?: string;
  isAddLeadOpen: boolean;
  setIsAddLeadOpen: (open: boolean) => void;
  selectedLead: Lead | null;
  setSelectedLead: (lead: Lead | null) => void;
}

export const LeadManagementView: React.FC<LeadManagementViewProps> = ({
  leads,
  sites,
  channelPartners,
  users,
  followups,
  statusHistory,
  partnerHistory,
  notes,
  initialStatusFilter,
  isAddLeadOpen,
  setIsAddLeadOpen,
  selectedLead,
  setSelectedLead,
}) => {
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [siteFilter, setSiteFilter] = useState<string>('ALL');
  const [partnerFilter, setPartnerFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'ALL');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Follow-up scheduling modal state
  const [scheduleLeadId, setScheduleLeadId] = useState<string | null>(null);

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== 'ALL' && lead.status !== statusFilter) return false;
    if (sourceFilter !== 'ALL' && lead.source !== sourceFilter) return false;
    if (siteFilter !== 'ALL' && lead.interested_site_id !== siteFilter) return false;
    if (partnerFilter !== 'ALL' && lead.assigned_channel_partner_id !== partnerFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = lead.name.toLowerCase().includes(q);
      const matchPhone = lead.phone.toLowerCase().includes(q);
      const matchCampaign = lead.campaign?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchCampaign) return false;
    }

    return true;
  });

  // Helper to map and sanitize lead details for export
  const generateLeadDataRows = (leadList: Lead[]) => {
    return leadList.map((lead) => {
      const site = sites.find((s) => s.id === lead.interested_site_id);
      const partner = channelPartners.find((cp) => cp.id === lead.assigned_channel_partner_id);
      const user = users.find((u) => u.id === lead.assigned_user_id);

      return {
        id: lead.id,
        name: lead.name || 'Unnamed',
        phone: lead.phone || '',
        whatsapp: lead.whatsapp || lead.phone || '',
        email: lead.email || '',
        status: lead.status || 'NEW',
        source: lead.source || 'Direct',
        campaign: lead.campaign || 'Direct / Organic',
        siteName: site ? site.name : 'All / General',
        siteLocation: site ? site.location : '',
        plotSize: lead.preferred_plot_size || 'Not Specified',
        budget: lead.budget || 'Not Specified',
        purpose: lead.purpose || 'Investment',
        preferredLocation: lead.preferred_location || 'Not Specified',
        partnerName: partner ? partner.name : 'In-House Direct',
        partnerPhone: partner ? partner.phone : '',
        salesExecutive: user ? user.name : 'Unassigned',
        createdDate: lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : '',
        updatedDate: lead.updated_at ? new Date(lead.updated_at).toLocaleDateString('en-IN') : '',
      };
    });
  };

  // Export to standard CSV with UTF-8 BOM
  const handleExportCSV = (exportAll: boolean) => {
    const leadsToExport = exportAll ? leads : filteredLeads;
    const label = exportAll ? 'All' : 'Filtered';

    if (leadsToExport.length === 0) {
      showToast('No leads available to export.', 'error');
      return;
    }

    const rows = generateLeadDataRows(leadsToExport);
    const headers = [
      'Lead ID',
      'Customer Name',
      'Phone Number',
      'WhatsApp Number',
      'Email Address',
      'Pipeline Status',
      'Lead Source',
      'Campaign',
      'Interested Site',
      'Site Location',
      'Preferred Plot Size',
      'Budget Range',
      'Investment Purpose',
      'Preferred Location',
      'Assigned Partner',
      'Partner Contact',
      'Sales Executive',
      'Created Date',
      'Last Updated',
    ];

    const escapeCsv = (val: string | number) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const csvDataLines = rows.map((r) =>
      [
        escapeCsv(r.id),
        escapeCsv(r.name),
        escapeCsv(r.phone),
        escapeCsv(r.whatsapp),
        escapeCsv(r.email),
        escapeCsv(r.status),
        escapeCsv(r.source),
        escapeCsv(r.campaign),
        escapeCsv(r.siteName),
        escapeCsv(r.siteLocation),
        escapeCsv(r.plotSize),
        escapeCsv(r.budget),
        escapeCsv(r.purpose),
        escapeCsv(r.preferredLocation),
        escapeCsv(r.partnerName),
        escapeCsv(r.partnerPhone),
        escapeCsv(r.salesExecutive),
        escapeCsv(r.createdDate),
        escapeCsv(r.updatedDate),
      ].join(',')
    );

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...csvDataLines].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `Raghu_CRM_${label}_Leads_${new Date().toISOString().split('T')[0]}.csv`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    soundManager.playSuccess();
    showToast(`Downloaded ${leadsToExport.length} leads as CSV (${filename})!`, 'success');
    setIsExportMenuOpen(false);
  };

  // Export to styled Excel (.xls)
  const handleExportXLS = (exportAll: boolean) => {
    const leadsToExport = exportAll ? leads : filteredLeads;
    const label = exportAll ? 'All' : 'Filtered';

    if (leadsToExport.length === 0) {
      showToast('No leads available to export.', 'error');
      return;
    }

    const rows = generateLeadDataRows(leadsToExport);
    const headers = [
      'Lead ID',
      'Customer Name',
      'Phone Number',
      'WhatsApp Number',
      'Email Address',
      'Pipeline Status',
      'Lead Source',
      'Campaign',
      'Interested Site',
      'Site Location',
      'Preferred Plot Size',
      'Budget Range',
      'Investment Purpose',
      'Preferred Location',
      'Assigned Partner',
      'Partner Contact',
      'Sales Executive',
      'Created Date',
      'Last Updated',
    ];

    const filename = `Raghu_CRM_${label}_Leads_${new Date().toISOString().split('T')[0]}.xls`;

    const rowsHtml = rows
      .map((r, idx) => {
        const bg = idx % 2 === 0 ? '#FFFFFF' : '#F9F8FE';
        return `
          <tr style="background-color: ${bg};">
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px; color: #64748B;">${r.id}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color: #1E293B;">${r.name}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px; mso-number-format:'\\@';">${r.phone}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px; mso-number-format:'\\@';">${r.whatsapp}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px;">${r.email}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color: #6C3BFF;">${r.status}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px;">${r.source}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px;">${r.campaign}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px; font-weight: 500;">${r.siteName}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px; color: #64748B;">${r.siteLocation}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px;">${r.plotSize}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color: #047857;">${r.budget}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px;">${r.purpose}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px;">${r.preferredLocation}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px;">${r.partnerName}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px; mso-number-format:'\\@';">${r.partnerPhone}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px;">${r.salesExecutive}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px;">${r.createdDate}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: Arial, sans-serif; font-size: 12px;">${r.updatedDate}</td>
          </tr>
        `;
      })
      .join('');

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Raghu CRM Leads</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
        </head>
        <body>
          <h2 style="font-family: Arial, sans-serif; color: #6C3BFF; margin-bottom: 4px;">Raghu Real Estate CRM - ${label} Leads Export</h2>
          <p style="font-family: Arial, sans-serif; font-size: 12px; color: #64748B; margin-top: 0; margin-bottom: 12px;">Generated on ${new Date().toLocaleString('en-IN')} | Total Records: ${leadsToExport.length}</p>
          <table border="1" style="border-collapse: collapse; border: 1px solid #CBD5E1;">
            <thead>
              <tr style="background-color: #6C3BFF; color: #FFFFFF; font-family: Arial, sans-serif; font-weight: bold; font-size: 12px; text-align: left;">
                ${headers.map((h) => `<th style="padding: 10px 12px; border: 1px solid #5A2FE0; white-space: nowrap;">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    soundManager.playSuccess();
    showToast(`Downloaded ${leadsToExport.length} leads as Excel (.xls) (${filename})!`, 'success');
    setIsExportMenuOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>Lead Pipeline & Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F3EFFF] text-[#6C3BFF] font-bold border border-[#DDD1FF]">
              {filteredLeads.length} leads
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Drag leads across status stages to automatically update lifecycle & Supabase history
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#6C3BFF] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#6C3BFF] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Export Leads Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 bg-white hover:bg-purple-50 text-[#6C3BFF] border border-[#DDD1FF] hover:border-[#6C3BFF] text-xs sm:text-sm font-bold px-3 py-2.5 rounded-xl shadow-xs transition-all"
              title="Download leads as CSV or Excel (.xls)"
            >
              <Download className="w-4 h-4 text-[#6C3BFF]" />
              <span className="hidden xs:inline">Export Leads</span>
              <span className="xs:hidden">Export</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-purple-400 transition-transform duration-200 ${
                  isExportMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isExportMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsExportMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-purple-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-purple-50 mb-2">
                    <p className="text-[11px] font-black uppercase tracking-wider text-purple-600">
                      Export Leads Pipeline
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Download full data in CSV or styled Excel (.xls)
                    </p>
                  </div>

                  {/* Section 1: ALL LEADS */}
                  <div className="space-y-1">
                    <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>ALL CRM LEADS</span>
                      <span className="bg-purple-100 text-[#6C3BFF] px-2 py-0.5 rounded-full text-[10px]">
                        {leads.length} leads
                      </span>
                    </div>

                    <button
                      onClick={() => handleExportCSV(true)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#6C3BFF] transition-colors group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#6C3BFF]">
                            Download All Leads (CSV)
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Standard CSV format
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        .csv
                      </span>
                    </button>

                    <button
                      onClick={() => handleExportXLS(true)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-[#6C3BFF] transition-colors group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#F3EFFF] text-[#6C3BFF] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#6C3BFF]">
                            Download All Leads (Excel)
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Styled spreadsheet (.xls)
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-[#6C3BFF] border border-purple-200">
                        .xls
                      </span>
                    </button>
                  </div>

                  {/* Section 2: FILTERED LEADS (Only if filters active) */}
                  {filteredLeads.length !== leads.length && (
                    <div className="mt-3 pt-2 border-t border-purple-50 space-y-1">
                      <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span>CURRENT FILTERED VIEW</span>
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px]">
                          {filteredLeads.length} leads
                        </span>
                      </div>

                      <button
                        onClick={() => handleExportCSV(false)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-amber-50/60 text-slate-700 hover:text-amber-800 transition-colors group text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-semibold text-slate-800">
                            Filtered Leads (CSV)
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {filteredLeads.length} .csv
                        </span>
                      </button>

                      <button
                        onClick={() => handleExportXLS(false)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-amber-50/60 text-slate-700 hover:text-amber-800 transition-colors group text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-semibold text-slate-800">
                            Filtered Leads (Excel .xls)
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {filteredLeads.length} .xls
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Import Leads Shortcut inside dropdown */}
                  <div className="mt-2.5 pt-2 border-t border-purple-50">
                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        setIsImportModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6C3BFF] text-xs font-bold transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import Leads from CSV / Excel</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Import Leads Top Action Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 bg-white hover:bg-purple-50 text-purple-700 border border-[#DDD1FF] hover:border-[#6C3BFF] text-xs sm:text-sm font-bold px-3 py-2.5 rounded-xl shadow-xs transition-all"
            title="Import leads from CSV, XLSX, or XLS spreadsheet"
          >
            <Upload className="w-4 h-4 text-[#6C3BFF]" />
            <span className="hidden xs:inline">Import Leads</span>
            <span className="xs:hidden">Import</span>
          </button>

          <button
            onClick={() => setIsAddLeadOpen(true)}
            className="inline-flex items-center gap-2 bg-[#6C3BFF] hover:bg-[#5A2FE0] text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or campaign..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6C3BFF]"
          />
        </div>

        {/* Source Filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:border-[#6C3BFF]"
        >
          <option value="ALL">All Sources</option>
          <option value="Meta">Meta (Facebook/IG)</option>
          <option value="Google">Google</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Website">Website</option>
          <option value="Referral">Referral</option>
          <option value="Channel Partner">Channel Partner</option>
        </select>

        {/* Site Filter */}
        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:border-[#6C3BFF]"
        >
          <option value="ALL">All Sites</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Partner Filter */}
        <select
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:border-[#6C3BFF]"
        >
          <option value="ALL">All Partners</option>
          {channelPartners.map((cp) => (
            <option key={cp.id} value={cp.id}>
              {cp.name}
            </option>
          ))}
        </select>

        {/* Status Filter for Table */}
        {viewMode === 'table' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:border-[#6C3BFF]"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="FOLLOW UP">Follow Up</option>
            <option value="SITE VISIT">Site Visit</option>
            <option value="INTERESTED">Interested</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="BOOKED">Booked</option>
            <option value="REGISTRATION COMPLETED">Registered</option>
            <option value="LOST">Lost</option>
          </select>
        )}

        {(search ||
          sourceFilter !== 'ALL' ||
          siteFilter !== 'ALL' ||
          partnerFilter !== 'ALL' ||
          statusFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearch('');
              setSourceFilter('ALL');
              setSiteFilter('ALL');
              setPartnerFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="text-xs font-bold text-[#6C3BFF] hover:underline px-2"
          >
            Reset Filters
          </button>
        )}

        {/* Quick Export actions on filter bar */}
        <div className="sm:ml-auto flex items-center gap-1.5 pt-1 sm:pt-0">
          <span className="text-[11px] font-bold text-slate-400 mr-1 hidden md:inline">Quick Download:</span>
          <button
            onClick={() => handleExportCSV(filteredLeads.length === leads.length)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs"
            title={filteredLeads.length === leads.length ? "Download all leads as CSV" : `Download ${filteredLeads.length} filtered leads as CSV`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => handleExportXLS(filteredLeads.length === leads.length)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C3BFF] hover:text-[#5A2FE0] bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs"
            title={filteredLeads.length === leads.length ? "Download all leads as Excel (.xls)" : `Download ${filteredLeads.length} filtered leads as Excel (.xls)`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (.xls)</span>
          </button>
          <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C3BFF] hover:text-[#5A2FE0] bg-white hover:bg-purple-50 border border-purple-200 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs"
            title="Import leads from CSV, XLSX, or XLS spreadsheet"
          >
            <Upload className="w-3.5 h-3.5 text-[#6C3BFF]" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'kanban' ? (
        <LeadKanban
          leads={filteredLeads}
          sites={sites}
          channelPartners={channelPartners}
          onSelectLead={(lead) => setSelectedLead(lead)}
        />
      ) : (
        <LeadTable
          leads={filteredLeads}
          sites={sites}
          channelPartners={channelPartners}
          onSelectLead={(lead) => setSelectedLead(lead)}
        />
      )}

      {/* Lead Detail Slide-over Drawer */}
      {selectedLead && (
        <LeadDetailDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          sites={sites}
          channelPartners={channelPartners}
          users={users}
          followups={followups}
          statusHistory={statusHistory}
          partnerHistory={partnerHistory}
          notes={notes}
          onOpenScheduleFollowup={(leadId) => setScheduleLeadId(leadId)}
        />
      )}

      {/* Add Lead Modal */}
      {isAddLeadOpen && (
        <AddLeadModal
          isOpen={isAddLeadOpen}
          onClose={() => setIsAddLeadOpen(false)}
          sites={sites}
          channelPartners={channelPartners}
          onLeadAdded={(lead) => setSelectedLead(lead)}
        />
      )}

      {/* Schedule Follow-up Modal */}
      {scheduleLeadId && (
        <AddFollowUpModal
          isOpen={Boolean(scheduleLeadId)}
          onClose={() => setScheduleLeadId(null)}
          leads={leads}
          channelPartners={channelPartners}
          defaultLeadId={scheduleLeadId}
        />
      )}

      {/* Import Leads Modal */}
      {isImportModalOpen && (
        <ImportLeadsModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          sites={sites}
          channelPartners={channelPartners}
          onLeadsImported={(importedLeads) => {
            if (importedLeads.length > 0) {
              setSelectedLead(importedLeads[0]);
            }
          }}
        />
      )}
    </div>
  );
};
