import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import OrganizerSidebar from '../../components/OrganizerSidebar';
import Dashboard from '../../components/organizer/Dashboard';
import CreateEvent from '../../components/organizer/CreateEvent';
import EventsTable from '../../components/organizer/EventsTable';
import AttendeesTable from '../../components/organizer/AttendeesTable';
import OrdersTable from '../../components/organizer/OrdersTable';
import AccountSettingsOrganizer from '../../components/organizer/AccountSettingsOrganizer';

interface EventDataForEdit {
  id?: string;
  title: string;
  category: string;
  eventType: 'in-person' | 'online' | 'hybrid' | '';
  dateRange: [Date | null, Date | null];
  startTime: string;
  endTime: string;
  country: string;
  state: string;
  mapAddress: string;
  onlineLink: string;
  description: string;
  tickets: { id: string; type: string; priceType: 'free' | 'paid' | ''; price: string; quantity: string; }[];
  faqs: { id: string; question: string; answer: string; }[];
  visibility: 'public' | 'private';
  images?: string[];
}

const DashboardOrganizer = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [eventMode, setEventMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [eventDataForEdit, setEventDataForEdit] = useState<EventDataForEdit | null>(null);
  const [createEventSource, setCreateEventSource] = useState<'dashboard' | 'events'>('events');

  // Close mobile sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar when clicking outside
  const handleOverlayClick = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Reset to table view when switching tabs
    if (tabId !== 'events') {
      setShowCreateEvent(false);
    }
  };

  const handleCreateEvent = (source: 'dashboard' | 'events' = 'events') => {
    setEventMode('create');
    setEventDataForEdit(null);
    setShowCreateEvent(true);
    setCreateEventSource(source);
    if (source === 'dashboard') {
      setActiveTab('events');
    }
  };

  const handleEditEvent = (event: EventDataForEdit & { name?: string }) => {
    setEventMode('edit');
    setEventDataForEdit({
      id: event.id,
      title: event.title || event.name || '',
      category: event.category,
      eventType: event.eventType,
      dateRange: event.dateRange,
      startTime: event.startTime,
      endTime: event.endTime,
      country: event.country,
      state: event.state,
      mapAddress: event.mapAddress,
      onlineLink: event.onlineLink,
      description: event.description,
      tickets: event.tickets,
      faqs: event.faqs,
      visibility: event.visibility,
      images: event.images
    });
    setShowCreateEvent(true);
  };

  const handleDuplicateEvent = (event: EventDataForEdit & { name?: string }) => {
    setEventMode('duplicate');
    setEventDataForEdit({
      title: event.title || event.name || '',
      category: event.category,
      eventType: event.eventType,
      dateRange: event.dateRange,
      startTime: event.startTime,
      endTime: event.endTime,
      country: event.country,
      state: event.state,
      mapAddress: event.mapAddress,
      onlineLink: event.onlineLink,
      description: event.description,
      tickets: event.tickets.map(t => ({ ...t, id: `ticket-${Date.now()}-${Math.random()}` })),
      faqs: event.faqs.map(f => ({ ...f, id: `faq-${Date.now()}-${Math.random()}` })),
      visibility: event.visibility,
      images: event.images
    });
    setShowCreateEvent(true);
  };

  const handleBackToEvents = () => {
    setShowCreateEvent(false);
    setEventMode('create');
    setEventDataForEdit(null);
    // If source was dashboard, go back to dashboard tab
    if (createEventSource === 'dashboard') {
      setActiveTab('dashboard');
    }
    setCreateEventSource('events');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onCreateEvent={() => handleCreateEvent('dashboard')} />;

      case 'events':
        return showCreateEvent ? (
          <CreateEvent
            mode={eventMode}
            initialData={eventDataForEdit || undefined}
            source={createEventSource}
            onSaveDraft={() => {
              console.log('Draft saved');
              handleBackToEvents();
            }}
            onPublish={() => {
              console.log('Event published');
              handleBackToEvents();
            }}
            onSaveChanges={() => {
              console.log('Changes saved');
              handleBackToEvents();
            }}
            onBack={handleBackToEvents}
          />
        ) : (
          <EventsTable 
            onCreateEvent={handleCreateEvent}
            onEditEvent={(event) => handleEditEvent({
              id: event.id,
              title: event.name,
              category: event.category,
              eventType: event.eventType,
              dateRange: event.dateRange,
              startTime: event.startTime,
              endTime: event.endTime,
              country: event.country,
              state: event.state,
              mapAddress: event.mapAddress,
              onlineLink: event.onlineLink,
              description: event.description,
              tickets: event.tickets,
              faqs: event.faqs,
              visibility: event.visibility,
              images: event.images
            })}
            onDuplicateEvent={(event) => handleDuplicateEvent({
              title: event.name,
              category: event.category,
              eventType: event.eventType,
              dateRange: event.dateRange,
              startTime: event.startTime,
              endTime: event.endTime,
              country: event.country,
              state: event.state,
              mapAddress: event.mapAddress,
              onlineLink: event.onlineLink,
              description: event.description,
              tickets: event.tickets,
              faqs: event.faqs,
              visibility: event.visibility,
              images: event.images
            })}
          />
        );

      case 'attendees':
        return <AttendeesTable />;

      case 'orders':
        return <OrdersTable />;

      case 'account-settings':
        return <AccountSettingsOrganizer />;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      {/* Navbar */}
      <Navbar onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      {/* Content area */}
      <div className="flex flex-1 min-h-[calc(100vh-64px)]">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={handleOverlayClick}
          />
        )}

        {/* Sidebar - Hidden on mobile, shown on lg+ */}
        <aside className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          ${isSidebarCollapsed ? 'w-20' : 'w-60'} 
          shrink-0 min-h-full transition-all duration-300
          top-16 lg:top-0
        `}>
          <OrganizerSidebar
            activeTab={activeTab}
            onTabChange={(tabId) => {
              handleTabChange(tabId);
              setIsMobileSidebarOpen(false);
            }}
            onCollapseChange={setIsSidebarCollapsed}
          />
        </aside>

        {/* Main content area */}
        <main className="flex-1 bg-white min-h-full w-full">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardOrganizer;
