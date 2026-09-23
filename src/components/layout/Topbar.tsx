import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Building,
  Plus,
  ShieldAlert,
  LogOut,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { User, UserRole } from '../../types/crm';
import { dataStore } from '../../lib/dataStore';
import { soundManager } from '../../lib/soundEffects';

interface TopbarProps {
  currentUser: User;
  onToggleMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddLead: () => void;
  onOpenAddFollowup: () => void;
  onOpenAddSite: () => void;
  onOpenDailyBriefing?: () => void;
  followupsDueCount: number;
  onSignOut?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentUser,
  onToggleMobileMenu,
  searchQuery,
  onSearchChange,
  onOpenAddLead,
  onOpenAddFollowup,
  onOpenAddSite,
  onOpenDailyBriefing,
  followupsDueCount,
  onSignOut,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());

  useEffect(() => {
    const unsub = soundManager.subscribe((muted) => setIsMuted(muted));
    return () => unsub();
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dataStore.setCurrentUserRole(e.target.value as UserRole);
  };

  const handleToggleSound = () => {
    soundManager.toggleMute();
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#EADFFF] px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 z-10 shadow-xs">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-purple-700 hover:text-purple-900 hover:bg-[#F5F0FF] rounded-xl"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search leads, phone, sites, plots..."
            className="w-full bg-[#FAF8FF] hover:bg-white focus:bg-white text-sm pl-9 pr-4 py-2 rounded-xl border border-[#E5DAFF] focus:outline-none focus:border-[#6C3BFF] focus:ring-2 focus:ring-[#6C3BFF]/20 transition-all text-purple-950 placeholder:text-purple-300"
          />
        </div>
      </div>

      {/* Right: Actions, Role Switcher, Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Sound Effects Toggle */}
        <button
          onClick={handleToggleSound}
          title={isMuted ? 'Sound Effects: Muted (Click to Unmute)' : 'Sound Effects: Active (Click to Mute)'}
          className={`p-2 rounded-xl border transition-all ${
            isMuted
              ? 'bg-slate-50 border-slate-200 text-slate-400 hover:text-purple-600'
              : 'bg-[#F5F0FF] border-[#E5DAFF] text-[#6C3BFF] hover:bg-purple-100 shadow-xs'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Daily Followup Briefing Button */}
        {onOpenDailyBriefing && (
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenDailyBriefing();
            }}
            title="Open Today's Follow-up Briefing"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#F5F0FF] to-purple-100/70 hover:from-purple-100 hover:to-purple-200 text-[#6C3BFF] font-bold text-xs rounded-xl border border-[#DFD0FF] shadow-xs transition-all hover:scale-102"
          >
            <Bell className="w-3.5 h-3.5 text-[#6C3BFF]" />
            <span className="hidden sm:inline">Daily Briefing</span>
            {followupsDueCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {followupsDueCount}
              </span>
            )}
          </button>
        )}

        {/* Quick Action buttons (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAddFollowup();
            }}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-[#E5DAFF] hover:bg-[#F5F0FF] text-purple-900 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#6C3BFF]" />
            <span>Follow-up</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAddSite();
            }}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-[#E5DAFF] hover:bg-[#F5F0FF] text-purple-900 transition-colors"
          >
            <Building className="w-3.5 h-3.5 text-[#6C3BFF]" />
            <span>New Site</span>
          </button>
        </div>

        {/* Role Switcher Pill */}
        <div className="flex items-center gap-1.5 bg-[#FAF8FF] border border-[#E5DAFF] rounded-xl px-2.5 py-1 text-xs">
          <ShieldAlert className="w-3.5 h-3.5 text-[#6C3BFF]" />
          <span className="text-purple-600 font-semibold hidden sm:inline">Role:</span>
          <select
            value={currentUser.role}
            onChange={handleRoleChange}
            className="bg-transparent font-bold text-purple-950 focus:outline-none cursor-pointer"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="SALES USER">SALES USER</option>
            <option value="CHANNEL PARTNER">CHANNEL PARTNER</option>
          </select>
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#EADFFF]">
          <div className="w-8 h-8 rounded-full bg-[#6C3BFF] text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-[#6C3BFF]/30">
            {currentUser.name.charAt(0)}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-purple-950 leading-none">{currentUser.name}</p>
            <p className="text-[10px] text-purple-400 mt-0.5">{currentUser.role}</p>
          </div>

          {onSignOut && (
            <button
              onClick={onSignOut}
              title="Sign Out of CRM"
              className="ml-1 p-2 text-purple-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
