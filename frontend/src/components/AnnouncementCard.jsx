import React from 'react';

function AnnouncementCard({ announcement, onDelete }) {
  return (
    <div className="card" style={{ borderLeft: announcement.is_pinned ? '4px solid #d97706' : '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          {announcement.is_pinned && (
            <span className="badge badge-warning" style={{ marginRight: '8px' }}>
              PINNED
            </span>
          )}
          <span className="badge badge-info">{announcement.community_name}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          {new Date(announcement.date_published).toLocaleDateString()}
        </span>
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
        {announcement.title}
      </h3>

      <p style={{ fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
        {announcement.content}
      </p>

      <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.775rem', color: '#64748b' }}>
          Published by: {announcement.created_by_detail?.first_name || announcement.created_by_detail?.email || 'Admin'}
        </span>
        {onDelete && (
          <button onClick={() => onDelete(announcement.id)} className="btn btn-secondary btn-sm" style={{ color: '#dc2626' }}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default AnnouncementCard;
