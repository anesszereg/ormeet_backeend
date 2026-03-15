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
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <EventCarousel />
      <DiscoverSection />
      <TrendingEvents />
      <EventsInCalifornia />
      <FindYourVibe />
      <BigCities />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
}
