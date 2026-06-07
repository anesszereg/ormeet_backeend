import { useState } from 'react';
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
  const { t } = useTranslation('attendee');
  const [activeTab, setActiveTab] = useState('my-tickets');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);

  const mobileTabs = [
    { id: 'my-tickets', label: t('sidebar.myTickets', 'Tickets'), icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
    )},
    { id: 'favorite-events', label: t('sidebar.favoriteEvents', 'Favorites'), icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
    )},
    { id: 'following', label: t('sidebar.following', 'Following'), icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    )},
    { id: 'account-settings', label: t('sidebar.accountSettings', 'Settings'), icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    )},
  ];

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
    <div className="flex flex-col min-h-screen w-full bg-white">
      <Navbar showNotifications={true} />

      {/* Content area */}
      <div className="flex flex-1 min-h-[calc(100vh-64px)]">
        {/* Sidebar: hidden on mobile, visible md+ */}
        <aside className={`hidden md:flex ${isSidebarCollapsed ? 'w-20' : 'w-60'} shrink-0 min-h-full transition-all duration-300`}>
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
            onCollapseChange={setIsSidebarCollapsed}
          />
        </aside>

        {/* Main content area */}
        <main className="flex-1 bg-white min-h-full">
          {/* pb-20 on mobile to avoid overlap with bottom tab bar */}
          <div className="p-4 md:p-8 pb-24 md:pb-8">
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
      
      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#EEEEEE] flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {mobileTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === tab.id ? 'text-[#FF4000]' : 'text-[#757575]'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer: hidden on mobile to save space */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default DashboardAttendee;
