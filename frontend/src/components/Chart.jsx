import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';

/*
 * Chart primitives.
 *
 * Plain SVG, no charting dependency. The rules:
 *   1. Every scale starts at zero and every axis is labelled.
 *   2. A series is always named in a legend, never identified by colour alone.
 *   3. Values are read on demand in a tooltip rather than printed on every bar.
 *   4. Colour is restrained: charcoal for the base series, red for whatever
 *      still needs attention, grey for supporting context.
 */

export const PALETTE = {
  ink: 'var(--chart-ink)',
  brand: 'var(--brand)',
  grey: 'var(--chart-grey)',
  amber: '#D98A1C',
  // Names used by earlier versions of the charts.
  signal: 'var(--chart-ink)',
  caution: 'var(--brand)',
  alert: 'var(--brand)',
  neutral: 'var(--chart-grey)',
};

const colourOf = (tone) => PALETTE[tone] || tone || PALETTE.ink;

/* Draws the chart at the width it actually occupies, so type and strokes
   stay at their intended size instead of scaling with the container. */
function useWidth(fallback = 640) {
  const ref = useRef(null);
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver((entries) => {
      const next = Math.round(entries[0].contentRect.width);
      if (next > 0) setWidth(next);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

/* Monotone cubic path: smooth, but never overshoots the real values. */
function monotonePath(points) {
  const n = points.length;
  if (n < 2) return '';
  const dx = [];
  const slope = [];
  for (let i = 0; i < n - 1; i += 1) {
    dx.push(points[i + 1][0] - points[i][0]);
    slope.push((points[i + 1][1] - points[i][1]) / dx[i]);
  }
  const tangent = [slope[0]];
  for (let i = 1; i < n - 1; i += 1) {
    tangent.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2);
  }
  tangent.push(slope[n - 2]);
  for (let i = 0; i < n - 1; i += 1) {
    if (slope[i] === 0) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
    } else {
      const a = tangent[i] / slope[i];
      const b = tangent[i + 1] / slope[i];
      const h = a * a + b * b;
      if (h > 9) {
        const t = 3 / Math.sqrt(h);
        tangent[i] = t * a * slope[i];
        tangent[i + 1] = t * b * slope[i];
      }
    }
  }
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i += 1) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const h = dx[i] / 3;
    d += ` C${(x0 + h).toFixed(1)},${(y0 + tangent[i] * h).toFixed(1)} ${(x1 - h).toFixed(1)},${(y1 - tangent[i + 1] * h).toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  return d;
}

/* A step of 1, 2 or 5 times a power of ten, never below one whole unit,
   so an axis of report counts never shows a fractional tick. */
function niceStep(peak, count) {
  const raw = Math.max(peak / count, 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const scaled = raw / magnitude;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return step * magnitude;
}

function niceScale(peak, count = 4) {
  const step = niceStep(peak || 1, count);
  const max = Math.max(step, Math.ceil((peak || 1) / step) * step);
  const ticks = [];
  for (let t = 0; t <= max + step / 2; t += step) ticks.push(t);
  return { max, ticks };
}

export function formatCompact(value) {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}m`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(Math.round(n * 10) / 10);
}

