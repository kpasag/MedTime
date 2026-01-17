import './Dashboard.css';

function Dashboard() {
    const currentPills = [
        { id: 1, name: 'Aspirin', time: '08:00 AM' },
        { id: 2, name: 'Vitamin D', time: '01:00 PM' }
    ]

    const notifications = [
        { id: 1, message: 'Aspirin taken', date: 'Jan 15, 08:05' },
        { id: 2, message: 'Vitamin D missed', date: 'Jan 14, 13:30' }
    ]

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
            </header>

            <main className="dashboard-content">
                <section className="card">
                    <h2>Current Pills</h2>
                    <ul>
                        {currentPills.map(pill => (
                            <li key={pill.id}>
                                <span>💊 {pill.name}</span>
                                <span>{pill.time}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="card">
                    <h2>Past Notifications</h2>
                    <ul>
                        {notifications.map(note => (
                            <li key={note.id}>
                                <span>{note.message}</span>
                                <small>{note.date}</small>
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    )
}

export default Dashboard
