import React, { useState } from 'react';
import { User, Shield, Key, Save, Lock, Mail, MapPin, Phone } from 'lucide-react';
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
      setMsg({ type: 'success', text: 'Profile information updated successfully.' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update profile details.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });
    try {
      await authService.changePassword(passwords);
      setPassMsg({ type: 'success', text: 'Security password changed successfully.' });
      setPasswords({ old_password: '', new_password: '' });
    } catch (err) {
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Incorrect current password.' });
    }
  };

  const userInit = (user?.first_name || user?.email || 'U')[0].toUpperCase();

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Profile Header Hero Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', border: 'none', marginBottom: '28px', padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '1.75rem',
            boxShadow: '0 0 20px rgba(2, 132, 199, 0.4)'
          }}>
            {userInit}
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email?.split('@')[0]}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span className="badge badge-info" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <Shield size={12} /> {user?.role || 'RESIDENT'}
              </span>
              <span style={{ fontSize: '0.825rem', color: '#94a3b8' }}>{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <User size={20} color="#0284c7" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Personal Information</h2>
        </div>

        {msg.text && (
          <div className={`badge badge-${msg.type === 'error' ? 'danger' : 'success'}`} style={{ width: '100%', padding: '12px', marginBottom: '18px', borderRadius: '8px', display: 'block', textTransform: 'none', fontSize: '0.85rem' }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address (Account Identifier)</label>
            <input type="email" className="form-input" value={user?.email || ''} disabled style={{ backgroundColor: '#f1f5f9', color: '#64748b' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
            />
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address / Unit Number</label>
            <input
              type="text"
              className="form-input"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: '6px' }}>
            <Save size={16} /> {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Key size={20} color="#0284c7" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Account Security & Password</h2>
        </div>

        {passMsg.text && (
          <div className={`badge badge-${passMsg.type === 'error' ? 'danger' : 'success'}`} style={{ width: '100%', padding: '12px', marginBottom: '18px', borderRadius: '8px', display: 'block', textTransform: 'none', fontSize: '0.85rem' }}>
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

          <button type="submit" className="btn btn-secondary" style={{ gap: '6px' }}>
            <Lock size={16} /> Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
