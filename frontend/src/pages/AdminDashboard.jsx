import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import GuardhouseVerificationModal from '../components/GuardhouseVerificationModal';
import Avatar from '../components/Avatar';
import { GroupedBarChart, Legend, ProportionBar } from '../components/Chart';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
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
 * The figures here are computed from the incident and gate records by the
 * aggregation layer, not stored as presets. The verification queue is the
 * one piece of state an administrator is expected to act on, so it sits
 * above the reporting rather than below it.
 */

const PENDING_REGISTRATIONS = [
  {
    id: 101,
    name: 'Kobus van der Merwe',
    address: '29 Mill Road, Section B',
    email: 'kobus.vdm@riverside.co.za',
    documentType: 'Municipal water bill',
    fileName: 'WaterBill_29MillRd_Aug2026.pdf',
    uploadedTime: 'Yesterday at 16:40',
  },
  {
    id: 102,
    name: 'Amina Patel',
    address: '5 Riverside Drive, Section A',
    email: 'amina.patel@riverside.co.za',
    documentType: 'Lease agreement',
    fileName: 'Lease_5RiversideDr_2026.pdf',
    uploadedTime: 'Two days ago at 11:15',
  },
];

const REPORT_SERIES = [
  { key: 'resolved', label: 'Closed', tone: 'signal' },
  { key: 'outstanding', label: 'Still open', tone: 'caution' },
];

