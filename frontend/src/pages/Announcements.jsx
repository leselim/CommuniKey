import React, { useMemo, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import useCollection from '../hooks/useCollection';
import { announcements as demoAnnouncements } from '../services/demoData';
import { formatRelative, formatStamp } from '../utils/format';

function Announcements() {
  const { items, loading } = useCollection('/announcements', demoAnnouncements);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items
      .filter((item) => !term || `${item.title} ${item.content}`.toLowerCase().includes(term))
      .sort((a, b) => new Date(b.date_published) - new Date(a.date_published));
  }, [items, query]);

  return (
    <div className="stack">
      <header className="masthead">
        <div>
          <p className="eyebrow">Communication</p>
          <h1>Announcements</h1>
          <p className="masthead-meta">Official updates published by community administrators.</p>
        </div>
        <p className="mono">{items.length} published</p>
      </header>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Archive</p>
          <input
            className="searchbar"
            type="search"
            placeholder="Search announcements"
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
