import { useEffect, useState } from 'react';
import { auth } from '../../firebase.config';
import './Profile.css';

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

      const res = await fetch('https://medtime-uf84.onrender.com/api/users/me', {
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
      const res = await fetch('https://medtime-uf84.onrender.com/api/users/send-invitation', {
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
      const res = await fetch('https://medtime-uf84.onrender.com/api/users/accept-invitation', {
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
      const res = await fetch('https://medtime-uf84.onrender.com/api/users/reject-invitation', {
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
      const res = await fetch('https://medtime-uf84.onrender.com/api/users/remove-relationship', {
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
      const res = await fetch('https://medtime-uf84.onrender.com/api/users/update-profile', {
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
      <div className="profile-page">
        <div className="profile-card">
          <p className="profile-loading">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p className="profile-error">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div>
            <h2 className="profile-title">Profile</h2>
            <p className="profile-subtitle">Your account information</p>
          </div>
        </div>

        <div className="profile-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="profile-section-title">Basic Info</h3>
            <button 
              onClick={() => setShowEditModal(true)} 
              className="profile-btn-small"
            >
              Edit
            </button>
          </div>
          <div className="profile-row">
            <span className="profile-label">Email</span>
            <span className="profile-value">{userData?.email || 'N/A'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Username</span>
            <span className="profile-value">{userData?.username || 'N/A'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Name</span>
            <span className="profile-value">
              {userData?.firstName || userData?.lastName
                ? `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()
                : 'Not set'}
            </span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Date of Birth</span>
            <span className="profile-value">
              {userData?.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : 'Not set'}
            </span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Gender</span>
            <span className="profile-value">
              {userData?.gender
                ? userData.gender.replace(/_/g, ' ').charAt(0).toUpperCase() + userData.gender.replace(/_/g, ' ').slice(1)
                : 'Not set'}
            </span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Member Since</span>
            <span className="profile-value">
              {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Pending Invitations Received */}
        {userData?.pendingInvitationsReceived && userData.pendingInvitationsReceived.length > 0 && (
          <div className="profile-section">
            <h3 className="profile-section-title">Pending Invitations</h3>
            {userData.pendingInvitationsReceived.map((invitation, idx) => (
              <div key={idx} className="invitation-box">
                <div>
                  <p style={{ margin: '0 0 4px' }}>
                    <strong>{invitation.from.email}</strong> wants to be your {invitation.type}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(0,0,0,0.5)' }}>
                    {new Date(invitation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="invitation-actions">
                  <button
                    onClick={() => handleAcceptInvitation(invitation.from._id, invitation.type)}
                    className="profile-btn profile-btn-accept"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectInvitation(invitation.from._id, invitation.type)}
                    className="profile-btn profile-btn-reject"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Linked Accounts */}
        <div className="profile-section">
          <h3 className="profile-section-title">Linked Accounts</h3>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p className="profile-label">Caregivers</p>
              <button
                onClick={() => setShowAddCaregiverModal(true)}
                className="profile-btn-small"
              >
                + Add Caregiver
              </button>
            </div>
            {userData?.linkedCaregivers && userData.linkedCaregivers.length > 0 ? (
              <ul style={{ margin: '6px 0', paddingLeft: '0', listStyle: 'none' }}>
                {userData.linkedCaregivers.map((caregiver) => (
                  <li key={caregiver._id} className="relationship-item">
                    <span>{caregiver.email}</span>
                    <button
                      onClick={() => handleRemoveRelationship(caregiver._id, 'caregiver')}
                      className="profile-btn profile-btn-remove"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="profile-muted">No caregivers linked yet.</div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p className="profile-label">Patients</p>
              <button
                onClick={() => setShowAddPatientModal(true)}
                className="profile-btn-small"
              >
                + Add Patient
              </button>
            </div>
            {userData?.linkedPatients && userData.linkedPatients.length > 0 ? (
              <ul style={{ margin: '6px 0', paddingLeft: '0', listStyle: 'none' }}>
                {userData.linkedPatients.map((patient) => (
                  <li key={patient._id} className="relationship-item">
                    <span>{patient.email}</span>
                    <button
                      onClick={() => handleRemoveRelationship(patient._id, 'patient')}
                      className="profile-btn profile-btn-remove"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="profile-muted">No patients linked yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Add Caregiver Modal */}
      {showAddCaregiverModal && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <h3>Add Caregiver</h3>
            <input
              type="text"
              placeholder="Enter email or username"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              className="profile-input"
            />
            <div className="profile-modal-buttons">
              <button
                onClick={() => handleSendInvitation('caregiver')}
                disabled={inviteLoading}
                className="profile-btn profile-btn-primary"
              >
                {inviteLoading ? 'Sending...' : 'Send Invite'}
              </button>
              <button
                onClick={() => setShowAddCaregiverModal(false)}
                className="profile-btn profile-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <h3>Add Patient</h3>
            <input
              type="text"
              placeholder="Enter email or username"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              className="profile-input"
            />
            <div className="profile-modal-buttons">
              <button
                onClick={() => handleSendInvitation('patient')}
                disabled={inviteLoading}
                className="profile-btn profile-btn-primary"
              >
                {inviteLoading ? 'Sending...' : 'Send Invite'}
              </button>
              <button
                onClick={() => setShowAddPatientModal(false)}
                className="profile-btn profile-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <h3>Edit Profile</h3>
            <div style={{ marginBottom: '12px' }}>
              <label>First Name</label>
              <input
                type="text"
                value={editData.firstName}
                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                className="profile-input"
                placeholder="First name"
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label>Last Name</label>
              <input
                type="text"
                value={editData.lastName}
                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                className="profile-input"
                placeholder="Last name"
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label>Date of Birth</label>
              <input
                type="date"
                value={editData.dateOfBirth}
                onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                className="profile-input"
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label>Gender</label>
              <select
                value={editData.gender}
                onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                className="profile-input"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div className="profile-modal-buttons">
              <button
                onClick={handleUpdateProfile}
                className="profile-btn profile-btn-primary"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="profile-btn profile-btn-secondary"
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

export default Profile;
