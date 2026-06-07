import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchResultNavbar from '../components/SearchResultNavbar';
import EventCard from '../components/EventCard';
import EventListCard from '../components/EventListCard';
import EventMapCard from '../components/EventMapCard';
import FilterIcon from '../assets/Svgs/searchResult/filter.svg';
import FilterBlackIcon from '../assets/Svgs/filterBalck.svg';
import GridIcon from '../assets/Svgs/searchResult/gride.svg';
import ListIcon from '../assets/Svgs/searchResult/liste.svg';
import CancelIcon from '../assets/Svgs/filtresSearchResult/cancel.svg';
import LocationIcon from '../assets/Svgs/filtresSearchResult/location.svg';
import DateIcon from '../assets/Svgs/filtresSearchResult/date.svg';
import ShowMoreIcon from '../assets/Svgs/filtresSearchResult/showMore.svg';
import ShowLessIcon from '../assets/Svgs/filtresSearchResult/showLess.svg';
import eventService, { Event as ApiEvent } from '../services/eventService';

import EventImageFallback from '../assets/imges/event myticket 1.jpg';

interface MappedEvent {
  id: string;
  image: string;
  title: string;
  date: string;
  venue: string;
  price: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  isPast: boolean;
  availableSpots: number;
  endAtRaw: string;
}

const localeMap: Record<string, string> = { en: 'en-US', fr: 'fr-FR', ar: 'ar-DZ' };

