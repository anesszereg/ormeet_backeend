import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HostEvents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'organizer') {
      navigate('/dashboard-organizer');
    } else {
      // Attendee wants to become organizer
      navigate('/onboarding-organizer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF4F3] to-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-black mb-6">
            Host Your Events with <span className="text-[#FF4000]">Ormeet</span>
          </h1>
          <p className="text-xl text-[#4F4F4F] max-w-2xl mx-auto">
            Create unforgettable experiences. Manage everything from ticket sales to attendee engagement in one powerful platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-[#FF4000]/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#FF4000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Easy Ticket Management</h3>
            <p className="text-[#4F4F4F]">
              Create multiple ticket types, set pricing, and manage inventory with our intuitive ticketing system.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-[#FF4000]/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#FF4000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Real-time Analytics</h3>
            <p className="text-[#4F4F4F]">
              Track ticket sales, revenue, and attendee engagement with comprehensive analytics and insights.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-[#FF4000]/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#FF4000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Attendee Management</h3>
            <p className="text-[#4F4F4F]">
              Check-in attendees with QR codes, send updates, and manage your guest list effortlessly.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl p-12 shadow-sm mb-16">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">Why Choose Ormeet?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-[#FF4000] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="font-semibold text-black mb-1">Low Platform Fees</h4>
                <p className="text-sm text-[#4F4F4F]">Keep more of your revenue with our competitive pricing</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-[#FF4000] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="font-semibold text-black mb-1">Secure Payments</h4>
                <p className="text-sm text-[#4F4F4F]">Fast, secure payment processing with multiple options</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-[#FF4000] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="font-semibold text-black mb-1">Marketing Tools</h4>
                <p className="text-sm text-[#4F4F4F]">Promote your events with built-in marketing features</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-[#FF4000] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="font-semibold text-black mb-1">24/7 Support</h4>
                <p className="text-sm text-[#4F4F4F]">Get help whenever you need it from our dedicated team</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button
            onClick={handleGetStarted}
            className="px-12 py-4 bg-[#FF4000] text-white text-lg font-semibold rounded-full hover:bg-[#E63900] transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started as an Organizer
          </button>
          <p className="mt-4 text-sm text-[#4F4F4F]">
            Already an organizer?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-[#FF4000] font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HostEvents;
