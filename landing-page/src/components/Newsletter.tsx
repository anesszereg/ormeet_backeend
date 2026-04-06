"use client";

import { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    setEmail("");
  };

  return (
    <section className="w-full px-6 md:px-10 lg:px-16 xl:px-20 py-12 bg-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left: Heading + Description */}
        <div className="max-w-lg">
          <h2 className="text-xl md:text-2xl font-bold text-black mb-2">
            Be the first to know. never miss an event again!
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Get exclusive updates, early bird access, and handpicked events — delivered
            straight to your inbox.
          </p>
        </div>

        {/* Right: Email Input + Button */}
        <form onSubmit={handleSubmit} className="flex items-center w-full lg:w-auto">
          <div className="relative flex items-center flex-1 lg:flex-none border border-light-gray rounded-full focus-within:border-primary transition-colors">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full lg:w-[340px] h-12 pl-5 pr-14 text-sm font-medium text-black placeholder-input-gray placeholder:font-normal bg-transparent border-none outline-none"
              required
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark hover:shadow-lg transition-all duration-200 cursor-pointer"
              style={{ boxShadow: '0 2px 8px rgba(255, 64, 0, 0.2)' }}
              aria-label="Keep Me Updated"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 10L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 4H10V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