function Tip({ xPct, title, rows }) {
  const align = xPct > 70 ? 'translateX(-100%)' : xPct < 30 ? 'translateX(0)' : 'translateX(-50%)';
  return (
    <div className="chart-tip" style={{ left: `${xPct}%`, transform: align }} role="presentation">
      <div className="chart-tip-title">{title}</div>
      {rows.map((r) => (
        <div className="chart-tip-row" key={r.label}>
          <span className="legend-swatch" style={{ backgroundColor: r.colour }} />
          <span>{r.label}</span>
          <b>{r.value}</b>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------- Grouped bar chart */

export function GroupedBarChart({
  data = [],
  series = [],
  height = 220,
  yLabel = '',
  valueFormatter = formatCompact,
  legend = true,
}) {
  const [active, setActive] = useState(null);
  const [frameRef, width] = useWidth();
  const pad = { top: 24, right: 6, bottom: 26, left: 36 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const { max, ticks } = useMemo(() => {
    let peak = 0;
    data.forEach((row) => {
      series.forEach((s) => {
        const v = Number(row[s.key]) || 0;
        if (v > peak) peak = v;
      });
    });
    return niceScale(peak, 4);
  }, [data, series]);

  if (!data.length || !series.length) {
    return <p className="empty">No activity recorded for this period.</p>;
  }

  const slot = plotW / data.length;
  const groupW = Math.min(slot * 0.66, 12 * series.length);
  const barW = Math.max(2, groupW / series.length - 1);
  const activeRow = active === null ? null : data[active];

  return (
    <div className="chart-frame" ref={frameRef}>
      {activeRow ? (
        <Tip
          xPct={((pad.left + active * slot + slot / 2) / width) * 100}
          title={activeRow.fullLabel || activeRow.label}
          rows={series.map((s) => ({
            label: s.label,
            colour: colourOf(s.tone),
            value: Number(activeRow[s.key] || 0).toLocaleString(),
          }))}
        />
      ) : null}
      <svg
        className="chart"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={`Bar chart of ${series.map((s) => s.label).join(' and ')} over time`}
        onMouseLeave={() => setActive(null)}
      >
        {ticks.map((t, i) => {
          const y = pad.top + plotH - (t / max) * plotH;
          return (
            <g key={i}>
              <line className="chart-grid-line" x1={pad.left} y1={y} x2={width - pad.right} y2={y} />
              <text className="chart-tick chart-tick-y" x={pad.left - 8} y={y + 3.5}>
                {valueFormatter(t)}
              </text>
            </g>
          );
        })}

        <line className="chart-axis-line" x1={pad.left} y1={pad.top + plotH} x2={width - pad.right} y2={pad.top + plotH} />

        {yLabel ? (
          <text className="chart-axis-title" x={4} y={12}>
            {yLabel}
          </text>
        ) : null}

        {data.map((row, i) => {
          const slotX = pad.left + i * slot;
          const startX = slotX + (slot - (barW + 1) * series.length) / 2;
          const isActive = active === i;

          return (
            <g
              key={i}
              className={`chart-col${isActive ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              <rect className="chart-band" x={slotX} y={pad.top} width={slot} height={plotH} rx="3" />
              {series.map((s, si) => {
                const value = Number(row[s.key]) || 0;
                const h = max === 0 ? 0 : (value / max) * plotH;
                const barH = Math.max(value === 0 ? 0 : 2, h);
                return (
                  <rect
                    key={s.key}
                    x={startX + si * (barW + 1)}
                    y={pad.top + plotH - barH}
                    width={barW}
                    height={barH}
                    fill={colourOf(s.tone)}
                    rx="1.5"
                  />
                );
              })}
              <rect
                className="chart-hit"
                x={slotX}
                y={pad.top}
                width={slot}
                height={plotH}
                tabIndex={0}
                aria-label={`${row.fullLabel || row.label}: ${series.map((s) => `${s.label} ${row[s.key]}`).join(', ')}`}
              />
              {row.label ? (
                <text className="chart-tick chart-tick-x" x={slotX + slot / 2} y={height - 8}>
                  {row.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {legend ? <Legend series={series} /> : null}
    </div>
  );
}

/* ------------------------------------------------------------ Trend line */

export function TrendChart({ data = [], valueKey = 'value', height = 200, yLabel = '', label = 'Reports' }) {
  const [active, setActive] = useState(null);
  const [frameRef, width] = useWidth();
  const pad = { top: 24, right: 8, bottom: 26, left: 36 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const { max, ticks } = useMemo(() => {
    const peak = data.reduce((m, row) => Math.max(m, Number(row[valueKey]) || 0), 0);
    return niceScale(peak, 3);
  }, [data, valueKey]);

  if (data.length < 2) return <p className="empty">Not enough history to draw a trend.</p>;

  const stepX = plotW / (data.length - 1);
  const points = data.map((row, i) => [
    pad.left + i * stepX,
    pad.top + plotH - ((Number(row[valueKey]) || 0) / max) * plotH,
  ]);

  const line = monotonePath(points);

  const activeRow = active === null ? null : data[active];

  return (
    <div className="chart-frame" ref={frameRef}>
      {activeRow ? (
        <Tip
          xPct={(points[active][0] / width) * 100}
          title={activeRow.fullLabel || activeRow.label}
          rows={[{ label, colour: PALETTE.ink, value: activeRow[valueKey] }]}
        />
      ) : null}
      <svg
        className="chart"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={`Trend of ${label} over time`}
        onMouseLeave={() => setActive(null)}
      >
        {ticks.map((t, i) => {
          const y = pad.top + plotH - (t / max) * plotH;
          return (
            <g key={i}>
              <line className="chart-grid-line" x1={pad.left} y1={y} x2={width - pad.right} y2={y} />
              <text className="chart-tick chart-tick-y" x={pad.left - 8} y={y + 3.5}>
                {formatCompact(t)}
              </text>
            </g>
          );
        })}

        {yLabel ? (
          <text className="chart-axis-title" x={4} y={12}>
            {yLabel}
          </text>
        ) : null}

        <path className="chart-line" d={line} stroke="var(--chart-ink)" />

        {data.map((row, i) => {
          const [x, y] = points[i];
          return (
            <g key={i} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}>
              {active === i ? (
                <>
                  <line className="chart-axis-line" x1={x} y1={pad.top} x2={x} y2={pad.top + plotH} strokeDasharray="3 3" />
                  <circle className="chart-dot" cx={x} cy={y} r="4.5" fill="var(--brand)" />
                </>
              ) : null}
              <rect
                className="chart-hit"
                x={x - stepX / 2}
                y={pad.top}
                width={stepX}
                height={plotH}
                tabIndex={0}
                aria-label={`${row.fullLabel || row.label}: ${row[valueKey]}`}
              />
              {row.label ? (
                <text className="chart-tick chart-tick-x" x={x} y={height - 8}>
                  {row.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------------- Legend */

export function Legend({ series = [] }) {
  return (
    <div className="legend">
      {series.map((s) => (
        <span className="legend-item" key={s.key || s.label}>
          <span className="legend-swatch" style={{ backgroundColor: colourOf(s.tone) }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

/* --------------------------------------------------------- Outcome gauge */

export function Gauge({ parts = [], label = 'closed', highlight = 0 }) {
  const total = parts.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
  const cx = 110;
  const cy = 104;
  const r = 84;
  const stroke = 20;

  const point = (fraction) => {
    const angle = Math.PI - fraction * Math.PI;
    return [cx + r * Math.cos(angle), cy - r * Math.sin(angle)];
  };

  const arc = (from, to) => {
    const [x1, y1] = point(from);
    const [x2, y2] = point(to);
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };

  let cursor = 0;
  const segments = parts.map((p) => {
    const share = total ? (Number(p.value) || 0) / total : 0;
    const seg = { ...p, from: cursor, to: cursor + share };
    cursor += share;
    return seg;
  });

  const lead = parts[highlight];
  const leadPct = total && lead ? ((Number(lead.value) || 0) / total) * 100 : 0;

  return (
    <div className="gauge">
      <svg viewBox="0 0 220 124" role="img" aria-label={parts.map((p) => `${p.label}: ${p.value}`).join('; ')}>
        <path d={arc(0, 1)} stroke="var(--line-soft)" strokeWidth={stroke} fill="none" />
        {segments.map((s) =>
          s.to - s.from > 0.002 ? (
            <path
              key={s.label}
              d={arc(s.from + 0.004, Math.max(s.from + 0.004, s.to - 0.004))}
              stroke={colourOf(s.tone)}
              strokeWidth={stroke}
              fill="none"
            />
          ) : null
        )}
        <text className="gauge-value" x={cx} y={cy - 10} textAnchor="middle">
          {total ? `${leadPct.toFixed(1)}%` : '0%'}
        </text>
        <text className="gauge-label" x={cx} y={cy + 10} textAnchor="middle">
          {label}
        </text>
      </svg>
      <div className="gauge-key">
        {parts.map((p) => {
          const pct = total ? ((Number(p.value) || 0) / total) * 100 : 0;
          return (
            <div className="gauge-key-row" key={p.label}>
              <span className="legend-swatch" style={{ backgroundColor: colourOf(p.tone) }} />
              <span>{p.label}</span>
              <span className="nums">{Number(p.value).toLocaleString()}</span>
              <span className="pct">{pct.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Sparkline */

export function Sparkline({ values = [], height = 26 }) {
  if (values.length < 2) return null;
  const width = 120;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const stepX = width / (values.length - 1);
  const line = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${(height - 2 - ((v - min) / span) * (height - 4)).toFixed(1)}`)
    .join(' ');

  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className="spark-line" d={line} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ---------------------------------------------------- Proportion strip */

export function ProportionBar({ parts = [], total }) {
  const sum = total || parts.reduce((acc, p) => acc + (Number(p.value) || 0), 0) || 1;
  return (
    <div className="proportion" role="img" aria-label={parts.map((p) => `${p.label}: ${p.value}`).join('; ')}>
      {parts.map((p) => (
        <div
          key={p.label}
          className="proportion-part"
          style={{ width: `${((Number(p.value) || 0) / sum) * 100}%`, backgroundColor: colourOf(p.tone) }}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------- Horizontal bars */

export function RankedBars({ items = [], valueFormatter = (v) => Number(v).toLocaleString(), tone = 'brand' }) {
  const max = Math.max(...items.map((i) => Number(i.value) || 0), 1);

  if (!items.length) return <p className="empty">Nothing recorded in this period.</p>;

  return (
    <div className="hbars">
      {items.map((item) => (
        <div className="hbar" key={item.label}>
          <span className="hbar-label" title={item.label}>
            {item.label}
          </span>
          <span className="hbar-track" aria-hidden="true">
            <span
              className="hbar-fill"
              style={{
                display: 'block',
                width: `${((Number(item.value) || 0) / max) * 100}%`,
                backgroundColor: colourOf(item.tone || tone),
              }}
            />
          </span>
          <span className="hbar-value">{valueFormatter(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default GroupedBarChart;
