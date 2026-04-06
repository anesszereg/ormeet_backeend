import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Svgs/Logo.svg';
import LoginImage from '../assets/imges/login.jpg';

const eventTypes = [
  'Live Music',
  'Nightlife Events',
  'DJ Events',
  'Art Exhibitions',
  'Fitness',
  'Holiday',
  'Dating',
  'Webinars',
  'Conferences',
  'Food & Drink',
  'Kids & Family',
  'Gaming & Tech',
  'Business & Finance',
];

const OnboardingBrandInfo = () => {
  const navigate = useNavigate();
  const [organisationName, setOrganisationName] = useState('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [eventsPerYear, setEventsPerYear] = useState('');
  const [averageAttendees, setAverageAttendees] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleEventType = (eventType: string) => {
    setSelectedEventTypes((prev) =>
      prev.includes(eventType)
        ? prev.filter((type) => type !== eventType)
        : [...prev, eventType]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const onboardingData = {
        organisationName,
        hostingEventTypes: selectedEventTypes,
        eventsPerYear,
        averageAttendees,
      };

      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      localStorage.setItem('onboardingComplete', 'true');
      localStorage.removeItem('userType');

      // Redirect to organizer dashboard
      navigate('/dashboard-organizer', { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save data. Please try again.';
      setError(errorMessage);
      console.error('Save error:', err);
    } finally {
      setIsLoading(false);
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
              <div className="h-1 w-[100px] bg-black rounded-full"></div>
              <div className="h-1 w-[100px] bg-black rounded-full"></div>
              <div className="h-1 w-[100px] bg-black rounded-full"></div>
            </div>
          </div>

          {/* Instruction Text */}
          <div>
            <h2 className="text-lg sm:text-xl text-[#4F4F4F]">
              Tell us about your brand or yourself
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Organisation Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="organisation" className="text-sm font-medium text-black">
                Organisation Name
              </label>
              <input
                id="organisation"
                type="text"
                value={organisationName}
                onChange={(e) => setOrganisationName(e.target.value)}
                placeholder="Enter your organisation name"
                className="w-full px-4 py-3 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF4000] focus:ring-1 focus:ring-[#FF4000] transition-all"
                required
              />
            </div>

            {/* Event Types */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-black">
                What kind of events do you host?
              </label>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((eventType) => (
                  <button
                    key={eventType}
                    type="button"
                    onClick={() => toggleEventType(eventType)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                      selectedEventTypes.includes(eventType)
                        ? 'bg-black text-white'
                        : 'bg-white text-black border border-[#EEEEEE] hover:border-black'
                    }`}
                  >
                    {eventType}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Per Year */}
            <div className="flex flex-col gap-2">
              <label htmlFor="eventsPerYear" className="text-sm font-medium text-black">
                How many events will you host next year?
              </label>
              <div className="relative">
                <select
                  id="eventsPerYear"
                  value={eventsPerYear}
                  onChange={(e) => setEventsPerYear(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black appearance-none focus:outline-none focus:border-[#FF4000] focus:ring-1 focus:ring-[#FF4000] transition-all bg-white cursor-pointer"
                  required
                >
                  <option value="" disabled>Number of events</option>
                  <option value="1-5">1-5 events</option>
                  <option value="6-10">6-10 events</option>
                  <option value="11-20">11-20 events</option>
                  <option value="21-50">21-50 events</option>
                  <option value="50+">50+ events</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4F4F4F] pointer-events-none"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 8l4 4 4-4"
                  />
                </svg>
              </div>
            </div>

            {/* Average Attendees */}
            <div className="flex flex-col gap-2">
              <label htmlFor="averageAttendees" className="text-sm font-medium text-black">
                Average number of attendees per event
              </label>
              <div className="relative">
                <select
                  id="averageAttendees"
                  value={averageAttendees}
                  onChange={(e) => setAverageAttendees(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black appearance-none focus:outline-none focus:border-[#FF4000] focus:ring-1 focus:ring-[#FF4000] transition-all bg-white cursor-pointer"
                  required
                >
                  <option value="" disabled>Number of attendees</option>
                  <option value="1-50">1-50 attendees</option>
                  <option value="51-100">51-100 attendees</option>
                  <option value="101-250">101-250 attendees</option>
                  <option value="251-500">251-500 attendees</option>
                  <option value="500-1000">500-1000 attendees</option>
                  <option value="1000+">1000+ attendees</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4F4F4F] pointer-events-none"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 8l4 4 4-4"
                  />
                </svg>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
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

export default OnboardingBrandInfo;
