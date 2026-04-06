import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import Logo from '../assets/Svgs/Logo.svg';
import LoginImage from '../assets/imges/login.jpg';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({ token, newPassword: password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col md:flex-row h-screen w-full">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-white">
          <div className="w-full max-w-[460px] flex flex-col gap-6">
            <div>
              <img src={Logo} alt="Ormeet Logo" className="w-7 h-[38px]" />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-2xl sm:text-[28px] font-bold text-black">Password reset successful!</h1>
              <p className="text-sm text-[#4F4F4F] leading-relaxed">Your password has been successfully reset.</p>
            </div>

            <div className="flex flex-col items-center gap-4 p-8 bg-[#EBF6EE] border border-[#34A853] rounded-xl text-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#34A853" opacity="0.1"/>
                <path d="M16 24l6 6 10-12" stroke="#34A853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm text-[#4F4F4F] leading-relaxed">Redirecting to login page...</p>
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
            <h1 className="text-2xl sm:text-[28px] font-bold text-black">Reset your password</h1>
            <p className="text-sm text-[#4F4F4F] leading-relaxed">Enter your new password below.</p>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-black">New Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-black">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full px-6 py-3.5 bg-[#FF4000] text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all hover:bg-[#F0450B] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,64,0,0.3)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="text-center">
            <a href="/login" className="text-sm text-[#FF4000] font-medium hover:opacity-80 transition-opacity">
              Back to Login
            </a>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <img src={LoginImage} alt="Event Concert" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default ResetPassword;
