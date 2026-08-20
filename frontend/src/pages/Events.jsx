import React, { useMemo, useState } from 'react';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
import { events as demoEvents } from '../services/demoData';
import { formatRelative, formatStamp, isSameDay } from '../utils/format';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Calendar({ month, events, onStep }) {
  const year = month.getFullYear();
  const index = month.getMonth();
  const dayCount = new Date(year, index + 1, 0).getDate();
  const leading = (new Date(year, index, 1).getDay() + 6) % 7;
  const trailing = (7 - ((leading + dayCount) % 7)) % 7;
  const today = new Date();

  const marked = new Set(
    events
      .map((item) => new Date(item.event_date))
      .filter((date) => date.getFullYear() === year && date.getMonth() === index)
      .map((date) => date.getDate())
  );

  const label = `${month.toLocaleDateString('en-GB', { month: 'long' })} ${year}`;

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>{label}</h2>
        <span className="cluster">
          <button type="button" className="link" onClick={() => onStep(-1)}>
            Previous
          </button>
          <button type="button" className="link" onClick={() => onStep(1)}>
            Next
          </button>
        </span>
      </div>

      <div className="calendar">
        {WEEKDAYS.map((day) => (
          <div className="calendar-dow eyebrow" key={day}>
            {day}
          </div>
        ))}
        {Array.from({ length: leading }).map((_, i) => (
          <div className="calendar-day" key={`lead-${i}`} />
        ))}
        {Array.from({ length: dayCount }).map((_, i) => {
          const day = i + 1;
          const date = new Date(year, index, day);
          const classes = ['calendar-day'];
          if (marked.has(day)) classes.push('marked');
          if (isSameDay(date, today)) classes.push('today');
          return (
            <div className={classes.join(' ')} key={day}>
              <span className="calendar-date">{day}</span>
              {marked.has(day) ? <span className="calendar-mark" aria-hidden="true" /> : null}
            </div>
          );
        })}
        {Array.from({ length: trailing }).map((_, i) => (
          <div className="calendar-day" key={`trail-${i}`} />
        ))}
      </div>
    </div>
  );
}

const EMPTY_EVENT_DRAFT = {
  title: '',
  description: '',
  event_date: new Date().toISOString().split('T')[0],
  location: 'Community Clubhouse',
};

function Events() {
  const { user } = useAuth();
  const { items, loading, update, create } = useCollection('/events', demoEvents);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_EVENT_DRAFT);
  const [notice, setNotice] = useState('');

  const isAdmin =
    user && (user.role === 'Community Administrator' || user.role === 'System Administrator');

  const upcoming = useMemo(
    () =>
      items
        .filter((item) => new Date(item.event_date) >= new Date(new Date().toDateString()))
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date)),
    [items]
  );

  const attending = upcoming.filter((item) => item.attending).length;

  const step = (offset) =>
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return;

    await create({
      ...draft,
      title: draft.title.trim(),
      attending: true,
    });

    setDraft(EMPTY_EVENT_DRAFT);
    setModalOpen(false);
    setNotice('Community event created and added to the calendar.');
    setTimeout(() => setNotice(''), 5000);
  };

  return (
    <div className="stack">
      <header className="masthead">
        <div>
          <p className="eyebrow">Community life</p>
          <h1>Events</h1>
          <p className="masthead-meta">
            Upcoming gatherings, meetings and workshops. RSVP so organisers can plan.
          </p>
        </div>
        <div className="cluster">
          {isAdmin ? (
            <button type="button" className="btn btn-solid" onClick={() => setModalOpen(true)}>
              Create event
            </button>
          ) : null}
          <p className="mono">
            {upcoming.length} upcoming / {attending} attending
          </p>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

      <div className="columns">
        <Calendar month={month} events={items} onStep={step} />

        <section className="section">
          <div className="section-head">
            <p className="eyebrow">Upcoming</p>
          </div>

          {loading && items.length === 0 ? (
            <div>
              <div className="bar" />
              <div className="bar" />
            </div>
          ) : upcoming.length === 0 ? (
            <p className="blank">No upcoming events scheduled.</p>
          ) : (
            <ul className="ledger">
              {upcoming.map((item) => (
                <li className="entry" key={item.id}>
                  <h3 className="entry-title">{item.title}</h3>
                  <span className="entry-aside">
                    <button
                      type="button"
                      className={`btn${item.attending ? ' btn-affirm' : ' btn-solid'}`}
                      onClick={() => update(item.id, { attending: !item.attending })}
                    >
                      {item.attending ? 'Attending' : 'RSVP'}
                    </button>
                  </span>
                  <p className="entry-body">{item.description}</p>
                  <div className="entry-meta">
                    <span title={formatStamp(item.event_date)}>{formatRelative(item.event_date)}</span>
                    {item.location ? <span>{item.location}</span> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {modalOpen ? (
        <Modal
          title="Create Community Event"
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" form="event-form" className="btn btn-solid">
                Create Event
              </button>
            </>
          }
        >
          <form id="event-form" onSubmit={handleCreateEvent} className="stack" style={{ gap: 'var(--s4)' }}>
            <div className="field">
              <label className="eyebrow" htmlFor="event-title">
                Event Title
              </label>
              <input
                id="event-title"
                className="control"
                placeholder="Title of event"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                required
              />
            </div>

            <div className="fields">
              <div className="field">
                <label className="eyebrow" htmlFor="event-date">
                  Event Date
                </label>
                <input
                  id="event-date"
                  type="date"
                  className="control"
                  value={draft.event_date}
                  onChange={(e) => setDraft({ ...draft, event_date: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label className="eyebrow" htmlFor="event-loc">
                  Location
                </label>
                <input
                  id="event-loc"
                  className="control"
                  placeholder="Location / Venue"
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                />
              </div>
            </div>

            <div className="field">
              <label className="eyebrow" htmlFor="event-desc">
                Description
              </label>
              <textarea
                id="event-desc"
                className="control"
                rows={3}
                placeholder="Details of the event..."
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

export default Events;
