
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../../firebase.config";
import "./Dashboard.css";

function PDashboard() {
  const navigate = useNavigate();

  const [currentPills, setCurrentPills] = useState([]);

  const totalPills = currentPills.length;

  // Handle Patient list
  useEffect(() => {

    const loadPatients = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();

        const response = await fetch('http://localhost:3000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const patients = await response.json();
          setPatientList(patients);
        }
      } catch (error) {
        console.error('Error loading patients:', error);
      }
    };
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadPatients();
      }
    });

    return () => unsubscribe();
  }, []);


  // Load pill reminders from backend
  useEffect(() => {
    const loadReminders = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const patientEmail = sessionStorage.getItem("viewedPatientID");

        const response = await fetch('http://localhost:3000/api/users/patient-reminders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ email: patientEmail })
        });

        if (response.ok) {
          const reminders = await response.json();
          console.log(reminders)
          const pills = reminders.flatMap(reminder =>
            reminder.timesPerDay.map(time => ({
              id: `${reminder._id}-${time}`,
              reminderId: reminder._id,
              name: "You",
              medicine: `${reminder.name} (${reminder.dosage})`,
              time,
              intervalDays: reminder.frequencyInDays,
              lastTaken: reminder.lastTaken || [],
              scheduledFor: new Date(),
              status: calculateStatus(time, reminder.lastTaken, reminder.frequencyInDays)
            }))
          );
          setCurrentPills(pills);
        }
      } catch (error) {
        console.error('Error loading reminders:', error);
      }
    };
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadReminders();
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-refresh pill statuses every minute
  useEffect(() => {
    const refreshStatuses = () => {
      setCurrentPills(prev => prev.map(pill => ({
        ...pill,
        status: calculateStatus(pill.time, pill.lastTaken, pill.intervalDays)
      })));
    };

    // Refresh every minute
    const interval = setInterval(refreshStatuses, 60000);

    return () => clearInterval(interval);
  }, []);

  // Calculate status based on time and last taken
  const calculateStatus = (time, lastTakenArray = [], frequencyInDays) => {
    const now = new Date();

    // Parse time - handle both "HH:MM" and "H:MM AM/PM (frequency)" formats
    let hours, minutes;
    if (time.includes('AM') || time.includes('PM')) {
      // Old format like "1:59 AM (daily)"
      const timeMatch = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
      if (!timeMatch) return 'upcoming';

      hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3];

      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    } else {
      // New format like "01:59"
      const parts = time.split(':').map(Number);
      if (parts.length !== 2) return 'upcoming';
      [hours, minutes] = parts;
    }

    // Create today's scheduled time
    const scheduledToday = new Date();
    scheduledToday.setHours(hours, minutes, 0, 0);

    // Extract raw time for comparison
    const rawTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Check if this dose was taken today
    const takenToday = lastTakenArray.find(lt => {
      const ltDate = new Date(lt.scheduledFor);
      return lt.time === rawTime &&
        ltDate.toDateString() === now.toDateString();
    });

    if (takenToday) {
      return 'taken';
    }

    // Grace period: 1 hour after scheduled time
    const missedTime = new Date(scheduledToday);
    missedTime.setHours(missedTime.getHours() + 1);

    if (now > missedTime) {
      return 'missed';
    }

    if (now >= scheduledToday) {
      return 'pending';
    }

    // Not yet time
    return 'upcoming';
  };


  const handleMarkAsTaken = async (pillId) => {
    try {
      const pill = currentPills.find(p => p.id === pillId);
      console.log('Found pill:', pill);
      if (!pill) {
        console.error('Pill not found');
        return;
      }

      // Support both old and new structure
      const reminderId = pill.reminderId || pill.id;
      // Extract raw time if it's formatted (e.g., "1:59 AM (daily)" -> "01:59")
      let rawTime = pill.time;
      if (pill.time.includes('AM') || pill.time.includes('PM')) {
        // Old format, parse it
        const timeMatch = pill.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2];
          const period = timeMatch[3];

          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;

          rawTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
      }

      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const currentStatus = pill.status;
      const endpoint = currentStatus === 'taken'
        ? 'unmark-taken'
        : 'mark-taken';

      const response = await fetch(`http://localhost:3000/api/users/${endpoint}/${reminderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          time: rawTime,
          scheduledFor: pill.scheduledFor || new Date()
        })
      });

      if (response.ok) {
        const updatedReminder = await response.json();
        // Update the pill status locally
        setCurrentPills(prev => prev.map(p =>
          p.id === pillId
            ? {
              ...p,
              status: currentStatus === 'taken' ? 'pending' : 'taken',
              lastTaken: updatedReminder.lastTaken
            }
            : p
        ));
      }
    } catch (error) {
      console.error('Error marking pill:', error);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Patient: {sessionStorage.getItem("viewedPatientID")}</h1>
        <div className="header-actions">
          <button
            className="add-link-btn"
            onClick={() => {
              navigate('/dashboard');
              sessionStorage.clear()
            }}
          >
            Back
          </button>
        </div>
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
            {currentPills.map(({ id, name, medicine, time, status, intervalDays }) => {
              // Extract medicine name and dosage
              const medicineMatch = medicine.match(/^(.+?)\s*\((.+?)\)$/);
              const medicineName = medicineMatch ? medicineMatch[1] : medicine;
              const dosage = medicineMatch ? medicineMatch[2] : '';

              return (
                <div
                  key={id}
                  className={`pill-card ${status} clickable`}
                  onClick={() => {
                    handleMarkAsTaken(id);
                  }}
                >
                  <div className="pill-header">
                    <div className="pill-header-left">
                      <span className={`status-badge ${status}`}>
                        {status === "taken" && "Taken"}
                        {status === "missed" && "Missed"}
                        {status === "pending" && "Pending"}
                        {status === "upcoming" && "Upcoming"}
                      </span>
                      <div className="medicine-info">
                        <span
                          className="medicine-name"
                          style={{
                            fontSize: medicineName.length > 20 ? '0.85rem' :
                              medicineName.length > 15 ? '0.95rem' : '1.15rem'
                          }}
                        >
                          {medicineName}
                        </span>
                        {dosage && <span className="medicine-dosage">{dosage}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="pill-details">
                    <div className="person-name">{name}</div>
                    <div className="pill-time">{time}</div>
                    {intervalDays && (
                      <div className="pill-frequency">
                        {intervalDays === 1 ? 'Daily' :
                          intervalDays === 7 ? 'Weekly' :
                            intervalDays === 30 ? 'Monthly' :
                              `Every ${intervalDays} days`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </section>

      </main>

    </div>
  );
}

export default PDashboard;
