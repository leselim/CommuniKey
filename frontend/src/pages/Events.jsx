import React, { useMemo, useState } from 'react';
import Icon from '../components/Icon';
import { Card, DateBox, EmptyState, MetaItem, SectionBar, Skeleton } from '../components/ui';
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
    <Card
      title={label}
      sub={`${marked.size} ${marked.size === 1 ? 'day' : 'days'} with events`}
      actions={
        <span className="row" style={{ gap: 4 }}>
          <button type="button" className="btn btn-sm" aria-label="Previous month" onClick={() => onStep(-1)}>
            <Icon name="chevronLeft" />
          </button>
          <button type="button" className="btn btn-sm" aria-label="Next month" onClick={() => onStep(1)}>
            <Icon name="chevronRight" />
          </button>
        </span>
      }
    >
      <div className="calendar">
        {WEEKDAYS.map((day) => (
          <div className="calendar-dow" key={day}>
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
      <div className="calendar-key">
        <span className="row" style={{ gap: 6 }}>
          <span className="dot" style={{ background: 'var(--sidebar)' }} />
          Today
        </span>
        <span className="row" style={{ gap: 6 }}>
          <span className="dot" style={{ background: 'var(--brand)' }} />
          Event
        </span>
      </div>
    </Card>
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

  const step = (offset) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));

  return (
    <div className="page">
      <SectionBar
        icon="calendar"
        title="Community calendar"
        stats={[
          { label: 'Upcoming:', value: upcoming.length },
          { label: 'You are attending:', value: attending },
        ]}
      />

      <div className="grid grid-3" style={{ alignItems: 'start' }}>
        <Calendar month={month} events={items} onStep={step} />

        <Card className="span-2" title="Schedule" sub="Gatherings, meetings and workshops. RSVP so organisers can plan." flush ruled>
          {loading && items.length === 0 ? (
            <Skeleton rows={3} />
          ) : upcoming.length === 0 ? (
            <EmptyState icon="calendar" title="No events scheduled" text="New events from the estate will appear here." />
          ) : (
            upcoming.map((item) => (
              <article className="list-row" key={item.id} style={{ alignItems: 'flex-start', padding: 14 }}>
                <DateBox value={item.event_date} />
                <span className="list-main">
                  <h3 className="list-title">{item.event_name || item.title}</h3>
                  <p className="list-text">{item.description}</p>
                  <span className="list-meta" style={{ '--meta-col': '180px' }}>
                    <MetaItem icon="clock">{formatStamp(item.event_date)}</MetaItem>
                    {item.event_location ? <MetaItem icon="mapPin">{item.event_location}</MetaItem> : null}
                    {item.max_attendees ? <MetaItem icon="users">{item.max_attendees} places</MetaItem> : null}
                    <span>{formatRelative(item.event_date)}</span>
                  </span>
                </span>
                <button
                  type="button"
                  className={`btn${item.attending ? ' btn-affirm' : ' btn-primary'}`}
                  aria-pressed={Boolean(item.attending)}
                  onClick={() => update(item.id, { attending: !item.attending })}
                  style={{ minWidth: 96 }}
                >
                  {item.attending ? (
                    <>
                      <Icon name="check" />
                      Attending
                    </>
                  ) : (
                    'RSVP'
                  )}
                </button>
              </article>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}

export default Events;
