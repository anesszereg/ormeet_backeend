import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Svgs/Logo.svg';
import LoginImage from '../assets/imges/login.jpg';

const OnboardingOrganizer = () => {
  const navigate = useNavigate();
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone' | null>(null);

  const handleEmailSignup = () => {
    setSignupMethod('email');
    navigate('/onboarding-signup?method=email');
  };

  const handlePhoneSignup = () => {
    setSignupMethod('phone');
    navigate('/onboarding-signup?method=phone');
  };

  const handleGoogleSignup = () => {
    // Store user type before OAuth redirect
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const handleFacebookSignup = () => {
    // Store user type before OAuth redirect
    window.location.href = 'http://localhost:3000/auth/facebook';
  };

  const handleLoginRedirect = () => {
    navigate('/login');
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
              <div className="h-1 w-[100px] bg-[#EEEEEE] rounded-full"></div>
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
                onClick={handleLoginRedirect}
                className="text-[#FF4000] font-semibold hover:opacity-80 transition-opacity underline-offset-2"
              >
                Log in instead.
              </button>
            </p>
          </div>
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

export default OnboardingOrganizer;
