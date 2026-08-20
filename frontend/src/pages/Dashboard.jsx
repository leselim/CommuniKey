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

  const totalIncidents = incidents.items.length;
  const resolvedCount = incidents.items.filter((i) => i.status === 'Resolved').length;
  const underReviewCount = incidents.items.filter((i) => i.status === 'Under review').length;
  const reportedCount = incidents.items.filter((i) => i.status === 'Reported').length;

  const resolvedPercent = totalIncidents > 0 ? Math.round((resolvedCount / totalIncidents) * 100) : 0;
  const reviewPercent = totalIncidents > 0 ? Math.round((underReviewCount / totalIncidents) * 100) : 0;
  const reportedPercent = Math.max(0, 100 - resolvedPercent - reviewPercent);

  // Group incidents by category dynamically
  const categoryCounts = incidents.items.reduce((acc, item) => {
    const type = item.incident_type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Detailed resident insights per category
  const INSIGHTS = {
    'Suspicious activity': {
      location: 'Riverside Drive & Main Gate',
      advice: 'Most common concern. Unrecognized vehicles parked for over 30 mins are checked by gate patrol.',
    },
    'Streetlight fault': {
      location: 'Mill Road',
      advice: 'Occurs after municipal power surges. Reported to city infrastructure team within 24 hours.',
    },
    'Attempted break-in': {
      location: 'Section C Perimeter',
      advice: 'Occasional overnight gate latch damage. Security patrol conducts extra night rounds here.',
    },
    'Noise disturbance': {
      location: 'Section B & Clubhouse',
      advice: 'Loud music or late gatherings past quiet hours (22:00). Resolved promptly by patrol.',
    },
  };

  return (
    <div className="stack">
      {/* SECTION 1: Masthead & Overview */}
      <header className="masthead">
        <div>
          <p className="eyebrow">Community Overview</p>
          <h1>{community.community_name}</h1>
          <p className="masthead-meta">
            {community.suburb}, {community.city}, {community.province}
          </p>
        </div>
        <p className="mono">{community.member_count} verified members</p>
      </header>

      {/* Emergency SOS Bar */}
      <SOSButton />

      {/* SECTION 2: Key Metric Figures Bar */}
      <div className="figures">
        <Figure label="Open incidents" value={open.length} />
        <Figure label="Announcements" value={announcements.items.length} />
        <Figure label="Upcoming events" value={upcoming.length} />
        <Figure label="Members" value={community.member_count} />
      </div>

      {/* SECTION 3: Community Safety Resolution Progress */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s2)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <p className="eyebrow">Safety Progress Overview</p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              Neighborhood Incident Status
            </h2>
          </div>
          <span className="mono" style={{ fontSize: 'var(--fs-lg)', color: 'var(--signal)', fontWeight: 600 }}>
            {resolvedPercent}% Resolved
          </span>
        </div>

        <p className="sm faint">
          A live breakdown showing how reported safety concerns in Riverside Estate are being resolved by security and volunteers.
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
            <strong style={{ color: 'var(--paper)', fontWeight: 500 }}>{reportedCount}</strong> Awaiting Review ({reportedPercent}%)
          </span>
        </div>
      </section>

      {/* SECTION 4: Safety Patterns & Monthly Trends */}
      <div className="columns">
        {/* Most Common Incidents in Your Area */}
        <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
          <div className="panel-head" style={{ marginBottom: 'var(--s3)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <p className="eyebrow">Resident Safety Guide</p>
              <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
                Most Likely Incidents in Your Area
              </h2>
            </div>
            <Link to="/incidents" className="link">
              View all reports
            </Link>
          </div>

          <p className="sm faint" style={{ marginBottom: 'var(--s4)' }}>
            If you just moved into Riverside Estate, here is what safety patterns look like based on community reports:
          </p>

          <div className="stack" style={{ gap: 'var(--s5)' }}>
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = totalIncidents > 0 ? Math.round((count / totalIncidents) * 100) : 0;
              const info = INSIGHTS[cat] || { location: 'General Area', advice: 'Reported concern being tracked.' };

              return (
                <div key={cat} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 'var(--s3)' }}>
                  <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s1)' }}>
                    <span style={{ fontSize: 'var(--fs-base)', color: 'var(--paper)', fontWeight: 500 }}>
                      {cat}
                    </span>
                    <span className="mono" style={{ fontSize: 'var(--fs-sm)', color: 'var(--signal)', fontWeight: 600 }}>
                      {pct}% of all reports ({count})
                    </span>
                  </div>

                  <div className="progress-track" style={{ margin: 'var(--s2) 0', height: '6px' }}>
                    <div
                      className="progress-segment progress-segment-resolved"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="entry-meta" style={{ marginTop: 'var(--s2)' }}>
                    <span className="faint" style={{ color: 'var(--dim)', fontSize: '0.8rem' }}>
                      Hotspot: <strong>{info.location}</strong>
                    </span>
                    <p className="sm faint" style={{ marginTop: '2px', color: 'var(--dim)' }}>
                      {info.advice}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Monthly Activity Trends & Dominant Incidents */}
        <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
          <div className="panel-head" style={{ marginBottom: 'var(--s3)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <p className="eyebrow">Monthly Activity Trends</p>
              <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
                What Dominated Each Month?
              </h2>
            </div>
            <span className="mono sm" style={{ color: 'var(--signal)' }}>
              Updated Live
            </span>
          </div>

          <p className="sm faint" style={{ marginBottom: 'var(--s4)' }}>
            How safety incidents change month-by-month and where patrol efforts focus:
          </p>

          <div className="stack" style={{ gap: 'var(--s5)' }}>
            {/* Current Month Story */}
            <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 'var(--s3)' }}>
              <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s1)' }}>
                <span style={{ fontSize: 'var(--fs-base)', color: 'var(--paper)', fontWeight: 500 }}>
                  August (Current Month)
                </span>
                <span className="mono sm" style={{ color: 'var(--signal)' }}>
                  3 Reports • Dominant: Suspicious Vehicles
                </span>
              </div>
              <p className="sm faint" style={{ color: 'var(--dim)', marginTop: 'var(--s1)' }}>
                Unfamiliar vehicles reported around <strong>Riverside Drive</strong>. Security patrol increased gate checks.
              </p>
              <div className="entry-meta" style={{ marginTop: 'var(--s2)' }}>
                <span>67% Resolved</span>
                <span>1 Under Active Review</span>
              </div>
            </div>

            {/* Past Month Story */}
            <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 'var(--s3)' }}>
              <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s1)' }}>
                <span style={{ fontSize: 'var(--fs-base)', color: 'var(--paper)', fontWeight: 500 }}>
                  July (Past Month)
                </span>
                <span className="mono sm" style={{ color: 'var(--paper)' }}>
                  2 Reports • Dominant: Streetlight Repair
                </span>
              </div>
              <p className="sm faint" style={{ color: 'var(--dim)', marginTop: 'var(--s1)' }}>
                Power surge damaged streetlights on <strong>Mill Road</strong>. Municipal team repaired within 48 hours.
              </p>
              <div className="entry-meta" style={{ marginTop: 'var(--s2)' }}>
                <span style={{ color: 'var(--signal)' }}>100% Resolved</span>
              </div>
            </div>

            {/* Prior Month Story */}
            <div>
              <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s1)' }}>
                <span style={{ fontSize: 'var(--fs-base)', color: 'var(--paper)', fontWeight: 500 }}>
                  June (Prior Month)
                </span>
                <span className="mono sm" style={{ color: 'var(--paper)' }}>
                  2 Reports • Dominant: Perimeter Checks
                </span>
              </div>
              <p className="sm faint" style={{ color: 'var(--dim)', marginTop: 'var(--s1)' }}>
                Gate latch maintenance in <strong>Section C</strong> and clubhouse noise complaint. Both handled smoothly.
              </p>
              <div className="entry-meta" style={{ marginTop: 'var(--s2)' }}>
                <span style={{ color: 'var(--signal)' }}>100% Resolved</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 5: Active Community Digest (Announcements & Upcoming Events Side-by-Side) */}
      <div className="columns">
        {/* Latest Announcements */}
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

        {/* Upcoming Events Digest */}
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">Upcoming Events</p>
            <Link to="/events" className="link">
              Event calendar
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <p className="blank">No upcoming events scheduled.</p>
          ) : (
            <ul className="ledger">
              {upcoming.slice(0, 3).map((item) => (
                <li className="entry" key={item.id}>
                  <h3 className="entry-title">{item.event_name || item.title}</h3>
                  <span className="entry-aside mono">
                    {formatDayDate(item.event_date)}
                  </span>
                  <p className="entry-body">{item.description}</p>
                  <div className="entry-meta">
                    <span>{formatStamp(item.event_date)}</span>
                    <span>{item.event_location || item.location}</span>
                    <span>{formatRelative(item.event_date)}</span>
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
