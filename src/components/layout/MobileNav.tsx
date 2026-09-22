import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Handshake,
  CalendarDays,
  X,
  PlusCircle,
  BarChart3,
  Settings,
} from 'lucide-react';
import { TabType } from './Sidebar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenAddLead: () => void;
  leadCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onOpenAddLead,
  leadCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sites', label: 'Sites & Plots', icon: Building2 },
    { id: 'leads', label: 'Leads', icon: Users, badge: leadCount },
    { id: 'partners', label: 'Partners', icon: Handshake },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 transform transition-transform duration-200 ease-in-out md:hidden flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#6C3BFF] text-white font-bold flex items-center justify-center">
                R
              </div>
              <span className="font-bold text-slate-900">Raghu CRM</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3">
            <button
              onClick={() => {
                onClose();
                onOpenAddLead();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#6C3BFF] text-white font-semibold text-sm py-2.5 px-4 rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Lead</span>
            </button>
          </div>

          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id as TabType);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm ${
                    isActive
                      ? 'bg-[#F3EFFF] text-[#6C3BFF] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#6C3BFF] text-white font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
          Raghu Real Estate CRM • SaaS
        </div>
      </div>

      {/* Bottom Sticky Mobile Quick Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 flex items-center justify-around py-2 px-1 md:hidden shadow-lg">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'sites', label: 'Sites', icon: Building2 },
          { id: 'leads', label: 'Leads', icon: Users },
          { id: 'partners', label: 'Partners', icon: Handshake },
          { id: 'calendar', label: 'Calendar', icon: CalendarDays },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as TabType)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive ? 'text-[#6C3BFF]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
