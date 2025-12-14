import { useState, useRef, useEffect } from 'react';
import Logo from '../assets/Svgs/navbar/Logo.svg';
import LangueIcon from '../assets/Svgs/navbar/langue.svg';
import LocationSearchIcon from '../assets/Svgs/searchResult/locationSearch.svg';
import SearchIcon from '../assets/Svgs/searchResult/search.svg';

// Mock data for suggestions
const locationSuggestions = ['California', 'Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'];
const eventTypeSuggestions = ['Music', 'Music Festival', 'Music Concert', 'Live Music', 'Classical Music'];

const SearchResultNavbar = () => {
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [locationQuery, setLocationQuery] = useState('California');
  const [eventTypeQuery, setEventTypeQuery] = useState('Music');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showEventTypeSuggestions, setShowEventTypeSuggestions] = useState(false);
  
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLDivElement>(null);
  const eventTypeInputRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    if (locationQuery.trim() || eventTypeQuery.trim()) {
      console.log('Searching for:', { location: locationQuery, eventType: eventTypeQuery });
      // TODO: Implement actual search logic
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
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

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setIsLanguageMenuOpen(false);
  };

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
    <nav className="w-full h-16 bg-white px-4 md:px-8 flex items-center justify-between shadow-md border-b border-[#D0D0D0]">
      {/* Left section: Logo */}
      <div className="flex items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={Logo} alt="Ormeet Logo" className="w-6 h-8" />
          <span className="text-xl font-bold text-black">Ormeet</span>
        </div>
      </div>

      {/* Center: Search bar */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-white border border-[#D0D0D0] focus-within:border-[#FF4000] focus-within:ring-2 focus-within:ring-[#FF4000]/10 transition-all" style={{ borderRadius: '85.41px', width: '420px', height: '38px' }}>
        {/* Location icon on the left */}
        <img 
          src={LocationSearchIcon} 
          alt="Location" 
          className="absolute left-1 top-1/2 -translate-y-1/2 w-[30px] h-[30px] pointer-events-none" 
        />
        
        {/* Location input */}
        <div className="relative flex items-center flex-1" ref={locationInputRef}>
          <input
            type="text"
            value={locationQuery}
            onChange={handleLocationChange}
            onKeyPress={handleKeyPress}
            onFocus={() => locationQuery.length >= 3 && setShowLocationSuggestions(true)}
            placeholder="Search location"
            className="w-full pl-11 pr-3 text-sm text-black placeholder:text-[#BCBCBC] outline-none bg-transparent"
            style={{ height: '38px' }}
          />
            
          {showLocationSuggestions && filteredLocationSuggestions.length > 0 && (
            <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#EEEEEE] py-2 z-50">
              {filteredLocationSuggestions.map((location, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setLocationQuery(location);
                    setShowLocationSuggestions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] transition-colors"
                >
                  {location}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-[#D0D0D0] self-center"></div>
        
        {/* Event type input */}
        <div className="relative flex items-center flex-1" ref={eventTypeInputRef}>
          <input
            type="text"
            value={eventTypeQuery}
            onChange={handleEventTypeChange}
            onKeyPress={handleKeyPress}
            onFocus={() => eventTypeQuery.length >= 3 && setShowEventTypeSuggestions(true)}
            placeholder="Event type"
            className="w-full pl-3 pr-10 text-sm text-black placeholder:text-[#BCBCBC] outline-none bg-transparent"
            style={{ height: '38px' }}
          />
            
          {showEventTypeSuggestions && filteredEventTypeSuggestions.length > 0 && (
            <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#EEEEEE] py-2 z-50">
              {filteredEventTypeSuggestions.map((type, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setEventTypeQuery(type);
                    setShowEventTypeSuggestions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] transition-colors"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search icon on the right */}
        <img 
          src={SearchIcon} 
          alt="Search" 
          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={handleSearch}
        />
      </div>

      {/* Right section: Language + Auth */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Language selector */}
        <div className="relative" ref={languageMenuRef}>
          <button
            onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src={LangueIcon} alt="Language" className="w-9 h-9" />
            <span className="text-sm font-medium text-[#4F4F4F]">{selectedLanguage}</span>
          </button>

        {isLanguageMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-24 bg-white rounded-lg shadow-lg border border-[#EEEEEE] py-1 z-50">
            {['EN', 'FR', 'AR'].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageSelect(lang)}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-[#FFF4F3] text-[#FF4000] font-medium'
                    : 'text-[#4F4F4F] hover:bg-[#F8F8F8]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        )}
      </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <button className="px-6 py-2 text-sm font-medium text-[#FF4000] border border-[#FF4000] rounded-full hover:bg-[#FFF4F3] transition-colors">
            Log in
          </button>
          <button className="px-6 py-2 text-sm font-medium text-white bg-[#FF4000] rounded-full hover:bg-[#E63900] transition-colors">
            Sign up
          </button>
        </div>
      </div>
    </nav>
  );
};

export default SearchResultNavbar;
