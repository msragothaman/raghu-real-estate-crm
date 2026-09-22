import React, { useState } from 'react';
import {
  User as UserIcon,
  Building,
  Bell,
  CheckCircle2,
  Save,
  Shield,
  Phone,
  Mail,
  Briefcase,
  MapPin,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  ChevronDown,
  ChevronUp,
  Database,
  Lock,
  Sparkles,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { User, UserRole } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';

interface SettingsViewProps {
  currentUser: User;
  supabaseConnected: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  supabaseConnected,
}) => {
  const { showToast } = useToast();

  // User Profile Form State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '+91 98401 23456');
  const [designation, setDesignation] = useState(
    currentUser.role === 'ADMIN'
      ? 'Managing Director'
      : currentUser.role === 'SALES USER'
      ? 'Senior Sales Manager'
      : 'Channel Partner Agency Head'
  );

  // Organization Info State
  const [orgName, setOrgName] = useState(() => {
    return localStorage.getItem('raghu_crm_org_name') || 'Raghu Real Estate Developers Pvt Ltd';
  });
  const [orgGst, setOrgGst] = useState(() => {
    return localStorage.getItem('raghu_crm_org_gst') || '33AABCR1234F1Z9 (TN/RERA/2026/0412)';
  });
  const [orgPhone, setOrgPhone] = useState(() => {
    return localStorage.getItem('raghu_crm_org_phone') || '+91 98400 11223';
  });
  const [orgAddress, setOrgAddress] = useState(() => {
    return (
      localStorage.getItem('raghu_crm_org_address') ||
      'No. 42, Anna Salai, Guindy, Chennai, Tamil Nadu - 600032'
    );
  });

  // Notification Preferences State
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifyFollowups, setNotifyFollowups] = useState(true);
  const [autoAssignLeads, setAutoAssignLeads] = useState(true);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Save User Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    dataStore.updateCurrentUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });

    showToast('User profile updated successfully!', 'success');
  };

  // Save Organization Details
  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('raghu_crm_org_name', orgName.trim());
    localStorage.setItem('raghu_crm_org_gst', orgGst.trim());
    localStorage.setItem('raghu_crm_org_phone', orgPhone.trim());
    localStorage.setItem('raghu_crm_org_address', orgAddress.trim());

    showToast('Company details saved successfully!', 'success');
  };

  // Cloud Sync Handler
  const handleSyncCloud = async () => {
    setIsSyncing(true);
    const res = await dataStore.pushAllToSupabase();
    await dataStore.loadFromSupabase();
    setIsSyncing(false);

    if (res.success) {
      showToast('All CRM data synchronized successfully with cloud storage!', 'success');
    } else {
      showToast(res.message, 'info');
    }
  };

  const handleCopySchema = async () => {
    try {
      const res = await fetch('/supabase/schema.sql');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      showToast('Database SQL setup script copied to clipboard! Paste in Supabase SQL Editor and click Run.', 'success');
    } catch {
      showToast('Copy schema from supabase/schema.sql in the project root.', 'info');
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-purple-950">Account & System Settings</h2>
        <p className="text-xs text-purple-600/80 mt-0.5">
          Manage your personal profile, company details, and application preferences
        </p>
      </div>

      {/* 1. USER PROFILE SETTINGS */}
      <div className="bg-white rounded-2xl border border-[#DFD0FF] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#F0E8FF] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6C3BFF] to-[#9965FF] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#6C3BFF]/25">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-black text-purple-950">My Profile</h3>
              <p className="text-xs text-purple-600/80">
                Update your display name, contact information, and role
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-[#6C3BFF] border border-purple-200">
            {currentUser.role}
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* User Name */}
            <div>
              <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="w-full bg-[#FAF8FF] focus:bg-white text-sm pl-10 pr-4 py-2.5 rounded-xl border border-[#DFD0FF] focus:outline-none focus:border-[#6C3BFF] focus:ring-2 focus:ring-[#6C3BFF]/20 text-purple-950 font-bold transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-[#FAF8FF] focus:bg-white text-sm pl-10 pr-4 py-2.5 rounded-xl border border-[#DFD0FF] focus:outline-none focus:border-[#6C3BFF] focus:ring-2 focus:ring-[#6C3BFF]/20 text-purple-950 font-medium transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1.5">
                Phone Number / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98401 23456"
                  className="w-full bg-[#FAF8FF] focus:bg-white text-sm pl-10 pr-4 py-2.5 rounded-xl border border-[#DFD0FF] focus:outline-none focus:border-[#6C3BFF] focus:ring-2 focus:ring-[#6C3BFF]/20 text-purple-950 font-medium transition-all"
                />
              </div>
            </div>

            {/* Designation / Job Title */}
            <div>
              <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1.5">
                Designation / Job Title
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Sales Manager"
                  className="w-full bg-[#FAF8FF] focus:bg-white text-sm pl-10 pr-4 py-2.5 rounded-xl border border-[#DFD0FF] focus:outline-none focus:border-[#6C3BFF] focus:ring-2 focus:ring-[#6C3BFF]/20 text-purple-950 font-medium transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6C3BFF] hover:bg-[#5820E0] text-white text-xs font-bold rounded-xl shadow-md shadow-[#6C3BFF]/30 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. COMPANY & ORGANIZATION SETTINGS */}
      <div className="bg-white rounded-2xl border border-[#DFD0FF] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#F0E8FF] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 text-[#6C3BFF]">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-purple-950">Company & Developer Profile</h3>
            <p className="text-xs text-purple-600/80">
              Branding and legal registration shown on customer receipts and reports
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveOrg} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1.5">
                Company / Developer Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-[#FAF8FF] focus:bg-white text-sm px-4 py-2.5 rounded-xl border border-[#DFD0FF] focus:outline-none focus:border-[#6C3BFF] text-purple-950 font-bold transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1.5">
                GST / RERA Registration No.
              </label>
              <input
                type="text"
                value={orgGst}
                onChange={(e) => setOrgGst(e.target.value)}
                className="w-full bg-[#FAF8FF] focus:bg-white text-sm px-4 py-2.5 rounded-xl border border-[#DFD0FF] focus:outline-none focus:border-[#6C3BFF] text-purple-950 font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1.5">
                Head Office Phone
              </label>
              <input
                type="text"
                value={orgPhone}
                onChange={(e) => setOrgPhone(e.target.value)}
                className="w-full bg-[#FAF8FF] focus:bg-white text-sm px-4 py-2.5 rounded-xl border border-[#DFD0FF] focus:outline-none focus:border-[#6C3BFF] text-purple-950 font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1.5">
                Primary Currency & Timezone
              </label>
              <div className="p-2.5 bg-[#FAF8FF] rounded-xl border border-[#DFD0FF] text-xs font-bold text-purple-950 flex items-center justify-between">
                <span>₹ INR (Indian Rupee)</span>
                <span className="text-purple-500 font-normal">Asia/Kolkata (IST +5:30)</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1.5">
                Registered Office Address
              </label>
              <input
                type="text"
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
                className="w-full bg-[#FAF8FF] focus:bg-white text-sm px-4 py-2.5 rounded-xl border border-[#DFD0FF] focus:outline-none focus:border-[#6C3BFF] text-purple-950 font-medium transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6C3BFF] hover:bg-[#5820E0] text-white text-xs font-bold rounded-xl shadow-md shadow-[#6C3BFF]/30 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Company Details</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. NOTIFICATION & AUTOMATION PREFERENCES */}
      <div className="bg-white rounded-2xl border border-[#DFD0FF] shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 text-[#6C3BFF]">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-purple-950">Notifications & Preferences</h3>
            <p className="text-xs text-purple-600/80">
              Configure automated lead alerts and follow-up reminders
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#F0E8FF] text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-purple-950">WhatsApp Lead Notifications</p>
              <p className="text-purple-600/80 mt-0.5">
                Receive instant check-in notifications for new incoming Meta and Google enquiries
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyWhatsapp}
              onChange={(e) => setNotifyWhatsapp(e.target.checked)}
              className="w-4 h-4 rounded text-[#6C3BFF] accent-[#6C3BFF] cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-purple-950">Follow-up Due Alerts</p>
              <p className="text-purple-600/80 mt-0.5">
                Highlight due and overdue customer follow-up calls in the top action bar
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyFollowups}
              onChange={(e) => setNotifyFollowups(e.target.checked)}
              className="w-4 h-4 rounded text-[#6C3BFF] accent-[#6C3BFF] cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-purple-950">Automatic Lead Assignment</p>
              <p className="text-purple-600/80 mt-0.5">
                Distribute incoming unassigned leads evenly among active sales team members
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoAssignLeads}
              onChange={(e) => setAutoAssignLeads(e.target.checked)}
              className="w-4 h-4 rounded text-[#6C3BFF] accent-[#6C3BFF] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. CLOUD SYNCHRONIZATION & STORAGE (CLEAN & NON-TECHNICAL) */}
      <div className="bg-white rounded-2xl border border-[#DFD0FF] shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 text-[#6C3BFF]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-purple-950">Cloud Storage & Data Backup</h3>
              <p className="text-xs text-purple-600/80">
                Automatic cloud synchronization for plots, leads, and partner sales records
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-center ${
              supabaseConnected
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-purple-100 text-purple-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                supabaseConnected ? 'bg-emerald-500' : 'bg-[#6C3BFF]'
              }`}
            />
            <span>{supabaseConnected ? 'Cloud Active (Encrypted)' : 'Adaptive Offline Storage'}</span>
          </span>
        </div>

        {!supabaseConnected && (
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>One-Time Cloud Setup: Initialize Supabase Tables</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Your Supabase credentials in <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code> are active. To enable cloud tables (<code className="bg-amber-100 px-1 py-0.5 rounded">sites</code>, <code className="bg-amber-100 px-1 py-0.5 rounded">plots</code>, <code className="bg-amber-100 px-1 py-0.5 rounded">leads</code>), run the SQL setup script once in your Supabase SQL Editor.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopySchema}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL Setup Script</span>
              </button>
              <a
                href="https://supabase.com/dashboard/project/fcfskctjhqcrjsoubpdw/sql/new"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-white border border-amber-300 text-amber-900 font-bold rounded-xl hover:bg-amber-50 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Open Supabase SQL Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-[#FAF8FF] border border-[#E5DAFF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-purple-950">Instant Cloud Backup & Sync</p>
            <p className="text-[11px] text-purple-600/80 mt-0.5">
              Sync any recent offline changes or newly added plots to the cloud database
            </p>
          </div>

          <button
            onClick={handleSyncCloud}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#6C3BFF] hover:bg-[#5820E0] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Sync Cloud Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
