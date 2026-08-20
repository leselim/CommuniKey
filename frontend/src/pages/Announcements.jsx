import React, { useMemo, useState } from 'react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
import { announcements as demoAnnouncements } from '../services/demoData';
import { formatRelative, formatStamp } from '../utils/format';

const EMPTY_DRAFT = {
  title: '',
  content: '',
  priority: 'normal',
};

function Announcements() {
  const { user } = useAuth();
  const { items, loading, create } = useCollection('/announcements', demoAnnouncements);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [notice, setNotice] = useState('');

  const isAdmin =
    user && (user.role === 'Community Administrator' || user.role === 'System Administrator');

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items
      .filter((item) => !term || `${item.title} ${item.content}`.toLowerCase().includes(term))
      .sort((a, b) => new Date(b.date_published) - new Date(a.date_published));
  }, [items, query]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) return;

    const author = user ? `${user.first_name} ${user.last_name} (${user.role})` : 'Community Administrator';

    await create({
      ...draft,
      title: draft.title.trim(),
      content: draft.content.trim(),
      created_by: author,
      date_published: new Date().toISOString(),
    });

    setDraft(EMPTY_DRAFT);
    setModalOpen(false);
    setNotice('Official announcement published successfully.');
    setTimeout(() => setNotice(''), 5000);
  };

  return (
    <div className="stack">
      <header className="masthead">
        <div>
          <p className="eyebrow">Communication</p>
          <h1>Announcements</h1>
          <p className="masthead-meta">Official updates published by community administrators.</p>
        </div>
        <div className="cluster">
          {isAdmin ? (
            <button type="button" className="btn btn-solid" onClick={() => setModalOpen(true)}>
              Publish announcement
            </button>
          ) : null}
          <p className="mono">{items.length} published</p>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}

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
                  {item.created_by ? <span>By {item.created_by}</span> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {modalOpen ? (
        <Modal
          title="Publish Announcement"
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" form="announcement-form" className="btn btn-solid">
                Publish
              </button>
            </>
          }
        >
          <form id="announcement-form" onSubmit={handlePublish} className="stack" style={{ gap: 'var(--s4)' }}>
            <div className="field">
              <label className="eyebrow" htmlFor="ann-title">
                Title
              </label>
              <input
                id="ann-title"
                className="control"
                placeholder="Announcement headline"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label className="eyebrow" htmlFor="ann-priority">
                Priority Level
              </label>
              <select
                id="ann-priority"
                className="control"
                value={draft.priority}
                onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
                style={{ color: 'var(--paper)', backgroundColor: 'var(--ink)' }}
              >
                <option value="normal">Normal Announcement</option>
                <option value="high">High Priority Alert</option>
              </select>
            </div>

            <div className="field">
              <label className="eyebrow" htmlFor="ann-content">
                Announcement Content
              </label>
              <textarea
                id="ann-content"
                className="control"
                rows={4}
                placeholder="Write announcement details..."
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                required
              />
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

export default Announcements;
