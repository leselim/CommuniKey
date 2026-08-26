import React, { useMemo, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import useCollection from '../hooks/useCollection';
import { announcements as demoAnnouncements } from '../services/demoData';
import { formatRelative, formatStamp } from '../utils/format';

const ANNOUNCEMENT_FILTERS = ['All', 'High Priority', 'General'];

function Announcements() {
  const { items, loading } = useCollection('/announcements', demoAnnouncements);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items
      .filter((item) => {
        if (filter === 'High Priority') return item.priority === 'high';
        if (filter === 'General') return item.priority !== 'high';
        return true;
      })
      .filter(
        (item) =>
          !term ||
          `${item.title || ''} ${item.content || ''} ${item.created_by || ''}`
            .toLowerCase()
            .includes(term)
      )
      .sort((a, b) => new Date(b.date_published) - new Date(a.date_published));
  }, [items, query, filter]);

  return (
    <div className="stack">
      <header className="masthead">
        <div>
          <h1 style={{ margin: 0 }}>Announcements</h1>
          <p className="masthead-meta" style={{ marginTop: 'var(--s1)' }}>Official updates published by community administrators.</p>
        </div>
        <p className="mono">{items.length} published</p>
      </header>

      <section className="section">
        <div className="section-head">
          <div className="filter">
            {ANNOUNCEMENT_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`filter-item${filter === f ? ' on' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            className="searchbar"
            type="search"
            placeholder="Search announcements by title, content, or author"
            value={query}
            aria-label="Search announcements"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {loading && items.length === 0 ? (
          <div>
            <div className="bar" />
            <div className="bar" />
            <div className="bar" />
          </div>
        ) : visible.length === 0 ? (
          <p className="blank">Nothing matches that search.</p>
        ) : (
          <ul className="ledger">
            {visible.map((item) => (
              <li className="entry" key={item.id}>
                <h3 className="entry-title">{item.title}</h3>
                <span className="entry-aside">
                  {item.priority === 'high' ? <StatusBadge status="Priority" /> : null}
                </span>
                <p className="entry-body">{item.content}</p>
                <div className="entry-meta">
                  <span>{formatStamp(item.date_published)}</span>
                  <span>{formatRelative(item.date_published)}</span>
                  {item.created_by ? <span>{item.created_by}</span> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Announcements;
