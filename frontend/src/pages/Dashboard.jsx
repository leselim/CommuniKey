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

  const totalIncidents = incidents.items.length;
  const resolvedCount = incidents.items.filter((i) => i.status === 'Resolved').length;
  const underReviewCount = incidents.items.filter((i) => i.status === 'Under review').length;
  const reportedCount = incidents.items.filter((i) => i.status === 'Reported').length;

  const resolvedPercent = totalIncidents > 0 ? Math.round((resolvedCount / totalIncidents) * 100) : 0;
  const reviewPercent = totalIncidents > 0 ? Math.round((underReviewCount / totalIncidents) * 100) : 0;
  const reportedPercent = Math.max(0, 100 - resolvedPercent - reviewPercent);

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

      {/* Data Engineering Analytics: Incident Resolution Progress */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s2)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <p className="eyebrow">Data Analytics • Real-time Triage</p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              Incident Resolution Pipeline
            </h2>
          </div>
          <span className="mono" style={{ fontSize: 'var(--fs-lg)', color: 'var(--signal)', fontWeight: 600 }}>
            {resolvedPercent}% Resolved
          </span>
        </div>

        <p className="sm faint">
          Real-time metric aggregation computed across community safety report database records.
        </p>

        <div className="progress-track">
          <div
            className="progress-segment progress-segment-resolved"
            style={{ width: `${resolvedPercent}%` }}
            title={`Resolved: ${resolvedPercent}%`}
          />
          <div
            className="progress-segment progress-segment-review"
            style={{ width: `${reviewPercent}%` }}
            title={`Under Review: ${reviewPercent}%`}
          />
          <div
            className="progress-segment progress-segment-reported"
            style={{ width: `${reportedPercent}%` }}
            title={`Reported: ${reportedPercent}%`}
          />
        </div>

        <div className="entry-meta" style={{ marginTop: 'var(--s3)', gap: 'var(--s5)', display: 'flex', flexWrap: 'wrap' }}>
          <span className="cluster" style={{ gap: 'var(--s2)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--signal)' }} />
            <strong style={{ color: 'var(--paper)', fontWeight: 500 }}>{resolvedCount}</strong> Resolved ({resolvedPercent}%)
          </span>
          <span className="cluster" style={{ gap: 'var(--s2)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--signal-hi)' }} />
            <strong style={{ color: 'var(--paper)', fontWeight: 500 }}>{underReviewCount}</strong> Under Review ({reviewPercent}%)
          </span>
          <span className="cluster" style={{ gap: 'var(--s2)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--line-hi)' }} />
            <strong style={{ color: 'var(--paper)', fontWeight: 500 }}>{reportedCount}</strong> Pending Triage ({reportedPercent}%)
          </span>
        </div>
      </section>

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
