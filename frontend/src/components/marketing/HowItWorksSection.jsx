import React from 'react';
import './HowItWorksSection.css';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '1',
      title: 'Subscribe to a Plan',
      description: 'Choose the plan that fits your organization size. Get instant access to our complete library of cybersecurity awareness courses.'
    },
    {
      number: '2',
      title: 'Add Your Employees',
      description: 'Quickly import or manually add your team members. Organize them into departments, teams, or custom groups for targeted training.'
    },
    {
      number: '3',
      title: 'Assign Courses',
      description: 'Select courses from our library and assign them to individuals or groups. Set deadlines and configure automated reminders.'
    },
    {
      number: '4',
      title: 'Track & Report',
      description: 'Monitor progress in real-time with comprehensive analytics. Generate reports for stakeholders and maintain compliance records.'
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <i className="fas fa-route"></i>
            <span>How It Works</span>
          </div>
          <h2 className="section-title">
            Get Started in <span className="gradient-text">4 Simple Steps</span>
          </h2>
          <p className="section-description">
            Launch your cybersecurity awareness program in minutes, not months. 
            Our streamlined process makes implementation effortless.
          </p>
        </div>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
