import React, { useState } from 'react';
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

const PENDING_REGISTRATIONS = [
  {
    id: 101,
    name: 'Kobus van der Merwe',
    address: '29 Mill Road, Section B',
    email: 'kobus.vdm@riverside.co.za',
    documentType: 'Municipal Water Bill',
    fileName: 'WaterBill_29MillRd_Aug2026.pdf',
    uploadedTime: 'Yesterday at 16:40',
  },
  {
    id: 102,
    name: 'Amina Patel',
    address: '5 Riverside Drive, Section A',
    email: 'amina.patel@riverside.co.za',
    documentType: 'Lease Agreement',
    fileName: 'Lease_5RiversideDr_2026.pdf',
    uploadedTime: '2 days ago at 11:15',
  },
];

const FACILITY_BOOKINGS = [
  {
    id: 1,
    facility: 'Clubhouse Hall',
    bookedBy: 'Thabo Mokoena',
    date: '28 AUG (14:00 - 18:00)',
    time: '14:00 to 18:00',
    purpose: 'Family Gathering & Birthday Event',
    status: 'Approved',
  },
  {
    id: 2,
    facility: 'Tennis Court B',
    bookedBy: 'Sarah Jenkins',
    date: '25 AUG (09:00 - 11:00)',
    time: '09:00 to 11:00',
    purpose: 'Neighborhood Tournament Practice',
    status: 'Approved',
  },
];

const CONTRACTOR_REPAIRS = [
  { id: 1, item: 'Main Gate Hydraulic Arm Servicing', contractor: 'Protea Gate Automation', status: 'Scheduled (Tomorrow 10:00)' },
  { id: 2, item: 'Section A Streetlight Pole #14', contractor: 'City Power Dispatch', status: 'In Progress' },
  { id: 3, item: 'Clubhouse Heat Pump Filter Maintenance', contractor: 'HVAC Solutions', status: 'Scheduled (26 AUG 09:00)' },
];

