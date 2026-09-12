import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon';
import DataTable, { CellTime } from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { Card, SectionBar, Toast } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const KNOWN_PASSES = {
  '492-801': {
    code: 'CK-492',
    pin: '492-801',
    name: 'Sipho Ndlovu',
    category: 'Contractor',
    visitor: 'Sipho Ndlovu',
    host: 'Thabo Mokoena (Unit 14)',
    vehicle: 'GP 88 YZ (White Ford Ranger)',
    validity: 'Valid today until 18:00',
    type: 'Contractor pass',
  },
  '492801': {
    code: 'CK-492',
    pin: '492-801',
    name: 'Sipho Ndlovu',
    category: 'Contractor',
    visitor: 'Sipho Ndlovu',
    host: 'Thabo Mokoena (Unit 14)',
    vehicle: 'GP 88 YZ (White Ford Ranger)',
    validity: 'Valid today until 18:00',
    type: 'Contractor pass',
  },
  'CK-492': {
    code: 'CK-492',
    pin: '492-801',
    name: 'Sipho Ndlovu',
    category: 'Contractor',
    visitor: 'Sipho Ndlovu',
    host: 'Thabo Mokoena (Unit 14)',
    vehicle: 'GP 88 YZ (White Ford Ranger)',
    validity: 'Valid today until 18:00',
    type: 'Contractor pass',
  },
  '108-942': {
    code: 'CK-108',
    pin: '108-942',
    name: 'Elena Rostova',
    category: 'Guest',
    visitor: 'Elena Rostova',
    host: 'Sarah Jenkins (Unit 42)',
    vehicle: 'CA 492 101 (Silver VW Polo)',
    validity: 'Valid tomorrow until 12:00',
    type: 'Guest pass',
  },
  '108942': {
    code: 'CK-108',
    pin: '108-942',
    name: 'Elena Rostova',
    category: 'Guest',
    visitor: 'Elena Rostova',
    host: 'Sarah Jenkins (Unit 42)',
    vehicle: 'CA 492 101 (Silver VW Polo)',
    validity: 'Valid tomorrow until 12:00',
    type: 'Guest pass',
  },
  '771-304': {
    code: 'CK-771',
    pin: '771-304',
    name: 'Kabelo Dlamini',
    category: 'Courier',
    visitor: 'Kabelo Dlamini',
    host: 'Marcus Vance (Unit 07)',
    vehicle: 'NP 123 456 (Blue Hyundai H100)',
    validity: 'Valid today until 20:00',
    type: 'Delivery pass',
  },
  '771304': {
    code: 'CK-771',
    pin: '771-304',
    name: 'Kabelo Dlamini',
    category: 'Courier',
    visitor: 'Kabelo Dlamini',
    host: 'Marcus Vance (Unit 07)',
    vehicle: 'NP 123 456 (Blue Hyundai H100)',
    validity: 'Valid today until 20:00',
    type: 'Delivery pass',
  },
};

const INITIAL_SCANS = [
  { id: 'scan-1', timestamp: '17:32:10', name: 'Sipho Ndlovu', category: 'Contractor', host: 'Thabo Mokoena (Unit 14)', vehicle: 'GP 88 YZ', code: 'CK-492', status: 'Authorized', gate: 'Main Gate 01' },
  { id: 'scan-2', timestamp: '16:45:00', name: 'Elena Rostova', category: 'Guest', host: 'Sarah Jenkins (Unit 42)', vehicle: 'CA 492 101', code: 'CK-108', status: 'Authorized', gate: 'Main Gate 01' },
  { id: 'scan-3', timestamp: '15:10:42', name: 'Johan Smith', category: 'Guest', host: 'Leseli Morakile (Unit 22)', vehicle: 'GP 482 CP', code: 'CK-304', status: 'Authorized', gate: 'Main Gate 01' },
  { id: 'scan-4', timestamp: '14:05:18', name: 'Kabelo Dlamini', category: 'Courier', host: 'Marcus Vance (Unit 07)', vehicle: 'NP 123 456', code: 'CK-771', status: 'Authorized', gate: 'Main Gate 01' },
  { id: 'scan-5', timestamp: '12:20:05', name: 'City Power Dispatcher', category: 'Utility', host: 'Estate Management Office', vehicle: 'B329 GP', code: 'CK-901', status: 'Authorized', gate: 'Main Gate 01' },
];

