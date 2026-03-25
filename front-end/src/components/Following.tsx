import React from 'react';

const Following = () => {

  return (
    <div className="w-full">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-black mb-6">Organisers you follow</h1>

      {/* Coming Soon UI */}
      <div className="flex flex-col items-center justify-center py-20">
        {/* Icon Container */}
        <div className="w-32 h-32 bg-gradient-to-br from-[#FF4000]/10 to-[#FF4000]/5 rounded-full flex items-center justify-center mb-6">
          <svg className="w-16 h-16 text-[#FF4000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>

        {/* Coming Soon Text */}
        <h2 className="text-3xl font-bold text-black mb-3">Coming Soon</h2>
        <p className="text-base text-[#4F4F4F] text-center max-w-md mb-8">
          We're building the ability to follow your favorite event organizers and stay updated with their latest events.
        </p>

        {/* Feature List */}
        <div className="bg-white rounded-xl border border-[#EEEEEE] p-6 max-w-md w-full">
          <h3 className="text-sm font-semibold text-black mb-4">What's Coming:</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#FF4000] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-[#4F4F4F]">Follow event organizers you love</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#FF4000] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-[#4F4F4F]">Get notified about new events</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#FF4000] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-[#4F4F4F]">Discover events from trusted organizers</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Following;
