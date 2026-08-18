import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, MapPin, Users, X } from 'lucide-react';
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
          <h1 className="page-title">Community Events & Meetings</h1>
          <p className="page-subtitle">Schedule, discover, and RSVP to neighbourhood gatherings, safety meetings, and cleanups</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-success">
          <Plus size={16} /> Schedule Community Event
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search events by title, location, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '44px', height: '46px', fontSize: '0.925rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading scheduled events...</div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
          <Calendar size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '1rem', fontWeight: '600' }}>No events scheduled</p>
          <span style={{ fontSize: '0.85rem' }}>Be the first to schedule a community gathering!</span>
        </div>
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
              <h3 className="modal-title">Schedule Community Event</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Target Community *</label>
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
                <label className="form-label">Event Name / Title *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Pinelands Neighborhood Watch AGM & Braai"
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Agenda & Description *</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  required
                  placeholder="Describe event agenda, items to bring, and expectations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
                  <label className="form-label">Max Attendees Capacity</label>
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
                <label className="form-label">Venue / Meeting Location *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Pinelands Civic Centre Hall"
                  value={formData.event_location}
                  onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Publish Event
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
