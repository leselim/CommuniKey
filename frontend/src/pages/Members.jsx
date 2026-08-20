import React, { useEffect, useMemo, useRef, useState } from 'react';
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
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {}
}

const CATEGORIES = [
  'Urgent Neighbor Emergency',
  'Report Misconduct / Complaint',
  'Gate & Access Assistance',
  'General Neighbor Inquiry',
];

const INITIAL_CONVERSATIONS = [
  {
    id: 1,
    name: 'Marcus Vance',
    role: 'Community Administrator',
    address: '1 Clubhouse Way',
    online: true,
    unread: 1,
    messages: [
      {
        id: 'm1',
        sender: 'Marcus Vance',
        role: 'Community Administrator',
        text: 'Welcome to Riverside Estate communications hub. How can administration assist you today?',
        time: new Date(Date.now() - 3600000).toISOString(),
        isMe: false,
      },
      {
        id: 'm2',
        sender: 'Resident Member',
        role: 'Resident',
        text: 'Water leak reported near main gate on Riverside Drive.',
        time: new Date(Date.now() - 1800000).toISOString(),
        isMe: true,
      },
      {
        id: 'm3',
        sender: 'Marcus Vance',
        role: 'Community Administrator',
        text: 'Maintenance dispatch confirmed. Repair team is on site.',
        time: new Date(Date.now() - 900000).toISOString(),
        isMe: false,
      },
    ],
  },
  {
    id: 2,
    name: 'David Chen',
    role: 'System Administrator',
    address: 'CommuniKey HQ',
    online: true,
    unread: 0,
    messages: [
      {
        id: 'c1',
        sender: 'David Chen',
        role: 'System Administrator',
        text: 'System Admin hotline active. Report platform issues or severe misconduct here.',
        time: new Date(Date.now() - 7200000).toISOString(),
        isMe: false,
      },
    ],
  },
  {
    id: 3,
    name: 'Sarah Jenkins',
    role: 'Safety Volunteer',
    address: '8 Mill Road',
    online: false,
    unread: 0,
    messages: [
      {
        id: 's1',
        sender: 'Sarah Jenkins',
        role: 'Safety Volunteer',
        text: 'Night patrol active on Section C. Let me know if you spot anything suspicious.',
        time: new Date(Date.now() - 14400000).toISOString(),
        isMe: false,
      },
    ],
  },
  {
    id: 4,
    name: 'Estate Emergency Broadcast',
    role: 'Community Dispatch',
    address: 'All Sections',
    online: true,
    unread: 0,
    messages: [
      {
        id: 'e1',
        sender: 'Estate Emergency Dispatch',
        role: 'System Dispatch',
        text: 'Emergency channel active. All pings are routed to safety volunteers and gate security.',
        time: new Date(Date.now() - 86400000).toISOString(),
        isMe: false,
      },
    ],
  },
];

