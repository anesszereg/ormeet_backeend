import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Svgs/Logo.svg';
import LoginImage from '../assets/imges/login.jpg';
import MusicIcon from '../assets/Svgs/music.svg';
import MusicColorIcon from '../assets/Svgs/music color.svg';
import TicketIcon from '../assets/Svgs/ticket.svg';
import TicketColorIcon from '../assets/Svgs/ticket color.svg';
import TimeIcon from '../assets/Svgs/time.svg';
import TimesColorIcon from '../assets/Svgs/times color.svg';
import ListeIcon from '../assets/Svgs/liste.svg';
import ListeColorIcon from '../assets/Svgs/liste color.svg';
import FoodIcon from '../assets/Svgs/food.svg';
import FoodColorIcon from '../assets/Svgs/food color.svg';
import BusinessIcon from '../assets/Svgs/business.svg';
import BusinessColorIcon from '../assets/Svgs/business color.svg';

type UserType = 'attend' | 'organize' | null;

const OnboardingChoice = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<UserType>(null);

  const handleSelection = (type: UserType) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType === 'organize') {
      // Store user type in localStorage for registration
      localStorage.setItem('userType', 'organize');
      navigate('/register');
    } else if (selectedType === 'attend') {
      // Store user type in localStorage for registration
      localStorage.setItem('userType', 'attend');
      navigate('/register');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 md:p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-[520px] flex flex-col gap-4 sm:gap-6 py-6 sm:py-8 md:py-4">
          {/* Logo */}
          <div>
            <img src={Logo} alt="Ormeet Logo" className="w-7 h-[38px]" />
          </div>

          {/* Welcome Text */}
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl sm:text-[28px] font-bold text-black">Welcome to Ormeet!</h1>
            
            {/* Progress Bar */}
            <div className="flex gap-2">
              <div className="h-1 w-[100px] bg-black rounded-full"></div>
              <div className="h-1 w-[100px] bg-[#EEEEEE] rounded-full"></div>
            </div>
          </div>

          {/* Instruction Text */}
          <div>
            <h2 className="text-lg sm:text-xl text-[#4F4F4F]">
              Tell us how you'd like to use Ormeet.
            </h2>
          </div>

          {/* Choice Cards */}
          <div className="flex flex-col gap-4">
            {/* Attend Events Card */}
            <button
              onClick={() => handleSelection('attend')}
              className={`w-full p-5 sm:p-6 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                selectedType === 'attend'
                  ? 'border-[#FF4000] bg-[#FFF4F3]'
                  : 'border-[#EEEEEE] bg-white hover:border-[#CCCCCC]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base sm:text-lg font-semibold text-black">
                      I want to <span className="font-bold">attend</span> events
                    </span>
                  </div>
                  <p className="text-sm text-[#4F4F4F]">
                    Find and book events you'll love.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <img 
                    src={selectedType === 'attend' ? MusicColorIcon : MusicIcon} 
                    alt="Music" 
                    className="w-9 h-9 sm:w-11 sm:h-11" 
                  />
                  <img 
                    src={selectedType === 'attend' ? TicketColorIcon : TicketIcon} 
                    alt="Ticket" 
                    className="w-9 h-9 sm:w-11 sm:h-11" 
                  />
                  <img 
                    src={selectedType === 'attend' ? ListeColorIcon : ListeIcon} 
                    alt="Liste" 
                    className="w-9 h-9 sm:w-11 sm:h-11" 
                  />
                </div>
                <div className="flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedType === 'attend'
                      ? 'border-[#FF4000] bg-[#FF4000]'
                      : 'border-[#CCCCCC]'
                  }`}>
                    {selectedType === 'attend' && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </div>
            </button>

            {/* Organize Events Card */}
            <button
              onClick={() => handleSelection('organize')}
              className={`w-full p-5 sm:p-6 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                selectedType === 'organize'
                  ? 'border-[#FF4000] bg-[#FFF4F3]'
                  : 'border-[#EEEEEE] bg-white hover:border-[#CCCCCC]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base sm:text-lg font-semibold text-black">
                      I want to <span className="font-bold">organize</span> events
                    </span>
                  </div>
                  <p className="text-sm text-[#4F4F4F]">
                    Create, manage, and sell tickets for your events.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <img 
                    src={selectedType === 'organize' ? TimesColorIcon : TimeIcon} 
                    alt="Time" 
                    className="w-9 h-9 sm:w-11 sm:h-11" 
                  />
                  <img 
                    src={selectedType === 'organize' ? FoodColorIcon : FoodIcon} 
                    alt="Food" 
                    className="w-9 h-9 sm:w-11 sm:h-11" 
                  />
                  <img 
                    src={selectedType === 'organize' ? BusinessColorIcon : BusinessIcon} 
                    alt="Business" 
                    className="w-9 h-9 sm:w-11 sm:h-11" 
                  />
                </div>
                <div className="flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedType === 'organize'
                      ? 'border-[#FF4000] bg-[#FF4000]'
                      : 'border-[#CCCCCC]'
                  }`}>
                    {selectedType === 'organize' && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedType}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF4000] text-white text-sm font-semibold rounded-full hover:bg-[#E63900] transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FF4000] mt-2 cursor-pointer"
          >
            Let's get started
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <img 
          src={LoginImage} 
          alt="Event Concert" 
          className="w-full h-full object-cover" 
        />
      </div>
    </div>
  );
};

export default OnboardingChoice;
