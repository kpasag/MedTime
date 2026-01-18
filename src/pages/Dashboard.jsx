import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [currentPills, setCurrentPills] = useState([
    {
      id: 1,
      name: "John Doe",
      medicine: "Aspirin",
      time: "08:00 AM",
      status: "missed",
    },
    {
      id: 2,
      name: "Jane Smith",
      medicine: "Vitamin D",
      time: "01:00 PM",
      status: "taken",
    },
  ]);

  const notifications = [
    { id: 1, message: "Aspirin taken", date: "Jan 15, 08:05" },
    { id: 2, message: "Vitamin D missed", date: "Jan 14, 13:30" },
    { id: 3, message: "New Vitamin C scheduled", date: "Jan 13, 09:00" },
  ];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pillForm, setPillForm] = useState({
    pillName: "",
    dosage: "",
    takeTimes: [""], // multiple times per day
    intervalDays: 1, // repeat every N days
  });

  const totalPills = currentPills.length;

  const openAddModal = () => setIsAddModalOpen(true);

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setPillForm({ pillName: "", dosage: "", takeTimes: [""], intervalDays: 1 });
  };

  useEffect(() => {
    if (!isAddModalOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeAddModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAddModalOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPillForm((prev) => ({
      ...prev,
      [name]: name === "intervalDays" ? Number(value) : value,
    }));
  };

  const updateTimeAtIndex = (index, value) => {
    setPillForm((prev) => {
      const next = [...prev.takeTimes];
      next[index] = value;
      return { ...prev, takeTimes: next };
    });
  };

  const addTimeField = () => {
    setPillForm((prev) => ({ ...prev, takeTimes: [...prev.takeTimes, ""] }));
  };

  const removeTimeField = (index) => {
    setPillForm((prev) => {
      const next = prev.takeTimes.filter((_, i) => i !== index);
      return { ...prev, takeTimes: next.length ? next : [""] };
    });
  };

  const formatTime = (value) => {
    if (!value) return "";
    const d = new Date(`1970-01-01T${value}:00`);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const frequencyText = (days) => {
    if (days === 1) return "daily";
    return `every ${days} days`;
  };

  const updateDatabasePills = async (pillReminder) => {
    await fetch('http://localhost:3000/api/users', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: pillReminder
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const pillName = pillForm.pillName.trim();
    const dosage = pillForm.dosage.trim();
    const intervalDays = pillForm.intervalDays;

    const cleanedTimes = pillForm.takeTimes
      .map((t) => t.trim())
      .filter(Boolean);

    if (
      !pillName ||
      !dosage ||
      !intervalDays ||
      intervalDays < 1 ||
      cleanedTimes.length === 0
    )
      return;

    const timesLabel = cleanedTimes.map(formatTime).join(", ");
    // const timeLabel = `${timesLabel} (${frequencyText(intervalDays)})`;

    const newPill = {
      createdAt: Date.now(),
      name: pillName,
      timesPerDay: timesLabel,
      repeatFrequency: intervalDays,
      dosage: dosage
    };

    updateDatabasePills(newPill);

    setCurrentPills((prev) => [...prev, newPill]);
    closeAddModal();
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
      </header>

      <main className="dashboard-content">
        <section className="current-pills-section">
          <h2>
            Current Pills{" "}
            <span style={{ fontWeight: 500, fontSize: "0.95rem" }}>
              ({totalPills} total)
            </span>
          </h2>

          <div className="pill-cards-container">
            {currentPills.map(({ id, name, medicine, time, status }) => (
              <div key={id} className="pill-card">
                <div className="pill-header">
                  <span className="medicine-name">{medicine}</span>
                  <span className={`status-icon ${status}`}>
                    {status === "taken" && "✔️"}
                    {status === "missed" && "❌"}
                    {status === "pending" && "⏳"}
                  </span>
                </div>

                <div className="pill-details">
                  <div className="person-name">{name}</div>
                  <div className="pill-time">{time}</div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="pill-card add-card"
              onClick={openAddModal}
            >
              <span className="plus-sign">＋</span>
              <div>Add Pill</div>
            </button>
          </div>
        </section>

        <section className="notifications-section">
          <h2>Notifications</h2>
          {notifications.map(({ id, message, date }) => (
            <div key={id} className="notification-item">
              <div>{message}</div>
              <small>{date}</small>
            </div>
          ))}
        </section>
      </main>

      {isAddModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeAddModal();
          }}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h3 className="modal-title">Add Pill</h3>
              <button
                type="button"
                className="modal-close"
                onClick={closeAddModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              <label className="modal-label">
                Pill name
                <input
                  className="modal-input"
                  name="pillName"
                  value={pillForm.pillName}
                  onChange={handleChange}
                  placeholder="e.g., Aspirin"
                  autoFocus
                  required
                />
              </label>

              <label className="modal-label">
                Dosage
                <input
                  className="modal-input"
                  name="dosage"
                  value={pillForm.dosage}
                  onChange={handleChange}
                  placeholder="e.g., 81 mg"
                  required
                />
              </label>

              <label className="modal-label">
                Times per day
                <div className="times-list">
                  {pillForm.takeTimes.map((t, idx) => (
                    <div key={idx} className="time-row">
                      <input
                        className="modal-input"
                        type="time"
                        value={t}
                        onChange={(e) => updateTimeAtIndex(idx, e.target.value)}
                        required={idx === 0}
                      />
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => removeTimeField(idx)}
                        aria-label="Remove time"
                        title="Remove time"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={addTimeField}
                  >
                    + Add another time
                  </button>
                </div>
              </label>

              <label className="modal-label">
                Repeat
                <div className="repeat-row">
                  <span>Once every</span>
                  <input
                    className="modal-input repeat-days"
                    name="intervalDays"
                    value={pillForm.intervalDays}
                    onChange={handleChange}
                    type="number"
                    min="1"
                    step="1"
                    required
                  />
                  <span>day(s)</span>
                </div>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn secondary"
                  onClick={closeAddModal}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
