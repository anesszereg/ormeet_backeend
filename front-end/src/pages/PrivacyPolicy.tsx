import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventDetailsNavbar from '../components/EventDetailsNavbar';

const PrivacyPolicy = () => {
  const { t } = useTranslation('attendee');
  const navigate = useNavigate();
  const { user } = useAuth();

  const sections = [
    {
      title: t('privacy.sections.overview.title', '1. Overview'),
      content: t(
        'privacy.sections.overview.content',
        'Ormeet ("we", "us", or "our") operates the Ormeet platform (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. By using Ormeet, you consent to the data practices described in this policy.',
      ),
    },
    {
      title: t('privacy.sections.collect.title', '2. Information We Collect'),
      content: t(
        'privacy.sections.collect.content',
        'We collect information you provide directly to us (name, email, phone number, profile photo), information collected automatically (device info, IP address, usage data, cookies), and information from third-party services such as Google or Facebook when you sign in via OAuth.',
      ),
    },
    {
      title: t('privacy.sections.use.title', '3. How We Use Your Information'),
      content: t(
        'privacy.sections.use.content',
        'We use your information to: provide and improve the Service; process ticket purchases and reservations; send event reminders and notifications; personalize your experience; comply with legal obligations; and detect and prevent fraudulent transactions.',
      ),
    },
    {
      title: t('privacy.sections.share.title', '4. Information Sharing'),
      content: t(
        'privacy.sections.share.content',
        'We do not sell your personal information. We may share it with event organizers (to manage attendance), payment processors, analytics providers, and as required by law. All third-party partners are bound by data protection agreements.',
      ),
    },
    {
      title: t('privacy.sections.facebook.title', '5. Facebook Login & Data'),
      content: t(
        'privacy.sections.facebook.content',
        'When you use Facebook Login, we receive your public profile and email address. We use this solely to create or authenticate your account. You may disconnect Facebook at any time from your account settings. In compliance with Facebook\'s Platform Policy, you can request deletion of your data at any time (see Section 7).',
      ),
    },
    {
      title: t('privacy.sections.cookies.title', '6. Cookies & Tracking'),
      content: t(
        'privacy.sections.cookies.content',
        'We use cookies and similar technologies to maintain sessions, remember preferences, and analyze traffic. You can control cookies through your browser settings, though disabling them may limit functionality.',
      ),
    },
    {
      title: t('privacy.sections.rights.title', '7. Your Rights & Data Deletion'),
      content: t(
        'privacy.sections.rights.content',
        'You have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your personal data; withdraw consent; and lodge a complaint with a supervisory authority. To delete your account and all associated data, go to Account Settings → Security → Delete Account. This action is irreversible.',
      ),
    },
    {
      title: t('privacy.sections.retention.title', '8. Data Retention'),
      content: t(
        'privacy.sections.retention.content',
        'We retain your data for as long as your account is active or as needed to provide services. After account deletion, we may retain anonymised analytics data and records required by law for up to 5 years.',
      ),
    },
    {
      title: t('privacy.sections.security.title', '9. Security'),
      content: t(
        'privacy.sections.security.content',
        'We implement industry-standard security measures including TLS encryption in transit, hashed passwords, and access controls. However, no system is completely secure — please use a strong, unique password and enable two-factor authentication.',
      ),
    },
    {
      title: t('privacy.sections.children.title', '10. Children\'s Privacy'),
      content: t(
        'privacy.sections.children.content',
        'Ormeet is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us data, please contact us immediately.',
      ),
    },
    {
      title: t('privacy.sections.changes.title', '11. Changes to This Policy'),
      content: t(
        'privacy.sections.changes.content',
        'We may update this Privacy Policy from time to time. We will notify you of material changes via email or a prominent notice on the Service. Your continued use after changes constitutes acceptance of the revised policy.',
      ),
    },
    {
      title: t('privacy.sections.contact.title', '12. Contact Us'),
      content: t(
        'privacy.sections.contact.content',
        'For privacy-related inquiries or to exercise your rights, contact us at: privacy@ormeet.com or by mail at Ormeet, Inc., [Address]. We will respond within 30 days.',
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <EventDetailsNavbar isLoggedIn={!!user} />

      <main className="flex-1 px-4 md:px-8 lg:px-16 xl:px-24 py-10 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-[#757575] hover:text-black transition-colors mb-6"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('privacy.back', 'Back')}
            </button>
            <h1 className="text-3xl font-bold text-black mb-2">{t('privacy.title', 'Privacy Policy')}</h1>
            <p className="text-sm text-[#757575]">
              {t('privacy.lastUpdated', 'Last updated')}: {new Date('2025-06-01').toLocaleDateString()}
            </p>
          </div>

          {/* Intro */}
          <div className="bg-[#FFF4F3] border border-[#FFD5CC] rounded-2xl p-5 mb-10">
            <p className="text-sm text-[#4F4F4F] leading-relaxed">
              {t(
                'privacy.intro',
                'Your privacy matters to us. This policy describes what data we collect, why we collect it, and how you can control it — including how to request permanent deletion of your personal data.',
              )}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-base font-bold text-black mb-2">{section.title}</h2>
                <p className="text-sm text-[#4F4F4F] leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          {/* Delete account CTA */}
          <div className="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-2xl">
            <h3 className="text-base font-bold text-black mb-2">
              {t('privacy.deleteData.title', 'Delete Your Data')}
            </h3>
            <p className="text-sm text-[#4F4F4F] mb-4">
              {t(
                'privacy.deleteData.description',
                'You can permanently delete your account and all associated personal data at any time from your account settings.',
              )}
            </p>
            {user ? (
              <button
                onClick={() => navigate('/dashboard-attendee')}
                className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-[#333333] transition-colors"
              >
                {t('privacy.deleteData.goToSettings', 'Go to Account Settings')}
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-[#333333] transition-colors"
              >
                {t('privacy.deleteData.loginFirst', 'Log in to Manage Data')}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
