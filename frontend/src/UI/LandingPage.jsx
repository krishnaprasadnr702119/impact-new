import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);

            // Update active section
            const sections = document.querySelectorAll('section[id]');
            let current = 'home';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Particle animation effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particlesArray = [];
        let mouse = { x: null, y: null, radius: 150 };

        const handleMouseMove = (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.baseX = x;
                this.baseY = y;
                this.size = Math.random() * 2 + 1;
                this.density = Math.random() * 30 + 1;
            }

            draw() {
                ctx.fillStyle = 'rgba(99, 102, 241, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouse.radius) {
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 10;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 10;
                    }
                }

                // Wave effect
                this.y += Math.sin((this.x + Date.now() / 1000) * 0.02) * 0.5;
            }
        }

        function init() {
            particlesArray = [];
            let numberOfParticles = (canvas.width * canvas.height) / 15000;
            for (let i = 0; i < numberOfParticles; i++) {
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                particlesArray.push(new Particle(x, y));
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].draw();
                particlesArray[i].update();
            }
            requestAnimationFrame(animate);
        }

        init();
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    const handleGetStarted = () => {
        navigate('/login');
    };

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="nav-logo" onClick={() => scrollToSection('home')}>
                        <i className="fas fa-graduation-cap"></i>
                        <span>Impact LMS</span>
                    </div>

                    <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                        <li><a href="#home" className={activeSection === 'home' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a></li>
                        <li><a href="#features" className={activeSection === 'features' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a></li>
                        <li><a href="#pricing" className={activeSection === 'pricing' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>Pricing</a></li>
                        <li><a href="#about" className={activeSection === 'about' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a></li>
                        <li><a href="#contact" className={activeSection === 'contact' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a></li>
                        <li><button className="btn-login" onClick={handleGetStarted}>Login</button></li>
                    </ul>

                    <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="hero">
                <canvas ref={canvasRef} className="particle-canvas"></canvas>
                <div className="hero-container">
                    <div className="hero-content">
                        <div className="hero-text animate-fade-in">
                            <div className="badge-new">🎓 Your Gateway to World-Class Learning</div>
                            <h1>Unlock Your Team's Full Potential with Premium Courses</h1>
                            <p className="hero-subtitle">Transform your organization with expertly crafted courses. Empower your portal admins to seamlessly onboard employees, assign targeted learning paths, and watch your team soar to new heights of success.</p>
                            <div className="hero-buttons">
                                <button className="btn btn-primary" onClick={handleGetStarted}>
                                    <i className="fas fa-rocket"></i> Get Started Free
                                </button>
                                <button className="btn btn-secondary" onClick={() => scrollToSection('features')}>
                                    <i className="fas fa-play-circle"></i> Watch Demo
                                </button>
                            </div>
                            <div className="hero-trust">
                                <p><i className="fas fa-shield-check"></i> Trusted by 500+ organizations worldwide</p>
                            </div>
                            <div className="hero-stats">
                                <div className="stat">
                                    <h3>10,000+</h3>
                                    <p>Active Learners</p>
                                </div>
                                <div className="stat">
                                    <h3>500+</h3>
                                    <p>Courses Available</p>
                                </div>
                                <div className="stat">
                                    <h3>98%</h3>
                                    <p>Satisfaction Rate</p>
                                </div>
                                <div className="stat">
                                    <h3>24/7</h3>
                                    <p>Support Available</p>
                                </div>
                            </div>
                        </div>
                        <div className="hero-image animate-slide-in">
                            <div className="image-decorations">
                                <div className="decoration-circle decoration-1"></div>
                                <div className="decoration-circle decoration-2"></div>
                                <div className="decoration-circle decoration-3"></div>
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop"
                                alt="Team Learning"
                                style={{ width: '100%', height: '680px', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 30px 80px rgba(0, 0, 0, 0.2)' }}
                            />
                            <div className="floating-card card-1">
                                <i className="fas fa-chart-line"></i>
                                <div>
                                    <p className="card-value">+45%</p>
                                    <p className="card-label">Engagement Increase</p>
                                </div>
                            </div>
                            <div className="floating-card card-2">
                                <i className="fas fa-trophy"></i>
                                <div>
                                    <p className="card-value">2,500+</p>
                                    <p className="card-label">Certificates Issued</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted By Section */}
            <section className="trusted-by">
                <div className="section-container">
                    <p className="trusted-label">Trusted by leading organizations worldwide</p>
                    <div className="companies-grid">
                        <div className="company-logo">
                            <i className="fas fa-building"></i>
                            <span>TechCorp</span>
                        </div>
                        <div className="company-logo">
                            <i className="fas fa-industry"></i>
                            <span>Global Industries</span>
                        </div>
                        <div className="company-logo">
                            <i className="fas fa-hospital"></i>
                            <span>HealthCare Plus</span>
                        </div>
                        <div className="company-logo">
                            <i className="fas fa-graduation-cap"></i>
                            <span>EduTech Solutions</span>
                        </div>
                        <div className="company-logo">
                            <i className="fas fa-chart-line"></i>
                            <span>Finance Pro</span>
                        </div>
                        <div className="company-logo">
                            <i className="fas fa-rocket"></i>
                            <span>StartUp Inc</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2>Everything Your Organization Needs to Thrive</h2>
                        <p>Discover powerful tools designed to accelerate learning and drive measurable results</p>
                    </div>
                    <div className="features-grid">
                        {[
                            { img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=300&fit=crop', title: 'Curated Course Marketplace', desc: 'Access an exclusive library of premium courses crafted by industry experts to elevate your team\'s expertise' },
                            { img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&h=300&fit=crop', title: 'Powerful Admin Dashboard', desc: 'Give your portal admins complete control with an intuitive dashboard to effortlessly manage teams and drive learning success' },
                            { img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop', title: 'Effortless Team Management', desc: 'Onboard new team members in seconds and create a thriving learning culture within your organization' },
                            { img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&h=300&fit=crop', title: 'Smart Course Assignment', desc: 'Match the right courses to the right people instantly - personalized learning paths that drive real results' },
                            { img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&h=300&fit=crop', title: 'Real-Time Performance Insights', desc: 'Track every milestone with stunning analytics that reveal exactly how your team is growing and succeeding' },
                            { img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop', title: 'Learn Anywhere, Anytime', desc: 'Empower your team with seamless mobile access - learning that fits perfectly into any schedule, anywhere' },
                            { img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop', title: 'Engaging Interactive Content', desc: 'Keep learners captivated with dynamic quizzes, immersive simulations, and rich multimedia experiences' },
                            { img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&h=300&fit=crop', title: 'Professional Certifications', desc: 'Celebrate success with beautiful certificates that showcase achievements and boost team morale' },
                            { img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&h=300&fit=crop', title: 'Bank-Level Security', desc: 'Rest easy knowing your organization\'s data is protected by enterprise-grade security trusted by Fortune 500 companies' }
                        ].map((feature, index) => (
                            <div className="feature-card" key={index}>
                                <div className="feature-image">
                                    <img src={feature.img} alt={feature.title} />
                                    <div className="feature-icon-overlay">
                                        <i className="fas fa-graduation-cap"></i>
                                    </div>
                                </div>
                                <div className="feature-content">
                                    <h3>{feature.title}</h3>
                                    <p>{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="section-container">
                    <div className="section-header">
                        <h2>Your Success Journey Starts Here</h2>
                        <p>Three simple steps to transform your team into high-performing champions</p>
                    </div>
                    <div className="steps">
                        {[
                            { num: '1', title: 'Discover & Purchase', desc: 'Explore our curated collection of world-class courses and select the perfect programs to supercharge your team\'s growth', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop' },
                            { num: '2', title: 'Build Your Dream Team', desc: 'Effortlessly invite team members and create a collaborative learning environment where everyone thrives', img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop' },
                            { num: '3', title: 'Watch Success Unfold', desc: 'Assign courses strategically and witness real-time progress as your team masters new skills and achieves breakthrough results', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop' }
                        ].map((step, index) => (
                            <div className="step" key={index}>
                                <img src={step.img} alt={step.title} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '16px', marginBottom: '1.5rem' }} />
                                <div className="step-number">{step.num}</div>
                                <div className="step-content">
                                    <h3>{step.title}</h3>
                                    <p>{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2>Investment Plans That Scale With Your Vision</h2>
                        <p>Flexible packages designed to fit organizations of every size - from startups to enterprises</p>
                    </div>
                    <div className="pricing-grid">
                        <PricingCard
                            title="Starter Growth"
                            price="$299"
                            period="per course"
                            features={[
                                'Perfect for teams up to 100',
                                'Full year of unlimited access',
                                'Essential progress insights',
                                'Dedicated email support',
                                'Mobile learning on-the-go',
                                'Professional certificates'
                            ]}
                            onCTA={handleGetStarted}
                        />
                        <PricingCard
                            title="Business Pro"
                            price="$599"
                            period="per course"
                            featured
                            badge="Most Popular Choice"
                            features={[
                                'Scale up to 500 team members',
                                'Full year of unlimited access',
                                'Advanced analytics dashboard',
                                'Priority VIP support',
                                'Custom branded experience',
                                'Exclusive bulk discounts'
                            ]}
                            onCTA={handleGetStarted}
                        />
                        <PricingCard
                            title="Enterprise Elite"
                            price="Let's Talk"
                            period=""
                            features={[
                                'Unlimited team members',
                                'Lifetime course access',
                                'Personal account manager',
                                'Round-the-clock support',
                                'Fully white-labeled solution',
                                'Bespoke course creation',
                                'Exclusive volume pricing'
                            ]}
                            onCTA={() => scrollToSection('contact')}
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials">
                <div className="section-container">
                    <div className="section-header">
                        <h2>What Our Clients Say</h2>
                        <p>Trusted by organizations worldwide</p>
                    </div>
                    <div className="testimonials-grid">
                        {[
                            { name: 'Sarah Johnson', role: 'HR Director, Tech Corp', text: 'Impact LMS has transformed our training programs. The platform is intuitive, powerful, and our employees love it!' },
                            { name: 'Michael Chen', role: 'L&D Manager, Global Industries', text: 'The analytics and tracking features are exceptional. We can now measure the real impact of our training initiatives.' },
                            { name: 'Emily Rodriguez', role: 'CEO, StartUp Inc', text: 'Excellent customer support and a feature-rich platform. Impact LMS is the best investment we\'ve made for our team.' }
                        ].map((testimonial, index) => (
                            <div className="testimonial-card" key={index}>
                                <div className="stars">
                                    {[...Array(5)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                                </div>
                                <p>"{testimonial.text}"</p>
                                <div className="testimonial-author">
                                    <h4>{testimonial.name}</h4>
                                    <p>{testimonial.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Demo Video / Platform Preview Section */}
            <section className="platform-preview">
                <div className="section-container">
                    <div className="section-header">
                        <h2>See Impact LMS in Action</h2>
                        <p>Watch how our platform transforms learning experiences</p>
                    </div>
                    <div className="preview-content">
                        <div className="preview-video">
                            <img
                                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1400&h=900&fit=crop"
                                alt="Platform Dashboard"
                                style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 30px 80px rgba(99, 102, 241, 0.3)' }}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={handleGetStarted}
                                style={{ marginTop: '2rem', fontSize: '1.2rem', padding: '1.2rem 2.5rem' }}
                            >
                                <i className="fas fa-rocket"></i> Start Free Trial
                            </button>
                        </div>
                        <div className="preview-features">
                            <h3>What You'll Get:</h3>
                            <ul>
                                <li><i className="fas fa-check-circle"></i> <strong>Intuitive Dashboard</strong> - Easy-to-use interface for all users</li>
                                <li><i className="fas fa-check-circle"></i> <strong>Real-time Analytics</strong> - Track progress and engagement instantly</li>
                                <li><i className="fas fa-check-circle"></i> <strong>Mobile Learning</strong> - Access courses on any device</li>
                                <li><i className="fas fa-check-circle"></i> <strong>Interactive Content</strong> - Quizzes, simulations, and multimedia</li>
                                <li><i className="fas fa-check-circle"></i> <strong>Automated Workflows</strong> - Notifications and certifications</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2>Frequently Asked Questions</h2>
                        <p>Find answers to common questions about Impact LMS</p>
                    </div>
                    <div className="faq-grid">
                        <FAQItem
                            question="How quickly can we get started?"
                            answer="You can start using Impact LMS within minutes! Simply sign up, customize your portal, and begin creating courses. Our onboarding team will help you every step of the way."
                        />
                        <FAQItem
                            question="Can we import existing content?"
                            answer="Yes! Impact LMS supports importing content from various formats including SCORM packages, videos, PDFs, and presentations. We also provide migration assistance."
                        />
                        <FAQItem
                            question="Is there a limit on storage?"
                            answer="Storage limits vary by plan. Professional plans include generous storage, and Enterprise plans offer unlimited storage. Contact us for custom requirements."
                        />
                        <FAQItem
                            question="Do you offer mobile apps?"
                            answer="Impact LMS is fully responsive and works seamlessly on all mobile devices through web browsers. Native mobile apps are available for Enterprise customers."
                        />
                        <FAQItem
                            question="What kind of support do you provide?"
                            answer="We offer email support for all plans, priority support for Professional plans, and 24/7 dedicated support for Enterprise customers. We also provide extensive documentation and training resources."
                        />
                        <FAQItem
                            question="Can we customize the platform?"
                            answer="Yes! Professional and Enterprise plans include custom branding options. Enterprise plans offer white-label solutions and full customization capabilities."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="cta-banner">
                <div className="section-container">
                    <div className="cta-content">
                        <h2>Ready to Transform Your Training?</h2>
                        <p>Join thousands of organizations already using Impact LMS</p>
                        <div className="cta-buttons">
                            <button className="btn btn-primary btn-large" onClick={handleGetStarted}>
                                <i className="fas fa-rocket"></i> Get Started Now
                            </button>
                            <button className="btn btn-secondary btn-large" onClick={() => scrollToSection('contact')}>
                                <i className="fas fa-comments"></i> Talk to Sales
                            </button>
                        </div>
                        <p className="cta-note">
                            <i className="fas fa-shield-alt"></i> No credit card required • 14-day free trial • Cancel anytime
                        </p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <div className="section-container">
                    <div className="about-content">
                        <div className="about-text">
                            <h2>About Impact LMS</h2>
                            <p>Impact LMS is a modern, comprehensive learning management system designed to help organizations create, deliver, and track effective training programs.</p>
                            <p>Built with cutting-edge technology and a focus on user experience, our platform empowers organizations to transform their learning initiatives and drive real business impact.</p>
                            <div className="about-features">
                                {[
                                    { icon: 'fa-rocket', title: 'Fast & Reliable', desc: 'Built with performance in mind using React and Flask' },
                                    { icon: 'fa-lock', title: 'Secure', desc: 'Enterprise-grade security with JWT authentication' },
                                    { icon: 'fa-cogs', title: 'Scalable', desc: 'Docker-based architecture that grows with your needs' }
                                ].map((item, index) => (
                                    <div className="about-feature" key={index}>
                                        <i className={`fas ${item.icon}`}></i>
                                        <div>
                                            <h4>{item.title}</h4>
                                            <p>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="about-image">
                            <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" alt="About Impact LMS" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2>Get In Touch</h2>
                        <p>Ready to transform your organization's learning? Contact us today</p>
                    </div>
                    <div className="contact-content">
                        <ContactInfo />
                        <ContactForm />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="section-container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <div className="footer-logo">
                                <i className="fas fa-graduation-cap"></i>
                                <span>Impact LMS</span>
                            </div>
                            <p>Empowering organizations with modern learning solutions</p>
                        </div>
                        <div className="footer-section">
                            <h4>Product</h4>
                            <ul>
                                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a></li>
                                <li><a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>Pricing</a></li>
                                <li><a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }}>Login</a></li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About Us</a></li>
                                <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a></li>
                                <li><a href="#">Careers</a></li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4>Legal</h4>
                            <ul>
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Terms of Service</a></li>
                                <li><a href="#">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2026 Impact LMS. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Back to Top */}
            {isScrolled && (
                <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <i className="fas fa-arrow-up"></i>
                </button>
            )}
        </div>
    );
};

// Pricing Card Component
const PricingCard = ({ title, price, period, features, featured, badge, onCTA }) => (
    <div className={`pricing-card ${featured ? 'featured' : ''}`}>
        {badge && <div className="pricing-badge">{badge}</div>}
        <div className="pricing-header">
            <h3>{title}</h3>
            <p className="price">
                <span>{price}</span>{period}
            </p>
        </div>
        <ul className="pricing-features">
            {features.map((feature, index) => (
                <li key={index}>
                    <i className="fas fa-check"></i> {feature}
                </li>
            ))}
        </ul>
        <button className={`btn ${featured ? 'btn-primary' : 'btn-outline'}`} onClick={onCTA}>
            Get Started
        </button>
    </div>
);

// Contact Info Component
const ContactInfo = () => (
    <div className="contact-info">
        <div className="contact-item">
            <i className="fas fa-envelope"></i>
            <div>
                <h4>Email</h4>
                <p>info@impactlms.com</p>
            </div>
        </div>
        <div className="contact-item">
            <i className="fas fa-phone"></i>
            <div>
                <h4>Phone</h4>
                <p>+1 (555) 123-4567</p>
            </div>
        </div>
        <div className="contact-item">
            <i className="fas fa-map-marker-alt"></i>
            <div>
                <h4>Address</h4>
                <p>123 Learning Street, Education City, EC 12345</p>
            </div>
        </div>
        <div className="social-links">
            <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
            <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
        </div>
    </div>
);

// Contact Form Component
const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        phone: '',
        plan: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', company: '', phone: '', plan: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <input type="text" name="company" placeholder="Company Name" value={formData.company} onChange={handleChange} />
            </div>
            <div className="form-group">
                <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
                <select name="plan" value={formData.plan} onChange={handleChange}>
                    <option value="">Select Plan</option>
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                </select>
            </div>
            <div className="form-group">
                <textarea name="message" rows="4" placeholder="Your Message" value={formData.message} onChange={handleChange} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Send Message</button>
        </form>
    );
};

// FAQ Item Component
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`faq-item ${isOpen ? 'open' : ''}`}>
            <div className="faq-question" onClick={() => setIsOpen(!isOpen)}>
                <h4>{question}</h4>
                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
            </div>
            {isOpen && (
                <div className="faq-answer">
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
