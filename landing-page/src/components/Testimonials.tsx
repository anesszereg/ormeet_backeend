"use client";

import { useId } from "react";
import Image from "next/image";
import type { Testimonial } from "@/types";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";

const allTestimonialPages: Testimonial[][] = [
  [
    {
      id: 1,
      name: "Michael Thompson",
      role: "Concert Enthusiast",
      avatar: "/images/landingPage/photoPorifle/mask-group-1.png",
      rating: 5,
      text: "I've attended everything from art shows to weekend workshops—all thanks to Ormeet's personalized recommendations.",
    },
    {
      id: 2,
      name: "Emily Carter",
      role: "Weekend Explorer",
      avatar: "/images/landingPage/photoPorifle/mask-group-2.png",
      rating: 3,
      text: "I love how I can quickly find events in my city and get my tickets in just a few clicks. The mobile ticket access are super helpful too!",
    },
    {
      id: 3,
      name: "Michael Thompson",
      role: "Concert Enthusiast",
      avatar: "/images/landingPage/photoPorifle/mask-group-1.png",
      rating: 5,
      text: "I've attended everything from art shows to weekend workshops—all thanks to Ormeet's personalized recommendations.",
    },
    {
      id: 4,
      name: "Jessica Monroe",
      role: "Founder of CreativeFest",
      avatar: "/images/landingPage/photoPorifle/mask-group.png",
      rating: 4.5,
      text: "Creating events, tracking ticket sales, and managing attendees—all from one dashboard. It's efficient, professional, and saves me a ton of time.",
    },
    {
      id: 5,
      name: "Emily Carter",
      role: "Weekend Explorer",
      avatar: "/images/landingPage/photoPorifle/mask-group-2.png",
      rating: 3,
      text: "I love how I can quickly find events in my city and get my tickets in just a few clicks. The mobile ticket access are super helpful too!",
    },
    {
      id: 6,
      name: "Jessica Monroe",
      role: "Founder of CreativeFest",
      avatar: "/images/landingPage/photoPorifle/mask-group.png",
      rating: 4.5,
      text: "Creating events, tracking ticket sales, and managing attendees—all from one dashboard. It's efficient, professional, and saves me a ton of time.",
    },
  ],
  [
    {
      id: 7,
      name: "David Chen",
      role: "Tech Meetup Organizer",
      avatar: "/images/landingPage/photoPorifle/mask-group-3.png",
      rating: 5,
      text: "Ormeet made it incredibly easy to set up our monthly tech meetups. The registration flow is seamless and attendees love it.",
    },
    {
      id: 8,
      name: "Emily Carter",
      role: "Weekend Explorer",
      avatar: "/images/landingPage/photoPorifle/mask-group-2.png",
      rating: 4,
      text: "Every weekend I discover something new on Ormeet. From food festivals to outdoor yoga, there's always something exciting happening nearby.",
    },
    {
      id: 9,
      name: "Michael Thompson",
      role: "Concert Enthusiast",
      avatar: "/images/landingPage/photoPorifle/mask-group-1.png",
      rating: 5,
      text: "The event discovery feature is amazing. I've found concerts I never would have known about otherwise. Highly recommend!",
    },
    {
      id: 10,
      name: "Jessica Monroe",
      role: "Founder of CreativeFest",
      avatar: "/images/landingPage/photoPorifle/mask-group.png",
      rating: 4.5,
      text: "As an organizer, the analytics dashboard gives me real-time insights into ticket sales and attendee demographics. Game changer!",
    },
    {
      id: 11,
      name: "David Chen",
      role: "Tech Meetup Organizer",
      avatar: "/images/landingPage/photoPorifle/mask-group-3.png",
      rating: 4,
      text: "The platform handles everything from RSVPs to reminders. Our no-show rate dropped significantly since switching to Ormeet.",
    },
    {
      id: 12,
      name: "Emily Carter",
      role: "Weekend Explorer",
      avatar: "/images/landingPage/photoPorifle/mask-group-2.png",
      rating: 5,
      text: "I love the personalized event suggestions. Ormeet really understands what kind of experiences I enjoy. Five stars!",
    },
  ],
  [
    {
      id: 13,
      name: "Michael Thompson",
      role: "Concert Enthusiast",
      avatar: "/images/landingPage/photoPorifle/mask-group-1.png",
      rating: 5,
      text: "From jazz nights to electronic festivals, Ormeet has become my go-to for finding the best live music events in town.",
    },
    {
      id: 14,
      name: "Jessica Monroe",
      role: "Founder of CreativeFest",
      avatar: "/images/landingPage/photoPorifle/mask-group.png",
      rating: 4.5,
      text: "The customer support team is fantastic. They helped us set up our first large-scale event and everything went smoothly.",
    },
    {
      id: 15,
      name: "David Chen",
      role: "Tech Meetup Organizer",
      avatar: "/images/landingPage/photoPorifle/mask-group-3.png",
      rating: 5,
      text: "Ormeet's pricing is very fair for organizers. We get premium features without breaking the bank. Couldn't ask for more.",
    },
    {
      id: 16,
      name: "Emily Carter",
      role: "Weekend Explorer",
      avatar: "/images/landingPage/photoPorifle/mask-group-2.png",
      rating: 4,
      text: "The ticket purchasing process is so smooth. I can buy tickets for multiple events in minutes. Love the mobile experience!",
    },
    {
      id: 17,
      name: "Michael Thompson",
      role: "Concert Enthusiast",
      avatar: "/images/landingPage/photoPorifle/mask-group-1.png",
      rating: 4.5,
      text: "Great platform for discovering local events. The map view feature is especially useful when traveling to new cities.",
    },
    {
      id: 18,
      name: "Jessica Monroe",
      role: "Founder of CreativeFest",
      avatar: "/images/landingPage/photoPorifle/mask-group.png",
      rating: 5,
      text: "We've grown our event attendance by 40% since using Ormeet. The promotional tools and audience targeting are excellent.",
    },
  ],
];

