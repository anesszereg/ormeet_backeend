import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventDetailsNavbar from '../components/EventDetailsNavbar';
import ReviewsModal from '../components/ReviewsModal';
import eventService, { Event as ApiEvent } from '../services/eventService';
import reviewService, { Review as ApiReview } from '../services/reviewService';
import userPreferencesService from '../services/userPreferencesService';

import NextImageIcon from '../assets/Svgs/eventDetails/nextImage.svg';
import PastImageIcon from '../assets/Svgs/eventDetails/pastImage.svg';
import StarIcon from '../assets/Svgs/eventDetails/star.svg';
import FavoriteIcon from '../assets/Svgs/eventDetails/favorie.svg';
import UploadIcon from '../assets/Svgs/eventDetails/upload.svg';
import AgePlusIcon from '../assets/Svgs/eventDetails/18-plus.svg';
import EntryPolicyIcon from '../assets/Svgs/eventDetails/entryPolicy.svg';
import AccessibilityIcon from '../assets/Svgs/eventDetails/accessibilty.svg';
import RefundPolicyIcon from '../assets/Svgs/eventDetails/refundPolicy.svg';
import ProhibitedItemsIcon from '../assets/Svgs/eventDetails/prohibitedItems.svg';
import AllowedItemsIcon from '../assets/Svgs/eventDetails/allowedItems.svg';
import NoIcon from '../assets/Svgs/eventDetails/no.svg';
import YesIcon from '../assets/Svgs/eventDetails/yes.svg';
import AllReviewsIcon from '../assets/Svgs/eventDetails/allReviews.svg';
import KeepMeUpdateIcon from '../assets/Svgs/eventDetails/keepMeUpdate.svg';

import Event1 from '../assets/imges/event myticket 1.jpg';
import Event2 from '../assets/imges/event myticket 2.jpg';
import Event3 from '../assets/imges/event myticket 3.jpg';
import Event4 from '../assets/imges/event myticket 5.jpg';
import Event5 from '../assets/imges/event myticket 6.jpg';

// Fallback images for when API images are missing
const fallbackImages = [Event1, Event2, Event3, Event4, Event5];

interface EventData {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: string;
  rating: number;
  reviewCount: string;
  views: number;
  favorites: number;
  badge: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  organizerId: string;
  organizerName: string;
  organizerWebsite: string;
  organizerEmail: string;
  capacity: number;
  allowReentry: boolean;
  refundsAllowed: boolean;
  ageLimit: number | null;
  guidelines?: ApiEvent['guidelines'];
}

interface ReviewItem {
  id: number | string;
  name: string;
  avatar: string;
  date: string;
  rating: number;
  comment: string;
}

interface TrendingEventItem {
  id: string;
  title: string;
  price: string;
  badge: string | null;
  badgeColor: string | null;
  image: string;
}