function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const { items: incidents } = useCollection('/incidents', incidentHistory);
  const { items: members } = useCollection('/members', demoMembers);
  const { create: createAnnouncement } = useCollection('/announcements', demoAnnouncements);

  const [range, setRange] = useState('30d');
  const [pendingQueue, setPendingQueue] = useState(PENDING_REGISTRATIONS);
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
  const byType = useMemo(() => countBy(withinRange(incidents, days), 'incident_type', 5), [incidents, days]);
  const gateSum = useMemo(() => gateTotals(gateHistory, days), [days]);

  const outcomes = [
    { label: 'Closed', value: stats.resolved, tone: 'signal' },
    { label: 'Under review', value: stats.review, tone: 'caution' },
    { label: 'Still open', value: stats.open, tone: 'neutral' },
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
    setTimeout(() => setNotice(''), 4000);
  };

  const approve = (id) => {
    setPendingQueue((q) => q.filter((m) => m.id !== id));
    setReviewDoc(null);
    flash('Account verified. The resident now has full estate access.');
  };

  const decline = (id) => {
    setPendingQueue((q) => q.filter((m) => m.id !== id));
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
      created_by: currentUser
        ? `${currentUser.first_name} ${currentUser.last_name}`
        : 'Estate management',
    });

    setTitle('');
    setContent('');
    setPriority('normal');
    setBroadcastModal(false);
    flash('Notice published. Every verified resident has been notified.');
  };

  return (
    <div className="stack">
      <header className="masthead">
        <div>
          <p className="eyebrow">{community.community_name}</p>
          <h1>Overview</h1>
          <p className="masthead-meta">
            What needs your attention, and how the estate has been running.
          </p>
        </div>

        <div className="cluster" style={{ gap: 'var(--s2)' }}>
          <button type="button" className="btn" onClick={() => setGateModalOpen(true)}>
            Verify a pass
          </button>
          <button type="button" className="btn btn-solid" onClick={() => setBroadcastModal(true)}>
            Publish a notice
          </button>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* Anything an administrator must act on comes before the reporting. */}
      <section className="section">
        <div className="section-head">
          <h2>Waiting on you</h2>
          <span className="sm faint">
            {pendingQueue.length} to verify, {stats.open + stats.review} reports open
          </span>
        </div>

        {pendingQueue.length === 0 ? (
          <p className="blank">The verification queue is clear.</p>
        ) : (
          <ul className="ledger">
            {pendingQueue.map((person) => (
              <li className="entry" key={person.id}>
                <div className="identity">
                  <Avatar name={person.name} size="lg" ring />
                  <div className="identity-text">
                    <h3 className="entry-title">{person.name}</h3>
                    <span className="sm faint">{person.address}</span>
                    <span className="sm faint">
                      {person.documentType}, uploaded {person.uploadedTime.toLowerCase()}
                    </span>
                  </div>
                </div>
                <span className="entry-aside cluster" style={{ gap: 'var(--s4)' }}>
                  <StatusBadge status="Pending Verification" />
                  <button type="button" className="btn btn-sm" onClick={() => setReviewDoc(person)}>
                    Review
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Oldest reports still open</h2>
          <button type="button" className="link" onClick={() => navigate('/admin/incidents')}>
            All incidents
          </button>
        </div>

        {needsAttention.length === 0 ? (
          <p className="blank">Everything reported has been closed.</p>
        ) : (
          <ul className="ledger">
            {needsAttention.map((item) => (
              <li className="entry" key={item.id}>
                <div>
                  <div className="entry-head">
                    <h3 className="entry-title">{item.incident_type}</h3>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="entry-meta">
                    {item.location} · reported {formatRelative(item.date_reported)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="spread">
        <h2>How the estate has been running</h2>
        <div className="filter" role="group" aria-label="Reporting period">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              className="filter-item"
              aria-pressed={range === r.key}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="metric-strip">
        <div className="metric">
          <span className="metric-label">Reports received</span>
          <span className="metric-row">
            <span className="metric-value">{stats.total}</span>
            {stats.reportedChange !== 0 ? (
              <span className={`metric-delta ${stats.reportedChange > 0 ? 'down' : 'up'}`}>
                {stats.reportedChange > 0 ? '+' : ''}
                {stats.reportedChange}%
              </span>
            ) : null}
          </span>
          <span className="metric-note">Against the previous {days} days</span>
        </div>

        <div className="metric">
          <span className="metric-label">Closed</span>
          <span className="metric-row">
            <span className="metric-value">{stats.resolutionRate}</span>
            <span className="metric-unit">%</span>
          </span>
          <span className="metric-note">
            {stats.resolved} of {stats.total} reports
          </span>
        </div>

        <div className="metric">
          <span className="metric-label">Typical time to close</span>
          <span className="metric-row">
            <span className="metric-value">
              {stats.medianHoursToClose === null ? '0' : Math.round(stats.medianHoursToClose)}
            </span>
            <span className="metric-unit">hours</span>
          </span>
          <span className="metric-note">{humanHours(stats.medianHoursToClose)} on median</span>
        </div>

        <div className="metric">
          <span className="metric-label">Verified members</span>
          <span className="metric-row">
            <span className="metric-value">{members.length + community.member_count}</span>
          </span>
          <span className="metric-note">{gateSum.dailyAverage} gate movements a day</span>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Reports over time</h2>
            <p className="panel-sub">
              {days > 31 ? 'Grouped by week' : 'Grouped by day'}
            </p>
          </div>
          <Legend series={REPORT_SERIES} />
        </div>
        <GroupedBarChart data={series} series={REPORT_SERIES} height={240} yLabel="Reports" />
      </section>

      <div className="grid-2">
        <section className="section">
          <div className="section-head">
            <h2>Outcomes</h2>
            <span className="mono">{stats.total} reports</span>
          </div>
          <ProportionBar parts={outcomes} />
        </section>

        <section className="section">
          <div className="section-head">
            <h2>What gets reported</h2>
            <button type="button" className="link" onClick={() => navigate('/insights')}>
              Full reporting
            </button>
          </div>
          <ul className="ledger">
            {byType.map((row) => (
              <li className="entry" key={row.label} style={{ padding: 'var(--s3) 0' }}>
                <span className="entry-title">{row.label}</span>
                <span className="entry-aside nums">{row.value}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {reviewDoc ? (
        <Modal
          title="Review application"
          onClose={() => setReviewDoc(null)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setReviewDoc(null)}>
                Close
              </button>
              <button type="button" className="btn btn-danger" onClick={() => decline(reviewDoc.id)}>
                Decline
              </button>
              <button type="button" className="btn btn-solid" onClick={() => approve(reviewDoc.id)}>
                Approve account
              </button>
            </>
          }
        >
          <div className="profile-head" style={{ paddingBottom: 'var(--s4)' }}>
            <Avatar name={reviewDoc.name} size="xl" ring />
            <div className="profile-id">
              <span className="profile-name" style={{ fontSize: 'var(--fs-xl)' }}>
                {reviewDoc.name}
              </span>
              <div className="profile-tags">
                <StatusBadge status="Pending Verification" />
              </div>
            </div>
          </div>

          <div className="details">
            <div className="details-row">
              <span className="details-label">Household</span>
              <span className="details-value">{reviewDoc.address}</span>
            </div>
            <div className="details-row">
              <span className="details-label">Email</span>
              <span className="details-value">{reviewDoc.email}</span>
            </div>
            <div className="details-row">
              <span className="details-label">Proof supplied</span>
              <span className="details-value">{reviewDoc.documentType}</span>
            </div>
            <div className="details-row">
              <span className="details-label">File</span>
              <span className="details-value masked">{reviewDoc.fileName}</span>
            </div>
            <div className="details-row">
              <span className="details-label">Uploaded</span>
              <span className="details-value">{reviewDoc.uploadedTime}</span>
            </div>
          </div>
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
              <button type="submit" form="notice-form" className="btn btn-solid">
                Publish
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
                required
              />
            </div>

            <div className="field field-wide">
              <label htmlFor="notice-priority">Priority</label>
              <select
                id="notice-priority"
                className="control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
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

      <GuardhouseVerificationModal
        isOpen={gateModalOpen}
        onClose={() => setGateModalOpen(false)}
        onLogEntry={(msg) => flash(msg)}
      />
    </div>
  );
}

export default AdminDashboard;
