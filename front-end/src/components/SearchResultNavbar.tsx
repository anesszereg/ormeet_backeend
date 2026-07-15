import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/Svgs/navbar/Logo.svg';
import LocationSearchIcon from '../assets/Svgs/searchResult/locationSearch.svg';
import SearchIcon from '../assets/Svgs/searchResult/search.svg';
import ProfilePhoto from '../assets/imges/photoProfil.jpg';
import { LanguageSwitcher } from './LanguageSwitcher';

// Mock data for suggestions
const locationSuggestions = ['California', 'Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'];
const eventTypeSuggestions = ['Music', 'Music Festival', 'Music Concert', 'Live Music', 'Classical Music'];

const SearchResultNavbar = () => {

  const [searchParams] = useSearchParams();

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');
  const [eventTypeQuery, setEventTypeQuery] = useState(searchParams.get('event') || '');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showEventTypeSuggestions, setShowEventTypeSuggestions] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLDivElement>(null);
  const eventTypeInputRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (locationQuery.trim()) {
      params.set('location', locationQuery.trim());
    }
    if (eventTypeQuery.trim()) {
      params.set('category', eventTypeQuery.trim());
    }
    navigate(`/browse-events?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
      if (eventTypeInputRef.current && !eventTypeInputRef.current.contains(event.target as Node)) {
        setShowEventTypeSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationQuery(value);
    setShowLocationSuggestions(value.length >= 3);
  };

  const handleEventTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEventTypeQuery(value);
    setShowEventTypeSuggestions(value.length >= 3);
  };

  const filteredLocationSuggestions = locationSuggestions.filter(loc =>
    loc.toLowerCase().includes(locationQuery.toLowerCase())
  );

  const filteredEventTypeSuggestions = eventTypeSuggestions.filter(type =>
    type.toLowerCase().includes(eventTypeQuery.toLowerCase())
  );

  return (
    <nav className="w-full h-14 md:h-16 bg-white px-3 sm:px-4 md:px-8 flex items-center justify-between shadow-md border-b border-[#D0D0D0] gap-2 md:gap-4">
      {/* Section 1: Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
      >
        <img src={Logo} alt="Ormeet Logo" className="w-6 h-8" />
        <span className="text-lg md:text-xl font-bold text-black">Ormeet</span>
      </Link>

      {/* Section 2: Search bar (centered via flex, no position absolute) */}
      <div className="hidden md:flex items-center bg-white border border-[#D0D0D0] focus-within:border-[#FF4000] focus-within:ring-2 focus-within:ring-[#FF4000]/10 transition-all" style={{ borderRadius: '85.41px', width: '420px', height: '38px', flexShrink: 0 }}>
        {/* Location icon inside the bar */}
        <div className="flex-shrink-0 ps-2">
          <img src={LocationSearchIcon} alt="" className="w-[30px] h-[30px]" />
        </div>

        {/* Location input */}
        <div className="relative flex-1" ref={locationInputRef}>
          <input
            type="text"
            value={locationQuery}
            onChange={handleLocationChange}
            onKeyPress={handleKeyPress}
            onFocus={() => locationQuery.length >= 3 && setShowLocationSuggestions(true)}
            placeholder={t('header.searchLocationPlaceholder')}
            className="w-full ps-2 pe-3 text-sm text-black placeholder:text-[#BCBCBC] outline-none bg-transparent text-start"
            style={{ height: '38px' }}
          />

          {showLocationSuggestions && filteredLocationSuggestions.length > 0 && (
            <div className="absolute start-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#EEEEEE] py-2 z-50">
              {filteredLocationSuggestions.map((location, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setLocationQuery(location);
                    setShowLocationSuggestions(false);
                  }}
                  className="w-full px-4 py-2 text-start text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] transition-colors"
                >
                  {location}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-[#D0D0D0] flex-shrink-0"></div>

        {/* Event type input */}
        <div className="relative flex-1" ref={eventTypeInputRef}>
          <input
            type="text"
            value={eventTypeQuery}
            onChange={handleEventTypeChange}
            onKeyPress={handleKeyPress}
            onFocus={() => eventTypeQuery.length >= 3 && setShowEventTypeSuggestions(true)}
            placeholder={t('header.searchEventPlaceholder')}
            className="w-full ps-3 pe-3 text-sm text-black placeholder:text-[#BCBCBC] outline-none bg-transparent text-start"
            style={{ height: '38px' }}
          />

          {showEventTypeSuggestions && filteredEventTypeSuggestions.length > 0 && (
            <div className="absolute start-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#EEEEEE] py-2 z-50">
              {filteredEventTypeSuggestions.map((type, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setEventTypeQuery(type);
                    setShowEventTypeSuggestions(false);
                  }}
                  className="w-full px-4 py-2 text-start text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] transition-colors"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search icon button inside the bar */}
        <button
          onClick={handleSearch}
          className="flex-shrink-0 pe-1 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src={SearchIcon} alt="Search" className="w-8 h-8" />
        </button>
      </div>

      {/* Mobile search icon - opens modal */}
      <button
        onClick={() => setIsMobileSearchOpen(true)}
        className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F8F8F8] transition-colors flex-shrink-0"
        aria-label="Search"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {/* Section 3: Language + Auth */}
      <div className="flex items-center gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
        {/* Language selector */}
        <LanguageSwitcher />

        {/* Auth section */}
        {user ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src={user.avatarUrl || ProfilePhoto}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-[#FF4000]"
              />
              <span className="hidden md:inline text-sm font-medium text-black">{user.name}</span>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute end-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#EEEEEE] py-1 z-50">
                <button
                  onClick={() => {
                    const dashboardPath = user.role === 'organizer' ? '/dashboard-organizer' : '/dashboard-attendee';
                    navigate(dashboardPath);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-start text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] transition-colors"
                >
                  {t('userMenu.dashboard')}
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full px-4 py-2 text-start text-sm text-[#FF4000] hover:bg-[#FFF4F3] transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-3 md:px-6 py-2 text-xs md:text-sm font-medium text-[#FF4000] border border-[#FF4000] rounded-full hover:bg-[#FFF4F3] transition-colors whitespace-nowrap"
            >
              {t('nav.login')}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="hidden sm:inline-flex px-3 md:px-6 py-2 text-xs md:text-sm font-medium text-white bg-[#FF4000] rounded-full hover:bg-[#E63900] transition-colors whitespace-nowrap"
            >
              {t('nav.signup')}
            </button>
          </div>
        )}
      </div>
      {/* Mobile search modal */}
      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#D0D0D0]">
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F8F8F8]"
              aria-label="Close"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
            <span className="text-base font-semibold text-black">{t('nav.browseEvents')}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-black ps-1">
                {t('header.searchLocationPlaceholder')}
              </label>
              <div className="flex items-center border border-[#D0D0D0] rounded-full h-12 px-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <input
                  type="text"
                  value={locationQuery}
                  onChange={handleLocationChange}
                  onKeyPress={handleKeyPress}
                  placeholder={t('header.searchLocationPlaceholder')}
                  className="flex-1 ps-2 text-sm text-black placeholder:text-[#BCBCBC] outline-none bg-transparent"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-black ps-1">
                {t('header.searchEventPlaceholder')}
              </label>
              <div className="flex items-center border border-[#D0D0D0] rounded-full h-12 px-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={eventTypeQuery}
                  onChange={handleEventTypeChange}
                  onKeyPress={handleKeyPress}
                  placeholder={t('header.searchEventPlaceholder')}
                  className="flex-1 ps-2 text-sm text-black placeholder:text-[#BCBCBC] outline-none bg-transparent"
                />
              </div>
            </div>
          </div>
          <div className="px-4 py-4 border-t border-[#D0D0D0]">
            <button
              onClick={() => {
                handleSearch();
                setIsMobileSearchOpen(false);
              }}
              className="w-full h-12 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors"
            >
              {t('nav.browseEvents')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default SearchResultNavbar;
