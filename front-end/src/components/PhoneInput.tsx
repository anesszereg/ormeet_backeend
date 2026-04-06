import { useState, useEffect, useRef } from 'react';

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

interface PhoneInputProps {
  value: string;
  onChange: (fullPhone: string, countryCode: string, phoneNumber: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const PhoneInput = ({ value, onChange, required = false, placeholder = 'Phone number', className = '' }: PhoneInputProps) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch countries from REST Countries API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag');
        const data = await response.json();
        
        const formattedCountries: Country[] = data
          .map((country: any) => ({
            name: country.name.common,
            code: country.cca2,
            dialCode: country.idd.root + (country.idd.suffixes?.[0] || ''),
            flag: country.flag,
          }))
          .filter((c: Country) => c.dialCode && c.dialCode !== '+')
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(formattedCountries);
        
        // Set default to US or first country
        const defaultCountry = formattedCountries.find(c => c.code === 'US') || formattedCountries[0];
        setSelectedCountry(defaultCountry);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
        // Fallback to a basic list
        const fallbackCountries: Country[] = [
          { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
          { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
          { name: 'Morocco', code: 'MA', dialCode: '+212', flag: '🇲🇦' },
        ];
        setCountries(fallbackCountries);
        setSelectedCountry(fallbackCountries[0]);
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Parse initial value
  useEffect(() => {
    if (value && countries.length > 0 && !phoneNumber) {
      // Try to extract country code from value
      const matchedCountry = countries.find(c => value.startsWith(c.dialCode));
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        setPhoneNumber(value.substring(matchedCountry.dialCode.length));
      }
    }
  }, [value, countries]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(value)) {
      setPhoneNumber(value);
      if (selectedCountry) {
        onChange(selectedCountry.dialCode + value, selectedCountry.dialCode, value);
      }
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    onChange(country.dialCode + phoneNumber, country.dialCode, phoneNumber);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery)
  );

  if (isLoading) {
    return (
      <div className="flex gap-2">
        <div className="w-32 h-[46px] bg-gray-100 animate-pulse rounded-lg"></div>
        <div className="flex-1 h-[46px] bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Country Code Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black hover:border-[#FF4000] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all bg-white whitespace-nowrap"
        >
          <span className="text-lg">{selectedCountry?.flag || '🌍'}</span>
          <span className="font-medium">{selectedCountry?.dialCode || '+1'}</span>
          <svg className="w-4 h-4 text-[#BCBCBC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-[#EEEEEE] rounded-lg shadow-lg z-50">
            {/* Search */}
            <div className="p-3 border-b border-[#EEEEEE]">
              <input
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-[#EEEEEE] rounded-lg text-sm focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10"
              />
            </div>
            
            {/* Country List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#FFF4F3] text-left transition-colors ${
                      selectedCountry?.code === country.code ? 'bg-[#FFF4F3]' : ''
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm text-black flex-1 truncate">{country.name}</span>
                    <span className="text-sm text-[#757575] font-medium">{country.dialCode}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-[#757575]">
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Phone Number Input */}
      <input
        type="tel"
        placeholder={placeholder}
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        required={required}
        className="flex-1 px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
      />
    </div>
  );
};

export default PhoneInput;
