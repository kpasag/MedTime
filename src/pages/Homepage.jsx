import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

const createPills = (count) =>
  Array.from({ length: count }, (_, index) => {
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

const INITIAL_PILLS = createPills(14);

function Homepage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [pills] = useState(INITIAL_PILLS);

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
    if (pillNodes.length === 0) return;
    const states = pillNodes.map((pill) => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      width: pill.offsetWidth || 24,
      height: pill.offsetHeight || 48,
    }));
    const cursor = { x: 0, y: 0, active: false };
    const repelRadius = 0;
    const friction = 0.94;
    const spring = 0;
    const maxSpeed = 28;
    const bounce = 0.85;
    const ambientStrength = 0;
    let rafId = 0;
    let lastTime = 0;

    const updateBases = () => {
      const rect = hero.getBoundingClientRect();
      pillNodes.forEach((pill, index) => {
        const topPercent = parseFloat(pill.dataset.top || pill.style.top || '0');
        const leftPercent = parseFloat(pill.dataset.left || pill.style.left || '0');
        const pillRect = pill.getBoundingClientRect();
        states[index].width = pillRect.width;
        states[index].height = pillRect.height;
        const startX = (leftPercent / 100) * rect.width;
        const startY = (topPercent / 100) * rect.height;
        states[index].x = Math.min(Math.max(0, startX), rect.width - pillRect.width);
        states[index].y = Math.min(Math.max(0, startY), rect.height - pillRect.height);
        pill.style.left = '0px';
        pill.style.top = '0px';
      });
    };

    updateBases();

    const resizeObserver = new ResizeObserver(() => {
      updateBases();
    });
    resizeObserver.observe(hero);

    const update = (time) => {
      const delta = Math.min(32, time - lastTime || 16) / 16;
      lastTime = time;
      const rect = hero.getBoundingClientRect();

      states.forEach((state, index) => {
        if (ambientStrength > 0) {
          const t = time * 0.0008 + index * 0.37;
          const jitterX = (Math.sin(t * 12.7) + Math.sin(t * 3.1)) * 0.5;
          const jitterY = (Math.cos(t * 9.9) + Math.sin(t * 4.7)) * 0.5;
          state.vx += jitterX * ambientStrength * delta;
          state.vy += jitterY * ambientStrength * delta;
        }
        if (spring > 0) {
          state.vx *= 1;
        }

        const centerX = state.x + state.width / 2;
        const centerY = state.y + state.height / 2;

        if (cursor.active) {
          const dx = centerX - cursor.x;
          const dy = centerY - cursor.y;
          const distance = Math.hypot(dx, dy);
          const hitRadius = Math.min(state.width, state.height) / 2;
          if (distance < hitRadius) {
            const force = (hitRadius - distance) / (hitRadius || 1);
            const nx = dx / (distance || 1);
            const ny = dy / (distance || 1);
            state.vx += nx * force * 7 * delta;
            state.vy += ny * force * 7 * delta;
          }
        }

        state.vx *= Math.pow(friction, delta);
        state.vy *= Math.pow(friction, delta);
        state.x += state.vx * delta;
        state.y += state.vy * delta;

        const speed = Math.hypot(state.vx, state.vy);
        if (speed > maxSpeed) {
          state.vx = (state.vx / speed) * maxSpeed;
          state.vy = (state.vy / speed) * maxSpeed;
        }

        const minX = 0;
        const maxX = rect.width - state.width;
        const minY = 0;
        const maxY = rect.height - state.height;

        if (state.x < minX) {
          state.x = minX;
          state.vx *= -bounce;
        } else if (state.x > maxX) {
          state.x = maxX;
          state.vx *= -bounce;
        }

        if (state.y < minY) {
          state.y = minY;
          state.vy *= -bounce;
        } else if (state.y > maxY) {
          state.y = maxY;
          state.vy *= -bounce;
        }

        const pill = pillNodes[index];
        pill.style.setProperty('--pill-x', `${state.x}px`);
        pill.style.setProperty('--pill-y', `${state.y}px`);
      });

      for (let i = 0; i < states.length; i++) {
        for (let j = i + 1; j < states.length; j++) {
          const a = states[i];
          const b = states[j];
          const ax = a.x + a.width / 2;
          const ay = a.y + a.height / 2;
          const bx = b.x + b.width / 2;
          const by = b.y + b.height / 2;
          const dx = bx - ax;
          const dy = by - ay;
          const dist = Math.hypot(dx, dy);
          const minDist = (a.width + b.width) / 2 + 6;

          if (dist > 0 && dist < minDist) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;

            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;

            const va = a.vx * nx + a.vy * ny;
            const vb = b.vx * nx + b.vy * ny;
            const impulse = (vb - va) * 0.65;
            a.vx += impulse * nx;
            a.vy += impulse * ny;
            b.vx -= impulse * nx;
            b.vy -= impulse * ny;
          }
        }
      }

      rafId = window.requestAnimationFrame(update);
    };

    rafId = window.requestAnimationFrame(update);

    const handleMove = (event) => {
      const rect = hero.getBoundingClientRect();
      cursor.x = event.clientX - rect.left;
      cursor.y = event.clientY - rect.top;
      cursor.active = true;
    };

    const handleLeave = () => {
      cursor.active = false;
    };

    hero.addEventListener('mousemove', handleMove);
    hero.addEventListener('mouseleave', handleLeave);

    return () => {
      hero.removeEventListener('mousemove', handleMove);
      hero.removeEventListener('mouseleave', handleLeave);
      resizeObserver.disconnect();
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
              data-top={pill.top}
              data-left={pill.left}
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
