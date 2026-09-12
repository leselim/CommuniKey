import React from 'react';
import Icon from './Icon';
import { EmptyState } from './ui';

/*
 * The one table in the product.
 *
 * A clickable row is a convenience for the mouse only. Every such row also
 * carries a real button of its own, so the keyboard reaches the same place
 * without the row itself becoming a second control with the same name.
 *
 * Every table is declared as columns and rows rather than written out as
 * markup, so a column cannot drift out of line with the same column on
 * another screen. The component owns three things that were previously left
 * to each page:
 *
 *   Alignment.  A column declares align 'start', 'center' or 'end' once, and
 *               the header cell and every body cell below it take it together.
 *               Figures default to the right so digits line up in a column.
 *
 *   The line box. Each cell's first line is a box of a fixed height with its
 *               content centred inside it. A plain word, a status pill, a
 *               timestamp with an icon and a 28px avatar therefore all sit on
 *               the same line, whether or not the row wraps to two lines.
 *
 *   Width.      A column declares its width once, in a colgroup, so the same
 *               data occupies the same column on every screen.
 *
 * Sorting is handled here as well, so any table can be made sortable by
 * giving a column a sort value, and no page has to keep that state itself.
 */

export const ALIGN = { start: 'start', center: 'center', end: 'end' };

/*
 * On a phone, and on a tablet held upright, a seven column table is not a
 * table any more. Below this width each row is shown as a card: the first column becomes the heading, the rest
 * become labelled facts in a two column grid, and the row's buttons sit at the
 * foot. The labels share a column, so the values still line up down the card.
 */
const NARROW = '(max-width: 1100px)';

/* A wide table needs more room before it is worth keeping as a table. Below
   its own threshold it becomes cards instead of squeezing its columns. */
function thresholdFor(count) {
  if (count >= 7) return '(max-width: 1340px)';
  if (count >= 6) return '(max-width: 1400px)';
  return NARROW;
}

export function useNarrow(query = NARROW) {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false);
  const [narrow, setNarrow] = React.useState(get);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const list = window.matchMedia(query);
    const onChange = (event) => setNarrow(event.matches);
    setNarrow(list.matches);
    if (list.addEventListener) {
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    }
    list.addListener(onChange);
    return () => list.removeListener(onChange);
  }, [query]);

  return narrow;
}

function isActionColumn(column) {
  return column.role === 'actions' || column.header === null || column.header === 'Actions';
}

function headerAlignClass(align) {
  if (align === 'end') return 'th-end';
  if (align === 'center') return 'th-center';
  return '';
}

function cellAlignClass(align) {
  if (align === 'end') return 'cell cell-end';
  if (align === 'center') return 'cell cell-center';
  return 'cell';
}

/*
 * A two line cell: a title with a quieter line under it. The title sits in
 * the same line box as every other cell on the row, so the columns beside it
 * stay level with the title rather than floating against the middle of the
 * paragraph.
 */
export function CellStack({ title, sub, clamp = false }) {
  return (
    <>
      <span className="cell cell-title">{title}</span>
      {sub ? <span className={clamp ? 'cell-sub cell-clamp' : 'cell-sub'}>{sub}</span> : null}
    </>
  );
}

/* A person: avatar, name, and the quiet line under it. The avatar is exactly
   one line box high, so the name sits level with every other column. */
export function CellPerson({ name, meta, avatar }) {
  return (
    <>
      <span className="cell identity">
        {avatar}
        <span className="identity-name">{name}</span>
      </span>
      {meta ? <span className="cell-sub cell-sub-indent">{meta}</span> : null}
    </>
  );
}

export function CellTime({ children }) {
  return (
    <span className="cell-time">
      <Icon name="clock" />
      {children}
    </span>
  );
}

export function CellPlace({ children }) {
  return (
    <span className="cell-time">
      <Icon name="mapPin" />
      {children}
    </span>
  );
}

function DataTable({
  columns,
  rows,
  getKey,
  onRowClick,
  rowLabel,
  sort,
  onSortChange,
  empty,
  caption,
}) {
  const visible = columns.filter(Boolean);
  const narrow = useNarrow(thresholdFor(columns.filter(Boolean).length));

  const sorted = React.useMemo(() => {
    if (!sort || !sort.key) return rows;
    const column = visible.find((c) => c.key === sort.key);
    if (!column || !column.sortValue) return rows;
    const direction = sort.direction === 'desc' ? -1 : 1;
    return [...rows].sort((a, b) => {
      const left = column.sortValue(a);
      const right = column.sortValue(b);
      if (left === right) return 0;
      return (left > right ? 1 : -1) * direction;
    });
  }, [rows, sort, visible]);

  if (!rows.length && empty) {
    return empty.title ? <EmptyState {...empty} /> : empty;
  }

  const toggleSort = (key) => {
    if (!onSortChange) return;
    if (sort && sort.key === key) {
      onSortChange({ key, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      onSortChange({ key, direction: 'asc' });
    }
  };

  if (narrow) {
    const primary = visible.find((column) => column.role === 'primary') || visible[0];
    const actions = visible.filter(isActionColumn);
    const facts = visible.filter((column) => column !== primary && !isActionColumn(column));

    return (
      <ul className="row-cards" aria-label={caption}>
        {sorted.map((row, index) => {
          const key = getKey ? getKey(row, index) : row.id || index;
          return (
            <li className="row-card" key={key}>
              <div className="row-card-head" onClick={onRowClick ? () => onRowClick(row) : undefined}>
                {primary.cell(row, index)}
              </div>
              {facts.length ? (
                <dl className="row-card-facts">
                  {facts.map((column) => (
                    <div className="row-card-fact" key={column.key}>
                      <dt>{column.header}</dt>
                      <dd>{column.cell(row, index)}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {actions.length ? (
                <div className="row-card-actions">
                  {actions.map((column) => (
                    <React.Fragment key={column.key}>{column.cell(row, index)}</React.Fragment>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="table-wrap">
      <table className="table">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <colgroup>
          {visible.map((column) => (
            <col key={column.key} style={column.width ? { width: column.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {visible.map((column) => {
              const sortable = Boolean(column.sortValue && onSortChange);
              const active = sort && sort.key === column.key;
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={headerAlignClass(column.align)}
                  aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {column.header === null ? (
                    <span className="sr-only">{column.srHeader || 'Actions'}</span>
                  ) : sortable ? (
                    <button type="button" className="th-sort" onClick={() => toggleSort(column.key)}>
                      {column.header}
                      <Icon name={active && sort.direction === 'desc' ? 'chevronUp' : 'chevronDown'} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, index) => {
            const key = getKey ? getKey(row, index) : row.id || index;
            const clickable = Boolean(onRowClick);
            return (
              <tr
                key={key}
                className={clickable ? 'clickable' : undefined}
                onClick={clickable ? () => onRowClick(row) : undefined}
                title={clickable && rowLabel ? rowLabel(row) : undefined}
              >
                {visible.map((column) => {
                  const content = column.cell(row, index);
                  return (
                    <td key={column.key} className={column.nowrap ? 'td-nowrap' : undefined}>
                      {column.stack ? content : <span className={cellAlignClass(column.align)}>{content}</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
