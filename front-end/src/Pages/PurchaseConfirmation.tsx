import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventDetailsNavbar from '../components/EventDetailsNavbar';

// Import event images
import EventImage from '../assets/imges/event myticket 1.jpg';
import Event2 from '../assets/imges/event myticket 2.jpg';
import Event3 from '../assets/imges/event myticket 3.jpg';
import Event4 from '../assets/imges/event myticket 5.jpg';

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

const PurchaseConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [showAllEvents, setShowAllEvents] = useState(false);

  // Mock data - in real app this would come from state/context/API
  const orderData = {
    orderId: '#4532',
    email: 'username@gmail.com',
    event: {
      title: 'Rhythm & Beats Music Festival',
      date: 'Saturday, April 20, 2025',
      time: '3:00 PM – 11:00 PM',
      venue: 'Sunset Grove Park',
      location: 'California, USA',
      image: EventImage,
    },
    tickets: [
      { type: 'General Admission', quantity: 2 },
      { type: 'Early Bird Ticket', quantity: 2 },
      { type: 'VIP Ticket', quantity: 1 },
    ],
  };

  const allRecommendedEvents: RecommendedEvent[] = [
    {
      id: '2',
      image: Event2,
      title: "New York's Best Croissant - The 2025 Finale",
      date: 'Apr 20',
      venue: 'ABC Cooking School',
      price: '$65.99',
      badge: 'Sales end soon',
      badgeColor: 'orange',
    },
    {
      id: '3',
      image: Event3,
      title: 'Epic Esports Championship',
      date: 'Apr 20',
      venue: 'Mercedes-Benz Arena',
      price: '$65.99',
      badge: 'Almost full',
      badgeColor: 'blue',
    },
    {
      id: '4',
      image: Event4,
      title: 'Global Tech Innovators Summit 2025',
      date: 'Apr 20',
      venue: 'Marina Convention Center',
      price: '$65.99',
      badge: 'Only few left',
      badgeColor: 'orange',
    },
    {
      id: '5',
      image: Event2,
      title: 'Summer Jazz & Blues Festival',
      date: 'May 15',
      venue: 'Riverside Amphitheater',
      price: '$45.99',
    },
    {
      id: '6',
      image: Event3,
      title: 'Modern Art Exhibition 2025',
      date: 'May 22',
      venue: 'Contemporary Art Museum',
      price: '$35.99',
      badge: 'Almost full',
      badgeColor: 'blue',
    },
    {
      id: '7',
      image: Event4,
      title: 'Street Food Festival',
      date: 'Jun 5',
      venue: 'Downtown Plaza',
      price: '$25.99',
      badge: 'Sales end soon',
      badgeColor: 'orange',
    },
  ];

  const recommendedEvents = showAllEvents ? allRecommendedEvents : allRecommendedEvents.slice(0, 3);

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
            Your tickets are confirmed and sent to {orderData.email}
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
          Your order ID <span className="font-semibold text-black">{orderData.orderId}</span>
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
                src={orderData.event.image} 
                alt={orderData.event.title}
                className="w-24 h-20 object-cover rounded-lg shrink-0"
              />
              <div>
                <h3 className="text-base font-bold text-black mb-1">
                  {orderData.event.title}
                </h3>
                <p className="text-sm text-[#757575] mb-1">
                  {orderData.event.date} • {orderData.event.time}
                </p>
                <p className="text-sm text-[#757575]">
                  {orderData.event.venue} • {orderData.event.location}
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
              {orderData.tickets.map((ticket, index) => (
                <div key={index}>
                  <p className="text-sm text-[#757575]">{ticket.type}</p>
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
            {recommendedEvents.map((event) => (
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
