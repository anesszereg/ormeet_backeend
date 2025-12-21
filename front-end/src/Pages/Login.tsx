import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/Svgs/Logo.svg';
import LoginImage from '../assets/imges/login.jpg';

const Login = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(value)) {
      setPhone(value);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const credentials = loginMethod === 'email' 
        ? { email, password } 
        : { phone, password };
      
      await login(credentials);
      
      // Navigate to dashboard after successful login
      // Avoid redirecting back to onboarding or login pages
      const isOnboardingOrAuth = from === '/' || 
                                  from === '/login' || 
                                  from === '/register' ||
                                  from.startsWith('/onboarding');
      
      const redirectTo = !isOnboardingOrAuth ? from : '/dashboard-attendee';
      
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log('Google login clicked');
  };

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook OAuth
    console.log('Facebook login clicked');
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
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-[28px] font-bold text-black">Welcome back to Ormeet!</h1>
            <p className="text-sm text-[#4F4F4F] leading-relaxed">Log in to discover, attend, or host events with ease.</p>
          </div>

          {/* Login Method Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] rounded-lg text-sm font-medium transition-all ${
                loginMethod === 'email'
                  ? 'border-[#FF4000] bg-[#FFF4F3] text-[#FF4000]'
                  : 'border-[#EEEEEE] bg-white text-[#4F4F4F] hover:border-[#FF4000] hover:text-[#FF4000]'
              }`}
              onClick={() => setLoginMethod('email')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                <path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M2 5l8 6 8-6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              Log in with Email
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] rounded-lg text-sm font-medium transition-all ${
                loginMethod === 'phone'
                  ? 'border-[#FF4000] bg-[#FFF4F3] text-[#FF4000]'
                  : 'border-[#EEEEEE] bg-white text-[#4F4F4F] hover:border-[#FF4000] hover:text-[#FF4000]'
              }`}
              onClick={() => setLoginMethod('phone')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                <path d="M5 2h10a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="10" cy="15" r="1" fill="currentColor"/>
              </svg>
              Log in with Phone
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor={loginMethod === 'email' ? 'email' : 'phone'} className="text-sm font-medium text-black">
                {loginMethod === 'email' ? 'Email' : 'Phone number'}
              </label>
              {loginMethod === 'email' ? (
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                />
              ) : (
                <input
                  type="tel"
                  id="phone"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-black">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                <span>Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm text-[#FF4000] font-medium hover:opacity-80 transition-opacity">
                Forgot password?
              </a>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full px-6 py-3.5 bg-[#FF4000] text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all hover:bg-[#F0450B] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,64,0,0.3)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center text-[#4F4F4F] text-sm">
            <div className="flex-1 h-px bg-[#EEEEEE]"></div>
            <span className="px-4">Or continue with</span>
            <div className="flex-1 h-px bg-[#EEEEEE]"></div> 
          </div>
          

          {/* Social Login */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] border-[#EEEEEE] rounded-lg bg-white text-sm font-medium text-[#4F4F4F] transition-all hover:border-[#434343] hover:bg-[#F8F8F8]" onClick={handleGoogleLogin}>
              <svg width="20" height="20" viewBox="0 0 20 20" className="w-5 h-5">
                <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4"/>
                <path d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" fill="#34A853"/>
                <path d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" fill="#FBBC05"/>
                <path d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-[1.5px] border-[#EEEEEE] rounded-lg bg-white text-sm font-medium text-[#4F4F4F] transition-all hover:border-[#434343] hover:bg-[#F8F8F8]" onClick={handleFacebookLogin}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#1877F2" className="w-5 h-5">
                <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"/>
              </svg>
              Facebook
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-[#4F4F4F]">
              New to Ormeet? <a href="/register" className="text-[#FF4000] font-semibold hover:opacity-80 transition-opacity">Create an account</a>
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
