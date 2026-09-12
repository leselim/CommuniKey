import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';
import DataTable, { CellPerson, CellStack } from '../components/DataTable';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import GuardhouseVerificationModal from '../components/GuardhouseVerificationModal';
import { Gauge, GroupedBarChart, RankedBars } from '../components/Chart';
import { Card, Delta, Details, EmptyState, MetaItem, SectionBar, Select, Toast } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
import useApplications from '../services/applications';
import {
  announcements as demoAnnouncements,
  community,
  gateHistory,
  incidentHistory,
  members as demoMembers,
} from '../services/demoData';
import {
  RANGES,
  countBy,
  gateTotals,
  humanHours,
  rangeDays,
  reportSeries,
  summarise,
  withinRange,
} from '../utils/analytics';
import { formatRelative } from '../utils/format';

/*
 * Estate overview.
 *
 * Every figure is computed from the incident and gate records by the
 * aggregation layer. Anything an administrator is expected to act on sits
 * above the reporting, so the first screen answers "what needs me".
 */

const REPORT_SERIES = [
  { key: 'resolved', label: 'Closed', tone: 'ink' },
  { key: 'outstanding', label: 'Still open', tone: 'brand' },
];

function AdminDashboard() {
  const { currentUser } = useAuth();

  const { items: incidents } = useCollection('/incidents', incidentHistory);
  const { items: members } = useCollection('/members', demoMembers);
  const { create: createAnnouncement } = useCollection('/announcements', demoAnnouncements);

  const { applications: pendingQueue, decide } = useApplications();
  const [range, setRange] = useState('30d');
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [reviewDoc, setReviewDoc] = useState(null);
  const [gateModalOpen, setGateModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notice, setNotice] = useState('');

  const days = rangeDays(range);
  const stats = useMemo(() => summarise(incidents, days), [incidents, days]);
  const series = useMemo(() => reportSeries(incidents, days), [incidents, days]);
  const byType = useMemo(() => countBy(withinRange(incidents, days), 'incident_type', 6), [incidents, days]);
  const gateSum = useMemo(() => gateTotals(gateHistory, days), [days]);

  const outcomes = [
    { label: 'Complete', value: stats.resolved, tone: 'ink' },
    { label: 'Waiting', value: stats.review, tone: 'grey' },
    { label: 'Still open', value: stats.open, tone: 'brand' },
  ];

  const needsAttention = useMemo(
    () =>
      incidents
        .filter((i) => i.status !== 'Resolved')
        .sort((a, b) => new Date(a.date_reported) - new Date(b.date_reported))
        .slice(0, 5),
    [incidents]
  );

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice((current) => (current === message ? '' : current)), 4000);
  };

  const approve = (id) => {
    decide(id);
    setReviewDoc(null);
    flash('Account verified. The resident now has full estate access.');
  };

  const decline = (id) => {
    decide(id);
    setReviewDoc(null);
    flash('Registration declined. The applicant has been notified.');
  };

  const publish = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await createAnnouncement({
      title: title.trim(),
      content: content.trim(),
      priority,
      date_published: new Date().toISOString(),
      created_by: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Estate management',
    });

    setTitle('');
    setContent('');
    setPriority('normal');
    setBroadcastModal(false);
    flash('Notice published. Every verified resident has been notified.');
  };

  return (
    <div className="page">
      <SectionBar
        icon="userCheck"
        title="Waiting on you"
        stats={[
          { label: 'To verify:', value: pendingQueue.length },
          { label: 'Open reports:', value: stats.open + stats.review },
        ]}
      >
        <button type="button" className="btn" onClick={() => setGateModalOpen(true)}>
          <Icon name="key" />
          Verify a pass
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setBroadcastModal(true)}>
          <Icon name="megaphone" />
          Publish a notice
        </button>
      </SectionBar>

      <div className="grid grid-3">
        <Card
          className="span-2"
          title="Verification queue"
          sub="New households waiting for proof of residence to be checked"
          flush
          actions={
            <Link to="/admin/moderation" className="link">
              All members
              <Icon name="chevronRight" />
            </Link>
          }
        >
          {pendingQueue.length === 0 ? (
            <EmptyState icon="checkCircle" title="The queue is clear" text="Every application has been reviewed." />
          ) : (
            <DataTable
              caption="Verification queue"
              columns={[
                {
                  key: 'applicant',
                  header: 'Applicant',
                  stack: true,
                  cell: (person) => (
                    <CellPerson name={person.name} meta={person.email} avatar={<Avatar name={person.name} size="sm" />} />
                  ),
                },
                { key: 'address', header: 'Address', width: '24%', cell: (person) => person.address },
                {
                  key: 'proof',
                  header: 'Proof supplied',
                  width: '22%',
                  stack: true,
                  cell: (person) => <CellStack title={person.documentType} sub={person.uploadedTime} />,
                },
                { key: 'status', header: 'Status', width: '150px', cell: (person) => <StatusBadge status={person.status} /> },
                {
                  key: 'action',
                  header: null,
                  srHeader: 'Review application',
                  align: 'end',
                  width: '110px',
                  cell: (person) => (
                    <button type="button" className="btn btn-sm" onClick={() => setReviewDoc(person)}>
                      Review
                    </button>
                  ),
                },
              ]}
              rows={pendingQueue}
            />
          )}
        </Card>

        <Card
          title="Oldest reports still open"
          flush
          ruled
          actions={
            <Link to="/admin/incidents" className="link">
              All incidents
              <Icon name="chevronRight" />
            </Link>
          }
        >
          {needsAttention.length === 0 ? (
            <EmptyState icon="checkCircle" title="Nothing open" text="Everything reported has been closed." />
          ) : (
            needsAttention.map((item) => (
              <div className="list-row" key={item.id}>
                <span className="list-main">
                  <span className="list-title">{item.incident_type}</span>
                  <span className="list-meta" style={{ marginTop: 2, '--meta-col': '150px' }}>
                    <MetaItem icon="mapPin">{item.location}</MetaItem>
                    <MetaItem icon="clock">{formatRelative(item.date_reported)}</MetaItem>
                  </span>
                </span>
                <StatusBadge status={item.status} />
              </div>
            ))
          )}
        </Card>
      </div>

      <SectionBar
        icon="chart"
        title="How the estate is running"
        stats={[
          { label: 'Reports:', value: stats.total, after: <Delta change={stats.reportedChange} /> },
          { label: 'Closed:', value: stats.resolutionRate, unit: '%' },
          {
            label: 'Typical close:',
            value: stats.medianHoursToClose === null ? '0' : Math.round(stats.medianHoursToClose),
            unit: 'hours',
          },
          { label: 'Verified members:', value: members.length + community.member_count },
        ]}
      >
        <Select
          label="Reporting period"
          value={range}
          onChange={setRange}
          options={RANGES.map((r) => ({ value: r.key, label: `Last ${r.label}` }))}
        />
      </SectionBar>

      <div className="grid grid-4">
        <Card title="Outcomes" sub={`${stats.total} reports in this period`}>
          <Gauge parts={outcomes} label="closed" />
        </Card>

        <Card className="span-2" title="Reports over time" sub={days > 31 ? 'Grouped by week' : 'Grouped by day'}>
          <GroupedBarChart data={series} series={REPORT_SERIES} height={250} yLabel="Reports" />
        </Card>

        <Card
          title="What gets reported"
          sub={`${gateSum.dailyAverage} gate movements a day`}
          actions={
            <Link to="/insights" className="link">
              Reporting
              <Icon name="chevronRight" />
            </Link>
          }
        >
          <RankedBars items={byType} />
          <p className="hint" style={{ marginTop: 14 }}>
            Median time to close is {humanHours(stats.medianHoursToClose)}.
          </p>
        </Card>
      </div>

      {reviewDoc ? (
        <Modal
          title="Review application"
          onClose={() => setReviewDoc(null)}
          footer={
            <>
              <button type="button" className="btn push" onClick={() => setReviewDoc(null)}>
                Close
              </button>
              <button type="button" className="btn btn-danger-quiet" onClick={() => decline(reviewDoc.id)}>
                Decline
              </button>
              <button type="button" className="btn btn-primary" onClick={() => approve(reviewDoc.id)}>
                <Icon name="check" />
                Approve account
              </button>
            </>
          }
        >
          <div className="profile-head" style={{ paddingBottom: 14, borderBottom: '1px solid var(--line-soft)' }}>
            <Avatar name={reviewDoc.name} size="xl" />
            <div>
              <span className="profile-name">{reviewDoc.name}</span>
              <div className="profile-tags">
                <StatusBadge status="Pending Verification" />
              </div>
            </div>
          </div>

          <Details
            rows={[
              { label: 'Household', value: reviewDoc.address },
              { label: 'Email', value: reviewDoc.email },
              { label: 'Proof supplied', value: reviewDoc.documentType },
              {
                label: 'File',
                value: (
                  <span className="row">
                    <Icon name="file" className="muted" />
                    {reviewDoc.fileName}
                  </span>
                ),
              },
              { label: 'Uploaded', value: reviewDoc.uploadedTime },
            ]}
          />
        </Modal>
      ) : null}

      {broadcastModal ? (
        <Modal
          title="Publish a notice"
          onClose={() => setBroadcastModal(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setBroadcastModal(false)}>
                Cancel
              </button>
              <button type="submit" form="notice-form" className="btn btn-primary">
                Publish notice
              </button>
            </>
          }
        >
          <form id="notice-form" onSubmit={publish} className="fields">
            <div className="field field-wide">
              <label htmlFor="notice-title">Title</label>
              <input
                id="notice-title"
                className="control"
                placeholder="Planned water interruption on Tuesday"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-autofocus
                required
              />
            </div>

            <div className="field field-wide">
              <label htmlFor="notice-priority">Priority</label>
              <select id="notice-priority" className="control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="normal">Normal, appears in the feed</option>
                <option value="high">High, also sends an alert</option>
              </select>
            </div>

            <div className="field field-wide">
              <label htmlFor="notice-content">Message</label>
              <textarea
                id="notice-content"
                className="control"
                rows={5}
                placeholder="What residents need to know, and what they should do about it."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      ) : null}

      <GuardhouseVerificationModal isOpen={gateModalOpen} onClose={() => setGateModalOpen(false)} onLogEntry={(msg) => flash(msg)} />

      <Toast message={notice} />
    </div>
  );
}

export default AdminDashboard;