const TOTAL_PAGES = allTestimonialPages.length;

const STAR_PATH = "M10 1.66699L12.575 6.88366L18.3333 7.72533L14.1667 11.7837L15.15 17.517L10 14.8087L4.85 17.517L5.83333 11.7837L1.66667 7.72533L7.425 6.88366L10 1.66699Z";

/** Uses useId() to generate a unique gradient ID per instance, preventing SVG ID collisions. */
const StarRating = ({ rating }: { rating: number }) => {
  const uniqueId = useId();
  const gradientId = `halfStar-${uniqueId}`;
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d={STAR_PATH} fill="#FFA500" />
        </svg>
      ))}
      {hasHalf && (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <defs>
            <linearGradient id={gradientId}>
              <stop offset="50%" stopColor="#FFA500" />
              <stop offset="50%" stopColor="#E0E0E0" />
            </linearGradient>
          </defs>
          <path d={STAR_PATH} fill={`url(#${gradientId})`} />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d={STAR_PATH} fill="#E0E0E0" />
        </svg>
      ))}
    </div>
  );
};

const TestimonialCard = ({ t }: { t: Testimonial }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5F5F5] flex flex-col justify-between">
    <div>
      <StarRating rating={t.rating} />
      <p className="text-sm text-muted leading-relaxed mt-4 mb-6">
        {t.text}
      </p>
    </div>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0">
        <Image src={t.avatar} alt={t.name} fill className="object-cover" sizes="40px" />
      </div>
      <div>
        <p className="text-sm font-semibold text-black">{t.name}</p>
        <p className="text-xs text-medium-gray">{t.role}</p>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const { page, handlePrev, handleNext } = usePagination({ totalPages: TOTAL_PAGES });
  const currentTestimonials = allTestimonialPages[page - 1];
  const topRow = currentTestimonials.slice(0, 3);
  const bottomRow = currentTestimonials.slice(3, 6);

  return (
    <section className="w-full bg-white py-16 px-6 md:px-10 lg:px-16 xl:px-20">
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        {/* Stacked Avatars */}
        <div className="flex items-center -space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative z-30">
            <Image src="/images/landingPage/photoPorifle/mask-group-1.png" alt="User" fill className="object-cover" sizes="40px" />
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative z-20">
            <Image src="/images/landingPage/photoPorifle/mask-group-2.png" alt="User" fill className="object-cover" sizes="40px" />
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative z-10">
            <Image src="/images/landingPage/photoPorifle/mask-group-3.png" alt="User" fill className="object-cover" sizes="40px" />
          </div>
        </div>

        {/* Subtitle */}
        <span className="text-xs font-semibold tracking-widest text-muted uppercase mb-4">
          5000+ Happy Ormeet Users
        </span>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl text-center text-black leading-tight">
          <span className="font-bold">Loved</span> by attendees.{" "}
          <span className="font-bold">trusted</span> by organizers.
        </h2>
      </div>

      {/* Testimonial Cards */}
      <div className="space-y-5 max-w-[1200px] mx-auto">
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topRow.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {bottomRow.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center mt-10">
        <PaginationControls
          page={page}
          totalPages={TOTAL_PAGES}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </div>
    </section>
  );
};

export default Testimonials;
