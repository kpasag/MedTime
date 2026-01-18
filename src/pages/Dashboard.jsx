import { useEffect, useState, useEffect } from "react";
import { auth } from '../../firebase.config'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import "./Dashboard.css";

function Dashboard() {
    const [currentPills, setCurrentPills] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [pillForm, setPillForm] = useState({
        pillName: "",
        dosage: "",
        takeTimes: [""],
        intervalDays: 1,
    });

    const totalPills = currentPills.length;
    const bufferMinutes = 5; // clickable window
    const missedAfterMinutes = 15; // mark as late after 15 minutes

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
        return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    };

    const frequencyText = (days) => (days === 1 ? "daily" : `every ${days} days`);

    const canTakeNow = (rawTimes) => {
        if (!rawTimes || rawTimes.length === 0) return false;
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        return rawTimes.some((timeStr) => {
            const [h, m] = timeStr.split(":").map(Number);
            const pillMinutes = h * 60 + m;
            return Math.abs(nowMinutes - pillMinutes) <= bufferMinutes;
        });
    };

    const isLate = (rawTimes) => {
        if (!rawTimes || rawTimes.length === 0) return false;
        const now = new Date();
        return rawTimes.some((timeStr) => {
            const [h, m] = timeStr.split(":").map(Number);
            const pillTime = new Date();
            pillTime.setHours(h, m, 0, 0);
            return now - pillTime > missedAfterMinutes * 60 * 1000;
        });
    };

    const lateMinutes = (rawTimes) => {
        const now = new Date();
        let maxLate = 0;
        rawTimes.forEach((timeStr) => {
            const [h, m] = timeStr.split(":").map(Number);
            const pillTime = new Date();
            pillTime.setHours(h, m, 0, 0);
            const diff = Math.floor((now - pillTime) / 60000);
            if (diff > maxLate) maxLate = diff;
        });
        return maxLate;
    };

    const takePill = (id, medicine, rawTimes) => {
        setCurrentPills((prev) => prev.filter((pill) => pill.id !== id));

        const lateBy = isLate(rawTimes) ? ` (Late by ${lateMinutes(rawTimes)} min)` : "";
        setNotifications((prev) => [
            { id: Date.now(), message: `${medicine} taken${lateBy}`, date: new Date().toLocaleString() },
            ...prev,
        ]);
    };

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="header-actions">
                    <span>{user?.email}</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <main className="dashboard-content">
                {/* Links Section */}
                <section className="links-section">
                    <div className="link-buttons">
                        <button onClick={() => { setLinkType('caregiver'); setShowLinkModal(true); setError(''); setLinkEmail(''); }}>
                            + Add Caregiver
                        </button>
                        <button onClick={() => { setLinkType('patient'); setShowLinkModal(true); setError(''); setLinkEmail(''); }}>
                            + Add Patient
                        </button>
                    </div>

                    {userData?.linkedCaregivers?.length > 0 && (
                        <div className="linked-users">
                            <h3>My Caregivers</h3>
                            {userData.linkedCaregivers.map(cg => (
                                <div key={cg._id} className="linked-user-item">{cg.email}</div>
                            ))}
                        </div>
                    )}

                    {userData?.linkedPatients?.length > 0 && (
                        <div className="linked-users">
                            <h3>My Patients</h3>
                            {userData.linkedPatients.map(p => (
                                <div key={p._id} className="linked-user-item">{p.email}</div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="current-pills-section">
                    <h2>
                        Current Pills <span style={{ fontWeight: 500, fontSize: "0.95rem" }}>({totalPills} total)</span>
                    </h2>

                    <div className="pill-cards-container">
                        {currentPills.map(({ id, name, medicine, time, rawTimes, status }) => {
                            const clickable = true; // always clickable
                            const late = isLate(rawTimes);
                            return (
                                <div
                                    key={id}
                                    className={`pill-card clickable ${late ? "late" : ""}`}
                                    onClick={() => takePill(id, medicine, rawTimes)}
                                    title={late ? `Late by ${lateMinutes(rawTimes)} min` : "Click to take"}
                                    role="button"
                                    tabIndex={0}
                                >
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
                            );
                        })}

                        <button type="button" className="pill-card add-card" onClick={() => setIsAddModalOpen(true)}>
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

            {/* Link Modal */}
            {showLinkModal && (
                <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Add {linkType === 'caregiver' ? 'Caregiver' : 'Patient'}</h3>
                        <p className="modal-hint">Enter their email to link</p>

                        <div className="search-box">
                            <input
                                type="email"
                                placeholder="Enter email..."
                                value={linkEmail}
                                onChange={(e) => setLinkEmail(e.target.value.toLowerCase())}
                            />
                            <button onClick={handleLink}>Link</button>
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        <button className="close-btn" onClick={() => setShowLinkModal(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
