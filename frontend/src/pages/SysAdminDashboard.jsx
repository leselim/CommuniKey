import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SAMPLE_USERS, useAuth } from '../context/AuthContext';
import { formatStamp } from '../utils/format';

const COMMUNITIES = [
  { id: 1, name: 'Riverside Estate', location: 'Pretoria, Gauteng', members: 248, status: 'Active' },
  { id: 2, name: 'Oakridge Heights', location: 'Johannesburg, Gauteng', members: 512, status: 'Active' },
  { id: 3, name: 'Stellenbosch Community Watch', location: 'Stellenbosch, Western Cape', members: 380, status: 'Active' },
];

const AUDIT_LOGS = [
  { id: 1, action: 'User Role Promoted', details: 'Marcus Vance granted Community Administrator role', timestamp: '2026-08-20 18:40', actor: 'System Admin' },
  { id: 2, action: 'Database Health Check', details: 'Automated backup completed cleanly (131 KB)', timestamp: '2026-08-20 16:00', actor: 'Automated Service' },
  { id: 3, action: 'API Authentication Token', details: 'JWT refresh token issued for resident session', timestamp: '2026-08-20 12:15', actor: 'Auth Service' },
];

function SysAdminDashboard() {
  const { currentUser, loginAsPersona } = useAuth();
  const [notice, setNotice] = useState('');

  const handleRoleUpdate = (userEmail, newRole) => {
    setNotice(`User ${userEmail} role updated to ${newRole}. Permissions propagated.`);
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="stack">
      {/* SECTION 1: Masthead */}
      <header className="masthead">
        <div>
          <p className="eyebrow" style={{ color: 'var(--signal)' }}>
            System Infrastructure & Platform Administration
          </p>
          <h1>CommuniKey System Overview</h1>
          <p className="masthead-meta">
            Logged in as {currentUser.first_name} {currentUser.last_name} ({currentUser.role})
          </p>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* SECTION 2: Platform Metrics */}
      <div className="figures">
        <div className="figure">
          <span className="eyebrow">Managed Communities</span>
          <span className="figure-value">1,240</span>
        </div>
        <div className="figure">
          <span className="eyebrow">Total Users</span>
          <span className="figure-value">48,200</span>
        </div>
        <div className="figure">
          <span className="eyebrow">System Uptime</span>
          <span className="figure-value">99.98%</span>
        </div>
        <div className="figure">
          <span className="eyebrow">Active Security Alerts</span>
          <span className="figure-value">0</span>
        </div>
      </div>

      {/* SECTION 3: User Role & Access Control Matrix */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow">Access Control</p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              User Accounts & Role Assignments
            </h2>
          </div>
        </div>

        <p className="sm faint" style={{ marginBottom: 'var(--s4)' }}>
          Manage global user permissions and test role-based view switching.
        </p>

        <ul className="ledger">
          {SAMPLE_USERS.map((user) => (
            <li className="entry" key={user.id}>
              <div>
                <h3 className="entry-title">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="entry-body">
                  Email: {user.email} • {user.address}
                </p>
              </div>

              <span className="entry-aside cluster" style={{ gap: 'var(--s3)' }}>
                <span className="mono" style={{ color: 'var(--signal)', fontWeight: 600 }}>
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
                  Switch Persona
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* SECTION 4: Managed Communities List */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow">Multi-Tenant Management</p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              Active Communities on Platform
            </h2>
          </div>
        </div>

        <ul className="ledger">
          {COMMUNITIES.map((c) => (
            <li className="entry" key={c.id}>
              <div>
                <h3 className="entry-title">{c.name}</h3>
                <p className="entry-body">
                  Location: {c.location}
                </p>
              </div>
              <span className="entry-aside mono" style={{ color: 'var(--paper)' }}>
                {c.members} members ({c.status})
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* SECTION 5: System Audit Logs */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow">Security Audit</p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              Platform System & Permission Logs
            </h2>
          </div>
        </div>

        <ul className="ledger">
          {AUDIT_LOGS.map((log) => (
            <li className="entry" key={log.id}>
              <div>
                <h3 className="entry-title">{log.action}</h3>
                <p className="entry-body">{log.details}</p>
                <div className="entry-meta">
                  <span>{log.actor}</span>
                </div>
              </div>
              <span className="entry-aside mono sm" style={{ color: 'var(--dim)' }}>
                {log.timestamp}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default SysAdminDashboard;
