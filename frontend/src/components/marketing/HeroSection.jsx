import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();
  const statsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const finalValue = element.dataset.value;
            animateCounter(element, finalValue);
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.5 }
    );

    statsRef.current.forEach((stat) => {
      if (stat) observer.observe(stat);
    });

    return () => observer.disconnect();
  }, []);

  const animateCounter = (element, target) => {
    const targetNum = parseInt(target.replace(/[^0-9]/g, ''));
    const duration = 2000;
    const increment = targetNum / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += increment;
      if (current < targetNum) {
        element.textContent = Math.round(current) + target.replace(/[0-9]/g, '');
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    updateCounter();
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleFeaturesClick = () => {
    const element = document.getElementById('features');
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="hero">
      {/* Animated Ocean Waves Background */}
      <div className="ocean-waves">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
        <div className="wave wave4"></div>
      </div>
      
      {/* Ocean Bubbles */}
      <div className="ocean-bubble"></div>
      <div className="ocean-bubble"></div>
      <div className="ocean-bubble"></div>
      <div className="ocean-bubble"></div>
      <div className="ocean-bubble"></div>
      
      {/* Gradient Orbs */}
      <div className="gradient-orb gradient-orb-1"></div>
      <div className="gradient-orb gradient-orb-2"></div>
      <div className="gradient-orb gradient-orb-3"></div>
      
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span>✨</span>
              <span>Next-Generation Learning Platform</span>
            </div>
            <h1 className="hero-title">
              Transform Learning, <br />
              <span className="gradient-text">Elevate Your Team</span>
            </h1>
            <p className="hero-description">
              Empower your organization with ready-made cybersecurity awareness courses. 
              Subscribe, add employees, assign courses, and track progress—all from one powerful platform.
            </p>
            <div className="hero-cta">
              <button onClick={handleGetStarted} className="btn btn-primary">
                <span>Get Started</span>
                <i className="fas fa-arrow-right"></i>
              </button>
              <button onClick={handleFeaturesClick} className="btn btn-secondary">
                <i className="fas fa-play-circle"></i>
                <span>Watch Demo</span>
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div
                  className="stat-number"
                  ref={(el) => (statsRef.current[0] = el)}
                  data-value="500+"
                >
                  0
                </div>
                <div className="stat-label">Organizations</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div
                  className="stat-number"
                  ref={(el) => (statsRef.current[1] = el)}
                  data-value="50K+"
                >
                  0
                </div>
                <div className="stat-label">Active Learners</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div
                  className="stat-number"
                  ref={(el) => (statsRef.current[2] = el)}
                  data-value="98%"
                >
                  0
                </div>
                <div className="stat-label">Satisfaction</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&auto=format"
                alt="Team collaboration and learning"
                className="hero-main-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="floating-card floating-card-1">
              <div className="card-icon icon-primary">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="card-content">
                <div className="card-value">+85%</div>
                <div className="card-label">Completion Rate</div>
              </div>
            </div>
            <div className="floating-card floating-card-2">
              <div className="card-icon icon-accent">
                <i className="fas fa-users"></i>
              </div>
              <div className="card-content">
                <div className="card-value">24/7</div>
                <div className="card-label">Learning Access</div>
              </div>
            </div>
            <div className="floating-card floating-card-3">
              <div className="card-icon icon-secondary">
                <i className="fas fa-trophy"></i>
              </div>
              <div className="card-content">
                <div className="card-value">5,000+</div>
                <div className="card-label">Certificates Issued</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
