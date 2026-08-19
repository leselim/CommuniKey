import React from 'react';
import { Link } from 'react-router-dom';
import SOSButton from '../components/SOSButton';
import StatusBadge from '../components/StatusBadge';
import useCollection from '../hooks/useCollection';
import {
  announcements as demoAnnouncements,
  community,
  events as demoEvents,
  incidents as demoIncidents,
} from '../services/demoData';
import { formatDayDate, formatRelative, formatStamp } from '../utils/format';

function Figure({ label, value }) {
  return (
    <div className="figure">
      <span className="eyebrow">{label}</span>
      <span className="figure-value">{value}</span>
    </div>
  );
}

function Dashboard() {
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

  return (
    <div className="stack">
      <header className="masthead">
        <div>
          <p className="eyebrow">Community</p>
          <h1>{community.community_name}</h1>
          <p className="masthead-meta">
            {community.suburb}, {community.city}, {community.province}
          </p>
        </div>
        <p className="mono">{community.member_count} verified members</p>
      </header>

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
                    <span title={formatStamp(item.date_reported)}>
                      {formatRelative(item.date_reported)}
                    </span>
                    {item.location ? <span>{item.location}</span> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Next event</p>
          <Link to="/events" className="link">
            Calendar
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="blank">No events scheduled.</p>
        ) : (
          <ul className="ledger">
            <li className="entry">
              <h3 className="entry-title">{upcoming[0].event_name}</h3>
              <span className="entry-aside mono">{formatDayDate(upcoming[0].event_date)}</span>
              <p className="entry-body">{upcoming[0].description}</p>
              <div className="entry-meta">
                <span>{formatStamp(upcoming[0].event_date)}</span>
                <span>{upcoming[0].event_location}</span>
                <span>{formatRelative(upcoming[0].event_date)}</span>
              </div>
            </li>
          </ul>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