const EventDetailsGlobal = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user } = useAuth();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDateTimeSection, setShowDateTimeSection] = useState(false);
  const [showLocationSection, setShowLocationSection] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number>(17);
  const [selectedMonth, setSelectedMonth] = useState<number>(4);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('6:30 PM – 7:30 PM');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [trendingPage, setTrendingPage] = useState<number>(1);

  // API-driven state
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [allReviews, setAllReviews] = useState<ReviewItem[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<TrendingEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      setIsLoading(true);
      setError(null);
      try {
        const [event, reviews, avgRating, allEvents] = await Promise.all([
          eventService.getEventById(eventId),
          reviewService.getByEvent(eventId).catch(() => [] as ApiReview[]),
          reviewService.getEventAverageRating(eventId).catch(() => ({ average: 0, count: 0 })),
          eventService.getAllEvents({ status: 'published' }).catch(() => [] as ApiEvent[]),
        ]);
        console.log('📦 Event data from API:', event);
        console.log('⭐ Reviews:', reviews);
        console.log('📊 Average rating:', avgRating);

        // Build event data
        const startDate = new Date(event.startAt);
        const endDate = new Date(event.endAt);
        const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = `${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} – ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        const lowestPrice = event.ticketTypes?.reduce((min, tt) => Math.min(min, Number(tt.price)), Infinity) ?? 0;
        const venueAddress = event.customLocation
          ? `${event.customLocation.address}, ${event.customLocation.city}, ${event.customLocation.state} ${event.customLocation.zipCode}, ${event.customLocation.country}`
          : event.venue
          ? `${event.venue.address}, ${event.venue.city}, ${event.venue.country}`
          : '';

        setEventData({
          id: event.id,
          title: event.title,
          description: event.longDescription || event.shortDescription || '',
          images: event.images && event.images.length > 0 ? event.images : fallbackImages,
          price: lowestPrice === Infinity || lowestPrice === 0 ? 'Free' : `$${lowestPrice.toFixed(2)}`,
          rating: avgRating.average || 0,
          reviewCount: avgRating.count > 1000 ? `${(avgRating.count / 1000).toFixed(1)}K` : String(avgRating.count || 0),
          views: event.views || 0,
          favorites: event.favorites || 0,
          badge: event.status === 'published' ? 'Trending' : '',
          date: dateStr,
          time: timeStr,
          venue: event.venue?.name || event.customLocation?.city || 'TBA',
          address: venueAddress,
          organizerId: event.organizerId || '',
          organizerName: event.organizer?.name || '',
          organizerWebsite: '',
          organizerEmail: '',
          capacity: event.capacity || 0,
          allowReentry: event.allowReentry || false,
          refundsAllowed: event.refundsAllowed || false,
          ageLimit: event.ageLimit ?? null,
          guidelines: event.guidelines,
        });

        // Initialize calendar to event start date
        setSelectedMonth(startDate.getMonth() + 1);
        setSelectedYear(startDate.getFullYear());
        setSelectedDate(startDate.getDate());

        // Map reviews
        const mappedReviews: ReviewItem[] = reviews.map((r: ApiReview, i: number) => ({
          id: r.id || i + 1,
          name: r.user?.name || 'Anonymous',
          avatar: r.user?.profilePhoto || `https://i.pravatar.cc/40?img=${(i % 70) + 1}`,
          date: new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          rating: r.rating,
          comment: r.comment || '',
        }));
        setAllReviews(mappedReviews);

        // Map trending events (similar category, excluding current)
        const trending: TrendingEventItem[] = allEvents
          .filter((e: ApiEvent) => e.id !== eventId)
          .slice(0, 10)
          .map((e: ApiEvent, i: number) => {
            const ePrice = e.ticketTypes?.[0] ? `$${Number(e.ticketTypes[0].price).toFixed(2)}` : 'Free';
            return {
              id: e.id,
              title: e.title,
              price: ePrice,
              badge: null,
              badgeColor: null,
              image: e.images?.[0] || fallbackImages[i % fallbackImages.length],
            };
          });
        setTrendingEvents(trending);

        // Check if event is favorited and if organizer is followed
        if (user) {
          try {
            const [favoriteStatus, followStatus] = await Promise.all([
              userPreferencesService.isFavoriteEvent(event.id),
              event.organizerId ? userPreferencesService.isFollowingOrganizer(event.organizerId) : Promise.resolve(false),
            ]);
            setIsFavorite(favoriteStatus);
            setIsFollowing(followStatus);
          } catch (err) {
            console.error('Failed to check favorite/follow status:', err);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch event:', err);
        setError(err.response?.data?.message || 'Event not found');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventData();
  }, [eventId, user]);

  const cardsPerPage = 5;
  const totalPages = Math.ceil(trendingEvents.length / cardsPerPage);
  const startIndex = (trendingPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentTrendingEvents = trendingEvents.slice(startIndex, endIndex);

  const handleTrendingPrev = () => {
    setTrendingPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleTrendingNext = () => {
    setTrendingPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  const images = eventData?.images || fallbackImages;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    setSelectedDate(day);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Please login to add events to favorites');
      return;
    }
    if (!eventId) return;

    setIsTogglingFavorite(true);
    try {
      if (isFavorite) {
        await userPreferencesService.removeFavoriteEvent(eventId);
        setIsFavorite(false);
        console.log('✅ Removed from favorites');
      } else {
        await userPreferencesService.addFavoriteEvent(eventId);
        setIsFavorite(true);
        console.log('✅ Added to favorites');
      }
    } catch (err: any) {
      console.error('❌ Failed to toggle favorite:', err);
      alert(err.response?.data?.message || 'Failed to update favorites');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      alert('Please login to follow organizers');
      return;
    }
    if (!eventData?.organizerId) return;

    const organizerId = eventData.organizerId;
    
    setIsTogglingFollow(true);
    try {
      if (isFollowing) {
        await userPreferencesService.unfollowOrganizer(organizerId);
        setIsFollowing(false);
        console.log('✅ Unfollowed organizer');
      } else {
        await userPreferencesService.followOrganizer(organizerId);
        setIsFollowing(true);
        console.log('✅ Following organizer');
      }
    } catch (err: any) {
      console.error('❌ Failed to toggle follow:', err);
      alert(err.response?.data?.message || 'Failed to update following status');
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const renderCalendarDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    const days = [];
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDayOfMonth + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const isSelected = isValidDay && dayNumber === selectedDate;

      days.push(
        <button
          key={i}
          onClick={() => isValidDay && handleDateSelect(dayNumber)}
          disabled={!isValidDay}
          className={`h-10 flex items-center justify-center text-sm font-medium rounded-full transition-colors cursor-pointer ${
            isSelected
              ? 'bg-[#FF4000] text-white'
              : isValidDay
              ? 'text-black hover:bg-[#F5F5F5]'
              : 'text-transparent cursor-default'
          }`}
        >
          {isValidDay ? dayNumber : ''}
        </button>
      );
    }

    return days;
  };

  const timeSlots = ['6:30 PM – 7:30 PM', '8:30 PM – 9:30 PM'];

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-white">
        <EventDetailsNavbar isLoggedIn={!!user} />
        <div className="flex items-center justify-center flex-1 py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF4000]"></div>
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-white">
        <EventDetailsNavbar isLoggedIn={!!user} />
        <div className="flex flex-col items-center justify-center flex-1 py-20">
          <p className="text-red-500 mb-4">{error || 'Event not found'}</p>
          <button onClick={() => navigate(-1)} className="text-[#FF4000] font-semibold hover:underline">Go Back</button>
        </div>
      </div>
    );
  }


  console.log('✅ Mapped event data:', eventData);
  
  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      {/* Navbar */}
      <EventDetailsNavbar isLoggedIn={!!user} />

      {/* Main Content */}
      <main className="flex-1 px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-6">
        {/* Image Gallery Hero Section */}
        <div className="relative w-full max-w-[1200px] mx-auto mb-8">
          {/* Main Image Container */}
          <div className="relative w-full aspect-[2.5/1] md:aspect-[2.8/1] lg:aspect-[2.2/1] rounded-2xl overflow-hidden">
            <img
              src={images[currentImageIndex]}
              alt={`${eventData.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Previous Image Button */}
            <button
              onClick={handlePrevImage}
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-[50px] h-[50px] md:w-[60px] md:h-[60px] flex items-center justify-center hover:scale-105 transition-transform z-10 cursor-pointer"
              aria-label="Previous image"
            >
              <img src={PastImageIcon} alt="Previous" className="w-full h-full" />
            </button>

            {/* Next Image Button */}
            <button
              onClick={handleNextImage}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-[50px] h-[50px] md:w-[60px] md:h-[60px] flex items-center justify-center hover:scale-105 transition-transform z-10 cursor-pointer"
              aria-label="Next image"
            >
              <img src={NextImageIcon} alt="Next" className="w-full h-full" />
            </button>

            {/* Image Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    index === currentImageIndex
                      ? 'bg-white w-3 h-3'
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Event Details Section */}
        <div className="w-full max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 lg:gap-12">
            {/* Left Column - Event Info */}
            <div className="flex-1">
              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-3">
                {eventData.title}
              </h1>

              {/* Description */}
              <p className="text-sm md:text-base text-[#4F4F4F] leading-relaxed mb-4 max-w-[650px]">
                {eventData.description}
              </p>

              {/* Rating and Actions Row */}
              <div className="flex items-center gap-4 mb-8">
                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <img src={StarIcon} alt="Rating" className="w-5 h-5" />
                  <span className="text-sm font-semibold text-black">{eventData.rating.toFixed(1)}</span>
                  <span className="text-sm text-[#757575]">• {eventData.reviewCount} reviews</span>
                </div>
                
                {/* Views */}
                <div className="flex items-center gap-1.5">
                  <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm text-[#757575]">{eventData.views.toLocaleString()} views</span>
                </div>
                
                {/* Favorites */}
                <div className="flex items-center gap-1.5">
                  <svg className="w-5 h-5 text-[#FF4000]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="text-sm text-[#757575]">{eventData.favorites.toLocaleString()} favorites</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleToggleFavorite}
                    disabled={!user || isTogglingFavorite}
                    className="hover:scale-105 transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    title={!user ? "Login to add to favorites" : (isFavorite ? "Remove from favorites" : "Add to favorites")}
                  >
                    {isFavorite ? (
                      <svg className="w-[42px] h-[42px] text-[#FF4000]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    ) : (
                      <img src={FavoriteIcon} alt="Favorite" className="w-[42px] h-[42px]" />
                    )}
                  </button>
                  <button 
                    className="hover:scale-105 transition-transform cursor-pointer"
                    aria-label="Share event"
                  >
                    <img src={UploadIcon} alt="Share" className="w-[42px] h-[42px]" />
                  </button>
                </div>
              </div>

              {/* Date & Time Section */}
              <div className="mb-6">
                <h2 className="text-base font-bold text-black mb-2">Date & Time</h2>
                <p className="text-sm text-black">
                  {eventData.date} <span className="text-[#757575] mx-2">|</span> {eventData.time}
                </p>
                <button 
                  onClick={() => setShowDateTimeSection(!showDateTimeSection)}
                  className="text-sm font-medium text-[#FF4000] hover:underline mt-2 cursor-pointer"
                >
                  {showDateTimeSection ? 'Close Calendar' : 'Change date'}
                </button>

                {/* Inline Calendar Section */}
                {showDateTimeSection && (
                  <div className="mt-4 bg-white border border-[#EEEEEE] rounded-2xl p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Calendar */}
                      <div>
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-6">
                          <button
                            onClick={handlePrevMonth}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M12.5 15L7.5 10L12.5 5" stroke="#181818" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-semibold text-black">{monthNames[selectedMonth - 1]} {selectedYear}</span>
                            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white cursor-pointer">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 4V12M4 8H12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </div>
                          <button
                            onClick={handleNextMonth}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M7.5 15L12.5 10L7.5 5" stroke="#181818" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>

                        {/* Calendar Grid */}
                        <div>
                          {/* Day Headers */}
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                              <div key={day} className="h-10 flex items-center justify-center text-xs font-medium text-[#757575]">
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Calendar Days */}
                          <div className="grid grid-cols-7 gap-1">
                            {renderCalendarDays()}
                          </div>
                        </div>
                      </div>

                      {/* Time Slots */}
                      <div>
                        <div className="bg-[#F8F8F8] rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-black mb-2">
                            2 times available for Tue, May 17
                          </h3>
                          <p className="text-xs text-[#757575] mb-4">
                            Please select a suitable time for your event from the options below.
                          </p>

                          {/* Time Slot Options */}
                          <div className="space-y-2">
                            {timeSlots.map((slot) => (
                              <button
                                key={slot}
                                onClick={() => handleTimeSlotSelect(slot)}
                                className={`w-full px-4 py-3 rounded-lg text-sm font-medium text-left transition-colors ${
                                  selectedTimeSlot === slot
                                    ? 'bg-white text-black border-2 border-[#FF4000]'
                                    : 'bg-white text-black hover:bg-[#EEEEEE]'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Section */}
              <div className="mb-6">
                <h2 className="text-base font-bold text-black mb-2">Location</h2>
                <p className="text-sm text-black">
                  {eventData.venue} <span className="text-[#757575] mx-2">|</span> 
                  <span className="text-[#4F4F4F]">{eventData.address}</span>
                </p>
                <button 
                  onClick={() => setShowLocationSection(!showLocationSection)}
                  className="text-sm font-medium text-[#FF4000] hover:underline mt-2 cursor-pointer"
                >
                  {showLocationSection ? 'Close map' : 'See on map'}
                </button>

                {/* Inline Map Section */}
                {showLocationSection && (
                  <div className="mt-4 bg-white border border-[#EEEEEE] rounded-2xl overflow-hidden">
                    <div className="relative w-full h-[400px] lg:h-[500px]">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3168.2!2d-122.3!3d37.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f9e6e0e0e0e0e%3A0x0!2sSunset%20Grove%20Park!5e0!3m2!1sen!2sus!4v1234567890"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Event location map"
                        className="absolute inset-0"
                      />

                      {/* Map Controls */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {/* Fullscreen button */}
                        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-[#F8F8F8] transition-colors">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M2.5 7.5V2.5H7.5M12.5 2.5H17.5V7.5M17.5 12.5V17.5H12.5M7.5 17.5H2.5V12.5" stroke="#4F4F4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>

                        {/* Zoom in */}
                        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-[#F8F8F8] transition-colors">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 5V15M5 10H15" stroke="#4F4F4F" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>

                        {/* Zoom out */}
                        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-[#F8F8F8] transition-colors">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M5 10H15" stroke="#4F4F4F" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>

                        {/* My location */}
                        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-[#F8F8F8] transition-colors">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="3" fill="#4F4F4F"/>
                            <path d="M10 2V5M10 15V18M18 10H15M5 10H2" stroke="#4F4F4F" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Event Rules & Guidelines Section */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-black mb-6">Event rules & guidelines</h2>

                {/* Age Requirement */}
                <div className="flex gap-3 mb-5">
                  <img src={AgePlusIcon} alt="Age requirement" className="w-6 h-6 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-black mb-1">Age requirement:</h3>
                    <p className="text-sm text-[#4F4F4F]">This event is exclusively for guests aged 21 and over. Valid ID required at entry.</p>
                  </div>
                </div>

                {/* Entry Policy */}
                <div className="flex gap-3 mb-5">
                  <img src={EntryPolicyIcon} alt="Entry policy" className="w-6 h-6 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-black mb-1">Entry policy:</h3>
                    <p className="text-sm text-[#4F4F4F]">Doors open at 5:00 PM. No re-entry is allowed after leaving the venue.</p>
                  </div>
                </div>

                {/* Accessibility */}
                <div className="flex gap-3 mb-5">
                  <img src={AccessibilityIcon} alt="Accessibility" className="w-6 h-6 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-black mb-1">Accessibility:</h3>
                    <p className="text-sm text-[#4F4F4F]">The venue is wheelchair accessible. Please contact the organizer in advance for specific accommodations.</p>
                  </div>
                </div>

                {/* Refund Policy */}
                <div className="flex gap-3 mb-5">
                  <img src={RefundPolicyIcon} alt="Refund policy" className="w-6 h-6 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-black mb-1">Refund policy:</h3>
                    <p className="text-sm text-[#4F4F4F]">All ticket sales are final. Refunds are only issued if the event is canceled.</p>
                  </div>
                </div>

                {/* Prohibited Items */}
                <div className="flex gap-3 mb-5">
                  <img src={ProhibitedItemsIcon} alt="Prohibited items" className="w-6 h-6 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-black mb-2">Prohibited items:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <img src={NoIcon} alt="No" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="text-sm text-[#4F4F4F]">Outside food or drinks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <img src={NoIcon} alt="No" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="text-sm text-[#4F4F4F]">Weapons or sharp objects</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <img src={NoIcon} alt="No" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="text-sm text-[#4F4F4F]">Illegal substances</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <img src={NoIcon} alt="No" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="text-sm text-[#4F4F4F]">Professional cameras or video equipment</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Allowed Items */}
                <div className="flex gap-3">
                  <img src={AllowedItemsIcon} alt="Allowed items" className="w-6 h-6 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-black mb-2">Allowed items:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <img src={YesIcon} alt="Yes" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="text-sm text-[#4F4F4F]">Small bags or purses (subject to security check)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <img src={YesIcon} alt="Yes" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="text-sm text-[#4F4F4F]">Sealed water bottles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <img src={YesIcon} alt="Yes" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="text-sm text-[#4F4F4F]">Portable phone chargers</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Meet Your Organiser Section */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-black mb-4">Meet your <span className="font-bold">organiser</span></h2>
                
                <div className="bg-[#F0F8F7] rounded-2xl p-6">
                  {/* Organizer Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {/* Organizer Logo with Verified Badge */}
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center overflow-hidden">
                          <span className="text-2xl font-bold text-[#00D9FF]">P</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FF4000] rounded-full flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M4.66675 7.00004L6.41675 8.75004L9.91675 5.25004" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>

                      {/* Organizer Info */}
                      <div>
                        <h3 className="text-base font-semibold text-black mb-3">{eventData.organizerName || 'Organizer'}</h3>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-base font-bold text-black">1.6K</div>
                            <div className="text-xs text-[#4F4F4F]">Followers</div>
                          </div>
                          <div className="text-center">
                            <div className="text-base font-bold text-black">5.5K</div>
                            <div className="text-xs text-[#4F4F4F]">Attendees Hosted</div>
                          </div>
                          <div className="text-center">
                            <div className="text-base font-bold text-black">10</div>
                            <div className="text-xs text-[#4F4F4F]">Years Hosting</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleToggleFollow}
                        disabled={!user || isTogglingFollow || !eventData.organizerId}
                        className={`px-6 py-2.5 text-sm font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          isFollowing 
                            ? 'bg-white text-black border border-black hover:bg-[#F8F8F8]' 
                            : 'bg-black text-white hover:bg-[#333333]'
                        }`}
                        title={!user ? "Login to follow organizer" : (isFollowing ? "Unfollow" : "Follow")}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      {eventData.organizerEmail && (
                        <a 
                          href={`mailto:${eventData.organizerEmail}`}
                          className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full border border-black hover:bg-[#F8F8F8] transition-colors"
                        >
                          Contact
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#4F4F4F] mb-4 leading-relaxed">
                    Pulsewave Entertainment is a California-based event company known for creating high-energy music festivals and unforgettable live experiences. With a pa... <button className="text-[#4F4F4F] font-medium hover:underline cursor-pointer">See more</button>
                  </p>

                  {/* Social Links and More Details */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#D9E8E6]">
                    <div className="flex items-center gap-3">
                      {/* Facebook */}
                      <a href="#" className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M20 10C20 4.47715 15.5229 0 10 0C4.47715 0 0 4.47715 0 10C0 14.9912 3.65684 19.1283 8.4375 19.8785V12.8906H5.89844V10H8.4375V7.79688C8.4375 5.29063 9.93047 3.90625 12.2146 3.90625C13.3084 3.90625 14.4531 4.10156 14.4531 4.10156V6.5625H13.1922C11.95 6.5625 11.5625 7.3334 11.5625 8.125V10H14.3359L13.8926 12.8906H11.5625V19.8785C16.3432 19.1283 20 14.9912 20 10Z" fill="#4F4F4F"/>
                        </svg>
                      </a>
                      {/* Instagram */}
                      <a href="#" className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                          <path d="M10 1.80078C12.6719 1.80078 12.9883 1.8125 14.0391 1.85938C15.0156 1.90234 15.543 2.06641 15.8945 2.20313C16.3594 2.38281 16.6953 2.60156 17.043 2.94922C17.3945 3.30078 17.6094 3.63281 17.7891 4.09766C17.9258 4.44922 18.0898 4.98047 18.1328 5.95313C18.1797 7.00781 18.1914 7.32422 18.1914 9.99219C18.1914 12.6641 18.1797 12.9805 18.1328 14.0313C18.0898 15.0078 17.9258 15.5352 17.7891 15.8867C17.6094 16.3516 17.3906 16.6875 17.043 17.0352C16.6914 17.3867 16.3594 17.6016 15.8945 17.7813C15.543 17.918 15.0117 18.082 14.0391 18.125C12.9844 18.1719 12.668 18.1836 10 18.1836C7.32813 18.1836 7.01172 18.1719 5.96094 18.125C4.98438 18.082 4.45703 17.918 4.10547 17.7813C3.64063 17.6016 3.30469 17.3828 2.95703 17.0352C2.60547 16.6836 2.39063 16.3516 2.21094 15.8867C2.07422 15.5352 1.91016 15.0039 1.86719 14.0313C1.82031 12.9766 1.80859 12.6602 1.80859 9.99219C1.80859 7.32031 1.82031 7.00391 1.86719 5.95313C1.91016 4.97656 2.07422 4.44922 2.21094 4.09766C2.39063 3.63281 2.60938 3.29688 2.95703 2.94922C3.30859 2.59766 3.64063 2.38281 4.10547 2.20313C4.45703 2.06641 4.98828 1.90234 5.96094 1.85938C7.01172 1.8125 7.32813 1.80078 10 1.80078ZM10 0C7.28516 0 6.94531 0.0117188 5.87891 0.0585938C4.81641 0.105469 4.08594 0.277344 3.45313 0.523438C2.79297 0.78125 2.23438 1.12109 1.67969 1.67969C1.12109 2.23438 0.78125 2.79297 0.523438 3.44922C0.277344 4.08594 0.105469 4.8125 0.0585938 5.875C0.0117188 6.94531 0 7.28516 0 10C0 12.7148 0.0117188 13.0547 0.0585938 14.1211C0.105469 15.1836 0.277344 15.9141 0.523438 16.5469C0.78125 17.207 1.12109 17.7656 1.67969 18.3203C2.23438 18.875 2.79297 19.2188 3.44922 19.4727C4.08594 19.7188 4.8125 19.8906 5.875 19.9375C6.94141 19.9844 7.28125 19.9961 9.99609 19.9961C12.7109 19.9961 13.0508 19.9844 14.1172 19.9375C15.1797 19.8906 15.9102 19.7188 16.543 19.4727C17.1992 19.2188 17.7578 18.875 18.3125 18.3203C18.8672 17.7656 19.2109 17.207 19.4648 16.5508C19.7109 15.9141 19.8828 15.1875 19.9297 14.125C19.9766 13.0586 19.9883 12.7188 19.9883 10.0039C19.9883 7.28906 19.9766 6.94922 19.9297 5.88281C19.8828 4.82031 19.7109 4.08984 19.4648 3.45703C19.2188 2.79297 18.8789 2.23438 18.3203 1.67969C17.7656 1.125 17.207 0.78125 16.5508 0.527344C15.9141 0.28125 15.1875 0.109375 14.125 0.0625C13.0547 0.0117188 12.7148 0 10 0Z" fill="#4F4F4F"/>
                          <path d="M10 4.86328C7.16406 4.86328 4.86328 7.16406 4.86328 10C4.86328 12.8359 7.16406 15.1367 10 15.1367C12.8359 15.1367 15.1367 12.8359 15.1367 10C15.1367 7.16406 12.8359 4.86328 10 4.86328ZM10 13.332C8.16016 13.332 6.66797 11.8398 6.66797 10C6.66797 8.16016 8.16016 6.66797 10 6.66797C11.8398 6.66797 13.332 8.16016 13.332 10C13.332 11.8398 11.8398 13.332 10 13.332Z" fill="#4F4F4F"/>
                          <path d="M16.5391 4.66016C16.5391 5.32422 16.0039 5.85547 15.3438 5.85547C14.6797 5.85547 14.1484 5.32031 14.1484 4.66016C14.1484 3.99609 14.6836 3.46484 15.3438 3.46484C16.0039 3.46484 16.5391 4 16.5391 4.66016Z" fill="#4F4F4F"/>
                        </svg>
                      </a>
                      {/* LinkedIn */}
                      <a href="#" className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M18.5195 0H1.47656C0.660156 0 0 0.644531 0 1.44141V18.5547C0 19.3516 0.660156 20 1.47656 20H18.5195C19.3359 20 20 19.3516 20 18.5586V1.44141C20 0.644531 19.3359 0 18.5195 0ZM5.93359 17.043H2.96484V7.49609H5.93359V17.043ZM4.44922 6.19531C3.49609 6.19531 2.72656 5.42578 2.72656 4.47656C2.72656 3.52734 3.49609 2.75781 4.44922 2.75781C5.39844 2.75781 6.16797 3.52734 6.16797 4.47656C6.16797 5.42188 5.39844 6.19531 4.44922 6.19531ZM17.043 17.043H14.0781V12.4023C14.0781 11.2969 14.0586 9.87109 12.5352 9.87109C10.9922 9.87109 10.7578 11.0781 10.7578 12.3242V17.043H7.79688V7.49609H10.6406V8.80078H10.6797C11.0742 8.05078 12.043 7.25781 13.4844 7.25781C16.4883 7.25781 17.043 9.23438 17.043 11.8047V17.043Z" fill="#4F4F4F"/>
                        </svg>
                      </a>
                      {/* YouTube */}
                      <a href="#" className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M19.582 5.18555C19.3555 4.33008 18.6836 3.65625 17.8281 3.42969C16.2539 3 10 3 10 3C10 3 3.74609 3 2.17188 3.42969C1.31641 3.65625 0.644531 4.33008 0.417969 5.18555C0 6.75977 0 10 0 10C0 10 0 13.2402 0.417969 14.8145C0.644531 15.6699 1.31641 16.3438 2.17188 16.5703C3.74609 17 10 17 10 17C10 17 16.2539 17 17.8281 16.5703C18.6836 16.3438 19.3555 15.6699 19.582 14.8145C20 13.2402 20 10 20 10C20 10 20 6.75977 19.582 5.18555ZM7.95312 12.8516V7.14844L13.2031 10L7.95312 12.8516Z" fill="#4F4F4F"/>
                        </svg>
                      </a>
                    </div>

                    <button className="flex items-center gap-1.5 text-sm font-medium text-black hover:underline cursor-pointer">
                      More details
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="translate-y-[1px]">
                        <path d="M6 3L11 8L6 13" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 1.66699L12.575 6.88366L18.3333 7.72533L14.1667 11.7837L15.15 17.517L10 14.8087L4.85 17.517L5.83333 11.7837L1.66667 7.72533L7.425 6.88366L10 1.66699Z" fill="#FFA500" stroke="#FFA500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-lg font-bold text-black">{eventData.rating.toFixed(1)}</span>
                  <span className="text-base text-[#4F4F4F]">• {eventData.reviewCount} reviews</span>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {allReviews.slice(0, 6).map((review) => (
                    <div key={review.id} className="p-4 bg-white border border-[#EEEEEE] rounded-xl">
                      <div className="flex items-start gap-3">
                        <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold text-black">{review.name}</h4>
                            <span className="text-xs text-[#757575]">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 1.33398L9.86 5.10732L14.0667 5.78065L11.0333 8.72732L11.72 12.9139L8 10.9473L4.28 12.9139L4.96667 8.72732L1.93333 5.78065L6.14 5.10732L8 1.33398Z" fill={i < review.rating ? '#FFA500' : '#E0E0E0'}/>
                              </svg>
                            ))}
                          </div>
                          <p className="text-sm text-[#4F4F4F] leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {allReviews.length === 0 && (
                    <p className="text-sm text-[#757575] col-span-2">No reviews yet. Be the first to review this event!</p>
                  )}
                </div>

                {/* View All Reviews Button */}
                <button 
                  onClick={() => setIsReviewsModalOpen(true)}
                  className="flex items-center justify-between gap-3 pl-6 pr-2 py-2 bg-white text-black text-base font-semibold rounded-full border-2 border-black hover:bg-[#F5F5F5] transition-colors group"
                >
                  <span>View all reviews</span>
                  <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center transition-colors">
                    <img src={AllReviewsIcon} alt="View all" className="w-9 h-9" />
                  </div>
                </button>
              </div>

              {/* Got Questions? We've Got Answers Section */}
              <div className="mt-12 mb-8">
                <h2 className="text-xl text-black text-center mb-8">
                  Got <span className="font-bold">Questions?</span> We've Got <span className="font-bold">Answers</span>
                </h2>
                
                <div className="space-y-3">
                  {/* FAQ Item 1 */}
                  <div className="bg-[#F8F8F8] rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-[#F0F0F0] transition-colors"
                    >
                      <span className="text-sm font-semibold text-black">Can I get a refund if I can't attend?</span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        className={`shrink-0 ml-4 transition-transform ${openFaqIndex === 0 ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {openFaqIndex === 0 && (
                      <div className="px-5 pb-4 pt-2 text-sm text-[#4F4F4F] leading-relaxed">
                        Refunds are available up to 48 hours before the event starts. After this period, tickets are non-refundable. Please contact our support team for assistance.
                      </div>
                    )}
                  </div>

                  {/* FAQ Item 2 */}
                  <div className="bg-[#F8F8F8] rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setOpenFaqIndex(openFaqIndex === 1 ? null : 1)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-[#F0F0F0] transition-colors"
                    >
                      <span className="text-sm font-semibold text-black">Will there be security at the event?</span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        className={`shrink-0 ml-4 transition-transform ${openFaqIndex === 1 ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {openFaqIndex === 1 && (
                      <div className="px-5 pb-4 pt-2 text-sm text-[#4F4F4F] leading-relaxed">
                        Yes, professional security personnel will be present throughout the event to ensure everyone's safety. Bag checks will be conducted at entry points.
                      </div>
                    )}
                  </div>

                  {/* FAQ Item 3 */}
                  <div className="bg-[#F8F8F8] rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setOpenFaqIndex(openFaqIndex === 2 ? null : 2)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-[#F0F0F0] transition-colors"
                    >
                      <span className="text-sm font-semibold text-black">Can I buy tickets at the door?</span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        className={`shrink-0 ml-4 transition-transform ${openFaqIndex === 2 ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {openFaqIndex === 2 && (
                      <div className="px-5 pb-4 pt-2 text-sm text-[#4F4F4F] leading-relaxed">
                        Tickets may be available at the door subject to availability. However, we strongly recommend purchasing tickets online in advance to guarantee entry.
                      </div>
                    )}
                  </div>

                  {/* FAQ Item 4 */}
                  <div className="bg-[#F8F8F8] rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setOpenFaqIndex(openFaqIndex === 3 ? null : 3)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-[#F0F0F0] transition-colors"
                    >
                      <span className="text-sm font-semibold text-black">Is there a lost and found service for lost items?</span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        className={`shrink-0 ml-4 transition-transform ${openFaqIndex === 3 ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {openFaqIndex === 3 && (
                      <div className="px-5 pb-4 pt-2 text-sm text-[#4F4F4F] leading-relaxed">
                        Yes, we have a dedicated lost and found station at the venue. If you lose an item, please visit the information desk or contact us after the event.
                      </div>
                    )}
                  </div>

                  {/* FAQ Item 5 */}
                  <div className="bg-[#F8F8F8] rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setOpenFaqIndex(openFaqIndex === 4 ? null : 4)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-[#F0F0F0] transition-colors"
                    >
                      <span className="text-sm font-semibold text-black">Are bags or backpacks allowed inside the venue?</span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        className={`shrink-0 ml-4 transition-transform ${openFaqIndex === 4 ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {openFaqIndex === 4 && (
                      <div className="px-5 pb-4 pt-2 text-sm text-[#4F4F4F] leading-relaxed">
                        Small bags and purses are allowed but will be subject to security checks. Large backpacks and luggage are not permitted for safety reasons.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* More from Pulsewave Entertainment Section */}
              <div className="mt-12 mb-8">
                <h2 className="text-xl text-black mb-6">
                  More from <span className="font-bold">{eventData.organizerName || 'this organizer'}</span>
                </h2>
                
                <div className="space-y-4">
                  {/* Event Card 1 */}
                  <div className="flex gap-4 p-4 bg-white border border-[#EEEEEE] rounded-xl hover:shadow-md transition-shadow">
                    <img 
                      src={Event2} 
                      alt="New York's Best Croissant - The 2025 Finale" 
                      className="w-[165px] h-[110px] object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-black mb-2 line-clamp-2">
                        New York's Best Croissant - The 2025 Finale
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#757575] mb-2">
                        <span>Apr 20</span>
                        <span>•</span>
                        <span>ABC Cooking School</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-black">from $65.99</span>
                        <span className="text-xs font-medium text-[#FF4000] bg-[#FFF4F3] px-2 py-1 rounded">Sales end soon</span>
                      </div>
                    </div>
                  </div>

                  {/* Event Card 2 */}
                  <div className="flex gap-4 p-4 bg-white border border-[#EEEEEE] rounded-xl hover:shadow-md transition-shadow">
                    <img 
                      src={Event3} 
                      alt="Epic Esports Championship" 
                      className="w-[165px] h-[110px] object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-black mb-2 line-clamp-2">
                        Epic Esports Championship
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#757575] mb-2">
                        <span>Apr 20</span>
                        <span>•</span>
                        <span>Mercedes-Benz Arena</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-black">from $65.99</span>
                        <span className="text-xs font-medium text-[#00A3FF] bg-[#E6F7FF] px-2 py-1 rounded">Almost full</span>
                      </div>
                    </div>
                  </div>

                  {/* Event Card 3 */}
                  <div className="flex gap-4 p-4 bg-white border border-[#EEEEEE] rounded-xl hover:shadow-md transition-shadow">
                    <img 
                      src={Event4} 
                      alt="Global Tech Innovators Summit 2025" 
                      className="w-[165px] h-[110px] object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-black mb-2 line-clamp-2">
                        Global Tech Innovators Summit 2025
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#757575] mb-2">
                        <span>Apr 20</span>
                        <span>•</span>
                        <span>Marina Convention Center</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-black">from $65.99</span>
                        <span className="text-xs font-medium text-[#FF4000] bg-[#FFF4F3] px-2 py-1 rounded">Only few left</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Price and CTA */}
            <div className="lg:w-[280px] xl:w-[320px] flex flex-col items-start lg:items-end gap-4 lg:sticky lg:top-6 lg:self-start">
              {/* Price and Badge Row */}
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-[#757575]">From</span>
                  <span className="text-2xl md:text-3xl font-bold text-black">{eventData.price}</span>
                </div>
                {eventData.badge && (
                  <span className="px-3 py-1 text-xs font-medium text-[#34A853] border border-[#34A853] rounded-full">
                    {eventData.badge}
                  </span>
                )}
              </div>

              {/* Get Tickets Button */}
              <button 
                onClick={() => navigate(`/event/${eventId}/tickets`)}
                className="w-full lg:w-auto px-10 py-3 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors text-base cursor-pointer"
              >
                Get Tickets Now!
              </button>
            </div>
          </div>

          {/* Trending Events in Similar Category Section */}
          <div className="mt-16 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-black">
                <span className="font-bold">Trending</span> events in similar category
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#757575]">{trendingPage} of {totalPages}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={handleTrendingPrev}
                    disabled={trendingPage === 1}
                    className={`w-8 h-8 flex items-center justify-center rounded-full border border-[#EEEEEE] transition-colors ${
                      trendingPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F8F8F8] cursor-pointer'
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 12L6 8L10 4" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button 
                    onClick={handleTrendingNext}
                    disabled={trendingPage === totalPages}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                      trendingPage === totalPages ? 'bg-gray-400 opacity-50 cursor-not-allowed' : 'bg-black hover:bg-[#333333] cursor-pointer'
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4L10 8L6 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {currentTrendingEvents.map((event, index) => {
                const displayNumber = startIndex + index + 1;
                return (
                  <div key={event.id} className="relative group cursor-pointer transition-transform duration-300 hover:scale-105">
                    <div className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300">
                      <img 
                        src={event.image} 
                        alt={event.title} 
                        className="w-full h-[320px] object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute bottom-2 left-2 transition-transform duration-300 group-hover:scale-110">
                        <span className="text-7xl font-bold text-black" style={{WebkitTextStroke: '3px white'}}>{displayNumber}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-base font-semibold text-black mb-1 line-clamp-1">
                        {event.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black">from {event.price}</span>
                        {event.badge && (
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            event.badgeColor === 'blue' ? 'text-[#00A3FF] bg-[#E6F7FF]' : 'text-[#FF4000] bg-[#FFF4F3]'
                          }`}>
                            {event.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="mt-16 mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Left Side - Title and Description */}
              <div className="flex-1">
                <h2 className="text-2xl lg:text-3xl text-black mb-3 whitespace-nowrap">
                  <span className="font-bold">Be the first to know,</span> never miss an event again!
                </h2>
                <p className="text-sm text-[#757575]">
                  Get exclusive updates, early bird access, and handpicked events — delivered straight to your inbox.
                </p>
              </div>

              {/* Right Side - Email Input with Button */}
              <div className="flex-1 max-w-xl">
                <div className="relative flex items-center bg-white border border-[#EEEEEE] rounded-full overflow-hidden">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 px-6 py-3 bg-transparent text-sm focus:outline-none"
                  />
                  <button className="pl-6 pr-2 py-2.5 bg-[#FF4000] text-white font-bold hover:bg-[#E63900] transition-colors text-sm whitespace-nowrap rounded-full m-1 flex items-center gap-4">
                    <span>Keep Me Updated</span>
                    <img src={KeepMeUpdateIcon} alt="" className="w-9 h-9 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reviews Modal */}
      <ReviewsModal 
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        reviews={allReviews}
      />
    </div>
  );
};

export default EventDetailsGlobal;
