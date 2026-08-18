import React, { useState } from 'react';
import { User, Shield, Key, Save, Lock } from 'lucide-react';
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
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Incorrect current password.' });
    }
  };

  const userInit = (user?.first_name || user?.email || 'U')[0].toUpperCase();

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Profile Header Card */}
      <div className="card" style={{ backgroundColor: '#ffffff', borderLeft: '4px solid #0f172a', marginBottom: '20px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '1.4rem'
          }}>
            {userInit}
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email?.split('@')[0]}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span className="badge badge-info">
                <Shield size={11} /> {user?.role || 'RESIDENT'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <User size={18} color="#0f172a" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Personal Details</h2>
        </div>

        {msg.text && (
          <div className={`badge badge-${msg.type === 'error' ? 'danger' : 'success'}`} style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '6px', display: 'block', textTransform: 'none', fontSize: '0.825rem' }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address (Read-Only)</label>
            <input type="email" className="form-input" value={user?.email || ''} disabled style={{ backgroundColor: '#f1f5f9', color: '#64748b' }} />
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
            <label className="form-label">Phone Contact Number</label>
            <input
              type="text"
              className="form-input"
              value={profileData.phone_number}
              onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
              placeholder="e.g. 082 123 4567"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pinelands Residential Address / Street</label>
            <input
              type="text"
              className="form-input"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              placeholder="e.g. 14 Forest Drive, Pinelands"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: '4px' }}>
            <Save size={15} /> {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <Key size={18} color="#0f172a" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Security Settings</h2>
        </div>

        {passMsg.text && (
          <div className={`badge badge-${passMsg.type === 'error' ? 'danger' : 'success'}`} style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '6px', display: 'block', textTransform: 'none', fontSize: '0.825rem' }}>
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

          <button type="submit" className="btn btn-secondary" style={{ gap: '4px' }}>
            <Lock size={15} /> Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
