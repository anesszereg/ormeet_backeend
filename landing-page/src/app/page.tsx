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

export default function Home() {
  const [selectedCity, setSelectedCity] = useState("California");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <EventCarousel />
      <DiscoverSection onCityChange={setSelectedCity} />
      <TrendingEvents />
      <EventsInCalifornia selectedCity={selectedCity} />
      <FindYourVibe />
      <BigCities />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
}
