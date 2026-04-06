import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Svgs/Logo.svg';
import LoginImage from '../assets/imges/login.jpg';

interface EventCategory {
  id: string;
  name: string;
  subtypes: string[];
}

const eventCategories: EventCategory[] = [
  {
    id: 'music',
    name: 'Music',
    subtypes: ['Pop', 'Hip-Hop / Rap', 'Rock', 'Classic Rock', 'Pop Punk', 'Country', 'Trap', 'EDM / Electronic', 'Metal / Hard Rock', 'Bluegrass', 'Latin / Reggaeton', 'R&B / Soul', 'Jazz', 'Blues'],
  },
  {
    id: 'fitness',
    name: 'Fitness',
    subtypes: ['Yoga', 'Running', 'CrossFit', 'Pilates', 'Cycling', 'Swimming', 'Martial Arts', 'Dance Fitness', 'Boxing'],
  },
  {
    id: 'sports',
    name: 'Sports',
    subtypes: ['Football', 'Basketball', 'Tennis', 'Handball', 'Volleyball', 'Baseball', 'Golf', 'Hockey', 'Rugby'],
  },
  {
    id: 'tech',
    name: 'Tech',
    subtypes: ['AI / Machine Learning', 'Web Development', 'Mobile Apps', 'Blockchain', 'Cybersecurity', 'Cloud Computing', 'DevOps', 'UI/UX Design'],
  },
  {
    id: 'nightlife',
    name: 'Nightlife',
    subtypes: ['Clubs', 'Bars', 'Lounges', 'Rooftop Parties', 'Live DJ Sets', 'Karaoke', 'Comedy Shows'],
  },
  {
    id: 'dating',
    name: 'Dating',
    subtypes: ['Speed Dating', 'Singles Mixers', 'Wine Tasting', 'Cooking Classes', 'Outdoor Adventures', 'Game Nights'],
  },
  {
    id: 'holiday',
    name: 'Holiday',
    subtypes: ['Christmas', 'Halloween', 'New Year', 'Easter', 'Thanksgiving', 'Valentine\'s Day', 'Cultural Festivals'],
  },
];

const OnboardingInterests = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('music');
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([]);
  const [categoryStartIndex, setCategoryStartIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const visibleCategoriesCount = 5;
  const canScrollLeft = categoryStartIndex > 0;
  const canScrollRight = categoryStartIndex + visibleCategoriesCount < eventCategories.length;

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSubtypeToggle = (subtype: string) => {
    setSelectedSubtypes((prev) =>
      prev.includes(subtype)
        ? prev.filter((s) => s !== subtype)
        : [...prev, subtype]
    );
  };

  const scrollLeft = () => {
    if (canScrollLeft) {
      setCategoryStartIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const scrollRight = () => {
    if (canScrollRight) {
      setCategoryStartIndex((prev) => Math.min(eventCategories.length - visibleCategoriesCount, prev + 1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      setError('Please select at least one category');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const onboardingData = {
        interestedEventCategories: [selectedCategory, ...selectedSubtypes],
      };

      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      localStorage.setItem('onboardingComplete', 'true');
      localStorage.removeItem('userType');

      // Redirect to attendee dashboard
      navigate('/dashboard-attendee', { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save data. Please try again.';
      setError(errorMessage);
      console.error('Save error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentCategory = eventCategories.find((cat) => cat.id === selectedCategory);
  const visibleCategories = eventCategories.slice(categoryStartIndex, categoryStartIndex + visibleCategoriesCount);

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
              <div className="h-1 w-[100px] bg-black rounded-full"></div>
              <div className="h-1 w-[100px] bg-black rounded-full"></div>
              <div className="h-1 w-[100px] bg-black rounded-full"></div>
            </div>
          </div>

          {/* Instruction Text */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-black">
              Let's get to know you!
            </h2>
            <p className="text-sm font-medium text-black">
              What kind of events excite you?
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Categories Carousel */}
            <div className="flex items-center gap-2">
              {/* Left Arrow */}
              <button
                type="button"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? 'border-black hover:bg-gray-100 cursor-pointer'
                    : 'border-[#EEEEEE] text-[#CCCCCC] cursor-not-allowed'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Categories */}
              <div className="flex-1 flex gap-2 overflow-hidden">
                {visibleCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryClick(category.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                      selectedCategory === category.id
                        ? 'bg-black text-white'
                        : 'bg-white text-black border border-[#EEEEEE] hover:border-black'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                type="button"
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  canScrollRight
                    ? 'border-black hover:bg-gray-100 cursor-pointer'
                    : 'border-[#EEEEEE] text-[#CCCCCC] cursor-not-allowed'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Subtypes Section */}
            {currentCategory && (
              <div className="p-5 sm:p-6 border-2 border-[#EEEEEE] rounded-2xl">
                <div className="flex flex-wrap gap-2">
                  {currentCategory.subtypes.map((subtype) => (
                    <button
                      key={subtype}
                      type="button"
                      onClick={() => handleSubtypeToggle(subtype)}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                        selectedSubtypes.includes(subtype)
                          ? 'bg-black text-white'
                          : 'bg-white text-black border border-[#EEEEEE] hover:border-black'
                      }`}
                    >
                      {subtype}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedCategory || isLoading}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF4000] text-white text-sm font-semibold rounded-full hover:bg-[#E63900] transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FF4000] mt-2"
            >
              {isLoading ? 'Saving...' : 'Finish & Login'}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
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

export default OnboardingInterests;
