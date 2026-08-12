import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { emergencyService } from '../services/api';

function SOSButton() {
  const { activeCommunity, userCommunities } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [alertType, setAlertType] = useState('GENERAL');
  const [note, setNote] = useState('');
  const [selectedCommunityId, setSelectedCommunityId] = useState(activeCommunity?.id || '');
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [coords, setCoords] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleOpen = () => {
    setIsOpen(true);
    setMessage({ type: '', text: '' });
    if (navigator.geolocation) {
      setLocationStatus('Fetching GPS location...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setLocationStatus('GPS location acquired.');
        },
        () => {
          setLocationStatus('Location unavailable or access denied.');
        }
      );
    }
  };

  const handleTrigger = async (e) => {
    e.preventDefault();
    const commId = selectedCommunityId || activeCommunity?.id || (userCommunities[0]?.id);
    if (!commId) {
      setMessage({ type: 'error', text: 'Please select a community to alert.' });
      return;
    }

    setLoading(true);
    try {
      await emergencyService.triggerSOS({
        community: commId,
        alert_type: alertType,
        note: note,
        latitude: coords?.lat ? coords.lat.toFixed(6) : null,
        longitude: coords?.lng ? coords.lng.toFixed(6) : null,
      });
      setMessage({ type: 'success', text: 'EMERGENCY SOS ALERT ACTIVATED! Responders & neighbors notified.' });
      setTimeout(() => {
        setIsOpen(false);
        setNote('');
      }, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to trigger SOS alert.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        style={{
          backgroundColor: '#dc2626',
          color: '#ffffff',
          fontWeight: '700',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 14px',
          fontSize: '0.875rem',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(220,38,38,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}
      >
        SOS Panic
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderTop: '4px solid #dc2626' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#dc2626', fontWeight: '700' }}>
                TRIGGER EMERGENCY SOS ALERT
              </h3>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>

            {message.text && (
              <div className={`badge badge-${message.type === 'error' ? 'danger' : 'success'}`} style={{ width: '100%', padding: '10px', marginBottom: '12px' }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleTrigger}>
              <div className="form-group">
                <label className="form-label">Target Community</label>
                <select
                  className="form-select"
                  value={selectedCommunityId || activeCommunity?.id || ''}
                  onChange={(e) => setSelectedCommunityId(e.target.value)}
                  required
                >
                  <option value="">Select Community</option>
                  {userCommunities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Category</label>
                <select
                  className="form-select"
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                >
                  <option value="GENERAL">General Panic / Danger</option>
                  <option value="CRIME">Crime / Intruder / Assault</option>
                  <option value="MEDICAL">Medical Emergency</option>
                  <option value="FIRE">Fire Emergency</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Note / Address Details (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Provide house number or urgent situation details..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>

              {locationStatus && (
                <div style={{ fontSize: '0.775rem', color: '#64748b', marginBottom: '12px' }}>
                  {locationStatus} {coords && `(${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" disabled={loading}>
                  {loading ? 'Activating SOS...' : 'BROADCAST SOS ALERT NOW'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SOSButton;
