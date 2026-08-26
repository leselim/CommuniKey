import React, { useState, useRef, useEffect } from 'react';
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
    { to: '/volunteer/triage', label: 'Triage Feed' },
    { to: '/volunteer/alerts', label: 'Safety Alerts' },
    { to: '/volunteer/patrol', label: 'Patrol Ops' },
    { to: '/announcements', label: 'Announcements' },
    { to: '/profile', label: 'Profile' },
  ],
  'Estate Administrator': [
    { to: '/admin', label: 'Admin Hub' },
    { to: '/admin/incidents', label: 'Incidents' },
    { to: '/admin/announcements', label: 'Announcements' },
    { to: '/admin/events', label: 'Events' },
    { to: '/admin/moderation', label: 'Moderation' },
    { to: '/admin/messages', label: 'Helpdesk' },
  ],
};

function Navbar() {
  const { currentUser, userRole, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isAuthPage = ['/signin', '/login', '/signup', '/forgot-password'].includes(
    location.pathname.toLowerCase()
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Layout Isolation: Public Auth Pages or Unauthenticated users get ONLY brand logo header
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
    setUserMenuOpen(false);
    setOpen(false);
    logout();
    navigate('/signin');
  };

  const displayName = currentUser
    ? `${currentUser.first_name || 'Resident'} ${currentUser.last_name ? currentUser.last_name.charAt(0) + '.' : ''}`
    : 'Resident Member';

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

        <div className="bar-end" style={{ gap: 'var(--s3)' }}>
          <Notifications />

          {/* Account / Administrator Profile Dropdown Menu */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--panel-hi)',
                border: '1px solid var(--line-hi)',
                padding: '0.3rem 0.6rem',
                borderRadius: '4px',
                color: 'var(--paper)',
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              aria-expanded={userMenuOpen}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--signal)',
                  display: 'inline-block',
                }}
              />
              <span>{displayName}</span>
              <span className="mono sm faint" style={{ color: 'var(--dim)', fontSize: '0.7rem' }}>
                ▾
              </span>
            </button>

            {userMenuOpen ? (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 6px)',
                  width: '240px',
                  backgroundColor: 'var(--panel)',
                  border: '1px solid var(--line-hi)',
                  borderRadius: '6px',
                  padding: 'var(--s3)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  zIndex: 99,
                }}
              >
                <div style={{ paddingBottom: 'var(--s2)', marginBottom: 'var(--s2)', borderBottom: '1px solid var(--line-hi)' }}>
                  <p className="sm" style={{ fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                    {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Resident Member'}
                  </p>
                  <p className="mono sm faint" style={{ color: 'var(--signal)', fontSize: '0.7rem', margin: '2px 0 0 0' }}>
                    {userRole || 'Resident'}
                  </p>
                  <p className="sm faint" style={{ color: 'var(--dim)', fontSize: '0.72rem', margin: '4px 0 0 0' }}>
                    {currentUser?.email || 'resident@riverside.co.za'}
                  </p>
                </div>

                <div className="stack" style={{ gap: 'var(--s2)' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.78rem', padding: '0.35rem 0.5rem' }}
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/profile');
                    }}
                  >
                    View Account Profile
                  </button>

                  <button
                    type="button"
                    className="btn btn-solid"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', padding: '0.35rem 0.5rem' }}
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : null}
          </div>

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
