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
  Layers,
  Sparkles,
  LogOut,
} from 'lucide-react';

import { User } from '../../types/crm';

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
  currentUser?: User;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddLead,
  leadCount,
  followupsDueCount,
  supabaseConnected,
  currentUser,
  onSignOut,
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
      badgeColor: 'bg-amber-400 text-purple-950',
    },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-[#210647] via-[#2E0B5E] to-[#3D107A] text-white flex flex-col justify-between shrink-0 select-none shadow-xl shadow-purple-950/20 border-r border-[#4A178F]">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8C5DFF] to-[#6C3BFF] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#6C3BFF]/40 border border-white/20">
              R
            </div>
            <div>
              <h1 className="font-extrabold text-white leading-tight text-base tracking-tight flex items-center gap-1.5">
                <span>Raghu Real Estate</span>
              </h1>
              <span className="text-[11px] font-bold text-[#C7ACFF] tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#A67CFF]" />
                <span>Pure Purple CRM</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Button - Admin Only */}
        {currentUser?.role === 'ADMIN' && (
          <div className="px-4 pt-4 pb-2">
            <button
              onClick={onOpenAddLead}
              className="w-full flex items-center justify-center gap-2 bg-[#6C3BFF] hover:bg-[#7D4EFF] text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-lg shadow-[#6C3BFF]/40 transition-all active:scale-[0.98] border border-white/15"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Lead</span>
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as TabType)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#6C3BFF] text-white shadow-md shadow-[#6C3BFF]/40 ring-1 ring-white/20'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-white' : 'text-purple-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      item.badgeColor || (isActive ? 'bg-white text-[#6C3BFF]' : 'bg-white/20 text-white')
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
      <div className="p-4 border-t border-white/10 bg-black/15 space-y-3">
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-purple-200 hover:text-white bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-300" />
            <span>Sign Out</span>
          </button>
        )}

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-purple-300" />
            <span className="text-purple-200 font-medium">Supabase:</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
              supabaseConnected
                ? 'bg-emerald-400 text-slate-950 shadow-xs'
                : 'bg-purple-300 text-purple-950'
            }`}
          >
            {supabaseConnected ? '● Live Connected' : '● Adaptive Store'}
          </span>
        </div>
        <p className="text-[11px] text-purple-300/80 text-center">
          Raghu CRM • Pure Purple SaaS
        </p>
      </div>
    </aside>
  );
};
