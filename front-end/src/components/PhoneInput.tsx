import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import countries from "../data/countries";

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

interface PhoneInputProps {
  value: string;
  onChange: (
    fullPhone: string,
    countryCode: string,
    phoneNumber: string,
  ) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const PhoneInput = ({
  value,
  onChange,
  required = false,
  placeholder = "Phone number",
  className = "",
}: PhoneInputProps) => {
  const { t } = useTranslation("common");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    countries.find((c) => c.code === "DZ") || countries[0] || null,
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value && countries.length > 0 && !phoneNumber) {
      // Try to extract country code from value
      const matchedCountry = countries.find((c) =>
        value.startsWith(c.dialCode),
      );
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        setPhoneNumber(value.substring(matchedCountry.dialCode.length));
      }
    }
  }, [value, countries]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(value)) {
      setPhoneNumber(value);
      if (selectedCountry) {
        onChange(
          selectedCountry.dialCode + value,
          selectedCountry.dialCode,
          value,
        );
      }
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    onChange(country.dialCode + phoneNumber, country.dialCode, phoneNumber);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery),
  );

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Country Code Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black hover:border-[#FF4000] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all bg-white whitespace-nowrap"
        >
          <span className="text-lg">{selectedCountry?.flag || "🌍"}</span>
          <span className="font-medium">
            {selectedCountry?.dialCode || "+1"}
          </span>
          <svg
            className="w-4 h-4 text-[#BCBCBC]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute top-full start-0 mt-1 w-[280px] max-w-[calc(100vw-2rem)] bg-white border border-[#EEEEEE] rounded-lg shadow-lg z-50">
            {/* Search */}
            <div className="p-3 border-b border-[#EEEEEE]">
              <input
                type="text"
                placeholder={t("phoneInput.searchPlaceholder")}
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
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#FFF4F3] text-start transition-colors ${
                      selectedCountry?.code === country.code
                        ? "bg-[#FFF4F3]"
                        : ""
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm text-black flex-1 truncate">
                      {country.name}
                    </span>
                    <span className="text-sm text-[#757575] font-medium">
                      {country.dialCode}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-[#757575]">
                  {t("phoneInput.noCountriesFound")}
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
