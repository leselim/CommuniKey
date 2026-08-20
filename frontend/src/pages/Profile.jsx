import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { save, unwrap } from '../services/api';
import { community } from '../services/demoData';

const SETTINGS = [
  {
    key: 'notify_emergency',
    label: 'Emergency alerts',
    hint: 'Notify me whenever an SOS alert is raised nearby.',
  },
  {
    key: 'notify_announcements',
    label: 'Announcements',
    hint: 'Notify me when administrators publish an announcement.',
  },
  {
    key: 'notify_events',
    label: 'Event reminders',
    hint: 'Remind me about events I have said I will attend.',
  },
];

function Toggle({ checked, label, hint, onChange }) {
  return (
    <div className="setting">
      <div>
        <p>{label}</p>
        <p className="sm faint">{hint}</p>
      </div>
      <button
        type="button"
        className="toggle"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}

function Profile() {
  const { user, updateUserProfile, logout, switchUser, demoUsers } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(user || {});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(user);
    }
  }, [user]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    updateUserProfile(form);
    await save('/auth/profile', form, 'put');
    setSaved(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="stack" style={{ textAlign: 'center', padding: 'var(--s7) 0' }}>
        <header className="masthead" style={{ justifyContent: 'center' }}>
          <div>
            <p className="eyebrow">Account</p>
            <h1>Not signed in</h1>
            <p className="masthead-meta">Please sign in or create an account to manage your profile.</p>
            <div className="cluster" style={{ justifyContent: 'center', marginTop: 'var(--s4)' }}>
              <button type="button" className="btn btn-solid" onClick={() => navigate('/login')}>
                Sign in / Create Account
              </button>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <form className="stack" onSubmit={submit}>
      <header className="masthead">
        <div>
          <p className="eyebrow">Account</p>
          <h1>
            {form.first_name} {form.last_name}
          </h1>
          <p className="masthead-meta">
            {form.role || 'Resident'}, {community.community_name}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="status status-closed" style={{ marginBottom: 'var(--s2)', display: 'inline-block' }}>
            Verified Member
          </span>
          <p className="mono">{form.email}</p>
        </div>
      </header>

      {/* Quick Role Switcher Bar */}
      <section className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)' }}>
        <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>
          Active User Role & Session Switcher
        </p>
        <p className="sm faint" style={{ marginBottom: 'var(--s3)' }}>
          Switch active user session to test role-specific features across the site:
        </p>
        <div className="cluster" style={{ gap: 'var(--s2)' }}>
          {demoUsers.map((u) => {
            const isActive = user.role === u.role;
            return (
              <button
                key={u.role}
                type="button"
                className={`btn${isActive ? ' btn-solid' : ''}`}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.75rem',
                  borderColor: isActive ? 'var(--signal)' : 'var(--line-hi)',
                  color: isActive ? '#fff' : 'var(--paper)',
                  backgroundColor: isActive ? 'var(--signal)' : 'transparent',
                }}
                onClick={() => switchUser(u.role)}
              >
                {u.role} ({u.first_name})
              </button>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Personal details</p>
        </div>

        <div className="fields">
          <div className="field">
            <label className="eyebrow" htmlFor="first-name">
              First name
            </label>
            <input
              id="first-name"
              className="control"
              value={form.first_name || ''}
              onChange={(event) => setField('first_name', event.target.value)}
            />
          </div>
          <div className="field">
            <label className="eyebrow" htmlFor="last-name">
              Last name
            </label>
            <input
              id="last-name"
              className="control"
              value={form.last_name || ''}
              onChange={(event) => setField('last_name', event.target.value)}
            />
          </div>
          <div className="field">
            <label className="eyebrow" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="control"
              value={form.email || ''}
              onChange={(event) => setField('email', event.target.value)}
            />
          </div>
          <div className="field">
            <label className="eyebrow" htmlFor="phone">
              Phone number
            </label>
            <input
              id="phone"
              className="control"
              value={form.phone_number || ''}
              onChange={(event) => setField('phone_number', event.target.value)}
            />
          </div>
          <div className="field field-wide">
            <label className="eyebrow" htmlFor="address">
              Address
            </label>
            <input
              id="address"
              className="control"
              value={form.address || ''}
              onChange={(event) => setField('address', event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Notifications</p>
        </div>
        <div>
          {SETTINGS.map((item) => (
            <Toggle
              key={item.key}
              label={item.label}
              hint={item.hint}
              checked={Boolean(form[item.key])}
              onChange={(value) => setField(item.key, value)}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Membership & Status</p>
          <span className="status status-closed">Verified Member</span>
        </div>
        <ul className="ledger">
          <li className="entry">
            <h3 className="entry-title">{community.community_name}</h3>
            <span className="entry-aside mono">{community.member_count} members</span>
            <div className="entry-meta">
              <span>
                {community.suburb}, {community.city}, {community.province}
              </span>
              <span>Account Status: Verified</span>
            </div>
          </li>
        </ul>
      </section>

      <div className="cluster" style={{ justifyContent: 'space-between' }}>
        <div className="cluster">
          <button type="submit" className="btn btn-solid">
            Save changes
          </button>
          {saved ? <span className="mono">Saved</span> : null}
        </div>

        <button type="button" className="btn" style={{ borderColor: 'var(--line-hi)' }} onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </form>
  );
}

export default Profile;
