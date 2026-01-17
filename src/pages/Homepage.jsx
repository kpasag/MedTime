import './Homepage.css';

function Homepage() {
  return (
    <div className="homepage">
      <section className="dashboard">
        <h1 className="dashboard-title">Welcome to MedTime</h1>
        <p className="dashboard-subtitle">Manage your prescriptions and medications</p>
        
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3 className="card-title">Active Prescriptions</h3>
            <p className="card-value">0</p>
            <a href="#" className="card-link">View All</a>
          </div>
          
          <div className="dashboard-card">
            <h3 className="card-title">Upcoming Reminders</h3>
            <p className="card-value">0</p>
            <a href="#" className="card-link">View Reminders</a>
          </div>
          
          <div className="dashboard-card">
            <h3 className="card-title">Refills Needed</h3>
            <p className="card-value">0</p>
            <a href="#" className="card-link">Manage Refills</a>
          </div>
        </div>

        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <a href="#" className="action-card">
              <span className="action-label">Add Prescription</span>
            </a>
            <a href="#" className="action-card">
              <span className="action-label">Take Photo</span>
            </a>
            <a href="#" className="action-card">
              <span className="action-label">View Profile</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
