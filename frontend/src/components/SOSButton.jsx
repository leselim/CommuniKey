import React, { useCallback, useEffect, useState } from 'react';
import { save } from '../services/api';
import { formatClock } from '../utils/format';

const COUNTDOWN_SECONDS = 5;

/** Resolves to coordinates, or null if unavailable or declined (US-011). */
function readPosition(enabled) {
  return new Promise((resolve) => {
    if (!enabled || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: Number(position.coords.latitude.toFixed(5)),
          longitude: Number(position.coords.longitude.toFixed(5)),
        }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 60000 }
    );
  });
}

function SOSButton() {
  const [phase, setPhase] = useState('idle'); // idle | arming | live
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const [shareLocation, setShareLocation] = useState(true);
  const [alert, setAlert] = useState(null);
  const [resolvedAt, setResolvedAt] = useState(null);

  const dispatch = useCallback(async () => {
    setPhase('live');
    const coordinates = await readPosition(shareLocation);
    const payload = {
      status: 'Active',
      time_activated: new Date().toISOString(),
      ...coordinates,
    };
    const saved = await save('/sos', payload);
    setAlert(saved && saved.id ? saved : payload);
  }, [shareLocation]);

  useEffect(() => {
    if (phase !== 'arming') return undefined;
    if (seconds <= 0) {
      dispatch();
      return undefined;
    }
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, seconds, dispatch]);

  const arm = () => {
    setResolvedAt(null);
    setSeconds(COUNTDOWN_SECONDS);
    setPhase('arming');
  };

  /** US-012: an accidental alert can be cancelled during the countdown. */
  const cancel = () => {
    setPhase('idle');
    setSeconds(COUNTDOWN_SECONDS);
  };

  const resolve = async () => {
    if (alert && alert.id) await save(`/sos/${alert.id}/resolve`, {}, 'put');
    setAlert(null);
    setPhase('idle');
    setSeconds(COUNTDOWN_SECONDS);
    setResolvedAt(new Date().toISOString());
  };

  if (phase === 'arming') {
    return (
      <section className="sos live" aria-live="assertive">
        <div className="sos-copy">
          <p className="eyebrow">Emergency</p>
          <h2>Alert dispatching</h2>
          <p>Cancel now if this was triggered by accident.</p>
        </div>
        <div className="sos-action">
          <span className="sos-count">{String(seconds).padStart(2, '0')}</span>
          <button type="button" className="btn btn-block" onClick={cancel}>
            Cancel alert
          </button>
        </div>
      </section>
    );
  }

  if (phase === 'live') {
    return (
      <section className="sos live" aria-live="assertive">
        <div className="sos-copy">
          <p className="eyebrow">
            <span className="live-dot" aria-hidden="true" /> Alert active
          </p>
          <h2>Responders have been notified</h2>
          <p className="mono">
            {alert && alert.time_activated ? `Activated ${formatClock(alert.time_activated)}` : 'Activating'}
            {alert && alert.latitude
              ? ` / ${alert.latitude}, ${alert.longitude}`
              : ' / location not shared'}
          </p>
        </div>
        <div className="sos-action">
          <button type="button" className="btn btn-solid" onClick={resolve}>
            Mark myself safe
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="sos">
      <div className="sos-copy">
        <p className="eyebrow">Emergency</p>
        <h2>Send an SOS alert</h2>
        <p>
          Nearby members, safety volunteers and community administrators are notified
          immediately. You have {COUNTDOWN_SECONDS} seconds to cancel before the alert is
          dispatched.
        </p>
        {resolvedAt ? (
          <p className="mono sos-note">
            Last alert resolved {formatClock(resolvedAt)}
          </p>
        ) : null}
      </div>
      <div className="sos-action">
        <button type="button" className="sos-trigger" onClick={arm}>
          Activate SOS
        </button>
        <label className="sos-opt">
          <input
            type="checkbox"
            checked={shareLocation}
            onChange={(event) => setShareLocation(event.target.checked)}
          />
          Share my location
        </label>
      </div>
    </section>
  );
}

export default SOSButton;
