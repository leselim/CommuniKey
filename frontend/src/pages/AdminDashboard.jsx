import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
import api, { unwrap } from '../services/api';
import {
  announcements as demoAnnouncements,
  community,
  incidents as demoIncidents,
  members as demoMembers,
} from '../services/demoData';

const PENDING_REGISTRATIONS = [
  {
    id: 101,
    name: 'Kobus van der Merwe',
    address: '29 Mill Road, Section B',
    email: 'kobus.vdm@riverside.co.za',
    documentType: 'Municipal Water Bill',
    fileName: 'WaterBill_29MillRd_Aug2026.pdf',
    uploadedTime: 'Yesterday at 16:40',
  },
  {
    id: 102,
    name: 'Amina Patel',
    address: '5 Riverside Drive, Section A',
    email: 'amina.patel@riverside.co.za',
    documentType: 'Lease Agreement',
    fileName: 'Lease_5RiversideDr_2026.pdf',
    uploadedTime: '2 days ago at 11:15',
  },
];

const FACILITY_BOOKINGS = [
  {
    id: 1,
    facility: 'Clubhouse Hall',
    bookedBy: 'Thabo Mokoena',
    date: '28 AUG (14:00 - 18:00)',
    time: '14:00 to 18:00',
    purpose: 'Family Gathering & Birthday Event',
    status: 'Approved',
  },
  {
    id: 2,
    facility: 'Tennis Court B',
    bookedBy: 'Sarah Jenkins',
    date: '25 AUG (09:00 - 11:00)',
    time: '09:00 to 11:00',
    purpose: 'Neighborhood Tournament Practice',
    status: 'Approved',
  },
];

const DEFAULT_AUDIT_LOGS = [
  { id: 1, timestamp: '2026-08-26 09:30', user_name: 'Marcus Vance', role: 'Estate Administrator', action: 'ANNOUNCEMENT_PUBLISHED', category: 'Announcements', status: 'Success', details: 'Published Neighbourhood Watch notice' },
  { id: 2, timestamp: '2026-08-26 08:15', user_name: 'Thabo Mokoena', role: 'Resident', action: 'INCIDENT_REPORTED', category: 'Incidents', status: 'Under Review', details: 'Reported streetlight fault on Mill Road' },
  { id: 3, timestamp: '2026-08-25 18:45', user_name: 'Sarah Jenkins', role: 'Safety Volunteer', action: 'SOS_TRIGGERED', category: 'Emergency', status: 'Resolved', details: 'Patrol dispatched to Section B' },
  { id: 4, timestamp: '2026-08-25 14:20', user_name: 'Kobus van der Merwe', role: 'Resident', action: 'USER_REGISTRATION', category: 'Membership', status: 'Pending Verification', details: 'Uploaded Municipal Water Bill' },
  { id: 5, timestamp: '2026-08-24 11:00', user_name: 'Marcus Vance', role: 'Estate Administrator', action: 'VERIFICATION_APPROVED', category: 'Membership', status: 'Approved', details: 'Approved Elena Rostova account' },
];

