import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Handshake,
  CalendarDays,
  BarChart3,
  Settings,
  PlusCircle,
  Database,
} from 'lucide-react';
import { dataStore } from '../../lib/dataStore';

export type TabType =
  | 'dashboard'
  | 'sites'
  | 'leads'
  | 'partners'
  | 'calendar'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenAddLead: () => void;
  leadCount: number;
  followupsDueCount: number;
  supabaseConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddLead,
  leadCount,
  followupsDueCount,
  supabaseConnected,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sites', label: 'Sites & Plots', icon: Building2 },
    { id: 'leads', label: 'Lead Management', icon: Users, badge: leadCount },
    { id: 'partners', label: 'Channel Partners', icon: Handshake },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: CalendarDays,
      badge: followupsDueCount > 0 ? `${followupsDueCount} due` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C3BFF] to-[#4B1FB8] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-[#6C3BFF]/25">
              R
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight text-base tracking-tight">
                Raghu Real Estate
              </h1>
              <span className="text-[11px] font-semibold text-[#6C3BFF] tracking-wider uppercase">
                SaaS CRM
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={onOpenAddLead}
            className="w-full flex items-center justify-center gap-2 bg-[#6C3BFF] hover:bg-[#5A2FE0] text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-sm shadow-[#6C3BFF]/30 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Lead</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as TabType)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#F3EFFF] text-[#6C3BFF] font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-[#6C3BFF]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      item.badgeColor || (isActive ? 'bg-[#6C3BFF] text-white' : 'bg-slate-100 text-slate-600')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / DB Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Supabase:</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
              supabaseConnected
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-purple-100 text-purple-700'
            }`}
          >
            {supabaseConnected ? '● Live Connected' : '● Adaptive Store'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 text-center">
          Raghu CRM v1.0 • Tamil Nadu Plots
        </p>
      </div>
    </aside>
  );
};
