import { useState } from 'react';
import GoBackIcon from '../assets/Svgs/goBack.svg';
import ShowDetailsIcon from '../assets/Svgs/showDetails.svg';
import ShowLessIcon from '../assets/Svgs/showLess.svg';
import InfoIcon from '../assets/Svgs/info.svg';
import RefundPolicyIcon from '../assets/Svgs/refundPolicy.svg';
import NextStepIcon from '../assets/Svgs/nextStep.svg';

// Type pour les tickets individuels
interface TicketDetail {
  id: string;
  attendeeName: string;
  ticketType: string;
  ticketNumber: string;
  ticketId: string;
  status: string;
  qrCode: string; // URL du QR code
}

// Type pour les informations de l'événement
interface EventDetailsProps {
  eventId: string;
  eventImage: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventLocation: string;
  tickets: TicketDetail[];
  orderId: string;
  purchaseDate: string;
  refundPolicy: string;
  refundDays: number;
  organizerName: string;
  organizerLogo: string;
  onGoBack: () => void;
}

const EventDetails = ({
  eventImage,
  eventTitle,
  eventDate,
  eventTime,
  eventVenue,
  eventLocation,
  tickets,
  orderId,
  purchaseDate,
  refundPolicy,
  refundDays,
  organizerName,
  organizerLogo,
  onGoBack,
}: EventDetailsProps) => {
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());
  const [currentQRIndex, setCurrentQRIndex] = useState(0);

  const toggleTicketExpansion = (ticketId: string) => {
    const newExpanded = new Set(expandedTickets);
    if (newExpanded.has(ticketId)) {
      newExpanded.delete(ticketId);
    } else {
      newExpanded.add(ticketId);
    }
    setExpandedTickets(newExpanded);
  };

  const handlePrevQR = () => {
    setCurrentQRIndex((prev) => (prev > 0 ? prev - 1 : tickets.length - 1));
  };

  const handleNextQR = () => {
    setCurrentQRIndex((prev) => (prev < tickets.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full">
      {/* Go Back Button */}
      <button
        onClick={onGoBack}
        className="flex items-center gap-2 mb-6 text-sm font-medium text-[#4F4F4F] hover:text-[#FF4000] transition-colors cursor-pointer"
      >
        <img src={GoBackIcon} alt="Go Back" className="w-6 h-6" />
        <span>Go Back</span>
      </button>

      {/* Main Content Grid: Left (Event Info) + Right (QR Code) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        {/* Left Column: Event Details & Tickets */}
        <div className="space-y-6">
          {/* Event Image & Info Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            {/* Event Image */}
            <div className="relative h-[300px] overflow-hidden">
              <img
                src={eventImage}
                alt={eventTitle}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Event Info */}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-black mb-4">{eventTitle}</h1>
              
              {/* Date & Time */}
              <div className="flex items-start gap-3 mb-3">
                <div className="text-sm text-[#4F4F4F]">
                  <p className="font-semibold text-black">Date & Time</p>
                  <p>{eventDate} | {eventTime}</p>
                </div>
              </div>

              {/* Venue & Location */}
              <div className="flex items-start gap-3">
                <div className="text-sm text-[#4F4F4F]">
                  <p className="font-semibold text-black">Venue</p>
                  <p>{eventVenue} | {eventLocation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* All Tickets Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-black mb-4">All Tickets</h2>

            {/* Tickets List */}
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border border-[#EEEEEE] rounded-lg overflow-hidden"
                >
                  {/* Ticket Header - Always Visible */}
                  <div className="flex items-center justify-between p-4 bg-white">
                    <div className="flex items-center gap-4">
                      {/* QR Code Thumbnail */}
                      <div className="w-16 h-16 bg-white border border-[#EEEEEE] rounded flex items-center justify-center">
                        <img
                          src={ticket.qrCode}
                          alt="QR Code"
                          className="w-14 h-14"
                        />
                      </div>

                      {/* Ticket Info */}
                      <div>
                        <h3 className="text-base font-semibold text-black">
                          {ticket.ticketType} - {ticket.attendeeName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-[#4F4F4F]">
                            Ticket Type: <span className="font-medium text-black">{ticket.ticketType}</span>
                          </span>
                          <span className="text-[#BCBCBC]">•</span>
                          <span className="text-sm text-[#4F4F4F]">
                            Status: <span className={`font-medium ${ticket.status === 'Not Scanned' ? 'text-[#FF4000]' : 'text-green-600'}`}>
                              {ticket.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => toggleTicketExpansion(ticket.id)}
                      className="hover:opacity-80 hover:bg-[#F8F8F8] rounded-lg p-1 transition-all cursor-pointer"
                    >
                      <img
                        src={expandedTickets.has(ticket.id) ? ShowLessIcon : ShowDetailsIcon}
                        alt={expandedTickets.has(ticket.id) ? 'Show Less' : 'Show Details'}
                        className="w-6 h-6"
                      />
                    </button>
                  </div>

                  {/* Ticket Details - Expandable */}
                  {expandedTickets.has(ticket.id) && (
                    <div className="px-4 pb-4 pt-2 bg-[#FAFAFA] border-t border-[#EEEEEE]">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-[#4F4F4F] mb-1">Attendee Name</p>
                          <p className="text-sm font-medium text-black">{ticket.attendeeName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#4F4F4F] mb-1">Ticket Type</p>
                          <p className="text-sm font-medium text-black">{ticket.ticketType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#4F4F4F] mb-1">Ticket Number</p>
                          <p className="text-sm font-medium text-black">{ticket.ticketNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#4F4F4F] mb-1">Ticket ID</p>
                          <p className="text-sm font-medium text-black">{ticket.ticketId}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: QR Code Display */}
        <div className="space-y-4">
          {/* QR Code Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {/* Info Banner */}
            <div className="bg-[#E3F2FD] rounded-xl p-3 flex items-start gap-2 mb-6">
              <img src={InfoIcon} alt="Info" className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs text-[#1976D2] leading-relaxed">
                Use the QR code below to check in at the event
              </p>
            </div>

            {/* QR Code Display */}
            <div className="flex flex-col items-center">
              {/* Navigation dots - only show if multiple tickets */}
              {tickets.length > 1 && (
                <div className="flex gap-1.5 mb-4">
                  {tickets.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentQRIndex ? 'bg-[#FF4000]' : 'bg-[#EEEEEE]'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* QR Code Image with side navigation icons */}
              <div className="w-full flex items-center justify-center gap-4 mb-4">
                {/* Left navigation icon */}
                {tickets.length > 1 && (
                  <button
                    onClick={handlePrevQR}
                    className="shrink-0 hover:opacity-70 hover:scale-110 transition-all cursor-pointer"
                  >
                    <img src={GoBackIcon} alt="Previous" className="w-8 h-8" />
                  </button>
                )}

                {/* QR Code */}
                <div className="w-full max-w-[280px] aspect-square bg-white rounded-2xl p-4 flex items-center justify-center">
                  <img
                    src={tickets[currentQRIndex]?.qrCode}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Right navigation icon */}
                {tickets.length > 1 && (
                  <button
                    onClick={handleNextQR}
                    className="shrink-0 hover:opacity-70 hover:scale-110 transition-all cursor-pointer"
                  >
                    <img src={NextStepIcon} alt="Next" className="w-8 h-8" />
                  </button>
                )}
              </div>

              {/* Ticket Type */}
              <p className="text-base font-semibold text-black mb-6">
                {tickets[currentQRIndex]?.ticketType}
              </p>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <button className="w-full py-3.5 bg-black text-white text-sm font-semibold rounded-full hover:bg-[#333] transition-colors cursor-pointer">
                  Download Ticket
                </button>
                <button className="w-full py-3.5 bg-white text-black text-sm font-semibold rounded-full border border-black hover:bg-[#F8F8F8] transition-colors cursor-pointer">
                  Cancel Order
                </button>
              </div>
            </div>
          </div>

          {/* Refund Policy Card */}
          <div className="bg-[#E3F2FD] rounded-2xl p-4 flex items-start gap-3">
            <img src={RefundPolicyIcon} alt="Refund Policy" className="w-10 h-10 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-black mb-0.5">Refund Policy</h3>
              <p className="text-xs text-[#4F4F4F]">{refundDays} days before event</p>
            </div>
          </div>

          {/* Event Organizer Card */}
          <div className="bg-[#E3F2FD] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <img src={organizerLogo} alt={organizerName} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1">
                <p className="text-xs text-[#4F4F4F] mb-0.5">Event Organizer</p>
                <p className="text-sm font-bold text-black">{organizerName}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button className="px-6 py-2 text-sm font-semibold text-black bg-white rounded-full border border-black hover:bg-[#F8F8F8] hover:border-[#FF4000] hover:text-[#FF4000] transition-colors cursor-pointer">
                Contact Organizer
              </button>
              <button className="flex items-center gap-1 text-sm font-semibold text-black hover:text-[#FF4000] transition-colors cursor-pointer">
                More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#4F4F4F] font-medium">Order ID #{orderId}</span>
              <span className="text-[#4F4F4F] font-medium">Purchased on {purchaseDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
