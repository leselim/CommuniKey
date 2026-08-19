import React, { useMemo, useState } from 'react';
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

function Events() {
  const { items, loading, update } = useCollection('/events', demoEvents);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

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
        <p className="mono">
          {upcoming.length} upcoming / {attending} attending
        </p>
      </header>

      <Calendar month={month} events={items} onStep={step} />

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Schedule</p>
          <span className="mono">Next {upcoming.length}</span>
        </div>

        {loading && items.length === 0 ? (
          <div>
            <div className="bar" />
            <div className="bar" />
          </div>
        ) : upcoming.length === 0 ? (
          <p className="blank">No events scheduled.</p>
        ) : (
          <ul className="ledger">
            {upcoming.map((item) => (
              <li className="entry" key={item.id}>
                <h3 className="entry-title">{item.event_name}</h3>
                <span className="entry-aside">
                  <button
                    type="button"
                    className={`btn${item.attending ? ' btn-affirm' : ' btn-solid'}`}
                    aria-pressed={Boolean(item.attending)}
                    onClick={() => update(item.id, { attending: !item.attending })}
                  >
                    {item.attending ? 'Attending' : 'RSVP'}
                  </button>
                </span>
                <p className="entry-body">{item.description}</p>
                <div className="entry-meta">
                  <span>{formatStamp(item.event_date)}</span>
                  {item.event_location ? <span>{item.event_location}</span> : null}
                  {item.max_attendees ? <span>{item.max_attendees} places</span> : null}
                  <span>{formatRelative(item.event_date)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Events;
