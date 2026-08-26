import React, { useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../components/Modal';
import ResidentProfileModal from '../components/ResidentProfileModal';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
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

const SUPPORT_CATEGORIES = [
  'Maintenance & Repairs',
  'Noise & Disturbance',
  'Billing & Levy Inquiry',
  'General Admin Question',
];

const INITIAL_CHANNELS = [
  {
    id: 'ch_estate',
    name: '#estate-chat',
    role: 'Public Community Channel',
    type: 'group',
    lastSeen: 'Public Discussion Channel',
    messages: [
      {
        id: 'cm1',
        sender: 'Sarah Jenkins',
        role: 'Safety Volunteer',
        text: 'Reminder to all residents: The south gate barrier arm will undergo routine maintenance at 14:00 today.',
        time: new Date(Date.now() - 7200000).toISOString(),
        isMe: false,
      },
      {
        id: 'cm2',
        sender: 'Thabo Mokoena',
        role: 'Resident',
        text: 'Thanks Sarah! Will the side pedestrian gate remain open?',
        time: new Date(Date.now() - 3600000).toISOString(),
        isMe: false,
      },
      {
        id: 'cm3',
        sender: 'Marcus Vance',
        role: 'Community Administrator',
        text: 'Yes, pedestrian access remains fully active. Main gate guard will manually clear vehicles.',
        time: new Date(Date.now() - 1800000).toISOString(),
        isMe: false,
      },
    ],
  },
  {
    id: 'ch_announcements',
    name: '#general-announcements',
    role: 'Official Broadcast Channel',
    type: 'group',
    lastSeen: 'Official Notices Only',
    readOnlyForResidents: true,
    messages: [
      {
        id: 'an1',
        sender: 'Marcus Vance (Admin)',
        role: 'Community Administrator',
        text: 'Planned municipal water maintenance scheduled for Tuesday 09:00 - 15:00. Please store backup water.',
        time: new Date(Date.now() - 86400000).toISOString(),
        isMe: false,
      },
    ],
  },
  {
    id: 'ch_safety_ops',
    name: '#safety-operations',
    role: 'Safety Responder Tactical Channel',
    type: 'group',
    lastSeen: 'Responders & Patrol Only',
    messages: [
      {
        id: 'so1',
        sender: 'Sarah Jenkins',
        role: 'Safety Volunteer',
        text: 'Patrol Round 3 complete. Section A & C perimeter fences secure.',
        time: new Date(Date.now() - 1800000).toISOString(),
        isMe: false,
      },
      {
        id: 'so2',
        sender: 'Gate Guardhouse',
        role: 'Security Patrol',
        text: 'SOS alert from Unit 14 acknowledged. Patrol officer en route.',
        time: new Date(Date.now() - 600000).toISOString(),
        isMe: false,
      },
    ],
  },
  {
    id: 'ch_gate_dispatch',
    name: '#gate-dispatch',
    role: 'Guardhouse Resident Queries & Gate Dispatch',
    type: 'group',
    lastSeen: 'Direct Resident Gate Desk',
    messages: [
      {
        id: 'gd1',
        sender: 'Thabo Mokoena (Unit 14)',
        role: 'Resident',
        text: 'Hi Guardhouse, courier arriving with a delivery for Unit 14 shortly.',
        time: new Date(Date.now() - 3600000).toISOString(),
        isMe: false,
      },
      {
        id: 'gd2',
        sender: 'Sipho Dlamini',
        role: 'Security Guard',
        text: 'Received Mr. Mokoena. Will log courier pass and clear gate upon arrival.',
        time: new Date(Date.now() - 1800000).toISOString(),
        isMe: true,
      },
    ],
  },
];

const INITIAL_DIRECT = [
  {
    id: 'd_admin',
    name: 'Marcus Vance (Admin Support)',
    role: 'Community Administrator',
    online: true,
    lastSeen: 'Online • Active in Estate Office',
    type: 'direct',
    messages: [
      {
        id: 'm1',
        sender: 'Marcus Vance',
        role: 'Community Administrator',
        text: 'Hello! This is your direct private line to Estate Management. How can we assist you today?',
        time: new Date(Date.now() - 86400000).toISOString(),
        isMe: false,
      },
      {
        id: 'm2',
        sender: 'Resident Member',
        role: 'Resident',
        text: 'Hi Marcus! Just submitted a ticket regarding the streetlight repair near unit 22.',
        time: new Date(Date.now() - 3600000).toISOString(),
        isMe: true,
      },
      {
        id: 'm3',
        sender: 'Marcus Vance',
        role: 'Community Administrator',
        text: 'Received! City Power has been dispatched for tomorrow morning.',
        time: new Date(Date.now() - 1200000).toISOString(),
        isMe: false,
      },
    ],
  },
  {
    id: 'd_thabo',
    name: 'Thabo Mokoena',
    role: 'Resident Member',
    online: true,
    lastSeen: 'Last active 15m ago',
    type: 'direct',
    messages: [
      {
        id: 't1',
        sender: 'Thabo Mokoena',
        role: 'Resident',
        text: 'Hey neighbor! Did you receive the visitor access code for the weekend event?',
        time: new Date(Date.now() - 7200000).toISOString(),
        isMe: false,
      },
    ],
  },
];

function Members() {
  const { currentUser, userRole, canAccessPrivateChat } = useAuth();
  const { items: memberList } = useCollection('/members', demoMembers);
  const { items: ticketList, create: createTicket, update: updateTicket } = useCollection(
    '/messages',
    demoDirectMessages
  );

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'directory' | 'helpdesk'
  const [conversations, setConversations] = useState([...INITIAL_CHANNELS, ...INITIAL_DIRECT]);
  const [activeConvId, setActiveConvId] = useState('ch_estate');
  const [inputMessage, setInputMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [ticketFilter, setTicketFilter] = useState('all');

  // Support Request & New Chat Modals
  const [supportModal, setSupportModal] = useState(false);
  const [newChatModal, setNewChatModal] = useState(false);
  const [supportCategory, setSupportCategory] = useState(SUPPORT_CATEGORIES[0]);
  const [supportBody, setSupportBody] = useState('');
  const [profileModalMember, setProfileModalMember] = useState(null);
  const [notice, setNotice] = useState('');

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeConvId) || conversations[0],
    [conversations, activeConvId]
  );

  // Role-based channel visibility filter
  const visibleConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Security Guard persona restriction: ONLY #safety-operations and #gate-dispatch, NO #estate-chat or #general-announcements
      if (userRole === 'Security Guard') {
        if (c.type === 'group') {
          return c.id === 'ch_safety_ops' || c.id === 'ch_gate_dispatch';
        }
        return true;
      }
      // Hide tactical #safety-operations from regular Residents
      if (c.id === 'ch_safety_ops' && userRole === 'Resident') return false;
      // Filter private direct chats
      if (c.type === 'direct' && canAccessPrivateChat) {
        return canAccessPrivateChat('Resident', c.name);
      }
      return true;
    });
  }, [conversations, userRole, canAccessPrivateChat]);

  // Set default active channel to #safety-operations for Security Guard
  useEffect(() => {
    if (userRole === 'Security Guard') {
      setActiveConvId('ch_safety_ops');
    }
  }, [userRole]);

  const visibleMembers = useMemo(() => {
    const term = searchFilter.trim().toLowerCase();
    return memberList.filter(
      (m) =>
        !term ||
        `${m.first_name} ${m.last_name} ${m.role} ${m.address}`.toLowerCase().includes(term)
    );
  }, [memberList, searchFilter]);

  const filteredTickets = useMemo(() => {
    if (ticketFilter === 'awaiting') return ticketList.filter((t) => t.status === 'Awaiting Response');
    if (ticketFilter === 'resolved') return ticketList.filter((t) => t.status === 'Resolved');
    return ticketList;
  }, [ticketList, ticketFilter]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv.messages]);

  // Initiate / Navigate to 1-on-1 Direct Message with Member
  const handleStartChatWithMember = (member) => {
    const memberName = `${member.first_name} ${member.last_name}`;
    const existing = conversations.find(
      (c) => c.type === 'direct' && (c.name === memberName || c.name.includes(member.first_name))
    );

    if (existing) {
      setActiveConvId(existing.id);
    } else {
      const newConv = {
        id: `d_${member.id || Date.now()}`,
        name: memberName,
        role: member.role || 'Resident Member',
        online: true,
        lastSeen: 'Active Member',
        type: 'direct',
        messages: [
          {
            id: `init_${Date.now()}`,
            sender: memberName,
            role: member.role || 'Resident',
            text: `Direct private conversation started with ${memberName}.`,
            time: new Date().toISOString(),
            isMe: false,
          },
        ],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
    }

    setActiveTab('chat');
    setProfileModalMember(null);
    setNewChatModal(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && !attachment) return;

    const myName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Resident Member';
    const newMsg = {
      id: `m_${Date.now()}`,
      sender: myName,
      role: userRole || 'Resident',
      text: inputMessage.trim() + (attachment ? ` [Attachment: ${attachment.name}]` : ''),
      time: new Date().toISOString(),
      isMe: true,
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvId ? { ...c, messages: [...c.messages, newMsg] } : c))
    );
    setInputMessage('');
    setAttachment(null);
  };

  const handleCreateSupportRequest = async (e) => {
    e.preventDefault();
    if (!supportBody.trim()) return;

    playPingChime();
    const myName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Resident Member';

    await createTicket({
      sender_name: myName,
      recipient_role: 'Community Administrator',
      recipient_name: 'Marcus Vance',
      category: supportCategory,
      message: supportBody.trim(),
      status: 'Awaiting Response',
      date_sent: new Date().toISOString(),
    });

    setSupportBody('');
    setSupportModal(false);
    setNotice('Support request created and routed to Estate Administration.');
    setTimeout(() => setNotice(''), 5000);
  };

  const handleTicketAction = async (ticketId, newStatus) => {
    await updateTicket(ticketId, { status: newStatus });
    setNotice(`Support ticket updated to ${newStatus}.`);
    setTimeout(() => setNotice(''), 4000);
  };

  const isReadOnlyChannel =
    activeConv.id === 'ch_announcements' &&
    userRole !== 'Community Administrator' &&
    userRole !== 'System Administrator';

  return (
    <div className="stack" style={{ gap: 'var(--s3)' }}>
      {/* PAGE HEADER */}
      <header className="masthead" style={{ paddingBottom: 'var(--s3)' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--signal)' }}>
            Communication Center
          </p>
          <h1 style={{ fontSize: 'var(--fs-xl)' }}>Estate Messaging & Member Hub</h1>
          <p className="masthead-meta">
            Private 1-on-1 support tickets, community discussion channels, and member directory.
          </p>
        </div>

        {userRole !== 'Security Guard' ? (
          <div className="cluster" style={{ gap: 'var(--s3)' }}>
            <button type="button" className="btn btn-solid" onClick={() => setSupportModal(true)}>
              New Support Request
            </button>
          </div>
        ) : null}
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* TAB NAVIGATION BAR */}
      <div className="cluster" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 'var(--s2)' }}>
        <button
          type="button"
          className="link"
          style={{
            fontWeight: activeTab === 'chat' ? 600 : 400,
            color: activeTab === 'chat' ? 'var(--paper)' : 'var(--dim)',
            borderBottomColor: activeTab === 'chat' ? 'var(--signal)' : 'transparent',
            paddingBottom: '0.4rem',
          }}
          onClick={() => setActiveTab('chat')}
        >
          Message Channels & Chat
        </button>

        <button
          type="button"
          className="link"
          style={{
            fontWeight: activeTab === 'directory' ? 600 : 400,
            color: activeTab === 'directory' ? 'var(--paper)' : 'var(--dim)',
            borderBottomColor: activeTab === 'directory' ? 'var(--signal)' : 'transparent',
            paddingBottom: '0.4rem',
          }}
          onClick={() => setActiveTab('directory')}
        >
          Verified Members Directory ({memberList.length})
        </button>

        {userRole === 'Estate Administrator' ? (
          <button
            type="button"
            className="link"
            style={{
              fontWeight: activeTab === 'helpdesk' ? 600 : 400,
              color: activeTab === 'helpdesk' ? 'var(--paper)' : 'var(--dim)',
              borderBottomColor: activeTab === 'helpdesk' ? 'var(--signal)' : 'transparent',
              paddingBottom: '0.4rem',
            }}
            onClick={() => setActiveTab('helpdesk')}
          >
            Admin Support Helpdesk ({ticketList.length})
          </button>
        ) : null}
      </div>

      {/* TAB 1: SPLIT CHAT INTERFACE */}
      {activeTab === 'chat' ? (
        <div
          className="panel"
          style={{
            height: 'calc(100vh - 210px)',
            minHeight: '540px',
            display: 'flex',
            border: '1px solid var(--line-hi)',
            overflow: 'hidden',
            padding: 0,
          }}
        >
          {/* LEFT SIDEBAR: Channels, Support Threads & Emergency Quick-Calls */}
          <div
            style={{
              width: '320px',
              borderRight: '1px solid var(--line)',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--panel)',
              flexShrink: 0,
            }}
          >
            {/* Conversation List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s3)' }}>
              <p className="eyebrow" style={{ color: 'var(--dim)', marginBottom: 'var(--s2)', fontSize: '0.68rem' }}>
                Community Channels
              </p>
              {visibleConversations
                .filter((c) => c.type === 'group')
                .map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: 'var(--s3)',
                      marginBottom: 'var(--s2)',
                      backgroundColor: activeConvId === conv.id ? 'var(--panel-hi)' : 'transparent',
                      borderLeft: activeConvId === conv.id ? '3px solid var(--signal)' : '3px solid transparent',
                      borderRadius: '3px',
                      border: '1px solid var(--line)',
                      cursor: 'pointer',
                    }}
                    onClick={() => setActiveConvId(conv.id)}
                  >
                    <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--paper)', display: 'block' }}>
                      {conv.name}
                    </strong>
                    <span className="mono sm" style={{ color: 'var(--dim)', fontSize: '0.7rem' }}>
                      {conv.role}
                    </span>
                  </button>
                ))}

              <div className="cluster" style={{ justifyContent: 'space-between', marginTop: 'var(--s4)', marginBottom: 'var(--s2)' }}>
                <p className="eyebrow" style={{ color: 'var(--dim)', margin: 0, fontSize: '0.68rem' }}>
                  Direct Support & Messages
                </p>
                <button
                  type="button"
                  className="btn"
                  style={{
                    padding: '0.1rem 0.4rem',
                    fontSize: '0.75rem',
                    borderColor: 'var(--line-hi)',
                    color: 'var(--signal)',
                  }}
                  onClick={() => setNewChatModal(true)}
                  title="Start New Direct Message"
                >
                  + New
                </button>
              </div>

              {visibleConversations
                .filter((c) => c.type === 'direct')
                .map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: 'var(--s3)',
                      marginBottom: 'var(--s2)',
                      backgroundColor: activeConvId === conv.id ? 'var(--panel-hi)' : 'transparent',
                      borderLeft: activeConvId === conv.id ? '3px solid var(--signal)' : '3px solid transparent',
                      borderRadius: '3px',
                      border: '1px solid var(--line)',
                      cursor: 'pointer',
                    }}
                    onClick={() => setActiveConvId(conv.id)}
                  >
                    <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '2px' }}>
                      <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--paper)' }}>
                        {conv.name}
                      </strong>
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: conv.online ? 'var(--signal)' : 'var(--dim)',
                          display: 'inline-block',
                        }}
                        title={conv.online ? 'Online' : 'Offline'}
                      />
                    </div>
                    <span className="mono sm" style={{ color: 'var(--dim)', fontSize: '0.7rem' }}>
                      {conv.role}
                    </span>
                  </button>
                ))}
            </div>

            {/* STATIC EMERGENCY QUICK CALL CHIPS */}
            <div
              style={{
                padding: 'var(--s3)',
                borderTop: '1px solid var(--line)',
                backgroundColor: 'var(--ink)',
              }}
            >
              <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.68rem', marginBottom: 'var(--s2)' }}>
                Emergency Contacts / Guardhouse
              </p>
              <div className="stack" style={{ gap: 'var(--s1)' }}>
                <div className="cluster" style={{ justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--paper)' }}>24/7 Main Gatehouse</span>
                  <span className="mono" style={{ color: 'var(--signal)' }}>+27 82 000 1111</span>
                </div>
                <div className="cluster" style={{ justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--paper)' }}>Security Night Patrol</span>
                  <span className="mono" style={{ color: 'var(--signal)' }}>+27 82 000 2222</span>
                </div>
                <div className="cluster" style={{ justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--paper)' }}>Estate Management Office</span>
                  <span className="mono" style={{ color: 'var(--signal)' }}>+27 82 000 3333</span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CHAT STREAM & HEADER */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--ink)' }}>
            {/* Header */}
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
                <h3 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)' }}>
                  {activeConv.name}
                </h3>
                <p className="mono sm" style={{ color: 'var(--dim)', fontSize: '0.75rem', margin: 0 }}>
                  {activeConv.role} • {activeConv.lastSeen}
                </p>
              </div>

              {activeConv.type === 'direct' ? (
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                  onClick={() => {
                    const target = memberList.find((m) => `${m.first_name} ${m.last_name}` === activeConv.name);
                    setProfileModalMember(target || memberList[0]);
                  }}
                >
                  View Profile
                </button>
              ) : null}
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
                    backgroundColor: msg.isMe ? 'var(--signal-wash)' : 'var(--panel-hi)',
                    border: '1px solid var(--line-hi)',
                    borderRadius: '6px',
                    padding: 'var(--s3) var(--s4)',
                  }}
                >
                  <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '2px' }}>
                    <strong style={{ fontSize: '0.8rem', color: msg.isMe ? 'var(--signal)' : 'var(--paper)' }}>
                      {msg.sender}
                    </strong>
                    <span className="mono sm" style={{ color: 'var(--dim)', fontSize: '0.7rem' }}>
                      {formatStamp(msg.time)}
                    </span>
                  </div>
                  <p className="sm" style={{ color: 'var(--paper)', margin: 0, lineHeight: 1.5 }}>
                    {msg.text}
                  </p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Integrated Message Input Box or Read-Only Banner */}
            {isReadOnlyChannel ? (
              <div
                style={{
                  padding: 'var(--s3)',
                  borderTop: '1px solid var(--line)',
                  backgroundColor: 'var(--panel-hi)',
                  textAlign: 'center',
                }}
              >
                <p className="sm faint" style={{ color: 'var(--dim)', margin: 0 }}>
                  Only Community Administrators can publish official notices to {activeConv.name}.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: 'var(--s3)',
                  borderTop: '1px solid var(--line)',
                  backgroundColor: 'var(--panel)',
                  display: 'flex',
                  gap: 'var(--s2)',
                  alignItems: 'center',
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAttachment(e.target.files[0]);
                    }
                  }}
                />

                <button
                  type="button"
                  className="btn"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  title="Attach document or photo"
                >
                  {attachment ? 'File Attached' : 'Attach'}
                </button>

                <input
                  className="control"
                  placeholder={
                    attachment
                      ? `Attached: ${attachment.name} - Write message...`
                      : `Message ${activeConv.name}...`
                  }
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  style={{ flex: 1 }}
                />

                <button type="submit" className="btn btn-solid" style={{ padding: '0.4rem 1rem' }}>
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      ) : activeTab === 'directory' ? (
        /* TAB 2: VERIFIED MEMBERS DIRECTORY (PRIVACY PROTECTED) */
        <section className="section">
          <div className="section-head" style={{ marginBottom: 'var(--s4)' }}>
            <div>
              <p className="eyebrow" style={{ color: 'var(--signal)' }}>
                Privacy Protected Directory
              </p>
              <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
                Verified Resident Household Roster
              </h2>
            </div>

            <input
              className="searchbar"
              type="search"
              placeholder="Search members by name, street, or role..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{ maxWidth: '320px' }}
            />
          </div>

          <p className="sm faint" style={{ marginBottom: 'var(--s4)' }}>
            Personal phone numbers and private email addresses are masked for resident privacy protection.
          </p>

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
                  <p className="mono sm" style={{ color: 'var(--dim)', margin: 0, fontSize: '0.75rem' }}>
                    Phone: <strong>+27 82 ••• ••••</strong> • Email: <strong>•••••@riverside.co.za</strong>
                  </p>
                </div>

                <span className="entry-aside cluster" style={{ gap: 'var(--s2)' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    onClick={() => setProfileModalMember(m)}
                  >
                    View Profile
                  </button>
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
        /* TAB 3: ADMIN SUPPORT HELPDESK INBOX */
        <section className="section">
          <div className="section-head" style={{ marginBottom: 'var(--s3)' }}>
            <div>
              <p className="eyebrow" style={{ color: 'var(--signal)' }}>
                Admin Support Inbox
              </p>
              <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
                Resident Support Requests ({filteredTickets.length})
              </h2>
            </div>

            <div className="cluster" style={{ gap: 'var(--s2)' }}>
              <button
                type="button"
                className="btn"
                style={{
                  backgroundColor: ticketFilter === 'all' ? 'var(--signal-wash)' : 'transparent',
                  borderColor: ticketFilter === 'all' ? 'var(--signal)' : 'var(--line-hi)',
                  fontSize: '0.75rem',
                }}
                onClick={() => setTicketFilter('all')}
              >
                All Tickets
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  backgroundColor: ticketFilter === 'awaiting' ? 'var(--signal-wash)' : 'transparent',
                  borderColor: ticketFilter === 'awaiting' ? 'var(--signal)' : 'var(--line-hi)',
                  fontSize: '0.75rem',
                }}
                onClick={() => setTicketFilter('awaiting')}
              >
                Awaiting Admin
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  backgroundColor: ticketFilter === 'resolved' ? 'var(--signal-wash)' : 'transparent',
                  borderColor: ticketFilter === 'resolved' ? 'var(--signal)' : 'var(--line-hi)',
                  fontSize: '0.75rem',
                }}
                onClick={() => setTicketFilter('resolved')}
              >
                Resolved
              </button>
            </div>
          </div>

          <ul className="ledger">
            {filteredTickets.map((t) => (
              <li className="entry" key={t.id} style={{ display: 'block', padding: 'var(--s4) 0' }}>
                <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
                  <div>
                    <h3 className="entry-title">{t.category || 'General Support Inquiry'}</h3>
                    <p className="sm faint" style={{ color: 'var(--dim)', marginTop: '2px' }}>
                      From: <strong>{t.sender_name}</strong> • Sent {formatRelative(t.date_sent)}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>

                <p className="entry-body" style={{ color: 'var(--paper)', marginBottom: 'var(--s3)' }}>
                  {t.message}
                </p>

                <div className="cluster" style={{ justifyContent: 'flex-end', gap: 'var(--s2)' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                    onClick={() => handleTicketAction(t.id, 'Under Investigation')}
                  >
                    Set Under Investigation
                  </button>
                  <button
                    type="button"
                    className="btn btn-solid"
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                    onClick={() => handleTicketAction(t.id, 'Resolved')}
                  >
                    Close Ticket
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* NEW DIRECT MESSAGE PICKER MODAL */}
      {newChatModal ? (
        <Modal
          title="Start Private Direct Message"
          onClose={() => setNewChatModal(false)}
          footer={
            <button type="button" className="btn" onClick={() => setNewChatModal(false)}>
              Cancel
            </button>
          }
        >
          <div className="stack" style={{ gap: 'var(--s3)' }}>
            <p className="sm faint">Select a verified estate resident or staff member to begin a 1-on-1 private chat:</p>
            <ul className="ledger">
              {memberList.map((m) => (
                <li
                  className="entry"
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--s3) 0',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 'var(--s3)' }}>
                    <h3 className="entry-title" style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, margin: 0, color: 'var(--paper)' }}>
                      {m.first_name} {m.last_name}
                    </h3>
                    <p
                      className="entry-body sm faint"
                      style={{
                        color: 'var(--dim)',
                        margin: 0,
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {m.role} • {m.address}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-solid"
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                    onClick={() => handleStartChatWithMember(m)}
                  >
                    Start Chat
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Modal>
      ) : null}

      {/* STRUCTURED NEW SUPPORT REQUEST MODAL */}
      {supportModal ? (
        <Modal
          title="New Support Request"
          onClose={() => setSupportModal(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setSupportModal(false)}>
                Cancel
              </button>
              <button type="submit" form="support-form" className="btn btn-solid">
                Submit Request
              </button>
            </>
          }
        >
          <form id="support-form" onSubmit={handleCreateSupportRequest} className="stack" style={{ gap: 'var(--s4)' }}>
            <div className="field">
              <label className="eyebrow" htmlFor="sup-category">
                Request Category *
              </label>
              <select
                id="sup-category"
                className="control"
                value={supportCategory}
                onChange={(e) => setSupportCategory(e.target.value)}
                style={{ color: 'var(--paper)', backgroundColor: 'var(--ink)' }}
              >
                {SUPPORT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="eyebrow" htmlFor="sup-body">
                Request Details *
              </label>
              <textarea
                id="sup-body"
                className="control"
                rows={4}
                placeholder="Describe your maintenance inquiry, noise report, or administrative request..."
                value={supportBody}
                onChange={(e) => setSupportBody(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      ) : null}

      {/* RESIDENT PROFILE VIEW MODAL */}
      {profileModalMember ? (
        <ResidentProfileModal
          member={profileModalMember}
          onClose={() => setProfileModalMember(null)}
          onStartChat={handleStartChatWithMember}
        />
      ) : null}
    </div>
  );
}

export default Members;
