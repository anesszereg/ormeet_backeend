import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Support = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('attendee');

  const handleGoBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-black mb-4">{t('support.title')}</h1>
        <p className="text-lg text-[#4F4F4F] mb-8">
          {t('support.subtitle')}
        </p>

        <div className="space-y-6">
          {/* Contact Options */}
          <div className="bg-[#F8F8F8] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-black mb-4">{t('support.contactUs')}</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#FF4000] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-black">{t('support.emailSupport.label')}</h3>
                  <a href="mailto:support@ormeet.com" className="text-[#FF4000] hover:underline">
                    support@ormeet.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#FF4000] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-black">{t('support.liveChat.label')}</h3>
                  <p className="text-[#4F4F4F]">{t('support.liveChat.hours')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#FF4000] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-black">{t('support.phoneSupport.label')}</h3>
                  <a href="tel:+1-800-ORMEET" className="text-[#FF4000] hover:underline">
                    +1 (800) ORMEET
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-[#F8F8F8] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-black mb-4">{t('support.faq.title')}</h2>
            <div className="space-y-3">
              <details className="group">
                <summary className="cursor-pointer font-medium text-black hover:text-[#FF4000] transition-colors">
                  {t('support.faq.cancelOrder.question')}
                </summary>
                <p className="mt-2 text-sm text-[#4F4F4F] ps-4">
                  {t('support.faq.cancelOrder.answer')}
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-medium text-black hover:text-[#FF4000] transition-colors">
                  {t('support.faq.findTickets.question')}
                </summary>
                <p className="mt-2 text-sm text-[#4F4F4F] ps-4">
                  {t('support.faq.findTickets.answer')}
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-medium text-black hover:text-[#FF4000] transition-colors">
                  {t('support.faq.contactOrganizer.question')}
                </summary>
                <p className="mt-2 text-sm text-[#4F4F4F] ps-4">
                  {t('support.faq.contactOrganizer.answer')}
                </p>
              </details>
            </div>
          </div>
        </div>

        <button
          onClick={handleGoBack}
          className="mt-8 px-6 py-3 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors"
        >
          {t('support.goBack')}
        </button>
      </div>
    </div>
  );
};

export default Support;
