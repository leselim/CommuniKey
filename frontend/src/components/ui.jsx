import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Icon from './Icon';

/*
 * Layout primitives.
 *
 * Every page is built from the same few parts, so the whole product keeps
 * one rhythm: a section bar that says what an area is and shows its key
 * figures, then cards that hold the detail.
 */

export function SectionBar({ icon, title, stats = [], children, quiet = false }) {
  const visibleStats = stats.filter(Boolean);
  return (
    <section className="sbar" aria-label={title}>
      <div className="sbar-title">
        <span className={`badge-icon${quiet ? ' badge-icon-quiet' : ''}`}>
          <Icon name={icon} />
        </span>
        <h2>{title}</h2>
      </div>
      {visibleStats.length ? (
        <dl className="sbar-stats">
          {visibleStats.map((s) => (
            <div className="stat" key={s.label}>
              <dt>{s.label}</dt>
              <dd>
                {s.value}
                {s.unit ? <span className="stat-unit">{s.unit}</span> : null}
                {s.after || null}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {children ? <div className="sbar-actions">{children}</div> : null}
    </section>
  );
}

export function Card({ title, sub, actions, children, className = '', flush = false, ruled = false, foot }) {
  return (
    <section className={`card ${className}`.trim()}>
      {title || actions ? (
        <header className={`card-head${ruled ? ' ruled' : ''}`}>
          <div>
            {title ? <h3>{title}</h3> : null}
            {sub ? <p className="card-sub">{sub}</p> : null}
          </div>
          {actions ? <div className="card-actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className={`card-body${flush ? ' flush' : ''}`}>{children}</div>
      {foot ? <div className="card-foot">{foot}</div> : null}
    </section>
  );
}

export function Select({ value, onChange, options, label, className = '' }) {
  return (
    <span className={`select ${className}`.trim()}>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" />
    </span>
  );
}

export function Tabs({ items, value, onChange, label }) {
  return (
    <div className="tabs" role="group" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          className="tab"
          aria-pressed={value === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
          {item.count !== undefined ? <span className="tab-count">{item.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function SearchField({ value, onChange, placeholder = 'Search', label }) {
  return (
    <label className="search">
      <Icon name="search" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={label || placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function EmptyState({ icon = 'info', title, text, action }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} />
      </span>
      <p className="empty-title">{title}</p>
      {text ? <p>{text}</p> : null}
      {action || null}
    </div>
  );
}

export function Skeleton({ rows = 3 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton" key={i} />
      ))}
    </div>
  );
}

/* Confirmation after an action. Announced politely, never blocks the page. */
export function Toast({ message }) {
  if (typeof document === 'undefined') return null;
  return ReactDOM.createPortal(
    <div className="toast-region" aria-live="polite" role="status">
      {message ? (
        <div className="toast" key={message}>
          <Icon name="checkCircle" />
          <span>{message}</span>
        </div>
      ) : null}
    </div>,
    document.body
  );
}

/* A short lived message with its own timer. */
export function useFlash(setter, ms = 4000) {
  return (message) => {
    setter(message);
    if (message) {
      setTimeout(() => setter((current) => (current === message ? '' : current)), ms);
    }
  };
}

export function Details({ rows }) {
  return (
    <dl className="details">
      {rows.filter(Boolean).map((row) => (
        <div className="details-row" key={row.label}>
          <dt>{row.label}</dt>
          <dd className={row.masked ? 'masked' : undefined}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function MetaItem({ icon, children, title }) {
  return (
    <span className="meta-item" title={title}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </span>
  );
}

export function DateBox({ value }) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const month = date.toLocaleDateString('en-GB', { month: 'short' });
  return (
    <span className="datebox" aria-hidden="true">
      <span className="datebox-month">{month}</span>
      <span className="datebox-day">{date.getDate()}</span>
    </span>
  );
}

export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = `${title} | CommuniKey`;
  }, [title]);
}

/* Change against the previous period. More reports is worse, so an increase is red. */
export function Delta({ change }) {
  if (!change) return null;
  return (
    <span className={`delta ${change > 0 ? 'delta-bad' : 'delta-good'}`}>
      {change > 0 ? '+' : ''}
      {change}%
    </span>
  );
}
