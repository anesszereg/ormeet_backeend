import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import EventDetailsNavbar from '../components/EventDetailsNavbar';
import ReviewsModal from '../components/ReviewsModal';
import eventService, { Event as ApiEvent } from '../services/eventService';
import reviewService, { Review as ApiReview } from '../services/reviewService';
import userPreferencesService from '../services/userPreferencesService';
import organizerService from '../services/organizerService';

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
  organizerPhone: string;
  organizerSocials: Record<string, string>;
  organizerFollowers: number;
  organizerEventsCount: number;
  capacity: number;
  availableSpots: number;
  startAtRaw: string;
  endAtRaw: string;
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

const localeMap: Record<string, string> = { en: 'en-US', fr: 'fr-FR', ar: 'ar-DZ' };

const EventDetailsGlobal = () => {
  const { t, i18n } = useTranslation('attendee');
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
        const dateStr = startDate.toLocaleDateString(localeMap[i18n.language] || 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = `${startDate.toLocaleTimeString(localeMap[i18n.language] || 'en-US', { hour: 'numeric', minute: '2-digit' })} – ${endDate.toLocaleTimeString(localeMap[i18n.language] || 'en-US', { hour: 'numeric', minute: '2-digit' })}`;
        const lowestPrice = event.ticketTypes?.reduce((min, tt) => Math.min(min, Number(tt.price)), Infinity) ?? 0;
        const venueAddress = event.customLocation
          ? `${event.customLocation.address}, ${event.customLocation.city}, ${event.customLocation.state} ${event.customLocation.zipCode}, ${event.customLocation.country}`
          : event.venue
          ? `${event.venue.address}, ${event.venue.city}, ${event.venue.country}`
          : '';

        // Best-effort organizer public details & stats
        let organizerWebsite = '';
        let organizerEmail = '';
        let organizerPhone = '';
        let organizerSocials: Record<string, string> = {};
        let organizerFollowers = 0;
        const organizerEventsCount = event.organizerId
          ? allEvents.filter((e: ApiEvent) => e.organizerId === event.organizerId).length
          : 0;

        if (event.organizerId) {
          const [orgResult, followersResult] = await Promise.allSettled([
            organizerService.getOrganizationById(event.organizerId),
            userPreferencesService.getFollowersCount(event.organizerId),
          ]);
          if (orgResult.status === 'fulfilled' && orgResult.value) {
            const org = orgResult.value;
            organizerWebsite = org.website || '';
            organizerEmail = org.contactEmail || '';
            organizerPhone = org.contactPhone || '';
            const socials = org.settings?.socialLinks;
            if (socials && typeof socials === 'object') {
              organizerSocials = Object.fromEntries(
                Object.entries(socials).filter(([, url]) => typeof url === 'string' && url),
              ) as Record<string, string>;
            }
          }
          if (followersResult.status === 'fulfilled') {
            organizerFollowers = followersResult.value || 0;
          }
        }

        const availableSpots = event.ticketTypes?.reduce(
          (sum, tt) => sum + (Number(tt.quantityTotal || 0) - Number(tt.quantitySold || 0)),
          0,
        ) ?? 0;

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
          organizerWebsite,
          organizerEmail,
          organizerPhone,
          organizerSocials,
          organizerFollowers,
          organizerEventsCount,
          capacity: event.capacity || 0,
          availableSpots,
          startAtRaw: event.startAt,
          endAtRaw: event.endAt,
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
          date: new Date(r.createdAt).toLocaleDateString(localeMap[i18n.language] || 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
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

  const monthNames = [t('eventDetails.dateTime.calendarDays.jan', 'January'), t('eventDetails.dateTime.calendarDays.feb', 'February'), t('eventDetails.dateTime.calendarDays.mar', 'March'), t('eventDetails.dateTime.calendarDays.apr', 'April'), t('eventDetails.dateTime.calendarDays.may', 'May'), t('eventDetails.dateTime.calendarDays.jun', 'June'), t('eventDetails.dateTime.calendarDays.jul', 'July'), t('eventDetails.dateTime.calendarDays.aug', 'August'), t('eventDetails.dateTime.calendarDays.sep', 'September'), t('eventDetails.dateTime.calendarDays.oct', 'October'), t('eventDetails.dateTime.calendarDays.nov', 'November'), t('eventDetails.dateTime.calendarDays.dec', 'December')];

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
      alert(t('eventDetails.actions.loginToFavorite'));
      return;
    }
    if (!eventId) return;

    setIsTogglingFavorite(true);
    try {
      if (isFavorite) {
        await userPreferencesService.removeFavoriteEvent(eventId);
        setIsFavorite(false);
        setEventData(prev => prev ? { ...prev, favorites: Math.max(0, prev.favorites - 1) } : prev);
        console.log('✅ Removed from favorites');
      } else {
        await userPreferencesService.addFavoriteEvent(eventId);
        setIsFavorite(true);
        setEventData(prev => prev ? { ...prev, favorites: prev.favorites + 1 } : prev);
        console.log('✅ Added to favorites');
      }
    } catch (err: any) {
      console.error('❌ Failed to toggle favorite:', err);
      alert(err.response?.data?.message || t('eventDetails.alerts.favoriteFailed'));
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      alert(t('eventDetails.organizer.loginToFollow'));
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
      alert(err.response?.data?.message || t('eventDetails.alerts.followFailed'));
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

  // Generate time slots from actual event times
  const generateTimeSlots = () => {
    if (!eventData) return [];
    const start = new Date(eventData.date);
    const slots = [];
    // Use actual event time as the primary slot
    slots.push(eventData.time);
    return slots;
  };
  const timeSlots = generateTimeSlots();

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
          <p className="text-red-500 mb-4">{error || t('eventDetails.error.notFound')}</p>
          <button onClick={() => navigate(-1)} className="text-[#FF4000] font-semibold hover:underline">{t('eventDetails.error.goBack')}</button>
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
              className="absolute start-4 md:start-6 top-1/2 -translate-y-1/2 w-[50px] h-[50px] md:w-[60px] md:h-[60px] flex items-center justify-center hover:scale-105 transition-transform z-10 cursor-pointer"
              aria-label={t('eventDetails.actions.prevImage')}
            >
              <img src={PastImageIcon} alt="Previous" className="w-full h-full" />
            </button>

            {/* Next Image Button */}
            <button
              onClick={handleNextImage}
              className="absolute end-4 md:end-6 top-1/2 -translate-y-1/2 w-[50px] h-[50px] md:w-[60px] md:h-[60px] flex items-center justify-center hover:scale-105 transition-transform z-10 cursor-pointer"
              aria-label={t('eventDetails.actions.nextImage')}
            >
              <img src={NextImageIcon} alt="Next" className="w-full h-full" />
            </button>

            {/* Image Dots Indicator */}
            <div className="absolute bottom-4 start-1/2 -translate-x-1/2 flex items-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    index === currentImageIndex
                      ? 'bg-white w-3 h-3'
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={t('eventDetails.actions.goToImage', { number: index + 1 })}
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
                  <span className="text-sm text-[#757575]">• {eventData.reviewCount} {t('eventDetails.stats.reviews')}</span>
                </div>
                
                {/* Available Spots */}
                <div className="flex items-center gap-1.5">
                  <svg className="w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {eventData.availableSpots > 0 ? (
                    <span className={`text-sm ${eventData.availableSpots <= 10 ? 'text-orange-500 font-medium' : 'text-[#757575]'}`}>
                      {eventData.availableSpots.toLocaleString()} {t('eventDetails.stats.spotsAvailable', 'spots available')}
                    </span>
                  ) : (
                    <span className="text-sm text-red-500 font-medium">{t('eventDetails.stats.soldOut', 'Sold out')}</span>
                  )}
                </div>
                
                {/* Favorites */}
                <div className="flex items-center gap-1.5">
                  <svg className="w-5 h-5 text-[#FF4000]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="text-sm text-[#757575]">{eventData.favorites.toLocaleString()} {t('eventDetails.stats.favorites')}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleToggleFavorite}
                    disabled={!user || isTogglingFavorite}
                    className="hover:scale-105 transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={isFavorite ? t('eventDetails.actions.removeFromFavorites') : t('eventDetails.actions.addToFavorites')}
                    title={!user ? t('eventDetails.actions.loginToFavorite') : (isFavorite ? t('eventDetails.actions.removeFromFavorites') : t('eventDetails.actions.addToFavorites'))}
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
                    aria-label={t('eventDetails.actions.shareEvent')}
                  >
                    <img src={UploadIcon} alt="Share" className="w-[42px] h-[42px]" />
                  </button>
                </div>
              </div>

              {/* Date & Time Section */}
              <div className="mb-6">
                <h2 className="text-base font-bold text-black mb-2">{t('eventDetails.dateTime.sectionTitle')}</h2>
                <p className="text-sm text-black">
                  {eventData.date} <span className="text-[#757575] mx-2">|</span> {eventData.time}
                </p>
                <button 
                  onClick={() => setShowDateTimeSection(!showDateTimeSection)}
                  className="text-sm font-medium text-[#FF4000] hover:underline mt-2 cursor-pointer"
                >
                  {showDateTimeSection ? t('eventDetails.dateTime.closeCalendar') : t('eventDetails.dateTime.changeDate')}
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
                            {[t('eventDetails.dateTime.calendarDays.sun'), t('eventDetails.dateTime.calendarDays.mon'), t('eventDetails.dateTime.calendarDays.tue'), t('eventDetails.dateTime.calendarDays.wed'), t('eventDetails.dateTime.calendarDays.thu'), t('eventDetails.dateTime.calendarDays.fri'), t('eventDetails.dateTime.calendarDays.sat')].map((day) => (
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
                            {t('eventDetails.dateTime.timeSlotsAvailable', { count: timeSlots.length, date: new Date(selectedYear, selectedMonth - 1, selectedDate).toLocaleDateString(localeMap[i18n.language] || 'en-US', { weekday: 'short', month: 'short', day: 'numeric' }) })}
                          </h3>
                          <p className="text-xs text-[#757575] mb-4">
                            {timeSlots.length > 0 ? t('eventDetails.dateTime.selectTime') : t('eventDetails.dateTime.noTimeSlots')}
                          </p>

                          {/* Time Slot Options */}
                          <div className="space-y-2">
                            {timeSlots.map((slot) => (
                              <button
                                key={slot}
                                onClick={() => handleTimeSlotSelect(slot)}
                                className={`w-full px-4 py-3 rounded-lg text-sm font-medium text-start transition-colors ${
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
                <h2 className="text-base font-bold text-black mb-2">{t('eventDetails.location.sectionTitle')}</h2>
                <p className="text-sm text-black">
                  {eventData.venue} <span className="text-[#757575] mx-2">|</span> 
                  <span className="text-[#4F4F4F]">{eventData.address}</span>
                </p>
                <button 
                  onClick={() => setShowLocationSection(!showLocationSection)}
                  className="text-sm font-medium text-[#FF4000] hover:underline mt-2 cursor-pointer"
                >
                  {showLocationSection ? t('eventDetails.location.closeMap') : t('eventDetails.location.seeOnMap')}
                </button>

                {/* Inline Map Section */}
                {showLocationSection && (
                  <div className="mt-4 bg-white border border-[#EEEEEE] rounded-2xl overflow-hidden">
                    <div className="relative w-full h-[400px] lg:h-[500px]">
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(eventData.address)}`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={t('eventDetails.location.mapTitle')}
                        className="absolute inset-0"
                      />

                      {/* Map Controls */}
                      <div className="absolute top-4 end-4 flex flex-col gap-2">
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
                <h2 className="text-lg font-bold text-black mb-6">{t('eventDetails.guidelines.sectionTitle')}</h2>

                {/* Age Requirement */}
                {(eventData.ageLimit || eventData.guidelines?.ageRequirement) && (
                  <div className="flex gap-3 mb-5">
                    <img src={AgePlusIcon} alt="Age requirement" className="w-6 h-6 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-black mb-1">{t('eventDetails.guidelines.ageRequirement.label')}</h3>
                      <p className="text-sm text-[#4F4F4F]">
                        {eventData.guidelines?.ageRequirement || 
                         (eventData.ageLimit ? t('eventDetails.guidelines.ageRequirement.defaultText', { age: eventData.ageLimit }) : t('eventDetails.guidelines.ageRequirement.noRestriction'))}
                      </p>
                    </div>
                  </div>
                )}

                {/* Entry Policy */}
                {eventData.guidelines?.entryPolicy && (
                  <div className="flex gap-3 mb-5">
                    <img src={EntryPolicyIcon} alt="Entry policy" className="w-6 h-6 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-black mb-1">{t('eventDetails.guidelines.entryPolicy.label')}</h3>
                      <p className="text-sm text-[#4F4F4F]">
                        {eventData.guidelines.entryPolicy}
                        {eventData.allowReentry !== undefined && (
                          <span> {eventData.allowReentry ? t('eventDetails.guidelines.entryPolicy.reentryAllowed') : t('eventDetails.guidelines.entryPolicy.noReentry')}</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Accessibility */}
                {eventData.guidelines?.accessibleInfo && (
                  <div className="flex gap-3 mb-5">
                    <img src={AccessibilityIcon} alt="Accessibility" className="w-6 h-6 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-black mb-1">{t('eventDetails.guidelines.accessibility.label')}</h3>
                      <p className="text-sm text-[#4F4F4F]">{eventData.guidelines.accessibleInfo}</p>
                    </div>
                  </div>
                )}

                {/* Refund Policy */}
                {(eventData.refundsAllowed !== undefined || eventData.guidelines?.refundPolicy) && (
                  <div className="flex gap-3 mb-5">
                    <img src={RefundPolicyIcon} alt="Refund policy" className="w-6 h-6 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-black mb-1">{t('eventDetails.guidelines.refundPolicy.label')}</h3>
                      <p className="text-sm text-[#4F4F4F]">
                        {eventData.guidelines?.refundPolicy || 
                         (eventData.refundsAllowed ? t('eventDetails.guidelines.refundPolicy.refundsAvailable') : t('eventDetails.guidelines.refundPolicy.noRefunds'))}
                      </p>
                    </div>
                  </div>
                )}

                {/* Prohibited Items */}
                {eventData.guidelines?.prohibitedItems && eventData.guidelines.prohibitedItems.length > 0 && (
                  <div className="flex gap-3 mb-5">
                    <img src={ProhibitedItemsIcon} alt="Prohibited items" className="w-6 h-6 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-black mb-2">{t('eventDetails.guidelines.prohibitedItems.label')}</h3>
                      <ul className="space-y-2">
                        {eventData.guidelines.prohibitedItems.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <img src={NoIcon} alt="No" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="text-sm text-[#4F4F4F]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Allowed Items */}
                {eventData.guidelines?.allowedItems && eventData.guidelines.allowedItems.length > 0 && (
                  <div className="flex gap-3">
                    <img src={AllowedItemsIcon} alt="Allowed items" className="w-6 h-6 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-black mb-2">{t('eventDetails.guidelines.allowedItems.label')}</h3>
                      <ul className="space-y-2">
                        {eventData.guidelines.allowedItems.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <img src={YesIcon} alt="Yes" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="text-sm text-[#4F4F4F]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Meet Your Organiser Section */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-black mb-4">{t('eventDetails.organizer.sectionTitle')} <span className="font-bold">{t('eventDetails.organizer.sectionTitleBold')}</span></h2>
                
                <div className="bg-[#F0F8F7] rounded-2xl p-6">
                  {/* Organizer Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {/* Organizer Logo with Verified Badge */}
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center overflow-hidden">
                          <span className="text-2xl font-bold text-[#00D9FF]">P</span>
                        </div>
                        <div className="absolute -bottom-1 -end-1 w-6 h-6 bg-[#FF4000] rounded-full flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M4.66675 7.00004L6.41675 8.75004L9.91675 5.25004" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>

                      {/* Organizer Info */}
                      <div>
                        <h3 className="text-base font-semibold text-black mb-3">{eventData.organizerName || 'Organizer'}</h3>

                        {/* Organizer public stats */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-black">{eventData.organizerFollowers.toLocaleString()}</span>
                            <span className="text-xs text-[#757575]">{t('eventDetails.organizer.followers', 'Followers')}</span>
                          </div>
                          <div className="w-px h-4 bg-[#D9D9D9]" />
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-black">{eventData.organizerEventsCount.toLocaleString()}</span>
                            <span className="text-xs text-[#757575]">{t('eventDetails.organizer.events', 'Events')}</span>
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
                        title={!user ? t('eventDetails.organizer.loginToFollow') : (isFollowing ? t('eventDetails.organizer.following') : t('eventDetails.organizer.follow'))}
                      >
                        {isFollowing ? t('eventDetails.organizer.following') : t('eventDetails.organizer.follow')}
                      </button>
                      {eventData.organizerEmail && (
                        <a 
                          href={`mailto:${eventData.organizerEmail}`}
                          className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full border border-black hover:bg-[#F8F8F8] transition-colors"
                        >
                          {t('eventDetails.organizer.contact')}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {eventData.organizerName && (
                    <p className="text-sm text-[#4F4F4F] mb-4 leading-relaxed">
                      {t('eventDetails.organizer.isOrganizing', { name: eventData.organizerName })}
                    </p>
                  )}

                  {/* Website & Social Links */}
                  {(eventData.organizerWebsite || eventData.organizerPhone || Object.keys(eventData.organizerSocials).length > 0) && (
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E0EBEA]">
                      {eventData.organizerWebsite && (
                        <a
                          href={eventData.organizerWebsite.startsWith('http') ? eventData.organizerWebsite : `https://${eventData.organizerWebsite}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-black hover:text-[#FF4000] transition-colors"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                          {t('eventDetails.organizer.website', 'Website')}
                        </a>
                      )}
                      {eventData.organizerPhone && (
                        <a
                          href={`tel:${eventData.organizerPhone}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-black hover:text-[#FF4000] transition-colors"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.34a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.74.34 1.53.57 2.34.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          {eventData.organizerPhone}
                        </a>
                      )}
                      {Object.entries(eventData.organizerSocials).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url.startsWith('http') ? url : `https://${url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-medium text-black capitalize hover:text-[#FF4000] transition-colors border border-[#E0EBEA]"
                        >
                          {platform}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 1.66699L12.575 6.88366L18.3333 7.72533L14.1667 11.7837L15.15 17.517L10 14.8087L4.85 17.517L5.83333 11.7837L1.66667 7.72533L7.425 6.88366L10 1.66699Z" fill="#FFA500" stroke="#FFA500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-lg font-bold text-black">{eventData.rating.toFixed(1)}</span>
                  <span className="text-base text-[#4F4F4F]">• {eventData.reviewCount} {t('eventDetails.stats.reviews')}</span>
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
                    <p className="text-sm text-[#757575] col-span-2">{t('eventDetails.reviews.noReviews')}</p>
                  )}
                </div>

                {/* Reviews Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => setIsReviewsModalOpen(true)}
                    className="flex items-center justify-between gap-3 ps-6 pe-2 py-2 bg-white text-black text-base font-semibold rounded-full border-2 border-black hover:bg-[#F5F5F5] transition-colors"
                  >
                    <span>{t('eventDetails.reviews.viewAll')}</span>
                    <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center transition-colors">
                      <img src={AllReviewsIcon} alt="View all" className="w-9 h-9" />
                    </div>
                  </button>
                  {user && (
                    <button
                      onClick={() => navigate(`/event/${eventId}/review`)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#FF4000] text-white text-sm font-semibold rounded-full hover:bg-[#E63900] transition-colors"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {t('eventDetails.reviews.writeReview', 'Write a Review')}
                    </button>
                  )}
                </div>
              </div>

              {/* Got Questions? We've Got Answers Section */}
              <div className="mt-12 mb-8">
                <h2 className="text-xl text-black text-center mb-8">
                  {t('eventDetails.faq.sectionTitle')} <span className="font-bold">{t('eventDetails.faq.sectionTitleBold1')}</span> {t('eventDetails.faq.sectionTitleMid')} <span className="font-bold">{t('eventDetails.faq.sectionTitleBold2')}</span>
                </h2>
                
                <div className="space-y-3">
                  {/* FAQ Item 1 */}
                  <div className="bg-[#F8F8F8] rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
                      className="w-full flex items-center justify-between px-5 py-4 text-start cursor-pointer hover:bg-[#F0F0F0] transition-colors"
                    >
                      <span className="text-sm font-semibold text-black">{t('eventDetails.faq.items.0.question')}</span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        className={`shrink-0 ms-4 transition-transform ${openFaqIndex === 0 ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {openFaqIndex === 0 && (
                      <div className="px-5 pb-4 pt-2 text-sm text-[#4F4F4F] leading-relaxed">
                        {t('eventDetails.faq.items.0.answer')}
                      </div>
                    )}
                  </div>

                  {/* FAQ Item 2 */}
                  <div className="bg-[#F8F8F8] rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setOpenFaqIndex(openFaqIndex === 1 ? null : 1)}
                      className="w-full flex items-center justify-between px-5 py-4 text-start cursor-pointer hover:bg-[#F0F0F0] transition-colors"
                    >
                      <span className="text-sm font-semibold text-black">{t('eventDetails.faq.items.1.question')}</span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        className={`shrink-0 ms-4 transition-transform ${openFaqIndex === 1 ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {openFaqIndex === 1 && (
                      <div className="px-5 pb-4 pt-2 text-sm text-[#4F4F4F] leading-relaxed">
                        {t('eventDetails.faq.items.1.answer')}
                      </div>
                    )}
                  </div>

                  {/* FAQ Item 3 */}
                  <div className="bg-[#F8F8F8] rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setOpenFaqIndex(openFaqIndex === 2 ? null : 2)}
                      className="w-full flex items-center justify-between px-5 py-4 text-start cursor-pointer hover:bg-[#F0F0F0] transition-colors"
                    >
                      <span className="text-sm font-semibold text-black">{t('eventDetails.faq.items.2.question')}</span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        className={`shrink-0 ms-4 transition-transform ${openFaqIndex === 2 ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {openFaqIndex === 2 && (
                      <div className="px-5 pb-4 pt-2 text-sm text-[#4F4F4F] leading-relaxed">
                        {t('eventDetails.faq.items.2.answer')}
                      </div>
                    )}
                  </div>

                  {/* FAQ Item 4 */}
                  <div className="bg-[#F8F8F8] rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setOpenFaqIndex(openFaqIndex === 3 ? null : 3)}
                      className="w-full flex items-center justify-between px-5 py-4 text-start cursor-pointer hover:bg-[#F0F0F0] transition-colors"
                    >
                      <span className="text-sm font-semibold text-black">{t('eventDetails.faq.items.3.question')}</span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        className={`shrink-0 ms-4 transition-transform ${openFaqIndex === 3 ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {openFaqIndex === 3 && (
                      <div className="px-5 pb-4 pt-2 text-sm text-[#4F4F4F] leading-relaxed">
                        {t('eventDetails.faq.items.3.answer')}
                      </div>
                    )}
                  </div>

                  {/* FAQ Item 5 */}
                  <div className="bg-[#F8F8F8] rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setOpenFaqIndex(openFaqIndex === 4 ? null : 4)}
                      className="w-full flex items-center justify-between px-5 py-4 text-start cursor-pointer hover:bg-[#F0F0F0] transition-colors"
                    >
                      <span className="text-sm font-semibold text-black">{t('eventDetails.faq.items.4.question')}</span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        className={`shrink-0 ms-4 transition-transform ${openFaqIndex === 4 ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {openFaqIndex === 4 && (
                      <div className="px-5 pb-4 pt-2 text-sm text-[#4F4F4F] leading-relaxed">
                        {t('eventDetails.faq.items.4.answer')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* More from Pulsewave Entertainment Section */}
              <div className="mt-12 mb-8">
                <h2 className="text-xl text-black mb-6">
                  {t('eventDetails.moreFromOrganizer')} <span className="font-bold">{eventData.organizerName || t('eventDetails.moreFromOrganizerFallback')}</span>
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
                  <span className="text-sm text-[#757575]">{t('eventDetails.price.from')}</span>
                  <span className="text-2xl md:text-3xl font-bold text-black">{eventData.price}</span>
                </div>
                {eventData.badge && (
                  <span className="px-3 py-1 text-xs font-medium text-[#34A853] border border-[#34A853] rounded-full">
                    {eventData.badge}
                  </span>
                )}
              </div>

              {/* Get Tickets Button */}
              {(() => {
                const now = new Date();
                const isPast = eventData.endAtRaw ? new Date(eventData.endAtRaw) < now : false;
                const isSoldOut = eventData.availableSpots === 0 && (eventData.capacity ?? 0) > 0;
                const isDisabled = isPast || isSoldOut;
                return (
                  <button
                    onClick={() => !isDisabled && navigate(`/event/${eventId}/tickets`)}
                    disabled={isDisabled}
                    className={`w-full lg:w-auto px-10 py-3 font-semibold rounded-full transition-colors text-base ${
                      isPast
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isSoldOut
                        ? 'bg-red-100 text-red-400 cursor-not-allowed'
                        : 'bg-[#FF4000] text-white hover:bg-[#E63900] cursor-pointer'
                    }`}
                  >
                    {isPast
                      ? t('eventDetails.eventEnded', 'Event Ended')
                      : isSoldOut
                      ? t('eventDetails.soldOut', 'Sold Out')
                      : t('eventDetails.getTickets')}
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Trending Events in Similar Category Section */}
          <div className="mt-16 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-black">
                  <span className="font-bold">{t('eventDetails.trending.sectionTitle')}</span> {t('eventDetails.trending.sectionTitleSuffix')}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#757575]">{trendingPage} {t('eventDetails.trending.paginationOf')} {totalPages}</span>
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
                      <div className="absolute bottom-2 start-2 transition-transform duration-300 group-hover:scale-110">
                        <span className="text-7xl font-bold text-black" style={{WebkitTextStroke: '3px white'}}>{displayNumber}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-base font-semibold text-black mb-1 line-clamp-1">
                        {event.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black">{t('eventDetails.trending.fromPrice')} {event.price}</span>
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
                  <span className="font-bold">{t('eventDetails.newsletter.title')}</span> {t('eventDetails.newsletter.titleSuffix')}
                </h2>
                <p className="text-sm text-[#757575]">
                  {t('eventDetails.newsletter.description')}
                </p>
              </div>

              {/* Right Side - Email Input with Button */}
              <div className="flex-1 max-w-xl">
                <div className="relative flex items-center bg-white border border-[#EEEEEE] rounded-full overflow-hidden">
                  <input 
                    type="email" 
                    placeholder={t('eventDetails.newsletter.emailPlaceholder')} 
                    className="flex-1 px-6 py-3 bg-transparent text-sm focus:outline-none"
                  />
                  <button className="ps-6 pe-2 py-2.5 bg-[#FF4000] text-white font-bold hover:bg-[#E63900] transition-colors text-sm whitespace-nowrap rounded-full m-1 flex items-center gap-4">
                    <span>{t('eventDetails.newsletter.ctaButton')}</span>
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
