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
            <style>{`
                .dashboard-page {
                    min-height: 100vh;
                    background-color: #f4f6f8;
                    font-family: Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                }

                .dashboard-header {
                    background-color: #2c3e50;
                    color: white;
                    padding: 16px;
                    text-align: center;
                }

                .dashboard-content {
                    flex: 1;
                    display: flex;
                    gap: 20px;
                    padding: 20px;
                }

                .card {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    flex: 1;
                    border: 1px solid #ddd;
                }

                ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                li {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #eee;
                }
            `}</style>

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
