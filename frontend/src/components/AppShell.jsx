import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, SAMPLE_USERS } from '../context/AuthContext';
import { community } from '../services/demoData';
import Avatar from './Avatar';
import Icon from './Icon';
import Logo from './Logo';
import Modal from './Modal';
import Notifications from './Notifications';
import PlatformGuideModal from './PlatformGuideModal';
import { ROLE_NAV, isActive, titleFor } from './navigation';

/*
 * Application frame.
 *
 * A charcoal sidebar for moving between areas, and a white top bar that
 * names where you are and holds everything about your account. Sign in,
 * registration and password recovery render without the frame.
 */

const AUTH_PATHS = ['/signin', '/login', '/signup', '/forgot-password'];

function today() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function Sidebar({ groups, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [query, setQuery] = useState('');

  const term = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      groups
        .map((g) => ({ ...g, items: g.items.filter((i) => !term || i.label.toLowerCase().includes(term)) }))
        .filter((g) => g.items.length),
    [groups, term]
  );

  const jumpToFirst = (event) => {
    event.preventDefault();
    const first = filtered[0] && filtered[0].items[0];
    if (first) {
      navigate(first.to);
      setQuery('');
      onNavigate();
    }
  };

  return (
    <aside className="sidebar" aria-label="Main">
      <div className="sidebar-brand">
        <NavLink to="/" onClick={onNavigate} aria-label="Home">
          <Logo />
        </NavLink>
      </div>

      <div className="sidebar-scroll">
        <div className="sidebar-estate">
          <strong>{community.community_name}</strong>
          <span>
            {community.suburb}, {community.city}
          </span>
        </div>

        <form className="sidebar-search" role="search" onSubmit={jumpToFirst}>
          <Icon name="search" />
          <input
            type="search"
            placeholder="Go to"
            aria-label="Filter navigation"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <nav aria-label="Sections">
          {filtered.length === 0 ? <p className="nav-empty">No section called that.</p> : null}
          {filtered.map((group) => (
            <div className="nav-group" key={group.group}>
              <span className="nav-group-label">{group.group}</span>
              {group.items.map((item) => {
                const current = isActive(location.pathname, item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/' || item.to === '/admin'}
                    className={`nav-item${current ? ' current' : ''}`}
                    aria-current={current ? 'page' : undefined}
                    onClick={onNavigate}
                  >
                    <Icon name={item.icon} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      <div className="sidebar-foot">
        <button
          type="button"
          className="signout"
          onClick={() => {
            logout();
            navigate('/signin');
          }}
        >
          <Icon name="logout" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function AccountMenu({ onGuide, onSwitch }) {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const esc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  useEffect(() => setOpen(false), [location.pathname]);

  const fullName = currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() : 'Resident';

  const go = (fn) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div className="account" ref={ref}>
      <button
        type="button"
        className="account-btn"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar name={fullName} size="sm" />
        <span className="account-text">
          <span className="account-name">{fullName}</span>
          <span className="account-role">{userRole}</span>
        </span>
        <Icon name="chevronDown" />
      </button>

      {open ? (
        <div className="popover" role="menu">
          <div className="popover-head">
            <Avatar name={fullName} size="lg" />
            <span className="identity-text">
              <span className="identity-name">{fullName}</span>
              <span className="identity-meta">{currentUser?.email}</span>
            </span>
          </div>
          <div className="popover-list">
            <button type="button" role="menuitem" className="menu-action" onClick={go(() => navigate('/profile'))}>
              <Icon name="user" />
              Your profile
            </button>
            <button type="button" role="menuitem" className="menu-action" onClick={go(onGuide)}>
              <Icon name="help" />
              How this platform works
            </button>
            <button type="button" role="menuitem" className="menu-action" onClick={go(onSwitch)}>
              <Icon name="repeat" />
              Switch account
            </button>
            <div className="menu-sep" />
            <button
              type="button"
              role="menuitem"
              className="menu-action menu-action-danger"
              onClick={go(() => {
                logout();
                navigate('/signin');
              })}
            >
              <Icon name="logout" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SwitchAccountModal({ onClose }) {
  const { currentUser, loginAsPersona } = useAuth();
  const navigate = useNavigate();

  return (
    <Modal
      title="Switch account"
      onClose={onClose}
      footer={
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
      }
    >
      <p className="hint" style={{ marginBottom: 14 }}>
        Each role sees a different application. Pick one to view the estate through their account.
      </p>
      <div className="persona-list">
        {SAMPLE_USERS.map((user) => {
          const name = `${user.first_name} ${user.last_name}`;
          const isCurrent = Boolean(currentUser && currentUser.email === user.email);
          return (
            <button
              key={user.email}
              type="button"
              className="persona"
              aria-current={isCurrent}
              onClick={() => {
                loginAsPersona(user.role);
                onClose();
                navigate('/');
              }}
            >
              <Avatar name={name} size="sm" />
              <span className="persona-text">
                <span className="persona-name">{name}</span>
                <span className="persona-role">{user.role}</span>
              </span>
              {isCurrent ? (
                <span className="pill tone-teal">Signed in</span>
              ) : (
                <span className="persona-go">
                  Open
                  <Icon name="chevronRight" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

function AppShell({ children }) {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);

  useEffect(() => setNavOpen(false), [location.pathname]);

  const heading = titleFor(location.pathname, userRole);

  useEffect(() => {
    document.title = isAuthenticated ? `${heading.title} | CommuniKey` : 'CommuniKey';
  }, [heading.title, isAuthenticated]);

  const isAuthPage = AUTH_PATHS.includes(location.pathname.toLowerCase());
  if (isAuthPage || !isAuthenticated) {
    return <div className="app">{children}</div>;
  }

  const groups = ROLE_NAV[userRole] || ROLE_NAV.Resident;

  return (
    <div className={`app${navOpen ? ' nav-open' : ''}`}>
      <Sidebar groups={groups} onNavigate={() => setNavOpen(false)} />
      <div className="scrim-mobile" onClick={() => setNavOpen(false)} aria-hidden="true" />

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            <Icon name="menu" />
          </button>

          <div className="topbar-title">
            <Icon name={heading.icon} />
            <h1>{heading.title}</h1>
          </div>

          <div className="topbar-end">
            <span className="topbar-date">
              <Icon name="calendar" />
              {today()}
            </span>
            <button type="button" className="icon-btn" aria-label="How this platform works" onClick={() => setGuideOpen(true)}>
              <Icon name="help" />
            </button>
            <Notifications />
            <span className="topbar-sep" aria-hidden="true" />
            <AccountMenu onGuide={() => setGuideOpen(true)} onSwitch={() => setSwitchOpen(true)} />
          </div>
        </header>

        <main className="content">{children}</main>
      </div>

      <PlatformGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
      {switchOpen ? <SwitchAccountModal onClose={() => setSwitchOpen(false)} /> : null}
    </div>
  );
}

export default AppShell;
