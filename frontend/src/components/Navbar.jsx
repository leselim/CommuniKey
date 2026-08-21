import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  'Safety Volunteer': [
    { to: '/', label: 'Responder Hub' },
    { to: '/incidents', label: 'Active Incidents' },
    { to: '/messages', label: 'Dispatch Channel' },
    { to: '/profile', label: 'Profile' },
  ],
  'Estate Administrator': [
    { to: '/', label: 'Admin Hub' },
    { to: '/incidents', label: 'Incident Triage' },
    { to: '/announcements', label: 'Announcements' },
    { to: '/events', label: 'Events' },
    { to: '/messages', label: 'Member Moderation' },
    { to: '/profile', label: 'Profile' },
  ],
};

function Navbar() {
  const { userRole, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isAuthPage = ['/signin', '/login', '/signup', '/forgot-password'].includes(
    location.pathname.toLowerCase()
  );

  // Layout Isolation: Public Auth Pages or Unauthenticated users get ONLY the brand logo header
  if (isAuthPage || !isAuthenticated) {
    return (
      <header className="topbar">
        <div className="shell topbar-inner" style={{ justifyContent: 'center' }}>
          <NavLink to="/signin" className="wordmark-link" style={{ textDecoration: 'none' }}>
            <Logo />
          </NavLink>
        </div>
      </header>
    );
  }

  const activeNav = userRole && ROLE_NAV[userRole] ? ROLE_NAV[userRole] : ROLE_NAV.Resident;

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

        <div className="bar-end">
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
