import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, MapPin, X } from 'lucide-react';
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
      setLocationStatus('Acquiring GPS location coordinates...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setLocationStatus('GPS coordinates acquired successfully.');
        },
        () => {
          setLocationStatus('Location unavailable or permission denied.');
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
      setMessage({ type: 'success', text: 'EMERGENCY SOS ALERT ACTIVATED! Security dispatch & community members notified.' });
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
        className="pulse-emergency"
        style={{
          background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
          color: '#ffffff',
          fontWeight: '700',
          border: 'none',
          borderRadius: '8px',
          padding: '7px 16px',
          fontSize: '0.825rem',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif',
          transition: 'all 0.2s ease',
          boxShadow: '0 0 15px rgba(225, 29, 72, 0.4)'
        }}
      >
        <ShieldAlert size={16} />
        <span>SOS Panic</span>
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderTop: '6px solid #e11d48' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#fff1f2', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                  <AlertTriangle size={24} color="#e11d48" />
                </div>
                <div>
                  <h3 className="modal-title" style={{ color: '#e11d48', margin: 0 }}>
                    Emergency SOS Trigger
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Instant security alert dispatch</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {message.text && (
              <div className={`badge badge-${message.type === 'error' ? 'danger' : 'success'}`} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', display: 'block', textTransform: 'none', fontSize: '0.85rem' }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleTrigger}>
              <div className="form-group">
                <label className="form-label">Target Community Network</label>
                <select
                  className="form-select"
                  value={selectedCommunityId || activeCommunity?.id || ''}
                  onChange={(e) => setSelectedCommunityId(e.target.value)}
                  required
                >
                  <option value="">Select Target Community</option>
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
                  <option value="GENERAL">🚨 General Danger / Armed Threat</option>
                  <option value="CRIME">🥷 Crime in Progress / Intruder</option>
                  <option value="MEDICAL">🚑 Urgent Medical Emergency</option>
                  <option value="FIRE">🔥 Fire & Hazard Outbreak</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Address or Urgent Notes</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g. Unit 4B, 12 Oak Street - Suspect on premises..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>

              {locationStatus && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b', marginBottom: '16px', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <MapPin size={14} color="#0284c7" />
                  <span>{locationStatus} {coords && `(${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" disabled={loading}>
                  {loading ? 'Transmitting Alert...' : 'BROADCAST SOS ALERT NOW'}
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
