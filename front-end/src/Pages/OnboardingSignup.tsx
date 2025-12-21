import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import Logo from '../assets/Svgs/Logo.svg';
import LoginImage from '../assets/imges/login.jpg';

const OnboardingSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const methodParam = searchParams.get('method') as 'email' | 'phone' | null;
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>(methodParam === 'phone' ? 'phone' : 'email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSignup = () => {
    setSignupMethod('email');
  };

  const handlePhoneSignup = () => {
    setSignupMethod('phone');
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth
    console.log('Google signup clicked');
  };

  const handleFacebookSignup = () => {
    // TODO: Implement Facebook OAuth
    console.log('Facebook signup clicked');
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(value)) {
      setPhone(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userType = localStorage.getItem('userType') || 'attend';
      const roles: ('attendee' | 'organizer' | 'admin')[] = userType === 'organize' ? ['organizer'] : ['attendee'];
      
      const name = signupMethod === 'email' ? email.split('@')[0] : `User${phone.slice(-4)}`;
      
      const registerData = {
        name,
        email: signupMethod === 'email' ? email : `${phone}@temp.ormeet.com`,
        password,
        phone: signupMethod === 'phone' ? phone : undefined,
        roles,
      };

      await authService.register(registerData);
      
      localStorage.setItem('pendingVerification', signupMethod === 'email' ? email : phone);
      localStorage.setItem('verificationType', signupMethod);
      
      navigate('/email-confirmation');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 md:p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-[460px] flex flex-col gap-4 sm:gap-6 py-6 sm:py-8 md:py-4">
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
            </div>
          </div>

          {/* Instruction Text */}
          <div>
            <p className="text-base sm:text-lg text-[#4F4F4F] leading-relaxed">
              Nice choice! Pick the way you'd like to sign up
            </p>
          </div>

          {/* Signup Method Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleEmailSignup}
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] rounded-lg text-sm font-medium transition-all ${
                signupMethod === 'email'
                  ? 'border-[#FF4000] bg-[#FFF4F3] text-[#FF4000]'
                  : 'border-[#EEEEEE] bg-white text-[#4F4F4F] hover:border-[#FF4000] hover:text-[#FF4000]'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                <path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M2 5l8 6 8-6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              Sign up with Email
            </button>
            <button
              onClick={handlePhoneSignup}
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] rounded-lg text-sm font-medium transition-all ${
                signupMethod === 'phone'
                  ? 'border-[#FF4000] bg-[#FFF4F3] text-[#FF4000]'
                  : 'border-[#EEEEEE] bg-white text-[#4F4F4F] hover:border-[#FF4000] hover:text-[#FF4000]'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                <path d="M5 2h10a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="10" cy="15" r="1" fill="currentColor"/>
              </svg>
              Sign up with Phone
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email/Phone Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor={signupMethod === 'email' ? 'email' : 'phone'} className="text-sm font-medium text-black">
                {signupMethod === 'email' ? 'Email' : 'Phone number'}
              </label>
              {signupMethod === 'email' ? (
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF4000] focus:ring-1 focus:ring-[#FF4000] transition-all"
                  required
                />
              ) : (
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF4000] focus:ring-1 focus:ring-[#FF4000] transition-all"
                  required
                />
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-black">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF4000] focus:ring-1 focus:ring-[#FF4000] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4F4F4F] transition-colors"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                      <path d="M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6S2.5 10 2.5 10z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                      <path d="M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6S2.5 10 2.5 10z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Use min. 8 characters, mix of letters, numbers & symbols
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center text-[#4F4F4F] text-sm">
              <div className="flex-1 h-px bg-[#EEEEEE]"></div>
              <span className="px-4">Or continue with</span>
              <div className="flex-1 h-px bg-[#EEEEEE]"></div> 
            </div>

            {/* Social Signup */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button 
                type="button" 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] border-[#EEEEEE] rounded-lg bg-white text-sm font-medium text-[#4F4F4F] transition-all hover:border-[#434343] hover:bg-[#F8F8F8]" 
                onClick={handleGoogleSignup}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" className="w-5 h-5">
                  <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4"/>
                  <path d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" fill="#34A853"/>
                  <path d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" fill="#FBBC05"/>
                  <path d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button 
                type="button" 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] border-[#EEEEEE] rounded-lg bg-white text-sm font-medium text-[#4F4F4F] transition-all hover:border-[#434343] hover:bg-[#F8F8F8]" 
                onClick={handleFacebookSignup}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="#1877F2" className="w-5 h-5">
                  <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"/>
                </svg>
                Facebook
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-[#4F4F4F]">
                Already a member?{' '}
                <button 
                  type="button"
                  onClick={handleLoginRedirect}
                  className="text-[#FF4000] font-semibold hover:opacity-80 transition-opacity underline-offset-2"
                >
                  Log in instead
                </button>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF4000] text-white text-sm font-semibold rounded-full hover:bg-[#E63900] transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FF4000]"
            >
              {isLoading ? 'Creating account...' : 'Continue to sign up'}
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

export default OnboardingSignup;
