import React, { useMemo, useState } from 'react';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import ResidentProfileModal from '../components/ResidentProfileModal';
import useCollection from '../hooks/useCollection';
import { useAuth } from '../context/AuthContext';
import { community, members as demoMembers } from '../services/demoData';

/*
 * Resident directory.
 *
 * A verified list of who lives here and who is responsible for what. Contact
 * details are masked from other residents and shown in full to estate
 * management, which is handled inside the profile dialog rather than here.
 */

const GROUPS = ['Everyone', 'Residents', 'Safety volunteers', 'Estate staff'];

function groupOf(role) {
  if (!role) return 'Residents';
  if (role.includes('Volunteer')) return 'Safety volunteers';
  if (role.includes('Administrator') || role.includes('Guard') || role.includes('Security')) {
    return 'Estate staff';
  }
  return 'Residents';
}

function Directory() {
  const { items } = useCollection('/members', demoMembers);
  const { userRole } = useAuth();

  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('Everyone');
  const [selected, setSelected] = useState(null);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items
      .filter((m) => group === 'Everyone' || groupOf(m.role) === group)
      .filter((m) => {
        if (!term) return true;
        const haystack = `${m.first_name} ${m.last_name} ${m.address || ''} ${m.role || ''}`;
        return haystack.toLowerCase().includes(term);
      })
      .sort((a, b) => a.last_name.localeCompare(b.last_name));
  }, [items, query, group]);

  return (
    <div className="stack">
      <header className="masthead">
        <div>
          <p className="eyebrow">{community.community_name}</p>
          <h1>Directory</h1>
          <p className="masthead-meta">
            Everyone verified against the resident register, and who to reach for what.
          </p>
        </div>
      </header>

      <div className="spread">
        <div className="filter" role="group" aria-label="Filter by group">
          {GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              className="filter-item"
              aria-pressed={group === g}
              onClick={() => setGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>

        <input
          className="searchbar"
          style={{ maxWidth: '20rem' }}
          type="search"
          placeholder="Search by name, street or role"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search the directory"
        />
      </div>

      {userRole !== 'Estate Administrator' ? (
        <p className="hint">
          Phone numbers and email addresses are partly hidden from other residents. Estate
          management can see the full record.
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="blank">Nobody matches that search.</p>
      ) : (
        <ul className="ledger">
          {visible.map((m) => {
            const name = `${m.first_name} ${m.last_name}`;
            return (
              <li className="entry" key={m.id}>
                <div className="identity">
                  <Avatar name={name} size="lg" ring />
                  <div className="identity-text">
                    <h3 className="entry-title">{name}</h3>
                    <span className="sm faint">{m.address || 'Riverside Estate'}</span>
                    <span className="sm faint">{m.role || 'Resident'}</span>
                  </div>
                </div>
                <span className="entry-aside cluster" style={{ gap: 'var(--s4)' }}>
                  <StatusBadge status="Verified" />
                  <button type="button" className="btn btn-sm" onClick={() => setSelected(m)}>
                    View
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {selected ? (
        <ResidentProfileModal member={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

export default Directory;
