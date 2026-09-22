import React, { useState } from 'react';
import {
  Settings,
  Database,
  ShieldAlert,
  Building,
  Key,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { User, UserRole } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { useToast } from '../common/Toast';
import { getSupabaseCredentials } from '../../lib/supabase';

interface SettingsViewProps {
  currentUser: User;
  supabaseConnected: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  supabaseConnected,
}) => {
  const { showToast } = useToast();
  const creds = getSupabaseCredentials();

  const [supabaseUrl, setSupabaseUrl] = useState(creds.url);
  const [supabaseKey, setSupabaseKey] = useState(creds.key);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Organization info
  const [orgName, setOrgName] = useState('Raghu Real Estate Developers Pvt Ltd');
  const [orgGst, setOrgGst] = useState('33AABCR1234F1Z9');
  const [orgPhone, setOrgPhone] = useState('+91 98401 23456');

  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('raghu_crm_supabase_url', supabaseUrl.trim());
    localStorage.setItem('raghu_crm_supabase_key', supabaseKey.trim());

    setTestingConnection(true);
    const success = await dataStore.checkSupabaseSync();
    setTestingConnection(false);

    if (success) {
      showToast('Supabase credentials saved! Live connection active.', 'success');
    } else {
      showToast(
        'Supabase credentials saved. Operating in adaptive fallback until tables are reachable.',
        'info'
      );
    }
  };

  const handleCopySchema = async () => {
    try {
      const response = await fetch('/supabase/schema.sql');
      let sqlText = '';
      if (response.ok) {
        sqlText = await response.text();
      } else {
        sqlText = `-- Copy schema from supabase/schema.sql in the project directory`;
      }
      await navigator.clipboard.writeText(sqlText);
      setCopiedSchema(true);
      showToast('SQL Schema copied to clipboard!', 'success');
      setTimeout(() => setCopiedSchema(false), 3000);
    } catch {
      showToast('Please copy schema from supabase/schema.sql directly.', 'info');
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all data back to original realistic seed plots and leads?'
      )
    ) {
      dataStore.resetToDefaultSeedData();
      showToast('Data store reset to initial demonstration state.', 'success');
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">CRM & Database Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage Supabase cloud connection, user permissions, and company profile
        </p>
      </div>

      {/* Supabase Cloud Database Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 text-[#6C3BFF]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Supabase Cloud Database</h3>
              <p className="text-xs text-slate-500">
                PostgreSQL cloud database for real-estate sites, plots, and leads
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
              supabaseConnected
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-purple-100 text-[#6C3BFF]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                supabaseConnected ? 'bg-emerald-500' : 'bg-[#6C3BFF]'
              }`}
            />
            <span>{supabaseConnected ? 'Live Supabase Connected' : 'Adaptive Local Store'}</span>
          </span>
        </div>

        {/* Supabase Setup Form */}
        <form onSubmit={handleSaveSupabase} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project URL (VITE_SUPABASE_URL)
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Anon Public API Key (VITE_SUPABASE_ANON_KEY)
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOi..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#6C3BFF]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySchema}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {copiedSchema ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy SQL Schema (`schema.sql`)</span>
              </button>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 underline px-2"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <button
              type="submit"
              disabled={testingConnection}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6C3BFF] hover:bg-[#5A2FE0] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{testingConnection ? 'Verifying...' : 'Save & Connect'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Role & Access Simulator */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">User Role & Access Preview</h3>
            <p className="text-xs text-slate-500">
              Preview the CRM interface as Admin, Sales User, or Channel Partner
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['ADMIN', 'SALES USER', 'CHANNEL PARTNER'] as UserRole[]).map((r) => {
            const isCurrent = currentUser.role === r;
            return (
              <div
                key={r}
                onClick={() => {
                  dataStore.setCurrentUserRole(r);
                  showToast(`Role switched to ${r}`, 'info');
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-[#F3EFFF] border-[#6C3BFF] ring-2 ring-[#6C3BFF]/20'
                    : 'bg-slate-50 border-slate-200 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{r}</span>
                  {isCurrent && <CheckCircle2 className="w-4 h-4 text-[#6C3BFF]" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {r === 'ADMIN'
                    ? 'Full access to all sites, leads, partners, reports, & settings.'
                    : r === 'SALES USER'
                    ? 'Access to view and update leads, follow-ups, and plots.'
                    : 'Assigned leads view only.'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organization Profile (Multi-tenant SaaS Readiness) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Organization Profile</h3>
            <p className="text-xs text-slate-500">
              Tenant identification for future multi-tenant SaaS integration (Section 25)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company / Developer Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">GST / Registration No</label>
            <input
              type="text"
              value={orgGst}
              onChange={(e) => setOrgGst(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Head Office Phone</label>
            <input
              type="text"
              value={orgPhone}
              onChange={(e) => setOrgPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Organization Tenant ID</label>
            <div className="p-2.5 bg-slate-100 font-mono text-slate-500 rounded-xl">
              org_raghu_realty_main
            </div>
          </div>
        </div>
      </div>

      {/* Demo Reset & Danger Zone */}
      <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/30 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-rose-900">Reset Demonstration Data</h4>
          <p className="text-xs text-rose-700 mt-0.5">
            Clear modifications and reload the clean seed layouts, leads, and channel partners.
          </p>
        </div>
        <button
          onClick={handleResetData}
          className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold text-xs rounded-xl shadow-xs shrink-0 transition-colors"
        >
          Reset Demo Data
        </button>
      </div>
    </div>
  );
};
