import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { Link } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="landing-page">
      <section className="hero-section">
        <h1 className="hero-title">Welcome to MedTime</h1>
        <p className="hero-subtitle">The best way to manage your prescriptions and medications</p>

        <Link to="/login">
          <button className="hero-btn">Get Started</button>
        </Link>
      </section>

      <section className="landing-section">
        <h2 className="section-title">Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3 className="feature-title">Manage Prescriptions</h3>
            <p className="feature-desc">Keep track of all your medications in one place</p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Get Reminders</h3>
            <p className="feature-desc">Never miss a dose with timely notifications</p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">View History</h3>
            <p className="feature-desc">Access your complete prescription history anytime</p>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <h2 className="section-title">About Us</h2>
        <p className="section-text">
          We are a team of developers passionate about creating a better way to manage your prescriptions and medications. Our mission is to help you stay healthy and never miss a dose.
        </p>
      </section>

      <section className="landing-section">
        <h2 className="section-title">Testimonials</h2>
        <p className="section-text">
          "MedTime has completely changed how I manage my medications. I never miss a dose anymore!" - Happy User
        </p>
      </section>

      <footer className="contact-section">
        <h2 className="section-title">Contact Us</h2>
        <p className="contact-email">Email: <a href="mailto:medtimedev@gmail.com">medtimedev@gmail.com</a></p>
      </footer>
    </main>
  );
}

export default LandingPage;
