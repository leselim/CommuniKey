import React, { useMemo, useState } from 'react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import useCollection from '../hooks/useCollection';
import {
  directMessages as demoDirectMessages,
  members as demoMembers,
} from '../services/demoData';
import { formatRelative, formatStamp } from '../utils/format';

function playPingChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 tone
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

const CATEGORIES = [
  'Urgent Neighbor Emergency',
  'Report Misconduct / Complaint',
  'Gate & Access Assistance',
  'General Neighbor Inquiry',
];

function Members() {
  const { items: memberList } = useCollection('/members', demoMembers);
  const { items: messageList, create: createMessage, update: updateMessage } = useCollection(
    '/direct-messages',
    demoDirectMessages
  );

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'messages'
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  // Form draft
  const [recipientRole, setRecipientRole] = useState('Community Administrator');
  const [recipientName, setRecipientName] = useState('Marcus Vance');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [messageText, setMessageText] = useState('');
  const [senderName, setSenderName] = useState('Resident Member');
  const [receipt, setReceipt] = useState('');

  // Admin response state
  const [respondingId, setRespondingId] = useState(null);
  const [responseText, setResponseText] = useState('');

  const visibleMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return memberList.filter(
      (m) =>
        !term ||
        `${m.first_name} ${m.last_name} ${m.role} ${m.address}`.toLowerCase().includes(term)
    );
  }, [memberList, search]);

  const handleOpenCompose = (member = null) => {
    if (member) {
      setSelectedRecipient(member);
      setRecipientName(`${member.first_name} ${member.last_name}`);
      setRecipientRole(member.role);
    } else {
      setSelectedRecipient(null);
      setRecipientName('Marcus Vance');
      setRecipientRole('Community Administrator');
    }
    setModalOpen(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    playPingChime();

    await createMessage({
      sender_name: senderName.trim() || 'Resident Member',
      recipient_role: recipientRole,
      recipient_name: recipientName,
      category,
      message: messageText.trim(),
      status: 'Awaiting Response',
      date_sent: new Date().toISOString(),
      response: '',
    });

    setMessageText('');
    setModalOpen(false);
    setReceipt(`Direct message and ping sent to ${recipientName}.`);
    setTimeout(() => setReceipt(''), 6000);
  };

  const handleAdminRespond = async (id) => {
    if (!responseText.trim()) return;
    await updateMessage(id, {
      response: responseText.trim(),
      status: 'Resolved',
    });
    setRespondingId(null);
    setResponseText('');
    setReceipt('Admin response published and resident notified.');
    setTimeout(() => setReceipt(''), 5000);
  };

  return (
    <div className="stack">
      <header className="masthead">
        <div>
          <p className="eyebrow">Communications Hub</p>
          <h1>Members & Direct Messages</h1>
          <p className="masthead-meta">
            Connect directly with estate neighbors, dispatch emergency pings, or reach community administrators.
          </p>
        </div>
        <div className="cluster">
          <button type="button" className="btn btn-solid" onClick={() => handleOpenCompose()}>
            Send Direct Message / Ping
          </button>
          <p className="mono">{memberList.length} verified members</p>
        </div>
      </header>

      {receipt ? <p className="notice">{receipt}</p> : null}

      {/* Tab Controls */}
      <div className="cluster" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 'var(--s3)' }}>
        <button
          type="button"
          className="link"
          style={{
            fontWeight: activeTab === 'directory' ? 600 : 400,
            color: activeTab === 'directory' ? 'var(--paper)' : 'var(--dim)',
            borderBottomColor: activeTab === 'directory' ? 'var(--signal)' : 'transparent',
          }}
          onClick={() => setActiveTab('directory')}
        >
          Verified Members Directory ({memberList.length})
        </button>
        <button
          type="button"
          className="link"
          style={{
            fontWeight: activeTab === 'messages' ? 600 : 400,
            color: activeTab === 'messages' ? 'var(--paper)' : 'var(--dim)',
            borderBottomColor: activeTab === 'messages' ? 'var(--signal)' : 'transparent',
          }}
          onClick={() => setActiveTab('messages')}
        >
          Direct Messages & Admin Hotline ({messageList.length})
        </button>
      </div>

      {activeTab === 'directory' ? (
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">Estate Member Directory</p>
            <input
              className="searchbar"
              type="search"
              placeholder="Search members by name, street, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <ul className="ledger">
            {visibleMembers.map((m) => (
              <li className="entry" key={m.id}>
                <div>
                  <h3 className="entry-title">
                    {m.first_name} {m.last_name}
                  </h3>
                  <p className="entry-body">
                    Address: {m.address} • Role: {m.role}
                  </p>
                </div>
                <span className="entry-aside cluster" style={{ gap: 'var(--s3)' }}>
                  <span className="status status-closed">Verified</span>
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    onClick={() => handleOpenCompose(m)}
                  >
                    Send Direct Ping
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">Direct Communications & Administrator Inbox</p>
          </div>

          <p className="sm faint" style={{ marginBottom: 'var(--s4)' }}>
            Direct inquiries, emergency pings, and misconduct reports sent to neighbors or community administrators.
          </p>

          <ul className="ledger">
            {messageList.map((msg) => (
              <li className="entry" key={msg.id} style={{ display: 'block', padding: 'var(--s4) 0' }}>
                <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
                  <div>
                    <span className="eyebrow">{msg.category}</span>
                    <h3 className="entry-title" style={{ marginTop: '2px' }}>
                      From {msg.sender_name} to {msg.recipient_name} ({msg.recipient_role})
                    </h3>
                  </div>
                  <StatusBadge status={msg.status === 'Resolved' ? 'Resolved' : 'Reported'} />
                </div>

                <p className="entry-body" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                  {msg.message}
                </p>

                <div className="entry-meta" style={{ marginBottom: 'var(--s3)' }}>
                  <span>Sent {formatRelative(msg.date_sent)}</span>
                  <span>{formatStamp(msg.date_sent)}</span>
                </div>

                {/* Administrator Response Section */}
                {msg.response ? (
                  <div
                    className="panel"
                    style={{
                      padding: 'var(--s3) var(--s4)',
                      backgroundColor: 'var(--panel-hi)',
                      borderLeft: '2px solid var(--signal)',
                      marginTop: 'var(--s2)',
                    }}
                  >
                    <p className="eyebrow" style={{ color: 'var(--signal)' }}>
                      Administrator Resolution
                    </p>
                    <p className="sm" style={{ color: 'var(--paper)', marginTop: '2px' }}>
                      {msg.response}
                    </p>
                  </div>
                ) : respondingId === msg.id ? (
                  <div className="stack" style={{ gap: 'var(--s2)', marginTop: 'var(--s3)' }}>
                    <textarea
                      className="control"
                      rows={2}
                      placeholder="Write administrator resolution or reply..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                    />
                    <div className="cluster">
                      <button
                        type="button"
                        className="btn btn-solid"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}
                        onClick={() => handleAdminRespond(msg.id)}
                      >
                        Publish Response & Resolve
                      </button>
                      <button
                        type="button"
                        className="btn"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}
                        onClick={() => setRespondingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="cluster" style={{ marginTop: 'var(--s2)' }}>
                    <button
                      type="button"
                      className="btn"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => {
                        setRespondingId(msg.id);
                        setResponseText('');
                      }}
                    >
                      Respond as Administrator
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Compose Message Modal */}
      {modalOpen ? (
        <Modal
          title="Send Direct Message / Emergency Ping"
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" form="direct-msg-form" className="btn btn-solid">
                Send Message & Ping
              </button>
            </>
          }
        >
          <form id="direct-msg-form" onSubmit={handleSendMessage} className="stack" style={{ gap: 'var(--s4)' }}>
            <div className="fields">
              <div className="field">
                <label className="eyebrow" htmlFor="msg-sender">
                  Your Name
                </label>
                <input
                  id="msg-sender"
                  className="control"
                  placeholder="Resident Member"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="eyebrow" htmlFor="msg-recipient">
                  Recipient
                </label>
                {selectedRecipient ? (
                  <input
                    id="msg-recipient"
                    className="control"
                    value={`${selectedRecipient.first_name} ${selectedRecipient.last_name} (${selectedRecipient.role})`}
                    disabled
                  />
                ) : (
                  <select
                    id="msg-recipient"
                    className="control"
                    value={recipientName}
                    onChange={(e) => {
                      const name = e.target.value;
                      setRecipientName(name);
                      const target = memberList.find((m) => `${m.first_name} ${m.last_name}` === name);
                      if (target) setRecipientRole(target.role);
                    }}
                    style={{ color: 'var(--paper)', backgroundColor: 'var(--ink)' }}
                  >
                    {memberList.map((m) => (
                      <option key={m.id} value={`${m.first_name} ${m.last_name}`}>
                        {m.first_name} {m.last_name} ({m.role})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="field">
              <label className="eyebrow" htmlFor="msg-category">
                Topic / Reason
              </label>
              <select
                id="msg-category"
                className="control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ color: 'var(--paper)', backgroundColor: 'var(--ink)' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="eyebrow" htmlFor="msg-body">
                Message & Details
              </label>
              <textarea
                id="msg-body"
                className="control"
                rows={4}
                placeholder="Describe your inquiry, emergency ping, or report for administrators..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                required
              />
              <p className="sm faint" style={{ marginTop: 'var(--s1)' }}>
                Sending will dispatch an instant audio chime ping and notify the recipient.
              </p>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

export default Members;
