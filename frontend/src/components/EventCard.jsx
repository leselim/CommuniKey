import React from 'react';
import { Calendar, MapPin, Users, CheckCircle, HelpCircle, XCircle } from 'lucide-react';

function EventCard({ event, onRSVP }) {
  const isFull = event.attendee_count >= event.max_attendees;
  const eventDateObj = new Date(event.event_date);
  const monthStr = eventDateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
  const dayStr = eventDateObj.getDate();

  return (
    <div className="card card-interactive" style={{ borderLeft: '4px solid #10b981' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        
        {/* Date Calendar Box */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '10px 14px',
          textAlign: 'center',
          minWidth: '60px',
          boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.05em', opacity: 0.9 }}>{monthStr}</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', lineHeight: 1.1 }}>{dayStr}</div>
        </div>

        {/* Details */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span className="badge badge-success">{event.community_name}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#059669' }}>
              {eventDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
            {event.event_name}
          </h3>

          <p style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '12px', lineHeight: '1.5' }}>
            {event.description}
          </p>

          <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={14} color="#0284c7" />
              <span>Location: <strong>{event.event_location}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Users size={14} color="#059669" />
              <span>Attendees: <strong>{event.attendee_count} / {event.max_attendees}</strong> {isFull && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>FULL</span>}</span>
            </div>
          </div>

          {onRSVP && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: '600' }}>RSVP:</span>
              <button
                onClick={() => onRSVP(event.id, 'ATTENDING')}
                disabled={isFull && event.user_rsvp !== 'ATTENDING'}
                className={`btn btn-sm ${event.user_rsvp === 'ATTENDING' ? 'btn-success' : 'btn-secondary'}`}
                style={{ gap: '4px' }}
              >
                <CheckCircle size={13} /> Attending
              </button>
              <button
                onClick={() => onRSVP(event.id, 'MAYBE')}
                className={`btn btn-sm ${event.user_rsvp === 'MAYBE' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ gap: '4px' }}
              >
                <HelpCircle size={13} /> Maybe
              </button>
              <button
                onClick={() => onRSVP(event.id, 'DECLINED')}
                className={`btn btn-sm ${event.user_rsvp === 'DECLINED' ? 'btn-danger' : 'btn-secondary'}`}
                style={{ gap: '4px' }}
              >
                <XCircle size={13} /> Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventCard;
