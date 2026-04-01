import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import NewestIcon from '../assets/Svgs/newest.svg';
import SearchIcon from '../assets/Svgs/recherche.svg';
import OrganizerLogo from '../assets/imges/logoFollowing/images (1).png';
import EventImageFallback from '../assets/imges/event myticket 1.jpg';
import ticketService, { Ticket as ApiTicket } from '../services/ticketService';
import { useAuth } from '../context/AuthContext';

// Type pour les tickets (grouped by event)
interface TicketGroup {
  id: string;
  eventId: string;
  image: string;
  title: string;
  date: string;
  venue: string;
  ticketCount: number;
  rawTickets: ApiTicket[];
}

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

interface MyTicketsProps {
  onEventSelect?: (event: SelectedEvent) => void;
}

const MyTickets = ({ onEventSelect }: MyTicketsProps) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState('Newest First');
  const [searchQuery, setSearchQuery] = useState('');
  const [allTickets, setAllTickets] = useState<ApiTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) {
        console.log('⚠️ [MyTickets] No user found, skipping ticket fetch');
        return;
      }
      console.log('🎫 [MyTickets] Fetching tickets for user:', user.id);
      console.log('👤 [MyTickets] User email:', user.email);
      console.log('📛 [MyTickets] User name:', user.name);
      setIsLoading(true);
      try {
        const tickets = await ticketService.getByUser(user.id);
        console.log(`✅ [MyTickets] Received ${tickets.length} tickets from API`);
        if (tickets.length > 0) {
          console.log('📋 [MyTickets] First ticket:', tickets[0]);
        }
        setAllTickets(tickets);
      } catch (err) {
        console.error('❌ [MyTickets] Failed to fetch tickets:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, [user]);

  // Group tickets by event and categorize by tab
  const groupTicketsByEvent = (tickets: ApiTicket[]): TicketGroup[] => {
    const grouped = new Map<string, ApiTicket[]>();
    tickets.forEach(t => {
      const eventId = t.eventId;
      if (!grouped.has(eventId)) grouped.set(eventId, []);
      grouped.get(eventId)!.push(t);
    });

    return Array.from(grouped.entries()).map(([eventId, eventTickets]) => {
      const first = eventTickets[0];
      const eventStart = first.event ? new Date(first.event.startAt) : new Date(first.issuedAt);
      return {
        id: eventId,
        eventId,
        image: first.event?.images?.[0] || EventImageFallback,
        title: first.event?.title || 'Event',
        date: eventStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        venue: '',
        ticketCount: eventTickets.length,
        rawTickets: eventTickets,
      };
    });
  };

  const now = new Date();

  const getFilteredTickets = (): TicketGroup[] => {
    let filtered: ApiTicket[];
    switch (activeTab) {
      case 'upcoming':
        filtered = allTickets.filter(t => t.status === 'active' && t.event && new Date(t.event.startAt) >= now);
        break;
      case 'past':
        filtered = allTickets.filter(t => (t.status === 'active' || t.status === 'used') && t.event && new Date(t.event.startAt) < now);
        break;
      case 'cancelled':
        filtered = allTickets.filter(t => t.status === 'cancelled');
        break;
      default:
        filtered = [];
    }

    let groups = groupTicketsByEvent(filtered);

    // Filter by search query
    if (searchQuery.trim()) {
      groups = groups.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Sort
    if (sortOption === 'Newest First') {
      groups.sort((a, b) => new Date(b.rawTickets[0].issuedAt).getTime() - new Date(a.rawTickets[0].issuedAt).getTime());
    } else if (sortOption === 'Oldest First') {
      groups.sort((a, b) => new Date(a.rawTickets[0].issuedAt).getTime() - new Date(b.rawTickets[0].issuedAt).getTime());
    } else if (sortOption === 'A-Z') {
      groups.sort((a, b) => a.title.localeCompare(b.title));
    }

    return groups;
  };

  const currentTickets = getFilteredTickets();

  // Build event details from real ticket data
  const generateEventDetails = async (group: TicketGroup): Promise<SelectedEvent> => {
    const first = group.rawTickets[0];
    const eventStart = first.event ? new Date(first.event.startAt) : new Date();
    const eventEnd = first.event ? new Date(first.event.endAt) : new Date();

    // Generate QR codes for all tickets
    const ticketsWithQR = await Promise.all(
      group.rawTickets.map(async (t, index) => {
        try {
          // Generate QR code as data URL
          const qrCodeDataUrl = await QRCode.toDataURL(t.code, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          });
          
          return {
            id: t.id,
            attendeeName: t.owner?.name || user?.name || 'Attendee',
            ticketType: t.ticketType?.title || 'General Admission',
            ticketNumber: `Ticket ${index + 1}`,
            ticketId: t.code,
            status: t.status === 'used' ? 'Scanned' : 'Not Scanned',
            qrCode: qrCodeDataUrl,
          };
        } catch (err) {
          console.error('Failed to generate QR code for ticket:', t.code, err);
          return {
            id: t.id,
            attendeeName: t.owner?.name || user?.name || 'Attendee',
            ticketType: t.ticketType?.title || 'General Admission',
            ticketNumber: `Ticket ${index + 1}`,
            ticketId: t.code,
            status: t.status === 'used' ? 'Scanned' : 'Not Scanned',
            qrCode: '',
          };
        }
      })
    );

    return {
      eventId: group.eventId,
      eventImage: group.image,
      eventTitle: group.title,
      eventDate: eventStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      eventTime: `${eventStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${eventEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
      eventVenue: group.venue,
      eventLocation: '',
      tickets: ticketsWithQR,
      orderId: first.orderId || '',
      purchaseDate: new Date(first.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      refundPolicy: 'Refund available',
      refundDays: 7,
      organizerName: '',
      organizerLogo: OrganizerLogo,
    };
  };

  const handleEventClick = async (group: TicketGroup) => {
    if (onEventSelect) {
      const eventDetails = await generateEventDetails(group);
      onEventSelect(eventDetails);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF4000]"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-black mb-6">My Tickets</h1>

      {/* Tabs Navigation */}
      {/* Tabs: Upcoming, Past, Cancelled with orange underline for active tab */}
      <div className="flex items-center gap-6 border-b border-[#EEEEEE] mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-medium transition-colors relative cursor-pointer ${
            activeTab === 'upcoming' ? 'text-[#FF4000]' : 'text-[#4F4F4F] hover:text-black'
          }`}
        >
          Upcoming
          {/* Active tab indicator: orange bottom border, 2px height */}
          {activeTab === 'upcoming' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4000]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 text-sm font-medium transition-colors relative cursor-pointer ${
            activeTab === 'past' ? 'text-[#FF4000]' : 'text-[#4F4F4F] hover:text-black'
          }`}
        >
          Past
          {activeTab === 'past' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4000]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`pb-3 text-sm font-medium transition-colors relative cursor-pointer ${
            activeTab === 'cancelled' ? 'text-[#FF4000]' : 'text-[#4F4F4F] hover:text-black'
          }`}
        >
          Cancelled
          {activeTab === 'cancelled' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4000]" />
          )}
        </button>
      </div>

      {/* Ticket Count and Filters */}
      <div className="flex items-center justify-between mb-6">
        {/* Ticket count */}
        <h2 className="text-base font-semibold text-black">
          {currentTickets.length} Ticket{currentTickets.length !== 1 ? 's' : ''}
        </h2>

        {/* Search and Sort controls */}
        <div className="flex items-center gap-3">
          {/* Search input with icon on right */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Tickets"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 bg-white border border-[#EEEEEE] text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
              style={{ borderRadius: '85.41px', width: '187px', height: '38px' }}
            />
            {/* Search icon positioned on the right */}
            <img 
              src={SearchIcon} 
              alt="Search" 
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none" 
            />
          </div>

          {/* Sort dropdown with newest icon - Fixed width 187px */}
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 pl-11 pr-3 border border-[#EEEEEE] bg-white cursor-pointer hover:border-[#FF4000] transition-colors"
              style={{ borderRadius: '85.41px', width: '187px', height: '38px' }}
            >
              {/* Newest icon on the left */}
              <img src={NewestIcon} alt="Sort" className="absolute left-1 top-1/2 -translate-y-1/2 w-[30px] h-[30px]" />
              <span className="text-sm font-medium text-[#4F4F4F] truncate flex-1">{sortOption}</span>
              {/* Dropdown arrow */}
              <svg className="w-4 h-4 text-[#4F4F4F] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown menu */}
            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#EEEEEE] py-1 z-50">
                {['Newest First', 'Oldest First', 'A-Z'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortOption(option);
                      setIsSortOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                      sortOption === option
                        ? 'bg-[#FFF4F3] text-[#FF4000] font-medium'
                        : 'text-[#4F4F4F] hover:bg-[#F8F8F8]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      {/* Grid: 3 columns on desktop, responsive on smaller screens */}
      {/* Gap: 24px between cards for clean spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentTickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => handleEventClick(ticket)}
            className="bg-white rounded-xl overflow-hidden border border-[#EEEEEE] hover:shadow-lg hover:border-[#FF4000] hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            {/* Event Image */}
            {/* Height: 200px for consistent card appearance */}
            <div className="relative h-[200px] overflow-hidden">
              <img
                src={ticket.image}
                alt={ticket.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Card Content */}
            {/* Padding: 16px for comfortable spacing */}
            <div className="p-4">
              {/* Event Title */}
              {/* Font: 16px, semibold, black, 2 lines max with ellipsis */}
              <h3 className="text-base font-semibold text-black mb-2 line-clamp-2 group-hover:text-[#FF4000] transition-colors">
                {ticket.title}
              </h3>

              {/* Event Details: Date and Venue */}
              {/* Font: 14px, medium, gray color */}
              <div className="flex items-center gap-2 text-sm text-[#4F4F4F] mb-1">
                <span>{ticket.date}</span>
                <span>•</span>
                <span>{ticket.venue}</span>
              </div>

              {/* Ticket Count */}
              {/* Font: 14px, semibold, orange color for emphasis */}
              <p className="text-sm font-semibold text-[#FF4000]">
                {ticket.ticketCount} Ticket{ticket.ticketCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {currentTickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-24 h-24 bg-[#F8F8F8] rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-[#BCBCBC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">No tickets found</h3>
          <p className="text-sm text-[#4F4F4F]">
            {activeTab === 'upcoming' && "You don't have any upcoming events."}
            {activeTab === 'past' && "You don't have any past events."}
            {activeTab === 'cancelled' && "You don't have any cancelled events."}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
