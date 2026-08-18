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
      setLocationStatus('Acquiring GPS coordinates...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setLocationStatus('GPS location acquired.');
        },
        () => {
          setLocationStatus('Location unavailable.');
        }
      );
    }
  };

  const handleTrigger = async (e) => {
    e.preventDefault();
    const commId = selectedCommunityId || activeCommunity?.id || (userCommunities[0]?.id);
    if (!commId) {
      setMessage({ type: 'error', text: 'Please select a community.' });
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
      setMessage({ type: 'success', text: 'EMERGENCY SOS ACTIVATED. Responders & Pinelands Neighborhood Watch notified.' });
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
        className="btn btn-danger btn-sm"
        style={{
          fontWeight: '700',
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          fontSize: '0.775rem'
        }}
      >
        <ShieldAlert size={15} />
        <span>SOS Panic</span>
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderTop: '4px solid #dc2626' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} color="#dc2626" />
                <h3 className="modal-title" style={{ color: '#dc2626', margin: 0 }}>
                  Emergency SOS Broadcast
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {message.text && (
              <div className={`badge badge-${message.type === 'error' ? 'danger' : 'success'}`} style={{ width: '100%', padding: '10px', marginBottom: '14px', borderRadius: '6px', display: 'block', textTransform: 'none', fontSize: '0.825rem' }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleTrigger}>
              <div className="form-group">
                <label className="form-label">Community Network</label>
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
                  <option value="GENERAL">General Threat / Intruder</option>
                  <option value="CRIME">Crime in Progress</option>
                  <option value="MEDICAL">Medical Emergency</option>
                  <option value="FIRE">Fire & Outbreak</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Pinelands Address or Details</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g. 14 Forest Drive, Pinelands - Suspect in driveway..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>

              {locationStatus && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem', color: '#64748b', marginBottom: '14px', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <MapPin size={13} color="#1e40af" />
                  <span>{locationStatus} {coords && `(${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" disabled={loading}>
                  {loading ? 'Transmitting...' : 'Broadcast SOS Now'}
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
