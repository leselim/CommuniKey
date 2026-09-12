import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import { Card, Details, Toast } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { save } from '../services/api';
import { community, profile as demoProfile } from '../services/demoData';

const SETTINGS_KEY = 'ccp_notification_settings';

const SETTINGS = [
  { key: 'notify_emergency', label: 'Emergency alerts', hint: 'Whenever an SOS is raised near your address.' },
  { key: 'notify_announcements', label: 'Estate notices', hint: 'When management publishes a notice.' },
  { key: 'notify_events', label: 'Event reminders', hint: 'Before an event you said you would attend.' },
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
        <p className="setting-label">{label}</p>
        <p className="hint">{hint}</p>
      </div>
      <button type="button" className="toggle" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}>
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
      JSON.stringify(SETTINGS.reduce((acc, item) => ({ ...acc, [item.key]: Boolean(form[item.key]) }), {}))
    );
    updateProfile(form);
    await save('/auth/profile', form, 'put');
    setDirty(false);
    setNotice('Your details have been saved.');
    setTimeout(() => setNotice(''), 4000);
  };

  const fullName = `${form.first_name || ''} ${form.last_name || ''}`.trim() || 'Your account';

  return (
    <form className="page" onSubmit={submit}>
      <section className="sbar" aria-label="Your account">
        <div className="profile-head">
          <Avatar name={fullName} size="lg" />
          <div>
            <h2 style={{ fontSize: 'var(--fs-15)' }}>{fullName}</h2>
            <div className="profile-tags" style={{ marginTop: 3 }}>
              <StatusBadge status="Verified" />
              <span className="pill pill-plain">{form.role || 'Resident'}</span>
              <span className="hint">{community.community_name}</span>
            </div>
          </div>
        </div>
        <div className="sbar-actions" style={{ marginLeft: 'auto' }}>
          {dirty ? <span className="hint">You have unsaved changes</span> : null}
          <button type="submit" className="btn btn-primary" disabled={!dirty}>
            {dirty ? (
              'Save changes'
            ) : (
              <>
                <Icon name="check" />
                Saved
              </>
            )}
          </button>
        </div>
      </section>

      <div className="grid grid-3" style={{ alignItems: 'start' }}>
        <Card className="span-2" title="Your details" sub="Visible to estate management" ruled>
          <div className="fields" style={{ paddingTop: 12 }}>
            <div className="field">
              <label htmlFor="first-name">First name</label>
              <input id="first-name" className="control" autoComplete="given-name" value={form.first_name || ''} onChange={(event) => setField('first_name', event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="last-name">Last name</label>
              <input id="last-name" className="control" autoComplete="family-name" value={form.last_name || ''} onChange={(event) => setField('last_name', event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" className="control" autoComplete="email" value={form.email || ''} onChange={(event) => setField('email', event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input id="phone" type="tel" className="control" autoComplete="tel" value={form.phone_number || ''} onChange={(event) => setField('phone_number', event.target.value)} />
            </div>
            <div className="field field-wide">
              <label htmlFor="address">Street address</label>
              <input id="address" className="control" autoComplete="street-address" value={form.address || ''} onChange={(event) => setField('address', event.target.value)} />
              <span className="hint">Patrols use this to find you during an emergency. Keep it accurate.</span>
            </div>
          </div>
        </Card>

        <div className="col">
          <Card title="Notifications" sub="Emergency alerts cannot be muted entirely" ruled>
            {SETTINGS.map((item) => (
              <Toggle
                key={item.key}
                label={item.label}
                hint={item.hint}
                checked={Boolean(form[item.key])}
                onChange={(value) => setField(item.key, value)}
              />
            ))}
          </Card>

          <Card title="Membership" actions={<StatusBadge status="Verified" />} ruled>
            <Details
              rows={[
                { label: 'Community', value: community.community_name },
                { label: 'Location', value: `${community.suburb}, ${community.city}, ${community.province}` },
                { label: 'Members', value: community.member_count },
              ]}
            />
          </Card>
        </div>
      </div>

      <Toast message={notice} />
    </form>
  );
}

export default Profile;
