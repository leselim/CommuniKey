import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { save } from '../services/api';
import { community, profile as demoProfile } from '../services/demoData';

const SETTINGS_KEY = 'ccp_notification_settings';

const SETTINGS = [
  {
    key: 'notify_emergency',
    label: 'Emergency alerts',
    hint: 'Whenever an SOS is raised near your address.',
  },
  {
    key: 'notify_announcements',
    label: 'Estate announcements',
    hint: 'When management publishes a notice.',
  },
  {
    key: 'notify_events',
    label: 'Event reminders',
    hint: 'Before an event you said you would attend.',
  },
];

function loadStoredSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch (error) {
    return {};
  }
}

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
  const { currentUser, updateProfile } = useAuth();

  const [form, setForm] = useState({
    ...demoProfile,
    ...(currentUser || {}),
    ...loadStoredSettings(),
  });
  const [notice, setNotice] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setForm((current) => ({ ...current, ...currentUser }));
    }
  }, [currentUser]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(
        SETTINGS.reduce((acc, item) => ({ ...acc, [item.key]: Boolean(form[item.key]) }), {})
      )
    );
    updateProfile(form);
    await save('/auth/profile', form, 'put');
    setDirty(false);
    setNotice('Your details have been saved.');
    setTimeout(() => setNotice(''), 4000);
  };

  const fullName = `${form.first_name || ''} ${form.last_name || ''}`.trim() || 'Your account';

  return (
    <form className="stack" style={{ gap: 'var(--s6)' }} onSubmit={submit}>
      <header className="profile-head">
        <Avatar name={fullName} size="xl" ring />
        <div className="profile-id">
          <span className="profile-name">{fullName}</span>
          <div className="profile-tags">
            <StatusBadge status="Verified" />
            <span className="chip chip-plain">{form.role || 'Resident'}</span>
            <span className="sm faint">{community.community_name}</span>
          </div>
        </div>
        <div className="profile-actions">
          <button type="submit" className="btn btn-solid" disabled={!dirty}>
            {dirty ? 'Save changes' : 'Saved'}
          </button>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      <section className="section">
        <div className="section-head">
          <h2>Your details</h2>
          <span className="sm faint">Visible to estate management</span>
        </div>

        <div className="fields">
          <div className="field">
            <label htmlFor="first-name">First name</label>
            <input
              id="first-name"
              className="control"
              autoComplete="given-name"
              value={form.first_name || ''}
              onChange={(event) => setField('first_name', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="last-name">Last name</label>
            <input
              id="last-name"
              className="control"
              autoComplete="family-name"
              value={form.last_name || ''}
              onChange={(event) => setField('last_name', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="control"
              autoComplete="email"
              value={form.email || ''}
              onChange={(event) => setField('email', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              type="tel"
              className="control"
              autoComplete="tel"
              value={form.phone_number || ''}
              onChange={(event) => setField('phone_number', event.target.value)}
            />
          </div>
          <div className="field field-wide">
            <label htmlFor="address">Street address</label>
            <input
              id="address"
              className="control"
              autoComplete="street-address"
              value={form.address || ''}
              onChange={(event) => setField('address', event.target.value)}
            />
            <span className="hint">
              Patrols use this to find you during an emergency. Keep it accurate.
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Notifications</h2>
          <span className="sm faint">Emergency alerts cannot be muted entirely</span>
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
          <h2>Membership</h2>
          <StatusBadge status="Verified" />
        </div>
        <div className="details">
          <div className="details-row">
            <span className="details-label">Community</span>
            <span className="details-value">{community.community_name}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Location</span>
            <span className="details-value">
              {community.suburb}, {community.city}, {community.province}
            </span>
          </div>
          <div className="details-row">
            <span className="details-label">Members</span>
            <span className="details-value nums">{community.member_count}</span>
          </div>
        </div>
      </section>
    </form>
  );
}

export default Profile;
