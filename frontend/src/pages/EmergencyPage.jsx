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
      <div className="page-header">
        <div>
          <h1 className="page-title">Emergency Response Hub</h1>
          <p className="page-subtitle">Real-time SOS panic alerts and Pinelands security dispatch coordination</p>
        </div>

        <SOSButton />
      </div>

      {/* Emergency Hotlines Cards */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ marginBottom: 0, padding: '16px', borderLeft: '4px solid #dc2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={18} color="#dc2626" />
            <div>
              <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Pinelands Police (SAPS)</span>
              <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>021 506 2000</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0, padding: '16px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={18} color="#16a34a" />
            <div>
              <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Ambulance / Metro Medical</span>
              <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>10177</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0, padding: '16px', borderLeft: '4px solid #1e40af' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={18} color="#1e40af" />
            <div>
              <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>City of Cape Town Emergency</span>
              <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>021 480 7700</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setFilterStatus('ACTIVE')}
          className={`btn btn-sm ${filterStatus === 'ACTIVE' ? 'btn-danger' : 'btn-secondary'}`}
          style={{ gap: '4px' }}
        >
          <AlertTriangle size={14} /> Active SOS Alerts ({filterStatus === 'ACTIVE' ? sosAlerts.length : ''})
        </button>
        <button
          onClick={() => setFilterStatus('RESOLVED')}
          className={`btn btn-sm ${filterStatus === 'RESOLVED' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '4px' }}
        >
          <CheckCircle2 size={14} /> Resolved History
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>Loading emergency alert logs...</div>
      ) : sosAlerts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
          <ShieldCheck size={36} color="#16a34a" style={{ marginBottom: '8px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>No {filterStatus.toLowerCase()} emergency alerts</h3>
          <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '2px' }}>Pinelands neighborhood status is currently clear.</p>
        </div>
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
                  {sos.status === 'ACTIVE' ? 'ACTIVE SOS' : 'RESOLVED'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> {new Date(sos.time_activated).toLocaleString()}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: sos.status === 'ACTIVE' ? '#b91c1c' : '#0f172a', marginBottom: '4px' }}>
                {sos.alert_type} Emergency
              </h3>

              <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4', marginBottom: '14px', backgroundColor: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div><strong>Resident:</strong> {sos.user_detail?.first_name ? `${sos.user_detail.first_name} ${sos.user_detail.last_name || ''}` : sos.user_detail?.email}</div>
                <div><strong>Community Network:</strong> {sos.community_name}</div>
                {sos.latitude && sos.longitude && (
                  <div style={{ color: '#1e40af', marginTop: '4px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                    <MapPin size={13} /> GPS: {sos.latitude}, {sos.longitude}
                  </div>
                )}
                {sos.note && <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#475569' }}>"{sos.note}"</div>}
              </div>

              {sos.status === 'ACTIVE' && (
                <div style={{ display: 'flex', gap: '6px', paddingTop: '8px', borderTop: '1px solid #fecaca' }}>
                  <button onClick={() => handleResolve(sos.id, 'RESOLVED')} className="btn btn-success btn-sm" style={{ gap: '4px' }}>
                    <CheckCircle2 size={13} /> Mark Resolved
                  </button>
                  <button onClick={() => handleResolve(sos.id, 'CANCELLED')} className="btn btn-secondary btn-sm" style={{ color: '#64748b' }}>
                    <XCircle size={13} /> Cancel False Alert
                  </button>
                </div>
              )}

              {sos.status === 'RESOLVED' && sos.resolved_by_detail && (
                <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                  <CheckCircle2 size={13} /> Resolved by {sos.resolved_by_detail.first_name || sos.resolved_by_detail.email} at {new Date(sos.time_resolved).toLocaleTimeString()}
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
