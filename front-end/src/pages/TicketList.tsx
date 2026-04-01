import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventDetailsNavbar from '../components/EventDetailsNavbar';
import ticketTypeService, { TicketType as ApiTicketType } from '../services/ticketTypeService';
import eventService from '../services/eventService';

// Import SVG icons (used as fallback based on ticket type)
import GeneralAdmissionIcon from '../assets/Svgs/eventDetails/generalAdmission.svg';
import VipTicketIcon from '../assets/Svgs/eventDetails/vipTicket.svg';
import EarlyBirdTicketIcon from '../assets/Svgs/eventDetails/earlyBridTicket.svg';

// Fallback event image
import EventImageFallback from '../assets/imges/event myticket 1.jpg';

interface TicketItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  features: string[];
  badge?: string;
  badgeColor?: string;
  quantity: number;
  available: number;
  maxPerOrder?: number;
  isFree: boolean;
}

interface EventInfo {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  image: string;
}

const getIconForType = (type: string): string => {
  switch (type) {
    case 'vip': return VipTicketIcon;
    case 'early-bird': return EarlyBirdTicketIcon;
    default: return GeneralAdmissionIcon;
  }
};

const getBadge = (available: number, quantityTotal: number): { badge?: string; badgeColor?: string } => {
  const ratio = available / quantityTotal;
  if (available === 0) return { badge: 'Sold out', badgeColor: 'orange' };
  if (ratio <= 0.1) return { badge: 'Only few left', badgeColor: 'orange' };
  if (ratio <= 0.25) return { badge: 'Almost full', badgeColor: 'blue' };
  return {};
};

