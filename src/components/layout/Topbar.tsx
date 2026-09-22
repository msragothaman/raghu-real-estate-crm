import React from 'react';
import {
  Menu,
  Search,
  Bell,
  UserCheck,
  Building,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { User, UserRole } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';

interface TopbarProps {
  currentUser: User;
  onToggleMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddLead: () => void;
  onOpenAddFollowup: () => void;
  onOpenAddSite: () => void;
  followupsDueCount: number;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentUser,
  onToggleMobileMenu,
  searchQuery,
  onSearchChange,
  onOpenAddLead,
  onOpenAddFollowup,
  onOpenAddSite,
  followupsDueCount,
}) => {
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dataStore.setCurrentUserRole(e.target.value as UserRole);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 z-10">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search leads, phone, sites, plots..."
            className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C3BFF] focus:ring-2 focus:ring-[#6C3BFF]/15 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Role Switcher, Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Action buttons (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={onOpenAddFollowup}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#6C3BFF]" />
            <span>Follow-up</span>
          </button>

          <button
            onClick={onOpenAddSite}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <Building className="w-3.5 h-3.5 text-[#6C3BFF]" />
            <span>New Site</span>
          </button>
        </div>

        {/* Due Followups Alert Badge */}
        {followupsDueCount > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <Bell className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>{followupsDueCount} follow-ups due</span>
          </div>
        )}

        {/* Role Switcher Pill */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
          <ShieldAlert className="w-3.5 h-3.5 text-[#6C3BFF]" />
          <span className="text-slate-500 font-medium hidden sm:inline">Role:</span>
          <select
            value={currentUser.role}
            onChange={handleRoleChange}
            className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="SALES USER">SALES USER</option>
            <option value="CHANNEL PARTNER">CHANNEL PARTNER</option>
          </select>
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#F3EFFF] text-[#6C3BFF] font-bold text-xs flex items-center justify-center border border-[#DDD1FF]">
            {currentUser.name.charAt(0)}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
