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
import { formatDayDate, formatRelative, formatStamp } from '../utils/format';

const PENDING_MEMBERS = [
  {
    id: 101,
    name: 'Kobus van der Merwe',
    address: '29 Mill Road, Section B',
    email: 'kobus.vdm@riverside.co.za',
    document: 'Municipal Water Bill (Uploaded Yesterday)',
    date_applied: '2026-08-20',
  },
  {
    id: 102,
    name: 'Amina Patel',
    address: '5 Riverside Drive, Section A',
    email: 'amina.patel@riverside.co.za',
    document: 'Lease Agreement (Uploaded 2 days ago)',
    date_applied: '2026-08-19',
  },
];

function AdminDashboard() {
  const { currentUser } = useAuth();

  const { items: incidentList, update: updateIncident } = useCollection('/incidents', demoIncidents);
  const { items: announcementList, create: createAnnouncement } = useCollection(
    '/announcements',
    demoAnnouncements
  );
  const { items: memberList } = useCollection('/members', demoMembers);

  const [pendingQueue, setPendingQueue] = useState(PENDING_MEMBERS);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notice, setNotice] = useState('');

  const openIncidents = incidentList.filter((i) => i.status !== 'Resolved');

  const handleStatusChange = async (incidentId, newStatus) => {
    await updateIncident(incidentId, { status: newStatus });
    setNotice(`Incident status updated to ${newStatus}.`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleApproveMember = (memberId) => {
    setPendingQueue((prev) => prev.filter((m) => m.id !== memberId));
    setNotice('Resident account verified and granted community access.');
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
      created_by: `${currentUser.first_name} ${currentUser.last_name} (Administrator)`,
    });

    setTitle('');
    setContent('');
    setBroadcastModal(false);
    setNotice('Official community announcement published.');
    setTimeout(() => setNotice(''), 5000);
  };

  return (
    <div className="stack">
      {/* SECTION 1: Masthead */}
      <header className="masthead">
        <div>
          <p className="eyebrow" style={{ color: 'var(--signal)' }}>
            Administrative Control Hub
          </p>
          <h1>{community.community_name} Management</h1>
          <p className="masthead-meta">
            Logged in as {currentUser.first_name} {currentUser.last_name} (Community Administrator)
          </p>
        </div>
        <div className="cluster">
          <button
            type="button"
            className="btn btn-solid"
            onClick={() => setBroadcastModal(true)}
          >
            Publish Announcement
          </button>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* SECTION 2: Admin Metrics */}
      <div className="figures">
        <div className="figure">
          <span className="eyebrow">Open Incidents</span>
          <span className="figure-value">{openIncidents.length}</span>
        </div>
        <div className="figure">
          <span className="eyebrow">Verified Members</span>
          <span className="figure-value">{memberList.length + 243}</span>
        </div>
        <div className="figure">
          <span className="eyebrow">Pending Approvals</span>
          <span className="figure-value">{pendingQueue.length}</span>
        </div>
        <div className="figure">
          <span className="eyebrow">Active Announcements</span>
          <span className="figure-value">{announcementList.length}</span>
        </div>
      </div>

      {/* SECTION 3: Incident Management & Status Triage */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <p className="eyebrow">Incident Management</p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              Report Triage & Status Controls
            </h2>
          </div>
          <Link to="/incidents" className="link">
            View full ledger
          </Link>
        </div>

        <p className="sm faint" style={{ marginBottom: 'var(--s4)' }}>
          Review reported safety concerns, change statuses, and assign patrol follow-ups.
        </p>

        <ul className="ledger">
          {incidentList.map((item) => (
            <li className="entry" key={item.id} style={{ display: 'block', padding: 'var(--s4) 0' }}>
              <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
                <div>
                  <h3 className="entry-title">{item.incident_type}</h3>
                  <p className="sm faint" style={{ color: 'var(--dim)', marginTop: '2px' }}>
                    Location: <strong>{item.location || 'General Estate'}</strong> • Reported by {item.reported_by || 'Resident'}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <p className="entry-body" style={{ color: 'var(--paper)', marginBottom: 'var(--s3)' }}>
                {item.description}
              </p>

              <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="entry-meta">
                  <span>{formatRelative(item.date_reported)}</span>
                  <span>{formatStamp(item.date_reported)}</span>
                </div>

                <div className="cluster" style={{ gap: 'var(--s2)' }}>
                  <span className="eyebrow" style={{ fontSize: '0.7rem' }}>Set Status:</span>
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => handleStatusChange(item.id, 'Under review')}
                  >
                    Under Review
                  </button>
                  <button
                    type="button"
                    className="btn btn-solid"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => handleStatusChange(item.id, 'Resolved')}
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* SECTION 4: Pending Member Verifications */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <p className="eyebrow">Member Moderation</p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
              Pending Resident Verification Queue ({pendingQueue.length})
            </h2>
          </div>
          <Link to="/messages" className="link">
            Member directory
          </Link>
        </div>

        <p className="sm faint" style={{ marginBottom: 'var(--s4)' }}>
          Review proof of residence documents submitted by new estate applicants.
        </p>

        {pendingQueue.length === 0 ? (
          <p className="blank">No pending member verification applications.</p>
        ) : (
          <ul className="ledger">
            {pendingQueue.map((m) => (
              <li className="entry" key={m.id}>
                <div>
                  <h3 className="entry-title">{m.name}</h3>
                  <p className="entry-body">
                    Address: {m.address} • {m.document}
                  </p>
                  <div className="entry-meta">
                    <span>Applied {m.date_applied}</span>
                    <span>{m.email}</span>
                  </div>
                </div>

                <span className="entry-aside cluster" style={{ gap: 'var(--s2)' }}>
                  <button
                    type="button"
                    className="btn btn-solid"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    onClick={() => handleApproveMember(m.id)}
                  >
                    Approve Member
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Broadcast Announcement Modal */}
      {broadcastModal ? (
        <Modal
          title="Publish Community Announcement"
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
                Announcement Title
              </label>
              <input
                id="anc-title"
                className="control"
                placeholder="e.g., Gate Security Upgrade & Visitor Registration"
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
                Announcement Content
              </label>
              <textarea
                id="anc-content"
                className="control"
                rows={4}
                placeholder="Write the official notice details for residents..."
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
