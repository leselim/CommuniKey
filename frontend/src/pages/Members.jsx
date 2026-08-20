import React, { useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../components/Modal';
import ResidentProfileModal from '../components/ResidentProfileModal';
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
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.22);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
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
    lastSeen: 'Online • Active in Estate',
    type: 'direct',
    messages: [
      {
        id: 'm1',
        sender: 'Marcus Vance',
        role: 'Community Administrator',
        text: 'Hey! Just following up on your message regarding the water leak on Riverside Drive.',
        time: new Date(Date.now() - 3600000).toISOString(),
        isMe: false,
      },
      {
        id: 'm2',
        sender: 'Resident Member',
        role: 'Resident',
        text: 'Thanks Marcus! Is the gate entrance going to be blocked during rush hour?',
        time: new Date(Date.now() - 1800000).toISOString(),
        isMe: true,
      },
      {
        id: 'm3',
        sender: 'Marcus Vance',
        role: 'Community Administrator',
        text: 'Spoke to the supervisor 5 mins ago. They are keeping one lane open and gate security will direct traffic. Let me know if you run into any delays!',
        time: new Date(Date.now() - 600000).toISOString(),
        isMe: false,
      },
    ],
  },
  {
    id: 2,
    name: 'Thabo Mokoena',
    role: 'Resident & Neighbor',
    address: '22 Riverside Drive',
    online: true,
    lastSeen: 'Last seen today at 21:40',
    type: 'direct',
    messages: [
      {
        id: 't1',
        sender: 'Thabo Mokoena',
        role: 'Resident',
        text: 'Hey neighbor! Did you see that silver Polo parked near house 18? Just checking if it belongs to your visitors.',
        time: new Date(Date.now() - 7200000).toISOString(),
        isMe: false,
      },
      {
        id: 't2',
        sender: 'Resident Member',
        role: 'Resident',
        text: 'Hi Thabo! No, not ours. Was it parked there long?',
        time: new Date(Date.now() - 3600000).toISOString(),
        isMe: true,
      },
      {
        id: 't3',
        sender: 'Thabo Mokoena',
        role: 'Resident',
        text: 'Yeah about 45 mins. I asked gate security to do a quick drive-by. Everything looks fine now though!',
        time: new Date(Date.now() - 1200000).toISOString(),
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
    lastSeen: 'Last seen 12m ago',
    type: 'direct',
    messages: [
      {
        id: 's1',
        sender: 'Sarah Jenkins',
        role: 'Safety Volunteer',
        text: 'Evening! Starting night patrol rounds on Mill Road and Section C now.',
        time: new Date(Date.now() - 14400000).toISOString(),
        isMe: false,
      },
      {
        id: 's2',
        sender: 'Resident Member',
        role: 'Resident',
        text: 'Thanks Sarah! Could you double check the back gate latch near the park?',
        time: new Date(Date.now() - 10800000).toISOString(),
        isMe: true,
      },
      {
        id: 's3',
        sender: 'Sarah Jenkins',
        role: 'Safety Volunteer',
        text: 'Just checked it, the latch is secure and gate lock is holding fine.',
        time: new Date(Date.now() - 9000000).toISOString(),
        isMe: false,
      },
    ],
  },
  {
    id: 4,
    name: 'David Chen',
    role: 'System Administrator',
    address: 'CommuniKey HQ',
    online: true,
    lastSeen: 'Online • HQ Desk',
    type: 'direct',
    messages: [
      {
        id: 'd1',
        sender: 'David Chen',
        role: 'System Administrator',
        text: 'Hi there! Saw your query regarding address verification documents.',
        time: new Date(Date.now() - 86400000).toISOString(),
        isMe: false,
      },
      {
        id: 'd2',
        sender: 'Resident Member',
        role: 'Resident',
        text: 'Hi David! Yes, uploaded my municipal bill yesterday, wanted to confirm if it was received.',
        time: new Date(Date.now() - 43200000).toISOString(),
        isMe: true,
      },
      {
        id: 'd3',
        sender: 'David Chen',
        role: 'System Administrator',
        text: 'Just reviewed it, everything looks spot on! Your verified resident badge is now active on your profile.',
        time: new Date(Date.now() - 21600000).toISOString(),
        isMe: false,
      },
    ],
  },
  {
    id: 5,
    name: 'Estate Safety Watch Group',
    role: 'Community Channel',
    address: 'All Estate Sections',
    online: true,
    lastSeen: 'Active Group • 14 Members',
    type: 'group',
    messages: [
      {
        id: 'g1',
        sender: 'Thabo Mokoena',
        role: 'Resident',
        text: 'Streetlight on corner of Mill Road is flickering on and off again tonight.',
        time: new Date(Date.now() - 28800000).toISOString(),
        isMe: false,
      },
      {
        id: 'g2',
        sender: 'Sarah Jenkins',
        role: 'Safety Volunteer',
        text: 'Logged on municipal portal! Ticket reference #4092.',
        time: new Date(Date.now() - 14400000).toISOString(),
        isMe: false,
      },
      {
        id: 'g3',
        sender: 'Marcus Vance',
        role: 'Community Administrator',
        text: 'Thanks Sarah, admin team will track it tomorrow morning.',
        time: new Date(Date.now() - 7200000).toISOString(),
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

  // Ticket & Profile Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [profileModalMember, setProfileModalMember] = useState(null);
  const [recipientRole, setRecipientRole] = useState('Community Administrator');
  const [recipientName, setRecipientName] = useState('Marcus Vance');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [ticketBody, setTicketBody] = useState('');

  const chatEndRef = useRef(null);

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeConvId) || conversations[0],
    [conversations, activeConvId]
  );

  const directConvs = useMemo(
    () => conversations.filter((c) => c.type === 'direct'),
    [conversations]
  );
  const groupConvs = useMemo(
    () => conversations.filter((c) => c.type === 'group'),
    [conversations]
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

    // Trigger genuine human response based on contact persona
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      playPingChime();

      let replyText = '';
      if (activeConv.name.includes('Marcus')) {
        replyText = `Thanks for letting me know! I am following up on this right away with the estate team.`;
      } else if (activeConv.name.includes('Thabo')) {
        replyText = `Got your message neighbor! Appreciate you checking in, let's keep an eye on it.`;
      } else if (activeConv.name.includes('Sarah')) {
        replyText = `Thanks for the heads up! Adding this location to our night patrol checklist now.`;
      } else if (activeConv.name.includes('David')) {
        replyText = `Hi! Received your message. Updating your request details right now.`;
      } else {
        replyText = `Message noted by estate watch team! Thanks for updating the channel.`;
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
    }, 2200);
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
        lastSeen: 'Online • Just started chat',
        type: 'direct',
        messages: [
          {
            id: `init_${Date.now()}`,
            sender: fullName,
            role: member.role,
            text: `Hey! Starting a private chat channel here on CommuniKey.`,
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
      text: 'EMERGENCY LOCATION PING: Priority assistance requested at 14 Riverside Drive.',
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
        text: `Emergency ping received loud and clear! Dispatched nearest security patrol to 14 Riverside Drive right now.`,
        time: new Date().toISOString(),
        isMe: false,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId ? { ...c, messages: [...c.messages, emergencyReply] } : c
        )
      );
    }, 1600);
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
    setReceipt(`Admin ticket created and dispatched to ${recipientName}.`);
    setTimeout(() => setReceipt(''), 5000);
  };

  return (
    <div className="stack">
      {/* PAGE HEADER */}
      <header className="masthead">
        <div>
          <p className="eyebrow">Community Directory & Messaging</p>
          <h1>Resident Communications & Hotline</h1>
          <p className="masthead-meta">
            Direct neighbor messaging, emergency location pings, and administrator support.
          </p>
        </div>
        <div className="cluster">
          <button type="button" className="btn btn-solid" onClick={() => setModalOpen(true)}>
            Submit Admin Ticket
          </button>
          <p className="mono">{memberList.length} verified members</p>
        </div>
      </header>

      {receipt ? <p className="notice">{receipt}</p> : null}

      {/* TAB CONTROLS */}
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
          Live Estate Chat ({conversations.length})
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
          Support & Admin Tickets ({messageList.length})
        </button>
      </div>

      {activeTab === 'chat' ? (
        <section className="panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--line-hi)' }}>
          <div className="columns" style={{ margin: 0, gap: 0 }}>
            {/* CONVERSATIONS SIDEBAR */}
            <div
              style={{
                width: '320px',
                borderRight: '1px solid var(--line)',
                backgroundColor: 'var(--panel)',
                padding: 'var(--s4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--s4)',
              }}
            >
              {/* Direct Messages Sub-Heading */}
              <div>
                <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>
                  Direct Messages
                </p>
                <div className="stack" style={{ gap: 'var(--s2)' }}>
                  {directConvs.map((conv) => {
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
                          <span className="mono sm" style={{ color: conv.online ? 'var(--signal)' : 'var(--dim)', fontSize: '0.65rem' }}>
                            {conv.online ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <p className="eyebrow" style={{ fontSize: '0.65rem', marginBottom: '4px' }}>
                          {conv.role}
                        </p>
                        <p className="sm faint" style={{ color: 'var(--dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                          {lastMsg ? lastMsg.text : 'No messages'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Community Groups Sub-Heading */}
              <div>
                <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>
                  Community Channels
                </p>
                <div className="stack" style={{ gap: 'var(--s2)' }}>
                  {groupConvs.map((conv) => {
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
                          <span className="mono sm" style={{ color: 'var(--signal)', fontSize: '0.65rem' }}>
                            Active
                          </span>
                        </div>
                        <p className="sm faint" style={{ color: 'var(--dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                          {lastMsg ? lastMsg.text : 'No messages'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ACTIVE CHAT THREAD WINDOW */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '540px', backgroundColor: 'var(--ink)' }}>
              {/* Chat Thread Header */}
              <div
                className="cluster"
                style={{
                  justifyContent: 'space-between',
                  padding: 'var(--s3) var(--s4)',
                  borderBottom: '1px solid var(--line)',
                  backgroundColor: 'var(--panel)',
                }}
              >
                <div>
                  <button
                    type="button"
                    className="link"
                    style={{
                      fontSize: 'var(--fs-base)',
                      fontWeight: 600,
                      color: 'var(--paper)',
                      textDecoration: 'none',
                      padding: 0,
                      textAlign: 'left',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      const target = memberList.find(
                        (m) => `${m.first_name} ${m.last_name}` === activeConv.name
                      );
                      setProfileModalMember(target || memberList[0]);
                    }}
                    title="Click to view verified profile"
                  >
                    {activeConv.name}
                  </button>
                  <div className="cluster" style={{ gap: 'var(--s3)', marginTop: '2px' }}>
                    <span className="eyebrow" style={{ fontSize: '0.7rem' }}>
                      {activeConv.role}
                    </span>
                    <span className="mono sm" style={{ color: 'var(--dim)', fontSize: '0.7rem' }}>
                      {activeConv.lastSeen}
                    </span>
                  </div>
                </div>
                <div className="cluster">
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                    onClick={() => {
                      const target = memberList.find(
                        (m) => `${m.first_name} ${m.last_name}` === activeConv.name
                      );
                      setProfileModalMember(target || memberList[0]);
                    }}
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', borderColor: 'var(--signal)' }}
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
                        {msg.sender}
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

              {/* Live Input Bar */}
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
                  placeholder={`Write a message to ${activeConv.name}...`}
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
                    className="btn"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    onClick={() => setProfileModalMember(m)}
                  >
                    View Verified Profile
                  </button>
                  <button
                    type="button"
                    className="btn btn-solid"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    onClick={() => handleStartChatWithMember(m)}
                  >
                    Start Chat Thread
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="section">
          <div className="section-head">
            <p className="eyebrow">Administrator Support Tickets</p>
          </div>

          <p className="sm faint" style={{ marginBottom: 'var(--s4)' }}>
            Logged complaints, gate issues, and administrator support tickets.
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
          title="Submit Report / Admin Ticket"
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

      {/* Resident Profile Modal */}
      {profileModalMember ? (
        <ResidentProfileModal
          member={profileModalMember}
          onClose={() => setProfileModalMember(null)}
          onStartChat={(m) => handleStartChatWithMember(m)}
          onSendPing={() => handleSendEmergencyPing()}
        />
      ) : null}
    </div>
  );
}

export default Members;
