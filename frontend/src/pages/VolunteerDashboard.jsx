import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import PlatformGuideModal from '../components/PlatformGuideModal';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
import { community, incidents as demoIncidents } from '../services/demoData';
import { formatRelative, formatStamp } from '../utils/format';

const VOLUNTEER_TEAM = [
  { id: 1, name: 'Sarah Jenkins', role: 'Team lead, Section B patrol', status: 'Active', duty: 'on', phone: '+27 83 456 7890' },
  { id: 2, name: 'Sipho Dlamini', role: 'Main gate patrol officer', status: 'Active', duty: 'on', phone: '+27 82 555 1212' },
  { id: 3, name: 'Johan Venter', role: 'Perimeter night watch', status: 'Awaiting', duty: 'duty', phone: '+27 84 999 3333' },
];

const PATROL_ROUTES = [
  { id: 1, route: 'Section A and Riverside Drive perimeter', status: 'Completed', time: 'Checked in 20 minutes ago' },
  { id: 2, route: 'Section B and Mill Road park entrance', status: 'In Progress', time: 'Walking now' },
  { id: 3, route: 'Section C back fence and access latch', status: 'Awaiting', time: 'Next at 23:00' },
];

/* The response lifecycle, in the order it actually happens. */
const STAGES = [
  { key: 'Dispatched', label: 'Dispatched', note: 'Alert received' },
  { key: 'Acknowledged', label: 'Acknowledged', note: 'Responder assigned' },
  { key: 'En Route', label: 'En route', note: 'Travelling' },
  { key: 'On Scene', label: 'On scene', note: 'Responder arrived' },
  { key: 'Resolved', label: 'Resolved', note: 'Area cleared' },
];

function VolunteerDashboard() {
  const { currentUser } = useAuth();
  const { items: incidentList, update: updateIncident } = useCollection('/incidents', demoIncidents);

  const [stage, setStage] = useState('Dispatched');
  const [notice, setNotice] = useState('');
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  const stageIndex = STAGES.findIndex((s) => s.key === stage);
  const isResolved = stage === 'Resolved';

  const advanceTo = (key) => {
    setStage(key);
    setNotice(
      key === 'Resolved'
        ? 'Incident closed. The estate office has been notified.'
        : `Your status is now ${key.toLowerCase()}. Dispatch can see it.`
    );
    setTimeout(() => setNotice(''), 4000);
  };

  const handleIncidentStatus = async (id, status) => {
    await updateIncident(id, { status });
    setNotice(`Incident moved to ${status.toLowerCase()}.`);
    setTimeout(() => setNotice(''), 4000);
  };

  const responderName = currentUser
    ? `${currentUser.first_name} ${currentUser.last_name}`
    : 'Safety volunteer';

  return (
    <div className="stack" style={{ gap: 'var(--s6)' }}>
      <header className="masthead">
        <div>
          <p className="eyebrow">
            {responderName} · {community.community_name}
          </p>
          <h1>Dispatch and triage</h1>
          <p className="masthead-meta">
            Live alerts, incoming reports and who is out on patrol right now.
          </p>
        </div>
        <div className="cluster">
          <Link to="/insights" className="btn btn-solid">
            View reporting
          </Link>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      <section className={`callout${isResolved ? ' callout-settled' : ''}`} aria-live="polite">
        <div className="callout-head">
          <h2>SOS at 14 Riverside Drive, Section A</h2>
          <StatusBadge status={isResolved ? 'Resolved' : 'Active'} />
        </div>
        <p className="sm dim">
          {isResolved
            ? 'Closed by the responder team. The area has been cleared and secured.'
            : 'Raised from a resident phone. Sipho Dlamini has been notified.'}
        </p>

        <div className="steps" style={{ marginTop: 'var(--s4)' }} role="group" aria-label="Response stage">
          {STAGES.map((s, i) => {
            const done = i < stageIndex;
            const current = i === stageIndex;
            return (
              <button
                key={s.key}
                type="button"
                className={`step${done ? ' step-done' : ''}${current ? ' step-current' : ''}`}
                onClick={() => advanceTo(s.key)}
                disabled={i === 0}
                aria-current={current ? 'step' : undefined}
              >
                <span className="step-label">{s.label}</span>
                <span className="step-note">{s.note}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Incoming reports</h2>
          <div className="cluster" style={{ gap: 'var(--s4)' }}>
            <button type="button" className="link" onClick={() => setGuideModalOpen(true)}>
              What do these mean?
            </button>
            <Link to="/incidents" className="link">
              Full ledger
            </Link>
          </div>
        </div>

        {incidentList.length === 0 ? (
          <p className="blank">Nothing is waiting for dispatch.</p>
        ) : (
          <div>
            {incidentList.map((item) => (
              <article className="case" key={item.id}>
                <div className="case-head">
                  <div>
                    <h3 className="case-title">{item.incident_type}</h3>
                    <p className="case-where">
                      {item.location || 'General estate'} · reported by {item.reported_by}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <p className="case-body">{item.description}</p>

                <div className="case-foot">
                  <span className="case-time">
                    {formatRelative(item.date_reported)} · {formatStamp(item.date_reported)}
                  </span>
                  <div className="case-actions">
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => handleIncidentStatus(item.id, 'Under review')}
                    >
                      Take a look
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-solid"
                      onClick={() => handleIncidentStatus(item.id, 'Resolved')}
                    >
                      Mark resolved
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="grid-2">
        <section className="section">
          <div className="section-head">
            <h2>Patrol routes</h2>
          </div>
          <ul className="ledger">
            {PATROL_ROUTES.map((p) => (
              <li className="entry" key={p.id}>
                <div>
                  <h3 className="entry-title">{p.route}</h3>
                  <p className="entry-meta">{p.time}</p>
                </div>
                <span className="entry-aside">
                  <StatusBadge status={p.status} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>Who is on duty</h2>
          </div>
          <ul className="ledger">
            {VOLUNTEER_TEAM.map((v) => (
              <li className="entry" key={v.id}>
                <div className="identity">
                  <Avatar name={v.name} size="lg" presence={v.duty} />
                  <div className="identity-text">
                    <h3 className="entry-title">{v.name}</h3>
                    <span className="sm faint">{v.role}</span>
                    <a href={`tel:${v.phone.replace(/[^0-9+]/g, '')}`} className="link sm">
                      {v.phone}
                    </a>
                  </div>
                </div>
                <span className="entry-aside">
                  <StatusBadge status={v.status} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <PlatformGuideModal isOpen={guideModalOpen} onClose={() => setGuideModalOpen(false)} />
    </div>
  );
}

export default VolunteerDashboard;
