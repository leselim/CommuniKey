import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../components/Icon';
import DataTable, { CellPlace, CellStack } from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge, { labelOf } from '../components/StatusBadge';
import { Card, EmptyState, SearchField, SectionBar, Skeleton, Tabs, Toast } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import useCollection from '../hooks/useCollection';
import { INCIDENT_STATUSES, INCIDENT_TYPES, incidents as demoIncidents, profile } from '../services/demoData';
import { formatRelative, formatStamp } from '../utils/format';

const FILTERS = ['All', ...INCIDENT_STATUSES];

const EMPTY_DRAFT = {
  incident_type: INCIDENT_TYPES[0],
  location: '',
  description: '',
  image_url: '',
};

/* The stored value stays what the record has always held. What a person
   reads is the one word that belongs to that state. */
const STATUS_OPTIONS = [
  { value: 'Reported', label: labelOf('Reported') },
  { value: 'Under review', label: labelOf('Under review') },
  { value: 'Dispatched', label: labelOf('Dispatched') },
  { value: 'Resolved', label: labelOf('Resolved') },
];

function GeneralIncidentsHub() {
  const { userRole } = useAuth();
  const location = useLocation();
  const { items, loading, create, update } = useCollection('/incidents', demoIncidents);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'when', direction: 'desc' });
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');

  const canManage = userRole === 'Estate Administrator' || userRole === 'Safety Volunteer';
  const isTriage = location.pathname.toLowerCase() === '/volunteer/triage';

  useEffect(() => {
    if (!receipt) return undefined;
    const timer = setTimeout(() => setReceipt(''), 6000);
    return () => clearTimeout(timer);
  }, [receipt]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items
      .filter((item) => {
        if (filter === 'All') return true;
        const normFilter = filter.toLowerCase();
        const normStatus = String(item.status || '').toLowerCase();
        if (normFilter === 'under review' && (normStatus.includes('review') || normStatus.includes('pending'))) return true;
        return normStatus === normFilter;
      })
      .filter(
        (item) =>
          !term ||
          `${item.incident_type || ''} ${item.description || ''} ${item.location || ''} ${item.reported_by || ''} ${item.assigned_contractor || ''}`
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
    await create({
      ...draft,
      description: draft.description.trim(),
      location: draft.location.trim(),
      status: 'Reported',
      date_reported: new Date().toISOString(),
      reported_by: `${profile.first_name} ${profile.last_name}`,
    });

    setDraft(EMPTY_DRAFT);
    setFormOpen(false);
    setReceipt('Report submitted. You can follow its status in the list.');
  };

  const counts = INCIDENT_STATUSES.reduce(
    (acc, status) => ({ ...acc, [status]: items.filter((i) => i.status === status).length }),
    { All: items.length }
  );

  const openForm = () => {
    setError('');
    setFormOpen(true);
  };

  return (
    <div className="page">
      <SectionBar
        icon={isTriage ? 'shield' : 'alert'}
        title={isTriage ? 'Triage queue' : 'Incident log'}
        stats={[
          { label: `${labelOf('Reported')}:`, value: counts.Reported || 0 },
          { label: `${labelOf('Under review')}:`, value: counts['Under review'] || 0 },
          { label: `${labelOf('Resolved')}:`, value: counts.Resolved || 0 },
        ]}
      >
        <button type="button" className="btn btn-primary" onClick={openForm}>
          <Icon name="plus" />
          Report an incident
        </button>
      </SectionBar>

      <Card flush>
        <div className="toolbar">
          <Tabs
            label="Filter by status"
            value={filter}
            onChange={setFilter}
            items={FILTERS.map((status) => ({
              value: status,
              label: status === 'All' ? 'All' : labelOf(status),
              count: counts[status] || 0,
            }))}
          />
          <SearchField value={query} onChange={setQuery} placeholder="Search type, place or person" label="Search incidents" />
        </div>

        {!canManage ? (
          <div className="info-line">
            <Icon name="info" />
            Report suspicious activity and follow the status of your reports here.
          </div>
        ) : null}

        {loading && items.length === 0 ? (
          <Skeleton rows={4} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="search"
            title="No incidents match this view"
            text="Try another status or clear the search."
            action={
              filter !== 'All' || query ? (
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    setFilter('All');
                    setQuery('');
                  }}
                >
                  Show all incidents
                </button>
              ) : null
            }
          />
        ) : (
          <DataTable
            caption={isTriage ? 'Triage queue' : 'Incident log'}
            columns={[
              {
                key: 'incident',
                header: 'Incident',
                stack: true,
                cell: (item) => <CellStack title={item.incident_type} sub={item.description} clamp />,
              },
              {
                key: 'location',
                header: 'Location',
                width: '150px',
                cell: (item) => <CellPlace>{item.location || 'Not given'}</CellPlace>,
              },
              { key: 'by', header: 'Reported by', width: '140px', cell: (item) => item.reported_by || 'Unknown' },
              {
                key: 'when',
                header: 'Reported',
                width: '132px',
                sortValue: (item) => new Date(item.date_reported).getTime(),
                cell: (item) => (
                  <span className="cell-time" title={formatStamp(item.date_reported)}>
                    <Icon name="clock" />
                    {formatRelative(item.date_reported)}
                  </span>
                ),
              },
              canManage
                ? { key: 'assigned', header: 'Assigned', width: '140px', cell: (item) => item.assigned_contractor || 'Estate ops team' }
                : null,
              {
                key: 'status',
                header: 'Status',
                width: canManage ? '176px' : '128px',
                cell: (item) =>
                  canManage ? (
                    <span className="select select-status">
                      <select
                        value={item.status}
                        aria-label={`Status of ${item.incident_type}`}
                        onChange={(e) => update(item.id, { status: e.target.value })}
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <Icon name="chevronDown" />
                    </span>
                  ) : (
                    <StatusBadge status={item.status} />
                  ),
              },
            ]}
            rows={visible}
            sort={sort}
            onSortChange={setSort}
          />
        )}
      </Card>

      {formOpen ? (
        <Modal
          title="Report an incident"
          onClose={() => setFormOpen(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setFormOpen(false)}>
                Cancel
              </button>
              <button type="submit" form="incident-form" className="btn btn-primary">
                Submit report
              </button>
            </>
          }
        >
          <form id="incident-form" onSubmit={submit}>
            <div className="fields">
              <div className="field">
                <label htmlFor="incident-type">Incident type</label>
                <select
                  id="incident-type"
                  className="control"
                  value={draft.incident_type}
                  onChange={(event) => setDraft({ ...draft, incident_type: event.target.value })}
                  data-autofocus
                >
                  {INCIDENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="incident-location">Location</label>
                <input
                  id="incident-location"
                  className="control"
                  placeholder="Street or section"
                  value={draft.location}
                  onChange={(event) => setDraft({ ...draft, location: event.target.value })}
                />
              </div>

              <div className="field field-wide">
                <label htmlFor="incident-description">Description</label>
                <textarea
                  id="incident-description"
                  className="control"
                  placeholder="What happened, when, and who was involved"
                  value={draft.description}
                  aria-invalid={error ? 'true' : undefined}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                />
                {error ? <span className="field-error">{error}</span> : <span className="hint">At least 10 characters.</span>}
              </div>

              <div className="field field-wide">
                <label htmlFor="incident-image">Photo link</label>
                <input
                  id="incident-image"
                  className="control"
                  placeholder="Optional"
                  value={draft.image_url}
                  onChange={(event) => setDraft({ ...draft, image_url: event.target.value })}
                />
                <span className="hint">Direct upload arrives with the /uploads/images endpoint.</span>
              </div>
            </div>
          </form>
        </Modal>
      ) : null}

      <Toast message={receipt} />
    </div>
  );
}

/* One incident view for every role. What differs is what you can do with a
   report, which the hub decides from the signed in role. */
function Incidents() {
  return <GeneralIncidentsHub />;
}

export default Incidents;
