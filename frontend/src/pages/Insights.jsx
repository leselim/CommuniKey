import React, { useMemo, useState } from 'react';
import {
  GroupedBarChart,
  Legend,
  ProportionBar,
  RankedBars,
  TrendChart,
} from '../components/Chart';
import useCollection from '../hooks/useCollection';
import { community, gateHistory, incidentHistory } from '../services/demoData';
import {
  RANGES,
  closureByType,
  countBy,
  gateSeries,
  gateTotals,
  hourlyShape,
  humanHours,
  rangeDays,
  reportSeries,
  summarise,
  withinRange,
} from '../utils/analytics';

/*
 * Estate reporting.
 *
 * Nothing on this page is a fixed figure. Every total, rate and series is
 * derived from the incident and gate records by the aggregation layer in
 * utils/analytics.js, so changing the underlying data changes the page.
 */

const REPORT_SERIES = [
  { key: 'resolved', label: 'Closed', tone: 'signal' },
  { key: 'outstanding', label: 'Still open', tone: 'caution' },
];

const GATE_SERIES = [
  { key: 'residents', label: 'Residents', tone: 'signal' },
  { key: 'visitors', label: 'Visitors', tone: 'caution' },
  { key: 'deliveries', label: 'Deliveries', tone: 'neutral' },
];

function Insights() {
  const { items } = useCollection('/incidents', incidentHistory);
  const [range, setRange] = useState('30d');
  const days = rangeDays(range);

  const stats = useMemo(() => summarise(items, days), [items, days]);
  const series = useMemo(() => reportSeries(items, days), [items, days]);
  const byType = useMemo(() => countBy(withinRange(items, days), 'incident_type'), [items, days]);
  const byPlace = useMemo(() => countBy(withinRange(items, days), 'location', 6), [items, days]);
  const closure = useMemo(() => closureByType(items, days), [items, days]);
  const hourly = useMemo(() => hourlyShape(items, days), [items, days]);
  const gate = useMemo(() => gateSeries(gateHistory, days), [days]);
  const gateSum = useMemo(() => gateTotals(gateHistory, days), [days]);

  const outcomes = [
    { label: 'Closed', value: stats.resolved, tone: 'signal' },
    { label: 'Under review', value: stats.review, tone: 'caution' },
    { label: 'Still open', value: stats.open, tone: 'neutral' },
  ];

  const busiestHour = hourly.reduce(
    (best, row) => (row.value > best.value ? row : best),
    { value: -1, fullLabel: '' }
  );

  return (
    <div className="stack">
      <header className="masthead">
        <div>
          <p className="eyebrow">{community.community_name}</p>
          <h1>Reporting</h1>
          <p className="masthead-meta">
            What residents reported, how quickly it was closed, and what moved through the gate.
          </p>
        </div>

        <div className="filter" role="group" aria-label="Reporting period">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              className="filter-item"
              aria-pressed={range === r.key}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      <div className="metric-strip">
        <div className="metric">
          <span className="metric-label">Reports received</span>
          <span className="metric-row">
            <span className="metric-value">{stats.total}</span>
            {stats.reportedChange !== 0 ? (
              <span className={`metric-delta ${stats.reportedChange > 0 ? 'down' : 'up'}`}>
                {stats.reportedChange > 0 ? '+' : ''}
                {stats.reportedChange}%
              </span>
            ) : null}
          </span>
          <span className="metric-note">Against the previous {days} days</span>
        </div>

        <div className="metric">
          <span className="metric-label">Closed</span>
          <span className="metric-row">
            <span className="metric-value">{stats.resolutionRate}</span>
            <span className="metric-unit">%</span>
          </span>
          <span className="metric-note">
            {stats.resolved} of {stats.total} reports
          </span>
        </div>

        <div className="metric">
          <span className="metric-label">Typical time to close</span>
          <span className="metric-row">
            <span className="metric-value">
              {stats.medianHoursToClose === null ? '0' : Math.round(stats.medianHoursToClose)}
            </span>
            <span className="metric-unit">hours</span>
          </span>
          <span className="metric-note">Median, not average</span>
        </div>

        <div className="metric">
          <span className="metric-label">Gate movements</span>
          <span className="metric-row">
            <span className="metric-value">{gateSum.total.toLocaleString()}</span>
          </span>
          <span className="metric-note">{gateSum.dailyAverage} on an average day</span>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Reports over time</h2>
            <p className="panel-sub">
              {days > 31 ? 'Grouped by week' : 'Grouped by day'}, split by whether the report is closed
            </p>
          </div>
          <Legend series={REPORT_SERIES} />
        </div>
        <GroupedBarChart data={series} series={REPORT_SERIES} height={250} yLabel="Reports" />
      </section>

      <div className="grid-2">
        <section className="section">
          <div className="section-head">
            <h2>What gets reported</h2>
          </div>
          <RankedBars items={byType} />
        </section>

        <section className="section">
          <div className="section-head">
            <h2>Where it happens</h2>
          </div>
          <RankedBars items={byPlace} />
        </section>
      </div>

      <div className="grid-2">
        <section className="section">
          <div className="section-head">
            <h2>Outcomes</h2>
            <span className="mono">{stats.total} reports</span>
          </div>
          <ProportionBar parts={outcomes} />
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2>How long each type takes</h2>
              <p className="panel-sub">Median hours from report to close</p>
            </div>
          </div>
          {closure.length === 0 ? (
            <p className="blank">Nothing has been closed in this period yet.</p>
          ) : (
            <RankedBars items={closure} valueFormatter={(v) => humanHours(v)} />
          )}
        </section>
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>When reports come in</h2>
            <p className="panel-sub">
              {busiestHour.value > 0
                ? `Busiest around ${busiestHour.fullLabel}`
                : 'By hour of the day'}
            </p>
          </div>
        </div>
        <TrendChart data={hourly} valueKey="value" height={190} label="Reports" yLabel="Reports" />
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Gate movements</h2>
            <p className="panel-sub">Everyone who passed the boom, by category</p>
          </div>
          <Legend series={GATE_SERIES} />
        </div>
        <GroupedBarChart data={gate} series={GATE_SERIES} height={240} yLabel="Movements" />
      </section>
    </div>
  );
}

export default Insights;
