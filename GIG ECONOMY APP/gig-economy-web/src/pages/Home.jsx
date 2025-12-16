import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import '../styles/home.css';

// Particle Field Background
function ParticleField({ count = 5000 }) {
  const points = useRef();

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      positions.set([x, y, z], i * 3);
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.x = state.clock.getElapsedTime() * 0.05;
      points.current.rotation.y = state.clock.getElapsedTime() * 0.075;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={points} positions={particlesPosition} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

// Animated Sphere with Wireframe
function AnimatedSphere() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.5, 64, 64]} scale={1.5}>
      <MeshDistortMaterial
        color="#cccccc"
        attach="material"
        distort={0.3}
        speed={1.5}
        roughness={0.4}
        metalness={0.8}
        wireframe={true}
      />
    </Sphere>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-3d">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <ParticleField />
            <AnimatedSphere />
          </Canvas>
        </div>

        <div className="hero-overlay">
          <div className="hero-content-wrapper">
            <h1 className="hero-headline">
              Financial Control
              <br />
              <span className="hero-highlight">For Gig Workers</span>
            </h1>
            <p className="hero-description">
              A comprehensive platform designed specifically for freelancers and gig economy workers
              to track income, manage expenses, and achieve financial independence.
            </p>
            <div className="hero-cta">
              <button className="cta-primary" onClick={() => navigate('/register')}>
                Start Your Journey
              </button>
              <button className="cta-secondary" onClick={() => navigate('/login')}>
                Sign In
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">10,000+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">$2M+</span>
                <span className="stat-label">Income Tracked</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">150+</span>
                <span className="stat-label">Countries</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section-about">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">About Platform</span>
            <h2 className="section-title">Built For Modern Workers</h2>
            <p className="section-subtitle">
              We understand the unique challenges of gig economy work. Our platform provides the tools
              you need to manage your finances professionally, track multiple income streams, and plan
              for your financial future with confidence.
            </p>
          </div>

          <div className="about-grid">
            <div className="about-card">
              <div className="about-icon">01</div>
              <h3>Multiple Income Streams</h3>
              <p>
                Consolidate income from Uber, DoorDash, Upwork, Fiverr, and any other platform.
                Track each source separately or view your complete financial picture.
              </p>
            </div>
            <div className="about-card">
              <div className="about-icon">02</div>
              <h3>Expense Tracking</h3>
              <p>
                Log business expenses, mileage, equipment purchases, and more. Categorize
                automatically and generate reports for tax season.
              </p>
            </div>
            <div className="about-card">
              <div className="about-icon">03</div>
              <h3>Smart Analytics</h3>
              <p>
                Understand your earning patterns, identify your most profitable work, and make
                data-driven decisions about where to focus your time.
              </p>
            </div>
            <div className="about-card">
              <div className="about-icon">04</div>
              <h3>Goal Setting</h3>
              <p>
                Set savings goals, track progress in real-time, and receive notifications when
                you're on track or falling behind your targets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-features">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Core Features</span>
            <h2 className="section-title">Everything You Need In One Place</h2>
          </div>

          <div className="features-showcase">
            <div className="feature-main">
              <div className="feature-visual">
                <div className="feature-screen">
                  <div className="screen-header">
                    <div className="screen-dot"></div>
                    <div className="screen-dot"></div>
                    <div className="screen-dot"></div>
                  </div>
                  <div className="screen-content">
                    {/* Dashboard Mockup with Stats Cards */}
                    <div className="dashboard-preview">
                      <div className="dashboard-stats">
                        <div className="stat-preview">
                          <div className="stat-preview-icon">💰</div>
                          <div className="stat-preview-label">Monthly Income</div>
                          <div className="stat-preview-value">$4,850</div>
                        </div>
                        <div className="stat-preview">
                          <div className="stat-preview-icon">💳</div>
                          <div className="stat-preview-label">Expenses</div>
                          <div className="stat-preview-value">$1,240</div>
                        </div>
                        <div className="stat-preview">
                          <div className="stat-preview-icon">📊</div>
                          <div className="stat-preview-label">Net Income</div>
                          <div className="stat-preview-value positive">$3,610</div>
                        </div>
                      </div>
                      <div className="dashboard-chart">
                        <div className="chart-bars">
                          <div className="chart-bar" style={{height: '60%'}}></div>
                          <div className="chart-bar" style={{height: '75%'}}></div>
                          <div className="chart-bar" style={{height: '50%'}}></div>
                          <div className="chart-bar" style={{height: '85%'}}></div>
                          <div className="chart-bar" style={{height: '70%'}}></div>
                          <div className="chart-bar" style={{height: '90%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="feature-details">
                <h3>Real-Time Income Dashboard</h3>
                <p>
                  See your earnings update in real-time as you complete gigs. Track daily, weekly,
                  and monthly totals across all platforms. Visualize trends and patterns to optimize
                  your earning potential.
                </p>
                <ul className="feature-list">
                  <li>Live income tracking from multiple sources</li>
                  <li>Customizable date ranges and filters</li>
                  <li>Export data for tax preparation</li>
                  <li>Automatic currency conversion</li>
                </ul>
              </div>
            </div>

            <div className="feature-row">
              <div className="feature-item">
                <div className="feature-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                </div>
                <h4>Expense Management</h4>
                <p>Track business expenses with receipt uploads and automatic categorization</p>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18" />
                  </svg>
                </div>
                <h4>Advanced Reports</h4>
                <p>Generate detailed financial reports and export to CSV or PDF format</p>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h4>Time Tracking</h4>
                <p>Log hours worked on different projects and calculate your true hourly rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-how">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">How It Works</span>
            <h2 className="section-title">Get Started In Minutes</h2>
          </div>

          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>
                Sign up with your email in seconds. No credit card required. Start with our free
                tier and upgrade when you're ready.
              </p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Connect Platforms</h3>
              <p>
                Link your gig platforms or manually add income sources. We support over 50
                popular platforms and custom entries.
              </p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Track & Analyze</h3>
              <p>
                Watch your financial data come to life with real-time dashboards, insights,
                and personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">User Stories</span>
            <h2 className="section-title">Trusted By Thousands</h2>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">
                "This platform changed how I manage my freelance income. I can finally see where
                my money is going and plan for the future. The expense tracking alone has saved
                me thousands during tax season."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">SM</div>
                <div className="author-info">
                  <div className="author-name">Sarah Martinez</div>
                  <div className="author-role">Freelance Designer</div>
                </div>
              </div>
            </div>

            <div className="testimonial">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">
                "As someone juggling Uber, DoorDash, and freelance coding, tracking my income was
                a nightmare. This tool made everything simple. The analytics help me decide which
                gigs are actually worth my time."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">JC</div>
                <div className="author-info">
                  <div className="author-name">James Chen</div>
                  <div className="author-role">Multi-Platform Worker</div>
                </div>
              </div>
            </div>

            <div className="testimonial">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">
                "The goal-setting feature motivated me to save more consistently. I've hit three
                major savings goals this year and finally feel in control of my financial future.
                Highly recommend for any gig worker."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">ER</div>
                <div className="author-info">
                  <div className="author-name">Emily Rodriguez</div>
                  <div className="author-role">Content Creator</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section-pricing">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Transparent Pricing</span>
            <h2 className="section-title">Choose Your Plan</h2>
            <p className="section-subtitle">No hidden fees. Cancel anytime. 14-day money-back guarantee.</p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <h3 className="pricing-title">Free</h3>
              <div className="pricing-price">
                <span className="price-amount">$0</span>
                <span className="price-period">/month</span>
              </div>
              <ul className="pricing-features">
                <li>Track up to 3 income sources</li>
                <li>Basic expense tracking</li>
                <li>Monthly reports</li>
                <li>Mobile app access</li>
                <li>Email support</li>
              </ul>
              <button className="pricing-button" onClick={() => navigate('/register')}>
                Get Started Free
              </button>
            </div>

            <div className="pricing-card featured">
              <div className="pricing-badge">Most Popular</div>
              <h3 className="pricing-title">Pro</h3>
              <div className="pricing-price">
                <span className="price-amount">$12</span>
                <span className="price-period">/month</span>
              </div>
              <ul className="pricing-features">
                <li>Unlimited income sources</li>
                <li>Advanced analytics</li>
                <li>Goal tracking & forecasting</li>
                <li>Receipt scanning</li>
                <li>Export to CSV/PDF</li>
                <li>Advanced tax tools</li>
                <li>Dedicated account manager</li>
                <li>Priority support</li>
              </ul>
              <button className="pricing-button primary" onClick={() => navigate('/register')}>
                Start Pro Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-faq">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">FAQ</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h3>Is my financial data secure?</h3>
              <p>
                Yes. We use bank-level encryption (256-bit SSL) to protect your data. Your information
                is encrypted both in transit and at rest. We never sell your data to third parties.
              </p>
            </div>

            <div className="faq-item">
              <h3>Can I cancel anytime?</h3>
              <p>
                Absolutely. No long-term contracts. Cancel with one click from your account settings.
                If you cancel, you'll still have access until the end of your billing period.
              </p>
            </div>

            <div className="faq-item">
              <h3>Do you support international currencies?</h3>
              <p>
                Yes, we support over 150 currencies with automatic conversion. Set your preferred
                currency and we'll handle the rest.
              </p>
            </div>

            <div className="faq-item">
              <h3>Can I import existing data?</h3>
              <p>
                Yes. Import transactions from CSV files or connect to supported platforms for automatic
                sync. We also offer a migration service for large datasets.
              </p>
            </div>

            <div className="faq-item">
              <h3>Is there a mobile app?</h3>
              <p>
                Our web app is fully responsive and works great on mobile. Native iOS and Android apps
                are coming soon for an even better mobile experience.
              </p>
            </div>

            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>
                We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers.
                All payments are processed securely through Stripe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-final-cta">
        <div className="container">
          <div className="cta-box">
            <h2>Start Managing Your Finances Today</h2>
            <p>
              Join thousands of gig workers who have taken control of their financial future.
              No credit card required to start.
            </p>
            <div className="cta-buttons">
              <button className="cta-primary large" onClick={() => navigate('/register')}>
                Create Free Account
              </button>
              <button className="cta-secondary large" onClick={() => navigate('/login')}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>GIG ECONOMY</h4>
              <p>Financial management for the modern workforce</p>
            </div>
            <div className="footer-section">
              <h5>Product</h5>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#testimonials">Testimonials</a>
            </div>
            <div className="footer-section">
              <h5>Company</h5>
              <a href="#about">About Us</a>
              <a href="#careers">Careers</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer-section">
              <h5>Legal</h5>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#security">Security</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Gig Economy App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