function AdminDashboard() {
  const { currentUser, userRole } = useAuth();

  const { items: incidentList } = useCollection('/incidents', demoIncidents);
  const { create: createAnnouncement } = useCollection('/announcements', demoAnnouncements);

  const [datePeriod, setDatePeriod] = useState('30d');
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  const [auditLogs, setAuditLogs] = useState(DEFAULT_AUDIT_LOGS);
  const [logSearch, setLogSearch] = useState('');
  const [logRoleFilter, setLogRoleFilter] = useState('All');
  const [logPage, setLogPage] = useState(1);

  const [pendingQueue, setPendingQueue] = useState(PENDING_REGISTRATIONS);
  const [bookingList, setBookingList] = useState(FACILITY_BOOKINGS);

  // Modals
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [reviewDocModal, setReviewDocModal] = useState(null);
  const [manageBookingModal, setManageBookingModal] = useState(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notice, setNotice] = useState('');

  // Fetch Analytics & Aggregations from Backend
  useEffect(() => {
    let isMounted = true;
    async function loadAnalytics() {
      setLoadingAnalytics(true);
      try {
        const res = await api.get(`/analytics/overview?period=${datePeriod}`);
        const data = unwrap(res);
        if (isMounted && data && data.metrics) {
          setAnalyticsData(data);
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        if (isMounted) setLoadingAnalytics(false);
      }
    }
    loadAnalytics();
    return () => { isMounted = false; };
  }, [datePeriod]);

  // Fetch Activity Logs
  useEffect(() => {
    let isMounted = true;
    async function loadLogs() {
      try {
        const res = await api.get(`/analytics/activity-logs?search=${encodeURIComponent(logSearch)}&role=${encodeURIComponent(logRoleFilter)}`);
        const data = unwrap(res);
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setAuditLogs(data);
        }
      } catch (err) {
        // Keep default fallback logs
      }
    }
    loadLogs();
    return () => { isMounted = false; };
  }, [logSearch, logRoleFilter]);

  const metrics = analyticsData?.metrics || {
    total_users: 248,
    user_growth_pct: 12.4,
    resolution_rate: 71.4,
    total_incidents: incidentList.length || 7,
    resolved_incidents: incidentList.filter((i) => i.status === 'Resolved').length || 5,
    incident_change_pct: 4.2,
    pending_verifications: pendingQueue.length,
    active_sos_alerts: 0,
    total_announcements: 3,
    total_events: 3,
  };

  const timeline = analyticsData?.activity_timeline || [
    { label: 'Aug 01', incidents: 4, announcements: 1, sos_alerts: 0, total_activity: 5 },
    { label: 'Aug 06', incidents: 8, announcements: 2, sos_alerts: 1, total_activity: 11 },
    { label: 'Aug 11', incidents: 5, announcements: 1, sos_alerts: 0, total_activity: 6 },
    { label: 'Aug 16', incidents: 12, announcements: 3, sos_alerts: 1, total_activity: 16 },
    { label: 'Aug 21', incidents: 9, announcements: 2, sos_alerts: 0, total_activity: 11 },
    { label: 'Aug 26', incidents: 7, announcements: 1, sos_alerts: 0, total_activity: 8 },
  ];

  const telemetry = analyticsData?.telemetry || {
    api_request_volume: '14,280 requests/day',
    api_success_rate: 99.8,
    avg_response_latency_ms: 42,
    error_rate_pct: 0.2,
    database_engine: 'PostgreSQL / SQLite Managed',
    db_connection_pool: '18 / 50 active',
    background_jobs_status: 'Healthy (0 queued, 142 processed)',
    data_pipeline_aggregation: 'Real-time server-side database view',
  };

  const roleDist = analyticsData?.role_distribution || [
    { role: 'Residents', count: 210, percentage: 84.7 },
    { role: 'Safety Volunteers', count: 32, percentage: 12.9 },
    { role: 'Estate Admins', count: 6, percentage: 2.4 },
  ];

  const handleApproveMember = (memberId) => {
    setPendingQueue((prev) => prev.filter((m) => m.id !== memberId));
    setReviewDocModal(null);
    setNotice('Resident account verified and granted full estate access.');
    setTimeout(() => setNotice(''), 4000);
  };

  const handleDeclineMember = (memberId) => {
    setPendingQueue((prev) => prev.filter((m) => m.id !== memberId));
    setReviewDocModal(null);
    setNotice('Resident registration application declined.');
    setTimeout(() => setNotice(''), 4000);
  };

  const handlePublishAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await createAnnouncement({
      title: title.trim(),
      content: content.trim(),
      priority,
      date_published: new Date().toISOString(),
      created_by: currentUser ? `${currentUser.first_name} ${currentUser.last_name} (Estate Admin)` : 'Estate Admin',
    });

    setTitle('');
    setContent('');
    setBroadcastModal(false);
    setNotice('Official estate broadcast published cleanly.');
    setTimeout(() => setNotice(''), 5000);
  };

  // Filtered Audit Logs Pagination
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user_name.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase());
    const matchesRole = logRoleFilter === 'All' || log.role === logRoleFilter;
    return matchesSearch && matchesRole;
  });

  const PAGE_SIZE = 4;
  const totalLogPages = Math.ceil(filteredLogs.length / PAGE_SIZE) || 1;
  const currentLogs = filteredLogs.slice((logPage - 1) * PAGE_SIZE, logPage * PAGE_SIZE);

  // SVG Activity Chart Dimensions & Scaling
  const maxActivityVal = Math.max(...timeline.map((t) => t.total_activity || 1), 15);
  const chartHeight = 160;
  const chartWidth = 520;

  return (
    <div className="stack" style={{ gap: 'var(--s5)' }}>
      {/* SECTION 1: Masthead & Controls */}
      <header className="masthead" style={{ borderBottom: '1px solid var(--line-hi)', paddingBottom: 'var(--s4)' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.72rem', letterSpacing: '0.06em' }}>
            ESTATE OPERATIONS & ANALYTICS CONTROL
          </p>
          <h1 style={{ fontSize: 'var(--fs-xl)', color: 'var(--paper)', margin: 'var(--s1) 0' }}>
            {community.community_name} Administrator Analytics
          </h1>
          <p className="masthead-meta" style={{ color: 'var(--dim)' }}>
            Authenticated as <strong>{currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Marcus Vance'}</strong> ({userRole || 'Estate Administrator'})
          </p>
        </div>

        {/* Date Filter & Action Cluster */}
        <div className="cluster" style={{ gap: 'var(--s3)', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Date Selector Pills */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--panel-hi)',
              border: '1px solid var(--line-hi)',
              borderRadius: '6px',
              padding: '2px',
              gap: '2px',
            }}
          >
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: '90d', label: 'Last 90 Days' },
              { id: 'year', label: 'This Year' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className="btn"
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: datePeriod === tab.id ? 'var(--signal)' : 'transparent',
                  color: datePeriod === tab.id ? '#ffffff' : 'var(--dim)',
                  fontWeight: datePeriod === tab.id ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onClick={() => setDatePeriod(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button type="button" className="btn btn-solid" onClick={() => setBroadcastModal(true)}>
            Draft & Publish Broadcast
          </button>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* SECTION 2: Top Summary Metrics Grid (4 Stat Cards) */}
      <div className="grid-4" style={{ gap: 'var(--s4)' }}>
        {/* Card 1: Registered Users */}
        <section className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
          <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            TOTAL REGISTERED USERS
          </p>
          <div className="cluster" style={{ justifyContent: 'space-between', marginTop: 'var(--s1)' }}>
            <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--paper)' }}>
              {metrics.total_users}
            </span>
            <span className="mono sm" style={{ fontSize: '0.75rem', color: 'var(--affirm)', fontWeight: 600 }}>
              +{metrics.user_growth_pct}% vs prev period
            </span>
          </div>
          <p className="sm faint" style={{ color: 'var(--dim)', margin: 'var(--s2) 0 0 0', fontSize: '0.75rem' }}>
            Verified Estate Residents & Personnel
          </p>
        </section>

        {/* Card 2: Incident Resolution */}
        <section className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
          <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            INCIDENT RESOLUTION RATE
          </p>
          <div className="cluster" style={{ justifyContent: 'space-between', marginTop: 'var(--s1)' }}>
            <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--paper)' }}>
              {metrics.resolution_rate}%
            </span>
            <span className="mono sm" style={{ fontSize: '0.75rem', color: 'var(--affirm)', fontWeight: 600 }}>
              +{metrics.incident_change_pct}% resolved
            </span>
          </div>

          <div
            style={{
              height: '8px',
              width: '100%',
              backgroundColor: 'var(--ink)',
              border: '1px solid var(--line-hi)',
              borderRadius: '9999px',
              overflow: 'hidden',
              marginTop: 'var(--s2)',
            }}
          >
            <div
              style={{
                width: `${metrics.resolution_rate}%`,
                height: '100%',
                backgroundColor: 'var(--signal)',
                borderRadius: '9999px',
              }}
            />
          </div>
        </section>

        {/* Card 3: Active SOS Alerts */}
        <section className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
          <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            EMERGENCY SOS STATUS
          </p>
          <div className="cluster" style={{ justifyContent: 'space-between', marginTop: 'var(--s1)' }}>
            <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--paper)' }}>
              {metrics.active_sos_alerts} Active
            </span>
            <span className="mono sm faint" style={{ fontSize: '0.75rem', color: 'var(--dim)' }}>
              100% Patrol Coverage
            </span>
          </div>
          <p className="sm faint" style={{ color: 'var(--dim)', margin: 'var(--s2) 0 0 0', fontSize: '0.75rem' }}>
            Night Patrol Response Window: 4 mins
          </p>
        </section>

        {/* Card 4: Pending Verification Queue */}
        <section className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
          <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            VERIFICATION QUEUE
          </p>
          <div className="cluster" style={{ justifyContent: 'space-between', marginTop: 'var(--s1)' }}>
            <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--paper)' }}>
              {pendingQueue.length} Applications
            </span>
            <span className="mono sm faint" style={{ fontSize: '0.75rem', color: 'var(--dim)' }}>
              ID & Lease Verification
            </span>
          </div>
          <p className="sm faint" style={{ color: 'var(--dim)', margin: 'var(--s2) 0 0 0', fontSize: '0.75rem' }}>
            Awaiting Admin document review
          </p>
        </section>
      </div>

      {/* SECTION 3: Main Visualizations Layout (2 Columns: Chart + Side Telemetry) */}
      <div className="grid-2" style={{ gap: 'var(--s5)', gridTemplateColumns: '1.6fr 1fr' }}>
        {/* Main Chart Column: Platform Activity Bar & Trend Chart */}
        <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
          <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s4)' }}>
            <div>
              <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.68rem', fontWeight: 600 }}>
                PLATFORM ACTIVITY ANALYTICS
              </p>
              <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                System Operations & Event Volume Over Time ({datePeriod.toUpperCase()})
              </h2>
            </div>
            <div className="cluster" style={{ gap: 'var(--s3)', fontSize: '0.75rem' }}>
              <span className="cluster" style={{ gap: '4px', color: 'var(--dim)' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--signal)', borderRadius: '2px', display: 'inline-block' }} /> Total Activity
              </span>
              <span className="cluster" style={{ gap: '4px', color: 'var(--dim)' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#929894', borderRadius: '2px', display: 'inline-block' }} /> Incidents Logged
              </span>
            </div>
          </div>

          {loadingAnalytics ? (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p className="sm faint">Aggregating server-side analytics metrics...</p>
            </div>
          ) : (
            <div style={{ width: '100%', overflowX: 'auto' }}>
              {/* SVG Bar Chart Visualization */}
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '190px' }}>
                {/* Horizontal Grid lines */}
                {[0, 0.33, 0.66, 1].map((pct, idx) => (
                  <line
                    key={idx}
                    x1="40"
                    y1={chartHeight - 30 - pct * (chartHeight - 50)}
                    x2={chartWidth - 10}
                    y2={chartHeight - 30 - pct * (chartHeight - 50)}
                    stroke="var(--line-hi)"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                ))}

                {/* Bars & Lines */}
                {timeline.map((item, idx) => {
                  const xStep = (chartWidth - 60) / Math.max(1, timeline.length);
                  const x = 50 + idx * xStep;
                  const barWidth = Math.min(32, xStep * 0.45);

                  const totalH = ((item.total_activity || 0) / maxActivityVal) * (chartHeight - 50);
                  const incH = ((item.incidents || 0) / maxActivityVal) * (chartHeight - 50);

                  return (
                    <g key={idx}>
                      {/* Total Activity Bar */}
                      <rect
                        x={x}
                        y={chartHeight - 30 - totalH}
                        width={barWidth}
                        height={totalH}
                        fill="var(--signal)"
                        rx="3"
                        opacity="0.85"
                      />
                      {/* Incidents Sub-Bar */}
                      <rect
                        x={x + barWidth + 4}
                        y={chartHeight - 30 - incH}
                        width={Math.max(4, barWidth * 0.5)}
                        height={incH}
                        fill="#929894"
                        rx="2"
                        opacity="0.6"
                      />

                      {/* X-Axis Label */}
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight - 10}
                        fontSize="10"
                        fill="var(--dim)"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {item.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </section>

        {/* Side Column: Role Distribution & Data Engineering Telemetry */}
        <div className="stack" style={{ gap: 'var(--s4)' }}>
          {/* Widget 1: User Distribution by Role */}
          <section className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
            <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 'var(--s2)' }}>
              USER ROLE DISTRIBUTION
            </p>
            <div className="stack" style={{ gap: 'var(--s2)' }}>
              {roleDist.map((r, idx) => (
                <div key={idx} className="stack" style={{ gap: '4px' }}>
                  <div className="cluster" style={{ justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--paper)', fontWeight: 500 }}>{r.role}</span>
                    <span className="mono faint" style={{ color: 'var(--dim)' }}>
                      {r.count} ({r.percentage}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      width: '100%',
                      backgroundColor: 'var(--ink)',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${r.percentage}%`,
                        height: '100%',
                        backgroundColor: idx === 0 ? 'var(--signal)' : idx === 1 ? '#3b6a9c' : '#929894',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Widget 2: Operational Telemetry (Cloud & Data Engineering Readiness) */}
          <section className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
            <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
              <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em', margin: 0 }}>
                CLOUD & TELEMETRY INDICATORS
              </p>
              <span className="mono sm" style={{ fontSize: '0.68rem', color: 'var(--affirm)' }}>
                SYSTEM HEALTHY
              </span>
            </div>

            <ul className="stack" style={{ gap: 'var(--s2)', padding: 0, margin: 0, listStyle: 'none' }}>
              <li className="cluster" style={{ justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid var(--line-hi)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--dim)' }}>API Request Volume:</span>
                <strong className="mono" style={{ color: 'var(--paper)' }}>{telemetry.api_request_volume}</strong>
              </li>
              <li className="cluster" style={{ justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid var(--line-hi)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--dim)' }}>API Latency & Success Rate:</span>
                <strong className="mono" style={{ color: 'var(--paper)' }}>{telemetry.avg_response_latency_ms}ms ({telemetry.api_success_rate}%)</strong>
              </li>
              <li className="cluster" style={{ justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid var(--line-hi)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--dim)' }}>DB Connection Pool:</span>
                <strong className="mono" style={{ color: 'var(--paper)' }}>{telemetry.db_connection_pool}</strong>
              </li>
              <li className="cluster" style={{ justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--dim)' }}>Aggregation Pipeline:</span>
                <strong className="mono" style={{ color: 'var(--signal)' }}>Server Database View</strong>
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* SECTION 4: Operations Grid (Resident Verification Queue & Venue Schedule) */}
      <div className="grid-2" style={{ gap: 'var(--s5)' }}>
        {/* Resident Verification */}
        <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
          <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
            <div>
              <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                RESIDENT MODERATION
              </p>
              <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                Pending Verification Queue ({pendingQueue.length})
              </h2>
            </div>
          </div>

          {pendingQueue.length === 0 ? (
            <p className="blank">All resident verification applications processed.</p>
          ) : (
            <ul className="ledger">
              {pendingQueue.map((m) => (
                <li className="entry" key={m.id} style={{ display: 'block', padding: 'var(--s3) 0', borderBottom: '1px solid var(--line-hi)' }}>
                  <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--paper)' }}>
                      {m.name}
                    </strong>
                    <div className="cluster" style={{ gap: 'var(--s2)' }}>
                      <button
                        type="button"
                        className="btn"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => setReviewDocModal(m)}
                      >
                        Review Document
                      </button>
                      <button
                        type="button"
                        className="btn btn-solid"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleApproveMember(m.id)}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                  <p className="sm faint" style={{ color: 'var(--dim)', margin: 0 }}>
                    {m.address} • Document: <strong>{m.documentType}</strong>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Facility Schedule */}
        <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
          <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
            <div>
              <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                FACILITY BOOKINGS
              </p>
              <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                Clubhouse & Venue Schedule
              </h2>
            </div>
          </div>

          <ul className="ledger">
            {bookingList.map((b) => (
              <li className="entry" key={b.id} style={{ display: 'block', padding: 'var(--s3) 0', borderBottom: '1px solid var(--line-hi)' }}>
                <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div>
                    <h3 className="entry-title" style={{ margin: 0, fontSize: 'var(--fs-sm)' }}>
                      {b.facility}
                    </h3>
                    <p className="entry-body sm faint" style={{ color: 'var(--dim)', margin: '2px 0 0 0' }}>
                      Booked by {b.bookedBy} • {b.date}
                    </p>
                  </div>
                  <div className="cluster" style={{ gap: 'var(--s2)' }}>
                    <StatusBadge status={b.status} />
                    <button
                      type="button"
                      className="btn"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => setManageBookingModal(b)}
                    >
                      Manage Booking
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* SECTION 5: Operational Administrative Activity Ledger Table */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
        <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s4)', flexWrap: 'wrap', gap: 'var(--s3)' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              ADMINISTRATIVE AUDIT LOG
            </p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
              Recent Platform Operations & Event Ledger
            </h2>
          </div>

          {/* Filters & Search */}
          <div className="cluster" style={{ gap: 'var(--s3)' }}>
            <input
              className="control"
              placeholder="Search activity logs..."
              value={logSearch}
              onChange={(e) => { setLogSearch(e.target.value); setLogPage(1); }}
              style={{ width: '180px', fontSize: '0.8rem', padding: '0.35rem 0.55rem' }}
            />

            <select
              className="control"
              value={logRoleFilter}
              onChange={(e) => { setLogRoleFilter(e.target.value); setLogPage(1); }}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.55rem', color: 'var(--paper)', backgroundColor: 'var(--ink)' }}
            >
              <option value="All">All Roles</option>
              <option value="Estate Administrator">Estate Administrator</option>
              <option value="Resident">Resident</option>
              <option value="Safety Volunteer">Safety Volunteer</option>
            </select>
          </div>
        </div>

        {currentLogs.length === 0 ? (
          <p className="blank">No activity logs match the selected filters.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line-hi)', color: 'var(--dim)' }}>
                  <th style={{ padding: 'var(--s2) var(--s3)', fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: 'var(--s2) var(--s3)', fontWeight: 600 }}>User</th>
                  <th style={{ padding: 'var(--s2) var(--s3)', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: 'var(--s2) var(--s3)', fontWeight: 600 }}>Action</th>
                  <th style={{ padding: 'var(--s2) var(--s3)', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: 'var(--s2) var(--s3)', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--line-hi)' }}>
                    <td className="mono faint" style={{ padding: 'var(--s3)', color: 'var(--dim)' }}>
                      {log.timestamp}
                    </td>
                    <td style={{ padding: 'var(--s3)', color: 'var(--paper)', fontWeight: 500 }}>
                      {log.user_name}
                    </td>
                    <td style={{ padding: 'var(--s3)', color: 'var(--dim)' }}>
                      {log.role}
                    </td>
                    <td className="mono sm" style={{ padding: 'var(--s3)', color: 'var(--signal)' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: 'var(--s3)', color: 'var(--dim)' }}>
                      {log.category}
                    </td>
                    <td style={{ padding: 'var(--s3)' }}>
                      <StatusBadge status={log.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalLogPages > 1 ? (
          <div className="cluster" style={{ justifyContent: 'space-between', marginTop: 'var(--s3)', fontSize: '0.8rem' }}>
            <span className="mono faint" style={{ color: 'var(--dim)' }}>
              Page {logPage} of {totalLogPages} ({filteredLogs.length} total entries)
            </span>
            <div className="cluster" style={{ gap: 'var(--s2)' }}>
              <button
                type="button"
                className="btn"
                disabled={logPage === 1}
                onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn"
                disabled={logPage === totalLogPages}
                onClick={() => setLogPage((p) => Math.min(totalLogPages, p + 1))}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* MODAL 1: REVIEW DOCUMENT MODAL */}
      {reviewDocModal ? (
        <Modal
          title={`Review Verification Documents (${reviewDocModal.name})`}
          onClose={() => setReviewDocModal(null)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setReviewDocModal(null)}>
                Close Preview
              </button>
              <button
                type="button"
                className="btn"
                style={{ borderColor: 'var(--line-hi)' }}
                onClick={() => handleDeclineMember(reviewDocModal.id)}
              >
                Decline Application
              </button>
              <button
                type="button"
                className="btn btn-solid"
                onClick={() => handleApproveMember(reviewDocModal.id)}
              >
                Approve Account
              </button>
            </>
          }
        >
          <div className="stack" style={{ gap: 'var(--s3)' }}>
            <div style={{ padding: 'var(--s4)', backgroundColor: 'var(--panel-hi)', border: '1px solid var(--line-hi)' }}>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Resident Name:</strong> {reviewDocModal.name}
              </p>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Household Address:</strong> {reviewDocModal.address}
              </p>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Uploaded Document:</strong> {reviewDocModal.documentType} ({reviewDocModal.fileName})
              </p>
              <p className="mono sm faint" style={{ color: 'var(--dim)', margin: 0 }}>
                Submission Timestamp: {reviewDocModal.uploadedTime}
              </p>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* MODAL 2: MANAGE BOOKING MODAL */}
      {manageBookingModal ? (
        <Modal
          title={`Manage Venue Booking (${manageBookingModal.facility})`}
          onClose={() => setManageBookingModal(null)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setManageBookingModal(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-solid"
                onClick={() => {
                  setNotice(`Booking for ${manageBookingModal.facility} confirmed.`);
                  setManageBookingModal(null);
                  setTimeout(() => setNotice(''), 4000);
                }}
              >
                Confirm Booking
              </button>
            </>
          }
        >
          <div className="stack" style={{ gap: 'var(--s3)' }}>
            <div style={{ padding: 'var(--s4)', backgroundColor: 'var(--panel-hi)', border: '1px solid var(--line-hi)' }}>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Facility:</strong> {manageBookingModal.facility}
              </p>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Booked By:</strong> {manageBookingModal.bookedBy}
              </p>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Time Window:</strong> {manageBookingModal.date}
              </p>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* MODAL 3: BROADCAST PUBLISHING MODAL */}
      {broadcastModal ? (
        <Modal
          title="Draft & Publish Estate Broadcast Notice"
          onClose={() => setBroadcastModal(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setBroadcastModal(false)}>
                Cancel
              </button>
              <button type="submit" form="broadcast-form" className="btn btn-solid">
                Publish Broadcast
              </button>
            </>
          }
        >
          <form id="broadcast-form" onSubmit={handlePublishAnnouncement} className="stack" style={{ gap: 'var(--s4)' }}>
            <div className="field">
              <label className="eyebrow" htmlFor="anc-title">
                Broadcast Title *
              </label>
              <input
                id="anc-title"
                className="control"
                placeholder="e.g., Planned Water Interruption Notice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="eyebrow" htmlFor="anc-priority">
                Priority Level
              </label>
              <select
                id="anc-priority"
                className="control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ color: 'var(--paper)', backgroundColor: 'var(--ink)' }}
              >
                <option value="normal">Normal Announcement</option>
                <option value="high">High Priority Alert</option>
              </select>
            </div>

            <div className="field">
              <label className="eyebrow" htmlFor="anc-content">
                Notice Content *
              </label>
              <textarea
                id="anc-content"
                className="control"
                rows={4}
                placeholder="Write official notice details for residents..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

export default AdminDashboard;
