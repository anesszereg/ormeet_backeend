import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Logo from '../assets/Svgs/Logo.svg';
import LoginImage from '../assets/imges/login.jpg';

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [verificationType, setVerificationType] = useState<'email' | 'phone'>('email');

  useEffect(() => {
    const pendingVerification = localStorage.getItem('pendingVerification');
    const type = localStorage.getItem('verificationType') as 'email' | 'phone' | null;
    
    if (pendingVerification) {
      setIdentifier(pendingVerification);
    }
    if (type) {
      setVerificationType(type);
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    // Focus the next empty input or the last one
    const nextEmptyIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextEmptyIndex]?.focus();
  };

  const handleResend = async () => {
    setError('');
    try {
      await authService.sendVerificationCode({
        email: verificationType === 'email' ? identifier : undefined,
        phone: verificationType === 'phone' ? identifier : undefined,
        type: verificationType,
        purpose: 'email_verification',
      });
      alert('Verification code sent successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resend code. Please try again.';
      setError(errorMessage);
      console.error('Resend error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await authService.verifyCode({
        email: verificationType === 'email' ? identifier : undefined,
        phone: verificationType === 'phone' ? identifier : undefined,
        type: verificationType,
        code: verificationCode,
      });

      localStorage.removeItem('pendingVerification');
      localStorage.removeItem('verificationType');
      
      const userType = localStorage.getItem('userType');
      if (userType === 'organize') {
        navigate('/onboarding-brand-info');
      } else if (userType === 'attend') {
        navigate('/onboarding-interests');
      } else {
        navigate('/onboarding-interests');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Verification failed. Please check your code and try again.';
      setError(errorMessage);
      console.error('Verification error:', err);
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
              <div className="h-1 w-[100px] bg-black rounded-full"></div>
            </div>
          </div>

          {/* Instruction Text */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-black mb-2">
              Let's make sure it's really you
            </h2>
          </div>

          {/* Email/Phone Display */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#4F4F4F]">
              We've sent a 6-digit code to{' '}
              <span className="font-semibold text-black">{identifier || 'your email/phone'}</span>
            </span>
            <button
              type="button"
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-black text-white hover:bg-[#333] transition-colors"
              aria-label="Edit email"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                <path d="M7 2L10 5L4 11H1V8L7 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* OTP Input */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-semibold border-[1.5px] border-[#EEEEEE] rounded-lg focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/20 transition-all"
                  required
                />
              ))}
            </div>

            {/* Resend Link */}
            <div className="text-sm text-[#4F4F4F]">
              Code not received?{' '}
              <button
                type="button"
                onClick={handleResend}
                className="text-[#FF4000] font-semibold hover:opacity-80 transition-opacity underline-offset-2"
              >
                Click to resend
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={code.some((digit) => !digit) || isLoading}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF4000] text-white text-sm font-semibold rounded-full hover:bg-[#E63900] transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FF4000]"
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
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

export default EmailConfirmation;
