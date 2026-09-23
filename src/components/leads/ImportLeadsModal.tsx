import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  X,
  Building,
  Handshake,
  Users,
  RefreshCw,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { soundManager } from '../../lib/soundEffects';
import { dataStore } from '../../lib/dataStore';
import { Lead, Site, ChannelPartner, LeadSource, LeadStatus } from '../../types/crm';

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  channelPartners: ChannelPartner[];
  onLeadsImported?: (leads: Lead[]) => void;
}

interface ParsedLeadRow {
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  source: LeadSource;
  campaign?: string;
  interested_site_id?: string | null;
  siteNameDisplay?: string;
  preferred_plot_size?: string;
  budget?: string;
  purpose?: string;
  preferred_location?: string;
  assigned_channel_partner_id?: string | null;
  partnerNameDisplay?: string;
  status: LeadStatus;
}

export const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({
  isOpen,
  onClose,
  sites,
  channelPartners,
  onLeadsImported,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default values when not specified in the file
  const [defaultSource, setDefaultSource] = useState<LeadSource>('Meta');
  const [defaultSiteId, setDefaultSiteId] = useState<string>('');
  const [defaultPartnerId, setDefaultPartnerId] = useState<string>('');

  // Parsed results
  const [parsedRows, setParsedRows] = useState<ParsedLeadRow[]>([]);
  const [skippedRowCount, setSkippedRowCount] = useState(0);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);

  // Reset state on modal close/open
  const resetForm = () => {
    setFile(null);
    setParsedRows([]);
    setSkippedRowCount(0);
    setDetectedColumns([]);
    setIsParsing(false);
    setIsSubmitting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  // Download sample CSV template
  const handleDownloadCSVTemplate = () => {
    const headers = [
      'Customer Name',
      'Phone Number',
      'WhatsApp Number',
      'Email Address',
      'Lead Source',
      'Campaign',
      'Interested Site',
      'Preferred Plot Size',
      'Budget Range',
      'Purpose',
      'Preferred Location',
      'Assigned Partner',
    ];

    const sampleSite = sites[0]?.name || 'Green Meadows Layout';
    const samplePartner = channelPartners[0]?.name || 'Prime Realtors';

    const sampleRows = [
      [
        'Rajesh Kannan',
        '9876543210',
        '9876543210',
        'rajesh@example.com',
        'Meta',
        'FB Plots Campaign Q1',
        sampleSite,
        '1200 sqft',
        '₹25 Lakhs',
        'Investment',
        'Vandalur',
        samplePartner,
      ],
      [
        'Meenakshi Sundaram',
        '9841023456',
        '9841023456',
        'meenakshi@example.com',
        'Google',
        'Google Search Chengalpattu',
        sampleSite,
        '1500 sqft',
        '₹35 Lakhs',
        'Own Villa / House',
        'Chengalpattu',
        'In-House',
      ],
      [
        'Karthik Narayanan',
        '9444123456',
        '9444123456',
        'karthik@example.com',
        'WhatsApp',
        'Direct Enquiries',
        sampleSite,
        '2400 sqft',
        '₹50 Lakhs',
        'Investment',
        'Tambaram',
        samplePartner,
      ],
    ];

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Raghu_CRM_Leads_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    soundManager.playSuccess();
    showToast('Downloaded CSV sample template!', 'info');
  };

  // Download sample Excel (.xls) template
  const handleDownloadXLSTemplate = () => {
    const headers = [
      'Customer Name',
      'Phone Number',
      'WhatsApp Number',
      'Email Address',
      'Lead Source',
      'Campaign',
      'Interested Site',
      'Preferred Plot Size',
      'Budget Range',
      'Purpose',
      'Preferred Location',
      'Assigned Partner',
    ];

    const sampleSite = sites[0]?.name || 'Green Meadows Layout';
    const samplePartner = channelPartners[0]?.name || 'Prime Realtors';

    const sampleRows = [
      [
        'Rajesh Kannan',
        '9876543210',
        '9876543210',
        'rajesh@example.com',
        'Meta',
        'FB Plots Campaign Q1',
        sampleSite,
        '1200 sqft',
        '₹25 Lakhs',
        'Investment',
        'Vandalur',
        samplePartner,
      ],
      [
        'Meenakshi Sundaram',
        '9841023456',
        '9841023456',
        'meenakshi@example.com',
        'Google',
        'Google Search Chengalpattu',
        sampleSite,
        '1500 sqft',
        '₹35 Lakhs',
        'Own Villa / House',
        'Chengalpattu',
        'In-House',
      ],
    ];

    const rowsHtml = sampleRows
      .map(
        (r, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#FFFFFF' : '#F9F8FE'};">
          ${r
            .map(
              (c, i) => `
            <td style="border: 1px solid #E2E8F0; padding: 8px 12px; font-family: sans-serif; font-size: 12px; ${
              i === 1 || i === 2 ? "mso-number-format:'\\@';" : ''
            }">${c}</td>
          `
            )
            .join('')}
        </tr>
      `
      )
      .join('');

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        </head>
        <body>
          <table border="1" style="border-collapse: collapse;">
            <thead>
              <tr style="background-color: #6C3BFF; color: #FFFFFF; font-family: sans-serif; font-weight: bold; font-size: 13px;">
                ${headers.map((h) => `<th style="padding: 10px; border: 1px solid #5A2FE0;">${h}</th>`).join('')}
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
    link.setAttribute('download', 'Raghu_CRM_Leads_Import_Template.xls');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    soundManager.playSuccess();
    showToast('Downloaded Excel sample template!', 'info');
  };

  // Process selected file
  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile) return;

    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      showToast('Please select a valid CSV (.csv) or Excel (.xlsx, .xls) file.', 'error');
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!jsonData || jsonData.length === 0) {
        showToast('The selected file is empty.', 'error');
        setIsParsing(false);
        return;
      }

      // First row: Headers
      const rawHeaders = jsonData[0].map((h) => String(h || '').trim());
      setDetectedColumns(rawHeaders);

      // Map column headers to known fields
      const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

      const colMap: { [key: string]: number } = {};
      rawHeaders.forEach((header, idx) => {
        const norm = normalize(header);
        if (['name', 'customername', 'fullname', 'leadname', 'client', 'buyer'].includes(norm)) {
          colMap['name'] = idx;
        } else if (
          ['phone', 'phonenumber', 'mobile', 'mobilenumber', 'contact', 'contactnumber', 'cell'].includes(
            norm
          )
        ) {
          colMap['phone'] = idx;
        } else if (['whatsapp', 'whatsappnumber', 'wanumber', 'wa'].includes(norm)) {
          colMap['whatsapp'] = idx;
        } else if (['email', 'emailaddress', 'mail'].includes(norm)) {
          colMap['email'] = idx;
        } else if (['source', 'leadsource', 'channel', 'marketingsource'].includes(norm)) {
          colMap['source'] = idx;
        } else if (['campaign', 'campaignname', 'ad', 'adcampaign'].includes(norm)) {
          colMap['campaign'] = idx;
        } else if (['site', 'project', 'interestedsite', 'sitename', 'layout', 'locationproject'].includes(norm)) {
          colMap['site'] = idx;
        } else if (['plotsize', 'preferredplotsize', 'size', 'area', 'sqft'].includes(norm)) {
          colMap['plot_size'] = idx;
        } else if (['budget', 'budgetrange', 'approxbudget', 'pricerange'].includes(norm)) {
          colMap['budget'] = idx;
        } else if (['purpose', 'investment', 'buyingpurpose'].includes(norm)) {
          colMap['purpose'] = idx;
        } else if (['location', 'preferredlocation', 'city', 'areapreference'].includes(norm)) {
          colMap['preferred_location'] = idx;
        } else if (['partner', 'channelpartner', 'assignedpartner', 'agent', 'broker'].includes(norm)) {
          colMap['partner'] = idx;
        } else if (['status', 'stage', 'leadstatus', 'pipelinestatus'].includes(norm)) {
          colMap['status'] = idx;
        }
      });

      // Parse data rows
      const dataRows = jsonData.slice(1);
      const parsed: ParsedLeadRow[] = [];
      let skipped = 0;

      const validSources: LeadSource[] = [
        'Google',
        'Meta',
        'WhatsApp',
        'Website',
        'Referral',
        'Channel Partner',
        'Other',
      ];

      const validStatuses: LeadStatus[] = [
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

      dataRows.forEach((row) => {
        // Skip completely empty rows
        if (!row || row.length === 0 || row.every((c) => c === undefined || c === null || String(c).trim() === '')) {
          return;
        }

        const rawName = colMap['name'] !== undefined ? String(row[colMap['name']] || '').trim() : '';
        const rawPhone = colMap['phone'] !== undefined ? String(row[colMap['phone']] || '').trim() : '';

        // Must have at least a Name or a Phone
        if (!rawName && !rawPhone) {
          skipped++;
          return;
        }

        const name = rawName || 'Prospective Buyer';
        const phone = rawPhone || 'Not Specified';

        const rawWhatsapp =
          colMap['whatsapp'] !== undefined ? String(row[colMap['whatsapp']] || '').trim() : '';
        const whatsapp = rawWhatsapp || phone;

        const email =
          colMap['email'] !== undefined ? String(row[colMap['email']] || '').trim() : undefined;

        // Source detection
        let source: LeadSource = defaultSource;
        if (colMap['source'] !== undefined) {
          const srcVal = String(row[colMap['source']] || '').trim();
          const matchedSrc = validSources.find(
            (vs) => vs.toLowerCase() === srcVal.toLowerCase() || srcVal.toLowerCase().includes(vs.toLowerCase())
          );
          if (matchedSrc) source = matchedSrc;
        }

        const campaign =
          colMap['campaign'] !== undefined
            ? String(row[colMap['campaign']] || '').trim()
            : `${source} Bulk Import`;

        // Site match
        let siteId: string | null = defaultSiteId || null;
        let siteNameDisplay = sites.find((s) => s.id === defaultSiteId)?.name || 'General';

        if (colMap['site'] !== undefined) {
          const sVal = String(row[colMap['site']] || '').trim();
          if (sVal) {
            const matchedSite = sites.find(
              (s) =>
                s.name.toLowerCase() === sVal.toLowerCase() ||
                s.name.toLowerCase().includes(sVal.toLowerCase()) ||
                sVal.toLowerCase().includes(s.name.toLowerCase())
            );
            if (matchedSite) {
              siteId = matchedSite.id;
              siteNameDisplay = matchedSite.name;
            } else {
              siteNameDisplay = sVal;
            }
          }
        }

        // Partner match
        let partnerId: string | null = defaultPartnerId || null;
        let partnerNameDisplay =
          channelPartners.find((cp) => cp.id === defaultPartnerId)?.name || 'In-House Direct';

        if (colMap['partner'] !== undefined) {
          const pVal = String(row[colMap['partner']] || '').trim();
          if (pVal && pVal.toLowerCase() !== 'in-house' && pVal.toLowerCase() !== 'direct') {
            const matchedPartner = channelPartners.find(
              (cp) =>
                cp.name.toLowerCase() === pVal.toLowerCase() ||
                cp.name.toLowerCase().includes(pVal.toLowerCase()) ||
                pVal.toLowerCase().includes(cp.name.toLowerCase())
            );
            if (matchedPartner) {
              partnerId = matchedPartner.id;
              partnerNameDisplay = matchedPartner.name;
            } else {
              partnerNameDisplay = pVal;
            }
          }
        }

        // Status match
        let status: LeadStatus = 'NEW';
        if (colMap['status'] !== undefined) {
          const stVal = String(row[colMap['status']] || '').trim().toUpperCase();
          const matchedStatus = validStatuses.find((vs) => vs === stVal);
          if (matchedStatus) status = matchedStatus;
        }

        const plotSize =
          colMap['plot_size'] !== undefined
            ? String(row[colMap['plot_size']] || '').trim()
            : undefined;

        const budget =
          colMap['budget'] !== undefined
            ? String(row[colMap['budget']] || '').trim()
            : undefined;

        const purpose =
          colMap['purpose'] !== undefined
            ? String(row[colMap['purpose']] || '').trim()
            : 'Investment';

        const preferredLocation =
          colMap['preferred_location'] !== undefined
            ? String(row[colMap['preferred_location']] || '').trim()
            : undefined;

        parsed.push({
          name,
          phone,
          whatsapp,
          email: email || undefined,
          source,
          campaign,
          interested_site_id: siteId,
          siteNameDisplay,
          preferred_plot_size: plotSize || undefined,
          budget: budget || undefined,
          purpose,
          preferred_location: preferredLocation || undefined,
          assigned_channel_partner_id: partnerId,
          partnerNameDisplay,
          status,
        });
      });

      setParsedRows(parsed);
      setSkippedRowCount(skipped);
      setIsParsing(false);

      if (parsed.length > 0) {
        soundManager.playGrab();
        showToast(`Parsed ${parsed.length} leads successfully from ${selectedFile.name}!`, 'success');
      } else {
        showToast('No valid lead rows found in the selected file.', 'error');
      }
    } catch (err: any) {
      console.error('Error parsing spreadsheet:', err);
      showToast(`Failed to parse file: ${err.message || 'Unknown error'}`, 'error');
      setIsParsing(false);
    }
  };

  // Re-apply defaults if user changes default site, partner, or source after upload
  const applyDefaultsToParsed = (
    newSource?: LeadSource,
    newSiteId?: string,
    newPartnerId?: string
  ) => {
    const s = newSource ?? defaultSource;
    const siteId = newSiteId !== undefined ? newSiteId : defaultSiteId;
    const partnerId = newPartnerId !== undefined ? newPartnerId : defaultPartnerId;

    const siteObj = sites.find((x) => x.id === siteId);
    const partnerObj = channelPartners.find((x) => x.id === partnerId);

    setParsedRows((prev) =>
      prev.map((row) => ({
        ...row,
        source: row.source || s,
        interested_site_id: row.interested_site_id || siteId || null,
        siteNameDisplay: row.siteNameDisplay || (siteObj ? siteObj.name : 'General'),
        assigned_channel_partner_id: row.assigned_channel_partner_id || partnerId || null,
        partnerNameDisplay:
          row.partnerNameDisplay || (partnerObj ? partnerObj.name : 'In-House Direct'),
      }))
    );
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Execute Bulk Import
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) {
      showToast('No leads available to import.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUserId = dataStore.getState().currentUser.id;

      const leadsToCreate = parsedRows.map((row) => ({
        name: row.name,
        phone: row.phone,
        whatsapp: row.whatsapp || row.phone,
        email: row.email,
        source: row.source,
        campaign: row.campaign || `${row.source} Bulk Import`,
        interested_site_id: row.interested_site_id || null,
        preferred_plot_size: row.preferred_plot_size,
        budget: row.budget,
        purpose: row.purpose || 'Investment',
        preferred_location: row.preferred_location,
        status: row.status || 'NEW',
        assigned_channel_partner_id: row.assigned_channel_partner_id || null,
        assigned_user_id: currentUserId,
      }));

      const createdLeads = dataStore.addLeadsBatch(leadsToCreate);

      soundManager.playSuccess();
      showToast(
        `Successfully imported ${createdLeads.length} leads into Lead Management!`,
        'success'
      );

      if (onLeadsImported) {
        onLeadsImported(createdLeads);
      }

      handleModalClose();
    } catch (err: any) {
      console.error('Error importing leads:', err);
      showToast(`Import failed: ${err.message || 'Unknown error'}`, 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Import Leads from CSV or Excel"
      subtitle="Upload your customer spreadsheets (.csv, .xlsx, .xls) to bulk-add leads into Raghu CRM"
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Template Download Bar */}
        <div className="bg-[#FAF8FF] border border-[#DDD1FF] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-purple-950">
              Need the spreadsheet format?
            </p>
            <p className="text-[11px] text-purple-600">
              Download our ready-to-use templates with pre-configured columns & sample data.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSVTemplate}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Sample CSV</span>
            </button>
            <button
              onClick={handleDownloadXLSTemplate}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C3BFF] hover:text-[#5A2FE0] bg-purple-100/80 hover:bg-purple-200/80 border border-purple-300 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Sample Excel (.xls)</span>
            </button>
          </div>
        </div>

        {/* Upload Zone */}
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-[#6C3BFF] bg-[#F3EFFF]/80 scale-[1.01]'
                : 'border-slate-300 hover:border-[#6C3BFF] hover:bg-[#FAF8FF]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F3EFFF] text-[#6C3BFF] flex items-center justify-center mb-3 shadow-xs">
              <Upload className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Drag & drop your CSV or Excel file here, or{' '}
              <span className="text-[#6C3BFF] underline">browse</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Supports .csv, .xlsx, and .xls spreadsheets (up to 1,000 leads per import)
            </p>
          </div>
        ) : (
          /* File Selected Card & Default Options */
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-[#FAF8FF] border border-[#DDD1FF] rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F3EFFF] text-[#6C3BFF] flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{file.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} valid leads detected
                  </p>
                </div>
              </div>

              <button
                onClick={resetForm}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Change File</span>
              </button>
            </div>

            {/* Configurable Default Allocations */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-800 mb-2.5">
                Default Assignments (Applied to leads with missing fields in file):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Default Source */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Default Lead Source
                  </label>
                  <select
                    value={defaultSource}
                    onChange={(e) => {
                      const newSrc = e.target.value as LeadSource;
                      setDefaultSource(newSrc);
                      applyDefaultsToParsed(newSrc, undefined, undefined);
                    }}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-800 focus:outline-none focus:border-[#6C3BFF]"
                  >
                    <option value="Meta">Meta (Facebook/IG)</option>
                    <option value="Google">Google</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Channel Partner">Channel Partner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Default Site */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Default Project Site
                  </label>
                  <select
                    value={defaultSiteId}
                    onChange={(e) => {
                      const newSite = e.target.value;
                      setDefaultSiteId(newSite);
                      applyDefaultsToParsed(undefined, newSite, undefined);
                    }}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-800 focus:outline-none focus:border-[#6C3BFF]"
                  >
                    <option value="">None / General</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Default Partner */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Default Channel Partner
                  </label>
                  <select
                    value={defaultPartnerId}
                    onChange={(e) => {
                      const newP = e.target.value;
                      setDefaultPartnerId(newP);
                      applyDefaultsToParsed(undefined, undefined, newP);
                    }}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-800 focus:outline-none focus:border-[#6C3BFF]"
                  >
                    <option value="">In-House Direct Sales</option>
                    {channelPartners.map((cp) => (
                      <option key={cp.id} value={cp.id}>
                        {cp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Skipped rows warning if any */}
            {skippedRowCount > 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {skippedRowCount} rows were skipped because they lacked both customer name and
                  phone number.
                </span>
              </div>
            )}

            {/* Parsed Leads Preview Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-800">
                  Preview Leads ({parsedRows.length} ready):
                </p>
                <span className="text-[11px] text-slate-400">
                  Showing first {Math.min(parsedRows.length, 5)} records
                </span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto max-h-56">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8FF] border-b border-purple-100 text-[11px] font-bold text-purple-700 uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Customer Name</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">WhatsApp</th>
                        <th className="py-2.5 px-3">Source</th>
                        <th className="py-2.5 px-3">Site</th>
                        <th className="py-2.5 px-3">Partner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-purple-50/30">
                          <td className="py-2 px-3 font-semibold text-slate-900">{row.name}</td>
                          <td className="py-2 px-3 text-slate-700 font-mono text-[11px]">{row.phone}</td>
                          <td className="py-2 px-3 text-slate-700 font-mono text-[11px]">{row.whatsapp}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#6C3BFF] border border-purple-200">
                              {row.source}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-700">{row.siteNameDisplay}</td>
                          <td className="py-2 px-3 text-slate-700">{row.partnerNameDisplay}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleModalClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!file || parsedRows.length === 0 || isSubmitting}
            onClick={handleConfirmImport}
            className={`inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl text-white shadow-sm transition-all ${
              !file || parsedRows.length === 0 || isSubmitting
                ? 'bg-slate-300 cursor-not-allowed opacity-60'
                : 'bg-[#6C3BFF] hover:bg-[#5A2FE0]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Importing Leads...'
                : `Import ${parsedRows.length > 0 ? parsedRows.length : ''} Leads into CRM`}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
