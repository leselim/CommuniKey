import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, SAMPLE_USERS } from '../context/AuthContext';
import Logo from './Logo';
import Avatar from './Avatar';
import Notifications from './Notifications';
import PlatformGuideModal from './PlatformGuideModal';
import Modal from './Modal';

/*
 * Primary navigation. The link set is chosen by role, so a resident never
 * sees moderation tools and a guard sees the gate terminal first. Labels
 * are written the way a person would say them out loud.
 */

const ROLE_NAV = {
  Resident: [
    { to: '/', label: 'Home' },
    { to: '/incidents', label: 'Incidents' },
    { to: '/announcements', label: 'Notices' },
    { to: '/events', label: 'Events' },
    { to: '/directory', label: 'Directory' },
  ],
  'Safety Volunteer': [
    { to: '/volunteer/triage', label: 'Triage' },
    { to: '/volunteer/patrol', label: 'Patrol' },
    { to: '/insights', label: 'Reporting' },
    { to: '/announcements', label: 'Notices' },
    { to: '/directory', label: 'Directory' },
  ],
  'Estate Administrator': [
    { to: '/admin', label: 'Overview' },
    { to: '/insights', label: 'Reporting' },
    { to: '/admin/incidents', label: 'Incidents' },
    { to: '/admin/announcements', label: 'Notices' },
    { to: '/admin/moderation', label: 'Members' },
    { to: '/directory', label: 'Directory' },
  ],
  'Security Guard': [
    { to: '/', label: 'Gate' },
    { to: '/incidents', label: 'Incidents' },
    { to: '/directory', label: 'Directory' },
  ],
};

const AUTH_PATHS = ['/signin', '/login', '/signup', '/forgot-password'];

function Navbar() {
  const { currentUser, userRole, logout, isAuthenticated, loginAsPersona } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const menuRef = useRef(null);

  const isAuthPage = AUTH_PATHS.includes(location.pathname.toLowerCase());

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Close the mobile panel whenever the route changes.
  useEffect(() => {
    setOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  if (isAuthPage || !isAuthenticated) {
    return (
      <header className="topbar">
        <div className="shell topbar-inner" style={{ justifyContent: 'center' }}>
          <NavLink to="/signin" className="wordmark-link">
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

  const fullName = currentUser
    ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim()
    : 'Resident';
  const shortName = currentUser
    ? `${currentUser.first_name || 'Resident'}${
        currentUser.last_name ? ` ${currentUser.last_name.charAt(0)}.` : ''
      }`
    : 'Resident';

  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <NavLink to="/" className="wordmark-link">
          <Logo />
        </NavLink>

        <nav className={`nav${open ? ' open' : ''}`} id="site-nav" aria-label="Primary">
          {activeNav.map(({ to, label }) => {
            const isRoot = to === '/' || to === '/admin';
            const isActive = isRoot
              ? location.pathname === to
              : location.pathname === to || location.pathname.startsWith(`${to}/`);

            return (
              <NavLink
                key={to}
                to={to}
                end={isRoot}
                className={`nav-item${isActive ? ' current' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </NavLink>
            );
          })}
        </nav>

        <div className="bar-end">
          <Notifications />

          <div className="account" ref={menuRef}>
            <button
              type="button"
              className="account-btn"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
            >
              <Avatar name={fullName} size="sm" />
              <span className="account-name">{shortName}</span>
              <span className="account-caret" aria-hidden="true" />
            </button>

            {userMenuOpen ? (
              <div className="account-menu" role="menu">
                <div className="account-menu-head">
                  <Avatar name={fullName} size="lg" ring />
                  <span className="identity-text">
                    <span className="identity-name">{fullName}</span>
                    <span className="identity-meta">{userRole || 'Resident'}</span>
                    <span className="identity-meta">{currentUser?.email}</span>
                  </span>
                </div>

                <div className="account-menu-list">
                  <button
                    type="button"
                    className="menu-action"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/profile');
                    }}
                  >
                    Your profile
                  </button>
                  <button
                    type="button"
                    className="menu-action"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setGuideModalOpen(true);
                    }}
                  >
                    How this platform works
                  </button>
                  <button
                    type="button"
                    className="menu-action"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setSwitchOpen(true);
                    }}
                  >
                    Switch account
                  </button>
                  <div className="menu-sep" />
                  <button
                    type="button"
                    className="menu-action menu-action-danger"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    Sign out
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

      <PlatformGuideModal isOpen={guideModalOpen} onClose={() => setGuideModalOpen(false)} />

      {switchOpen ? (
        <Modal
          title="Switch account"
          onClose={() => setSwitchOpen(false)}
          footer={
            <button type="button" className="btn" onClick={() => setSwitchOpen(false)}>
              Cancel
            </button>
          }
        >
          <p className="hint" style={{ marginBottom: 'var(--s4)' }}>
            Each role sees a different application. Pick one to view the estate through
            their account.
          </p>

          <div className="persona-list">
            {SAMPLE_USERS.map((user) => {
              const name = `${user.first_name} ${user.last_name}`;
              const isCurrent = currentUser && currentUser.email === user.email;
              return (
                <button
                  key={user.email}
                  type="button"
                  className="persona"
                  aria-current={isCurrent}
                  onClick={() => {
                    loginAsPersona(user.role);
                    setSwitchOpen(false);
                    navigate('/');
                  }}
                >
                  <Avatar name={name} size="sm" />
                  <span className="persona-text">
                    <span className="persona-name">{name}</span>
                    <span className="persona-role">{user.role}</span>
                  </span>
                  <span className="persona-go">{isCurrent ? 'Signed in' : 'Open'}</span>
                </button>
              );
            })}
          </div>
        </Modal>
      ) : null}
    </header>
  );
}

export default Navbar;
