import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import MyTickets from '../../components/MyTickets';
import FavoriteEvents from '../../components/FavoriteEvents';
import Following from '../../components/Following';
import Footer from '../../components/Footer';
import EventDetails from '../../components/EventDetails';
import AccountSettings from '../../components/AccountSettings';

// Type pour les événements sélectionnés
interface SelectedEvent {
  eventId: string;
  eventImage: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventLocation: string;
  tickets: Array<{
    id: string;
    attendeeName: string;
    ticketType: string;
    ticketNumber: string;
    ticketId: string;
    status: string;
    qrCode: string;
  }>;
  orderId: string;
  purchaseDate: string;
  refundPolicy: string;
  refundDays: number;
  organizerName: string;
  organizerLogo: string;
}

const DashboardAttendee = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('my-tickets');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);

  useEffect(() => {
    document.body.style.overflow = isMobileSidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileSidebarOpen]);

  const handleEventSelect = (event: SelectedEvent) => {
    setSelectedEvent(event);
  };

  const handleGoBack = () => {
    setSelectedEvent(null);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedEvent(null); // Clear selected event when changing tabs
  };

  return (
    // Main container: full viewport height, flex column to stack all sections
    <div className="flex flex-col min-h-screen w-full bg-white">
      {/* Navbar: fixed at top, full width */}
      <Navbar showNotifications={true} />

      {/* Content area: flex row for sidebar + main content */}
      {/* flex-1 ensures this section takes available space, min-height for consistency */}
      <div className="flex flex-1 min-h-[calc(100vh-64px)]">
        {/* Sidebar: dynamic width based on collapsed state, min-height for consistency */}
        {/* Mobile drawer backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar : drawer on mobile, inline on desktop */}
        <aside
          className={`
            ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-60'}
            shrink-0 transition-all duration-300
            fixed lg:static inset-y-0 start-0 z-50 lg:z-auto
            w-60 lg:min-h-full
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'} lg:translate-x-0
          `}
        >
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onCollapseChange={setIsSidebarCollapsed}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />
        </aside>

        {/* Main content area: takes remaining space, min-height for consistency */}
        <main className="flex-1 bg-white min-h-full">
          {/* Mobile dashboard header */}
          <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-[#EEEEEE] bg-white sticky top-0 z-30">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] transition-colors"
              aria-label={t('common:nav.openMenu')}
              aria-expanded={isMobileSidebarOpen}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
            <span className="text-base font-semibold text-black">
              {activeTab === 'my-tickets' && t('sidebar.myTickets')}
              {activeTab === 'favorite-events' && t('sidebar.favoriteEvents')}
              {activeTab === 'following' && t('sidebar.following')}
              {activeTab === 'account-settings' && t('sidebar.accountSettings')}
            </span>
          </div>

          {/* Content Section with padding */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Show EventDetails if an event is selected, otherwise show tab content */}
              {selectedEvent ? (
                <EventDetails
                  eventId={selectedEvent.eventId}
                  eventImage={selectedEvent.eventImage}
                  eventTitle={selectedEvent.eventTitle}
                  eventDate={selectedEvent.eventDate}
                  eventTime={selectedEvent.eventTime}
                  eventVenue={selectedEvent.eventVenue}
                  eventLocation={selectedEvent.eventLocation}
                  tickets={selectedEvent.tickets}
                  orderId={selectedEvent.orderId}
                  purchaseDate={selectedEvent.purchaseDate}
                  refundPolicy={selectedEvent.refundPolicy}
                  refundDays={selectedEvent.refundDays}
                  organizerName={selectedEvent.organizerName}
                  organizerLogo={selectedEvent.organizerLogo}
                  onGoBack={handleGoBack}
                />
              ) : (
                <>
                  {/* Render content based on active tab */}
                  {activeTab === 'my-tickets' && <MyTickets onEventSelect={handleEventSelect} />}
                  {activeTab === 'favorite-events' && <FavoriteEvents onEventSelect={handleEventSelect} />}
                  {activeTab === 'following' && <Following />}
                  {activeTab === 'account-settings' && <AccountSettings />}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Footer: Full width, positioned after content */}
      <Footer />
    </div>
  );
};

export default DashboardAttendee;
