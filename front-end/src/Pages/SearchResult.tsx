import { useState } from 'react';
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

// Mock events data
import Event1 from '../assets/imges/event myticket 1.jpg';
import Event2 from '../assets/imges/event myticket 2.jpg';
import Event3 from '../assets/imges/event myticket 3.jpg';
import Event4 from '../assets/imges/event myticket 5.jpg';
import Event5 from '../assets/imges/event myticket 6.jpg';
import Event6 from '../assets/imges/event myticket 9.jpg';

const mockEvents = [
  {
    id: '1',
    image: Event1,
    title: 'Midnight Echo: Indie Rock Night',
    date: 'Jul 20',
    venue: 'Luna Hall',
    price: '$65.99',
    badge: 'Trending',
    badgeColor: '#4CAF50',
    description: 'Experience an unforgettable night of indie rock with emerging artists.',
  },
  {
    id: '2',
    image: Event2,
    title: 'Voices of Summer: Acoustic Vibes',
    date: 'Aug 25',
    venue: 'Sunset Gardens',
    price: '$35.99',
    description: 'Relax to soothing acoustic melodies in a beautiful outdoor setting.',
  },
  {
    id: '3',
    image: Event3,
    title: 'Jazz Over the Bay',
    date: 'Sep 10',
    venue: 'Bayview Pavilion',
    price: '$65.99',
    badge: 'Almost full',
    badgeColor: '#FF9800',
    description: 'Enjoy smooth jazz performances with stunning waterfront views.',
  },
  {
    id: '4',
    image: Event4,
    title: 'Strings in the Wild: Outdoor Classical Evening',
    date: 'Sep 20',
    venue: 'Redwood Hills Amphitheatre',
    price: '$65.99',
    badge: 'Only few left',
    badgeColor: '#FF9800',
    description: 'Classical music under the stars in a breathtaking natural amphitheatre.',
  },
  {
    id: '5',
    image: Event5,
    title: 'Soul City Nights: Live Performances',
    date: 'Oct 6',
    venue: 'Vibe Lounge',
    price: '$50.99',
    badge: 'Only few left',
    badgeColor: '#FF9800',
    description: 'Groove to soulful beats with talented local and international artists.',
  },
  {
    id: '6',
    image: Event6,
    title: 'Electric Dreams: EDM Festival',
    date: 'Oct 15',
    venue: 'Neon Arena',
    price: '$85.99',
    description: 'Dance all night to the hottest EDM tracks from world-class DJs.',
  },
];

