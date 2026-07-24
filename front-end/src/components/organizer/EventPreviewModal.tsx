import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatters';
import NextImageIcon from '../../assets/Svgs/eventDetails/nextImage.svg';
import PastImageIcon from '../../assets/Svgs/eventDetails/pastImage.svg';
import StarIcon from '../../assets/Svgs/eventDetails/star.svg';
import FavoriteIcon from '../../assets/Svgs/eventDetails/favorie.svg';
import UploadIcon from '../../assets/Svgs/eventDetails/upload.svg';

interface EventPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: {
    title: string;
    description: string;
    category: string;
    eventType: 'in-person' | 'online' | 'hybrid' | '';
    dateRange: [Date | null, Date | null];
    startTime: string;
    endTime: string;
    country: string;
    state: string;
    mapAddress: string;
    onlineLink: string;
    eventImages: Array<{ file: File; preview: string; id: string }>;
    tickets: Array<{
      id: string;
      type: string;
      priceType: 'free' | 'paid' | '';
      price: string;
      quantity: string;
    }>;
    faqs: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
    visibility: 'public' | 'private';
  };
}

const localeMap: Record<string, string> = { en: 'en-US', fr: 'fr-FR', ar: 'ar-DZ' };

const EventPreviewModal = ({ isOpen, onClose, eventData }: EventPreviewModalProps) => {
  const { t, i18n } = useTranslation(['organizer', 'common']);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLocationSection, setShowLocationSection] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? eventData.eventImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === eventData.eventImages.length - 1 ? 0 : prev + 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString(localeMap[i18n.language] || 'en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const lowestPrice = eventData.tickets.reduce((min, ticket) => {
    if (ticket.priceType === 'free') return min;
    const price = parseFloat(ticket.price);
    return price < min ? price : min;
  }, Infinity);

  const displayPrice = lowestPrice === Infinity ? t('organizer:eventPreview.ticketFree') : formatCurrency(lowestPrice);
  const hasImages = eventData.eventImages.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-gray bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-black">{t('organizer:eventPreview.modalTitle')}</h2>
            <p className="text-sm text-[#757575]">{t('organizer:eventPreview.modalSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
            aria-label={t('organizer:eventPreview.closeAria')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="#181818" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {/* Image Gallery Hero Section */}
            {hasImages && (
              <div className="relative w-full max-w-[1000px] mx-auto mb-8">
                <div className="relative w-full aspect-[2.5/1] md:aspect-[2.8/1] lg:aspect-[2.2/1] rounded-2xl overflow-hidden">
                  <img
                    src={eventData.eventImages[currentImageIndex].preview}
                    alt={`${eventData.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {eventData.eventImages.length > 1 && (
                    <>
                      {/* Previous Image Button */}
                      <button
                        onClick={handlePrevImage}
                        className="absolute start-4 md:start-6 top-1/2 -translate-y-1/2 w-[50px] h-[50px] md:w-[60px] md:h-[60px] flex items-center justify-center hover:scale-105 transition-transform z-10"
                        aria-label={t('organizer:eventPreview.prevImageAria')}
                      >
                        <img src={PastImageIcon} alt="Previous" className="w-full h-full" />
                      </button>

                      {/* Next Image Button */}
                      <button
                        onClick={handleNextImage}
                        className="absolute end-4 md:end-6 top-1/2 -translate-y-1/2 w-[50px] h-[50px] md:w-[60px] md:h-[60px] flex items-center justify-center hover:scale-105 transition-transform z-10"
                        aria-label={t('organizer:eventPreview.nextImageAria')}
                      >
                        <img src={NextImageIcon} alt="Next" className="w-full h-full" />
                      </button>

                      {/* Image Dots Indicator */}
                      <div className="absolute bottom-4 start-1/2 -translate-x-1/2 flex items-center gap-2">
                        {eventData.eventImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToImage(index)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                              index === currentImageIndex
                                ? 'bg-white w-3 h-3'
                                : 'bg-white/60 hover:bg-white/80'
                            }`}
                            aria-label={t('organizer:eventPreview.goToImageAria', { number: index + 1 })}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Event Details Section */}
            <div className="w-full max-w-[1000px] mx-auto">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 lg:gap-12">
                {/* Left Column - Event Info */}
                <div className="flex-1">
                  {/* Title */}
                  <h1 className="text-2xl md:text-3xl font-bold text-black mb-3">
                    {eventData.title || t('organizer:eventPreview.untitledEvent')}
                  </h1>

                  {/* Description */}
                  <p className="text-sm md:text-base text-gray leading-relaxed mb-4 max-w-[650px]">
                    {eventData.description || t('organizer:eventPreview.noDescription')}
                  </p>

                  {/* Rating and Actions Row */}
                  <div className="flex items-center gap-4 mb-8">
                    {/* Rating Placeholder */}
                    <div className="flex items-center gap-1.5">
                      <img src={StarIcon} alt="Rating" className="w-5 h-5" />
                      <span className="text-sm font-semibold text-black">{t('organizer:eventPreview.ratingNew')}</span>
                      <span className="text-sm text-[#757575]">• {t('organizer:eventPreview.noReviews')}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button 
                        className="hover:scale-105 transition-transform"
                        aria-label={t('organizer:eventPreview.addToFavoritesAria')}
                      >
                        <img src={FavoriteIcon} alt="Favorite" className="w-[42px] h-[42px]" />
                      </button>
                      <button 
                        className="hover:scale-105 transition-transform"
                        aria-label={t('organizer:eventPreview.shareEventAria')}
                      >
                        <img src={UploadIcon} alt="Share" className="w-[42px] h-[42px]" />
                      </button>
                    </div>
                  </div>

                  {/* Date & Time Section */}
                  <div className="mb-6">
                    <h2 className="text-base font-bold text-black mb-2">{t('organizer:eventPreview.dateTime')}</h2>
                    {eventData.dateRange[0] && eventData.dateRange[1] ? (
                      <p className="text-sm text-black">
                        {formatDate(eventData.dateRange[0])} - {formatDate(eventData.dateRange[1])}
                        {eventData.startTime && eventData.endTime && (
                          <>
                            <span className="text-[#757575] mx-2">|</span>
                            {formatTime(eventData.startTime)} – {formatTime(eventData.endTime)}
                          </>
                        )}
                      </p>
                    ) : (
                      <p className="text-sm text-[#757575]">{t('organizer:eventPreview.dateNotSet')}</p>
                    )}
                  </div>

                  {/* Location Section */}
                  {(eventData.eventType === 'in-person' || eventData.eventType === 'hybrid') && (
                    <div className="mb-6">
                      <h2 className="text-base font-bold text-black mb-2">{t('organizer:eventPreview.location')}</h2>
                      {eventData.mapAddress ? (
                        <>
                          <p className="text-sm text-black">
                            {eventData.state && eventData.country && (
                              <>
                                {eventData.state}, {eventData.country}
                                <span className="text-[#757575] mx-2">|</span>
                              </>
                            )}
                            <span className="text-gray">{eventData.mapAddress}</span>
                          </p>
                          <button 
                            onClick={() => setShowLocationSection(!showLocationSection)}
                            className="text-sm font-medium text-[#FF4000] hover:underline mt-2"
                          >
                            {showLocationSection ? t('organizer:eventPreview.closeMap') : t('organizer:eventPreview.seeOnMap')}
                          </button>

                          {/* Inline Map Section */}
                          {showLocationSection && (
                            <div className="mt-4 bg-white border border-light-gray rounded-2xl overflow-hidden">
                              <div className="relative w-full h-[400px]">
                                <iframe
                                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(eventData.mapAddress)}&zoom=15`}
                                  width="100%"
                                  height="100%"
                                  style={{ border: 0 }}
                                  allowFullScreen
                                  loading="lazy"
                                  referrerPolicy="no-referrer-when-downgrade"
                                  title={t('organizer:eventPreview.mapTitle')}
                                  className="absolute inset-0"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-[#757575]">{t('organizer:eventPreview.locationNotSet')}</p>
                      )}
                    </div>
                  )}

                  {/* Online Link Section */}
                  {(eventData.eventType === 'online' || eventData.eventType === 'hybrid') && eventData.onlineLink && (
                    <div className="mb-6">
                      <h2 className="text-base font-bold text-black mb-2">{t('organizer:eventPreview.onlineAccess')}</h2>
                      <a 
                        href={eventData.onlineLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#FF4000] hover:underline break-all"
                      >
                        {eventData.onlineLink}
                      </a>
                    </div>
                  )}

                  {/* Category Section */}
                  {eventData.category && (
                    <div className="mb-6">
                      <h2 className="text-base font-bold text-black mb-2">{t('organizer:eventPreview.category')}</h2>
                      <span className="inline-block px-3 py-1.5 bg-[#F5F5F5] text-sm text-black rounded-full">
                        {eventData.category}
                      </span>
                    </div>
                  )}

                  {/* Tickets Section */}
                  {eventData.tickets.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-base font-bold text-black mb-3">{t('organizer:eventPreview.availableTickets')}</h2>
                      <div className="space-y-3">
                        {eventData.tickets.map((ticket) => (
                          <div key={ticket.id} className="flex items-center justify-between p-4 bg-secondary-light rounded-lg">
                            <div>
                              <h3 className="text-sm font-semibold text-black">{ticket.type}</h3>
                              <p className="text-xs text-[#757575] mt-1">
                                {ticket.quantity ? t('organizer:eventPreview.ticketQuantityAvailable', { quantity: ticket.quantity }) : t('organizer:eventPreview.ticketQuantityNotSet')}
                              </p>
                            </div>
                            <div className="text-end">
                              <p className="text-base font-bold text-black">
                                {ticket.priceType === 'free' ? t('organizer:eventPreview.ticketFree') : formatCurrency(parseFloat(ticket.price || '0'))}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FAQ Section */}
                  {eventData.faqs.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-base font-bold text-black mb-4">{t('organizer:eventPreview.faqTitle')}</h2>
                      <div className="space-y-3">
                        {eventData.faqs.map((faq, index) => (
                          <div key={faq.id} className="bg-secondary-light rounded-lg overflow-hidden">
                            <button 
                              onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                              className="w-full flex items-center justify-between px-5 py-4 text-start"
                            >
                              <span className="text-sm font-semibold text-black">{faq.question}</span>
                              <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 16 16" 
                                fill="none" 
                                className={`shrink-0 ms-4 transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`}
                              >
                                <path d="M4 6L8 10L12 6" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            {openFaqIndex === index && (
                              <div className="px-5 pb-4 pt-2 text-sm text-gray leading-relaxed">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Price and CTA */}
                <div className="lg:w-[280px] flex flex-col items-start lg:items-end gap-4 lg:sticky lg:top-6 lg:self-start">
                  {/* Price Display */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-[#757575]">{t('organizer:eventPreview.fromPrice')}</span>
                    <span className="text-2xl md:text-3xl font-bold text-black">{displayPrice}</span>
                  </div>

                  {/* Get Tickets Button */}
                  <button 
                    className="w-full lg:w-auto px-10 py-3 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors text-base"
                  >
                    {t('organizer:eventPreview.getTickets')}
                  </button>

                  {/* Visibility Badge */}
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1.5 text-xs font-medium rounded-full ${
                      eventData.visibility === 'public' 
                        ? 'bg-[#E6F7FF] text-[#00A3FF]' 
                        : 'bg-primary-light text-primary'
                    }`}>
                      {eventData.visibility === 'public' ? t('organizer:eventPreview.visibilityPublic') : t('organizer:eventPreview.visibilityPrivate')}
                    </span>
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

export default EventPreviewModal;
