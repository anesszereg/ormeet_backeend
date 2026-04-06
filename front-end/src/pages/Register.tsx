import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PhoneInput from '../components/PhoneInput';
import Logo from '../assets/Svgs/Logo.svg';
import LoginImage from '../assets/imges/login.jpg';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    familyName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedRole, setSelectedRole] = useState<'attendee' | 'organizer'>('attendee');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (error) {
      console.log('Clearing error on input change');
      setError('');
    }
  };

  const handlePhoneChange = (fullPhone: string) => {
    setFormData({
      ...formData,
      phone: fullPhone,
    });
    
    // Clear error when user starts typing
    if (error) {
      console.log('Clearing error on phone change');
      setError('');
    }
  };

  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: `${formData.firstName} ${formData.familyName}`,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        roles: [selectedRole],
      });
      
      setShowSuccess(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      console.log('Setting error:', errorMessage);
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const handleFacebookSignup = () => {
    // Redirect to backend Facebook OAuth endpoint
    window.location.href = 'http://localhost:3000/auth/facebook';
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full animate-fadeIn">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M10 16l4 4 8-8" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black">Check your email!</h2>
              <p className="text-[#4F4F4F] text-sm leading-relaxed">
                We've sent a verification link to <strong>{formData.email}</strong>. Please check your inbox and click the link to verify your email before logging in.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-3.5 bg-[#FF4000] text-white text-base font-semibold rounded-lg hover:bg-[#E63900] transition-all shadow-sm hover:shadow-md mt-2 cursor-pointer"
              >
                Go to Login
              </button>
            </div>
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
            <h1 className="text-2xl sm:text-[28px] font-bold text-black">Create your account</h1>
            <p className="text-sm text-[#4F4F4F] leading-relaxed">Join Ormeet to discover, attend, or host amazing events.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
              {error}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="firstName" className="text-sm font-medium text-black">First name <span className="text-[#FF4000]">*</span></label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="familyName" className="text-sm font-medium text-black">Family name <span className="text-[#FF4000]">*</span></label>
                <input
                  type="text"
                  id="familyName"
                  name="familyName"
                  placeholder="Enter your family name"
                  value={formData.familyName}
                  onChange={handleChange}
                  required
                  className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-black">Email <span className="text-[#FF4000]">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-sm font-medium text-black">Phone number <span className="text-[#FF4000]">*</span></label>
              <PhoneInput
                value={formData.phone}
                onChange={handlePhoneChange}
                required
                placeholder="Phone number"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-black">Password <span className="text-[#FF4000]">*</span></label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-black">Confirm Password <span className="text-[#FF4000]">*</span></label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
              />
            </div>

            {/* Role Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-black">I want to join as <span className="text-[#FF4000]">*</span></label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('attendee')}
                  className={`flex-1 px-4 py-3.5 border-[1.5px] rounded-lg text-sm font-medium transition-all ${
                    selectedRole === 'attendee'
                      ? 'border-[#FF4000] bg-[#FFF4F3] text-[#FF4000]'
                      : 'border-[#EEEEEE] bg-white text-[#4F4F4F] hover:border-[#FF4000] hover:text-[#FF4000]'
                  }`}
                >
                  Attendee
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('organizer')}
                  className={`flex-1 px-4 py-3.5 border-[1.5px] rounded-lg text-sm font-medium transition-all ${
                    selectedRole === 'organizer'
                      ? 'border-[#FF4000] bg-[#FFF4F3] text-[#FF4000]'
                      : 'border-[#EEEEEE] bg-white text-[#4F4F4F] hover:border-[#FF4000] hover:text-[#FF4000]'
                  }`}
                >
                  Organizer
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <label className="flex items-start gap-2 text-sm text-[#4F4F4F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-[18px] h-[18px] mt-0.5 cursor-pointer accent-[#FF4000]"
                />
                <span>I accept the <a href="/terms" className="text-[#FF4000] font-medium hover:underline">Terms and Conditions</a></span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full px-6 py-3.5 bg-[#FF4000] text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all hover:bg-[#F0450B] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,64,0,0.3)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center text-[#4F4F4F] text-sm">
            <div className="flex-1 h-px bg-[#EEEEEE]"></div>
            <span className="px-4">Or sign up with</span>
            <div className="flex-1 h-px bg-[#EEEEEE]"></div>
          </div>

          {/* Social Signup */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] border-[#EEEEEE] rounded-lg bg-white text-sm font-medium text-[#4F4F4F] transition-all hover:border-[#434343] hover:bg-[#F8F8F8] cursor-pointer" onClick={handleGoogleSignup}>
              <svg width="20" height="20" viewBox="0 0 20 20" className="w-5 h-5">
                <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4"/>
                <path d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" fill="#34A853"/>
                <path d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" fill="#FBBC05"/>
                <path d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] border-[#EEEEEE] rounded-lg bg-white text-sm font-medium text-[#4F4F4F] transition-all hover:border-[#434343] hover:bg-[#F8F8F8] cursor-pointer" onClick={handleFacebookSignup}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#1877F2" className="w-5 h-5">
                <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"/>
              </svg>
              Facebook
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-[#4F4F4F]">
              Already have an account? <a href="/login" className="text-[#FF4000] font-semibold hover:opacity-80 transition-opacity">Log in</a>
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

export default Register;