function Members() {
  const { items: memberList } = useCollection('/members', demoMembers);
  const { items: messageList, create: createMessage } = useCollection(
    '/direct-messages',
    demoDirectMessages
  );

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'directory' | 'tickets'
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState(1);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [receipt, setReceipt] = useState('');

  // Compose Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [recipientRole, setRecipientRole] = useState('Community Administrator');
  const [recipientName, setRecipientName] = useState('Marcus Vance');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [ticketBody, setTicketBody] = useState('');

  const chatEndRef = useRef(null);

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeConvId) || conversations[0],
    [conversations, activeConvId]
  );

  const visibleMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return memberList.filter(
      (m) =>
        !term ||
        `${m.first_name} ${m.last_name} ${m.role} ${m.address}`.toLowerCase().includes(term)
    );
  }, [memberList, search]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv?.messages, isTyping]);

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    playPingChime();

    const userMsgText = inputMessage.trim();
    const newMsg = {
      id: `m_${Date.now()}`,
      sender: 'Resident Member',
      role: 'Resident',
      text: userMsgText,
      time: new Date().toISOString(),
      isMe: true,
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvId ? { ...c, messages: [...c.messages, newMsg] } : c))
    );
    setInputMessage('');

    // Trigger simulated real-time response from Administrator or Neighbor
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      playPingChime();

      let replyText = `Received your message regarding "${userMsgText.slice(0, 30)}...". Security patrol has been notified.`;
      if (activeConv.role === 'Community Administrator') {
        replyText = `Thank you for reaching out. Community Administration has logged this request and dispatched personnel to ${activeConv.address || 'location'}.`;
      } else if (activeConv.role === 'System Administrator') {
        replyText = `System Administrator reviewing reported issue. Action escalated and logged under official review.`;
      } else if (activeConv.role === 'Safety Volunteer') {
        replyText = `Understood! I am in the area near Mill Road and will check this out right now.`;
      }

      const autoReplyMsg = {
        id: `r_${Date.now()}`,
        sender: activeConv.name,
        role: activeConv.role,
        text: replyText,
        time: new Date().toISOString(),
        isMe: false,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId ? { ...c, messages: [...c.messages, autoReplyMsg] } : c
        )
      );
    }, 2400);
  };

  const handleStartChatWithMember = (member) => {
    const fullName = `${member.first_name} ${member.last_name}`;
    let existing = conversations.find((c) => c.name === fullName);
    if (!existing) {
      const newC = {
        id: Date.now(),
        name: fullName,
        role: member.role,
        address: member.address,
        online: true,
        unread: 0,
        messages: [
          {
            id: `init_${Date.now()}`,
            sender: fullName,
            role: member.role,
            text: `Direct chat channel initialized with ${fullName}.`,
            time: new Date().toISOString(),
            isMe: false,
          },
        ],
      };
      setConversations((prev) => [newC, ...prev]);
      setActiveConvId(newC.id);
    } else {
      setActiveConvId(existing.id);
    }
    setActiveTab('chat');
  };

  const handleSendEmergencyPing = () => {
    playPingChime();
    const pingMsg = {
      id: `ping_${Date.now()}`,
      sender: 'Resident Member',
      role: 'Resident',
      text: 'EMERGENCY LOCATION PING: Resident activated urgent assistance request at 14 Riverside Drive.',
      time: new Date().toISOString(),
      isMe: true,
    };
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvId ? { ...c, messages: [...c.messages, pingMsg] } : c))
    );

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      playPingChime();
      const emergencyReply = {
        id: `r_ping_${Date.now()}`,
        sender: activeConv.name,
        role: activeConv.role,
        text: `PRIORITY ACKNOWLEDGMENT: Emergency ping received. Gate patrol and safety volunteers dispatched to 14 Riverside Drive immediately.`,
        time: new Date().toISOString(),
        isMe: false,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId ? { ...c, messages: [...c.messages, emergencyReply] } : c
        )
      );
    }, 1800);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketBody.trim()) return;

    playPingChime();
    await createMessage({
      sender_name: 'Resident Member',
      recipient_role: recipientRole,
      recipient_name: recipientName,
      category,
      message: ticketBody.trim(),
      status: 'Awaiting Response',
      date_sent: new Date().toISOString(),
      response: '',
    });

    setTicketBody('');
    setModalOpen(false);
    setReceipt(`Report ticket dispatched to ${recipientName} (${recipientRole}).`);
    setTimeout(() => setReceipt(''), 5000);
  };

  return (
    <div className="stack">
      <header className="masthead">
        <div>
          <p className="eyebrow">Real-Time Communications</p>
          <h1>Members & Live Chat</h1>
          <p className="masthead-meta">
            Instant real-time neighbor messaging, emergency audio pings, and direct administrator hotline.
          </p>
        </div>
        <div className="cluster">
          <button type="button" className="btn btn-solid" onClick={() => setModalOpen(true)}>
            Report Issue / Admin Ticket
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
            fontWeight: activeTab === 'chat' ? 600 : 400,
            color: activeTab === 'chat' ? 'var(--paper)' : 'var(--dim)',
            borderBottomColor: activeTab === 'chat' ? 'var(--signal)' : 'transparent',
          }}
          onClick={() => setActiveTab('chat')}
        >
          Live Real-Time Chat ({conversations.length})
        </button>
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
            fontWeight: activeTab === 'tickets' ? 600 : 400,
            color: activeTab === 'tickets' ? 'var(--paper)' : 'var(--dim)',
            borderBottomColor: activeTab === 'tickets' ? 'var(--signal)' : 'transparent',
          }}
          onClick={() => setActiveTab('tickets')}
        >
          Admin Hotline Tickets ({messageList.length})
        </button>
      </div>

      {activeTab === 'chat' ? (
        <section className="panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--line-hi)' }}>
          <div className="columns" style={{ margin: 0, gap: 0 }}>
            {/* Conversations Sidebar */}
            <div
              style={{
                width: '320px',
                borderRight: '1px solid var(--line)',
                backgroundColor: 'var(--panel)',
                padding: 'var(--s4)',
              }}
            >
              <p className="eyebrow" style={{ marginBottom: 'var(--s3)' }}>
                Active Conversations
              </p>
              <div className="stack" style={{ gap: 'var(--s2)' }}>
                {conversations.map((conv) => {
                  const isActive = conv.id === activeConvId;
                  const lastMsg = conv.messages[conv.messages.length - 1];

                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setActiveConvId(conv.id)}
                      style={{
                        textAlign: 'left',
                        padding: 'var(--s3)',
                        borderRadius: '4px',
                        backgroundColor: isActive ? 'var(--panel-hi)' : 'transparent',
                        border: isActive ? '1px solid var(--line-hi)' : '1px solid transparent',
                        cursor: 'pointer',
                        display: 'block',
                        width: '100%',
                      }}
                    >
                      <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '2px' }}>
                        <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--paper)' }}>
                          {conv.name}
                        </strong>
                        {conv.online ? (
                          <span className="mono sm" style={{ color: 'var(--signal)', fontSize: '0.7rem' }}>
                            Online
                          </span>
                        ) : (
                          <span className="mono sm" style={{ color: 'var(--dim)', fontSize: '0.7rem' }}>
                            Offline
                          </span>
                        )}
                      </div>
                      <p className="eyebrow" style={{ fontSize: '0.65rem', marginBottom: '4px' }}>
                        {conv.role}
                      </p>
                      <p className="sm faint" style={{ color: 'var(--dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lastMsg ? lastMsg.text : 'No messages'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Live Chat Thread */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '520px', backgroundColor: 'var(--ink)' }}>
              {/* Chat Thread Header */}
              <div
                className="cluster"
                style={{
                  justify: 'space-between',
                  padding: 'var(--s3) var(--s4)',
                  borderBottom: '1px solid var(--line)',
                  backgroundColor: 'var(--panel)',
                }}
              >
                <div>
                  <h3 style={{ fontSize: 'var(--fs-base)', fontWeight: 500, color: 'var(--paper)' }}>
                    {activeConv.name}
                  </h3>
                  <p className="eyebrow" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                    {activeConv.role} • {activeConv.address}
                  </p>
                </div>
                <div className="cluster">
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderColor: 'var(--signal)' }}
                    onClick={handleSendEmergencyPing}
                  >
                    Send Emergency Ping
                  </button>
                </div>
              </div>

              {/* Message Stream */}
              <div
                style={{
                  flex: 1,
                  padding: 'var(--s4)',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--s3)',
                }}
              >
                {activeConv.messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      backgroundColor: msg.isMe ? 'var(--signal)' : 'var(--panel-hi)',
                      border: msg.isMe ? 'none' : '1px solid var(--line-hi)',
                      borderRadius: '6px',
                      padding: 'var(--s3) var(--s4)',
                    }}
                  >
                    <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '4px', gap: 'var(--s3)' }}>
                      <span className="eyebrow" style={{ color: msg.isMe ? 'var(--paper)' : 'var(--dim)', fontSize: '0.65rem' }}>
                        {msg.sender} ({msg.role})
                      </span>
                      <span className="mono sm" style={{ color: msg.isMe ? 'var(--paper)' : 'var(--faint)', fontSize: '0.65rem' }}>
                        {formatRelative(msg.time)}
                      </span>
                    </div>
                    <p style={{ color: 'var(--paper)', fontSize: 'var(--fs-sm)', lineHeight: 1.45, margin: 0 }}>
                      {msg.text}
                    </p>
                  </div>
                ))}

                {isTyping ? (
                  <div
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: 'var(--panel-hi)',
                      border: '1px solid var(--line-hi)',
                      borderRadius: '6px',
                      padding: 'var(--s2) var(--s4)',
                    }}
                  >
                    <p className="mono sm faint" style={{ color: 'var(--signal)', fontSize: '0.75rem', margin: 0 }}>
                      {activeConv.name} is typing a response...
                    </p>
                  </div>
                ) : null}

                <div ref={chatEndRef} />
              </div>

              {/* Live Chat Input Bar */}
              <form
                onSubmit={handleSendChatMessage}
                style={{
                  padding: 'var(--s3) var(--s4)',
                  borderTop: '1px solid var(--line)',
                  backgroundColor: 'var(--panel)',
                  display: 'flex',
                  gap: 'var(--s3)',
                }}
              >
                <input
                  className="control"
                  placeholder={`Type a live real-time message to ${activeConv.name}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-solid" style={{ padding: '0.4rem 1rem' }}>
                  Send
                </button>
              </form>
            </div>
          </div>
        </section>
      ) : activeTab === 'directory' ? (
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
                    className="btn btn-solid"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    onClick={() => handleStartChatWithMember(m)}
                  >
                    Start Live Chat
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">Administrator Ticket Inbox</p>
          </div>

          <p className="sm faint" style={{ marginBottom: 'var(--s4)' }}>
            Logged reports, complaints, and escalated tickets submitted to Community or System Administrators.
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

                <div className="entry-meta">
                  <span>Logged {formatRelative(msg.date_sent)}</span>
                  <span>{formatStamp(msg.date_sent)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Ticket Modal */}
      {modalOpen ? (
        <Modal
          title="Submit Report / Administrator Ticket"
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" form="admin-ticket-form" className="btn btn-solid">
                Submit Ticket
              </button>
            </>
          }
        >
          <form id="admin-ticket-form" onSubmit={handleCreateTicket} className="stack" style={{ gap: 'var(--s4)' }}>
            <div className="field">
              <label className="eyebrow" htmlFor="t-recipient">
                Target Administrator
              </label>
              <select
                id="t-recipient"
                className="control"
                value={recipientName}
                onChange={(e) => {
                  const val = e.target.value;
                  setRecipientName(val);
                  setRecipientRole(val.includes('David') ? 'System Administrator' : 'Community Administrator');
                }}
                style={{ color: 'var(--paper)', backgroundColor: 'var(--ink)' }}
              >
                <option value="Marcus Vance">Marcus Vance (Community Administrator)</option>
                <option value="David Chen">David Chen (System Administrator)</option>
              </select>
            </div>

            <div className="field">
              <label className="eyebrow" htmlFor="t-category">
                Category
              </label>
              <select
                id="t-category"
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
              <label className="eyebrow" htmlFor="t-body">
                Ticket Details
              </label>
              <textarea
                id="t-body"
                className="control"
                rows={4}
                placeholder="Describe your inquiry, complaint, or report..."
                value={ticketBody}
                onChange={(e) => setTicketBody(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

export default Members;
