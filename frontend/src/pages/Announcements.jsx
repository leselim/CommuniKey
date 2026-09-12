import React, { useMemo, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { Card, EmptyState, MetaItem, SearchField, SectionBar, Skeleton, Tabs } from '../components/ui';
import useCollection from '../hooks/useCollection';
import { announcements as demoAnnouncements } from '../services/demoData';
import { formatRelative, formatStamp } from '../utils/format';

const ANNOUNCEMENT_FILTERS = ['All', 'Urgent', 'General'];

function Announcements() {
  const { items, loading } = useCollection('/announcements', demoAnnouncements);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items
      .filter((item) => {
        if (filter === 'Urgent') return item.priority === 'high';
        if (filter === 'General') return item.priority !== 'high';
        return true;
      })
      .filter((item) => !term || `${item.title || ''} ${item.content || ''} ${item.created_by || ''}`.toLowerCase().includes(term))
      .sort((a, b) => new Date(b.date_published) - new Date(a.date_published));
  }, [items, query, filter]);

  const highCount = items.filter((i) => i.priority === 'high').length;
  const counts = { All: items.length, Urgent: highCount, General: items.length - highCount };

  return (
    <div className="page">
      <SectionBar
        icon="megaphone"
        title="Estate notices"
        stats={[
          { label: 'Published:', value: items.length },
          { label: 'Urgent:', value: highCount },
        ]}
      />

      <Card flush>
        <div className="toolbar">
          <Tabs
            label="Filter notices"
            value={filter}
            onChange={setFilter}
            items={ANNOUNCEMENT_FILTERS.map((f) => ({ value: f, label: f, count: counts[f] }))}
          />
          <SearchField value={query} onChange={setQuery} placeholder="Search title, message or author" label="Search announcements" />
        </div>
        <div className="info-line">Official updates published by estate administrators.</div>

        {loading && items.length === 0 ? (
          <Skeleton rows={3} />
        ) : visible.length === 0 ? (
          <EmptyState icon="search" title="Nothing matches that search" text="Try a different word or filter." />
        ) : (
          visible.map((item) => (
            <article className="list-row" key={item.id} style={{ alignItems: 'flex-start', padding: '14px' }}>
              <span className={`dot ${item.priority === 'high' ? 'dot-amber' : 'dot-grey'}`} style={{ marginTop: 6 }} aria-hidden="true" />
              <span className="list-main">
                <h3 className="list-title">{item.title}</h3>
                <p className="list-text" style={{ maxWidth: 760 }}>
                  {item.content}
                </p>
                <span className="list-meta" style={{ '--meta-col': '170px' }}>
                  <MetaItem icon="calendar">{formatStamp(item.date_published)}</MetaItem>
                  <MetaItem icon="clock">{formatRelative(item.date_published)}</MetaItem>
                  {item.created_by ? <MetaItem icon="user">{item.created_by}</MetaItem> : null}
                </span>
              </span>
              <span className="list-end" style={{ '--end-col': '90px' }}>
                {item.priority === 'high' ? <StatusBadge status="High priority" /> : null}
              </span>
            </article>
          ))
        )}
      </Card>
    </div>
  );
}

export default Announcements;
