import React from 'react';
import './TestimonialsSection.css';

const TestimonialsSection = () => {
  const testimonials = [
    {
      text: "Impact has transformed our cybersecurity training. Within weeks of subscribing and adding our team, we saw a dramatic improvement in security awareness. The ready-made courses are comprehensive and engaging.",
      author: "Sarah Johnson",
      role: "CISO, TechCorp Inc.",
      avatar: "SJ",
      rating: 5
    },
    {
      text: "The ease of adding employees and assigning courses is incredible. What used to take days now takes minutes. Our compliance reporting is automated, and our team actually enjoys the training content.",
      author: "Michael Chen",
      role: "IT Director, Global Finance",
      avatar: "MC",
      rating: 5
    },
    {
      text: "We've tried other platforms, but Impact's focus on ready-made cybersecurity courses makes all the difference. The admin portal is intuitive, and the analytics help us identify training gaps immediately.",
      author: "Emily Rodriguez",
      role: "Security Manager, HealthTech Solutions",
      avatar: "ER",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <i className="fas fa-quote-left"></i>
            <span>Testimonials</span>
          </div>
          <h2 className="section-title">
            Loved by <span className="gradient-text">Security Leaders</span>
          </h2>
          <p className="section-description">
            See what organizations around the world are saying about Impact's 
            cybersecurity awareness platform.
          </p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.avatar}</div>
                <div className="author-info">
                  <div className="author-name">{testimonial.author}</div>
                  <div className="author-role">{testimonial.role}</div>
                  <div className="testimonial-rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
