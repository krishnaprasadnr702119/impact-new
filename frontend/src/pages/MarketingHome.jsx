import React, { useEffect, useState } from 'react';
import Navbar from '../components/marketing/Navbar';
import HeroSection from '../components/marketing/HeroSection';
import FeaturesSection from '../components/marketing/FeaturesSection';
import HowItWorksSection from '../components/marketing/HowItWorksSection';
import PricingSection from '../components/marketing/PricingSection';
import TestimonialsSection from '../components/marketing/TestimonialsSection';
import ContactSection from '../components/marketing/ContactSection';
import Footer from '../components/marketing/Footer';
import BackToTop from '../components/marketing/BackToTop';
import './MarketingHome.css';

const MarketingHome = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="marketing-home">
      <Navbar isScrolled={isScrolled} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default MarketingHome;
