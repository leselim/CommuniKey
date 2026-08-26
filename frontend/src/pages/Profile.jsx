import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api, { save, unwrap } from '../services/api';
import { community, profile as demoProfile } from '../services/demoData';

const SETTINGS_KEY = 'ccp_notification_settings';

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
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (currentUser) {
      setForm((current) => ({ ...current, ...currentUser }));
    }
  }, [currentUser]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
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
    setSaved(true);
    setNotice('Profile details saved successfully.');
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <form className="stack" onSubmit={submit}>
      <header className="masthead">
        <div>
          <p className="eyebrow" style={{ color: 'var(--signal)' }}>Account Profile</p>
          <h1>
            {form.first_name} {form.last_name}
          </h1>
          <p className="masthead-meta">
            {form.role || 'Resident'}, {community.community_name}
          </p>
        </div>
        <div className="cluster">
          <p className="mono">{form.email}</p>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Personal details</p>
          <StatusBadge status={`Verified (${form.role || 'Resident'})`} />
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
          <p className="eyebrow">Membership</p>
          <StatusBadge status="Verified" />
        </div>
        <ul className="ledger">
          <li className="entry">
            <h3 className="entry-title">{community.community_name}</h3>
            <span className="entry-aside mono">{community.member_count} members</span>
            <div className="entry-meta">
              <span>
                {community.suburb}, {community.city}, {community.province}
              </span>
            </div>
          </li>
        </ul>
      </section>

      <div className="cluster">
        <button type="submit" className="btn btn-solid">
          Save changes
        </button>
        {saved ? <span className="mono">Saved</span> : null}
      </div>
    </form>
  );
}

export default Profile;
