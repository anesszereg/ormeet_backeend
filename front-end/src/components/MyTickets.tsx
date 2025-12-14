import { useState } from 'react';
import Event1 from '../assets/imges/event myticket 1.jpg';
import Event2 from '../assets/imges/event myticket 2.jpg';
import Event3 from '../assets/imges/event myticket 3.jpg';
import Event4 from '../assets/imges/event myticket 4.png';
import Event5 from '../assets/imges/event myticket 5.jpg';
import Event6 from '../assets/imges/event myticket 6.jpg';
import Event7 from '../assets/imges/event myticket 7.png';
import Event8 from '../assets/imges/event myticket 8.png';
import NewestIcon from '../assets/Svgs/newest.svg';
import SearchIcon from '../assets/Svgs/recherche.svg';
import OrganizerLogo from '../assets/imges/logoFollowing/images (1).png';
import QRCode from '../assets/imges/14.jpg';

// Type pour les tickets
interface Ticket {
  id: string;
  image: string;
  title: string;
  date: string;
  venue: string;
  ticketCount: number;
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

  // Données des tickets - Upcoming
  const upcomingTickets: Ticket[] = [
    {
      id: '1',
      image: Event1,
      title: 'Midnight Echo: Indie Rock Night',
      date: 'Jul 20',
      venue: 'Luna Hall',
      ticketCount: 1,
    },
    {
      id: '2',
      image: Event2,
      title: 'Voices of Summer: Acoustic Vibes',
      date: 'Aug 26',
      venue: 'Sunset Gardens',
      ticketCount: 10,
    },
    {
      id: '3',
      image: Event3,
      title: 'Jazz Over the Bay',
      date: 'Sep 10',
      venue: 'Bayview Pavilion',
      ticketCount: 6,
    },
    {
      id: '4',
      image: Event4,
      title: 'Soul City Nights: Live Performances',
      date: 'Oct 6',
      venue: 'Vibe Lounge',
      ticketCount: 12,
    },
    {
      id: '5',
      image: Event5,
      title: 'Electric Nights: A Journey Through Sound & Light',
      date: 'Jun 27',
      venue: 'The Edge Club',
      ticketCount: 5,
    },
    {
      id: '6',
      image: Event6,
      title: 'Strings in the Wild: Outdoor Classical Evening',
      date: 'Sep 20',
      venue: 'Redwood Hills Amphitheatre',
      ticketCount: 3,
    },
  ];

  // Données des tickets - Past
  const pastTickets: Ticket[] = [
    {
      id: '7',
      image: Event7,
      title: 'Summer Music Festival 2024',
      date: 'May 15',
      venue: 'Central Park',
      ticketCount: 2,
    },
    {
      id: '8',
      image: Event8,
      title: 'Classical Orchestra Night',
      date: 'Apr 10',
      venue: 'Symphony Hall',
      ticketCount: 4,
    },
  ];

  // Données des tickets - Cancelled
  const cancelledTickets: Ticket[] = [
    {
      id: '9',
      image: Event4,
      title: 'Rock Concert 2024',
      date: 'Mar 20',
      venue: 'Arena Stadium',
      ticketCount: 3,
    },
  ];

  // Récupérer les tickets selon l'onglet actif et filtrer par recherche
  const getActiveTickets = () => {
    let tickets: Ticket[];
    switch (activeTab) {
      case 'upcoming':
        tickets = upcomingTickets;
        break;
      case 'past':
        tickets = pastTickets;
        break;
      case 'cancelled':
        tickets = cancelledTickets;
        break;
      default:
        tickets = upcomingTickets;
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      return tickets.filter(ticket => 
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return tickets;
  };

  const currentTickets = getActiveTickets();

  // Fonction pour générer les détails complets d'un événement
  const generateEventDetails = (ticket: Ticket): SelectedEvent => {
    // Générer des tickets individuels basés sur le ticketCount
    const tickets = Array.from({ length: ticket.ticketCount }, (_, index) => ({
      id: `${ticket.id}-ticket-${index + 1}`,
      attendeeName: index === 0 ? 'Michael Thompson' : index === 1 ? 'Jessica Monroe' : `Emily Carter`,
      ticketType: 'General Admission',
      ticketNumber: `Ticket ${index + 1}`,
      ticketId: `TK1-98${2312 + index}`,
      status: 'Not Scanned',
      qrCode: QRCode,
    }));

    return {
      eventId: ticket.id,
      eventImage: ticket.image,
      eventTitle: ticket.title,
      eventDate: `Sat, Oct 6`,
      eventTime: '3:00 PM - 11:00 PM',
      eventVenue: ticket.venue,
      eventLocation: 'San Mateo, CA, California',
      tickets,
      orderId: '45.32',
      purchaseDate: 'Oct 1, 2025',
      refundPolicy: 'Refund available',
      refundDays: 7,
      organizerName: 'Pulsewave Entertainment',
      organizerLogo: OrganizerLogo,
    };
  };

  const handleEventClick = (ticket: Ticket) => {
    if (onEventSelect) {
      const eventDetails = generateEventDetails(ticket);
      onEventSelect(eventDetails);
    }
  };

  return (
    <div className="w-full">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-black mb-6">My Tickets</h1>

      {/* Tabs Navigation */}
      {/* Tabs: Upcoming, Past, Cancelled with orange underline for active tab */}
      <div className="flex items-center gap-6 border-b border-[#EEEEEE] mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-medium transition-colors relative ${
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
          className={`pb-3 text-sm font-medium transition-colors relative ${
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
          className={`pb-3 text-sm font-medium transition-colors relative ${
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
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
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
            className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
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
              <h3 className="text-base font-semibold text-black mb-2 line-clamp-2">
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
