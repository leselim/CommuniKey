import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import GuardhouseVerificationModal from '../components/GuardhouseVerificationModal';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
import api, { unwrap } from '../services/api';
import {
  announcements as demoAnnouncements,
  community,
  incidents as demoIncidents,
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

const DEFAULT_AUDIT_LOGS = [
  { id: 1, timestamp: '2026-08-26 09:30', user_name: 'Marcus Vance', role: 'Estate Administrator', action: 'ANNOUNCEMENT_PUBLISHED', category: 'Announcements', status: 'Success', details: 'Published Neighbourhood Watch notice' },
  { id: 2, timestamp: '2026-08-26 08:15', user_name: 'Thabo Mokoena', role: 'Resident', action: 'INCIDENT_REPORTED', category: 'Incidents', status: 'Under Review', details: 'Reported streetlight fault on Mill Road' },
  { id: 3, timestamp: '2026-08-25 18:45', user_name: 'Sarah Jenkins', role: 'Safety Volunteer', action: 'SOS_TRIGGERED', category: 'Emergency', status: 'Resolved', details: 'Patrol dispatched to Section B' },
  { id: 4, timestamp: '2026-08-25 14:20', user_name: 'Kobus van der Merwe', role: 'Resident', action: 'USER_REGISTRATION', category: 'Membership', status: 'Pending Verification', details: 'Uploaded Municipal Water Bill' },
  { id: 5, timestamp: '2026-08-24 11:00', user_name: 'Marcus Vance', role: 'Estate Administrator', action: 'VERIFICATION_APPROVED', category: 'Membership', status: 'Approved', details: 'Approved Elena Rostova account' },
];

function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const { items: incidentList } = useCollection('/incidents', demoIncidents);
  const { create: createAnnouncement } = useCollection('/announcements', demoAnnouncements);

  const [datePeriod, setDatePeriod] = useState('30d');
  const [granularity, setGranularity] = useState('daily');
  const [customRange, setCustomRange] = useState({ start: '2026-08-01', end: '2026-08-26' });
  const [customModalOpen, setCustomModalOpen] = useState(false);

  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  const [auditLogs, setAuditLogs] = useState(DEFAULT_AUDIT_LOGS);
  const [logSearch, setLogSearch] = useState('');
  const [logRoleFilter, setLogRoleFilter] = useState('All');
  const [logPage, setLogPage] = useState(1);

  const [pendingQueue, setPendingQueue] = useState(PENDING_REGISTRATIONS);

  // Modals
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [reviewDocModal, setReviewDocModal] = useState(null);
  const [guardhouseModalOpen, setGuardhouseModalOpen] = useState(false);

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
        let url = `/analytics/overview?period=${datePeriod}&granularity=${granularity}`;
        if (datePeriod === 'custom') {
          url += `&start_date=${customRange.start}&end_date=${customRange.end}`;
        }
        const res = await api.get(url);
        const data = unwrap(res);
        if (isMounted && data && data.metrics) {
          setAnalyticsData(data);
          if (data.granularity && !granularity) {
            setGranularity(data.granularity);
          }
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        if (isMounted) setLoadingAnalytics(false);
      }
    }
    loadAnalytics();
    return () => { isMounted = false; };
  }, [datePeriod, granularity, customRange]);

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

  const PERIOD_LABELS = {
    today: '26 Aug 2026',
    yesterday: '25 Aug 2026',
    '7d': '20 Aug 2026 – 26 Aug 2026',
    '30d': '28 Jul 2026 – 26 Aug 2026',
    '90d': '28 May 2026 – 26 Aug 2026',
    year: '01 Jan 2026 – 26 Aug 2026',
  };

  const METRICS_BY_PERIOD = {
    today: {
      total_users: 248,
      user_subtitle: '4 new registrations today',
      user_growth_pct: 1.8,
      resolution_rate: 96.4,
      incident_subtitle: '+1.8% resolved today',
      incident_change_pct: 1.8,
      active_sos_alerts: 0,
      sos_subtitle: 'Night Patrol Response: 3.8 mins',
      active_gate_passes: 18,
      open_incidents: 1,
      resolved_incidents: 6,
      total_incidents: 7,
    },
    yesterday: {
      total_users: 244,
      user_subtitle: '6 new registrations yesterday',
      user_growth_pct: 2.4,
      resolution_rate: 94.2,
      incident_subtitle: '+2.4% resolved yesterday',
      incident_change_pct: 2.4,
      active_sos_alerts: 1,
      sos_subtitle: 'Night Patrol Response: 4.1 mins',
      active_gate_passes: 24,
      open_incidents: 2,
      resolved_incidents: 8,
      total_incidents: 10,
    },
    '7d': {
      total_users: 248,
      user_subtitle: '28 new registrations (7 days)',
      user_growth_pct: 5.2,
      resolution_rate: 95.8,
      incident_subtitle: '+5.2% resolved (7d)',
      incident_change_pct: 5.2,
      active_sos_alerts: 1,
      sos_subtitle: 'Avg Response Time: 4.2 mins',
      active_gate_passes: 142,
      open_incidents: 2,
      resolved_incidents: 24,
      total_incidents: 26,
    },
    '30d': {
      total_users: 248,
      user_subtitle: 'vs previous period • Verified Residents & Staff',
      user_growth_pct: 12.4,
      resolution_rate: 96.4,
      incident_subtitle: '+12.4% resolved',
      incident_change_pct: 12.4,
      active_sos_alerts: 1,
      sos_subtitle: 'Night Patrol Avg Response: 4.5 mins',
      active_gate_passes: 580,
      open_incidents: 2,
      resolved_incidents: 52,
      total_incidents: 54,
    },
    '90d': {
      total_users: 215,
      user_subtitle: '215 active members (90 days)',
      user_growth_pct: 18.6,
      resolution_rate: 91.2,
      incident_subtitle: '+18.6% resolved',
      incident_change_pct: 18.6,
      active_sos_alerts: 2,
      sos_subtitle: 'Avg Response Time: 5.4 mins',
      active_gate_passes: 1840,
      open_incidents: 5,
      resolved_incidents: 112,
      total_incidents: 117,
    },
    year: {
      total_users: 248,
      user_subtitle: '248 registered users (this year)',
      user_growth_pct: 42.0,
      resolution_rate: 88.2,
      incident_subtitle: '+42.0% resolved (annual)',
      incident_change_pct: 42.0,
      active_sos_alerts: 4,
      sos_subtitle: 'Annual Avg Response: 6.8 mins',
      active_gate_passes: 4210,
      open_incidents: 8,
      resolved_incidents: 380,
      total_incidents: 388,
    },
  };

  const metrics = analyticsData?.metrics || METRICS_BY_PERIOD[datePeriod] || METRICS_BY_PERIOD['30d'];

  const TIMELINE_BY_GRANULARITY = {
    hourly: Array.from({ length: 24 }, (_, i) => {
      const hourStr = String(i).padStart(2, '0') + ':00';
      // Morning commute (07:00-09:00) and evening commute (17:00-19:00) traffic volume peaks
      let gateVolume = 12;
      if (i >= 7 && i <= 9) gateVolume = 68 + (i % 2) * 12;
      else if (i >= 17 && i <= 19) gateVolume = 84 + (i % 2) * 8;
      else if (i >= 10 && i <= 16) gateVolume = 32 + (i % 3) * 6;
      else if (i >= 20 || i <= 5) gateVolume = 8 + (i % 2) * 4;

      const incidents = i === 8 || i === 14 || i === 18 ? 1 : 0;
      return {
        label: i % 4 === 0 ? hourStr : '',
        fullLabel: hourStr,
        gate_volume: gateVolume,
        incidents,
      };
    }),

    daily: [
      { label: 'Mon', fullLabel: 'Monday', gate_volume: 340, incidents: 4 },
      { label: 'Tue', fullLabel: 'Tuesday', gate_volume: 410, incidents: 6 },
      { label: 'Wed', fullLabel: 'Wednesday', gate_volume: 380, incidents: 3 },
      { label: 'Thu', fullLabel: 'Thursday', gate_volume: 460, incidents: 8 },
      { label: 'Fri', fullLabel: 'Friday', gate_volume: 520, incidents: 5 },
      { label: 'Sat', fullLabel: 'Saturday', gate_volume: 590, incidents: 9 },
      { label: 'Sun', fullLabel: 'Sunday', gate_volume: 480, incidents: 2 },
    ],

    weekly: [
      { label: 'Week 1', fullLabel: 'Week 1', gate_volume: 2450, incidents: 18 },
      { label: 'Week 2', fullLabel: 'Week 2', gate_volume: 2680, incidents: 24 },
      { label: 'Week 3', fullLabel: 'Week 3', gate_volume: 2910, incidents: 19 },
      { label: 'Week 4', fullLabel: 'Week 4', gate_volume: 3100, incidents: 31 },
    ],

    monthly: [
      { label: 'Jan', fullLabel: 'January 2026', gate_volume: 11200, incidents: 84 },
      { label: 'Feb', fullLabel: 'February 2026', gate_volume: 10800, incidents: 76 },
      { label: 'Mar', fullLabel: 'March 2026', gate_volume: 12400, incidents: 92 },
      { label: 'Apr', fullLabel: 'April 2026', gate_volume: 11900, incidents: 68 },
      { label: 'May', fullLabel: 'May 2026', gate_volume: 13100, incidents: 88 },
      { label: 'Jun', fullLabel: 'June 2026', gate_volume: 12800, incidents: 74 },
      { label: 'Jul', fullLabel: 'July 2026', gate_volume: 13600, incidents: 95 },
      { label: 'Aug', fullLabel: 'August 2026', gate_volume: 14200, incidents: 82 },
    ],
  };

  const activeTimelineData = TIMELINE_BY_GRANULARITY[granularity] || TIMELINE_BY_GRANULARITY.daily;

  const telemetry = analyticsData?.telemetry || {
    api_request_volume: '14,280 requests/day',
    api_success_rate: 99.8,
    avg_response_latency_ms: 42,
    database_engine: 'PostgreSQL / SQLite Managed',
    db_connection_pool: '18 / 50 active',
    data_pipeline_aggregation: 'Server-side view query',
  };

  const roleDist = analyticsData?.role_distribution || [
    { role: 'Residents', count: 210, percentage: 84.7 },
    { role: 'Safety Volunteers', count: 32, percentage: 12.9 },
    { role: 'Estate Admins', count: 6, percentage: 2.4 },
  ];

  const attentionItems = analyticsData?.attention_items || [
    { id: 1, type: 'Pending Verification', severity: 'medium', title: `${pendingQueue.length} Resident Applications`, description: 'Verification documents awaiting review.', link: '/admin/moderation' },
    { id: 2, type: 'Open Incidents', severity: 'low', title: `${metrics.open_incidents} Unresolved Incidents`, description: 'Incidents logged on Riverside Drive.', link: '/admin/incidents' },
  ];

  const dateRangeDisplay = datePeriod === 'custom'
    ? `${customRange.start} – ${customRange.end}`
    : analyticsData?.date_range?.label || PERIOD_LABELS[datePeriod] || '28 Jul 2026 – 26 Aug 2026';

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

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Category', 'Status', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.user_name}"`,
      `"${l.role}"`,
      `"${l.action}"`,
      `"${l.category}"`,
      `"${l.status}"`,
      `"${l.details}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_ledger_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotice('Audit ledger exported to CSV successfully.');
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

  // SVG Activity Chart Dimensions
  const maxActivityVal = Math.max(...(activeTimelineData || []).map((t) => t.gate_volume || t.total_activity || 1), 15);
  const chartHeight = 160;
  const chartWidth = 520;

  return (
    <div className="stack" style={{ gap: 'var(--s5)' }}>
      {/* SECTION 1: Clean Administrator Header */}
      <header className="masthead" style={{ borderBottom: '1px solid var(--line-hi)', paddingBottom: 'var(--s4)' }}>
        <div>
          <p className="eyebrow" style={{ fontSize: '0.72rem', letterSpacing: '0.06em' }}>
            {community.community_name.toUpperCase()}
          </p>
          <h1 style={{ fontSize: 'var(--fs-xl)', color: 'var(--paper)', margin: 'var(--s1) 0' }}>
            Administrator Dashboard
          </h1>
          <p className="masthead-meta" style={{ color: 'var(--dim)' }}>
            Monitor operations, platform activity, and community performance.
          </p>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* SECTION 2: Dedicated Quick Actions Bar */}
      <section className="panel" style={{ padding: 'var(--s3) var(--s4)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel-hi)' }}>
        <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--s3)' }}>
          <span className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            QUICK ACTIONS
          </span>
          <div className="cluster" style={{ gap: 'var(--s2)', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-solid" style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }} onClick={() => setBroadcastModal(true)}>
              Draft & Publish Broadcast
            </button>
            <button type="button" className="btn" style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }} onClick={() => setGuardhouseModalOpen(true)}>
              Verify Gate Pass
            </button>
            <button type="button" className="btn" style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }} onClick={() => navigate('/admin/incidents')}>
              Incident Triage
            </button>
            <button type="button" className="btn" style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }} onClick={() => navigate('/admin/moderation')}>
              Member Verification
            </button>
            <button type="button" className="btn" style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }} onClick={() => navigate('/admin/events')}>
              Schedule Event
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: Analytics Controls (Date Range & Time Granularity) */}
      <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--s3)', backgroundColor: 'var(--panel)', padding: 'var(--s3) var(--s4)', border: '1px solid var(--line-hi)', borderRadius: '4px' }}>
        {/* Left: Active Date Range Label & Period Tabs */}
        <div className="cluster" style={{ gap: 'var(--s3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="mono sm" style={{ color: 'var(--paper)', fontSize: '0.75rem', fontWeight: 600 }}>
            {dateRangeDisplay}
          </span>

          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--ink)',
              border: '1px solid var(--line-hi)',
              borderRadius: '4px',
              padding: '2px',
              gap: '2px',
            }}
          >
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: '90d', label: 'Last 90 Days' },
              { id: 'year', label: 'This Year' },
              { id: 'custom', label: 'Custom Range' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className="btn"
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.72rem',
                  border: 'none',
                  borderRadius: '3px',
                  backgroundColor: datePeriod === tab.id ? 'var(--signal)' : 'transparent',
                  color: datePeriod === tab.id ? '#ffffff' : 'var(--dim)',
                  fontWeight: datePeriod === tab.id ? 600 : 400,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setDatePeriod(tab.id);
                  if (tab.id === 'custom') setCustomModalOpen(true);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Time Granularity Controls */}
        <div className="cluster" style={{ gap: 'var(--s2)', alignItems: 'center' }}>
          <span className="eyebrow faint" style={{ fontSize: '0.65rem', color: 'var(--dim)' }}>
            GRANULARITY:
          </span>
          <div style={{ display: 'inline-flex', backgroundColor: 'var(--ink)', border: '1px solid var(--line-hi)', borderRadius: '4px', padding: '2px', gap: '2px' }}>
            {['hourly', 'daily', 'weekly', 'monthly'].map((g) => (
              <button
                key={g}
                type="button"
                style={{
                  padding: '0.2rem 0.45rem',
                  fontSize: '0.7rem',
                  border: 'none',
                  borderRadius: '3px',
                  backgroundColor: granularity === g ? 'var(--panel-hi)' : 'transparent',
                  color: granularity === g ? 'var(--paper)' : 'var(--dim)',
                  fontWeight: granularity === g ? 600 : 400,
                  cursor: 'pointer',
                }}
                onClick={() => setGranularity(g)}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Compact Summary Metric Cards (Interactive Entry Points) */}
      <div className="grid-4" style={{ gap: 'var(--s4)' }}>
        {/* Card 1: Registered Users */}
        <div
          className="panel"
          style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)', cursor: 'pointer' }}
          onClick={() => navigate('/admin/moderation')}
        >
          <p className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            TOTAL REGISTERED USERS
          </p>
          <div className="cluster" style={{ justifyContent: 'space-between', marginTop: 'var(--s1)' }}>
            <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--paper)' }}>
              {metrics.total_users}
            </span>
            <span className="mono sm" style={{ fontSize: '0.72rem', color: 'var(--affirm)', fontWeight: 600 }}>
              +{metrics.user_growth_pct}%
            </span>
          </div>
          <p className="sm faint" style={{ color: 'var(--dim)', margin: 'var(--s1) 0 0 0', fontSize: '0.72rem' }}>
            {metrics.user_subtitle || 'vs previous period • Verified Residents & Staff'}
          </p>
        </div>

        {/* Card 2: Incident Resolution */}
        <div
          className="panel"
          style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)', cursor: 'pointer' }}
          onClick={() => navigate('/admin/incidents')}
        >
          <p className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            INCIDENT RESOLUTION RATE
          </p>
          <div className="cluster" style={{ justifyContent: 'space-between', marginTop: 'var(--s1)' }}>
            <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--paper)' }}>
              {metrics.resolution_rate}%
            </span>
            <span className="mono sm" style={{ fontSize: '0.72rem', color: 'var(--affirm)', fontWeight: 600 }}>
              +{metrics.incident_change_pct}% resolved
            </span>
          </div>
          <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--ink)', borderRadius: '9999px', overflow: 'hidden', marginTop: 'var(--s2)' }}>
            <div style={{ width: `${metrics.resolution_rate}%`, height: '100%', backgroundColor: 'var(--signal)' }} />
          </div>
          <p className="sm faint" style={{ color: 'var(--dim)', margin: 'var(--s1) 0 0 0', fontSize: '0.72rem' }}>
            {metrics.incident_subtitle || 'Incidents logged & dispatched'}
          </p>
        </div>

        {/* Card 3: Emergency SOS Status */}
        <div
          className="panel"
          style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)', cursor: 'pointer' }}
          onClick={() => navigate('/volunteer/triage')}
        >
          <p className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            EMERGENCY SOS STATUS
          </p>
          <div className="cluster" style={{ justifyContent: 'space-between', marginTop: 'var(--s1)' }}>
            <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--paper)' }}>
              {metrics.active_sos_alerts} Active
            </span>
            <span className="mono sm" style={{ fontSize: '0.72rem', color: 'var(--affirm)' }}>
              100% Coverage
            </span>
          </div>
          <p className="sm faint" style={{ color: 'var(--dim)', margin: 'var(--s1) 0 0 0', fontSize: '0.72rem' }}>
            {metrics.sos_subtitle || 'Night Patrol Avg Response: 4.5 mins'}
          </p>
        </div>

        {/* Card 4: Active Gate Passes Issued */}
        <div
          className="panel"
          style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)', cursor: 'pointer' }}
          onClick={() => navigate('/admin/moderation')}
        >
          <p className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            ACTIVE GATE PASSES ISSUED
          </p>
          <div className="cluster" style={{ justifyContent: 'space-between', marginTop: 'var(--s1)' }}>
            <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--paper)' }}>
              {(metrics.active_gate_passes || 580).toLocaleString()} Passes
            </span>
            <span className="mono sm faint" style={{ fontSize: '0.72rem', color: 'var(--dim)' }}>
              {pendingQueue.length} Pending ID
            </span>
          </div>
          <p className="sm faint" style={{ color: 'var(--dim)', margin: 'var(--s1) 0 0 0', fontSize: '0.72rem' }}>
            Validated at Main Guardhouse
          </p>
        </div>
      </div>

      {/* SECTION 5: Visual Analytics Grid (Activity & Traffic Trends Chart + Side Widgets) */}
      <div className="grid-2" style={{ gap: 'var(--s5)', gridTemplateColumns: '1.6fr 1fr' }}>
        {/* Main Time-Series Chart */}
        <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
          <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s4)' }}>
            <div>
              <p className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                ESTATE ACTIVITY & TRAFFIC TRENDS
              </p>
              <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                Operational Volume ({granularity.toUpperCase()} View)
              </h2>
            </div>
            <div className="cluster" style={{ gap: 'var(--s3)', fontSize: '0.75rem' }}>
              <span className="cluster" style={{ gap: '4px', color: 'var(--dim)' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--signal)', borderRadius: '2px', display: 'inline-block' }} /> Gate Access Volume
              </span>
              <span className="cluster" style={{ gap: '4px', color: 'var(--dim)' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#d97706', borderRadius: '2px', display: 'inline-block' }} /> Incidents Reported
              </span>
            </div>
          </div>

          {loadingAnalytics ? (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p className="sm faint">Aggregating server-side analytics metrics...</p>
            </div>
          ) : (
            <div style={{ width: '100%', overflowX: 'auto' }}>
              {(() => {
                const dataset = activeTimelineData;
                const maxGateVal = Math.max(...dataset.map((d) => d.gate_volume || 1), 10);
                const maxIncVal = Math.max(...dataset.map((d) => d.incidents || 1), 5);

                return (
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '190px' }}>
                    {[0, 0.33, 0.66, 1].map((pct, idx) => (
                      <line
                        key={idx}
                        x1="35"
                        y1={chartHeight - 30 - pct * (chartHeight - 50)}
                        x2={chartWidth - 10}
                        y2={chartHeight - 30 - pct * (chartHeight - 50)}
                        stroke="var(--line-hi)"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                    ))}

                    {dataset.map((item, idx) => {
                      const xStep = (chartWidth - 45) / Math.max(1, dataset.length);
                      const x = 40 + idx * xStep;
                      const barW = Math.min(18, Math.max(3, xStep * 0.38));

                      const gateH = ((item.gate_volume || 0) / maxGateVal) * (chartHeight - 55);
                      const incH = ((item.incidents || 0) / maxIncVal) * (chartHeight - 55);

                      return (
                        <g key={idx}>
                          {/* Gate Access Volume Bar (Brand Blue) */}
                          <rect
                            x={x}
                            y={chartHeight - 30 - gateH}
                            width={barW}
                            height={Math.max(2, gateH)}
                            fill="var(--signal)"
                            rx="2"
                            opacity="0.9"
                          />
                          {/* Incidents Reported Bar (Muted Amber) */}
                          <rect
                            x={x + barW + 1}
                            y={chartHeight - 30 - incH}
                            width={barW}
                            height={Math.max(2, incH)}
                            fill="#d97706"
                            rx="2"
                            opacity="0.85"
                          />
                          {item.label ? (
                            <text
                              x={x + barW}
                              y={chartHeight - 10}
                              fontSize="9"
                              fill="var(--dim)"
                              textAnchor="middle"
                              fontFamily="monospace"
                            >
                              {item.label}
                            </text>
                          ) : null}
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>
          )}
        </section>

        {/* Side Column: Role Distribution & Telemetry */}
        <div className="stack" style={{ gap: 'var(--s4)' }}>
          {/* User Role Distribution */}
          <section className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
            <p className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 'var(--s2)' }}>
              COMMUNITY ROLE BREAKDOWN
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
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--ink)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${r.percentage}%`, height: '100%', backgroundColor: idx === 0 ? 'var(--signal)' : idx === 1 ? '#3b6a9c' : '#929894' }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Estate Infrastructure & Systems Status */}
          <section className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
            <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s3)', alignItems: 'center' }}>
              <p className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em', margin: 0 }}>
                ESTATE INFRASTRUCTURE & SYSTEMS STATUS
              </p>
              <StatusBadge status="ALL SYSTEMS OPERATIONAL" />
            </div>

            <ul className="stack" style={{ gap: 'var(--s2)', padding: 0, margin: 0, listStyle: 'none' }}>
              <li className="cluster" style={{ justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', borderBottom: '1px solid var(--line-hi)', paddingBottom: '6px' }}>
                <div>
                  <strong style={{ color: 'var(--paper)', display: 'block' }}>Main Gate & Access Control</strong>
                  <span className="sm faint" style={{ color: 'var(--dim)', fontSize: '0.72rem' }}>Operational (Boom Gates & QR Scanners Online)</span>
                </div>
                <StatusBadge status="ACTIVE" />
              </li>
              <li className="cluster" style={{ justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', borderBottom: '1px solid var(--line-hi)', paddingBottom: '6px' }}>
                <div>
                  <strong style={{ color: 'var(--paper)', display: 'block' }}>Guardhouse Terminal Connection</strong>
                  <span className="sm faint" style={{ color: 'var(--dim)', fontSize: '0.72rem' }}>Connected (Terminal 01 - Main Gate Entrance)</span>
                </div>
                <StatusBadge status="ACTIVE" />
              </li>
              <li className="cluster" style={{ justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', borderBottom: '1px solid var(--line-hi)', paddingBottom: '6px' }}>
                <div>
                  <strong style={{ color: 'var(--paper)', display: 'block' }}>Emergency & SOS Dispatch Gateway</strong>
                  <span className="sm faint" style={{ color: 'var(--dim)', fontSize: '0.72rem' }}>Active (SMS & Push Notification Gateway Operational)</span>
                </div>
                <StatusBadge status="ACTIVE" />
              </li>
              <li className="cluster" style={{ justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <div>
                  <strong style={{ color: 'var(--paper)', display: 'block' }}>Visitor Verification Sync</strong>
                  <span className="sm faint" style={{ color: 'var(--dim)', fontSize: '0.72rem' }}>Synced (Last heartbeat: 2 mins ago)</span>
                </div>
                <StatusBadge status="ACTIVE" />
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* SECTION 6: Attention Required & Audit Log Table */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
        {/* Attention Items Banner */}
        {attentionItems.length > 0 ? (
          <div style={{ marginBottom: 'var(--s4)', padding: 'var(--s3) var(--s4)', backgroundColor: 'var(--panel-hi)', borderLeft: '3px solid var(--signal)', borderRadius: '3px' }}>
            <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em', margin: 0 }}>
              ATTENTION REQUIRED
            </p>
            <div className="stack" style={{ gap: 'var(--s2)', marginTop: 'var(--s2)' }}>
              {attentionItems.map((item) => (
                <div key={item.id} className="cluster" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--paper)' }}>{item.title}</strong>
                    <span className="sm faint" style={{ color: 'var(--dim)', marginLeft: '8px' }}>{item.description}</span>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                    onClick={() => {
                      if (item.type === 'Pending Verification' && pendingQueue.length > 0) {
                        setReviewDocModal(pendingQueue[0]);
                      } else if (item.link) {
                        navigate(item.link);
                      }
                    }}
                  >
                    Review Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Administrative Audit Ledger Table */}
        <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s4)', flexWrap: 'wrap', gap: 'var(--s3)' }}>
          <div>
            <p className="eyebrow" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              ADMINISTRATIVE AUDIT LEDGER
            </p>
            <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
              Recent Administrative Operations
            </h2>
          </div>

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
            <button
              type="button"
              className="btn"
              onClick={handleExportCSV}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
            >
              Export CSV
            </button>
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

        {totalLogPages > 1 ? (
          <div className="cluster" style={{ justifyContent: 'space-between', marginTop: 'var(--s3)', fontSize: '0.8rem' }}>
            <span className="mono faint" style={{ color: 'var(--dim)' }}>
              Page {logPage} of {totalLogPages} ({filteredLogs.length} total entries)
            </span>
            <div className="cluster" style={{ gap: 'var(--s2)' }}>
              <button type="button" className="btn" disabled={logPage === 1} onClick={() => setLogPage((p) => Math.max(1, p - 1))} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                Previous
              </button>
              <button type="button" className="btn" disabled={logPage === totalLogPages} onClick={() => setLogPage((p) => Math.min(totalLogPages, p + 1))} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* MODAL 1: CUSTOM DATE RANGE PICKER MODAL */}
      {customModalOpen ? (
        <Modal
          title="Select Custom Analytics Date Range"
          onClose={() => setCustomModalOpen(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setCustomModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-solid"
                onClick={() => {
                  setDatePeriod('custom');
                  setCustomModalOpen(false);
                }}
              >
                Apply Custom Range
              </button>
            </>
          }
        >
          <div className="stack" style={{ gap: 'var(--s4)' }}>
            <div className="field">
              <label className="eyebrow" htmlFor="start-date">Start Date</label>
              <input
                id="start-date"
                type="date"
                className="control"
                value={customRange.start}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, start: e.target.value }))}
                style={{ color: 'var(--paper)', backgroundColor: 'var(--ink)' }}
              />
            </div>
            <div className="field">
              <label className="eyebrow" htmlFor="end-date">End Date</label>
              <input
                id="end-date"
                type="date"
                className="control"
                value={customRange.end}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, end: e.target.value }))}
                style={{ color: 'var(--paper)', backgroundColor: 'var(--ink)' }}
              />
            </div>
          </div>
        </Modal>
      ) : null}

      {/* MODAL 2: REVIEW DOCUMENT MODAL */}
      {reviewDocModal ? (
        <Modal
          title={`Review Verification Documents (${reviewDocModal.name})`}
          onClose={() => setReviewDocModal(null)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setReviewDocModal(null)}>
                Close Preview
              </button>
              <button type="button" className="btn" style={{ borderColor: 'var(--line-hi)' }} onClick={() => handleDeclineMember(reviewDocModal.id)}>
                Decline Application
              </button>
              <button type="button" className="btn btn-solid" onClick={() => handleApproveMember(reviewDocModal.id)}>
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
              <label className="eyebrow" htmlFor="anc-title">Broadcast Title *</label>
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
              <label className="eyebrow" htmlFor="anc-priority">Priority Level</label>
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
              <label className="eyebrow" htmlFor="anc-content">Notice Content *</label>
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

      <GuardhouseVerificationModal
        isOpen={guardhouseModalOpen}
        onClose={() => setGuardhouseModalOpen(false)}
        onLogEntry={(msg) => {
          setNotice(msg);
          setTimeout(() => setNotice(''), 6000);
        }}
      />
    </div>
  );
}

export default AdminDashboard;
