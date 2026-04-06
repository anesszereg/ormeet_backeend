import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/Svgs/Logo.svg';
import LoginImage from '../assets/imges/login.jpg';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { refreshUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Invalid or missing verification token');
        setIsLoading(false);
        return;
      }

      try {
        await authService.verifyEmail({ token });
        setSuccess(true);
        refreshUser(); // Update user state in context
        setTimeout(() => {
          // Redirect to login after verification - user needs to login
          navigate('/login');
        }, 3000);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Email verification failed.';
        setError(errorMessage);
        console.error('Email verification error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate, refreshUser]);

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row h-screen w-full">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-white">
          <div className="w-full max-w-[460px] flex flex-col gap-6 items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4000]"></div>
            <p className="text-lg text-[#4F4F4F]">Verifying your email...</p>
          </div>
        </div>
        <div className="hidden md:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2]">
          <img src={LoginImage} alt="Event Concert" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col md:flex-row h-screen w-full">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-white">
          <div className="w-full max-w-[460px] flex flex-col gap-6">
            <div>
              <img src={Logo} alt="Ormeet Logo" className="w-7 h-[38px]" />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-2xl sm:text-[28px] font-bold text-black">Email verified!</h1>
              <p className="text-sm text-[#4F4F4F] leading-relaxed">Your email has been successfully verified.</p>
            </div>

            <div className="flex flex-col items-center gap-4 p-8 bg-[#EBF6EE] border border-[#34A853] rounded-xl text-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#34A853" opacity="0.1"/>
                <path d="M16 24l6 6 10-12" stroke="#34A853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm text-[#4F4F4F] leading-relaxed">Redirecting to login...</p>
            </div>
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
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-white">
        <div className="w-full max-w-[460px] flex flex-col gap-6">
          <div>
            <img src={Logo} alt="Ormeet Logo" className="w-7 h-[38px]" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-[28px] font-bold text-black">Verification failed</h1>
            <p className="text-sm text-[#4F4F4F] leading-relaxed">We couldn't verify your email address.</p>
          </div>

          <div className="px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
            {error}
          </div>

          <div className="flex flex-col gap-3">
            <a 
              href="/login" 
              className="block w-full px-6 py-3.5 bg-[#FF4000] text-white text-center border-none rounded-lg text-base font-semibold cursor-pointer transition-all hover:bg-[#F0450B] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,64,0,0.3)] active:translate-y-0 no-underline"
            >
              Back to Login
            </a>
            <p className="text-center text-sm text-[#4F4F4F]">
              Need a new verification link? <a href="/resend-verification" className="text-[#FF4000] font-medium hover:opacity-80 transition-opacity">Resend email</a>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <img src={LoginImage} alt="Event Concert" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default VerifyEmail;