const SearchResult = () => {
  const { t, i18n } = useTranslation('attendee');
  const [searchParams] = useSearchParams();
  const searchCategory = searchParams.get('category') || '';
  const searchLocation = searchParams.get('location') || '';
  // The landing-page hero search bar sends the "What" input as `event`
  // (free-text title query). `q` is also accepted as an alias.
  const searchQuery =
    searchParams.get('event') || searchParams.get('q') || '';

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Seed the location filter from the URL when the landing page passes
  // one in; fall back to the default city otherwise.
  // Empty string means "no location filter" — otherwise we'd hide every
  // event that doesn't happen to be in the default city.
  const [selectedLocation, setSelectedLocation] = useState(
    searchLocation || '',
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 300 });
  const [selectedDate, setSelectedDate] = useState('Apr 20, 2025');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('Today');
  const [selectedOrganizer, setSelectedOrganizer] = useState('Events by Organizers You Follow');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedMapEvent, setSelectedMapEvent] = useState<MappedEvent | null>(null);
  const [events, setEvents] = useState<MappedEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<MappedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const apiEvents = await eventService.getAllEvents({ status: 'published' });
        const now = new Date();
        const mapped: MappedEvent[] = apiEvents.map((e: ApiEvent) => {
          const startDate = new Date(e.startAt);
          const endDate = new Date(e.endAt);
          const isPast = endDate < now;
          const lowestPrice = e.ticketTypes?.reduce((min, tt) => Math.min(min, Number(tt.price)), Infinity) ?? 0;
          const availableSpots = e.ticketTypes?.reduce((sum, tt) => sum + (Number(tt.quantityTotal || 0) - Number(tt.quantitySold || 0)), 0) ?? 0;
          return {
            id: e.id,
            image: e.images?.[0] || EventImageFallback,
            title: e.title,
            date: startDate.toLocaleDateString(localeMap[i18n.language] || 'en-US', { month: 'short', day: 'numeric' }),
            venue: e.venue?.name || (e as any).customLocation?.city || '',
            price: lowestPrice === Infinity || lowestPrice === 0 ? 'Free' : `$${lowestPrice.toFixed(2)}`,
            description: e.shortDescription || '',
            isPast,
            availableSpots,
            endAtRaw: e.endAt,
          };
        });
        setEvents(mapped);
        setFilteredEvents(mapped);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter events based on search params and filters
  useEffect(() => {
    let filtered = [...events];

    // Free-text query from the landing-page hero search ("What" field)
    // — matches against title or description.
    if (searchQuery) {
      const needle = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(needle) ||
        event.description.toLowerCase().includes(needle),
      );
    }

    // Filter by search category
    if (searchCategory) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchCategory.toLowerCase()) ||
        event.description.toLowerCase().includes(searchCategory.toLowerCase())
      );
    }

    // Filter by selected categories from sidebar
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(event =>
        selectedCategories.some(cat => 
          event.title.toLowerCase().includes(cat.toLowerCase()) ||
          event.description.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    // Filter by price range
    filtered = filtered.filter(event => {
      if (event.price === 'Free') return priceRange.min === 0;
      const price = parseFloat(event.price.replace('$', ''));
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Filter by location. We honour both the URL-supplied `location`
    // (from the landing page) and the sidebar dropdown — an event needs
    // to match the active dropdown value to be shown. We don't gate on
    // a specific city anymore, so a search from the landing page
    // actually narrows the results.
    const locationNeedle = (searchLocation || selectedLocation || '').trim();
    if (locationNeedle) {
      const needle = locationNeedle.toLowerCase();
      filtered = filtered.filter(event =>
        event.venue.toLowerCase().includes(needle),
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, searchCategory, searchLocation, selectedCategories, priceRange, selectedLocation]);

  const categories = ['Music', 'Sports', 'Business', 'Arts', 'Food & Drink', 'Health', 'Technology', 'Fashion'];
  const timeFilterOptions = [
    { key: 'Today', label: t('searchResult.filters.timeOptions.today') },
    { key: 'This Weekend', label: t('searchResult.filters.timeOptions.thisWeekend') },
    { key: 'This Week', label: t('searchResult.filters.timeOptions.thisWeek') },
    { key: 'This Month', label: t('searchResult.filters.timeOptions.thisMonth') },
  ];
  const organizerOptions = [
    { key: 'Events by Organizers You Follow', label: t('searchResult.filters.organizerOptions.following') },
    { key: 'Events by All Organizers', label: t('searchResult.filters.organizerOptions.all') },
  ];
  const displayedCategories = showAllCategories ? categories : categories.slice(0, 4);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  /**
   * The location the embedded Google Map should center on. Priority:
   *   1. URL `?location` from the landing-page search bar
   *   2. The active sidebar dropdown
   *   3. A venue from one of the matched events (so even a free-text
   *      query like "alger" recenters the map)
   *   4. "world" — global view as a last resort
   */
  const mapQuery = (searchLocation
    || selectedLocation
    || filteredEvents[0]?.venue
    || 'world').trim() || 'world';

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      {/* Navbar */}
      <SearchResultNavbar />

      {/* Map toggle button for mobile */}
      <button
        onClick={() => setShowMap(v => !v)}
        className="md:hidden fixed bottom-6 end-6 z-50 flex items-center gap-2 px-4 py-3 bg-black text-white rounded-full shadow-lg text-sm font-medium"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 13l4.553 2.276A1 1 0 0021 21.382V10.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7"/>
        </svg>
        {showMap ? t('searchResult.map.hide', 'Hide map') : t('searchResult.map.show', 'Show map')}
      </button>

      {/* Main content - Two columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="w-[227px] bg-white border-e border-[#EEEEEE] overflow-y-auto shrink-0">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-black">{t('searchResult.filters.title')}</h2>
                <button onClick={() => setIsFilterOpen(false)} className="hover:opacity-70 transition-opacity cursor-pointer">
                  <img src={CancelIcon} alt="Close" className="w-6 h-6" />
                </button>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-black mb-3">
                  <img src={LocationIcon} alt="Location" className="w-5 h-5" />
                  {t('searchResult.filters.locationLabel')}
                </label>
                <div className="relative">
                  <select 
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EEEEEE] rounded-lg text-sm text-black bg-white appearance-none cursor-pointer focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
                  >
                    <option>Oran</option>
                    <option>Algiers</option>
                    <option>Constantine</option>
                  </select>
                  <svg className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4F4F4F] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Categories Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium text-black mb-3 block">{t('searchResult.filters.categoriesLabel')}</label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder={t('searchResult.filters.categoriesPlaceholder')}
                    className="w-full px-3 py-2 border border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all mb-3"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {displayedCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedCategories.includes(category)
                          ? 'bg-black text-white'
                          : 'bg-[#F5F5F5] text-[#4F4F4F] hover:bg-[#EEEEEE]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="flex items-center gap-1 text-xs font-medium text-[#FF4000] hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <img src={showAllCategories ? ShowLessIcon : ShowMoreIcon} alt="Toggle" className="w-4 h-4" />
                  {showAllCategories ? t('searchResult.filters.showLess') : t('searchResult.filters.showMore')}
                </button>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium text-black mb-3 block">{t('searchResult.filters.priceLabel')}</label>
                <style>{`
                  input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #FF4000;
                    cursor: pointer;
                    margin-top: -6px;
                  }
                  input[type="range"]::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #FF4000;
                    cursor: pointer;
                    border: none;
                  }
                  input[type="range"]::-webkit-slider-runnable-track {
                    height: 4px;
                    border-radius: 2px;
                    background: linear-gradient(to right, #FF4000 0%, #FF4000 ${(priceRange.max / 300) * 100}%, #EEEEEE ${(priceRange.max / 300) * 100}%, #EEEEEE 100%);
                  }
                  input[type="range"]::-moz-range-track {
                    height: 4px;
                    border-radius: 2px;
                    background: #EEEEEE;
                  }
                  input[type="range"]::-moz-range-progress {
                    height: 4px;
                    border-radius: 2px;
                    background: #FF4000;
                  }
                `}</style>
                <input 
                  type="range" 
                  min="0" 
                  max="300" 
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                  className="w-full h-1 bg-[#EEEEEE] rounded-lg appearance-none cursor-pointer mb-3"
                />
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#EEEEEE] rounded-lg text-sm text-black focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
                    placeholder={t('searchResult.filters.priceMin')}
                  />
                  <span className="text-[#BCBCBC]">-</span>
                  <input 
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#EEEEEE] rounded-lg text-sm text-black focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
                    placeholder={t('searchResult.filters.priceMax')}
                  />
                </div>
              </div>

              {/* When Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-black mb-3">
                  <img src={DateIcon} alt="Date" className="w-5 h-5" />
                  {t('searchResult.filters.whenLabel')}
                </label>
                <input 
                  type="text"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EEEEEE] rounded-lg text-sm text-black focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all mb-3"
                />
                <div className="space-y-2">
                  {timeFilterOptions.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="timeFilter"
                        checked={selectedTimeFilter === key}
                        onChange={() => setSelectedTimeFilter(key)}
                        className="w-4 h-4 accent-[#FF4000] cursor-pointer"
                      />
                      <span className="text-sm text-[#4F4F4F]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Organizers Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium text-black mb-3 block">{t('searchResult.filters.organizersLabel')}</label>
                <div className="space-y-2">
                  {organizerOptions.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="organizer"
                        checked={selectedOrganizer === key}
                        onChange={() => setSelectedOrganizer(key)}
                        className="w-4 h-4 accent-[#FF4000] cursor-pointer"
                      />
                      <span className="text-sm text-[#4F4F4F]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Left column - Search results */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-4 lg:px-6 py-5 sm:py-6">
            {/* Header with results count and view controls */}
            <div className="flex items-center justify-between mb-7">
              <h1 className="text-xl md:text-lg font-semibold text-black">
                {t('searchResult.resultsCount', { count: filteredEvents.length })} {searchCategory && <span className="font-normal text-[#757575]">{t('searchResult.resultsFor')} {searchCategory}</span>}
              </h1>

              {/* View controls */}
              <div className="flex items-center gap-3">
                {/* Filter button */}
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="relative flex items-center gap-1 border border-[#EEEEEE] bg-white hover:bg-[#F8F8F8] transition-colors px-1 pe-3" 
                  style={{ borderRadius: '85.41px', height: '38px' }}
                >
                  {/* Filter icon on the left */}
                  <img 
                    src={isFilterOpen ? FilterBlackIcon : FilterIcon} 
                    alt="Filter" 
                    className="w-[30px] h-[30px]" 
                  />
                  <span className="text-sm font-medium text-black">{t('searchResult.filterButton')}</span>
                  {/* Badge count */}
                  {(selectedCategories.length > 0) && (
                    <span className="absolute -top-1 -end-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                      {selectedCategories.length}
                    </span>
                  )}
                </button>

                {/* View mode toggles */}
                <div className="flex items-center border border-[#EEEEEE] bg-white" style={{ borderRadius: '85.41px', height: '38px', padding: '0 4px' }}>
                  <button
                    onClick={() => setViewMode('list')}
                    className="w-[30px] h-[30px] flex items-center justify-center transition-opacity cursor-pointer"
                  >
                    <img 
                      src={ListIcon} 
                      alt={t('searchResult.viewMode.listAlt')} 
                      className="w-[30px] h-[30px] transition-opacity"
                      style={{ opacity: viewMode === 'list' ? '1' : '0.3' }}
                    />
                  </button> 
                  <button
                    onClick={() => setViewMode('grid')}
                    className="w-[30px] h-[30px] flex items-center justify-center transition-opacity cursor-pointer"
                  >
                    <img 
                      src={GridIcon} 
                      alt={t('searchResult.viewMode.gridAlt')} 
                      className="w-[30px] h-[30px] transition-opacity"
                      style={{ opacity: viewMode === 'grid' ? '1' : '0.3' }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Events grid */}
            <div className={`${
              viewMode === 'grid' 
                ? `grid gap-4 sm:gap-5 lg:gap-6 ${
                    isFilterOpen 
                      ? 'grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3' 
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3'
                  }`
                : 'flex flex-col gap-6 w-full'
            }`}>
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF4000]"></div>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="col-span-full">
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg className="w-14 h-14 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[#757575] text-sm mb-1">{t('searchResult.empty.message')}</p>
                    <button 
                      onClick={() => { setSelectedCategories([]); setPriceRange({ min: 0, max: 300 }); }}
                      className="mt-3 px-4 py-2 text-sm font-medium text-[#FF4000] border border-[#FF4000] rounded-full hover:bg-[#FFF4F3] transition-colors"
                    >
                      {t('searchResult.empty.clearFilters')}
                    </button>
                  </div>
                  {events.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-base font-semibold text-black mb-4">{t('searchResult.empty.suggestions', 'You might also like')}</h3>
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                        {events.slice(0, 6).map((event) => (
                          <EventCard
                            key={event.id}
                            eventId={event.id}
                            image={event.image}
                            title={event.title}
                            date={event.date}
                            venue={event.venue}
                            price={event.price}
                            isPast={event.isPast}
                            availableSpots={event.availableSpots}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : filteredEvents.map((event) => (
                viewMode === 'list' ? (
                  <div key={event.id} className="w-full">
                    <div className="w-full max-w-md lg:hidden">
                      <EventCard
                        eventId={event.id}
                        image={event.image}
                        title={event.title}
                        date={event.date}
                        venue={event.venue}
                        price={event.price}
                        badge={event.badge}
                        badgeColor={event.badgeColor}
                        isPast={event.isPast}
                        availableSpots={event.availableSpots}
                      />
                    </div>
                    <div className="hidden lg:block w-full">
                      <EventListCard
                        eventId={event.id}
                        image={event.image}
                        title={event.title}
                        date={event.date}
                        venue={event.venue}
                        price={event.price}
                        badge={event.badge}
                        badgeColor={event.badgeColor}
                        description={event.description}
                        isPast={event.isPast}
                        availableSpots={event.availableSpots}
                      />
                    </div>
                  </div>
                ) : (
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
                    isPast={event.isPast}
                    availableSpots={event.availableSpots}
                  />
                )
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Google Map (hidden on mobile, toggle via FAB) */}
        <div
          className={`${showMap ? 'fixed inset-0 z-40' : 'hidden'} md:relative md:flex md:z-auto ${isFilterOpen
            ? 'md:w-[260px] xl:w-[360px] 2xl:w-[420px]'
            : 'md:w-[550px] xl:w-[650px] 2xl:w-[750px]'
          } shrink-0 md:pt-6`}
          style={{ height: showMap ? '100%' : 'calc(100vh - 64px)' }}
        >
          <div className="w-full h-full relative rounded-lg overflow-hidden">
            {/* Google Map iframe — pins on whatever location the user
                searched for, falling back to a global view. */}
            <iframe
              key={mapQuery}
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed&z=${mapQuery === 'world' ? 2 : 10}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t('searchResult.map.title')}
            />

            {/* Map controls overlay */}
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

            {/* Event Map Card - Displayed when marker is clicked */}
            {selectedMapEvent && filteredEvents.some(e => e.id === selectedMapEvent.id) && (
              <div className="absolute top-20 start-1/2 -translate-x-1/2 z-50">
                <EventMapCard
                  eventId={selectedMapEvent.id}
                  image={selectedMapEvent.image}
                  title={selectedMapEvent.title}
                  date={selectedMapEvent.date}
                  venue={selectedMapEvent.venue}
                  price={selectedMapEvent.price}
                  badge={selectedMapEvent.badge}
                  badgeColor={selectedMapEvent.badgeColor}
                  onClose={() => setSelectedMapEvent(null)}
                />
              </div>
            )}

            {/* Price markers - Only show for filtered events */}
            {filteredEvents[1] && (
              <button 
                onClick={() => setSelectedMapEvent(filteredEvents[1])}
                className="absolute top-20 start-32 bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-semibold text-black cursor-pointer hover:bg-[#FF4000] hover:text-white transition-colors"
              >
                {filteredEvents[1].price}
              </button>
            )}
            {filteredEvents[5] && (
              <button 
                onClick={() => setSelectedMapEvent(filteredEvents[5])}
                className="absolute top-32 start-48 bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-semibold text-black cursor-pointer hover:bg-[#FF4000] hover:text-white transition-colors"
              >
                {filteredEvents[5].price}
              </button>
            )}
            {filteredEvents[0] && (
              <button 
                onClick={() => setSelectedMapEvent(filteredEvents[0])}
                className="absolute bottom-32 end-32 bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-semibold text-black cursor-pointer hover:bg-[#FF4000] hover:text-white transition-colors"
              >
                {filteredEvents[0].price}
              </button>
            )}
            {filteredEvents[4] && (
              <button 
                onClick={() => setSelectedMapEvent(filteredEvents[4])}
                className="absolute bottom-56 start-56 bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-semibold text-black cursor-pointer hover:bg-[#FF4000] hover:text-white transition-colors"
              >
                {filteredEvents[4].price}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
