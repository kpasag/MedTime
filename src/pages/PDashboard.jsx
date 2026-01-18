import { useState } from 'react'
import './Dashboard.css'

function PDashboard() {
    const [currentPills, setCurrentPills] = useState([
        { id: 1, name: 'John Doe', medicine: 'Aspirin', time: '08:00 AM', status: 'missed' },
        { id: 2, name: 'Jane Smith', medicine: 'Vitamin D', time: '01:00 PM', status: 'taken' },
    ])

    const notifications = [
        { id: 1, message: 'Aspirin taken', date: 'Jan 15, 08:05' },
        { id: 2, message: 'Vitamin D missed', date: 'Jan 14, 13:30' },
        { id: 3, message: 'New Vitamin C scheduled', date: 'Jan 13, 09:00' },
    ]

    const addNewPill = () => {
        const newPill = {
            id: Date.now(),
            name: 'New Person',
            medicine: 'New Medicine',
            time: '12:00 PM',
            status: 'pending',
        }
        setCurrentPills([...currentPills, newPill])
    }

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
            </header>

            <main className="dashboard-content">
                {/* Current Pills Section */}
                <section className="current-pills-section">
                    <h2>Current Pills</h2>

                    <div className="pill-cards-container">
                        {currentPills.map(({ id, name, medicine, time, status }) => (
                            <div key={id} className="pill-card">
                                <div className="pill-header">
                                    <span className="medicine-name">{medicine}</span>
                                    <span className={`status-icon ${status}`}>
                                        {status === 'taken' && '✔️'}
                                        {status === 'missed' && '❌'}
                                        {status === 'pending' && '⏳'}
                                    </span>
                                </div>

                                <div className="pill-details">
                                    <div className="person-name">{name}</div>
                                    <div className="pill-time">{time}</div>
                                </div>
                            </div>
                        ))}

                        <button className="pill-card add-card" onClick={addNewPill}>
                            <span className="plus-sign">＋</span>
                            <div>Add Pill</div>
                        </button>
                    </div>
                </section>

                {/* Notifications Section */}
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
        </div>
    )
}

export default PDashboard
