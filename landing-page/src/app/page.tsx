"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import EventCarousel from "@/components/EventCarousel";
import DiscoverSection from "@/components/DiscoverSection";
import TrendingEvents from "@/components/TrendingEvents";
import EventsInCalifornia from "@/components/EventsInCalifornia";
import FindYourVibe from "@/components/FindYourVibe";
import BigCities from "@/components/BigCities";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { useLandingEvents } from "@/hooks/useLandingEvents";

export default function Home() {
  const [selectedCity, setSelectedCity] = useState("California");
  // One backend call shared by every event-listing section below.
  const { events, isLoading, hasLoaded } = useLandingEvents();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <EventCarousel events={events} isLoading={isLoading} />
      <DiscoverSection
        events={events}
        hasLoaded={hasLoaded}
        onCityChange={setSelectedCity}
      />
      <TrendingEvents events={events} hasLoaded={hasLoaded} />
      <EventsInCalifornia
        events={events}
        hasLoaded={hasLoaded}
        selectedCity={selectedCity}
      />
      <FindYourVibe />
      <BigCities />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
}