function GuardhouseDashboard() {
  const { currentUser } = useAuth();
  const [pinInput, setPinInput] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');
  const [scansFeed, setScansFeed] = useState(INITIAL_SCANS);
  const [terminalNotice, setTerminalNotice] = useState('');
  const [clock, setClock] = useState(new Date().toLocaleTimeString());
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const expected = useMemo(() => {
    const seen = new Set();
    return Object.values(KNOWN_PASSES)
      .filter((p) => (seen.has(p.code) ? false : seen.add(p.code)))
      .sort((a, b) => Number(b.validity.includes('today')) - Number(a.validity.includes('today')));
  }, []);

  const cleanSubmitted = submittedCode.trim().toUpperCase();
  const matchedPass = KNOWN_PASSES[cleanSubmitted] || KNOWN_PASSES[cleanSubmitted.replace('-', '')];
  const hasSubmitted = cleanSubmitted.length > 0;

  const flash = (message, ms) => {
    setTerminalNotice(message);
    setTimeout(() => setTerminalNotice((current) => (current === message ? '' : current)), ms);
  };

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
      name: matchedPass.name || matchedPass.visitor,
      category: matchedPass.category || 'Guest',
      host: matchedPass.host,
      vehicle: matchedPass.vehicle.split(' (')[0],
      code: matchedPass.code,
      status: 'Authorized',
      gate: 'Main Gate 01',
    };
    setScansFeed((prev) => [newScan, ...prev.slice(0, 4)]);
    flash(`Boom gate raised. Entry authorised for ${matchedPass.name || matchedPass.visitor} at ${timeStr}.`, 6000);
    setPinInput('');
    setSubmittedCode('');
  };

  const handleSimulateScan = (scannedCode) => {
    setPinInput(scannedCode);
    setSubmittedCode(scannedCode.trim().toUpperCase());
    setQrModalOpen(false);
    flash(`Code ${scannedCode} read from the scanner.`, 5000);
  };

  const guardName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Sipho Dlamini';

  return (
    <div className="page">
      <SectionBar
        icon="gate"
        title="Main gate, station 01"
        stats={[
          { label: 'On duty:', value: guardName },
          { label: 'Entries shown:', value: scansFeed.length },
          { label: 'Passes expected:', value: expected.length },
        ]}
      >
        <span className="clock" aria-label="Terminal clock">
          {clock}
        </span>
      </SectionBar>

      <div className="grid grid-3">
        <Card className="span-2" title="Verify a visitor" sub="Type the PIN or pass reference, or scan the code on their phone">
          <form onSubmit={handleVerify} className="row" style={{ gap: 8, alignItems: 'stretch' }}>
            <label htmlFor="gate-pin" className="sr-only">
              Gate PIN or pass reference
            </label>
            <input
              id="gate-pin"
              type="text"
              className="control control-xl"
              placeholder="492-801"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setSubmittedCode('');
              }}
              autoComplete="off"
              autoFocus
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary btn-lg" style={{ height: 48 }}>
              Verify
            </button>
            <button type="button" className="btn btn-lg" style={{ height: 48 }} onClick={() => setQrModalOpen(true)}>
              <Icon name="qr" />
              Scan code
            </button>
          </form>

          <div style={{ marginTop: 14 }}>
            {hasSubmitted ? (
              matchedPass ? (
                <div className="verdict verdict-ok">
                  <div className="verdict-head">
                    <span className="row">
                      <Icon name="checkCircle" />
                      Valid pass
                    </span>
                    <span className="sm">
                      {matchedPass.code}, {matchedPass.type.toLowerCase()}
                    </span>
                  </div>
                  <div className="verdict-body">
                    <dl className="verdict-grid">
                      <div>
                        <dt>Visiting</dt>
                        <dd>{matchedPass.host}</dd>
                      </div>
                      <div>
                        <dt>Visitor</dt>
                        <dd>{matchedPass.visitor}</dd>
                      </div>
                      <div>
                        <dt>Vehicle</dt>
                        <dd>{matchedPass.vehicle}</dd>
                      </div>
                      <div>
                        <dt>Expiry</dt>
                        <dd>{matchedPass.validity}</dd>
                      </div>
                    </dl>
                    <button type="button" className="btn btn-primary btn-lg btn-block" style={{ marginTop: 16 }} onClick={handleAuthorizeEntry}>
                      <Icon name="gate" />
                      Authorise entry and raise the boom
                    </button>
                  </div>
                </div>
              ) : (
                <div className="verdict verdict-bad">
                  <div className="verdict-head">
                    <span className="row">
                      <Icon name="x_circle" />
                      Access denied
                    </span>
                    <span className="sm">{cleanSubmitted}</span>
                  </div>
                  <div className="verdict-body ink-2">
                    This code is not in the active gate ledger or has expired. Ask the host resident to create a new pass.
                  </div>
                </div>
              )
            ) : (
              <div className="waiting">
                <Icon name="ticket" />
                Waiting for a PIN or a scanned pass
              </div>
            )}
          </div>
        </Card>

        <Card title="Passes expected" sub="Tap one to check it" flush ruled>
          {expected.map((p) => (
            <button
              type="button"
              className="list-row"
              key={p.code}
              onClick={() => {
                setPinInput(p.pin);
                setSubmittedCode(p.pin.trim().toUpperCase());
              }}
            >
              <span className="list-main">
                <span className="list-title">{p.visitor}</span>
                <span className="list-meta" style={{ marginTop: 2, '--meta-col': '100px' }}>
                  <span className="code">{p.pin}</span>
                  <span>{p.category}</span>
                  <MetaClock text={p.validity.replace('Valid ', '')} />
                </span>
              </span>
              <Icon name="chevronRight" className="muted" />
            </button>
          ))}
        </Card>
      </div>

      <Card title="Recent authorised entries" sub="Main gate 01 ledger" flush>
        <DataTable
          caption="Recent authorised entries"
          columns={[
            { key: 'time', header: 'Time', width: '120px', cell: (scan) => <CellTime>{scan.timestamp}</CellTime> },
            { key: 'pass', header: 'Pass', width: '110px', cell: (scan) => <span className="code">{scan.code}</span> },
            { key: 'visitor', header: 'Visitor', cell: (scan) => <span className="cell-title">{scan.name || scan.visitor}</span> },
            { key: 'type', header: 'Type', width: '130px', cell: (scan) => scan.category || scan.type || 'Guest' },
            { key: 'host', header: 'Resident host', width: '24%', cell: (scan) => scan.host },
            {
              key: 'vehicle',
              header: 'Vehicle',
              width: '140px',
              cell: (scan) => (
                <span className="code" style={{ fontWeight: 500 }}>
                  {scan.vehicle}
                </span>
              ),
            },
            { key: 'status', header: 'Status', width: '140px', cell: (scan) => <StatusBadge status={scan.status} /> },
          ]}
          rows={scansFeed}
        />
      </Card>

      {qrModalOpen ? (
        <Modal
          title="Scan a pass"
          onClose={() => setQrModalOpen(false)}
          footer={
            <>
              <button type="button" className="btn push" onClick={() => setQrModalOpen(false)}>
                Close scanner
              </button>
              <button type="button" className="btn" onClick={() => handleSimulateScan('999-000')}>
                Simulate expired pass
              </button>
              <button type="button" className="btn btn-primary" onClick={() => handleSimulateScan('CK-492')}>
                Simulate valid pass
              </button>
            </>
          }
        >
          <div className="viewfinder">
            <i />
            <i />
            <i />
            <i />
            Hold the visitor's code inside the frame
          </div>
          <p className="hint" style={{ marginTop: 10 }}>
            The camera at main gate 01 reads the code automatically. Use the buttons below to demonstrate a scan.
          </p>
        </Modal>
      ) : null}

      <Toast message={terminalNotice} />
    </div>
  );
}

function MetaClock({ text }) {
  return (
    <span className="meta-item">
      <Icon name="clock" />
      {text}
    </span>
  );
}

export default GuardhouseDashboard;
