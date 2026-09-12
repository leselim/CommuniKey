import React, { useCallback, useEffect, useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { save } from '../services/api';
import { formatClock } from '../utils/format';

const COUNTDOWN_SECONDS = 5;

/*
 * Emergency SOS.
 *
 * Idle, it is a single strip at the top of the resident's home with one red
 * button. The explanation and location choice live in a dialog. Once an
 * alert is live the strip becomes a solid red banner in the normal flow of
 * the page, because an active emergency is the most important thing on the
 * screen and must never be hidden or scrolled out from under.
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
        <div className="sos-live-text">
          <p className="sos-live-title">
            <span className="sos-live-dot" aria-hidden="true" />
            Your SOS alert is live
          </p>
          <p>Safety volunteers, patrol officers and estate management have been notified.</p>
          <p>
            {alert && alert.time_activated ? `Sent at ${formatClock(alert.time_activated)}. ` : 'Sending. '}
            {alert && alert.latitude
              ? `Location shared: ${alert.latitude}, ${alert.longitude}.`
              : 'Location not shared.'}
          </p>
        </div>
        <button type="button" className="btn btn-lg" onClick={resolve}>
          <Icon name="check" />I am safe now
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="sos-strip" aria-label="Emergency">
        <span className="badge-icon">
          <Icon name="siren" />
        </span>
        <div className="sos-strip-text">
          <strong>Emergency SOS</strong>
          <span>
            {resolvedAt
              ? `Your last alert was closed at ${formatClock(resolvedAt)}.`
              : 'Alerts safety volunteers, patrol and estate management at once.'}
          </span>
        </div>
        <button type="button" className="btn btn-danger" onClick={() => setPhase('confirm')}>
          Send SOS
        </button>
      </section>

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
          <p className="ink-2">
            Nearby members, safety volunteers and estate management are notified straight away. You will have{' '}
            {COUNTDOWN_SECONDS} seconds to stop it before it goes out.
          </p>

          <label className="checkbox" style={{ marginTop: 14 }}>
            <input type="checkbox" checked={shareLocation} onChange={(event) => setShareLocation(event.target.checked)} />
            Share my location with responders
          </label>
        </Modal>
      ) : null}

      {phase === 'arming' ? (
        <Modal
          title="Sending in a moment"
          onClose={cancel}
          footer={
            <button type="button" className="btn btn-lg btn-block" onClick={cancel}>
              Stop, this was a mistake
            </button>
          }
        >
          <div className="sos-count-ring">
            <p className="sos-count" aria-live="assertive">
              {seconds}
            </p>
          </div>
          <p className="ink-2" style={{ marginTop: 14, textAlign: 'center' }}>
            The alert goes out when this reaches zero.
          </p>
        </Modal>
      ) : null}
    </>
  );
}

export default SOSButton;
