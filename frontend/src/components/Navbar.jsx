import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Notifications from './Notifications';
import Logo from './Logo';

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/incidents', label: 'Incidents' },
  { to: '/announcements', label: 'Announcements' },
  { to: '/events', label: 'Events' },
  { to: '/profile', label: 'Profile' },
];

function Navbar() {
  const [open, setOpen] = useState(false);

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

        <div className="bar-end">
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
