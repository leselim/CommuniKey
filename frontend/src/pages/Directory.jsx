import React, { useMemo, useState } from 'react';
import Avatar from '../components/Avatar';
import DataTable from '../components/DataTable';
import Icon from '../components/Icon';
import StatusBadge from '../components/StatusBadge';
import ResidentProfileModal from '../components/ResidentProfileModal';
import { Card, EmptyState, SearchField, SectionBar, Tabs } from '../components/ui';
import useCollection from '../hooks/useCollection';
import { useAuth } from '../context/AuthContext';
import { members as demoMembers } from '../services/demoData';

/*
 * Resident directory.
 *
 * A verified list of who lives here and who is responsible for what. Contact
 * details are masked from other residents and shown in full to estate
 * management, which is handled inside the profile dialog.
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

  const counts = GROUPS.reduce(
    (acc, g) => ({ ...acc, [g]: g === 'Everyone' ? items.length : items.filter((m) => groupOf(m.role) === g).length }),
    {}
  );

  return (
    <div className="page">
      <SectionBar
        icon="users"
        title="Verified members"
        stats={[
          { label: 'Residents:', value: counts.Residents },
          { label: 'Safety volunteers:', value: counts['Safety volunteers'] },
          { label: 'Estate staff:', value: counts['Estate staff'] },
        ]}
      />

      <Card flush>
        <div className="toolbar">
          <Tabs
            label="Filter by group"
            value={group}
            onChange={setGroup}
            items={GROUPS.map((g) => ({ value: g, label: g, count: counts[g] }))}
          />
          <SearchField value={query} onChange={setQuery} placeholder="Search name, street or role" label="Search the directory" />
        </div>

        {userRole !== 'Estate Administrator' ? (
          <div className="info-line">
            <Icon name="lock" />
            Phone numbers and email addresses are partly hidden from other residents. Estate management can see the full record.
          </div>
        ) : null}

        {visible.length === 0 ? (
          <EmptyState icon="search" title="Nobody matches that search" text="Check the spelling or choose another group." />
        ) : (
          <DataTable
            caption="Verified members"
            columns={[
              {
                key: 'name',
                header: 'Name',
                cell: (m) => {
                  const name = `${m.first_name} ${m.last_name}`;
                  return (
                    <>
                      <Avatar name={name} size="sm" />
                      <span className="identity-name">{name}</span>
                    </>
                  );
                },
              },
              { key: 'address', header: 'Address', width: '30%', cell: (m) => m.address || 'Riverside Estate' },
              { key: 'role', header: 'Role', width: '20%', cell: (m) => m.role || 'Resident' },
              { key: 'status', header: 'Status', width: '140px', cell: () => <StatusBadge status="Verified" /> },
              {
                key: 'profile',
                header: null,
                srHeader: 'Open profile',
                align: 'end',
                width: '100px',
                cell: (m) => (
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(m);
                    }}
                  >
                    View
                  </button>
                ),
              },
            ]}
            rows={visible}
            onRowClick={setSelected}
            rowLabel={(m) => `Open the profile for ${m.first_name} ${m.last_name}`}
          />
        )}
      </Card>

      {selected ? <ResidentProfileModal member={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

export default Directory;
