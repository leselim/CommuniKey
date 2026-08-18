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
  Sparkles,
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
      {/* Hero Welcome Banner */}
      <div className="hero-banner">
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '12px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <Sparkles size={14} /> Community Hub Live
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: '800', color: '#ffffff', margin: 0, lineHeight: '1.2' }}>
              Welcome back, {user?.first_name || user?.email?.split('@')[0] || 'Resident'}! 👋
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.975rem', marginTop: '6px', maxWidth: '600px' }}>
              {activeCommunity
                ? `Viewing live safety alerts, announcements, and events for ${activeCommunity.name}`
                : 'Real-time neighborhood updates across all your subscribed community networks.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/incidents" className="btn btn-secondary" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.25)' }}>
              <Plus size={16} /> Report Incident
            </Link>
            <Link to="/communities" className="btn btn-primary">
              <Users size={16} /> Explore Communities
            </Link>
          </div>
        </div>
      </div>

      {/* Active Emergency Alert Warning Banner */}
      {sosAlerts.length > 0 && (
        <div style={{ backgroundColor: '#fff1f2', border: '2px solid #fecdd3', borderRadius: '16px', padding: '20px', marginBottom: '32px', boxShadow: '0 8px 24px rgba(225, 29, 72, 0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#e11d48', padding: '10px', borderRadius: '12px', color: '#fff', display: 'flex' }} className="pulse-emergency">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 style={{ color: '#be123c', fontWeight: '800', fontSize: '1.1rem', margin: 0 }}>
                  Active Emergency SOS Alerts ({sosAlerts.length})
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#881337' }}>Urgent responder action required</span>
              </div>
            </div>
            <Link to="/emergency" className="btn btn-danger btn-sm">
              Review Dispatch Log
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginTop: '16px' }}>
            {sosAlerts.map((sos) => (
              <div key={sos.id} style={{ padding: '14px', background: '#ffffff', borderRadius: '12px', border: '1px solid #fecdd3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: '#334155', fontWeight: '600' }}>
                  <span>🚨 {sos.user_detail?.first_name ? `${sos.user_detail.first_name} ${sos.user_detail.last_name || ''}` : sos.user_detail?.email}</span>
                  <span className="badge badge-danger">{sos.alert_type}</span>
                </div>
                {sos.note && <p style={{ fontSize: '0.85rem', marginTop: '6px', color: '#475569' }}>{sos.note}</p>}
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(sos.time_activated).toLocaleTimeString()}</span>
                  <button
                    onClick={() => handleResolveSOS(sos.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#059669', borderColor: '#a7f3d0' }}
                  >
                    <CheckCircle2 size={14} /> Resolve SOS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Stat Cards */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <div className="card card-interactive" style={{ borderTop: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your Communities</span>
            <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '10px', display: 'flex' }}>
              <Users size={20} color="#0284c7" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
            {userCommunities.length}
          </div>
          <Link to="/communities" style={{ fontSize: '0.825rem', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '10px', textDecoration: 'none', fontWeight: '600' }}>
            Manage memberships <ChevronRight size={15} />
          </Link>
        </div>

        <div className="card card-interactive" style={{ borderTop: '4px solid #e11d48' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Open Incidents</span>
            <div style={{ background: '#fff1f2', padding: '10px', borderRadius: '10px', display: 'flex' }}>
              <AlertTriangle size={20} color="#e11d48" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
            {incidents.length}
          </div>
          <Link to="/incidents" style={{ fontSize: '0.825rem', color: '#e11d48', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '10px', textDecoration: 'none', fontWeight: '600' }}>
            Review incident reports <ChevronRight size={15} />
          </Link>
        </div>

        <div className="card card-interactive" style={{ borderTop: '4px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Upcoming Events</span>
            <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '10px', display: 'flex' }}>
              <Calendar size={20} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
            {events.length}
          </div>
          <Link to="/events" style={{ fontSize: '0.825rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '10px', textDecoration: 'none', fontWeight: '600' }}>
            View event calendar <ChevronRight size={15} />
          </Link>
        </div>
      </div>

      {/* Grid Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: '#e0f2fe', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <Megaphone size={18} color="#0284c7" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Pinned & Priority Announcements
            </h2>
          </div>
          {pinnedAnnouncements.length === 0 ? (
            <div className="card" style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '24px' }}>
              No priority announcements pinned at this time.
            </div>
          ) : (
            pinnedAnnouncements.map(a => <AnnouncementCard key={a.id} announcement={a} />)
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '32px 0 16px' }}>
            <div style={{ background: '#fff1f2', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <AlertTriangle size={18} color="#e11d48" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Recent Active Incidents
            </h2>
          </div>
          {incidents.length === 0 ? (
            <div className="card" style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '24px' }}>
              No active incident reports in your community.
            </div>
          ) : (
            incidents.slice(0, 3).map(i => <IncidentCard key={i.id} incident={i} />)
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: '#ecfdf5', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <Calendar size={18} color="#059669" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Community Events
            </h2>
          </div>
          {events.length === 0 ? (
            <div className="card" style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '24px' }}>
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
