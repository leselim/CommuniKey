import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  announcementService,
  incidentService,
  emergencyService,
  eventService,
  communityService
} from '../services/api';
import AnnouncementCard from '../components/AnnouncementCard';
import IncidentCard from '../components/IncidentCard';
import EventCard from '../components/EventCard';

function Dashboard() {
  const { user, activeCommunity, userCommunities } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [events, setEvents] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [activeCommunity]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const commId = activeCommunity?.id || '';
      const [annRes, incRes, evtRes, sosRes] = await Promise.all([
        announcementService.getAnnouncements({ community: commId }),
        incidentService.getIncidents({ community: commId, status: 'REPORTED' }),
        eventService.getEvents({ community: commId }),
        emergencyService.getSOSAlerts({ community: commId, status: 'ACTIVE' })
      ]);

      setAnnouncements(annRes.data?.results || annRes.data || []);
      setIncidents(incRes.data?.results || incRes.data || []);
      setEvents(evtRes.data?.results || evtRes.data || []);
      setSosAlerts(sosRes.data?.results || sosRes.data || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveSOS = async (id) => {
    try {
      await emergencyService.resolveSOS(id, 'RESOLVED');
      setSosAlerts(sosAlerts.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const pinnedAnnouncements = announcements.filter(a => a.is_pinned);

  return (
    <div>
      {/* Active Emergency Alert Banner */}
      {sosAlerts.length > 0 && (
        <div style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ color: '#dc2626', fontWeight: '700', fontSize: '1.1rem', margin: 0 }}>
              🚨 CRITICAL SOS EMERGENCY ALERTS ACTIVE ({sosAlerts.length})
            </h3>
            <Link to="/emergency" className="btn btn-danger btn-sm" style={{ textDecoration: 'none' }}>
              View All Emergency Alerts
            </Link>
          </div>
          {sosAlerts.slice(0, 2).map((sos) => (
            <div key={sos.id} style={{ marginTop: '12px', padding: '12px', background: '#ffffff', borderRadius: '6px', border: '1px solid #fecaca' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span><strong>User:</strong> {sos.user_detail?.first_name || sos.user_detail?.email}</span>
                <span><strong>Category:</strong> {sos.alert_type}</span>
                <span><strong>Time:</strong> {new Date(sos.time_activated).toLocaleTimeString()}</span>
              </div>
              {sos.note && <p style={{ fontSize: '0.875rem', marginTop: '6px', color: '#1e293b' }}>Note: {sos.note}</p>}
              <button
                onClick={() => handleResolveSOS(sos.id)}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '8px', color: '#16a34a', borderColor: '#bbf7d0' }}
              >
                Mark Resolved
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome, {user?.first_name || user?.email || 'Resident'}
          </h1>
          <p className="page-subtitle">
            {activeCommunity
              ? `Overview for ${activeCommunity.name}`
              : 'Showing aggregated community updates'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/incidents" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            Report Incident
          </Link>
          <Link to="/communities" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Discover Communities
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>YOUR COMMUNITIES</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>
            {userCommunities.length}
          </div>
          <Link to="/communities" style={{ fontSize: '0.8rem', display: 'inline-block', marginTop: '8px' }}>Manage membership →</Link>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>OPEN INCIDENTS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#dc2626', marginTop: '4px' }}>
            {incidents.length}
          </div>
          <Link to="/incidents" style={{ fontSize: '0.8rem', display: 'inline-block', marginTop: '8px' }}>Review reports →</Link>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>UPCOMING EVENTS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2563eb', marginTop: '4px' }}>
            {events.length}
          </div>
          <Link to="/events" style={{ fontSize: '0.8rem', display: 'inline-block', marginTop: '8px' }}>View schedule →</Link>
        </div>
      </div>

      {/* Content Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px' }}>
            Pinned & Verified Announcements
          </h2>
          {pinnedAnnouncements.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '20px' }}>No pinned announcements at this time.</p>
          ) : (
            pinnedAnnouncements.map(a => <AnnouncementCard key={a.id} announcement={a} />)
          )}

          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '24px 0 12px' }}>
            Active Incident Reports
          </h2>
          {incidents.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No open incidents reported.</p>
          ) : (
            incidents.slice(0, 3).map(i => <IncidentCard key={i.id} incident={i} />)
          )}
        </div>

        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px' }}>
            Upcoming Events
          </h2>
          {events.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No upcoming events scheduled.</p>
          ) : (
            events.slice(0, 3).map(e => <EventCard key={e.id} event={e} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
