import { useState } from 'react';
import Event1 from '../assets/imges/event myticket 1.jpg';
import Event2 from '../assets/imges/event myticket 2.jpg';
import Event3 from '../assets/imges/event myticket 3.jpg';
import FavoriIcon from '../assets/Svgs/favori.svg';
import UploadIcon from '../assets/Svgs/upload.svg';
import NewestIcon from '../assets/Svgs/newest.svg';
import SearchIcon from '../assets/Svgs/recherche.svg';
import OrganizerLogo from '../assets/imges/logoFollowing/images (1).png';
import QRCode from '../assets/imges/14.jpg';

// Type pour les événements favoris
interface FavoriteEvent {
  id: string;
  image: string;
  title: string;
  date: string;
  venue: string;
  priceFrom: number;
  badge?: string; // "Trending" ou "Almost full"
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

interface FavoriteEventsProps {
  onEventSelect?: (event: SelectedEvent) => void;
}

const FavoriteEvents = ({ onEventSelect }: FavoriteEventsProps) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState('Newest First');
  const [searchQuery, setSearchQuery] = useState('');

  // Données des événements favoris
  const favoriteEvents: FavoriteEvent[] = [
    {
      id: '1',
      image: Event1,
      title: 'Midnight Echo: Indie Rock Night',
      date: 'Jul 20',
      venue: 'Luna Hall',
      priceFrom: 65.99,
      badge: 'Trending',
    },
    {
      id: '2',
      image: Event2,
      title: 'Voices of Summer: Acoustic Vibes',
      date: 'Aug 26',
      venue: 'Sunset Gardens',
      priceFrom: 35.99,
    },
    {
      id: '3',
      image: Event3,
      title: 'Jazz Over the Bay',
      date: 'Sep 10',
      venue: 'Bayview Pavilion',
      priceFrom: 55.99,
      badge: 'Almost full',
    },
  ];

  const sortOptions = ['Newest First', 'Oldest First', 'A-Z'];

  // Filter events based on search query
  const filteredEvents = favoriteEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fonction pour générer les détails complets d'un événement
  const generateEventDetails = (event: FavoriteEvent): SelectedEvent => {
    // Générer des tickets (pour les favoris, on simule 2 tickets)
    const tickets = Array.from({ length: 2 }, (_, index) => ({
      id: `${event.id}-ticket-${index + 1}`,
      attendeeName: index === 0 ? 'Michael Thompson' : 'Jessica Monroe',
      ticketType: 'General Admission',
      ticketNumber: `Ticket ${index + 1}`,
      ticketId: `TK1-98${2312 + index}`,
      status: 'Not Scanned',
      qrCode: QRCode,
    }));

    return {
      eventId: event.id,
      eventImage: event.image,
      eventTitle: event.title,
      eventDate: `Sat, Oct 6`,
      eventTime: '3:00 PM - 11:00 PM',
      eventVenue: event.venue,
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

  const handleEventClick = (event: FavoriteEvent) => {
    if (onEventSelect) {
      const eventDetails = generateEventDetails(event);
      onEventSelect(eventDetails);
    }
  };

  return (
    <div className="w-full">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-black mb-6">Favourite Events</h1>

      {/* Event Count and Filters */}
      <div className="flex items-center justify-between mb-6">
        {/* Events count */}
        <div className="text-base font-semibold text-black mb-6">
          {filteredEvents.length} Favourite Event{filteredEvents.length !== 1 ? 's' : ''}
        </div>

        {/* Search and Sort controls */}
        <div className="flex items-center gap-3">
          {/* Search input with icon on right */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Events"
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

      {/* Events Grid */}
      {/* Grid: 3 columns on desktop, responsive on smaller screens */}
      {/* Gap: 24px between cards */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event)}
              className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
            >
              {/* Event Image with action icons */}
              {/* Height: 200px for consistent card appearance */}
              <div className="relative h-[200px] overflow-hidden group">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Action icons - top right corner */}
                {/* Icons: 37x37px as per SVG specs */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {/* Heart/Favorite icon */}
                  <button className="w-[37px] h-[37px] hover:scale-110 transition-transform">
                    <img src={FavoriIcon} alt="Favorite" className="w-full h-full" />
                  </button>
                  {/* Upload/Share icon */}
                  <button className="w-[37px] h-[37px] hover:scale-110 transition-transform">
                    <img src={UploadIcon} alt="Share" className="w-full h-full" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              {/* Padding: 16px for comfortable spacing */}
              <div className="p-4">
                {/* Event Title */}
                {/* Font: 16px, semibold, black, 2 lines max with ellipsis */}
                <h3 className="text-base font-semibold text-black mb-2 line-clamp-2">
                  {event.title}
                </h3>

                {/* Event Details: Date and Venue */}
                {/* Font: 14px, medium, gray color */}
                <div className="flex items-center gap-2 text-sm text-[#4F4F4F] mb-2">
                  <span>{event.date}</span>
                  <span>•</span>
                  <span>{event.venue}</span>
                </div>

                {/* Price and Badge */}
                <div className="flex items-center justify-between">
                  {/* Price */}
                  <p className="text-sm text-black">
                    <span className="font-normal">from</span>{' '}
                    <span className="font-semibold">${event.priceFrom}</span>
                  </p>

                  {/* Badge (Trending or Almost full) */}
                  {event.badge && (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        event.badge === 'Trending'
                          ? 'bg-[#E8F5E9] text-[#2E7D32]'
                          : 'bg-[#E3F2FD] text-[#1976D2]'
                      }`}
                    >
                      {event.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty state when no events match search
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-[#F8F8F8] flex items-center justify-center">
            <svg className="w-12 h-12 text-[#BCBCBC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">No favorite events</h3>
          <p className="text-sm text-[#4F4F4F]">
            You haven't added any events to your favorites yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default FavoriteEvents;
