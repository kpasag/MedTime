import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

function Homepage() {
  const navigate = useNavigate();

  useEffect(() => {
    const elements = document.querySelectorAll('.scroll-animate');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero scroll-animate scroll-animate-up">
        <div className="hero-content">
          <h1 className="hero-title">Never Miss a Dose Again</h1>
          <p className="hero-subtitle">
            Managing multiple prescriptions shouldn't be complicated. MedTime helps you stay on top of your medications with smart reminders and caregiver support.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Get Started
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Why Choose MedTime?</h2>
        <div className="features-grid">
          <div className="feature-card scroll-animate scroll-animate-left">
            <div className="feature-icon"></div>
            <h3>Easy Medication Tracking</h3>
            <p>Add prescriptions in seconds and get personalized reminders for each medication. Never forget when to take your pills.</p>
          </div>

          <div className="feature-card scroll-animate scroll-animate-right">
            <div className="feature-icon"></div>
            <h3>Smart Reminders</h3>
            <p>Receive timely notifications based on your medication schedule. Stay organized and consistent with your health routine.</p>
          </div>

          <div className="feature-card scroll-animate scroll-animate-left">
            <div className="feature-icon"></div>
            <h3>Caregiver Support</h3>
            <p>Let your loved ones help. Invite caregivers to receive reminders and stay informed about your medication adherence.</p>
          </div>

          <div className="feature-card scroll-animate scroll-animate-right">
            <div className="feature-icon"></div>
            <h3>Complete History</h3>
            <p>Access your full medication history and track your health journey. Share records with doctors when needed.</p>
          </div>

          <div className="feature-card scroll-animate scroll-animate-left">
            <div className="feature-icon"></div>
            <h3>Care Network</h3>
            <p>Connect patients with their caregivers. Caregivers get notified when medications are taken or missed.</p>
          </div>

          <div className="feature-card scroll-animate scroll-animate-right">
            <div className="feature-icon"></div>
            <h3>Privacy & Security</h3>
            <p>Your health information is secure and private. Only share with people you trust.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps">
          <div className="step scroll-animate scroll-animate-left">
            <div className="step-number">1</div>
            <h3>Sign Up</h3>
            <p>Create your account in seconds</p>
          </div>
          <div className="step-arrow"></div>
          <div className="step scroll-animate scroll-animate-right">
            <div className="step-number">2</div>
            <h3>Add Medications</h3>
            <p>Input your prescriptions easily</p>
          </div>
          <div className="step-arrow"></div>
          <div className="step scroll-animate scroll-animate-left">
            <div className="step-number">3</div>
            <h3>Get Reminders</h3>
            <p>Receive timely notifications</p>
          </div>
          <div className="step-arrow"></div>
          <div className="step scroll-animate scroll-animate-right">
            <div className="step-number">4</div>
            <h3>Invite Caregivers</h3>
            <p>Share with loved ones for support</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta scroll-animate scroll-animate-up">
        <h2>Ready to Take Control of Your Health?</h2>
        <p>Join thousands managing their medications with confidence</p>
        <button className="btn btn-primary btn-large" onClick={() => navigate('/login')}>
          Start Your Free Account Today
        </button>
        <p className="cta-contact">
          Questions? <a href="mailto:support@medtime.com">Contact us</a>
        </p>
      </section>
    </div>
  );
}

export default Homepage;
