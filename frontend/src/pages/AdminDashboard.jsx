import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
import {
  announcements as demoAnnouncements,
  community,
  incidents as demoIncidents,
  members as demoMembers,
} from '../services/demoData';
import { formatRelative, formatStamp } from '../utils/format';

const PENDING_REGISTRATIONS = [
  {
    id: 101,
    name: 'Kobus van der Merwe',
    address: '29 Mill Road, Section B',
    email: 'kobus.vdm@riverside.co.za',
    document: 'Municipal Water Bill (Uploaded Yesterday)',
  },
  {
    id: 102,
    name: 'Amina Patel',
    address: '5 Riverside Drive, Section A',
    email: 'amina.patel@riverside.co.za',
    document: 'Lease Agreement (Uploaded 2 days ago)',
  },
];

const FACILITY_BOOKINGS = [
  { id: 1, facility: 'Clubhouse Hall', bookedBy: 'Thabo Mokoena', date: '28 AUG (14:00 - 18:00)', status: 'Approved' },
  { id: 2, facility: 'Tennis Court B', bookedBy: 'Sarah Jenkins', date: '25 AUG (09:00 - 11:00)', status: 'Approved' },
];

const CONTRACTOR_REPAIRS = [
  { id: 1, item: 'Main Gate Hydraulic Arm Servicing', contractor: 'Protea Gate Automation', status: 'Scheduled (Tomorrow 10:00)' },
  { id: 2, item: 'Section A Streetlight Pole #14', contractor: 'City Power Dispatch', status: 'In Progress' },
];

