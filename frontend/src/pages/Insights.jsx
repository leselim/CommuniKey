import React, { useMemo, useState } from 'react';
import { Gauge, GroupedBarChart, RankedBars, TrendChart } from '../components/Chart';
import { Card, Delta, SectionBar, Select } from '../components/ui';
import useCollection from '../hooks/useCollection';
import { gateHistory, incidentHistory } from '../services/demoData';
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
 * derived from the incident and gate records by utils/analytics.js, so
 * changing the underlying data changes the page.
 */

const REPORT_SERIES = [
  { key: 'resolved', label: 'Closed', tone: 'ink' },
  { key: 'outstanding', label: 'Still open', tone: 'brand' },
];

const GATE_SERIES = [
  { key: 'residents', label: 'Residents', tone: 'ink' },
  { key: 'visitors', label: 'Visitors', tone: 'brand' },
  { key: 'deliveries', label: 'Deliveries', tone: 'grey' },
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
    { label: 'Complete', value: stats.resolved, tone: 'ink' },
    { label: 'Waiting', value: stats.review, tone: 'grey' },
    { label: 'Still open', value: stats.open, tone: 'brand' },
  ];

  const busiestHour = hourly.reduce((best, row) => (row.value > best.value ? row : best), { value: -1, fullLabel: '' });

  return (
    <div className="page">
      <SectionBar
        icon="alert"
        title="Incidents"
        stats={[
          { label: 'Reports received:', value: stats.total, after: <Delta change={stats.reportedChange} /> },
          { label: 'Closed:', value: stats.resolutionRate, unit: '%' },
          {
            label: 'Typical time to close:',
            value: stats.medianHoursToClose === null ? '0' : Math.round(stats.medianHoursToClose),
            unit: 'hours',
          },
        ]}
      >
        <Select
          label="Reporting period"
          value={range}
          onChange={setRange}
          options={RANGES.map((r) => ({ value: r.key, label: `Last ${r.label}` }))}
        />
      </SectionBar>

      <div className="grid grid-4">
        <Card
          className="span-3"
          title="Reports over time"
          sub={`${days > 31 ? 'Grouped by week' : 'Grouped by day'}, split by whether the report is closed. Change is against the previous ${days} days.`}
        >
          <GroupedBarChart data={series} series={REPORT_SERIES} height={250} yLabel="Reports" />
        </Card>
        <Card title="Outcomes" sub={`${stats.total} reports`}>
          <Gauge parts={outcomes} label="closed" />
        </Card>
      </div>

      <div className="grid grid-3">
        <Card title="What gets reported" sub="Reports by type">
          <RankedBars items={byType} />
        </Card>
        <Card title="Where it happens" sub="Reports by location">
          <RankedBars items={byPlace} />
        </Card>
        <Card title="How long each type takes" sub="Median time from report to close">
          <RankedBars items={closure} tone="ink" valueFormatter={(v) => humanHours(v)} />
        </Card>
      </div>

      <Card
        title="When reports come in"
        sub={busiestHour.value > 0 ? `By hour of the day. Busiest from ${busiestHour.fullLabel}.` : 'By hour of the day'}
      >
        <TrendChart data={hourly} valueKey="value" height={190} label="Reports" yLabel="Reports" />
      </Card>

      <SectionBar
        icon="gate"
        title="Gate movements"
        stats={[
          { label: 'Residents:', value: gateSum.residents.toLocaleString() },
          { label: 'Visitors:', value: gateSum.visitors.toLocaleString() },
          { label: 'Deliveries:', value: gateSum.deliveries.toLocaleString() },
          { label: 'Daily average:', value: gateSum.dailyAverage },
        ]}
      />

      <Card title="Everyone who passed the boom" sub={`${gateSum.total.toLocaleString()} movements, by category`}>
        <GroupedBarChart data={gate} series={GATE_SERIES} height={250} yLabel="Movements" />
      </Card>
    </div>
  );
}

export default Insights;
