import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Calendar,
  Megaphone,
  Plus,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  announcementService,
  incidentService,
  emergencyService,
  eventService
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
      {/* Header Overview Banner */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', borderLeft: '4px solid #0f172a', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              <MapPin size={13} /> Pinelands Community Platform
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Welcome, {user?.first_name || user?.email?.split('@')[0] || 'Resident'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '2px' }}>
              {activeCommunity
                ? `Safety updates, notices, and events for ${activeCommunity.name}`
                : 'Centralised security and community updates for Pinelands and surrounding areas.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Link to="/incidents" className="btn btn-secondary btn-sm">
              <Plus size={14} /> Report Incident
            </Link>
            <Link to="/communities" className="btn btn-primary btn-sm">
              <Users size={14} /> Pinelands Directory
            </Link>
          </div>
        </div>
      </div>

      {/* Active Emergency Alert Banner */}
      {sosAlerts.length > 0 && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={20} color="#dc2626" />
              <div>
                <h3 style={{ color: '#b91c1c', fontWeight: '700', fontSize: '0.95rem', margin: 0 }}>
                  Active Emergency SOS Alerts ({sosAlerts.length})
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>Pinelands Neighborhood Watch dispatch notified</span>
              </div>
            </div>
            <Link to="/emergency" className="btn btn-danger btn-sm">
              Review Dispatch
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginTop: '12px' }}>
            {sosAlerts.map((sos) => (
              <div key={sos.id} style={{ padding: '12px', background: '#ffffff', borderRadius: '6px', border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#0f172a', fontWeight: '600' }}>
                  <span>{sos.user_detail?.first_name ? `${sos.user_detail.first_name} ${sos.user_detail.last_name || ''}` : sos.user_detail?.email}</span>
                  <span className="badge badge-danger">{sos.alert_type}</span>
                </div>
                {sos.note && <p style={{ fontSize: '0.8rem', marginTop: '4px', color: '#475569' }}>{sos.note}</p>}
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>{new Date(sos.time_activated).toLocaleTimeString()}</span>
                  <button
                    onClick={() => handleResolveSOS(sos.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#16a34a', borderColor: '#bbf7d0', fontSize: '0.725rem' }}
                  >
                    <CheckCircle2 size={12} /> Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ marginBottom: 0, padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Subscribed Communities</span>
            <Users size={16} color="#1e40af" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>
            {userCommunities.length}
          </div>
          <Link to="/communities" style={{ fontSize: '0.775rem', color: '#1e40af', display: 'inline-flex', alignItems: 'center', gap: '2px', marginTop: '6px', fontWeight: '500' }}>
            Manage memberships <ChevronRight size={12} />
          </Link>
        </div>

        <div className="card" style={{ marginBottom: 0, padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Open Incidents</span>
            <AlertTriangle size={16} color="#dc2626" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>
            {incidents.length}
          </div>
          <Link to="/incidents" style={{ fontSize: '0.775rem', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '2px', marginTop: '6px', fontWeight: '500' }}>
            Review reports <ChevronRight size={12} />
          </Link>
        </div>

        <div className="card" style={{ marginBottom: 0, padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Upcoming Events</span>
            <Calendar size={16} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>
            {events.length}
          </div>
          <Link to="/events" style={{ fontSize: '0.775rem', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '2px', marginTop: '6px', fontWeight: '500' }}>
            View schedule <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Megaphone size={16} color="#1e40af" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Pinned Notices
            </h2>
          </div>
          {pinnedAnnouncements.length === 0 ? (
            <div className="card" style={{ color: '#64748b', fontSize: '0.85rem', padding: '16px' }}>
              No priority announcements pinned at this time.
            </div>
          ) : (
            pinnedAnnouncements.map(a => <AnnouncementCard key={a.id} announcement={a} />)
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '24px 0 12px' }}>
            <AlertTriangle size={16} color="#dc2626" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Active Incident Reports
            </h2>
          </div>
          {incidents.length === 0 ? (
            <div className="card" style={{ color: '#64748b', fontSize: '0.85rem', padding: '16px' }}>
              No active incident reports in Pinelands.
            </div>
          ) : (
            incidents.slice(0, 3).map(i => <IncidentCard key={i.id} incident={i} />)
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Calendar size={16} color="#16a34a" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Pinelands Events
            </h2>
          </div>
          {events.length === 0 ? (
            <div className="card" style={{ color: '#64748b', fontSize: '0.85rem', padding: '16px' }}>
              No upcoming events scheduled.
            </div>
          ) : (
            events.slice(0, 3).map(e => <EventCard key={e.id} event={e} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
