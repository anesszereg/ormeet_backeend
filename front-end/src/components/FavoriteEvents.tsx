import React from 'react';

const FavoriteEvents = () => {
  return (
    <div className="w-full">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-black mb-6">Favourite Events</h1>

      {/* Coming Soon UI */}
      <div className="flex flex-col items-center justify-center py-20">
        {/* Icon Container */}
        <div className="w-32 h-32 bg-gradient-to-br from-[#FF4000]/10 to-[#FF4000]/5 rounded-full flex items-center justify-center mb-6">
          <svg className="w-16 h-16 text-[#FF4000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>

        {/* Coming Soon Text */}
        <h2 className="text-3xl font-bold text-black mb-3">Coming Soon</h2>
        <p className="text-base text-[#4F4F4F] text-center max-w-md mb-8">
          We're working on bringing you the ability to save and manage your favorite events. Stay tuned!
        </p>

        {/* Feature List */}
        <div className="bg-white rounded-xl border border-[#EEEEEE] p-6 max-w-md w-full">
          <h3 className="text-sm font-semibold text-black mb-4">What's Coming:</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#FF4000] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-[#4F4F4F]">Save events you're interested in</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#FF4000] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-[#4F4F4F]">Quick access to your favorite events</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#FF4000] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-[#4F4F4F]">Get notified about updates</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FavoriteEvents;
