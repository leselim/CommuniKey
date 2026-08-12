import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

function Profile() {
  const { user, fetchUserProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    address: user?.address || ''
  });
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: ''
  });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setLoading(true);
    try {
      await authService.updateProfile(profileData);
      await fetchUserProfile();
      setMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });
    try {
      await authService.changePassword(passwords);
      setPassMsg({ type: 'success', text: 'Password changed successfully.' });
      setPasswords({ old_password: '', new_password: '' });
    } catch (err) {
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Incorrect old password.' });
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Account & Profile</h1>
          <p className="page-subtitle">Manage personal details, role, and security settings</p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Personal Information</h2>

        {msg.text && (
          <div className={`badge badge-${msg.type === 'error' ? 'danger' : 'success'}`} style={{ width: '100%', padding: '8px', marginBottom: '16px' }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address (Read-only)</label>
            <input type="email" className="form-input" value={user?.email || ''} disabled style={{ backgroundColor: '#f1f5f9' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-input"
                value={profileData.first_name}
                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-input"
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-input"
              value={profileData.phone_number}
              onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Physical Address / Unit Number</label>
            <input
              type="text"
              className="form-input"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Platform Role</label>
            <input type="text" className="form-input" value={user?.role || 'RESIDENT'} disabled style={{ backgroundColor: '#f1f5f9' }} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Change Password</h2>

        {passMsg.text && (
          <div className={`badge badge-${passMsg.type === 'error' ? 'danger' : 'success'}`} style={{ width: '100%', padding: '8px', marginBottom: '16px' }}>
            {passMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              required
              value={passwords.old_password}
              onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              required
              minLength={6}
              value={passwords.new_password}
              onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-secondary">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
