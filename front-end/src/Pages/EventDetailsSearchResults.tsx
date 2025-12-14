import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchResultNavbar from '../components/SearchResultNavbar';
import EventCard from '../components/EventCard';
import GoBackIcon from '../assets/Svgs/goBack.svg';
import LocationIcon from '../assets/Svgs/filtresSearchResult/location.svg';
import DateIcon from '../assets/Svgs/filtresSearchResult/date.svg';

// Mock data imports
import Event1 from '../assets/imges/event myticket 1.jpg';
import Event2 from '../assets/imges/event myticket 2.jpg';
import Event3 from '../assets/imges/event myticket 3.jpg';
import Event4 from '../assets/imges/event myticket 5.jpg';
import Event5 from '../assets/imges/event myticket 6.jpg';
import Event6 from '../assets/imges/event myticket 9.jpg';
import OrganizerLogo from '../assets/imges/logoFollowing/images (1).png';

// Types
interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number;
  total: number;
  description: string;
}

interface EventDetailsData {
  id: string;
  image: string;
  title: string;
  description: string;
  fullDescription: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  country: string;
  category: string;
  tags: string[];
  ticketTypes: TicketType[];
  organizerName: string;
  organizerLogo: string;
  organizerDescription: string;
  organizerFollowers: number;
  organizerEvents: number;
  isFollowing: boolean;
  isFavorite: boolean;
  viewCount: number;
  attendeeCount: number;
  refundPolicy: string;
  refundDays: number;
  ageRestriction?: string;
  dresscode?: string;
  parking?: string;
  accessibility?: string;
  latitude: number;
  longitude: number;
}

// Mock similar events
const similarEvents = [
  {
    id: '2',
    image: Event2,
    title: 'Voices of Summer: Acoustic Vibes',
    date: 'Aug 25',
    venue: 'Sunset Gardens',
    price: '$35.99',
  },
  {
    id: '3',
    image: Event3,
    title: 'Jazz Over the Bay',
    date: 'Sep 10',
    venue: 'Bayview Pavilion',
    price: '$65.99',
    badge: 'Almost full',
    badgeColor: '#FF9800',
  },
  {
    id: '4',
    image: Event4,
    title: 'Strings in the Wild: Outdoor Classical Evening',
    date: 'Sep 20',
    venue: 'Redwood Hills Amphitheatre',
    price: '$65.99',
    badge: 'Only few left',
    badgeColor: '#FF9800',
  },
];

const EventDetailsSearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock event data - In real app, this would come from API/route params
  const eventData: EventDetailsData = {
    id: '1',
    image: Event1,
    title: 'Midnight Echo: Indie Rock Night',
    description: 'Experience an unforgettable night of indie rock with emerging artists.',
    fullDescription: `Join us for an electrifying evening of indie rock music featuring some of the most talented emerging artists in the scene. Midnight Echo brings together a carefully curated lineup of bands that will take you on a sonic journey through the best of contemporary indie rock.

The night will feature three incredible acts, each bringing their unique sound and energy to the stage. From melodic guitar riffs to powerful drum beats and soul-stirring vocals, this is a night you won't want to miss.

Our state-of-the-art sound system and intimate venue setting ensure that every note resonates perfectly, creating an immersive experience for all attendees. Whether you're a die-hard indie rock fan or just discovering the genre, Midnight Echo promises to deliver an unforgettable musical experience.

Food and beverages will be available for purchase throughout the evening. Come early to grab the best spots and stay late to mingle with fellow music lovers and the artists themselves.`,
    date: 'Saturday, July 20, 2025',
    startTime: '8:00 PM',
    endTime: '11:30 PM',
    venue: 'Luna Hall',
    address: '456 Music Avenue',
    city: 'San Francisco',
    state: 'California',
    country: 'USA',
    category: 'Music',
    tags: ['Indie Rock', 'Live Music', 'Concert', 'Emerging Artists'],
    ticketTypes: [
      {
        id: 'general',
        name: 'General Admission',
        price: 45.99,
        available: 150,
        total: 300,
        description: 'Standing room access to the main floor',
      },
      {
        id: 'vip',
        name: 'VIP Experience',
        price: 85.99,
        available: 25,
        total: 50,
        description: 'Premium seating area, complimentary drink, meet & greet with artists',
      },
      {
        id: 'early',
        name: 'Early Bird Special',
        price: 35.99,
        available: 0,
        total: 100,
        description: 'Limited time offer - SOLD OUT',
      },
    ],
    organizerName: 'Pulsewave Entertainment',
    organizerLogo: OrganizerLogo,
    organizerDescription: 'Leading music event organizer specializing in indie and alternative rock concerts across California.',
    organizerFollowers: 12500,
    organizerEvents: 48,
    isFollowing: false,
    isFavorite: false,
    viewCount: 2847,
    attendeeCount: 245,
    refundPolicy: 'Full refund available',
    refundDays: 7,
    ageRestriction: '18+',
    dresscode: 'Casual',
    parking: 'Street parking available, public garage 2 blocks away',
    accessibility: 'Wheelchair accessible venue',
    latitude: 37.7749,
    longitude: -122.4194,
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleTicketQuantityChange = (ticketId: string, quantity: number) => {
    if (quantity <= 0) {
      const newTickets = { ...selectedTickets };
      delete newTickets[ticketId];
      setSelectedTickets(newTickets);
    } else {
      setSelectedTickets({ ...selectedTickets, [ticketId]: quantity });
    }
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = eventData.ticketTypes.find(t => t.id === ticketId);
      return total + (ticket ? ticket.price * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const handleCheckout = () => {
    if (getTotalTickets() > 0) {
      console.log('Proceeding to checkout with:', selectedTickets);
      // TODO: Navigate to checkout page
    }
  };

  const handleShare = () => {
    console.log('Share event');
    // TODO: Implement share functionality
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: API call to save favorite
  };

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: API call to follow/unfollow organizer
  };

  const handleContactOrganizer = () => {
    console.log('Contact organizer');
    // TODO: Open contact modal or navigate to contact page
  };

  const handleViewOrganizerProfile = () => {
    console.log('View organizer profile');
    // TODO: Navigate to organizer profile page
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      {/* Navbar */}
      <SearchResultNavbar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          {/* Go Back Button */}
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 mb-6 text-sm font-medium text-[#4F4F4F] hover:text-[#FF4000] transition-colors"
          >
            <img src={GoBackIcon} alt="Go Back" className="w-6 h-6" />
            <span>Back to Results</span>
          </button>

          {/* Main Grid: Left (Event Details) + Right (Ticket Purchase) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] 2xl:grid-cols-[1fr_520px] gap-8 xl:gap-10 2xl:gap-12">
            {/* Left Column: Event Information */}
            <div className="space-y-6">
              {/* Event Image */}
              <div className="relative w-full h-[400px] xl:h-[480px] 2xl:h-[540px] rounded-2xl overflow-hidden">
                <img
                  src={eventData.image}
                  alt={eventData.title}
                  className="w-full h-full object-cover"
                />
                {/* Overlay badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                    {eventData.category}
                  </span>
                </div>
                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <svg
                      className={`w-5 h-5 ${isFavorite ? 'fill-[#FF4000] stroke-[#FF4000]' : 'fill-none stroke-[#4F4F4F]'}`}
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <svg className="w-5 h-5 stroke-[#4F4F4F]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Event Title & Stats */}
              <div>
                <h1 className="text-3xl font-bold text-black mb-3">{eventData.title}</h1>
                <div className="flex items-center gap-4 text-sm text-[#757575]">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {eventData.viewCount.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {eventData.attendeeCount} attending
                  </span>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-[#F8F8F8] rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <img src={DateIcon} alt="Date" className="w-6 h-6 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-black mb-1">Date & Time</p>
                    <p className="text-sm text-[#4F4F4F]">{eventData.date}</p>
                    <p className="text-sm text-[#4F4F4F]">{eventData.startTime} - {eventData.endTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <img src={LocationIcon} alt="Location" className="w-6 h-6 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-black mb-1">Location</p>
                    <p className="text-sm text-[#4F4F4F]">{eventData.venue}</p>
                    <p className="text-sm text-[#4F4F4F]">{eventData.address}, {eventData.city}, {eventData.state}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {eventData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-[#F5F5F5] text-[#4F4F4F] text-xs font-medium rounded-full hover:bg-[#EEEEEE] transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* About Event */}
              <div className="bg-white rounded-xl border border-[#EEEEEE] p-6">
                <h2 className="text-xl font-bold text-black mb-4">About This Event</h2>
                <div className="text-sm text-[#4F4F4F] leading-relaxed">
                  <p className={`${!showFullDescription ? 'line-clamp-4' : ''}`}>
                    {showFullDescription ? eventData.fullDescription : eventData.description}
                  </p>
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-3 text-[#FF4000] font-medium hover:opacity-80 transition-opacity"
                  >
                    {showFullDescription ? 'Show Less' : 'Read More'}
                  </button>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white rounded-xl border border-[#EEEEEE] p-6">
                <h2 className="text-xl font-bold text-black mb-4">Event Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventData.ageRestriction && (
                    <div>
                      <p className="text-xs text-[#757575] mb-1">Age Restriction</p>
                      <p className="text-sm font-medium text-black">{eventData.ageRestriction}</p>
                    </div>
                  )}
                  {eventData.dresscode && (
                    <div>
                      <p className="text-xs text-[#757575] mb-1">Dress Code</p>
                      <p className="text-sm font-medium text-black">{eventData.dresscode}</p>
                    </div>
                  )}
                  {eventData.parking && (
                    <div>
                      <p className="text-xs text-[#757575] mb-1">Parking</p>
                      <p className="text-sm font-medium text-black">{eventData.parking}</p>
                    </div>
                  )}
                  {eventData.accessibility && (
                    <div>
                      <p className="text-xs text-[#757575] mb-1">Accessibility</p>
                      <p className="text-sm font-medium text-black">{eventData.accessibility}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Map */}
              <div className="bg-white rounded-xl border border-[#EEEEEE] overflow-hidden">
                <div className="p-6 pb-4">
                  <h2 className="text-xl font-bold text-black">Location</h2>
                </div>
                <div className="w-full h-[300px] xl:h-[360px] 2xl:h-[420px]">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3355089.3864504!2d${eventData.longitude}!3d${eventData.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb9fe5f285e3d%3A0x8b5109a227086f55!2s${encodeURIComponent(eventData.venue)}!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Event location map"
                  />
                </div>
                <div className="p-6 pt-4">
                  <p className="text-sm font-medium text-black mb-1">{eventData.venue}</p>
                  <p className="text-sm text-[#757575]">{eventData.address}, {eventData.city}, {eventData.state}</p>
                </div>
              </div>

              {/* Organizer */}
              <div className="bg-white rounded-xl border border-[#EEEEEE] p-6">
                <h2 className="text-xl font-bold text-black mb-4">Organizer</h2>
                <div className="flex items-start gap-4">
                  <img
                    src={eventData.organizerLogo}
                    alt={eventData.organizerName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-black mb-1">{eventData.organizerName}</h3>
                    <div className="flex items-center gap-4 text-xs text-[#757575] mb-2">
                      <span>{eventData.organizerFollowers.toLocaleString()} followers</span>
                      <span>•</span>
                      <span>{eventData.organizerEvents} events</span>
                    </div>
                    <p className="text-sm text-[#4F4F4F] mb-4">{eventData.organizerDescription}</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleFollow}
                        className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${
                          isFollowing
                            ? 'bg-white text-black border border-black hover:bg-[#F8F8F8]'
                            : 'bg-black text-white hover:bg-[#333]'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      <button
                        onClick={handleContactOrganizer}
                        className="px-6 py-2 text-sm font-semibold text-black bg-white rounded-full border border-black hover:bg-[#F8F8F8] transition-colors"
                      >
                        Contact
                      </button>
                      <button
                        onClick={handleViewOrganizerProfile}
                        className="text-sm font-semibold text-[#FF4000] hover:opacity-80 transition-opacity"
                      >
                        View Profile →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Similar Events */}
              <div>
                <h2 className="text-xl font-bold text-black mb-4">Similar Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 xl:gap-5">
                  {similarEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      eventId={event.id}
                      image={event.image}
                      title={event.title}
                      date={event.date}
                      venue={event.venue}
                      price={event.price}
                      badge={event.badge}
                      badgeColor={event.badgeColor}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Ticket Purchase (Sticky) */}
            <div className="lg:sticky lg:top-6 h-fit">
              <div className="bg-white rounded-2xl border border-[#EEEEEE] p-6 xl:p-7 2xl:p-8 shadow-lg">
                <h2 className="text-xl xl:text-2xl font-bold text-black mb-4 xl:mb-5">Select Tickets</h2>

                {/* Ticket Types */}
                <div className="space-y-4 xl:space-y-5 mb-6">
                  {eventData.ticketTypes.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`border rounded-xl p-4 transition-all ${
                        ticket.available > 0
                          ? 'border-[#EEEEEE] hover:border-[#FF4000] cursor-pointer'
                          : 'border-[#EEEEEE] bg-[#F8F8F8] opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-base xl:text-lg font-semibold text-black mb-1">{ticket.name}</h3>
                          <p className="text-xs xl:text-sm text-[#757575] mb-2">{ticket.description}</p>
                          <p className="text-lg xl:text-xl font-bold text-black">${ticket.price.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-[#757575]">
                          {ticket.available > 0 ? (
                            <>
                              {ticket.available} of {ticket.total} available
                            </>
                          ) : (
                            <span className="text-[#FF4000] font-medium">SOLD OUT</span>
                          )}
                        </span>
                        {ticket.available > 0 && ticket.available < 20 && (
                          <span className="text-xs font-medium text-[#FF9800]">Only few left!</span>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      {ticket.available > 0 && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-[#4F4F4F]">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleTicketQuantityChange(
                                  ticket.id,
                                  (selectedTickets[ticket.id] || 0) - 1
                                )
                              }
                              disabled={!selectedTickets[ticket.id]}
                              className="w-8 h-8 rounded-full border border-[#EEEEEE] flex items-center justify-center hover:bg-[#F8F8F8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-black">
                              {selectedTickets[ticket.id] || 0}
                            </span>
                            <button
                              onClick={() =>
                                handleTicketQuantityChange(
                                  ticket.id,
                                  (selectedTickets[ticket.id] || 0) + 1
                                )
                              }
                              disabled={(selectedTickets[ticket.id] || 0) >= Math.min(ticket.available, 10)}
                              className="w-8 h-8 rounded-full border border-[#EEEEEE] flex items-center justify-center hover:bg-[#F8F8F8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                {getTotalTickets() > 0 && (
                  <div className="border-t border-[#EEEEEE] pt-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#757575]">Subtotal ({getTotalTickets()} tickets)</span>
                      <span className="text-sm font-semibold text-black">${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#757575]">Service Fee</span>
                      <span className="text-sm font-semibold text-black">${(getTotalPrice() * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#EEEEEE]">
                      <span className="text-base font-bold text-black">Total</span>
                      <span className="text-xl font-bold text-[#FF4000]">
                        ${(getTotalPrice() * 1.1).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={getTotalTickets() === 0}
                  className="w-full py-3.5 bg-[#FF4000] text-white text-sm font-semibold rounded-full hover:bg-[#E63900] transition-colors disabled:bg-[#BCBCBC] disabled:cursor-not-allowed"
                >
                  {getTotalTickets() > 0 ? 'Proceed to Checkout' : 'Select Tickets'}
                </button>

                {/* Refund Policy */}
                <div className="mt-4 p-3 bg-[#E3F2FD] rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-[#1976D2] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-[#1976D2] mb-0.5">Refund Policy</p>
                      <p className="text-xs text-[#1976D2]">
                        {eventData.refundPolicy} up to {eventData.refundDays} days before the event
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsSearchResults;
