import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Phone, MapPin, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
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
      {/* Header Banner */}
      <div className="page-header" style={{ borderBottomColor: '#fecdd3', paddingBottom: '20px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff1f2', color: '#e11d48', padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '8px' }}>
            <ShieldAlert size={14} /> SECURITY & DISPATCH COMMAND
          </div>
          <h1 className="page-title" style={{ color: '#be123c' }}>Emergency SOS Response Center</h1>
          <p className="page-subtitle">Real-time SOS panic broadcast logs and emergency services coordination</p>
        </div>

        <SOSButton />
      </div>

      {/* Emergency Hotlines Cards */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <div className="card" style={{ background: '#fff1f2', border: '1px solid #fecdd3', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#e11d48', padding: '10px', borderRadius: '10px', color: '#fff' }}>
              <Phone size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#881337', fontWeight: '700', textTransform: 'uppercase' }}>National Police (SAPS)</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#be123c' }}>10111</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#059669', padding: '10px', borderRadius: '10px', color: '#fff' }}>
              <Phone size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: '700', textTransform: 'uppercase' }}>Medical & Ambulance</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#047857' }}>10177</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ background: '#e0f2fe', border: '1px solid #bae6fd', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#0284c7', padding: '10px', borderRadius: '10px', color: '#fff' }}>
              <Phone size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#075985', fontWeight: '700', textTransform: 'uppercase' }}>City Emergency / Fire</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0369a1' }}>107 / 021 480 7700</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setFilterStatus('ACTIVE')}
          className={`btn btn-sm ${filterStatus === 'ACTIVE' ? 'btn-danger' : 'btn-secondary'}`}
          style={{ padding: '8px 18px', gap: '6px' }}
        >
          <AlertTriangle size={15} /> Active SOS Alerts ({filterStatus === 'ACTIVE' ? sosAlerts.length : ''})
        </button>
        <button
          onClick={() => setFilterStatus('RESOLVED')}
          className={`btn btn-sm ${filterStatus === 'RESOLVED' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 18px', gap: '6px' }}
        >
          <CheckCircle2 size={15} /> Resolved History
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading emergency alert logs...</div>
      ) : sosAlerts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
          <ShieldCheck size={48} color="#059669" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>No {filterStatus.toLowerCase()} emergency alerts</h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Your community is currently safe and secure.</p>
        </div>
      ) : (
        <div className="grid-2">
          {sosAlerts.map((sos) => (
            <div
              key={sos.id}
              className="card card-interactive"
              style={{
                borderLeft: sos.status === 'ACTIVE' ? '5px solid #e11d48' : '5px solid #059669',
                backgroundColor: sos.status === 'ACTIVE' ? '#fff1f2' : '#ffffff',
                boxShadow: sos.status === 'ACTIVE' ? '0 4px 18px rgba(225, 29, 72, 0.15)' : 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className={`badge badge-${sos.status === 'ACTIVE' ? 'danger' : 'success'}`}>
                  {sos.status === 'ACTIVE' ? '🚨 ACTIVE SOS' : '✅ RESOLVED'}
                </span>
                <span style={{ fontSize: '0.775rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {new Date(sos.time_activated).toLocaleString()}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: sos.status === 'ACTIVE' ? '#be123c' : '#0f172a', marginBottom: '6px' }}>
                {sos.alert_type} Emergency
              </h3>

              <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5', marginBottom: '16px', backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                <div><strong>Resident:</strong> {sos.user_detail?.first_name ? `${sos.user_detail.first_name} ${sos.user_detail.last_name || ''}` : sos.user_detail?.email}</div>
                <div><strong>Community Network:</strong> {sos.community_name}</div>
                {sos.latitude && sos.longitude && (
                  <div style={{ color: '#0284c7', marginTop: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> GPS: {sos.latitude}, {sos.longitude}
                  </div>
                )}
                {sos.note && <div style={{ marginTop: '6px', fontStyle: 'italic', color: '#475569' }}>"{sos.note}"</div>}
              </div>

              {sos.status === 'ACTIVE' && (
                <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid #fecdd3' }}>
                  <button onClick={() => handleResolve(sos.id, 'RESOLVED')} className="btn btn-success btn-sm" style={{ gap: '4px' }}>
                    <CheckCircle2 size={14} /> Mark Resolved
                  </button>
                  <button onClick={() => handleResolve(sos.id, 'CANCELLED')} className="btn btn-secondary btn-sm" style={{ color: '#64748b' }}>
                    <XCircle size={14} /> Cancel False Alert
                  </button>
                </div>
              )}

              {sos.status === 'RESOLVED' && sos.resolved_by_detail && (
                <div style={{ fontSize: '0.775rem', color: '#059669', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                  <CheckCircle2 size={14} /> Resolved by {sos.resolved_by_detail.first_name || sos.resolved_by_detail.email} at {new Date(sos.time_resolved).toLocaleTimeString()}
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
