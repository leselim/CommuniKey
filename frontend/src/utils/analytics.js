/**
 * Aggregation layer.
 *
 * Every number shown on a dashboard is computed here from the incident and
 * gate records themselves. Nothing is hardcoded: change the underlying data
 * and the charts, the totals and the resolution rate all move with it.
 *
 * The same grouping the API performs server side (see the analytics app) is
 * mirrored here so the interface behaves identically when the backend is not
 * reachable.
 */

const DAY = 24 * 60 * 60 * 1000;

export const RANGES = [
  { key: '7d', label: '7 days', days: 7 },
  { key: '30d', label: '30 days', days: 30 },
  { key: '90d', label: '12 weeks', days: 84 },
];

export function rangeDays(key) {
  const found = RANGES.find((r) => r.key === key);
  return found ? found.days : 30;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoDay(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

/** Records falling inside the trailing window. */
export function withinRange(rows, days, field = 'date_reported') {
  const cutoff = Date.now() - days * DAY;
  return rows.filter((row) => new Date(row[field]).getTime() >= cutoff);
}

/* -------------------------------------------------------------- Totals -- */

export function summarise(incidents, days) {
  const current = withinRange(incidents, days);

  // The equivalent window immediately before, for a like-for-like comparison.
  const previousStart = Date.now() - days * 2 * DAY;
  const previousEnd = Date.now() - days * DAY;
  const previous = incidents.filter((row) => {
    const t = new Date(row.date_reported).getTime();
    return t >= previousStart && t < previousEnd;
  });

  const resolved = current.filter((r) => r.status === 'Resolved');
  const review = current.filter((r) => r.status === 'Under review');
  const open = current.filter((r) => r.status === 'Reported');

  const closureTimes = resolved
    .map((r) => r.resolution_hours)
    .filter((h) => typeof h === 'number' && h >= 0)
    .sort((a, b) => a - b);

  // Median, not mean: one incident left open over a long weekend would
  // otherwise drag the average somewhere unrepresentative.
  const median = closureTimes.length
    ? closureTimes[Math.floor(closureTimes.length / 2)]
    : null;

  const rate = current.length ? (resolved.length / current.length) * 100 : 0;
  const previousRate = previous.length
    ? (previous.filter((r) => r.status === 'Resolved').length / previous.length) * 100
    : 0;

  return {
    total: current.length,
    resolved: resolved.length,
    review: review.length,
    open: open.length,
    resolutionRate: Number(rate.toFixed(1)),
    resolutionRateChange: Number((rate - previousRate).toFixed(1)),
    medianHoursToClose: median,
    reportedChange: previous.length
      ? Number((((current.length - previous.length) / previous.length) * 100).toFixed(0))
      : 0,
  };
}

/* --------------------------------------------------------------- Series -- */

/** Reports per day, split into resolved and still open. */
export function dailySeries(incidents, days) {
  const buckets = new Map();
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = startOfDay(new Date(Date.now() - i * DAY));
    buckets.set(isoDay(day), { day, resolved: 0, outstanding: 0 });
  }

  withinRange(incidents, days).forEach((row) => {
    const key = isoDay(row.date_reported);
    const bucket = buckets.get(key);
    if (!bucket) return;
    if (row.status === 'Resolved') bucket.resolved += 1;
    else bucket.outstanding += 1;
  });

  return [...buckets.values()];
}

/** Collapses daily buckets into weeks when a range is too long to read daily. */
export function weeklySeries(incidents, days) {
  const daily = dailySeries(incidents, days);
  const weeks = [];

  for (let i = 0; i < daily.length; i += 7) {
    const chunk = daily.slice(i, i + 7);
    if (!chunk.length) continue;
    const start = chunk[0].day;
    weeks.push({
      day: start,
      resolved: chunk.reduce((sum, d) => sum + d.resolved, 0),
      outstanding: chunk.reduce((sum, d) => sum + d.outstanding, 0),
    });
  }
  return weeks;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Chart-ready rows, grouped at whichever resolution suits the range. */
export function reportSeries(incidents, days) {
  const useWeeks = days > 31;
  const rows = useWeeks ? weeklySeries(incidents, days) : dailySeries(incidents, days);
  const stride = Math.ceil(rows.length / 12);

  return rows.map((row, i) => {
    const d = row.day;
    const short = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
    return {
      label: i % stride === 0 ? (useWeeks ? short : String(d.getDate())) : '',
      fullLabel: useWeeks ? `Week of ${short}` : `${short}`,
      resolved: row.resolved,
      outstanding: row.outstanding,
    };
  });
}

/* ------------------------------------------------------------ Breakdown -- */

/** Counts by a field, largest first. */
export function countBy(rows, field, limit = 8) {
  const tally = new Map();
  rows.forEach((row) => {
    const key = row[field] || 'Unspecified';
    tally.set(key, (tally.get(key) || 0) + 1);
  });
  return [...tally.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

/** Median time to close, per incident type. Shows what actually drags. */
export function closureByType(incidents, days) {
  const rows = withinRange(incidents, days).filter(
    (r) => r.status === 'Resolved' && typeof r.resolution_hours === 'number'
  );

  const grouped = new Map();
  rows.forEach((row) => {
    if (!grouped.has(row.incident_type)) grouped.set(row.incident_type, []);
    grouped.get(row.incident_type).push(row.resolution_hours);
  });

  return [...grouped.entries()]
    .map(([label, hours]) => {
      const sorted = hours.sort((a, b) => a - b);
      return { label, value: sorted[Math.floor(sorted.length / 2)], count: hours.length };
    })
    .sort((a, b) => b.value - a.value);
}

/** Reports by hour of day, for the twenty-four hour shape. */
export function hourlyShape(incidents, days) {
  const hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, value: 0 }));
  withinRange(incidents, days).forEach((row) => {
    const h = new Date(row.date_reported).getHours();
    hours[h].value += 1;
  });

  return hours.map((row) => ({
    label: row.hour % 4 === 0 ? String(row.hour).padStart(2, '0') : '',
    fullLabel: `${String(row.hour).padStart(2, '0')}:00 to ${String((row.hour + 1) % 24).padStart(2, '0')}:00`,
    value: row.value,
  }));
}

/* ----------------------------------------------------------------- Gate -- */

export function gateSeries(gateRows, days) {
  const recent = gateRows.slice(-days);
  const stride = Math.ceil(recent.length / 12);

  return recent.map((row, i) => {
    const d = new Date(row.date);
    return {
      label: i % stride === 0 ? String(d.getDate()) : '',
      fullLabel: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
      residents: row.residents,
      visitors: row.visitors,
      deliveries: row.deliveries,
    };
  });
}

export function gateTotals(gateRows, days) {
  const recent = gateRows.slice(-days);
  const sum = (field) => recent.reduce((acc, r) => acc + r[field], 0);
  return {
    residents: sum('residents'),
    visitors: sum('visitors'),
    deliveries: sum('deliveries'),
    total: sum('residents') + sum('visitors') + sum('deliveries'),
    dailyAverage: recent.length
      ? Math.round((sum('residents') + sum('visitors') + sum('deliveries')) / recent.length)
      : 0,
  };
}

/** Formats an hour count the way a person would say it. */
export function humanHours(hours) {
  if (hours === null || hours === undefined) return 'no data';
  if (hours < 1) return 'under an hour';
  if (hours < 48) return `${Math.round(hours)} hours`;
  return `${(hours / 24).toFixed(1)} days`;
}
