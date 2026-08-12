import React from 'react';

function IncidentCard({ incident, onStatusChange }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <span className="badge badge-success">Resolved</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-warning">In Progress</span>;
      case 'DISMISSED':
        return <span className="badge badge-secondary">Dismissed</span>;
      default:
        return <span className="badge badge-danger">Reported</span>;
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {getStatusBadge(incident.status)}
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
            {incident.incident_type}
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          {new Date(incident.date_reported).toLocaleDateString()}
        </span>
      </div>

      <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>
        {incident.title}
      </h3>

      <p style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '12px' }}>
        {incident.description}
      </p>

      {incident.image_url && (
        <img
          src={incident.image_url}
          alt={incident.title}
          style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '4px', marginBottom: '12px' }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.775rem', color: '#64748b' }}>
        <span>
          Community: <strong>{incident.community_name}</strong> | Reported by: {incident.reporter_detail?.first_name || incident.reporter_detail?.email}
        </span>

        {onStatusChange && (
          <select
            value={incident.status}
            onChange={(e) => onStatusChange(incident.id, e.target.value)}
            style={{ padding: '2px 6px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
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
