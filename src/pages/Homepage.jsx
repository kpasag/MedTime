import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

function Homepage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const pills = useMemo(() => {
    const count = 10;
    return Array.from({ length: count }, (_, index) => {
      const size = 18 + Math.random() * 22;
      const drift = 10 + Math.random() * 18;
      return {
        id: index,
        size,
        top: 8 + Math.random() * 80,
        left: 5 + Math.random() * 90,
        duration: 8 + Math.random() * 6,
        delay: Math.random() * -6,
        opacity: 0.25 + Math.random() * 0.35,
        rotate: Math.floor(Math.random() * 360),
        drift,
      };
    });
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll('.scroll-animate');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else {
            entry.target.classList.remove('in-view');
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const pillNodes = Array.from(hero.querySelectorAll('.floating-pill'));
    const states = pillNodes.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    const radius = 160;
    const maxOffset = 140;
    const friction = 0.92;
    const impulseStrength = 2.4;
    let rafId = 0;
    let lastTime = 0;

    const update = (time) => {
      const delta = Math.min(32, time - lastTime || 16) / 16;
      lastTime = time;

      states.forEach((state, index) => {
        state.vx *= Math.pow(friction, delta);
        state.vy *= Math.pow(friction, delta);
        state.x += state.vx * delta;
        state.y += state.vy * delta;

        state.x = Math.max(-maxOffset, Math.min(maxOffset, state.x));
        state.y = Math.max(-maxOffset, Math.min(maxOffset, state.y));

        if (Math.abs(state.vx) < 0.01) state.vx = 0;
        if (Math.abs(state.vy) < 0.01) state.vy = 0;

        const pill = pillNodes[index];
        pill.style.setProperty('--pill-offset-x', `${state.x}px`);
        pill.style.setProperty('--pill-offset-y', `${state.y}px`);
      });

      rafId = window.requestAnimationFrame(update);
    };

    rafId = window.requestAnimationFrame(update);

    const handleMove = (event) => {
      const rect = hero.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      pillNodes.forEach((pill, index) => {
        const pillRect = pill.getBoundingClientRect();
        const pillX = pillRect.left - rect.left + pillRect.width / 2;
        const pillY = pillRect.top - rect.top + pillRect.height / 2;
        const dx = pillX - mouseX;
        const dy = pillY - mouseY;
        const distance = Math.hypot(dx, dy);

        if (distance < radius) {
          const force = (radius - distance) / radius;
          const nx = dx / (distance || 1);
          const ny = dy / (distance || 1);
          states[index].vx += nx * force * impulseStrength;
          states[index].vy += ny * force * impulseStrength;
        }
      });
    };

    const handleLeave = () => {
      states.forEach((state) => {
        state.vx *= 0.5;
        state.vy *= 0.5;
      });
    };

    hero.addEventListener('mousemove', handleMove);
    hero.addEventListener('mouseleave', handleLeave);

    return () => {
      hero.removeEventListener('mousemove', handleMove);
      hero.removeEventListener('mouseleave', handleLeave);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [pills]);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero scroll-animate scroll-animate-up" ref={heroRef}>
        <div className="hero-pills" aria-hidden="true">
          {pills.map((pill) => (
            <div
              key={pill.id}
              className="floating-pill"
              style={{
                width: `${pill.size}px`,
                height: `${pill.size * 2.2}px`,
                top: `${pill.top}%`,
                left: `${pill.left}%`,
                opacity: pill.opacity,
                '--float-duration': `${pill.duration}s`,
                '--float-delay': `${pill.delay}s`,
                '--pill-rotate': `${pill.rotate}deg`,
                '--pill-drift': `${pill.drift}px`,
              }}
            >
              <span className="pill-body" />
            </div>
          ))}
        </div>
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
          <div className="feature-card scroll-animate scroll-animate-zoom">
            <div className="feature-icon">💊</div>
            <h3>Easy Medication Tracking</h3>
            <p>Add prescriptions in seconds and get personalized reminders for each medication. Never forget when to take your pills.</p>
          </div>

          <div className="feature-card scroll-animate scroll-animate-zoom">
            <div className="feature-icon">🔔</div>
            <h3>Smart Reminders</h3>
            <p>Receive timely notifications based on your medication schedule. Stay organized and consistent with your health routine.</p>
          </div>

          <div className="feature-card scroll-animate scroll-animate-zoom">
            <div className="feature-icon">❤️</div>
            <h3>Caregiver Support</h3>
            <p>Let your loved ones help. Invite caregivers to receive reminders and stay informed about your medication adherence.</p>
          </div>

          <div className="feature-card scroll-animate scroll-animate-zoom">
            <div className="feature-icon">📋</div>
            <h3>Complete History</h3>
            <p>Access your full medication history and track your health journey. Share records with doctors when needed.</p>
          </div>

          <div className="feature-card scroll-animate scroll-animate-zoom">
            <div className="feature-icon">🤝</div>
            <h3>Care Network</h3>
            <p>Connect patients with their caregivers. Caregivers get notified when medications are taken or missed.</p>
          </div>

          <div className="feature-card scroll-animate scroll-animate-zoom">
            <div className="feature-icon">🔒</div>
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
          <div className="step-arrow">→</div>
          <div className="step scroll-animate scroll-animate-left">
            <div className="step-number">2</div>
            <h3>Add Medications</h3>
            <p>Input your prescriptions easily</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step scroll-animate scroll-animate-left">
            <div className="step-number">3</div>
            <h3>Get Reminders</h3>
            <p>Receive timely notifications</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step scroll-animate scroll-animate-left">
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
