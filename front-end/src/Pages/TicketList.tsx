import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventDetailsNavbar from '../components/EventDetailsNavbar';

// Import SVG icons
import GeneralAdmissionIcon from '../assets/Svgs/eventDetails/generalAdmission.svg';
import VipTicketIcon from '../assets/Svgs/eventDetails/vipTicket.svg';
import EarlyBirdTicketIcon from '../assets/Svgs/eventDetails/earlyBridTicket.svg';

// Import event image (using same as EventDetailsGlobal)
import EventImage from '../assets/imges/event myticket 1.jpg';

interface TicketType {
  id: string;
  name: string;
  price: number;
  icon: string;
  features: string[];
  badge?: string;
  badgeColor?: string;
  quantity: number;
}

const TicketList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const [tickets, setTickets] = useState<TicketType[]>([
    {
      id: 'general',
      name: 'General Admission',
      price: 49.99,
      icon: GeneralAdmissionIcon,
      features: [
        'Full access to the festival grounds',
        'Entry to all general zones and performances',
        'Access to food trucks, bars, and merch stalls',
        'Festival wristband and welcome guide'
      ],
      quantity: 2
    },
    {
      id: 'vip',
      name: 'VIP Ticket',
      price: 119.99,
      icon: VipTicketIcon,
      features: [
        'Front-stage access with premium viewing',
        'Dedicated VIP entry lane (skip the lines)',
        'Meet & greet opportunity with featured artists',
        'Complimentary drink + festival swag bag',
        'Access to VIP lounge and restrooms'
      ],
      badge: 'Only few left',
      badgeColor: 'orange',
      quantity: 1
    },
    {
      id: 'earlybird',
      name: 'Early Bird Ticket',
      price: 39.99,
      icon: EarlyBirdTicketIcon,
      features: [
        'Full general admission access',
        'Access to food and drink vendors',
        'Entry to all performances and festival areas'
      ],
      quantity: 2
    }
  ]);

  const serviceCharge = 20.00;

  const updateQuantity = (ticketId: string, change: number) => {
    setTickets(tickets.map(ticket => {
      if (ticket.id === ticketId) {
        const newQuantity = Math.max(0, ticket.quantity + change);
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

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Navbar */}
      <EventDetailsNavbar />

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
                        onClick={() => updateQuantity(ticket.id, -1)}
                        disabled={ticket.quantity === 0}
                        className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors ${
                          ticket.quantity === 0 
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
                        onClick={() => updateQuantity(ticket.id, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-[#333333] transition-colors cursor-pointer"
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
                  src={EventImage} 
                  alt="Rhythm & Beats Music Festival" 
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-black mb-1 line-clamp-2">
                    Rhythm & Beats Music Festival
                  </h3>
                  <p className="text-xs text-[#757575] mb-1">
                    Saturday, April 20, 2025 • 3:00 PM - 11:00 PM
                  </p>
                  <p className="text-xs text-[#757575]">
                    Sunset Grove Park • California, USA
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
                onClick={() => navigate(`/event/1/tickets/confirmation`)}
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