function AdminDashboard() {
  const { currentUser } = useAuth();

  const { items: incidentList } = useCollection('/incidents', demoIncidents);
  const { create: createAnnouncement } = useCollection('/announcements', demoAnnouncements);
  const { items: memberList } = useCollection('/members', demoMembers);

  const [pendingQueue, setPendingQueue] = useState(PENDING_REGISTRATIONS);
  const [bookingList, setBookingList] = useState(FACILITY_BOOKINGS);

  // Modals
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [reviewDocModal, setReviewDocModal] = useState(null);
  const [manageBookingModal, setManageBookingModal] = useState(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notice, setNotice] = useState('');

  const totalIncidents = incidentList.length || 7;
  const resolvedIncidents = incidentList.filter((i) => i.status === 'Resolved').length || 5;
  const healthPercent = Math.round((resolvedIncidents / totalIncidents) * 100);

  const handleApproveMember = (memberId) => {
    setPendingQueue((prev) => prev.filter((m) => m.id !== memberId));
    setReviewDocModal(null);
    setNotice('Resident account verified and granted full estate access.');
    setTimeout(() => setNotice(''), 4000);
  };

  const handleDeclineMember = (memberId) => {
    setPendingQueue((prev) => prev.filter((m) => m.id !== memberId));
    setReviewDocModal(null);
    setNotice('Resident registration application declined.');
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
      created_by: currentUser ? `${currentUser.first_name} ${currentUser.last_name} (Estate Admin)` : 'Estate Admin',
    });

    setTitle('');
    setContent('');
    setBroadcastModal(false);
    setNotice('Official estate broadcast published cleanly.');
    setTimeout(() => setNotice(''), 5000);
  };

  return (
    <div className="stack" style={{ gap: 'var(--s5)' }}>
      {/* SECTION 1: Masthead */}
      <header className="masthead">
        <div>
          <p className="eyebrow" style={{ color: 'var(--signal)' }}>
            Estate Operations Control
          </p>
          <h1 style={{ fontSize: 'var(--fs-xl)' }}>{community.community_name} Administration</h1>
          <p className="masthead-meta">
            Logged in as {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Estate Administrator'}
          </p>
        </div>
        <div className="cluster" style={{ gap: 'var(--s3)' }}>
          <button type="button" className="btn btn-solid" onClick={() => setBroadcastModal(true)}>
            Draft & Publish Broadcast
          </button>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* SECTION 2: Top Metrics Grid (3 Stat Cards) */}
      <div className="grid-3" style={{ gap: 'var(--s4)' }}>
        {/* Stat Card 1: Incident Resolution */}
        <section className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)' }}>
          <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            INCIDENT RESOLUTION
          </p>
          <div className="cluster" style={{ justifyContent: 'space-between', marginTop: 'var(--s1)' }}>
            <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--paper)' }}>
              {healthPercent}% Cleared
            </span>
            <span className="mono sm faint" style={{ fontSize: '0.75rem' }}>
              {resolvedIncidents} of {totalIncidents} Resolved
            </span>
          </div>

          {/* Distinct Rounded Pill Progress Bar Track */}
          <div
            style={{
              height: '10px',
              width: '100%',
              backgroundColor: 'var(--ink)',
              border: '1px solid var(--line-hi)',
              borderRadius: '9999px',
              overflow: 'hidden',
              marginTop: 'var(--s3)',
              marginBottom: 'var(--s2)',
            }}
          >
            <div
              style={{
                width: `${healthPercent}%`,
                height: '100%',
                backgroundColor: 'var(--signal)',
                borderRadius: '9999px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </section>

        {/* Stat Card 2: Pending Approvals */}
        <section className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)' }}>
          <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            PENDING APPROVALS
          </p>
          <div className="cluster" style={{ justifyContent: 'space-between', marginTop: 'var(--s1)' }}>
            <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--paper)' }}>
              {pendingQueue.length} Applications
            </span>
            <span className="mono sm faint" style={{ fontSize: '0.75rem' }}>
              Awaiting ID & Lease Verification
            </span>
          </div>
        </section>

        {/* Stat Card 3: Active Maintenance & Facilities */}
        <section className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)' }}>
          <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            MAINTENANCE & FACILITIES
          </p>
          <div className="cluster" style={{ justifyContent: 'space-between', marginTop: 'var(--s1)' }}>
            <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--paper)' }}>
              3 Work Orders
            </span>
            <span className="mono sm faint" style={{ fontSize: '0.75rem' }}>
              2 Venue Bookings Scheduled
            </span>
          </div>
        </section>
      </div>

      {/* SECTION 3: Operations Grid (Resident Moderation & Facility Bookings) */}
      <div className="grid-2" style={{ gap: 'var(--s5)' }}>
        {/* Left Column: Resident Moderation */}
        <section
          className="panel"
          style={{
            padding: 'var(--s5)',
            border: '1px solid var(--line-hi)',
          }}
        >
          <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
            <div>
              <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                RESIDENT MODERATION
              </p>
              <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                Pending Resident Registrations ({pendingQueue.length})
              </h2>
            </div>
          </div>

          {pendingQueue.length === 0 ? (
            <p className="blank">All resident verification applications processed.</p>
          ) : (
            <ul className="ledger">
              {pendingQueue.map((m) => (
                <li className="entry" key={m.id} style={{ display: 'block', padding: 'var(--s3) 0', borderBottom: '1px solid var(--line-hi)' }}>
                  <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--paper)' }}>
                      {m.name}
                    </strong>
                    <div className="cluster" style={{ gap: 'var(--s2)' }}>
                      <button
                        type="button"
                        className="btn"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => setReviewDocModal(m)}
                      >
                        Review Documents
                      </button>
                      <button
                        type="button"
                        className="btn btn-solid"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleApproveMember(m.id)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderColor: 'var(--line-hi)' }}
                        onClick={() => handleDeclineMember(m.id)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                  <p className="sm faint" style={{ color: 'var(--dim)', margin: 0 }}>
                    {m.address} • Document: <strong>{m.documentType}</strong>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Right Column: Facility Bookings */}
        <section
          className="panel"
          style={{
            padding: 'var(--s5)',
            border: '1px solid var(--line-hi)',
          }}
        >
          <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
            <div>
              <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                FACILITY BOOKINGS
              </p>
              <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--paper)', margin: 0 }}>
                Clubhouse & Venue Schedule
              </h2>
            </div>
          </div>

          <ul className="ledger">
            {bookingList.map((b) => (
              <li className="entry" key={b.id} style={{ display: 'block', padding: 'var(--s3) 0', borderBottom: '1px solid var(--line-hi)' }}>
                <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div>
                    <h3 className="entry-title" style={{ margin: 0, fontSize: 'var(--fs-sm)' }}>
                      {b.facility}
                    </h3>
                    <p className="entry-body sm faint" style={{ color: 'var(--dim)', margin: '2px 0 0 0' }}>
                      Booked by {b.bookedBy} • {b.date}
                    </p>
                  </div>
                  <div className="cluster" style={{ gap: 'var(--s2)' }}>
                    <StatusBadge status={b.status} />
                    <button
                      type="button"
                      className="btn"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => setManageBookingModal(b)}
                    >
                      Manage Booking
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* SECTION 4: Contractor Maintenance */}
      <section
        className="panel"
        style={{
          padding: 'var(--s5)',
          border: '1px solid var(--line-hi)',
        }}
      >
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--signal)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              CONTRACTOR MAINTENANCE
            </p>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 500, color: 'var(--paper)', margin: 0 }}>
              Active Work Orders & Servicing Schedule
            </h2>
          </div>
        </div>

        <ul className="ledger">
          {CONTRACTOR_REPAIRS.map((c) => (
            <li className="entry" key={c.id} style={{ borderBottom: '1px solid var(--line-hi)' }}>
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

      {/* MODAL 1: REVIEW DOCUMENT MODAL */}
      {reviewDocModal ? (
        <Modal
          title={`Review Verification Documents (${reviewDocModal.name})`}
          onClose={() => setReviewDocModal(null)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setReviewDocModal(null)}>
                Close Preview
              </button>
              <button
                type="button"
                className="btn"
                style={{ borderColor: 'var(--line-hi)' }}
                onClick={() => handleDeclineMember(reviewDocModal.id)}
              >
                Decline Application
              </button>
              <button
                type="button"
                className="btn btn-solid"
                onClick={() => handleApproveMember(reviewDocModal.id)}
              >
                Approve Account
              </button>
            </>
          }
        >
          <div className="stack" style={{ gap: 'var(--s3)' }}>
            <div style={{ padding: 'var(--s4)', backgroundColor: 'var(--panel-hi)', border: '1px solid var(--line-hi)' }}>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Resident Name:</strong> {reviewDocModal.name}
              </p>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Household Address:</strong> {reviewDocModal.address}
              </p>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Uploaded Document:</strong> {reviewDocModal.documentType} ({reviewDocModal.fileName})
              </p>
              <p className="mono sm faint" style={{ color: 'var(--dim)', margin: 0 }}>
                Submission Timestamp: {reviewDocModal.uploadedTime}
              </p>
            </div>

            <div
              style={{
                height: '160px',
                border: '1px dashed var(--line-hi)',
                backgroundColor: 'var(--ink)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <p className="sm faint" style={{ color: 'var(--dim)' }}>
                📄 Preview of {reviewDocModal.fileName}
                <br />
                (Document ID & Municipal Match Verified)
              </p>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* MODAL 2: MANAGE BOOKING MODAL */}
      {manageBookingModal ? (
        <Modal
          title={`Manage Venue Booking (${manageBookingModal.facility})`}
          onClose={() => setManageBookingModal(null)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setManageBookingModal(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-solid"
                onClick={() => {
                  setNotice(`Booking for ${manageBookingModal.facility} confirmed.`);
                  setManageBookingModal(null);
                  setTimeout(() => setNotice(''), 4000);
                }}
              >
                Confirm Booking
              </button>
            </>
          }
        >
          <div className="stack" style={{ gap: 'var(--s3)' }}>
            <div style={{ padding: 'var(--s4)', backgroundColor: 'var(--panel-hi)', border: '1px solid var(--line-hi)' }}>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Facility:</strong> {manageBookingModal.facility}
              </p>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Booked By:</strong> {manageBookingModal.bookedBy}
              </p>
              <p className="sm" style={{ color: 'var(--paper)', marginBottom: 'var(--s2)' }}>
                <strong>Time Window:</strong> {manageBookingModal.date}
              </p>
              <p className="sm faint" style={{ color: 'var(--paper)', margin: 0 }}>
                <strong>Event Purpose:</strong> {manageBookingModal.purpose}
              </p>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* MODAL 3: BROADCAST PUBLISHING MODAL */}
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
