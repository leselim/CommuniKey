import React, { useState } from 'react';
import { SAMPLE_USERS, useAuth } from '../context/AuthContext';

const PLATFORM_HEALTH = [
  { service: 'REST API v1 Endpoints', status: 'Operational (99.98% uptime)', ping: '18ms' },
  { service: 'SQLite / DB Connection Pool', status: 'Healthy (131 KB stored)', ping: '4ms' },
  { service: 'Web Audio Alert Service', status: 'Operational', ping: '12ms' },
  { service: 'JWT Authentication Gateway', status: 'Operational', ping: '15ms' },
];

const SECURITY_AUDIT_LOGS = [
  { id: 1, action: 'User Sign In', details: 'Authenticated via email/password token (Resident)', timestamp: 'Today 13:25', actor: 'thabo@example.com' },
  { id: 2, action: 'Role Session Promoted', details: 'Marcus Vance granted Community Administrator permissions', timestamp: 'Today 12:40', actor: 'System Admin' },
  { id: 3, action: 'Database Backup Completed', details: 'Automated backup executed cleanly without lock', timestamp: 'Today 06:00', actor: 'System Worker' },
  { id: 4, action: 'Password Recovery Dispatched', details: 'Password reset token generated cleanly', timestamp: 'Yesterday 18:15', actor: 'Auth Gateway' },
];

function SysAdminDashboard() {
  const { currentUser, loginAsPersona } = useAuth();
  const [notice, setNotice] = useState('');

  return (
    <div className="stack">
      {/* SECTION 1: Masthead */}
      <header className="masthead">
        <div>
          <p className="eyebrow">
            System Infrastructure & Security
          </p>
          <h1>Platform Health & Audit Gateway</h1>
          <p className="masthead-meta">
            Logged in as {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'System Administrator'}
          </p>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* SECTION 2: System Health Figures */}
      <div className="figures">
        <div className="figure">
          <span className="eyebrow">API Status</span>
          <span className="figure-value" style={{ color: 'var(--paper)' }}>Operational</span>
        </div>
        <div className="figure">
          <span className="eyebrow">Active Sessions</span>
          <span className="figure-value">48</span>
        </div>
        <div className="figure">
          <span className="eyebrow">System Uptime</span>
          <span className="figure-value">99.98%</span>
        </div>
        <div className="figure">
          <span className="eyebrow">Security Alerts</span>
          <span className="figure-value">0</span>
        </div>
      </div>

      {/* SECTION 3: Platform Health Services */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow">
              Infrastructure Status
            </p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              Platform API Services & Connectivity
            </h2>
          </div>
        </div>

        <ul className="ledger">
          {PLATFORM_HEALTH.map((srv, idx) => (
            <li className="entry" key={idx}>
              <div>
                <h3 className="entry-title">{srv.service}</h3>
                <p className="entry-body" style={{ color: 'var(--dim)' }}>
                  Latency / Ping: {srv.ping}
                </p>
              </div>
              <span className="status status-closed">{srv.status}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* SECTION 4: Security & Audit Logs */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow">Security Audit Trail</p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              Recent Authentications & Access Audit Logs
            </h2>
          </div>
        </div>

        <ul className="ledger">
          {SECURITY_AUDIT_LOGS.map((log) => (
            <li className="entry" key={log.id}>
              <div>
                <h3 className="entry-title">{log.action}</h3>
                <p className="entry-body">{log.details}</p>
                <div className="entry-meta">
                  <span>Actor: {log.actor}</span>
                </div>
              </div>
              <span className="entry-aside mono sm" style={{ color: 'var(--dim)' }}>
                {log.timestamp}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* SECTION 5: User Role Management Matrix */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow">Role Access Matrix</p>
            <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 500 }}>
              Registered Platform Accounts
            </h2>
          </div>
        </div>

        <ul className="ledger">
          {SAMPLE_USERS.map((user) => (
            <li className="entry" key={user.id}>
              <div>
                <h3 className="entry-title">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="entry-body">
                  Email: {user.email} | {user.address}
                </p>
              </div>

              <span className="entry-aside cluster" style={{ gap: 'var(--s3)' }}>
                <span className="mono sm" style={{ color: 'var(--signal)', fontWeight: 600 }}>
                  {user.role}
                </span>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => {
                    loginAsPersona(user.role);
                    setNotice(`Switched active session to ${user.role} persona.`);
                    setTimeout(() => setNotice(''), 4000);
                  }}
                >
                  Inspect Role
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default SysAdminDashboard;
