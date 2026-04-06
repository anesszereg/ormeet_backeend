import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/Svgs/navbar/Logo.svg';
import LangueIcon from '../assets/Svgs/navbar/langue.svg';
import ProfileImage from '../assets/imges/photoProfil.jpg';

interface EventDetailsNavbarProps {
  isLoggedIn?: boolean;
}

const EventDetailsNavbar = ({ isLoggedIn = false }: EventDetailsNavbarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setIsLanguageMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="w-full h-16 bg-white px-4 md:px-8 flex items-center justify-between border-b border-[#D0D0D0]">
      {/* Left section: Logo */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src={Logo} alt="Ormeet Logo" className="w-6 h-8" />
          <span className="text-xl font-bold text-black">Ormeet</span>
        </Link>
      </div>

      {/* Right section: Need Assistance + Language + Auth/Profile */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Need Assistance Button */}
        <button className="px-6 py-2 text-[#FF4000] border border-[#FF4000] rounded-full hover:bg-[#FFF4F3] transition-colors text-sm font-semibold">
          Need Assistance?
        </button>

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

        {/* Conditional: Profile icon with dropdown or Auth buttons */}
        {isLoggedIn && user ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#FF4000] transition-all"
            >
              <img src={user.avatarUrl || ProfileImage} alt="Profile" className="w-full h-full object-cover" />
            </button>

            {/* Profile Dropdown menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#EEEEEE] py-2 z-50">
                {/* User Info Section */}
                {user && (
                  <div className="px-4 py-3 border-b border-[#EEEEEE]">
                    <p className="text-sm font-semibold text-black truncate">{user.name}</p>
                    <p className="text-xs text-[#757575] truncate">{user.email}</p>
                    {user.emailVerified && (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs text-[#34A853]">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                )}
                <a
                  href="/profile"
                  className="block px-4 py-2.5 text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] hover:text-[#FF4000] transition-colors"
                >
                  Profile
                </a>
                <a
                  href="/dashboard-attendee"
                  className="block px-4 py-2.5 text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] hover:text-[#FF4000] transition-colors"
                >
                  My Tickets
                </a>
                <a
                  href="/settings"
                  className="block px-4 py-2.5 text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] hover:text-[#FF4000] transition-colors"
                >
                  Settings
                </a>
                <a
                  href="/help"
                  className="block px-4 py-2.5 text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] hover:text-[#FF4000] transition-colors"
                >
                  Help / Support
                </a>
                <div className="border-t border-[#EEEEEE] my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#FF4000] hover:bg-[#FFF4F3] transition-colors font-medium"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link 
              to="/login"
              className="px-6 py-2 text-sm font-medium text-[#FF4000] border border-[#FF4000] rounded-full hover:bg-[#FFF4F3] transition-colors"
            >
              Log in
            </Link>
            <Link 
              to="/register"
              className="px-6 py-2 text-sm font-medium text-white bg-[#FF4000] rounded-full hover:bg-[#E63900] transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default EventDetailsNavbar;
