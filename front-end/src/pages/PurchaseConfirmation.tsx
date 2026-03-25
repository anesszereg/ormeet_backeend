import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EventDetailsNavbar from '../components/EventDetailsNavbar';
import orderService, { CreateOrderDto, Order } from '../services/orderService';
import eventService from '../services/eventService';
import { useAuth } from '../context/AuthContext';

// Fallback event image
import EventImageFallback from '../assets/imges/event myticket 1.jpg';

interface RecommendedEvent {
  id: string;
  image: string;
  title: string;
  date: string;
  venue: string;
  price: string;
  badge?: string;
  badgeColor?: 'orange' | 'blue';
}

interface LocationState {
  eventId: string;
  eventInfo: {
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    location: string;
    image: string;
  };
  orderItems: Array<{
    ticketTypeId: string;
    quantity: number;
    unitPrice: number;
    name: string;
  }>;
  subtotal: number;
  serviceCharge: number;
  total: number;
}

const PurchaseConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as LocationState | null;

  const [showAllEvents, setShowAllEvents] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedEvents, setRecommendedEvents] = useState<RecommendedEvent[]>([]);

  // Create order on mount
  useEffect(() => {
    const createOrder = async () => {
      if (!state || !user) {
        setError('Missing order information. Please go back and try again.');
        setIsProcessing(false);
        return;
      }

      try {
        const orderData: CreateOrderDto = {
          userId: user.id,
          eventId: state.eventId,
          items: state.orderItems.map(item => ({
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          billingName: user.name || '',
          billingEmail: user.email || '',
          billingAddress: {
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
          },
          paymentMethod: 'credit_card',
          metadata: { source: 'web_app' },
        };

        const createdOrder = await orderService.create(orderData);

        // Auto-complete payment (simulated — in production, integrate Stripe/PayPal here)
        const paidOrder = await orderService.completePayment(createdOrder.id, `sim_${Date.now()}`);
        setOrder(paidOrder);
      } catch (err: any) {
        console.error('Order creation failed:', err);
        setError(err.response?.data?.message || 'Failed to process your order. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    createOrder();
  }, []);

  // Fetch recommended events
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const events = await eventService.getAllEvents();
        const filtered = events
          .filter((e: any) => e.id !== state?.eventId)
          .slice(0, 6)
          .map((e: any) => {
            const startDate = new Date(e.startAt);
            return {
              id: e.id,
              image: e.images?.[0] || EventImageFallback,
              title: e.title,
              date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              venue: e.venue?.name || '',
              price: e.ticketTypes?.[0] ? `$${Number(e.ticketTypes[0].price).toFixed(2)}` : 'Free',
            };
          });
        setRecommendedEvents(filtered);
      } catch {
        // Silently fail — recommended events are non-critical
      }
    };
    fetchRecommended();
  }, []);

  const displayedRecommended = showAllEvents ? recommendedEvents : recommendedEvents.slice(0, 3);

  const orderEmail = order?.billingEmail || user?.email || '';
  const orderId = order?.id ? `#${order.id.slice(0, 8)}` : '';
  const eventInfo = state?.eventInfo;
  const ticketSummary = state?.orderItems || [];

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <EventDetailsNavbar />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF4000]"></div>
          <p className="text-[#4F4F4F] text-sm">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <EventDetailsNavbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 7v8M14 19v2" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </div>
          <h2 className="text-xl font-bold text-black mb-2">Order Failed</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Navbar */}
      <EventDetailsNavbar />

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Icon - Modern elegant design */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Outer soft glow ring */}
            <div className="absolute inset-0 w-14 h-14 bg-[#34A853]/10 rounded-full blur-sm"></div>
            {/* Main circle with gradient effect */}
            <div className="relative w-14 h-14 bg-gradient-to-br from-[#4ADE80] to-[#22C55E] rounded-full flex items-center justify-center shadow-lg shadow-[#34A853]/20">
              {/* Inner subtle ring */}
              <div className="absolute inset-1 rounded-full border border-white/20"></div>
              {/* Checkmark icon */}
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                <path 
                  d="M8 16L14 22L24 10" 
                  stroke="white" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <h1 className="text-2xl font-bold text-black text-center mb-2">
          Thank You for Your Purchase!
        </h1>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <p className="text-base text-[#4F4F4F] text-center">
            Your tickets are confirmed and sent to {orderEmail}
          </p>
          <button className="text-[#4F4F4F] hover:text-[#FF4000] transition-colors cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path 
                d="M13.5 2.25L15.75 4.5M15.75 4.5L13.5 6.75M15.75 4.5H6C4.75736 4.5 3.75 5.50736 3.75 6.75V7.5M4.5 15.75L2.25 13.5M2.25 13.5L4.5 11.25M2.25 13.5H12C13.2426 13.5 14.25 12.4926 14.25 11.25V10.5" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <p className="text-base text-[#4F4F4F] text-center mb-6">
          Your order ID <span className="font-semibold text-black">{orderId}</span>
        </p>

        {/* Go to My Tickets Button */}
        <div className="flex justify-center mb-10">
          <button 
            onClick={() => navigate('/dashboard-attendee')}
            className="relative flex items-center justify-between pl-6 pr-1.5 py-1.5 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors cursor-pointer min-w-[220px]"
          >
            <span className="text-sm">Go to My Tickets</span>
            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center ml-4">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path 
                  d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" 
                  stroke="#FF4000" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl p-6 mb-10 border border-[#EEEEEE]">
          {/* You are going to */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-black">You are going to</span>
              <div className="flex-1 h-px bg-[#EEEEEE]"></div>
            </div>
            
            <div className="flex gap-4">
              <img 
                src={eventInfo?.image || EventImageFallback} 
                alt={eventInfo?.title || 'Event'}
                className="w-24 h-20 object-cover rounded-lg shrink-0"
              />
              <div>
                <h3 className="text-base font-bold text-black mb-1">
                  {eventInfo?.title || 'Event'}
                </h3>
                <p className="text-sm text-[#757575] mb-1">
                  {eventInfo?.date} • {eventInfo?.time}
                </p>
                <p className="text-sm text-[#757575]">
                  {eventInfo?.venue}{eventInfo?.location ? ` • ${eventInfo.location}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Your tickets */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-black">Your tickets</span>
              <div className="flex-1 h-px bg-[#EEEEEE]"></div>
            </div>
            
            <div className="flex gap-8">
              {ticketSummary.map((ticket, index) => (
                <div key={index}>
                  <p className="text-sm text-[#757575]">{ticket.name}</p>
                  <p className="text-sm font-semibold text-black">
                    {ticket.quantity} {ticket.quantity === 1 ? 'Ticket' : 'Tickets'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* You might also enjoy */}
        <div>
          <h2 className="text-lg font-bold text-black mb-4">You might also enjoy</h2>
          
          <div className="space-y-4">
            {displayedRecommended.map((event) => (
              <div 
                key={event.id}
                onClick={() => navigate(`/event/${event.id}`)}
                className="flex gap-4 p-4 bg-white border border-[#EEEEEE] rounded-xl hover:shadow-md transition-shadow cursor-pointer"
              >
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-[140px] h-[95px] object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-black mb-2 line-clamp-1">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-[#757575] mb-2">
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-black">from {event.price}</span>
                    {event.badge && (
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        event.badgeColor === 'orange' 
                          ? 'text-[#FF4000] bg-[#FFF4F3]' 
                          : 'text-[#00A3FF] bg-[#E6F7FF]'
                      }`}>
                        {event.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load More Button */}
        {!showAllEvents && (
          <div className="flex justify-center mt-8">
            <button 
              onClick={() => setShowAllEvents(true)}
              className="relative flex items-center justify-between pl-6 pr-1.5 py-1.5 bg-black text-white rounded-full hover:bg-[#333333] transition-colors cursor-pointer min-w-[180px]"
            >
              <span className="text-sm font-medium">Load More</span>
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center ml-4">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path 
                    d="M8 3V13M8 13L4 9M8 13L12 9" 
                    stroke="black" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseConfirmation;
