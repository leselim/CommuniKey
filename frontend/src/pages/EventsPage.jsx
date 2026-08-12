import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/api';
import EventCard from '../components/EventCard';

function EventsPage() {
  const { activeCommunity, userCommunities } = useAuth();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    community: activeCommunity?.id || '',
    event_name: '',
    description: '',
    event_date: '',
    event_location: '',
    max_attendees: 50
  });

  useEffect(() => {
    fetchEvents();
  }, [activeCommunity, search]);

  const fetchEvents = async () => {
    try {
      const commId = activeCommunity?.id || '';
      const res = await eventService.getEvents({ community: commId, search });
      const list = res.data?.results || res.data || [];
      setEvents(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const commId = formData.community || activeCommunity?.id || userCommunities[0]?.id;
    if (!commId) {
      alert('Please select a community.');
      return;
    }
    try {
      await eventService.createEvent({ ...formData, community: commId });
      setShowModal(false);
      setFormData({ community: activeCommunity?.id || '', event_name: '', description: '', event_date: '', event_location: '', max_attendees: 50 });
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create event.');
    }
  };

  const handleRSVP = async (id, status) => {
    try {
      await eventService.rsvpEvent(id, status);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Community Events & Calendar</h1>
          <p className="page-subtitle">Schedule, discover, and RSVP to community gatherings & meetings</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Schedule Event
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search events by title, description, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No events scheduled.</p>
      ) : (
        <div className="grid-2">
          {events.map((evt) => (
            <EventCard key={evt.id} event={evt} onRSVP={handleRSVP} />
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Schedule New Event</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Community *</label>
                <select
                  className="form-select"
                  value={formData.community || activeCommunity?.id || ''}
                  onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                  required
                >
                  <option value="">Select Community</option>
                  {userCommunities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Event Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    required
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Attendees</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={formData.max_attendees}
                    onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Event Location *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Community Clubhouse Hall"
                  value={formData.event_location}
                  onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsPage;
