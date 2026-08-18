import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, XCircle, MapPin, User, Camera } from 'lucide-react';

function IncidentCard({ incident, onStatusChange }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="badge badge-success">
            <CheckCircle2 size={12} /> Resolved
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="badge badge-warning">
            <Clock size={12} /> In Progress
          </span>
        );
      case 'DISMISSED':
        return (
          <span className="badge badge-dark">
            <XCircle size={12} /> Dismissed
          </span>
        );
      default:
        return (
          <span className="badge badge-danger">
            <AlertTriangle size={12} /> Reported
          </span>
        );
    }
  };

  return (
    <div className="card card-interactive" style={{ borderLeft: incident.status === 'REPORTED' ? '4px solid #e11d48' : '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {getStatusBadge(incident.status)}
          <span className="badge badge-info" style={{ textTransform: 'none', fontSize: '0.75rem' }}>
            {incident.incident_type}
          </span>
        </div>
        <span style={{ fontSize: '0.775rem', color: '#94a3b8' }}>
          {new Date(incident.date_reported).toLocaleDateString()}
        </span>
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
        {incident.title}
      </h3>

      <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: '1.5', marginBottom: '12px' }}>
        {incident.description}
      </p>

      {incident.image_url && (
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <img
            src={incident.image_url}
            alt={incident.title}
            style={{ width: '100%', maxHeight: '260px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e2e8f0' }}
          />
          <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(15, 23, 42, 0.75)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Camera size={12} /> Photo Evidence
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} color="#0284c7" /> <strong>{incident.community_name}</strong>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <User size={13} color="#64748b" /> {incident.reporter_detail?.first_name || incident.reporter_detail?.email || 'Resident'}
          </span>
        </div>

        {onStatusChange && (
          <select
            value={incident.status}
            onChange={(e) => onStatusChange(incident.id, e.target.value)}
            style={{
              padding: '4px 10px',
              fontSize: '0.775rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <option value="REPORTED">Reported</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        )}
      </div>
    </div>
  );
}

export default IncidentCard;
