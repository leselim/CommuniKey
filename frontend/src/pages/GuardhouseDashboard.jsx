import React, { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const KNOWN_PASSES = {
  '492-801': {
    code: 'CK-492',
    pin: '492-801',
    visitor: 'Sipho Ndlovu (Contractor - Plumbing)',
    host: 'Thabo Mokoena (Unit 14)',
    vehicle: 'GP 88 YZ (White Ford Ranger)',
    validity: 'Valid Today until 18:00',
    type: 'Contractor Pass',
  },
  '492801': {
    code: 'CK-492',
    pin: '492-801',
    visitor: 'Sipho Ndlovu (Contractor - Plumbing)',
    host: 'Thabo Mokoena (Unit 14)',
    vehicle: 'GP 88 YZ (White Ford Ranger)',
    validity: 'Valid Today until 18:00',
    type: 'Contractor Pass',
  },
  'CK-492': {
    code: 'CK-492',
    pin: '492-801',
    visitor: 'Sipho Ndlovu (Contractor - Plumbing)',
    host: 'Thabo Mokoena (Unit 14)',
    vehicle: 'GP 88 YZ (White Ford Ranger)',
    validity: 'Valid Today until 18:00',
    type: 'Contractor Pass',
  },
  '108-942': {
    code: 'CK-108',
    pin: '108-942',
    visitor: 'Elena Rostova (Guest)',
    host: 'Sarah Jenkins (Unit 42)',
    vehicle: 'CA 492 101 (Silver VW Polo)',
    validity: 'Valid Tomorrow until 12:00',
    type: 'Guest Pass',
  },
  '108942': {
    code: 'CK-108',
    pin: '108-942',
    visitor: 'Elena Rostova (Guest)',
    host: 'Sarah Jenkins (Unit 42)',
    vehicle: 'CA 492 101 (Silver VW Polo)',
    validity: 'Valid Tomorrow until 12:00',
    type: 'Guest Pass',
  },
  '771-304': {
    code: 'CK-771',
    pin: '771-304',
    visitor: 'Kabelo Dlamini (Courier - DHL)',
    host: 'Marcus Vance (Unit 07)',
    vehicle: 'NP 123 456 (Blue Hyundai H100)',
    validity: 'Valid Today until 20:00',
    type: 'Delivery Pass',
  },
  '771304': {
    code: 'CK-771',
    pin: '771-304',
    visitor: 'Kabelo Dlamini (Courier - DHL)',
    host: 'Marcus Vance (Unit 07)',
    vehicle: 'NP 123 456 (Blue Hyundai H100)',
    validity: 'Valid Today until 20:00',
    type: 'Delivery Pass',
  },
};

const INITIAL_SCANS = [
  {
    id: 'scan-1',
    timestamp: '17:32:10',
    visitor: 'Sipho Ndlovu (Contractor)',
    host: 'Thabo Mokoena (Unit 14)',
    vehicle: 'GP 88 YZ',
    code: 'CK-492',
    status: 'Authorized',
    gate: 'Main Gate 01',
  },
  {
    id: 'scan-2',
    timestamp: '16:45:00',
    visitor: 'Elena Rostova (Guest)',
    host: 'Sarah Jenkins (Unit 42)',
    vehicle: 'CA 492 101',
    code: 'CK-108',
    status: 'Authorized',
    gate: 'Main Gate 01',
  },
  {
    id: 'scan-3',
    timestamp: '15:10:42',
    visitor: 'Johan Smith (Resident Guest)',
    host: 'Leseli Morakile (Unit 22)',
    vehicle: 'GP 482 CP',
    code: 'CK-304',
    status: 'Authorized',
    gate: 'Main Gate 01',
  },
  {
    id: 'scan-4',
    timestamp: '14:05:18',
    visitor: 'Kabelo Dlamini (Courier)',
    host: 'Marcus Vance (Unit 07)',
    vehicle: 'NP 123 456',
    code: 'CK-771',
    status: 'Authorized',
    gate: 'Main Gate 01',
  },
  {
    id: 'scan-5',
    timestamp: '12:20:05',
    visitor: 'City Power Dispatcher',
    host: 'Estate Management Office',
    vehicle: 'B329 GP',
    code: 'CK-901',
    status: 'Authorized',
    gate: 'Main Gate 01',
  },
];

function GuardhouseDashboard() {
  const { currentUser } = useAuth();
  const [pinInput, setPinInput] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');
  const [scansFeed, setScansFeed] = useState(INITIAL_SCANS);
  const [terminalNotice, setTerminalNotice] = useState('');
  const [clock, setClock] = useState(new Date().toLocaleTimeString());
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Live Terminal Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const cleanSubmitted = submittedCode.trim().toUpperCase();
  const matchedPass = KNOWN_PASSES[cleanSubmitted] || KNOWN_PASSES[cleanSubmitted.replace('-', '')];
  const hasSubmitted = cleanSubmitted.length > 0;

  const handleVerify = (e) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) return;
    setSubmittedCode(pinInput.trim().toUpperCase());
  };

  const handleAuthorizeEntry = () => {
    if (!matchedPass) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newScan = {
      id: `scan-${Date.now()}`,
      timestamp: timeStr,
      visitor: matchedPass.visitor,
      host: matchedPass.host,
      vehicle: matchedPass.vehicle.split(' (')[0],
      code: matchedPass.code,
      status: 'Authorized',
      gate: 'Main Gate 01',
    };

    setScansFeed((prev) => [newScan, ...prev.slice(0, 4)]);
    setTerminalNotice(`BOOM GATE RAISED • Entry authorized for ${matchedPass.visitor} (${matchedPass.vehicle}) at ${timeStr}.`);
    setPinInput('');
    setSubmittedCode('');
    setTimeout(() => setTerminalNotice(''), 6000);
  };

  const handleScanQR = () => {
    setQrModalOpen(true);
  };

  const handleSimulateScan = (scannedCode) => {
    setPinInput(scannedCode);
    setSubmittedCode(scannedCode.trim().toUpperCase());
    setQrModalOpen(false);
    setTerminalNotice(`Optical QR Scanner: Code "${scannedCode}" captured from camera viewfinder.`);
    setTimeout(() => setTerminalNotice(''), 5000);
  };

  return (
    <div className="stack" style={{ gap: 'var(--s5)' }}>
      {/* GUARDHOUSE TERMINAL HEADER */}
      <header className="masthead" style={{ borderBottom: '1px solid var(--line-hi)', paddingBottom: 'var(--s4)' }}>
        <div>
          <p className="eyebrow" style={{ fontSize: '0.72rem', letterSpacing: '0.06em', color: 'var(--dim)', margin: '0 0 var(--s1) 0' }}>
            Station 01 — Main Entrance Guardhouse • Riverside Estate
          </p>
          <h1 style={{ fontSize: 'var(--fs-xl)', color: 'var(--paper)', margin: 0 }}>
            Main Guardhouse Terminal 01
          </h1>
          <p className="masthead-meta" style={{ color: 'var(--dim)', marginTop: 'var(--s1)' }}>
            Operator: {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Sipho Dlamini'} (Security Guard)
          </p>
        </div>

        <div className="stack" style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
          <span className="eyebrow faint" style={{ fontSize: '0.65rem', color: 'var(--dim)' }}>
            TERMINAL CLOCK
          </span>
          <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--paper)' }}>
            {clock}
          </span>
        </div>
      </header>

      {terminalNotice ? <p className="notice" style={{ borderLeftColor: '#10b981' }}>{terminalNotice}</p> : null}

      {/* CENTRAL VERIFICATION PANEL */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
        <div className="stack" style={{ gap: 'var(--s4)', maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <p className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--dim)', margin: 0 }}>
              Visitor Gate Verification
            </p>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--paper)', margin: 'var(--s1) 0 0 0' }}>
              Enter 6-Digit PIN or Scan Pass
            </h2>
          </div>

          <div>
            <form onSubmit={handleVerify}>
              <div className="cluster" style={{ gap: 'var(--s2)', alignItems: 'center' }}>
                <input
                  type="text"
                  className="control"
                  placeholder="Enter PIN (e.g. 492-801)"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setSubmittedCode('');
                  }}
                  style={{
                    flex: 1,
                    fontSize: '1.2rem',
                    fontFamily: 'monospace',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                    textAlign: 'left',
                    padding: 'var(--s3) var(--s4)',
                    backgroundColor: 'var(--panel-hi)',
                    borderColor: 'var(--line-hi)',
                    textTransform: 'uppercase',
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn btn-solid"
                  style={{ padding: 'var(--s3) var(--s4)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                >
                  Verify
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleScanQR}
                  style={{ padding: 'var(--s3) var(--s4)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                >
                  Scan QR Code
                </button>
              </div>
            </form>

            <div className="cluster" style={{ justifyContent: 'center', gap: 'var(--s2)', marginTop: 'var(--s2)' }}>
              <span className="sm faint" style={{ color: 'var(--dim)', fontSize: '0.72rem' }}>Test active PINs:</span>
              {['492-801', '108-942', '771-304'].map((code) => (
                <button
                  key={code}
                  type="button"
                  style={{
                    padding: '0.15rem 0.4rem',
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    border: '1px solid var(--line-hi)',
                    borderRadius: '3px',
                    backgroundColor: 'var(--ink)',
                    color: 'var(--paper)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setPinInput(code);
                    setSubmittedCode(code.trim().toUpperCase());
                  }}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* VERIFICATION LIFECYCLE RESULT */}
          {hasSubmitted ? (
            matchedPass ? (
              <div
                style={{
                  padding: 'var(--s4)',
                  backgroundColor: 'var(--panel-hi)',
                  border: '1px solid var(--line-hi)',
                  borderRadius: '6px',
                }}
              >
                <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s3)' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#10b981',
                      backgroundColor: 'var(--ink)',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--line-hi)',
                    }}
                  >
                    • Valid Pass
                  </span>
                  <span className="mono sm" style={{ color: 'var(--paper)', fontWeight: 600 }}>
                    {matchedPass.code} ({matchedPass.type})
                  </span>
                </div>

                <div className="grid-2" style={{ gap: 'var(--s3)', fontSize: '0.85rem' }}>
                  <div>
                    <span className="eyebrow" style={{ fontSize: '0.65rem', display: 'block', color: 'var(--dim)' }}>
                      RESIDENT HOST & UNIT
                    </span>
                    <strong style={{ color: 'var(--paper)', fontSize: '0.92rem' }}>{matchedPass.host}</strong>
                  </div>
                  <div>
                    <span className="eyebrow" style={{ fontSize: '0.65rem', display: 'block', color: 'var(--dim)' }}>
                      VISITOR NAME
                    </span>
                    <strong style={{ color: 'var(--paper)', fontSize: '0.92rem' }}>{matchedPass.visitor}</strong>
                  </div>
                  <div>
                    <span className="eyebrow" style={{ fontSize: '0.65rem', display: 'block', color: 'var(--dim)' }}>
                      VEHICLE REGISTRATION
                    </span>
                    <span className="mono" style={{ color: 'var(--paper)' }}>{matchedPass.vehicle}</span>
                  </div>
                  <div>
                    <span className="eyebrow" style={{ fontSize: '0.65rem', display: 'block', color: 'var(--dim)' }}>
                      PASS EXPIRY
                    </span>
                    <span style={{ color: 'var(--dim)' }}>{matchedPass.validity}</span>
                  </div>
                </div>

                <div style={{ marginTop: 'var(--s4)', textAlign: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-solid"
                    style={{
                      width: '100%',
                      padding: 'var(--s3)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                    onClick={handleAuthorizeEntry}
                  >
                    [ Authorize Entry & Release Gate ]
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: 'var(--s4)',
                  backgroundColor: 'var(--panel-hi)',
                  border: '1px solid #e11d48',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#e11d48',
                    backgroundColor: 'var(--ink)',
                    padding: '3px 10px',
                    borderRadius: '4px',
                    border: '1px solid var(--line-hi)',
                    display: 'inline-block',
                    marginBottom: 'var(--s2)',
                  }}
                >
                  • Access Denied
                </span>
                <p className="sm faint" style={{ color: 'var(--dim)', margin: 0, fontSize: '0.82rem' }}>
                  Access code "{cleanSubmitted}" was not found in active gate ledger or has expired. Please request host resident to generate a new pass.
                </p>
              </div>
            )
          ) : (
            <div
              style={{
                padding: 'var(--s4)',
                backgroundColor: 'var(--panel-hi)',
                border: '1px dashed var(--line-hi)',
                borderRadius: '6px',
                textAlign: 'center',
              }}
            >
              <p className="sm faint" style={{ color: 'var(--dim)', margin: 0 }}>
                Awaiting visitor pass scan or manual PIN entry...
              </p>
            </div>
          )}
        </div>
      </section>

      {/* RECENT SCANS FEED */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)', backgroundColor: 'var(--panel)' }}>
        <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s3)' }}>
          <p className="eyebrow" style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em', margin: 0 }}>
            RECENT AUTHORIZED VEHICLE SCANS (MAIN GATE 01 LEDGER)
          </p>
          <span className="mono sm faint" style={{ color: 'var(--dim)', fontSize: '0.72rem' }}>
            Live Audit Stream
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line-hi)', color: 'var(--dim)' }}>
                <th style={{ padding: '8px' }}>TIMESTAMP</th>
                <th style={{ padding: '8px' }}>CODE</th>
                <th style={{ padding: '8px' }}>VISITOR / CONTRACTOR</th>
                <th style={{ padding: '8px' }}>RESIDENT HOST</th>
                <th style={{ padding: '8px' }}>VEHICLE REG</th>
                <th style={{ padding: '8px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {scansFeed.map((scan) => (
                <tr key={scan.id} style={{ borderBottom: '1px solid var(--line-hi)' }}>
                  <td className="mono" style={{ padding: '10px 8px', color: 'var(--paper)' }}>{scan.timestamp}</td>
                  <td className="mono" style={{ padding: '10px 8px', color: 'var(--signal)', fontWeight: 600 }}>{scan.code}</td>
                  <td style={{ padding: '10px 8px', color: 'var(--paper)', fontWeight: 500 }}>{scan.visitor}</td>
                  <td style={{ padding: '10px 8px', color: 'var(--dim)' }}>{scan.host}</td>
                  <td className="mono" style={{ padding: '10px 8px', color: 'var(--paper)' }}>{scan.vehicle}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <StatusBadge status={scan.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* OPTICAL QR SCANNER MODAL */}
      {qrModalOpen ? (
        <Modal
          title="Guardhouse Optical QR Scanner"
          onClose={() => setQrModalOpen(false)}
          footer={
            <div className="cluster" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono sm" style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>
                Hardware Optical Camera Feed
              </span>
              <button type="button" className="btn" onClick={() => setQrModalOpen(false)}>
                Close Scanner
              </button>
            </div>
          }
        >
          <div className="stack" style={{ gap: 'var(--s4)', textAlign: 'center' }}>
            <p className="eyebrow" style={{ fontSize: '0.68rem', color: 'var(--dim)', margin: 0 }}>
              CAMERA VIEWFINDER ACTIVE • MAIN GATE 01 SCANNER
            </p>

            {/* Clean dark viewfinder frame with minimal corner reticle guidelines */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '200px',
                backgroundColor: 'var(--ink)',
                border: '1px solid var(--line-hi)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Thin Corner Brackets */}
              <div style={{ position: 'absolute', top: '24px', left: '24px', width: '24px', height: '24px', borderTop: '2px solid var(--dim)', borderLeft: '2px solid var(--dim)' }} />
              <div style={{ position: 'absolute', top: '24px', right: '24px', width: '24px', height: '24px', borderTop: '2px solid var(--dim)', borderRight: '2px solid var(--dim)' }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', width: '24px', height: '24px', borderBottom: '2px solid var(--dim)', borderLeft: '2px solid var(--dim)' }} />
              <div style={{ position: 'absolute', bottom: '24px', right: '24px', width: '24px', height: '24px', borderBottom: '2px solid var(--dim)', borderRight: '2px solid var(--dim)' }} />

              <span className="mono sm" style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>
                Position Visitor QR Code inside viewfinder
              </span>
            </div>

            {/* Simulation Actions */}
            <div className="cluster" style={{ justifyContent: 'center', gap: 'var(--s3)' }}>
              <button
                type="button"
                className="btn btn-solid"
                onClick={() => handleSimulateScan('CK-492')}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
              >
                Simulate Valid Pass (CK-492)
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => handleSimulateScan('999-000')}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
              >
                Simulate Expired Pass
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export default GuardhouseDashboard;
