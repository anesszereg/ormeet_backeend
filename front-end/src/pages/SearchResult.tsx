import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchResultNavbar from '../components/SearchResultNavbar';
import EventCard from '../components/EventCard';
import EventListCard from '../components/EventListCard';
import EventMapCard from '../components/EventMapCard';
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
}

const localeMap: Record<string, string> = { en: 'en-US', fr: 'fr-FR', ar: 'ar-DZ' };

const SearchResult = () => {
  const { t, i18n } = useTranslation('attendee');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [selectedLocation, setSelectedLocation] = useState('Algiers');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 300 });
  const [selectedDate, setSelectedDate] = useState(() => t('searchResult.defaultDate'));
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('Today');
  const [eventType, setEventType] = useState<'all' | 'free' | 'paid'>('all');
  const [expandedSection, setExpandedSection] = useState<string | null>('city');
  const [selectedMapEvent, setSelectedMapEvent] = useState<MappedEvent | null>(null);
  const [events, setEvents] = useState<MappedEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<MappedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [mapZoom, setMapZoom] = useState(12);
  const searchCategory = searchParams.get('category') || '';
  const searchLocation = searchParams.get('location') || '';

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const apiEvents = await eventService.getAllEvents({ status: 'published' });
        const mapped: MappedEvent[] = apiEvents.map((e: ApiEvent) => {
          const startDate = new Date(e.startAt);
          const lowestPrice = e.ticketTypes?.reduce((min, tt) => Math.min(min, Number(tt.price)), Infinity) ?? 0;
          return {
            id: e.id,
            image: e.images?.[0] || EventImageFallback,
            title: e.title,
            date: startDate.toLocaleDateString(localeMap[i18n.language] || 'en-US', { month: 'short', day: 'numeric' }),
            venue: e.venue?.name || '',
            price: lowestPrice === Infinity || lowestPrice === 0 ? 'Free' : `$${lowestPrice.toFixed(2)}`,
            description: e.shortDescription || '',
          };
        });
        setEvents(mapped);
        setFilteredEvents(mapped);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError(t('searchResult.empty.message'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter events based on search params and filters
  useEffect(() => {
    let filtered = [...events];

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

    // Filter by location (if needed)
    if (searchLocation && selectedLocation !== 'Oran') {
      filtered = filtered.filter(event =>
        event.venue.toLowerCase().includes(searchLocation.toLowerCase()) ||
        event.venue.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Filter by event type (free / paid)
    if (eventType === 'free') {
      filtered = filtered.filter(e => e.price === 'Free');
    } else if (eventType === 'paid') {
      filtered = filtered.filter(e => e.price !== 'Free');
    }

    setFilteredEvents(filtered);
  }, [events, searchCategory, searchLocation, selectedCategories, priceRange, selectedLocation, eventType]);

  const wilayas = ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Setif'];
  const categories = ['Music', 'Sports', 'Tech', 'Nightlife', 'Food & Drink', 'Business', 'Fitness'];
  const timeFilterOptions = [
    { key: 'Today', label: t('searchResult.filters.timeOptions.today') },
    { key: 'This Weekend', label: t('searchResult.filters.timeOptions.thisWeekend') },
    { key: 'This Week', label: t('searchResult.filters.timeOptions.thisWeek') },
    { key: 'This Month', label: t('searchResult.filters.timeOptions.thisMonth') },
  ];
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    const shouldLock = isMobile && (mobileView === 'map' || isFilterOpen);
    if (shouldLock) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileView, isFilterOpen]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      {/* Navbar */}
      <SearchResultNavbar />

      {/* Main content - Two columns */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Filter Panel */}
        {isFilterOpen && (
          <>
            {/* Mobile/Tablet: backdrop overlay */}
            <div
              onClick={() => setIsFilterOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              aria-hidden="true"
            />
            <div className="lg:w-[300px] bg-white lg:border-e border-[#EEEEEE] shrink-0 fixed lg:relative inset-x-0 bottom-0 lg:inset-auto z-50 lg:z-auto max-h-[85vh] lg:max-h-none rounded-t-2xl lg:rounded-none flex flex-col">
          <div className="flex flex-col h-full lg:h-auto">
            {/* Mobile handle bar */}
            <div className="lg:hidden flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-[#D0D0D0] rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEEEEE] lg:border-b-0">
              <h2 className="text-base font-semibold text-black">{t('searchResult.filters.title')}</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
                aria-label={t('searchResult.filters.close')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">

              {/* City / Wilaya */}
              <div className="border-b border-[#EEEEEE] pb-4 mb-4">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'city' ? null : 'city')}
                  className="w-full flex items-center justify-between mb-3 lg:cursor-default lg:pointer-events-none"
                >
                  <span className="text-sm font-semibold text-black flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {t('searchResult.filters.cityLabel')}
                  </span>
                  <svg className={`lg:hidden w-4 h-4 transition-transform ${expandedSection === 'city' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className={`${expandedSection === 'city' ? 'block' : 'hidden'} lg:block`}>
                  <div className="flex flex-wrap gap-2">
                    {wilayas.map((city) => (
                      <button
                        key={city}
                        onClick={() => setSelectedLocation(city)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          selectedLocation === city
                            ? 'bg-[#1A1A1A] text-white'
                            : 'bg-[#F5F5F5] text-[#4F4F4F] hover:bg-[#EEEEEE]'
                        }`}
                      >
                        {t(`searchResult.filters.cities.${city}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="border-b border-[#EEEEEE] pb-4 mb-4">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'categories' ? null : 'categories')}
                  className="w-full flex items-center justify-between mb-3 lg:cursor-default lg:pointer-events-none"
                >
                  <span className="text-sm font-semibold text-black">
                    {t('searchResult.filters.categoriesLabel')}
                    {selectedCategories.length > 0 && (
                      <span className="ms-2 text-xs font-normal text-[#FF4000]">({selectedCategories.length})</span>
                    )}
                  </span>
                  <svg className={`lg:hidden w-4 h-4 transition-transform ${expandedSection === 'categories' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className={`${expandedSection === 'categories' ? 'block' : 'hidden'} lg:block`}>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          selectedCategories.includes(category)
                            ? 'bg-[#FF4000] text-white'
                            : 'bg-[#F5F5F5] text-[#4F4F4F] hover:bg-[#EEEEEE]'
                        }`}
                      >
                        {t(`searchResult.filters.categories.${category}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* When */}
              <div className="border-b border-[#EEEEEE] pb-4 mb-4">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'when' ? null : 'when')}
                  className="w-full flex items-center justify-between mb-3 lg:cursor-default lg:pointer-events-none"
                >
                  <span className="text-sm font-semibold text-black flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {t('searchResult.filters.whenLabel')}
                  </span>
                  <svg className={`lg:hidden w-4 h-4 transition-transform ${expandedSection === 'when' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className={`${expandedSection === 'when' ? 'block' : 'hidden'} lg:block space-y-2`}>
                  {timeFilterOptions.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer py-1">
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

              {/* Event type (Free / Paid) */}
              <div className="border-b border-[#EEEEEE] pb-4 mb-4">
                <span className="text-sm font-semibold text-black block mb-3">{t('searchResult.filters.eventTypeLabel')}</span>
                <div className="flex gap-2">
                  {(['all', 'free', 'paid'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setEventType(type)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                        eventType === type
                          ? 'bg-[#1A1A1A] text-white'
                          : 'bg-[#F5F5F5] text-[#4F4F4F] hover:bg-[#EEEEEE]'
                      }`}
                    >
                      {type === 'all' ? t('searchResult.filters.eventTypeAll') : type === 'free' ? t('searchResult.filters.eventTypeFree') : t('searchResult.filters.eventTypePaid')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range (only show if not "free") */}
              {eventType !== 'free' && (
                <div className="pb-4 mb-4">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'price' ? null : 'price')}
                    className="w-full flex items-center justify-between mb-3 lg:cursor-default lg:pointer-events-none"
                  >
                    <span className="text-sm font-semibold text-black">
                      {t('searchResult.filters.priceLabel')} <span className="text-xs font-normal text-[#757575]">({priceRange.min} - {priceRange.max})</span>
                    </span>
                    <svg className={`lg:hidden w-4 h-4 transition-transform ${expandedSection === 'price' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <div className={`${expandedSection === 'price' ? 'block' : 'hidden'} lg:block`}>
                    <style>{`
                      .price-slider {
                        direction: ltr;
                      }
                      .price-slider::-webkit-slider-thumb {
                        appearance: none;
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: #FF4000;
                        cursor: pointer;
                        margin-top: -7px;
                        border: 2px solid white;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                      }
                      .price-slider::-moz-range-thumb {
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: #FF4000;
                        cursor: pointer;
                        border: 2px solid white;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                      }
                      .price-slider::-webkit-slider-runnable-track {
                        height: 4px;
                        border-radius: 2px;
                        background: linear-gradient(to right, #FF4000 0%, #FF4000 ${(priceRange.max / 300) * 100}%, #EEEEEE ${(priceRange.max / 300) * 100}%, #EEEEEE 100%);
                      }
                    `}</style>
                    <input
                      type="range"
                      min="0"
                      max="300"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                      className="price-slider w-full h-1 bg-[#EEEEEE] rounded-lg appearance-none cursor-pointer mb-4"
                      dir="ltr"
                    />
                    <div className="flex items-center gap-2" dir="ltr">
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-[#EEEEEE] rounded-lg text-sm text-black focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
                        placeholder={t('searchResult.filters.priceMin')}
                      />
                      <span className="text-[#BCBCBC]">-</span>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-[#EEEEEE] rounded-lg text-sm text-black focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
                        placeholder={t('searchResult.filters.priceMax')}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky footer with Clear + Apply */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[#EEEEEE] bg-white lg:sticky lg:bottom-0">
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setPriceRange({ min: 0, max: 300 });
                  setEventType('all');
                  setSelectedLocation('Algiers');
                  setSelectedTimeFilter('Today');
                }}
                className="flex-1 h-11 text-sm font-medium text-[#1A1A1A] border border-[#D0D0D0] rounded-full hover:bg-[#F5F5F5] transition-colors"
              >
                {t('searchResult.filters.clearAll')}
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 h-11 text-sm font-semibold text-white bg-[#FF4000] rounded-full hover:bg-[#E63900] transition-colors"
              >
                {t('searchResult.filters.showResults', { count: filteredEvents.length })}
              </button>
            </div>
          </div>
          </div>
          </>
        )}

        {/* Left column - Search results */}
        <div className={`flex-1 overflow-y-auto ${mobileView === 'map' ? 'hidden lg:block' : 'block'}`}>
          <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 lg:py-6">
            {/* Header with results count and view controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 lg:mb-7">
              <h1 className="text-base md:text-lg font-semibold text-black">
                {t('searchResult.resultsCount', { count: filteredEvents.length })} {searchCategory && <span className="font-normal text-[#757575]">{t('searchResult.resultsFor')} {searchCategory}</span>}
              </h1>

              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                {/* Filter button */}
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`relative flex items-center gap-2 border transition-colors px-4 ${
                    isFilterOpen
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-white text-black border-[#EEEEEE] hover:bg-[#F8F8F8]'
                  }`}
                  style={{ borderRadius: '85.41px', height: '38px' }}
                  aria-label={t('searchResult.filterButton')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="14" y2="6" />
                    <line x1="20" y1="6" x2="20" y2="6" />
                    <circle cx="17" cy="6" r="2.5" fill="currentColor" stroke="none" />
                    <line x1="4" y1="12" x2="6" y2="12" />
                    <line x1="12" y1="12" x2="20" y2="12" />
                    <circle cx="9" cy="12" r="2.5" fill="currentColor" stroke="none" />
                    <line x1="4" y1="18" x2="12" y2="18" />
                    <line x1="18" y1="18" x2="20" y2="18" />
                    <circle cx="15" cy="18" r="2.5" fill="currentColor" stroke="none" />
                  </svg>
                  <span className="text-sm font-medium">{t('searchResult.filterButton')}</span>
                  {(selectedCategories.length > 0) && (
                    <span className={`absolute -top-1 -end-1 w-5 h-5 text-xs rounded-full flex items-center justify-center ${
                      isFilterOpen ? 'bg-[#FF4000] text-white' : 'bg-[#1A1A1A] text-white'
                    }`}>
                      {selectedCategories.length}
                    </span>
                  )}
                </button>

                {/* Mobile-only Map toggle button */}
                <button
                  onClick={() => setMobileView(mobileView === 'map' ? 'list' : 'map')}
                  className="lg:hidden flex items-center gap-1.5 border border-[#EEEEEE] bg-white hover:bg-[#F8F8F8] transition-colors px-3"
                  style={{ borderRadius: '85.41px', height: '38px' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                    <line x1="8" y1="2" x2="8" y2="18" />
                    <line x1="16" y1="6" x2="16" y2="22" />
                  </svg>
                  <span className="text-sm font-medium text-black">
                    {mobileView === 'map' ? 'List' : 'Map'}
                  </span>
                </button>

                {/* View mode toggles */}
                <div className="flex items-center border border-[#EEEEEE] bg-white" style={{ borderRadius: '85.41px', height: '38px', padding: '0 4px' }}>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`w-[30px] h-[30px] flex items-center justify-center rounded-full transition-all cursor-pointer ${viewMode === 'list' ? 'bg-[#1A1A1A] text-white' : 'text-[#BCBCBC] hover:text-[#4F4F4F]'}`}
                    aria-label={t('searchResult.viewMode.listAlt')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`w-[30px] h-[30px] flex items-center justify-center rounded-full transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-[#1A1A1A] text-white' : 'text-[#BCBCBC] hover:text-[#4F4F4F]'}`}
                    aria-label={t('searchResult.viewMode.gridAlt')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Events grid */}
            <div className={`${
              viewMode === 'grid'
                ? `grid gap-4 sm:gap-5 lg:gap-6 ${
                    isFilterOpen
                      ? 'grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3'
                      : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3'
                  }`
                : 'flex flex-col gap-4 sm:gap-6 w-full'
            }`}>
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF4000]"></div>
                </div>
              ) : error && filteredEvents.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20">
                  <p className="text-[#757575] text-sm">{error}</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20">
                  <p className="text-[#757575] text-sm">{t('searchResult.empty.message')}</p>
                  <button 
                    onClick={() => {
                      setSelectedCategories([]);
                      setPriceRange({ min: 0, max: 300 });
                    }}
                    className="mt-4 px-4 py-2 text-sm font-medium text-[#FF4000] border border-[#FF4000] rounded-full hover:bg-[#FFF4F3] transition-colors"
                  >
                    {t('searchResult.empty.clearFilters')}
                  </button>
                </div>
              ) : filteredEvents.map((event) => (
                viewMode === 'list' ? (
                  <div key={event.id} className="w-full">
                    {/* Petits écrans (<1024px): Toujours EventCard vertical - Image en haut, infos en bas */}
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
                      />
                    </div>
                    {/* Grands écrans (≥1024px): Toujours EventListCard horizontal - Image à gauche, infos à droite */}
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
                  />
                )
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Google Map */}
        <div
          className={`${
            mobileView === 'map' ? 'fixed inset-0 top-14 z-30 lg:relative lg:inset-auto lg:top-auto lg:z-auto' : 'hidden lg:block'
          } ${
            isFilterOpen
              ? 'lg:w-[260px] xl:w-[360px] 2xl:w-[420px]'
              : 'lg:w-[550px] xl:w-[650px] 2xl:w-[750px]'
          } relative shrink-0 lg:pt-6`}
          style={{ height: 'calc(100vh - 56px)' }}
        >
          <div className="w-full h-full relative rounded-lg overflow-hidden">
            {/* Google Map iframe */}
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3355089.3864504!2d3.0590!3d36.7762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAlgiers%2C%20Algeria!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s&z=${mapZoom}`}
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
              <button 
                onClick={() => setMapZoom(prev => Math.min(prev + 1, 20))}
                className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-[#F8F8F8] transition-colors cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 5V15M5 10H15" stroke="#4F4F4F" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Zoom out */}
              <button 
                onClick={() => setMapZoom(prev => Math.max(prev - 1, 1))}
                className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-[#F8F8F8] transition-colors cursor-pointer"
              >
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

            {/* Mobile close map button */}
            {mobileView === 'map' && (
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className="lg:hidden fixed top-[68px] end-3 z-[60] w-11 h-11 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#F8F8F8] active:scale-95 transition-all"
                style={{ pointerEvents: 'auto' }}
                aria-label={t('eventDetails.location.closeMap')}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            )}

            {/* Price markers - Only show for filtered events */}
            {filteredEvents[1] && (
              <button
                onClick={() => setSelectedMapEvent(filteredEvents[1])}
                className="hidden lg:flex absolute top-20 start-32 bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-semibold text-black cursor-pointer hover:bg-[#FF4000] hover:text-white transition-colors"
              >
                {filteredEvents[1].price === 'Free' ? t('searchResult.freePrice') : filteredEvents[1].price}
              </button>
            )}
            {filteredEvents[5] && (
              <button
                onClick={() => setSelectedMapEvent(filteredEvents[5])}
                className="hidden lg:flex absolute top-32 start-48 bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-semibold text-black cursor-pointer hover:bg-[#FF4000] hover:text-white transition-colors"
              >
                {filteredEvents[5].price === 'Free' ? t('searchResult.freePrice') : filteredEvents[5].price}
              </button>
            )}
            {filteredEvents[0] && (
              <button
                onClick={() => setSelectedMapEvent(filteredEvents[0])}
                className="hidden lg:flex absolute bottom-32 end-32 bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-semibold text-black cursor-pointer hover:bg-[#FF4000] hover:text-white transition-colors"
              >
                {filteredEvents[0].price === 'Free' ? t('searchResult.freePrice') : filteredEvents[0].price}
              </button>
            )}
            {filteredEvents[4] && (
              <button
                onClick={() => setSelectedMapEvent(filteredEvents[4])}
                className="hidden lg:flex absolute bottom-56 start-56 bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-semibold text-black cursor-pointer hover:bg-[#FF4000] hover:text-white transition-colors"
              >
                {filteredEvents[4].price === 'Free' ? t('searchResult.freePrice') : filteredEvents[4].price}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
