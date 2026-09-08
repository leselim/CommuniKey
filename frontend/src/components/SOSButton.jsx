import React, { useCallback, useEffect, useState } from 'react';
import Modal from './Modal';
import { save } from '../services/api';
import { formatClock } from '../utils/format';

const COUNTDOWN_SECONDS = 5;

/*
 * Emergency SOS.
 *
 * Idle, this is a single anchored button in the corner - nothing more.
 * The explanation and the location choice live in a dialog, so no body
 * copy is ever floating over the page behind it.
 *
 * Once an alert is live it stops being a floating element entirely and
 * renders as a banner in the normal flow of the page, because an active
 * emergency is the most important thing on screen and must not be able to
 * hide anything or be scrolled out from under.
 */

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
  const [phase, setPhase] = useState('idle'); // idle | confirm | arming | live
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
      <section className="sos-live" aria-live="assertive">
        <div>
          <p className="sos-live-title">
            <span className="sos-live-dot" aria-hidden="true" />
            SOS alert is live
          </p>
          <p className="sos-copy" style={{ marginTop: 'var(--s2)' }}>
            Safety volunteers, patrol officers and estate management have been notified.
          </p>
          <p className="sos-note" style={{ marginTop: 'var(--s2)' }}>
            {alert && alert.time_activated
              ? `Sent at ${formatClock(alert.time_activated)}`
              : 'Sending'}
            {alert && alert.latitude
              ? ` · location ${alert.latitude}, ${alert.longitude}`
              : ' · location not shared'}
          </p>
        </div>
        <div className="sos-action">
          <button type="button" className="btn btn-solid" onClick={resolve}>
            I am safe now
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="sos">
        <button type="button" className="sos-trigger" onClick={() => setPhase('confirm')}>
          Emergency SOS
        </button>
      </div>

      {phase === 'confirm' ? (
        <Modal
          title="Send an SOS alert"
          onClose={cancel}
          footer={
            <>
              <button type="button" className="btn" onClick={cancel}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={arm}>
                Send alert
              </button>
            </>
          }
        >
          <p className="sos-copy">
            Nearby members, safety volunteers and estate management are notified straight away.
            You will have {COUNTDOWN_SECONDS} seconds to stop it before it goes out.
          </p>

          <label className="sos-opt">
            <input
              type="checkbox"
              checked={shareLocation}
              onChange={(event) => setShareLocation(event.target.checked)}
            />
            Share my location with responders
          </label>

          {resolvedAt ? (
            <p className="sos-note" style={{ marginTop: 'var(--s4)' }}>
              Your last alert was closed at {formatClock(resolvedAt)}.
            </p>
          ) : null}
        </Modal>
      ) : null}

      {phase === 'arming' ? (
        <Modal
          title="Sending in a moment"
          onClose={cancel}
          footer={
            <button type="button" className="btn btn-danger btn-block" onClick={cancel}>
              Stop, this was a mistake
            </button>
          }
        >
          <p className="sos-count" aria-live="assertive">
            {seconds}
          </p>
          <p className="sos-copy" style={{ marginTop: 'var(--s4)', textAlign: 'center' }}>
            The alert goes out when this reaches zero.
          </p>
        </Modal>
      ) : null}
    </>
  );
}

export default SOSButton;
