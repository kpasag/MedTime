function Profile() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Profile</h2>
            <p style={styles.subtitle}>
              Placeholder (backend not connected yet)
            </p>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Basic info</h3>

          <div style={styles.row}>
            <span style={styles.label}>Name</span>
            <span style={styles.value}>John Doe</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Email</span>
            <span style={styles.value}>john.doe@example.com</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Role</span>
            <span style={styles.value}>Patient</span>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Pill reminders</h3>
          <div style={styles.muted}>No reminders yet.</div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Linked accounts</h3>
          <div style={styles.muted}>None linked yet.</div>
        </div>

        <div style={styles.note}>
          When your backend is ready, we’ll swap this page to load real data
          from <code>/me</code>
          and show reminders + linking.
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "24px",
    display: "flex",
    justifyContent: "center",
    background: "#f6f8fb",
  },
  card: {
    width: "100%",
    maxWidth: "780px",
    background: "white",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.06)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
  },
  title: { margin: 0, fontSize: "28px" },
  subtitle: { margin: "6px 0 0", color: "rgba(0,0,0,0.6)" },

  section: {
    marginTop: "18px",
    paddingTop: "14px",
    borderTop: "1px solid rgba(0,0,0,0.08)",
  },
  sectionTitle: { margin: "0 0 10px", fontSize: "18px" },

  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "10px 0",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
  label: { color: "rgba(0,0,0,0.6)" },
  value: { fontWeight: 600 },
  muted: { color: "rgba(0,0,0,0.6)", padding: "6px 0" },

  note: {
    marginTop: "18px",
    padding: "12px",
    borderRadius: "12px",
    background: "#f3f6ff",
    border: "1px solid rgba(37,99,235,0.18)",
    color: "rgba(0,0,0,0.75)",
    fontSize: "14px",
  },
};

export default Profile;
