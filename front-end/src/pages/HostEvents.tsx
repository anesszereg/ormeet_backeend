import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const HostEvents = () => {
  const { t } = useTranslation('attendee');
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleGetStarted = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role === 'organizer') {
      navigate('/dashboard-organizer');
      return;
    }
    
    // Attendee wants to become organizer - add organizer role
    try {
      setIsUpgrading(true);
      const { user: updatedUser } = await authService.addOrganizerRole();
      setUser(updatedUser);
      console.log('✅ Successfully added organizer role');
      const needsOnboarding = !updatedUser?.hostingEventTypes || updatedUser.hostingEventTypes.length === 0;
      navigate(needsOnboarding ? '/onboarding-brand-info' : '/dashboard-organizer');
    } catch (error: any) {
      console.error('❌ Failed to add organizer role:', error);
      // TODO: Replace with proper toast notification system
      // alert(error.response?.data?.message || t('hostEvents.alertMessage'));
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF4F3] to-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-10 md:py-20">
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-6">
            {t('hostEvents.title')} <span className="text-[#FF4000]">{t('hostEvents.titleBrand')}</span>
          </h1>
          <p className="text-xl text-[#4F4F4F] max-w-2xl mx-auto">
            {t('hostEvents.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-[#FF4000]/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#FF4000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-3">{t('hostEvents.features.ticketManagement.title')}</h3>
            <p className="text-[#4F4F4F]">
              {t('hostEvents.features.ticketManagement.description')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-[#FF4000]/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#FF4000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-3">{t('hostEvents.features.analytics.title')}</h3>
            <p className="text-[#4F4F4F]">
              {t('hostEvents.features.analytics.description')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-[#FF4000]/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#FF4000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-3">{t('hostEvents.features.attendeeManagement.title')}</h3>
            <p className="text-[#4F4F4F]">
              {t('hostEvents.features.attendeeManagement.description')}
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl p-6 md:p-12 shadow-sm mb-16">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">{t('hostEvents.whyOrmeet')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-[#FF4000] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="font-semibold text-black mb-1">{t('hostEvents.benefits.lowFees.title')}</h4>
                <p className="text-sm text-[#4F4F4F]">{t('hostEvents.benefits.lowFees.description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-[#FF4000] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="font-semibold text-black mb-1">{t('hostEvents.benefits.securePayments.title')}</h4>
                <p className="text-sm text-[#4F4F4F]">{t('hostEvents.benefits.securePayments.description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-[#FF4000] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="font-semibold text-black mb-1">{t('hostEvents.benefits.marketingTools.title')}</h4>
                <p className="text-sm text-[#4F4F4F]">{t('hostEvents.benefits.marketingTools.description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-[#FF4000] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="font-semibold text-black mb-1">{t('hostEvents.benefits.support.title')}</h4>
                <p className="text-sm text-[#4F4F4F]">{t('hostEvents.benefits.support.description')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button
            onClick={handleGetStarted}
            className="px-12 py-4 bg-[#FF4000] text-white text-lg font-semibold rounded-full hover:bg-[#E63900] transition-colors shadow-lg hover:shadow-xl"
          >
            {t('hostEvents.getStarted')}
          </button>
          <p className="mt-4 text-sm text-[#4F4F4F]">
            {t('hostEvents.alreadyOrganizer')}{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-[#FF4000] font-semibold hover:underline"
            >
              {t('hostEvents.signIn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HostEvents;