const TicketList: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      setIsLoading(true);
      setError(null);
      try {
        const [ticketTypes, event] = await Promise.all([
          ticketTypeService.getByEvent(eventId),
          eventService.getEventById(eventId),
        ]);

        // Map API ticket types to UI items
        const mappedTickets: TicketItem[] = ticketTypes
          .filter((tt: ApiTicketType) => tt.isVisible)
          .map((tt: ApiTicketType) => {
            const available = tt.quantityTotal - tt.quantitySold;
            const { badge, badgeColor } = getBadge(available, tt.quantityTotal);
            return {
              id: tt.id,
              name: tt.title,
              price: Number(tt.price),
              icon: getIconForType(tt.type),
              features: tt.ticketBenefits || (tt.description ? [tt.description] : []),
              badge,
              badgeColor,
              quantity: 0,
              available,
              maxPerOrder: tt.maxPerOrder || 10,
              isFree: tt.isFree,
            };
          });

        setTickets(mappedTickets);

        // Map event info
        const startDate = new Date(event.startAt);
        const endDate = new Date(event.endAt);
        const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = `${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

        setEventInfo({
          id: event.id,
          title: event.title,
          date: dateStr,
          time: timeStr,
          venue: event.venue?.name || '',
          location: event.customLocation ? `${event.customLocation.city}, ${event.customLocation.country}` : (event.venue ? `${event.venue.city}, ${event.venue.country}` : ''),
          image: event.images?.[0] || EventImageFallback,
        });
      } catch (err: any) {
        console.error('Failed to fetch ticket data:', err);
        setError(err.response?.data?.message || 'Failed to load tickets. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const serviceCharge = 20.00;

  const updateQuantity = (ticketId: string, change: number) => {
    setTickets(tickets.map(ticket => {
      if (ticket.id === ticketId) {
        const max = Math.min(ticket.available, ticket.maxPerOrder || 10);
        const newQuantity = Math.max(0, Math.min(max, ticket.quantity + change));
        return { ...ticket, quantity: newQuantity };
      }
      return ticket;
    }));
  };

  const calculateSubtotal = () => {
    return tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + serviceCharge;
  };

  const getOrderSummaryItems = () => {
    return tickets.filter(ticket => ticket.quantity > 0);
  };

  const handleContinue = () => {
    const orderItems = getOrderSummaryItems().map(t => ({
      ticketTypeId: t.id,
      quantity: t.quantity,
      unitPrice: t.price,
      name: t.name,
    }));
    navigate(`/event/${eventId}/tickets/confirmation`, {
      state: {
        eventId,
        eventInfo,
        orderItems,
        subtotal: calculateSubtotal(),
        serviceCharge,
        total: calculateTotal(),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <EventDetailsNavbar isLoggedIn={!!user} />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF4000]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <EventDetailsNavbar isLoggedIn={!!user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="text-[#FF4000] font-semibold hover:underline">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Navbar */}
      <EventDetailsNavbar isLoggedIn={!!user} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Go Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-black mb-6 hover:text-[#FF4000] transition-colors cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-medium">Go Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Ticket Selection */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket.id)}
                  className={`bg-white rounded-2xl p-6 border-2 transition-all cursor-pointer ${
                    selectedTicket === ticket.id ? 'border-[#FF4000]' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Ticket Icon */}
                    <div className="shrink-0">
                      <img src={ticket.icon} alt={ticket.name} className="w-[45px] h-[45px]" />
                    </div>

                    {/* Ticket Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-black">{ticket.name}</h3>
                          {ticket.badge && (
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              ticket.badgeColor === 'orange' 
                                ? 'text-[#FF4000] bg-[#FFF4F3]' 
                                : 'text-[#00A3FF] bg-[#E6F7FF]'
                            }`}>
                              {ticket.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-lg font-bold text-black">${ticket.price.toFixed(2)}</span>
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                        {ticket.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                              <circle cx="8" cy="8" r="8" fill="#34A853"/>
                              <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-xs text-[#4F4F4F] whitespace-nowrap">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); updateQuantity(ticket.id, -1); }}
                        disabled={ticket.quantity === 0 || ticket.available === 0}
                        className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors ${
                          ticket.quantity === 0 || ticket.available === 0
                            ? 'border-[#EEEEEE] text-[#CCCCCC] cursor-not-allowed' 
                            : 'border-black text-black hover:bg-[#F8F8F8]'
                        }`}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                      <span className="text-lg font-semibold text-black w-6 text-center">{ticket.quantity}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateQuantity(ticket.id, 1); }}
                        disabled={ticket.available === 0 || ticket.quantity >= Math.min(ticket.available, ticket.maxPerOrder || 10)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                          ticket.available === 0 || ticket.quantity >= Math.min(ticket.available, ticket.maxPerOrder || 10)
                            ? 'bg-[#EEEEEE] text-[#CCCCCC] cursor-not-allowed'
                            : 'bg-black text-white hover:bg-[#333333]'
                        }`}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 4V12M4 8H12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-6 min-h-[480px] flex flex-col">
              {/* Event Info */}
              <div className="flex gap-3 mb-6 pb-6 border-b border-[#EEEEEE]">
                <img 
                  src={eventInfo?.image || EventImageFallback} 
                  alt={eventInfo?.title || 'Event'} 
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-black mb-1 line-clamp-2">
                    {eventInfo?.title || 'Event'}
                  </h3>
                  <p className="text-xs text-[#757575] mb-1">
                    {eventInfo?.date} • {eventInfo?.time}
                  </p>
                  <p className="text-xs text-[#757575]">
                    {eventInfo?.venue}{eventInfo?.location ? ` • ${eventInfo.location}` : ''}
                  </p>
                </div>
              </div>

              {/* Order Summary */}
              <h3 className="text-lg font-bold text-black mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4">
                {getOrderSummaryItems().map((ticket) => (
                  <div key={ticket.id} className="flex justify-between items-center">
                    <span className="text-sm text-[#4F4F4F]">
                      {ticket.quantity} x {ticket.name}
                    </span>
                    <span className="text-sm font-semibold text-black">
                      ${(ticket.price * ticket.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#4F4F4F]">Service charge</span>
                  <span className="text-sm font-semibold text-black">${serviceCharge.toFixed(2)}</span>
                </div>
              </div>

              {/* Spacer to push total and button to bottom */}
              <div className="flex-1"></div>

              <div className="pt-4 border-t border-[#EEEEEE] mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-black">Total</span>
                  <span className="text-xl font-bold text-black">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Continue Button */}
              <button 
                onClick={handleContinue}
                className="w-full py-3 bg-[#FF4000] text-white font-bold rounded-full hover:bg-[#E63900] transition-colors text-base cursor-pointer"
                disabled={getOrderSummaryItems().length === 0}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketList;
