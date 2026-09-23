import React, { useState, useEffect } from 'react';
import { TabType, Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { SiteList } from './components/sites/SiteList';
import { SiteDetails } from './components/sites/SiteDetails';
import { LeadManagementView } from './components/leads/LeadManagementView';
import { PartnerManagementView } from './components/partners/PartnerManagementView';
import { CalendarView } from './components/calendar/CalendarView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { AddLeadModal } from './components/leads/AddLeadModal';
import { AddSiteModal } from './components/sites/AddSiteModal';
import { AddFollowUpModal } from './components/leads/AddFollowUpModal';
import { DailyFollowupModal } from './components/calendar/DailyFollowupModal';
import { ToastProvider } from './components/common/Toast';
import { SignInPage } from './components/auth/SignInPage';
import { dataStore } from './lib/dataStore';
import { Site, Lead, ChannelPartner } from './types/crm';

export const AppContent: React.FC = () => {
  const [storeState, setStoreState] = useState(dataStore.getState());
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Drill-down selection states (tracked by ID so edits reflect instantly across views)
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [calendarInitialTab, setCalendarInitialTab] = useState<string | undefined>(undefined);
  const [leadPipelineStatusFilter, setLeadPipelineStatusFilter] = useState<string | undefined>(
    undefined
  );

  // Dynamically resolve active site and lead from reactive storeState
  const selectedSite = storeState.sites.find((s) => s.id === selectedSiteId) || null;
  const selectedLead = storeState.leads.find((l) => l.id === selectedLeadId) || null;

  // Global modal triggers
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [isAddFollowupOpen, setIsAddFollowupOpen] = useState(false);
  const [isDailyBriefingOpen, setIsDailyBriefingOpen] = useState(false);

  // Subscribe to reactive data store
  useEffect(() => {
    const unsubscribe = dataStore.subscribe((newState) => {
      setStoreState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  // Automatically show Daily Follow-up Briefing pop-up once on software open
  useEffect(() => {
    if (storeState.isAuthenticated && storeState.followups.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const hasUrgentFollowups = storeState.followups.some(
        (f) => f.status === 'Pending' && f.followup_date <= todayStr
      );
      const sessionBriefingShown = sessionStorage.getItem('raghu_crm_daily_briefing_shown');
      if (hasUrgentFollowups && !sessionBriefingShown) {
        const timer = setTimeout(() => {
          setIsDailyBriefingOpen(true);
          sessionStorage.setItem('raghu_crm_daily_briefing_shown', 'true');
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [storeState.isAuthenticated, storeState.followups]);

  const stats = dataStore.getDashboardStats();

  // Navigation handler from dashboard / cards
  const handleNavigate = (tab: TabType, filterOrId?: string) => {
    setCurrentTab(tab);
    if (tab === 'leads' && filterOrId) {
      setLeadPipelineStatusFilter(filterOrId);
    } else {
      setLeadPipelineStatusFilter(undefined);
    }

    if (tab === 'partners' && filterOrId) {
      setSelectedPartnerId(filterOrId);
    } else {
      setSelectedPartnerId(null);
    }

    if (tab === 'calendar' && filterOrId) {
      setCalendarInitialTab(filterOrId);
    }
  };

  const handleSelectSite = (site: Site) => {
    setSelectedSiteId(site.id);
    setCurrentTab('sites');
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    // If not on leads tab, we can still show the drawer or switch tab
    if (currentTab !== 'leads') {
      setCurrentTab('leads');
    }
  };

  // If not authenticated, require Sign In before entering SaaS
  if (!storeState.isAuthenticated) {
    return (
      <SignInPage
        availableUsers={storeState.users}
        onLoginSuccess={() => {
          // Handled reactively
        }}
      />
    );
  }

  const handleSignOut = () => {
    dataStore.logout();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F8FC]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            if (tab === 'sites') setSelectedSiteId(null);
            if (tab === 'partners') setSelectedPartnerId(null);
          }}
          onOpenAddLead={() => setIsAddLeadOpen(true)}
          leadCount={storeState.leads.length}
          followupsDueCount={stats.followupsDue}
          supabaseConnected={storeState.supabaseConnected}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Mobile Drawer & Sticky Nav */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'sites') setSelectedSiteId(null);
          if (tab === 'partners') setSelectedPartnerId(null);
        }}
        onOpenAddLead={() => setIsAddLeadOpen(true)}
        leadCount={storeState.leads.length}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Action Bar */}
        <Topbar
          currentUser={storeState.currentUser}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onOpenAddLead={() => setIsAddLeadOpen(true)}
          onOpenAddFollowup={() => setIsAddFollowupOpen(true)}
          onOpenAddSite={() => setIsAddSiteOpen(true)}
          onOpenDailyBriefing={() => setIsDailyBriefingOpen(true)}
          followupsDueCount={stats.followupsDue}
          onSignOut={handleSignOut}
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              sites={storeState.sites}
              plots={storeState.plots}
              leads={storeState.leads}
              channelPartners={storeState.channelPartners}
              followups={storeState.followups}
              onNavigate={handleNavigate}
              onSelectLead={handleSelectLead}
              onSelectSite={handleSelectSite}
            />
          )}

          {currentTab === 'sites' && (
            selectedSite ? (
              <SiteDetails
                site={selectedSite}
                allPlots={storeState.plots}
                leads={storeState.leads}
                onBack={() => setSelectedSiteId(null)}
                onSelectLead={handleSelectLead}
              />
            ) : (
              <SiteList
                sites={storeState.sites}
                plots={storeState.plots}
                onSelectSite={(site) => setSelectedSiteId(site.id)}
                isAddModalOpen={isAddSiteOpen}
                setIsAddModalOpen={setIsAddSiteOpen}
              />
            )
          )}

          {currentTab === 'leads' && (
            <LeadManagementView
              leads={storeState.leads}
              sites={storeState.sites}
              channelPartners={storeState.channelPartners}
              users={storeState.users}
              followups={storeState.followups}
              statusHistory={storeState.statusHistory}
              partnerHistory={storeState.partnerHistory}
              notes={storeState.notes}
              initialStatusFilter={leadPipelineStatusFilter}
              isAddLeadOpen={isAddLeadOpen}
              setIsAddLeadOpen={setIsAddLeadOpen}
              selectedLead={selectedLead}
              setSelectedLead={(lead) => setSelectedLeadId(lead ? lead.id : null)}
            />
          )}

          {currentTab === 'partners' && (
            <PartnerManagementView
              channelPartners={storeState.channelPartners}
              leads={storeState.leads}
              sites={storeState.sites}
              plots={storeState.plots}
              followups={storeState.followups}
              onSelectLead={handleSelectLead}
              selectedPartnerId={selectedPartnerId}
              onClearSelectedPartner={() => setSelectedPartnerId(null)}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              followups={storeState.followups}
              leads={storeState.leads}
              channelPartners={storeState.channelPartners}
              sites={storeState.sites}
              onSelectLead={handleSelectLead}
              initialTab={calendarInitialTab}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              leads={storeState.leads}
              sites={storeState.sites}
              channelPartners={storeState.channelPartners}
              plots={storeState.plots}
              followups={storeState.followups}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              currentUser={storeState.currentUser}
              supabaseConnected={storeState.supabaseConnected}
            />
          )}
        </main>
      </div>

      {/* Global Quick Action Modals */}
      {isAddLeadOpen && (
        <AddLeadModal
          isOpen={isAddLeadOpen}
          onClose={() => setIsAddLeadOpen(false)}
          sites={storeState.sites}
          channelPartners={storeState.channelPartners}
          onLeadAdded={(lead) => handleSelectLead(lead)}
        />
      )}

      {isAddSiteOpen && (
        <AddSiteModal
          isOpen={isAddSiteOpen}
          onClose={() => setIsAddSiteOpen(false)}
          onSiteCreated={(site) => handleSelectSite(site)}
        />
      )}

      {isAddFollowupOpen && (
        <AddFollowUpModal
          isOpen={isAddFollowupOpen}
          onClose={() => setIsAddFollowupOpen(false)}
          leads={storeState.leads}
          channelPartners={storeState.channelPartners}
        />
      )}

      {isDailyBriefingOpen && (
        <DailyFollowupModal
          isOpen={isDailyBriefingOpen}
          onClose={() => setIsDailyBriefingOpen(false)}
          followups={storeState.followups}
          leads={storeState.leads}
          channelPartners={storeState.channelPartners}
          onSelectLead={handleSelectLead}
          onOpenCalendar={() => setCurrentTab('calendar')}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
