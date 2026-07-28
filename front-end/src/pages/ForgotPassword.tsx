import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAuthErrorMessage } from '../utils/authErrors';
import authService from '../services/authService';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import Logo from '../assets/Svgs/Logo.svg';
import LoginImage from '../assets/imges/login.jpg';

const ForgotPassword = () => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.forgotPassword({ email });
      setSuccess(true);
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err, t, 'errors.resetEmailFailed');
      setError(errorMessage);
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col md:flex-row h-screen w-full">
        <div className="fixed top-4 end-4 z-50">
          <LanguageSwitcher />
        </div>
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-white">
          <div className="w-full max-w-[460px] flex flex-col gap-6">
            <div>
              <img src={Logo} alt="Ormeet Logo" className="w-7 h-[38px]" />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-2xl sm:text-[28px] font-bold text-black">{t('forgotPassword.success.title')}</h1>
              <p className="text-sm text-[#4F4F4F] leading-relaxed">{t('forgotPassword.success.subtitle', { email })}</p>
            </div>

            <div className="flex flex-col items-center gap-4 p-8 bg-[#EBF6EE] border border-[#34A853] rounded-xl text-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#34A853" opacity="0.1"/>
                <path d="M16 24l6 6 10-12" stroke="#34A853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm text-[#4F4F4F] leading-relaxed">{t('forgotPassword.success.description')}</p>
            </div>

            <a 
              href="/login" 
              className="block w-full px-6 py-3.5 bg-[#FF4000] text-white text-center border-none rounded-lg text-base font-semibold cursor-pointer transition-all hover:bg-[#F0450B] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,64,0,0.3)] active:translate-y-0 no-underline"
            >
              {t('forgotPassword.success.backToLogin')}
            </a>
          </div>
        </div>

        <div className="hidden md:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2]">
          <img src={LoginImage} alt="Event Concert" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <div className="fixed top-4 end-4 z-50">
        <LanguageSwitcher />
      </div>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-white">
        <div className="w-full max-w-[460px] flex flex-col gap-6">
          <div>
            <img src={Logo} alt="Ormeet Logo" className="w-7 h-[38px]" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-[28px] font-bold text-black">{t('forgotPassword.title')}</h1>
            <p className="text-sm text-[#4F4F4F] leading-relaxed">{t('forgotPassword.subtitle')}</p>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-black">{t('forgotPassword.fields.emailLabel')}</label>
              <input
                type="email"
                id="email"
                placeholder={t('forgotPassword.fields.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full px-6 py-3.5 bg-[#FF4000] text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all hover:bg-[#F0450B] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,64,0,0.3)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isLoading ? t('forgotPassword.submitting') : t('forgotPassword.submitButton')}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm">
              <a href="/login" className="text-[#FF4000] font-semibold hover:opacity-80 transition-opacity">{t('forgotPassword.backToLogin')}</a>
            </p>
          </div>
        </div>
      </div>

        {/* Right Side - Image */}
      <div className="hidden md:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <img src={LoginImage} alt="Event Concert" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default ForgotPassword;
