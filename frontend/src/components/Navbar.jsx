import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Notifications from './Notifications';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/incidents', label: 'Incidents' },
  { to: '/announcements', label: 'Announcements' },
  { to: '/events', label: 'Events' },
  { to: '/profile', label: 'Profile' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, switchUser, demoUsers } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <NavLink to="/" className="wordmark-link" onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
          <Logo />
        </NavLink>

        <nav className={`nav${open ? ' open' : ''}`} id="site-nav">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' current' : ''}`}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="bar-end" style={{ gap: 'var(--s3)', alignItems: 'center' }}>
          {isAuthenticated ? (
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 'var(--s2)' }}>
              <button
                type="button"
                className="btn"
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  borderColor: 'var(--line-hi)',
                  color: 'var(--paper)',
                  borderRadius: 'var(--radius)',
                }}
                title="Click to switch demo role"
                onClick={() => setRoleMenuOpen((v) => !v)}
              >
                <span style={{ color: 'var(--signal)', fontWeight: 600 }}>{user.first_name}</span>
                <span className="faint" style={{ marginLeft: '4px' }}>
                  ({user.role === 'Community Administrator' ? 'Admin' : user.role})
                </span>
              </button>

              {roleMenuOpen ? (
                <div
                  className="panel"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '230px',
                    padding: 'var(--s3)',
                    border: '1px solid var(--line-hi)',
                    zIndex: 50,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                >
                  <p className="eyebrow" style={{ marginBottom: 'var(--s2)', fontSize: '0.65rem' }}>
                    Switch Demo User Role
                  </p>
                  <div className="stack" style={{ gap: 'var(--s1)' }}>
                    {demoUsers.map((u) => (
                      <button
                        key={u.role}
                        type="button"
                        className="btn"
                        style={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          padding: '0.35rem 0.5rem',
                          fontSize: '0.75rem',
                          backgroundColor: user.role === u.role ? 'var(--panel-hi)' : 'transparent',
                          borderColor: user.role === u.role ? 'var(--signal)' : 'transparent',
                        }}
                        onClick={() => {
                          switchUser(u.role);
                          setRoleMenuOpen(false);
                        }}
                      >
                        <span style={{ fontWeight: user.role === u.role ? 600 : 400 }}>{u.first_name}</span>
                        <span className="faint sm" style={{ marginLeft: 'auto' }}>
                          {u.role === 'Community Administrator' ? 'Admin' : u.role.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                className="link"
                style={{ fontSize: '0.8rem', color: 'var(--faint)' }}
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="btn btn-solid" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
              Sign in
            </NavLink>
          )}

          <Notifications />

          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