function AdminDashboard() {
  const { currentUser } = useAuth();

  const { items: incidentList, update: updateIncident } = useCollection('/incidents', demoIncidents);
  const { items: announcementList, create: createAnnouncement } = useCollection('/announcements', demoAnnouncements);
  const { items: memberList } = useCollection('/members', demoMembers);

  const [pendingQueue, setPendingQueue] = useState(PENDING_REGISTRATIONS);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notice, setNotice] = useState('');

  const totalIncidents = incidentList.length;
  const resolvedIncidents = incidentList.filter((i) => i.status === 'Resolved').length;
  const healthPercent = totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 100;

  const handleApproveMember = (memberId) => {
    setPendingQueue((prev) => prev.filter((m) => m.id !== memberId));
    setNotice('Resident account verified and granted estate access.');
    setTimeout(() => setNotice(''), 4000);
  };

  const handlePublishAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await createAnnouncement({
      title: title.trim(),
      content: content.trim(),
      priority,
      date_published: new Date().toISOString(),
      created_by: currentUser ? `${currentUser.first_name} ${currentUser.last_name} (Admin)` : 'Community Admin',
    });

    setTitle('');
    setContent('');
    setBroadcastModal(false);
    setNotice('Official community broadcast published cleanly.');
    setTimeout(() => setNotice(''), 5000);
  };

  return (
    <div className="stack">
      {/* SECTION 1: Masthead */}
      <header className="masthead">
        <div>
          <p className="eyebrow" style={{ color: 'var(--signal)' }}>
            Estate Operations Control
          </p>
          <h1>{community.community_name} Administration</h1>
          <p className="masthead-meta">
            Logged in as {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Community Administrator'}
          </p>
        </div>
        <div className="cluster">
          <button type="button" className="btn btn-solid" onClick={() => setBroadcastModal(true)}>
            Draft & Publish Broadcast
          </button>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* SECTION 2: Estate Operations Health Summary */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--signal)' }}>
              Estate High-Level Health
            </p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              Incident Resolution Progress ({healthPercent}% Cleared)
            </h2>
          </div>
          <span className="mono" style={{ color: 'var(--paper)', fontWeight: 600 }}>
            {resolvedIncidents} of {totalIncidents} Reports Resolved
          </span>
        </div>

        {/* Minimal Progress Bar */}
        <div
          style={{
            height: '6px',
            backgroundColor: 'var(--line-hi)',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: 'var(--s4)',
          }}
        >
          <div
            style={{
              width: `${healthPercent}%`,
              height: '100%',
              backgroundColor: 'var(--signal)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <div className="grid-2" style={{ gap: 'var(--s4)' }}>
          <div>
            <p className="eyebrow">Pending Registrations</p>
            <p className="mono" style={{ fontSize: '1.25rem', color: 'var(--paper)', margin: 0 }}>
              {pendingQueue.length} Applications
            </p>
          </div>
          <div>
            <p className="eyebrow">Verified Estate Members</p>
            <p className="mono" style={{ fontSize: '1.25rem', color: 'var(--paper)', margin: 0 }}>
              {memberList.length + 243} Households
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Operations Overview (Pending Registrations & Facility Bookings) */}
      <div className="grid-2">
        {/* Pending Resident Registrations */}
        <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
          <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
            <div>
              <p className="eyebrow">Resident Moderation</p>
              <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600 }}>
                Pending Resident Registrations ({pendingQueue.length})
              </h2>
            </div>
          </div>

          {pendingQueue.length === 0 ? (
            <p className="blank">All resident verification applications processed.</p>
          ) : (
            <ul className="ledger">
              {pendingQueue.map((m) => (
                <li className="entry" key={m.id} style={{ display: 'block', padding: 'var(--s3) 0' }}>
                  <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--paper)' }}>
                      {m.name}
                    </strong>
                    <button
                      type="button"
                      className="btn btn-solid"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => handleApproveMember(m.id)}
                    >
                      Approve Account
                    </button>
                  </div>
                  <p className="sm faint" style={{ color: 'var(--dim)', margin: 0 }}>
                    {m.address} • {m.document}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Facility Bookings & Maintenance */}
        <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
          <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
            <div>
              <p className="eyebrow">Facility Bookings</p>
              <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600 }}>
                Approved Clubhouse & Venue Schedule
              </h2>
            </div>
          </div>

          <ul className="ledger">
            {FACILITY_BOOKINGS.map((b) => (
              <li className="entry" key={b.id}>
                <div>
                  <h3 className="entry-title">{b.facility}</h3>
                  <p className="entry-body" style={{ color: 'var(--dim)' }}>
                    Booked by {b.bookedBy} • {b.date}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* SECTION 4: Contractor Repair Statuses */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow">Contractor Maintenance</p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              Active Repairs & Servicing Schedule
            </h2>
          </div>
        </div>

        <ul className="ledger">
          {CONTRACTOR_REPAIRS.map((c) => (
            <li className="entry" key={c.id}>
              <div>
                <h3 className="entry-title">{c.item}</h3>
                <p className="entry-body" style={{ color: 'var(--dim)' }}>
                  Assigned Contractor: {c.contractor}
                </p>
              </div>
              <span className="mono sm" style={{ color: 'var(--signal)', fontWeight: 600 }}>
                {c.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Broadcast Publishing Modal */}
      {broadcastModal ? (
        <Modal
          title="Draft & Publish Estate Broadcast Notice"
          onClose={() => setBroadcastModal(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setBroadcastModal(false)}>
                Cancel
              </button>
              <button type="submit" form="broadcast-form" className="btn btn-solid">
                Publish Broadcast
              </button>
            </>
          }
        >
          <form id="broadcast-form" onSubmit={handlePublishAnnouncement} className="stack" style={{ gap: 'var(--s4)' }}>
            <div className="field">
              <label className="eyebrow" htmlFor="anc-title">
                Broadcast Title *
              </label>
              <input
                id="anc-title"
                className="control"
                placeholder="e.g., Planned Water Interruption Notice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="eyebrow" htmlFor="anc-priority">
                Priority Level
              </label>
              <select
                id="anc-priority"
                className="control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ color: 'var(--paper)', backgroundColor: 'var(--ink)' }}
              >
                <option value="normal">Normal Announcement</option>
                <option value="high">High Priority Alert</option>
              </select>
            </div>

            <div className="field">
              <label className="eyebrow" htmlFor="anc-content">
                Notice Content *
              </label>
              <textarea
                id="anc-content"
                className="control"
                rows={4}
                placeholder="Write official notice details for residents..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

export default AdminDashboard;
