import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import PhoneInput from '../components/PhoneInput';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import Logo from '../assets/Svgs/Logo.svg';
import LoginImage from '../assets/imges/login.jpg';

const Login = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showVerificationError, setShowVerificationError] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  // When the same email has multiple accounts (e.g. attendee + organizer),
  // the backend returns 409 MULTIPLE_ACCOUNTS and we ask the user which one
  // to log into.
  const [availableRoles, setAvailableRoles] = useState<string[] | null>(null);

  const handlePhoneChange = (fullPhone: string) => {
    setPhone(fullPhone);
    if (error) {
      console.log('Clearing error on phone change');
      setError('');
    }
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (error) {
      console.log('Clearing error on input change');
      setError('');
    }
  };

  const handleLoginMethodChange = (method: 'email' | 'phone') => {
    setLoginMethod(method);
    if (error) {
      console.log('Clearing error on login method change');
      setError('');
    }
  };

  const { login } = useAuth();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    const message = (location.state as any)?.message;
    if (message) {
      setSuccessMessage(message);
    }
  }, [location]);

  const handleLogin = async (
    eOrRole: React.FormEvent | string,
  ) => {
    let chosenRole: string | undefined;
    if (typeof eOrRole === 'string') {
      chosenRole = eOrRole;
    } else {
      eOrRole.preventDefault();
      // Use the role the user picked on /onboarding-choice (if any) as a hint.
      const userType = localStorage.getItem('userType');
      if (userType === 'organize') chosenRole = 'organizer';
      else if (userType === 'attend') chosenRole = 'attendee';
    }

    setIsLoading(true);
    setAvailableRoles(null);

    try {
      const credentials: any = loginMethod === 'email'
        ? { email, password }
        : { phone, password };
      if (chosenRole) credentials.role = chosenRole;

      await login(credentials);
      
      const user = authService.getCurrentUser();
      
      console.log('🔍 [Login] User data:', user);
      console.log('🔍 [Login] User role:', user?.role);
      console.log('🔍 [Login] interestedEventCategories:', user?.interestedEventCategories);
      console.log('🔍 [Login] hostingEventTypes:', user?.hostingEventTypes);
      
      // Check if user needs onboarding (first time login)
      // User needs onboarding if they don't have interests/hosting types set
      const needsOnboarding = user?.role === 'organizer'
        ? (!user?.hostingEventTypes || user.hostingEventTypes.length === 0)
        : (!user?.interestedEventCategories || user.interestedEventCategories.length === 0);
      
      console.log('🔍 [Login] needsOnboarding:', needsOnboarding);
      console.log('🔍 [Login] Is organizer:', user?.role === 'organizer');
      
      if (needsOnboarding) {
        // Redirect to onboarding based on role
        if (user?.role === 'organizer') {
          console.log('✅ [Login] Redirecting to organizer onboarding');
          // Use setTimeout to ensure navigation happens after state updates
          setTimeout(() => {
            navigate('/onboarding-brand-info', { replace: true });
          }, 100);
        } else {
          console.log('✅ [Login] Redirecting to attendee onboarding');
          setTimeout(() => {
            navigate('/onboarding-interests', { replace: true });
          }, 100);
        }
        return;
      }
      
      console.log('✅ [Login] User has completed onboarding, redirecting to dashboard');
      
      // Navigate to dashboard based on user role
      if (user?.role === 'organizer') {
        navigate('/dashboard-organizer', { replace: true });
      } else {
        navigate('/dashboard-attendee', { replace: true });
      }
    } catch (err: any) {
      const data = err.response?.data;

      // Backend returns 409 with code MULTIPLE_ACCOUNTS when this email
      // belongs to both an attendee and an organizer account.
      if (
        err.response?.status === 409 &&
        (data?.code === 'MULTIPLE_ACCOUNTS' || data?.message?.code === 'MULTIPLE_ACCOUNTS')
      ) {
        const roles =
          data?.availableRoles || data?.message?.availableRoles || [
            'attendee',
            'organizer',
          ];
        setAvailableRoles(roles);
        setError('');
        setShowVerificationError(false);
        return;
      }

      const rawMessage = data?.message ?? err.message ?? 'Login failed. Please try again.';
      const errorMessage = typeof rawMessage === 'string' ? rawMessage : (rawMessage?.message || 'Login failed.');
      console.log('Setting error:', errorMessage);

      // Check if error is due to unverified email
      if (errorMessage.toLowerCase().includes('verify') || errorMessage.toLowerCase().includes('verification')) {
        setShowVerificationError(true);
        setUnverifiedEmail(email || '');
        setError('');
      } else {
        setError(errorMessage);
        setShowVerificationError(false);
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    
    setIsResending(true);
    try {
      await authService.resendVerificationEmail(unverifiedEmail);
      setSuccessMessage(t('login.verification.resendSuccess'));
      setShowVerificationError(false);
      setTimeout(() => setSuccessMessage(''), 10000); // Clear after 10 seconds
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string || 'http://localhost:3000/').replace(/\/$/, '');

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${API_BASE}/auth/facebook`;
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <div className="fixed top-4 end-4 z-50">
        <LanguageSwitcher />
      </div>
      {availableRoles && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-black mb-1">
              {t('login.chooseAccountTitle', { defaultValue: 'Choose an account' })}
            </h2>
            <p className="text-sm text-[#4F4F4F] mb-5">
              {t('login.chooseAccountSubtitle', { defaultValue: 'This email has more than one account. Which one do you want to log into?' })}
            </p>
            <div className="space-y-2">
              {availableRoles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleLogin(r)}
                  disabled={isLoading}
                  className="w-full text-start px-4 py-3 rounded-lg border border-[#EEE] hover:border-[#FF4000] hover:bg-[#FFF4F3] transition-colors text-sm font-medium text-black disabled:opacity-60"
                >
                  {t('login.continueAs', {
                    role: r.charAt(0).toUpperCase() + r.slice(1),
                    defaultValue: `Continue as ${r.charAt(0).toUpperCase() + r.slice(1)}`,
                  })}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setAvailableRoles(null)}
              className="mt-4 w-full text-sm text-[#4F4F4F] hover:text-black"
            >
              {t('login.cancel', { defaultValue: 'Cancel' })}
            </button>
          </div>
        </div>
      )}
      {/* Left Side - Form */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 md:p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-[460px] flex flex-col gap-4 sm:gap-6 py-6 sm:py-8 md:py-4">
          {/* Logo */}
          <div>
            <img src={Logo} alt="Ormeet Logo" className="w-7 h-[38px]" />
          </div>

          {/* Welcome Text */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-[28px] font-bold text-black">{t('login.title')}</h1>
            <p className="text-sm text-[#4F4F4F] leading-relaxed">{t('login.subtitle')}</p>
          </div>

          {/* Login Method Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] rounded-lg text-sm font-medium transition-all cursor-pointer ${
                loginMethod === 'email'
                  ? 'border-[#FF4000] bg-[#FFF4F3] text-[#FF4000]'
                  : 'border-[#EEEEEE] bg-white text-[#4F4F4F] hover:border-[#FF4000] hover:text-[#FF4000]'
              }`}
              onClick={() => handleLoginMethodChange('email')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                <path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M2 5l8 6 8-6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              {t('login.tabs.email')}
            </button>
            <button
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] rounded-lg text-sm font-medium transition-all cursor-pointer ${
                loginMethod === 'phone'
                  ? 'border-[#FF4000] bg-[#FFF4F3] text-[#FF4000]'
                  : 'border-[#EEEEEE] bg-white text-[#4F4F4F] hover:border-[#FF4000] hover:text-[#FF4000]'
              }`}
              onClick={() => handleLoginMethodChange('phone')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                <path d="M5 2h10a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="10" cy="15" r="1" fill="currentColor"/>
              </svg>
              {t('login.tabs.phone')}
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Verification Error Message - Persistent */}
          {showVerificationError && (
            <div className="px-4 py-4 bg-amber-50 border-2 border-amber-400 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-900 mb-1">{t('login.verification.requiredTitle')}</h3>
                  <p className="text-sm text-amber-800 mb-3">
                    {t('login.verification.requiredText')}
                  </p>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? t('login.verification.resending') : t('login.verification.resendButton')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor={loginMethod === 'email' ? 'email' : 'phone'} className="text-sm font-medium text-black">
                {loginMethod === 'email' ? t('login.fields.emailLabel') : t('login.fields.phoneLabel')}
              </label>
              {loginMethod === 'email' ? (
                <input
                  type="email"
                  id="email"
                  placeholder={t('login.fields.emailPlaceholder')}
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                />
              ) : (
                <PhoneInput
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  placeholder={t('login.fields.phonePlaceholder')}
                />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-black">{t('login.fields.passwordLabel')}</label>
              <input
                type="password"
                id="password"
                placeholder={t('login.fields.passwordPlaceholder')}
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <label className="flex items-center gap-2 text-sm text-[#4F4F4F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-[18px] h-[18px] cursor-pointer accent-[#FF4000]"
                />
                <span>{t('login.rememberMe')}</span>
              </label>
              <a href="/forgot-password" className="text-sm text-[#FF4000] font-medium hover:opacity-80 transition-opacity">
                {t('login.forgotPassword')}
              </a>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full px-6 py-3.5 bg-[#FF4000] text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all hover:bg-[#F0450B] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,64,0,0.3)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isLoading ? t('login.submitting') : t('login.submitButton')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center text-[#4F4F4F] text-sm">
            <div className="flex-1 h-px bg-[#EEEEEE]"></div>
            <span className="px-4">{t('login.orContinueWith')}</span>
            <div className="flex-1 h-px bg-[#EEEEEE]"></div> 
          </div>
          

          {/* Social Login */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] border-[#EEEEEE] rounded-lg bg-white text-sm font-medium text-[#4F4F4F] transition-all hover:border-[#434343] hover:bg-[#F8F8F8] cursor-pointer" onClick={handleGoogleLogin}>
              <svg width="20" height="20" viewBox="0 0 20 20" className="w-5 h-5">
                <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4"/>
                <path d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" fill="#34A853"/>
                <path d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" fill="#FBBC05"/>
                <path d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" fill="#EA4335"/>
              </svg>
              {t('login.oauth.google')}
            </button>
            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] border-[#EEEEEE] rounded-lg bg-white text-sm font-medium text-[#4F4F4F] transition-all hover:border-[#434343] hover:bg-[#F8F8F8] cursor-pointer" onClick={handleFacebookLogin}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#1877F2" className="w-5 h-5">
                <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"/>
              </svg>
              {t('login.oauth.facebook')}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-[#4F4F4F]">
              {t('login.newUserPrompt')} <a href="/register" className="text-[#FF4000] font-semibold hover:opacity-80 transition-opacity">{t('login.createAccount')}</a>
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

export default Login;
