import React, { useState } from 'react';
import { SAMPLE_USERS, useAuth } from '../context/AuthContext';

function DevPersonaSwitcher() {
  const { currentUser, loginAsPersona, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(true);

  if (!isAuthenticated) return null;

  return (
    <aside
      aria-label="Development Persona Switcher"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: 'var(--panel)',
        border: '1px solid var(--line-hi)',
        borderRadius: '6px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        fontSize: '0.78rem',
        maxWidth: '320px',
        transition: 'all 0.2s ease',
      }}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.4rem 0.75rem',
            backgroundColor: 'var(--panel-hi)',
            border: 'none',
            borderRadius: '6px',
            color: 'var(--paper)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--signal)' }} />
          <span>Persona: <strong>{currentUser ? `${currentUser.first_name} (${currentUser.role})` : 'Resident'}</strong></span>
          <span className="mono faint" style={{ color: 'var(--dim)', fontSize: '0.7rem' }}>▲</span>
        </button>
      ) : (
        <div style={{ padding: 'var(--s3)' }}>
          <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s2)', borderBottom: '1px solid var(--line-hi)', paddingBottom: 'var(--s2)' }}>
            <span className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em', margin: 0 }}>
              DEV PERSONA SWITCHER
            </span>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--dim)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: '0 4px',
              }}
              title="Collapse toolbar"
            >
              ▼
            </button>
          </div>

          <p className="sm faint" style={{ color: 'var(--dim)', margin: '0 0 var(--s3) 0', fontSize: '0.72rem' }}>
            Switch session persona to test role permissions & view flows:
          </p>

          <div className="stack" style={{ gap: '6px' }}>
            {SAMPLE_USERS.map((u) => {
              const isActive = currentUser?.role === u.role;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    loginAsPersona(u.role);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '4px',
                    border: isActive ? '1px solid var(--signal)' : '1px solid var(--line-hi)',
                    backgroundColor: isActive ? 'var(--signal-wash)' : 'var(--ink)',
                    color: 'var(--paper)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <strong style={{ color: isActive ? 'var(--signal)' : 'var(--paper)' }}>
                      {u.first_name} {u.last_name}
                    </strong>
                    <div style={{ fontSize: '0.68rem', color: 'var(--dim)' }}>{u.role}</div>
                  </div>
                  {isActive ? (
                    <span className="mono sm" style={{ color: 'var(--signal)', fontSize: '0.7rem', fontWeight: 600 }}>
                      ACTIVE
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

export default DevPersonaSwitcher;
