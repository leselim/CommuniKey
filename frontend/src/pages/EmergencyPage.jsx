import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { emergencyService } from '../services/api';
import SOSButton from '../components/SOSButton';

function EmergencyPage() {
  const { activeCommunity } = useAuth();
  const [sosAlerts, setSosAlerts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSOSAlerts();
  }, [activeCommunity, filterStatus]);

  const fetchSOSAlerts = async () => {
    try {
      const commId = activeCommunity?.id || '';
      const res = await emergencyService.getSOSAlerts({ community: commId, status: filterStatus });
      const list = res.data?.results || res.data || [];
      setSosAlerts(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, statusVal) => {
    try {
      await emergencyService.resolveSOS(id, statusVal);
      fetchSOSAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ borderBottomColor: '#dc2626' }}>
        <div>
          <h1 className="page-title" style={{ color: '#dc2626' }}>Emergency Response Hub</h1>
          <p className="page-subtitle">Real-time SOS panic alerts and community emergency coordination</p>
        </div>

        <SOSButton />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilterStatus('ACTIVE')}
            className={`btn btn-sm ${filterStatus === 'ACTIVE' ? 'btn-danger' : 'btn-secondary'}`}
          >
            Active Emergencies
          </button>
          <button
            onClick={() => setFilterStatus('RESOLVED')}
            className={`btn btn-sm ${filterStatus === 'RESOLVED' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Resolved History
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading emergency alert records...</p>
      ) : sosAlerts.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No {filterStatus.toLowerCase()} emergency alerts.</p>
      ) : (
        <div className="grid-2">
          {sosAlerts.map((sos) => (
            <div
              key={sos.id}
              className="card"
              style={{
                borderLeft: sos.status === 'ACTIVE' ? '4px solid #dc2626' : '4px solid #16a34a',
                backgroundColor: sos.status === 'ACTIVE' ? '#fef2f2' : '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className={`badge badge-${sos.status === 'ACTIVE' ? 'danger' : 'success'}`}>
                  {sos.status}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {new Date(sos.time_activated).toLocaleString()}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                {sos.alert_type} Emergency
              </h3>

              <div style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '12px' }}>
                <div><strong>Resident:</strong> {sos.user_detail?.first_name ? `${sos.user_detail.first_name} ${sos.user_detail.last_name || ''}` : sos.user_detail?.email}</div>
                <div><strong>Community:</strong> {sos.community_name}</div>
                {sos.latitude && sos.longitude && (
                  <div style={{ color: '#2563eb', marginTop: '4px', fontSize: '0.8rem' }}>
                    📍 GPS Coordinates: {sos.latitude}, {sos.longitude}
                  </div>
                )}
                {sos.note && <div style={{ marginTop: '4px', fontStyle: 'italic' }}>"{sos.note}"</div>}
              </div>

              {sos.status === 'ACTIVE' && (
                <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid #fecaca' }}>
                  <button onClick={() => handleResolve(sos.id, 'RESOLVED')} className="btn btn-primary btn-sm" style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}>
                    Mark Resolved
                  </button>
                  <button onClick={() => handleResolve(sos.id, 'CANCELLED')} className="btn btn-secondary btn-sm">
                    Cancel False Alert
                  </button>
                </div>
              )}

              {sos.status === 'RESOLVED' && sos.resolved_by_detail && (
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                  Resolved by: {sos.resolved_by_detail.first_name || sos.resolved_by_detail.email} at {new Date(sos.time_resolved).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmergencyPage;
