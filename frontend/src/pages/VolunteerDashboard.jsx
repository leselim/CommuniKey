import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import DataTable, { CellStack, CellTime } from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import PlatformGuideModal from '../components/PlatformGuideModal';
import { Card, EmptyState, MetaItem, SectionBar, Toast } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
import { incidents as demoIncidents } from '../services/demoData';
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

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice((current) => (current === message ? '' : current)), 4000);
  };

  const advanceTo = (key) => {
    setStage(key);
    flash(key === 'Resolved' ? 'Incident closed. The estate office has been notified.' : `Your status is now ${key.toLowerCase()}. Dispatch can see it.`);
  };

  const handleIncidentStatus = async (id, status) => {
    await updateIncident(id, { status });
    flash(`Incident moved to ${status.toLowerCase()}.`);
  };

  const responderName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Safety volunteer';
  const count = (status) => incidentList.filter((i) => String(i.status).toLowerCase() === status).length;
  const onDuty = VOLUNTEER_TEAM.filter((v) => v.duty === 'on').length;

  return (
    <div className="page">
      <section className={`callout${isResolved ? ' callout-settled' : ''}`} aria-live="polite">
        <div className="card-head">
          <div className="row" style={{ gap: 12 }}>
            <span className="badge-icon" style={isResolved ? { background: '#22a052' } : undefined}>
              <Icon name={isResolved ? 'check' : 'siren'} />
            </span>
            <div>
              <h2 style={{ fontSize: 'var(--fs-15)' }}>SOS at 14 Riverside Drive, Section A</h2>
              <p className="card-sub">
                {isResolved
                  ? 'Closed by the responder team. The area has been cleared and secured.'
                  : `Raised from a resident phone. Sipho Dlamini has been notified. Responding as ${responderName}.`}
              </p>
            </div>
          </div>
          <StatusBadge status={isResolved ? 'Resolved' : 'SOS alert'} />
        </div>

        <div className="steps" role="group" aria-label="Response stage">
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

      <SectionBar
        icon="shield"
        title="Incoming reports"
        stats={[
          { label: 'Reported:', value: count('reported') },
          { label: 'Under review:', value: count('under review') },
          { label: 'Resolved:', value: count('resolved') },
          { label: 'On duty:', value: onDuty },
        ]}
      >
        <Link to="/insights" className="btn btn-primary">
          <Icon name="chart" />
          View reporting
        </Link>
      </SectionBar>

      <Card
        title="Waiting for dispatch"
        sub="Newest first. Take a look to move a report under review."
        flush
        actions={
          <>
            <button type="button" className="link" onClick={() => setGuideModalOpen(true)}>
              What do these mean?
            </button>
            <Link to="/incidents" className="link">
              Full ledger
              <Icon name="chevronRight" />
            </Link>
          </>
        }
      >
        {incidentList.length === 0 ? (
          <EmptyState icon="checkCircle" title="Nothing is waiting for dispatch" />
        ) : (
          <DataTable
            caption="Incoming reports"
            columns={[
              {
                key: 'report',
                header: 'Report',
                stack: true,
                cell: (item) => <CellStack title={item.incident_type} sub={item.description} clamp />,
              },
              {
                key: 'location',
                header: 'Location',
                width: '160px',
                stack: true,
                cell: (item) => <CellStack title={item.location || 'General estate'} sub={`By ${item.reported_by}`} />,
              },
              {
                key: 'when',
                header: 'Reported',
                width: '150px',
                stack: true,
                cell: (item) => (
                  <>
                    <span className="cell">
                      <span className="cell-time" title={formatStamp(item.date_reported)}>
                        <Icon name="clock" />
                        {formatRelative(item.date_reported)}
                      </span>
                    </span>
                    <span className="cell-sub">{formatStamp(item.date_reported)}</span>
                  </>
                ),
              },
              { key: 'status', header: 'Status', width: '128px', cell: (item) => <StatusBadge status={item.status} /> },
              {
                key: 'actions',
                header: 'Actions',
                align: 'end',
                width: '232px',
                cell: (item) => (
                  <>
                    <button type="button" className="btn btn-sm" onClick={() => handleIncidentStatus(item.id, 'Under review')}>
                      Take a look
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      disabled={String(item.status).toLowerCase() === 'resolved'}
                      onClick={() => handleIncidentStatus(item.id, 'Resolved')}
                    >
                      Mark resolved
                    </button>
                  </>
                ),
              },
            ]}
            rows={incidentList}
          />
        )}
      </Card>

      <div className="grid grid-2">
        <Card
          title="Patrol routes"
          flush
          actions={
            <Link to="/volunteer/patrol" className="link">
              Patrol
              <Icon name="chevronRight" />
            </Link>
          }
        >
          <DataTable
            caption="Patrol routes"
            columns={[
              { key: 'route', header: 'Route', cell: (p) => <span className="cell-title">{p.route}</span> },
              { key: 'activity', header: 'Last activity', width: '190px', cell: (p) => <CellTime>{p.time}</CellTime> },
              { key: 'status', header: 'Status', width: '140px', cell: (p) => <StatusBadge status={p.status} /> },
            ]}
            rows={PATROL_ROUTES}
          />
        </Card>

        <Card title="Who is on duty" flush ruled>
          {VOLUNTEER_TEAM.map((v) => (
            <div className="list-row" key={v.id}>
              <Avatar name={v.name} size="md" presence={v.duty} />
              <span className="list-main">
                <span className="list-title">{v.name}</span>
                <span className="list-meta" style={{ marginTop: 1, '--meta-col': '180px' }}>
                  <span>{v.role}</span>
                  <MetaItem icon="phone">
                    <a href={`tel:${v.phone.replace(/[^0-9+]/g, '')}`} className="link" style={{ fontWeight: 500 }}>
                      {v.phone}
                    </a>
                  </MetaItem>
                </span>
              </span>
              <StatusBadge status={v.status} />
            </div>
          ))}
        </Card>
      </div>

      <PlatformGuideModal isOpen={guideModalOpen} onClose={() => setGuideModalOpen(false)} />
      <Toast message={notice} />
    </div>
  );
}

export default VolunteerDashboard;
