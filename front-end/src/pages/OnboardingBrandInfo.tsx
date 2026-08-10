import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import organizerService from '../services/organizerService';
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

const eventTypeKeys: Record<string, string> = {
  'Live Music': 'onboarding.brandInfo.eventTypesList.0',
  'Nightlife Events': 'onboarding.brandInfo.eventTypesList.1',
  'DJ Events': 'onboarding.brandInfo.eventTypesList.2',
  'Art Exhibitions': 'onboarding.brandInfo.eventTypesList.3',
  'Fitness': 'onboarding.brandInfo.eventTypesList.4',
  'Holiday': 'onboarding.brandInfo.eventTypesList.5',
  'Dating': 'onboarding.brandInfo.eventTypesList.6',
  'Webinars': 'onboarding.brandInfo.eventTypesList.7',
  'Conferences': 'onboarding.brandInfo.eventTypesList.8',
  'Food & Drink': 'onboarding.brandInfo.eventTypesList.9',
  'Kids & Family': 'onboarding.brandInfo.eventTypesList.10',
  'Gaming & Tech': 'onboarding.brandInfo.eventTypesList.11',
  'Business & Finance': 'onboarding.brandInfo.eventTypesList.12',
};

const OnboardingBrandInfo = () => {
  const { t } = useTranslation('organizer');
  const navigate = useNavigate();
  const location = useLocation();
  // Forwarded from onboarding-choice/signup — the page to return to once
  // onboarding completes, instead of always landing on the dashboard.
  const from = (location.state as any)?.from;
  const { user, refreshUser } = useAuth();
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
      // Save hosting event types to backend
      await authService.updateHostingTypes({
        hostingEventTypes: selectedEventTypes,
      });

      // Le nom saisi est la raison sociale : il doit aller sur l'organisation,
      // pas dans la bio de l'utilisateur. Sans ça, l'organisation gardait le nom
      // auto-généré par le back (« X's Organization »), visible sur la page
      // événement (ORM-022).
      if (organisationName && user?.organizationId) {
        await organizerService.updateOrganization(user.organizationId, {
          name: organisationName,
        });
      }

      // Les volumes déclarés n'ont pas encore de champ dédié : conservés en bio.
      if (eventsPerYear || averageAttendees) {
        await authService.updateProfile({
          bio: `Events per year: ${eventsPerYear}, Avg attendees: ${averageAttendees}`,
        });
      }

      // Refresh user data in context
      await refreshUser();

      // Return to the page the visitor was trying to reach before signing
      // up, if any; otherwise go to the organizer dashboard.
      if (from?.pathname) {
        navigate(from.pathname, { replace: true });
      } else {
        navigate('/dashboard-organizer', { replace: true });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || t('onboarding.brandInfo.errorFallback');
      setError(errorMessage);
      console.error('Failed to save brand info:', err);
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
            <h1 className="text-2xl sm:text-[28px] font-bold text-black">{t('onboarding.brandInfo.title')}</h1>
            
            {/* Progress Bar */}
            <div className="flex gap-2 w-full max-w-[400px]">
              <div className="h-1 flex-1 bg-black rounded-full"></div>
              <div className="h-1 flex-1 bg-black rounded-full"></div>
              <div className="h-1 flex-1 bg-black rounded-full"></div>
              <div className="h-1 flex-1 bg-black rounded-full"></div>
            </div>
          </div>

          {/* Instruction Text */}
          <div>
            <h2 className="text-lg sm:text-xl text-[#4F4F4F]">
              {t('onboarding.brandInfo.subtitle')}
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
                {t('onboarding.brandInfo.fields.organisationName')}
              </label>
              <input
                id="organisation"
                type="text"
                value={organisationName}
                onChange={(e) => setOrganisationName(e.target.value)}
                placeholder={t('onboarding.brandInfo.fields.organisationPlaceholder')}
                className="w-full px-4 py-3 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF4000] focus:ring-1 focus:ring-[#FF4000] transition-all"
                required
              />
            </div>

            {/* Event Types */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-black">
                {t('onboarding.brandInfo.fields.eventTypes')}
              </label>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((eventType, index) => (
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
                    {t(`onboarding.brandInfo.eventTypesList.${index}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Per Year */}
            <div className="flex flex-col gap-2">
              <label htmlFor="eventsPerYear" className="text-sm font-medium text-black">
                {t('onboarding.brandInfo.fields.eventsPerYear')}
              </label>
              <div className="relative">
                <select
                  id="eventsPerYear"
                  value={eventsPerYear}
                  onChange={(e) => setEventsPerYear(e.target.value)}
                  className="w-full px-4 py-3 pe-10 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black appearance-none focus:outline-none focus:border-[#FF4000] focus:ring-1 focus:ring-[#FF4000] transition-all bg-white cursor-pointer"
                  required
                >
                  <option value="" disabled>{t('onboarding.brandInfo.fields.eventsPerYearPlaceholder')}</option>
                  <option value="1-5">{t('onboarding.brandInfo.fields.eventsPerYearOptions.1-5')}</option>
                  <option value="6-10">{t('onboarding.brandInfo.fields.eventsPerYearOptions.6-10')}</option>
                  <option value="11-20">{t('onboarding.brandInfo.fields.eventsPerYearOptions.11-20')}</option>
                  <option value="21-50">{t('onboarding.brandInfo.fields.eventsPerYearOptions.21-50')}</option>
                  <option value="50+">{t('onboarding.brandInfo.fields.eventsPerYearOptions.50+')}</option>
                </select>
                <svg
                  className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4F4F4F] pointer-events-none"
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
                {t('onboarding.brandInfo.fields.averageAttendees')}
              </label>
              <div className="relative">
                <select
                  id="averageAttendees"
                  value={averageAttendees}
                  onChange={(e) => setAverageAttendees(e.target.value)}
                  className="w-full px-4 py-3 pe-10 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black appearance-none focus:outline-none focus:border-[#FF4000] focus:ring-1 focus:ring-[#FF4000] transition-all bg-white cursor-pointer"
                  required
                >
                  <option value="" disabled>{t('onboarding.brandInfo.fields.averageAttendeesPlaceholder')}</option>
                  <option value="1-50">{t('onboarding.brandInfo.fields.averageAttendeesOptions.1-50')}</option>
                  <option value="51-100">{t('onboarding.brandInfo.fields.averageAttendeesOptions.51-100')}</option>
                  <option value="101-250">{t('onboarding.brandInfo.fields.averageAttendeesOptions.101-250')}</option>
                  <option value="251-500">{t('onboarding.brandInfo.fields.averageAttendeesOptions.251-500')}</option>
                  <option value="500-1000">{t('onboarding.brandInfo.fields.averageAttendeesOptions.500-1000')}</option>
                  <option value="1000+">{t('onboarding.brandInfo.fields.averageAttendeesOptions.1000+')}</option>
                </select>
                <svg
                  className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4F4F4F] pointer-events-none"
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
              {isLoading ? t('onboarding.brandInfo.saving') : t('onboarding.brandInfo.submit')}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-5 h-5 rtl:scale-x-[-1]">
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
