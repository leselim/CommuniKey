import React from 'react';
import { Link } from 'react-router-dom';
import SOSButton from '../components/SOSButton';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
import {
  announcements as demoAnnouncements,
  community,
  events as demoEvents,
  incidents as demoIncidents,
} from '../services/demoData';
import { formatRelative, formatStamp } from '../utils/format';

function Figure({ label, value }) {
  return (
    <div className="figure">
      <span className="eyebrow">{label}</span>
      <span className="figure-value">{value}</span>
    </div>
  );
}

function Dashboard() {
  const { user, switchUser, demoUsers } = useAuth();
  const announcements = useCollection('/announcements', demoAnnouncements);
  const incidents = useCollection('/incidents', demoIncidents);
  const events = useCollection('/events', demoEvents);

  const open = incidents.items.filter((item) => item.status !== 'Resolved');
  const upcoming = events.items
    .filter((item) => new Date(item.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  const latestAnnouncements = [...announcements.items]
    .sort((a, b) => new Date(b.date_published) - new Date(a.date_published))
    .slice(0, 3);

  const latestIncidents = [...incidents.items]
    .sort((a, b) => new Date(b.date_reported) - new Date(a.date_reported))
    .slice(0, 3);

  const isAdmin = user && (user.role === 'Community Administrator' || user.role === 'System Administrator');
  const isVolunteer = user && user.role === 'Safety Volunteer';

  return (
    <div className="stack">
      <header className="masthead">
        <div>
          <p className="eyebrow">
            Community • Session: {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
          </p>
          <h1>{community.community_name}</h1>
          <p className="masthead-meta">
            {community.suburb}, {community.city}, {community.province}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="mono">{community.member_count} verified members</p>
          {user ? (
            <span
              className="status status-closed"
              style={{ marginTop: 'var(--s2)', display: 'inline-block' }}
            >
              Role: {user.role}
            </span>
          ) : null}
        </div>
      </header>

      {/* Interactive Role Switcher Banner for Demos */}
      <section className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)' }}>
        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <div>
            <p className="eyebrow">Interactive User Role Demo</p>
            <p className="sm faint">
              Currently signed in as <strong>{user?.first_name} {user?.last_name}</strong> ({user?.role}). Switch role to test permissions:
            </p>
          </div>
          <div className="cluster" style={{ gap: 'var(--s2)' }}>
            {demoUsers.map((u) => (
              <button
                key={u.role}
                type="button"
                className={`btn${user?.role === u.role ? ' btn-solid' : ''}`}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.65rem',
                  borderColor: user?.role === u.role ? 'var(--signal)' : 'var(--line-hi)',
                }}
                onClick={() => switchUser(u.role)}
              >
                {u.role.split(' ')[0]} ({u.first_name})
              </button>
            ))}
          </div>
        </div>
      </section>

      {isAdmin ? (
        <div className="notice" style={{ borderColor: 'var(--signal)', borderLeftColor: 'var(--signal)' }}>
          <div>
            <strong>Administrator View:</strong> You have elevated privileges. You can publish announcements and create events directly from the Announcements and Events tabs.
          </div>
          <div className="cluster" style={{ marginLeft: 'auto', gap: 'var(--s2)' }}>
            <Link to="/announcements" className="btn btn-solid" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
              Publish Announcement
            </Link>
            <Link to="/events" className="btn btn-solid" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
              Create Event
            </Link>
          </div>
        </div>
      ) : isVolunteer ? (
        <div className="notice" style={{ borderColor: 'var(--signal)', borderLeftColor: 'var(--signal)' }}>
          <div>
            <strong>Safety Volunteer View:</strong> You have permission to update and resolve reported safety incidents directly on the Incidents tab.
          </div>
          <Link to="/incidents" className="btn btn-solid" style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
            Review Incidents
          </Link>
        </div>
      ) : null}

      <SOSButton />

      <div className="figures">
        <Figure label="Open incidents" value={open.length} />
        <Figure label="Announcements" value={announcements.items.length} />
        <Figure label="Upcoming events" value={upcoming.length} />
        <Figure label="Members" value={community.member_count} />
      </div>

      <div className="columns">
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">Announcements</p>
            <Link to="/announcements" className="link">
              All announcements
            </Link>
          </div>

          {latestAnnouncements.length === 0 ? (
            <p className="blank">Nothing published yet.</p>
          ) : (
            <ul className="ledger">
              {latestAnnouncements.map((item) => (
                <li className="entry" key={item.id}>
                  <h3 className="entry-title">{item.title}</h3>
                  <span className="entry-aside">
                    {item.priority === 'high' ? <StatusBadge status="Priority" /> : null}
                  </span>
                  <p className="entry-body">{item.content}</p>
                  <div className="entry-meta">
                    <span title={formatStamp(item.date_published)}>
                      {formatRelative(item.date_published)}
                    </span>
                    <span>{item.created_by}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="section">
          <div className="section-head">
            <p className="eyebrow">Incidents</p>
            <Link to="/incidents" className="link">
              All incidents
            </Link>
          </div>

          {latestIncidents.length === 0 ? (
            <p className="blank">No incidents reported.</p>
          ) : (
            <ul className="ledger">
              {latestIncidents.map((item) => (
                <li className="entry" key={item.id}>
                  <h3 className="entry-title">{item.incident_type}</h3>
                  <span className="entry-aside">
                    <StatusBadge status={item.status} />
                  </span>
                  <p className="entry-body">{item.description}</p>
                  <div className="entry-meta">
                    <span>{formatRelative(item.date_reported)}</span>
                    {item.location ? <span>{item.location}</span> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
