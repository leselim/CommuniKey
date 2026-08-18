import React from 'react';
import { Pin, Calendar, User, Trash2 } from 'lucide-react';

function AnnouncementCard({ announcement, onDelete }) {
  return (
    <div
      className="card card-interactive"
      style={{
        borderLeft: announcement.is_pinned ? '4px solid #d97706' : '1px solid #e2e8f0',
        background: announcement.is_pinned ? '#fffbeb' : '#ffffff'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {announcement.is_pinned && (
            <span className="badge badge-warning">
              <Pin size={12} /> PINNED
            </span>
          )}
          <span className="badge badge-info">{announcement.community_name}</span>
        </div>
        <span style={{ fontSize: '0.775rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={13} /> {new Date(announcement.date_published).toLocaleDateString()}
        </span>
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
        {announcement.title}
      </h3>

      <p style={{ fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-line', lineHeight: '1.6', margin: 0 }}>
        {announcement.content}
      </p>

      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
          <User size={14} color="#0284c7" />
          <span>By: {announcement.created_by_detail?.first_name ? `${announcement.created_by_detail.first_name} ${announcement.created_by_detail.last_name || ''}` : announcement.created_by_detail?.email || 'Community Admin'}</span>
        </div>
        {onDelete && (
          <button onClick={() => onDelete(announcement.id)} className="btn btn-secondary btn-sm" style={{ color: '#e11d48', borderColor: '#fecdd3' }}>
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default AnnouncementCard;
