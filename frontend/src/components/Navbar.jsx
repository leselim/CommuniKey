import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import Notifications from './Notifications';

const ROLE_NAV = {
  Resident: [
    { to: '/', label: 'Dashboard' },
    { to: '/incidents', label: 'Incidents' },
    { to: '/announcements', label: 'Announcements' },
    { to: '/events', label: 'Events' },
    { to: '/messages', label: 'Members & Messages' },
    { to: '/profile', label: 'Profile' },
  ],
  'Community Administrator': [
    { to: '/', label: 'Admin Hub' },
    { to: '/incidents', label: 'Incident Triage' },
    { to: '/announcements', label: 'Announcements' },
    { to: '/events', label: 'Events' },
    { to: '/messages', label: 'Member Moderation' },
    { to: '/profile', label: 'Profile' },
  ],
  'Safety Volunteer': [
    { to: '/', label: 'Responder Hub' },
    { to: '/incidents', label: 'Active Incidents' },
    { to: '/messages', label: 'Dispatch Channel' },
    { to: '/profile', label: 'Profile' },
  ],
  'System Administrator': [
    { to: '/', label: 'System Overview' },
    { to: '/messages', label: 'Member Network' },
    { to: '/profile', label: 'Profile' },
  ],
};

function Navbar() {
  const { currentUser, userRole, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const activeNav = (isAuthenticated && userRole && ROLE_NAV[userRole]) ? ROLE_NAV[userRole] : ROLE_NAV.Resident;

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <NavLink to="/" className="wordmark-link" onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
          <Logo />
        </NavLink>

        {isAuthenticated ? (
          <nav className={`nav${open ? ' open' : ''}`} id="site-nav">
            {activeNav.map(({ to, label }) => (
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
        ) : null}

        <div className="bar-end">
          {isAuthenticated ? (
            <>
              <Notifications />
              <span
                className="mono sm hide-mobile"
                style={{
                  color: 'var(--signal)',
                  backgroundColor: 'var(--signal-wash)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '3px',
                  border: '1px solid var(--line-hi)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {userRole}
              </span>
              <button
                type="button"
                className="btn"
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <NavLink to="/signin" className="btn btn-solid" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
              Sign In
            </NavLink>
          )}

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
