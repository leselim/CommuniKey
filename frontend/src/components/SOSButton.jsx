import React, { useCallback, useEffect, useState } from 'react';
import Modal from './Modal';
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

  if (phase === 'live') {
    return (
      <section className="sos live" aria-live="assertive">
        <div className="sos-copy">
          <p className="eyebrow">
            <span className="live-dot" aria-hidden="true" /> SOS Dispatched · Live Alert Active
          </p>
          <h2 style={{ fontSize: 'var(--fs-lg)', color: 'var(--paper)', margin: '4px 0' }}>
            Responders & Patrol Officers Have Been Notified
          </h2>
          <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--dim)', margin: 0 }}>
            {alert && alert.time_activated ? `Activated ${formatClock(alert.time_activated)}` : 'Activating'}
            {alert && alert.latitude
              ? ` / Coordinates: ${alert.latitude}, ${alert.longitude}`
              : ' / location not shared'}
          </p>
        </div>
        <div className="sos-action">
          <button type="button" className="btn btn-solid" onClick={resolve}>
            Mark Myself Safe
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
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

      {/* SOS TRIGGER COUNTDOWN MODAL */}
      {phase === 'arming' ? (
        <Modal
          title="Emergency SOS Confirmation"
          onClose={cancel}
          footer={
            <div className="cluster" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono sm" style={{ color: 'var(--dim)' }}>
                Auto-dispatching in {seconds}s...
              </span>
              <button
                type="button"
                className="btn btn-solid"
                onClick={cancel}
                style={{ backgroundColor: '#e11d48', borderColor: '#e11d48', color: '#ffffff', fontWeight: 600 }}
              >
                Cancel SOS
              </button>
            </div>
          }
        >
          <div className="stack" style={{ textAlign: 'center', padding: 'var(--s4) 0', gap: 'var(--s3)' }}>
            <p className="eyebrow" style={{ color: '#e11d48', letterSpacing: '0.08em', margin: 0 }}>
              EMERGENCY ALERT DISPATCHING
            </p>

            <div
              style={{
                fontSize: '3.5rem',
                fontWeight: 700,
                color: 'var(--paper)',
                fontFamily: 'monospace',
                lineHeight: 1,
                padding: 'var(--s3)',
                border: '2px solid #e11d48',
                borderRadius: '8px',
                width: '90px',
                margin: '0 auto',
                backgroundColor: 'var(--panel-hi)',
              }}
            >
              0{seconds}
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
              Dispatching Emergency Dispatches to Patrol & Admin
            </h3>
            <p className="sm faint" style={{ color: 'var(--dim)', margin: 0 }}>
              Click <strong>Cancel SOS</strong> below immediately if this alert was triggered by accident.
            </p>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

export default SOSButton;

