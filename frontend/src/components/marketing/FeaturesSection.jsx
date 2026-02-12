import React from 'react';
import './FeaturesSection.css';

const FeaturesSection = () => {
  const features = [
    {
      icon: 'fa-book-reader',
      iconClass: 'icon-1',
      title: 'Ready-Made Courses',
      description: 'Access our comprehensive library of professionally-designed cybersecurity awareness courses. No content creation needed—just subscribe and deploy.'
    },
    {
      icon: 'fa-users-cog',
      iconClass: 'icon-2',
      title: 'Employee Management',
      description: 'Easily add and organize employees, create teams, assign courses, and manage learning paths all from your intuitive admin portal.'
    },
    {
      icon: 'fa-chart-bar',
      iconClass: 'icon-3',
      title: 'Advanced Analytics',
      description: 'Track progress, measure completion rates, identify knowledge gaps, and generate comprehensive reports to demonstrate training effectiveness.'
    },
    {
      icon: 'fa-certificate',
      iconClass: 'icon-1',
      title: 'Automated Certificates',
      description: 'Issue professional certificates automatically upon course completion. Maintain compliance records and boost employee motivation.'
    },
    {
      icon: 'fa-mobile-alt',
      iconClass: 'icon-2',
      title: 'Mobile Learning',
      description: 'Your employees can learn anytime, anywhere on any device. Our responsive platform ensures a seamless experience across all screens.'
    },
    {
      icon: 'fa-shield-alt',
      iconClass: 'icon-3',
      title: 'Compliance Ready',
      description: 'Meet industry standards and regulatory requirements with courses designed by cybersecurity experts. Stay audit-ready with detailed reporting.'
    }
  ];

  return (
    <section id="features" className="features">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <i className="fas fa-sparkles"></i>
            <span>Features</span>
          </div>
          <h2 className="section-title">
            Everything You Need to <span className="gradient-text">Train Your Team</span>
          </h2>
          <p className="section-description">
            Our platform provides all the tools you need to deliver effective cybersecurity 
            awareness training at scale.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className={`feature-icon ${feature.iconClass}`}>
                <i className={`fas ${feature.icon}`}></i>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