const SearchResult = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Oran');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 300 });
  const [selectedDate, setSelectedDate] = useState('Apr 20, 2025');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('Today');
  const [selectedOrganizer, setSelectedOrganizer] = useState('Events by Organizers You Follow');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedMapEvent, setSelectedMapEvent] = useState<typeof mockEvents[0] | null>(null);

  const categories = ['Music', 'Sports', 'Business', 'Arts', 'Food & Drink', 'Health', 'Technology', 'Fashion'];
  const displayedCategories = showAllCategories ? categories : categories.slice(0, 4);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      {/* Navbar */}
      <SearchResultNavbar />

      {/* Main content - Two columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="w-[227px] bg-white border-r border-[#EEEEEE] overflow-y-auto shrink-0">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-black">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} className="hover:opacity-70 transition-opacity">
                  <img src={CancelIcon} alt="Close" className="w-6 h-6" />
                </button>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-black mb-3">
                  <img src={LocationIcon} alt="Location" className="w-5 h-5" />
                  Location
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
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4F4F4F] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Categories Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium text-black mb-3 block">Categories</label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="e.g. Music, Sports, Business"
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
                  className="flex items-center gap-1 text-xs font-medium text-[#FF4000] hover:opacity-80 transition-opacity"
                >
                  <img src={showAllCategories ? ShowLessIcon : ShowMoreIcon} alt="Toggle" className="w-4 h-4" />
                  {showAllCategories ? 'Show Less' : 'Show More'}
                </button>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium text-black mb-3 block">Price</label>
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
                    placeholder="Minimum"
                  />
                  <span className="text-[#BCBCBC]">-</span>
                  <input 
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#EEEEEE] rounded-lg text-sm text-black focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
                    placeholder="Maximum"
                  />
                </div>
              </div>

              {/* When Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-black mb-3">
                  <img src={DateIcon} alt="Date" className="w-5 h-5" />
                  When
                </label>
                <input 
                  type="text"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EEEEEE] rounded-lg text-sm text-black focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all mb-3"
                />
                <div className="space-y-2">
                  {['Today', 'This Weekend', 'This Week', 'This Month'].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="timeFilter"
                        checked={selectedTimeFilter === option}
                        onChange={() => setSelectedTimeFilter(option)}
                        className="w-4 h-4 accent-[#FF4000] cursor-pointer"
                      />
                      <span className="text-sm text-[#4F4F4F]">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Organizers Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium text-black mb-3 block">Organizers</label>
                <div className="space-y-2">
                  {['Events by Organizers You Follow', 'Events by All Organizers'].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="organizer"
                        checked={selectedOrganizer === option}
                        onChange={() => setSelectedOrganizer(option)}
                        className="w-4 h-4 accent-[#FF4000] cursor-pointer"
                      />
                      <span className="text-sm text-[#4F4F4F]">{option}</span>
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
                10 Results <span className="font-normal text-[#757575]">for Music</span>
              </h1>

              {/* View controls */}
              <div className="flex items-center gap-3">
                {/* Filter button */}
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="relative flex items-center gap-1 border border-[#EEEEEE] bg-white hover:bg-[#F8F8F8] transition-colors px-1 pr-3" 
                  style={{ borderRadius: '85.41px', height: '38px' }}
                >
                  {/* Filter icon on the left */}
                  <img 
                    src={isFilterOpen ? FilterBlackIcon : FilterIcon} 
                    alt="Filter" 
                    className="w-[30px] h-[30px]" 
                  />
                  <span className="text-sm font-medium text-black">Filter</span>
                  {/* Badge count */}
                  {(selectedCategories.length > 0) && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                      {selectedCategories.length}
                    </span>
                  )}
                </button>

                {/* View mode toggles */}
                <div className="flex items-center border border-[#EEEEEE] bg-white" style={{ borderRadius: '85.41px', height: '38px', padding: '0 4px' }}>
                  <button
                    onClick={() => setViewMode('list')}
                    className="w-[30px] h-[30px] flex items-center justify-center transition-opacity"
                  >
                    <img 
                      src={ListIcon} 
                      alt="List view" 
                      className="w-[30px] h-[30px] transition-opacity"
                      style={{ opacity: viewMode === 'list' ? '1' : '0.3' }}
                    />
                  </button> 
                  <button
                    onClick={() => setViewMode('grid')}
                    className="w-[30px] h-[30px] flex items-center justify-center transition-opacity"
                  >
                    <img 
                      src={GridIcon} 
                      alt="Grid view" 
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
              {mockEvents.map((event) => (
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
          className={`${isFilterOpen
            ? 'w-[260px] xl:w-[360px] 2xl:w-[420px]'
            : 'w-[550px] xl:w-[650px] 2xl:w-[750px]'
          } relative shrink-0 pt-6`}
          style={{ height: 'calc(100vh - 64px)' }}
        >
          <div className="w-full h-full relative rounded-lg overflow-hidden">
            {/* Google Map iframe */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3355089.3864504!2d-121.4944!3d37.2719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb9fe5f285e3d%3A0x8b5109a227086f55!2sCalifornia%2C%20USA!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Event locations map"
            />

            {/* Map controls overlay */}
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

            {/* Event Map Card - Displayed when marker is clicked */}
            {selectedMapEvent && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50">
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

            {/* Price markers */}
            <button 
              onClick={() => setSelectedMapEvent(mockEvents[1])}
              className="absolute top-20 left-32 bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-semibold text-black cursor-pointer hover:bg-[#FF4000] hover:text-white transition-colors"
            >
              from $37.99
            </button>
            <button 
              onClick={() => setSelectedMapEvent(mockEvents[5])}
              className="absolute top-32 left-48 bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-semibold text-black cursor-pointer hover:bg-[#FF4000] hover:text-white transition-colors"
            >
              from $40.99
            </button>
            <button 
              onClick={() => setSelectedMapEvent(mockEvents[0])}
              className="absolute top-48 left-24 bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-semibold text-black cursor-pointer hover:bg-[#FF4000] hover:text-white transition-colors"
            >
              from $65.99
            </button>
            <button 
              onClick={() => setSelectedMapEvent(mockEvents[1])}
              className="absolute bottom-48 left-40 bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-semibold text-black cursor-pointer hover:bg-[#FF4000] hover:text-white transition-colors"
            >
              from $37.99
            </button>
            <button 
              onClick={() => setSelectedMapEvent(mockEvents[2])}
              className="absolute bottom-32 right-32 bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-semibold text-black cursor-pointer hover:bg-[#FF4000] hover:text-white transition-colors"
            >
              from $65.99
            </button>
            <button 
              onClick={() => setSelectedMapEvent(mockEvents[4])}
              className="absolute bottom-56 left-56 bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-semibold text-black cursor-pointer hover:bg-[#FF4000] hover:text-white transition-colors"
            >
              from $40.99
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
