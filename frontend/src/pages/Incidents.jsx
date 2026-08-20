import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
import {
  INCIDENT_STATUSES,
  INCIDENT_TYPES,
  incidents as demoIncidents,
} from '../services/demoData';
import { formatRelative, formatStamp } from '../utils/format';

const FILTERS = ['All', ...INCIDENT_STATUSES];

const EMPTY_DRAFT = {
  incident_type: INCIDENT_TYPES[0],
  location: '',
  description: '',
  image_url: '',
};

function Incidents() {
  const { user } = useAuth();
  const { items, loading, create, update } = useCollection('/incidents', demoIncidents);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');

  const canTriage =
    user &&
    (user.role === 'Safety Volunteer' ||
      user.role === 'Community Administrator' ||
      user.role === 'System Administrator');

  useEffect(() => {
    if (!receipt) return undefined;
    const timer = setTimeout(() => setReceipt(''), 6000);
    return () => clearTimeout(timer);
  }, [receipt]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items
      .filter((item) => filter === 'All' || item.status === filter)
      .filter(
        (item) =>
          !term ||
          `${item.incident_type} ${item.description} ${item.location || ''}`
            .toLowerCase()
            .includes(term)
      )
      .sort((a, b) => new Date(b.date_reported) - new Date(a.date_reported));
  }, [items, filter, query]);

  const submit = async (event) => {
    event.preventDefault();
    if (draft.description.trim().length < 10) {
      setError('Describe the incident in at least 10 characters.');
      return;
    }

    setError('');
    const reporterName = user ? `${user.first_name} ${user.last_name}` : 'Resident Member';
    await create({
      ...draft,
      description: draft.description.trim(),
      location: draft.location.trim(),
      status: 'Reported',
      date_reported: new Date().toISOString(),
      reported_by: reporterName,
    });

    setDraft(EMPTY_DRAFT);
    setFormOpen(false);
    setReceipt(`Report submitted by ${reporterName}. Track its status below.`);
  };

  const handleStatusChange = async (id, nextStatus) => {
    await update(id, { status: nextStatus });
    setReceipt(`Incident status updated to "${nextStatus}".`);
  };

  const counts = INCIDENT_STATUSES.reduce(
    (acc, status) => ({ ...acc, [status]: items.filter((i) => i.status === status).length }),
    { All: items.length }
  );

  return (
    <div className="stack">
      <header className="masthead">
        <div>
          <p className="eyebrow">Safety</p>
          <h1>Incidents</h1>
          <p className="masthead-meta">
            Report suspicious activity and follow the status of your reports.
          </p>
        </div>
        <button type="button" className="btn btn-solid" onClick={() => setFormOpen(true)}>
          Report an incident
        </button>
      </header>

      {receipt ? <p className="notice">{receipt}</p> : null}

      <section className="section">
        <div className="section-head">
          <div className="filter">
            {FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                className={`filter-item${filter === status ? ' on' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status}
                <span className="mono"> {counts[status] || 0}</span>
              </button>
            ))}
          </div>
          <input
            className="searchbar"
            type="search"
            placeholder="Search"
            value={query}
            aria-label="Search incidents"
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
          <p className="blank">No incidents match this view.</p>
        ) : (
          <ul className="ledger">
            {visible.map((item) => (
              <li className="entry" key={item.id}>
                <h3 className="entry-title">{item.incident_type}</h3>
                <span className="entry-aside" style={{ display: 'flex', gap: 'var(--s2)', alignItems: 'center' }}>
                  <StatusBadge status={item.status} />
                  {canTriage ? (
                    <select
                      className="control"
                      value={item.status}
                      style={{
                        padding: '0.15rem 0.4rem',
                        fontSize: '0.7rem',
                        color: 'var(--paper)',
                        backgroundColor: 'var(--panel)',
                      }}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    >
                      <option value="Reported">Reported</option>
                      <option value="Under review">Under review</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  ) : null}
                </span>
                <p className="entry-body">{item.description}</p>
                <div className="entry-meta">
                  <span title={formatStamp(item.date_reported)}>
                    {formatRelative(item.date_reported)}
                  </span>
                  {item.location ? <span>{item.location}</span> : null}
                  {item.reported_by ? <span>By {item.reported_by}</span> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {formOpen ? (
        <Modal
          title="Report an incident"
          onClose={() => setFormOpen(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setFormOpen(false)}>
                Cancel
              </button>
              <button type="submit" form="incident-form" className="btn btn-solid">
                Submit report
              </button>
            </>
          }
        >
          <form id="incident-form" onSubmit={submit}>
            <div className="fields">
              <div className="field">
                <label className="eyebrow" htmlFor="incident-type">
                  Incident type
                </label>
                <select
                  id="incident-type"
                  className="control"
                  value={draft.incident_type}
                  onChange={(event) => setDraft({ ...draft, incident_type: event.target.value })}
                >
                  {INCIDENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="eyebrow" htmlFor="incident-location">
                  Location
                </label>
                <input
                  id="incident-location"
                  className="control"
                  placeholder="Street or section"
                  value={draft.location}
                  onChange={(event) => setDraft({ ...draft, location: event.target.value })}
                />
              </div>

              <div className="field field-wide">
                <label className="eyebrow" htmlFor="incident-description">
                  Description
                </label>
                <textarea
                  id="incident-description"
                  className="control"
                  placeholder="What happened, when, and who was involved"
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                />
              </div>

              <div className="field field-wide">
                <label className="eyebrow" htmlFor="incident-image">
                  Photo link
                </label>
                <input
                  id="incident-image"
                  className="control"
                  placeholder="Optional"
                  value={draft.image_url}
                  onChange={(event) => setDraft({ ...draft, image_url: event.target.value })}
                />
              </div>
            </div>

            {error ? <p className="error">{error}</p> : null}
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

export default Incidents;
