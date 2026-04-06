import { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('my-tickets');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);

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
        <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-60'} shrink-0 min-h-full transition-all duration-300`}>
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
            onCollapseChange={setIsSidebarCollapsed}
          />
        </aside>

        {/* Main content area: takes remaining space, min-height for consistency */}
        <main className="flex-1 bg-white min-h-full">
          {/* Content Section with padding */}
          <div className="p-8">
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
