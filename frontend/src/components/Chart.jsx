import React, { useMemo, useState } from 'react';

/*
 * Chart primitives.
 *
 * Drawn as plain SVG so there is no charting dependency to install or
 * license. Three rules are applied consistently:
 *   1. Every axis is labelled and every scale starts at zero.
 *   2. A series is never identified by colour alone - the legend names it
 *      and the readout repeats the name when you hover.
 *   3. Values are read on demand in the readout strip instead of being
 *      printed on top of every bar, which is what makes most dashboard
 *      charts unreadable.
 */

const PALETTE = {
  signal: 'var(--signal)',
  caution: 'var(--caution)',
  alert: 'var(--alert)',
  neutral: 'var(--line-hi)',
};

function niceCeiling(value) {
  if (value <= 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const scaled = value / magnitude;
  let step;
  if (scaled <= 1) step = 1;
  else if (scaled <= 2) step = 2;
  else if (scaled <= 2.5) step = 2.5;
  else if (scaled <= 5) step = 5;
  else step = 10;
  return step * magnitude;
}

export function formatCompact(value) {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}m`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

/* ------------------------------------------------------------------------ */
/* Grouped bar chart                                                         */
/* ------------------------------------------------------------------------ */

export function GroupedBarChart({
  data = [],
  series = [],
  height = 220,
  yLabel = '',
  valueFormatter = formatCompact,
}) {
  const [active, setActive] = useState(null);
  const width = 640;
  const pad = { top: 26, right: 8, bottom: 30, left: 46 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const max = useMemo(() => {
    let peak = 0;
    data.forEach((row) => {
      series.forEach((s) => {
        const v = Number(row[s.key]) || 0;
        if (v > peak) peak = v;
      });
    });
    return niceCeiling(peak);
  }, [data, series]);

  if (!data.length || !series.length) {
    return <p className="blank">No activity recorded for this period.</p>;
  }

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const slot = plotW / data.length;
  const groupW = Math.min(slot * 0.62, 46);
  const barW = Math.max(3, groupW / series.length - 2);

  const activeRow = active === null ? null : data[active];

  return (
    <div className="chart-frame">
      <svg
        className="chart"
        viewBox={`0 0 ${width} ${height}`}
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

        <line
          className="chart-axis-line"
          x1={pad.left}
          y1={pad.top + plotH}
          x2={width - pad.right}
          y2={pad.top + plotH}
        />

        {yLabel ? (
          <text className="chart-axis-title" x={pad.left} y={14}>
            {yLabel}
          </text>
        ) : null}

        {data.map((row, i) => {
          const slotX = pad.left + i * slot;
          const startX = slotX + (slot - groupW) / 2;
          const isActive = active === i;

          return (
            <g
              key={i}
              className={`chart-col${isActive ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <rect
                className="chart-band"
                x={slotX}
                y={pad.top}
                width={slot}
                height={plotH}
                rx="3"
              />

              {series.map((s, si) => {
                const value = Number(row[s.key]) || 0;
                const h = max === 0 ? 0 : (value / max) * plotH;
                // A non-zero value always keeps at least a 2px stub so an
                // occasional single incident is still visible next to a
                // column of hundreds of gate movements.
                const floor = value === 0 ? 0 : 2;
                const barH = Math.max(floor, h);
                return (
                  <rect
                    key={s.key}
                    className="chart-bar"
                    x={startX + si * (barW + 2)}
                    y={pad.top + plotH - barH}
                    width={barW}
                    height={barH}
                    fill={PALETTE[s.tone] || s.tone || PALETTE.signal}
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
                role="button"
                aria-label={`${row.fullLabel || row.label}: ${series
                  .map((s) => `${s.label} ${row[s.key]}`)
                  .join(', ')}`}
              />

              {row.label ? (
                <text className="chart-tick chart-tick-x" x={slotX + slot / 2} y={height - 10}>
                  {row.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      <div className="readout" aria-live="polite">
        {activeRow ? (
          <>
            <span className="readout-label">{activeRow.fullLabel || activeRow.label}</span>
            {series.map((s) => (
              <span className="readout-pair" key={s.key}>
                <span
                  className="legend-swatch"
                  style={{ backgroundColor: PALETTE[s.tone] || s.tone || PALETTE.signal }}
                />
                <span>{s.label}</span>
                <span className="readout-value">
                  {Number(activeRow[s.key] || 0).toLocaleString()}
                </span>
              </span>
            ))}
          </>
        ) : (
          <span className="faint">Point at a column to read its values.</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Trend line                                                                */
/* ------------------------------------------------------------------------ */

export function TrendChart({
  data = [],
  valueKey = 'value',
  height = 200,
  yLabel = '',
  label = 'Reports',
}) {
  const [active, setActive] = useState(null);
  const width = 640;
  const pad = { top: 26, right: 8, bottom: 28, left: 44 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const max = useMemo(() => {
    const peak = data.reduce((m, row) => Math.max(m, Number(row[valueKey]) || 0), 0);
    return niceCeiling(peak);
  }, [data, valueKey]);

  if (data.length < 2) return <p className="blank">Not enough history to draw a trend.</p>;

  const stepX = plotW / (data.length - 1);
  const points = data.map((row, i) => {
    const x = pad.left + i * stepX;
    const y = pad.top + plotH - ((Number(row[valueKey]) || 0) / max) * plotH;
    return [x, y];
  });

  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${pad.top + plotH} L${pad.left},${pad.top + plotH} Z`;
  const ticks = [0, 0.5, 1].map((t) => t * max);
  const activeRow = active === null ? null : data[active];

  return (
    <div className="chart-frame">
      <svg
        className="chart"
        viewBox={`0 0 ${width} ${height}`}
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

        <path className="spark-fill" d={area} />
        <path className="chart-line" d={line} stroke="var(--signal-text)" />

        {yLabel ? (
          <text className="chart-axis-title" x={pad.left} y={14}>
            {yLabel}
          </text>
        ) : null}

        {data.map((row, i) => {
          const [x, y] = points[i];
          return (
            <g key={i} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}>
              {active === i ? (
                <>
                  <line className="chart-grid-line" x1={x} y1={pad.top} x2={x} y2={pad.top + plotH} />
                  <circle className="chart-dot" cx={x} cy={y} r="3.5" fill="var(--signal-text)" />
                </>
              ) : null}
              <rect
                className="chart-hit"
                x={x - stepX / 2}
                y={pad.top}
                width={stepX}
                height={plotH}
                tabIndex={0}
                role="button"
                aria-label={`${row.fullLabel || row.label}: ${row[valueKey]}`}
              />
              {row.label ? (
                <text className="chart-tick chart-tick-x" x={x} y={height - 9}>
                  {row.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      <div className="readout" aria-live="polite">
        {activeRow ? (
          <>
            <span className="readout-label">{activeRow.fullLabel || activeRow.label}</span>
            <span className="readout-pair">
              <span>{label}</span>
              <span className="readout-value">{activeRow[valueKey]}</span>
            </span>
          </>
        ) : (
          <span className="faint">Point at the line to read a value.</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Legend                                                                    */
/* ------------------------------------------------------------------------ */

export function Legend({ series = [] }) {
  return (
    <div className="legend">
      {series.map((s) => (
        <span className="legend-item" key={s.key || s.label}>
          <span
            className="legend-swatch"
            style={{ backgroundColor: PALETTE[s.tone] || s.tone || PALETTE.signal }}
          />
          {s.label}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Sparkline                                                                 */
/* ------------------------------------------------------------------------ */

export function Sparkline({ values = [], height = 26 }) {
  if (values.length < 2) return null;

  const width = 120;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - 2 - ((v - min) / span) * (height - 4);
    return [x, y];
  });

  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      className="spark"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path className="spark-fill" d={area} />
      <path className="spark-line" d={line} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* Proportion bar - parts of a whole                                         */
/* ------------------------------------------------------------------------ */

export function ProportionBar({ parts = [], total }) {
  const sum = total || parts.reduce((acc, p) => acc + (Number(p.value) || 0), 0) || 1;

  return (
    <div>
      <div className="proportion" role="img" aria-label={parts.map((p) => `${p.label}: ${p.value}`).join('; ')}>
        {parts.map((p) => (
          <div
            key={p.label}
            className="proportion-part"
            style={{
              width: `${((Number(p.value) || 0) / sum) * 100}%`,
              backgroundColor: PALETTE[p.tone] || p.tone || PALETTE.signal,
            }}
          />
        ))}
      </div>

      <div className="proportion-key">
        {parts.map((p) => {
          const pct = ((Number(p.value) || 0) / sum) * 100;
          return (
            <div className="proportion-row" key={p.label}>
              <span
                className="legend-swatch"
                style={{ backgroundColor: PALETTE[p.tone] || p.tone || PALETTE.signal }}
              />
              <span className="proportion-name">{p.label}</span>
              <span className="proportion-count">{Number(p.value).toLocaleString()}</span>
              <span className="proportion-pct">{pct.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Ranked bars                                                               */
/* ------------------------------------------------------------------------ */

export function RankedBars({ items = [], valueFormatter = (v) => Number(v).toLocaleString() }) {
  const max = Math.max(...items.map((i) => Number(i.value) || 0), 1);

  return (
    <div className="rank">
      {items.map((item) => (
        <div className="rank-row" key={item.label}>
          <div className="rank-fill" style={{ width: `${((Number(item.value) || 0) / max) * 100}%` }} />
          <span className="rank-name">{item.label}</span>
          <span className="rank-value">{valueFormatter(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default GroupedBarChart;
