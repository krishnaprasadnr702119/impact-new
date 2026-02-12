import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PricingSection.css';

const PricingSection = () => {
  const navigate = useNavigate();
  const plans = [
    {
      name: 'Starter',
      price: '$99',
      period: '/month',
      description: 'Perfect for small teams getting started with cybersecurity training',
      features: [
        'Up to 50 employees',
        'Full course library access',
        'Basic analytics & reporting',
        'Email support',
        'Course certificates',
        'Mobile app access'
      ],
      featured: false
    },
    {
      name: 'Professional',
      price: '$299',
      period: '/month',
      description: 'Ideal for growing organizations with advanced training needs',
      features: [
        'Up to 250 employees',
        'Full course library access',
        'Advanced analytics & insights',
        'Priority email & chat support',
        'Custom course assignments',
        'API access',
        'Dedicated account manager',
        'SSO integration'
      ],
      featured: true,
      badge: 'Most Popular'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Tailored solutions for large organizations with specific requirements',
      features: [
        'Unlimited employees',
        'Full course library access',
        'Enterprise-grade analytics',
        '24/7 priority support',
        'Custom course development',
        'White-label options',
        'Advanced integrations',
        'Compliance reporting',
        'On-premise deployment option'
      ],
      featured: false
    }
  ];

  const handleGetStarted = () => {
    navigate('/login');
  };
  
  const handleContactClick = () => {
    const element = document.getElementById('contact');
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" className="pricing">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <i className="fas fa-tag"></i>
            <span>Pricing</span>
          </div>
          <h2 className="section-title">
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h2>
          <p className="section-description">
            Choose the plan that fits your organization. All plans include access to our 
            complete course library and core features. Scale as you grow.
          </p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
              {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
              <div className="pricing-plan">{plan.name}</div>
              <div className="pricing-price">
                {plan.price}
                {plan.period && <span>{plan.period}</span>}
              </div>
              <p className="pricing-description">{plan.description}</p>
              <ul className="pricing-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <i className="fas fa-check-circle"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={plan.name === 'Enterprise' ? handleContactClick : handleGetStarted} 
                className="pricing-cta"
              >
                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
