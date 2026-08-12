import React from 'react';

function EventCard({ event, onRSVP }) {
  const isFull = event.attendee_count >= event.max_attendees;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span className="badge badge-info">{event.community_name}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#2563eb' }}>
          {new Date(event.event_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>
        {event.event_name}
      </h3>

      <p style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '12px' }}>
        {event.description}
      </p>

      <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '12px', display: 'flex', gap: '16px' }}>
        <span>📍 Location: <strong>{event.event_location}</strong></span>
        <span>👥 Attendees: <strong>{event.attendee_count} / {event.max_attendees}</strong></span>
      </div>

      {onRSVP && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.775rem', color: '#64748b', marginRight: '4px' }}>Your RSVP:</span>
          <button
            onClick={() => onRSVP(event.id, 'ATTENDING')}
            disabled={isFull && event.user_rsvp !== 'ATTENDING'}
            className={`btn btn-sm ${event.user_rsvp === 'ATTENDING' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Attending
          </button>
          <button
            onClick={() => onRSVP(event.id, 'MAYBE')}
            className={`btn btn-sm ${event.user_rsvp === 'MAYBE' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Maybe
          </button>
          <button
            onClick={() => onRSVP(event.id, 'DECLINED')}
            className={`btn btn-sm ${event.user_rsvp === 'DECLINED' ? 'btn-danger' : 'btn-secondary'}`}
          >
            Declined
          </button>
        </div>
      )}
    </div>
  );
}

export default EventCard;
