import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import Logo from '../assets/Svgs/Logo.svg';
import LoginImage from '../assets/imges/login.jpg';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const provider = searchParams.get('provider');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(`OAuth login failed: ${errorParam}`);
        setIsLoading(false);
        return;
      }

      if (!token) {
        setError('No authentication token received');
        setIsLoading(false);
        return;
      }

      try {
        // Store the token
        localStorage.setItem('token', token);
        
        // Fetch user data with the token
        const response = await authService.getProfile();
        localStorage.setItem('user', JSON.stringify(response));
        
        // Refresh auth context
        refreshUser();

        // Check if user has pending onboarding
        const userType = localStorage.getItem('userType');
        
        setTimeout(() => {
          if (userType && !localStorage.getItem('onboardingComplete')) {
            // User came from onboarding flow - complete it
            if (userType === 'organize') {
              navigate('/onboarding-brand-info');
            } else {
              navigate('/onboarding-interests');
            }
          } else if (response.roles?.includes('organizer')) {
            navigate('/dashboard-organizer');
          } else {
            navigate('/dashboard-attendee');
          }
        }, 1000);
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError('Failed to complete authentication. Please try again.');
        // Clear any partial auth state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoading(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, refreshUser]);

  if (isLoading && !error) {
    return (
      <div className="flex flex-col md:flex-row h-screen w-full">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-white">
          <div className="w-full max-w-[460px] flex flex-col gap-6 items-center">
            <img src={Logo} alt="Ormeet Logo" className="w-7 h-[38px]" />
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4000]"></div>
            <p className="text-lg text-[#4F4F4F]">Completing sign in...</p>
          </div>
        </div>
        <div className="hidden md:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2]">
          <img src={LoginImage} alt="Event Concert" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col md:flex-row h-screen w-full">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-white">
          <div className="w-full max-w-[460px] flex flex-col gap-6">
            <img src={Logo} alt="Ormeet Logo" className="w-7 h-[38px]" />
            
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl sm:text-[28px] font-bold text-black">Authentication Failed</h1>
              <p className="text-sm text-[#4F4F4F] leading-relaxed">We couldn't complete your sign in.</p>
            </div>

            <div className="px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
              {error}
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3.5 bg-[#FF4000] text-white text-base font-semibold rounded-lg hover:bg-[#E63900] transition-all"
            >
              Back to Login
            </button>
          </div>
        </div>
        <div className="hidden md:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2]">
          <img src={LoginImage} alt="Event Concert" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;
