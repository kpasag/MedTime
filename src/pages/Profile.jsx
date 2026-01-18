import { useEffect, useState } from 'react';
import { auth } from '../../firebase.config';

const getHoverStyle = (baseStyle) => ({
  ...baseStyle,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
});

const handleMouseEnter = (e) => {
  e.target.style.transform = 'scale(1.05)';
  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
};

const handleMouseLeave = (e) => {
  e.target.style.transform = 'scale(1)';
  e.target.style.boxShadow = 'none';
};

function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCaregiverModal, setShowAddCaregiverModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: ''
  });

  const fetchUserProfile = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const res = await fetch('http://localhost:3000/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch profile');
      }

      const data = await res.json();
      setUserData(data);
      setEditData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        gender: data.gender || ''
      });
      setError('');
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'Failed to load profile');
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchUserProfile();
      setLoading(false);
    };
    load();
  }, []);

  const handleSendInvitation = async (relationshipType) => {
    if (!inviteInput.trim()) {
      alert('Please enter an email or username');
      return;
    }

    setInviteLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('http://localhost:3000/api/users/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          emailOrUsername: inviteInput.trim(),
          relationshipType
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send invitation');
      }

      alert(`Invitation sent successfully!`);
      setInviteInput('');
      setShowAddCaregiverModal(false);
      setShowAddPatientModal(false);
      await fetchUserProfile();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleAcceptInvitation = async (fromUserId, relationshipType) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('http://localhost:3000/api/users/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fromUserId, relationshipType })
      });

      if (!res.ok) throw new Error('Failed to accept invitation');
      
      await fetchUserProfile();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRejectInvitation = async (fromUserId, relationshipType) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('http://localhost:3000/api/users/reject-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fromUserId, relationshipType })
      });

      if (!res.ok) throw new Error('Failed to reject invitation');
      
      await fetchUserProfile();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRemoveRelationship = async (userId, relationshipType) => {
    if (!confirm(`Remove this ${relationshipType}?`)) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('http://localhost:3000/api/users/remove-relationship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, relationshipType })
      });

      if (!res.ok) throw new Error('Failed to remove relationship');
      
      await fetchUserProfile();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('http://localhost:3000/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      alert('Profile updated successfully!');
      setShowEditModal(false);
      await fetchUserProfile();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ textAlign: 'center', color: 'rgba(0,0,0,0.6)' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ color: '#d32f2f' }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Profile</h2>
            <p style={styles.subtitle}>Your account information</p>
          </div>
        </div>

        <div style={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={styles.sectionTitle}>Basic Info</h3>
            <button 
              onClick={() => setShowEditModal(true)} 
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={getHoverStyle(styles.btnSmall)}
            >
              Edit
            </button>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Email</span>
            <span style={styles.value}>{userData?.email || 'N/A'}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Username</span>
            <span style={styles.value}>{userData?.username || 'N/A'}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Name</span>
            <span style={styles.value}>
              {userData?.firstName || userData?.lastName
                ? `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()
                : 'Not set'}
            </span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Date of Birth</span>
            <span style={styles.value}>
              {userData?.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : 'Not set'}
            </span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Gender</span>
            <span style={styles.value}>
              {userData?.gender
                ? userData.gender.replace(/_/g, ' ').charAt(0).toUpperCase() + userData.gender.replace(/_/g, ' ').slice(1)
                : 'Not set'}
            </span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Member Since</span>
            <span style={styles.value}>
              {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Pending Invitations Received */}
        {userData?.pendingInvitationsReceived && userData.pendingInvitationsReceived.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Pending Invitations 📬</h3>
            {userData.pendingInvitationsReceived.map((invitation, idx) => (
              <div key={idx} style={styles.invitationBox}>
                <div>
                  <p style={{ margin: '0 0 4px' }}>
                    <strong>{invitation.from.email}</strong> wants to be your {invitation.type}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(0,0,0,0.5)' }}>
                    {new Date(invitation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={styles.invitationActions}>
                  <button
                    onClick={() => handleAcceptInvitation(invitation.from._id, invitation.type)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={getHoverStyle({ ...styles.btn, ...styles.btnAccept })}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectInvitation(invitation.from._id, invitation.type)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={getHoverStyle({ ...styles.btn, ...styles.btnReject })}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Linked Accounts */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Linked Accounts</h3>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={styles.label}>Caregivers</p>
              <button
                onClick={() => setShowAddCaregiverModal(true)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={getHoverStyle(styles.btnSmall)}
              >
                + Add Caregiver
              </button>
            </div>
            {userData?.linkedCaregivers && userData.linkedCaregivers.length > 0 ? (
              <ul style={{ margin: '6px 0', paddingLeft: '0', listStyle: 'none' }}>
                {userData.linkedCaregivers.map((caregiver) => (
                  <li key={caregiver._id} style={styles.relationshipItem}>
                    <span>{caregiver.email}</span>
                    <button
                      onClick={() => handleRemoveRelationship(caregiver._id, 'caregiver')}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      style={getHoverStyle(styles.btnRemove)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={styles.muted}>No caregivers linked yet.</div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={styles.label}>Patients</p>
              <button
                onClick={() => setShowAddPatientModal(true)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={getHoverStyle(styles.btnSmall)}
              >
                + Add Patient
              </button>
            </div>
            {userData?.linkedPatients && userData.linkedPatients.length > 0 ? (
              <ul style={{ margin: '6px 0', paddingLeft: '0', listStyle: 'none' }}>
                {userData.linkedPatients.map((patient) => (
                  <li key={patient._id} style={styles.relationshipItem}>
                    <span>{patient.email}</span>
                    <button
                      onClick={() => handleRemoveRelationship(patient._id, 'patient')}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      style={getHoverStyle(styles.btnRemove)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={styles.muted}>No patients linked yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Add Caregiver Modal */}
      {showAddCaregiverModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Add Caregiver</h3>
            <input
              type="text"
              placeholder="Enter email or username"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              style={styles.input}
            />
            <div style={styles.modalButtons}>
              <button
                onClick={() => handleSendInvitation('caregiver')}
                disabled={inviteLoading}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={getHoverStyle({ ...styles.btn, ...styles.btnPrimary })}
              >
                {inviteLoading ? 'Sending...' : 'Send Invite'}
              </button>
              <button
                onClick={() => setShowAddCaregiverModal(false)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={getHoverStyle({ ...styles.btn, ...styles.btnSecondary })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Add Patient</h3>
            <input
              type="text"
              placeholder="Enter email or username"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              style={styles.input}
            />
            <div style={styles.modalButtons}>
              <button
                onClick={() => handleSendInvitation('patient')}
                disabled={inviteLoading}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={getHoverStyle({ ...styles.btn, ...styles.btnPrimary })}
              >
                {inviteLoading ? 'Sending...' : 'Send Invite'}
              </button>
              <button
                onClick={() => setShowAddPatientModal(false)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={getHoverStyle({ ...styles.btn, ...styles.btnSecondary })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Edit Profile</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>First Name</label>
              <input
                type="text"
                value={editData.firstName}
                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                style={styles.input}
                placeholder="First name"
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>Last Name</label>
              <input
                type="text"
                value={editData.lastName}
                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                style={styles.input}
                placeholder="Last name"
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>Date of Birth</label>
              <input
                type="date"
                value={editData.dateOfBirth}
                onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>Gender</label>
              <select
                value={editData.gender}
                onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                style={styles.input}
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div style={styles.modalButtons}>
              <button
                onClick={handleUpdateProfile}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={getHoverStyle({ ...styles.btn, ...styles.btnPrimary })}
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={getHoverStyle({ ...styles.btn, ...styles.btnSecondary })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
  label: { color: "rgba(0,0,0,0.6)", margin: 0 },
  value: { fontWeight: 600 },
  muted: { color: "rgba(0,0,0,0.6)", padding: "6px 0" },

  relationshipItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: "6px",
    marginBottom: "6px",
  },

  invitationBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#e3f2fd",
    border: "1px solid #90caf9",
    borderRadius: "6px",
    marginBottom: "8px",
  },

  invitationActions: {
    display: "flex",
    gap: "8px",
  },

  btn: {
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  btnSmall: {
    padding: "6px 12px",
    border: "1px solid #2196f3",
    borderRadius: "6px",
    backgroundColor: "#2196f3",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },
  btnAccept: {
    backgroundColor: "#4caf50",
    color: "white",
  },
  btnReject: {
    backgroundColor: "#f44336",
    color: "white",
  },
  btnRemove: {
    backgroundColor: "#ff9800",
    color: "white",
    padding: "4px 8px",
    fontSize: "12px",
  },
  btnPrimary: {
    backgroundColor: "#2196f3",
    color: "white",
  },
  btnSecondary: {
    backgroundColor: "#e0e0e0",
    color: "rgba(0,0,0,0.7)",
  },

  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    marginBottom: "12px",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modalContent: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "10px",
    minWidth: "300px",
  },

  modalButtons: {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
  },
};

export default Profile;
